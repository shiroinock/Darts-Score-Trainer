/**
 * ダーツボード描画モジュール
 * p5.jsを使用してダーツボード全体を描画する
 */
import type p5Types from 'p5';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { SEGMENTS, SEGMENT_ANGLE, BOARD_PHYSICAL } from '../../utils/constants';

/** 背景色（黒） */
const BACKGROUND_COLOR = 0;

/** セグメントの色 */
const SEGMENT_COLORS = {
  black: '#000000',
  beige: '#D4C5A9'
} as const;

/** リングの色 */
const RING_COLORS = {
  red: '#DC143C',
  green: '#228B22'
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
  drawDoubleRing(p5, transform);     // ダブルリング（170mm円全体、赤/緑交互）
  drawOuterSingle(p5, transform);    // アウターシングル（162mm円全体、黒/ベージュ交互）
  drawTripleRing(p5, transform);     // トリプルリング（107mm円全体、赤/緑交互）
  drawInnerSingle(p5, transform);    // インナーシングル（99mm円全体、黒/ベージュ交互）
  drawOuterBull(p5, transform);      // アウターブル（半径7.95mm、緑）
  drawInnerBull(p5, transform);      // インナーブル（半径3.175mm、赤）

  drawSpider(p5, transform);         // スパイダー（ワイヤー境界線）
  drawNumbers(p5, transform);        // セグメント番号
}

/**
 * ダブルリング（170mm円全体）を描画する
 * 20個の扇形を赤/緑交互に描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawDoubleRing(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 170mm円の半径（画面座標）
  const radius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.doubleOuter);

  // 共通の描画設定：noStroke()はループ外で一度だけ呼び出す
  p5.noStroke();

  // 20個のセグメントを描画
  SEGMENTS.forEach((_, index) => {
    // 開始角度と終了角度を計算
    // 真上（-π/2）から開始し、時計回りに回転
    const startAngle = -Math.PI / 2 + (index - 0.5) * SEGMENT_ANGLE;
    const endAngle = startAngle + SEGMENT_ANGLE;

    // 交互に色を変更（偶数: 赤、奇数: 緑）
    const fillColor = index % 2 === 0 ? RING_COLORS.red : RING_COLORS.green;

    // arc()を使って扇形を描画（PIEモード）
    p5.push();
    p5.translate(center.x, center.y);
    p5.fill(fillColor);
    p5.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle, p5.PIE);
    p5.pop();
  });
}

/**
 * アウターシングル（162mm円全体）を描画する
 * 20個の扇形を黒/ベージュ交互に描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawOuterSingle(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 162mm円の半径（画面座標）
  const radius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.doubleInner);

  // 共通の描画設定：noStroke()はループ外で一度だけ呼び出す
  p5.noStroke();

  // 20個のセグメントを描画
  SEGMENTS.forEach((_, index) => {
    // 開始角度と終了角度を計算
    // 真上（-π/2）から開始し、時計回りに回転
    const startAngle = -Math.PI / 2 + (index - 0.5) * SEGMENT_ANGLE;
    const endAngle = startAngle + SEGMENT_ANGLE;

    // 交互に色を変更（偶数: 黒、奇数: ベージュ）
    const fillColor = index % 2 === 0 ? SEGMENT_COLORS.black : SEGMENT_COLORS.beige;

    // arc()を使って扇形を描画（PIEモード）
    p5.push();
    p5.translate(center.x, center.y);
    p5.fill(fillColor);
    p5.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle, p5.PIE);
    p5.pop();
  });
}

/**
 * トリプルリング（107mm円全体）を描画する
 * 20個の扇形を赤/緑交互に描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawTripleRing(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 107mm円の半径（画面座標）
  const radius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.tripleOuter);

  // 共通の描画設定：noStroke()はループ外で一度だけ呼び出す
  p5.noStroke();

  // 20個のセグメントを描画
  SEGMENTS.forEach((_, index) => {
    // 開始角度と終了角度を計算
    // 真上（-π/2）から開始し、時計回りに回転
    const startAngle = -Math.PI / 2 + (index - 0.5) * SEGMENT_ANGLE;
    const endAngle = startAngle + SEGMENT_ANGLE;

    // 交互に色を変更（偶数: 赤、奇数: 緑）
    const fillColor = index % 2 === 0 ? RING_COLORS.red : RING_COLORS.green;

    // arc()を使って扇形を描画（PIEモード）
    p5.push();
    p5.translate(center.x, center.y);
    p5.fill(fillColor);
    p5.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle, p5.PIE);
    p5.pop();
  });
}

/**
 * インナーシングル（99mm円全体）を描画する
 * 20個の扇形を黒/ベージュ交互に描画
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawInnerSingle(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 99mm円の半径（画面座標）
  const radius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.tripleInner);

  // 共通の描画設定：noStroke()はループ外で一度だけ呼び出す
  p5.noStroke();

  // 20個のセグメントを描画
  SEGMENTS.forEach((_, index) => {
    // 開始角度と終了角度を計算
    // 真上（-π/2）から開始し、時計回りに回転
    const startAngle = -Math.PI / 2 + (index - 0.5) * SEGMENT_ANGLE;
    const endAngle = startAngle + SEGMENT_ANGLE;

    // 交互に色を変更（偶数: 黒、奇数: ベージュ）
    const fillColor = index % 2 === 0 ? SEGMENT_COLORS.black : SEGMENT_COLORS.beige;

    // arc()を使って扇形を描画（PIEモード）
    p5.push();
    p5.translate(center.x, center.y);
    p5.fill(fillColor);
    p5.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle, p5.PIE);
    p5.pop();
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
 * スパイダー（ワイヤー境界線）を描画する
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawSpider(p5: p5Types, transform: CoordinateTransform): void {
  // TODO: ワイヤー（境界線）の描画を実装
  // 放射線: 20本（セグメント境界）
  // 同心円: 5本（ダブル外側、ダブル内側、トリプル外側、トリプル内側、アウターブル）
  void p5;
  void transform;
}

/**
 * セグメント番号を描画する
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawNumbers(p5: p5Types, transform: CoordinateTransform): void {
  // TODO: セグメント番号の描画を実装
  // 配置半径: ダブルリング外側とボード端の中間（約197.5mm）
  // [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
  void p5;
  void transform;
}
