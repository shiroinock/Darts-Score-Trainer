/**
 * ダーツボードスパイダー（ワイヤー境界線）描画の統合テスト
 * p5.jsのモック化とスパイを活用して、drawSpider関数の描画呼び出しを検証する
 */

import type p5Types from 'p5';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { drawSpider } from '../../components/DartBoard/dartBoardRenderer';
import { BOARD_PHYSICAL, SEGMENT_ANGLE } from '../../utils/constants/index.js';
import { CoordinateTransform } from '../../utils/coordinateTransform';

describe('drawSpider - スパイダー描画の統合テスト', () => {
  let mockP5: p5Types;
  let mockTransform: CoordinateTransform;

  beforeEach(() => {
    // p5.jsのモックオブジェクトを作成
    mockP5 = {
      stroke: vi.fn(),
      strokeWeight: vi.fn(),
      noFill: vi.fn(),
      line: vi.fn(),
      circle: vi.fn(),
    } as unknown as p5Types;

    // CoordinateTransformのモックインスタンスを作成（800x600キャンバス）
    mockTransform = new CoordinateTransform(800, 600, 225);
  });

  describe('正常系 - 放射線（セグメント境界）の検証', () => {
    test('20本の放射線が描画される（line呼び出しが20回）', () => {
      // Arrange
      const lineSpy = vi.spyOn(mockP5, 'line');

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      expect(lineSpy).toHaveBeenCalledTimes(20);
    });

    test('各放射線がボード中心から開始される', () => {
      // Arrange
      const lineSpy = vi.spyOn(mockP5, 'line');
      const center = mockTransform.getCenter();

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // すべてのline()呼び出しで、開始点（x1, y1）がボード中心であることを確認
      lineSpy.mock.calls.forEach((call) => {
        expect(call[0]).toBe(center.x); // x1
        expect(call[1]).toBe(center.y); // y1
      });
    });

    test('各放射線がボード端（225mm）まで延びる', () => {
      // Arrange
      const lineSpy = vi.spyOn(mockP5, 'line');
      const center = mockTransform.getCenter();
      const boardEdgeRadius = mockTransform.physicalDistanceToScreen(
        BOARD_PHYSICAL.rings.boardEdge
      );

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // すべてのline()呼び出しで、終点が中心からboardEdgeRadius離れていることを確認
      lineSpy.mock.calls.forEach((call) => {
        const endX = call[2] as number; // x2
        const endY = call[3] as number; // y2
        const distance = Math.sqrt((endX - center.x) ** 2 + (endY - center.y) ** 2);
        expect(distance).toBeCloseTo(boardEdgeRadius, 1);
      });
    });

    test('放射線が18度（π/10ラジアン）間隔で配置される', () => {
      // Arrange
      const lineSpy = vi.spyOn(mockP5, 'line');
      const center = mockTransform.getCenter();

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // 各放射線の角度を計算し、18度間隔であることを確認
      const angles: number[] = [];
      lineSpy.mock.calls.forEach((call) => {
        const endX = call[2] as number;
        const endY = call[3] as number;
        const angle = Math.atan2(endY - center.y, endX - center.x);
        angles.push(angle);
      });

      // 連続する角度の差を検証
      // atan2の返値は-πから+πの範囲なので、角度がラップアラウンドする箇所を考慮
      for (let i = 0; i < angles.length - 1; i++) {
        let angleDiff = angles[i + 1] - angles[i];

        // 角度差が負の場合、2πを加算してラップアラウンドを補正
        if (angleDiff < 0) {
          angleDiff += 2 * Math.PI;
        }

        expect(angleDiff).toBeCloseTo(SEGMENT_ANGLE, 5);
      }
    });

    test('最初の放射線がセグメント境界（-π/2 - SEGMENT_ANGLE/2）から開始される', () => {
      // Arrange
      const lineSpy = vi.spyOn(mockP5, 'line');
      const center = mockTransform.getCenter();

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // 最初のline()呼び出しの角度を確認
      const firstCall = lineSpy.mock.calls[0];
      const endX = firstCall[2] as number;
      const endY = firstCall[3] as number;
      const angle = Math.atan2(endY - center.y, endX - center.x);

      // セグメント境界は真上から半セグメント分ずれた位置（-π/2 - SEGMENT_ANGLE/2）
      const expectedAngle = -Math.PI / 2 - SEGMENT_ANGLE / 2;
      expect(angle).toBeCloseTo(expectedAngle, 5);
    });

    test('放射線の色がシルバー/グレー（#C0C0C0）である', () => {
      // Arrange
      const strokeSpy = vi.spyOn(mockP5, 'stroke');

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // stroke()が呼ばれ、色が#C0C0C0であることを確認
      const strokeCalls = strokeSpy.mock.calls.filter((call) => String(call[0]) === '#C0C0C0');
      expect(strokeCalls.length).toBeGreaterThan(0);
    });

    test('放射線の幅が1.5mm（物理座標）に対応する画面座標値である', () => {
      // Arrange
      const strokeWeightSpy = vi.spyOn(mockP5, 'strokeWeight');
      const expectedWidth = mockTransform.physicalDistanceToScreen(
        BOARD_PHYSICAL.spider.radialWidth
      );

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // strokeWeight()が期待値で呼ばれていることを確認
      const strokeWeightCalls = strokeWeightSpy.mock.calls.filter((call) => {
        const width = call[0] as number;
        return Math.abs(width - expectedWidth) < 0.1;
      });
      expect(strokeWeightCalls.length).toBeGreaterThan(0);
    });
  });

  describe('正常系 - 同心円（リング境界）の検証', () => {
    test('6本の同心円が描画される（circle呼び出しが6回）', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      expect(circleSpy).toHaveBeenCalledTimes(6);
    });

    test('すべての同心円がボード中心座標で描画される', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');
      const center = mockTransform.getCenter();

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      circleSpy.mock.calls.forEach((call) => {
        expect(call[0]).toBe(center.x); // x
        expect(call[1]).toBe(center.y); // y
      });
    });

    test('同心円の半径が正しい物理座標値に対応する', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');

      // 期待される6つの半径（物理座標）
      const expectedPhysicalRadii = [
        BOARD_PHYSICAL.rings.doubleOuter, // ダブル外側: 170mm
        BOARD_PHYSICAL.rings.doubleInner, // ダブル内側: 162mm
        BOARD_PHYSICAL.rings.tripleOuter, // トリプル外側: 107mm
        BOARD_PHYSICAL.rings.tripleInner, // トリプル内側: 99mm
        BOARD_PHYSICAL.rings.outerBull, // アウターブル: 7.95mm
        BOARD_PHYSICAL.rings.innerBull, // インナーブル: 3.175mm（新規追加）
      ];

      // 画面座標に変換（直径）
      const expectedDiameters = expectedPhysicalRadii.map(
        (r) => mockTransform.physicalDistanceToScreen(r) * 2
      );

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // 描画された円の直径を抽出
      const actualDiameters = circleSpy.mock.calls.map((call) => call[2] as number);

      // 期待値と実際の値を比較（順序も一致するはず）
      expectedDiameters.forEach((expectedDiameter, index) => {
        expect(actualDiameters[index]).toBeCloseTo(expectedDiameter, 1);
      });
    });

    test('ダブル外側の円（170mm）が描画される', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');
      const expectedRadius = mockTransform.physicalDistanceToScreen(
        BOARD_PHYSICAL.rings.doubleOuter
      );
      const expectedDiameter = expectedRadius * 2;

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      const diameters = circleSpy.mock.calls.map((call) => call[2] as number);
      const hasExpectedDiameter = diameters.some((d) => Math.abs(d - expectedDiameter) < 0.1);
      expect(hasExpectedDiameter).toBe(true);
    });

    test('ダブル内側の円（162mm）が描画される', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');
      const expectedRadius = mockTransform.physicalDistanceToScreen(
        BOARD_PHYSICAL.rings.doubleInner
      );
      const expectedDiameter = expectedRadius * 2;

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      const diameters = circleSpy.mock.calls.map((call) => call[2] as number);
      const hasExpectedDiameter = diameters.some((d) => Math.abs(d - expectedDiameter) < 0.1);
      expect(hasExpectedDiameter).toBe(true);
    });

    test('トリプル外側の円（107mm）が描画される', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');
      const expectedRadius = mockTransform.physicalDistanceToScreen(
        BOARD_PHYSICAL.rings.tripleOuter
      );
      const expectedDiameter = expectedRadius * 2;

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      const diameters = circleSpy.mock.calls.map((call) => call[2] as number);
      const hasExpectedDiameter = diameters.some((d) => Math.abs(d - expectedDiameter) < 0.1);
      expect(hasExpectedDiameter).toBe(true);
    });

    test('トリプル内側の円（99mm）が描画される', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');
      const expectedRadius = mockTransform.physicalDistanceToScreen(
        BOARD_PHYSICAL.rings.tripleInner
      );
      const expectedDiameter = expectedRadius * 2;

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      const diameters = circleSpy.mock.calls.map((call) => call[2] as number);
      const hasExpectedDiameter = diameters.some((d) => Math.abs(d - expectedDiameter) < 0.1);
      expect(hasExpectedDiameter).toBe(true);
    });

    test('アウターブルの円（7.95mm）が描画される', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');
      const expectedRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.outerBull);
      const expectedDiameter = expectedRadius * 2;

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      const diameters = circleSpy.mock.calls.map((call) => call[2] as number);
      const hasExpectedDiameter = diameters.some((d) => Math.abs(d - expectedDiameter) < 0.1);
      expect(hasExpectedDiameter).toBe(true);
    });

    test('インナーブルの円（3.175mm）が描画される', () => {
      // Arrange
      const circleSpy = vi.spyOn(mockP5, 'circle');
      const expectedRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.innerBull);
      const expectedDiameter = expectedRadius * 2;

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      const diameters = circleSpy.mock.calls.map((call) => call[2] as number);
      const hasExpectedDiameter = diameters.some((d) => Math.abs(d - expectedDiameter) < 0.1);
      expect(hasExpectedDiameter).toBe(true);
    });

    test('同心円の色がシルバー/グレー（#C0C0C0）である', () => {
      // Arrange
      const strokeSpy = vi.spyOn(mockP5, 'stroke');

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // stroke()が#C0C0C0で呼ばれていることを確認
      const strokeCalls = strokeSpy.mock.calls.filter((call) => String(call[0]) === '#C0C0C0');
      expect(strokeCalls.length).toBeGreaterThan(0);
    });

    test('同心円の幅が1.0mm（物理座標）に対応する画面座標値である', () => {
      // Arrange
      const strokeWeightSpy = vi.spyOn(mockP5, 'strokeWeight');
      const expectedWidth = mockTransform.physicalDistanceToScreen(
        BOARD_PHYSICAL.spider.circularWidth
      );

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // strokeWeight()が期待値で呼ばれていることを確認
      const strokeWeightCalls = strokeWeightSpy.mock.calls.filter((call) => {
        const width = call[0] as number;
        return Math.abs(width - expectedWidth) < 0.1;
      });
      expect(strokeWeightCalls.length).toBeGreaterThan(0);
    });

    test('同心円描画時にnoFill()が呼び出される', () => {
      // Arrange
      const noFillSpy = vi.spyOn(mockP5, 'noFill');

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // drawSpider は drawSpiderOuter と drawSpiderBull を呼び出すため、2回呼ばれる
      expect(noFillSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('正常系 - 異なるキャンバスサイズでの動作', () => {
    test('小さいキャンバス（400x300）でも正常に動作する', () => {
      // Arrange
      const smallTransform = new CoordinateTransform(400, 300, 225);
      const lineSpy = vi.spyOn(mockP5, 'line');
      const circleSpy = vi.spyOn(mockP5, 'circle');

      // Act
      drawSpider(mockP5, smallTransform);

      // Assert
      expect(lineSpy).toHaveBeenCalledTimes(20);
      expect(circleSpy).toHaveBeenCalledTimes(6);
      expect(() => drawSpider(mockP5, smallTransform)).not.toThrow();
    });

    test('大きいキャンバス（1920x1080）でも正常に動作する', () => {
      // Arrange
      const largeTransform = new CoordinateTransform(1920, 1080, 225);
      const lineSpy = vi.spyOn(mockP5, 'line');
      const circleSpy = vi.spyOn(mockP5, 'circle');

      // Act
      drawSpider(mockP5, largeTransform);

      // Assert
      expect(lineSpy).toHaveBeenCalledTimes(20);
      expect(circleSpy).toHaveBeenCalledTimes(6);
      expect(() => drawSpider(mockP5, largeTransform)).not.toThrow();
    });

    test('正方形キャンバス（800x800）でも正常に動作する', () => {
      // Arrange
      const squareTransform = new CoordinateTransform(800, 800, 225);
      const lineSpy = vi.spyOn(mockP5, 'line');
      const circleSpy = vi.spyOn(mockP5, 'circle');

      // Act
      drawSpider(mockP5, squareTransform);

      // Assert
      expect(lineSpy).toHaveBeenCalledTimes(20);
      expect(circleSpy).toHaveBeenCalledTimes(6);
      expect(() => drawSpider(mockP5, squareTransform)).not.toThrow();
    });
  });

  describe('正常系 - 複数回の呼び出し', () => {
    test('drawSpider を複数回呼び出しても正常に動作する', () => {
      // Arrange
      const lineSpy = vi.spyOn(mockP5, 'line');
      const circleSpy = vi.spyOn(mockP5, 'circle');

      // Act
      drawSpider(mockP5, mockTransform);
      drawSpider(mockP5, mockTransform);
      drawSpider(mockP5, mockTransform);

      // Assert
      expect(lineSpy).toHaveBeenCalledTimes(60); // 20 * 3
      expect(circleSpy).toHaveBeenCalledTimes(18); // 6 * 3
    });
  });

  describe('エッジケース - 描画順序の検証', () => {
    test('放射線の描画後に同心円が描画される', () => {
      // Arrange
      const lineSpy = vi.spyOn(mockP5, 'line');
      const circleSpy = vi.spyOn(mockP5, 'circle');
      const callOrder: string[] = [];

      // モックの呼び出しを記録
      lineSpy.mockImplementation(() => {
        callOrder.push('line');
        return mockP5;
      });
      circleSpy.mockImplementation(() => {
        callOrder.push('circle');
        return mockP5;
      });

      // Act
      drawSpider(mockP5, mockTransform);

      // Assert
      // 最初の20回がline、その後6回がcircle
      const lineCallsFirst = callOrder.slice(0, 20).every((call) => call === 'line');
      const circleCallsLast = callOrder.slice(20, 26).every((call) => call === 'circle');

      expect(lineCallsFirst).toBe(true);
      expect(circleCallsLast).toBe(true);
    });
  });
});
