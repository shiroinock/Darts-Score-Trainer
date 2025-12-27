/**
 * セグメント番号（1-20）から角度（ラジアン）を取得
 *
 * ダーツボードの座標系：
 * - 真上（Y軸負方向）が0ラジアン
 * - 右（X軸正方向）がπ/2ラジアン
 * - 下（Y軸正方向）がπラジアン
 * - 左（X軸負方向）が-π/2ラジアン
 * - 時計回りが正の方向
 *
 * @param number - セグメント番号（1-20）
 * @returns 角度（ラジアン）。セグメントの中心位置を返す。
 * @throws {Error} 無効なセグメント番号の場合
 */

import { SEGMENT_ANGLE, SEGMENTS } from '../constants/index.js';

export function getSegmentAngle(number: number): number {
  // 入力バリデーション
  if (!Number.isInteger(number) || number < 1 || number > 20) {
    throw new Error('Segment number must be an integer between 1 and 20');
  }

  // セグメント配列からインデックスを検索
  const segmentIndex = (SEGMENTS as readonly number[]).indexOf(number);
  if (segmentIndex === -1) {
    throw new Error(`Invalid segment number: ${number}`);
  }

  // セグメントの中心角度を計算
  // 真上（インデックス0、セグメント20）が0ラジアン
  // 時計回りに進む（インデックス1が SEGMENT_ANGLE、インデックス2が 2 * SEGMENT_ANGLE...）
  const angle = segmentIndex * SEGMENT_ANGLE;

  return angle;
}
