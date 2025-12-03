/**
 * DartBoardコンポーネント
 * P5Canvasをラップし、レスポンシブなサイズ計算と表示を担当
 */
import { useEffect, useState } from 'react';
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
 * ウィンドウサイズから適切なキャンバスサイズを計算
 * 正方形のキャンバスを維持し、マージンを考慮
 * @param windowWidth ウィンドウ幅
 * @param windowHeight ウィンドウ高さ
 * @returns キャンバスサイズ（幅と高さは同じ）
 */
function calculateCanvasSize(windowWidth: number, windowHeight: number): number {
  // マージンを考慮（各辺に20pxのマージン）
  const MARGIN = 40;
  const availableWidth = windowWidth - MARGIN;
  const availableHeight = windowHeight - MARGIN;

  // 幅と高さの小さい方を使用して正方形を維持
  return Math.min(availableWidth, availableHeight);
}

/**
 * DartBoardコンポーネント
 * @param props ダーツ位置とダーツ数
 */
export function DartBoard({ coords, dartCount }: DartBoardProps): JSX.Element {
  // ウィンドウサイズの状態管理
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // ウィンドウリサイズ時のハンドラー
  useEffect(() => {
    const handleResize = (): void => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // リサイズイベントリスナーを登録
    window.addEventListener('resize', handleResize);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // キャンバスサイズを計算
  const canvasSize = calculateCanvasSize(windowSize.width, windowSize.height);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
      }}
    >
      <div
        style={{
          width: canvasSize,
          height: canvasSize,
        }}
      >
        <P5Canvas coords={coords} dartCount={dartCount} />
      </div>
    </div>
  );
}
