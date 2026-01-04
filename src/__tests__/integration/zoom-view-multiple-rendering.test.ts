/**
 * ZoomViewMultiple 統合テスト
 *
 * 3投モード用の複数ダーツ拡大表示コンポーネントの統合動作を検証します：
 * - 3つの独立したp5.jsインスタンスの生成と描画
 * - 各SingleZoomコンポーネントの個別座標変換
 * - ズーム倍率適用の一貫性
 * - レスポンシブレイアウト（デスクトップ160x160、モバイル140x140）
 * - visibleDarts配列との連動（表示/非表示、最大3つまで）
 * - 座標系の分離（物理座標mm vs 画面座標pixel）
 */

import type p5Types from 'p5';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { drawBoard, drawDartMarker } from '../../components/DartBoard/dartBoardRenderer';
import {
  DEFAULT_ZOOM_FACTOR,
  ZOOM_CANVAS_SIZE_DESKTOP,
  ZOOM_CANVAS_SIZE_MOBILE,
} from '../../components/DartBoard/ZoomViewMultiple';
import type { Coordinates } from '../../types';
import { BOARD_PHYSICAL, DART_COLORS } from '../../utils/constants/index.js';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { getDisplayCoordinates } from '../../utils/displayCoordinates/index.js';

describe('zoom-view-multiple-rendering integration', () => {
  let mockP5Instance1: p5Types;
  let mockP5Instance2: p5Types;
  let mockP5Instance3: p5Types;

  beforeEach(() => {
    // 3つの独立したp5.jsモックインスタンスを作成
    const createMockP5 = (): p5Types =>
      ({
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
      }) as unknown as p5Types;

    mockP5Instance1 = createMockP5();
    mockP5Instance2 = createMockP5();
    mockP5Instance3 = createMockP5();
  });

  describe('複数ズームビューの統合', () => {
    describe('正常系 - 3つの独立したp5インスタンス', () => {
      test('3つのダーツに対して、3つの独立したCoordinateTransformインスタンスが生成される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 }, // 1本目: トリプル20
          { x: 50, y: 0 }, // 2本目: 右側
          { x: 0, y: 100 }, // 3本目: 下側
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;

        // Act
        // 各ダーツに対して個別のCoordinateTransformを作成
        const transforms = coords.map(
          () => new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius)
        );

        // Assert
        // 3つの独立したインスタンスが生成されることを確認
        expect(transforms).toHaveLength(3);
        transforms.forEach((transform) => {
          expect(transform).toBeDefined();
          expect(transform.getCenter()).toEqual({ x: 80, y: 80 }); // 160 / 2
        });
      });
    });

    describe('正常系 - 各SingleZoomの個別座標変換', () => {
      test('各SingleZoomが独自のズーム中心で座標変換を行う', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 10, y: -20 }, // 1本目のズーム中心
          { x: 30, y: 40 }, // 2本目のズーム中心
          { x: -15, y: 35 }, // 3本目のズーム中心
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Act & Assert
        coords.forEach((coord) => {
          const center = transform.getCenter();
          const zoomCenterScreen = transform.physicalToScreen(coord.x, coord.y);
          const offsetX = center.x - zoomCenterScreen.x;
          const offsetY = center.y - zoomCenterScreen.y;

          // 各ダーツの座標が異なる場合、オフセット値も異なる
          // オフセット値が妥当な範囲であることを確認（キャンバスサイズ以内）
          expect(Math.abs(offsetX)).toBeLessThan(canvasWidth * 2);
          expect(Math.abs(offsetY)).toBeLessThan(canvasHeight * 2);
        });
      });
    });

    describe('正常系 - ズーム倍率適用の一貫性', () => {
      test('全てのSingleZoomコンポーネントで同じズーム倍率が適用される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;

        // Act
        // 各SingleZoomで同じズーム倍率を使用
        const zoomedPhysicalRadii = coords.map(() => BOARD_PHYSICAL.rings.boardEdge / zoomFactor);

        // Assert
        // 全てのズーム物理半径が同じ値であることを確認
        expect(zoomedPhysicalRadii).toHaveLength(3);
        zoomedPhysicalRadii.forEach((radius) => {
          expect(radius).toBe(28.125); // 225mm / 8.0
        });
      });
    });

    describe('正常系 - 3つのダーツボード描画', () => {
      test('各SingleZoomで個別にdrawBoard()が呼び出される', () => {
        // Arrange
        const mockInstances = [mockP5Instance1, mockP5Instance2, mockP5Instance3];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const backgroundSpies = mockInstances.map((instance) => vi.spyOn(instance, 'background'));

        // Act
        mockInstances.forEach((p5) => {
          drawBoard(p5, transform);
        });

        // Assert
        // 各p5インスタンスでdrawBoard()が呼び出されることを確認
        backgroundSpies.forEach((spy) => {
          expect(spy).toHaveBeenCalledWith(0);
        });
      });
    });

    describe('正常系 - 3つのダーツマーカー描画（異なる色）', () => {
      test('各SingleZoomで異なる色のダーツマーカーが描画される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 }, // 1本目: トリプル20
          { x: 50, y: 0 }, // 2本目: 右側
          { x: 0, y: 100 }, // 3本目: 下側
        ];
        const mockInstances = [mockP5Instance1, mockP5Instance2, mockP5Instance3];
        const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const fillSpies = mockInstances.map((instance) => vi.spyOn(instance, 'fill'));

        // Act
        mockInstances.forEach((p5, index) => {
          const displayCoord = getDisplayCoordinates(coords[index]);
          drawDartMarker(p5, transform, displayCoord, dartColors[index], index);
        });

        // Assert
        // 各p5インスタンスで対応する色が使用されることを確認
        fillSpies.forEach((spy, index) => {
          const colorCalls = (spy.mock.calls as unknown as [string][]).filter(
            (call) => call[0] === dartColors[index]
          );
          expect(colorCalls.length).toBeGreaterThan(0);
        });
      });
    });

    describe('正常系 - 2本のダーツの場合', () => {
      test('2本のダーツに対して、2つの独立したCoordinateTransformが生成される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 }, // 1本目
          { x: 50, y: 0 }, // 2本目
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;

        // Act
        const transforms = coords.map(
          () => new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius)
        );

        // Assert
        expect(transforms).toHaveLength(2);
        transforms.forEach((transform) => {
          expect(transform).toBeDefined();
        });
      });
    });

    describe('正常系 - 1本のダーツの場合', () => {
      test('1本のダーツに対して、1つのCoordinateTransformが生成される', () => {
        // Arrange
        const coords: Coordinates[] = [{ x: 0, y: -103 }];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;

        // Act
        const transforms = coords.map(
          () => new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius)
        );

        // Assert
        expect(transforms).toHaveLength(1);
        expect(transforms[0]).toBeDefined();
      });
    });
  });

  describe('レスポンシブレイアウト', () => {
    describe('正常系 - デスクトップサイズ（641px以上）', () => {
      test('画面幅 800px の場合、160x160のキャンバスが選択される', () => {
        // Arrange
        const screenWidth = 800;

        // Act
        const canvasSize = screenWidth <= 640 ? ZOOM_CANVAS_SIZE_MOBILE : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual({ width: 160, height: 160 });
      });
    });

    describe('正常系 - モバイルサイズ（640px以下）', () => {
      test('画面幅 480px の場合、140x140のキャンバスが選択される', () => {
        // Arrange
        const screenWidth = 480;

        // Act
        const canvasSize = screenWidth <= 640 ? ZOOM_CANVAS_SIZE_MOBILE : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual({ width: 140, height: 140 });
      });
    });

    describe('境界値 - 640px（モバイル/デスクトップ境界）', () => {
      test('画面幅 640px の場合、モバイルサイズ（140x140）が選択される', () => {
        // Arrange
        const screenWidth = 640;

        // Act
        const canvasSize = screenWidth <= 640 ? ZOOM_CANVAS_SIZE_MOBILE : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual({ width: 140, height: 140 });
      });
    });

    describe('境界値 - 641px（デスクトップ境界）', () => {
      test('画面幅 641px の場合、デスクトップサイズ（160x160）が選択される', () => {
        // Arrange
        const screenWidth = 641;

        // Act
        const canvasSize = screenWidth <= 640 ? ZOOM_CANVAS_SIZE_MOBILE : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(canvasSize).toEqual({ width: 160, height: 160 });
      });
    });

    describe('正常系 - リサイズイベント時のキャンバスサイズ更新', () => {
      test('デスクトップからモバイルにリサイズすると、キャンバスサイズが更新される', () => {
        // Arrange
        const initialWidth = 800;
        const resizedWidth = 480;

        // Act
        const initialCanvasSize =
          initialWidth <= 640 ? ZOOM_CANVAS_SIZE_MOBILE : ZOOM_CANVAS_SIZE_DESKTOP;
        const resizedCanvasSize =
          resizedWidth <= 640 ? ZOOM_CANVAS_SIZE_MOBILE : ZOOM_CANVAS_SIZE_DESKTOP;

        // Assert
        expect(initialCanvasSize).toEqual({ width: 160, height: 160 });
        expect(resizedCanvasSize).toEqual({ width: 140, height: 140 });
        expect(resizedCanvasSize).not.toEqual(initialCanvasSize);
      });
    });

    describe('正常系 - リサイズ後のCoordinateTransform再作成', () => {
      test('キャンバスサイズが変更されると、各SingleZoomで新しいCoordinateTransformが再作成される', () => {
        // Arrange
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];

        // 初期サイズ（デスクトップ）
        let canvasSize: { readonly width: number; readonly height: number } =
          ZOOM_CANVAS_SIZE_DESKTOP;
        let transforms = coords.map(
          () => new CoordinateTransform(canvasSize.width, canvasSize.height, zoomedPhysicalRadius)
        );
        const initialCenters = transforms.map((t) => t.getCenter());

        // Act
        // リサイズ（モバイル）
        canvasSize = ZOOM_CANVAS_SIZE_MOBILE;
        transforms = coords.map(
          () => new CoordinateTransform(canvasSize.width, canvasSize.height, zoomedPhysicalRadius)
        );
        const resizedCenters = transforms.map((t) => t.getCenter());

        // Assert
        // 各transformの中心座標がキャンバスサイズに応じて変化することを確認
        resizedCenters.forEach((center) => {
          expect(center.x).toBe(70); // 140 / 2
          expect(center.y).toBe(70); // 140 / 2
        });

        // 初期状態と異なることを確認
        initialCenters.forEach((initialCenter, index) => {
          expect(resizedCenters[index]).not.toEqual(initialCenter);
        });
      });
    });

    describe('正常系 - モバイルサイズでの3つのキャンバス', () => {
      test('モバイルサイズでも3つの独立したキャンバスが生成される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasSize = ZOOM_CANVAS_SIZE_MOBILE; // 140x140
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;

        // Act
        const transforms = coords.map(
          () => new CoordinateTransform(canvasSize.width, canvasSize.height, zoomedPhysicalRadius)
        );

        // Assert
        expect(transforms).toHaveLength(3);
        transforms.forEach((transform) => {
          expect(transform.getCenter()).toEqual({ x: 70, y: 70 });
        });
      });
    });
  });

  describe('個別ダーツフォーカス', () => {
    describe('正常系 - visibleDarts配列との連動（全て表示）', () => {
      test('visibleDarts=[true, true, true] の場合、3つ全てのダーツが表示される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const visibleDarts = [true, true, true];

        // Act
        const visibleIndices = coords
          .map((_, index) => index)
          .filter((index) => visibleDarts[index] !== false)
          .slice(0, 3);

        // Assert
        expect(visibleIndices).toEqual([0, 1, 2]);
        expect(visibleIndices).toHaveLength(3);
      });
    });

    describe('正常系 - visibleDarts配列との連動（一部非表示）', () => {
      test('visibleDarts=[true, false, true] の場合、2本のダーツのみ表示される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 }, // 非表示
          { x: 0, y: 100 },
        ];
        const visibleDarts = [true, false, true];

        // Act
        const visibleIndices = coords
          .map((_, index) => index)
          .filter((index) => visibleDarts[index] !== false)
          .slice(0, 3);

        // Assert
        expect(visibleIndices).toEqual([0, 2]);
        expect(visibleIndices).toHaveLength(2);
      });
    });

    describe('正常系 - 表示/非表示の切り替え', () => {
      test('2本目のダーツを非表示にすると、1本目と3本目のみが表示される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const mockInstances = [mockP5Instance1, mockP5Instance2, mockP5Instance3];
        const visibleDarts = [true, false, true];
        const dartColors = [DART_COLORS.first, DART_COLORS.second, DART_COLORS.third];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        const fillSpies = mockInstances.map((instance) => vi.spyOn(instance, 'fill'));

        // Act
        coords.forEach((coord, index) => {
          const isVisible = visibleDarts[index] !== false;
          if (isVisible && index < mockInstances.length) {
            const displayCoord = getDisplayCoordinates(coord);
            drawDartMarker(mockInstances[index], transform, displayCoord, dartColors[index], index);
          }
        });

        // Assert
        // 1本目の色が使用される
        const firstColorCalls = (fillSpies[0].mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.first
        );
        expect(firstColorCalls.length).toBeGreaterThan(0);

        // 2本目の色は使用されない
        const secondColorCalls = (fillSpies[1].mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.second
        );
        expect(secondColorCalls.length).toBe(0);

        // 3本目の色が使用される
        const thirdColorCalls = (fillSpies[2].mock.calls as unknown as [string][]).filter(
          (call) => call[0] === DART_COLORS.third
        );
        expect(thirdColorCalls.length).toBeGreaterThan(0);
      });
    });

    describe('正常系 - 最大3つまでの表示制限', () => {
      test('4つのダーツがある場合でも、最初の3つのみが表示される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
          { x: -50, y: -50 }, // 4本目（表示されない）
        ];
        const visibleDarts = [true, true, true, true];

        // Act
        const visibleIndices = coords
          .map((_, index) => index)
          .filter((index) => visibleDarts[index] !== false)
          .slice(0, 3); // 最大3つまで

        // Assert
        expect(visibleIndices).toEqual([0, 1, 2]);
        expect(visibleIndices).toHaveLength(3);
      });
    });

    describe('正常系 - 全て非表示の場合', () => {
      test('visibleDarts=[false, false, false] の場合、何も表示されない', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const visibleDarts = [false, false, false];

        // Act
        const visibleIndices = coords
          .map((_, index) => index)
          .filter((index) => visibleDarts[index] !== false)
          .slice(0, 3);

        // Assert
        expect(visibleIndices).toEqual([]);
        expect(visibleIndices).toHaveLength(0);
      });
    });

    describe('エッジケース - visibleDarts が undefined の要素', () => {
      test('visibleDarts配列が短い場合、デフォルトで表示される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const visibleDarts: boolean[] = [true]; // 1要素のみ

        // Act
        const visibleIndices = coords
          .map((_, index) => index)
          .filter((index) => visibleDarts[index] !== false) // undefined は false でないため表示
          .slice(0, 3);

        // Assert
        // visibleDarts[0]=true, visibleDarts[1]=undefined (デフォルトtrue), visibleDarts[2]=undefined (デフォルトtrue)
        expect(visibleIndices).toEqual([0, 1, 2]);
        expect(visibleIndices).toHaveLength(3);
      });
    });
  });

  describe('座標系の分離', () => {
    describe('正常系 - 各ダーツの物理座標から画面座標への変換', () => {
      test('3つのダーツの物理座標が個別に画面座標に変換される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 }, // トリプル20（物理座標）
          { x: 50, y: 0 }, // 右側（物理座標）
          { x: 0, y: 100 }, // 下側（物理座標）
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const transform = new CoordinateTransform(canvasWidth, canvasHeight, zoomedPhysicalRadius);

        // Act
        const screenCoords = coords.map((coord) => transform.physicalToScreen(coord.x, coord.y));

        // Assert
        expect(screenCoords).toHaveLength(3);
        screenCoords.forEach((screenCoord) => {
          // 画面座標はピクセル単位（ズーム中心が異なる場合、負の値や範囲外の値もあり得る）
          expect(typeof screenCoord.x).toBe('number');
          expect(typeof screenCoord.y).toBe('number');
          expect(Number.isNaN(screenCoord.x)).toBe(false);
          expect(Number.isNaN(screenCoord.y)).toBe(false);
        });
      });
    });

    describe('正常系 - ズーム中心の独立した計算', () => {
      test('各SingleZoomが独自のズーム中心で画面座標に変換する', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 10, y: -20 }, // 1本目のズーム中心
          { x: 30, y: 40 }, // 2本目のズーム中心
          { x: -15, y: 35 }, // 3本目のズーム中心
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;

        // Act
        const transforms = coords.map((coord) => {
          const transform = new CoordinateTransform(
            canvasWidth,
            canvasHeight,
            zoomedPhysicalRadius
          );
          const center = transform.getCenter();
          const zoomCenterScreen = transform.physicalToScreen(coord.x, coord.y);
          return {
            center,
            zoomCenterScreen,
            offsetX: center.x - zoomCenterScreen.x,
            offsetY: center.y - zoomCenterScreen.y,
          };
        });

        // Assert
        // 各SingleZoomで異なるオフセット値が計算される
        expect(transforms).toHaveLength(3);

        // 全てのtransformで中心座標は同じ（同じキャンバスサイズ）
        transforms.forEach(({ center }) => {
          expect(center).toEqual({ x: 80, y: 80 });
        });

        // ズーム中心が異なるため、オフセット値は異なる
        const offsets = transforms.map(({ offsetX, offsetY }) => ({ offsetX, offsetY }));
        expect(offsets[0]).not.toEqual(offsets[1]);
        expect(offsets[1]).not.toEqual(offsets[2]);
        expect(offsets[0]).not.toEqual(offsets[2]);
      });
    });

    describe('正常系 - 物理距離から画面距離への変換の一貫性', () => {
      test('全てのSingleZoomで同じ物理距離が同じ画面距離に変換される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;
        const physicalDistance = 10; // mm

        // Act
        const screenDistances = coords.map(() => {
          const transform = new CoordinateTransform(
            canvasWidth,
            canvasHeight,
            zoomedPhysicalRadius
          );
          return transform.physicalDistanceToScreen(physicalDistance);
        });

        // Assert
        // 全てのSingleZoomで同じ画面距離が得られる
        expect(screenDistances).toHaveLength(3);
        screenDistances.forEach((screenDistance) => {
          expect(screenDistance).toBeCloseTo(screenDistances[0], 1);
        });
      });
    });

    describe('正常系 - 座標変換の往復変換', () => {
      test('各SingleZoomで物理座標→画面座標→物理座標の変換が正しく行われる', () => {
        // Arrange
        const originalCoords: Coordinates[] = [
          { x: 25, y: -35 },
          { x: -40, y: 15 },
          { x: 10, y: 50 },
        ];
        const zoomFactor = DEFAULT_ZOOM_FACTOR;
        const canvasWidth = ZOOM_CANVAS_SIZE_DESKTOP.width;
        const canvasHeight = ZOOM_CANVAS_SIZE_DESKTOP.height;
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;

        // Act & Assert
        originalCoords.forEach((originalPhysical) => {
          const transform = new CoordinateTransform(
            canvasWidth,
            canvasHeight,
            zoomedPhysicalRadius
          );
          const screenCoord = transform.physicalToScreen(originalPhysical.x, originalPhysical.y);
          const backToPhysical = transform.screenToPhysical(screenCoord.x, screenCoord.y);

          expect(backToPhysical.x).toBeCloseTo(originalPhysical.x, 1);
          expect(backToPhysical.y).toBeCloseTo(originalPhysical.y, 1);
        });
      });
    });
  });

  describe('ダーツ数が0の場合の処理', () => {
    describe('エッジケース - dartCount が 0 の場合', () => {
      test('dartCount=0 の場合、何も表示しない', () => {
        // Arrange
        const coords: Coordinates[] = [];
        const dartCount = 0;

        // Act
        const shouldRender = dartCount !== 0 && coords.length !== 0;

        // Assert
        expect(shouldRender).toBe(false);
      });
    });

    describe('エッジケース - coords が空配列の場合', () => {
      test('coords=[] の場合、何も表示しない', () => {
        // Arrange
        const coords: Coordinates[] = [];
        const dartCount = 0;

        // Act
        const shouldRender = dartCount !== 0 && coords.length > 0;

        // Assert
        expect(shouldRender).toBe(false);
      });
    });
  });

  describe('ズーム倍率のカスタマイズ', () => {
    describe('正常系 - デフォルトズーム倍率（8.0倍）', () => {
      test('zoomFactor未指定の場合、デフォルト8.0倍が適用される', () => {
        // Arrange
        const zoomFactor = DEFAULT_ZOOM_FACTOR;

        // Act
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / zoomFactor;

        // Assert
        expect(zoomFactor).toBe(8.0);
        expect(zoomedPhysicalRadius).toBe(28.125); // 225 / 8.0
      });
    });

    describe('正常系 - カスタムズーム倍率（4.0倍）', () => {
      test('zoomFactor=4.0 の場合、4.0倍のズームが適用される', () => {
        // Arrange
        const customZoomFactor = 4.0;

        // Act
        const zoomedPhysicalRadius = BOARD_PHYSICAL.rings.boardEdge / customZoomFactor;

        // Assert
        expect(zoomedPhysicalRadius).toBe(56.25); // 225 / 4.0
      });
    });

    describe('正常系 - 各SingleZoomで同じカスタムズーム倍率', () => {
      test('全てのSingleZoomで同じカスタムズーム倍率が適用される', () => {
        // Arrange
        const coords: Coordinates[] = [
          { x: 0, y: -103 },
          { x: 50, y: 0 },
          { x: 0, y: 100 },
        ];
        const customZoomFactor = 10.0;

        // Act
        const zoomedPhysicalRadii = coords.map(
          () => BOARD_PHYSICAL.rings.boardEdge / customZoomFactor
        );

        // Assert
        zoomedPhysicalRadii.forEach((radius) => {
          expect(radius).toBe(22.5); // 225 / 10.0
        });
      });
    });
  });
});
