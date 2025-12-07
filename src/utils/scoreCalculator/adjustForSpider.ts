/**
 * スパイダー境界の調整処理
 *
 * スパイダー（ワイヤー）境界上の座標を、最も近い有効エリアにずらします。
 * 簡素な実装: 境界から1mm離れた位置にずらす。
 *
 * @param distance - 中心からの距離（mm）
 * @param angle - 角度（ラジアン）
 * @returns 調整後の距離と角度
 */

import { BOARD_PHYSICAL, SEGMENT_ANGLE } from '../constants/index.js';

export function adjustForSpider(
  distance: number,
  angle: number
): { distance: number; angle: number } {
  const tolerance = 0.001; // 境界判定の許容誤差（mm）
  const adjustment = 1; // 調整量（mm）

  let adjustedDistance = distance;
  let adjustedAngle = angle;

  // リング境界のチェック
  const ringBoundaries = [
    BOARD_PHYSICAL.rings.innerBull,
    BOARD_PHYSICAL.rings.outerBull,
    BOARD_PHYSICAL.rings.tripleInner,
    BOARD_PHYSICAL.rings.tripleOuter,
    BOARD_PHYSICAL.rings.doubleInner,
    BOARD_PHYSICAL.rings.doubleOuter,
  ];

  for (const boundary of ringBoundaries) {
    if (Math.abs(distance - boundary) < tolerance) {
      // 境界に近い場合は内側にずらす
      adjustedDistance = boundary - adjustment;
      break;
    }
  }

  // セグメント境界のチェック
  // 角度を正規化（0-2πの範囲に収める）
  let normalizedAngle = angle % (2 * Math.PI);
  if (normalizedAngle > Math.PI) {
    normalizedAngle -= 2 * Math.PI;
  } else if (normalizedAngle < -Math.PI) {
    normalizedAngle += 2 * Math.PI;
  }
  if (normalizedAngle < 0) {
    normalizedAngle += 2 * Math.PI;
  }

  // セグメント境界は各π/10の倍数の位置（π/10, 2π/10, ...）
  // 注意: 0も技術的には境界だが、セグメント20の中心として扱う
  const segmentOffset = normalizedAngle % SEGMENT_ANGLE;

  // セグメント境界に非常に近い場合（tolerance範囲内）
  // ただし、normalizedAngle=0の場合は境界ではなく中心として扱う
  const isAtBoundary =
    normalizedAngle > tolerance && // 0を除外
    (segmentOffset < tolerance || segmentOffset > SEGMENT_ANGLE - tolerance);

  if (isAtBoundary) {
    // 境界に近い場合は少しずらす（境界から離れる方向に）
    const shift = segmentOffset < SEGMENT_ANGLE / 2 ? adjustment : -adjustment;
    adjustedAngle = angle + shift / 100; // 小さく調整
  }

  return { distance: adjustedDistance, angle: adjustedAngle };
}
