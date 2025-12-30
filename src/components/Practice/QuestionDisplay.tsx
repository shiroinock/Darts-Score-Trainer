/**
 * QuestionDisplay - 問題表示コンポーネント
 *
 * 現在の問題文と関連情報を表示します。
 * - questionType（score/remaining/both）に応じた問題文
 * - 3投モード時の投擲単位表示（「1本目」「2本目」「3本目」）
 * - 累積モード時の「合計」表示
 */

import './QuestionDisplay.css';
import { useGameStore } from '../../stores/gameStore';

/**
 * 問題文の定数
 */
const QUESTION_TEXTS = {
  SCORE_SINGLE: 'この投擲の得点は？',
  SCORE_TRIPLE: '3投の合計得点は？',
  REMAINING: '残り点数は？',
} as const;

/**
 * 投擲インデックスから表示テキストを生成する
 * @param zeroBasedIndex - 投擲インデックス（0始まり: 0, 1, 2）
 * @returns 投擲単位の表示文字列（例: "1本目", "2本目", "3本目"）
 */
function getThrowLabel(zeroBasedIndex: number): string {
  return `${zeroBasedIndex + 1}本目`;
}

/**
 * 問題表示コンポーネント
 */
export function QuestionDisplay(): JSX.Element {
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const throwUnit = useGameStore((state) => state.config.throwUnit);
  const questionType = useGameStore((state) => state.config.questionType);
  const judgmentTiming = useGameStore((state) => state.config.judgmentTiming);
  const currentThrowIndex = useGameStore((state) => state.currentThrowIndex);

  // 問題が存在しない場合は空の表示
  if (!currentQuestion) {
    return (
      <section className="question-display" aria-label="問題表示">
        <p className="question-display__text">問題を生成中...</p>
      </section>
    );
  }

  // 投擲単位表示の判定と生成（境界値検証を含む）
  const zeroBasedIndex = currentThrowIndex - 1;
  let throwLabel: string | null = null;
  if (throwUnit === 3) {
    // 境界値検証: 0-2の範囲外の場合は警告し、nullを返す
    if (zeroBasedIndex < 0 || zeroBasedIndex >= 3) {
      console.warn(`Invalid currentThrowIndex: ${currentThrowIndex} (expected 1-3)`);
    } else {
      throwLabel = getThrowLabel(zeroBasedIndex);
    }
  }

  // 累積表示の判定（独立モードでない かつ 3投モード）
  const showCumulativeLabel = judgmentTiming === 'cumulative' && throwUnit === 3;

  return (
    <section className="question-display" aria-label="問題表示">
      {/* 投擲単位表示（3投モードのみ） */}
      {throwLabel && <p className="question-display__throw-label">{throwLabel}</p>}

      {/* 累積ラベル表示 */}
      {showCumulativeLabel && <p className="question-display__cumulative-label">合計</p>}

      {/* 問題文表示 */}
      <div className="question-display__questions">
        {/* scoreモード、またはbothモードでscoreを含む場合 */}
        {(questionType === 'score' || questionType === 'both') && (
          <h3 className="question-display__text">
            {throwUnit === 1 ? QUESTION_TEXTS.SCORE_SINGLE : QUESTION_TEXTS.SCORE_TRIPLE}
          </h3>
        )}

        {/* remainingモード、またはbothモードでremainingを含む場合 */}
        {(questionType === 'remaining' || questionType === 'both') && (
          <h3 className="question-display__text">{QUESTION_TEXTS.REMAINING}</h3>
        )}
      </div>
    </section>
  );
}
