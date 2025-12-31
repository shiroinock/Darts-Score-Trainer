/**
 * BustQuestion - バスト判定コンポーネント
 *
 * 3投モードで1本目・2本目の後にバスト判定を問うコンポーネント。
 * 「バスト」/「セーフ」の2択、またはフィニッシュ可能時は「フィニッシュ」を加えた3択で
 * ユーザーの回答を取得し、フィードバック表示時には正解/不正解を示します。
 */

import { useEffect, useRef } from 'react';
import type { BustQuestionAnswer } from '../../types';
import './BustQuestion.css';

/**
 * キーボードショートカット定数
 */
const KEYBOARD_SHORTCUTS = {
  BUST: ['b', 'B'],
  SAFE: ['s', 'S'],
  FINISH: ['f', 'F'],
} as const;

/**
 * 回答ラベルの定義
 */
const ANSWER_LABELS: Record<BustQuestionAnswer, string> = {
  bust: 'バスト',
  safe: 'セーフ',
  finish: 'フィニッシュ',
};

/**
 * BustQuestionコンポーネントのプロパティ
 */
interface BustQuestionProps {
  /** 正解（bust/safe/finish） */
  correctAnswer: BustQuestionAnswer;
  /** 回答送信コールバック */
  onAnswer: (answer: BustQuestionAnswer) => void;
  /** フィードバック表示中かどうか（回答後の状態） */
  showFeedback?: boolean;
  /** ユーザーの回答（フィードバック表示時） */
  userAnswer?: BustQuestionAnswer;
  /** フィニッシュ選択肢を表示するか（残り点数が1本でフィニッシュ可能な場合） */
  showFinishOption?: boolean;
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
 * - キーボード操作: Bキーでバスト、Sキーでセーフ、Fキーでフィニッシュ
 * - フィードバック表示時は回答ボタンを無効化
 * - ARIA属性でアクセシビリティ対応
 */
export function BustQuestion({
  correctAnswer,
  onAnswer,
  showFeedback = false,
  userAnswer,
  showFinishOption = false,
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
   * キーボードショートカット（B/S/Fキー）
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
        onAnswerRef.current('bust');
      }
      // S/sキーでセーフ
      else if (KEYBOARD_SHORTCUTS.SAFE.includes(event.key as 's' | 'S')) {
        event.preventDefault();
        onAnswerRef.current('safe');
      }
      // F/fキーでフィニッシュ（表示時のみ）
      else if (showFinishOption && KEYBOARD_SHORTCUTS.FINISH.includes(event.key as 'f' | 'F')) {
        event.preventDefault();
        onAnswerRef.current('finish');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFeedback, showFinishOption]);

  /**
   * ボタンクリックハンドラ
   */
  const handleButtonClick = (answer: BustQuestionAnswer) => {
    if (!showFeedback) {
      onAnswer(answer);
    }
  };

  // フィードバック表示時の正解判定
  const isCorrect = showFeedback && userAnswer === correctAnswer;
  const bustIsSelected = showFeedback && userAnswer === 'bust';
  const safeIsSelected = showFeedback && userAnswer === 'safe';
  const finishIsSelected = showFeedback && userAnswer === 'finish';

  // 質問テキストの決定
  const questionText = showFinishOption ? 'この投擲の結果は?' : 'この投擲はバストですか?';

  return (
    <section className="bust-question" aria-label="バスト判定">
      {/* 質問テキスト */}
      {!showFeedback && <h2 className="bust-question__title">{questionText}</h2>}

      {/* フィードバック表示 */}
      {showFeedback && <ResultDisplay isCorrect={isCorrect} />}

      {/* 回答ボタン */}
      <div
        className={`bust-question__buttons ${showFinishOption ? 'bust-question__buttons--ternary' : ''}`}
      >
        <button
          type="button"
          className={getButtonClassName(bustIsSelected, isCorrect, 'bust-question__button--bust')}
          onClick={() => handleButtonClick('bust')}
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
          onClick={() => handleButtonClick('safe')}
          disabled={showFeedback}
          aria-label="セーフ (Sキー)"
          aria-pressed={safeIsSelected}
        >
          セーフ
          <span className="bust-question__shortcut" aria-hidden="true">
            (S)
          </span>
        </button>

        {showFinishOption && (
          <button
            type="button"
            className={getButtonClassName(
              finishIsSelected,
              isCorrect,
              'bust-question__button--finish'
            )}
            onClick={() => handleButtonClick('finish')}
            disabled={showFeedback}
            aria-label="フィニッシュ (Fキー)"
            aria-pressed={finishIsSelected}
          >
            フィニッシュ
            <span className="bust-question__shortcut" aria-hidden="true">
              (F)
            </span>
          </button>
        )}
      </div>

      {/* 正解表示（フィードバック時） */}
      {showFeedback && userAnswer && (
        <div className="bust-question__answer-section">
          <dl className="bust-question__answer-item">
            <dt className="bust-question__answer-label">あなたの回答</dt>
            <dd className="bust-question__answer-value">{ANSWER_LABELS[userAnswer]}</dd>
          </dl>
          <dl className="bust-question__answer-item">
            <dt className="bust-question__answer-label">正解</dt>
            <dd className="bust-question__answer-value">{ANSWER_LABELS[correctAnswer]}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}
