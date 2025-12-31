/**
 * DartBoardコンポーネント
 * P5Canvasをラップし、レスポンシブなサイズ計算と表示を担当
 */
import { useEffect, useRef, useState } from 'react';
import type { Coordinates } from '../../types';
import { P5Canvas } from './P5Canvas';

/**
 * DartBoardのプロパティ
 */
interface DartBoardProps {
  /** ダーツ位置配列（物理座標、mm単位） */
  coords: Coordinates[];
  /** ダーツ数（凡例表示制御用、0-3） */
  dartCount: number;
}

/**
 * コンテナサイズから適切なキャンバスサイズを計算
 * 正方形のキャンバスを維持し、マージンを考慮
 * @param containerWidth コンテナ幅
 * @param containerHeight コンテナ高さ
 * @returns キャンバスサイズ（幅と高さは同じ）
 */
function calculateCanvasSize(containerWidth: number, containerHeight: number): number {
  // マージンを考慮（各辺に20pxのマージン）
  const MARGIN = 40;
  const availableWidth = containerWidth - MARGIN;
  const availableHeight = containerHeight - MARGIN;

  // 幅と高さの小さい方を使用して正方形を維持
  return Math.min(availableWidth, availableHeight);
}

/**
 * DartBoardコンポーネント
 * @param props ダーツ位置とダーツ数
 */
export function DartBoard({ coords, dartCount }: DartBoardProps): JSX.Element {
  // 親コンテナへの参照
  const containerRef = useRef<HTMLDivElement>(null);

  // コンテナサイズの状態管理
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  // ResizeObserverで親コンテナのサイズを監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // 初期サイズを設定
    const updateSize = (): void => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    // ResizeObserverを使用してコンテナサイズの変更を監視
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    // 初回実行
    updateSize();

    // クリーンアップ
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // キャンバスサイズを計算
  const canvasSize = calculateCanvasSize(containerSize.width, containerSize.height);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      {canvasSize > 0 && (
        <div
          style={{
            width: canvasSize,
            height: canvasSize,
          }}
        >
          <P5Canvas coords={coords} dartCount={dartCount} width={canvasSize} height={canvasSize} />
        </div>
      )}
    </div>
  );
}
