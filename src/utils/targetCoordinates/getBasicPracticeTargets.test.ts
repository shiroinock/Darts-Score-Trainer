import { describe, expect, test } from 'vitest';
import { SEGMENTS } from '../constants/index.js';
import { getBasicPracticeTargets } from './getBasicPracticeTargets.js';

describe('getBasicPracticeTargets', () => {
  describe('正常系', () => {
    test('合計62個のターゲットを返す（OUTER_SINGLE 20 + DOUBLE 20 + TRIPLE 20 + BULL 2）', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      // OUTER_SINGLE 20個 + DOUBLE 20個 + TRIPLE 20個 + INNER_BULL 1個 + OUTER_BULL 1個 = 62個
      expect(targets).toHaveLength(62);
    });

    test('OUTER_SINGLE 1-20を20個含む', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const singleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');
      expect(singleTargets).toHaveLength(20);

      // 全てのセグメント番号（1-20）が含まれることを確認
      const singleNumbers = singleTargets.map((t) => t.number).sort((a, b) => a - b);
      expect(singleNumbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });

    test('DOUBLE 1-20を20個含む', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const doubleTargets = targets.filter((t) => t.ringType === 'DOUBLE');
      expect(doubleTargets).toHaveLength(20);

      // 全てのセグメント番号（1-20）が含まれることを確認
      const doubleNumbers = doubleTargets.map((t) => t.number).sort((a, b) => a - b);
      expect(doubleNumbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });

    test('TRIPLE 1-20を20個含む', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const tripleTargets = targets.filter((t) => t.ringType === 'TRIPLE');
      expect(tripleTargets).toHaveLength(20);

      // 全てのセグメント番号（1-20）が含まれることを確認
      const tripleNumbers = tripleTargets.map((t) => t.number).sort((a, b) => a - b);
      expect(tripleNumbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });

    test('INNER_BULLを1個含む', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const innerBulls = targets.filter((t) => t.ringType === 'INNER_BULL');
      expect(innerBulls).toHaveLength(1);

      const innerBull = innerBulls[0];
      expect(innerBull.label).toBe('BULL');
      expect(innerBull.score).toBe(50);
      expect(innerBull.x).toBe(0);
      expect(innerBull.y).toBe(0);
      expect(innerBull.number).toBe(0);
    });

    test('OUTER_BULLを1個含む', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const outerBulls = targets.filter((t) => t.ringType === 'OUTER_BULL');
      expect(outerBulls).toHaveLength(1);

      const outerBull = outerBulls[0];
      expect(outerBull.label).toBe('25');
      expect(outerBull.score).toBe(25);
      expect(outerBull.x).toBe(0);
      expect(outerBull.y).toBeLessThan(0); // 12時方向（y負方向）
      expect(outerBull.number).toBe(0);
    });
  });

  describe('INNER_SINGLEの除外確認', () => {
    test('INNER_SINGLEが含まれない', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const innerSingleTargets = targets.filter((t) => t.ringType === 'INNER_SINGLE');
      expect(innerSingleTargets).toHaveLength(0);
    });

    test('OUTER_SINGLEタイプのターゲットが20個存在する', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const outerSingleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');
      expect(outerSingleTargets).toHaveLength(20);
    });

    test('OUTER_SINGLEタイプのターゲットが各セグメントに1つずつ存在する', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const outerSingleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');
      const numbers = outerSingleTargets.map((t) => t.number).sort((a, b) => a - b);

      // 1-20の全てのセグメントに対してOUTER_SINGLEが1つずつ存在する
      expect(numbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });

    test('OUTER_SINGLEターゲットのラベルは"OS{number}"形式である', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const outerSingleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      outerSingleTargets.forEach((target) => {
        expect(target.label).toMatch(/^OS\d+$/);
        expect(target.label).toBe(`OS${target.number}`);
      });
    });
  });

  describe('ターゲット構造の検証', () => {
    test('各ターゲットが正しいExpandedTarget型構造である', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      targets.forEach((target) => {
        // 必須プロパティの存在確認
        expect(target).toHaveProperty('ringType');
        expect(target).toHaveProperty('number');
        expect(target).toHaveProperty('x');
        expect(target).toHaveProperty('y');
        expect(target).toHaveProperty('label');
        expect(target).toHaveProperty('score');

        // ringType が有効な値である（INNER_SINGLEは除外）
        expect(['OUTER_SINGLE', 'DOUBLE', 'TRIPLE', 'INNER_BULL', 'OUTER_BULL']).toContain(
          target.ringType
        );

        // number が数値である
        expect(typeof target.number).toBe('number');

        // x, y が数値である
        expect(typeof target.x).toBe('number');
        expect(typeof target.y).toBe('number');

        // label が文字列である
        expect(typeof target.label).toBe('string');
        expect(target.label.length).toBeGreaterThan(0);

        // score が数値である
        expect(typeof target.score).toBe('number');
        expect(target.score).toBeGreaterThanOrEqual(0);
      });
    });

    test('全てのターゲットがユニークである（重複なし）', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const uniqueLabels = new Set(targets.map((t) => t.label));
      expect(uniqueLabels.size).toBe(targets.length);
    });

    test('ターゲットのスコア範囲が正しい', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const scores = targets.map((t) => t.score);

      // 最小スコア: 1点（OS1）
      expect(Math.min(...scores)).toBe(1);

      // 最大スコア: 60点（T20）
      expect(Math.max(...scores)).toBe(60);

      // 全てのスコアが正の整数
      scores.forEach((score) => {
        expect(score).toBeGreaterThan(0);
        expect(Number.isInteger(score)).toBe(true);
      });
    });
  });

  describe('座標の検証', () => {
    test('OUTER_SINGLEターゲットが正しい半径に配置されている', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const outerSingleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      outerSingleTargets.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // SINGLE_OUTER半径（134.5mm）に配置されている
        expect(distance).toBeCloseTo(134.5, 1);
      });
    });

    test('DOUBLEターゲットが正しい半径に配置されている', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const doubleTargets = targets.filter((t) => t.ringType === 'DOUBLE');

      doubleTargets.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // DOUBLE半径（166mm）に配置されている
        expect(distance).toBeCloseTo(166, 1);
      });
    });

    test('TRIPLEターゲットが正しい半径に配置されている', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const tripleTargets = targets.filter((t) => t.ringType === 'TRIPLE');

      tripleTargets.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // TRIPLE半径（103mm）に配置されている
        expect(distance).toBeCloseTo(103, 1);
      });
    });

    test('BULLターゲットが原点に配置されている', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const bullTargets = targets.filter(
        (t) => t.ringType === 'INNER_BULL' || t.ringType === 'OUTER_BULL'
      );

      const innerBull = bullTargets.find((t) => t.ringType === 'INNER_BULL');
      expect(innerBull).toBeDefined();
      expect(innerBull?.x).toBe(0);
      expect(innerBull?.y).toBe(0);

      const outerBull = bullTargets.find((t) => t.ringType === 'OUTER_BULL');
      expect(outerBull).toBeDefined();
      expect(outerBull?.x).toBe(0);
      // y座標は12時方向（負の値）
      expect(outerBull!.y).toBeLessThan(0);
    });
  });

  describe('セグメント配置の検証', () => {
    test('各セグメントのターゲットが正しい角度に配置されている', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const outerSingleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      // セグメント20（12時方向）は真上（θ=0）に配置される
      const segment20 = outerSingleTargets.find((t) => t.number === 20);
      expect(segment20).toBeDefined();
      // x ≈ 0, y < 0（負の値）
      expect(Math.abs(segment20!.x)).toBeLessThan(1);
      expect(segment20!.y).toBeLessThan(0);
    });

    test('全てのセグメント（1-20）に対応するターゲットが存在する', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      SEGMENTS.forEach((segmentNumber) => {
        // OUTER_SINGLE
        const outerSingle = targets.find(
          (t) => t.ringType === 'OUTER_SINGLE' && t.number === segmentNumber
        );
        expect(outerSingle).toBeDefined();

        // DOUBLE
        const double = targets.find((t) => t.ringType === 'DOUBLE' && t.number === segmentNumber);
        expect(double).toBeDefined();

        // TRIPLE
        const triple = targets.find((t) => t.ringType === 'TRIPLE' && t.number === segmentNumber);
        expect(triple).toBeDefined();
      });
    });
  });

  describe('スコア計算の検証', () => {
    test('OUTER_SINGLEのスコアが正しい', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const outerSingleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      outerSingleTargets.forEach((target) => {
        expect(target.score).toBe(target.number);
      });
    });

    test('DOUBLEのスコアが正しい', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const doubleTargets = targets.filter((t) => t.ringType === 'DOUBLE');

      doubleTargets.forEach((target) => {
        expect(target.score).toBe(target.number * 2);
      });
    });

    test('TRIPLEのスコアが正しい', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const tripleTargets = targets.filter((t) => t.ringType === 'TRIPLE');

      tripleTargets.forEach((target) => {
        expect(target.score).toBe(target.number * 3);
      });
    });

    test('BULLのスコアが正しい', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const innerBull = targets.find((t) => t.ringType === 'INNER_BULL');
      expect(innerBull?.score).toBe(50);

      const outerBull = targets.find((t) => t.ringType === 'OUTER_BULL');
      expect(outerBull?.score).toBe(25);
    });
  });

  describe('ダーツボード仕様への準拠', () => {
    test('最高スコアターゲット（T20: 60点）が存在する', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const maxScoreTarget = targets.reduce((max, current) =>
        current.score > max.score ? current : max
      );

      expect(maxScoreTarget.score).toBe(60);
      expect(maxScoreTarget.ringType).toBe('TRIPLE');
      expect(maxScoreTarget.number).toBe(20);
      expect(maxScoreTarget.label).toBe('T20');
    });

    test('最低スコアターゲット（OS1: 1点）が存在する', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      // BULLを除く最低スコア
      const minScoreTarget = targets
        .filter((t) => t.ringType !== 'INNER_BULL' && t.ringType !== 'OUTER_BULL')
        .reduce((min, current) => (current.score < min.score ? current : min));

      expect(minScoreTarget.score).toBe(1);
      expect(minScoreTarget.ringType).toBe('OUTER_SINGLE');
      expect(minScoreTarget.number).toBe(1);
      expect(minScoreTarget.label).toBe('OS1');
    });
  });

  describe('RingType型の整合性', () => {
    test('OUTER_SINGLEがRingType型として使用されている', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const singleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      singleTargets.forEach((target) => {
        // ringTypeが'OUTER_SINGLE'であることを確認
        expect(target.ringType).toBe('OUTER_SINGLE');
      });
    });

    test('有効なRingTypeのみが使用されている', () => {
      // Arrange & Act
      const targets = getBasicPracticeTargets();

      // Assert
      const validRingTypes = ['OUTER_SINGLE', 'DOUBLE', 'TRIPLE', 'INNER_BULL', 'OUTER_BULL'];
      const usedRingTypes = new Set(targets.map((t) => t.ringType));

      usedRingTypes.forEach((ringType) => {
        expect(validRingTypes).toContain(ringType);
      });

      // INNER_SINGLEが使用されていないことを確認
      expect(usedRingTypes.has('INNER_SINGLE')).toBe(false);
      // OUTER_SINGLEが使用されていることを確認
      expect(usedRingTypes.has('OUTER_SINGLE')).toBe(true);
    });
  });
});
