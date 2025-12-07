/**
 * 座標から点数、リング、セグメント番号を返す
 *
 * @param x - X座標（mm）
 * @param y - Y座標（mm）
 * @returns 点数、リング種類、セグメント番号を含むオブジェクト
 */

import type { RingType } from '../../types';
import { getRing } from './getRing.js';
import { getSegmentNumber } from './getSegmentNumber.js';
import { calculateScore } from './calculateScore.js';

export function coordinateToScoreDetail(
  x: number,
  y: number
): { score: number; ring: RingType; segmentNumber: number } {
  const distance = Math.sqrt(x * x + y * y);
  // Math.atan2を使って角度を計算し、ダーツボード座標系に変換
  const angle = Math.atan2(x, -y);

  const ring = getRing(distance);
  const segmentNumber = getSegmentNumber(angle);
  const score = calculateScore(ring, segmentNumber);

  return { score, ring, segmentNumber };
}
