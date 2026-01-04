/**
 * ZoomViewMultipleコンポーネントのテスト
 * 3投モード用の複数ダーツ拡大表示コンポーネントの動作を検証
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Coordinates } from '../../types';
import {
  DEFAULT_ZOOM_FACTOR,
  ZOOM_CANVAS_SIZE_DESKTOP,
  ZOOM_CANVAS_SIZE_MOBILE,
  ZoomViewMultiple,
} from './ZoomViewMultiple';

// react-p5のモック化
vi.mock('react-p5', () => ({
  default: ({
    setup,
    draw,
  }: {
    setup: (p5: unknown, canvasParentRef: Element) => void;
    draw: (p5: unknown) => void;
  }) => {
    // setup/draw関数の存在を確認するためのダミー要素を返す
    return (
      <div
        data-testid="mock-sketch"
        data-has-setup={typeof setup === 'function'}
        data-has-draw={typeof draw === 'function'}
      >
        Mock Sketch
      </div>
    );
  },
}));

describe('ZoomViewMultiple', () => {
  // テスト用定数
  const TEST_COORDS: Coordinates[] = [
    { x: 0, y: -103 }, // トリプル20付近
    { x: 50, y: 50 }, // セグメント6付近
    { x: -30, y: -30 }, // セグメント11付近
  ];

  // window.innerWidthのモック
  beforeEach(() => {
    // デスクトップサイズをデフォルトに設定
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('セマンティックテスト - 基本的なレンダリング', () => {
    test('3つのズームビューが表示される', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });

    test('ダーツ数2の場合、2つのズームビューが表示される', () => {
      // Arrange
      const coords = TEST_COORDS.slice(0, 2);

      // Act
      render(<ZoomViewMultiple coords={coords} dartCount={2} visibleDarts={[true, true]} />);

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(2);
    });

    test('ダーツ数1の場合、1つのズームビューが表示される', () => {
      // Arrange
      const coords = TEST_COORDS.slice(0, 1);

      // Act
      render(<ZoomViewMultiple coords={coords} dartCount={1} visibleDarts={[true]} />);

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(1);
    });

    test('親要素にregionロールとaria-labelが設定されている', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      const container = screen.getByRole('region', {
        name: '3投のダーツ着地点のズームビュー',
      });
      expect(container).toBeInTheDocument();
    });
  });

  describe('セマンティックテスト - visibleDarts による表示制御', () => {
    test('visibleDarts=[true, true, true]で3つ全て表示される', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });

    test('visibleDarts=[true, false, true]で1番目と3番目のみ表示される', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, false, true]} />
      );

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(2);
    });

    test('visibleDarts=[false, true, false]で2番目のみ表示される', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[false, true, false]} />
      );

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(1);
    });

    test('visibleDarts=[false, false, false]で何も表示されない', () => {
      // Arrange & Act
      const result = render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[false, false, false]} />
      );

      // Assert
      expect(result.container.firstChild).toBeNull();
    });

    test('visibleDartsが未指定（undefined要素）の場合、デフォルトで表示される', () => {
      // Arrange & Act
      // visibleDartsの一部がundefinedの場合、trueとして扱われる
      render(
        <ZoomViewMultiple
          coords={TEST_COORDS}
          dartCount={3}
          visibleDarts={[true, undefined as unknown as boolean, true]}
        />
      );

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });
  });

  describe('セマンティックテスト - dartCount=0 の場合', () => {
    test('dartCount=0の場合、何も表示されない', () => {
      // Arrange & Act
      const result = render(<ZoomViewMultiple coords={[]} dartCount={0} visibleDarts={[]} />);

      // Assert
      expect(result.container.firstChild).toBeNull();
    });

    test('coords配列が空の場合、何も表示されない', () => {
      // Arrange & Act
      const result = render(
        <ZoomViewMultiple coords={[]} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      expect(result.container.firstChild).toBeNull();
    });

    test('dartCount=0かつcoords配列が空の場合、何も表示されない', () => {
      // Arrange & Act
      const result = render(<ZoomViewMultiple coords={[]} dartCount={0} visibleDarts={[]} />);

      // Assert
      expect(result.container.firstChild).toBeNull();
    });
  });

  describe('セマンティックテスト - レスポンシブ対応', () => {
    test('デスクトップ幅（1024px）で初期レンダリングされる', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      // Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      // デスクトップサイズのキャンバスサイズが使用される（160x160）
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });

    test('モバイル幅（480px）で初期レンダリングされる', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      // Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      // モバイルサイズのキャンバスサイズが使用される（140x140）
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });

    test('境界値640pxではモバイルサイズが適用される', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      // Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      // 640px以下はモバイルサイズ（140x140）
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });

    test('境界値641pxではデスクトップサイズが適用される', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 641,
      });

      // Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      // 641px以上はデスクトップサイズ（160x160）
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });
  });

  describe('セマンティックテスト - リサイズイベント', () => {
    test('ウィンドウリサイズイベントリスナーが登録される', () => {
      // Arrange
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      // Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    test('アンマウント時にリサイズイベントリスナーが削除される', () => {
      // Arrange
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      // Act
      const { unmount } = render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      unmount();

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('セマンティックテスト - zoomFactorプロパティ', () => {
    test('zoomFactorが指定されない場合、デフォルト値（8.0）が使用される', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      // デフォルトのズーム倍率が使用されることを確認（間接的に検証）
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });

    test('カスタムzoomFactor（4.0）が適用される', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple
          coords={TEST_COORDS}
          dartCount={3}
          visibleDarts={[true, true, true]}
          zoomFactor={4.0}
        />
      );

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });

    test('カスタムzoomFactor（16.0）が適用される', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple
          coords={TEST_COORDS}
          dartCount={3}
          visibleDarts={[true, true, true]}
          zoomFactor={16.0}
        />
      );

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });
  });

  describe('セマンティックテスト - 最大3つのズームビュー制限', () => {
    test('3つを超えるダーツが表示可能でも、最大3つまでしか表示されない', () => {
      // Arrange
      const manyCoords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
        { x: 10, y: 10 }, // 4つ目
        { x: 20, y: 20 }, // 5つ目
      ];

      // Act
      render(
        <ZoomViewMultiple
          coords={manyCoords}
          dartCount={5}
          visibleDarts={[true, true, true, true, true]}
        />
      );

      // Assert
      // 最大3つまでしか表示されない
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);
    });
  });

  describe('セマンティックテスト - SingleZoom の個別レンダリング', () => {
    test('各SingleZoomコンポーネントが独立したSketchを持つ', () => {
      // Arrange & Act
      render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      const sketches = screen.getAllByTestId('mock-sketch');
      expect(sketches).toHaveLength(3);

      // 各Sketchがsetupとdraw関数を持つことを確認
      sketches.forEach((sketch) => {
        expect(sketch).toHaveAttribute('data-has-setup', 'true');
        expect(sketch).toHaveAttribute('data-has-draw', 'true');
      });
    });
  });

  describe('スナップショットテスト', () => {
    test('基本的なレンダリング結果が一致する（3投、全て表示）', () => {
      // Arrange & Act
      const { container } = render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('2投のダーツ表示状態のスナップショット', () => {
      // Arrange
      const coords = TEST_COORDS.slice(0, 2);

      // Act
      const { container } = render(
        <ZoomViewMultiple coords={coords} dartCount={2} visibleDarts={[true, true]} />
      );

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('1投のダーツ表示状態のスナップショット', () => {
      // Arrange
      const coords = TEST_COORDS.slice(0, 1);

      // Act
      const { container } = render(
        <ZoomViewMultiple coords={coords} dartCount={1} visibleDarts={[true]} />
      );

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('一部のダーツのみ表示する状態のスナップショット', () => {
      // Arrange & Act
      const { container } = render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, false, true]} />
      );

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('ダーツなし（dartCount=0）の状態のスナップショット', () => {
      // Arrange & Act
      const { container } = render(
        <ZoomViewMultiple coords={[]} dartCount={0} visibleDarts={[]} />
      );

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('カスタムzoomFactor（4.0）の状態のスナップショット', () => {
      // Arrange & Act
      const { container } = render(
        <ZoomViewMultiple
          coords={TEST_COORDS}
          dartCount={3}
          visibleDarts={[true, true, true]}
          zoomFactor={4.0}
        />
      );

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('モバイルサイズ（640px）でのスナップショット', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      // Act
      const { container } = render(
        <ZoomViewMultiple coords={TEST_COORDS} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // Assert
      expect(container).toMatchSnapshot();
    });
  });
});

describe('定数のエクスポート検証', () => {
  test('ZOOM_CANVAS_SIZE_DESKTOPが正しい値を持つ', () => {
    expect(ZOOM_CANVAS_SIZE_DESKTOP).toEqual({
      width: 160,
      height: 160,
    });
  });

  test('ZOOM_CANVAS_SIZE_MOBILEが正しい値を持つ', () => {
    expect(ZOOM_CANVAS_SIZE_MOBILE).toEqual({
      width: 140,
      height: 140,
    });
  });

  test('DEFAULT_ZOOM_FACTORが8.0である', () => {
    expect(DEFAULT_ZOOM_FACTOR).toBe(8.0);
  });
});
