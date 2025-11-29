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
  // 残り点数: 正の整数のみ（NaN、Infinity、浮動小数点、0以下はエラー）
  if (!Number.isFinite(remainingScore) || !Number.isInteger(remainingScore)) {
    throw new Error('残り点数は整数である必要があります');
  }

  if (remainingScore <= 0) {
    throw new Error('残り点数は正の整数である必要があります');
  }

  // 投擲点数: 0以上60以下の整数のみ（NaN、Infinity、浮動小数点、負数、61以上はエラー）
  if (!Number.isFinite(throwScore) || !Number.isInteger(throwScore)) {
    throw new Error('投擲点数は整数である必要があります');
  }

  if (throwScore < 0 || throwScore > 60) {
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

/**
 * 残り点数がダブルでフィニッシュ可能かを判定する
 *
 * @param remainingScore 残り点数（正の整数のみ）
 * @returns ダブルでフィニッシュ可能ならtrue、不可能ならfalse
 * @throws {Error} 入力値が不正な場合
 */
export function canFinishWithDouble(remainingScore: number): boolean {
  // 入力値の妥当性チェック
  if (!Number.isFinite(remainingScore) || !Number.isInteger(remainingScore)) {
    throw new Error('残り点数は整数である必要があります');
  }

  // 0以下の場合はフィニッシュ不可能
  if (remainingScore <= 0) {
    return false;
  }

  // 奇数の場合はフィニッシュ不可能（1点を含む）
  if (remainingScore % 2 !== 0) {
    return false;
  }

  // 50点の場合はBULL（インナーブル）でフィニッシュ可能
  if (remainingScore === 50) {
    return true;
  }

  // 2-40の偶数の場合はD1-D20でフィニッシュ可能
  if (remainingScore >= 2 && remainingScore <= 40) {
    return true;
  }

  // それ以外（40超50未満の偶数、50超の偶数）はフィニッシュ不可能
  return false;
}

/**
 * ゲームが終了したかを判定する
 *
 * @param remainingScore 残り点数（0以上の整数のみ）
 * @returns 残り0点ならtrue（ゲーム終了）、0より大きければfalse（ゲーム継続）
 * @throws {Error} 入力値が不正な場合
 */
export function isGameFinished(remainingScore: number): boolean {
  // 入力値の妥当性チェック
  // 1. Number.isFinite() - NaN, Infinityを検出
  // 2. Number.isInteger() - 浮動小数点を検出
  if (!Number.isFinite(remainingScore) || !Number.isInteger(remainingScore)) {
    throw new Error('残り点数は整数である必要があります');
  }

  // 3. 負の値チェック（0以上である必要がある）
  if (remainingScore < 0) {
    throw new Error('残り点数は0以上の整数である必要があります');
  }

  // 残り0点ならゲーム終了、0より大きければゲーム継続
  return remainingScore === 0;
}
