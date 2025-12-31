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
  /**
   * 問題フェーズ（3投モードの出題タイミング情報）
   *
   * 3投モードにおける出題のタイミングと種類を示します：
   * - bust（バスト判定）: 1本目・2本目の後にバスト判定を2択で問う
   * - score（合計点数）: 3本目の後に合計点数を問う
   */
  questionPhase?: { type: 'bust'; throwIndex: 1 | 2 } | { type: 'score'; throwIndex: 3 };
}
