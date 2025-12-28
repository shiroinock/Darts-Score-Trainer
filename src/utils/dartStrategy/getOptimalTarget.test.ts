import { describe, expect, test } from 'vitest';
import { getOptimalTarget } from './getOptimalTarget.js';

describe('getOptimalTarget', () => {
  describe('正常系 - 基本的なチェックアウトターゲット（3投）', () => {
    test('残り170点、3投でT20を返す', () => {
      // Arrange
      const remainingScore = 170;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り60点、3投でT20を返す', () => {
      // Arrange
      const remainingScore = 60;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り50点、3投でBULLを返す', () => {
      // Arrange
      const remainingScore = 50;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'BULL',
        number: null,
        label: 'BULL',
      });
    });

    test('残り40点、3投でD20を返す', () => {
      // Arrange
      const remainingScore = 40;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 20,
        label: 'D20',
      });
    });

    test('残り32点、3投でD16を返す', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 16,
        label: 'D16',
      });
    });

    test('残り20点、3投でD10を返す', () => {
      // Arrange
      const remainingScore = 20;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 10,
        label: 'D10',
      });
    });

    test('残り10点、3投でD5を返す', () => {
      // Arrange
      const remainingScore = 10;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 5,
        label: 'D5',
      });
    });

    test('残り2点、3投でD1を返す', () => {
      // Arrange
      const remainingScore = 2;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 1,
        label: 'D1',
      });
    });
  });

  describe('正常系 - 残り投擲数による条件分岐（2投）', () => {
    test('残り170点、2投でT20を返す', () => {
      // Arrange
      const remainingScore = 170;
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り110点、2投でT20を返す（次にBULL狙い）', () => {
      // Arrange
      const remainingScore = 110;
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り50点、2投でBULLを返す', () => {
      // Arrange
      const remainingScore = 50;
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'BULL',
        number: null,
        label: 'BULL',
      });
    });

    test('残り40点、2投でD20を返す', () => {
      // Arrange
      const remainingScore = 40;
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 20,
        label: 'D20',
      });
    });
  });

  describe('正常系 - 残り投擲数による条件分岐（1投）', () => {
    test('残り50点、1投でBULLを返す', () => {
      // Arrange
      const remainingScore = 50;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'BULL',
        number: null,
        label: 'BULL',
      });
    });

    test('残り40点、1投でD20を返す', () => {
      // Arrange
      const remainingScore = 40;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 20,
        label: 'D20',
      });
    });

    test('残り32点、1投でD16を返す', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 16,
        label: 'D16',
      });
    });

    test('残り2点、1投でD1を返す', () => {
      // Arrange
      const remainingScore = 2;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 1,
        label: 'D1',
      });
    });
  });

  describe('正常系 - PDC標準チェックアウト（実践的シナリオ）', () => {
    test('残り167点、3投でT20を返す（T20→T19→BULL）', () => {
      // Arrange
      const remainingScore = 167;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り164点、3投でT20を返す（T20→T18→BULL）', () => {
      // Arrange
      const remainingScore = 164;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り161点、3投でT20を返す（T20→T17→BULL）', () => {
      // Arrange
      const remainingScore = 161;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り160点、3投でT20を返す（T20→T20→D20）', () => {
      // Arrange
      const remainingScore = 160;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り120点、3投でT20を返す（T20→S20→D20）', () => {
      // Arrange
      const remainingScore = 120;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り100点、3投でT20を返す（T20→D20）', () => {
      // Arrange
      const remainingScore = 100;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り80点、3投でT20を返す（T20→D10）', () => {
      // Arrange
      const remainingScore = 80;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り70点、3投でT18を返す（T18→D8）', () => {
      // Arrange
      const remainingScore = 70;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 18,
        label: 'T18',
      });
    });
  });

  describe('エッジケース - nullを返す条件', () => {
    test('残り0点（ゲーム終了）でnullを返す', () => {
      // Arrange
      const remainingScore = 0;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り1点（フィニッシュ不可能）でnullを返す', () => {
      // Arrange
      const remainingScore = 1;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り-1点（負の値）でnullを返す', () => {
      // Arrange
      const remainingScore = -1;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り-10点（負の値）でnullを返す', () => {
      // Arrange
      const remainingScore = -10;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り-100点（負の値）でnullを返す', () => {
      // Arrange
      const remainingScore = -100;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('エッジケース - 高得点シナリオ', () => {
    test('残り180点、3投でT20を返す（最大3投得点）', () => {
      // Arrange
      const remainingScore = 180;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り501点、3投でT20を返す（ゲーム開始点数）', () => {
      // Arrange
      const remainingScore = 501;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り701点、3投でT20を返す（ゲーム開始点数）', () => {
      // Arrange
      const remainingScore = 701;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り1000点、3投でT20を返す（非常に高得点）', () => {
      // Arrange
      const remainingScore = 1000;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });
  });

  describe('エッジケース - 奇数点（1投では不可能）', () => {
    test('残り3点、3投でS1を返す（S1→D1）', () => {
      // Arrange
      const remainingScore = 3;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'SINGLE',
        number: 1,
        label: 'S1',
      });
    });

    test('残り5点、3投でS1を返す（S1→D2）', () => {
      // Arrange
      const remainingScore = 5;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'SINGLE',
        number: 1,
        label: 'S1',
      });
    });

    test('残り7点、3投でS3を返す（S3→D2）', () => {
      // Arrange
      const remainingScore = 7;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'SINGLE',
        number: 3,
        label: 'S3',
      });
    });

    test('残り9点、3投でS1を返す（S1→D4）', () => {
      // Arrange
      const remainingScore = 9;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'SINGLE',
        number: 1,
        label: 'S1',
      });
    });

    test('残り41点、3投でS9を返す（S9→D16）', () => {
      // Arrange
      const remainingScore = 41;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'SINGLE',
        number: 9,
        label: 'S9',
      });
    });

    test('残り49点、3投でS17を返す（S17→D16）', () => {
      // Arrange
      const remainingScore = 49;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'SINGLE',
        number: 17,
        label: 'S17',
      });
    });
  });

  describe('エッジケース - 奇数点（1投では不可能、残り1投）', () => {
    test('残り3点、1投でnullを返す（フィニッシュ不可能）', () => {
      // Arrange
      const remainingScore = 3;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り5点、1投でnullを返す（フィニッシュ不可能）', () => {
      // Arrange
      const remainingScore = 5;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り41点、1投でnullを返す（フィニッシュ不可能）', () => {
      // Arrange
      const remainingScore = 41;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り49点、1投でnullを返す（フィニッシュ不可能）', () => {
      // Arrange
      const remainingScore = 49;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('エッジケース - 高得点で1投では不可能', () => {
    test('残り51点、1投でnullを返す（フィニッシュ不可能）', () => {
      // Arrange
      const remainingScore = 51;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り60点、1投でnullを返す（フィニッシュ不可能）', () => {
      // Arrange
      const remainingScore = 60;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り100点、1投でnullを返す（フィニッシュ不可能）', () => {
      // Arrange
      const remainingScore = 100;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り170点、1投でnullを返す（フィニッシュ不可能）', () => {
      // Arrange
      const remainingScore = 170;
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('境界値 - 残り投擲数', () => {
    test('残り32点、0投でnullを返す', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = 0;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り170点、10投でT20を返す（非常に多い投擲数）', () => {
      // Arrange
      const remainingScore = 170;
      const throwsRemaining = 10;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り170点、100投でT20を返す（極端に多い投擲数）', () => {
      // Arrange
      const remainingScore = 170;
      const throwsRemaining = 100;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });
  });

  describe('異常系 - 浮動小数点数の残り点数', () => {
    test('残り32.5点でエラーをスローする', () => {
      // Arrange
      const remainingScore = 32.5;
      const throwsRemaining = 3;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('残り2.5点でエラーをスローする', () => {
      // Arrange
      const remainingScore = 2.5;
      const throwsRemaining = 3;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('残り170.1点でエラーをスローする', () => {
      // Arrange
      const remainingScore = 170.1;
      const throwsRemaining = 3;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('残り0.1点でエラーをスローする', () => {
      // Arrange
      const remainingScore = 0.1;
      const throwsRemaining = 3;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り点数は整数である必要があります'
      );
    });
  });

  describe('異常系 - 特殊な数値（残り点数）', () => {
    test('NaN（残り点数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = NaN;
      const throwsRemaining = 3;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('Infinity（残り点数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = Infinity;
      const throwsRemaining = 3;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り点数は整数である必要があります'
      );
    });

    test('-Infinity（残り点数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = -Infinity;
      const throwsRemaining = 3;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り点数は整数である必要があります'
      );
    });
  });

  describe('異常系 - 浮動小数点数の残り投擲数', () => {
    test('残り投擲数が2.5（小数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = 2.5;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り投擲数は整数である必要があります'
      );
    });

    test('残り投擲数が1.1（小数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = 1.1;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り投擲数は整数である必要があります'
      );
    });

    test('残り投擲数が0.5（小数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = 0.5;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り投擲数は整数である必要があります'
      );
    });
  });

  describe('異常系 - 特殊な数値（残り投擲数）', () => {
    test('NaN（残り投擲数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = NaN;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り投擲数は整数である必要があります'
      );
    });

    test('Infinity（残り投擲数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = Infinity;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り投擲数は整数である必要があります'
      );
    });

    test('-Infinity（残り投擲数）でエラーをスローする', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = -Infinity;

      // Act & Assert
      expect(() => getOptimalTarget(remainingScore, throwsRemaining)).toThrow(
        '残り投擲数は整数である必要があります'
      );
    });
  });

  describe('異常系 - 負の残り投擲数', () => {
    test('残り投擲数が-1（負の値）でnullを返す', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = -1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り投擲数が-10（負の値）でnullを返す', () => {
      // Arrange
      const remainingScore = 170;
      const throwsRemaining = -10;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });

    test('残り投擲数が-100（負の値）でnullを返す', () => {
      // Arrange
      const remainingScore = 501;
      const throwsRemaining = -100;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('実践的なゲームシナリオ - 301ゲーム', () => {
    test('301ゲーム開始: 残り301点、3投でT20を返す', () => {
      // Arrange
      const remainingScore = 301;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('301ゲーム中盤: 残り141点、3投でT20を返す', () => {
      // Arrange
      const remainingScore = 141;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('301ゲーム終盤: 残り61点、3投でT11を返す（T11→D14）', () => {
      // Arrange
      const remainingScore = 61;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 11,
        label: 'T11',
      });
    });

    test('301ゲームフィニッシュ: 残り32点、2投でD16を返す', () => {
      // Arrange
      const remainingScore = 32;
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 16,
        label: 'D16',
      });
    });
  });

  describe('実践的なゲームシナリオ - 501ゲーム', () => {
    test('501ゲーム序盤: 残り441点、3投でT20を返す（T20×3後）', () => {
      // Arrange
      const remainingScore = 441;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('501ゲーム中盤: 残り201点、3投でT20を返す', () => {
      // Arrange
      const remainingScore = 201;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('501ゲーム終盤: 残り110点、3投でT20を返す（T20→BULL）', () => {
      // Arrange
      const remainingScore = 110;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });
  });

  describe('実践的なゲームシナリオ - 701ゲーム', () => {
    test('701ゲーム序盤: 残り641点、3投でT20を返す（T20×3後）', () => {
      // Arrange
      const remainingScore = 641;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('701ゲーム中盤: 残り401点、3投でT20を返す', () => {
      // Arrange
      const remainingScore = 401;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });
  });

  describe('実践的なゲームシナリオ - ミスからのリカバリー', () => {
    test('T20狙いでS20（20点）: 残り150点、2投でT20を返す', () => {
      // Arrange
      const remainingScore = 150; // 170 - 20
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('BULL狙いでアウターブル（25点）: 残り85点、2投でT15を返す（T15→D20）', () => {
      // Arrange
      const remainingScore = 85; // 110 - 25
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 15,
        label: 'T15',
      });
    });

    test('D20狙いでS20（20点）: 残り20点、1投でD10を返す', () => {
      // Arrange
      const remainingScore = 20; // 40 - 20
      const throwsRemaining = 1;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'DOUBLE',
        number: 10,
        label: 'D10',
      });
    });
  });

  describe('特殊ケース - ダーツで取りえない残り点数（170点超）', () => {
    test('残り171点、3投でT20を返す（4投必要だがT20推奨）', () => {
      // Arrange
      const remainingScore = 171;
      const throwsRemaining = 3;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り180点、2投でT20を返す（3投必要だがT20推奨）', () => {
      // Arrange
      const remainingScore = 180;
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('残り200点、2投でT20を返す（4投必要だがT20推奨）', () => {
      // Arrange
      const remainingScore = 200;
      const throwsRemaining = 2;

      // Act
      const result = getOptimalTarget(remainingScore, throwsRemaining);

      // Assert
      expect(result).toEqual({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });
  });
});
