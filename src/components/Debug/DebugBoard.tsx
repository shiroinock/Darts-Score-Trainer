/**
 * DebugBoard - クリック可能なダーツボード
 *
 * ダーツボードを描画し、クリック時に座標情報を親コンポーネントに通知します。
 */

import type p5Types from 'p5';
import { useRef } from 'react';
import Sketch from 'react-p5';
import { BOARD_PHYSICAL } from '../../utils/constants/index.js';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { coordinateToScoreDetail } from '../../utils/scoreCalculator/index.js';
import { drawBoard } from '../DartBoard/dartBoardRenderer';
import type { ClickInfo } from './DebugScreen';

/**
 * DebugBoardのプロパティ
 */
interface DebugBoardProps {
  /** ボードクリック時のコールバック */
  onBoardClick: (info: ClickInfo, canvas: { width: number; height: number; scale: number }) => void;
}

/**
 * クリックマーカーの色
 */
const CLICK_MARKER_COLOR = '#FF00FF'; // マゼンタ

/**
 * DebugBoardコンポーネント
 */
export function DebugBoard({ onBoardClick }: DebugBoardProps): JSX.Element {
  // CoordinateTransformインスタンスをuseRefで管理
  const transformRef = useRef<CoordinateTransform | null>(null);

  // 最後にクリックした位置（物理座標）
  const lastClickRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * setup関数 - 初期化時に1度だけ呼ばれる
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const setup = (p5: any, canvasParentRef: Element): void => {
    // キャンバスサイズを計算（正方形、ウィンドウの50%）
    const size = Math.min(p5.windowWidth * 0.5, p5.windowHeight * 0.7);

    // キャンバスを作成
    p5.createCanvas(size, size).parent(canvasParentRef);

    // CoordinateTransformインスタンスの初期化
    transformRef.current = new CoordinateTransform(size, size, BOARD_PHYSICAL.rings.boardEdge);
  };

  /**
   * draw関数 - 毎フレーム呼ばれる
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const draw = (p5: any): void => {
    if (!transformRef.current) return;

    const p5Instance = p5 as unknown as p5Types;

    // ダーツボード全体を描画
    drawBoard(p5Instance, transformRef.current);

    // クリックマーカーを描画
    if (lastClickRef.current) {
      const screenPos = transformRef.current.physicalToScreen(
        lastClickRef.current.x,
        lastClickRef.current.y
      );

      // マーカー描画
      p5Instance.noStroke();
      p5Instance.fill(CLICK_MARKER_COLOR);
      p5Instance.circle(screenPos.x, screenPos.y, 16);

      // 中心に白い点
      p5Instance.fill('#FFFFFF');
      p5Instance.circle(screenPos.x, screenPos.y, 6);
    }
  };

  /**
   * windowResized関数 - ウィンドウリサイズ時に呼ばれる
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const windowResized = (p5: any): void => {
    const size = Math.min(p5.windowWidth * 0.5, p5.windowHeight * 0.7);
    p5.resizeCanvas(size, size);

    if (transformRef.current) {
      transformRef.current.updateCanvasSize(size, size);
    }
  };

  /**
   * mouseClicked関数 - マウスクリック時に呼ばれる
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const mouseClicked = (p5: any): void => {
    if (!transformRef.current) return;

    // クリック位置がキャンバス内かチェック
    if (p5.mouseX < 0 || p5.mouseX > p5.width || p5.mouseY < 0 || p5.mouseY > p5.height) {
      return;
    }

    const screenX = p5.mouseX;
    const screenY = p5.mouseY;

    // 画面座標を物理座標に変換
    const physical = transformRef.current.screenToPhysical(screenX, screenY);

    // 物理座標から得点情報を計算
    const scoreDetail = coordinateToScoreDetail(physical.x, physical.y);

    // クリック位置を記録（マーカー表示用）
    lastClickRef.current = { x: physical.x, y: physical.y };

    // 親コンポーネントに通知
    onBoardClick(
      {
        screenX,
        screenY,
        physicalX: physical.x,
        physicalY: physical.y,
        detected: {
          segment: scoreDetail.segmentNumber,
          ring: scoreDetail.ring,
          score: scoreDetail.score,
        },
      },
      {
        width: p5.width,
        height: p5.height,
        scale: transformRef.current.getScale(),
      }
    );
  };

  return (
    <div className="debug-board">
      <Sketch setup={setup} draw={draw} windowResized={windowResized} mouseClicked={mouseClicked} />
      <p className="debug-board__hint">ボードをクリックして座標を確認</p>
    </div>
  );
}
