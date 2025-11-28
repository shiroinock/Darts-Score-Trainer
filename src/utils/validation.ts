/**
 * ダーツの得点バリデーション関数
 */

/**
 * 有効な1投の得点の集合を生成する
 * @returns 有効な得点のSet
 */
function generateValidScores(): Set<number> {
  const validScores = new Set<number>();

  // 0点（ボード外）
  validScores.add(0);

  // シングル（1-20）
  for (let i = 1; i <= 20; i++) {
    validScores.add(i);
  }

  // ダブル（各セグメント1-20の2倍）
  for (let i = 1; i <= 20; i++) {
    validScores.add(i * 2);
  }

  // トリプル（各セグメント1-20の3倍）
  for (let i = 1; i <= 20; i++) {
    validScores.add(i * 3);
  }

  // ブル
  validScores.add(25); // アウターブル
  validScores.add(50); // インナーブル

  return validScores;
}

// 有効な得点の集合を事前生成（モジュールロード時に1度だけ実行）
const VALID_SCORES = generateValidScores();

/**
 * 1投の得点として有効かどうかを判定する
 *
 * @param score - 判定対象の得点
 * @returns 有効な得点の場合true、それ以外はfalse
 *
 * 有効な得点:
 * - 0点（ボード外）
 * - 1-20点（シングル）
 * - 2-40の偶数（ダブル）
 * - 3-60の3の倍数（トリプル）
 * - 25点（アウターブル）
 * - 50点（インナーブル）
 *
 * 無効な得点:
 * - 負の数
 * - 61以上
 * - 浮動小数点数（整数でない）
 * - NaN, Infinity, -Infinity
 * - 取りえない値（23, 29, 31, 35, 37, 41, 43, 44, 46, 47, 49, 52, 53, 55, 56, 58, 59など）
 *
 * 注: 22, 26, 28は有効なダブルスコア（D11, D13, D14）
 */
export function isValidSingleThrowScore(score: number): boolean {
  // 特殊な数値（NaN, Infinity, -Infinity）は無効
  if (!Number.isFinite(score)) {
    return false;
  }

  // 整数でない場合は無効
  if (!Number.isInteger(score)) {
    return false;
  }

  // 有効な得点の集合に含まれているかチェック
  return VALID_SCORES.has(score);
}
