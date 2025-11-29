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

/**
 * ボード全体を描画する（メイン関数）
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawBoard(p5: p5Types, transform: CoordinateTransform): void {
  // 背景をクリア
  p5.background(BACKGROUND_COLOR);

  // 描画順序に従って各要素を描画
  drawSegments(p5, transform);
  drawRings(p5, transform);
  drawBull(p5, transform);
  drawSpider(p5, transform);
  drawNumbers(p5, transform);
}

/**
 * セグメント（20の扇形エリア）を描画する
 * @param p5 p5インスタンス
 * @param transform 座標変換インスタンス
 */
export function drawSegments(p5: p5Types, transform: CoordinateTransform): void {
  // ボード中心の画面座標を取得
  const center = transform.getCenter();

  // 各セグメントの半径（画面座標）
  const innerRadius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.outerBull);
  const outerRadius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.boardEdge);

  // 20個のセグメントを描画
  SEGMENTS.forEach((_, index) => {
    // 開始角度と終了角度を計算
    // 真上（-π/2）から開始し、時計回りに回転
    // 最初のセグメントは-π/2 - π/10から-π/2 + π/10まで（中心が真上になるように）
    const startAngle = -Math.PI / 2 + (index - 0.5) * SEGMENT_ANGLE;
    const endAngle = startAngle + SEGMENT_ANGLE;

    // 交互に色を変更（偶数: 黒、奇数: ベージュ）
    const fillColor = index % 2 === 0 ? SEGMENT_COLORS.black : SEGMENT_COLORS.beige;

    // p5.jsで扇形を描画
    p5.fill(fillColor);
    p5.noStroke();

    // arc()を使って扇形を描画
    // PIE モードで内側と外側の半径を指定した円環扇形を描画
    p5.push();
    p5.translate(center.x, center.y);

    // 外側の扇形を描画
    p5.arc(0, 0, outerRadius * 2, outerRadius * 2, startAngle, endAngle, p5.PIE);

    // 内側の円（ブル部分）を背景色で塗りつぶして除外
    p5.fill(BACKGROUND_COLOR);
    p5.arc(0, 0, innerRadius * 2, innerRadius * 2, startAngle, endAngle, p5.PIE);

    p5.pop();
  });
}

/**
 * リング（トリプル、ダブル）を描画する
 * @param _p5 p5インスタンス
 * @param _transform 座標変換インスタンス
 */
export function drawRings(_p5: p5Types, _transform: CoordinateTransform): void {
  // TODO: トリプルリングとダブルリングの描画を実装
  // トリプル: 99-107mm（赤と緑）
  // ダブル: 162-170mm（赤と緑）
}

/**
 * ブル（インナーブル、アウターブル）を描画する
 * @param _p5 p5インスタンス
 * @param _transform 座標変換インスタンス
 */
export function drawBull(_p5: p5Types, _transform: CoordinateTransform): void {
  // TODO: ブルエリアの描画を実装
  // インナーブル: 半径3.175mm（赤）
  // アウターブル: 半径7.95mm（緑）
}

/**
 * スパイダー（ワイヤー）を描画する
 * @param _p5 p5インスタンス
 * @param _transform 座標変換インスタンス
 */
export function drawSpider(_p5: p5Types, _transform: CoordinateTransform): void {
  // TODO: ワイヤー（境界線）の描画を実装
  // セグメント境界の放射線とリング境界の同心円
}

/**
 * セグメント番号を描画する
 * @param _p5 p5インスタンス
 * @param _transform 座標変換インスタンス
 */
export function drawNumbers(_p5: p5Types, _transform: CoordinateTransform): void {
  // TODO: セグメント番号の描画を実装
  // [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
}
