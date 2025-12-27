import { describe, expect, test } from 'vitest';
import { canFinishWithDouble } from './canFinishWithDouble.js';

describe('canFinishWithDouble', () => {
  describe('正常系 - ダブルでフィニッシュ可能', () => {
    test('残り2点はダブル1でフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 2;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り20点はダブル10でフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 20;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り40点はダブル20でフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 40;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り50点はBULL（インナーブル）でフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 50;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り4点はダブル2でフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 4;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り32点はダブル16でフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 32;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り16点はダブル8でフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 16;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('異常系 - ダブルでフィニッシュ不可能', () => {
    test('残り1点はダブルでフィニッシュ不可能（最小フィニッシュ不可能値）', () => {
      // Arrange
      const remainingScore = 1;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り3点（奇数）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 3;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り5点（奇数）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 5;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り21点（奇数）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 21;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り49点（奇数）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 49;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り51点（50点超）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 51;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り52点（40超、50未満の偶数）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 52;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り100点（50点超）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 100;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り170点（ダーツ最大フィニッシュスコア、50点超）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 170;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('境界値', () => {
    test('残り2点（最小フィニッシュ可能値）はダブルでフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 2;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り40点（最大ダブルスコア）はダブルでフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 40;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り50点（BULL）はダブルでフィニッシュ可能', () => {
      // Arrange
      const remainingScore = 50;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り41点（40超、50未満の奇数）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 41;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り42点（40超、50未満の偶数）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 42;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('エッジケース', () => {
    test('残り0点はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 0;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り-1点（負の値）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = -1;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り-10点（負の値）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = -10;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り501点（ゲーム開始点数）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 501;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り1000点（非常に大きな値）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 1000;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り10000点（非常に大きな値）はダブルでフィニッシュ不可能', () => {
      // Arrange
      const remainingScore = 10000;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('入力検証 - 非整数値と特殊値', () => {
    test('残り2.5点（小数）はエラーをスローする', () => {
      // Arrange
      const remainingScore = 2.5;

      // Act & Assert
      expect(() => canFinishWithDouble(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('残り3.14点（小数）はエラーをスローする', () => {
      // Arrange
      const remainingScore = 3.14;

      // Act & Assert
      expect(() => canFinishWithDouble(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('残り20.1点（小数）はエラーをスローする', () => {
      // Arrange
      const remainingScore = 20.1;

      // Act & Assert
      expect(() => canFinishWithDouble(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('NaNはエラーをスローする', () => {
      // Arrange
      const remainingScore = NaN;

      // Act & Assert
      expect(() => canFinishWithDouble(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('Infinityはエラーをスローする', () => {
      // Arrange
      const remainingScore = Infinity;

      // Act & Assert
      expect(() => canFinishWithDouble(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('-Infinityはエラーをスローする', () => {
      // Arrange
      const remainingScore = -Infinity;

      // Act & Assert
      expect(() => canFinishWithDouble(remainingScore)).toThrow(
        '残り点数は整数である必要があります'
      );
    });
  });

  describe('実践的なゲームシナリオ', () => {
    test('残り110点から2本の投擲でフィニッシュ狙い: T20（60点）→残り50点はBULL可能', () => {
      // Arrange
      const remainingScore = 50; // T20後の残り

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り120点から3本の投擲でフィニッシュ狙い: T20（60点）→T20（60点）→残り0点', () => {
      // Arrange
      const remainingScore = 0;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り101点でT20（60点）後、残り41点はダブル不可能', () => {
      // Arrange
      const remainingScore = 41;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(false);
    });

    test('残り60点でS20（20点）後、残り40点はD20可能', () => {
      // Arrange
      const remainingScore = 40;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('301ゲーム終盤: 残り32点はD16可能', () => {
      // Arrange
      const remainingScore = 32;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });

    test('残り36点はD18可能', () => {
      // Arrange
      const remainingScore = 36;

      // Act
      const result = canFinishWithDouble(remainingScore);

      // Assert
      expect(result).toBe(true);
    });
  });
});
