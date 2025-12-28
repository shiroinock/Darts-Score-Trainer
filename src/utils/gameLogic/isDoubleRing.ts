import type { RingType } from '../../types';

/**
 * リングがダブルとして扱われるか判定
 * ダーツの01ゲームでは、DOUBLE リングと INNER_BULL がダブルアウトの条件を満たす
 * @param ring リング種別
 * @returns ダブルの場合true
 */
export function isDoubleRing(ring: RingType | null | undefined): boolean {
  return ring === 'DOUBLE' || ring === 'INNER_BULL';
}
