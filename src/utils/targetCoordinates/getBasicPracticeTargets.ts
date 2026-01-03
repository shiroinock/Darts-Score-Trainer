/**
 * 基礎練習用の62ターゲットを拡張フォーマットで生成
 *
 * INNER_SINGLEを除外し、出題範囲を制限することで
 * 初心者向けの基礎練習の効率を向上させます。
 *
 * 62ターゲットの内訳:
 * - OUTER_SINGLE 1-20 (20個)
 * - DOUBLE 1-20 (20個)
 * - TRIPLE 1-20 (20個)
 * - INNER_BULL (1個)
 * - OUTER_BULL (1個)
 *
 * @returns 基礎練習用の62ターゲットの配列
 */

import type { ExpandedTarget, RingType } from '../../types/index.js';
import { TARGET_RADII } from '../constants/index.js';
import { getSegmentAngle } from './getSegmentAngle.js';

/**
 * RingTypeに対応するラベルプレフィックスを取得
 */
function getLabelPrefix(ringType: RingType): string {
  switch (ringType) {
    case 'OUTER_SINGLE':
      return 'OS';
    case 'DOUBLE':
      return 'D';
    case 'TRIPLE':
      return 'T';
    default:
      throw new Error(`Unexpected ringType for label prefix: ${ringType}`);
  }
}

/**
 * RingTypeに対応する半径を取得
 */
function getRadius(ringType: RingType): number {
  switch (ringType) {
    case 'OUTER_SINGLE':
      return TARGET_RADII.SINGLE_OUTER;
    case 'TRIPLE':
      return TARGET_RADII.TRIPLE;
    case 'DOUBLE':
      return TARGET_RADII.DOUBLE;
    case 'INNER_BULL':
    case 'OUTER_BULL':
      return 0; // 原点
    default:
      throw new Error(`Unexpected ringType for radius: ${ringType}`);
  }
}

/**
 * スコアを計算
 */
function calculateScore(ringType: RingType, number: number): number {
  switch (ringType) {
    case 'OUTER_SINGLE':
      return number;
    case 'DOUBLE':
      return number * 2;
    case 'TRIPLE':
      return number * 3;
    case 'INNER_BULL':
      return 50;
    case 'OUTER_BULL':
      return 25;
    default:
      throw new Error(`Unexpected ringType for score: ${ringType}`);
  }
}

/**
 * 特定のRingTypeに対する全20セグメントのターゲットを生成
 */
function generateSegmentTargets(ringType: RingType): ExpandedTarget[] {
  const targets: ExpandedTarget[] = [];
  const radius = getRadius(ringType);
  const labelPrefix = getLabelPrefix(ringType);

  for (let number = 1; number <= 20; number++) {
    const angle = getSegmentAngle(number);
    const x = radius * Math.sin(angle);
    const y = -radius * Math.cos(angle);

    targets.push({
      ringType,
      number,
      x,
      y,
      label: `${labelPrefix}${number}`,
      score: calculateScore(ringType, number),
    });
  }

  return targets;
}

/**
 * 基礎練習用の62ターゲットを返す
 */
export function getBasicPracticeTargets(): ExpandedTarget[] {
  const targets: ExpandedTarget[] = [];

  // OUTER_SINGLE (20個)
  targets.push(...generateSegmentTargets('OUTER_SINGLE'));

  // DOUBLE (20個)
  targets.push(...generateSegmentTargets('DOUBLE'));

  // TRIPLE (20個)
  targets.push(...generateSegmentTargets('TRIPLE'));

  // INNER_BULL (1個)
  targets.push({
    ringType: 'INNER_BULL',
    number: 0,
    x: 0,
    y: 0,
    label: 'BULL',
    score: 50,
  });

  // OUTER_BULL (1個)
  // OUTER_BULLの代表座標を12時方向（y負方向）に配置
  targets.push({
    ringType: 'OUTER_BULL',
    number: 0,
    x: 0,
    y: -TARGET_RADII.OUTER_BULL_REPRESENTATIVE,
    label: '25',
    score: 25,
  });

  return targets;
}
