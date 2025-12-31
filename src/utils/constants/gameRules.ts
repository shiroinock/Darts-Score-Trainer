/**
 * ゲームルールに関する定数
 */

/**
 * 最小スコア（0点未満にはならない）
 */
export const MIN_SCORE = 0;

/**
 * フィニッシュ不可能な点数（ダブルアウトルール）
 * 残り1点ではダブルでフィニッシュできないため、ゲーム継続不可
 */
export const IMPOSSIBLE_FINISH_SCORE = 1;

/**
 * フィニッシュ可能な最小点数（ダブル1 = 2点）
 * @alias CHECKOUT_MIN_SCORE
 */
export const MIN_FINISHABLE_SCORE = 2;

/**
 * チェックアウト可能な最小点数
 * ダブルアウトルールで、最小のダブル（D1）で上がれる点数
 */
export const CHECKOUT_MIN_SCORE = MIN_FINISHABLE_SCORE;

/**
 * 1投でチェックアウト可能な最大点数（ダブル20 = 40点）
 * ダブル20が最大のダブルスコア
 */
export const CHECKOUT_MAX_SINGLE_DART_SCORE = 40;
