/**
 * Darts Score Trainer - useGameStore カスタムフック
 *
 * Zustand gameStoreから状態やアクションを取得するためのReactカスタムフック。
 * パフォーマンス最適化のため、各セレクターは独立した再レンダリングを行います。
 */

import type {
  GameState,
  PracticeConfig,
  Question,
  SessionConfig,
  Stats,
  Target,
  ThrowResult,
} from '../types';
import { useGameStore } from '../stores/gameStore';

// ============================================================
// 状態セレクター (9個)
// ============================================================

/**
 * 現在のゲーム状態を取得する
 */
export const useGameState = (): GameState => {
  return useGameStore((state) => state.gameState);
};

/**
 * 現在の練習設定を取得する
 */
export const useConfig = (): PracticeConfig => {
  return useGameStore((state) => state.config);
};

/**
 * 現在のセッション設定を取得する
 */
export const useSessionConfig = (): SessionConfig => {
  return useGameStore((state) => state.sessionConfig);
};

/**
 * 現在の問題を取得する
 */
export const useCurrentQuestion = (): Question | null => {
  return useGameStore((state) => state.currentQuestion);
};

/**
 * 統計情報を取得する
 */
export const useStats = (): Stats => {
  return useGameStore((state) => state.stats);
};

/**
 * 経過時間（秒）を取得する
 */
export const useElapsedTime = (): number => {
  return useGameStore((state) => state.elapsedTime);
};

/**
 * タイマーが動作中かどうかを取得する
 */
export const useIsTimerRunning = (): boolean => {
  return useGameStore((state) => state.isTimerRunning);
};

/**
 * 残り点数を取得する
 */
export const useRemainingScore = (): number => {
  return useGameStore((state) => state.remainingScore);
};

/**
 * 表示中のダーツ一覧を取得する
 */
export const useDisplayedDarts = (): ThrowResult[] => {
  return useGameStore((state) => state.displayedDarts);
};

// ============================================================
// アクションセレクター (12個)
// ============================================================

/**
 * 設定を更新する関数を取得する
 */
export const useSetConfig = (): ((config: Partial<PracticeConfig>) => void) => {
  return useGameStore((state) => state.setConfig);
};

/**
 * セッション設定を更新する関数を取得する
 */
export const useSetSessionConfig = (): ((config: SessionConfig) => void) => {
  return useGameStore((state) => state.setSessionConfig);
};

/**
 * プリセットを選択する関数を取得する
 */
export const useSelectPreset = (): ((presetId: string) => void) => {
  return useGameStore((state) => state.selectPreset);
};

/**
 * ターゲットを設定する関数を取得する
 */
export const useSetTarget = (): ((target: Target) => void) => {
  return useGameStore((state) => state.setTarget);
};

/**
 * 標準偏差を設定する関数を取得する
 */
export const useSetStdDev = (): ((stdDevMM: number) => void) => {
  return useGameStore((state) => state.setStdDev);
};

/**
 * 練習を開始する関数を取得する
 */
export const useStartPractice = (): (() => void) => {
  return useGameStore((state) => state.startPractice);
};

/**
 * 問題を生成する関数を取得する
 */
export const useGenerateQuestion = (): (() => void) => {
  return useGameStore((state) => state.generateQuestion);
};

/**
 * 次のダーツを投擲シミュレーションする関数を取得する（3投モード専用）
 */
export const useSimulateNextThrow = (): (() => void) => {
  return useGameStore((state) => state.simulateNextThrow);
};

/**
 * 回答を提出する関数を取得する
 */
export const useSubmitAnswer = (): ((answer: number) => void) => {
  return useGameStore((state) => state.submitAnswer);
};

/**
 * 次の問題に進む関数を取得する
 */
export const useNextQuestion = (): (() => void) => {
  return useGameStore((state) => state.nextQuestion);
};

/**
 * セッションを終了する関数を取得する
 */
export const useEndSession = (): ((reason?: string) => void) => {
  return useGameStore((state) => state.endSession);
};

/**
 * 設定画面に戻る関数を取得する
 */
export const useResetToSetup = (): (() => void) => {
  return useGameStore((state) => state.resetToSetup);
};

// ============================================================
// 計算プロパティセレクター (2個)
// ============================================================

/**
 * 現在の問題の正解を取得する関数を返す
 */
export const useGetCurrentCorrectAnswer = (): (() => number) => {
  return useGameStore((state) => state.getCurrentCorrectAnswer);
};

/**
 * 正答率を計算する関数を返す
 */
export const useGetAccuracy = (): (() => number) => {
  return useGameStore((state) => state.getAccuracy);
};
