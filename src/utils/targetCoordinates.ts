/**
 * Darts Score Trainer - ターゲット座標計算モジュール
 *
 * このファイルはターゲットの種類と番号から物理座標を計算する関数を提供します。
 */

import { SEGMENTS, SEGMENT_ANGLE, TARGET_RADII } from './constants';
import type { TargetType, Coordinates } from '../types';

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
export function getSegmentAngle(number: number): number {
  // 入力バリデーション
  if (!Number.isInteger(number) || number < 1 || number > 20) {
    throw new Error('Segment number must be an integer between 1 and 20');
  }

  // セグメント配列からインデックスを検索
  const segmentIndex = SEGMENTS.indexOf(number);
  if (segmentIndex === -1) {
    throw new Error(`Invalid segment number: ${number}`);
  }

  // セグメントの中心角度を計算
  // 真上（インデックス0、セグメント20）が0ラジアン
  // 時計回りに進む（インデックス1が SEGMENT_ANGLE、インデックス2が 2 * SEGMENT_ANGLE...）
  const angle = segmentIndex * SEGMENT_ANGLE;

  return angle;
}

/**
 * ターゲットの種類と番号から物理座標（mm単位）を取得
 *
 * @param targetType - ターゲットの種類（'SINGLE', 'DOUBLE', 'TRIPLE', 'BULL'）
 * @param number - セグメント番号（1-20）。BULLの場合はnull。
 * @returns 物理座標（mm単位）
 * @throws {Error} 無効な入力の場合
 */
export function getTargetCoordinates(
  targetType: TargetType,
  number: number | null
): Coordinates {
  // BULLの場合
  if (targetType === 'BULL') {
    if (number !== null) {
      throw new Error('BULL target must have number=null');
    }
    return { x: 0, y: 0 }; // ボード中心
  }

  // BULL以外の場合、numberは必須
  if (number === null) {
    throw new Error(`${targetType} target requires a segment number (1-20)`);
  }

  // セグメント角度を取得（バリデーションはgetSegmentAngleで行われる）
  const angle = getSegmentAngle(number);

  // ターゲットタイプに応じた半径を取得
  let radius: number;
  switch (targetType) {
    case 'SINGLE':
      // SINGLEはINNER_SINGLEエリアの中心を返す
      radius = TARGET_RADII.SINGLE_INNER;
      break;
    case 'DOUBLE':
      radius = TARGET_RADII.DOUBLE;
      break;
    case 'TRIPLE':
      radius = TARGET_RADII.TRIPLE;
      break;
    default:
      throw new Error(`Invalid target type: ${targetType}`);
  }

  // 極座標から直交座標に変換
  // ダーツボード座標系: 真上（Y軸負方向）が0ラジアン、時計回りが正
  // x = radius * sin(angle)
  // y = -radius * cos(angle)  (Y軸は下が正、上が負)
  const x = radius * Math.sin(angle);
  const y = -radius * Math.cos(angle);

  return { x, y };
}
