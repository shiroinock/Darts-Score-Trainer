/**
 * useFeedback - フィードバック状態管理フック
 *
 * 練習画面での回答フィードバック表示を管理するカスタムフックです。
 * スコア回答とバスト判定回答の両方に対応します。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { BustQuestionAnswer, Question } from '../types';

/**
 * スコア回答の情報
 */
interface ScoreAnswer {
  value: number;
  isCorrect: boolean;
}

/**
 * useFeedbackフックの戻り値
 */
interface UseFeedbackResult {
  /** フィードバックを表示中かどうか */
  showFeedback: boolean;
  /** 最後のスコア回答情報（スコアフェーズ用） */
  lastAnswer: ScoreAnswer | null;
  /** バスト判定の回答（バストフェーズ用） */
  bustAnswer: BustQuestionAnswer | null;
  /** スコア回答のハンドラー */
  handleConfirm: (value: number) => void;
  /** バスト判定回答のハンドラー */
  handleBustAnswer: (answer: BustQuestionAnswer) => void;
  /** バストフィードバック完了後のハンドラー */
  handleBustFeedbackComplete: () => void;
}

/**
 * フィードバック状態管理フック
 *
 * 回答送信後のフィードバック表示と、問題変更時の自動リセットを管理します。
 */
export function useFeedback(): UseFeedbackResult {
  // ローカル状態
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<ScoreAnswer | null>(null);
  const [bustAnswer, setBustAnswer] = useState<BustQuestionAnswer | null>(null);

  // ストアからアクションを取得
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const submitAnswer = useGameStore((state) => state.submitAnswer);
  const simulateNextThrow = useGameStore((state) => state.simulateNextThrow);
  const getCurrentCorrectAnswer = useGameStore((state) => state.getCurrentCorrectAnswer);
  const getBustCorrectAnswer = useGameStore((state) => state.getBustCorrectAnswer);
  const nextQuestion = useGameStore((state) => state.nextQuestion);
  const endSession = useGameStore((state) => state.endSession);

  // 問題変更時にフィードバックをリセット
  const prevQuestionRef = useRef<Question | null>(currentQuestion);
  useEffect(() => {
    if (currentQuestion !== prevQuestionRef.current && showFeedback) {
      setShowFeedback(false);
      setLastAnswer(null);
      setBustAnswer(null);
    }
    prevQuestionRef.current = currentQuestion;
  }, [currentQuestion, showFeedback]);

  /**
   * スコア回答のハンドラー（NumPad用）
   */
  const handleConfirm = useCallback(
    (value: number): void => {
      if (!currentQuestion) {
        return;
      }

      // 正誤判定（submitAnswerの前に正解を取得）
      const correctAnswer = getCurrentCorrectAnswer();
      const isCorrect = value === correctAnswer;

      // 回答を提出
      submitAnswer(value);

      // フィードバック表示用の情報を保存
      setLastAnswer({ value, isCorrect });
      setShowFeedback(true);
    },
    [currentQuestion, getCurrentCorrectAnswer, submitAnswer]
  );

  /**
   * バスト判定回答のハンドラー
   */
  const handleBustAnswer = useCallback(
    (answer: BustQuestionAnswer): void => {
      if (!currentQuestion) {
        return;
      }

      setBustAnswer(answer);
      setShowFeedback(true);
    },
    [currentQuestion]
  );

  /**
   * バストフィードバック完了後のハンドラー
   *
   * 正解に応じて以下の処理を行う:
   * - 'bust': 次のラウンド（新しい3投）へ進む
   * - 'safe': 次のダーツを表示
   * - 'finish': ゲームを終了（結果画面へ）
   */
  const handleBustFeedbackComplete = useCallback((): void => {
    setShowFeedback(false);
    setBustAnswer(null);

    // バスト判定の正解を取得
    const bustCorrectAnswer = getBustCorrectAnswer();

    if (bustCorrectAnswer === 'bust') {
      // 正解がバストの場合 → 次のラウンド（新しい3投）へ
      nextQuestion();
    } else if (bustCorrectAnswer === 'finish') {
      // 正解がフィニッシュの場合 → ゲーム終了
      endSession('finish');
    } else {
      // 正解がセーフの場合 → 次のダーツを表示
      simulateNextThrow();
    }
  }, [getBustCorrectAnswer, nextQuestion, endSession, simulateNextThrow]);

  return {
    showFeedback,
    lastAnswer,
    bustAnswer,
    handleConfirm,
    handleBustAnswer,
    handleBustFeedbackComplete,
  };
}
