/**
 * 物理座標（mm）から点数を一括計算
 *
 * 物理座標系からダーツボード座標系への変換：
 * - Math.atan2(y, x): 右方向（X軸正）が0、反時計回りが正
 * - ダーツボード: 上方向（Y軸負）が0、時計回りが正
 * - 変換式: dartAngle = -Math.atan2(x, -y)
 *   または: dartAngle = Math.atan2(-y, x) - π/2
 *
 * @param x - X座標（mm）
 * @param y - Y座標（mm）
 * @returns 点数
 */

import { calculateScore } from './calculateScore.js';
import { getRing } from './getRing.js';
import { getSegmentNumber } from './getSegmentNumber.js';

export function coordinateToScore(x: number, y: number): number {
  const distance = Math.sqrt(x * x + y * y);
  // Math.atan2を使って角度を計算し、ダーツボード座標系に変換
  // ダーツボードの真上（y=-1, x=0）が0度になるように変換
  const angle = Math.atan2(x, -y);

  const ring = getRing(distance);
  const segmentNumber = getSegmentNumber(angle);

  return calculateScore(ring, segmentNumber);
}
