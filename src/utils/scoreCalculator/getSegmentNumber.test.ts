import { describe, expect, test } from 'vitest';
import { getSegmentNumber } from './getSegmentNumber.js';

describe('getSegmentNumber', () => {
  describe('正常系 - 基準セグメント', () => {
    test('真上（0ラジアン）は20を返す', () => {
      // Arrange
      const angle = 0;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(20);
    });

    test('右方向（π/2ラジアン）は6を返す', () => {
      // Arrange
      const angle = Math.PI / 2;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(6);
    });

    test('下方向（πラジアン）は3を返す', () => {
      // Arrange
      const angle = Math.PI;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(3);
    });

    test('左方向（-π/2ラジアン）は11を返す', () => {
      // Arrange
      const angle = -Math.PI / 2;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(11);
    });
  });

  describe('境界値 - セグメント境界', () => {
    // 各セグメントの中心は index * π/10
    // 各セグメントの境界は (index + 0.5) * π/10 = (2*index + 1) * π/20
    // セグメント20(index=0)と1(index=1)の境界: π/20 (9度)
    test('20と1の境界（π/20ラジアン）は1を返す', () => {
      // Arrange
      const angle = Math.PI / 20; // 9度（境界上は次のセグメント）

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(1);
    });

    test('1と18の境界（3*π/20ラジアン）は18を返す', () => {
      // Arrange
      const angle = (3 * Math.PI) / 20; // 27度（境界上は次のセグメント）

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(18);
    });
  });

  describe('正常系 - 各セグメント中央', () => {
    // 各セグメントの中心は index * π/10
    // セグメント1 (index=1) の中心: π/10 (18度)
    // セグメント18 (index=2) の中心: 2π/10 = π/5 (36度)
    test('セグメント1の中央（π/10ラジアン = 18度）は1を返す', () => {
      // Arrange
      const angle = Math.PI / 10; // 18度（1の中央）

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(1);
    });

    test('セグメント18の中央（π/5ラジアン = 36度）は18を返す', () => {
      // Arrange
      const angle = Math.PI / 5; // 36度（18の中央）

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(18);
    });
  });

  describe('エッジケース - 負の角度と2π超え', () => {
    test('負の角度（-π/10ラジアン）は適切なセグメント番号を返す', () => {
      // Arrange
      const angle = -Math.PI / 10;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(5); // 時計の11時方向
    });

    test('2πを超える角度（2π + π/10ラジアン）は1を返す', () => {
      // Arrange
      const angle = 2 * Math.PI + Math.PI / 10;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(1);
    });

    test('複数周回転した角度（4π + π/5ラジアン）は適切なセグメント番号を返す', () => {
      // Arrange
      const angle = 4 * Math.PI + Math.PI / 5;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(18);
    });
  });

  describe('境界値 - 浮動小数点精度', () => {
    // 20と1の境界は π/20 (9度)
    test('境界値に非常に近い角度（π/20 - 0.0001ラジアン）は20を返す', () => {
      // Arrange
      const angle = Math.PI / 20 - 0.0001;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(20);
    });

    test('境界値に非常に近い角度（π/20 + 0.0001ラジアン）は1を返す', () => {
      // Arrange
      const angle = Math.PI / 20 + 0.0001;

      // Act
      const result = getSegmentNumber(angle);

      // Assert
      expect(result).toBe(1);
    });
  });
});
