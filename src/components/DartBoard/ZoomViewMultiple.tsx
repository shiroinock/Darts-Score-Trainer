/**
 * ZoomViewMultiple - 3投モード用の複数ダーツ拡大表示コンポーネント
 *
 * 3つの独立したp5.js Sketchインスタンスを使用して、各ダーツの着地点を個別にズーム表示します。
 * デスクトップでは横並び（各160×160px）、モバイル（≤640px）では縦並び（各140×140px）でレスポンシブに対応します。
 */
import type p5Types from 'p5';
import { useEffect, useRef, useState } from 'react';
import Sketch from 'react-p5';
import type { Coordinates } from '../../types';
import { BOARD_PHYSICAL, DART_COLORS } from '../../utils/constants/index.js';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { getDisplayCoordinates } from '../../utils/displayCoordinates/index.js';
import { drawBoard, drawDartMarker } from './dartBoardRenderer';
import './ZoomViewMultiple.css';

/**
 * ZoomViewMultipleのプロパティ
 */
interface ZoomViewMultipleProps {
  /** ダーツ位置配列（物理座標、mm単位） */
  coords: Coordinates[];
  /** ダーツ数（0-3） */
  dartCount: number;
  /** 表示/非表示状態の配列 */
  visibleDarts: boolean[];
  /** ズーム倍率（デフォルト: 8.0） */
  zoomFactor?: number;
}

/**
 * SingleZoomのプロパティ
 */
interface SingleZoomProps {
  /** ダーツ位置（物理座標、mm単位） */
  coord: Coordinates;
  /** ダーツインデックス（0-2） */
  dartIndex: number;
  /** ズーム倍率 */
  zoomFactor: number;
  /** キャンバスサイズ */
  canvasSize: { width: number; height: number };
}

/** ズームビューのキャンバスサイズ（デスクトップ） */
export const ZOOM_CANVAS_SIZE_DESKTOP = {
  width: 160,
  height: 160,
} as const;

/** ズームビューのキャンバスサイズ（モバイル: 640px以下） */
export const ZOOM_CANVAS_SIZE_MOBILE = {
  width: 140,
  height: 140,
} as const;

/** デフォルトのズーム倍率 */
export const DEFAULT_ZOOM_FACTOR = 8.0;

/**
 * 画面幅に応じて適切なキャンバスサイズを取得
 */
function getCanvasSizeForScreenWidth(width: number): { width: number; height: number } {
  if (width <= 640) {
    return ZOOM_CANVAS_SIZE_MOBILE;
  }
  return ZOOM_CANVAS_SIZE_DESKTOP;
}

/**
 * SingleZoomコンポーネント - 単一ダーツのズームビュー
 */
function SingleZoom({ coord, dartIndex, zoomFactor, canvasSize }: SingleZoomProps): JSX.Element {
  // CoordinateTransformインスタンスをuseRefで管理
  const transformRef = useRef<CoordinateTransform | null>(null);

  /**
   * setup関数 - 初期化時に1度だけ呼ばれる
   * @param p5 p5インスタンス（react-p5の型制約によりany）
   * @param canvasParentRef キャンバスの親要素
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const setup = (p5: any, canvasParentRef: Element): void => {
    // キャンバスを作成
    p5.createCanvas(canvasSize.width, canvasSize.height).parent(canvasParentRef);

    // CoordinateTransformインスタンスの初期化
    // ズーム倍率を考慮した物理半径を使用
    const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
    transformRef.current = new CoordinateTransform(
      canvasSize.width,
      canvasSize.height,
      zoomedPhysicalRadius
    );
  };

  /**
   * draw関数 - 毎フレーム呼ばれる
   * @param p5 p5インスタンス（react-p5の型制約によりany）
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const draw = (p5: any): void => {
    // transformが初期化されていない場合は何もしない
    if (!transformRef.current) {
      console.warn('SingleZoom: CoordinateTransform is not initialized');
      return;
    }

    const p5Instance = p5 as unknown as p5Types;

    // キャンバス全体を保存
    p5Instance.push();

    // ズーム中心（ダーツ着地点）をキャンバス中心に移動
    const center = transformRef.current.getCenter();
    const zoomCenterScreen = transformRef.current.physicalToScreen(coord.x, coord.y);
    p5Instance.translate(center.x - zoomCenterScreen.x, center.y - zoomCenterScreen.y);

    // ダーツボード全体を描画（ズーム倍率適用済み）
    drawBoard(p5Instance, transformRef.current);

    // ダーツマーカーを描画
    const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];
    const displayCoord = getDisplayCoordinates(coord);
    drawDartMarker(
      p5Instance,
      transformRef.current,
      displayCoord,
      dartColors[dartIndex],
      dartIndex
    );

    // 状態を復元
    p5Instance.pop();
  };

  return (
    <div className="zoom-view-multiple__single">
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}

/**
 * ZoomViewMultipleコンポーネント
 * @param props ダーツ位置、ダーツ数、表示状態、ズーム倍率
 */
export function ZoomViewMultiple({
  coords,
  dartCount,
  visibleDarts,
  zoomFactor = DEFAULT_ZOOM_FACTOR,
}: ZoomViewMultipleProps): JSX.Element | null {
  // 現在のキャンバスサイズ
  const [canvasSize, setCanvasSize] = useState(() =>
    getCanvasSizeForScreenWidth(window.innerWidth)
  );

  // ウィンドウリサイズを監視してキャンバスサイズを更新
  useEffect(() => {
    const handleResize = (): void => {
      const newSize = getCanvasSizeForScreenWidth(window.innerWidth);
      setCanvasSize(newSize);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ダーツが投擲されていない場合は何も表示しない
  if (dartCount === 0 || coords.length === 0) {
    return null;
  }

  // 表示するダーツのインデックスを収集（最大3つ）
  const visibleIndices = coords
    .map((_, index) => index)
    .filter((index) => visibleDarts[index] !== false)
    .slice(0, 3);

  // 表示するダーツがない場合は何も表示しない
  if (visibleIndices.length === 0) {
    return null;
  }

  return (
    <section className="zoom-view-multiple" aria-label="3投のダーツ着地点のズームビュー">
      {visibleIndices.map((index) => (
        <SingleZoom
          key={index}
          coord={coords[index]}
          dartIndex={index}
          zoomFactor={zoomFactor}
          canvasSize={canvasSize}
        />
      ))}
    </section>
  );
}
