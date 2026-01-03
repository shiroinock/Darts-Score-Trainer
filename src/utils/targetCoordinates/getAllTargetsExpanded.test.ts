import { describe, expect, test } from 'vitest';
import type { RingType } from '../../types/RingType.js';
import { SEGMENTS } from '../constants/index.js';
import type { ExpandedTarget } from './getAllTargetsExpanded.js';
import { getAllTargetsExpanded } from './getAllTargetsExpanded.js';

describe('getAllTargetsExpanded', () => {
  describe('正常系', () => {
    test('合計62個のターゲットを返す（OUTER_SINGLE 20 + DOUBLE 20 + TRIPLE 20 + BULL 2）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      // OUTER_SINGLE 20個 + DOUBLE 20個 + TRIPLE 20個 + INNER_BULL 1個 + OUTER_BULL 1個 = 62個
      expect(targets).toHaveLength(62);
    });

    test('OUTER_SINGLE 1-20を20個含む', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

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
      const targets = getAllTargetsExpanded();

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
      const targets = getAllTargetsExpanded();

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
      const targets = getAllTargetsExpanded();

      // Assert
      const innerBullTargets = targets.filter((t) => t.ringType === 'INNER_BULL');
      expect(innerBullTargets).toHaveLength(1);

      // INNER_BULLは原点（0,0）に配置
      const innerBull = innerBullTargets[0];
      expect(innerBull.x).toBe(0);
      expect(innerBull.y).toBe(0);
      expect(innerBull.label).toBe('BULL');
      expect(innerBull.score).toBe(50);
      expect(innerBull.number).toBe(0);
    });

    test('OUTER_BULLを1個含む', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const outerBullTargets = targets.filter((t) => t.ringType === 'OUTER_BULL');
      expect(outerBullTargets).toHaveLength(1);

      // OUTER_BULLの座標とラベルを検証
      const outerBull = outerBullTargets[0];
      expect(outerBull.x).toBe(0);
      expect(outerBull.y).toBeLessThan(0); // Y軸負方向（12時方向）
      expect(outerBull.label).toBe('25');
      expect(outerBull.score).toBe(25);
      expect(outerBull.number).toBe(0);
    });
  });

  describe('INNER_SINGLEの削除確認', () => {
    test('INNER_SINGLEタイプのターゲットが存在しない', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      // INNER_SINGLEは型定義から削除されているが、実行時に存在しないことを確認
      const innerSingleTargets = targets.filter((t) => (t.ringType as string) === 'INNER_SINGLE');
      expect(innerSingleTargets).toHaveLength(0);
    });

    test('OUTER_SINGLEタイプのターゲットが20個存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const outerSingleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');
      expect(outerSingleTargets).toHaveLength(20);
    });

    test('OUTER_SINGLEタイプのターゲットが各セグメントに1つずつ存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const singleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      // 各セグメント番号に対して、OUTER_SINGLEは1つだけ存在することを確認
      for (let number = 1; number <= 20; number++) {
        const singlesForNumber = singleTargets.filter((t) => t.number === number);
        expect(singlesForNumber).toHaveLength(1);
      }
    });

    test('OUTER_SINGLEターゲットのラベルは"OS{number}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const singleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');
      singleTargets.forEach((target) => {
        expect(target.label).toMatch(/^OS\d{1,2}$/);
        expect(target.label).toBe(`OS${target.number}`);
      });
    });
  });

  describe('ターゲット構造の検証', () => {
    test('各ターゲットが正しいExpandedTarget型構造である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      targets.forEach((target) => {
        // 必須プロパティの存在確認
        expect(target).toHaveProperty('ringType');
        expect(target).toHaveProperty('number');
        expect(target).toHaveProperty('x');
        expect(target).toHaveProperty('y');
        expect(target).toHaveProperty('label');
        expect(target).toHaveProperty('score');

        // ringType が有効な値である
        expect(['OUTER_SINGLE', 'DOUBLE', 'TRIPLE', 'INNER_BULL', 'OUTER_BULL']).toContain(
          target.ringType
        );

        // number が数値である
        expect(typeof target.number).toBe('number');

        // x, y が数値である（物理座標、mm単位）
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

    test('全ターゲットが一意なlabelを持つ', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const labels = targets.map((t) => t.label);
      const uniqueLabels = new Set(labels);

      expect(uniqueLabels.size).toBe(targets.length);
    });

    test('OUTER_SINGLE、DOUBLE、TRIPLEのnumberは1-20の範囲内である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const numberedTargets = targets.filter(
        (t) => t.ringType === 'OUTER_SINGLE' || t.ringType === 'DOUBLE' || t.ringType === 'TRIPLE'
      );

      numberedTargets.forEach((target) => {
        expect(target.number).toBeGreaterThanOrEqual(1);
        expect(target.number).toBeLessThanOrEqual(20);
        expect(Number.isInteger(target.number)).toBe(true);
      });
    });

    test('BULLタイプのnumberは0である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const bullTargets = targets.filter(
        (t) => t.ringType === 'INNER_BULL' || t.ringType === 'OUTER_BULL'
      );

      bullTargets.forEach((target) => {
        expect(target.number).toBe(0);
      });
    });
  });

  describe('特定のターゲットの存在確認', () => {
    test('OS20（シングル20）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const s20 = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === 20);
      expect(s20).toBeDefined();
      expect(s20?.label).toBe('OS20');
      expect(s20?.score).toBe(20);
    });

    test('D16（ダブル16）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const d16 = targets.find((t) => t.ringType === 'DOUBLE' && t.number === 16);
      expect(d16).toBeDefined();
      expect(d16?.label).toBe('D16');
      expect(d16?.score).toBe(32); // 16 * 2
    });

    test('T19（トリプル19）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const t19 = targets.find((t) => t.ringType === 'TRIPLE' && t.number === 19);
      expect(t19).toBeDefined();
      expect(t19?.label).toBe('T19');
      expect(t19?.score).toBe(57); // 19 * 3
    });

    test('T20（トリプル20）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const t20 = targets.find((t) => t.ringType === 'TRIPLE' && t.number === 20);
      expect(t20).toBeDefined();
      expect(t20?.label).toBe('T20');
      expect(t20?.score).toBe(60); // 20 * 3
    });

    test('INNER_BULL（ブル50点）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const innerBull = targets.find((t) => t.ringType === 'INNER_BULL');
      expect(innerBull).toBeDefined();
      expect(innerBull?.label).toBe('BULL');
      expect(innerBull?.number).toBe(0);
      expect(innerBull?.score).toBe(50);
    });

    test('OUTER_BULL（25点）が含まれる', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const outerBull = targets.find((t) => t.ringType === 'OUTER_BULL');
      expect(outerBull).toBeDefined();
      expect(outerBull?.label).toBe('25');
      expect(outerBull?.number).toBe(0);
      expect(outerBull?.score).toBe(25);
    });
  });

  describe('ラベルフォーマットの検証', () => {
    test('OUTER_SINGLEのラベルは"OS{number}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const singleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');
      singleTargets.forEach((target) => {
        expect(target.label).toMatch(/^OS\d{1,2}$/);
        expect(target.label).toBe(`OS${target.number}`);
      });
    });

    test('DOUBLEのラベルは"D{number}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const doubleTargets = targets.filter((t) => t.ringType === 'DOUBLE');
      doubleTargets.forEach((target) => {
        expect(target.label).toMatch(/^D\d{1,2}$/);
        expect(target.label).toBe(`D${target.number}`);
      });
    });

    test('TRIPLEのラベルは"T{number}"形式である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const tripleTargets = targets.filter((t) => t.ringType === 'TRIPLE');
      tripleTargets.forEach((target) => {
        expect(target.label).toMatch(/^T\d{1,2}$/);
        expect(target.label).toBe(`T${target.number}`);
      });
    });

    test('INNER_BULLのラベルは"BULL"である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const innerBullTarget = targets.find((t) => t.ringType === 'INNER_BULL');
      expect(innerBullTarget?.label).toBe('BULL');
    });

    test('OUTER_BULLのラベルは"25"である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const outerBullTarget = targets.find((t) => t.ringType === 'OUTER_BULL');
      expect(outerBullTarget?.label).toBe('25');
    });
  });

  describe('スコア計算の検証', () => {
    test('OUTER_SINGLEのスコアは番号と同じである', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const singleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');
      singleTargets.forEach((target) => {
        expect(target.score).toBe(target.number);
      });
    });

    test('DOUBLEのスコアは番号の2倍である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const doubleTargets = targets.filter((t) => t.ringType === 'DOUBLE');
      doubleTargets.forEach((target) => {
        expect(target.score).toBe(target.number * 2);
      });
    });

    test('TRIPLEのスコアは番号の3倍である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const tripleTargets = targets.filter((t) => t.ringType === 'TRIPLE');
      tripleTargets.forEach((target) => {
        expect(target.score).toBe(target.number * 3);
      });
    });

    test('INNER_BULLのスコアは50点である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const innerBull = targets.find((t) => t.ringType === 'INNER_BULL');
      expect(innerBull?.score).toBe(50);
    });

    test('OUTER_BULLのスコアは25点である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const outerBull = targets.find((t) => t.ringType === 'OUTER_BULL');
      expect(outerBull?.score).toBe(25);
    });
  });

  describe('座標の物理的正確性', () => {
    test('INNER_BULLは原点（0,0）に配置される', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const innerBull = targets.find((t) => t.ringType === 'INNER_BULL');
      expect(innerBull?.x).toBe(0);
      expect(innerBull?.y).toBe(0);
    });

    test('OUTER_BULLはY軸負方向（12時方向）に配置される', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const outerBull = targets.find((t) => t.ringType === 'OUTER_BULL');
      expect(outerBull?.x).toBe(0);
      expect(outerBull?.y).toBeLessThan(0);
    });

    test('全ターゲットの座標が有限数である', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      targets.forEach((target) => {
        expect(Number.isFinite(target.x)).toBe(true);
        expect(Number.isFinite(target.y)).toBe(true);
      });
    });

    test('セグメントターゲット（OUTER_SINGLE、DOUBLE、TRIPLE）の座標が非ゼロである', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const segmentTargets = targets.filter(
        (t) => t.ringType === 'OUTER_SINGLE' || t.ringType === 'DOUBLE' || t.ringType === 'TRIPLE'
      );

      segmentTargets.forEach((target) => {
        // セグメントターゲットは原点以外に配置されるため、xまたはyが非ゼロ
        const distanceFromOrigin = Math.sqrt(target.x ** 2 + target.y ** 2);
        expect(distanceFromOrigin).toBeGreaterThan(0);
      });
    });

    test('OUTER_SINGLEの座標が適切な半径範囲内（127-142mm、中央134.5mm）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const singleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      // OUTER_SINGLEの半径範囲（127-142mm、中央134.5mm）
      singleTargets.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // OUTER_SINGLE範囲（127-142mm）
        expect(distance).toBeGreaterThan(127);
        expect(distance).toBeLessThan(142);
      });
    });

    test('TRIPLEの座標が適切な半径範囲内（99-107mm、中央103mm）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const tripleTargets = targets.filter((t) => t.ringType === 'TRIPLE');

      tripleTargets.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // 中央半径付近（誤差許容）
        expect(distance).toBeGreaterThan(102);
        expect(distance).toBeLessThan(104);
      });
    });

    test('DOUBLEの座標が適切な半径範囲内（162-170mm、中央166mm）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const doubleTargets = targets.filter((t) => t.ringType === 'DOUBLE');

      doubleTargets.forEach((target) => {
        const distance = Math.sqrt(target.x ** 2 + target.y ** 2);
        // 中央半径付近（誤差許容）
        expect(distance).toBeGreaterThan(165);
        expect(distance).toBeLessThan(167);
      });
    });
  });

  describe('セグメント順序の正確性', () => {
    test('各リングタイプでセグメント番号1-20が全て含まれる', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const ringTypes = ['OUTER_SINGLE', 'DOUBLE', 'TRIPLE'] as const;

      ringTypes.forEach((ringType) => {
        const targetsForRing = targets.filter((t) => t.ringType === ringType);
        const numbers = targetsForRing.map((t) => t.number).sort((a, b) => a - b);

        // 1-20のすべての番号が含まれることを確認
        expect(numbers).toEqual([
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        ]);
      });
    });

    test('セグメント配置順序が仕様に準拠する（真上20から時計回り）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      // セグメント20が真上（Y軸負方向、X=0付近）に配置されることを確認
      const single20 = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === 20);
      expect(single20).toBeDefined();

      // 真上なのでX座標はほぼ0（浮動小数点誤差許容）
      expect(Math.abs(single20!.x)).toBeLessThan(1);
      // Y座標は負（上方向）
      expect(single20!.y).toBeLessThan(0);
    });

    test('各セグメント番号に対して、OUTER_SINGLE、DOUBLE、TRIPLEが全て存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      for (let number = 1; number <= 20; number++) {
        const single = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === number);
        const double = targets.find((t) => t.ringType === 'DOUBLE' && t.number === number);
        const triple = targets.find((t) => t.ringType === 'TRIPLE' && t.number === number);

        expect(single).toBeDefined();
        expect(double).toBeDefined();
        expect(triple).toBeDefined();
      }
    });
  });

  describe('エッジケースと境界値', () => {
    test('最小セグメント番号（1）のターゲットが全タイプに存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const s1 = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === 1);
      const d1 = targets.find((t) => t.ringType === 'DOUBLE' && t.number === 1);
      const t1 = targets.find((t) => t.ringType === 'TRIPLE' && t.number === 1);

      expect(s1).toBeDefined();
      expect(d1).toBeDefined();
      expect(t1).toBeDefined();

      expect(s1?.label).toBe('OS1');
      expect(d1?.label).toBe('D1');
      expect(t1?.label).toBe('T1');
    });

    test('最大セグメント番号（20）のターゲットが全タイプに存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const s20 = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === 20);
      const d20 = targets.find((t) => t.ringType === 'DOUBLE' && t.number === 20);
      const t20 = targets.find((t) => t.ringType === 'TRIPLE' && t.number === 20);

      expect(s20).toBeDefined();
      expect(d20).toBeDefined();
      expect(t20).toBeDefined();

      expect(s20?.label).toBe('OS20');
      expect(d20?.label).toBe('D20');
      expect(t20?.label).toBe('T20');
    });

    test('中間セグメント番号（10）のターゲットが全タイプに存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const s10 = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === 10);
      const d10 = targets.find((t) => t.ringType === 'DOUBLE' && t.number === 10);
      const t10 = targets.find((t) => t.ringType === 'TRIPLE' && t.number === 10);

      expect(s10).toBeDefined();
      expect(d10).toBeDefined();
      expect(t10).toBeDefined();

      expect(s10?.label).toBe('OS10');
      expect(d10?.label).toBe('D10');
      expect(t10?.label).toBe('T10');
    });

    test('高スコアセグメント（20, 19, 18）のターゲットが全て存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const highScoreNumbers = [20, 19, 18];

      highScoreNumbers.forEach((number) => {
        const single = targets.find((t) => t.ringType === 'OUTER_SINGLE' && t.number === number);
        const double = targets.find((t) => t.ringType === 'DOUBLE' && t.number === number);
        const triple = targets.find((t) => t.ringType === 'TRIPLE' && t.number === number);

        expect(single).toBeDefined();
        expect(double).toBeDefined();
        expect(triple).toBeDefined();
      });
    });
  });

  describe('配列の完全性', () => {
    test('ターゲット配列が空でない', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      expect(targets.length).toBeGreaterThan(0);
    });

    test('ターゲット配列に重複がない（ringType + number の組み合わせ）', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const combinations = targets.map((t) => `${t.ringType}-${t.number}`);
      const uniqueCombinations = new Set(combinations);

      expect(uniqueCombinations.size).toBe(targets.length);
    });

    test('全てのターゲットがExpandedTarget型に適合する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      targets.forEach((target) => {
        // 型としての適合性を検証
        const validatedTarget: ExpandedTarget = target;
        expect(validatedTarget).toBe(target);
      });
    });

    test('ターゲット配列の順序が一貫している', () => {
      // Arrange & Act
      const targets1 = getAllTargetsExpanded();
      const targets2 = getAllTargetsExpanded();

      // Assert
      // 複数回呼び出しても同じ順序でターゲットが返される
      expect(targets1.length).toBe(targets2.length);

      for (let i = 0; i < targets1.length; i++) {
        expect(targets1[i].ringType).toBe(targets2[i].ringType);
        expect(targets1[i].number).toBe(targets2[i].number);
        expect(targets1[i].label).toBe(targets2[i].label);
        expect(targets1[i].x).toBe(targets2[i].x);
        expect(targets1[i].y).toBe(targets2[i].y);
        expect(targets1[i].score).toBe(targets2[i].score);
      }
    });
  });

  describe('ダーツボード仕様への準拠', () => {
    test('SEGMENTSで定義された全20セグメントがカバーされている', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      SEGMENTS.forEach((segmentNumber) => {
        // 各セグメント番号に対して、OUTER_SINGLE、DOUBLE、TRIPLEが存在する
        const single = targets.find(
          (t) => t.ringType === 'OUTER_SINGLE' && t.number === segmentNumber
        );
        const double = targets.find((t) => t.ringType === 'DOUBLE' && t.number === segmentNumber);
        const triple = targets.find((t) => t.ringType === 'TRIPLE' && t.number === segmentNumber);

        expect(single).toBeDefined();
        expect(double).toBeDefined();
        expect(triple).toBeDefined();
      });
    });

    test('ダーツボード上の全有効エリアがターゲットとして定義されている', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      // SINGLE 20個 + DOUBLE 20個 + TRIPLE 20個 + INNER_BULL 1個 + OUTER_BULL 1個
      // = 合計62個のターゲット
      const singleCount = targets.filter((t) => t.ringType === 'OUTER_SINGLE').length;
      const doubleCount = targets.filter((t) => t.ringType === 'DOUBLE').length;
      const tripleCount = targets.filter((t) => t.ringType === 'TRIPLE').length;
      const innerBullCount = targets.filter((t) => t.ringType === 'INNER_BULL').length;
      const outerBullCount = targets.filter((t) => t.ringType === 'OUTER_BULL').length;

      expect(singleCount).toBe(20);
      expect(doubleCount).toBe(20);
      expect(tripleCount).toBe(20);
      expect(innerBullCount).toBe(1);
      expect(outerBullCount).toBe(1);

      expect(singleCount + doubleCount + tripleCount + innerBullCount + outerBullCount).toBe(62);
    });

    test('最高スコアターゲット（T20: 60点）が存在する', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

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
      const targets = getAllTargetsExpanded();

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
      const targets = getAllTargetsExpanded();

      // Assert
      const singleTargets = targets.filter((t) => t.ringType === 'OUTER_SINGLE');

      singleTargets.forEach((target) => {
        // ringTypeが'OUTER_SINGLE'であり、'INNER_SINGLE'ではないことを確認
        expect(target.ringType).toBe('OUTER_SINGLE');
        expect(target.ringType).not.toBe('INNER_SINGLE');
      });
    });

    test('有効なRingTypeのみが使用されている', () => {
      // Arrange & Act
      const targets = getAllTargetsExpanded();

      // Assert
      const validRingTypes = ['OUTER_SINGLE', 'DOUBLE', 'TRIPLE', 'INNER_BULL', 'OUTER_BULL'];
      const usedRingTypes = new Set(targets.map((t) => t.ringType));

      usedRingTypes.forEach((ringType) => {
        expect(validRingTypes).toContain(ringType);
      });

      // INNER_SINGLEが使用されていないことを確認
      expect(usedRingTypes.has('INNER_SINGLE' as RingType)).toBe(false);
      // OUTER_SINGLEが使用されていることを確認
      expect(usedRingTypes.has('OUTER_SINGLE')).toBe(true);
    });
  });
});
