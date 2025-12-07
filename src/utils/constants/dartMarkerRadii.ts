/**
 * ダーツマーカーの半径設定（物理座標、mm単位）
 *
 * ダーツの着弾位置をボード上に表示するマーカーの外側・内側円の半径を定義します。
 */
export const DART_MARKER_RADII = {
  outer: 5,   // mm - 外側の円の半径
  inner: 3    // mm - 内側の円の半径
} as const;
