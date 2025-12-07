import { describe, test, expect } from 'vitest';
import { getScoreLabel } from './getScoreLabel.js';

describe('getScoreLabel', () => {
  describe('正常系 - BULL', () => {
    test('INNER_BULLは"BULL"を返す', () => {
      // Arrange
      const ring: RingType = 'INNER_BULL';
      const segmentNumber = 0; // BULLの場合は無視される

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('BULL');
    });

    test('OUTER_BULLは"25"を返す', () => {
      // Arrange
      const ring: RingType = 'OUTER_BULL';
      const segmentNumber = 0;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('25');
    });
  });

  describe('正常系 - TRIPLE', () => {
    test('トリプル20は"T20"を返す', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 20;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('T20');
    });

    test('トリプル1は"T1"を返す', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 1;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('T1');
    });

    test('トリプル19は"T19"を返す', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 19;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('T19');
    });
  });

  describe('正常系 - DOUBLE', () => {
    test('ダブル20は"D20"を返す', () => {
      // Arrange
      const ring: RingType = 'DOUBLE';
      const segmentNumber = 20;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('D20');
    });

    test('ダブル16は"D16"を返す', () => {
      // Arrange
      const ring: RingType = 'DOUBLE';
      const segmentNumber = 16;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('D16');
    });

    test('ダブル1は"D1"を返す', () => {
      // Arrange
      const ring: RingType = 'DOUBLE';
      const segmentNumber = 1;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('D1');
    });
  });

  describe('正常系 - SINGLE', () => {
    test('内側シングル20は"20"を返す', () => {
      // Arrange
      const ring: RingType = 'INNER_SINGLE';
      const segmentNumber = 20;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('20');
    });

    test('外側シングル18は"18"を返す', () => {
      // Arrange
      const ring: RingType = 'OUTER_SINGLE';
      const segmentNumber = 18;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('18');
    });

    test('内側シングル5は"5"を返す', () => {
      // Arrange
      const ring: RingType = 'INNER_SINGLE';
      const segmentNumber = 5;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('5');
    });
  });

  describe('正常系 - OUT', () => {
    test('OUTは"OUT"を返す', () => {
      // Arrange
      const ring: RingType = 'OUT';
      const segmentNumber = 0;

      // Act
      const result = getScoreLabel(ring, segmentNumber);

      // Assert
      expect(result).toBe('OUT');
    });
  });

  describe('境界値', () => {
    test('セグメント1の各リングタイプで適切なラベルを返す', () => {
      // Arrange & Act & Assert
      expect(getScoreLabel('TRIPLE', 1)).toBe('T1');
      expect(getScoreLabel('DOUBLE', 1)).toBe('D1');
      expect(getScoreLabel('INNER_SINGLE', 1)).toBe('1');
      expect(getScoreLabel('OUTER_SINGLE', 1)).toBe('1');
    });

    test('セグメント20の各リングタイプで適切なラベルを返す', () => {
      // Arrange & Act & Assert
      expect(getScoreLabel('TRIPLE', 20)).toBe('T20');
      expect(getScoreLabel('DOUBLE', 20)).toBe('D20');
      expect(getScoreLabel('INNER_SINGLE', 20)).toBe('20');
      expect(getScoreLabel('OUTER_SINGLE', 20)).toBe('20');
    });
  });

  describe('エッジケース', () => {
    test('無効なセグメント番号（0）でエラーをスローする', () => {
      // Arrange
      const ring: RingType = 'TRIPLE';
      const segmentNumber = 0;

      // Act & Assert
      expect(() => getScoreLabel(ring, segmentNumber)).toThrow();
    });

    test('無効なセグメント番号（21）でエラーをスローする', () => {
      // Arrange
      const ring: RingType = 'DOUBLE';
      const segmentNumber = 21;

      // Act & Assert
      expect(() => getScoreLabel(ring, segmentNumber)).toThrow();
    });
  });
});

