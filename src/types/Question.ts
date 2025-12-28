import type { BustInfo } from './BustInfo';
import type { QuestionType } from './QuestionType';
import type { ThrowResult } from './ThrowResult';

/**
 * 問題データ
 *
 * 1つの問題を表現します。
 * 投擲結果と正解、問題文を含みます。
 */
export interface Question {
  /** 問題モード */
  mode: QuestionType;
  /** 投擲結果の配列（1投 or 3投） */
  throws: ThrowResult[];
  /** 正解の数値 */
  correctAnswer: number;
  /** 問題文（表示用） */
  questionText: string;
  /** 開始点数（remainingモードの場合） */
  startingScore?: number;
  /** バスト情報（バストが発生した場合） */
  bustInfo?: BustInfo;
}
