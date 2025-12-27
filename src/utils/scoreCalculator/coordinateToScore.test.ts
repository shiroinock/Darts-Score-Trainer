import { describe, expect, test } from 'vitest';
import { coordinateToScore } from './coordinateToScore.js';

describe('coordinateToScore', () => {
  describe('正常系 - BULL座標', () => {
    test('中心（0, 0）は50点を返す', () => {
      // Arrange
      const x = 0;
      const y = 0;

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(50);
    });

    test('インナーブル内（2, 0）は50点を返す', () => {
      // Arrange
      const x = 2;
      const y = 0;

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(50);
    });

    test('アウターブル内（10, 0）は25点を返す', () => {
      // Arrange
      const x = 10;
      const y = 0;

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(25);
    });
  });

  describe('正常系 - TRIPLE座標', () => {
    test('トリプル20の位置（0, -103）は60点を返す', () => {
      // Arrange
      const x = 0;
      const y = -103; // 真上、トリプルリング中央

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(60);
    });

    test('トリプル6の位置（103, 0）は18点を返す', () => {
      // Arrange
      const x = 103; // 右方向、トリプルリング中央
      const y = 0;

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(18); // セグメント6のトリプル: 6 * 3 = 18
    });
  });

  describe('正常系 - DOUBLE座標', () => {
    test('ダブル20の位置（0, -166）は40点を返す', () => {
      // Arrange
      const x = 0;
      const y = -166; // 真上、ダブルリング中央

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(40);
    });

    test('ダブル3の位置（0, 166）は6点を返す', () => {
      // Arrange
      const x = 0;
      const y = 166; // 真下、ダブルリング中央

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(6); // セグメント3のダブル: 3 * 2 = 6
    });
  });

  describe('正常系 - SINGLE座標', () => {
    test('内側シングル20の位置（0, -50）は20点を返す', () => {
      // Arrange
      const x = 0;
      const y = -50; // 真上、内側シングルエリア

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(20);
    });

    test('外側シングル20の位置（0, -134）は20点を返す', () => {
      // Arrange
      const x = 0;
      const y = -134; // 真上、外側シングルエリア

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(20);
    });
  });

  describe('境界値 - ボード外', () => {
    test('ボード外（0, -225）は0点を返す', () => {
      // Arrange
      const x = 0;
      const y = -225; // ちょうどボード端

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(0);
    });

    test('ボード外（0, -300）は0点を返す', () => {
      // Arrange
      const x = 0;
      const y = -300; // ボード外

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('エッジケース - 斜め座標', () => {
    test('斜め座標（73, -73）は適切な点数を返す', () => {
      // Arrange
      const x = 73;
      const y = -73;
      const _distance = Math.sqrt(x * x + y * y); // 約103mm（トリプルリング）
      const _angle = Math.atan2(y, x); // 約-45度（20と1の間）

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      // 距離約103mm（TRIPLE）、角度約-45度（セグメント1またはその付近）
      // セグメント1のトリプル = 3点、または近傍のセグメント
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(60);
    });

    test('負の座標（-103, 0）は適切な点数を返す', () => {
      // Arrange
      const x = -103;
      const y = 0;

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      // 左方向、トリプルリング中央、セグメント11
      // 11 * 3 = 33点
      expect(result).toBe(33);
    });
  });

  describe('エッジケース - 浮動小数点座標', () => {
    test('浮動小数点座標（103.5, -0.5）は適切な点数を返す', () => {
      // Arrange
      const x = 103.5;
      const y = -0.5;

      // Act
      const result = coordinateToScore(x, y);

      // Assert
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(60);
    });
  });
});
