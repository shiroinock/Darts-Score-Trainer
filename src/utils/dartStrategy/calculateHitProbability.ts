/**
 * calculateHitProbability - ターゲットエリアへのヒット確率を計算
 *
 * プレイヤーの実力（標準偏差 stdDevMM）を考慮して、
 * 特定のターゲットエリアへのヒット成功確率を計算します。
 *
 * モンテカルロシミュレーションを使用して、2次元正規分布に従う
 * 大量のサンプル点を生成し、ターゲットエリアに入る割合を計算します。
 */

import { BOARD_PHYSICAL, MAX_SEGMENT_NUMBER, MIN_SEGMENT_NUMBER } from '../constants/index.js';
import { getSegmentNumber } from '../scoreCalculator/getSegmentNumber.js';
import { generateNormalDistribution } from '../throwSimulator/generateNormalDistribution.js';

/**
 * 定数定義
 */
const MONTE_CARLO_SAMPLES = 10000; // モンテカルロシミュレーションのサンプル数
const MIN_STD_DEV_EXCLUSIVE = 0; // 標準偏差の最小値（この値は含まない）

/**
 * エリアタイプ定義（テストで使用される文字列型）
 */
export type AreaType = 'INNER_BULL' | 'OUTER_BULL' | 'TRIPLE' | 'DOUBLE' | 'SINGLE';

/**
 * エリアタイプがBULL系かどうかを判定
 */
const isBullAreaType = (areaType: AreaType): areaType is 'INNER_BULL' | 'OUTER_BULL' => {
  return areaType === 'INNER_BULL' || areaType === 'OUTER_BULL';
};

/**
 * エリアタイプがセグメントを必要とするかどうかを判定
 */
const requiresSegmentNumber = (areaType: AreaType): areaType is 'TRIPLE' | 'DOUBLE' | 'SINGLE' => {
  return areaType === 'TRIPLE' || areaType === 'DOUBLE' || areaType === 'SINGLE';
};

/**
 * 有効なエリアタイプかどうかを判定
 */
const isValidAreaType = (areaType: string): areaType is AreaType => {
  return ['INNER_BULL', 'OUTER_BULL', 'TRIPLE', 'DOUBLE', 'SINGLE'].includes(areaType);
};

/**
 * ターゲットエリアへのヒット確率を計算
 *
 * @param targetX - 狙う座標のX座標（mm、ボード中心が原点）
 * @param targetY - 狙う座標のY座標（mm、ボード中心が原点）
 * @param stdDevMM - プレイヤーの実力を表す標準偏差（mm単位）
 * @param areaType - ターゲットエリアの種類
 * @param segmentNumber - セグメント番号（1-20）。TRIPLE/DOUBLE/SINGLEの場合は必須
 * @returns ヒット確率（0.0〜1.0）
 * @throws {Error} 無効な入力値の場合
 */
export function calculateHitProbability(
  targetX: number,
  targetY: number,
  stdDevMM: number,
  areaType: AreaType,
  segmentNumber?: number
): number {
  // 入力値のバリデーション
  validateInputs(targetX, targetY, stdDevMM, areaType, segmentNumber);

  // モンテカルロシミュレーション
  let hitCount = 0;

  for (let i = 0; i < MONTE_CARLO_SAMPLES; i++) {
    // 2次元正規分布に従う座標を生成
    // 狙う座標を中心（mean）とし、標準偏差で散らばりを表現
    const offset = generateNormalDistribution(0, stdDevMM);
    const landedX = targetX + offset.x;
    const landedY = targetY + offset.y;

    // 着地点がターゲットエリアに含まれるかチェック
    if (isInTargetArea(landedX, landedY, areaType, segmentNumber)) {
      hitCount++;
    }
  }

  return hitCount / MONTE_CARLO_SAMPLES;
}

/**
 * 入力値のバリデーション
 */
function validateInputs(
  targetX: number,
  targetY: number,
  stdDevMM: number,
  areaType: AreaType,
  segmentNumber?: number
): void {
  // targetX, targetYの検証
  if (!Number.isFinite(targetX)) {
    throw new Error(`Invalid targetX: ${targetX}. Must be a finite number.`);
  }
  if (!Number.isFinite(targetY)) {
    throw new Error(`Invalid targetY: ${targetY}. Must be a finite number.`);
  }

  // stdDevMMの検証
  if (!Number.isFinite(stdDevMM) || stdDevMM <= MIN_STD_DEV_EXCLUSIVE) {
    throw new Error(
      `Invalid stdDevMM: ${stdDevMM}. Must be a finite positive number greater than ${MIN_STD_DEV_EXCLUSIVE}.`
    );
  }

  // areaTypeの検証
  if (!isValidAreaType(areaType)) {
    throw new Error(
      `Invalid areaType: ${areaType}. Must be one of: INNER_BULL, OUTER_BULL, TRIPLE, DOUBLE, SINGLE.`
    );
  }

  // segmentNumberの検証
  if (isBullAreaType(areaType)) {
    // BULL系はsegmentNumberが不要
    if (segmentNumber !== undefined) {
      throw new Error(`areaType ${areaType} does not accept segmentNumber.`);
    }
  } else if (requiresSegmentNumber(areaType)) {
    // TRIPLE/DOUBLE/SINGLEはsegmentNumberが必須
    if (segmentNumber === undefined) {
      throw new Error(`areaType ${areaType} requires segmentNumber.`);
    }
    if (
      !Number.isInteger(segmentNumber) ||
      segmentNumber < MIN_SEGMENT_NUMBER ||
      segmentNumber > MAX_SEGMENT_NUMBER
    ) {
      throw new Error(
        `Invalid segmentNumber: ${segmentNumber}. Must be an integer between ${MIN_SEGMENT_NUMBER} and ${MAX_SEGMENT_NUMBER}.`
      );
    }
  }
}

/**
 * 座標がターゲットエリアに含まれるかチェック
 */
function isInTargetArea(x: number, y: number, areaType: AreaType, segmentNumber?: number): boolean {
  const distance = Math.sqrt(x * x + y * y);

  // エリアタイプごとの判定
  switch (areaType) {
    case 'INNER_BULL':
      return distance <= BOARD_PHYSICAL.rings.innerBull;

    case 'OUTER_BULL':
      // アウターブルはインナーブルの外側からouterBullまで
      return (
        distance > BOARD_PHYSICAL.rings.innerBull && distance <= BOARD_PHYSICAL.rings.outerBull
      );

    case 'TRIPLE': {
      // validateInputsでチェック済みのため、segmentNumberは必ずnumber型
      if (typeof segmentNumber !== 'number') {
        throw new Error('Unexpected: segmentNumber is required for TRIPLE');
      }
      return isInSegmentedRing(
        x,
        y,
        distance,
        BOARD_PHYSICAL.rings.tripleInner,
        BOARD_PHYSICAL.rings.tripleOuter,
        segmentNumber
      );
    }

    case 'DOUBLE': {
      // validateInputsでチェック済みのため、segmentNumberは必ずnumber型
      if (typeof segmentNumber !== 'number') {
        throw new Error('Unexpected: segmentNumber is required for DOUBLE');
      }
      return isInSegmentedRing(
        x,
        y,
        distance,
        BOARD_PHYSICAL.rings.doubleInner,
        BOARD_PHYSICAL.rings.doubleOuter,
        segmentNumber
      );
    }

    case 'SINGLE': {
      // validateInputsでチェック済みのため、segmentNumberは必ずnumber型
      if (typeof segmentNumber !== 'number') {
        throw new Error('Unexpected: segmentNumber is required for SINGLE');
      }

      // シングルエリアは2つの範囲がある
      // 1. インナーシングル: OUTER_BULL〜TRIPLE_INNER
      // 2. アウターシングル: TRIPLE_OUTER〜DOUBLE_INNER
      const isInnerSingle =
        distance > BOARD_PHYSICAL.rings.outerBull && distance <= BOARD_PHYSICAL.rings.tripleInner;
      const isOuterSingle =
        distance > BOARD_PHYSICAL.rings.tripleOuter && distance <= BOARD_PHYSICAL.rings.doubleInner;

      if (!isInnerSingle && !isOuterSingle) {
        return false;
      }

      // セグメント判定
      return isInSegment(x, y, segmentNumber);
    }

    default:
      return false;
  }
}

/**
 * セグメント化されたリング内にあるかチェック
 */
function isInSegmentedRing(
  x: number,
  y: number,
  distance: number,
  innerRadius: number,
  outerRadius: number,
  segmentNumber: number
): boolean {
  // リング範囲チェック
  if (distance <= innerRadius || distance > outerRadius) {
    return false;
  }

  // セグメントチェック
  return isInSegment(x, y, segmentNumber);
}

/**
 * 指定されたセグメント内にあるかチェック
 */
function isInSegment(x: number, y: number, targetSegmentNumber: number): boolean {
  // 座標から角度を計算
  // Math.atan2(y, x)はX軸正方向が0、反時計回りが正
  // ダーツボード座標系ではY軸負方向（真上）が0、時計回りが正
  //
  // 変換式:
  // - X軸正方向(0°) → Y軸負方向から90°
  // - Y軸負方向(-90°) → Y軸負方向から0°
  // - X軸負方向(-180°) → Y軸負方向から-90° = 270°
  // - Y軸正方向(90°) → Y軸負方向から180°
  //
  // Math.atan2の角度 → ダーツボード角度の変換:
  // atan2(y, x)が-90°のとき（真上）、dartBoard角度は0°
  // dartBoard角度 = atan2(x, -y) （xとyを入れ替え、yを反転）
  const dartBoardAngle = Math.atan2(x, -y);

  // 座標のセグメント番号を取得
  const actualSegmentNumber = getSegmentNumber(dartBoardAngle);

  return actualSegmentNumber === targetSegmentNumber;
}
