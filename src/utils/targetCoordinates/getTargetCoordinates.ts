/**
 * ターゲットの種類と番号から物理座標（mm単位）を取得
 *
 * @param targetType - ターゲットの種類（'SINGLE', 'DOUBLE', 'TRIPLE', 'BULL'）
 * @param number - セグメント番号（1-20）。BULLの場合はnull。
 * @returns 物理座標（mm単位）
 * @throws {Error} 無効な入力の場合
 */

import type { Coordinates, TargetType } from '../../types/index.js';
import { TARGET_RADII } from '../constants/index.js';
import { getSegmentAngle } from './getSegmentAngle.js';

export function getTargetCoordinates(targetType: TargetType, number: number | null): Coordinates {
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
