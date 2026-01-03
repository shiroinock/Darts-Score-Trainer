/**
 * 拡張ターゲット情報
 *
 * ダーツボード上のターゲット1つを表す詳細情報。
 * リング種別、セグメント番号、物理座標、ラベル、得点を含む。
 */

import type { RingType } from './RingType.js';

export interface ExpandedTarget {
  /** リング種別 */
  ringType: RingType;
  /** セグメント番号（1-20、BULLは0） */
  number: number;
  /** 物理座標X（mm単位） */
  x: number;
  /** 物理座標Y（mm単位） */
  y: number;
  /** ターゲットラベル（例: "T20", "D16", "BULL", "OS5"） */
  label: string;
  /** 得点 */
  score: number;
}
