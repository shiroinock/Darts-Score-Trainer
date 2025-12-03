/**
 * Darts Score Trainer - 定数定義
 *
 * このファイルはプロジェクト全体で使用される定数を定義します。
 * 物理座標はmm単位で統一されています。
 */

/**
 * ダーツボードの物理仕様（13.2インチ スティールチップ）
 *
 * すべての値はmm単位で定義されています。
 * - rings: 各リング・エリアの半径
 * - spider: ワイヤー（スパイダー）の幅
 * - segments: セグメント番号の配列（真上20から時計回り）
 */
export const BOARD_PHYSICAL = {
  rings: {
    innerBull: 6.35,       // mm - インナーブル（50点）の半径（直径12.7mm）
    outerBull: 16,         // mm - アウターブル（25点）の半径（直径32mm）
    tripleInner: 99,       // mm - トリプルリング内側の半径
    tripleOuter: 107,      // mm - トリプルリング外側の半径
    doubleInner: 162,      // mm - ダブルリング内側の半径
    doubleOuter: 170,      // mm - ダブルリング外側の半径
    boardEdge: 225         // mm - ボード端（有効エリアの限界）
  },
  spider: {
    radialWidth: 1.5,      // mm - 放射状スパイダー（セグメント境界）の幅
    circularWidth: 1.0     // mm - 円形スパイダー（リング境界）の幅
  },
  segments: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
} as const;

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
  TRIPLE: 103,           // (99 + 107) / 2
  DOUBLE: 166,           // (162 + 170) / 2
  SINGLE_INNER: 57.5,    // (16 + 99) / 2
  SINGLE_OUTER: 134.5,   // (107 + 162) / 2
  BULL: 0                // 中心 (0, 0)
} as const;

/**
 * プレイヤーの実力レベル別の標準偏差設定
 *
 * 投擲シミュレーションで使用する散らばり（標準偏差）をmm単位で定義します。
 * 値が小さいほど精度が高く、ターゲットに近い位置に着弾します。
 */
export const DIFFICULTY_PRESETS = {
  beginner: {
    label: '初心者',
    stdDevMM: 50         // 初心者レベルの標準偏差（広い散らばり）
  },
  intermediate: {
    label: '中級者',
    stdDevMM: 30         // 中級者レベルの標準偏差
  },
  advanced: {
    label: '上級者',
    stdDevMM: 15         // 上級者レベルの標準偏差
  },
  expert: {
    label: 'エキスパート',
    stdDevMM: 8          // エキスパートレベルの標準偏差（狭い散らばり）
  }
} as const;

/**
 * セッションの問題数モード選択肢
 *
 * ユーザーが選択できる問題数の選択肢を定義します。
 */
export const SESSION_QUESTION_COUNTS = [10, 20, 50, 100] as const;

/**
 * セッションの時間制限モード選択肢（分）
 *
 * ユーザーが選択できる時間制限の選択肢を分単位で定義します。
 */
export const SESSION_TIME_LIMITS = [3, 5, 10] as const;

/**
 * ダーツマーカーの色設定
 *
 * 3投モードでダーツボード上に表示するマーカーの色を定義します。
 * - first: 1本目のダーツ（赤系）
 * - second: 2本目のダーツ（青緑系）
 * - third: 3本目のダーツ（黄系）
 */
export const DART_COLORS = {
  first: '#FF6B6B',   // 1本目: 赤系
  second: '#4ECDC4',  // 2本目: 青緑系
  third: '#FFE66D'    // 3本目: 黄系
} as const;

/**
 * 正誤フィードバックのアイコン
 *
 * ユーザーの回答に対するフィードバック表示に使用するアイコンを定義します。
 */
export const FEEDBACK_ICONS = {
  correct: '✓',       // 正解アイコン
  incorrect: '✗'      // 不正解アイコン
} as const;

/**
 * localStorage保存キー
 *
 * ユーザー設定をlocalStorageに保存する際のキーを定義します。
 */
export const STORAGE_KEY = 'darts-score-trainer-settings';

/**
 * 各セグメントの角度（ラジアン）
 *
 * ダーツボードは20個のセグメントに分割されており、
 * 各セグメントは18度（π/10ラジアン）の角度を持ちます。
 */
export const SEGMENT_ANGLE = Math.PI / 10;  // 18度 = π/10ラジアン

/**
 * セグメント番号の配列
 *
 * ダーツボードのセグメント配置を定義します。
 * 真上（12時の位置）の20から時計回りに配置されています。
 */
export const SEGMENTS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5] as const;

/**
 * ダーツマーカーの半径設定（物理座標、mm単位）
 *
 * ダーツの着弾位置をボード上に表示するマーカーの外側・内側円の半径を定義します。
 */
export const DART_MARKER_RADII = {
  outer: 5,   // mm - 外側の円の半径
  inner: 3    // mm - 内側の円の半径
} as const;

/**
 * ダーツマーカーのテキストサイズ（ピクセル単位）
 *
 * マーカー上に表示されるダーツ番号（1, 2, 3）のフォントサイズを定義します。
 */
export const DART_MARKER_TEXT_SIZE = 12;  // px - マーカーの番号テキストサイズ

/**
 * セグメント番号のテキストサイズ（ピクセル単位）
 *
 * ダーツボード周辺に表示されるセグメント番号（20, 1, 18...）のフォントサイズを定義します。
 */
export const SEGMENT_NUMBER_TEXT_SIZE = 20;  // px - セグメント番号のテキストサイズ

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
