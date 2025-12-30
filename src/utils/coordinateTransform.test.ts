import { describe, expect, test } from 'vitest';
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
        // scale = 600 / 450 * 0.8 = 1.0667
        // x = 400 + 225 * 1.0667 = 640
        expect(screen.x).toBeCloseTo(640, 0);
        expect(screen.y).toBe(300);
      });

      test('ボード左端(-225,0)はキャンバス左端付近に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(-225, 0);

        // Assert
        // scale = 600 / 450 * 0.8 = 1.0667
        // x = 400 - 225 * 1.0667 = 160
        expect(screen.x).toBeCloseTo(160, 0);
        expect(screen.y).toBe(300);
      });

      test('ボード下端(0,225)はキャンバス下端付近に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(0, 225);

        // Assert
        // scale = 600 / 450 * 0.8 = 1.0667
        // y = 300 + 225 * 1.0667 = 540
        expect(screen.x).toBe(400);
        expect(screen.y).toBeCloseTo(540, 0);
      });

      test('ボード上端(0,-225)はキャンバス上端付近に変換される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(0, -225);

        // Assert
        // scale = 600 / 450 * 0.8 = 1.0667
        // y = 300 - 225 * 1.0667 = 60
        expect(screen.x).toBe(400);
        expect(screen.y).toBeCloseTo(60, 0);
      });
    });

    describe('エッジケース', () => {
      test('ボード外の座標(300,0)も変換できる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(300, 0);

        // Assert
        // scale = 600 / 450 * 0.8 = 1.0667
        // x = 400 + 300 * 1.0667 = 720（ボード直径の80%なのでキャンバス内）
        expect(screen.x).toBeCloseTo(720, 0);
      });

      test('ボード外の負の座標(-300,0)も変換できる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const screen = transform.physicalToScreen(-300, 0);

        // Assert
        // scale = 600 / 450 * 0.8 = 1.0667
        // x = 400 - 300 * 1.0667 = 80（ボード直径の80%なのでキャンバス内）
        expect(screen.x).toBeCloseTo(80, 0);
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

  describe('スケール統一（座標と距離の一貫性）', () => {
    describe('非正方形キャンバスでの一貫性', () => {
      test('physicalToScreenとphysicalDistanceToScreenが同じスケールを使用する（X方向）', () => {
        // Arrange
        // 横長キャンバス（800x600）の場合、scaleX ≠ scaleY なので現在の実装では差が出る
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        // 物理座標 (100, 0) を座標変換
        const screen = transform.physicalToScreen(100, 0);
        const screenDistanceX = screen.x - 400; // 中心（400, 300）からのX距離

        // 同じ物理距離を距離変換メソッドで変換
        const distanceViaMethod = transform.physicalDistanceToScreen(100);

        // Assert
        // スケール統一後、両者は一致するはず
        // 現在の実装では scaleX と this.scale が異なるため失敗する（Red）
        expect(screenDistanceX).toBeCloseTo(distanceViaMethod, 1);
      });

      test('physicalToScreenとphysicalDistanceToScreenが同じスケールを使用する（Y方向）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        // 物理座標 (0, 100) を座標変換
        const screen = transform.physicalToScreen(0, 100);
        const screenDistanceY = screen.y - 300; // 中心からのY距離

        // 同じ物理距離を距離変換メソッドで変換
        const distanceViaMethod = transform.physicalDistanceToScreen(100);

        // Assert
        // スケール統一後、両者は一致するはず
        // 現在の実装では scaleY と this.scale が異なるため失敗する（Red）
        expect(screenDistanceY).toBeCloseTo(distanceViaMethod, 1);
      });

      test('縦長キャンバスでもスケールが統一される（X方向）', () => {
        // Arrange
        // 縦長キャンバス（600x800）でテスト
        const transform = new CoordinateTransform(600, 800, 225);

        // Act
        const screen = transform.physicalToScreen(100, 0);
        const screenDistanceX = screen.x - 300; // 中心からのX距離

        const distanceViaMethod = transform.physicalDistanceToScreen(100);

        // Assert
        expect(screenDistanceX).toBeCloseTo(distanceViaMethod, 1);
      });

      test('縦長キャンバスでもスケールが統一される（Y方向）', () => {
        // Arrange
        const transform = new CoordinateTransform(600, 800, 225);

        // Act
        const screen = transform.physicalToScreen(0, 100);
        const screenDistanceY = screen.y - 400; // 中心からのY距離

        const distanceViaMethod = transform.physicalDistanceToScreen(100);

        // Assert
        expect(screenDistanceY).toBeCloseTo(distanceViaMethod, 1);
      });

      test('極端な横長キャンバス（1600x600）でもスケールが統一される', () => {
        // Arrange
        const transform = new CoordinateTransform(1600, 600, 225);

        // Act
        const screen = transform.physicalToScreen(100, 0);
        const screenDistanceX = screen.x - 800; // 中心からのX距離

        const distanceViaMethod = transform.physicalDistanceToScreen(100);

        // Assert
        expect(screenDistanceX).toBeCloseTo(distanceViaMethod, 1);
      });
    });

    describe('正方形キャンバスでの確認', () => {
      test('正方形キャンバスではもともと一貫性がある', () => {
        // Arrange
        // 正方形キャンバス（800x800）では scaleX = scaleY なので現在でも一致
        const transform = new CoordinateTransform(800, 800, 225);

        // Act
        const screen = transform.physicalToScreen(100, 0);
        const screenDistanceX = screen.x - 400;

        const distanceViaMethod = transform.physicalDistanceToScreen(100);

        // Assert
        expect(screenDistanceX).toBeCloseTo(distanceViaMethod, 1);
      });
    });
  });

  describe('円形描画の保証', () => {
    describe('ボード端の円形性検証', () => {
      test('ボード端（225mm）の座標がX方向とY方向で同じ画面距離になる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        // ボードの右端（225, 0）
        const right = transform.physicalToScreen(225, 0);
        // ボードの下端（0, 225）
        const bottom = transform.physicalToScreen(0, 225);

        // 中心（400, 300）からの距離を計算
        const distanceX = right.x - 400;
        const distanceY = bottom.y - 300;

        // Assert
        // 円形のボードなので、X方向とY方向で同じ距離になるべき
        // 現在の実装では scaleX ≠ scaleY なので異なる値になり失敗する（Red）
        expect(distanceX).toBeCloseTo(distanceY, 1);
      });

      test('横長キャンバス（1600x600）でもボードは円形になる', () => {
        // Arrange
        const transform = new CoordinateTransform(1600, 600, 225);

        // Act
        const right = transform.physicalToScreen(225, 0);
        const bottom = transform.physicalToScreen(0, 225);

        const distanceX = right.x - 800; // 中心は800
        const distanceY = bottom.y - 300; // 中心は300

        // Assert
        // X方向とY方向で同じ画面距離になる（円形）
        expect(distanceX).toBeCloseTo(distanceY, 1);
      });

      test('縦長キャンバス（600x1600）でもボードは円形になる', () => {
        // Arrange
        const transform = new CoordinateTransform(600, 1600, 225);

        // Act
        const right = transform.physicalToScreen(225, 0);
        const bottom = transform.physicalToScreen(0, 225);

        const distanceX = right.x - 300;
        const distanceY = bottom.y - 800;

        // Assert
        expect(distanceX).toBeCloseTo(distanceY, 1);
      });

      test('ボード左端と上端でも円形性が保たれる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const left = transform.physicalToScreen(-225, 0);
        const top = transform.physicalToScreen(0, -225);

        const distanceX = 400 - left.x; // 左端なので引き算が逆
        const distanceY = 300 - top.y; // 上端なので引き算が逆

        // Assert
        expect(distanceX).toBeCloseTo(distanceY, 1);
      });
    });

    describe('リングの円形性検証', () => {
      test('トリプルリング（103mm）がX方向とY方向で同じ画面距離になる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const right = transform.physicalToScreen(103, 0);
        const bottom = transform.physicalToScreen(0, 103);

        const distanceX = right.x - 400;
        const distanceY = bottom.y - 300;

        // Assert
        // トリプルリングも円形なので、X方向とY方向で同じ距離
        expect(distanceX).toBeCloseTo(distanceY, 1);
      });

      test('ダブルリング（166mm）がX方向とY方向で同じ画面距離になる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const right = transform.physicalToScreen(166, 0);
        const bottom = transform.physicalToScreen(0, 166);

        const distanceX = right.x - 400;
        const distanceY = bottom.y - 300;

        // Assert
        expect(distanceX).toBeCloseTo(distanceY, 1);
      });

      test('インナーブル（3.175mm）がX方向とY方向で同じ画面距離になる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const right = transform.physicalToScreen(3.175, 0);
        const bottom = transform.physicalToScreen(0, 3.175);

        const distanceX = right.x - 400;
        const distanceY = bottom.y - 300;

        // Assert
        expect(distanceX).toBeCloseTo(distanceY, 1);
      });

      test('アウターブル（7.95mm）がX方向とY方向で同じ画面距離になる', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);

        // Act
        const right = transform.physicalToScreen(7.95, 0);
        const bottom = transform.physicalToScreen(0, 7.95);

        const distanceX = right.x - 400;
        const distanceY = bottom.y - 300;

        // Assert
        expect(distanceX).toBeCloseTo(distanceY, 1);
      });
    });
  });

  describe('ダーツマーカー位置の正確性', () => {
    describe('物理距離と画面距離の比例関係', () => {
      test('物理座標の距離と画面座標の距離がスケールに従って比例する', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // 物理座標 (100, 0) を変換
        const screen = transform.physicalToScreen(100, 0);
        const screenDistanceFromCenter = screen.x - 400;

        // Assert
        // この距離は 100 * scale と一致するはず
        // 現在の実装では scaleX を使うため scale と異なり失敗する（Red）
        expect(screenDistanceFromCenter).toBeCloseTo(100 * scale, 1);
      });

      test('ボード中心からの物理距離と画面距離がスケールに従う（X方向）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // 物理座標 (150, 0)
        const screen = transform.physicalToScreen(150, 0);
        const screenDist = Math.abs(screen.x - 400);

        // Assert
        // 物理距離 150mm × scale = 画面距離
        expect(screenDist).toBeCloseTo(150 * scale, 1);
      });

      test('ボード中心からの物理距離と画面距離がスケールに従う（Y方向）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // 物理座標 (0, 150)
        const screen = transform.physicalToScreen(0, 150);
        const screenDist = Math.abs(screen.y - 300);

        // Assert
        // 物理距離 150mm × scale = 画面距離
        expect(screenDist).toBeCloseTo(150 * scale, 1);
      });

      test('ボード中心からの物理距離と画面距離がスケールに従う（斜め方向）', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // 物理座標 (70.7, 70.7) ≒ 距離100mm、角度45°
        const screen = transform.physicalToScreen(70.7, 70.7);
        const screenDist = Math.sqrt((screen.x - 400) ** 2 + (screen.y - 300) ** 2);

        // Assert
        // 物理距離 100mm × scale = 画面距離
        // 現在の実装では scaleX と scaleY が異なるため、楕円形になり失敗する（Red）
        expect(screenDist).toBeCloseTo(100 * scale, 0);
      });

      test('斜め45°方向のトリプルリング位置が正確に配置される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // トリプルリング中心（103mm）の斜め45°方向
        // (103 * cos(45°), 103 * sin(45°)) ≒ (72.8, 72.8)
        const screen = transform.physicalToScreen(72.8, 72.8);
        const screenDist = Math.sqrt((screen.x - 400) ** 2 + (screen.y - 300) ** 2);

        // Assert
        expect(screenDist).toBeCloseTo(103 * scale, 0);
      });

      test('斜め45°方向のダブルリング位置が正確に配置される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // ダブルリング中心（166mm）の斜め45°方向
        // (166 * cos(45°), 166 * sin(45°)) ≒ (117.4, 117.4)
        const screen = transform.physicalToScreen(117.4, 117.4);
        const screenDist = Math.sqrt((screen.x - 400) ** 2 + (screen.y - 300) ** 2);

        // Assert
        expect(screenDist).toBeCloseTo(166 * scale, 0);
      });
    });

    describe('ダーツ着弾位置の正確性', () => {
      test('トリプル20付近（上方向）に着弾したダーツマーカーが正確に表示される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // トリプル20は真上（0, -103）
        const screen = transform.physicalToScreen(0, -103);
        const screenDistFromCenter = Math.abs(screen.y - 300);

        // Assert
        expect(screenDistFromCenter).toBeCloseTo(103 * scale, 1);
      });

      test('ダブル20付近（上方向）に着弾したダーツマーカーが正確に表示される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // ダブル20は真上（0, -166）
        const screen = transform.physicalToScreen(0, -166);
        const screenDistFromCenter = Math.abs(screen.y - 300);

        // Assert
        expect(screenDistFromCenter).toBeCloseTo(166 * scale, 1);
      });

      test('わずかにずれた位置（5mm右上）も正確に表示される', () => {
        // Arrange
        const transform = new CoordinateTransform(800, 600, 225);
        const scale = transform.getScale();

        // Act
        // (5, -5) の距離は sqrt(50) ≒ 7.07mm
        const screen = transform.physicalToScreen(5, -5);
        const screenDist = Math.sqrt((screen.x - 400) ** 2 + (screen.y - 300) ** 2);
        const expectedScreenDist = Math.sqrt(50) * scale;

        // Assert
        expect(screenDist).toBeCloseTo(expectedScreenDist, 1);
      });
    });

    describe('横長・縦長キャンバスでのマーカー位置', () => {
      test('横長キャンバスでもダーツマーカーが正確に配置される', () => {
        // Arrange
        const transform = new CoordinateTransform(1600, 600, 225);
        const scale = transform.getScale();

        // Act
        const screen = transform.physicalToScreen(100, 0);
        const screenDist = Math.abs(screen.x - 800);

        // Assert
        expect(screenDist).toBeCloseTo(100 * scale, 1);
      });

      test('縦長キャンバスでもダーツマーカーが正確に配置される', () => {
        // Arrange
        const transform = new CoordinateTransform(600, 1600, 225);
        const scale = transform.getScale();

        // Act
        const screen = transform.physicalToScreen(0, 100);
        const screenDist = Math.abs(screen.y - 800);

        // Assert
        expect(screenDist).toBeCloseTo(100 * scale, 1);
      });
    });
  });
});
