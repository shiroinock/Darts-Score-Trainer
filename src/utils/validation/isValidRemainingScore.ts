/**
 * 01ゲームの残り点数として有効かどうかを判定する
 *
 * @param remaining - 現在の残り点数
 * @param current - 今回のラウンドの得点
 * @returns 有効な残り点数遷移の場合true、バストまたは無効の場合false
 *
 * バストまたは無効となるケース:
 * - remaining が整数でない（NaN, Infinity, 浮動小数点数）
 * - current が整数でない（NaN, Infinity, 浮動小数点数）
 * - remaining < 0（既にバスト状態）
 * - current < 0（無効な得点）
 * - remaining - current < 0（オーバー・バスト）
 * - remaining - current === 1（ダブルアウト不可能）
 *
 * 有効なケース:
 * - remaining - current >= 2（ダブルアウトでフィニッシュ可能）
 * - remaining - current === 0（既にフィニッシュ済み）
 */

export function isValidRemainingScore(remaining: number, current: number): boolean {
  // 特殊な数値（NaN, Infinity, -Infinity）は無効
  if (!Number.isFinite(remaining)) {
    return false;
  }

  if (!Number.isFinite(current)) {
    return false;
  }

  // 整数でない場合は無効
  if (!Number.isInteger(remaining)) {
    return false;
  }

  if (!Number.isInteger(current)) {
    return false;
  }

  // 現在の残り点数が負の数（既にバスト状態）
  if (remaining < 0) {
    return false;
  }

  // 今回の得点が負の数（無効な得点）
  if (current < 0) {
    return false;
  }

  // 新しい残り点数を計算
  const newRemaining = remaining - current;

  // オーバー・バスト（残りが負になる）
  if (newRemaining < 0) {
    return false;
  }

  // ダブルアウト不可能（残りが1点になる）
  if (newRemaining === 1) {
    return false;
  }

  return true;
}
