import { describe, test, expect } from 'vitest';
import { calculateScore } from './calculateScore.js';

describe('calculateScore', () => {
  describe('正常系 - BULL', () => {
    test('INNER_BULLは常に50点を返す', () => {
      // Arrange
      const ring: RingType = 'INNER_BULL';
      const segmentNumber = 20; // BULL時は無視される

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(50);
    });

    test('OUTER_BULLは常に25点を返す', () => {
      // Arrange
      const ring: RingType = 'OUTER_BULL';
      const segmentNumber = 20; // BULL時は無視される

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(25);
    });
  });

  describe('正常系 - TRIPLE', () => {
    test('トリプル20は60点を返す', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 20;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(60);
    });

    test('トリプル19は57点を返す', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 19;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(57);
    });

    test('トリプル1は3点を返す', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 1;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(3);
    });
  });

  describe('正常系 - DOUBLE', () => {
    test('ダブル20は40点を返す', () => {
      // Arrange
      const ring: RingType = 'DOUBLE';
      const segmentNumber = 20;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(40);
    });

    test('ダブル16は32点を返す', () => {
      // Arrange
      const ring: RingType = 'DOUBLE';
      const segmentNumber = 16;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(32);
    });

    test('ダブル1は2点を返す', () => {
      // Arrange
      const ring: RingType = 'DOUBLE';
      const segmentNumber = 1;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(2);
    });
  });

  describe('正常系 - SINGLE', () => {
    test('内側シングル20は20点を返す', () => {
      // Arrange
      const ring: RingType = 'INNER_SINGLE';
      const segmentNumber = 20;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(20);
    });

    test('外側シングル18は18点を返す', () => {
      // Arrange
      const ring: RingType = 'OUTER_SINGLE';
      const segmentNumber = 18;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(18);
    });

    test('内側シングル5は5点を返す', () => {
      // Arrange
      const ring: RingType = 'INNER_SINGLE';
      const segmentNumber = 5;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(5);
    });
  });

  describe('正常系 - OUT', () => {
    test('OUTは常に0点を返す', () => {
      // Arrange
      const ring: RingType = 'OUT';
      const segmentNumber = 20; // OUT時は無視される

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('境界値', () => {
    test('セグメント番号1で最小点（TRIPLE 1 = 3点）を返す', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 1;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(3);
    });

    test('セグメント番号20で最大点（TRIPLE 20 = 60点）を返す', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 20;

      // Act
      const result = calculateScore(ring, segmentNumber);

      // Assert
      expect(result).toBe(60);
    });
  });

  describe('エッジケース', () => {
    test('無効なセグメント番号（0）でエラーをスローする', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 0;

      // Act & Assert
      expect(() => calculateScore(ring, segmentNumber)).toThrow();
    });

    test('無効なセグメント番号（21）でエラーをスローする', () => {
      // Arrange
      const ring: RingType = 'DOUBLE';
      const segmentNumber = 21;

      // Act & Assert
      expect(() => calculateScore(ring, segmentNumber)).toThrow();
    });

    test('無効なセグメント番号（-1）でエラーをスローする', () => {
      // Arrange
      const ring: RingType = 'INNER_SINGLE';
      const segmentNumber = -1;

      // Act & Assert
      expect(() => calculateScore(ring, segmentNumber)).toThrow();
    });
  });
});

