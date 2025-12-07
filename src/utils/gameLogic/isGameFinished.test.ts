import { describe, test, expect } from 'vitest';
import { isGameFinished } from './isGameFinished.js';

describe('isGameFinished', () => {
  describe('正常系 - ゲーム終了', () => {
    test('残り0点はゲーム終了を返す', () => {
      // Arrange
      const remainingScore = 0;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('正常系 - ゲーム継続', () => {
    test('残り1点はゲーム継続を返す', () => {
      // Arrange
      const remainingScore = 1;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り2点はゲーム継続を返す', () => {
      // Arrange
      const remainingScore = 2;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り50点はゲーム継続を返す', () => {
      // Arrange
      const remainingScore = 50;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り100点はゲーム継続を返す', () => {
      // Arrange
      const remainingScore = 100;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り501点（ゲーム開始点数）はゲーム継続を返す', () => {
      // Arrange
      const remainingScore = 501;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り701点（ゲーム開始点数）はゲーム継続を返す', () => {
      // Arrange
      const remainingScore = 701;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り301点（ゲーム開始点数）はゲーム継続を返す', () => {
      // Arrange
      const remainingScore = 301;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('境界値', () => {
    test('残り0点（境界値：終了）はゲーム終了を返す', () => {
      // Arrange
      const remainingScore = 0;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り1点（境界値：継続最小値）はゲーム継続を返す', () => {
      // Arrange
      const remainingScore = 1;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('入力検証 - 非整数値と特殊値', () => {
    test('NaNはエラーをスローする', () => {
      // Arrange
      const remainingScore = NaN;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('Infinityはエラーをスローする', () => {
      // Arrange
      const remainingScore = Infinity;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('-Infinityはエラーをスローする', () => {
      // Arrange
      const remainingScore = -Infinity;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('浮動小数点（0.5）はエラーをスローする', () => {
      // Arrange
      const remainingScore = 0.5;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('浮動小数点（1.5）はエラーをスローする', () => {
      // Arrange
      const remainingScore = 1.5;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('浮動小数点（50.1）はエラーをスローする', () => {
      // Arrange
      const remainingScore = 50.1;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('負の値（-1）はエラーをスローする', () => {
      // Arrange
      const remainingScore = -1;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は0以上の整数である必要があります'
      );
    });

    test('負の値（-10）はエラーをスローする', () => {
      // Arrange
      const remainingScore = -10;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は0以上の整数である必要があります'
      );
    });

    test('負の値（-100）はエラーをスローする', () => {
      // Arrange
      const remainingScore = -100;

      // Act & Assert
      expect(() => isGameFinished(remainingScore)).toThrow(
        '残り点数は0以上の整数である必要があります'
      );
    });
  });

  describe('実践的なゲームシナリオ', () => {
    test('501ゲーム開始時（残り501点）はゲーム継続', () => {
      // Arrange
      const remainingScore = 501;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('501ゲーム中盤（残り281点）はゲーム継続', () => {
      // Arrange
      const remainingScore = 281;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('501ゲーム終盤（残り32点）はゲーム継続', () => {
      // Arrange
      const remainingScore = 32;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('ダブル16成功でフィニッシュ（残り0点）はゲーム終了', () => {
      // Arrange
      const remainingScore = 0;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('BULL成功でフィニッシュ（残り0点）はゲーム終了', () => {
      // Arrange
      const remainingScore = 0;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('301ゲーム開始時（残り301点）はゲーム継続', () => {
      // Arrange
      const remainingScore = 301;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('701ゲーム開始時（残り701点）はゲーム継続', () => {
      // Arrange
      const remainingScore = 701;

      // Act
      const result = isGameFinished(remainingScore);

      // Assert
      expect(result).toBe(false);
    });
  });
});
