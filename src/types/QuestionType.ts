/**
 * 問題タイプ
 *
 * 練習時に何を問うかを指定します。
 */
export type QuestionType =
  | 'score'      // 得点を問う
  | 'remaining'  // 残り点数を問う
  | 'both';      // 両方問う
