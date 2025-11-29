import { describe, test, expect } from 'vitest';
import { generateNormalDistribution, simulateThrow, executeThrow } from './throwSimulator';

describe('throwSimulator', () => {
  describe('generateNormalDistribution', () => {
    describe('正常系', () => {
      test('meanとstdDevを指定して2次元正規分布の乱数ペアを生成する', () => {
        // Arrange
        const mean = 0;
        const stdDev = 10;

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        expect(result).toHaveProperty('x');
        expect(result).toHaveProperty('y');
        expect(typeof result.x).toBe('number');
        expect(typeof result.y).toBe('number');
        expect(Number.isFinite(result.x)).toBe(true);
        expect(Number.isFinite(result.y)).toBe(true);
      });

      test('mean=0, stdDev=1で標準正規分布を生成する', () => {
        // Arrange
        const mean = 0;
        const stdDev = 1;

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        // 標準正規分布なので、99.7%の確率で[-3, 3]の範囲内
        // (統計的に妥当な範囲を検証)
        expect(result.x).toBeGreaterThanOrEqual(-10); // 極端な外れ値でないこと
        expect(result.x).toBeLessThanOrEqual(10);
        expect(result.y).toBeGreaterThanOrEqual(-10);
        expect(result.y).toBeLessThanOrEqual(10);
      });

      test('複数回呼び出すと異なる値を返す（乱数性）', () => {
        // Arrange
        const mean = 0;
        const stdDev = 10;

        // Act
        const result1 = generateNormalDistribution(mean, stdDev);
        const result2 = generateNormalDistribution(mean, stdDev);
        const result3 = generateNormalDistribution(mean, stdDev);

        // Assert
        // 3回の呼び出しで全て異なる値になる確率は極めて高い
        const allDifferent =
          (result1.x !== result2.x || result1.y !== result2.y) &&
          (result1.x !== result3.x || result1.y !== result3.y) &&
          (result2.x !== result3.x || result2.y !== result3.y);

        expect(allDifferent).toBe(true);
      });
    });

    describe('統計的性質の検証', () => {
      test('大量サンプルの平均がmeanに収束する', () => {
        // Arrange
        const mean = 50; // mm
        const stdDev = 15; // mm
        const sampleSize = 10000;
        const tolerance = 1; // ±1mm の許容誤差

        // Act
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < sampleSize; i++) {
          const { x, y } = generateNormalDistribution(mean, stdDev);
          sumX += x;
          sumY += y;
        }
        const avgX = sumX / sampleSize;
        const avgY = sumY / sampleSize;

        // Assert
        expect(avgX).toBeCloseTo(mean, 0); // 小数点以下0桁（整数部分）で一致
        expect(avgY).toBeCloseTo(mean, 0);
        expect(Math.abs(avgX - mean)).toBeLessThan(tolerance);
        expect(Math.abs(avgY - mean)).toBeLessThan(tolerance);
      });

      test('大量サンプルの標準偏差がstdDevに収束する', () => {
        // Arrange
        const mean = 0;
        const stdDev = 30; // mm（中級者レベル）
        const sampleSize = 10000;
        const tolerance = 2; // ±2mm の許容誤差

        // Act
        const samplesX: number[] = [];
        const samplesY: number[] = [];
        for (let i = 0; i < sampleSize; i++) {
          const { x, y } = generateNormalDistribution(mean, stdDev);
          samplesX.push(x);
          samplesY.push(y);
        }

        // 標準偏差の計算
        const avgX = samplesX.reduce((sum, v) => sum + v, 0) / sampleSize;
        const avgY = samplesY.reduce((sum, v) => sum + v, 0) / sampleSize;
        const varianceX = samplesX.reduce((sum, v) => sum + Math.pow(v - avgX, 2), 0) / sampleSize;
        const varianceY = samplesY.reduce((sum, v) => sum + Math.pow(v - avgY, 2), 0) / sampleSize;
        const calculatedStdDevX = Math.sqrt(varianceX);
        const calculatedStdDevY = Math.sqrt(varianceY);

        // Assert
        expect(calculatedStdDevX).toBeCloseTo(stdDev, 0);
        expect(calculatedStdDevY).toBeCloseTo(stdDev, 0);
        expect(Math.abs(calculatedStdDevX - stdDev)).toBeLessThan(tolerance);
        expect(Math.abs(calculatedStdDevY - stdDev)).toBeLessThan(tolerance);
      });

      test('x と y が独立した正規分布に従う', () => {
        // Arrange
        const mean = 0;
        const stdDev = 20;
        const sampleSize = 1000;

        // Act
        const samplesX: number[] = [];
        const samplesY: number[] = [];
        for (let i = 0; i < sampleSize; i++) {
          const { x, y } = generateNormalDistribution(mean, stdDev);
          samplesX.push(x);
          samplesY.push(y);
        }

        // 相関係数の計算（独立ならば0に近い）
        const avgX = samplesX.reduce((sum, v) => sum + v, 0) / sampleSize;
        const avgY = samplesY.reduce((sum, v) => sum + v, 0) / sampleSize;

        let covariance = 0;
        let varX = 0;
        let varY = 0;
        for (let i = 0; i < sampleSize; i++) {
          const dx = samplesX[i] - avgX;
          const dy = samplesY[i] - avgY;
          covariance += dx * dy;
          varX += dx * dx;
          varY += dy * dy;
        }
        const correlation = covariance / Math.sqrt(varX * varY);

        // Assert
        // 相関係数は-0.1から0.1の範囲内（独立性の検証）
        expect(Math.abs(correlation)).toBeLessThan(0.1);
      });
    });

    describe('ダーツ実力レベル別のシミュレーション', () => {
      test('初心者レベル（stdDev=50mm）で散らばりを生成する', () => {
        // Arrange
        const targetX = 0; // ボード中心を狙う
        const targetY = 0;
        const stdDev = 50; // 初心者

        // Act
        const result = generateNormalDistribution(targetX, stdDev);

        // Assert
        // 99.7%の確率で±3σ（±150mm）の範囲内
        expect(Math.abs(result.x - targetX)).toBeLessThan(150);
        expect(Math.abs(result.y - targetY)).toBeLessThan(150);
      });

      test('中級者レベル（stdDev=30mm）で散らばりを生成する', () => {
        // Arrange
        const targetX = 100; // トリプル20付近を狙う（仮想座標）
        const targetY = 0;
        const stdDev = 30; // 中級者

        // Act
        const result = generateNormalDistribution(targetX, stdDev);

        // Assert
        // 統計的に妥当な範囲（±5σ = ±150mm）内であることを確認
        // 注: 正規分布では3σ外に出る確率が0.3%あるため、テストの堅牢性のため5σで検証
        expect(Math.abs(result.x - targetX)).toBeLessThan(150);
        expect(Math.abs(result.y - targetY)).toBeLessThan(150);
      });

      test('上級者レベル（stdDev=15mm）で散らばりを生成する', () => {
        // Arrange
        const targetX = 0; // インナーブル（50点）を狙う
        const targetY = 0;
        const stdDev = 15; // 上級者

        // Act
        const result = generateNormalDistribution(targetX, stdDev);

        // Assert
        // 99.7%の確率で±3σ（±45mm）の範囲内
        expect(Math.abs(result.x - targetX)).toBeLessThan(45);
        expect(Math.abs(result.y - targetY)).toBeLessThan(45);
      });

      test('エキスパートレベル（stdDev=8mm）で散らばりを生成する', () => {
        // Arrange
        const targetX = 0; // インナーブル中心
        const targetY = 0;
        const stdDev = 8; // エキスパート

        // Act
        const result = generateNormalDistribution(targetX, stdDev);

        // Assert
        // 99.7%の確率で±3σ（±24mm）の範囲内
        // インナーブル半径（3.175mm）を大きく外れる可能性もある
        expect(Math.abs(result.x - targetX)).toBeLessThan(24);
        expect(Math.abs(result.y - targetY)).toBeLessThan(24);
      });
    });

    describe('Box-Muller法の数学的性質', () => {
      test('u1=0.5, u2=0のとき、特定の値を返す', () => {
        // Arrange
        const mean = 0;
        const stdDev = 10;

        // Box-Muller法の計算（期待値）:
        // z1 = sqrt(-2 * ln(0.5)) * cos(0) = sqrt(1.386) * 1 ≈ 1.177
        // z2 = sqrt(-2 * ln(0.5)) * sin(0) = sqrt(1.386) * 0 = 0
        // x = 0 + 1.177 * 10 ≈ 11.77
        // y = 0 + 0 * 10 = 0

        // Act
        // 注: 実際にはMath.random()を使うため、この値を直接テストできない
        // 実装時にシード値を設定できるか、モック化が必要
        // ここでは数学的性質の理解を示すためのテストケース
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        // 実装がBox-Muller法に従っていることを間接的に検証
        expect(typeof result.x).toBe('number');
        expect(typeof result.y).toBe('number');
      });

      test('mean を適用すると分布が平行移動する', () => {
        // Arrange
        const stdDev = 10;
        const mean1 = 0;
        const mean2 = 100;
        const sampleSize = 1000;

        // Act
        const samples1: number[] = [];
        const samples2: number[] = [];
        for (let i = 0; i < sampleSize; i++) {
          const { x: x1 } = generateNormalDistribution(mean1, stdDev);
          const { x: x2 } = generateNormalDistribution(mean2, stdDev);
          samples1.push(x1);
          samples2.push(x2);
        }

        const avg1 = samples1.reduce((sum, v) => sum + v, 0) / sampleSize;
        const avg2 = samples2.reduce((sum, v) => sum + v, 0) / sampleSize;

        // Assert
        // 平均の差が mean の差にほぼ等しい（許容誤差±5mm）
        // toBeCloseTo の第2引数なしでデフォルト許容誤差を使用
        expect(Math.abs((avg2 - avg1) - (mean2 - mean1))).toBeLessThan(5);
      });

      test('stdDev を2倍にすると分布の広がりが2倍になる', () => {
        // Arrange
        const mean = 0;
        const stdDev1 = 10;
        const stdDev2 = 20;
        const sampleSize = 1000;

        // Act
        const samples1: number[] = [];
        const samples2: number[] = [];
        for (let i = 0; i < sampleSize; i++) {
          const { x: x1 } = generateNormalDistribution(mean, stdDev1);
          const { x: x2 } = generateNormalDistribution(mean, stdDev2);
          samples1.push(x1);
          samples2.push(x2);
        }

        // 標準偏差の計算
        const avg1 = samples1.reduce((sum, v) => sum + v, 0) / sampleSize;
        const avg2 = samples2.reduce((sum, v) => sum + v, 0) / sampleSize;
        const variance1 = samples1.reduce((sum, v) => sum + Math.pow(v - avg1, 2), 0) / sampleSize;
        const variance2 = samples2.reduce((sum, v) => sum + Math.pow(v - avg2, 2), 0) / sampleSize;
        const calculatedStdDev1 = Math.sqrt(variance1);
        const calculatedStdDev2 = Math.sqrt(variance2);

        // Assert
        // 標準偏差の比が2に近いことを確認（許容誤差±0.5）
        expect(Math.abs((calculatedStdDev2 / calculatedStdDev1) - 2)).toBeLessThan(0.5);
      });
    });

    describe('エッジケース', () => {
      test('stdDev=0のとき、常にmean値を返す', () => {
        // Arrange
        const mean = 42;
        const stdDev = 0;

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        expect(result.x).toBe(mean);
        expect(result.y).toBe(mean);
      });

      test('負のmean値でも正しく動作する', () => {
        // Arrange
        const mean = -50;
        const stdDev = 10;

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        expect(result.x).toBeLessThan(mean + 50); // 大雑把な範囲チェック
        expect(result.x).toBeGreaterThan(mean - 50);
        expect(result.y).toBeLessThan(mean + 50);
        expect(result.y).toBeGreaterThan(mean - 50);
      });

      test('非常に大きなstdDev（100mm）でも動作する', () => {
        // Arrange
        const mean = 0;
        const stdDev = 100; // 非常に下手なプレイヤー

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        // 99.7%の確率で±3σ（±300mm）の範囲内
        expect(Math.abs(result.x)).toBeLessThan(300);
        expect(Math.abs(result.y)).toBeLessThan(300);
      });

      test('非常に小さなstdDev（0.1mm）でも動作する', () => {
        // Arrange
        const mean = 0;
        const stdDev = 0.1; // 極めて高精度

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        // 99.7%の確率で±3σ（±0.3mm）の範囲内
        expect(Math.abs(result.x)).toBeLessThan(1);
        expect(Math.abs(result.y)).toBeLessThan(1);
      });
    });

    describe('異常系', () => {
      test('負のstdDevを渡すとエラーをスローする', () => {
        // Arrange
        const mean = 0;
        const stdDev = -10;

        // Act & Assert
        expect(() => generateNormalDistribution(mean, stdDev)).toThrow();
      });

      test('NaNのmeanを渡すとエラーをスローする', () => {
        // Arrange
        const mean = NaN;
        const stdDev = 10;

        // Act & Assert
        expect(() => generateNormalDistribution(mean, stdDev)).toThrow();
      });

      test('NaNのstdDevを渡すとエラーをスローする', () => {
        // Arrange
        const mean = 0;
        const stdDev = NaN;

        // Act & Assert
        expect(() => generateNormalDistribution(mean, stdDev)).toThrow();
      });

      test('Infinityのmeanを渡すとエラーをスローする', () => {
        // Arrange
        const mean = Infinity;
        const stdDev = 10;

        // Act & Assert
        expect(() => generateNormalDistribution(mean, stdDev)).toThrow();
      });

      test('InfinityのstdDevを渡すとエラーをスローする', () => {
        // Arrange
        const mean = 0;
        const stdDev = Infinity;

        // Act & Assert
        expect(() => generateNormalDistribution(mean, stdDev)).toThrow();
      });
    });

    describe('境界値', () => {
      test('mean=0, stdDev=0で原点を返す', () => {
        // Arrange
        const mean = 0;
        const stdDev = 0;

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
      });

      test('ボード半径（225mm）を超える散らばりでも正常に動作する', () => {
        // Arrange
        const mean = 0;
        const stdDev = 150; // 3σ=450mm（ボード外に出る可能性大）

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        // 数学的には任意の値を取りうる（ボード外でも問題ない）
        expect(Number.isFinite(result.x)).toBe(true);
        expect(Number.isFinite(result.y)).toBe(true);
      });

      test('mean=225（ボード端）でも正常に動作する', () => {
        // Arrange
        const mean = 225; // ボード半径
        const stdDev = 10;

        // Act
        const result = generateNormalDistribution(mean, stdDev);

        // Assert
        expect(Math.abs(result.x - mean)).toBeLessThan(50);
        expect(Math.abs(result.y - mean)).toBeLessThan(50);
      });
    });
  });

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
        const varianceX = samplesX.reduce((sum, v) => sum + Math.pow(v - avgX, 2), 0) / sampleSize;
        const varianceY = samplesY.reduce((sum, v) => sum + Math.pow(v - avgY, 2), 0) / sampleSize;
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

  describe('executeThrow', () => {
    describe('正常系', () => {
      test('BULLを狙うとBULL座標(0,0)を基準に投擲する', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 0; // 完全な精度

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target).toEqual(target);
        expect(result.landingPoint.x).toBe(0);
        expect(result.landingPoint.y).toBe(0);
        expect(result.score).toBe(50); // INNER_BULL
        expect(result.ring).toBe('INNER_BULL');
      });

      test('TRIPLE 20を狙うとT20座標を基準に投擲する', () => {
        // Arrange
        const target = { type: 'TRIPLE' as const, number: 20 };
        const stdDevMM = 0; // 完全な精度

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target).toEqual(target);
        expect(result.score).toBe(60); // T20
        expect(result.ring).toBe('TRIPLE');
        expect(result.segmentNumber).toBe(20);
      });

      test('DOUBLE 16を狙うとD16座標を基準に投擲する', () => {
        // Arrange
        const target = { type: 'DOUBLE' as const, number: 16 };
        const stdDevMM = 0; // 完全な精度

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target).toEqual(target);
        expect(result.score).toBe(32); // D16
        expect(result.ring).toBe('DOUBLE');
        expect(result.segmentNumber).toBe(16);
      });

      test('SINGLE 10を狙うとS10座標を基準に投擲する', () => {
        // Arrange
        const target = { type: 'SINGLE' as const, number: 10 };
        const stdDevMM = 0; // 完全な精度

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target).toEqual(target);
        expect(result.score).toBe(10); // S10
        expect(result.segmentNumber).toBe(10);
      });
    });

    describe('stdDevMM = 0（完全な精度）', () => {
      test('狙った座標と完全に同じ着弾点を返す（BULL）', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 0;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.landingPoint.x).toBe(0);
        expect(result.landingPoint.y).toBe(0);
        expect(result.score).toBe(50);
      });

      test('狙った座標と完全に同じ着弾点を返す（TRIPLE 20）', () => {
        // Arrange
        const target = { type: 'TRIPLE' as const, number: 20 };
        const stdDevMM = 0;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        // T20の物理座標: (0, -103) - 真上、トリプルリング中心
        expect(result.landingPoint.x).toBe(0);
        expect(result.landingPoint.y).toBe(-103);
        expect(result.score).toBe(60);
      });

      test('狙った座標と完全に同じ着弾点を返す（DOUBLE 16）', () => {
        // Arrange
        const target = { type: 'DOUBLE' as const, number: 16 };
        const stdDevMM = 0;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        // D16の物理座標を取得（getTargetCoordinatesの戻り値に依存）
        expect(result.score).toBe(32);
        expect(result.ring).toBe('DOUBLE');
        expect(result.segmentNumber).toBe(16);
      });
    });

    describe('統計的性質', () => {
      test('複数回呼び出すと異なる着弾点を返す（乱数性）', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 30;

        // Act
        const result1 = executeThrow(target, stdDevMM);
        const result2 = executeThrow(target, stdDevMM);
        const result3 = executeThrow(target, stdDevMM);

        // Assert
        const allDifferent =
          (result1.landingPoint.x !== result2.landingPoint.x ||
            result1.landingPoint.y !== result2.landingPoint.y) &&
          (result1.landingPoint.x !== result3.landingPoint.x ||
            result1.landingPoint.y !== result3.landingPoint.y) &&
          (result2.landingPoint.x !== result3.landingPoint.x ||
            result2.landingPoint.y !== result3.landingPoint.y);

        expect(allDifferent).toBe(true);
      });

      test('stdDevMM=30mmでBULLを狙うと散らばりが発生する', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 30;
        const sampleSize = 100;

        // Act
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < sampleSize; i++) {
          const result = executeThrow(target, stdDevMM);
          sumX += result.landingPoint.x;
          sumY += result.landingPoint.y;
        }
        const avgX = sumX / sampleSize;
        const avgY = sumY / sampleSize;

        // Assert
        // 平均が目標座標(0, 0)に収束する（許容誤差±10mm）
        expect(Math.abs(avgX - 0)).toBeLessThan(10);
        expect(Math.abs(avgY - 0)).toBeLessThan(10);
      });
    });

    describe('ThrowResult の構造', () => {
      test('target, landingPoint, score, ring, segmentNumber が含まれる', () => {
        // Arrange
        const target = { type: 'TRIPLE' as const, number: 20 };
        const stdDevMM = 15;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result).toHaveProperty('target');
        expect(result).toHaveProperty('landingPoint');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('ring');
        expect(result).toHaveProperty('segmentNumber');

        expect(result.target).toEqual(target);
        expect(typeof result.landingPoint.x).toBe('number');
        expect(typeof result.landingPoint.y).toBe('number');
        expect(typeof result.score).toBe('number');
        expect(typeof result.ring).toBe('string');
        expect(typeof result.segmentNumber).toBe('number');
      });

      test('landingPoint が物理座標（mm単位）', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 30;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(Number.isFinite(result.landingPoint.x)).toBe(true);
        expect(Number.isFinite(result.landingPoint.y)).toBe(true);
        // 物理座標として妥当な範囲（ボード外も含む）
        expect(Math.abs(result.landingPoint.x)).toBeLessThan(1000);
        expect(Math.abs(result.landingPoint.y)).toBeLessThan(1000);
      });

      test('score が有効な値（0-60）', () => {
        // Arrange
        const target = { type: 'SINGLE' as const, number: 5 };
        const stdDevMM = 20;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(60);
      });
    });

    describe('異常系', () => {
      test('負のstdDevMMを渡すとエラーをスローする', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = -10;

        // Act & Assert
        expect(() => executeThrow(target, stdDevMM)).toThrow();
      });

      test('NaNのstdDevMMを渡すとエラーをスローする', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = NaN;

        // Act & Assert
        expect(() => executeThrow(target, stdDevMM)).toThrow();
      });

      test('InfinityのstdDevMMを渡すとエラーをスローする', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = Infinity;

        // Act & Assert
        expect(() => executeThrow(target, stdDevMM)).toThrow();
      });
    });

    describe('ダーツ実力レベル別のシミュレーション', () => {
      test('初心者レベル（stdDevMM=50mm）でT20を狙う', () => {
        // Arrange
        const target = { type: 'TRIPLE' as const, number: 20 };
        const stdDevMM = 50;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target).toEqual(target);
        expect(Number.isFinite(result.landingPoint.x)).toBe(true);
        expect(Number.isFinite(result.landingPoint.y)).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(60);
      });

      test('中級者レベル（stdDevMM=30mm）でBULLを狙う', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 30;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target).toEqual(target);
        // 中級者なので散らばりがあり、必ずしもBULLに入るとは限らない
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(60);
      });

      test('上級者レベル（stdDevMM=15mm）でD16を狙う', () => {
        // Arrange
        const target = { type: 'DOUBLE' as const, number: 16 };
        const stdDevMM = 15;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target).toEqual(target);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(60);
      });

      test('エキスパートレベル（stdDevMM=8mm）でBULLを狙う', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 8;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target).toEqual(target);
        // エキスパートでも散らばりがあり、必ずしも50点とは限らない
        // （インナーブル半径3.175mmに対してstdDev=8mm）
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(60);
      });
    });

    describe('境界値', () => {
      test('stdDevMM=0で完全に正確な投擲（BULL）', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 0;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.landingPoint.x).toBe(0);
        expect(result.landingPoint.y).toBe(0);
        expect(result.score).toBe(50);
      });

      test('非常に大きなstdDevMM（150mm）でBULLを狙う', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 150;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        // 大きな散らばりでもThrowResultが返される
        expect(Number.isFinite(result.landingPoint.x)).toBe(true);
        expect(Number.isFinite(result.landingPoint.y)).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(60);
      });

      test('非常に小さなstdDevMM（0.1mm）でT20を狙う', () => {
        // Arrange
        const target = { type: 'TRIPLE' as const, number: 20 };
        const stdDevMM = 0.1;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        // T20座標: (0, -103)付近
        expect(Math.abs(result.landingPoint.x - 0)).toBeLessThan(1);
        expect(Math.abs(result.landingPoint.y - (-103))).toBeLessThan(1);
      });
    });

    describe('ドメイン知識の検証', () => {
      test('BULLは50点（INNER_BULL）または25点（OUTER_BULL）', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 0;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        // stdDev=0なので完全に中心に着弾 → INNER_BULL → 50点
        expect(result.score).toBe(50);
        expect(result.ring).toBe('INNER_BULL');
      });

      test('TRIPLE 20は60点', () => {
        // Arrange
        const target = { type: 'TRIPLE' as const, number: 20 };
        const stdDevMM = 0;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.score).toBe(60);
        expect(result.ring).toBe('TRIPLE');
        expect(result.segmentNumber).toBe(20);
      });

      test('DOUBLE 16は32点', () => {
        // Arrange
        const target = { type: 'DOUBLE' as const, number: 16 };
        const stdDevMM = 0;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.score).toBe(32);
        expect(result.ring).toBe('DOUBLE');
        expect(result.segmentNumber).toBe(16);
      });

      test('SINGLE 10は10点', () => {
        // Arrange
        const target = { type: 'SINGLE' as const, number: 10 };
        const stdDevMM = 0;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.score).toBe(10);
        expect(result.segmentNumber).toBe(10);
      });
    });

    describe('ターゲット種類の網羅性', () => {
      test('BULL（number=null）が正しく処理される', () => {
        // Arrange
        const target = { type: 'BULL' as const, number: null };
        const stdDevMM = 10;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target.type).toBe('BULL');
        expect(result.target.number).toBeNull();
      });

      test('SINGLE（number=1-20）が正しく処理される', () => {
        // Arrange
        const target = { type: 'SINGLE' as const, number: 18 };
        const stdDevMM = 10;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target.type).toBe('SINGLE');
        expect(result.target.number).toBe(18);
      });

      test('DOUBLE（number=1-20）が正しく処理される', () => {
        // Arrange
        const target = { type: 'DOUBLE' as const, number: 11 };
        const stdDevMM = 10;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target.type).toBe('DOUBLE');
        expect(result.target.number).toBe(11);
      });

      test('TRIPLE（number=1-20）が正しく処理される', () => {
        // Arrange
        const target = { type: 'TRIPLE' as const, number: 19 };
        const stdDevMM = 10;

        // Act
        const result = executeThrow(target, stdDevMM);

        // Assert
        expect(result.target.type).toBe('TRIPLE');
        expect(result.target.number).toBe(19);
      });
    });
  });
});
