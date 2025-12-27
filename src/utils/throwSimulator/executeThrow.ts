/**
 * ターゲットと標準偏差からダーツの投擲を実行する
 *
 * Target型のオブジェクトを受け取り、投擲結果（ThrowResult）を返す。
 * 以下の処理を行う：
 * 1. ターゲットから物理座標を取得
 * 2. 散らばりを持った着弾点をシミュレーション
 * 3. 着弾点から得点とリング情報を計算
 * 4. ThrowResultを構築
 *
 * @param target - 狙うターゲット（type, number）
 * @param stdDevMM - プレイヤーの技術レベルを表す標準偏差（mm単位）
 * @returns ThrowResult - 投擲結果（target, landingPoint, score, ring, segmentNumber）
 * @throws {Error} - stdDevMMが不正な場合、またはターゲットが無効な場合
 */

import type { Target, ThrowResult } from '../../types/index.js';
import { coordinateToScoreDetail } from '../scoreCalculator/index.js';
import { getTargetCoordinates } from '../targetCoordinates/index.js';
import { simulateThrow } from './simulateThrow.js';

export function executeThrow(target: Target, stdDevMM: number): ThrowResult {
  // 1. ターゲットから物理座標を取得
  const targetCoords = getTargetCoordinates(target.type, target.number);

  // 2. 散らばりを持った着弾点をシミュレーション
  const landingPoint = simulateThrow(targetCoords.x, targetCoords.y, stdDevMM);

  // 3. 着弾点から得点とリング情報を計算
  const scoreDetail = coordinateToScoreDetail(landingPoint.x, landingPoint.y);

  // 4. ThrowResultを構築
  return {
    target,
    landingPoint,
    score: scoreDetail.score,
    ring: scoreDetail.ring,
    segmentNumber: scoreDetail.segmentNumber,
  };
}
