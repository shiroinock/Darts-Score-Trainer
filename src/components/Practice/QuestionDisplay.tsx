/**
 * QuestionDisplay - 問題表示コンポーネント
 *
 * 現在の問題文と関連情報を表示します。
 * - questionType（score/remaining/both）に応じた問題文
 * - 3投モード時の投擲単位表示（「1本目」「2本目」「3本目」）
 * - 累積モード時の「合計」表示
 */

import { useGameStore } from '../../stores/gameStore';

/**
 * 投擲インデックスから表示テキストを生成する
 * @param throwIndex - 投擲インデックス（0始まり）
 * @returns 投擲単位の表示文字列（例: "1本目", "2本目", "3本目"）
 */
function getThrowLabel(throwIndex: number): string {
  return `${throwIndex + 1}本目`;
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

  // 投擲単位表示の判定
  const showThrowLabel = throwUnit === 3;
  const throwLabel = showThrowLabel ? getThrowLabel(currentThrowIndex - 1) : null;

  // 累積表示の判定（独立モードでない かつ 3投モード）
  const showCumulativeLabel = judgmentTiming === 'cumulative' && throwUnit === 3;

  return (
    <section className="question-display" aria-label="問題表示">
      {/* 投擲単位表示（3投モードのみ） */}
      {showThrowLabel && throwLabel && (
        <p className="question-display__throw-label">{throwLabel}</p>
      )}

      {/* 累積ラベル表示 */}
      {showCumulativeLabel && <p className="question-display__cumulative-label">合計</p>}

      {/* 問題文表示 */}
      <div className="question-display__questions">
        {/* scoreモード、またはbothモードでscoreを含む場合 */}
        {(questionType === 'score' || questionType === 'both') && (
          <h3 className="question-display__text">
            {throwUnit === 1 ? 'この投擲の得点は？' : '3投の合計得点は？'}
          </h3>
        )}

        {/* remainingモード、またはbothモードでremainingを含む場合 */}
        {(questionType === 'remaining' || questionType === 'both') && (
          <h3 className="question-display__text">残り点数は？</h3>
        )}
      </div>
    </section>
  );
}
