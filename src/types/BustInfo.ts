/**
 * バスト情報
 *
 * 01ゲームにおけるバスト判定の結果を保持します。
 */
export interface BustInfo {
  /** バストしたかどうか */
  isBust: boolean;
  /** バストの理由（バストした場合のみ） */
  reason: 'over' | 'finish_impossible' | 'double_out_required' | null;
}
