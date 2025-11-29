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
    describe('正常系 - 描画関数の呼び出し', () => {
      test('背景がクリアされ、各描画関数が呼び出される', () => {
        // Act
        drawBoard(mockP5, mockTransform);

        // Assert
        // 背景のクリアが呼ばれることを確認
        expect(mockP5.background).toHaveBeenCalledWith(0);
        expect(mockP5.background).toHaveBeenCalledTimes(1);

        // NOTE: 現時点では各描画関数はスタブ実装のため、詳細な検証は行わない
        // 各描画関数の実装が完了した後、以下のような検証を追加する予定：
        // - 各描画関数が正しいパラメータで呼び出されること
        // - drawSegments → drawRings → drawBull → drawSpider → drawNumbers の順序で呼び出されること
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

  describe('個別描画関数', () => {
    describe('正常系 - スタブ実装の動作確認', () => {
      test.each([
        ['drawSegments', drawSegments],
        ['drawRings', drawRings],
        ['drawBull', drawBull],
        ['drawSpider', drawSpider],
        ['drawNumbers', drawNumbers],
      ] as const)('%s がエラーなく呼び出せる', (name, drawFunction) => {
        // Act & Assert
        // スタブ実装なので、エラーが発生しないことのみ確認
        expect(() => drawFunction(mockP5, mockTransform)).not.toThrow();
      });
    });
  });
});
