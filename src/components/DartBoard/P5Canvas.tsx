/**
 * P5Canvasコンポーネント
 * react-p5を使用したp5.jsキャンバスラッパー
 * ダーツボードの描画とダーツマーカーの表示を担当
 */
import type p5Types from 'p5';
import { useRef } from 'react';
import Sketch from 'react-p5';
import type { Coordinates } from '../../types';
import { BOARD_PHYSICAL, DART_COLORS } from '../../utils/constants/index.js';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { drawBoard, drawDartMarker, drawLegend } from './dartBoardRenderer';

/**
 * P5Canvasのプロパティ
 */
interface P5CanvasProps {
  /** ダーツ位置配列（物理座標、mm単位） */
  coords: Coordinates[];
  /** ダーツ数（凡例表示制御用、0-3） */
  dartCount: number;
}

/**
 * P5Canvasコンポーネント
 * @param props ダーツ位置とダーツ数
 */
export function P5Canvas({ coords, dartCount }: P5CanvasProps): JSX.Element {
  // CoordinateTransformインスタンスをuseRefで管理（描画間で保持）
  const transformRef = useRef<CoordinateTransform | null>(null);

  /**
   * setup関数 - 初期化時に1度だけ呼ばれる
   * @param p5 p5インスタンス（react-p5の型制約によりany）
   * @param canvasParentRef キャンバスの親要素
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const setup = (p5: any, canvasParentRef: Element): void => {
    // キャンバスサイズを計算（ボード全体が見えるように）
    const width = p5.windowWidth;
    const height = p5.windowHeight;

    // キャンバスを作成
    p5.createCanvas(width, height).parent(canvasParentRef);

    // CoordinateTransformインスタンスの初期化
    // BOARD_PHYSICAL.rings.boardEdge (225mm) がボードの物理半径
    transformRef.current = new CoordinateTransform(width, height, BOARD_PHYSICAL.rings.boardEdge);
  };

  /**
   * draw関数 - 毎フレーム呼ばれる
   * @param p5 p5インスタンス（react-p5の型制約によりany）
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const draw = (p5: any): void => {
    // transformが初期化されていない場合は何もしない
    if (!transformRef.current) {
      return;
    }

    // 内部ではp5Typesにキャストして型安全性を確保
    const p5Instance = p5 as unknown as p5Types;

    // ダーツボード全体を描画
    drawBoard(p5Instance, transformRef.current);

    // ダーツマーカーを描画
    const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];
    coords.forEach((coord, index) => {
      // 色配列の範囲内のみ描画
      if (index < dartColors.length) {
        drawDartMarker(p5Instance, transformRef.current!, coord, dartColors[index], index);
      }
    });

    // ダーツが3投の場合は凡例を描画
    if (dartCount === 3) {
      drawLegend(p5Instance, dartCount);
    }
  };

  /**
   * windowResized関数 - ウィンドウリサイズ時に呼ばれる
   * @param p5 p5インスタンス（react-p5の型制約によりany）
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const windowResized = (p5: any): void => {
    // キャンバスサイズを更新
    const width = p5.windowWidth;
    const height = p5.windowHeight;
    p5.resizeCanvas(width, height);

    // CoordinateTransformのキャンバスサイズを更新
    if (transformRef.current) {
      transformRef.current.updateCanvasSize(width, height);
    }
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
}
