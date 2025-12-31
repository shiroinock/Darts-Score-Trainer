/**
 * BustQuestion - バスト判定2択コンポーネント
 *
 * 3投モードで1本目・2本目の後にバスト判定を2択で問うコンポーネント。
 * 「バスト」/「セーフ」のボタンでユーザーの回答を取得し、
 * フィードバック表示時には正解/不正解を示します。
 */

import { useEffect, useRef } from 'react';
import './BustQuestion.css';

/**
 * キーボードショートカット定数
 */
const KEYBOARD_SHORTCUTS = {
  BUST: ['b', 'B'],
  SAFE: ['s', 'S'],
} as const;

/**
 * BustQuestionコンポーネントのプロパティ
 */
interface BustQuestionProps {
  /** 正解がバストかどうか */
  correctAnswer: boolean;
  /** 回答送信コールバック */
  onAnswer: (isBust: boolean) => void;
  /** フィードバック表示中かどうか（回答後の状態） */
  showFeedback?: boolean;
  /** ユーザーの回答（フィードバック表示時） */
  userAnswer?: boolean;
}

/**
 * BustQuestion結果表示コンポーネント
 */
function ResultDisplay({ isCorrect }: { isCorrect: boolean }): JSX.Element {
  return (
    <div
      className={`bust-question__result bust-question__result--${isCorrect ? 'correct' : 'incorrect'}`}
    >
      <div className="bust-question__icon" aria-hidden="true">
        {isCorrect ? '✓' : '✗'}
      </div>
      <div className="bust-question__text">{isCorrect ? '正解' : '不正解'}</div>
    </div>
  );
}

/**
 * ボタンスタイル計算関数
 */
function getButtonClassName(isSelected: boolean, isCorrect: boolean, baseClass: string): string {
  let className = `bust-question__button ${baseClass}`;
  if (isSelected) {
    className += isCorrect
      ? ' bust-question__button--selected-correct'
      : ' bust-question__button--selected-incorrect';
  }
  return className;
}

/**
 * BustQuestionコンポーネント
 *
 * @remarks
 * - キーボード操作: Bキーでバスト、Sキーでセーフ
 * - フィードバック表示時は回答ボタンを無効化
 * - ARIA属性でアクセシビリティ対応
 */
export function BustQuestion({
  correctAnswer,
  onAnswer,
  showFeedback = false,
  userAnswer,
}: BustQuestionProps): JSX.Element {
  /**
   * onAnswerコールバックの最新値を保持するref
   * イベントリスナーの再登録を防ぐ
   */
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  /**
   * キーボードショートカット（B/Sキー）
   */
  useEffect(() => {
    // フィードバック表示中はキーボード入力を無効化
    if (showFeedback) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // B/bキーでバスト
      if (KEYBOARD_SHORTCUTS.BUST.includes(event.key as 'b' | 'B')) {
        event.preventDefault();
        onAnswerRef.current(true);
      }
      // S/sキーでセーフ
      else if (KEYBOARD_SHORTCUTS.SAFE.includes(event.key as 's' | 'S')) {
        event.preventDefault();
        onAnswerRef.current(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFeedback]);

  /**
   * ボタンクリックハンドラ
   */
  const handleButtonClick = (isBust: boolean) => {
    if (!showFeedback) {
      onAnswer(isBust);
    }
  };

  // フィードバック表示時の正解判定
  const isCorrect = showFeedback && userAnswer === correctAnswer;
  const bustIsSelected = showFeedback && userAnswer === true;
  const safeIsSelected = showFeedback && userAnswer === false;

  return (
    <section className="bust-question" aria-label="バスト判定">
      {/* 質問テキスト */}
      {!showFeedback && <h2 className="bust-question__title">この投擲はバストですか?</h2>}

      {/* フィードバック表示 */}
      {showFeedback && <ResultDisplay isCorrect={isCorrect} />}

      {/* 回答ボタン */}
      <div className="bust-question__buttons">
        <button
          type="button"
          className={getButtonClassName(bustIsSelected, isCorrect, 'bust-question__button--bust')}
          onClick={() => handleButtonClick(true)}
          disabled={showFeedback}
          aria-label="バスト (Bキー)"
          aria-pressed={bustIsSelected}
        >
          バスト
          <span className="bust-question__shortcut" aria-hidden="true">
            (B)
          </span>
        </button>

        <button
          type="button"
          className={getButtonClassName(safeIsSelected, isCorrect, 'bust-question__button--safe')}
          onClick={() => handleButtonClick(false)}
          disabled={showFeedback}
          aria-label="セーフ (Sキー)"
          aria-pressed={safeIsSelected}
        >
          セーフ
          <span className="bust-question__shortcut" aria-hidden="true">
            (S)
          </span>
        </button>
      </div>

      {/* 正解表示（フィードバック時） */}
      {showFeedback && (
        <div className="bust-question__answer-section">
          <dl className="bust-question__answer-item">
            <dt className="bust-question__answer-label">あなたの回答</dt>
            <dd className="bust-question__answer-value">{userAnswer ? 'バスト' : 'セーフ'}</dd>
          </dl>
          <dl className="bust-question__answer-item">
            <dt className="bust-question__answer-label">正解</dt>
            <dd className="bust-question__answer-value">{correctAnswer ? 'バスト' : 'セーフ'}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}
