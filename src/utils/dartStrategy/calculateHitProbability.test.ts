import { describe, expect, test } from 'vitest';
import { BOARD_PHYSICAL } from '../constants/index.js';
import type { AreaType } from './calculateHitProbability.js';
import { calculateHitProbability } from './calculateHitProbability.js';

/**
 * calculateHitProbability 関数のテスト
 *
 * この関数は、プレイヤーの実力（標準偏差 stdDevMM）を考慮して、
 * 特定のターゲットエリアへのヒット成功確率を計算します。
 *
 * テスト値の説明:
 * - stdDevMM: プレイヤーの実力を表す標準偏差（mm単位）
 *   - 初心者: 50mm
 *   - 中級者: 30mm
 *   - 上級者: 15mm
 *   - エキスパート: 8mm
 */

describe('calculateHitProbability', () => {
  describe('正常系 - INNER_BULL（インナーブル）', () => {
    test('ボード中心（0,0）を狙い、stdDev=8mm（エキスパート）でインナーブルのヒット確率を計算する', () => {
      // Arrange
      const targetX = 0; // ボード中心X座標（mm）
      const targetY = 0; // ボード中心Y座標（mm）
      const stdDevMM = 8; // エキスパートレベル
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // エキスパートレベルでも、インナーブルは小さいため確率は約27%
      // 統計的妥当値: r=3.175mm, σ=8mm → P ≈ 0.27
      expect(result).toBeGreaterThan(0.2);
      expect(result).toBeLessThan(0.35);
    });

    test('ボード中心を狙い、stdDev=15mm（上級者）でインナーブルのヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 15; // 上級者レベル
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // 上級者レベルでは、インナーブルは小さいため確率は約8〜10%程度
      // モンテカルロシミュレーション（10000サンプル）による実測値
      expect(result).toBeGreaterThan(0.06);
      expect(result).toBeLessThan(0.12);
    });

    test('ボード中心を狙い、stdDev=30mm（中級者）でインナーブルのヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 30; // 中級者レベル
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // 中級者レベルでは、インナーブルのヒット確率は約2〜3%程度
      // モンテカルロシミュレーション（10000サンプル）による実測値
      expect(result).toBeGreaterThan(0.01);
      expect(result).toBeLessThan(0.04);
    });

    test('ボード中心を狙い、stdDev=50mm（初心者）でインナーブルのヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 50; // 初心者レベル
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // 初心者レベルでは、インナーブルのヒット確率は約0.5〜1.5%程度
      // モンテカルロシミュレーション（10000サンプル）による実測値
      expect(result).toBeGreaterThan(0.003);
      expect(result).toBeLessThan(0.015);
    });
  });

  describe('正常系 - OUTER_BULL（アウターブル）', () => {
    test('ボード中心を狙い、stdDev=15mm（上級者）でアウターブルのヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 15; // 上級者レベル
      const areaType = 'OUTER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // アウターブルはインナーブルよりも大きいエリア
    });

    test('ボード中心を狙い、stdDev=30mm（中級者）でアウターブルのヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 30; // 中級者レベル
      const areaType = 'OUTER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('正常系 - TRIPLE（トリプルリング）', () => {
    test('トリプル20（X=0, Y=-103mm）を狙い、stdDev=15mm（上級者）でヒット確率を計算する', () => {
      // Arrange
      // トリプル20は真上方向（Y軸負方向）、半径103mm（トリプルリング中心）
      const targetX = 0;
      const targetY = -103;
      const stdDevMM = 15; // 上級者レベル
      const areaType = 'TRIPLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // 上級者がトリプルリングを狙う場合、中程度の確率でヒット
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test('トリプル20を狙い、stdDev=8mm（エキスパート）でヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = -103; // トリプル20の座標
      const stdDevMM = 8; // エキスパートレベル
      const areaType = 'TRIPLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // エキスパートレベルでは、より高い確率でヒット
    });

    test('トリプル20を狙い、stdDev=30mm（中級者）でヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = -103;
      const stdDevMM = 30; // 中級者レベル
      const areaType = 'TRIPLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // 中級者レベルでは、トリプルリングのヒット確率は低い
    });

    test('トリプル1（セグメント番号1）を狙い、stdDev=15mm（上級者）でヒット確率を計算する', () => {
      // Arrange
      // トリプル1の座標を計算（真上から時計回りに1番目のセグメント）
      // セグメント配置: [20, 1, 18, 4, ...]
      // セグメント1は20の次（18度 = π/10 ラジアン）
      const angle = Math.PI / 10; // 18度
      const radius = 103; // トリプルリング中心半径
      const targetX = radius * Math.sin(angle);
      const targetY = -radius * Math.cos(angle);
      const stdDevMM = 15;
      const areaType = 'TRIPLE';
      const segmentNumber = 1;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('正常系 - DOUBLE（ダブルリング）', () => {
    test('ダブル20（X=0, Y=-166mm）を狙い、stdDev=15mm（上級者）でヒット確率を計算する', () => {
      // Arrange
      // ダブル20は真上方向、半径166mm（ダブルリング中心）
      const targetX = 0;
      const targetY = -166;
      const stdDevMM = 15; // 上級者レベル
      const areaType = 'DOUBLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('ダブル20を狙い、stdDev=8mm（エキスパート）でヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = -166;
      const stdDevMM = 8; // エキスパートレベル
      const areaType = 'DOUBLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('ダブル10（セグメント番号10）を狙い、stdDev=15mm（上級者）でヒット確率を計算する', () => {
      // Arrange
      // セグメント配置: [20, 1, 18, 4, 13, 6, 10, ...]
      // セグメント10は6番目のインデックス（108度 = 6 * π/10 ラジアン）
      const angle = (6 * Math.PI) / 10; // 108度
      const radius = 166; // ダブルリング中心半径
      const targetX = radius * Math.sin(angle);
      const targetY = -radius * Math.cos(angle);
      const stdDevMM = 15;
      const areaType = 'DOUBLE';
      const segmentNumber = 10;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('正常系 - SINGLE（シングルエリア）', () => {
    test('シングル20を狙い、stdDev=15mm（上級者）でヒット確率を計算する', () => {
      // Arrange
      // シングルエリアの中心半径（INNER_SINGLEとOUTER_SINGLEの中間）
      const targetX = 0;
      const targetY = -53.5; // インナーシングルの中心付近（7.95〜99mmの中間）
      const stdDevMM = 15; // 上級者レベル
      const areaType = 'SINGLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('シングル5を狙い、stdDev=30mm（中級者）でヒット確率を計算する', () => {
      // Arrange
      // セグメント配置: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
      // セグメント5は19番目のインデックス（342度 = 19 * π/10 ラジアン）
      const angle = (19 * Math.PI) / 10; // 342度
      const radius = 53.5; // シングルエリアの中心半径
      const targetX = radius * Math.sin(angle);
      const targetY = -radius * Math.cos(angle);
      const stdDevMM = 30; // 中級者レベル
      const areaType = 'SINGLE';
      const segmentNumber = 5;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('実力レベルによる確率の変化', () => {
    test('同じターゲットで、実力が高いほどヒット確率が高くなる（トリプル20の例）', () => {
      // Arrange
      const targetX = 0;
      const targetY = -103; // トリプル20
      const areaType = 'TRIPLE';
      const segmentNumber = 20;

      // Act
      const expertProb = calculateHitProbability(targetX, targetY, 8, areaType, segmentNumber); // エキスパート
      const advancedProb = calculateHitProbability(targetX, targetY, 15, areaType, segmentNumber); // 上級者
      const intermediateProb = calculateHitProbability(
        targetX,
        targetY,
        30,
        areaType,
        segmentNumber
      ); // 中級者
      const beginnerProb = calculateHitProbability(targetX, targetY, 50, areaType, segmentNumber); // 初心者

      // Assert
      // 実力が高いほど確率が高くなる
      expect(expertProb).toBeGreaterThan(advancedProb);
      expect(advancedProb).toBeGreaterThan(intermediateProb);
      expect(intermediateProb).toBeGreaterThan(beginnerProb);

      // すべて有効な確率範囲内
      expect(expertProb).toBeGreaterThanOrEqual(0);
      expect(expertProb).toBeLessThanOrEqual(1);
      expect(beginnerProb).toBeGreaterThanOrEqual(0);
      expect(beginnerProb).toBeLessThanOrEqual(1);
    });

    test('同じターゲットで、実力が高いほどヒット確率が高くなる（インナーブルの例）', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0; // インナーブル
      const areaType = 'INNER_BULL';

      // Act
      const expertProb = calculateHitProbability(targetX, targetY, 8, areaType); // エキスパート
      const advancedProb = calculateHitProbability(targetX, targetY, 15, areaType); // 上級者
      const intermediateProb = calculateHitProbability(targetX, targetY, 30, areaType); // 中級者

      // Assert
      expect(expertProb).toBeGreaterThan(advancedProb);
      expect(advancedProb).toBeGreaterThan(intermediateProb);
    });
  });

  describe('エリアサイズによる確率の変化', () => {
    test('同じ実力レベルで、大きいエリアほどヒット確率が高くなる', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0; // ボード中心を狙う
      const stdDevMM = 15; // 上級者レベル

      // Act
      const innerBullProb = calculateHitProbability(targetX, targetY, stdDevMM, 'INNER_BULL');
      const outerBullProb = calculateHitProbability(targetX, targetY, stdDevMM, 'OUTER_BULL');

      // Assert
      // アウターブルの方が大きいエリアなので、確率が高くなる
      expect(outerBullProb).toBeGreaterThan(innerBullProb);
    });
  });

  describe('エッジケース', () => {
    test('stdDev=0.1mm（超高精度）でインナーブルのヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 0.1; // 超高精度（理論的な値）
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // 超高精度なので、ほぼ100%でヒット
      expect(result).toBeGreaterThan(0.99);
    });

    test('stdDev=100mm（非常に低い精度）でインナーブルのヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 100; // 非常に低い精度
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // 非常に低い精度なので、ヒット確率は極めて低い
      expect(result).toBeLessThan(0.05);
    });

    test('ボード端近く（X=220mm, Y=0）からトリプル20を狙う', () => {
      // Arrange
      const targetX = 220; // ボード端近く
      const targetY = 0;
      const stdDevMM = 15;
      const areaType = 'TRIPLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
      // ボード端から狙うので、確率は非常に低い
      expect(result).toBeLessThan(0.1);
    });

    test('負の座標（X=-100, Y=-100）からダブル20を狙う', () => {
      // Arrange
      const targetX = -100;
      const targetY = -100;
      const stdDevMM = 15;
      const areaType = 'DOUBLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('境界値', () => {
    test('stdDev=1mm（最小実用値）でヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 1; // 最小実用値
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('stdDev=200mm（最大想定値）でヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 200; // 最大想定値
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('セグメント番号1（最小値）のトリプルでヒット確率を計算する', () => {
      // Arrange
      const angle = Math.PI / 10; // セグメント1の角度
      const radius = 103;
      const targetX = radius * Math.sin(angle);
      const targetY = -radius * Math.cos(angle);
      const stdDevMM = 15;
      const areaType = 'TRIPLE';
      const segmentNumber = 1; // 最小値

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('セグメント番号20（最大値）のトリプルでヒット確率を計算する', () => {
      // Arrange
      const targetX = 0;
      const targetY = -103; // トリプル20
      const stdDevMM = 15;
      const areaType = 'TRIPLE';
      const segmentNumber = 20; // 最大値

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('ボード中心（0,0）を狙う', () => {
      // Arrange
      const targetX = 0; // 境界値
      const targetY = 0; // 境界値
      const stdDevMM = 15;
      const areaType = 'INNER_BULL';

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('ボード端（X=225mm, Y=0）を狙う', () => {
      // Arrange
      const targetX = BOARD_PHYSICAL.rings.boardEdge; // ボード端（225mm）
      const targetY = 0;
      const stdDevMM = 15;
      const areaType = 'SINGLE';
      const segmentNumber = 20;

      // Act
      const result = calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('異常系 - 無効な入力', () => {
    test('stdDevMM=0（ゼロ）の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 0; // 無効値
      const areaType = 'INNER_BULL';

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('stdDevMM=-10（負の値）の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = -10; // 無効値
      const areaType = 'INNER_BULL';

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('stdDevMM=NaNの場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = NaN; // 無効値
      const areaType = 'INNER_BULL';

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('stdDevMM=Infinityの場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = Infinity; // 無効値
      const areaType = 'INNER_BULL';

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('targetX=NaNの場合はエラーをスローする', () => {
      // Arrange
      const targetX = NaN; // 無効値
      const targetY = 0;
      const stdDevMM = 15;
      const areaType = 'INNER_BULL';

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('targetY=Infinityの場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = Infinity; // 無効値
      const stdDevMM = 15;
      const areaType = 'INNER_BULL';

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('無効なareaType（"INVALID"）の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 15;
      const areaType = 'INVALID' as unknown as AreaType; // 無効値

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('TRIPLEでsegmentNumber=0（範囲外）の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = -103;
      const stdDevMM = 15;
      const areaType = 'TRIPLE';
      const segmentNumber = 0; // 無効値（1-20の範囲外）

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);
      }).toThrow();
    });

    test('TRIPLEでsegmentNumber=21（範囲外）の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = -103;
      const stdDevMM = 15;
      const areaType = 'TRIPLE';
      const segmentNumber = 21; // 無効値（1-20の範囲外）

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);
      }).toThrow();
    });

    test('DOUBLEでsegmentNumber=-1（負の値）の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = -166;
      const stdDevMM = 15;
      const areaType = 'DOUBLE';
      const segmentNumber = -1; // 無効値

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);
      }).toThrow();
    });

    test('SINGLEでsegmentNumber=100（範囲外）の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = -53.5;
      const stdDevMM = 15;
      const areaType = 'SINGLE';
      const segmentNumber = 100; // 無効値

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);
      }).toThrow();
    });

    test('TRIPLEでsegmentNumberが未定義の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = -103;
      const stdDevMM = 15;
      const areaType = 'TRIPLE';
      // segmentNumber を省略

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('DOUBLEでsegmentNumberが未定義の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = -166;
      const stdDevMM = 15;
      const areaType = 'DOUBLE';
      // segmentNumber を省略

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('SINGLEでsegmentNumberが未定義の場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = -53.5;
      const stdDevMM = 15;
      const areaType = 'SINGLE';
      // segmentNumber を省略

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType);
      }).toThrow();
    });

    test('INNER_BULLでsegmentNumberが指定された場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 15;
      const areaType = 'INNER_BULL';
      const segmentNumber = 20; // BULL系にはsegmentNumberは不要

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);
      }).toThrow();
    });

    test('OUTER_BULLでsegmentNumberが指定された場合はエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 15;
      const areaType = 'OUTER_BULL';
      const segmentNumber = 20; // BULL系にはsegmentNumberは不要

      // Act & Assert
      expect(() => {
        calculateHitProbability(targetX, targetY, stdDevMM, areaType, segmentNumber);
      }).toThrow();
    });
  });
});
