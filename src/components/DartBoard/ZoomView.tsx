/**
 * ZoomView - ダーツ着地点の拡大表示コンポーネント
 *
 * ダーツ着地点を中心に8倍ズーム表示し、スパイダーラインとダーツの位置関係を明確に表示します。
 * モバイルファーストのレスポンシブデザインで、タッチ/クリックでズーム中心を変更可能です。
 */
import type p5Types from 'p5';
import { useEffect, useRef, useState } from 'react';
import Sketch from 'react-p5';
import type { Coordinates } from '../../types';
import { BOARD_PHYSICAL, DART_COLORS } from '../../utils/constants/index.js';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { getDisplayCoordinates } from '../../utils/displayCoordinates/index.js';
import { drawBoard, drawDartMarker } from './dartBoardRenderer';
import './ZoomView.css';

/**
 * ZoomViewのプロパティ
 */
interface ZoomViewProps {
  /** ダーツ位置配列（物理座標、mm単位） */
  coords: Coordinates[];
  /** ダーツ数（0-3） */
  dartCount: number;
  /** 表示/非表示状態の配列 */
  visibleDarts: boolean[];
  /** ズーム倍率（デフォルト: 8.0） */
  zoomFactor?: number;
}

/** ズームビューのキャンバスサイズ（デスクトップ） */
const ZOOM_CANVAS_SIZE_DESKTOP = {
  width: 280,
  height: 280,
} as const;

/** ズームビューのキャンバスサイズ（タブレット: 640px以下） */
const ZOOM_CANVAS_SIZE_TABLET = {
  width: 220,
  height: 220,
} as const;

/** ズームビューのキャンバスサイズ（モバイル: 480px以下） */
const ZOOM_CANVAS_SIZE_MOBILE = {
  width: 160,
  height: 160,
} as const;

/** デフォルトのズーム倍率 */
const DEFAULT_ZOOM_FACTOR = 8.0;

/**
 * 画面幅に応じて適切なキャンバスサイズを取得
 */
function getCanvasSizeForScreenWidth(width: number): { width: number; height: number } {
  if (width <= 480) {
    return ZOOM_CANVAS_SIZE_MOBILE;
  }
  if (width <= 640) {
    return ZOOM_CANVAS_SIZE_TABLET;
  }
  return ZOOM_CANVAS_SIZE_DESKTOP;
}

/**
 * ZoomViewコンポーネント
 * @param props ダーツ位置、ダーツ数、表示状態、ズーム倍率
 */
export function ZoomView({
  coords,
  dartCount,
  visibleDarts,
  zoomFactor = DEFAULT_ZOOM_FACTOR,
}: ZoomViewProps): JSX.Element | null {
  // p5インスタンスをuseRefで管理
  const p5InstanceRef = useRef<p5Types | null>(null);
  // CoordinateTransformインスタンスをuseRefで管理
  const transformRef = useRef<CoordinateTransform | null>(null);
  // ズーム中心座標（物理座標、mm単位）
  const [zoomCenter, setZoomCenter] = useState<Coordinates>({ x: 0, y: 0 });
  // 現在のキャンバスサイズ
  const [canvasSize, setCanvasSize] = useState(() =>
    getCanvasSizeForScreenWidth(window.innerWidth)
  );

  /**
   * setup関数 - 初期化時に1度だけ呼ばれる
   * @param p5 p5インスタンス（react-p5の型制約によりany）
   * @param canvasParentRef キャンバスの親要素
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const setup = (p5: any, canvasParentRef: Element): void => {
    // p5インスタンスを保存
    p5InstanceRef.current = p5 as unknown as p5Types;

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
      return;
    }

    const p5Instance = p5 as unknown as p5Types;

    // キャンバス全体を保存
    p5Instance.push();

    // ズーム中心をキャンバス中心に移動
    const center = transformRef.current.getCenter();
    const zoomCenterScreen = transformRef.current.physicalToScreen(zoomCenter.x, zoomCenter.y);
    p5Instance.translate(center.x - zoomCenterScreen.x, center.y - zoomCenterScreen.y);

    // ダーツボード全体を描画（ズーム倍率適用済み）
    drawBoard(p5Instance, transformRef.current);

    // ダーツマーカーを描画
    const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];

    coords.forEach((coord, index) => {
      // 色配列の範囲内かつ表示状態の場合のみ描画
      const isVisible = visibleDarts[index] !== false;
      if (index < dartColors.length && isVisible) {
        // 実際の着地座標から表示座標を計算
        const displayCoord = getDisplayCoordinates(coord);
        drawDartMarker(p5Instance, transformRef.current!, displayCoord, dartColors[index], index);
      }
    });

    // 状態を復元
    p5Instance.pop();
  };

  /**
   * mousePressed関数 - マウスクリック時に呼ばれる
   * クリック位置をズーム中心として設定
   * @param p5 p5インスタンス（react-p5の型制約によりany）
   */
  // biome-ignore lint/suspicious/noExplicitAny: react-p5の型定義の制限
  const mousePressed = (p5: any): void => {
    if (!transformRef.current) {
      return;
    }

    const p5Instance = p5 as unknown as p5Types;
    const mouseX = p5Instance.mouseX;
    const mouseY = p5Instance.mouseY;

    // キャンバス外のクリックは無視
    if (mouseX < 0 || mouseX > canvasSize.width || mouseY < 0 || mouseY > canvasSize.height) {
      return;
    }

    // クリック位置をズーム中心の物理座標に変換
    const center = transformRef.current.getCenter();
    const zoomCenterScreen = transformRef.current.physicalToScreen(zoomCenter.x, zoomCenter.y);
    const offsetX = center.x - zoomCenterScreen.x;
    const offsetY = center.y - zoomCenterScreen.y;
    const clickedPhysical = transformRef.current.screenToPhysical(
      mouseX - offsetX,
      mouseY - offsetY
    );

    setZoomCenter(clickedPhysical);
  };

  // ウィンドウリサイズを監視してキャンバスサイズを更新
  useEffect(() => {
    const handleResize = (): void => {
      const newSize = getCanvasSizeForScreenWidth(window.innerWidth);
      setCanvasSize(newSize);

      // p5インスタンスとtransformが存在する場合、キャンバスをリサイズ
      const p5Instance = p5InstanceRef.current;
      if (p5Instance) {
        p5Instance.resizeCanvas(newSize.width, newSize.height);
      }

      if (transformRef.current) {
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        transformRef.current = new CoordinateTransform(
          newSize.width,
          newSize.height,
          zoomedPhysicalRadius
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [zoomFactor]);

  // ダーツ座標が変更されたら、最初の表示中のダーツを中心にズーム
  useEffect(() => {
    if (coords.length === 0) {
      return;
    }

    // 表示中の最初のダーツを見つける
    const firstVisibleIndex = coords.findIndex((_, index) => visibleDarts[index] !== false);
    if (firstVisibleIndex === -1) {
      // 全て非表示の場合は最初のダーツを中心にする
      setZoomCenter(coords[0]);
    } else {
      setZoomCenter(coords[firstVisibleIndex]);
    }
  }, [coords, visibleDarts]);

  // ダーツが投擲されていない場合は何も表示しない
  if (dartCount === 0 || coords.length === 0) {
    return null;
  }

  return (
    <div className="zoom-view" title="クリックでズーム位置を変更">
      <Sketch setup={setup} draw={draw} mousePressed={mousePressed} />
    </div>
  );
}
