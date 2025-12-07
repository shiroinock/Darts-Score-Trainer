/**
 * 統計情報
 *
 * セッション中の正答率や連続正解数を追跡します。
 */
export interface Stats {
  /** 正解数 */
  correct: number;
  /** 総問題数 */
  total: number;
  /** 現在の連続正解数 */
  currentStreak: number;
  /** 最高連続正解数 */
  bestStreak: number;
}
