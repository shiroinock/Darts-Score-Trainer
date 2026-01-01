/**
 * 実際の投擲座標から表示用座標を計算
 *
 * ダーツの実際の着弾位置を、視認性を高めるために調整した表示用座標に変換します。
 * - アウト（OUT）: 半径180mmの円周上に配置
 * - アウターブル（OUTER_BULL）: 半径11.175mmの円周上に配置
 * - インナーブル（INNER_BULL）: 中心（半径0）に向かって20%引っ張る、角度はそのまま
 * - トリプル（TRIPLE）: 半径はリング中心（103mm）に完全に載せる、角度はセグメント中心に20%引っ張る
 * - ダブル（DOUBLE）: 半径はリング中心（166mm）に完全に載せる、角度はセグメント中心に20%引っ張る
 * - シングル（INNER_SINGLE, OUTER_SINGLE）: リング中心半径とセグメント中心角度に向かって20%引っ張る（極座標系で独立補正）
 *
 * @param actualCoords - 実際の投擲座標（物理座標、mm単位）
 * @returns 表示用座標（物理座標、mm単位）
 */

import type { Coordinates } from '../../types';
import { BOARD_PHYSICAL } from '../constants/boardPhysical.js';
import { DART_DISPLAY_ADJUSTMENT } from '../constants/dartMarkerRadii.js';
import { SEGMENTS } from '../constants/segments.js';
import { coordinateToScoreDetail } from '../scoreCalculator/coordinateToScoreDetail.js';

/**
 * アウターブル表示用の半径（mm）
 * インナーブルとアウターブルの中間点
 */
const OUTER_BULL_DISPLAY_RADIUS =
  (BOARD_PHYSICAL.rings.innerBull + BOARD_PHYSICAL.rings.outerBull) / 2;

/**
 * セグメント角度（18度 = π/10ラジアン）
 */
const SEGMENT_ANGLE = Math.PI / 10;

/**
 * 各リングの中心半径を計算
 */
const RING_CENTER_RADIUS = {
  INNER_SINGLE: (BOARD_PHYSICAL.rings.outerBull + BOARD_PHYSICAL.rings.tripleInner) / 2, // 57.5mm
  TRIPLE: (BOARD_PHYSICAL.rings.tripleInner + BOARD_PHYSICAL.rings.tripleOuter) / 2, // 103mm
  OUTER_SINGLE: (BOARD_PHYSICAL.rings.tripleOuter + BOARD_PHYSICAL.rings.doubleInner) / 2, // 134.5mm
  DOUBLE: (BOARD_PHYSICAL.rings.doubleInner + BOARD_PHYSICAL.rings.doubleOuter) / 2, // 166mm
} as const;

/**
 * デカルト座標を極座標に変換
 *
 * ダーツボード座標系の角度定義：
 * - 真上（Y軸負方向）= 0ラジアン
 * - 右（X軸正方向）= π/2ラジアン
 * - 下（Y軸正方向）= πラジアン
 * - 左（X軸負方向）= -π/2ラジアン
 * - 時計回りが正の方向
 *
 * @param coords - デカルト座標
 * @returns 極座標 {radius, angle}
 */
function cartesianToPolar(coords: Coordinates): { radius: number; angle: number } {
  const radius = Math.sqrt(coords.x * coords.x + coords.y * coords.y);
  // atan2(x, -y) でダーツボード座標系の角度を計算
  // 真上 (0, -r) → 0ラジアン
  // 右 (r, 0) → π/2ラジアン
  const angle = Math.atan2(coords.x, -coords.y);
  return { radius, angle };
}

/**
 * 極座標をデカルト座標に変換
 *
 * ダーツボード座標系の変換式：
 * - x = r * sin(θ)
 * - y = -r * cos(θ)
 *
 * @param radius - 半径
 * @param angle - 角度（ラジアン）
 * @returns デカルト座標
 */
function polarToCartesian(radius: number, angle: number): Coordinates {
  return {
    x: radius * Math.sin(angle),
    y: -radius * Math.cos(angle),
  };
}

/**
 * 角度差分を正規化（最短経路）
 *
 * -π から π の範囲に正規化して、最短回転方向を取得
 *
 * @param angleDiff - 角度差分（ラジアン）
 * @returns 正規化された角度差分（-π ≤ result ≤ π）
 */
function normalizeAngleDifference(angleDiff: number): number {
  // NaN/Infinityのガード（防御的プログラミング）
  if (!Number.isFinite(angleDiff)) {
    return 0;
  }

  // 剰余演算による正規化（whileループより効率的）
  let normalized = angleDiff % (2 * Math.PI);
  if (normalized > Math.PI) {
    normalized -= 2 * Math.PI;
  } else if (normalized < -Math.PI) {
    normalized += 2 * Math.PI;
  }
  return normalized;
}

/**
 * 極座標系で半径と角度を独立に補正
 *
 * 半径方向と角度方向を独立に補正することで、リングのスパイダーとセグメント境界の両方から離す
 *
 * @param coords - 元の座標
 * @param targetRadius - 目標半径
 * @param targetAngle - 目標角度（ラジアン）
 * @param radiusPullFactor - 半径方向の引っ張り率（0-1）
 * @param anglePullFactor - 角度方向の引っ張り率（0-1）
 * @returns 補正された座標
 */
function adjustInPolar(
  coords: Coordinates,
  targetRadius: number,
  targetAngle: number,
  radiusPullFactor: number,
  anglePullFactor: number
): Coordinates {
  const { radius, angle } = cartesianToPolar(coords);

  // 半径方向の補正
  const adjustedRadius = radius + (targetRadius - radius) * radiusPullFactor;

  // 角度方向の補正（最短経路）
  const angleDiff = normalizeAngleDifference(targetAngle - angle);
  const adjustedAngle = angle + angleDiff * anglePullFactor;

  return polarToCartesian(adjustedRadius, adjustedAngle);
}

/**
 * 指定された半径と角度の円周上に座標を配置
 */
function placeOnCircle(coords: Coordinates, radius: number): Coordinates {
  const distance = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

  // 原点の場合は角度が定義できないのでそのまま返す
  if (distance === 0) {
    return { x: 0, y: 0 };
  }

  // 角度を維持したまま、指定された半径の円周上に配置
  const scale = radius / distance;
  return {
    x: coords.x * scale,
    y: coords.y * scale,
  };
}

/**
 * セグメント中心角度を計算
 *
 * ダーツボード座標系の角度定義：
 * - 真上（Y軸負方向）= 0ラジアン
 * - 右（X軸正方向）= π/2ラジアン
 * - 下（Y軸正方向）= πラジアン
 * - 左（X軸負方向）= -π/2ラジアン
 * - 時計回りが正の方向
 *
 * @param segmentNumber - セグメント番号（1-20）
 * @returns セグメント中心角度（ラジアン）
 */
function getSegmentCenterAngle(segmentNumber: number): number {
  // セグメント番号からインデックスを取得
  // segmentNumberは1-20の範囲であることがcoordinateToScoreDetailで保証されている
  const segmentIndex = SEGMENTS.indexOf(segmentNumber as (typeof SEGMENTS)[number]);

  // セグメント中心角度を計算
  // セグメント0（値20）は真上（0ラジアン）、時計回りに18度間隔
  return segmentIndex * SEGMENT_ANGLE;
}

export function getDisplayCoordinates(actualCoords: Coordinates): Coordinates {
  // リング種別とセグメント番号を取得
  const { ring, segmentNumber } = coordinateToScoreDetail(actualCoords.x, actualCoords.y);

  // リング種別に応じて表示座標を計算
  switch (ring) {
    case 'OUT':
      // アウトは半径200mmの円周上に配置
      return placeOnCircle(actualCoords, DART_DISPLAY_ADJUSTMENT.outRadius);

    case 'OUTER_BULL':
      // アウターブルは半径11.175mmの円周上に配置
      return placeOnCircle(actualCoords, OUTER_BULL_DISPLAY_RADIUS);

    case 'INNER_BULL': {
      // インナーブルは中心（半径0）に向かって20%引っ張る
      // 角度はそのまま維持（中心なので角度は補正不要）
      const { angle } = cartesianToPolar(actualCoords);
      return adjustInPolar(
        actualCoords,
        0,
        angle,
        DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor,
        0
      );
    }

    case 'INNER_SINGLE': {
      // リング中心半径とセグメント中心角度に向かって20%引っ張る
      const targetAngle = getSegmentCenterAngle(segmentNumber);
      return adjustInPolar(
        actualCoords,
        RING_CENTER_RADIUS.INNER_SINGLE,
        targetAngle,
        DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor,
        DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor
      );
    }

    case 'TRIPLE': {
      // トリプルは幅が狭いので、半径はリング中心に完全に載せる（100%）
      // 角度はセグメント中心に向かって20%引っ張る
      const targetAngle = getSegmentCenterAngle(segmentNumber);
      return adjustInPolar(
        actualCoords,
        RING_CENTER_RADIUS.TRIPLE,
        targetAngle,
        1.0,
        DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor
      );
    }

    case 'OUTER_SINGLE': {
      // リング中心半径とセグメント中心角度に向かって20%引っ張る
      const targetAngle = getSegmentCenterAngle(segmentNumber);
      return adjustInPolar(
        actualCoords,
        RING_CENTER_RADIUS.OUTER_SINGLE,
        targetAngle,
        DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor,
        DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor
      );
    }

    case 'DOUBLE': {
      // ダブルは幅が狭いので、半径はリング中心に完全に載せる（100%）
      // 角度はセグメント中心に向かって20%引っ張る
      const targetAngle = getSegmentCenterAngle(segmentNumber);
      return adjustInPolar(
        actualCoords,
        RING_CENTER_RADIUS.DOUBLE,
        targetAngle,
        1.0,
        DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor
      );
    }
  }
}
