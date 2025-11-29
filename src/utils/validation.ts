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
const VALID_ROUND_SCORES = generateValidRoundScores();

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

/**
 * 1ラウンド（3投）の合計得点として有効かどうかを判定する
 *
 * @param score - 判定対象の合計得点
 * @returns 有効な得点の場合true、それ以外はfalse
 *
 * 有効な得点:
 * - 0-180の整数値のうち、3投の組み合わせで取りうる値
 * - 0点（3投全てボード外）から180点（T20 + T20 + T20）まで
 *
 * 無効な得点:
 * - 負の数
 * - 181以上
 * - 浮動小数点数（整数でない）
 * - NaN, Infinity, -Infinity
 * - 取りえない値（163, 166, 169, 172, 173, 175, 176, 178, 179）
 */
export function isValidRoundScore(score: number): boolean {
  // 特殊な数値（NaN, Infinity, -Infinity）は無効
  if (!Number.isFinite(score)) {
    return false;
  }

  // 整数でない場合は無効
  if (!Number.isInteger(score)) {
    return false;
  }

  // 有効な1ラウンド合計得点の集合に含まれているかチェック
  return VALID_ROUND_SCORES.has(score);
}

/**
 * 1投で取りうる全ての有効な得点の集合を取得する
 *
 * @returns 有効な得点のSet（44個の要素を含む）
 *
 * 含まれる得点:
 * - 0点（ボード外）
 * - 1-20点（シングル）
 * - 2-40の全ての偶数（ダブル）
 * - セグメント1-20の3倍（トリプル: 3, 6, 9, ..., 60）
 * - 25点（アウターブル）
 * - 50点（インナーブル）
 *
 * 不変性:
 * - 返されたSetを変更しても内部状態には影響しない
 * - 複数回呼び出しで同じ内容が返される
 */
export function getValidSingleScores(): Set<number> {
  // 新しいSetを返すことで不変性を保証
  return new Set(VALID_SCORES);
}

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
