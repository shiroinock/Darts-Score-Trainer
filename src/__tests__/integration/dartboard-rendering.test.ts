/**
 * ダーツボード描画の統合テスト
 * p5.jsのモック化とスパイを活用して、描画関数の呼び出しを検証する
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type p5Types from 'p5';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { BOARD_PHYSICAL } from '../../utils/constants';
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

  describe('drawSegments', () => {
    describe('正常系 - セグメント描画の検証', () => {
      test('20個のセグメントが描画される（arc呼び出しが40回）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // 各セグメントで外側と内側の扇形を描画するため、20セグメント × 2 = 40回
        expect(arcSpy).toHaveBeenCalledTimes(40);
      });

      test('セグメントが正しい色（黒とベージュの交互）で塗られる', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // fill() の呼び出し回数を確認（各セグメント2回 = 外側 + 内側）
        expect(fillSpy).toHaveBeenCalled();

        // 最初のセグメント（偶数インデックス0）は黒
        expect(fillSpy).toHaveBeenNthCalledWith(1, '#000000');

        // 2番目のセグメント（奇数インデックス1）はベージュ
        expect(fillSpy).toHaveBeenNthCalledWith(3, '#D4C5A9');

        // 3番目のセグメント（偶数インデックス2）は黒
        expect(fillSpy).toHaveBeenNthCalledWith(5, '#000000');

        // 4番目のセグメント（奇数インデックス3）はベージュ
        expect(fillSpy).toHaveBeenNthCalledWith(7, '#D4C5A9');
      });

      test('各セグメントの角度が正しい（18度ずつ）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedAngleDiff = Math.PI / 10; // 18度 = π/10ラジアン

        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // arc() の引数: arc(x, y, width, height, start, stop, mode)
        // 最初のセグメントの開始角度と終了角度を確認
        const firstOuterArc = arcSpy.mock.calls[0];
        const startAngle1 = firstOuterArc[4] as number; // インデックス4が開始角度
        const endAngle1 = firstOuterArc[5] as number;   // インデックス5が終了角度

        // 角度差が18度（π/10ラジアン）であることを確認
        expect(endAngle1 - startAngle1).toBeCloseTo(expectedAngleDiff, 5);

        // 2番目のセグメントの開始角度が最初のセグメントの終了角度と一致することを確認
        const secondOuterArc = arcSpy.mock.calls[2]; // インデックス2（内側をスキップ）
        const startAngle2 = secondOuterArc[4] as number;

        expect(startAngle2).toBeCloseTo(endAngle1, 5);
      });

      test('内側半径がOUTER_BULL_RADIUS、外側半径がBOARD_RADIUSである', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // 期待される半径（画面座標）
        const expectedInnerRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.outerBull);
        const expectedOuterRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.boardEdge);

        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // arc() の引数: arc(x, y, width, height, start, stop, mode)
        // 最初のセグメントの外側の扇形（インデックス0）
        const firstOuterArc = arcSpy.mock.calls[0];
        const outerWidth = firstOuterArc[2] as number;   // インデックス2が幅
        const outerHeight = firstOuterArc[3] as number;  // インデックス3が高さ
        expect(outerWidth).toBeCloseTo(expectedOuterRadius * 2, 1);
        expect(outerHeight).toBeCloseTo(expectedOuterRadius * 2, 1);

        // 最初のセグメントの内側の扇形（インデックス1）
        const firstInnerArc = arcSpy.mock.calls[1];
        const innerWidth = firstInnerArc[2] as number;
        const innerHeight = firstInnerArc[3] as number;
        expect(innerWidth).toBeCloseTo(expectedInnerRadius * 2, 1);
        expect(innerHeight).toBeCloseTo(expectedInnerRadius * 2, 1);
      });

      test('真上から時計回りに描画される（最初のセグメントは-π/2中心）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // arc() の引数: arc(x, y, width, height, start, stop, mode)
        // 最初のセグメントの中心角度が-π/2（真上）であることを確認
        const firstOuterArc = arcSpy.mock.calls[0];
        const startAngle = firstOuterArc[4] as number; // インデックス4が開始角度
        const endAngle = firstOuterArc[5] as number;   // インデックス5が終了角度
        const centerAngle = (startAngle + endAngle) / 2;

        expect(centerAngle).toBeCloseTo(-Math.PI / 2, 5);
      });
    });

    describe('正常系 - p5メソッドの呼び出し順序', () => {
      test('noStroke() がループ外で一度だけ呼び出される（パフォーマンス最適化）', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // noStroke()はループ外で一度だけ呼ばれる（20回ではなく1回に最適化）
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });

      test('push/pop が各セグメントで呼び出される', () => {
        // Arrange
        const pushSpy = vi.spyOn(mockP5, 'push');
        const popSpy = vi.spyOn(mockP5, 'pop');

        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // 各セグメントでpush/popが呼ばれる（20回ずつ）
        expect(pushSpy).toHaveBeenCalledTimes(20);
        expect(popSpy).toHaveBeenCalledTimes(20);
      });

      test('translate が正しい座標で呼び出される', () => {
        // Arrange
        const translateSpy = vi.spyOn(mockP5, 'translate');
        const center = mockTransform.getCenter();

        // Act
        drawSegments(mockP5, mockTransform);

        // Assert
        // 各セグメントでtranslate()がボード中心座標で呼ばれる（20回）
        expect(translateSpy).toHaveBeenCalledTimes(20);
        expect(translateSpy).toHaveBeenCalledWith(center.x, center.y);
      });
    });

    describe('境界値 - 異なるキャンバスサイズでの動作', () => {
      test('小さいキャンバス（200x200）でも正常に20セグメント描画される', () => {
        // Arrange
        const smallTransform = new CoordinateTransform(200, 200, 225);
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawSegments(mockP5, smallTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(40);
      });

      test('大きいキャンバス（2000x2000）でも正常に20セグメント描画される', () => {
        // Arrange
        const largeTransform = new CoordinateTransform(2000, 2000, 225);
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawSegments(mockP5, largeTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(40);
      });

      test('横長のキャンバス（1920x600）でも正常に描画される', () => {
        // Arrange
        const wideTransform = new CoordinateTransform(1920, 600, 225);
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawSegments(mockP5, wideTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(40);
        expect(() => drawSegments(mockP5, wideTransform)).not.toThrow();
      });
    });
  });

  describe('drawRings', () => {
    describe('正常系 - リング描画の検証', () => {
      test('トリプルリングとダブルリングが描画される（arc呼び出しが80回）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // 各セグメントでトリプル（外側+内側）とダブル（外側+内側）を描画するため、
        // 20セグメント × 4 = 80回
        expect(arcSpy).toHaveBeenCalledTimes(80);
      });

      test('リングが正しい色（赤と緑の交互）で塗られる', () => {
        // Arrange
        const fillSpy = vi.spyOn(mockP5, 'fill');

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // fill() の呼び出し回数を確認
        expect(fillSpy).toHaveBeenCalled();

        // 最初のセグメント（偶数インデックス0）は赤
        expect(fillSpy).toHaveBeenNthCalledWith(1, '#DC143C');

        // 2番目のセグメント（奇数インデックス1）は緑
        expect(fillSpy).toHaveBeenNthCalledWith(5, '#228B22');

        // 3番目のセグメント（偶数インデックス2）は赤
        expect(fillSpy).toHaveBeenNthCalledWith(9, '#DC143C');

        // 4番目のセグメント（奇数インデックス3）は緑
        expect(fillSpy).toHaveBeenNthCalledWith(13, '#228B22');
      });

      test('トリプルリングの半径が正しい（99-107mm）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // 期待される半径（画面座標）
        const expectedTripleInnerRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.tripleInner);
        const expectedTripleOuterRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.tripleOuter);

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // arc() の引数: arc(x, y, width, height, start, stop, mode)
        // 最初のセグメントのトリプルリング外側の扇形（インデックス0）
        const firstTripleOuter = arcSpy.mock.calls[0];
        const tripleOuterWidth = firstTripleOuter[2] as number;
        const tripleOuterHeight = firstTripleOuter[3] as number;
        expect(tripleOuterWidth).toBeCloseTo(expectedTripleOuterRadius * 2, 1);
        expect(tripleOuterHeight).toBeCloseTo(expectedTripleOuterRadius * 2, 1);

        // 最初のセグメントのトリプルリング内側の扇形（インデックス1）
        const firstTripleInner = arcSpy.mock.calls[1];
        const tripleInnerWidth = firstTripleInner[2] as number;
        const tripleInnerHeight = firstTripleInner[3] as number;
        expect(tripleInnerWidth).toBeCloseTo(expectedTripleInnerRadius * 2, 1);
        expect(tripleInnerHeight).toBeCloseTo(expectedTripleInnerRadius * 2, 1);
      });

      test('ダブルリングの半径が正しい（162-170mm）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // 期待される半径（画面座標）
        const expectedDoubleInnerRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.doubleInner);
        const expectedDoubleOuterRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.doubleOuter);

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // arc() の引数: arc(x, y, width, height, start, stop, mode)
        // 最初のセグメントのダブルリング外側の扇形（インデックス2）
        const firstDoubleOuter = arcSpy.mock.calls[2];
        const doubleOuterWidth = firstDoubleOuter[2] as number;
        const doubleOuterHeight = firstDoubleOuter[3] as number;
        expect(doubleOuterWidth).toBeCloseTo(expectedDoubleOuterRadius * 2, 1);
        expect(doubleOuterHeight).toBeCloseTo(expectedDoubleOuterRadius * 2, 1);

        // 最初のセグメントのダブルリング内側の扇形（インデックス3）
        const firstDoubleInner = arcSpy.mock.calls[3];
        const doubleInnerWidth = firstDoubleInner[2] as number;
        const doubleInnerHeight = firstDoubleInner[3] as number;
        expect(doubleInnerWidth).toBeCloseTo(expectedDoubleInnerRadius * 2, 1);
        expect(doubleInnerHeight).toBeCloseTo(expectedDoubleInnerRadius * 2, 1);
      });

      test('各セグメントの角度が正しい（18度ずつ）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');
        const expectedAngleDiff = Math.PI / 10; // 18度 = π/10ラジアン

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // arc() の引数: arc(x, y, width, height, start, stop, mode)
        // 最初のセグメントのトリプルリング外側の開始角度と終了角度を確認
        const firstTripleOuter = arcSpy.mock.calls[0];
        const startAngle1 = firstTripleOuter[4] as number; // インデックス4が開始角度
        const endAngle1 = firstTripleOuter[5] as number;   // インデックス5が終了角度

        // 角度差が18度（π/10ラジアン）であることを確認
        expect(endAngle1 - startAngle1).toBeCloseTo(expectedAngleDiff, 5);

        // 2番目のセグメントの開始角度が最初のセグメントの終了角度と一致することを確認
        const secondTripleOuter = arcSpy.mock.calls[4]; // インデックス4（最初のセグメントの4つのarcをスキップ）
        const startAngle2 = secondTripleOuter[4] as number;

        expect(startAngle2).toBeCloseTo(endAngle1, 5);
      });

      test('真上から時計回りに描画される（最初のセグメントは-π/2中心）', () => {
        // Arrange
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // arc() の引数: arc(x, y, width, height, start, stop, mode)
        // 最初のセグメントの中心角度が-π/2（真上）であることを確認
        const firstTripleOuter = arcSpy.mock.calls[0];
        const startAngle = firstTripleOuter[4] as number; // インデックス4が開始角度
        const endAngle = firstTripleOuter[5] as number;   // インデックス5が終了角度
        const centerAngle = (startAngle + endAngle) / 2;

        expect(centerAngle).toBeCloseTo(-Math.PI / 2, 5);
      });
    });

    describe('正常系 - p5メソッドの呼び出し順序', () => {
      test('noStroke() がループ外で一度だけ呼び出される（パフォーマンス最適化）', () => {
        // Arrange
        const noStrokeSpy = vi.spyOn(mockP5, 'noStroke');

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // noStroke()はループ外で一度だけ呼ばれる（20回ではなく1回に最適化）
        expect(noStrokeSpy).toHaveBeenCalledTimes(1);
      });

      test('push/pop が各セグメントで呼び出される', () => {
        // Arrange
        const pushSpy = vi.spyOn(mockP5, 'push');
        const popSpy = vi.spyOn(mockP5, 'pop');

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // 各セグメントでpush/popが呼ばれる（20回ずつ）
        expect(pushSpy).toHaveBeenCalledTimes(20);
        expect(popSpy).toHaveBeenCalledTimes(20);
      });

      test('translate が正しい座標で呼び出される', () => {
        // Arrange
        const translateSpy = vi.spyOn(mockP5, 'translate');
        const center = mockTransform.getCenter();

        // Act
        drawRings(mockP5, mockTransform);

        // Assert
        // 各セグメントでtranslate()がボード中心座標で呼ばれる（20回）
        expect(translateSpy).toHaveBeenCalledTimes(20);
        expect(translateSpy).toHaveBeenCalledWith(center.x, center.y);
      });
    });

    describe('境界値 - 異なるキャンバスサイズでの動作', () => {
      test('小さいキャンバス（200x200）でも正常に描画される', () => {
        // Arrange
        const smallTransform = new CoordinateTransform(200, 200, 225);
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawRings(mockP5, smallTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(80);
        expect(() => drawRings(mockP5, smallTransform)).not.toThrow();
      });

      test('大きいキャンバス（2000x2000）でも正常に描画される', () => {
        // Arrange
        const largeTransform = new CoordinateTransform(2000, 2000, 225);
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawRings(mockP5, largeTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(80);
        expect(() => drawRings(mockP5, largeTransform)).not.toThrow();
      });

      test('横長のキャンバス（1920x600）でも正常に描画される', () => {
        // Arrange
        const wideTransform = new CoordinateTransform(1920, 600, 225);
        const arcSpy = vi.spyOn(mockP5, 'arc');

        // Act
        drawRings(mockP5, wideTransform);

        // Assert
        expect(arcSpy).toHaveBeenCalledTimes(80);
        expect(() => drawRings(mockP5, wideTransform)).not.toThrow();
      });
    });
  });
});
