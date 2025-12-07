/**
 * 1投で取りうる全ての有効な得点の集合を取得する
 *
 * @returns 有効な得点のSet（44個の要素を含む）
 *
 * 含まれる得点:
 * - 0点（ボード外）
 * - 1-20点（シングル）
 * - 2-40の全ての偶数（ダブル）
 * - セグメント1-20の3倍（トリプル: 3, 6, 9, ..., 60）
 * - 25点（アウターブル）
 * - 50点（インナーブル）
 *
 * 不変性:
 * - 返されたSetを変更しても内部状態には影響しない
 * - 複数回呼び出しで同じ内容が返される
 */

import { VALID_SCORES } from './validScores.js';

export function getValidSingleScores(): Set<number> {
  // 新しいSetを返すことで不変性を保証
  return new Set(VALID_SCORES);
}
