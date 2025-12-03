/**
 * Darts Score Trainer - ゲームストア（Zustand）
 *
 * アプリケーション全体のゲーム状態を管理するZustandストアです。
 * 練習設定、セッション状態、問題生成、統計情報などを一元管理します。
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  GameState,
  PracticeConfig,
  SessionConfig,
  Question,
  Target,
  Stats,
  ThrowResult,
  QuestionType,
} from '../types';
import { executeThrow } from '../utils/throwSimulator';
import { checkBust, isGameFinished } from '../utils/gameLogic';

/**
 * プリセット定義
 *
 * 5つのプリセット練習設定を定義します。
 */
const PRESETS: Record<string, PracticeConfig> = {
  'preset-basic': {
    configId: 'preset-basic',
    configName: '基礎練習',
    description: '1投単位で得点を問う基本練習',
    icon: '📚',
    throwUnit: 1,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: null,
    target: { type: 'TRIPLE', number: 20, label: 'T20' },
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
  'preset-player': {
    configId: 'preset-player',
    configName: 'プレイヤー練習',
    description: '3投単位で得点を問う練習',
    icon: '🎯',
    throwUnit: 3,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: null,
    target: { type: 'TRIPLE', number: 20, label: 'T20' },
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
  'preset-caller-basic': {
    configId: 'preset-caller-basic',
    configName: 'コーラー基礎',
    description: '残り点数を問う基礎練習',
    icon: '📢',
    throwUnit: 3,
    questionType: 'remaining',
    judgmentTiming: 'independent',
    startingScore: 501,
    target: { type: 'TRIPLE', number: 20, label: 'T20' },
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
  'preset-caller-cumulative': {
    configId: 'preset-caller-cumulative',
    configName: 'コーラー累積',
    description: '累積での残り点数計算練習',
    icon: '🎲',
    throwUnit: 3,
    questionType: 'remaining',
    judgmentTiming: 'cumulative',
    startingScore: 501,
    target: { type: 'TRIPLE', number: 20, label: 'T20' },
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
  'preset-comprehensive': {
    configId: 'preset-comprehensive',
    configName: '総合練習',
    description: '得点と残り点数の両方を問う',
    icon: '🏆',
    throwUnit: 3,
    questionType: 'both',
    judgmentTiming: 'cumulative',
    startingScore: 501,
    target: { type: 'TRIPLE', number: 20, label: 'T20' },
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
};

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
 * 初期統計情報
 */
const initialStats: Stats = {
  correct: 0,
  total: 0,
  currentStreak: 0,
  bestStreak: 0,
};

/**
 * 初期セッション設定
 */
const initialSessionConfig: SessionConfig = {
  mode: 'questions',
  questionCount: 10,
};

/**
 * ゲームストアの実装
 */
export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    // ============================================================
    // 初期状態
    // ============================================================
    gameState: 'setup',
    config: { ...PRESETS['preset-basic'] },
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
        state.gameState = 'practicing';
        state.isTimerRunning = true;
        state.stats = { ...initialStats };
        state.elapsedTime = 0;
        state.practiceStartTime = Date.now();
        state.displayedDarts = [];
        state.currentThrowIndex = 0;

        // 残り点数モードの場合、remainingScoreを設定
        if (
          state.config.questionType === 'remaining' ||
          state.config.questionType === 'both'
        ) {
          state.remainingScore = state.config.startingScore || 0;
          state.roundStartScore = state.remainingScore;
        } else {
          state.remainingScore = 0;
          state.roundStartScore = 0;
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
        const throws: ThrowResult[] = [];

        // 指定された投擲数分のシミュレーションを実行
        for (let i = 0; i < config.throwUnit; i++) {
          const throwResult = executeThrow(config.target, config.stdDevMM);
          throws.push(throwResult);
        }

        // 得点の合計を計算
        const totalScore = throws.reduce((sum, t) => sum + t.score, 0);

        // 問題タイプに応じて正解と問題文を設定
        let correctAnswer: number;
        let questionText: string;
        let mode: QuestionType;

        if (config.questionType === 'score') {
          mode = 'score';
          correctAnswer = totalScore;
          questionText =
            config.throwUnit === 1
              ? 'この投擲の得点は？'
              : '3投の合計得点は？';
        } else if (config.questionType === 'remaining') {
          mode = 'remaining';
          correctAnswer = state.remainingScore - totalScore;
          questionText = '残り点数は？';
        } else {
          // both: ランダムにscoreかremainingを選択
          // ただし、remainingScoreが0または未設定の場合は強制的にscoreモードにする
          if (state.remainingScore <= 0) {
            mode = 'score';
          } else {
            mode = Math.random() < 0.5 ? 'score' : 'remaining';
          }

          if (mode === 'score') {
            correctAnswer = totalScore;
            questionText =
              config.throwUnit === 1
                ? 'この投擲の得点は？'
                : '3投の合計得点は？';
          } else {
            correctAnswer = state.remainingScore - totalScore;
            questionText = '残り点数は？';
          }
        }

        state.currentQuestion = {
          mode,
          throws,
          correctAnswer,
          questionText,
          startingScore:
            mode === 'remaining' ? state.remainingScore : undefined,
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
        if (
          currentQuestion &&
          state.currentThrowIndex < currentQuestion.throws.length
        ) {
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

        // 残り点数モードの場合、バスト判定を先に実行
        let isBust = false;
        if (
          state.currentQuestion?.mode === 'remaining' &&
          state.config.questionType !== 'score'
        ) {
          const totalScore =
            state.currentQuestion?.throws.reduce((sum, t) => sum + t.score, 0) ||
            0;

          // バスト判定
          const lastThrow =
            state.currentQuestion?.throws[
              state.currentQuestion.throws.length - 1
            ];
          const isDouble = lastThrow?.ring === 'DOUBLE';
          const bustInfo = checkBust(
            state.remainingScore,
            totalScore,
            isDouble
          );

          if (bustInfo.isBust) {
            // バスト検出: 残り点数をラウンド開始時に戻す
            isBust = true;
            state.remainingScore = state.roundStartScore;
          } else {
            // バストでない場合は残り点数を更新
            const newRemaining = state.remainingScore - totalScore;
            state.remainingScore = newRemaining;
          }
        }

        // 統計情報を更新
        state.stats.total++;
        if (isCorrect && !isBust) {
          // 正解かつバストでない場合のみ正解数をカウント
          state.stats.correct++;
          state.stats.currentStreak++;
          if (state.stats.currentStreak > state.stats.bestStreak) {
            state.stats.bestStreak = state.stats.currentStreak;
          }
        } else {
          // 不正解またはバストの場合はストリークをリセット
          state.stats.currentStreak = 0;
        }

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
      if (
        config.questionType === 'remaining' &&
        isGameFinished(remainingScore)
      ) {
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
        state.elapsedTime = Math.floor(
          (Date.now() - state.practiceStartTime) / 1000
        );

        // 時間制限モードでの制限時間チェック
        if (
          state.sessionConfig.mode === 'time' &&
          state.sessionConfig.timeLimit
        ) {
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
  }))
);
