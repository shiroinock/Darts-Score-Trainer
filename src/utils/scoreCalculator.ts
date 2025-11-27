/**
 * Darts Score Trainer - 点数計算モジュール
 *
 * このファイルは物理座標から点数を計算する関数を提供します。
 * すべての座標は物理座標（mm単位）で処理されます。
 */

import { BOARD_PHYSICAL, SEGMENTS, SEGMENT_ANGLE } from './constants';
import type { RingType } from '../types';

/**
 * 中心からの距離（mm）からリング種類を判定
 *
 * @param distance - 中心からの距離（mm）
 * @returns リング種類
 * @throws {Error} 負の距離が渡された場合
 */
export function getRing(distance: number): RingType {
  // 負の距離はエラー
  if (distance < 0) {
    throw new Error('Distance cannot be negative');
  }

  // 各リングの境界値でチェック
  if (distance < BOARD_PHYSICAL.rings.innerBull) {
    return 'INNER_BULL';
  }
  if (distance < BOARD_PHYSICAL.rings.outerBull) {
    return 'OUTER_BULL';
  }
  if (distance < BOARD_PHYSICAL.rings.tripleInner) {
    return 'INNER_SINGLE';
  }
  if (distance < BOARD_PHYSICAL.rings.tripleOuter) {
    return 'TRIPLE';
  }
  if (distance < BOARD_PHYSICAL.rings.doubleInner) {
    return 'OUTER_SINGLE';
  }
  if (distance < BOARD_PHYSICAL.rings.doubleOuter) {
    return 'DOUBLE';
  }
  if (distance < BOARD_PHYSICAL.rings.boardEdge) {
    return 'OUTER_SINGLE';
  }
  return 'OUT';
}

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

/**
 * リングとセグメント番号から点数を計算
 *
 * @param ring - リング種類
 * @param segmentNumber - セグメント番号（1-20）
 * @returns 点数
 * @throws {Error} 無効なセグメント番号が渡された場合（BULL/OUT以外）
 */
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
export function coordinateToScore(x: number, y: number): number {
  const distance = Math.sqrt(x * x + y * y);
  // Math.atan2を使って角度を計算し、ダーツボード座標系に変換
  // ダーツボードの真上（y=-1, x=0）が0度になるように変換
  const angle = Math.atan2(x, -y);

  const ring = getRing(distance);
  const segmentNumber = getSegmentNumber(angle);

  return calculateScore(ring, segmentNumber);
}

/**
 * 座標から点数、リング、セグメント番号を返す
 *
 * @param x - X座標（mm）
 * @param y - Y座標（mm）
 * @returns 点数、リング種類、セグメント番号を含むオブジェクト
 */
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

/**
 * リングとセグメント番号から表示用ラベルを生成
 *
 * @param ring - リング種類
 * @param segmentNumber - セグメント番号（1-20）
 * @returns ラベル文字列（例: "T20", "D16", "BULL", "25", "18", "OUT"）
 * @throws {Error} 無効なセグメント番号が渡された場合（BULL/OUT以外）
 */
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
