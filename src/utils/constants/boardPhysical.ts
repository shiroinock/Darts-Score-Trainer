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
