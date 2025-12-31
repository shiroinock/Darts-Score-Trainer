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

import { useEffect, useMemo } from 'react';
import { useFeedback } from '../../hooks/useFeedback';
import { usePracticeSession } from '../../hooks/usePracticeSession';
import { useTimer } from '../../hooks/useTimer';
import { useGameStore } from '../../stores/gameStore';
import { END_REASONS } from '../../types';
import { ONE_DART_FINISHABLE } from '../../utils/constants';
import { isGameFinished } from '../../utils/gameLogic';
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

  // フィードバック状態管理
  const {
    showFeedback,
    lastAnswer,
    bustAnswer,
    handleConfirm,
    handleBustAnswer,
    handleBustFeedbackComplete,
  } = useFeedback();

  // ストアから必要な状態を取得
  const gameState = useGameStore((state) => state.gameState);
  const sessionConfig = useGameStore((state) => state.sessionConfig);
  const elapsedTime = useGameStore((state) => state.elapsedTime);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const questionType = useGameStore((state) => state.config.questionType);
  const displayedDarts = useGameStore((state) => state.displayedDarts);
  const roundStartScore = useGameStore((state) => state.roundStartScore);
  const remainingScore = useGameStore((state) => state.remainingScore);
  const startingScore = useGameStore((state) => state.config.startingScore);

  // アクション関数を取得
  const resetToSetup = useGameStore((state) => state.resetToSetup);
  const endSession = useGameStore((state) => state.endSession);
  const getBustCorrectAnswer = useGameStore((state) => state.getBustCorrectAnswer);
  const nextQuestion = useGameStore((state) => state.nextQuestion);

  // バストフェーズかどうかを判定
  const isBustPhase = currentQuestion?.questionPhase?.type === 'bust';

  // 時間切れの検出と自動終了処理
  useEffect(() => {
    if (sessionConfig.mode === 'time' && sessionConfig.timeLimit !== undefined) {
      const timeLimit = sessionConfig.timeLimit * 60; // 分を秒に変換
      if (elapsedTime >= timeLimit && gameState === 'practicing') {
        endSession(END_REASONS.TIMEOUT);
      }
    }
  }, [elapsedTime, sessionConfig, gameState, endSession]);

  // Enterキーでフィードバック後に次へ進む
  useEffect(() => {
    // フィードバック非表示時は何もしない
    if (!showFeedback) {
      return undefined;
    }

    // ゲームクリア時はEnterキーを無効化
    const isGameCleared =
      questionType === 'remaining' && isGameFinished(remainingScore) && startingScore > 0;
    if (isGameCleared) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        // バストフェーズの場合
        if (isBustPhase && bustAnswer !== null) {
          handleBustFeedbackComplete();
        }
        // スコアフェーズの場合
        else if (!isBustPhase && lastAnswer) {
          nextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    showFeedback,
    isBustPhase,
    bustAnswer,
    lastAnswer,
    questionType,
    remainingScore,
    startingScore,
    handleBustFeedbackComplete,
    nextQuestion,
  ]);

  // フィニッシュ選択肢を表示するかどうかを計算
  // 現在のダーツ投擲時点での残り点数が1本でフィニッシュ可能かどうか
  // 注意: useMemoは早期リターン前に呼び出す必要がある（React Hooks規則）
  const showFinishOption = useMemo(() => {
    if (!isBustPhase || displayedDarts.length === 0) {
      return false;
    }
    // 現在のダーツ投擲「前」の残り点数を計算
    const previousCumulativeScore = displayedDarts
      .slice(0, -1)
      .reduce((sum, dart) => sum + dart.score, 0);
    const currentRemainingScore = roundStartScore - previousCumulativeScore;
    return ONE_DART_FINISHABLE.has(currentRemainingScore);
  }, [isBustPhase, displayedDarts, roundStartScore]);

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

  // バスト判定の正解を取得（gameStoreで計算）
  const bustCorrectAnswer = getBustCorrectAnswer();

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
                showFinishOption={showFinishOption}
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
          onClick={() => endSession(END_REASONS.USER_ABORT)}
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
