/**
 * Darts Score Trainer - ゲームロジック
 *
 * 01ゲームのバスト判定やゲーム進行に関するロジックを提供します。
 */

import type { BustInfo } from '../types';

/**
 * バスト判定を行う
 *
 * @param remainingScore 残り点数（正の整数のみ）
 * @param throwScore 投擲点数（0以上60以下の整数のみ）
 * @param isDouble ダブルで入ったかどうか
 * @returns バスト情報（バストの有無と理由）
 * @throws {Error} 入力値が不正な場合
 */
export function checkBust(
  remainingScore: number,
  throwScore: number,
  isDouble: boolean
): BustInfo {
  // 入力値の妥当性チェック
  // 残り点数: 正の整数のみ（0以下、浮動小数点はエラー）
  if (remainingScore <= 0 || !Number.isInteger(remainingScore)) {
    throw new Error('残り点数は正の整数である必要があります');
  }

  // 投擲点数: 0以上60以下の整数のみ（負数、61以上、浮動小数点はエラー）
  if (
    throwScore < 0 ||
    throwScore > 60 ||
    !Number.isInteger(throwScore)
  ) {
    throw new Error('投擲点数は0以上60以下の整数である必要があります');
  }

  // バスト判定の優先順位:
  // 1. オーバー: throwScore > remainingScore
  // 2. 1点になる: remainingScore - throwScore === 1
  // 3. ダブルアウト時のダブル外し: remainingScore - throwScore === 0 && !isDouble

  const newScore = remainingScore - throwScore;

  // 1. オーバー判定
  if (throwScore > remainingScore) {
    return {
      isBust: true,
      reason: 'over',
    };
  }

  // 2. 1点になる判定（フィニッシュ不可能）
  if (newScore === 1) {
    return {
      isBust: true,
      reason: 'finish_impossible',
    };
  }

  // 3. ダブルアウト時のダブル外し判定
  if (newScore === 0 && !isDouble) {
    return {
      isBust: true,
      reason: 'double_out_required',
    };
  }

  // 4. バストなし
  return {
    isBust: false,
    reason: null,
  };
}
