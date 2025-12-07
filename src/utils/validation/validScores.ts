/**
 * 有効な1投の得点の集合を生成・保持する
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
export const VALID_SCORES = generateValidScores();
