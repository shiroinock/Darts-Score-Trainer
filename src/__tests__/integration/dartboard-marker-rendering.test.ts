/**
 * ダーツマーカー描画の統合テスト
 * p5.jsのモック化とスパイを活用して、drawDartMarker関数の呼び出しを検証する
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type p5Types from 'p5';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { DART_COLORS, BOARD_PHYSICAL, DART_MARKER_RADII, DART_MARKER_TEXT_SIZE } from '../../utils/constants';
import { drawDartMarker } from '../../components/DartBoard/dartBoardRenderer';

describe('dartboard-marker-rendering integration', () => {
  let mockP5: p5Types;
  let mockTransform: CoordinateTransform;

  beforeEach(() => {
    // p5.jsのモックオブジェクトを作成
    mockP5 = {
      fill: vi.fn(),
      noStroke: vi.fn(),
      circle: vi.fn(),
      text: vi.fn(),
      textAlign: vi.fn(),
      textSize: vi.fn(),
      CENTER: 'center' as const,
    } as unknown as p5Types;

    // CoordinateTransformのモックインスタンスを作成（800x600キャンバス）
    mockTransform = new CoordinateTransform(800, 600, 225);
  });

  describe('drawDartMarker', () => {
    describe('正常系 - 基本的な描画検証', () => {
      test('外側の円が指定された色で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const coords = { x: 0, y: 0 };
        const color = '#FF0000';
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        // fill()は3回呼ばれる: 外側の円、内側の円、テキスト
        expect(fillSpy).toHaveBeenCalledWith(color); // 外側の円
      });

      test('内側の円が白色（#FFFFFF）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const coords = { x: 0, y: 0 };
        const color = '#FF0000';
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(fillSpy).toHaveBeenCalledWith('#FFFFFF'); // 内側の円
      });

      test('番号テキストが黒色（#000000）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const coords = { x: 0, y: 0 };
        const color = '#FF0000';
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(fillSpy).toHaveBeenCalledWith('#000000'); // テキスト
      });

      test('座標が正しく変換されている（物理座標 → 画面座標）', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 50, y: -30 }; // 物理座標（mm単位）
        const color = '#FF0000';
        const index = 0;

        // 期待される画面座標を計算
        const expectedScreenPos = mockTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        // circle()は2回呼ばれる: 外側の円、内側の円
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1); // x座標
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1); // y座標
      });

      test('各p5メソッド（fill, circle, text）が適切に呼び出される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');
        const coords = { x: 0, y: 0 };
        const color = '#FF0000';
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(fillSpy).toHaveBeenCalledTimes(3); // 外側、内側、テキストの色設定
        expect(circleSpy).toHaveBeenCalledTimes(2); // 外側と内側の円
        expect(textSpy).toHaveBeenCalledTimes(1); // 番号テキスト
        expect(noStrokeSpy).toHaveBeenCalledTimes(2); // 円描画時とテキスト描画時
      });

      test('外側の円が正しいサイズ（半径5mm → 直径10mm）で描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 0, y: 0 };
        const color = '#FF0000';
        const index = 0;

        // 期待される外側の円の直径（物理座標5mm → 画面座標）
        const outerRadiusPhysical = DART_MARKER_RADII.outer;
        const outerRadiusScreen = mockTransform.physicalDistanceToScreen(outerRadiusPhysical);
        const expectedDiameter = outerRadiusScreen * 2;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[2]).toBeCloseTo(expectedDiameter, 1); // 直径
      });

      test('内側の円が正しいサイズ（半径3mm → 直径6mm）で描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 0, y: 0 };
        const color = '#FF0000';
        const index = 0;

        // 期待される内側の円の直径（物理座標3mm → 画面座標）
        const innerRadiusPhysical = DART_MARKER_RADII.inner;
        const innerRadiusScreen = mockTransform.physicalDistanceToScreen(innerRadiusPhysical);
        const expectedDiameter = innerRadiusScreen * 2;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const secondCircleCall = circleSpy.mock.calls[1];
        expect(secondCircleCall[2]).toBeCloseTo(expectedDiameter, 1); // 直径
      });

      test('テキストが中央揃え（CENTER, CENTER）で描画される', () => {
        // Arrange
        const textAlignSpy = vi.spyOn(mockP5, 'textAlign');
        const coords = { x: 0, y: 0 };
        const color = '#FF0000';
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(textAlignSpy).toHaveBeenCalledWith(mockP5.CENTER, mockP5.CENTER);
      });

      test('テキストサイズが12pxに設定される', () => {
        // Arrange
        const textSizeSpy = vi.spyOn(mockP5, 'textSize');
        const coords = { x: 0, y: 0 };
        const color = '#FF0000';
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(textSizeSpy).toHaveBeenCalledWith(DART_MARKER_TEXT_SIZE);
      });
    });

    describe('正常系 - 複数ダーツの検証', () => {
      test('index=0 のとき "1" が表示される', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.first;
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(textSpy).toHaveBeenCalledWith('1', expect.any(Number), expect.any(Number));
      });

      test('index=1 のとき "2" が表示される', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.second;
        const index = 1;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(textSpy).toHaveBeenCalledWith('2', expect.any(Number), expect.any(Number));
      });

      test('index=2 のとき "3" が表示される', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.third;
        const index = 2;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(textSpy).toHaveBeenCalledWith('3', expect.any(Number), expect.any(Number));
      });
    });

    describe('正常系 - 色の検証', () => {
      test('DART_COLORS.first（赤系: #FF6B6B）で正しく描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.first;
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.first);
      });

      test('DART_COLORS.second（青緑系: #4ECDC4）で正しく描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.second;
        const index = 1;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.second);
      });

      test('DART_COLORS.third（黄系: #FFE66D）で正しく描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.third;
        const index = 2;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.third);
      });
    });

    describe('正常系 - 異なる座標での検証', () => {
      test('ボード中心（0, 0）での描画', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');
        const coords = { x: 0, y: 0 }; // ボード中心
        const color = DART_COLORS.first;
        const index = 0;

        // 期待される画面座標（ボード中心 = キャンバス中心）
        const expectedScreenPos = mockTransform.physicalToScreen(0, 0);
        const center = mockTransform.getCenter();
        expect(expectedScreenPos.x).toBeCloseTo(center.x, 1);
        expect(expectedScreenPos.y).toBeCloseTo(center.y, 1);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(center.x, 1); // x座標
        expect(firstCircleCall[1]).toBeCloseTo(center.y, 1); // y座標

        const textCall = textSpy.mock.calls[0];
        expect(textCall[1]).toBeCloseTo(center.x, 1); // x座標
        expect(textCall[2]).toBeCloseTo(center.y, 1); // y座標
      });

      test('トリプル20の座標（x=0, y=-103mm）での描画', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 0, y: -103 }; // トリプル20（真上、半径103mm）
        const color = DART_COLORS.first;
        const index = 0;

        // 期待される画面座標
        const expectedScreenPos = mockTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1);
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1);
      });

      test('ダブル20の座標（x=0, y=-166mm）での描画', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 0, y: -166 }; // ダブル20（真上、半径166mm）
        const color = DART_COLORS.second;
        const index = 1;

        // 期待される画面座標
        const expectedScreenPos = mockTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1);
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1);
      });

      test('ブル近くの座標（x=5, y=-5mm）での描画', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 5, y: -5 }; // ブル近く
        const color = DART_COLORS.third;
        const index = 2;

        // 期待される画面座標
        const expectedScreenPos = mockTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1);
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1);
      });

      test('セグメント1の位置（x=89, y=-50mm、約103mmの位置）での描画', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        // セグメント1は20番の右隣、約18度（π/10ラジアン）の位置
        // トリプルリング中央（103mm）の位置を計算
        const angle = -Math.PI / 2 + Math.PI / 10; // 真上から18度右
        const coords = {
          x: Math.round(103 * Math.cos(angle)),
          y: Math.round(103 * Math.sin(angle))
        };
        const color = DART_COLORS.first;
        const index = 0;

        // 期待される画面座標
        const expectedScreenPos = mockTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1);
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1);
      });
    });

    describe('エッジケース', () => {
      test('ボード外の座標（x=300, y=300mm）でエラーなく描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');
        const coords = { x: 300, y: 300 }; // ボード外（ボード半径225mmを超える）
        const color = DART_COLORS.first;
        const index = 0;

        // Act & Assert: エラーをスローしないことを確認
        expect(() => {
          drawDartMarker(mockP5, mockTransform, coords, color, index);
        }).not.toThrow();

        // 描画が実行されることを確認
        expect(circleSpy).toHaveBeenCalledTimes(2);
        expect(textSpy).toHaveBeenCalledTimes(1);
      });

      test('負の座標（x=-100, y=-100mm）で正しく描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: -100, y: -100 }; // 左上方向
        const color = DART_COLORS.second;
        const index = 1;

        // 期待される画面座標
        const expectedScreenPos = mockTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1);
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1);
      });

      test('極端に大きなindex（=99）でも文字列変換される', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.first;
        const index = 99;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        expect(textSpy).toHaveBeenCalledWith('100', expect.any(Number), expect.any(Number));
      });

      test('ボード端ちょうど（r=225mm、真上）での描画', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 0, y: -BOARD_PHYSICAL.rings.boardEdge }; // 真上、ボード端ちょうど
        const color = DART_COLORS.third;
        const index = 2;

        // 期待される画面座標
        const expectedScreenPos = mockTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1);
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1);
      });

      test('極小座標（x=0.1, y=0.1mm）で正しく描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 0.1, y: 0.1 }; // 非常に小さな値
        const color = DART_COLORS.first;
        const index = 0;

        // 期待される画面座標
        const expectedScreenPos = mockTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1);
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1);
      });
    });

    describe('正常系 - 異なるキャンバスサイズでの動作', () => {
      test('小さいキャンバス（400x300）でもマーカーが描画される', () => {
        // Arrange
        const smallTransform = new CoordinateTransform(400, 300, 225);
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.first;
        const index = 0;

        // Act
        drawDartMarker(mockP5, smallTransform, coords, color, index);

        // Assert
        expect(circleSpy).toHaveBeenCalledTimes(2);
      });

      test('大きいキャンバス（1920x1080）でもマーカーが描画される', () => {
        // Arrange
        const largeTransform = new CoordinateTransform(1920, 1080, 225);
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.second;
        const index = 1;

        // Act
        drawDartMarker(mockP5, largeTransform, coords, color, index);

        // Assert
        expect(circleSpy).toHaveBeenCalledTimes(2);
      });

      test('正方形キャンバス（800x800）でも正しいサイズで描画される', () => {
        // Arrange
        const squareTransform = new CoordinateTransform(800, 800, 225);
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 50, y: -50 };
        const color = DART_COLORS.third;
        const index = 2;

        // 期待される画面座標
        const expectedScreenPos = squareTransform.physicalToScreen(coords.x, coords.y);

        // Act
        drawDartMarker(mockP5, squareTransform, coords, color, index);

        // Assert
        const firstCircleCall = circleSpy.mock.calls[0];
        expect(firstCircleCall[0]).toBeCloseTo(expectedScreenPos.x, 1);
        expect(firstCircleCall[1]).toBeCloseTo(expectedScreenPos.y, 1);
      });
    });

    describe('正常系 - 複数回の呼び出し', () => {
      test('同じ座標で複数回呼び出しても一貫した結果が得られる', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const coords = { x: 30, y: -40 };
        const color = DART_COLORS.first;
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);
        const firstCalls = [...circleSpy.mock.calls];

        vi.clearAllMocks();

        drawDartMarker(mockP5, mockTransform, coords, color, index);
        const secondCalls = [...circleSpy.mock.calls];

        // Assert
        expect(firstCalls.length).toBe(2);
        expect(secondCalls.length).toBe(2);

        // 同じ座標、同じサイズで描画されることを確認
        firstCalls.forEach((call, i) => {
          expect(call[0]).toBeCloseTo(secondCalls[i][0] as number, 5); // x座標
          expect(call[1]).toBeCloseTo(secondCalls[i][1] as number, 5); // y座標
          expect(call[2]).toBeCloseTo(secondCalls[i][2] as number, 5); // 直径
        });
      });

      test('異なる3本のダーツを順番に描画できる', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');
        const coords1 = { x: 0, y: -103 };   // トリプル20
        const coords2 = { x: 30, y: -100 };  // トリプル20の近く
        const coords3 = { x: -30, y: -100 }; // トリプル20の近く

        // Act
        drawDartMarker(mockP5, mockTransform, coords1, DART_COLORS.first, 0);
        drawDartMarker(mockP5, mockTransform, coords2, DART_COLORS.second, 1);
        drawDartMarker(mockP5, mockTransform, coords3, DART_COLORS.third, 2);

        // Assert
        expect(textSpy).toHaveBeenCalledTimes(3);
        expect(textSpy.mock.calls[0][0]).toBe('1');
        expect(textSpy.mock.calls[1][0]).toBe('2');
        expect(textSpy.mock.calls[2][0]).toBe('3');
      });
    });

    describe('正常系 - 描画順序の検証', () => {
      test('fill, circle, textが正しい順序で呼び出される', () => {
        // Arrange
        const callOrder: string[] = [];

        mockP5.fill = vi.fn(() => callOrder.push('fill'));
        mockP5.noStroke = vi.fn(() => callOrder.push('noStroke'));
        mockP5.circle = vi.fn(() => callOrder.push('circle'));
        mockP5.text = vi.fn(() => callOrder.push('text'));
        mockP5.textAlign = vi.fn(() => callOrder.push('textAlign'));
        mockP5.textSize = vi.fn(() => callOrder.push('textSize'));

        const coords = { x: 0, y: 0 };
        const color = DART_COLORS.first;
        const index = 0;

        // Act
        drawDartMarker(mockP5, mockTransform, coords, color, index);

        // Assert
        // 期待される描画順序:
        // 1. noStroke
        // 2. fill(外側の色)
        // 3. circle(外側)
        // 4. fill(白)
        // 5. circle(内側)
        // 6. textAlign, fill(黒), noStroke, textSize, text
        expect(callOrder[0]).toBe('noStroke');
        expect(callOrder[1]).toBe('fill');
        expect(callOrder[2]).toBe('circle');
        expect(callOrder[3]).toBe('fill');
        expect(callOrder[4]).toBe('circle');
        expect(callOrder.includes('text')).toBe(true);
      });
    });
  });
});
