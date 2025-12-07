/**
 * ダーツボードのリング種類
 */
export type RingType =
  | 'INNER_BULL'      // インナーブル（50点）
  | 'OUTER_BULL'      // アウターブル（25点）
  | 'TRIPLE'          // トリプルリング（3倍）
  | 'DOUBLE'          // ダブルリング（2倍）
  | 'INNER_SINGLE'    // 内側シングルエリア（1倍）
  | 'OUTER_SINGLE'    // 外側シングルエリア（1倍）
  | 'OUT';            // ボード外（0点）
