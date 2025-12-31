import { describe, expect, test } from 'vitest';
import type { RingType } from '../../types/RingType';
import { getAllTargetsExpanded } from './getAllTargetsExpanded';

describe('getAllTargetsExpanded', () => {
  describe('正常系', () => {
    test('合計82個のターゲットを返す', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      expect(targets).toHaveLength(82);
    });

    test('全てのターゲットが必須プロパティを持つ', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      targets.forEach((target) => {
        expect(target).toHaveProperty('ringType');
        expect(target).toHaveProperty('number');
        expect(target).toHaveProperty('x');
        expect(target).toHaveProperty('y');
        expect(target).toHaveProperty('label');
        expect(target).toHaveProperty('score');
      });
    });
  });

  describe('RingType別のターゲット数検証', () => {
    test('INNER_SINGLEが20個存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerSingles = targets.filter((t) => t.ringType === 'INNER_SINGLE');

      // Assert
      expect(innerSingles).toHaveLength(20);
    });

    test('OUTER_SINGLEが20個存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerSingles = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      // Assert
      expect(outerSingles).toHaveLength(20);
    });

    test('DOUBLEが20個存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const doubles = targets.filter((t) => t.ringType === 'DOUBLE');

      // Assert
      expect(doubles).toHaveLength(20);
    });

    test('TRIPLEが20個存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const triples = targets.filter((t) => t.ringType === 'TRIPLE');

      // Assert
      expect(triples).toHaveLength(20);
    });

    test('INNER_BULLが1個存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerBull = targets.filter((t) => t.ringType === 'INNER_BULL');

      // Assert
      expect(innerBull).toHaveLength(1);
    });

    test('OUTER_BULLが1個存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerBull = targets.filter((t) => t.ringType === 'OUTER_BULL');

      // Assert
      expect(outerBull).toHaveLength(1);
    });

    test('OUTタイプのターゲットは存在しない', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outTargets = targets.filter((t) => t.ringType === 'OUT');

      // Assert
      expect(outTargets).toHaveLength(0);
    });
  });

  describe('ターゲット番号の検証', () => {
    test('INNER_SINGLEの番号が1-20の範囲内', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerSingles = targets.filter((t) => t.ringType === 'INNER_SINGLE');
      const numbers = innerSingles.map((t) => t.number).sort((a, b) => a - b);

      // Assert
      expect(numbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });

    test('OUTER_SINGLEの番号が1-20の範囲内', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerSingles = targets.filter((t) => t.ringType === 'OUTER_SINGLE');
      const numbers = outerSingles.map((t) => t.number).sort((a, b) => a - b);

      // Assert
      expect(numbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });

    test('DOUBLEの番号が1-20の範囲内', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const doubles = targets.filter((t) => t.ringType === 'DOUBLE');
      const numbers = doubles.map((t) => t.number).sort((a, b) => a - b);

      // Assert
      expect(numbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });

    test('TRIPLEの番号が1-20の範囲内', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const triples = targets.filter((t) => t.ringType === 'TRIPLE');
      const numbers = triples.map((t) => t.number).sort((a, b) => a - b);

      // Assert
      expect(numbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });

    test('INNER_BULLの番号は0である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerBull = targets.find((t) => t.ringType === 'INNER_BULL');

      // Assert
      expect(innerBull?.number).toBe(0);
    });

    test('OUTER_BULLの番号は0である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerBull = targets.find((t) => t.ringType === 'OUTER_BULL');

      // Assert
      expect(outerBull?.number).toBe(0);
    });
  });

  describe('座標の検証', () => {
    test('全てのターゲットのX座標が有限数である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      targets.forEach((target) => {
        expect(Number.isFinite(target.x)).toBe(true);
        expect(Number.isNaN(target.x)).toBe(false);
      });
    });

    test('全てのターゲットのY座標が有限数である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      targets.forEach((target) => {
        expect(Number.isFinite(target.y)).toBe(true);
        expect(Number.isNaN(target.y)).toBe(false);
      });
    });

    test('INNER_BULLの座標は原点(0, 0)である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerBull = targets.find((t) => t.ringType === 'INNER_BULL');

      // Assert
      expect(innerBull?.x).toBe(0);
      expect(innerBull?.y).toBe(0);
    });

    test('OUTER_BULLの座標は原点(0, 0)である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerBull = targets.find((t) => t.ringType === 'OUTER_BULL');

      // Assert
      // OUTER_BULLもブルエリアの中心を代表座標とする
      expect(outerBull?.x).toBe(0);
      expect(outerBull?.y).toBe(0);
    });

    test('INNER_SINGLEの座標が適切な半径範囲内（約16-99mm）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerSingles = targets.filter((t) => t.ringType === 'INNER_SINGLE');

      // Assert
      // INNER_SINGLEエリアの中央半径: (16 + 99) / 2 = 57.5mm
      innerSingles.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // 中央半径付近（誤差許容）
        expect(distance).toBeGreaterThan(50);
        expect(distance).toBeLessThan(65);
      });
    });

    test('OUTER_SINGLEの座標が適切な半径範囲内（約107-162mm）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerSingles = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      // Assert
      // OUTER_SINGLEエリアの中央半径: (107 + 162) / 2 = 134.5mm
      outerSingles.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // 中央半径付近（誤差許容）
        expect(distance).toBeGreaterThan(127);
        expect(distance).toBeLessThan(142);
      });
    });

    test('TRIPLEの座標が適切な半径範囲内（約99-107mm）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const triples = targets.filter((t) => t.ringType === 'TRIPLE');

      // Assert
      // TRIPLEリングの中央半径: 103mm
      triples.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // 中央半径付近（誤差許容）
        expect(distance).toBeGreaterThan(102);
        expect(distance).toBeLessThan(104);
      });
    });

    test('DOUBLEの座標が適切な半径範囲内（約162-170mm）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const doubles = targets.filter((t) => t.ringType === 'DOUBLE');

      // Assert
      // DOUBLEリングの中央半径: 166mm
      doubles.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // 中央半径付近（誤差許容）
        expect(distance).toBeGreaterThan(165);
        expect(distance).toBeLessThan(167);
      });
    });
  });

  describe('スコアの検証', () => {
    test('INNER_SINGLEのスコアが正しい（1-20点）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerSingles = targets.filter((t) => t.ringType === 'INNER_SINGLE');

      // Assert
      innerSingles.forEach((target) => {
        expect(target.score).toBe(target.number); // SINGLE = n点
      });
    });

    test('OUTER_SINGLEのスコアが正しい（1-20点）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerSingles = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      // Assert
      outerSingles.forEach((target) => {
        expect(target.score).toBe(target.number); // SINGLE = n点
      });
    });

    test('DOUBLEのスコアが正しい（2-40点、偶数のみ）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const doubles = targets.filter((t) => t.ringType === 'DOUBLE');

      // Assert
      doubles.forEach((target) => {
        expect(target.score).toBe(target.number * 2); // DOUBLE = n*2点
      });
    });

    test('TRIPLEのスコアが正しい（3-60点）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const triples = targets.filter((t) => t.ringType === 'TRIPLE');

      // Assert
      triples.forEach((target) => {
        expect(target.score).toBe(target.number * 3); // TRIPLE = n*3点
      });
    });

    test('INNER_BULLのスコアは50点である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerBull = targets.find((t) => t.ringType === 'INNER_BULL');

      // Assert
      expect(innerBull?.score).toBe(50);
    });

    test('OUTER_BULLのスコアは25点である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerBull = targets.find((t) => t.ringType === 'OUTER_BULL');

      // Assert
      expect(outerBull?.score).toBe(25);
    });

    test('最高得点はT20の60点である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const maxScore = Math.max(...targets.map((t) => t.score));

      // Assert
      expect(maxScore).toBe(60); // T20
    });

    test('最低得点は1点である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const minScore = Math.min(...targets.map((t) => t.score));

      // Assert
      expect(minScore).toBe(1); // S1 (INNER_SINGLE または OUTER_SINGLE)
    });
  });

  describe('ラベルフォーマットの検証', () => {
    test('INNER_SINGLEのラベルが"IS{n}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerSingles = targets.filter((t) => t.ringType === 'INNER_SINGLE');

      // Assert
      innerSingles.forEach((target) => {
        expect(target.label).toMatch(/^IS\d{1,2}$/); // IS1 ~ IS20
        expect(target.label).toBe(`IS${target.number}`);
      });
    });

    test('OUTER_SINGLEのラベルが"OS{n}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerSingles = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      // Assert
      outerSingles.forEach((target) => {
        expect(target.label).toMatch(/^OS\d{1,2}$/); // OS1 ~ OS20
        expect(target.label).toBe(`OS${target.number}`);
      });
    });

    test('DOUBLEのラベルが"D{n}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const doubles = targets.filter((t) => t.ringType === 'DOUBLE');

      // Assert
      doubles.forEach((target) => {
        expect(target.label).toMatch(/^D\d{1,2}$/); // D1 ~ D20
        expect(target.label).toBe(`D${target.number}`);
      });
    });

    test('TRIPLEのラベルが"T{n}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const triples = targets.filter((t) => t.ringType === 'TRIPLE');

      // Assert
      triples.forEach((target) => {
        expect(target.label).toMatch(/^T\d{1,2}$/); // T1 ~ T20
        expect(target.label).toBe(`T${target.number}`);
      });
    });

    test('INNER_BULLのラベルが"BULL"である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const innerBull = targets.find((t) => t.ringType === 'INNER_BULL');

      // Assert
      expect(innerBull?.label).toBe('BULL');
    });

    test('OUTER_BULLのラベルが"25"である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const outerBull = targets.find((t) => t.ringType === 'OUTER_BULL');

      // Assert
      expect(outerBull?.label).toBe('25');
    });
  });

  describe('配列の完全性検証', () => {
    test('全てのRingType（OUT除く）が網羅されている', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const ringTypes = new Set(targets.map((t) => t.ringType));

      // Assert
      const expectedRingTypes: RingType[] = [
        'INNER_SINGLE',
        'OUTER_SINGLE',
        'DOUBLE',
        'TRIPLE',
        'INNER_BULL',
        'OUTER_BULL',
      ];
      expectedRingTypes.forEach((type) => {
        expect(ringTypes.has(type)).toBe(true);
      });
    });

    test('全てのラベルが一意である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const labels = targets.map((t) => t.label);
      const uniqueLabels = new Set(labels);

      // Assert
      expect(uniqueLabels.size).toBe(82); // 82個の一意なラベル
    });

    test('特定のターゲット（T20）が存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const t20 = targets.find((t) => t.ringType === 'TRIPLE' && t.number === 20);

      // Assert
      expect(t20).toBeDefined();
      expect(t20?.label).toBe('T20');
      expect(t20?.score).toBe(60);
    });

    test('特定のターゲット（D16）が存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const d16 = targets.find((t) => t.ringType === 'DOUBLE' && t.number === 16);

      // Assert
      expect(d16).toBeDefined();
      expect(d16?.label).toBe('D16');
      expect(d16?.score).toBe(32);
    });

    test('特定のターゲット（IS1）が存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const is1 = targets.find((t) => t.ringType === 'INNER_SINGLE' && t.number === 1);

      // Assert
      expect(is1).toBeDefined();
      expect(is1?.label).toBe('IS1');
      expect(is1?.score).toBe(1);
    });

    test('特定のターゲット（OS20）が存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const os20 = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === 20);

      // Assert
      expect(os20).toBeDefined();
      expect(os20?.label).toBe('OS20');
      expect(os20?.score).toBe(20);
    });
  });

  describe('エッジケース', () => {
    test('返される配列は新しいインスタンスである（毎回生成される）', () => {
      // Arrange & Act
      const targets1 = getAllTargetsExpanded();
      const targets2 = getAllTargetsExpanded();

      // Assert
      // 配列自体は別インスタンス
      expect(targets1).not.toBe(targets2);
      // 内容は同じ
      expect(targets1).toEqual(targets2);
    });

    test('各ターゲットオブジェクトは独立している', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const firstInnerSingle = targets.find((t) => t.ringType === 'INNER_SINGLE' && t.number === 1);
      const firstOuterSingle = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === 1);

      // Assert
      // 同じ番号でもRingTypeが異なれば別オブジェクト
      expect(firstInnerSingle).not.toBe(firstOuterSingle);
      expect(firstInnerSingle?.score).toBe(1);
      expect(firstOuterSingle?.score).toBe(1);
      expect(firstInnerSingle?.label).not.toBe(firstOuterSingle?.label);
    });
  });

  describe('境界値', () => {
    test('セグメント番号1のターゲットが全てのRingTypeで存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const number1Targets = targets.filter((t) => t.number === 1);

      // Assert
      expect(number1Targets).toHaveLength(4); // IS1, OS1, D1, T1
      const ringTypes = number1Targets.map((t) => t.ringType);
      expect(ringTypes).toContain('INNER_SINGLE');
      expect(ringTypes).toContain('OUTER_SINGLE');
      expect(ringTypes).toContain('DOUBLE');
      expect(ringTypes).toContain('TRIPLE');
    });

    test('セグメント番号20のターゲットが全てのRingTypeで存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const number20Targets = targets.filter((t) => t.number === 20);

      // Assert
      expect(number20Targets).toHaveLength(4); // IS20, OS20, D20, T20
      const ringTypes = number20Targets.map((t) => t.ringType);
      expect(ringTypes).toContain('INNER_SINGLE');
      expect(ringTypes).toContain('OUTER_SINGLE');
      expect(ringTypes).toContain('DOUBLE');
      expect(ringTypes).toContain('TRIPLE');
    });

    test('セグメント番号0のターゲットはBULLのみである', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();
      const number0Targets = targets.filter((t) => t.number === 0);

      // Assert
      expect(number0Targets).toHaveLength(2); // INNER_BULL, OUTER_BULL
      const ringTypes = number0Targets.map((t) => t.ringType);
      expect(ringTypes).toContain('INNER_BULL');
      expect(ringTypes).toContain('OUTER_BULL');
    });
  });
});
