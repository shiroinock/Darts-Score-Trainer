import { describe, test, expect } from 'vitest';
import { getValidSingleScores } from './getValidSingleScores.js';

describe('getValidSingleScores', () => {
  describe('戻り値の基本検証', () => {
    test('Setオブジェクトを返す', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result).toBeInstanceOf(Set);
    });

    test('44個の要素を含む（ダーツで取りうる全ての異なる得点）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.size).toBe(44);
    });
  });

  describe('正常系 - 0点（ボード外）', () => {
    test('0点が含まれる', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(0)).toBe(true);
    });
  });

  describe('正常系 - シングル（1-20）', () => {
    test('1点が含まれる', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(1)).toBe(true);
    });

    test('10点が含まれる', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(10)).toBe(true);
    });

    test('20点が含まれる', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(20)).toBe(true);
    });

    test('1から20までの全ての値が含まれる', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      for (let i = 1; i <= 20; i++) {
        expect(result.has(i)).toBe(true);
      }
    });
  });

  describe('正常系 - ダブル（2-40の全ての偶数）', () => {
    test('2点が含まれる（D1）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(2)).toBe(true);
    });

    test('4点が含まれる（D2）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(4)).toBe(true);
    });

    test('22点が含まれる（D11）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(22)).toBe(true);
    });

    test('26点が含まれる（D13）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(26)).toBe(true);
    });

    test('28点が含まれる（D14）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(28)).toBe(true);
    });

    test('32点が含まれる（D16）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(32)).toBe(true);
    });

    test('40点が含まれる（D20）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(40)).toBe(true);
    });

    test('2から40までの全ての偶数が含まれる', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      for (let i = 2; i <= 40; i += 2) {
        expect(result.has(i)).toBe(true);
      }
    });
  });

  describe('正常系 - トリプル（セグメント1-20の3倍）', () => {
    test('3点が含まれる（T1）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(3)).toBe(true);
    });

    test('6点が含まれる（T2）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(6)).toBe(true);
    });

    test('9点が含まれる（T3）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(9)).toBe(true);
    });

    test('21点が含まれる（T7）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(21)).toBe(true);
    });

    test('27点が含まれる（T9）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(27)).toBe(true);
    });

    test('33点が含まれる（T11）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(33)).toBe(true);
    });

    test('39点が含まれる（T13）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(39)).toBe(true);
    });

    test('45点が含まれる（T15）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(45)).toBe(true);
    });

    test('51点が含まれる（T17）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(51)).toBe(true);
    });

    test('57点が含まれる（T19）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(57)).toBe(true);
    });

    test('60点が含まれる（T20）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(60)).toBe(true);
    });

    test('3から60までの3の倍数（セグメント1-20の3倍）が全て含まれる', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      for (let i = 1; i <= 20; i++) {
        expect(result.has(i * 3)).toBe(true);
      }
    });
  });

  describe('正常系 - ブル', () => {
    test('25点が含まれる（アウターブル）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(25)).toBe(true);
    });

    test('50点が含まれる（インナーブル）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(50)).toBe(true);
    });
  });

  describe('境界値 - 上限下限', () => {
    test('0点が含まれる（下限）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(0)).toBe(true);
    });

    test('60点が含まれる（上限）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(60)).toBe(true);
    });

    test('61点は含まれない（上限超過）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(61)).toBe(false);
    });

    test('-1点は含まれない（下限未満）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(-1)).toBe(false);
    });
  });

  describe('異常系 - 取りえない値（奇数）', () => {
    test('23点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(23)).toBe(false);
    });

    test('29点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(29)).toBe(false);
    });

    test('31点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(31)).toBe(false);
    });

    test('35点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(35)).toBe(false);
    });

    test('37点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(37)).toBe(false);
    });

    test('41点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(41)).toBe(false);
    });

    test('43点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(43)).toBe(false);
    });

    test('47点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(47)).toBe(false);
    });

    test('49点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(49)).toBe(false);
    });

    test('53点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(53)).toBe(false);
    });

    test('55点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(55)).toBe(false);
    });

    test('59点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(59)).toBe(false);
    });
  });

  describe('異常系 - 取りえない値（偶数）', () => {
    test('44点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(44)).toBe(false);
    });

    test('46点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(46)).toBe(false);
    });

    test('52点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(52)).toBe(false);
    });

    test('56点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(56)).toBe(false);
    });

    test('58点は含まれない（取りえない）', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(58)).toBe(false);
    });
  });

  describe('異常系 - 範囲外の値', () => {
    test('100点は含まれない', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(100)).toBe(false);
    });

    test('180点は含まれない', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(180)).toBe(false);
    });

    test('-10点は含まれない', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(-10)).toBe(false);
    });

    test('-100点は含まれない', () => {
      // Act
      const result = getValidSingleScores();

      // Assert
      expect(result.has(-100)).toBe(false);
    });
  });

  describe('不変性テスト', () => {
    test('複数回呼び出しで同じ内容が返される', () => {
      // Arrange & Act
      const result1 = getValidSingleScores();
      const result2 = getValidSingleScores();

      // Assert
      expect(result1.size).toBe(result2.size);

      // 全ての要素が一致することを確認
      for (const value of result1) {
        expect(result2.has(value)).toBe(true);
      }

      for (const value of result2) {
        expect(result1.has(value)).toBe(true);
      }
    });

    test('返されたSetを変更しても次回の呼び出しに影響しない', () => {
      // Arrange & Act
      const result1 = getValidSingleScores();
      const originalSize = result1.size;

      // 返されたSetを変更
      result1.add(999);
      expect(result1.has(999)).toBe(true);

      // 再度取得
      const result2 = getValidSingleScores();

      // Assert
      expect(result2.size).toBe(originalSize);
      expect(result2.has(999)).toBe(false);
    });
  });

  describe('網羅性テスト - 有効な得点の完全リスト', () => {
    test('darts-domainで定義された44個の有効な得点が全て含まれる', () => {
      // Arrange
      // darts-domainスキルで定義された有効な得点の完全リスト
      const expectedValidScores = [
        0,
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 24, 25, 26, 27, 28, 30,
        32, 33, 34, 36, 38, 39, 40,
        42, 45, 48, 50, 51, 54, 57, 60,
      ];

      // Act
      const result = getValidSingleScores();

      // Assert
      // 期待される全ての値が含まれることを確認
      for (const score of expectedValidScores) {
        expect(result.has(score)).toBe(true);
      }

      // サイズが一致することを確認（他の値が含まれていないことを保証）
      expect(result.size).toBe(expectedValidScores.length);
    });
  });
});
