/**
 * StatsBar - 統計情報バーコンポーネント
 *
 * 練習中の統計情報をリアルタイムで表示します。
 * - 正解数/総問題数
 * - 正答率
 * - 連続正解数
 * - 残り問題数または残り時間（セッションモードに応じて）
 * - 残り点数（01モードの場合のみ）
 */

import { useGameStore } from '../../stores/gameStore';
import './StatsBar.css';

/**
 * 時間を「分:秒」形式にフォーマットする
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
 * 正答率をパーセント表記にフォーマットする
 * @param accuracy - 正答率（0-1の範囲）
 * @returns フォーマットされた正答率文字列（例: "75.0%"）
 */
function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`;
}

/**
 * 統計情報バーコンポーネント
 */
export function StatsBar(): JSX.Element {
  const stats = useGameStore((state) => state.stats);
  const sessionConfig = useGameStore((state) => state.sessionConfig);
  const elapsedTime = useGameStore((state) => state.elapsedTime);
  const remainingScore = useGameStore((state) => state.remainingScore);
  const startingScore = useGameStore((state) => state.config.startingScore);
  const getAccuracy = useGameStore((state) => state.getAccuracy);

  // 正答率を計算
  const accuracy = getAccuracy();

  // セッションモードに応じた残り表示を計算
  let remainingDisplay: string;
  let remainingLabel: string;

  if (sessionConfig.mode === 'questions') {
    const totalQuestions = sessionConfig.questionCount ?? 0;
    const remaining = Math.max(0, totalQuestions - stats.total);
    remainingDisplay = `${remaining}問`;
    remainingLabel = '残り問題数';
  } else {
    // timeモード
    const timeLimit = (sessionConfig.timeLimit ?? 0) * 60; // 分を秒に変換
    const remainingSeconds = Math.max(0, timeLimit - elapsedTime);
    remainingDisplay = formatTime(remainingSeconds);
    remainingLabel = '残り時間';
  }

  return (
    <output className="stats-bar" aria-label="練習統計情報">
      <div className="stats-bar__grid">
        {/* 正解数 / 総問題数 */}
        <dl className="stats-bar__item">
          <dt className="stats-bar__label">正解数</dt>
          <dd className="stats-bar__value">
            {stats.correct} / {stats.total}
          </dd>
        </dl>

        {/* 正答率 */}
        <dl className="stats-bar__item">
          <dt className="stats-bar__label">正答率</dt>
          <dd className="stats-bar__value">{formatAccuracy(accuracy)}</dd>
        </dl>

        {/* 連続正解数 */}
        <dl className="stats-bar__item">
          <dt className="stats-bar__label">連続正解</dt>
          <dd className="stats-bar__value">{stats.currentStreak}</dd>
        </dl>

        {/* 残り問題数 or 残り時間 */}
        <dl className="stats-bar__item">
          <dt className="stats-bar__label">{remainingLabel}</dt>
          <dd className="stats-bar__value">{remainingDisplay}</dd>
        </dl>

        {/* 残り点数（01モードの場合のみ表示） */}
        {startingScore > 0 && (
          <dl className="stats-bar__item stats-bar__item--highlight">
            <dt className="stats-bar__label">残り点数</dt>
            <dd className="stats-bar__value">{remainingScore}</dd>
          </dl>
        )}
      </div>
    </output>
  );
}
