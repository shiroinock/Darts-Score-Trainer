/**
 * リングとセグメント番号から点数を計算
 *
 * @param ring - リング種類
 * @param segmentNumber - セグメント番号（1-20）
 * @returns 点数
 * @throws {Error} 無効なセグメント番号が渡された場合（BULL/OUT以外）
 */

import type { RingType } from '../../types';

export function calculateScore(ring: RingType, segmentNumber: number): number {
  // BULL/OUTの場合はセグメント番号を無視
  if (ring === 'INNER_BULL') {
    return 50;
  }
  if (ring === 'OUTER_BULL') {
    return 25;
  }
  if (ring === 'OUT') {
    return 0;
  }

  // それ以外の場合はセグメント番号の妥当性をチェック
  if (segmentNumber < 1 || segmentNumber > 20) {
    throw new Error('Segment number must be between 1 and 20');
  }

  // リング種類に応じて倍率を適用
  if (ring === 'TRIPLE') {
    return segmentNumber * 3;
  }
  if (ring === 'DOUBLE') {
    return segmentNumber * 2;
  }
  // INNER_SINGLE | OUTER_SINGLE
  return segmentNumber * 1;
}
