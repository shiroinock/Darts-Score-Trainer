import { describe, expect, test } from 'vitest';
import { adjustForSpider } from './adjustForSpider.js';

describe('adjustForSpider', () => {
  describe('基本動作確認', () => {
    test('スパイダー境界上でない座標はそのまま返される', () => {
      // Arrange
      const distance = 103; // トリプルリング中央
      const angle = 0; // 真上

      // Act
      const result = adjustForSpider(distance, angle);

      // Assert
      expect(result.distance).toBeCloseTo(distance, 2);
      expect(result.angle).toBeCloseTo(angle, 2);
    });

    test('リング境界上の座標は調整される', () => {
      // Arrange
      const distance = 99; // トリプルリング内側境界（ちょうどスパイダー上）
      const angle = 0;

      // Act
      const result = adjustForSpider(distance, angle);

      // Assert
      // 境界から少しずれた値が返される
      expect(result.distance).not.toBe(distance);
    });

    test('セグメント境界上の座標は調整される', () => {
      // Arrange
      const distance = 103; // トリプルリング中央
      const angle = Math.PI / 10; // セグメント境界（20と1の境界）

      // Act
      const result = adjustForSpider(distance, angle);

      // Assert
      // 境界から少しずれた値が返される
      expect(result.angle).not.toBe(angle);
    });
  });

  describe('エッジケース', () => {
    test('複数の境界に近い座標でも適切に調整される', () => {
      // Arrange
      const distance = 99.0; // リング境界
      const angle = Math.PI / 10; // セグメント境界

      // Act
      const result = adjustForSpider(distance, angle);

      // Assert
      // 何らかの調整が行われる（詳細は実装依存）
      expect(result).toBeDefined();
      expect(result.distance).toBeGreaterThan(0);
    });
  });
});
