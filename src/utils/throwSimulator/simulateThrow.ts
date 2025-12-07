/**
 * ダーツの投擲をシミュレーションする
 *
 * プレイヤーの技術レベル（標準偏差）に基づいて、
 * 目標座標からの散らばりを持った着弾点を生成する。
 *
 * @param targetX - 狙った目標のX座標（物理座標、mm単位）
 * @param targetY - 狙った目標のY座標（物理座標、mm単位）
 * @param stdDevMM - プレイヤーの技術レベルを表す標準偏差（mm単位）
 *                   - 初心者: 50mm
 *                   - 中級者: 30mm
 *                   - 上級者: 15mm
 *                   - エキスパート: 8mm
 * @returns {x, y} - 実際の着弾点の座標（物理座標、mm単位）
 * @throws {Error} - 入力が不正な場合（NaN、Infinity、負のstdDevMMなど）
 */

import { generateNormalDistribution } from './generateNormalDistribution.js';

export function simulateThrow(
  targetX: number,
  targetY: number,
  stdDevMM: number
): { x: number; y: number } {
  // 入力バリデーション
  if (!Number.isFinite(targetX)) {
    throw new Error('targetX must be a finite number');
  }
  if (!Number.isFinite(targetY)) {
    throw new Error('targetY must be a finite number');
  }
  if (!Number.isFinite(stdDevMM)) {
    throw new Error('stdDevMM must be a finite number');
  }
  if (stdDevMM < 0) {
    throw new Error('stdDevMM must be non-negative');
  }

  // stdDevMM=0の場合は完全に正確な投擲（目標座標そのものを返す）
  if (stdDevMM === 0) {
    return { x: targetX, y: targetY };
  }

  // 2次元正規分布で散らばりを生成
  // 平均0、標準偏差stdDevMMの正規分布から (offsetX, offsetY) を取得
  const offset = generateNormalDistribution(0, stdDevMM);

  // 目標座標にオフセットを加えて着弾点を計算
  const x = targetX + offset.x;
  const y = targetY + offset.y;

  return { x, y };
}
