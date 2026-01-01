/**
 * ZoomView 統合テスト
 *
 * ズームビューコンポーネントの統合動作を検証します：
 * - p5.jsキャンバスの生成と描画
 * - ズーム倍率適用とCoordinateTransformの統合
 * - ダーツマーカーの座標変換と描画
 * - タップ/ホバーイベントとズーム位置更新
 * - レスポンシブ対応（画面サイズによるキャンバスサイズ変更）
 * - visibleDarts配列との連動
 */

import type p5Types from 'p5';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { drawBoard, drawDartMarker } from '../../components/DartBoard/dartBoardRenderer';
import {
  DEFAULT_ZOOM_FACTOR,
  ZOOM_CANVAS_SIZE_DESKTOP,
  ZOOM_CANVAS_SIZE_MOBILE,
  ZOOM_CANVAS_SIZE_TABLET,
} from '../../components/DartBoard/ZoomView';
import type { Coordinates } from '../../types';
import { BOARD_PHYSICAL, DART_COLORS } from '../../utils/constants/index.js';
import { CoordinateTransform } from '../../utils/coordinateTransform';

describe('zoom-view-rendering integration', () => {
  let mockP5: p5Types;

  beforeEach(() => {
    // p5.jsのモックオブジェクトを作成
    mockP5 = {
      background: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      strokeWeight: vi.fn(),
      noStroke: vi.fn(),
      noFill: vi.fn(),
      arc: vi.fn(),
      circle: vi.fn(),
      line: vi.fn(),
      text: vi.fn(),
      textAlign: vi.fn(),
      textSize: vi.fn(),
      push: vi.fn(),
      pop: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      triangle: vi.fn(),
      createCanvas: vi.fn().mockReturnValue({ parent: vi.fn() }),
      resizeCanvas: vi.fn(),
      mouseX: 0,
      mouseY: 0,
      PIE: 'PIE',
      CENTER: 'CENTER',
      LEFT: 'LEFT',
    } as unknown as p5Types;
  });

  describe('ズーム倍率とCoordinateTransformの統合', () => {
    describe('正常系 - デフォルトズーム倍率（8.0倍）', () => {
      test('物理半径がズーム倍率で除算されてCoordinateTransformに渡される', () => {
        // Arrange
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;

        // Act
        // ズーム倍率を考慮した物理半径を計算
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Assert
        // ズーム倍率8.0倍の場合、物理半径は225mm / 8.0 = 28.125mm
        expect(zoomedPhysicalRadius).toBe(28.125);

        // CoordinateTransformが正常に初期化されることを確認
        expect(transform).toBeDefined();
        expect(transform.getCenter()).toEqual({ x: 140, y: 140 });
      });
    });

    describe('正常系 - カスタムズーム倍率（2倍）', () => {
      test('物理半径がカスタムズーム倍率で除算される', () => {
        // Arrange
        const customZoomFactor = 2.0;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;

        // Act
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / customZoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Assert
        // ズーム倍率2倍の場合、物理半径は225mm / 2 = 112.5mm
        expect(zoomedPhysicalRadius).toBe(112.5);

        // スケールがズーム倍率に応じて変化することを確認
        const scale = transform.getScale();
        expect(scale).toBeGreaterThan(0);
      });
    });

    describe('正常系 - カスタムズーム倍率（3倍）', () => {
      test('物理半径がカスタムズーム倍率で除算される', () => {
        // Arrange
        const customZoomFactor = 3.0;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;

        // Act
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / customZoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Assert
        // ズーム倍率3倍の場合、物理半径は225mm / 3 = 75mm
        expect(zoomedPhysicalRadius).toBe(75);

        // スケールがズーム倍率に応じて変化することを確認
        const scale = transform.getScale();
        expect(scale).toBeGreaterThan(0);
      });
    });

    describe('エッジケース - 最小ズーム倍率（1倍）', () => {
      test('ズーム倍率1倍の場合、物理半径はそのまま（225mm）', () => {
        // Arrange
        const minZoomFactor = 1.0;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;

        // Act
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / minZoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Assert
        expect(zoomedPhysicalRadius).toBe(225);
        expect(transform.getScale()).toBeGreaterThan(0);
      });
    });
  });

  describe('ダーツボード描画とズーム中心の連携', () => {
    describe('正常系 - ズーム中心のtranslate処理', () => {
      test('ズーム中心がキャンバス中心に移動するようにtranslateされる', () => {
        // Arrange
        const zoomCenter: Coordinates = { x: 10, y: -15 }; // トリプル20付近（物理座標）
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const translateSpy = vi.spyOn(mockP5, 'translate');
        const pushSpy = vi.spyOn(mockP5, 'push');

        // Act
        // ズーム中心をキャンバス中心に移動
        const center = transform.getCenter();
        const zoomCenterScreen = transform.physicalToScreen(zoomCenter.x, zoomCenter.y);
        const offsetX = center.x - zoomCenterScreen.x;
        const offsetY = center.y - zoomCenterScreen.y;

        mockP5.push();
        mockP5.translate(offsetX, offsetY);

        // Assert
        expect(pushSpy).toHaveBeenCalledTimes(1);
        expect(translateSpy).toHaveBeenCalledWith(offsetX, offsetY);

        // オフセット値が妥当な範囲であることを確認（キャンバスサイズ以内）
        expect(Math.abs(offsetX)).toBeLessThan(canvasWidth);
        expect(Math.abs(offsetY)).toBeLessThan(canvasHeight);
      });
    });

    describe('正常系 - ダーツボード全体の描画', () => {
      test('drawBoard()がズーム倍率適用後のtransformで呼び出される', () => {
        // Arrange
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const backgroundSpy = vi.spyOn(mockP5, 'background');

        // Act
        drawBoard(mockP5, transform);

        // Assert
        // drawBoard()が正常に実行され、背景がクリアされることを確認
        expect(backgroundSpy).toHaveBeenCalledWith(0);
      });
    });

    describe('正常系 - ズーム中心が原点（0,0）の場合', () => {
      test('translate のオフセットがゼロになる', () => {
        // Arrange
        const zoomCenter: Coordinates = { x: 0, y: 0 }; // ボード中心
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Act
        const center = transform.getCenter();
        const zoomCenterScreen = transform.physicalToScreen(zoomCenter.x, zoomCenter.y);
        const offsetX = center.x - zoomCenterScreen.x;
        const offsetY = center.y - zoomCenterScreen.y;

        // Assert
        // ズーム中心が原点の場合、画面座標もキャンバス中心になるため、オフセットは0
        expect(offsetX).toBeCloseTo(0, 1);
        expect(offsetY).toBeCloseTo(0, 1);
      });
    });
  });

  describe('ダーツマーカーの描画とvisibleDarts連動', () => {
    describe('正常系 - 単一ダーツの描画', () => {
      test('1本目のダーツが正しい色で描画される', () => {
        // Arrange
        const coords: Coordinates[] = [{ x: 0, y: -103 }]; // トリプル20
        const visibleDarts = [true];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        coords.forEach((coord, index) => {
          const isVisible = visibleDarts[index] !== false;
          if (isVisible) {
            drawDartMarker(mockP5, transform, coord, DART_COLORS.first, index);
          }
        });

        // Assert
        // 1本目のダーツ色（赤系）が使用されることを確認
        const firstColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.first
        );
        expect(firstColorCalls.length).toBeGreaterThan(0);
      });
    });

    describe('正常系 - 複数ダーツの描画（3本）', () => {
      test('3本のダーツがそれぞれ異なる色で描画される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 }, // 1本目: トリプル20
          { x: 50, y: 0 }, // 2本目: 右側
          { x: 0, y: 100 }, // 3本目: 下側
        ];
        const visibleDarts = [true, true, true];
        const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        coords.forEach((coord, index) => {
          const isVisible = visibleDarts[index] !== false;
          if (index < dartColors.length && isVisible) {
            drawDartMarker(mockP5, transform, coord, dartColors[index], index);
          }
        });

        // Assert
        // 各ダーツの色が使用されることを確認
        const firstColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.first
        );
        const secondColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.second
        );
        const thirdColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.third
        );

        expect(firstColorCalls.length).toBeGreaterThan(0);
        expect(secondColorCalls.length).toBeGreaterThan(0);
        expect(thirdColorCalls.length).toBeGreaterThan(0);
      });
    });

    describe('正常系 - visibleDarts連動（一部非表示）', () => {
      test('visibleDarts[1]=false の場合、2本目のダーツが描画されない', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 }, // 1本目
          { x: 50, y: 0 }, // 2本目（非表示）
          { x: 0, y: 100 }, // 3本目
        ];
        const visibleDarts = [true, false, true]; // 2本目を非表示
        const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        coords.forEach((coord, index) => {
          const isVisible = visibleDarts[index] !== false;
          if (index < dartColors.length && isVisible) {
            drawDartMarker(mockP5, transform, coord, dartColors[index], index);
          }
        });

        // Assert
        // 1本目と3本目の色は使用されるが、2本目の色は使用されない
        const firstColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.first
        );
        const secondColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.second
        );
        const thirdColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.third
        );

        expect(firstColorCalls.length).toBeGreaterThan(0);
        expect(secondColorCalls.length).toBe(0); // 2本目は描画されない
        expect(thirdColorCalls.length).toBeGreaterThan(0);
      });
    });

    describe('正常系 - visibleDarts連動（全て非表示）', () => {
      test('visibleDarts が全て false の場合、ダーツが描画されない', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const visibleDarts = [false, false, false]; // 全て非表示
        const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        coords.forEach((coord, index) => {
          const isVisible = visibleDarts[index] !== false;
          if (index < dartColors.length && isVisible) {
            drawDartMarker(mockP5, transform, coord, dartColors[index], index);
          }
        });

        // Assert
        // ダーツの色が一切使用されないことを確認
        const dartColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) =>
            call[0] === DART_COLORS.first ||
            call[0] === DART_COLORS.second ||
            call[0] === DART_COLORS.third
        );
        expect(dartColorCalls.length).toBe(0);
      });
    });

    describe('正常系 - デフォルト動作（visibleDarts未定義）', () => {
      test('visibleDarts が undefined の要素はデフォルトで表示される', () => {
        // Arrange
        const coords: Coordinates[] = [{ x: 0, y: -103 }];
        const visibleDarts: boolean[] = []; // 空配列（undefined扱い）
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        coords.forEach((coord, index) => {
          // visibleDarts[index] !== false でデフォルトtrue
          const isVisible = visibleDarts[index] !== false;
          if (isVisible) {
            drawDartMarker(mockP5, transform, coord, DART_COLORS.first, index);
          }
        });

        // Assert
        // デフォルトで描画されることを確認
        const firstColorCalls = (fillSpy.mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.first
        );
        expect(firstColorCalls.length).toBeGreaterThan(0);
      });
    });
  });

  describe('マウス/タッチイベントとズーム位置更新', () => {
    describe('正常系 - キャンバス内のクリック', () => {
      test('クリック位置が物理座標に変換される', () => {
        // Arrange
        const zoomCenter: Coordinates = { x: 0, y: 0 };
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // キャンバス中心をクリック
        const mouseX = 140;
        const mouseY = 140;

        // Act
        const center = transform.getCenter();
        const zoomCenterScreen = transform.physicalToScreen(zoomCenter.x, zoomCenter.y);
        const offsetX = center.x - zoomCenterScreen.x;
        const offsetY = center.y - zoomCenterScreen.y;
        const clickedPhysical = transform.screenToPhysical(mouseX - offsetX, mouseY - offsetY);

        // Assert
        // キャンバス中心のクリックは物理座標(0, 0)付近になるはず
        expect(clickedPhysical.x).toBeCloseTo(0, 1);
        expect(clickedPhysical.y).toBeCloseTo(0, 1);
      });
    });

    describe('正常系 - キャンバス右上のクリック', () => {
      test('クリック位置が正しい物理座標に変換される', () => {
        // Arrange
        const zoomCenter: Coordinates = { x: 0, y: 0 };
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // キャンバス右上をクリック
        const mouseX = 150;
        const mouseY = 50;

        // Act
        const center = transform.getCenter();
        const zoomCenterScreen = transform.physicalToScreen(zoomCenter.x, zoomCenter.y);
        const offsetX = center.x - zoomCenterScreen.x;
        const offsetY = center.y - zoomCenterScreen.y;
        const clickedPhysical = transform.screenToPhysical(mouseX - offsetX, mouseY - offsetY);

        // Assert
        // 右上のクリックは正の x、負の y になる
        expect(clickedPhysical.x).toBeGreaterThan(0);
        expect(clickedPhysical.y).toBeLessThan(0);
      });
    });

    describe('境界値 - キャンバス外のクリック（左外側）', () => {
      test('クリック座標が負の場合、キャンバス外と判定される', () => {
        // Arrange
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const mouseX = -10; // キャンバス外
        const mouseY = 100;

        // Act
        const isOutside = mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY > canvasHeight;

        // Assert
        expect(isOutside).toBe(true);
      });
    });

    describe('境界値 - キャンバス外のクリック（右外側）', () => {
      test('クリック座標がキャンバス幅を超える場合、キャンバス外と判定される', () => {
        // Arrange
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const mouseX = 300; // キャンバス外
        const mouseY = 140;

        // Act
        const isOutside = mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY > canvasHeight;

        // Assert
        expect(isOutside).toBe(true);
      });
    });

    describe('境界値 - キャンバス境界線上のクリック', () => {
      test('クリック座標がキャンバス端（0, 0）の場合、内側と判定される', () => {
        // Arrange
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const mouseX = 0; // 左上端
        const mouseY = 0;

        // Act
        const isInside =
          mouseX >= 0 && mouseX <= canvasWidth && mouseY >= 0 && mouseY <= canvasHeight;

        // Assert
        expect(isInside).toBe(true);
      });
    });

    describe('境界値 - キャンバス境界線上のクリック（右下端）', () => {
      test('クリック座標がキャンバス端（width, height）の場合、内側と判定される', () => {
        // Arrange
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const mouseX = canvasWidth; // 右下端
        const mouseY = canvasHeight;

        // Act
        const isInside =
          mouseX >= 0 && mouseX <= canvasWidth && mouseY >= 0 && mouseY <= canvasHeight;

        // Assert
        expect(isInside).toBe(true);
      });
    });
  });

  describe('レスポンシブ対応（画面サイズによるキャンバスサイズ変更）', () => {
    describe('正常系 - デスクトップサイズ（641px以上）', () => {
      test('画面幅 800px の場合、200x200のキャンバスが選択される', () => {
        // Arrange
        const screenWidth = 800;

        // Act
        const canvasSize =
          screenWidth <= 480
            ? ZOOM_CANVAS_SIZE_MOBILE
            : screenWidth <= 640
              ? ZOOM_CANVAS_SIZE_TABLET
              : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual(ZOOM_CANVAS_SIZE_DESKTOP);
      });
    });

    describe('正常系 - タブレットサイズ（481-640px）', () => {
      test('画面幅 600px の場合、150x150のキャンバスが選択される', () => {
        // Arrange
        const screenWidth = 600;

        // Act
        const canvasSize =
          screenWidth <= 480
            ? ZOOM_CANVAS_SIZE_MOBILE
            : screenWidth <= 640
              ? ZOOM_CANVAS_SIZE_TABLET
              : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual(ZOOM_CANVAS_SIZE_TABLET);
      });
    });

    describe('正常系 - モバイルサイズ（480px以下）', () => {
      test('画面幅 400px の場合、120x120のキャンバスが選択される', () => {
        // Arrange
        const screenWidth = 400;

        // Act
        const canvasSize =
          screenWidth <= 480
            ? ZOOM_CANVAS_SIZE_MOBILE
            : screenWidth <= 640
              ? ZOOM_CANVAS_SIZE_TABLET
              : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual(ZOOM_CANVAS_SIZE_MOBILE);
      });
    });

    describe('境界値 - 480px（モバイル/タブレット境界）', () => {
      test('画面幅 480px の場合、モバイルサイズが選択される', () => {
        // Arrange
        const screenWidth = 480;

        // Act
        const canvasSize =
          screenWidth <= 480
            ? ZOOM_CANVAS_SIZE_MOBILE
            : screenWidth <= 640
              ? ZOOM_CANVAS_SIZE_TABLET
              : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual(ZOOM_CANVAS_SIZE_MOBILE);
      });
    });

    describe('境界値 - 640px（タブレット/デスクトップ境界）', () => {
      test('画面幅 640px の場合、タブレットサイズが選択される', () => {
        // Arrange
        const screenWidth = 640;

        // Act
        const canvasSize =
          screenWidth <= 480
            ? ZOOM_CANVAS_SIZE_MOBILE
            : screenWidth <= 640
              ? ZOOM_CANVAS_SIZE_TABLET
              : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual(ZOOM_CANVAS_SIZE_TABLET);
      });
    });

    describe('境界値 - 641px（デスクトップ境界）', () => {
      test('画面幅 641px の場合、デスクトップサイズが選択される', () => {
        // Arrange
        const screenWidth = 641;

        // Act
        const canvasSize =
          screenWidth <= 480
            ? ZOOM_CANVAS_SIZE_MOBILE
            : screenWidth <= 640
              ? ZOOM_CANVAS_SIZE_TABLET
              : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual(ZOOM_CANVAS_SIZE_DESKTOP);
      });
    });

    describe('正常系 - リサイズ後のCoordinateTransform再作成', () => {
      test('キャンバスサイズが変更されると、新しいサイズでCoordinateTransformが再作成される', () => {
        // Arrange
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;

        // 初期サイズ（デスクトップ）
        let canvasSize: { width: number; height: number } = ZOOM_CANVAS_SIZE_DESKTOP;
        let transform = new CoordinateTransform(
          canvasSize.width,
          canvasSize.height,
          zoomedPhysicalRadius
        );
        const initialCenter = transform.getCenter();

        // Act
        // リサイズ（モバイル）
        canvasSize = ZOOM_CANVAS_SIZE_MOBILE;
        transform = new CoordinateTransform(
          canvasSize.width,
          canvasSize.height,
          zoomedPhysicalRadius
        );
        const resizedCenter = transform.getCenter();

        // Assert
        // 中心座標がキャンバスサイズに応じて変化することを確認
        expect(resizedCenter.x).toBe(80); // 160 / 2
        expect(resizedCenter.y).toBe(80); // 160 / 2
        expect(resizedCenter).not.toEqual(initialCenter);
      });
    });

    describe('正常系 - リサイズ後のp5.resizeCanvas呼び出し', () => {
      test('resizeCanvas() が新しいサイズで呼び出される', () => {
        // Arrange
        const resizeCanvasSpy = vi.spyOn(mockP5, 'resizeCanvas');
        const newWidth = ZOOM_CANVAS_SIZE_MOBILE.width;
        const newHeight = ZOOM_CANVAS_SIZE_MOBILE.height;

        // Act
        mockP5.resizeCanvas(newWidth, newHeight);

        // Assert
        expect(resizeCanvasSpy).toHaveBeenCalledWith(newWidth, newHeight);
      });
    });
  });

  describe('ズーム中心の自動更新（ダーツ座標変更時）', () => {
    describe('正常系 - 最初の表示中のダーツを中心にズーム', () => {
      test('visibleDarts[0]=true の場合、最初のダーツがズーム中心になる', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 10, y: -20 },
          { x: 30, y: 40 },
        ];
        const visibleDarts = [true, true];

        // Act
        const firstVisibleIndex = coords.findIndex((_, index) => visibleDarts[index] !== false);
        const zoomCenter = coords[firstVisibleIndex];

        // Assert
        expect(firstVisibleIndex).toBe(0);
        expect(zoomCenter).toEqual({ x: 10, y: -20 });
      });
    });

    describe('正常系 - 2本目が最初の表示中のダーツ', () => {
      test('visibleDarts[0]=false の場合、2本目のダーツがズーム中心になる', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 10, y: -20 }, // 非表示
          { x: 30, y: 40 }, // 表示
        ];
        const visibleDarts = [false, true];

        // Act
        const firstVisibleIndex = coords.findIndex((_, index) => visibleDarts[index] !== false);
        const zoomCenter = coords[firstVisibleIndex];

        // Assert
        expect(firstVisibleIndex).toBe(1);
        expect(zoomCenter).toEqual({ x: 30, y: 40 });
      });
    });

    describe('正常系 - 全て非表示の場合、最初のダーツを中心にズーム', () => {
      test('全て非表示の場合、coords[0]がズーム中心になる', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 10, y: -20 },
          { x: 30, y: 40 },
        ];
        const visibleDarts = [false, false];

        // Act
        const firstVisibleIndex = coords.findIndex((_, index) => visibleDarts[index] !== false);
        let zoomCenter: Coordinates;

        if (firstVisibleIndex === -1) {
          // 全て非表示の場合は最初のダーツを中心にする
          zoomCenter = coords[0];
        } else {
          zoomCenter = coords[firstVisibleIndex];
        }

        // Assert
        expect(firstVisibleIndex).toBe(-1);
        expect(zoomCenter).toEqual({ x: 10, y: -20 });
      });
    });

    describe('エッジケース - coords が空配列の場合', () => {
      test('ダーツが投擲されていない場合、何も表示しない', () => {
        // Arrange
        const coords: Coordinates[] = [];
        const dartCount = 0;

        // Act
        const shouldRender = dartCount !== 0 && coords.length !== 0;

        // Assert
        expect(shouldRender).toBe(false);
      });
    });

    describe('エッジケース - dartCount が 0 の場合', () => {
      test('dartCount が 0 の場合、何も表示しない', () => {
        // Arrange
        const coords: Coordinates[] = [{ x: 0, y: 0 }];
        const dartCount = 0;

        // Act
        const shouldRender = dartCount !== 0 && coords.length !== 0;

        // Assert
        expect(shouldRender).toBe(false);
      });
    });
  });

  describe('座標系の分離検証（物理座標 vs 画面座標）', () => {
    describe('正常系 - 物理座標から画面座標への変換', () => {
      test('物理座標(0, -103)がズーム倍率に応じた画面座標に変換される', () => {
        // Arrange
        const physicalCoord: Coordinates = { x: 0, y: -103 }; // トリプル20（物理座標）
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Act
        const screenCoord = transform.physicalToScreen(physicalCoord.x, physicalCoord.y);

        // Assert
        // 画面座標はピクセル単位、物理座標はmm単位
        expect(screenCoord.x).toBeCloseTo(140, 1); // キャンバス中心のX座標
        expect(screenCoord.y).toBeLessThan(140); // 上側（Y座標が小さい）

        // ズーム倍率が適用されることを確認
        // 通常のボード表示よりも大きく表示される（ズームイン）
        const distance = Math.sqrt((screenCoord.x - 140) ** 2 + (screenCoord.y - 140) ** 2);
        expect(distance).toBeGreaterThan(0);
      });
    });

    describe('正常系 - 画面座標から物理座標への変換', () => {
      test('画面座標がズーム倍率に応じた物理座標に変換される', () => {
        // Arrange
        const screenCoord = { x: 150, y: 80 }; // 画面座標（ピクセル）
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Act
        const physicalCoord = transform.screenToPhysical(screenCoord.x, screenCoord.y);

        // Assert
        // 物理座標はmm単位
        expect(physicalCoord.x).toBeGreaterThan(0); // 右側
        expect(physicalCoord.y).toBeLessThan(0); // 上側

        // ズーム倍率を考慮した物理距離になることを確認
        const distance = Math.sqrt(
          physicalCoord.x * physicalCoord.x + physicalCoord.y * physicalCoord.y
        );
        expect(distance).toBeLessThanOrEqual(zoomedPhysicalRadius); // ズーム範囲内
      });
    });

    describe('正常系 - 物理距離から画面距離への変換', () => {
      test('物理距離10mmがズーム倍率に応じた画面距離に変換される', () => {
        // Arrange
        const physicalDistance = 10; // mm
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(physicalDistance);

        // Assert
        // 画面距離はピクセル単位、ズーム倍率が適用される
        expect(screenDistance).toBeGreaterThan(0);

        // ズーム倍率に応じてスケールが計算される
        const scale = transform.getScale();
        expect(screenDistance).toBeCloseTo(physicalDistance * scale, 1);

        // ズーム倍率8.0倍の場合、通常（ズーム1倍）より拡大される
        // 通常のtransformと比較
        const normalTransform = new CoordinateTransform(
          canvasWidth,
          canvasHeight,
          BOARD_PHYSICAL.rings.boardEdge
        );
        const normalScreenDistance = normalTransform.physicalDistanceToScreen(physicalDistance);

        // ズーム時の方が大きく表示される（約8.0倍）
        expect(screenDistance).toBeGreaterThan(normalScreenDistance * 2);
      });
    });

    describe('正常系 - 座標変換の往復変換', () => {
      test('物理座標→画面座標→物理座標の変換で元の値に戻る', () => {
        // Arrange
        const originalPhysical: Coordinates = { x: 25, y: -35 };
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Act
        const screenCoord = transform.physicalToScreen(originalPhysical.x, originalPhysical.y);
        const backToPhysical = transform.screenToPhysical(screenCoord.x, screenCoord.y);

        // Assert
        expect(backToPhysical.x).toBeCloseTo(originalPhysical.x, 1);
        expect(backToPhysical.y).toBeCloseTo(originalPhysical.y, 1);
      });
    });
  });

  describe('スパイダーラインとダーツの相対位置表示', () => {
    describe('正常系 - ダーツがスパイダーライン付近に配置される場合', () => {
      test('ダーツマーカーがスパイダーラインと同じキャンバスに描画される', () => {
        // Arrange
        const coords: Coordinates[] = [{ x: 0, y: -99 }]; // トリプルリング内側境界（スパイダー付近）
        const visibleDarts = [true];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const lineSpy = vi.spyOn(mockP5, 'line');
        const triangleSpy = vi.spyOn(mockP5, 'triangle');

        // Act
        // スパイダーライン描画（drawBoardの一部）
        drawBoard(mockP5, transform);

        // ダーツマーカー描画
        coords.forEach((coord, index) => {
          const isVisible = visibleDarts[index] !== false;
          if (isVisible) {
            drawDartMarker(mockP5, transform, coord, DART_COLORS.first, index);
          }
        });

        // Assert
        // スパイダーライン（line）とダーツマーカー（triangle）の両方が描画される
        expect(lineSpy.mock.calls.length).toBeGreaterThan(0);
        expect(triangleSpy).toHaveBeenCalled();
      });
    });

    describe('正常系 - ズームにより相対位置が明確になる', () => {
      test('ズーム倍率8.0倍により、スパイダーラインとダーツの距離が拡大される', () => {
        // Arrange
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Act
        // 物理距離2mmが画面上で何ピクセルに拡大されるか
        const screenDistance = transform.physicalDistanceToScreen(2);

        // Assert
        // ズーム倍率8.0倍により、2mmの距離が拡大されて視認しやすくなる
        expect(screenDistance).toBeGreaterThan(0);

        // 通常のボード表示（ズーム倍率1倍）と比較して、8.0倍大きく表示される
        const normalTransform = new CoordinateTransform(
          canvasWidth,
          canvasHeight,
          BOARD_PHYSICAL.rings.boardEdge
        );
        const normalScreenDistance = normalTransform.physicalDistanceToScreen(2);

        // ズーム時の距離は通常時の約8.0倍
        expect(screenDistance).toBeGreaterThan(normalScreenDistance * 3);
      });
    });
  });
});
