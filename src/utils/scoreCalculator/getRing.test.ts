import { describe, test, expect } from 'vitest';
import { BOARD_PHYSICAL, SEGMENTS } from '../constants/index.js';
import { getRing } from './getRing.js';

describe('getRing', () => {
  describe('正常系 - BULL エリア', () => {
    test('中心（0mm）はINNER_BULLを返す', () => {
      // Arrange
      const distance = 0;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('INNER_BULL');
    });

    test('インナーブル境界内（3mm）はINNER_BULLを返す', () => {
      // Arrange
      const distance = 3;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('INNER_BULL');
    });

    test('アウターブル内（10mm）はOUTER_BULLを返す', () => {
      // Arrange
      const distance = 10;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUTER_BULL');
    });
  });

  describe('境界値 - インナーブル/アウターブル境界', () => {
    test('ちょうど6.35mmはOUTER_BULLを返す', () => {
      // Arrange
      const distance = BOARD_PHYSICAL.rings.innerBull; // 6.35mm

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUTER_BULL');
    });
  });

  describe('境界値 - アウターブル/シングル境界', () => {
    test('ちょうど16mmはINNER_SINGLEを返す', () => {
      // Arrange
      const distance = BOARD_PHYSICAL.rings.outerBull; // 16mm

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('INNER_SINGLE');
    });
  });

  describe('正常系 - INNER_SINGLE エリア', () => {
    test('内側シングルエリア中央（50mm）はINNER_SINGLEを返す', () => {
      // Arrange
      const distance = 50;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('INNER_SINGLE');
    });

    test('トリプル境界手前（98mm）はINNER_SINGLEを返す', () => {
      // Arrange
      const distance = 98;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('INNER_SINGLE');
    });
  });

  describe('境界値 - シングル/トリプル境界', () => {
    test('ちょうど99mmはTRIPLEを返す', () => {
      // Arrange
      const distance = BOARD_PHYSICAL.rings.tripleInner; // 99mm

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('TRIPLE');
    });
  });

  describe('正常系 - TRIPLE エリア', () => {
    test('トリプルリング中央（103mm）はTRIPLEを返す', () => {
      // Arrange
      const distance = 103;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('TRIPLE');
    });

    test('トリプル境界手前（106mm）はTRIPLEを返す', () => {
      // Arrange
      const distance = 106;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('TRIPLE');
    });
  });

  describe('境界値 - トリプル/外側シングル境界', () => {
    test('ちょうど107mmはOUTER_SINGLEを返す', () => {
      // Arrange
      const distance = BOARD_PHYSICAL.rings.tripleOuter; // 107mm

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUTER_SINGLE');
    });
  });

  describe('正常系 - OUTER_SINGLE エリア', () => {
    test('外側シングルエリア中央（134mm）はOUTER_SINGLEを返す', () => {
      // Arrange
      const distance = 134;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUTER_SINGLE');
    });

    test('ダブル境界手前（161mm）はOUTER_SINGLEを返す', () => {
      // Arrange
      const distance = 161;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUTER_SINGLE');
    });
  });

  describe('境界値 - 外側シングル/ダブル境界', () => {
    test('ちょうど162mmはDOUBLEを返す', () => {
      // Arrange
      const distance = BOARD_PHYSICAL.rings.doubleInner; // 162mm

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('DOUBLE');
    });
  });

  describe('正常系 - DOUBLE エリア', () => {
    test('ダブルリング中央（166mm）はDOUBLEを返す', () => {
      // Arrange
      const distance = 166;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('DOUBLE');
    });

    test('ダブル境界手前（169mm）はDOUBLEを返す', () => {
      // Arrange
      const distance = 169;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('DOUBLE');
    });
  });

  describe('境界値 - ダブル/外側シングル境界', () => {
    test('ちょうど170mmはOUTER_SINGLEを返す', () => {
      // Arrange
      const distance = BOARD_PHYSICAL.rings.doubleOuter; // 170mm

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUTER_SINGLE');
    });
  });

  describe('正常系 - ボード端付近', () => {
    test('ボード端手前（220mm）はOUTER_SINGLEを返す', () => {
      // Arrange
      const distance = 220;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUTER_SINGLE');
    });
  });

  describe('境界値 - ボード外境界', () => {
    test('ちょうど225mmはOUTを返す', () => {
      // Arrange
      const distance = BOARD_PHYSICAL.rings.boardEdge; // 225mm

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUT');
    });

    test('ボード外（226mm）はOUTを返す', () => {
      // Arrange
      const distance = 226;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUT');
    });

    test('遠く離れた位置（1000mm）はOUTを返す', () => {
      // Arrange
      const distance = 1000;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUT');
    });
  });

  describe('エッジケース', () => {
    test('負の距離（-1mm）は適切に処理される', () => {
      // Arrange
      const distance = -1;

      // Act & Assert
      // 負の距離は物理的にあり得ないが、エラーをスローするか特定の値を返すべき
      expect(() => getRing(distance)).toThrow();
    });

    test('浮動小数点の距離（6.34mm）はINNER_BULLを返す', () => {
      // Arrange
      const distance = 6.34;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('INNER_BULL');
    });

    test('浮動小数点の距離（6.36mm）はOUTER_BULLを返す', () => {
      // Arrange
      const distance = 6.36;

      // Act
      const result = getRing(distance);

      // Assert
      expect(result).toBe('OUTER_BULL');
    });
  });
});

