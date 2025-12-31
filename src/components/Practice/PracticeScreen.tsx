/**
 * PracticeScreen - 練習画面コンテナコンポーネント
 *
 * 練習セッション中のメイン画面です。以下のコンポーネントを統合して表示します：
 * - StatsBar（統計情報）
 * - DartBoard（ダーツボード描画）
 * - QuestionDisplay（問題表示）
 * - NumPad（数字入力）
 * - Feedback（回答フィードバック）
 *
 * 時間切れ時の自動終了処理も担当します。
 */

import { useEffect, useRef, useState } from 'react';
import { usePracticeSession } from '../../hooks/usePracticeSession';
import { useTimer } from '../../hooks/useTimer';
import { useGameStore } from '../../stores/gameStore';
import { checkBust, isDoubleRing } from '../../utils/gameLogic/index.js';
import { DartBoard } from '../DartBoard/DartBoard';
import { BustQuestion } from './BustQuestion';
import { Feedback } from './Feedback';
import { NumPad } from './NumPad';
import { QuestionDisplay } from './QuestionDisplay';
import { StatsBar } from './StatsBar';
import './PracticeScreen.css';

/**
 * 秒数を「分:秒」形式にフォーマットする
 * @param seconds - 秒数
 * @returns フォーマットされた時間文字列（例: "3:05", "10:30"）
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
  return `${minutes}:${paddedSeconds}`;
}

/**
 * 練習画面コンポーネント
 */
export function PracticeScreen(): JSX.Element {
  // セッション管理とタイマーを有効化
  usePracticeSession();
  useTimer();

  // ストアから必要な状態を取得
  const gameState = useGameStore((state) => state.gameState);
  const sessionConfig = useGameStore((state) => state.sessionConfig);
  const elapsedTime = useGameStore((state) => state.elapsedTime);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const questionType = useGameStore((state) => state.config.questionType);
  const displayedDarts = useGameStore((state) => state.displayedDarts);
  const roundStartScore = useGameStore((state) => state.roundStartScore);

  // アクション関数を取得
  const submitAnswer = useGameStore((state) => state.submitAnswer);
  const simulateNextThrow = useGameStore((state) => state.simulateNextThrow);
  const resetToSetup = useGameStore((state) => state.resetToSetup);
  const endSession = useGameStore((state) => state.endSession);
  const getCurrentCorrectAnswer = useGameStore((state) => state.getCurrentCorrectAnswer);

  // ローカル状態: フィードバック表示管理
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    value: number;
    isCorrect: boolean;
  } | null>(null);

  // BustQuestion用の回答状態
  const [bustAnswer, setBustAnswer] = useState<boolean | null>(null);

  // 時間切れの検出と自動終了処理
  useEffect(() => {
    if (sessionConfig.mode === 'time' && sessionConfig.timeLimit !== undefined) {
      const timeLimit = sessionConfig.timeLimit * 60; // 分を秒に変換
      if (elapsedTime >= timeLimit && gameState === 'practicing') {
        endSession('時間切れ');
      }
    }
  }, [elapsedTime, sessionConfig, gameState, endSession]);

  /**
   * バスト判定の回答ハンドラー
   */
  const handleBustAnswer = (isBust: boolean): void => {
    if (!currentQuestion) {
      return;
    }

    // 回答を保存
    setBustAnswer(isBust);

    // フィードバックを表示
    setShowFeedback(true);
  };

  /**
   * 回答確定時のハンドラー（NumPad用）
   */
  const handleConfirm = (value: number): void => {
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
  };

  /**
   * FeedbackコンポーネントのnextQuestionボタンが押された時のハンドラー
   * currentQuestionの変化を監視してフィードバックを非表示にする
   */
  const prevQuestionRef = useRef(currentQuestion);
  useEffect(() => {
    // 問題が変わったらフィードバックを非表示にする
    if (currentQuestion !== prevQuestionRef.current && showFeedback) {
      setShowFeedback(false);
      setLastAnswer(null);
      setBustAnswer(null);
    }
    // 次回のために現在の問題を保存
    prevQuestionRef.current = currentQuestion;
  }, [currentQuestion, showFeedback]);

  /**
   * BustQuestionのフィードバック完了後、次のダーツを表示
   */
  const handleBustFeedbackComplete = (): void => {
    // フィードバックを非表示
    setShowFeedback(false);
    setBustAnswer(null);

    // 次のダーツを表示
    simulateNextThrow();
  };

  // 練習中でない場合は何も表示しない（防御的プログラミング）
  if (gameState !== 'practicing') {
    return (
      <div className="practice-screen">
        <p>練習を開始してください</p>
      </div>
    );
  }

  // DartBoardに渡すダーツ座標と数
  const dartCoords = displayedDarts.map((dart) => dart.landingPoint);
  const dartCount = displayedDarts.length;

  // バストフェーズかどうかを判定
  const isBustPhase = currentQuestion?.questionPhase?.type === 'bust';

  // バスト判定の正解を計算（最後の1投に対して判定）
  const bustCorrectAnswer = (() => {
    if (!isBustPhase || displayedDarts.length === 0) {
      return false;
    }

    // 表示されている最後のダーツ
    const lastDisplayedDart = displayedDarts[displayedDarts.length - 1];

    // その投擲時点での残り点数を計算（最後の1投を除いた累積を引く）
    const previousCumulativeScore = displayedDarts
      .slice(0, -1)
      .reduce((sum, dart) => sum + dart.score, 0);
    const currentRemainingScore = roundStartScore - previousCumulativeScore;

    // バスト判定を実行（最後の1投のスコアで判定）
    const bustResult = checkBust(
      currentRemainingScore,
      lastDisplayedDart.score,
      isDoubleRing(lastDisplayedDart.ring)
    );

    return bustResult.isBust;
  })();

  return (
    <div className="practice-screen">
      {/* ヘッダー: 統計情報バー */}
      <header className="practice-screen__header">
        <StatsBar />
      </header>

      {/* メインコンテンツ: 左右2カラムレイアウト */}
      <main className="practice-screen__main">
        {/* 左カラム: ダーツボード */}
        <section className="practice-screen__board-section">
          <DartBoard coords={dartCoords} dartCount={dartCount} />
        </section>

        {/* 右カラム: 問題とインタラクション */}
        <section className="practice-screen__interaction-section">
          {/* 問題表示 */}
          <QuestionDisplay />

          {/* バストフェーズの場合はBustQuestionを表示 */}
          {isBustPhase && (
            <>
              <BustQuestion
                correctAnswer={bustCorrectAnswer}
                onAnswer={handleBustAnswer}
                showFeedback={showFeedback}
                userAnswer={bustAnswer ?? undefined}
              />

              {/* BustQuestionのフィードバック表示時は「次へ」ボタンを表示 */}
              {showFeedback && bustAnswer !== null && (
                <button
                  type="button"
                  className="feedback__next-button"
                  onClick={handleBustFeedbackComplete}
                  aria-label="Next Throw"
                >
                  次へ
                </button>
              )}
            </>
          )}

          {/* スコアフェーズの場合 */}
          {!isBustPhase && (
            <>
              {/* フィードバック表示（回答送信後のみ） */}
              {showFeedback && lastAnswer && (
                <Feedback userAnswer={lastAnswer.value} isCorrect={lastAnswer.isCorrect} />
              )}

              {/* テンキー入力（フィードバック非表示時のみ） */}
              {!showFeedback && <NumPad questionType={questionType} onConfirm={handleConfirm} />}
            </>
          )}
        </section>
      </main>

      {/* フッター: 操作ボタン */}
      <footer className="practice-screen__footer">
        <button
          type="button"
          className="practice-screen__button practice-screen__button--back"
          onClick={resetToSetup}
          aria-label="設定画面に戻る"
        >
          設定に戻る
        </button>

        <button
          type="button"
          className="practice-screen__button practice-screen__button--end"
          onClick={() => endSession('ユーザーによる終了')}
          aria-label="練習を終了"
        >
          終了
        </button>

        {/* タイムモードの場合は経過時間を表示 */}
        {sessionConfig.mode === 'time' && sessionConfig.timeLimit !== undefined && (
          <div className="practice-screen__timer">
            <span className="visually-hidden">経過時間</span>
            {formatTime(elapsedTime)} / {formatTime(sessionConfig.timeLimit * 60)}
          </div>
        )}
      </footer>
    </div>
  );
}
