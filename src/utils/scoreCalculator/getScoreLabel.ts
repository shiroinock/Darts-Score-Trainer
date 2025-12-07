/**
 * リングとセグメント番号から表示用ラベルを生成
 *
 * @param ring - リング種類
 * @param segmentNumber - セグメント番号（1-20）
 * @returns ラベル文字列（例: "T20", "D16", "BULL", "25", "18", "OUT"）
 * @throws {Error} 無効なセグメント番号が渡された場合（BULL/OUT以外）
 */

import type { RingType } from '../../types';

export function getScoreLabel(ring: RingType, segmentNumber: number): string {
  // BULL/OUTの場合
  if (ring === 'INNER_BULL') {
    return 'BULL';
  }
  if (ring === 'OUTER_BULL') {
    return '25';
  }
  if (ring === 'OUT') {
    return 'OUT';
  }

  // それ以外の場合はセグメント番号の妥当性をチェック
  if (segmentNumber < 1 || segmentNumber > 20) {
    throw new Error('Segment number must be between 1 and 20');
  }

  // リング種類に応じてラベルを生成
  if (ring === 'TRIPLE') {
    return `T${segmentNumber}`;
  }
  if (ring === 'DOUBLE') {
    return `D${segmentNumber}`;
  }
  // INNER_SINGLE | OUTER_SINGLE
  return `${segmentNumber}`;
}
