/**
 * 角度（ラジアン）からセグメント番号（1-20）を取得
 *
 * ダーツボードの座標系：
 * - 真上（Y軸負方向）が0ラジアン
 * - 右（X軸正方向）がπ/2ラジアン
 * - 下（Y軸正方向）がπラジアン
 * - 左（X軸負方向）が-π/2ラジアン
 * - 時計回りが正の方向
 *
 * @param angle - ダーツボード座標系の角度（ラジアン）
 * @returns セグメント番号（1-20）
 */

import { SEGMENT_ANGLE, SEGMENTS } from '../constants/index.js';

export function getSegmentNumber(angle: number): number {
  // 角度を正規化（-π〜πの範囲に収める）
  let normalizedAngle = angle % (2 * Math.PI);
  if (normalizedAngle > Math.PI) {
    normalizedAngle -= 2 * Math.PI;
  } else if (normalizedAngle < -Math.PI) {
    normalizedAngle += 2 * Math.PI;
  }

  // 0を中心とした角度を0-2πの範囲に変換
  if (normalizedAngle < 0) {
    normalizedAngle += 2 * Math.PI;
  }

  // セグメントインデックスを計算
  // 真上（0ラジアン）がセグメント20（インデックス0）
  // π/10がセグメント1（インデックス1）の開始点
  // 各セグメントは18度（π/10）の幅
  const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);

  // インデックスを0-19の範囲に正規化
  const normalizedIndex = segmentIndex % 20;

  return SEGMENTS[normalizedIndex];
}
