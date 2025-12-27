/**
 * セッション初期状態
 *
 * ゲームストアの初期値を定義します。
 */

import type { SessionConfig, Stats } from '../../types';

/**
 * 初期統計情報
 */
export const initialStats: Stats = {
  correct: 0,
  total: 0,
  currentStreak: 0,
  bestStreak: 0,
};

/**
 * 初期セッション設定
 */
export const initialSessionConfig: SessionConfig = {
  mode: 'questions',
  questionCount: 10,
};
