/**
 * 有効な1ラウンド（3投）の合計得点の集合を生成・保持する
 */

import { VALID_SCORES } from './validScores.js';

/**
 * 有効な1ラウンド（3投）の合計得点の集合を生成する
 * @returns 有効な合計得点のSet
 */
function generateValidRoundScores(): Set<number> {
  const validRoundScores = new Set<number>();

  // VALID_SCORESの全要素を3重ループで組み合わせ
  const scoresArray = Array.from(VALID_SCORES);

  for (const score1 of scoresArray) {
    for (const score2 of scoresArray) {
      for (const score3 of scoresArray) {
        const total = score1 + score2 + score3;
        validRoundScores.add(total);
      }
    }
  }

  return validRoundScores;
}

// 有効な1ラウンド合計得点の集合を事前生成（モジュールロード時に1度だけ実行）
export const VALID_ROUND_SCORES = generateValidRoundScores();
