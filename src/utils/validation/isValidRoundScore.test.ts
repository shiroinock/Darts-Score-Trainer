import { describe, expect, test } from 'vitest';
import { isValidRoundScore } from './isValidRoundScore.js';

describe('isValidRoundScore', () => {
  describe('正常系 - 典型的な得点', () => {
    test('0点はtrueを返す（3投全てボード外）', () => {
      // Arrange
      const score = 0;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('1点はtrueを返す', () => {
      // Arrange
      const score = 1;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('60点はtrueを返す（T20 + 0 + 0）', () => {
      // Arrange
      const score = 60;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('100点はtrueを返す（T20 + T20 + 20など）', () => {
      // Arrange
      const score = 100;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('150点はtrueを返す（T20 + T20 + T20 + 30など）', () => {
      // Arrange
      const score = 150;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('境界値 - 上限下限', () => {
    test('0点はtrueを返す（下限）', () => {
      // Arrange
      const score = 0;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('180点はtrueを返す（上限：T20 + T20 + T20）', () => {
      // Arrange
      const score = 180;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('181点はfalseを返す（上限超過）', () => {
      // Arrange
      const score = 181;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('-1点はfalseを返す（下限未満）', () => {
      // Arrange
      const score = -1;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 負の数', () => {
    test('-1点はfalseを返す', () => {
      // Arrange
      const score = -1;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('-10点はfalseを返す', () => {
      // Arrange
      const score = -10;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('-100点はfalseを返す', () => {
      // Arrange
      const score = -100;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 181以上', () => {
    test('181点はfalseを返す', () => {
      // Arrange
      const score = 181;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('200点はfalseを返す', () => {
      // Arrange
      const score = 200;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('500点はfalseを返す', () => {
      // Arrange
      const score = 500;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('1000点はfalseを返す', () => {
      // Arrange
      const score = 1000;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース - 浮動小数点数', () => {
    test('小数点を含む値（1.5点）はfalseを返す', () => {
      // Arrange
      const score = 1.5;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('小数点を含む値（100.1点）はfalseを返す', () => {
      // Arrange
      const score = 100.1;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('小数点を含む値（180.9点）はfalseを返す', () => {
      // Arrange
      const score = 180.9;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('小数点を含む値（0.5点）はfalseを返す', () => {
      // Arrange
      const score = 0.5;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース - 特殊な数値', () => {
    test('NaNはfalseを返す', () => {
      // Arrange
      const score = NaN;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('Infinityはfalseを返す', () => {
      // Arrange
      const score = Infinity;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('-Infinityはfalseを返す', () => {
      // Arrange
      const score = -Infinity;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 取りえない値（3投では達成不可能な値）', () => {
    test('163点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 163;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('166点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 166;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('169点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 169;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('172点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 172;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('173点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 173;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('175点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 175;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('176点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 176;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('178点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 178;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('179点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 179;

      // Act
      const result = isValidRoundScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });
});
