import { describe, test, expect } from 'vitest';
import { CoordinateTransform } from './coordinateTransform';

describe('CoordinateTransform', () => {
  describe('constructor', () => {
    describe('正常系', () => {
      test('正しいパラメータでインスタンスを生成できる', () => {
        // Arrange & Act
        const transform = new CoordinateTransform(800, 600, 225);

        // Assert
        expect(transform).toBeInstanceOf(CoordinateTransform);
      });

      test('小さいキャンバスサイズでもインスタンスを生成できる', () => {
        // Arrange & Act
        const transform = new CoordinateTransform(400, 300, 225);

        // Assert
        expect(transform).toBeInstanceOf(CoordinateTransform);
      });

      test('大きいキャンバスサイズでもインスタンスを生成できる', () => {
        // Arrange & Act
        const transform = new CoordinateTransform(1920, 1080, 225);

        // Assert
        expect(transform).toBeInstanceOf(CoordinateTransform);
      });
    });

    describe('異常系', () => {
      test('ボード半径が0の場合はエラーをスローする', () => {
        // Arrange & Act & Assert
        expect(() => new CoordinateTransform(800, 600, 0)).toThrow();
      });

      test('ボード半径が負の値の場合はエラーをスローする', () => {
        // Arrange & Act & Assert
        expect(() => new CoordinateTransform(800, 600, -10)).toThrow();
      });

      test('キャンバス幅が0の場合はエラーをスローする', () => {
        // Arrange & Act & Assert
        expect(() => new CoordinateTransform(0, 600, 225)).toThrow();
      });

      test('キャンバス高さが0の場合はエラーをスローする', () => {
        // Arrange & Act & Assert
        expect(() => new CoordinateTransform(800, 0, 225)).toThrow();
      });

      test('キャンバス幅が負の値の場合はエラーをスローする', () => {
        // Arrange & Act & Assert
        expect(() => new CoordinateTransform(-800, 600, 225)).toThrow();
      });

      test('キャンバス高さが負の値の場合はエラーをスローする', () => {
        // Arrange & Act & Assert
        expect(() => new CoordinateTransform(800, -600, 225)).toThrow();
      });
    });
  });

  describe('physicalToScreen', () => {
    describe('正常系', () => {
      test('物理座標(0,0)はキャンバス中心に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(0, 0);

        // Assert
        expect(screen.x).toBe(400);
        expect(screen.y).toBe(300);
      });

      test('物理座標(100,0)は中心から右に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(100, 0);

        // Assert
        expect(screen.x).toBeGreaterThan(400);
        expect(screen.y).toBe(300);
      });

      test('物理座標(-100,0)は中心から左に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(-100, 0);

        // Assert
        expect(screen.x).toBeLessThan(400);
        expect(screen.y).toBe(300);
      });

      test('物理座標(0,100)は中心から下に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(0, 100);

        // Assert
        expect(screen.x).toBe(400);
        expect(screen.y).toBeGreaterThan(300);
      });

      test('物理座標(0,-100)は中心から上に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(0, -100);

        // Assert
        expect(screen.x).toBe(400);
        expect(screen.y).toBeLessThan(300);
      });
    });

    describe('境界値', () => {
      test('ボード右端(225,0)はキャンバス右端付近に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(225, 0);

        // Assert
        expect(screen.x).toBeCloseTo(800, 0);
        expect(screen.y).toBe(300);
      });

      test('ボード左端(-225,0)はキャンバス左端付近に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(-225, 0);

        // Assert
        expect(screen.x).toBeCloseTo(0, 0);
        expect(screen.y).toBe(300);
      });

      test('ボード下端(0,225)はキャンバス下端付近に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(0, 225);

        // Assert
        expect(screen.x).toBe(400);
        expect(screen.y).toBeCloseTo(600, 0);
      });

      test('ボード上端(0,-225)はキャンバス上端付近に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(0, -225);

        // Assert
        expect(screen.x).toBe(400);
        expect(screen.y).toBeCloseTo(0, 0);
      });
    });

    describe('エッジケース', () => {
      test('ボード外の座標(300,0)も変換できる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(300, 0);

        // Assert
        expect(screen.x).toBeGreaterThan(800); // キャンバス外
      });

      test('ボード外の負の座標(-300,0)も変換できる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(-300, 0);

        // Assert
        expect(screen.x).toBeLessThan(0); // キャンバス外
      });

      test('インナーブル中心(0,0)は正確に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(0, 0);

        // Assert
        expect(screen.x).toBe(400);
        expect(screen.y).toBe(300);
      });

      test('トリプルリング中心距離(103,0)は正確に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(103, 0);

        // Assert
        expect(screen.x).toBeGreaterThan(400);
      });
    });
  });

  describe('screenToPhysical', () => {
    describe('正常系', () => {
      test('キャンバス中心(400,300)は物理座標(0,0)に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physical = transform.screenToPhysical(400, 300);

        // Assert
        expect(physical.x).toBeCloseTo(0, 1);
        expect(physical.y).toBeCloseTo(0, 1);
      });

      test('キャンバス右側の座標は正の物理X座標に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physical = transform.screenToPhysical(600, 300);

        // Assert
        expect(physical.x).toBeGreaterThan(0);
        expect(physical.y).toBeCloseTo(0, 1);
      });

      test('キャンバス左側の座標は負の物理X座標に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physical = transform.screenToPhysical(200, 300);

        // Assert
        expect(physical.x).toBeLessThan(0);
        expect(physical.y).toBeCloseTo(0, 1);
      });

      test('キャンバス下側の座標は正の物理Y座標に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physical = transform.screenToPhysical(400, 450);

        // Assert
        expect(physical.x).toBeCloseTo(0, 1);
        expect(physical.y).toBeGreaterThan(0);
      });

      test('キャンバス上側の座標は負の物理Y座標に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physical = transform.screenToPhysical(400, 150);

        // Assert
        expect(physical.x).toBeCloseTo(0, 1);
        expect(physical.y).toBeLessThan(0);
      });
    });

    describe('往復変換の可逆性', () => {
      test('物理座標→画面座標→物理座標で元の値に戻る（原点）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = { x: 0, y: 0 };

        // Act
        const screen = transform.physicalToScreen(original.x, original.y);
        const back = transform.screenToPhysical(screen.x, screen.y);

        // Assert
        expect(back.x).toBeCloseTo(original.x, 1);
        expect(back.y).toBeCloseTo(original.y, 1);
      });

      test('物理座標→画面座標→物理座標で元の値に戻る（トリプルリング）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = { x: 103, y: 50 };

        // Act
        const screen = transform.physicalToScreen(original.x, original.y);
        const back = transform.screenToPhysical(screen.x, screen.y);

        // Assert
        expect(back.x).toBeCloseTo(original.x, 1);
        expect(back.y).toBeCloseTo(original.y, 1);
      });

      test('物理座標→画面座標→物理座標で元の値に戻る（ダブルリング）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = { x: 166, y: -100 };

        // Act
        const screen = transform.physicalToScreen(original.x, original.y);
        const back = transform.screenToPhysical(screen.x, screen.y);

        // Assert
        expect(back.x).toBeCloseTo(original.x, 1);
        expect(back.y).toBeCloseTo(original.y, 1);
      });

      test('物理座標→画面座標→物理座標で元の値に戻る（ボード端）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = { x: 225, y: 0 };

        // Act
        const screen = transform.physicalToScreen(original.x, original.y);
        const back = transform.screenToPhysical(screen.x, screen.y);

        // Assert
        expect(back.x).toBeCloseTo(original.x, 1);
        expect(back.y).toBeCloseTo(original.y, 1);
      });

      test('物理座標→画面座標→物理座標で元の値に戻る（負の座標）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = { x: -120, y: -80 };

        // Act
        const screen = transform.physicalToScreen(original.x, original.y);
        const back = transform.screenToPhysical(screen.x, screen.y);

        // Assert
        expect(back.x).toBeCloseTo(original.x, 1);
        expect(back.y).toBeCloseTo(original.y, 1);
      });
    });

    describe('エッジケース', () => {
      test('キャンバス外の座標も変換できる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physical = transform.screenToPhysical(1000, 300);

        // Assert
        expect(physical.x).toBeGreaterThan(225); // ボード外
      });

      test('負の画面座標も変換できる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physical = transform.screenToPhysical(-100, 300);

        // Assert
        expect(physical.x).toBeLessThan(-225); // ボード外
      });
    });
  });

  describe('physicalDistanceToScreen', () => {
    describe('正常系', () => {
      test('物理距離100mmは正しい画面距離に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(100);

        // Assert
        expect(screenDistance).toBeGreaterThan(0);
      });

      test('インナーブル半径(3.175mm)は正しい画面距離に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(3.175);

        // Assert
        expect(screenDistance).toBeGreaterThan(0);
      });

      test('アウターブル半径(7.95mm)は正しい画面距離に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(7.95);

        // Assert
        expect(screenDistance).toBeGreaterThan(0);
      });

      test('トリプルリング中心(103mm)は正しい画面距離に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(103);

        // Assert
        expect(screenDistance).toBeGreaterThan(0);
      });

      test('ダブルリング中心(166mm)は正しい画面距離に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(166);

        // Assert
        expect(screenDistance).toBeGreaterThan(0);
      });

      test('ボード半径(225mm)は正しい画面距離に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(225);

        // Assert
        expect(screenDistance).toBeGreaterThan(0);
      });
    });

    describe('エッジケース', () => {
      test('距離0は画面距離0に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(0);

        // Assert
        expect(screenDistance).toBe(0);
      });

      test('負の距離も変換できる（絶対値として扱われる）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screenDistance = transform.physicalDistanceToScreen(-100);

        // Assert
        expect(screenDistance).toBeGreaterThan(0);
      });
    });
  });

  describe('screenDistanceToPhysical', () => {
    describe('正常系', () => {
      test('画面距離100pxは正しい物理距離に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physicalDistance = transform.screenDistanceToPhysical(100);

        // Assert
        expect(physicalDistance).toBeGreaterThan(0);
      });
    });

    describe('往復変換の可逆性', () => {
      test('物理距離→画面距離→物理距離で元の値に戻る（インナーブル）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = 3.175;

        // Act
        const screen = transform.physicalDistanceToScreen(original);
        const back = transform.screenDistanceToPhysical(screen);

        // Assert
        expect(back).toBeCloseTo(original, 2);
      });

      test('物理距離→画面距離→物理距離で元の値に戻る（アウターブル）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = 7.95;

        // Act
        const screen = transform.physicalDistanceToScreen(original);
        const back = transform.screenDistanceToPhysical(screen);

        // Assert
        expect(back).toBeCloseTo(original, 2);
      });

      test('物理距離→画面距離→物理距離で元の値に戻る（トリプルリング）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = 103;

        // Act
        const screen = transform.physicalDistanceToScreen(original);
        const back = transform.screenDistanceToPhysical(screen);

        // Assert
        expect(back).toBeCloseTo(original, 1);
      });

      test('物理距離→画面距離→物理距離で元の値に戻る（ダブルリング）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = 166;

        // Act
        const screen = transform.physicalDistanceToScreen(original);
        const back = transform.screenDistanceToPhysical(screen);

        // Assert
        expect(back).toBeCloseTo(original, 1);
      });

      test('物理距離→画面距離→物理距離で元の値に戻る（ボード半径）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const original = 225;

        // Act
        const screen = transform.physicalDistanceToScreen(original);
        const back = transform.screenDistanceToPhysical(screen);

        // Assert
        expect(back).toBeCloseTo(original, 1);
      });
    });

    describe('エッジケース', () => {
      test('距離0は物理距離0に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const physicalDistance = transform.screenDistanceToPhysical(0);

        // Assert
        expect(physicalDistance).toBe(0);
      });
    });
  });

  describe('updateCanvasSize', () => {
    describe('正常系', () => {
      test('キャンバスサイズを更新できる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        transform.updateCanvasSize(1024, 768);

        // Assert
        // 新しいサイズでの中心座標が正しく計算される
        const center = transform.getCenter();
        expect(center.x).toBe(512);
        expect(center.y).toBe(384);
      });

      test('キャンバスサイズ更新後も座標変換が正しく動作する', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        transform.updateCanvasSize(1024, 768);
        const screen = transform.physicalToScreen(0, 0);

        // Assert
        expect(screen.x).toBe(512);
        expect(screen.y).toBe(384);
      });

      test('キャンバスサイズ更新後もスケールが再計算される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const originalScale = transform.getScale();

        // Act
        transform.updateCanvasSize(1600, 1200);
        const newScale = transform.getScale();

        // Assert
        expect(newScale).not.toBe(originalScale);
        expect(newScale).toBeGreaterThan(originalScale);
      });
    });

    describe('異常系', () => {
      test('幅0でエラーをスローする', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act & Assert
        expect(() => transform.updateCanvasSize(0, 768)).toThrow();
      });

      test('高さ0でエラーをスローする', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act & Assert
        expect(() => transform.updateCanvasSize(1024, 0)).toThrow();
      });

      test('負の幅でエラーをスローする', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act & Assert
        expect(() => transform.updateCanvasSize(-1024, 768)).toThrow();
      });

      test('負の高さでエラーをスローする', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act & Assert
        expect(() => transform.updateCanvasSize(1024, -768)).toThrow();
      });
    });
  });

  describe('getScale', () => {
    describe('正常系', () => {
      test('正しいスケール値を返す', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const scale = transform.getScale();

        // Assert
        expect(scale).toBeGreaterThan(0);
      });

      test('縦長キャンバスでは高さベースのスケールを返す', () => {
        // Arrange
        const transform = new CoordinateTransform(400, 800, 225);

        // Act
        const scale = transform.getScale();

        // Assert
        expect(scale).toBeGreaterThan(0);
      });

      test('横長キャンバスでは幅ベースのスケールを返す', () => {
        // Arrange
        const transform = new CoordinateTransform(1600, 600, 225);

        // Act
        const scale = transform.getScale();

        // Assert
        expect(scale).toBeGreaterThan(0);
      });

      test('正方形キャンバスでは同じスケールを返す', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 800, 225);

        // Act
        const scale = transform.getScale();

        // Assert
        expect(scale).toBeGreaterThan(0);
      });
    });

    describe('スケールの一貫性', () => {
      test('physicalDistanceToScreenと一貫したスケールを使用する', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        const screenDistance = transform.physicalDistanceToScreen(100);

        // Assert
        expect(screenDistance).toBeCloseTo(100 * scale, 1);
      });
    });
  });

  describe('getCenter', () => {
    describe('正常系', () => {
      test('キャンバス中心座標を返す', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const center = transform.getCenter();

        // Assert
        expect(center.x).toBe(400);
        expect(center.y).toBe(300);
      });

      test('小さいキャンバスの中心座標を返す', () => {
        // Arrange
        const transform = new CoordinateTransform(400, 300, 225);

        // Act
        const center = transform.getCenter();

        // Assert
        expect(center.x).toBe(200);
        expect(center.y).toBe(150);
      });

      test('大きいキャンバスの中心座標を返す', () => {
        // Arrange
        const transform = new CoordinateTransform(1920, 1080, 225);

        // Act
        const center = transform.getCenter();

        // Assert
        expect(center.x).toBe(960);
        expect(center.y).toBe(540);
      });

      test('奇数サイズのキャンバスでも正しい中心座標を返す', () => {
        // Arrange
        const transform = new CoordinateTransform(801, 601, 225);

        // Act
        const center = transform.getCenter();

        // Assert
        expect(center.x).toBe(400.5);
        expect(center.y).toBe(300.5);
      });
    });

    describe('updateCanvasSize後の整合性', () => {
      test('キャンバスサイズ更新後も正しい中心座標を返す', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        transform.updateCanvasSize(1024, 768);
        const center = transform.getCenter();

        // Assert
        expect(center.x).toBe(512);
        expect(center.y).toBe(384);
      });
    });
  });

  describe('スケール計算の整合性', () => {
    test('幅制約の場合、ボード直径がキャンバス幅の80%になる', () => {
      // Arrange
      const canvasWidth = 800;
      const canvasHeight = 600;
      const boardRadius = 225;
      const transform = new CoordinateTransform(canvasWidth, canvasHeight, boardRadius);

      // Act
      const scale = transform.getScale();
      const boardDiameterInPixels = boardRadius * 2 * scale;

      // Assert
      // 幅が制約（800 * 0.8 = 640）または高さが制約（600 * 0.8 = 480）
      expect(boardDiameterInPixels).toBeLessThanOrEqual(canvasWidth * 0.8);
      expect(boardDiameterInPixels).toBeLessThanOrEqual(canvasHeight * 0.8);
    });

    test('高さ制約の場合、ボード直径がキャンバス高さの80%になる', () => {
      // Arrange
      const canvasWidth = 1600;
      const canvasHeight = 600;
      const boardRadius = 225;
      const transform = new CoordinateTransform(canvasWidth, canvasHeight, boardRadius);

      // Act
      const scale = transform.getScale();
      const boardDiameterInPixels = boardRadius * 2 * scale;

      // Assert
      expect(boardDiameterInPixels).toBeLessThanOrEqual(canvasHeight * 0.8);
    });
  });

  describe('複数インスタンスの独立性', () => {
    test('異なるインスタンスは互いに影響しない', () => {
      // Arrange
      const transform1 = new CoordinateTransform(800, 600, 225);
      const transform2 = new CoordinateTransform(1024, 768, 225);

      // Act
      const scale1 = transform1.getScale();
      const scale2 = transform2.getScale();

      // Assert
      expect(scale1).not.toBe(scale2);
    });

    test('一方のupdateCanvasSizeが他方に影響しない', () => {
      // Arrange
      const transform1 = new CoordinateTransform(800, 600, 225);
      const transform2 = new CoordinateTransform(800, 600, 225);
      const originalScale2 = transform2.getScale();

      // Act
      transform1.updateCanvasSize(1024, 768);
      const newScale2 = transform2.getScale();

      // Assert
      expect(newScale2).toBe(originalScale2);
    });
  });
});
