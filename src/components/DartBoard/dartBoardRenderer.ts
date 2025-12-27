/**
 * ダーツボード描画モジュール
 * p5.jsを使用してダーツボード全体を描画する
 */
import type p5Types from 'p5';
import {
  BOARD_PHYSICAL,
  DART_COLORS,
  DART_MARKER_RADII,
  DART_MARKER_TEXT_SIZE,
  LEGEND_LAYOUT,
  LEGEND_TEXT_SIZE,
  SEGMENT_ANGLE,
  SEGMENT_NUMBER_TEXT_SIZE,
  SEGMENTS,
} from '../../utils/constants/index.js';
import type { CoordinateTransform } from '../../utils/coordinateTransform';

/** 背景色（黒） */
const BACKGROUND_COLOR = 0;

/** セグメントの色 */
const SEGMENT_COLORS = {
  black: '#000000',
  beige: '#D4C5A9',
} as const;

/** リングの色 */
const RING_COLORS = {
  red: '#DC143C',
  green: '#228B22',
} as const;

/**
 * ボード全体を描画する（メイン関数）
 * 外側から内側へ、大きい要素から小さい要素へ単純に重ねる方式
 * 各エリアは「その半径の円全体」を描画し、次のエリアが上に重ねることで結果的にリング状になる
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawBoard(p5: p5Types, transform: CoordinateTransform): void {
  // 背景をクリア
  p5.background(BACKGROUND_COLOR);

  // 外側から内側へシンプルに重ねる
  drawDoubleRing(p5, transform); // ダブルリング（170mm円全体、赤/緑交互）
  drawOuterSingle(p5, transform); // アウターシングル（162mm円全体、黒/ベージュ交互）
  drawTripleRing(p5, transform); // トリプルリング（107mm円全体、赤/緑交互）
  drawInnerSingle(p5, transform); // インナーシングル（99mm円全体、黒/ベージュ交互）

  drawSpiderOuter(p5, transform); // 外側スパイダー（放射線 + リング境界）

  drawOuterBull(p5, transform); // アウターブル（半径7.95mm、緑）
  drawInnerBull(p5, transform); // インナーブル（半径3.175mm、赤）

  drawSpiderBull(p5, transform); // ブル用スパイダー（ブル境界の同心円）
  drawNumbers(p5, transform); // セグメント番号
}

/**
 * リングセグメントを描画する共通関数
 * 20個の扇形を指定された半径と色パターンで描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 * @param physicalRadius 物理座標での半径（mm）
 * @param colors 交互に使用する色（偶数インデックス、奇数インデックス）
 */
function drawRingSegments(
  p5: p5Types,
  transform: CoordinateTransform,
  physicalRadius: number,
  colors: { even: string; odd: string }
): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 物理座標から画面座標への変換
  const radius = transform.physicalDistanceToScreen(physicalRadius);

  // 共通の描画設定：noStroke()はループ外で一度だけ呼び出す
  p5.noStroke();

  // 20個のセグメントを描画
  SEGMENTS.forEach((_, index) => {
    // 開始角度と終了角度を計算
    // 真上（-π/2）から開始し、時計回りに回転
    const startAngle = -Math.PI / 2 + (index - 0.5) * SEGMENT_ANGLE;
    const endAngle = startAngle + SEGMENT_ANGLE;

    // 交互に色を変更
    const fillColor = index % 2 === 0 ? colors.even : colors.odd;

    // arc()を使って扇形を描画（PIEモード）
    p5.push();
    p5.translate(center.x, center.y);
    p5.fill(fillColor);
    p5.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle, p5.PIE);
    p5.pop();
  });
}

/**
 * ダブルリング（170mm円全体）を描画する
 * 20個の扇形を赤/緑交互に描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawDoubleRing(p5: p5Types, transform: CoordinateTransform): void {
  drawRingSegments(p5, transform, BOARD_PHYSICAL.rings.doubleOuter, {
    even: RING_COLORS.red,
    odd: RING_COLORS.green,
  });
}

/**
 * アウターシングル（162mm円全体）を描画する
 * 20個の扇形を黒/ベージュ交互に描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawOuterSingle(p5: p5Types, transform: CoordinateTransform): void {
  drawRingSegments(p5, transform, BOARD_PHYSICAL.rings.doubleInner, {
    even: SEGMENT_COLORS.black,
    odd: SEGMENT_COLORS.beige,
  });
}

/**
 * トリプルリング（107mm円全体）を描画する
 * 20個の扇形を赤/緑交互に描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawTripleRing(p5: p5Types, transform: CoordinateTransform): void {
  drawRingSegments(p5, transform, BOARD_PHYSICAL.rings.tripleOuter, {
    even: RING_COLORS.red,
    odd: RING_COLORS.green,
  });
}

/**
 * インナーシングル（99mm円全体）を描画する
 * 20個の扇形を黒/ベージュ交互に描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawInnerSingle(p5: p5Types, transform: CoordinateTransform): void {
  drawRingSegments(p5, transform, BOARD_PHYSICAL.rings.tripleInner, {
    even: SEGMENT_COLORS.black,
    odd: SEGMENT_COLORS.beige,
  });
}

/**
 * アウターブル（半径7.95mm、緑）を描画する
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawOuterBull(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 7.95mm円の半径（画面座標）
  const radius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.outerBull);

  // 緑色の円を描画
  p5.noStroke();
  p5.fill(RING_COLORS.green);
  p5.circle(center.x, center.y, radius * 2);
}

/**
 * インナーブル（半径3.175mm、赤）を描画する
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawInnerBull(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 3.175mm円の半径（画面座標）
  const radius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.innerBull);

  // 赤色の円を描画
  p5.noStroke();
  p5.fill(RING_COLORS.red);
  p5.circle(center.x, center.y, radius * 2);
}

/**
 * 外側スパイダー（放射線 + リング境界）を描画する
 * ブルエリアの色を塗る前に描画することで、色の被りを防ぐ
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawSpiderOuter(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // スパイダーの色（シルバー/グレー系）
  const spiderColor = '#C0C0C0';

  // === 放射線（セグメント境界）: 20本 ===
  // 物理座標の線幅を画面座標に変換
  const radialStrokeWidth = transform.physicalDistanceToScreen(BOARD_PHYSICAL.spider.radialWidth);
  const boardEdgeRadius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.boardEdge);

  p5.stroke(spiderColor);
  p5.strokeWeight(radialStrokeWidth);

  // 各セグメント境界に放射線を描画（20本）
  for (let i = 0; i < 20; i++) {
    // セグメント境界の角度を計算
    // 真上（-π/2）から時計回りに、各セグメントの境界に配置
    // (i - 0.5) を使ってセグメント0.5個分ずらすことで境界に配置
    const angle = -Math.PI / 2 + (i - 0.5) * SEGMENT_ANGLE;

    // 放射線の終点座標を計算（ボード端まで）
    const endX = center.x + boardEdgeRadius * Math.cos(angle);
    const endY = center.y + boardEdgeRadius * Math.sin(angle);

    // 中心から外側へ直線を描画
    p5.line(center.x, center.y, endX, endY);
  }

  // === リング境界の同心円（ダブル・トリプルの4本）===
  const circularStrokeWidth = transform.physicalDistanceToScreen(
    BOARD_PHYSICAL.spider.circularWidth
  );

  p5.stroke(spiderColor);
  p5.strokeWeight(circularStrokeWidth);
  p5.noFill();

  const outerRingRadii = [
    BOARD_PHYSICAL.rings.doubleOuter, // ダブル外側: 170mm
    BOARD_PHYSICAL.rings.doubleInner, // ダブル内側: 162mm
    BOARD_PHYSICAL.rings.tripleOuter, // トリプル外側: 107mm
    BOARD_PHYSICAL.rings.tripleInner, // トリプル内側: 99mm
  ];

  outerRingRadii.forEach((physicalRadius) => {
    const screenRadius = transform.physicalDistanceToScreen(physicalRadius);
    p5.circle(center.x, center.y, screenRadius * 2);
  });
}

/**
 * ブル用スパイダー（ブル境界の同心円）を描画する
 * アウターブル・インナーブルの色を塗った後に描画することで、正しく境界線が見える
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawSpiderBull(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // スパイダーの色（シルバー/グレー系）
  const spiderColor = '#C0C0C0';

  // === ブル境界の同心円（2本）===
  const circularStrokeWidth = transform.physicalDistanceToScreen(
    BOARD_PHYSICAL.spider.circularWidth
  );

  p5.stroke(spiderColor);
  p5.strokeWeight(circularStrokeWidth);
  p5.noFill();

  const bullRingRadii = [
    BOARD_PHYSICAL.rings.outerBull, // アウターブル: 7.95mm
    BOARD_PHYSICAL.rings.innerBull, // インナーブル: 3.175mm
  ];

  bullRingRadii.forEach((physicalRadius) => {
    const screenRadius = transform.physicalDistanceToScreen(physicalRadius);
    p5.circle(center.x, center.y, screenRadius * 2);
  });
}

/**
 * スパイダー（ワイヤー境界線）を描画する
 * 後方互換性のため、外側スパイダーとブル用スパイダーの両方を呼び出す
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 * @deprecated drawSpiderOuter と drawSpiderBull を個別に呼び出すことを推奨
 */
export function drawSpider(p5: p5Types, transform: CoordinateTransform): void {
  drawSpiderOuter(p5, transform);
  drawSpiderBull(p5, transform);
}

/**
 * セグメント番号を描画する
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawNumbers(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 配置半径（物理座標）: ダブルリング外側とボード端の中間
  const placementRadiusPhysical =
    (BOARD_PHYSICAL.rings.doubleOuter + BOARD_PHYSICAL.rings.boardEdge) / 2;

  // 物理座標から画面座標への変換
  const placementRadius = transform.physicalDistanceToScreen(placementRadiusPhysical);

  // テキストの描画設定
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.fill('#FFFFFF'); // 白色で明瞭に
  p5.noStroke();
  p5.textSize(SEGMENT_NUMBER_TEXT_SIZE);

  // 20個のセグメント番号を描画
  SEGMENTS.forEach((number, index) => {
    // 各セグメントの中央角度を計算
    // 真上（-π/2）から時計回りに、各セグメントの中央に配置
    const angle = -Math.PI / 2 + index * SEGMENT_ANGLE;

    // テキストの配置座標を計算
    const x = center.x + placementRadius * Math.cos(angle);
    const y = center.y + placementRadius * Math.sin(angle);

    // 番号を描画
    p5.text(number.toString(), x, y);
  });
}

/**
 * ダーツマーカー（投擲位置の印）を描画する
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 * @param coords 物理座標（mm単位）
 * @param color ダーツの色（例: '#FF6B6B'）
 * @param index ダーツの番号（0, 1, 2 → 表示は 1, 2, 3）
 */
export function drawDartMarker(
  p5: p5Types,
  transform: CoordinateTransform,
  coords: { x: number; y: number },
  color: string,
  index: number
): void {
  // 物理座標を画面座標に変換
  const screenPos = transform.physicalToScreen(coords.x, coords.y);

  // マーカーのサイズ（物理座標で定義）
  const outerRadiusPhysical = DART_MARKER_RADII.outer;
  const innerRadiusPhysical = DART_MARKER_RADII.inner;

  // 物理座標から画面座標への変換
  const outerRadius = transform.physicalDistanceToScreen(outerRadiusPhysical);
  const innerRadius = transform.physicalDistanceToScreen(innerRadiusPhysical);

  // 外側の円（色付き）を描画
  p5.noStroke();
  p5.fill(color);
  p5.circle(screenPos.x, screenPos.y, outerRadius * 2);

  // 内側の円（白）を描画
  p5.fill('#FFFFFF');
  p5.circle(screenPos.x, screenPos.y, innerRadius * 2);

  // 番号を描画（index + 1 を表示: 0→1, 1→2, 2→3）
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.fill('#000000'); // 黒色
  p5.noStroke();
  p5.textSize(DART_MARKER_TEXT_SIZE);
  p5.text((index + 1).toString(), screenPos.x, screenPos.y);
}

/**
 * ダーツマーカーの凡例を描画する（3投モード用）
 * @param p5 p5インスタンス
 * @param dartCount 表示するダーツの本数（0, 1, 2, 3）
 */
export function drawLegend(p5: p5Types, dartCount: number): void {
  // 表示条件: dartCountが0の場合は何も描画しない
  if (dartCount === 0) {
    return;
  }

  // ダーツの色配列
  const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];
  const dartLabels = ['1本目', '2本目', '3本目'];

  // 共通の描画設定
  p5.noStroke();

  // dartCountの数だけ凡例を描画（最大3本まで）
  const count = Math.min(dartCount, dartColors.length);
  for (let i = 0; i < count; i++) {
    // Y座標を計算
    const y = LEGEND_LAYOUT.topMargin + i * LEGEND_LAYOUT.lineHeight;

    // 色付き円を描画
    p5.fill(dartColors[i]);
    p5.circle(LEGEND_LAYOUT.leftMargin, y, LEGEND_LAYOUT.circleDiameter);

    // テキストを描画
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.fill('#FFFFFF'); // 白色
    p5.textSize(LEGEND_TEXT_SIZE);
    p5.text(
      dartLabels[i],
      LEGEND_LAYOUT.leftMargin + LEGEND_LAYOUT.circleDiameter / 2 + LEGEND_LAYOUT.textOffset,
      y
    );
  }
}
