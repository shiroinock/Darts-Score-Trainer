import { describe, expect, test } from 'vitest';
import { simulateThrow } from './simulateThrow.js';

describe('simulateThrow', () => {
  describe('正常系', () => {
    test('目標座標と標準偏差を指定して着弾点を生成する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 30;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
    });

    test('ボード中心(0,0)を狙うと中心付近に着弾する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 30;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 99.7%の確率で±3σ（±90mm）の範囲内
      expect(Math.abs(result.x - targetX)).toBeLessThan(90);
      expect(Math.abs(result.y - targetY)).toBeLessThan(90);
    });

    test('正の象限（右上）を狙うと正の象限付近に着弾する', () => {
      // Arrange
      const targetX = 100; // 右（X軸正）
      const targetY = 100; // 下（Y軸正）
      const stdDevMM = 15;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 99.7%の確率で±3σ（±45mm）の範囲内
      expect(Math.abs(result.x - targetX)).toBeLessThan(45);
      expect(Math.abs(result.y - targetY)).toBeLessThan(45);
    });

    test('負の象限（左上）を狙うと負の象限付近に着弾する', () => {
      // Arrange
      const targetX = -50;
      const targetY = -50;
      const stdDevMM = 20;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 99.7%の確率で±3σ（±60mm）の範囲内
      expect(Math.abs(result.x - targetX)).toBeLessThan(60);
      expect(Math.abs(result.y - targetY)).toBeLessThan(60);
    });

    test('トリプル20付近（r=103mm, θ=90°）を狙う', () => {
      // Arrange
      const targetX = 0; // 真上方向なのでX=0
      const targetY = -103; // Y軸負の方向（上）
      const stdDevMM = 15; // 上級者レベル

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(45);
      expect(Math.abs(result.y - targetY)).toBeLessThan(45);
    });

    test('ダブルリング付近（r=166mm）を狙う', () => {
      // Arrange
      const targetX = 166; // 右方向（X軸正）
      const targetY = 0;
      const stdDevMM = 20;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(60);
      expect(Math.abs(result.y - targetY)).toBeLessThan(60);
    });
  });

  describe('統計的性質の検証', () => {
    test('大量サンプルの平均が目標座標に収束する（中心を狙う）', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 30;
      const sampleSize = 1000;
      const tolerance = 5; // ±5mm の許容誤差（99%信頼区間をカバー）

      // Act
      let sumX = 0;
      let sumY = 0;
      for (let i = 0; i < sampleSize; i++) {
        const { x, y } = simulateThrow(targetX, targetY, stdDevMM);
        sumX += x;
        sumY += y;
      }
      const avgX = sumX / sampleSize;
      const avgY = sumY / sampleSize;

      // Assert
      // 平均が目標座標に収束することを確認（許容誤差±5mm）
      expect(Math.abs(avgX - targetX)).toBeLessThan(tolerance);
      expect(Math.abs(avgY - targetY)).toBeLessThan(tolerance);
    });

    test('大量サンプルの平均が目標座標に収束する（オフセット座標）', () => {
      // Arrange
      const targetX = 50;
      const targetY = -50;
      const stdDevMM = 20;
      const sampleSize = 1000;
      const tolerance = 5; // ±5mm の許容誤差（99%信頼区間をカバー）

      // Act
      let sumX = 0;
      let sumY = 0;
      for (let i = 0; i < sampleSize; i++) {
        const { x, y } = simulateThrow(targetX, targetY, stdDevMM);
        sumX += x;
        sumY += y;
      }
      const avgX = sumX / sampleSize;
      const avgY = sumY / sampleSize;

      // Assert
      // 平均が目標座標に収束することを確認（許容誤差±5mm）
      expect(Math.abs(avgX - targetX)).toBeLessThan(tolerance);
      expect(Math.abs(avgY - targetY)).toBeLessThan(tolerance);
    });

    test('大量サンプルの標準偏差がstdDevMMに収束する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 25;
      const sampleSize = 1000;
      const tolerance = 5; // ±5mm の許容誤差（99%信頼区間をカバー）

      // Act
      const samplesX: number[] = [];
      const samplesY: number[] = [];
      for (let i = 0; i < sampleSize; i++) {
        const { x, y } = simulateThrow(targetX, targetY, stdDevMM);
        samplesX.push(x);
        samplesY.push(y);
      }

      // 標準偏差の計算
      const avgX = samplesX.reduce((sum, v) => sum + v, 0) / sampleSize;
      const avgY = samplesY.reduce((sum, v) => sum + v, 0) / sampleSize;
      const varianceX = samplesX.reduce((sum, v) => sum + (v - avgX) ** 2, 0) / sampleSize;
      const varianceY = samplesY.reduce((sum, v) => sum + (v - avgY) ** 2, 0) / sampleSize;
      const calculatedStdDevX = Math.sqrt(varianceX);
      const calculatedStdDevY = Math.sqrt(varianceY);

      // Assert
      // 標準偏差が期待値に収束することを確認（許容誤差±5mm）
      expect(Math.abs(calculatedStdDevX - stdDevMM)).toBeLessThan(tolerance);
      expect(Math.abs(calculatedStdDevY - stdDevMM)).toBeLessThan(tolerance);
    });

    test('複数回呼び出すと異なる着弾点を返す（乱数性）', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 30;

      // Act
      const result1 = simulateThrow(targetX, targetY, stdDevMM);
      const result2 = simulateThrow(targetX, targetY, stdDevMM);
      const result3 = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 3回の呼び出しで全て異なる着弾点になる確率は極めて高い
      const allDifferent =
        (result1.x !== result2.x || result1.y !== result2.y) &&
        (result1.x !== result3.x || result1.y !== result3.y) &&
        (result2.x !== result3.x || result2.y !== result3.y);

      expect(allDifferent).toBe(true);
    });
  });

  describe('ダーツ実力レベル別のシミュレーション', () => {
    test('初心者レベル（stdDevMM=50mm）でインナーブルを狙う', () => {
      // Arrange
      const targetX = 0; // インナーブル中心
      const targetY = 0;
      const stdDevMM = 50; // 初心者

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 99.7%の確率で±3σ（±150mm）の範囲内
      expect(Math.abs(result.x - targetX)).toBeLessThan(150);
      expect(Math.abs(result.y - targetY)).toBeLessThan(150);
    });

    test('中級者レベル（stdDevMM=30mm）でトリプル20を狙う', () => {
      // Arrange
      const targetX = 0; // 真上方向
      const targetY = -103; // トリプルリング中心（r=103mm）
      const stdDevMM = 30; // 中級者

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 99.7%の確率で±3σ（±90mm）の範囲内
      expect(Math.abs(result.x - targetX)).toBeLessThan(90);
      expect(Math.abs(result.y - targetY)).toBeLessThan(90);
    });

    test('上級者レベル（stdDevMM=15mm）でインナーブルを狙う', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 15; // 上級者

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 99.7%の確率で±3σ（±45mm）の範囲内
      expect(Math.abs(result.x - targetX)).toBeLessThan(45);
      expect(Math.abs(result.y - targetY)).toBeLessThan(45);
    });

    test('エキスパートレベル（stdDevMM=8mm）でインナーブルを狙う', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 8; // エキスパート

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 99.7%の確率で±3σ（±24mm）の範囲内
      // インナーブル半径（3.175mm）を外れる可能性もある
      expect(Math.abs(result.x - targetX)).toBeLessThan(24);
      expect(Math.abs(result.y - targetY)).toBeLessThan(24);
    });
  });

  describe('ダーツボード仕様との整合性', () => {
    test('ボード端（r=225mm）を超える着弾点が発生しうる', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 100; // 非常に大きな散らばり
      const sampleSize = 100;

      // Act
      let hasOutOfBounds = false;
      for (let i = 0; i < sampleSize; i++) {
        const { x, y } = simulateThrow(targetX, targetY, stdDevMM);
        const distance = Math.sqrt(x * x + y * y);
        if (distance > 225) {
          hasOutOfBounds = true;
          break;
        }
      }

      // Assert
      // stdDev=100mm の場合、ボード外に出る確率は十分高い
      expect(hasOutOfBounds).toBe(true);
    });

    test('物理座標系（mm単位）で着弾点が返される', () => {
      // Arrange
      const targetX = 50;
      const targetY = -50;
      const stdDevMM = 20;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 結果は物理座標系（mm単位）
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      // 大まかな範囲チェック（画面座標ではなく物理座標）
      expect(Math.abs(result.x)).toBeLessThan(1000); // 物理的に妥当な範囲
      expect(Math.abs(result.y)).toBeLessThan(1000);
    });

    test('ボード端付近（r=200mm）を狙うとボード外に出る可能性がある', () => {
      // Arrange
      const targetX = 200; // ボード端近く
      const targetY = 0;
      const stdDevMM = 30;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // ボード端近くでも着弾点が生成される（ボード外を含む）
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
    });
  });

  describe('エッジケース', () => {
    test('stdDevMM=0のとき、常に目標座標を返す', () => {
      // Arrange
      const targetX = 42;
      const targetY = -42;
      const stdDevMM = 0; // 完全に正確な投擲

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(result.x).toBe(targetX);
      expect(result.y).toBe(targetY);
    });

    test('負の目標座標でも正しく動作する', () => {
      // Arrange
      const targetX = -100;
      const targetY = -100;
      const stdDevMM = 20;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(60);
      expect(Math.abs(result.y - targetY)).toBeLessThan(60);
    });

    test('目標座標が(0,0)でstdDevMMが非常に大きい（150mm）', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 150; // 極めて不正確

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 99.7%の確率で±3σ（±450mm）の範囲内
      expect(Math.abs(result.x)).toBeLessThan(450);
      expect(Math.abs(result.y)).toBeLessThan(450);
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
    });

    test('目標座標が非常に大きい値（ボード外）', () => {
      // Arrange
      const targetX = 500; // ボード端（225mm）を大きく超える
      const targetY = 500;
      const stdDevMM = 10;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(30);
      expect(Math.abs(result.y - targetY)).toBeLessThan(30);
    });

    test('stdDevMMが非常に小さい（0.1mm）', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 0.1; // 極めて高精度

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(1);
      expect(Math.abs(result.y - targetY)).toBeLessThan(1);
    });
  });

  describe('異常系', () => {
    test('負のstdDevMMを渡すとエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = -10;

      // Act & Assert
      expect(() => simulateThrow(targetX, targetY, stdDevMM)).toThrow();
    });

    test('NaNのtargetXを渡すとエラーをスローする', () => {
      // Arrange
      const targetX = NaN;
      const targetY = 0;
      const stdDevMM = 30;

      // Act & Assert
      expect(() => simulateThrow(targetX, targetY, stdDevMM)).toThrow();
    });

    test('NaNのtargetYを渡すとエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = NaN;
      const stdDevMM = 30;

      // Act & Assert
      expect(() => simulateThrow(targetX, targetY, stdDevMM)).toThrow();
    });

    test('NaNのstdDevMMを渡すとエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = NaN;

      // Act & Assert
      expect(() => simulateThrow(targetX, targetY, stdDevMM)).toThrow();
    });

    test('InfinityのtargetXを渡すとエラーをスローする', () => {
      // Arrange
      const targetX = Infinity;
      const targetY = 0;
      const stdDevMM = 30;

      // Act & Assert
      expect(() => simulateThrow(targetX, targetY, stdDevMM)).toThrow();
    });

    test('InfinityのtargetYを渡すとエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = Infinity;
      const stdDevMM = 30;

      // Act & Assert
      expect(() => simulateThrow(targetX, targetY, stdDevMM)).toThrow();
    });

    test('InfinityのstdDevMMを渡すとエラーをスローする', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = Infinity;

      // Act & Assert
      expect(() => simulateThrow(targetX, targetY, stdDevMM)).toThrow();
    });

    test('-InfinityのtargetXを渡すとエラーをスローする', () => {
      // Arrange
      const targetX = -Infinity;
      const targetY = 0;
      const stdDevMM = 30;

      // Act & Assert
      expect(() => simulateThrow(targetX, targetY, stdDevMM)).toThrow();
    });
  });

  describe('境界値', () => {
    test('targetX=0, targetY=0, stdDevMM=0で原点を返す', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 0;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    test('ボード中心を狙い、ボード半径（225mm）を超える散らばりでも動作する', () => {
      // Arrange
      const targetX = 0;
      const targetY = 0;
      const stdDevMM = 100; // 3σ=300mm（ボード外に出る可能性大）

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
    });

    test('目標がボード端（r=225mm）でも正常に動作する', () => {
      // Arrange
      const targetX = 225; // ボード端（右方向）
      const targetY = 0;
      const stdDevMM = 10;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(30);
      expect(Math.abs(result.y - targetY)).toBeLessThan(30);
    });

    test('インナーブル境界（r=3.175mm）付近を狙う', () => {
      // Arrange
      const targetX = 3.175; // インナーブル境界
      const targetY = 0;
      const stdDevMM = 8; // エキスパートレベル

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(24);
      expect(Math.abs(result.y - targetY)).toBeLessThan(24);
    });

    test('アウターブル境界（r=7.95mm）付近を狙う', () => {
      // Arrange
      const targetX = 7.95; // アウターブル境界
      const targetY = 0;
      const stdDevMM = 8;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(24);
      expect(Math.abs(result.y - targetY)).toBeLessThan(24);
    });

    test('トリプルリング開始境界（r=99mm）付近を狙う', () => {
      // Arrange
      const targetX = 99;
      const targetY = 0;
      const stdDevMM = 15;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(45);
      expect(Math.abs(result.y - targetY)).toBeLessThan(45);
    });

    test('トリプルリング終了境界（r=107mm）付近を狙う', () => {
      // Arrange
      const targetX = 107;
      const targetY = 0;
      const stdDevMM = 15;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(45);
      expect(Math.abs(result.y - targetY)).toBeLessThan(45);
    });

    test('ダブルリング開始境界（r=162mm）付近を狙う', () => {
      // Arrange
      const targetX = 162;
      const targetY = 0;
      const stdDevMM = 20;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      expect(Math.abs(result.x - targetX)).toBeLessThan(60);
      expect(Math.abs(result.y - targetY)).toBeLessThan(60);
    });

    test('ダブルリング終了境界（r=170mm）付近を狙う', () => {
      // Arrange
      const targetX = 170;
      const targetY = 0;
      const stdDevMM = 20;

      // Act
      const result = simulateThrow(targetX, targetY, stdDevMM);

      // Assert
      // 統計的に99.7%のサンプルが±3σ以内に収まるため、余裕を持たせて±4σ (80mm) を許容
      expect(Math.abs(result.x - targetX)).toBeLessThan(80);
      expect(Math.abs(result.y - targetY)).toBeLessThan(80);
    });
  });
});
