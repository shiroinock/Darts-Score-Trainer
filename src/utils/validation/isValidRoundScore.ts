/**
 * 1ラウンド（3投）の合計得点として有効かどうかを判定する
 *
 * @param score - 判定対象の合計得点
 * @returns 有効な得点の場合true、それ以外はfalse
 *
 * 有効な得点:
 * - 0-180の整数値のうち、3投の組み合わせで取りうる値
 * - 0点（3投全てボード外）から180点（T20 + T20 + T20）まで
 *
 * 無効な得点:
 * - 負の数
 * - 181以上
 * - 浮動小数点数（整数でない）
 * - NaN, Infinity, -Infinity
 * - 取りえない値（163, 166, 169, 172, 173, 175, 176, 178, 179）
 */

import { VALID_ROUND_SCORES } from './validRoundScores.js';

export function isValidRoundScore(score: number): boolean {
  // 特殊な数値（NaN, Infinity, -Infinity）は無効
  if (!Number.isFinite(score)) {
    return false;
  }

  // 整数でない場合は無効
  if (!Number.isInteger(score)) {
    return false;
  }

  // 有効な1ラウンド合計得点の集合に含まれているかチェック
  return VALID_ROUND_SCORES.has(score);
}
