/**
 * DartBoardコンポーネントのテスト
 * ResizeObserverによるコンテナサイズ監視、レスポンシブサイズ計算、P5Canvasへのprops転送を検証
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Coordinates } from '../../types';
import { DartBoard } from './DartBoard';

// P5Canvasコンポーネントをモック化
vi.mock('./P5Canvas', () => ({
  P5Canvas: ({
    coords,
    dartCount,
    width,
    height,
  }: {
    coords: Coordinates[];
    dartCount: number;
    width: number;
    height: number;
  }) => (
    <div
      data-testid="mock-p5-canvas"
      data-coords={JSON.stringify(coords)}
      data-dart-count={dartCount}
      data-width={width}
      data-height={height}
    >
      Mock P5Canvas ({width}x{height})
    </div>
  ),
}));

describe('DartBoard', () => {
  // ResizeObserverのモック
  let resizeObserverCallback: ResizeObserverCallback;
  let observedElements: Element[] = [];

  // ResizeObserverのモック実装
  class ResizeObserverMock {
    constructor(callback: ResizeObserverCallback) {
      resizeObserverCallback = callback;
    }

    observe(target: Element): void {
      observedElements.push(target);
    }

    unobserve(): void {
      // モック実装
    }

    disconnect(): void {
      observedElements = [];
    }
  }

  beforeEach(() => {
    // ResizeObserverをモック化
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
    observedElements = [];

    // モックをクリア
    vi.clearAllMocks();
  });

  afterEach(() => {
    // クリーンアップ
    vi.restoreAllMocks();
  });

  /**
   * ResizeObserverのコールバックをトリガーするヘルパー関数
   * @param element 監視対象の要素
   * @param width 新しい幅
   * @param height 新しい高さ
   */
  const triggerResize = (element: Element, width: number, height: number): void => {
    // clientWidthとclientHeightをモック
    Object.defineProperty(element, 'clientWidth', {
      configurable: true,
      value: width,
    });
    Object.defineProperty(element, 'clientHeight', {
      configurable: true,
      value: height,
    });

    // ResizeObserverのコールバックを呼び出し（act()でラップして状態更新を同期）
    act(() => {
      resizeObserverCallback(
        [
          {
            target: element,
            contentRect: { width, height } as DOMRectReadOnly,
          } as ResizeObserverEntry,
        ],
        {} as ResizeObserver
      );
    });
  };

  describe('正常系 - コンポーネントのレンダリング', () => {
    test('DartBoardコンポーネントがエラーなくレンダリングされる', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act & Assert
      expect(() => render(<DartBoard coords={coords} dartCount={0} />)).not.toThrow();
    });

    test('空のダーツ配列でもレンダリングに成功する', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      expect(container).toBeDefined();
      // 初期状態ではコンテナサイズが0なのでP5Canvasは表示されない
    });

    test('3投分のダーツ座標を渡してもレンダリングに成功する', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 }, // トリプル20付近
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={3} />);

      // Assert
      expect(container).toBeDefined();
    });
  });

  describe('正常系 - ResizeObserverの初期化', () => {
    test('コンテナに対してResizeObserverが設定される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      expect(observedElements.length).toBe(1);
    });

    test('アンマウント時にResizeObserverが切断される', () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { unmount } = render(<DartBoard coords={coords} dartCount={0} />);

      // 監視されていることを確認
      expect(observedElements.length).toBe(1);

      // Act
      unmount();

      // Assert
      expect(observedElements.length).toBe(0);
    });
  });

  describe('正常系 - コンテナサイズ0の場合の動作', () => {
    test('初期状態（コンテナサイズ0）ではP5Canvasがレンダリングされない', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // canvasSize = 0 なので条件付きレンダリングによりP5Canvasは表示されない
      expect(screen.queryByTestId('mock-p5-canvas')).not.toBeInTheDocument();
    });

    test('コンテナ幅が0の場合、P5Canvasがレンダリングされない', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 0, 600);

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('mock-p5-canvas')).not.toBeInTheDocument();
      });
    });

    test('コンテナ高さが0の場合、P5Canvasがレンダリングされない', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 0);

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('mock-p5-canvas')).not.toBeInTheDocument();
      });
    });

    test('コンテナサイズがマージン以下の場合、P5Canvasがレンダリングされない', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act: マージン40px以下のサイズ
      triggerResize(containerElement, 40, 40);

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('mock-p5-canvas')).not.toBeInTheDocument();
      });
    });
  });

  describe('正常系 - レスポンシブサイズ計算', () => {
    test('コンテナサイズ800x600で正方形キャンバス（560x560）が計算される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      // 幅800 - 40 = 760, 高さ600 - 40 = 560 → 小さい方: 560
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('560');
        expect(p5Canvas.getAttribute('data-height')).toBe('560');
      });
    });

    test('正方形コンテナ（600x600）では正方形キャンバス（560x560）が生成される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 600, 600);

      // Assert
      // 600 - 40 = 560
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('560');
        expect(p5Canvas.getAttribute('data-height')).toBe('560');
      });
    });

    test('縦長コンテナ（400x800）では幅基準でキャンバスサイズが決まる', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 400, 800);

      // Assert
      // 幅400 - 40 = 360, 高さ800 - 40 = 760 → 小さい方: 360
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('360');
        expect(p5Canvas.getAttribute('data-height')).toBe('360');
      });
    });

    test('横長コンテナ（1920x1080）では高さ基準でキャンバスサイズが決まる', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 1920, 1080);

      // Assert
      // 幅1920 - 40 = 1880, 高さ1080 - 40 = 1040 → 小さい方: 1040
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('1040');
        expect(p5Canvas.getAttribute('data-height')).toBe('1040');
      });
    });

    test('モバイルサイズ（375x667）で適切なキャンバスサイズが計算される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 375, 667);

      // Assert
      // 幅375 - 40 = 335, 高さ667 - 40 = 627 → 小さい方: 335
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('335');
        expect(p5Canvas.getAttribute('data-height')).toBe('335');
      });
    });

    test('キャンバスは常に正方形を維持する（width === height）', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 1024, 768);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const width = p5Canvas.getAttribute('data-width');
        const height = p5Canvas.getAttribute('data-height');
        expect(width).toBe(height);
      });
    });
  });

  describe('正常系 - リサイズイベントの処理', () => {
    test('コンテナリサイズ時にキャンバスサイズが更新される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // 初期サイズを設定
      triggerResize(containerElement, 800, 600);

      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('560');
      });

      // Act: コンテナサイズを変更
      triggerResize(containerElement, 1024, 768);

      // Assert
      // 幅1024 - 40 = 984, 高さ768 - 40 = 728 → 小さい方: 728
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('728');
        expect(p5Canvas.getAttribute('data-height')).toBe('728');
      });
    });

    test('複数回リサイズしても正常に動作する', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act & Assert: 1回目のリサイズ
      triggerResize(containerElement, 1024, 768);
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('728');
      });

      // Act & Assert: 2回目のリサイズ
      triggerResize(containerElement, 800, 600);
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('560');
      });

      // Act & Assert: 3回目のリサイズ
      triggerResize(containerElement, 1920, 1080);
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('1040');
      });
    });

    test('リサイズでコンテナが0になった場合、P5Canvasが非表示になる', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // 初期サイズを設定
      triggerResize(containerElement, 800, 600);

      await waitFor(() => {
        expect(screen.getByTestId('mock-p5-canvas')).toBeInTheDocument();
      });

      // Act: サイズを0に変更
      triggerResize(containerElement, 0, 0);

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('mock-p5-canvas')).not.toBeInTheDocument();
      });
    });
  });

  describe('正常系 - P5Canvasへのprops転送', () => {
    test('空のcoords配列がP5Canvasに正しく渡される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
        expect(passedCoords).toEqual([]);
      });
    });

    test('1本のダーツ座標がP5Canvasに正しく渡される', async () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 10, y: 20 }];
      const { container } = render(<DartBoard coords={coords} dartCount={1} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
        expect(passedCoords).toEqual([{ x: 10, y: 20 }]);
      });
    });

    test('3本のダーツ座標がP5Canvasに正しく渡される', async () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];
      const { container } = render(<DartBoard coords={coords} dartCount={3} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
        expect(passedCoords).toEqual([
          { x: 0, y: -103 },
          { x: 50, y: 50 },
          { x: -30, y: -30 },
        ]);
      });
    });

    test('dartCount=0がP5Canvasに正しく渡される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-dart-count')).toBe('0');
      });
    });

    test('dartCount=1がP5Canvasに正しく渡される', async () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 0, y: 0 }];
      const { container } = render(<DartBoard coords={coords} dartCount={1} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-dart-count')).toBe('1');
      });
    });

    test('dartCount=3がP5Canvasに正しく渡される（凡例表示のトリガー）', async () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];
      const { container } = render(<DartBoard coords={coords} dartCount={3} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-dart-count')).toBe('3');
      });
    });

    test('width と height がP5Canvasに正しく渡される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('560');
        expect(p5Canvas.getAttribute('data-height')).toBe('560');
      });
    });
  });

  describe('正常系 - レイアウト構造', () => {
    test('外側のdivがflexコンテナとして設定されている', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv?.style.display).toBe('flex');
      expect(outerDiv?.style.justifyContent).toBe('center');
      expect(outerDiv?.style.alignItems).toBe('center');
    });

    test('外側のdivが親コンテナ全体を占める', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv?.style.width).toBe('100%');
      expect(outerDiv?.style.height).toBe('100%');
    });

    test('内側のdivがキャンバスラッパーとして正方形を維持する', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const outerDiv = container.firstChild as HTMLElement;
        const innerDiv = outerDiv.firstChild as HTMLElement;
        expect(innerDiv?.style.width).toBe(innerDiv?.style.height);
      });
    });

    test('P5Canvasが内側のdivの子要素として配置される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const innerDiv = container.querySelector('div > div') as HTMLElement;
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(innerDiv?.contains(p5Canvas)).toBe(true);
      });
    });
  });

  describe('正常系 - propsの変更時の動作', () => {
    test('coords配列が更新されるとP5Canvasに新しい値が渡される', async () => {
      // Arrange
      const initialCoords: Coordinates[] = [{ x: 10, y: 20 }];
      const { container, rerender } = render(<DartBoard coords={initialCoords} dartCount={1} />);
      const containerElement = container.querySelector('div') as Element;

      // 初期サイズを設定
      triggerResize(containerElement, 800, 600);

      // 初期状態を確認
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
        expect(passedCoords).toEqual([{ x: 10, y: 20 }]);
      });

      // Act: propsを更新
      const updatedCoords: Coordinates[] = [
        { x: 30, y: 40 },
        { x: 50, y: 60 },
      ];
      rerender(<DartBoard coords={updatedCoords} dartCount={2} />);

      // Assert: 新しい値が反映されている
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
        expect(passedCoords).toEqual([
          { x: 30, y: 40 },
          { x: 50, y: 60 },
        ]);
      });
    });

    test('dartCountが更新されるとP5Canvasに新しい値が渡される', async () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 0, y: 0 }];
      const { container, rerender } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // 初期サイズを設定
      triggerResize(containerElement, 800, 600);

      // 初期状態を確認
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-dart-count')).toBe('0');
      });

      // Act: dartCountを更新
      rerender(<DartBoard coords={coords} dartCount={3} />);

      // Assert: 新しい値が反映されている
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-dart-count')).toBe('3');
      });
    });

    test('coords配列が空→3本→空と変化しても正常に動作する', async () => {
      // Arrange
      const emptyCoords: Coordinates[] = [];
      const { container, rerender } = render(<DartBoard coords={emptyCoords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // 初期サイズを設定
      triggerResize(containerElement, 800, 600);

      // Act & Assert: 空の状態
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
        expect(passedCoords).toEqual([]);
      });

      // Act & Assert: 3本のダーツ
      const threeCoords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];
      rerender(<DartBoard coords={threeCoords} dartCount={3} />);
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
        expect(passedCoords).toEqual(threeCoords);
      });

      // Act & Assert: 再び空
      rerender(<DartBoard coords={emptyCoords} dartCount={0} />);
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
        expect(passedCoords).toEqual([]);
      });
    });
  });

  describe('エッジケース - 極端なコンテナサイズ', () => {
    test('非常に小さいコンテナ（100x100）でも正常に動作する', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 100, 100);

      // Assert
      // 100 - 40 = 60
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('60');
        expect(p5Canvas.getAttribute('data-height')).toBe('60');
      });
    });

    test('非常に大きいコンテナ（3840x2160）でも正常に動作する', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 3840, 2160);

      // Assert
      // 幅3840 - 40 = 3800, 高さ2160 - 40 = 2120 → 小さい方: 2120
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('2120');
        expect(p5Canvas.getAttribute('data-height')).toBe('2120');
      });
    });

    test('極端に縦長のコンテナ（200x2000）でも正常に動作する', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 200, 2000);

      // Assert
      // 幅200 - 40 = 160, 高さ2000 - 40 = 1960 → 小さい方: 160
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('160');
        expect(p5Canvas.getAttribute('data-height')).toBe('160');
      });
    });

    test('極端に横長のコンテナ（2000x200）でも正常に動作する', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 2000, 200);

      // Assert
      // 幅2000 - 40 = 1960, 高さ200 - 40 = 160 → 小さい方: 160
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('160');
        expect(p5Canvas.getAttribute('data-height')).toBe('160');
      });
    });
  });

  describe('エッジケース - ダーツ数の境界値', () => {
    test('dartCount=0（ダーツなし）で正常に動作する', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-dart-count')).toBe('0');
      });
    });

    test('dartCount=3（凡例表示）で正常に動作する', async () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];
      const { container } = render(<DartBoard coords={coords} dartCount={3} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-dart-count')).toBe('3');
      });
    });

    test('coords配列の長さとdartCountが一致しない場合でもレンダリングされる', async () => {
      // Arrange
      // 実際の使用では一致するべきだが、エッジケースとしてテスト
      const coords: Coordinates[] = [{ x: 0, y: 0 }];
      const dartCount = 3;
      const { container } = render(<DartBoard coords={coords} dartCount={dartCount} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('mock-p5-canvas')).toBeInTheDocument();
      });
    });
  });

  describe('正常系 - マージンの考慮', () => {
    test('40pxのマージンが適切に適用される', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 500, 500);

      // Assert
      // 500 - 40 = 460
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        expect(p5Canvas.getAttribute('data-width')).toBe('460');
        expect(p5Canvas.getAttribute('data-height')).toBe('460');
      });
    });

    test('マージンを考慮した結果、幅と高さが等しくなる', async () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 1000);

      // Assert
      // 幅800 - 40 = 760, 高さ1000 - 40 = 960 → 小さい方: 760
      await waitFor(() => {
        const p5Canvas = screen.getByTestId('mock-p5-canvas');
        const width = p5Canvas.getAttribute('data-width');
        const height = p5Canvas.getAttribute('data-height');
        expect(width).toBe(height);
        expect(width).toBe('760');
      });
    });
  });

  describe('スナップショットテスト', () => {
    test('デフォルト状態（コンテナサイズ0、ダーツなし）のスナップショット', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('1投のダーツ表示状態のスナップショット', async () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 0, y: -103 }]; // トリプル20付近
      const { container } = render(<DartBoard coords={coords} dartCount={1} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('mock-p5-canvas')).toBeInTheDocument();
      });
      expect(container.firstChild).toMatchSnapshot();
    });

    test('3投のダーツ表示状態のスナップショット（凡例表示）', async () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 }, // トリプル20付近
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];
      const { container } = render(<DartBoard coords={coords} dartCount={3} />);
      const containerElement = container.querySelector('div') as Element;

      // Act
      triggerResize(containerElement, 800, 600);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('mock-p5-canvas')).toBeInTheDocument();
      });
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
