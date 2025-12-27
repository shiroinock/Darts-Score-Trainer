import { describe, expect, test } from 'vitest';
import { isValidRemainingScore } from './isValidRemainingScore.js';

describe('isValidRemainingScore', () => {
  describe('正常系 - 典型的な残り点数遷移', () => {
    test('残り501点、60点取って残り441点はtrueを返す', () => {
      // Arrange
      const remaining = 501;
      const current = 60;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });

    test('残り100点、45点取って残り55点はtrueを返す', () => {
      // Arrange
      const remaining = 100;
      const current = 45;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });

    test('残り50点、0点取って残り50点はtrueを返す', () => {
      // Arrange
      const remaining = 50;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });

    test('残り180点、180点取って残り0点はtrueを返す', () => {
      // Arrange
      const remaining = 180;
      const current = 180;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('境界値 - ダブルアウト可能な終局面', () => {
    test('残り2点、0点取って残り2点はtrueを返す（D1でフィニッシュ可能）', () => {
      // Arrange
      const remaining = 2;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });

    test('残り40点、0点取って残り40点はtrueを返す（D20でフィニッシュ可能）', () => {
      // Arrange
      const remaining = 40;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });

    test('残り50点、0点取って残り50点はtrueを返す（Bull → D25でフィニッシュ可能）', () => {
      // Arrange
      const remaining = 50;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });

    test('残り3点、2点取って残り1点はfalseを返す（ダブルアウト不可能）', () => {
      // Arrange
      const remaining = 3;
      const current = 2;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('残り0点、0点取って残り0点はtrueを返す（既にフィニッシュ済み）', () => {
      // Arrange
      const remaining = 0;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('バスト - オーバー', () => {
    test('残り50点、51点取って残り-1点はfalseを返す（オーバー）', () => {
      // Arrange
      const remaining = 50;
      const current = 51;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('残り100点、101点取って残り-1点はfalseを返す（オーバー）', () => {
      // Arrange
      const remaining = 100;
      const current = 101;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('残り10点、20点取って残り-10点はfalseを返す（オーバー）', () => {
      // Arrange
      const remaining = 10;
      const current = 20;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('残り2点、3点取って残り-1点はfalseを返す（最小オーバー）', () => {
      // Arrange
      const remaining = 2;
      const current = 3;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('バスト - 1点（ダブルアウト不可能）', () => {
    test('残り2点、1点取って残り1点はfalseを返す', () => {
      // Arrange
      const remaining = 2;
      const current = 1;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('残り3点、2点取って残り1点はfalseを返す', () => {
      // Arrange
      const remaining = 3;
      const current = 2;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('残り61点、60点取って残り1点はfalseを返す', () => {
      // Arrange
      const remaining = 61;
      const current = 60;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('残り181点、180点取って残り1点はfalseを返す', () => {
      // Arrange
      const remaining = 181;
      const current = 180;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース - NaN, Infinity', () => {
    test('remainingがNaNの場合falseを返す', () => {
      // Arrange
      const remaining = NaN;
      const current = 60;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('currentがNaNの場合falseを返す', () => {
      // Arrange
      const remaining = 100;
      const current = NaN;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('両方がNaNの場合falseを返す', () => {
      // Arrange
      const remaining = NaN;
      const current = NaN;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('remainingがInfinityの場合falseを返す', () => {
      // Arrange
      const remaining = Infinity;
      const current = 60;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('currentがInfinityの場合falseを返す', () => {
      // Arrange
      const remaining = 100;
      const current = Infinity;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('remainingが-Infinityの場合falseを返す', () => {
      // Arrange
      const remaining = -Infinity;
      const current = 60;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('currentが-Infinityの場合falseを返す', () => {
      // Arrange
      const remaining = 100;
      const current = -Infinity;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース - 浮動小数点数', () => {
    test('remainingが浮動小数点数（100.5）の場合falseを返す', () => {
      // Arrange
      const remaining = 100.5;
      const current = 60;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('currentが浮動小数点数（60.1）の場合falseを返す', () => {
      // Arrange
      const remaining = 100;
      const current = 60.1;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('両方が浮動小数点数の場合falseを返す', () => {
      // Arrange
      const remaining = 100.5;
      const current = 60.5;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('remainingが0.5の場合falseを返す', () => {
      // Arrange
      const remaining = 0.5;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース - 負の数', () => {
    test('remainingが負の数（-1）の場合falseを返す（既にバスト状態）', () => {
      // Arrange
      const remaining = -1;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('remainingが負の数（-100）の場合falseを返す', () => {
      // Arrange
      const remaining = -100;
      const current = 60;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('currentが負の数（-1）の場合falseを返す（無効な得点）', () => {
      // Arrange
      const remaining = 100;
      const current = -1;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('currentが負の数（-60）の場合falseを返す', () => {
      // Arrange
      const remaining = 100;
      const current = -60;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });

    test('両方が負の数の場合falseを返す', () => {
      // Arrange
      const remaining = -50;
      const current = -50;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース - 境界値の組み合わせ', () => {
    test('残り501点、0点取って残り501点はtrueを返す（501ゲーム開始直後）', () => {
      // Arrange
      const remaining = 501;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });

    test('残り701点、0点取って残り701点はtrueを返す（701ゲーム開始直後）', () => {
      // Arrange
      const remaining = 701;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });

    test('残り301点、0点取って残り301点はtrueを返す（301ゲーム開始直後）', () => {
      // Arrange
      const remaining = 301;
      const current = 0;

      // Act
      const result = isValidRemainingScore(remaining, current);

      // Assert
      expect(result).toBe(true);
    });
  });
});
