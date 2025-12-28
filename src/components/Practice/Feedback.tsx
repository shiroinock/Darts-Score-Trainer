/**
 * Feedback - フィードバック表示コンポーネント
 *
 * ユーザーの回答に対するフィードバックを表示します。
 * - 正解/不正解の表示（アイコン + テキスト）
 * - ユーザーの回答と正解の表示
 * - スコアラベル表示（例: T20 → 60点）
 * - 連続正解数表示（正解時）
 * - バスト表示
 * - 「次へ」ボタン
 * - ゲームクリア表示（0点到達時）
 */

import { useGameStore } from '../../stores/gameStore';
import type { ThrowResult } from '../../types';
import { FEEDBACK_ICONS } from '../../utils/constants/feedbackIcons';
import { isGameFinished } from '../../utils/gameLogic';
import { getScoreLabel } from '../../utils/scoreCalculator/getScoreLabel';

/**
 * 投擲結果からスコアラベルを生成する
 * @param throwResult - 投擲結果
 * @returns スコアラベル文字列（例: "T20", "D16", "BULL"）
 */
function formatThrowLabel(throwResult: ThrowResult): string {
  const ring = throwResult.ring;
  const segmentNumber = throwResult.segmentNumber ?? 0;

  if (!ring) {
    return `${throwResult.score}点`;
  }

  return getScoreLabel(ring, segmentNumber);
}

/**
 * 投擲結果のリストからスコア詳細を生成する
 * @param throws - 投擲結果の配列
 * @returns スコア詳細文字列（例: "T20 (60点) + D20 (40点) = 100点"）
 */
function formatScoreDetails(throws: ThrowResult[]): string {
  if (throws.length === 0) {
    return '';
  }

  if (throws.length === 1) {
    const label = formatThrowLabel(throws[0]);
    return `${label} → ${throws[0].score}点`;
  }

  // 3投の場合
  const parts = throws.map((t) => `${formatThrowLabel(t)} (${t.score}点)`);
  const total = throws.reduce((sum, t) => sum + t.score, 0);
  return `${parts.join(' + ')} = ${total}点`;
}

/**
 * フィードバック表示コンポーネントのプロパティ
 */
interface FeedbackProps {
  /** ユーザーの回答 */
  userAnswer: number;
  /** 回答が正解かどうか */
  isCorrect: boolean;
}

/**
 * フィードバック表示コンポーネント
 *
 * @remarks
 * このコンポーネントは回答送信後に親コンポーネントから表示されることを想定しています。
 * userAnswerとisCorrectを親から受け取り、現在の問題情報をstoreから取得して表示します。
 */
export function Feedback({ isCorrect }: FeedbackProps): JSX.Element | null {
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const remainingScore = useGameStore((state) => state.remainingScore);
  const stats = useGameStore((state) => state.stats);
  const questionType = useGameStore((state) => state.config.questionType);
  const startingScore = useGameStore((state) => state.config.startingScore);
  const nextQuestion = useGameStore((state) => state.nextQuestion);
  const getCurrentCorrectAnswer = useGameStore((state) => state.getCurrentCorrectAnswer);

  // 問題が存在しない場合は何も表示しない（防御的プログラミング）
  if (!currentQuestion) {
    return null;
  }

  const correctAnswer = getCurrentCorrectAnswer();

  // ゲームクリア判定（残り0点到達）
  const isGameCleared =
    questionType === 'remaining' && isGameFinished(remainingScore) && startingScore > 0;

  // スコア詳細の生成
  const scoreDetails = formatScoreDetails(currentQuestion.throws);

  return (
    <section className="feedback" aria-label="フィードバック">
      {/* ゲームクリア表示 */}
      {isGameCleared && (
        <div className="feedback__game-clear">
          <div className="feedback__game-clear-icon">🎉</div>
          <h2 className="feedback__game-clear-title">ゲームクリア！</h2>
          <p className="feedback__game-clear-text">おめでとうございます！</p>
        </div>
      )}

      {/* 正誤アイコンとテキスト */}
      <div className={`feedback__result feedback__result--${isCorrect ? 'correct' : 'incorrect'}`}>
        <div className="feedback__icon" aria-hidden="true">
          {isCorrect ? FEEDBACK_ICONS.correct : FEEDBACK_ICONS.incorrect}
        </div>
        <div className="feedback__text">{isCorrect ? '正解' : '不正解'}</div>
      </div>

      {/* 正解表示 */}
      <div className="feedback__answer-section">
        <dl className="feedback__answer-item">
          <dt className="feedback__answer-label">正解</dt>
          <dd className="feedback__answer-value">{correctAnswer}</dd>
        </dl>
      </div>

      {/* スコア詳細表示 */}
      {scoreDetails && (
        <div className="feedback__score-details">
          <p className="feedback__score-details-text">{scoreDetails}</p>
        </div>
      )}

      {/* 連続正解数表示（正解時のみ） */}
      {isCorrect && stats.currentStreak > 0 && (
        <div className="feedback__streak">
          <span className="feedback__streak-icon">🔥</span>
          <span className="feedback__streak-text">{stats.currentStreak}回連続正解！</span>
        </div>
      )}

      {/* 次へボタン */}
      {!isGameCleared && (
        <button
          type="button"
          className="feedback__next-button"
          onClick={nextQuestion}
          aria-label="Next Question"
        >
          次へ
        </button>
      )}
    </section>
  );
}
