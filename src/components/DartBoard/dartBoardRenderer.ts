/**
 * ダーツボード描画モジュール
 * p5.jsを使用してダーツボード全体を描画する
 */
import type p5Types from 'p5';
import { CoordinateTransform } from '../../utils/coordinateTransform';

/** 背景色（黒） */
const BACKGROUND_COLOR = 0;

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
 * @param _p5 p5インスタンス
 * @param _transform 座標変換インスタンス
 */
export function drawSegments(_p5: p5Types, _transform: CoordinateTransform): void {
  // TODO: セグメントの塗り分け描画を実装
  // 各セグメントを交互に黒とベージュで塗る
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
