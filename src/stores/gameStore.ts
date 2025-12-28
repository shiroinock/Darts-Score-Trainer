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
import { checkBust, isGameFinished } from '../utils/gameLogic/index.js';
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
  remainingScore: number
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
    return {
      mode: 'remaining',
      correctAnswer: remainingScore - totalScore,
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

  return {
    mode: 'remaining',
    correctAnswer: remainingScore - totalScore,
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
  questionType: PracticeConfig['questionType'],
  remainingScore: number,
  roundStartScore: number
): BustCheckResult {
  // 残り点数モードでない場合はバストなし
  if (currentQuestion?.mode !== 'remaining' || questionType === 'score') {
    return { isBust: false, newRemainingScore: remainingScore };
  }

  const totalScore = currentQuestion.throws.reduce((sum, t) => sum + t.score, 0);
  const lastThrow = currentQuestion.throws[currentQuestion.throws.length - 1];
  const isDouble = lastThrow?.ring === 'DOUBLE';
  const bustInfo = checkBust(remainingScore, totalScore, isDouble);

  if (bustInfo.isBust) {
    // バスト: 残り点数をラウンド開始時に戻す
    return { isBust: true, newRemainingScore: roundStartScore };
  }

  // バストでない: 残り点数を更新
  return { isBust: false, newRemainingScore: remainingScore - totalScore };
}

/**
 * 統計情報を更新する
 */
function updateStats(stats: Stats, isCorrect: boolean, isBust: boolean): void {
  stats.total++;

  if (isCorrect && !isBust) {
    // 正解かつバストでない場合のみ正解数をカウント
    stats.correct++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
  } else {
    // 不正解またはバストの場合はストリークをリセット
    stats.currentStreak = 0;
  }
}

/**
 * ゲームストアの状態インターフェース
 */
interface GameStore {
  // ============================================================
  // 基本状態（11個）
  // ============================================================
  gameState: GameState;
  config: PracticeConfig;
  sessionConfig: SessionConfig;
  currentQuestion: Question | null;
  currentThrowIndex: number;
  displayedDarts: ThrowResult[];
  remainingScore: number;
  roundStartScore: number;
  stats: Stats;
  elapsedTime: number;
  isTimerRunning: boolean;
  practiceStartTime?: number;

  // ============================================================
  // 設定アクション（5個）
  // ============================================================
  setConfig: (config: Partial<PracticeConfig>) => void;
  setSessionConfig: (config: SessionConfig) => void;
  selectPreset: (presetId: string) => void;
  setTarget: (target: Target) => void;
  setStdDev: (stdDevMM: number) => void;

  // ============================================================
  // ゲームアクション（9個）
  // ============================================================
  startPractice: () => void;
  generateQuestion: () => void;
  simulateNextThrow: () => void;
  submitAnswer: (answer: number) => void;
  nextQuestion: () => void;
  endSession: (reason?: string) => void;
  resetToSetup: () => void;
  handleBust: () => void;
  tick: () => void;

  // ============================================================
  // 計算プロパティ（2個）
  // ============================================================
  getCurrentCorrectAnswer: () => number;
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
      remainingScore: 0,
      roundStartScore: 0,
      stats: { ...initialStats },
      elapsedTime: 0,
      isTimerRunning: false,
      practiceStartTime: undefined,

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
          const throws: ThrowResult[] = [];

          // 指定された投擲数分のシミュレーションを実行
          let currentRemaining = state.remainingScore; // シミュレーション用の残り点数
          for (let i = 0; i < config.throwUnit; i++) {
            // 残り本数を計算
            const throwsRemaining = config.throwUnit - i;

            // ターゲットを決定: 手動選択 > 自動選択 > デフォルト(T20)
            const target =
              config.target ??
              getOptimalTarget(currentRemaining, throwsRemaining) ??
              DEFAULT_TARGET;

            const throwResult = executeThrow(target, config.stdDevMM);
            throws.push(throwResult);

            // シミュレーション用の残り点数を更新（次の投擲のターゲット決定用）
            currentRemaining = Math.max(MIN_SCORE, currentRemaining - throwResult.score);
          }

          // 得点の合計を計算
          const totalScore = throws.reduce((sum, t) => sum + t.score, 0);

          // 問題モードを決定
          const { mode, correctAnswer, questionText } = determineQuestionMode(
            config.questionType,
            config.throwUnit,
            totalScore,
            state.remainingScore
          );

          state.currentQuestion = {
            mode,
            throws,
            correctAnswer,
            questionText,
            startingScore: mode === 'remaining' ? state.remainingScore : undefined,
          };

          // 1投モードの場合は即座にdisplayedDartsに追加
          if (config.throwUnit === 1) {
            state.displayedDarts = [...throws];
            state.currentThrowIndex = 1;
          } else {
            // 3投モードの場合はリセット
            state.displayedDarts = [];
            state.currentThrowIndex = 0;
          }
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

          // 現在の問題が存在し、まだ表示していない投擲がある場合
          if (currentQuestion && state.currentThrowIndex < currentQuestion.throws.length) {
            const nextThrow = currentQuestion.throws[state.currentThrowIndex];
            state.displayedDarts.push(nextThrow);
            state.currentThrowIndex++;
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
        if (answer < 0) {
          throw new Error('回答は0以上である必要があります');
        }
        if (!Number.isInteger(answer)) {
          throw new Error('回答は整数である必要があります');
        }

        set((state) => {
          const correctAnswer = get().getCurrentCorrectAnswer();
          const isCorrect = answer === correctAnswer;

          // バスト判定と残り点数更新
          const { isBust, newRemainingScore } = checkAndUpdateBust(
            state.currentQuestion,
            state.config.questionType,
            state.remainingScore,
            state.roundStartScore
          );
          state.remainingScore = newRemainingScore;

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
