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
