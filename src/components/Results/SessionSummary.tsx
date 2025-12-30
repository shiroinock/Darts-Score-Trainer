/**
 * SessionSummary - セッション終了後の統計サマリーコンポーネント
 *
 * 練習セッション終了時の完全な統計情報を表示します。
 * - 総問題数、正解数、正答率（小数点1位まで）
 * - 連続正解記録（現在と最高）
 * - 経過時間（分:秒形式）
 * - 設定情報（プリセット名、難易度、ターゲット）
 * - 終了理由（完了、時間切れ、手動終了、ゲームクリア）
 */

import type { SessionResult } from '../../types/SessionResult';
import { getDifficultyLabel } from '../../utils/configHelpers';
import './SessionSummary.css';

/**
 * セッション終了理由を日本語に変換する
 * @param reason - 終了理由
 * @returns 日本語の終了理由
 */
function getFinishReasonLabel(
  reason: 'completed' | 'timeout' | 'manual' | 'game_finished'
): string {
  switch (reason) {
    case 'completed':
      return '完了';
    case 'timeout':
      return '時間切れ';
    case 'manual':
      return '手動終了';
    case 'game_finished':
      return 'ゲームクリア';
  }
}

/**
 * ターゲット情報を文字列に変換する
 * @param target - ターゲット情報（未定義の場合あり）
 * @returns ターゲット文字列（例: "T20", "自動"）
 */
function getTargetLabel(
  target: { type: string; number: number | null; label?: string } | undefined
): string {
  if (!target) {
    return '自動';
  }

  // labelがあればそれを使用
  if (target.label) {
    return target.label;
  }

  // labelがない場合は構築
  if (target.type === 'BULL') {
    return 'BULL';
  }

  const ringPrefix = target.type === 'TRIPLE' ? 'T' : target.type === 'DOUBLE' ? 'D' : '';
  return `${ringPrefix}${target.number ?? ''}`;
}

/**
 * 時間を「分:秒」形式にフォーマットする
 * @param seconds - 秒数
 * @returns フォーマットされた時間文字列（例: "3:05", "10:30"）
 */
function formatTime(seconds: number): string {
  const SECONDS_PER_MINUTE = 60;
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
  return `${minutes}:${paddedSeconds}`;
}

/**
 * 正答率をパーセント表記にフォーマートする
 * @param correct - 正解数
 * @param total - 総問題数
 * @returns フォーマットされた正答率文字列（例: "75.0%"）
 */
function formatAccuracy(correct: number, total: number): string {
  if (total === 0) {
    return '0.0%';
  }
  const accuracy = (correct / total) * 100;
  return `${accuracy.toFixed(1)}%`;
}

/**
 * SessionSummaryコンポーネントのプロパティ
 */
interface SessionSummaryProps {
  /** セッション結果データ */
  result: SessionResult;
}

/**
 * セッション終了後の統計サマリーコンポーネント
 */
export function SessionSummary({ result }: SessionSummaryProps): JSX.Element {
  const { stats, elapsedTime, config, finishReason } = result;

  // 各種ラベルの生成
  const difficultyLabel = getDifficultyLabel(config.stdDevMM);
  const targetLabel = getTargetLabel(config.target);
  const finishReasonLabel = getFinishReasonLabel(finishReason);
  const accuracyLabel = formatAccuracy(stats.correct, stats.total);
  const timeLabel = formatTime(elapsedTime);

  return (
    <section className="session-summary" aria-label="セッション結果">
      {/* タイトル */}
      <h2 className="session-summary__title">練習結果</h2>

      {/* 終了理由 */}
      <div className="session-summary__finish-reason">
        <span className="session-summary__finish-reason-label">終了理由:</span>
        <span className="session-summary__finish-reason-value">{finishReasonLabel}</span>
      </div>

      {/* 統計情報グリッド */}
      <div className="session-summary__stats-grid">
        {/* 総問題数 */}
        <dl className="session-summary__stat-item">
          <dt className="session-summary__stat-label">総問題数</dt>
          <dd className="session-summary__stat-value">{stats.total}</dd>
        </dl>

        {/* 正解数 */}
        <dl className="session-summary__stat-item">
          <dt className="session-summary__stat-label">正解数</dt>
          <dd className="session-summary__stat-value">{stats.correct}</dd>
        </dl>

        {/* 正答率 */}
        <dl className="session-summary__stat-item session-summary__stat-item--highlight">
          <dt className="session-summary__stat-label">正答率</dt>
          <dd className="session-summary__stat-value">{accuracyLabel}</dd>
        </dl>

        {/* 連続正解記録 */}
        <dl className="session-summary__stat-item">
          <dt className="session-summary__stat-label">最高連続正解</dt>
          <dd className="session-summary__stat-value">{stats.bestStreak}</dd>
        </dl>

        {/* 経過時間 */}
        <dl className="session-summary__stat-item">
          <dt className="session-summary__stat-label">経過時間</dt>
          <dd className="session-summary__stat-value">{timeLabel}</dd>
        </dl>
      </div>

      {/* 設定情報セクション */}
      <div className="session-summary__config-section">
        <h3 className="session-summary__config-title">練習設定</h3>

        <dl className="session-summary__config-list">
          {/* プリセット名 */}
          <div className="session-summary__config-item">
            <dt className="session-summary__config-label">モード</dt>
            <dd className="session-summary__config-value">
              {config.icon} {config.configName}
            </dd>
          </div>

          {/* 難易度 */}
          <div className="session-summary__config-item">
            <dt className="session-summary__config-label">難易度</dt>
            <dd className="session-summary__config-value">{difficultyLabel}</dd>
          </div>

          {/* ターゲット */}
          <div className="session-summary__config-item">
            <dt className="session-summary__config-label">ターゲット</dt>
            <dd className="session-summary__config-value">{targetLabel}</dd>
          </div>

          {/* 開始点数 */}
          {config.startingScore > 0 && (
            <div className="session-summary__config-item">
              <dt className="session-summary__config-label">開始点数</dt>
              <dd className="session-summary__config-value">{config.startingScore}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
