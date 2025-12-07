/**
 * セグメント番号描画の統合テスト
 * p5.jsのモック化とスパイを活用して、drawNumbers関数の呼び出しを検証する
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type p5Types from 'p5';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { BOARD_PHYSICAL, SEGMENTS, SEGMENT_ANGLE } from '../../utils/constants/index.js';
import { drawNumbers } from '../../components/DartBoard/dartBoardRenderer';

describe('dartboard-numbers-rendering integration', () => {
  let mockP5: p5Types;
  let mockTransform: CoordinateTransform;

  beforeEach(() => {
    // p5.jsのモックオブジェクトを作成
    mockP5 = {
      fill: vi.fn(),
      noStroke: vi.fn(),
      text: vi.fn(),
      textAlign: vi.fn(),
      textSize: vi.fn(),
      CENTER: 'center' as const,
    } as unknown as p5Types;

    // CoordinateTransformのモックインスタンスを作成（800x600キャンバス）
    mockTransform = new CoordinateTransform(800, 600, 225);
  });

  describe('drawNumbers', () => {
    describe('正常系 - セグメント番号描画の検証', () => {
      test('20個のセグメント番号が描画される（text呼び出しが20回）', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        expect(textSpy).toHaveBeenCalledTimes(20);
      });

      test('正しいセグメント番号が順番に描画される', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        // SEGMENTSの各番号が文字列として描画されることを確認
        const expectedNumbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
        textSpy.mock.calls.forEach((call, index) => {
          expect(call[0]).toBe(expectedNumbers[index].toString());
        });
      });

      test('配置半径が197.5mm（ダブル外側170mmとボード端225mmの中間）である', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');
        const expectedPlacementRadius = (BOARD_PHYSICAL.rings.doubleOuter + BOARD_PHYSICAL.rings.boardEdge) / 2;
        expect(expectedPlacementRadius).toBe(197.5); // 確認用

        const screenRadius = mockTransform.physicalDistanceToScreen(expectedPlacementRadius);
        const center = mockTransform.getCenter();

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        // 各番号の配置座標が正しい半径上にあることを確認
        textSpy.mock.calls.forEach((call, index) => {
          const x = call[1] as number;
          const y = call[2] as number;

          // 中心からの距離を計算
          const dx = x - center.x;
          const dy = y - center.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          expect(distance).toBeCloseTo(screenRadius, 1);
        });
      });

      test('各番号が正しい角度（セグメント中央）に配置される', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');
        const center = mockTransform.getCenter();
        const placementRadius = (BOARD_PHYSICAL.rings.doubleOuter + BOARD_PHYSICAL.rings.boardEdge) / 2;
        const screenRadius = mockTransform.physicalDistanceToScreen(placementRadius);

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        textSpy.mock.calls.forEach((call, index) => {
          const x = call[1] as number;
          const y = call[2] as number;

          // 期待される角度を計算（真上-π/2から時計回り）
          const expectedAngle = -Math.PI / 2 + index * SEGMENT_ANGLE;
          const expectedX = center.x + screenRadius * Math.cos(expectedAngle);
          const expectedY = center.y + screenRadius * Math.sin(expectedAngle);

          expect(x).toBeCloseTo(expectedX, 1);
          expect(y).toBeCloseTo(expectedY, 1);
        });
      });

      test('セグメント間の角度差が18度（π/10ラジアン）である', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');
        const center = mockTransform.getCenter();

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        // 各セグメントの期待される角度を直接確認
        textSpy.mock.calls.forEach((call, index) => {
          const x = call[1] as number;
          const y = call[2] as number;
          const dx = x - center.x;
          const dy = y - center.y;
          const actualAngle = Math.atan2(dy, dx);

          // 期待される角度（真上-π/2から時計回り）
          const expectedAngle = -Math.PI / 2 + index * SEGMENT_ANGLE;

          // 角度の差を計算（-πからπの範囲で正規化）
          let angleDiff = actualAngle - expectedAngle;
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

          expect(Math.abs(angleDiff)).toBeLessThan(0.01); // 0.01ラジアン未満の誤差
        });
      });

      test('テキストが白色（#FFFFFF）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        expect(fillSpy).toHaveBeenCalledWith('#FFFFFF');
      });

      test('テキストサイズが20pxに設定される', () => {
        // Arrange
        const textSizeSpy = vi.spyOn(mockP5, 'textSize');

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        expect(textSizeSpy).toHaveBeenCalledWith(20);
      });

      test('テキストが中央揃え（CENTER, CENTER）で描画される', () => {
        // Arrange
        const textAlignSpy = vi.spyOn(mockP5, 'textAlign');

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        expect(textAlignSpy).toHaveBeenCalledWith(mockP5.CENTER, mockP5.CENTER);
      });

      test('noStroke()が呼び出される', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('正常系 - 異なるキャンバスサイズでの動作', () => {
      test('小さいキャンバス（400x300）でも20個の番号が描画される', () => {
        // Arrange
        const smallTransform = new CoordinateTransform(400, 300, 225);
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawNumbers(mockP5, smallTransform);

        // Assert
        expect(textSpy).toHaveBeenCalledTimes(20);
      });

      test('大きいキャンバス（1920x1080）でも20個の番号が描画される', () => {
        // Arrange
        const largeTransform = new CoordinateTransform(1920, 1080, 225);
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawNumbers(mockP5, largeTransform);

        // Assert
        expect(textSpy).toHaveBeenCalledTimes(20);
      });

      test('正方形キャンバス（800x800）でも正しい配置半径で描画される', () => {
        // Arrange
        const squareTransform = new CoordinateTransform(800, 800, 225);
        const textSpy = vi.spyOn(mockP5, 'text');
        const expectedPlacementRadius = (BOARD_PHYSICAL.rings.doubleOuter + BOARD_PHYSICAL.rings.boardEdge) / 2;
        const screenRadius = squareTransform.physicalDistanceToScreen(expectedPlacementRadius);
        const center = squareTransform.getCenter();

        // Act
        drawNumbers(mockP5, squareTransform);

        // Assert
        textSpy.mock.calls.forEach((call) => {
          const x = call[1] as number;
          const y = call[2] as number;
          const distance = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
          expect(distance).toBeCloseTo(screenRadius, 1);
        });
      });
    });

    describe('正常系 - 複数回の呼び出し', () => {
      test('複数回呼び出しても一貫した結果が得られる', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawNumbers(mockP5, mockTransform);
        const firstCallCount = textSpy.mock.calls.length;
        const firstCalls = [...textSpy.mock.calls];

        vi.clearAllMocks();

        drawNumbers(mockP5, mockTransform);
        const secondCallCount = textSpy.mock.calls.length;
        const secondCalls = [...textSpy.mock.calls];

        // Assert
        expect(firstCallCount).toBe(20);
        expect(secondCallCount).toBe(20);

        // 同じ番号が同じ順序で描画されることを確認
        firstCalls.forEach((call, index) => {
          expect(call[0]).toBe(secondCalls[index][0]); // 番号
          expect(call[1]).toBeCloseTo(secondCalls[index][1] as number, 5); // x座標
          expect(call[2]).toBeCloseTo(secondCalls[index][2] as number, 5); // y座標
        });
      });
    });

    describe('正常系 - SEGMENTSとの整合性', () => {
      test('SEGMENTS配列の全要素が使用される', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        const drawnNumbers = textSpy.mock.calls.map(call => parseInt(call[0] as string));
        SEGMENTS.forEach((number) => {
          expect(drawnNumbers).toContain(number);
        });
      });

      test('SEGMENTS配列の順序が保持される', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawNumbers(mockP5, mockTransform);

        // Assert
        textSpy.mock.calls.forEach((call, index) => {
          expect(call[0]).toBe(SEGMENTS[index].toString());
        });
      });
    });
  });
});
