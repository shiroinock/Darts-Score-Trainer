import { describe, test, expect } from 'vitest';
import { isValidSingleThrowScore, isValidRoundScore, getValidSingleScores, isValidRemainingScore } from './validation';

describe('validation', () => {
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

  describe('isValidRoundScore', () => {
    describe('正常系 - 典型的な得点', () => {
      test('0点はtrueを返す（3投全てボード外）', () => {
        // Arrange
        const score = 0;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(true);
      });

      test('1点はtrueを返す', () => {
        // Arrange
        const score = 1;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(true);
      });

      test('60点はtrueを返す（T20 + 0 + 0）', () => {
        // Arrange
        const score = 60;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(true);
      });

      test('100点はtrueを返す（T20 + T20 + 20など）', () => {
        // Arrange
        const score = 100;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(true);
      });

      test('150点はtrueを返す（T20 + T20 + T20 + 30など）', () => {
        // Arrange
        const score = 150;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('境界値 - 上限下限', () => {
      test('0点はtrueを返す（下限）', () => {
        // Arrange
        const score = 0;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(true);
      });

      test('180点はtrueを返す（上限：T20 + T20 + T20）', () => {
        // Arrange
        const score = 180;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(true);
      });

      test('181点はfalseを返す（上限超過）', () => {
        // Arrange
        const score = 181;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('-1点はfalseを返す（下限未満）', () => {
        // Arrange
        const score = -1;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('異常系 - 負の数', () => {
      test('-1点はfalseを返す', () => {
        // Arrange
        const score = -1;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('-10点はfalseを返す', () => {
        // Arrange
        const score = -10;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('-100点はfalseを返す', () => {
        // Arrange
        const score = -100;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('異常系 - 181以上', () => {
      test('181点はfalseを返す', () => {
        // Arrange
        const score = 181;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('200点はfalseを返す', () => {
        // Arrange
        const score = 200;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('500点はfalseを返す', () => {
        // Arrange
        const score = 500;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('1000点はfalseを返す', () => {
        // Arrange
        const score = 1000;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('エッジケース - 浮動小数点数', () => {
      test('小数点を含む値（1.5点）はfalseを返す', () => {
        // Arrange
        const score = 1.5;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('小数点を含む値（100.1点）はfalseを返す', () => {
        // Arrange
        const score = 100.1;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('小数点を含む値（180.9点）はfalseを返す', () => {
        // Arrange
        const score = 180.9;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('小数点を含む値（0.5点）はfalseを返す', () => {
        // Arrange
        const score = 0.5;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('エッジケース - 特殊な数値', () => {
      test('NaNはfalseを返す', () => {
        // Arrange
        const score = NaN;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('Infinityはfalseを返す', () => {
        // Arrange
        const score = Infinity;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('-Infinityはfalseを返す', () => {
        // Arrange
        const score = -Infinity;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('異常系 - 取りえない値（3投では達成不可能な値）', () => {
      test('163点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 163;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('166点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 166;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('169点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 169;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('172点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 172;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('173点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 173;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('175点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 175;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('176点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 176;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('178点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 178;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });

      test('179点はfalseを返す（取りえない）', () => {
        // Arrange
        const score = 179;

        // Act
        const result = isValidRoundScore(score);

        // Assert
        expect(result).toBe(false);
      });
    });
  });

  describe('isValidRemainingScore', () => {
    describe('正常系 - 典型的な残り点数遷移', () => {
      test('残り501点、60点取って残り441点はtrueを返す', () => {
        // Arrange
        const remaining = 501;
        const current = 60;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });

      test('残り100点、45点取って残り55点はtrueを返す', () => {
        // Arrange
        const remaining = 100;
        const current = 45;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });

      test('残り50点、0点取って残り50点はtrueを返す', () => {
        // Arrange
        const remaining = 50;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });

      test('残り180点、180点取って残り0点はtrueを返す', () => {
        // Arrange
        const remaining = 180;
        const current = 180;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('境界値 - ダブルアウト可能な終局面', () => {
      test('残り2点、0点取って残り2点はtrueを返す（D1でフィニッシュ可能）', () => {
        // Arrange
        const remaining = 2;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });

      test('残り40点、0点取って残り40点はtrueを返す（D20でフィニッシュ可能）', () => {
        // Arrange
        const remaining = 40;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });

      test('残り50点、0点取って残り50点はtrueを返す（Bull → D25でフィニッシュ可能）', () => {
        // Arrange
        const remaining = 50;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });

      test('残り3点、2点取って残り1点はfalseを返す（ダブルアウト不可能）', () => {
        // Arrange
        const remaining = 3;
        const current = 2;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('残り0点、0点取って残り0点はtrueを返す（既にフィニッシュ済み）', () => {
        // Arrange
        const remaining = 0;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('バスト - オーバー', () => {
      test('残り50点、51点取って残り-1点はfalseを返す（オーバー）', () => {
        // Arrange
        const remaining = 50;
        const current = 51;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('残り100点、101点取って残り-1点はfalseを返す（オーバー）', () => {
        // Arrange
        const remaining = 100;
        const current = 101;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('残り10点、20点取って残り-10点はfalseを返す（オーバー）', () => {
        // Arrange
        const remaining = 10;
        const current = 20;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('残り2点、3点取って残り-1点はfalseを返す（最小オーバー）', () => {
        // Arrange
        const remaining = 2;
        const current = 3;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('バスト - 1点（ダブルアウト不可能）', () => {
      test('残り2点、1点取って残り1点はfalseを返す', () => {
        // Arrange
        const remaining = 2;
        const current = 1;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('残り3点、2点取って残り1点はfalseを返す', () => {
        // Arrange
        const remaining = 3;
        const current = 2;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('残り61点、60点取って残り1点はfalseを返す', () => {
        // Arrange
        const remaining = 61;
        const current = 60;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('残り181点、180点取って残り1点はfalseを返す', () => {
        // Arrange
        const remaining = 181;
        const current = 180;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('エッジケース - NaN, Infinity', () => {
      test('remainingがNaNの場合falseを返す', () => {
        // Arrange
        const remaining = NaN;
        const current = 60;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('currentがNaNの場合falseを返す', () => {
        // Arrange
        const remaining = 100;
        const current = NaN;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('両方がNaNの場合falseを返す', () => {
        // Arrange
        const remaining = NaN;
        const current = NaN;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('remainingがInfinityの場合falseを返す', () => {
        // Arrange
        const remaining = Infinity;
        const current = 60;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('currentがInfinityの場合falseを返す', () => {
        // Arrange
        const remaining = 100;
        const current = Infinity;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('remainingが-Infinityの場合falseを返す', () => {
        // Arrange
        const remaining = -Infinity;
        const current = 60;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('currentが-Infinityの場合falseを返す', () => {
        // Arrange
        const remaining = 100;
        const current = -Infinity;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('エッジケース - 浮動小数点数', () => {
      test('remainingが浮動小数点数（100.5）の場合falseを返す', () => {
        // Arrange
        const remaining = 100.5;
        const current = 60;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('currentが浮動小数点数（60.1）の場合falseを返す', () => {
        // Arrange
        const remaining = 100;
        const current = 60.1;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('両方が浮動小数点数の場合falseを返す', () => {
        // Arrange
        const remaining = 100.5;
        const current = 60.5;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('remainingが0.5の場合falseを返す', () => {
        // Arrange
        const remaining = 0.5;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('エッジケース - 負の数', () => {
      test('remainingが負の数（-1）の場合falseを返す（既にバスト状態）', () => {
        // Arrange
        const remaining = -1;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('remainingが負の数（-100）の場合falseを返す', () => {
        // Arrange
        const remaining = -100;
        const current = 60;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('currentが負の数（-1）の場合falseを返す（無効な得点）', () => {
        // Arrange
        const remaining = 100;
        const current = -1;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('currentが負の数（-60）の場合falseを返す', () => {
        // Arrange
        const remaining = 100;
        const current = -60;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });

      test('両方が負の数の場合falseを返す', () => {
        // Arrange
        const remaining = -50;
        const current = -50;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('エッジケース - 境界値の組み合わせ', () => {
      test('残り501点、0点取って残り501点はtrueを返す（501ゲーム開始直後）', () => {
        // Arrange
        const remaining = 501;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });

      test('残り701点、0点取って残り701点はtrueを返す（701ゲーム開始直後）', () => {
        // Arrange
        const remaining = 701;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });

      test('残り301点、0点取って残り301点はtrueを返す（301ゲーム開始直後）', () => {
        // Arrange
        const remaining = 301;
        const current = 0;

        // Act
        const result = isValidRemainingScore(remaining, current);

        // Assert
        expect(result).toBe(true);
      });
    });
  });

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
});
