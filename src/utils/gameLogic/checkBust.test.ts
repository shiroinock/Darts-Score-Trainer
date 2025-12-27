import { describe, expect, test } from 'vitest';
import { checkBust } from './checkBust.js';

describe('checkBust', () => {
  describe('正常系 - バストなし（通常の投擲）', () => {
    test('残り100点で60点取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 100;
      const throwScore = 60;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り501点で60点取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 501;
      const throwScore = 60;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り50点で25点取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 50;
      const throwScore = 25;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り10点で3点取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 10;
      const throwScore = 3;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });
  });

  describe('正常系 - ゲームクリア（ダブルアウト成功）', () => {
    test('残り40点でダブル20（40点）取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 40;
      const throwScore = 40;
      const isDouble = true;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り32点でダブル16（32点）取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 32;
      const throwScore = 32;
      const isDouble = true;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り2点でダブル1（2点）取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 2;
      const throwScore = 2;
      const isDouble = true;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り50点でBULL（50点）取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 50;
      const throwScore = 50;
      const isDouble = true; // BULLはダブルカウント

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });
  });

  describe('バスト - オーバー（残り点数を超えた）', () => {
    test('残り50点で60点取った場合、over バストを返す', () => {
      // Arrange
      const remainingScore = 50;
      const throwScore = 60;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('over');
    });

    test('残り20点で60点取った場合、over バストを返す', () => {
      // Arrange
      const remainingScore = 20;
      const throwScore = 60;
      const isDouble = true;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('over');
    });

    test('残り2点で3点取った場合、over バストを返す', () => {
      // Arrange
      const remainingScore = 2;
      const throwScore = 3;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('over');
    });

    test('残り1点で任意の点数取った場合、over バストを返す', () => {
      // Arrange
      const remainingScore = 1;
      const throwScore = 2;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('over');
    });
  });

  describe('バスト - 1点になる（フィニッシュ不可能）', () => {
    test('残り21点で20点取った場合、finish_impossible バストを返す', () => {
      // Arrange
      const remainingScore = 21;
      const throwScore = 20;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('finish_impossible');
    });

    test('残り26点で25点取った場合、finish_impossible バストを返す', () => {
      // Arrange
      const remainingScore = 26;
      const throwScore = 25;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('finish_impossible');
    });

    test('残り61点で60点取った場合、finish_impossible バストを返す', () => {
      // Arrange
      const remainingScore = 61;
      const throwScore = 60;
      const isDouble = true; // ダブルでも1点になる場合はバスト

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('finish_impossible');
    });

    test('残り4点で3点取った場合、finish_impossible バストを返す', () => {
      // Arrange
      const remainingScore = 4;
      const throwScore = 3;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('finish_impossible');
    });
  });

  describe('バスト - ダブルアウト時のダブル外し', () => {
    test('残り40点でシングル20（20点）取った場合、double_out_required バストを返す', () => {
      // Arrange
      const remainingScore = 40;
      const throwScore = 40;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('double_out_required');
    });

    test('残り20点でシングル20（20点）取った場合、double_out_required バストを返す', () => {
      // Arrange
      const remainingScore = 20;
      const throwScore = 20;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('double_out_required');
    });

    test('残り32点でシングル16（16点）×2本取った場合、double_out_required バストを返す', () => {
      // Arrange
      const remainingScore = 32;
      const throwScore = 32;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('double_out_required');
    });

    test('残り50点でアウターブル（25点）×2本取った場合、double_out_required バストを返す', () => {
      // Arrange
      const remainingScore = 50;
      const throwScore = 50;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('double_out_required');
    });

    test('残り60点でトリプル20（60点）取った場合、double_out_required バストを返す', () => {
      // Arrange
      const remainingScore = 60;
      const throwScore = 60;
      const isDouble = false; // トリプルはダブルではない

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('double_out_required');
    });
  });

  describe('境界値 - 残り点数の境界', () => {
    test('残り2点で0点取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 2;
      const throwScore = 0;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り170点（最大点数）で60点取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 170;
      const throwScore = 60;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り3点で1点取った場合、バストなしを返す', () => {
      // Arrange
      const remainingScore = 3;
      const throwScore = 1;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('残り3点で2点取った場合、finish_impossible バストを返す', () => {
      // Arrange
      const remainingScore = 3;
      const throwScore = 2;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('finish_impossible');
    });
  });

  describe('エッジケース', () => {
    test('残り0点で0点取った場合の処理', () => {
      // Arrange
      const remainingScore = 0;
      const throwScore = 0;
      const isDouble = false;

      // Act & Assert
      // 残り0点は異常状態なのでエラーをスローする、または特定の動作を定義
      expect(() => checkBust(remainingScore, throwScore, isDouble)).toThrow();
    });

    test('負の残り点数の場合の処理', () => {
      // Arrange
      const remainingScore = -10;
      const throwScore = 20;
      const isDouble = false;

      // Act & Assert
      // 負の残り点数は異常状態なのでエラーをスローする
      expect(() => checkBust(remainingScore, throwScore, isDouble)).toThrow();
    });

    test('負の投擲点数の場合の処理', () => {
      // Arrange
      const remainingScore = 100;
      const throwScore = -5;
      const isDouble = false;

      // Act & Assert
      // 負の投擲点数は異常状態なのでエラーをスローする
      expect(() => checkBust(remainingScore, throwScore, isDouble)).toThrow();
    });

    test('異常に大きな投擲点数（61点以上）の場合の処理', () => {
      // Arrange
      const remainingScore = 100;
      const throwScore = 61; // ダーツの最大点数は60点
      const isDouble = false;

      // Act & Assert
      // 61点以上は物理的にあり得ないのでエラーをスローする
      expect(() => checkBust(remainingScore, throwScore, isDouble)).toThrow();
    });

    test('浮動小数点の残り点数の場合の処理', () => {
      // Arrange
      const remainingScore = 50.5;
      const throwScore = 20;
      const isDouble = false;

      // Act & Assert
      // 点数は整数のみなのでエラーをスローする
      expect(() => checkBust(remainingScore, throwScore, isDouble)).toThrow();
    });

    test('浮動小数点の投擲点数の場合の処理', () => {
      // Arrange
      const remainingScore = 100;
      const throwScore = 20.5;
      const isDouble = false;

      // Act & Assert
      // 点数は整数のみなのでエラーをスローする
      expect(() => checkBust(remainingScore, throwScore, isDouble)).toThrow();
    });
  });

  describe('複合ケース - 複数のバスト条件の優先順位', () => {
    test('残り1点で2点取った場合、over が優先される', () => {
      // Arrange
      const remainingScore = 1;
      const throwScore = 2;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      // オーバーと1点になるの両方に該当するが、オーバーが優先される
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('over');
    });

    test('残り2点で2点かつダブル外しの場合、double_out_required が優先される', () => {
      // Arrange
      const remainingScore = 2;
      const throwScore = 2;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      // 0点でフィニッシュだがダブルではない
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('double_out_required');
    });
  });

  describe('実践的なゲームシナリオ', () => {
    test('501ゲーム中盤: 残り281点でトリプル20（60点）', () => {
      // Arrange
      const remainingScore = 281;
      const throwScore = 60;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });

    test('501ゲーム終盤: 残り110点でトリプル20（60点）', () => {
      // Arrange
      const remainingScore = 110;
      const throwScore = 60;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
      // 残り50点になるので、次でBULL狙い可能
    });

    test('301ゲームフィニッシュ失敗: 残り32点でシングル16（16点）', () => {
      // Arrange
      const remainingScore = 32;
      const throwScore = 16;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
      // 残り16点になるので、次でダブル8狙い可能
    });

    test('301ゲームバスト: 残り32点でトリプル20（60点）', () => {
      // Arrange
      const remainingScore = 32;
      const throwScore = 60;
      const isDouble = false;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(true);
      expect(result.reason).toBe('over');
    });

    test('クリケットなし: 残り16点でダブル8成功', () => {
      // Arrange
      const remainingScore = 16;
      const throwScore = 16;
      const isDouble = true;

      // Act
      const result = checkBust(remainingScore, throwScore, isDouble);

      // Assert
      expect(result.isBust).toBe(false);
      expect(result.reason).toBeNull();
    });
  });
});
