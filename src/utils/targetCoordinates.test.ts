import { describe, test, expect } from 'vitest';
import { getAllTargets } from './targetCoordinates';
import type { Target } from '../types';

describe('getAllTargets', () => {
  describe('正常系', () => {
    test('合計61個のターゲットを返す', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      expect(targets).toHaveLength(61);
    });

    test('SINGLE 1-20を20個含む', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const singleTargets = targets.filter((t) => t.type === 'SINGLE');
      expect(singleTargets).toHaveLength(20);

      // 全てのセグメント番号（1-20）が含まれることを確認
      const singleNumbers = singleTargets.map((t) => t.number).sort((a, b) => a! - b!);
      expect(singleNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    });

    test('DOUBLE 1-20を20個含む', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const doubleTargets = targets.filter((t) => t.type === 'DOUBLE');
      expect(doubleTargets).toHaveLength(20);

      // 全てのセグメント番号（1-20）が含まれることを確認
      const doubleNumbers = doubleTargets.map((t) => t.number).sort((a, b) => a! - b!);
      expect(doubleNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    });

    test('TRIPLE 1-20を20個含む', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const tripleTargets = targets.filter((t) => t.type === 'TRIPLE');
      expect(tripleTargets).toHaveLength(20);

      // 全てのセグメント番号（1-20）が含まれることを確認
      const tripleNumbers = tripleTargets.map((t) => t.number).sort((a, b) => a! - b!);
      expect(tripleNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    });

    test('BULLを1個含む', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const bullTargets = targets.filter((t) => t.type === 'BULL');
      expect(bullTargets).toHaveLength(1);
    });
  });

  describe('ターゲット構造の検証', () => {
    test('各ターゲットが正しいTarget型構造である', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      targets.forEach((target) => {
        // type プロパティが存在し、TargetType型である
        expect(target.type).toBeDefined();
        expect(['SINGLE', 'DOUBLE', 'TRIPLE', 'BULL']).toContain(target.type);

        // number プロパティが存在する
        expect(target).toHaveProperty('number');

        // BULL以外はnumberが1-20の整数
        if (target.type !== 'BULL') {
          expect(target.number).toBeGreaterThanOrEqual(1);
          expect(target.number).toBeLessThanOrEqual(20);
          expect(Number.isInteger(target.number)).toBe(true);
        } else {
          // BULLはnumberがnull
          expect(target.number).toBeNull();
        }

        // label プロパティが存在し、文字列である
        expect(target.label).toBeDefined();
        expect(typeof target.label).toBe('string');
      });
    });

    test('全ターゲットが一意なlabelを持つ', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const labels = targets.map((t) => t.label);
      const uniqueLabels = new Set(labels);

      expect(uniqueLabels.size).toBe(targets.length);
    });
  });

  describe('特定のターゲットの存在確認', () => {
    test('S20（シングル20）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const s20 = targets.find((t) => t.type === 'SINGLE' && t.number === 20);
      expect(s20).toBeDefined();
      expect(s20?.label).toBe('S20');
    });

    test('D16（ダブル16）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const d16 = targets.find((t) => t.type === 'DOUBLE' && t.number === 16);
      expect(d16).toBeDefined();
      expect(d16?.label).toBe('D16');
    });

    test('T19（トリプル19）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const t19 = targets.find((t) => t.type === 'TRIPLE' && t.number === 19);
      expect(t19).toBeDefined();
      expect(t19?.label).toBe('T19');
    });

    test('BULL（ブル）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const bull = targets.find((t) => t.type === 'BULL');
      expect(bull).toBeDefined();
      expect(bull?.label).toBe('BULL');
      expect(bull?.number).toBeNull();
    });

    test('S1（シングル1）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const s1 = targets.find((t) => t.type === 'SINGLE' && t.number === 1);
      expect(s1).toBeDefined();
      expect(s1?.label).toBe('S1');
    });

    test('D20（ダブル20）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const d20 = targets.find((t) => t.type === 'DOUBLE' && t.number === 20);
      expect(d20).toBeDefined();
      expect(d20?.label).toBe('D20');
    });

    test('T20（トリプル20）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const t20 = targets.find((t) => t.type === 'TRIPLE' && t.number === 20);
      expect(t20).toBeDefined();
      expect(t20?.label).toBe('T20');
    });
  });

  describe('ラベルフォーマットの検証', () => {
    test('SINGLEのラベルは"S{number}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const singleTargets = targets.filter((t) => t.type === 'SINGLE');
      singleTargets.forEach((target) => {
        expect(target.label).toMatch(/^S\d{1,2}$/);
        expect(target.label).toBe(`S${target.number}`);
      });
    });

    test('DOUBLEのラベルは"D{number}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const doubleTargets = targets.filter((t) => t.type === 'DOUBLE');
      doubleTargets.forEach((target) => {
        expect(target.label).toMatch(/^D\d{1,2}$/);
        expect(target.label).toBe(`D${target.number}`);
      });
    });

    test('TRIPLEのラベルは"T{number}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const tripleTargets = targets.filter((t) => t.type === 'TRIPLE');
      tripleTargets.forEach((target) => {
        expect(target.label).toMatch(/^T\d{1,2}$/);
        expect(target.label).toBe(`T${target.number}`);
      });
    });

    test('BULLのラベルは"BULL"である', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const bullTarget = targets.find((t) => t.type === 'BULL');
      expect(bullTarget?.label).toBe('BULL');
    });
  });

  describe('エッジケースと境界値', () => {
    test('最小セグメント番号（1）のターゲットが全タイプに存在する', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const s1 = targets.find((t) => t.type === 'SINGLE' && t.number === 1);
      const d1 = targets.find((t) => t.type === 'DOUBLE' && t.number === 1);
      const t1 = targets.find((t) => t.type === 'TRIPLE' && t.number === 1);

      expect(s1).toBeDefined();
      expect(d1).toBeDefined();
      expect(t1).toBeDefined();
    });

    test('最大セグメント番号（20）のターゲットが全タイプに存在する', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const s20 = targets.find((t) => t.type === 'SINGLE' && t.number === 20);
      const d20 = targets.find((t) => t.type === 'DOUBLE' && t.number === 20);
      const t20 = targets.find((t) => t.type === 'TRIPLE' && t.number === 20);

      expect(s20).toBeDefined();
      expect(d20).toBeDefined();
      expect(t20).toBeDefined();
    });

    test('中間セグメント番号（10）のターゲットが全タイプに存在する', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const s10 = targets.find((t) => t.type === 'SINGLE' && t.number === 10);
      const d10 = targets.find((t) => t.type === 'DOUBLE' && t.number === 10);
      const t10 = targets.find((t) => t.type === 'TRIPLE' && t.number === 10);

      expect(s10).toBeDefined();
      expect(d10).toBeDefined();
      expect(t10).toBeDefined();
    });
  });

  describe('配列の完全性', () => {
    test('ターゲット配列が空でない', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      expect(targets.length).toBeGreaterThan(0);
    });

    test('ターゲット配列に重複がない（type + number の組み合わせ）', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      const combinations = targets.map((t) => `${t.type}-${t.number}`);
      const uniqueCombinations = new Set(combinations);

      expect(uniqueCombinations.size).toBe(targets.length);
    });

    test('全てのターゲットがTarget型に適合する', () => {
      // Arrange & Act
      const targets = getAllTargets();

      // Assert
      targets.forEach((target) => {
        // 型としての適合性を検証
        const validatedTarget: Target = target;
        expect(validatedTarget).toBe(target);
      });
    });
  });
});
