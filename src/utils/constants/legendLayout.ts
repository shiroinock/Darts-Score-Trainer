/**
 * ダーツマーカー凡例のレイアウト設定（ピクセル単位）
 *
 * 3投モード時に表示されるダーツマーカーの凡例の配置とサイズを定義します。
 */
export const LEGEND_LAYOUT = {
  leftMargin: 20,       // px - 左マージン
  topMargin: 20,        // px - 上マージン
  lineHeight: 30,       // px - 行間
  circleDiameter: 12,   // px - 円の直径
  textOffset: 10        // px - 円とテキストの間隔
} as const;

/**
 * 凡例のテキストサイズ（ピクセル単位）
 *
 * ダーツマーカー凡例に表示されるラベル（「1本目」「2本目」「3本目」）のフォントサイズを定義します。
 */
export const LEGEND_TEXT_SIZE = 16;  // px - 凡例のテキストサイズ
