/**
 * DartBoardコンポーネントのテスト
 * レスポンシブサイズ計算、レイアウト構造、P5Canvasへのprops転送を検証
 */

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Coordinates } from '../../types';
import { DartBoard } from './DartBoard';

// P5Canvasコンポーネントをモック化
vi.mock('./P5Canvas', () => ({
  P5Canvas: ({ coords, dartCount }: { coords: Coordinates[]; dartCount: number }) => (
    <div
      data-testid="mock-p5-canvas"
      data-coords={JSON.stringify(coords)}
      data-dart-count={dartCount}
    >
      Mock P5Canvas
    </div>
  ),
}));

describe('DartBoard', () => {
  // ウィンドウサイズのモック
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    // 元のウィンドウサイズを保存
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;

    // デフォルトのウィンドウサイズを設定
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // モックをクリア
    vi.clearAllMocks();
  });

  afterEach(() => {
    // ウィンドウサイズを元に戻す
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });

    // イベントリスナーをクリーンアップ
    vi.restoreAllMocks();
  });

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
      expect(screen.getByTestId('mock-p5-canvas')).toBeInTheDocument();
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
      expect(screen.getByTestId('mock-p5-canvas')).toBeInTheDocument();
    });
  });

  describe('正常系 - P5Canvasへのprops転送', () => {
    test('空のcoords配列がP5Canvasに正しく渡される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
      expect(passedCoords).toEqual([]);
    });

    test('1本のダーツ座標がP5Canvasに正しく渡される', () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 10, y: 20 }];

      // Act
      render(<DartBoard coords={coords} dartCount={1} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
      expect(passedCoords).toEqual([{ x: 10, y: 20 }]);
    });

    test('3本のダーツ座標がP5Canvasに正しく渡される', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];

      // Act
      render(<DartBoard coords={coords} dartCount={3} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      const passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
      expect(passedCoords).toEqual([
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ]);
    });

    test('dartCount=0がP5Canvasに正しく渡される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(p5Canvas.getAttribute('data-dart-count')).toBe('0');
    });

    test('dartCount=1がP5Canvasに正しく渡される', () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 0, y: 0 }];

      // Act
      render(<DartBoard coords={coords} dartCount={1} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(p5Canvas.getAttribute('data-dart-count')).toBe('1');
    });

    test('dartCount=2がP5Canvasに正しく渡される', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];

      // Act
      render(<DartBoard coords={coords} dartCount={2} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(p5Canvas.getAttribute('data-dart-count')).toBe('2');
    });

    test('dartCount=3がP5Canvasに正しく渡される（凡例表示のトリガー）', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];

      // Act
      render(<DartBoard coords={coords} dartCount={3} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(p5Canvas.getAttribute('data-dart-count')).toBe('3');
    });
  });

  describe('正常系 - レスポンシブサイズ計算', () => {
    test('ウィンドウサイズ1024x768で正方形キャンバスが計算される', () => {
      // Arrange
      window.innerWidth = 1024;
      window.innerHeight = 768;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 高さ768 - 40 = 728が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper).toBeDefined();
      expect(canvasWrapper?.style.width).toBe('728px');
      expect(canvasWrapper?.style.height).toBe('728px');
    });

    test('ウィンドウサイズ800x600で正方形キャンバスが計算される', () => {
      // Arrange
      window.innerWidth = 800;
      window.innerHeight = 600;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 高さ600 - 40 = 560が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('560px');
      expect(canvasWrapper?.style.height).toBe('560px');
    });

    test('縦長ウィンドウ（400x800）では幅基準でキャンバスサイズが決まる', () => {
      // Arrange
      window.innerWidth = 400;
      window.innerHeight = 800;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 幅400 - 40 = 360が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('360px');
      expect(canvasWrapper?.style.height).toBe('360px');
    });

    test('横長ウィンドウ（1920x1080）では高さ基準でキャンバスサイズが決まる', () => {
      // Arrange
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 高さ1080 - 40 = 1040が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('1040px');
      expect(canvasWrapper?.style.height).toBe('1040px');
    });

    test('正方形ウィンドウ（600x600）では正方形キャンバスが生成される', () => {
      // Arrange
      window.innerWidth = 600;
      window.innerHeight = 600;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 600 - 40 = 560
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('560px');
      expect(canvasWrapper?.style.height).toBe('560px');
    });

    test('モバイルサイズ（375x667）で適切なキャンバスサイズが計算される', () => {
      // Arrange
      window.innerWidth = 375;
      window.innerHeight = 667;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 幅375 - 40 = 335が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('335px');
      expect(canvasWrapper?.style.height).toBe('335px');
    });
  });

  describe('正常系 - ウィンドウリサイズイベント', () => {
    test('ウィンドウリサイズ時にキャンバスサイズが更新される', () => {
      // Arrange
      window.innerWidth = 800;
      window.innerHeight = 600;
      const coords: Coordinates[] = [];
      const { container, rerender } = render(<DartBoard coords={coords} dartCount={0} />);

      // 初期サイズを確認
      let outerDiv = container.firstChild as HTMLElement;
      let canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('560px');

      // Act: ウィンドウサイズを変更
      window.innerWidth = 1024;
      window.innerHeight = 768;

      // resizeイベントを発火（act()でラップして状態更新を同期）
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // 再レンダリングをトリガー（実際のアプリではuseEffectが自動的に処理）
      rerender(<DartBoard coords={coords} dartCount={0} />);

      // Assert: 新しいサイズが反映されている
      outerDiv = container.firstChild as HTMLElement;
      canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('728px');
      expect(canvasWrapper?.style.height).toBe('728px');
    });

    test('リサイズイベントリスナーが登録される', () => {
      // Arrange
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const coords: Coordinates[] = [];

      // Act
      render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    test('アンマウント時にリサイズイベントリスナーが削除される', () => {
      // Arrange
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const coords: Coordinates[] = [];

      // Act
      const { unmount } = render(<DartBoard coords={coords} dartCount={0} />);
      unmount();

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    test('複数回リサイズしても正常に動作する', () => {
      // Arrange
      const coords: Coordinates[] = [];
      const { container, rerender } = render(<DartBoard coords={coords} dartCount={0} />);

      // Act & Assert: 1回目のリサイズ
      window.innerWidth = 1024;
      window.innerHeight = 768;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      rerender(<DartBoard coords={coords} dartCount={0} />);

      let outerDiv = container.firstChild as HTMLElement;
      let canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('728px');

      // Act & Assert: 2回目のリサイズ
      window.innerWidth = 800;
      window.innerHeight = 600;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      rerender(<DartBoard coords={coords} dartCount={0} />);

      outerDiv = container.firstChild as HTMLElement;
      canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('560px');

      // Act & Assert: 3回目のリサイズ
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      rerender(<DartBoard coords={coords} dartCount={0} />);

      outerDiv = container.firstChild as HTMLElement;
      canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('1040px');
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

    test('外側のdivが画面全体を占める', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv?.style.width).toBe('100%');
      expect(outerDiv?.style.height).toBe('100vh');
    });

    test('内側のdivがキャンバスラッパーとして正方形を維持する', () => {
      // Arrange
      window.innerWidth = 800;
      window.innerHeight = 600;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const outerDiv = container.firstChild as HTMLElement;
      const innerDiv = outerDiv.firstChild as HTMLElement;
      expect(innerDiv?.style.width).toBe(innerDiv?.style.height);
    });

    test('P5Canvasが内側のdivの子要素として配置される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const innerDiv = container.querySelector('div > div') as HTMLElement;
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(innerDiv?.contains(p5Canvas)).toBe(true);
    });
  });

  describe('正常系 - propsの変更時の動作', () => {
    test('coords配列が更新されるとP5Canvasに新しい値が渡される', () => {
      // Arrange
      const initialCoords: Coordinates[] = [{ x: 10, y: 20 }];
      const { rerender } = render(<DartBoard coords={initialCoords} dartCount={1} />);

      // 初期状態を確認
      let p5Canvas = screen.getByTestId('mock-p5-canvas');
      let passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
      expect(passedCoords).toEqual([{ x: 10, y: 20 }]);

      // Act: propsを更新
      const updatedCoords: Coordinates[] = [
        { x: 30, y: 40 },
        { x: 50, y: 60 },
      ];
      rerender(<DartBoard coords={updatedCoords} dartCount={2} />);

      // Assert: 新しい値が反映されている
      p5Canvas = screen.getByTestId('mock-p5-canvas');
      passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
      expect(passedCoords).toEqual([
        { x: 30, y: 40 },
        { x: 50, y: 60 },
      ]);
    });

    test('dartCountが更新されるとP5Canvasに新しい値が渡される', () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 0, y: 0 }];
      const { rerender } = render(<DartBoard coords={coords} dartCount={0} />);

      // 初期状態を確認
      let p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(p5Canvas.getAttribute('data-dart-count')).toBe('0');

      // Act: dartCountを更新
      rerender(<DartBoard coords={coords} dartCount={3} />);

      // Assert: 新しい値が反映されている
      p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(p5Canvas.getAttribute('data-dart-count')).toBe('3');
    });

    test('coords配列が空→3本→空と変化しても正常に動作する', () => {
      // Arrange
      const emptyCoords: Coordinates[] = [];
      const { rerender } = render(<DartBoard coords={emptyCoords} dartCount={0} />);

      // Act & Assert: 空の状態
      let p5Canvas = screen.getByTestId('mock-p5-canvas');
      let passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
      expect(passedCoords).toEqual([]);

      // Act & Assert: 3本のダーツ
      const threeCoords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];
      rerender(<DartBoard coords={threeCoords} dartCount={3} />);
      p5Canvas = screen.getByTestId('mock-p5-canvas');
      passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
      expect(passedCoords).toEqual(threeCoords);

      // Act & Assert: 再び空
      rerender(<DartBoard coords={emptyCoords} dartCount={0} />);
      p5Canvas = screen.getByTestId('mock-p5-canvas');
      passedCoords = JSON.parse(p5Canvas.getAttribute('data-coords') || '[]');
      expect(passedCoords).toEqual([]);
    });
  });

  describe('エッジケース - 極端なウィンドウサイズ', () => {
    test('非常に小さいウィンドウ（100x100）でも正常に動作する', () => {
      // Arrange
      window.innerWidth = 100;
      window.innerHeight = 100;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 100 - 40 = 60
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('60px');
      expect(canvasWrapper?.style.height).toBe('60px');
    });

    test('非常に大きいウィンドウ（3840x2160）でも正常に動作する', () => {
      // Arrange
      window.innerWidth = 3840;
      window.innerHeight = 2160;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 高さ2160 - 40 = 2120が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('2120px');
      expect(canvasWrapper?.style.height).toBe('2120px');
    });

    test('極端に縦長のウィンドウ（200x2000）でも正常に動作する', () => {
      // Arrange
      window.innerWidth = 200;
      window.innerHeight = 2000;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 幅200 - 40 = 160が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('160px');
      expect(canvasWrapper?.style.height).toBe('160px');
    });

    test('極端に横長のウィンドウ（2000x200）でも正常に動作する', () => {
      // Arrange
      window.innerWidth = 2000;
      window.innerHeight = 200;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // マージン40pxを考慮: 高さ200 - 40 = 160が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('160px');
      expect(canvasWrapper?.style.height).toBe('160px');
    });
  });

  describe('エッジケース - ダーツ数の境界値', () => {
    test('dartCount=0（ダーツなし）で正常に動作する', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(p5Canvas.getAttribute('data-dart-count')).toBe('0');
    });

    test('dartCount=3（凡例表示）で正常に動作する', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];

      // Act
      render(<DartBoard coords={coords} dartCount={3} />);

      // Assert
      const p5Canvas = screen.getByTestId('mock-p5-canvas');
      expect(p5Canvas.getAttribute('data-dart-count')).toBe('3');
    });

    test('coords配列の長さとdartCountが一致しない場合でもレンダリングされる', () => {
      // Arrange
      // 実際の使用では一致するべきだが、エッジケースとしてテスト
      const coords: Coordinates[] = [{ x: 0, y: 0 }];
      const dartCount = 3;

      // Act & Assert
      expect(() => render(<DartBoard coords={coords} dartCount={dartCount} />)).not.toThrow();
    });
  });

  describe('正常系 - 中心配置の検証', () => {
    test('キャンバスラッパーが親コンテナの中心に配置される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv?.style.justifyContent).toBe('center');
      expect(outerDiv?.style.alignItems).toBe('center');
    });

    test('異なるキャンバスサイズでも中心配置が維持される', () => {
      // Arrange
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv?.style.display).toBe('flex');
      expect(outerDiv?.style.justifyContent).toBe('center');
      expect(outerDiv?.style.alignItems).toBe('center');

      // キャンバスラッパーが存在することを確認
      const innerDiv = container.querySelector('div > div') as HTMLElement;
      expect(innerDiv).toBeDefined();
    });
  });

  describe('正常系 - マージンの考慮', () => {
    test('40pxのマージンが適切に適用される', () => {
      // Arrange
      window.innerWidth = 500;
      window.innerHeight = 500;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // 500 - 40 = 460
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      expect(canvasWrapper?.style.width).toBe('460px');
      expect(canvasWrapper?.style.height).toBe('460px');
    });

    test('マージンを考慮した結果、幅と高さが等しくなる', () => {
      // Arrange
      window.innerWidth = 800;
      window.innerHeight = 1000;
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<DartBoard coords={coords} dartCount={0} />);

      // Assert
      // 幅800 - 40 = 760が小さい方
      const outerDiv = container.firstChild as HTMLElement;
      const canvasWrapper = outerDiv.firstChild as HTMLElement;
      const width = parseInt(canvasWrapper?.style.width || '0', 10);
      const height = parseInt(canvasWrapper?.style.height || '0', 10);
      expect(width).toBe(height);
      expect(width).toBe(760);
    });
  });
});
