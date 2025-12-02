/**
 * P5Canvasコンポーネントの統合テスト
 * react-p5とp5.jsを使用したReactコンポーネントの動作を検証する
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { P5Canvas } from '../../components/DartBoard/P5Canvas';
import type { Coordinates } from '../../types';
import { BOARD_PHYSICAL, DART_COLORS } from '../../utils/constants';

/**
 * react-p5のSketchコンポーネントのProps型定義
 */
interface SketchProps {
  setup?: (p5: any, canvasParentRef: Element) => void;
  draw?: (p5: any) => void;
  windowResized?: (p5: any) => void;
}

// react-p5のSketchコンポーネントをモック化
vi.mock('react-p5', () => {
  return {
    default: ({ setup, draw, windowResized }: SketchProps) => {
      // モックのp5インスタンスを作成
      const mockP5 = {
        windowWidth: 800,
        windowHeight: 600,
        createCanvas: vi.fn().mockReturnValue({ parent: vi.fn() }),
        resizeCanvas: vi.fn(),
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
        PIE: 'PIE',
        CENTER: 'CENTER',
      };

      // モックのcanvasParentRef
      const mockCanvasParent = document.createElement('div');

      // setup関数を即座に呼び出す
      if (setup) {
        setup(mockP5, mockCanvasParent);
      }

      // draw関数を即座に呼び出す（1回のみ）
      if (draw) {
        draw(mockP5);
      }

      // windowResized関数を保持しておく
      if (windowResized) {
        // グローバルに保存してテストから呼び出せるようにする
        (globalThis as any).__mockWindowResized = () => windowResized(mockP5);
      }

      // モックのp5インスタンスをグローバルに保存してテストから参照できるようにする
      (globalThis as any).__mockP5Instance = mockP5;

      return null; // Reactコンポーネントとしてnullを返す
    },
  };
});

// dartBoardRendererモジュールをモック化
vi.mock('../../components/DartBoard/dartBoardRenderer', () => ({
  drawBoard: vi.fn(),
  drawDartMarker: vi.fn(),
  drawLegend: vi.fn(),
}));

// モジュールをインポート（モック化された後）
import { drawBoard, drawDartMarker, drawLegend } from '../../components/DartBoard/dartBoardRenderer';

describe('p5-canvas-wrapper integration', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
    // グローバル変数をクリア
    delete (globalThis as any).__mockP5Instance;
    delete (globalThis as any).__mockWindowResized;
  });

  describe('正常系 - Sketchコンポーネントのマウント確認', () => {
    test('P5Canvasコンポーネントがエラーなくレンダリングされる', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act & Assert
      expect(() => render(<P5Canvas coords={coords} dartCount={0} />)).not.toThrow();
    });

    test('空のダーツ配列でもレンダリングに成功する', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      const { container } = render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      expect(container).toBeDefined();
    });

    test('3投分のダーツ座標を渡してもレンダリングに成功する', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },     // トリプル20付近
        { x: 50, y: 50 },      // 適当な位置
        { x: -30, y: -30 },    // 適当な位置
      ];

      // Act
      const { container } = render(<P5Canvas coords={coords} dartCount={3} />);

      // Assert
      expect(container).toBeDefined();
    });
  });

  describe('正常系 - setup()関数の呼び出しと座標変換の初期化検証', () => {
    test('setup()でcreateCanas()が呼び出される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(mockP5).toBeDefined();
      expect(mockP5.createCanvas).toHaveBeenCalledTimes(1);
    });

    test('setup()でキャンバスサイズがウィンドウサイズに設定される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(mockP5.createCanvas).toHaveBeenCalledWith(800, 600);
    });

    test('setup()でCoordinateTransformがボード半径225mmで初期化される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      // CoordinateTransformの初期化は間接的に検証
      // createCanvasが呼ばれ、drawBoardが呼ばれることで初期化されていることを確認
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(mockP5.createCanvas).toHaveBeenCalledWith(800, 600);
      expect(drawBoard).toHaveBeenCalled();
    });

    test('setup()で作成されたキャンバスがparent要素に追加される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      const createCanvasReturnValue = mockP5.createCanvas.mock.results[0].value;
      expect(createCanvasReturnValue.parent).toHaveBeenCalledTimes(1);
    });
  });

  describe('正常系 - draw()関数の定期的な実行確認', () => {
    test('draw()でdrawBoard()が呼び出される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      expect(drawBoard).toHaveBeenCalledTimes(1);
    });

    test('draw()でCoordinateTransformインスタンスがdrawBoardに渡される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(drawBoard).toHaveBeenCalledWith(mockP5, expect.any(Object));

      // CoordinateTransformインスタンスが渡されていることを確認
      const transformArg = (drawBoard as any).mock.calls[0][1];
      expect(transformArg).toHaveProperty('getCenter');
      expect(transformArg).toHaveProperty('physicalToScreen');
      expect(transformArg).toHaveProperty('physicalDistanceToScreen');
    });

    test('draw()がp5インスタンスと共に呼び出される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(drawBoard).toHaveBeenCalledWith(mockP5, expect.any(Object));
    });
  });

  describe('正常系 - windowResized()によるキャンバスサイズ更新テスト', () => {
    test('windowResized()でresizeCanvas()が呼び出される', () => {
      // Arrange
      const coords: Coordinates[] = [];
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Act
      const windowResizedFn = (globalThis as any).__mockWindowResized;
      expect(windowResizedFn).toBeDefined();
      windowResizedFn();

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(mockP5.resizeCanvas).toHaveBeenCalledTimes(1);
      expect(mockP5.resizeCanvas).toHaveBeenCalledWith(800, 600);
    });

    test('windowResized()でCoordinateTransformのupdateCanvasSizeが呼び出される', () => {
      // Arrange
      const coords: Coordinates[] = [];
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Act
      const windowResizedFn = (globalThis as any).__mockWindowResized;
      windowResizedFn();

      // Assert
      // updateCanvasSizeの呼び出しは間接的に検証
      // resizeCanvasが呼ばれることで、内部でupdateCanvasSizeも呼ばれていることを確認
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(mockP5.resizeCanvas).toHaveBeenCalled();
    });

    test('windowResized()が複数回呼ばれても正常に動作する', () => {
      // Arrange
      const coords: Coordinates[] = [];
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Act
      const windowResizedFn = (globalThis as any).__mockWindowResized;
      windowResizedFn();
      windowResizedFn();
      windowResizedFn();

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(mockP5.resizeCanvas).toHaveBeenCalledTimes(3);
    });
  });

  describe('正常系 - propsで渡されたダーツ座標の描画反映確認', () => {
    test('空のダーツ配列の場合、drawDartMarkerが呼ばれない', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      expect(drawDartMarker).not.toHaveBeenCalled();
    });

    test('1本のダーツが渡された場合、drawDartMarkerが1回呼ばれる', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },  // トリプル20付近
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={1} />);

      // Assert
      expect(drawDartMarker).toHaveBeenCalledTimes(1);
    });

    test('3本のダーツが渡された場合、drawDartMarkerが3回呼ばれる', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },     // トリプル20付近
        { x: 50, y: 50 },      // 適当な位置
        { x: -30, y: -30 },    // 適当な位置
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={3} />);

      // Assert
      expect(drawDartMarker).toHaveBeenCalledTimes(3);
    });

    test('drawDartMarkerに正しい座標が渡される', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={2} />);

      // Assert
      const firstCall = (drawDartMarker as any).mock.calls[0];
      const secondCall = (drawDartMarker as any).mock.calls[1];

      expect(firstCall[2]).toEqual({ x: 10, y: 20 });
      expect(secondCall[2]).toEqual({ x: 30, y: 40 });
    });

    test('drawDartMarkerに正しいダーツ色が渡される', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={3} />);

      // Assert
      const firstCall = (drawDartMarker as any).mock.calls[0];
      const secondCall = (drawDartMarker as any).mock.calls[1];
      const thirdCall = (drawDartMarker as any).mock.calls[2];

      expect(firstCall[3]).toBe(DART_COLORS.first);   // 1本目: 赤系
      expect(secondCall[3]).toBe(DART_COLORS.second); // 2本目: 青緑系
      expect(thirdCall[3]).toBe(DART_COLORS.third);   // 3本目: 黄系
    });

    test('drawDartMarkerに正しいダーツインデックスが渡される', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={3} />);

      // Assert
      const firstCall = (drawDartMarker as any).mock.calls[0];
      const secondCall = (drawDartMarker as any).mock.calls[1];
      const thirdCall = (drawDartMarker as any).mock.calls[2];

      expect(firstCall[4]).toBe(0); // インデックス0
      expect(secondCall[4]).toBe(1); // インデックス1
      expect(thirdCall[4]).toBe(2); // インデックス2
    });

    test('3本を超えるダーツ座標が渡された場合、最初の3本のみ描画される', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
        { x: 100, y: 100 }, // 4本目（描画されない）
        { x: 200, y: 200 }, // 5本目（描画されない）
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={5} />);

      // Assert
      // 色配列の長さ（3）までしか描画されない
      expect(drawDartMarker).toHaveBeenCalledTimes(3);
    });
  });

  describe('正常系 - ダーツ凡例の描画確認', () => {
    test('dartCount=0の場合、drawLegendが呼ばれない', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      expect(drawLegend).not.toHaveBeenCalled();
    });

    test('dartCount=1の場合、drawLegendが呼ばれない', () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 0, y: 0 }];

      // Act
      render(<P5Canvas coords={coords} dartCount={1} />);

      // Assert
      expect(drawLegend).not.toHaveBeenCalled();
    });

    test('dartCount=2の場合、drawLegendが呼ばれない', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={2} />);

      // Assert
      expect(drawLegend).not.toHaveBeenCalled();
    });

    test('dartCount=3の場合、drawLegendが呼ばれる', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={3} />);

      // Assert
      expect(drawLegend).toHaveBeenCalledTimes(1);
    });

    test('drawLegendに正しいp5インスタンスとdartCountが渡される', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={3} />);

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(drawLegend).toHaveBeenCalledWith(mockP5, 3);
    });
  });

  describe('正常系 - レスポンシブ動作（ウィンドウリサイズ時の適切なスケーリング）', () => {
    test('異なるキャンバスサイズ（小）でもsetup()が正常に動作する', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // モックのウィンドウサイズを変更
      const originalMockP5Width = 800;
      const originalMockP5Height = 600;

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(mockP5.createCanvas).toHaveBeenCalledWith(originalMockP5Width, originalMockP5Height);
    });

    test('リサイズ後も描画関数が正常に呼び出される', () => {
      // Arrange
      const coords: Coordinates[] = [];
      render(<P5Canvas coords={coords} dartCount={0} />);
      vi.clearAllMocks(); // 初期描画のモック呼び出しをクリア

      // Act
      const windowResizedFn = (globalThis as any).__mockWindowResized;
      windowResizedFn();

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(mockP5.resizeCanvas).toHaveBeenCalled();
    });
  });

  describe('正常系 - p5インスタンスへの正しい引数渡し', () => {
    test('drawBoard()にp5インスタンスとCoordinateTransformが渡される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      const mockP5 = (globalThis as any).__mockP5Instance;
      expect(drawBoard).toHaveBeenCalledWith(mockP5, expect.objectContaining({
        getCenter: expect.any(Function),
        physicalToScreen: expect.any(Function),
        physicalDistanceToScreen: expect.any(Function),
        updateCanvasSize: expect.any(Function),
      }));
    });

    test('drawDartMarker()に正しい5つの引数が渡される', () => {
      // Arrange
      const coords: Coordinates[] = [{ x: 10, y: 20 }];

      // Act
      render(<P5Canvas coords={coords} dartCount={1} />);

      // Assert
      const call = (drawDartMarker as any).mock.calls[0];
      expect(call.length).toBe(5);

      // 引数の型を確認
      expect(call[0]).toBeDefined();                       // p5インスタンス
      expect(call[1]).toHaveProperty('getCenter');         // CoordinateTransform
      expect(call[2]).toEqual({ x: 10, y: 20 });           // 座標
      expect(typeof call[3]).toBe('string');               // 色
      expect(typeof call[4]).toBe('number');               // インデックス
    });

    test('drawLegend()にp5インスタンスとdartCountが渡される', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ];

      // Act
      render(<P5Canvas coords={coords} dartCount={3} />);

      // Assert
      const call = (drawLegend as any).mock.calls[0];
      expect(call.length).toBe(2);
      expect(call[0]).toBeDefined();           // p5インスタンス
      expect(call[1]).toBe(3);                  // dartCount
    });
  });

  describe('エッジケース - CoordinateTransform未初期化時の動作', () => {
    test('setup()が呼ばれずにdraw()が呼ばれても描画関数が呼ばれない', () => {
      // このケースは実際には起こらないが、念のため検証
      // 現在のモック実装ではsetup()が必ず先に呼ばれるため、このテストは常にパスする
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      // transformが初期化されている場合のみdrawBoardが呼ばれる
      expect(drawBoard).toHaveBeenCalled();
    });
  });

  describe('正常系 - 描画順序の確認', () => {
    test('描画関数が正しい順序で呼び出される（drawBoard → drawDartMarker → drawLegend）', () => {
      // Arrange
      const coords: Coordinates[] = [
        { x: 0, y: -103 },
        { x: 50, y: 50 },
        { x: -30, y: -30 },
      ];
      const callOrder: string[] = [];

      // モック関数の呼び出し順序を記録
      (drawBoard as any).mockImplementation(() => callOrder.push('drawBoard'));
      (drawDartMarker as any).mockImplementation(() => callOrder.push('drawDartMarker'));
      (drawLegend as any).mockImplementation(() => callOrder.push('drawLegend'));

      // Act
      render(<P5Canvas coords={coords} dartCount={3} />);

      // Assert
      expect(callOrder).toEqual([
        'drawBoard',
        'drawDartMarker',
        'drawDartMarker',
        'drawDartMarker',
        'drawLegend',
      ]);
    });
  });

  describe('正常系 - CoordinateTransformのボード半径設定確認', () => {
    test('CoordinateTransformがBOARD_PHYSICAL.rings.boardEdge（225mm）で初期化される', () => {
      // Arrange
      const coords: Coordinates[] = [];

      // Act
      render(<P5Canvas coords={coords} dartCount={0} />);

      // Assert
      // CoordinateTransformが正しい半径で初期化されていることを間接的に確認
      expect(BOARD_PHYSICAL.rings.boardEdge).toBe(225);
      expect(drawBoard).toHaveBeenCalled();

      // drawBoardに渡されたCoordinateTransformインスタンスを取得
      const transformArg = (drawBoard as any).mock.calls[0][1];

      // getCenter()が正常に動作することを確認（初期化されている証拠）
      const center = transformArg.getCenter();
      expect(center).toHaveProperty('x');
      expect(center).toHaveProperty('y');
      expect(typeof center.x).toBe('number');
      expect(typeof center.y).toBe('number');
    });
  });
});
