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
import { coordinateToScoreDetail, getScoreLabel } from '../../utils/scoreCalculator/index.js';
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
  // デバッグ用: 前回ログ出力した座標を記録（重複出力防止）
  const lastLoggedCoordsRef = useRef<string>('');

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

    // デバッグ: 開発環境のみ、座標が変わった時にログを出力
    if (import.meta.env.DEV) {
      const coordsKey = JSON.stringify(coords);
      if (coordsKey !== lastLoggedCoordsRef.current && coords.length > 0) {
        lastLoggedCoordsRef.current = coordsKey;
        console.group('🎯 ダーツ描画デバッグ情報');
        console.log('キャンバスサイズ:', p5Instance.width, 'x', p5Instance.height);
        console.log('スケール (this.scale):', transformRef.current!.getScale());
        console.log('中心座標:', transformRef.current!.getCenter());

        coords.forEach((coord, index) => {
          const screenPos = transformRef.current!.physicalToScreen(coord.x, coord.y);
          const scoreDetail = coordinateToScoreDetail(coord.x, coord.y);
          const physicalDist = Math.sqrt(coord.x ** 2 + coord.y ** 2);

          console.group(`ダーツ ${index + 1}`);
          console.log('物理座標 (mm):', { x: coord.x.toFixed(2), y: coord.y.toFixed(2) });
          console.log('中心からの物理距離 (mm):', physicalDist.toFixed(2));
          console.log('画面座標 (px):', { x: screenPos.x.toFixed(2), y: screenPos.y.toFixed(2) });
          const label = getScoreLabel(scoreDetail.ring, scoreDetail.segmentNumber);
          console.log('計算されたスコア:', scoreDetail.score);
          console.log('リング種別:', scoreDetail.ring);
          console.log('セグメント番号:', scoreDetail.segmentNumber);
          console.log('ラベル:', label);
          console.groupEnd();
        });
        console.groupEnd();
      }
    }

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
