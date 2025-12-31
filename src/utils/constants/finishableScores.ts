import { CHECKOUT_MAX_SINGLE_DART_SCORE, CHECKOUT_MIN_SCORE } from './gameRules';

/**
 * インナーブル（ダブルブル）のスコア
 */
const INNER_BULL_SCORE = 50;

/**
 * 1投でフィニッシュ可能な点数のセット
 *
 * ダブルアウトルールでは、以下の点数が1投でフィニッシュ可能：
 * - CHECKOUT_MIN_SCORE(2) - CHECKOUT_MAX_SINGLE_DART_SCORE(40)点の偶数（D1-D20）
 * - 50点（インナーブル）
 */
export const ONE_DART_FINISHABLE = new Set([
  // 2-40の偶数（ダブル1〜ダブル20）
  ...Array.from(
    { length: (CHECKOUT_MAX_SINGLE_DART_SCORE - CHECKOUT_MIN_SCORE) / 2 + 1 },
    (_, i) => CHECKOUT_MIN_SCORE + i * 2
  ),
  // インナーブル
  INNER_BULL_SCORE,
]);
