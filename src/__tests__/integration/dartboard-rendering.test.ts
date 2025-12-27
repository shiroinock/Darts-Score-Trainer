/**
 * ダーツボード描画の統合テスト
 * p5.jsのモック化とスパイを活用して、描画関数の呼び出しを検証する
 */

import type p5Types from 'p5';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  drawBoard,
  drawDoubleRing,
  drawInnerBull,
  drawInnerSingle,
  drawNumbers,
  drawOuterBull,
  drawOuterSingle,
  drawSpider,
  drawTripleRing,
} from '../../components/DartBoard/dartBoardRenderer';
import { BOARD_PHYSICAL } from '../../utils/constants/index.js';
import { CoordinateTransform } from '../../utils/coordinateTransform';

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
        ['drawSpider', drawSpider],
        ['drawNumbers', drawNumbers],
      ] as const)('%s がエラーなく呼び出せる', (_name, drawFunction) => {
        // Act & Assert
        // スタブ実装なので、エラーが発生しないことのみ確認
        expect(() => drawFunction(mockP5, mockTransform)).not.toThrow();
      });
    });
  });

  // 新実装関数のテスト
  describe('drawDoubleRing', () => {
    describe('正常系 - ダブルリング描画の検証', () => {
      test('20個のセグメントが描画される（arc呼び出しが20回）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawDoubleRing(mockP5, mockTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(20);
      });

      test('偶数インデックスのセグメントは赤色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawDoubleRing(mockP5, mockTransform);

        // Assert
        // インデックス0, 2, 4, ..., 18 (10個) が赤色
        const redCalls = fillSpy.mock.calls.filter((call) => {
          const arg = call[0];
          return typeof arg === 'string' && arg === '#DC143C';
        });
        expect(redCalls.length).toBe(10);
      });

      test('奇数インデックスのセグメントは緑色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawDoubleRing(mockP5, mockTransform);

        // Assert
        // インデックス1, 3, 5, ..., 19 (10個) が緑色
        const greenCalls = fillSpy.mock.calls.filter((call) => {
          const arg = call[0];
          return typeof arg === 'string' && arg === '#228B22';
        });
        expect(greenCalls.length).toBe(10);
      });

      test('arc()の直径が170mm（物理座標）に対応する画面座標値である', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedRadius = mockTransform.physicalDistanceToScreen(
          BOARD_PHYSICAL.rings.doubleOuter
        );
        const expectedDiameter = expectedRadius * 2;

        // Act
        drawDoubleRing(mockP5, mockTransform);

        // Assert
        arcSpy.mock.calls.forEach((call) => {
          expect(call[2]).toBeCloseTo(expectedDiameter, 1); // width
          expect(call[3]).toBeCloseTo(expectedDiameter, 1); // height
        });
      });

      test('各セグメントの角度差が18度（π/10ラジアン）である', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedAngleDiff = Math.PI / 10;

        // Act
        drawDoubleRing(mockP5, mockTransform);

        // Assert
        arcSpy.mock.calls.forEach((call) => {
          const startAngle = call[4] as number;
          const endAngle = call[5] as number;
          const angleDiff = endAngle - startAngle;
          expect(angleDiff).toBeCloseTo(expectedAngleDiff, 5);
        });
      });

      test('noStroke()がループ外で1回のみ呼び出される', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawDoubleRing(mockP5, mockTransform);

        // Assert
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });

      test('push()/pop()が各セグメントで呼び出される（20回ずつ）', () => {
        // Arrange
        const pushSpy = vi.spyOn(mockP5, 'push');
        const popSpy = vi.spyOn(mockP5, 'pop');

        // Act
        drawDoubleRing(mockP5, mockTransform);

        // Assert
        expect(pushSpy).toHaveBeenCalledTimes(20);
        expect(popSpy).toHaveBeenCalledTimes(20);
      });

      test('translate()でボード中心に移動してから描画される', () => {
        // Arrange
        const translateSpy = vi.spyOn(mockP5, 'translate');
        const center = mockTransform.getCenter();

        // Act
        drawDoubleRing(mockP5, mockTransform);

        // Assert
        // 各セグメントでtranslate()が呼ばれる（20回）
        expect(translateSpy).toHaveBeenCalledTimes(20);
        translateSpy.mock.calls.forEach((call) => {
          expect(call[0]).toBe(center.x);
        });
      });
    });
  });

  describe('drawOuterSingle', () => {
    describe('正常系 - アウターシングル描画の検証', () => {
      test('20個のセグメントが描画される（arc呼び出しが20回）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawOuterSingle(mockP5, mockTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(20);
      });

      test('偶数インデックスのセグメントは黒色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawOuterSingle(mockP5, mockTransform);

        // Assert
        const blackCalls = fillSpy.mock.calls.filter((call) => {
          const arg = call[0];
          return typeof arg === 'string' && arg === '#000000';
        });
        expect(blackCalls.length).toBe(10);
      });

      test('奇数インデックスのセグメントはベージュ色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawOuterSingle(mockP5, mockTransform);

        // Assert
        const beigeCalls = fillSpy.mock.calls.filter((call) => {
          const arg = call[0];
          return typeof arg === 'string' && arg === '#D4C5A9';
        });
        expect(beigeCalls.length).toBe(10);
      });

      test('arc()の直径が162mm（物理座標）に対応する画面座標値である', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedRadius = mockTransform.physicalDistanceToScreen(
          BOARD_PHYSICAL.rings.doubleInner
        );
        const expectedDiameter = expectedRadius * 2;

        // Act
        drawOuterSingle(mockP5, mockTransform);

        // Assert
        arcSpy.mock.calls.forEach((call) => {
          expect(call[2]).toBeCloseTo(expectedDiameter, 1);
          expect(call[3]).toBeCloseTo(expectedDiameter, 1);
        });
      });

      test('各セグメントの角度差が18度（π/10ラジアン）である', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedAngleDiff = Math.PI / 10;

        // Act
        drawOuterSingle(mockP5, mockTransform);

        // Assert
        arcSpy.mock.calls.forEach((call) => {
          const angleDiff = (call[5] as number) - (call[4] as number);
          expect(angleDiff).toBeCloseTo(expectedAngleDiff, 5);
        });
      });

      test('noStroke()がループ外で1回のみ呼び出される', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawOuterSingle(mockP5, mockTransform);

        // Assert
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });

      test('push()/pop()が各セグメントで呼び出される（20回ずつ）', () => {
        // Arrange
        const pushSpy = vi.spyOn(mockP5, 'push');
        const popSpy = vi.spyOn(mockP5, 'pop');

        // Act
        drawOuterSingle(mockP5, mockTransform);

        // Assert
        expect(pushSpy).toHaveBeenCalledTimes(20);
        expect(popSpy).toHaveBeenCalledTimes(20);
      });
    });
  });

  describe('drawTripleRing', () => {
    describe('正常系 - トリプルリング描画の検証', () => {
      test('20個のセグメントが描画される（arc呼び出しが20回）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawTripleRing(mockP5, mockTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(20);
      });

      test('偶数インデックスのセグメントは赤色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawTripleRing(mockP5, mockTransform);

        // Assert
        const redCalls = fillSpy.mock.calls.filter((call) => {
          const arg = call[0];
          return typeof arg === 'string' && arg === '#DC143C';
        });
        expect(redCalls.length).toBe(10);
      });

      test('奇数インデックスのセグメントは緑色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawTripleRing(mockP5, mockTransform);

        // Assert
        const greenCalls = fillSpy.mock.calls.filter((call) => {
          const arg = call[0];
          return typeof arg === 'string' && arg === '#228B22';
        });
        expect(greenCalls.length).toBe(10);
      });

      test('arc()の直径が107mm（物理座標）に対応する画面座標値である', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedRadius = mockTransform.physicalDistanceToScreen(
          BOARD_PHYSICAL.rings.tripleOuter
        );
        const expectedDiameter = expectedRadius * 2;

        // Act
        drawTripleRing(mockP5, mockTransform);

        // Assert
        arcSpy.mock.calls.forEach((call) => {
          expect(call[2]).toBeCloseTo(expectedDiameter, 1);
          expect(call[3]).toBeCloseTo(expectedDiameter, 1);
        });
      });

      test('各セグメントの角度差が18度（π/10ラジアン）である', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedAngleDiff = Math.PI / 10;

        // Act
        drawTripleRing(mockP5, mockTransform);

        // Assert
        arcSpy.mock.calls.forEach((call) => {
          const angleDiff = (call[5] as number) - (call[4] as number);
          expect(angleDiff).toBeCloseTo(expectedAngleDiff, 5);
        });
      });

      test('noStroke()がループ外で1回のみ呼び出される', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawTripleRing(mockP5, mockTransform);

        // Assert
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });

      test('push()/pop()が各セグメントで呼び出される（20回ずつ）', () => {
        // Arrange
        const pushSpy = vi.spyOn(mockP5, 'push');
        const popSpy = vi.spyOn(mockP5, 'pop');

        // Act
        drawTripleRing(mockP5, mockTransform);

        // Assert
        expect(pushSpy).toHaveBeenCalledTimes(20);
        expect(popSpy).toHaveBeenCalledTimes(20);
      });
    });
  });

  describe('drawInnerSingle', () => {
    describe('正常系 - インナーシングル描画の検証', () => {
      test('20個のセグメントが描画される（arc呼び出しが20回）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawInnerSingle(mockP5, mockTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(20);
      });

      test('偶数インデックスのセグメントは黒色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawInnerSingle(mockP5, mockTransform);

        // Assert
        const blackCalls = fillSpy.mock.calls.filter((call) => {
          const arg = call[0];
          return typeof arg === 'string' && arg === '#000000';
        });
        expect(blackCalls.length).toBe(10);
      });

      test('奇数インデックスのセグメントはベージュ色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawInnerSingle(mockP5, mockTransform);

        // Assert
        const beigeCalls = fillSpy.mock.calls.filter((call) => {
          const arg = call[0];
          return typeof arg === 'string' && arg === '#D4C5A9';
        });
        expect(beigeCalls.length).toBe(10);
      });

      test('arc()の直径が99mm（物理座標）に対応する画面座標値である', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedRadius = mockTransform.physicalDistanceToScreen(
          BOARD_PHYSICAL.rings.tripleInner
        );
        const expectedDiameter = expectedRadius * 2;

        // Act
        drawInnerSingle(mockP5, mockTransform);

        // Assert
        arcSpy.mock.calls.forEach((call) => {
          expect(call[2]).toBeCloseTo(expectedDiameter, 1);
          expect(call[3]).toBeCloseTo(expectedDiameter, 1);
        });
      });

      test('各セグメントの角度差が18度（π/10ラジアン）である', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedAngleDiff = Math.PI / 10;

        // Act
        drawInnerSingle(mockP5, mockTransform);

        // Assert
        arcSpy.mock.calls.forEach((call) => {
          const angleDiff = (call[5] as number) - (call[4] as number);
          expect(angleDiff).toBeCloseTo(expectedAngleDiff, 5);
        });
      });

      test('noStroke()がループ外で1回のみ呼び出される', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawInnerSingle(mockP5, mockTransform);

        // Assert
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });

      test('push()/pop()が各セグメントで呼び出される（20回ずつ）', () => {
        // Arrange
        const pushSpy = vi.spyOn(mockP5, 'push');
        const popSpy = vi.spyOn(mockP5, 'pop');

        // Act
        drawInnerSingle(mockP5, mockTransform);

        // Assert
        expect(pushSpy).toHaveBeenCalledTimes(20);
        expect(popSpy).toHaveBeenCalledTimes(20);
      });
    });
  });

  describe('drawOuterBull', () => {
    describe('正常系 - アウターブル描画の検証', () => {
      test('circle()が1回呼び出される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');

        // Act
        drawOuterBull(mockP5, mockTransform);

        // Assert
        expect(circleSpy).toHaveBeenCalledTimes(1);
      });

      test('緑色（#228B22）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawOuterBull(mockP5, mockTransform);

        // Assert
        expect(fillSpy).toHaveBeenCalledWith('#228B22');
      });

      test('直径が7.95mm（物理座標）に対応する画面座標値である', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const expectedRadius = mockTransform.physicalDistanceToScreen(
          BOARD_PHYSICAL.rings.outerBull
        );
        const expectedDiameter = expectedRadius * 2;

        // Act
        drawOuterBull(mockP5, mockTransform);

        // Assert
        const call = circleSpy.mock.calls[0];
        expect(call[2]).toBeCloseTo(expectedDiameter, 1);
      });

      test('ボード中心座標で描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const center = mockTransform.getCenter();

        // Act
        drawOuterBull(mockP5, mockTransform);

        // Assert
        const call = circleSpy.mock.calls[0];
        expect(call[0]).toBe(center.x);
        expect(call[1]).toBe(center.y);
      });

      test('noStroke()が呼び出される', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawOuterBull(mockP5, mockTransform);

        // Assert
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('drawInnerBull', () => {
    describe('正常系 - インナーブル描画の検証', () => {
      test('circle()が1回呼び出される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');

        // Act
        drawInnerBull(mockP5, mockTransform);

        // Assert
        expect(circleSpy).toHaveBeenCalledTimes(1);
      });

      test('赤色（#DC143C）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawInnerBull(mockP5, mockTransform);

        // Assert
        expect(fillSpy).toHaveBeenCalledWith('#DC143C');
      });

      test('直径が3.175mm（物理座標）に対応する画面座標値である', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const expectedRadius = mockTransform.physicalDistanceToScreen(
          BOARD_PHYSICAL.rings.innerBull
        );
        const expectedDiameter = expectedRadius * 2;

        // Act
        drawInnerBull(mockP5, mockTransform);

        // Assert
        const call = circleSpy.mock.calls[0];
        expect(call[2]).toBeCloseTo(expectedDiameter, 1);
      });

      test('ボード中心座標で描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const center = mockTransform.getCenter();

        // Act
        drawInnerBull(mockP5, mockTransform);

        // Assert
        const call = circleSpy.mock.calls[0];
        expect(call[0]).toBe(center.x);
        expect(call[1]).toBe(center.y);
      });

      test('noStroke()が呼び出される', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawInnerBull(mockP5, mockTransform);

        // Assert
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
