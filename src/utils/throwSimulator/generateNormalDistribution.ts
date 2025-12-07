/**
 * Box-Muller法を使用して2次元正規分布に従う乱数ペアを生成する
 *
 * @param mean - 平均値（物理座標のmm単位）
 * @param stdDev - 標準偏差（mm単位）
 * @returns {x: number, y: number} - 2次元正規分布に従う座標ペア
 * @throws {Error} stdDev < 0 または NaN/Infinity の場合
 */

export function generateNormalDistribution(
  mean: number,
  stdDev: number
): { x: number; y: number } {
  // 入力検証
  if (!Number.isFinite(mean)) {
    throw new Error('mean must be a finite number');
  }
  if (!Number.isFinite(stdDev)) {
    throw new Error('stdDev must be a finite number');
  }
  if (stdDev < 0) {
    throw new Error('stdDev must be non-negative');
  }

  // 特殊ケース: stdDev = 0
  if (stdDev === 0) {
    return { x: mean, y: mean };
  }

  // Box-Muller法による2次元正規分布の生成
  // 1. 2つの独立した一様乱数 u1, u2 を生成 (0, 1)
  const u1 = Math.random();
  const u2 = Math.random();

  // 2. 極座標形式で標準正規分布を生成
  // z1 = sqrt(-2 * ln(u1)) * cos(2π * u2)
  // z2 = sqrt(-2 * ln(u1)) * sin(2π * u2)
  const r = Math.sqrt(-2 * Math.log(u1));
  const theta = 2 * Math.PI * u2;
  const z1 = r * Math.cos(theta);
  const z2 = r * Math.sin(theta);

  // 3. 平均と標準偏差でスケーリング
  // x = mean + z1 * stdDev
  // y = mean + z2 * stdDev
  const x = mean + z1 * stdDev;
  const y = mean + z2 * stdDev;

  return { x, y };
}
