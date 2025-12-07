import { describe, test, expect } from 'vitest';
import { isValidSingleThrowScore } from './isValidSingleThrowScore.js';

describe('isValidSingleThrowScore', () => {
  describe('正常系 - 0点', () => {
    test('0点はtrueを返す（ボード外）', () => {
      // Arrange
      const score = 0;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('正常系 - シングル（1-20）', () => {
    test('1点はtrueを返す', () => {
      // Arrange
      const score = 1;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('10点はtrueを返す', () => {
      // Arrange
      const score = 10;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('20点はtrueを返す', () => {
      // Arrange
      const score = 20;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('正常系 - ダブル（2-40の偶数）', () => {
    test('2点はtrueを返す（D1）', () => {
      // Arrange
      const score = 2;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('4点はtrueを返す（D2）', () => {
      // Arrange
      const score = 4;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('22点はtrueを返す（D11）', () => {
      // Arrange
      const score = 22;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('26点はtrueを返す（D13）', () => {
      // Arrange
      const score = 26;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('28点はtrueを返す（D14）', () => {
      // Arrange
      const score = 28;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('32点はtrueを返す（D16）', () => {
      // Arrange
      const score = 32;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('40点はtrueを返す（D20）', () => {
      // Arrange
      const score = 40;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('正常系 - トリプル（3の倍数、特定値）', () => {
    test('3点はtrueを返す（T1）', () => {
      // Arrange
      const score = 3;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('6点はtrueを返す（T2またはD3）', () => {
      // Arrange
      const score = 6;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('9点はtrueを返す（T3）', () => {
      // Arrange
      const score = 9;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('21点はtrueを返す（T7）', () => {
      // Arrange
      const score = 21;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('27点はtrueを返す（T9）', () => {
      // Arrange
      const score = 27;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('33点はtrueを返す（T11）', () => {
      // Arrange
      const score = 33;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('39点はtrueを返す（T13）', () => {
      // Arrange
      const score = 39;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('45点はtrueを返す（T15）', () => {
      // Arrange
      const score = 45;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('51点はtrueを返す（T17）', () => {
      // Arrange
      const score = 51;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('57点はtrueを返す（T19）', () => {
      // Arrange
      const score = 57;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('60点はtrueを返す（T20）', () => {
      // Arrange
      const score = 60;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('正常系 - BULL', () => {
    test('25点はtrueを返す（アウターブル）', () => {
      // Arrange
      const score = 25;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('50点はtrueを返す（インナーブル）', () => {
      // Arrange
      const score = 50;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('境界値 - 上限下限', () => {
    test('0点はtrueを返す（下限）', () => {
      // Arrange
      const score = 0;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('60点はtrueを返す（上限）', () => {
      // Arrange
      const score = 60;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(true);
    });

    test('61点はfalseを返す（上限超過）', () => {
      // Arrange
      const score = 61;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 負の数', () => {
    test('-1点はfalseを返す', () => {
      // Arrange
      const score = -1;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('-10点はfalseを返す', () => {
      // Arrange
      const score = -10;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('-100点はfalseを返す', () => {
      // Arrange
      const score = -100;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 61以上', () => {
    test('62点はfalseを返す', () => {
      // Arrange
      const score = 62;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('100点はfalseを返す', () => {
      // Arrange
      const score = 100;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('180点はfalseを返す', () => {
      // Arrange
      const score = 180;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 取りえない値（22-24の範囲）', () => {
    test('23点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 23;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 取りえない値（29のみ）', () => {
    test('29点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 29;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 取りえない値（31-40の範囲）', () => {
    test('31点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 31;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('35点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 35;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('37点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 37;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 取りえない値（41-50の範囲）', () => {
    test('41点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 41;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('43点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 43;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('44点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 44;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('46点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 46;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('47点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 47;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('49点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 49;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('異常系 - 取りえない値（51-60の範囲）', () => {
    test('52点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 52;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('53点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 53;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('55点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 55;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('56点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 56;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('58点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 58;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('59点はfalseを返す（取りえない）', () => {
      // Arrange
      const score = 59;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース - 浮動小数点数', () => {
    test('小数点を含む値（1.5点）はfalseを返す', () => {
      // Arrange
      const score = 1.5;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('小数点を含む値（20.1点）はfalseを返す', () => {
      // Arrange
      const score = 20.1;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('小数点を含む値（0.5点）はfalseを返す', () => {
      // Arrange
      const score = 0.5;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース - 特殊な数値', () => {
    test('NaNはfalseを返す', () => {
      // Arrange
      const score = NaN;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('Infinityはfalseを返す', () => {
      // Arrange
      const score = Infinity;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });

    test('-Infinityはfalseを返す', () => {
      // Arrange
      const score = -Infinity;

      // Act
      const result = isValidSingleThrowScore(score);

      // Assert
      expect(result).toBe(false);
    });
  });
});

