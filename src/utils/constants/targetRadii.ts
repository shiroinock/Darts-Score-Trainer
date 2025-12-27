/**
 * 各ターゲットタイプの中央半径（mm単位）
 *
 * 投擲シミュレーション時のターゲット座標計算に使用します。
 * - TRIPLE: トリプルリングの中央半径
 * - DOUBLE: ダブルリングの中央半径
 * - SINGLE_INNER: 内側シングルエリアの中央半径
 * - SINGLE_OUTER: 外側シングルエリアの中央半径
 * - BULL: ブルの中心（原点）
 */
export const TARGET_RADII = {
  TRIPLE: 103, // (99 + 107) / 2
  DOUBLE: 166, // (162 + 170) / 2
  SINGLE_INNER: 57.5, // (16 + 99) / 2
  SINGLE_OUTER: 134.5, // (107 + 162) / 2
  BULL: 0, // 中心 (0, 0)
} as const;
