/**
 * 全てのダーツターゲット（61個）を生成する
 *
 * ダーツボード上の全ての狙える位置を返します：
 * - SINGLE 1-20 (20個)
 * - DOUBLE 1-20 (20個)
 * - TRIPLE 1-20 (20個)
 * - BULL (1個)
 *
 * @returns 全ターゲットの配列（合計61個）
 */

import type { Target } from '../../types/index.js';

export function getAllTargets(): Target[] {
  const targets: Target[] = [];

  // セグメント1-20の各タイプ（SINGLE, DOUBLE, TRIPLE）を生成
  for (let num = 1; num <= 20; num++) {
    // SINGLE
    targets.push({
      type: 'SINGLE',
      number: num,
      label: `S${num}`,
    });

    // DOUBLE
    targets.push({
      type: 'DOUBLE',
      number: num,
      label: `D${num}`,
    });

    // TRIPLE
    targets.push({
      type: 'TRIPLE',
      number: num,
      label: `T${num}`,
    });
  }

  // BULL
  targets.push({
    type: 'BULL',
    number: null,
    label: 'BULL',
  });

  return targets;
}
