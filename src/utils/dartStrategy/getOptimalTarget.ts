import type { Target } from '../../types/Target';
import { CHECKOUT_TABLE } from '../constants/checkoutTable.js';
import { DEFAULT_TARGET } from '../constants/defaultTargets.js';
import { ONE_DART_FINISHABLE } from '../constants/finishableScores.js';

/**
 * 残り点数と投擲数に基づいて最適なターゲットを返す
 *
 * PDC標準チェックアウト表に基づく固定ルックアップテーブルを使用
 *
 * @param remainingScore - 残り点数（整数）
 * @param throwsRemaining - 残り投擲数（整数）
 * @returns 最適なターゲット、またはnull（フィニッシュ不可能な場合）
 * @throws {Error} 残り点数または残り投擲数が整数でない場合
 */
export const getOptimalTarget = (
  remainingScore: number,
  throwsRemaining: number
): Target | null => {
  // バリデーション: 残り点数が整数かチェック
  if (!Number.isInteger(remainingScore)) {
    throw new Error('残り点数は整数である必要があります');
  }

  // バリデーション: 残り投擲数が整数かチェック
  if (!Number.isInteger(throwsRemaining)) {
    throw new Error('残り投擲数は整数である必要があります');
  }

  // 残り投擲数が0以下の場合はnullを返す
  if (throwsRemaining <= 0) {
    return null;
  }

  // 0点（ゲーム終了）、1点（ダブルアウト不可能）、負の値はnullを返す
  if (remainingScore <= 0 || remainingScore === 1) {
    return null;
  }

  // 1投のみの場合: フィニッシュ可能な点数のみ
  if (throwsRemaining === 1) {
    if (ONE_DART_FINISHABLE.has(remainingScore)) {
      return CHECKOUT_TABLE[remainingScore];
    }
    return null; // フィニッシュ不可能
  }

  // 2投以上の場合: チェックアウト表にある場合はそれを返す
  if (remainingScore in CHECKOUT_TABLE) {
    return CHECKOUT_TABLE[remainingScore];
  }

  // 170点超や未定義の点数はデフォルトターゲット（T20）を返す
  return DEFAULT_TARGET;
};
