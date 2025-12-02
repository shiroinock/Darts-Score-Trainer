/**
 * ダーツ凡例描画の統合テスト
 * p5.jsのモック化とスパイを活用して、drawLegend関数の呼び出しを検証する
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type p5Types from 'p5';
import { DART_COLORS } from '../../utils/constants';
import { drawLegend } from '../../components/DartBoard/dartBoardRenderer';

describe('dartboard-legend-rendering integration', () => {
  let mockP5: p5Types;

  beforeEach(() => {
    // p5.jsのモックオブジェクトを作成
    mockP5 = {
      fill: vi.fn(),
      noStroke: vi.fn(),
      circle: vi.fn(),
      text: vi.fn(),
      textAlign: vi.fn(),
      textSize: vi.fn(),
      LEFT: 'left' as const,
      CENTER: 'center' as const,
    } as unknown as p5Types;
  });

  describe('drawLegend', () => {
    describe('正常系 - 基本的な描画検証', () => {
      test('dartCount=0 のとき何も描画されない', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 0);

        // Assert
        expect(fillSpy).not.toHaveBeenCalled();
        expect(circleSpy).not.toHaveBeenCalled();
        expect(textSpy).not.toHaveBeenCalled();
      });

      test('dartCount=1 のとき1本目の凡例のみ描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 1);

        // Assert
        // circle: 1回（1本目の色付き円）
        // fill: 2回（1本目の円の色 + テキストの色）
        // text: 1回（1本目のラベル）
        expect(circleSpy).toHaveBeenCalledTimes(1);
        expect(fillSpy).toHaveBeenCalledTimes(2);
        expect(textSpy).toHaveBeenCalledTimes(1);

        // 1本目の色が使用されることを確認
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.first);
        // 1本目のラベルが描画されることを確認
        expect(textSpy).toHaveBeenCalledWith('1本目', expect.any(Number), expect.any(Number));
      });

      test('dartCount=2 のとき2本分の凡例が描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 2);

        // Assert
        // circle: 2回（2本分の色付き円）
        // fill: 4回（2本分の円の色 + 2本分のテキストの色）
        // text: 2回（2本分のラベル）
        expect(circleSpy).toHaveBeenCalledTimes(2);
        expect(fillSpy).toHaveBeenCalledTimes(4);
        expect(textSpy).toHaveBeenCalledTimes(2);

        // 色が使用されることを確認
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.first);
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.second);
        // ラベルが描画されることを確認
        expect(textSpy).toHaveBeenCalledWith('1本目', expect.any(Number), expect.any(Number));
        expect(textSpy).toHaveBeenCalledWith('2本目', expect.any(Number), expect.any(Number));
      });

      test('dartCount=3 のとき3本すべての凡例が描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        // circle: 3回（3本分の色付き円）
        // fill: 6回（3本分の円の色 + 3本分のテキストの色）
        // text: 3回（3本分のラベル）
        expect(circleSpy).toHaveBeenCalledTimes(3);
        expect(fillSpy).toHaveBeenCalledTimes(6);
        expect(textSpy).toHaveBeenCalledTimes(3);

        // 色が使用されることを確認
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.first);
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.second);
        expect(fillSpy).toHaveBeenCalledWith(DART_COLORS.third);
        // ラベルが描画されることを確認
        expect(textSpy).toHaveBeenCalledWith('1本目', expect.any(Number), expect.any(Number));
        expect(textSpy).toHaveBeenCalledWith('2本目', expect.any(Number), expect.any(Number));
        expect(textSpy).toHaveBeenCalledWith('3本目', expect.any(Number), expect.any(Number));
      });
    });

    describe('正常系 - 色の検証', () => {
      test('1本目の円がDART_COLORS.first（赤系: #FF6B6B）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        const fillCalls = fillSpy.mock.calls;
        // 最初の fill() 呼び出しが1本目の色であることを確認
        expect(fillCalls[0][0]).toBe(DART_COLORS.first);
      });

      test('2本目の円がDART_COLORS.second（青緑系: #4ECDC4）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        const fillCalls = fillSpy.mock.calls;
        // 3番目の fill() 呼び出しが2本目の色であることを確認（1本目の円、1本目のテキスト、2本目の円）
        expect(fillCalls[2][0]).toBe(DART_COLORS.second);
      });

      test('3本目の円がDART_COLORS.third（黄系: #FFE66D）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        const fillCalls = fillSpy.mock.calls;
        // 5番目の fill() 呼び出しが3本目の色であることを確認
        expect(fillCalls[4][0]).toBe(DART_COLORS.third);
      });

      test('テキストが白色（#FFFFFF）で描画される', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        // fill() は円の色とテキストの色で交互に呼ばれる
        // テキストの色は #FFFFFF
        const fillCalls = fillSpy.mock.calls;
        expect(fillCalls[1][0]).toBe('#FFFFFF'); // 1本目のテキスト
        expect(fillCalls[3][0]).toBe('#FFFFFF'); // 2本目のテキスト
        expect(fillCalls[5][0]).toBe('#FFFFFF'); // 3本目のテキスト
      });
    });

    describe('正常系 - 配置の検証', () => {
      test('1本目の円が左マージン20px、上マージン20pxの位置に描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');

        // Act
        drawLegend(mockP5, 1);

        // Assert
        const circleCall = circleSpy.mock.calls[0];
        expect(circleCall[0]).toBe(20); // x座標（左マージン）
        expect(circleCall[1]).toBe(20); // y座標（上マージン）
        expect(circleCall[2]).toBe(12); // 直径
      });

      test('2本目の円が1本目から30px下の位置に描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');

        // Act
        drawLegend(mockP5, 2);

        // Assert
        const firstCircle = circleSpy.mock.calls[0];
        const secondCircle = circleSpy.mock.calls[1];

        expect(firstCircle[1]).toBe(20); // 1本目のy座標
        expect(secondCircle[1]).toBe(50); // 2本目のy座標（20 + 30）
      });

      test('3本目の円が2本目から30px下の位置に描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        const secondCircle = circleSpy.mock.calls[1];
        const thirdCircle = circleSpy.mock.calls[2];

        expect(secondCircle[1]).toBe(50); // 2本目のy座標
        expect(thirdCircle[1]).toBe(80); // 3本目のy座標（50 + 30）
      });

      test('テキストが円の右側に10px離れた位置に描画される', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 1);

        // Assert
        const circleCall = circleSpy.mock.calls[0];
        const textCall = textSpy.mock.calls[0];

        // 円の中心x座標 = 20px
        // 円の半径 = 6px（直径12px）
        // テキストのx座標 = 20 + 6 + 10 = 36px
        expect(circleCall[0]).toBe(20); // 円のx座標
        expect(textCall[1]).toBe(36); // テキストのx座標（20 + 12/2 + 10）
        expect(textCall[2]).toBe(20); // テキストのy座標（円と同じ）
      });
    });

    describe('正常系 - テキストスタイルの検証', () => {
      test('テキストが左揃え・垂直中央揃え（LEFT, CENTER）で描画される', () => {
        // Arrange
        const textAlignSpy = vi.spyOn(mockP5, 'textAlign');

        // Act
        drawLegend(mockP5, 1);

        // Assert
        expect(textAlignSpy).toHaveBeenCalledWith(mockP5.LEFT, mockP5.CENTER);
      });

      test('テキストサイズが16pxに設定される', () => {
        // Arrange
        const textSizeSpy = vi.spyOn(mockP5, 'textSize');

        // Act
        drawLegend(mockP5, 1);

        // Assert
        expect(textSizeSpy).toHaveBeenCalledWith(16);
      });

      test('noStroke()が呼び出される', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawLegend(mockP5, 1);

        // Assert
        expect(noStrokeSpy).toHaveBeenCalled();
      });
    });

    describe('正常系 - ラベルテキストの検証', () => {
      test('1本目のラベルが「1本目」である', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 1);

        // Assert
        expect(textSpy).toHaveBeenCalledWith('1本目', expect.any(Number), expect.any(Number));
      });

      test('2本目のラベルが「2本目」である', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 2);

        // Assert
        const textCalls = textSpy.mock.calls;
        expect(textCalls[0][0]).toBe('1本目');
        expect(textCalls[1][0]).toBe('2本目');
      });

      test('3本目のラベルが「3本目」である', () => {
        // Arrange
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        const textCalls = textSpy.mock.calls;
        expect(textCalls[0][0]).toBe('1本目');
        expect(textCalls[1][0]).toBe('2本目');
        expect(textCalls[2][0]).toBe('3本目');
      });
    });

    describe('正常系 - 円のサイズ検証', () => {
      test('各円の直径が12pxである', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        const circleCalls = circleSpy.mock.calls;
        expect(circleCalls[0][2]).toBe(12); // 1本目の円の直径
        expect(circleCalls[1][2]).toBe(12); // 2本目の円の直径
        expect(circleCalls[2][2]).toBe(12); // 3本目の円の直径
      });
    });

    describe('正常系 - 描画順序の検証', () => {
      test('noStroke, fill, circle, textAlign, fill, textSize, textが正しい順序で呼び出される（dartCount=1）', () => {
        // Arrange
        const callOrder: string[] = [];

        mockP5.noStroke = vi.fn(() => callOrder.push('noStroke'));
        mockP5.fill = vi.fn(() => callOrder.push('fill'));
        mockP5.circle = vi.fn(() => callOrder.push('circle'));
        mockP5.textAlign = vi.fn(() => callOrder.push('textAlign'));
        mockP5.textSize = vi.fn(() => callOrder.push('textSize'));
        mockP5.text = vi.fn(() => callOrder.push('text'));

        // Act
        drawLegend(mockP5, 1);

        // Assert
        // 期待される順序:
        // 1. noStroke（共通設定）
        // 2. fill（1本目の円の色）
        // 3. circle（1本目の円）
        // 4. textAlign（テキスト揃え）
        // 5. fill（テキストの色）
        // 6. textSize（テキストサイズ）
        // 7. text（1本目のラベル）
        expect(callOrder[0]).toBe('noStroke');
        expect(callOrder[1]).toBe('fill');
        expect(callOrder[2]).toBe('circle');
        expect(callOrder[3]).toBe('textAlign');
        expect(callOrder[4]).toBe('fill');
        expect(callOrder[5]).toBe('textSize');
        expect(callOrder[6]).toBe('text');
      });

      test('複数のダーツで各要素が順番に描画される（dartCount=3）', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, 3);

        // Assert
        // 各ダーツの y座標が増加していることを確認
        const circleYs = circleSpy.mock.calls.map(call => call[1]);
        expect(circleYs[0]).toBeLessThan(circleYs[1] as number);
        expect(circleYs[1]).toBeLessThan(circleYs[2] as number);

        const textYs = textSpy.mock.calls.map(call => call[2]);
        expect(textYs[0]).toBeLessThan(textYs[1] as number);
        expect(textYs[1]).toBeLessThan(textYs[2] as number);
      });
    });

    describe('エッジケース', () => {
      test('dartCount が負の値のとき何も描画されない', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act
        drawLegend(mockP5, -1);

        // Assert
        expect(fillSpy).not.toHaveBeenCalled();
        expect(circleSpy).not.toHaveBeenCalled();
        expect(textSpy).not.toHaveBeenCalled();
      });

      test('dartCount が4以上の値でもエラーなく動作する（配列外参照の防止）', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');
        const textSpy = vi.spyOn(mockP5, 'text');

        // Act & Assert: エラーをスローしないことを確認
        expect(() => {
          drawLegend(mockP5, 4);
        }).not.toThrow();

        // 3本分のみ描画されることを確認（配列の長さは3）
        expect(circleSpy).toHaveBeenCalledTimes(3);
        expect(textSpy).toHaveBeenCalledTimes(3);
      });

      test('複数回呼び出しても一貫した結果が得られる', () => {
        // Arrange
        const circleSpy = vi.spyOn(mockP5, 'circle');

        // Act
        drawLegend(mockP5, 2);
        const firstCalls = [...circleSpy.mock.calls];

        vi.clearAllMocks();

        drawLegend(mockP5, 2);
        const secondCalls = [...circleSpy.mock.calls];

        // Assert
        expect(firstCalls.length).toBe(2);
        expect(secondCalls.length).toBe(2);

        // 同じ位置、同じサイズで描画されることを確認
        firstCalls.forEach((call, i) => {
          expect(call[0]).toBe(secondCalls[i][0]); // x座標
          expect(call[1]).toBe(secondCalls[i][1]); // y座標
          expect(call[2]).toBe(secondCalls[i][2]); // 直径
        });
      });
    });
  });
});
