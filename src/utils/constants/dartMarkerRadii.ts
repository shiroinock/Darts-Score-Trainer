/**
 * ダーツマーカーの半径設定（物理座標、mm単位）
 *
 * ダーツの着弾位置をボード上に表示するマーカーの外側・内側円の半径を定義します。
 * ピン型マーカーとして、上部の円と下部の三角形で構成されます。
 */
export const DART_MARKER_RADII = {
  outer: 5, // mm - 外側の円の半径（ピンの上部）
  inner: 3, // mm - 内側の円の半径（ピンの上部）
  pinLength: 30, // mm - ピンの長さ（三角形の高さ）
} as const;

/**
 * ダーツマーカー表示座標の補正設定（物理座標、mm単位）
 *
 * スパイダー（ワイヤー）との重なりを回避するため、
 * 実際の着弾位置から表示位置を調整する際の設定値。
 */
export const DART_DISPLAY_ADJUSTMENT = {
  /** アウト（OUT）の表示半径（mm） */
  outRadius: 180,

  /** セグメント中心への引っ張り率（0-1、20%） */
  segmentCenterPullFactor: 0.2,
} as const;
