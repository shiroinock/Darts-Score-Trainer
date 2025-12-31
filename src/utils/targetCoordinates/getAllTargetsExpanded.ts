/**
 * ダーツボードの全82ターゲットを拡張フォーマットで生成
 *
 * 82ターゲットの内訳:
 * - INNER_SINGLE 1-20 (20個)
 * - OUTER_SINGLE 1-20 (20個)
 * - DOUBLE 1-20 (20個)
 * - TRIPLE 1-20 (20個)
 * - INNER_BULL (1個)
 * - OUTER_BULL (1個)
 *
 * @returns 全82ターゲットの配列
 */

import type { RingType } from '../../types/RingType.js';
import { BOARD_PHYSICAL, TARGET_RADII } from '../constants/index.js';
import { getSegmentAngle } from './getSegmentAngle.js';

/**
 * 拡張ターゲット情報
 */
export interface ExpandedTarget {
  ringType: RingType;
  number: number;
  x: number;
  y: number;
  label: string;
  score: number;
}

/**
 * RingTypeに対応するラベルプレフィックスを取得
 */
function getLabelPrefix(ringType: RingType): string {
  switch (ringType) {
    case 'INNER_SINGLE':
      return 'IS';
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
    case 'INNER_SINGLE':
      return TARGET_RADII.SINGLE_INNER;
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
    case 'INNER_SINGLE':
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
 * ダーツボードの全82ターゲットを返す
 */
export function getAllTargetsExpanded(): ExpandedTarget[] {
  const targets: ExpandedTarget[] = [];

  // INNER_SINGLE (20個)
  targets.push(...generateSegmentTargets('INNER_SINGLE'));

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
  // OUTER_BULLの代表座標は、INNER_BULL境界とOUTER_BULL境界の中間点
  // (6.35 + 16) / 2 = 11.175mm を12時方向（y負方向）に配置
  const outerBullRadius = (BOARD_PHYSICAL.rings.innerBull + BOARD_PHYSICAL.rings.outerBull) / 2;
  targets.push({
    ringType: 'OUTER_BULL',
    number: 0,
    x: 0,
    y: -outerBullRadius,
    label: '25',
    score: 25,
  });

  return targets;
}
