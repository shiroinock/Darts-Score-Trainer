import { CHECKOUT_MAX_SINGLE_DART_SCORE, CHECKOUT_MIN_SCORE } from '../constants/gameRules';

/**
 * インナーブル（ダブルブル）のスコア
 */
const INNER_BULL_SCORE = 50;

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
  if (remainingScore === INNER_BULL_SCORE) {
    return true;
  }

  // CHECKOUT_MIN_SCORE(2)-CHECKOUT_MAX_SINGLE_DART_SCORE(40)の偶数の場合はD1-D20でフィニッシュ可能
  if (remainingScore >= CHECKOUT_MIN_SCORE && remainingScore <= CHECKOUT_MAX_SINGLE_DART_SCORE) {
    return true;
  }

  // それ以外（40超50未満の偶数、50超の偶数）はフィニッシュ不可能
  return false;
}
