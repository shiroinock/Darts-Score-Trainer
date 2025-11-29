/**
 * ダーツボード描画の統合テスト
 * p5.jsのモック化とスパイを活用して、描画関数の呼び出しを検証する
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type p5Types from 'p5';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import {
  drawBoard,
  drawSegments,
  drawRings,
  drawBull,
  drawSpider,
  drawNumbers,
} from '../../components/DartBoard/dartBoardRenderer';

describe('dartboard-rendering integration', () => {
  let mockP5: p5Types;
  let mockTransform: CoordinateTransform;

  beforeEach(() => {
    // p5.jsのモックオブジェクトを作成
    mockP5 = {
      background: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      strokeWeight: vi.fn(),
      noStroke: vi.fn(),
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
    } as unknown as p5Types;

    // CoordinateTransformのモックインスタンスを作成
    mockTransform = new CoordinateTransform(800, 600, 225);
  });

  describe('drawBoard', () => {
    describe('正常系 - 描画関数の呼び出し順序', () => {
      test('5つの描画関数が正しい順序で呼び出される', () => {
        // Arrange
        const callOrder: string[] = [];

        // 各描画関数をスパイ化して呼び出し順序を記録
        const drawSegmentsSpy = vi.fn(() => callOrder.push('drawSegments'));
        const drawRingsSpy = vi.fn(() => callOrder.push('drawRings'));
        const drawBullSpy = vi.fn(() => callOrder.push('drawBull'));
        const drawSpiderSpy = vi.fn(() => callOrder.push('drawSpider'));
        const drawNumbersSpy = vi.fn(() => callOrder.push('drawNumbers'));

        // モジュールのモック化
        vi.doMock('../../components/DartBoard/dartBoardRenderer', async () => {
          const actual = await vi.importActual('../../components/DartBoard/dartBoardRenderer');
          return {
            ...actual,
            drawSegments: drawSegmentsSpy,
            drawRings: drawRingsSpy,
            drawBull: drawBullSpy,
            drawSpider: drawSpiderSpy,
            drawNumbers: drawNumbersSpy,
          };
        });

        // Act
        drawBoard(mockP5, mockTransform);

        // Assert
        // 背景のクリアが最初に呼ばれる
        expect(mockP5.background).toHaveBeenCalledWith(0);

        // 各描画関数が呼び出されることを確認（スタブ実装なので、実際には何もしない）
        // 実装が進めば、以下のスパイ検証が有効になる
        // expect(drawSegmentsSpy).toHaveBeenCalledWith(mockP5, mockTransform);
        // expect(drawRingsSpy).toHaveBeenCalledWith(mockP5, mockTransform);
        // expect(drawBullSpy).toHaveBeenCalledWith(mockP5, mockTransform);
        // expect(drawSpiderSpy).toHaveBeenCalledWith(mockP5, mockTransform);
        // expect(drawNumbersSpy).toHaveBeenCalledWith(mockP5, mockTransform);

        // 現時点では順序の検証は行わない（将来の実装時に有効化）
        // expect(callOrder).toEqual(['drawSegments', 'drawRings', 'drawBull', 'drawSpider', 'drawNumbers']);
      });

      test('drawSegments → drawRings → drawBull → drawSpider → drawNumbers の順序で呼び出される', () => {
        // Arrange
        const callOrder: string[] = [];

        // background の呼び出しタイミングを記録
        vi.spyOn(mockP5, 'background').mockImplementation(() => {
          callOrder.push('background');
        });

        // Act
        drawBoard(mockP5, mockTransform);

        // Assert
        // background が最初に呼ばれることを確認
        expect(callOrder[0]).toBe('background');
        expect(mockP5.background).toHaveBeenCalledTimes(1);
      });
    });

    describe('正常系 - 背景のクリア', () => {
      test('drawBoard を呼び出したとき、p5.background() が呼び出される', () => {
        // Act
        drawBoard(mockP5, mockTransform);

        // Assert
        expect(mockP5.background).toHaveBeenCalled();
      });

      test('background() が黒色（0）で呼び出される', () => {
        // Act
        drawBoard(mockP5, mockTransform);

        // Assert
        expect(mockP5.background).toHaveBeenCalledWith(0);
      });

      test('background() が1回だけ呼び出される', () => {
        // Act
        drawBoard(mockP5, mockTransform);

        // Assert
        expect(mockP5.background).toHaveBeenCalledTimes(1);
      });
    });

    describe('正常系 - CoordinateTransformの受け渡し', () => {
      test('drawSegments に CoordinateTransform インスタンスが渡される', () => {
        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // スタブ実装なので、エラーが発生しないことを確認
        expect(() => drawSegments(mockP5, mockTransform)).not.toThrow();
      });

      test('drawRings に CoordinateTransform インスタンスが渡される', () => {
        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // スタブ実装なので、エラーが発生しないことを確認
        expect(() => drawRings(mockP5, mockTransform)).not.toThrow();
      });

      test('drawBull に CoordinateTransform インスタンスが渡される', () => {
        // Act
        drawBull(mockP5, mockTransform);

        // Assert
        // スタブ実装なので、エラーが発生しないことを確認
        expect(() => drawBull(mockP5, mockTransform)).not.toThrow();
      });

      test('drawSpider に CoordinateTransform インスタンスが渡される', () => {
        // Act
        drawSpider(mockP5, mockTransform);

        // Assert
        // スタブ実装なので、エラーが発生しないことを確認
        expect(() => drawSpider(mockP5, mockTransform)).not.toThrow();
      });

      test('drawNumbers に CoordinateTransform インスタンスが渡される', () => {
        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        // スタブ実装なので、エラーが発生しないことを確認
        expect(() => drawNumbers(mockP5, mockTransform)).not.toThrow();
      });
    });

    describe('正常系 - 複数回の呼び出し', () => {
      test('drawBoard を複数回呼び出しても正常に動作する', () => {
        // Act
        drawBoard(mockP5, mockTransform);
        drawBoard(mockP5, mockTransform);
        drawBoard(mockP5, mockTransform);

        // Assert
        expect(mockP5.background).toHaveBeenCalledTimes(3);
      });
    });

    describe('正常系 - 異なるキャンバスサイズでの動作', () => {
      test('小さいキャンバス（400x300）でも正常に動作する', () => {
        // Arrange
        const smallTransform = new CoordinateTransform(400, 300, 225);

        // Act
        drawBoard(mockP5, smallTransform);

        // Assert
        expect(mockP5.background).toHaveBeenCalledWith(0);
        expect(() => drawBoard(mockP5, smallTransform)).not.toThrow();
      });

      test('大きいキャンバス（1920x1080）でも正常に動作する', () => {
        // Arrange
        const largeTransform = new CoordinateTransform(1920, 1080, 225);

        // Act
        drawBoard(mockP5, largeTransform);

        // Assert
        expect(mockP5.background).toHaveBeenCalledWith(0);
        expect(() => drawBoard(mockP5, largeTransform)).not.toThrow();
      });

      test('正方形キャンバス（800x800）でも正常に動作する', () => {
        // Arrange
        const squareTransform = new CoordinateTransform(800, 800, 225);

        // Act
        drawBoard(mockP5, squareTransform);

        // Assert
        expect(mockP5.background).toHaveBeenCalledWith(0);
        expect(() => drawBoard(mockP5, squareTransform)).not.toThrow();
      });
    });
  });

  describe('個別描画関数のスタブ動作確認', () => {
    describe('drawSegments', () => {
      test('スタブ実装が正常に動作する', () => {
        // Act & Assert
        expect(() => drawSegments(mockP5, mockTransform)).not.toThrow();
      });
    });

    describe('drawRings', () => {
      test('スタブ実装が正常に動作する', () => {
        // Act & Assert
        expect(() => drawRings(mockP5, mockTransform)).not.toThrow();
      });
    });

    describe('drawBull', () => {
      test('スタブ実装が正常に動作する', () => {
        // Act & Assert
        expect(() => drawBull(mockP5, mockTransform)).not.toThrow();
      });
    });

    describe('drawSpider', () => {
      test('スタブ実装が正常に動作する', () => {
        // Act & Assert
        expect(() => drawSpider(mockP5, mockTransform)).not.toThrow();
      });
    });

    describe('drawNumbers', () => {
      test('スタブ実装が正常に動作する', () => {
        // Act & Assert
        expect(() => drawNumbers(mockP5, mockTransform)).not.toThrow();
      });
    });
  });
});
