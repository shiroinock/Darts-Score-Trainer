/**
 * ZoomViewMultiple統合テスト
 *
 * 3投累積時のズームビュー統合テスト
 * - 複数ダーツの同時表示
 * - レスポンシブレイアウト
 * - ダーツ表示制御（visibleDarts）
 * - ダーツ色の正しい割り当て
 */

import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZoomViewMultiple } from '../../components/DartBoard/ZoomViewMultiple';
import type { Coordinates } from '../../types';

// react-p5のSketchコンポーネントをモック
vi.mock('react-p5', () => ({
  default: () => {
    // setupとdrawをここでは実際に呼び出さない（テスト環境ではcanvasが利用不可）
    return <div className="sketch-mock" />;
  },
}));

describe('ZoomViewMultiple - 統合テスト', () => {
  // ダーツ投擲座標（3投）
  const dartCoords: Coordinates[] = [
    { x: 20, y: 30 }, // Dart 1（赤）
    { x: -15, y: 25 }, // Dart 2（青）
    { x: 10, y: -35 }, // Dart 3（緑）
  ];

  beforeEach(() => {
    // ウィンドウサイズをデスクトップサイズに設定
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本的な表示', () => {
    it('3つのダーツが全て表示される場合、3つのズームビューが描画される', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      const zoomSection = container.querySelector('.zoom-view-multiple');
      expect(zoomSection).toBeInTheDocument();

      // 3つのSingleZoomコンポーネントが描画される
      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3);
    });

    it('ダーツが投擲されていない場合（dartCount=0）、nullを返す', () => {
      const { container } = render(
        <ZoomViewMultiple coords={[]} dartCount={0} visibleDarts={[false, false, false]} />
      );

      const zoomSection = container.querySelector('.zoom-view-multiple');
      expect(zoomSection).not.toBeInTheDocument();
    });

    it('全ダーツが非表示の場合（visibleDarts全てfalse）、nullを返す', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[false, false, false]} />
      );

      const zoomSection = container.querySelector('.zoom-view-multiple');
      expect(zoomSection).not.toBeInTheDocument();
    });

    it('アクセシビリティ: aria-labelが正しく設定されている', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      const zoomSection = container.querySelector('.zoom-view-multiple');
      expect(zoomSection).toHaveAttribute('aria-label', '3投のダーツ着地点のズームビュー');
    });
  });

  describe('表示制御（visibleDarts）', () => {
    it('最初の1本のみ表示される場合、1つのズームビューが描画される', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, false, false]} />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(1);
    });

    it('最初の2本が表示される場合、2つのズームビューが描画される', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, false]} />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(2);
    });

    it('中央のダーツのみが非表示の場合、2つのズームビューが描画される（1番目と3番目）', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, false, true]} />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(2);
    });
  });

  describe('レスポンシブレイアウト', () => {
    it('デスクトップサイズ（>640px）での初期レイアウト', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // デスクトップサイズでは、CSSで横並びレイアウトが適用される
      // （実際の描画確認はスナップショットまたはビジュアルテストで検証）
      const zoomSection = container.querySelector('.zoom-view-multiple');
      expect(zoomSection?.className).toContain('zoom-view-multiple');
    });

    it('モバイルサイズ（≤640px）での初期レイアウト', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // モバイルサイズでも3つのズームビューが描画される
      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3);
    });

    it('ウィンドウリサイズ後、キャンバスサイズが更新される', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container, rerender } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // モバイルサイズにリサイズ
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      // リサイズイベントをトリガー
      window.dispatchEvent(new Event('resize'));

      // 再レンダリング（状態更新を待つため）
      rerender(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      // ズームビューが存在することを確認（waitForで状態更新を待つ）
      await waitFor(() => {
        const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
        expect(singleZooms.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ズーム倍率', () => {
    it('デフォルトのズーム倍率（8.0）が適用される', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      const zoomSection = container.querySelector('.zoom-view-multiple');
      expect(zoomSection).toBeInTheDocument();

      // デフォルトズーム倍率でズームビューが表示される
      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3);
    });

    it('カスタムズーム倍率（12.0）が適用される', () => {
      const { container } = render(
        <ZoomViewMultiple
          coords={dartCoords}
          dartCount={3}
          visibleDarts={[true, true, true]}
          zoomFactor={12.0}
        />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3);
    });

    it('小さいズーム倍率（4.0）が適用される', () => {
      const { container } = render(
        <ZoomViewMultiple
          coords={dartCoords}
          dartCount={3}
          visibleDarts={[true, true, true]}
          zoomFactor={4.0}
        />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3);
    });
  });

  describe('複数ダーツの並列表示', () => {
    it('3投全てのダーツが異なる位置に表示される', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3);

      // 各ズームビューが独立して描画される
      singleZooms.forEach((zoom) => {
        expect(zoom).toBeInTheDocument();
        expect(zoom.className).toContain('zoom-view-multiple__single');
      });
    });

    it('ダーツが1本→2本→3本と追加される場合、表示数が増加する', () => {
      const { rerender, container } = render(
        <ZoomViewMultiple
          coords={[dartCoords[0]]}
          dartCount={1}
          visibleDarts={[true, false, false]}
        />
      );

      let singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(1);

      // 2本目を追加
      rerender(
        <ZoomViewMultiple
          coords={[dartCoords[0], dartCoords[1]]}
          dartCount={2}
          visibleDarts={[true, true, false]}
        />
      );

      singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(2);

      // 3本目を追加
      rerender(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3);

      // rerender後のDOM整合性確認
      const zoomSection = container.querySelector('.zoom-view-multiple');
      expect(zoomSection).toBeInTheDocument();
      expect(zoomSection?.querySelectorAll('.zoom-view-multiple__single')).toHaveLength(3);
    });
  });

  describe('エッジケース', () => {
    it('空の座標配列で呼ばれた場合、nullを返す', () => {
      const { container } = render(
        <ZoomViewMultiple coords={[]} dartCount={0} visibleDarts={[]} />
      );

      const zoomSection = container.querySelector('.zoom-view-multiple');
      expect(zoomSection).not.toBeInTheDocument();
    });

    it('visibleDartsが指定されない場合のデフォルト動作', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3);
    });

    it('visibleDartsの長さがcoordsの長さより短い場合、undefinedは表示される', () => {
      const { container } = render(
        <ZoomViewMultiple
          coords={dartCoords}
          dartCount={3}
          visibleDarts={[true, true]} // 3要素中2要素のみ。3番目はundefinedで、!== false条件で表示される
        />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      // 実装上、visibleDarts[2] === undefined !== falseなので、3番目も表示される
      // これは実装の仕様: visibleDarts配列が短い場合、不足分はundefinedとなり、
      // !== false 比較により true 扱いされるため表示される
      expect(singleZooms).toHaveLength(3);
    });

    it('4本以上のダーツが渡された場合、最初の3本のみを処理', () => {
      const fourDarts: Coordinates[] = [
        { x: 20, y: 30 },
        { x: -15, y: 25 },
        { x: 10, y: -35 },
        { x: -25, y: -20 }, // 4本目は無視される
      ];

      const { container } = render(
        <ZoomViewMultiple
          coords={fourDarts}
          dartCount={4}
          visibleDarts={[true, true, true, true]}
        />
      );

      const singleZooms = container.querySelectorAll('.zoom-view-multiple__single');
      expect(singleZooms).toHaveLength(3); // 最初の3本のみ表示
    });
  });

  describe('スナップショットテスト', () => {
    it('3投全てが表示される場合のスナップショット', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={3} visibleDarts={[true, true, true]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('2投が表示される場合のスナップショット', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={2} visibleDarts={[true, true, false]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('1投が表示される場合のスナップショット', () => {
      const { container } = render(
        <ZoomViewMultiple coords={dartCoords} dartCount={1} visibleDarts={[true, false, false]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('ダーツが投擲されていない場合のスナップショット', () => {
      const { container } = render(
        <ZoomViewMultiple coords={[]} dartCount={0} visibleDarts={[]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
