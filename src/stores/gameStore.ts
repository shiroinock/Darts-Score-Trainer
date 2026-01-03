/**
 * Darts Score Trainer - ゲームストア（Zustand）
 *
 * アプリケーション全体のゲーム状態を管理するZustandストアです。
 * 練習設定、セッション状態、問題生成、統計情報などを一元管理します。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  BustInfo,
  BustQuestionAnswer,
  ExpandedTarget,
  GameState,
  PracticeConfig,
  Question,
  QuestionType,
  SessionConfig,
  Stats,
  Target,
  ThrowResult,
} from '../types';
import { DEFAULT_TARGET, MIN_SCORE, STORAGE_KEY } from '../utils/constants/index.js';
import { getOptimalTarget } from '../utils/dartStrategy/getOptimalTarget.js';
import { checkBust, isDoubleRing, isGameFinished } from '../utils/gameLogic/index.js';
import {
  getAllTargetsExpanded,
  getBasicPracticeTargets,
} from '../utils/targetCoordinates/index.js';
import { executeThrow } from '../utils/throwSimulator/index.js';
import { getDefaultConfig, PRESETS } from './config/presets.js';
import { initialSessionConfig, initialStats } from './session/initialState.js';
import { isPersistFormat, isPracticeConfigFormat, PERSIST_VERSION } from './utils/typeGuards.js';

/**
 * 問題モード決定の結果
 */
interface QuestionModeResult {
  mode: QuestionType;
  correctAnswer: number;
  questionText: string;
}

/**
 * 問題モードを決定する
 */
function determineQuestionMode(
  questionType: PracticeConfig['questionType'],
  throwUnit: number,
  totalScore: number,
  remainingScore: number,
  roundStartScore: number,
  bustInfo?: BustInfo
): QuestionModeResult {
  // スコアモード
  if (questionType === 'score') {
    return {
      mode: 'score',
      correctAnswer: totalScore,
      questionText: throwUnit === 1 ? 'この投擲の得点は？' : '3投の合計得点は？',
    };
  }

  // 残り点数モード
  if (questionType === 'remaining') {
    // バスト発生時は正解をroundStartScoreにする
    const correctAnswer = bustInfo?.isBust ? roundStartScore : remainingScore - totalScore;
    return {
      mode: 'remaining',
      correctAnswer,
      questionText: '残り点数は？',
    };
  }

  // 両方モード: ランダムに選択（残り点数が0以下の場合はスコアモード）
  const mode: QuestionType =
    remainingScore <= 0 ? 'score' : Math.random() < 0.5 ? 'score' : 'remaining';

  if (mode === 'score') {
    return {
      mode: 'score',
      correctAnswer: totalScore,
      questionText: throwUnit === 1 ? 'この投擲の得点は？' : '3投の合計得点は？',
    };
  }

  // バスト発生時は正解をroundStartScoreにする
  const correctAnswer = bustInfo?.isBust ? roundStartScore : remainingScore - totalScore;
  return {
    mode: 'remaining',
    correctAnswer,
    questionText: '残り点数は？',
  };
}

/**
 * バスト判定と残り点数更新の結果
 */
interface BustCheckResult {
  isBust: boolean;
  newRemainingScore: number;
}

/**
 * バスト判定を行い、残り点数を更新する
 */
function checkAndUpdateBust(
  currentQuestion: Question | null,
  remainingScore: number,
  roundStartScore: number
): BustCheckResult {
  if (!currentQuestion) {
    return { isBust: false, newRemainingScore: remainingScore };
  }

  const totalScore = currentQuestion.throws.reduce((sum, t) => sum + t.score, 0);

  // バスト判定を行う
  // bustInfoがある場合はそれを使用、ない場合は残り点数からバスト判定
  let isBust = currentQuestion.bustInfo?.isBust ?? false;

  // bustInfoがない場合、残り点数からバスト判定を行う
  // scoreモードでも残り点数管理のためにバスト判定を実施
  if (!currentQuestion.bustInfo) {
    // オーバー判定
    if (totalScore > remainingScore) {
      isBust = true;
    }
    // 1点残し判定
    else if (remainingScore - totalScore === 1) {
      isBust = true;
    }
    // ダブルアウト判定（最後の投擲がダブルでない場合）
    else if (remainingScore - totalScore === 0) {
      const lastThrow = currentQuestion.throws[currentQuestion.throws.length - 1];
      const isDouble = lastThrow?.ring === 'DOUBLE' || lastThrow?.ring === 'OUTER_BULL';
      if (!isDouble) {
        isBust = true;
      }
    }
  }

  if (isBust) {
    // バスト: 残り点数をラウンド開始時に戻す
    return { isBust: true, newRemainingScore: roundStartScore };
  }

  // バストでない: 残り点数を更新
  return { isBust: false, newRemainingScore: remainingScore - totalScore };
}

/**
 * 統計情報を更新する
 *
 * @param stats - 統計情報
 * @param isCorrect - 正解かどうか
 * @param isBust - バストかどうか
 *
 * @remarks
 * - 正解の場合は correct++ とストリーク更新
 * - 不正解の場合はストリークリセット
 * - バスト発生時は正解でもストリークリセット（バスト自体がペナルティ）
 */
function updateStats(stats: Stats, isCorrect: boolean, isBust: boolean): void {
  stats.total++;

  if (isCorrect) {
    // 正解の場合は correct++ （バストで0点と答えた場合も含む）
    stats.correct++;

    if (isBust) {
      // バスト時は正解でもストリークをリセット（バスト自体がペナルティ）
      stats.currentStreak = 0;
    } else {
      // バストでない正解のみストリークを継続
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    }
  } else {
    // 不正解の場合はストリークをリセット
    stats.currentStreak = 0;
  }
}

/**
 * 投擲シミュレーション結果
 */
interface SimulationResult {
  throws: ThrowResult[];
  bustInfo: BustInfo | undefined;
}

/**
 * 指定された投擲数分のシミュレーションを実行し、バスト判定も行う
 */
function simulateThrows(
  config: PracticeConfig,
  remainingScore: number,
  shouldCheckBust: boolean
): SimulationResult {
  const throws: ThrowResult[] = [];
  let bustInfo: BustInfo | undefined;
  let currentRemaining = remainingScore;

  for (let i = 0; i < config.throwUnit; i++) {
    const throwsRemaining = config.throwUnit - i;
    const target =
      config.target ?? getOptimalTarget(currentRemaining, throwsRemaining) ?? DEFAULT_TARGET;
    const throwResult = executeThrow(target, config.stdDevMM);
    throws.push(throwResult);

    // バスト判定（remainingモードのみ、最初のバストのみ記録）
    if (shouldCheckBust && !bustInfo) {
      // 残り点数が0以下の場合は前の投擲でバスト済み
      if (currentRemaining <= 0) {
        bustInfo = { isBust: true, reason: 'over' };
      } else {
        const isDouble = isDoubleRing(throwResult.ring);
        const checkResult = checkBust(currentRemaining, throwResult.score, isDouble);
        if (checkResult.isBust) {
          bustInfo = checkResult;
        }
      }
    }

    // 残り点数を更新（次の投擲のターゲット決定用）
    currentRemaining = Math.max(MIN_SCORE, currentRemaining - throwResult.score);
  }

  return { throws, bustInfo };
}

/**
 * 3投モードの表示中ダーツ数を表す型
 *
 * 3投モードでは、各ダーツを順次表示し、1〜3の値を取る。
 */
type DisplayedThrowCount = 1 | 2 | 3;

/**
 * 数値がDisplayedThrowCountかどうかを判定する型ガード
 */
function isDisplayedThrowCount(value: number): value is DisplayedThrowCount {
  return value === 1 || value === 2 || value === 3;
}

/**
 * 3投モードのquestionPhaseを計算する
 *
 * 3投モードでは、1本目・2本目の後にバスト判定を問い、
 * 3本目の後に合計得点を問う。これはscoreモード・remainingモード両方に適用される。
 *
 * @param throwIndex - 現在表示されている投擲数（1, 2, 3）
 * @returns 設定すべきquestionPhase
 */
function calculateQuestionPhase(throwIndex: DisplayedThrowCount): Question['questionPhase'] {
  if (throwIndex === 1) {
    // 1本目表示時: bustフェーズ
    return { type: 'bust', throwIndex: 1 };
  }
  if (throwIndex === 2) {
    // 2本目表示時: bustフェーズ
    return { type: 'bust', throwIndex: 2 };
  }
  // throwIndex === 3
  // 3本目表示時: scoreフェーズ
  return { type: 'score', throwIndex: 3 };
}

/**
 * 問題に含めるべきバスト情報を決定する
 *
 * - 3投モード: 常にバスト判定を問うため、バスト情報を保持
 * - scoreモード: バスト判定を問わないため、undefined
 * - その他: バスト情報を保持（remainingモード等）
 *
 * @param throwUnit - 投擲単位（1または3）
 * @param mode - 問題モード（score, remaining, both）
 * @param simulatedBustInfo - シミュレーション中に判定されたバスト情報
 * @returns 問題に含めるバスト情報
 */
function determineBustInfo(
  throwUnit: number,
  mode: QuestionType,
  simulatedBustInfo: BustInfo | undefined
): BustInfo | undefined {
  if (throwUnit === 3) {
    return simulatedBustInfo;
  }
  if (mode === 'score') {
    return undefined;
  }
  return simulatedBustInfo;
}

/**
 * RingTypeをTargetTypeに変換
 */
function ringTypeToTargetType(ringType: ExpandedTarget['ringType']): Target['type'] {
  if (ringType === 'INNER_SINGLE' || ringType === 'OUTER_SINGLE') return 'SINGLE';
  if (ringType === 'DOUBLE') return 'DOUBLE';
  if (ringType === 'TRIPLE') return 'TRIPLE';
  if (ringType === 'INNER_BULL' || ringType === 'OUTER_BULL') return 'BULL';
  return 'SINGLE'; // fallback
}

/**
 * Fisher-Yatesシャッフル（配列をランダムにシャッフル）
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * バッグを初期化してシャッフル
 * @param config - 練習設定。useBasicTargets=trueの場合は62ターゲット、それ以外は82ターゲット
 */
function initializeBag(config: PracticeConfig): ExpandedTarget[] {
  const allTargets = config.useBasicTargets ? getBasicPracticeTargets() : getAllTargetsExpanded();
  return shuffleArray(allTargets);
}

/**
 * バッグをリシャッフル（前回の最後と今回の最初が同じにならないよう調整）
 * @param lastTarget - 前回のバッグの最後のターゲット
 * @param config - 練習設定
 */
function reshuffleBag(lastTarget: ExpandedTarget, config: PracticeConfig): ExpandedTarget[] {
  const newBag = initializeBag(config);

  // 新しいバッグの最初が前回の最後と同じ場合は、異なる要素と交換
  if (newBag[0].label === lastTarget.label && newBag.length > 1) {
    // 最初と異なる最初の要素を見つけて交換（無限ループリスク回避）
    const swapIndex = newBag.findIndex((t, i) => i > 0 && t.label !== lastTarget.label);
    if (swapIndex !== -1) {
      [newBag[0], newBag[swapIndex]] = [newBag[swapIndex], newBag[0]];
    }
  }

  return newBag;
}

/**
 * シャッフルバッグモード用の投擲結果を生成
 */
interface ShuffleBagState {
  targetBag: ExpandedTarget[];
  targetBagIndex: number;
}

/**
 * シャッフルバッグから投擲結果を生成
 * @param bagState - バッグの状態
 * @param throwUnit - 投擲単位（1 or 3）
 * @param config - 練習設定
 */
function generateThrowsFromBag(
  bagState: ShuffleBagState,
  throwUnit: 1 | 3,
  config: PracticeConfig
): { throws: ThrowResult[]; newBagState: ShuffleBagState } {
  let { targetBag, targetBagIndex } = bagState;

  // インデックスが範囲外の場合、リシャッフル
  if (targetBagIndex >= targetBag.length) {
    const lastTarget = targetBag[targetBag.length - 1];
    targetBag = reshuffleBag(lastTarget, config);
    targetBagIndex = 0;
  }

  // 現在のターゲットを取得
  const currentTarget = targetBag[targetBagIndex];

  // 投擲結果を生成（ターゲットの中心座標を使用、シミュレーションなし）
  const throws: ThrowResult[] = [];
  for (let i = 0; i < throwUnit; i++) {
    const throwResult: ThrowResult = {
      target: {
        type: ringTypeToTargetType(currentTarget.ringType),
        number: currentTarget.number === 0 ? null : currentTarget.number,
        label: currentTarget.label,
      },
      landingPoint: { x: currentTarget.x, y: currentTarget.y },
      score: currentTarget.score,
      ring: currentTarget.ringType,
      segmentNumber: currentTarget.number,
    };
    throws.push(throwResult);
  }

  return {
    throws,
    newBagState: { targetBag, targetBagIndex },
  };
}

/**
 * 問題オブジェクトを構築する
 */
function buildQuestion(
  throws: ThrowResult[],
  config: PracticeConfig,
  remainingScore: number,
  roundStartScore: number,
  simulatedBustInfo: BustInfo | undefined
): Question {
  const totalScore = throws.reduce((sum, t) => sum + t.score, 0);
  const { mode, correctAnswer, questionText } = determineQuestionMode(
    config.questionType,
    config.throwUnit,
    totalScore,
    remainingScore,
    roundStartScore,
    simulatedBustInfo
  );
  const bustInfo = determineBustInfo(config.throwUnit, mode, simulatedBustInfo);
  const questionPhase = config.throwUnit === 3 ? calculateQuestionPhase(1) : undefined;

  return {
    mode,
    throws,
    correctAnswer,
    questionText,
    startingScore: mode === 'remaining' ? remainingScore : undefined,
    bustInfo,
    questionPhase,
  };
}

/**
 * シャッフルバッグモード用の状態検証
 */
function validateShuffleBagState(
  targetBag: ExpandedTarget[] | undefined,
  targetBagIndex: number | undefined
): asserts targetBag is ExpandedTarget[] {
  if (!targetBag || targetBagIndex === undefined) {
    throw new Error('targetBag または targetBagIndex が未初期化です');
  }
  if (targetBag.length === 0) {
    throw new Error('targetBag が空です');
  }
}

/**
 * ゲームストアの状態インターフェース
 */
interface GameStore {
  // ============================================================
  // 基本状態（14個）
  // ============================================================
  gameState: GameState;
  config: PracticeConfig;
  sessionConfig: SessionConfig;
  currentQuestion: Question | null;
  currentThrowIndex: number;
  displayedDarts: ThrowResult[];
  visibleDarts: boolean[]; // ダーツマーカーの表示/非表示状態（凡例クリックで制御）
  remainingScore: number;
  roundStartScore: number;
  stats: Stats;
  elapsedTime: number;
  isTimerRunning: boolean;
  practiceStartTime?: number;
  targetBag?: ExpandedTarget[];
  targetBagIndex?: number;

  // ============================================================
  // 設定アクション（5個）
  // ============================================================
  setConfig: (config: Partial<PracticeConfig>) => void;
  setSessionConfig: (config: SessionConfig) => void;
  selectPreset: (presetId: string) => void;
  setTarget: (target: Target) => void;
  setStdDev: (stdDevMM: number) => void;

  // ============================================================
  // ゲームアクション（10個）
  // ============================================================
  startPractice: () => void;
  generateQuestion: () => void;
  simulateNextThrow: () => void;
  submitAnswer: (answer: number) => void;
  nextQuestion: () => void;
  endSession: (reason?: string) => void;
  resetToSetup: () => void;
  goToDebugScreen: () => void;
  exitDebugScreen: () => void;
  handleBust: () => void;
  tick: () => void;
  toggleDartVisibility: (index: number) => void; // ダーツマーカーの表示/非表示をトグル

  // ============================================================
  // 計算プロパティ（3個）
  // ============================================================
  getCurrentCorrectAnswer: () => number;
  getBustCorrectAnswer: () => BustQuestionAnswer;
  getAccuracy: () => number;
}

/**
 * ゲームストアの実装
 */

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      // ============================================================
      // 初期状態
      // ============================================================
      gameState: 'setup',
      config: getDefaultConfig(),
      sessionConfig: { ...initialSessionConfig },
      currentQuestion: null,
      currentThrowIndex: 0,
      displayedDarts: [],
      visibleDarts: [true, true, true], // 全てのダーツを表示（デフォルト）
      remainingScore: 0,
      roundStartScore: 0,
      stats: { ...initialStats },
      elapsedTime: 0,
      isTimerRunning: false,
      practiceStartTime: undefined,
      targetBag: undefined,
      targetBagIndex: undefined,

      // ============================================================
      // 設定アクション
      // ============================================================

      /**
       * 設定を部分更新する
       */
      setConfig: (partialConfig) =>
        set((state) => {
          state.config = { ...state.config, ...partialConfig };
        }),

      /**
       * セッション設定を更新する
       */
      setSessionConfig: (config) =>
        set((state) => {
          state.sessionConfig = config;
        }),

      /**
       * プリセットを選択する
       * @throws {Error} 存在しないプリセットIDの場合
       */
      selectPreset: (presetId) => {
        const preset = PRESETS[presetId];
        if (!preset) {
          throw new Error(`プリセット「${presetId}」が見つかりません`);
        }
        set((state) => {
          state.config = { ...preset };
        });
      },

      /**
       * ターゲットを設定する
       */
      setTarget: (target) =>
        set((state) => {
          state.config.target = target;
        }),

      /**
       * 標準偏差を設定する
       *
       * 注: UIのスライダー範囲（5-100mm）とは独立したバリデーションです。
       * プログラム的に設定する場合の柔軟性を確保するため、任意の正の有限数を許容します。
       *
       * @throws {Error} 不正な値の場合
       */
      setStdDev: (stdDevMM) => {
        // バリデーション
        if (!Number.isFinite(stdDevMM)) {
          throw new Error('標準偏差は有限の数である必要があります');
        }
        if (stdDevMM <= 0) {
          throw new Error('標準偏差は正の数である必要があります');
        }

        set((state) => {
          state.config.stdDevMM = stdDevMM;
        });
      },

      // ============================================================
      // ゲームアクション
      // ============================================================

      /**
       * 練習を開始する
       */
      startPractice: () => {
        set((state) => {
          const previousBestStreak = state.stats.bestStreak; // 既存のbestStreakを保持

          state.gameState = 'practicing';
          state.isTimerRunning = true;
          state.stats = { ...initialStats, bestStreak: previousBestStreak };
          state.elapsedTime = 0;
          state.practiceStartTime = Date.now();
          state.displayedDarts = [];
          state.currentThrowIndex = 0;

          // startingScoreは必須なので、全モードで設定
          state.remainingScore = state.config.startingScore;
          state.roundStartScore = state.remainingScore;

          // シャッフルバッグの初期化
          if (state.config.randomizeTarget === true) {
            state.targetBag = initializeBag(state.config);
            state.targetBagIndex = 0;
          } else {
            // randomizeTargetがfalse/undefinedの場合はクリア
            state.targetBag = undefined;
            state.targetBagIndex = undefined;
          }
        });

        // 最初の問題を生成（set完了後に実行）
        get().generateQuestion();
      },

      /**
       * 新しい問題を生成する
       */
      generateQuestion: () =>
        set((state) => {
          const { config } = state;
          let throws: ThrowResult[];
          let simulatedBustInfo: BustInfo | undefined;

          // randomizeTarget: trueの場合、シャッフルバッグから取得
          if (config.randomizeTarget === true) {
            validateShuffleBagState(state.targetBag, state.targetBagIndex);
            const result = generateThrowsFromBag(
              { targetBag: state.targetBag, targetBagIndex: state.targetBagIndex ?? 0 },
              config.throwUnit,
              config
            );
            throws = result.throws;
            state.targetBag = result.newBagState.targetBag;
            state.targetBagIndex = result.newBagState.targetBagIndex;
            simulatedBustInfo = undefined;
          } else {
            // 従来通りの投擲シミュレーション
            const shouldCheckBust =
              state.remainingScore > 0 &&
              (config.throwUnit === 3 || config.questionType !== 'score');
            const simulationResult = simulateThrows(config, state.remainingScore, shouldCheckBust);
            throws = simulationResult.throws;
            simulatedBustInfo = simulationResult.bustInfo;
          }

          // 問題オブジェクト構築とダーツ表示初期化
          state.currentQuestion = buildQuestion(
            throws,
            config,
            state.remainingScore,
            state.roundStartScore,
            simulatedBustInfo
          );
          state.displayedDarts = config.throwUnit === 3 ? [throws[0]] : throws;
          state.currentThrowIndex = 1;
        }),

      /**
       * 次のダーツを投擲シミュレーションする（3投モード専用）
       */
      simulateNextThrow: () =>
        set((state) => {
          const { config, currentQuestion } = state;

          // 1投モードの場合は何もしない
          if (config.throwUnit === 1) {
            return;
          }

          // 現在の問題が存在し、まだ表示していない投擲がある場合のみ処理
          if (!currentQuestion || state.currentThrowIndex >= currentQuestion.throws.length) {
            return;
          }

          // 次のダーツを表示
          const nextThrow = currentQuestion.throws[state.currentThrowIndex];
          state.displayedDarts.push(nextThrow);
          state.currentThrowIndex++;

          // questionPhaseの更新（3投モードのみ）
          if (
            config.throwUnit === 3 &&
            state.currentQuestion &&
            isDisplayedThrowCount(state.currentThrowIndex)
          ) {
            state.currentQuestion.questionPhase = calculateQuestionPhase(state.currentThrowIndex);
          }
        }),

      /**
       * 回答を送信する
       *
       * バスト検出時は自動的に残り点数を戻し、統計を更新します。
       * 呼び出し側でhandleBustを明示的に呼ぶ必要はありません。
       *
       * @throws {Error} 不正な回答値の場合
       */
      submitAnswer: (answer) => {
        // バリデーション
        if (!Number.isFinite(answer)) {
          throw new Error('回答は有限の数である必要があります');
        }
        if (!Number.isInteger(answer)) {
          throw new Error('回答は整数である必要があります');
        }
        // randomizeTarget === true の場合は負の値も許容
        const { config } = get();
        if (config.randomizeTarget !== true && answer < 0) {
          throw new Error('回答は0以上である必要があります');
        }

        set((state) => {
          const correctAnswer = get().getCurrentCorrectAnswer();
          const isCorrect = answer === correctAnswer;

          let isBust = false;

          // randomizeTarget === true の場合、バスト判定をスキップ
          if (state.config.randomizeTarget === true) {
            // バスト判定なし: 通常の減算処理（負の値も許容）
            if (state.currentQuestion) {
              const totalScore = state.currentQuestion.throws.reduce((sum, t) => sum + t.score, 0);
              state.remainingScore = state.remainingScore - totalScore;
            }
          } else {
            // randomizeTarget === false/undefined: 従来のバスト判定を実施
            const { isBust: bustResult, newRemainingScore } = checkAndUpdateBust(
              state.currentQuestion,
              state.remainingScore,
              state.roundStartScore
            );
            isBust = bustResult;
            state.remainingScore = newRemainingScore;
          }

          // 統計情報を更新
          updateStats(state.stats, isCorrect, isBust);

          // 問題数モードで最終問題に到達した場合、セッションを終了
          if (
            state.sessionConfig.mode === 'questions' &&
            state.stats.total >= (state.sessionConfig.questionCount || 0)
          ) {
            state.gameState = 'results';
            state.isTimerRunning = false;
          }

          // シャッフルバッグモードの場合、インデックスをインクリメント
          if (state.config.randomizeTarget === true && state.targetBagIndex !== undefined) {
            state.targetBagIndex++;
          }
        });
      },

      /**
       * 次の問題へ進む
       */
      nextQuestion: () => {
        const { config, remainingScore } = get();

        // ゲーム終了判定（残り0点）
        if (config.questionType === 'remaining' && isGameFinished(remainingScore)) {
          set((state) => {
            state.gameState = 'results';
            state.isTimerRunning = false;
          });
          return;
        }

        set((state) => {
          // ラウンド開始点数を更新
          state.roundStartScore = state.remainingScore;

          // 次の問題を生成準備（防御的にcurrentQuestionをリセット）
          state.currentQuestion = null;
          state.currentThrowIndex = 0;
          state.displayedDarts = [];
        });

        // 次の問題を生成（set完了後に実行）
        get().generateQuestion();
      },

      /**
       * セッションを終了する
       *
       * @param reason - 終了理由（オプション）
       * @todo 将来的にSessionResultに記録する機能を実装
       */
      endSession: (reason) =>
        set((state) => {
          state.gameState = 'results';
          state.isTimerRunning = false;
          // reasonは将来的にSessionResultに記録
          // 現在は未使用だが、将来の拡張のためにパラメータを保持
          void reason;
        }),

      /**
       * 設定画面に戻る
       */
      resetToSetup: () =>
        set((state) => {
          state.gameState = 'setup';
          state.currentQuestion = null;
          state.stats = { ...initialStats };
          state.elapsedTime = 0;
          state.isTimerRunning = false;
          state.practiceStartTime = undefined;
          state.displayedDarts = [];
          state.currentThrowIndex = 0;
          state.remainingScore = 0;
          state.roundStartScore = 0;
          state.targetBag = undefined;
          state.targetBagIndex = undefined;
        }),

      /**
       * デバッグ画面に移動する
       */
      goToDebugScreen: () =>
        set((state) => {
          state.gameState = 'debug';
        }),

      /**
       * デバッグ画面から設定画面に戻る
       */
      exitDebugScreen: () =>
        set((state) => {
          state.gameState = 'setup';
        }),

      /**
       * バスト処理
       */
      handleBust: () =>
        set((state) => {
          // 残り点数をラウンド開始時に戻す
          state.remainingScore = state.roundStartScore;
          // 問題をクリア
          state.currentQuestion = null;
          // 統計情報のtotalを増加（不正解扱い）
          state.stats.total++;
          // currentStreakをリセット（bestStreakは保持）
          state.stats.currentStreak = 0;
        }),

      /**
       * タイマーを更新する
       *
       * Date.now()を基準に経過時間を計算するため、
       * setIntervalの精度に依存せず正確な時間計測が可能です。
       */
      tick: () =>
        set((state) => {
          if (!state.isTimerRunning || !state.practiceStartTime) {
            return;
          }

          // Date.now()を基準に経過時間を計算
          state.elapsedTime = Math.floor((Date.now() - state.practiceStartTime) / 1000);

          // 時間制限モードでの制限時間チェック
          if (state.sessionConfig.mode === 'time' && state.sessionConfig.timeLimit) {
            const timeLimit = state.sessionConfig.timeLimit * 60; // 分を秒に変換
            if (state.elapsedTime >= timeLimit) {
              state.gameState = 'results';
              state.isTimerRunning = false;
            }
          }
        }),

      /**
       * ダーツマーカーの表示/非表示をトグル（排他的表示）
       * クリックされたダーツのみを表示し、他を非表示にする
       * すでにそのダーツだけが表示されている場合は、全て表示に戻す
       */
      toggleDartVisibility: (index) =>
        set((state) => {
          if (index >= 0 && index < state.visibleDarts.length) {
            // クリックされたダーツのみが表示されているかチェック
            const onlyThisVisible = state.visibleDarts.every((visible, i) =>
              i === index ? visible : !visible
            );

            if (onlyThisVisible) {
              // すでにこのダーツだけ表示 → 全て表示に戻す
              state.visibleDarts.fill(true);
            } else {
              // クリックされたダーツのみ表示、他を非表示
              state.visibleDarts.forEach((_, i) => {
                state.visibleDarts[i] = i === index;
              });
            }
          }
        }),

      // ============================================================
      // 計算プロパティ
      // ============================================================

      /**
       * 現在の問題の正解を取得する
       */
      getCurrentCorrectAnswer: () => {
        const { currentQuestion } = get();
        return currentQuestion?.correctAnswer ?? 0;
      },

      /**
       * バスト判定の正解を取得する（3投モードのバストフェーズ用）
       *
       * 表示されている最後のダーツ投擲時点でのバスト判定を行う。
       * - 1本目表示時: 1本目がバストを引き起こすか
       * - 2本目表示時: 1本目+2本目の累積がバストを引き起こすか
       *
       * @returns 'bust' | 'safe' | 'finish'
       */
      getBustCorrectAnswer: (): BustQuestionAnswer => {
        const { currentQuestion, displayedDarts, roundStartScore } = get();

        // バストフェーズでない場合は'safe'
        if (currentQuestion?.questionPhase?.type !== 'bust') {
          return 'safe';
        }

        // 表示されているダーツがない場合は'safe'
        // Note: バストフェーズなのにダーツが表示されていないケースは通常発生しない
        if (displayedDarts.length === 0) {
          if (import.meta.env.DEV) {
            console.warn('getBustCorrectAnswer: バストフェーズなのにダーツが表示されていません');
          }
          return 'safe';
        }

        // 表示されている最後のダーツ
        const lastDisplayedDart = displayedDarts[displayedDarts.length - 1];

        // その投擲時点での残り点数を計算（最後の1投を除いた累積を引く）
        const previousCumulativeScore = displayedDarts
          .slice(0, -1)
          .reduce((sum, dart) => sum + dart.score, 0);
        const currentRemainingScore = roundStartScore - previousCumulativeScore;

        // 前の投擲ですでにバストしている場合は、即座に'bust'を返す
        if (currentRemainingScore <= 0) {
          return 'bust';
        }

        // バスト判定を実行（最後の1投のスコアで判定）
        const isDouble = isDoubleRing(lastDisplayedDart.ring);
        const bustResult = checkBust(currentRemainingScore, lastDisplayedDart.score, isDouble);

        if (bustResult.isBust) {
          return 'bust';
        }

        // フィニッシュ判定：残り0点でダブルの場合
        const newRemainingScore = currentRemainingScore - lastDisplayedDart.score;
        if (newRemainingScore === 0 && isDouble) {
          return 'finish';
        }

        return 'safe';
      },

      /**
       * 正答率を計算する
       */
      getAccuracy: () => {
        const { stats } = get();
        if (stats.total === 0) {
          return 0;
        }
        return stats.correct / stats.total;
      },
    })),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ config: state.config }),
      merge: (persistedState, currentState) => {
        if (!persistedState) {
          return currentState;
        }

        // 型ガードで安全にチェック
        if (
          typeof persistedState === 'object' &&
          persistedState !== null &&
          'config' in persistedState
        ) {
          const config = persistedState.config;
          if (config && typeof config === 'object') {
            return {
              ...currentState,
              config: {
                ...currentState.config,
                ...config,
              },
            };
          }
        }

        return currentState;
      },
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          try {
            const parsed = JSON.parse(str);

            // persistミドルウェア形式のデータ
            if (isPersistFormat(parsed)) {
              return parsed;
            }

            // storage.ts形式（直接PracticeConfig）のデータ
            if (isPracticeConfigFormat(parsed)) {
              return { state: { config: parsed }, version: PERSIST_VERSION };
            }

            return null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // persistミドルウェア形式の場合、configのみを保存（storage.tsとの互換性維持）
            if (isPersistFormat(value)) {
              localStorage.setItem(name, JSON.stringify(value.state.config));
            }
          } catch (error) {
            // localStorage容量制限やシリアライズエラーを無視
            // アプリケーションの動作には影響しないため、サイレントに失敗
            console.warn('Failed to persist config to localStorage:', error);
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
