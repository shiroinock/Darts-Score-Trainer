/**
 * 中心からの距離（mm）からリング種類を判定
 *
 * @param distance - 中心からの距離（mm）
 * @returns リング種類
 * @throws {Error} 負の距離が渡された場合
 */

import { BOARD_PHYSICAL } from '../constants/index.js';
import type { RingType } from '../../types';

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
