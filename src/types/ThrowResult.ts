import type { Coordinates } from './Coordinates';
import type { RingType } from './RingType';
import type { Target } from './Target';

/**
 * 投擲結果
 *
 * 1本のダーツの投擲結果を表現します。
 * 物理座標での着地点、得点、詳細情報を含みます。
 */
export interface ThrowResult {
  /** 狙ったターゲット */
  target: Target;
  /** 着地点の物理座標（mm単位） */
  landingPoint: Coordinates;
  /** 獲得した点数 */
  score: number;
  /** 着地したリング種類（詳細情報用、オプション） */
  ring?: RingType;
  /** 着地したセグメント番号（1-20、詳細情報用、オプション） */
  segmentNumber?: number;
}
