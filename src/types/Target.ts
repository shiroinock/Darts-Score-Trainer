import type { TargetType } from './TargetType';

/**
 * ターゲット情報
 *
 * プレイヤーが狙う位置を表現します。
 */
export interface Target {
  /** ターゲットの種類 */
  type: TargetType;
  /** セグメント番号（1-20）。Bullの場合はnull */
  number: number | null;
  /** 表示用ラベル（例: "T20", "D16", "BULL"） */
  label?: string;
}
