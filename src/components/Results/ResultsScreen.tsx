/**
 * ResultsScreen - 練習結果画面コンポーネント
 *
 * 練習セッション終了後の結果画面です。以下のコンポーネントと機能を提供します：
 * - SessionSummary（統計サマリー）
 * - 「同じ設定で再挑戦」ボタン
 * - 「設定を変更」ボタン
 *
 * レスポンシブ対応（mobile-first）、タッチフレンドリーなボタンサイズ。
 */

import { useGameStore } from '../../stores/gameStore';
import type { SessionResult } from '../../types/SessionResult';
import { SessionSummary } from './SessionSummary';

/**
 * 練習結果画面コンポーネント
 */
export function ResultsScreen(): JSX.Element {
  // ストアから必要な状態を取得
  const gameState = useGameStore((state) => state.gameState);
  const config = useGameStore((state) => state.config);
  const sessionConfig = useGameStore((state) => state.sessionConfig);
  const stats = useGameStore((state) => state.stats);
  const elapsedTime = useGameStore((state) => state.elapsedTime);

  // アクション関数を取得
  const startPractice = useGameStore((state) => state.startPractice);
  const resetToSetup = useGameStore((state) => state.resetToSetup);

  /**
   * 「同じ設定で再挑戦」ボタンのクリックハンドラー
   */
  const handleRetry = (): void => {
    startPractice();
  };

  /**
   * 「設定を変更」ボタンのクリックハンドラー
   */
  const handleChangeSettings = (): void => {
    resetToSetup();
  };

  // 結果画面でない場合は何も表示しない（防御的プログラミング）
  if (gameState !== 'results') {
    return (
      <div className="results-screen">
        <p>結果がありません</p>
      </div>
    );
  }

  // SessionResult型のデータを構築
  const sessionResult: SessionResult = {
    stats,
    elapsedTime,
    config, // PracticeConfig全体を渡す
    sessionConfig, // フック経由で取得した値を使用
    completedAt: new Date().toISOString(),
    finishReason: 'manual', // TODO: 実際の終了理由を記録する機能を実装
  };

  return (
    <div className="results-screen">
      {/* メインコンテンツ: セッションサマリー */}
      <main className="results-screen__main">
        <SessionSummary result={sessionResult} />
      </main>

      {/* フッター: アクションボタン */}
      <footer className="results-screen__footer">
        <button
          type="button"
          className="results-screen__button results-screen__button--retry"
          onClick={handleRetry}
          aria-label="同じ設定で再挑戦"
        >
          同じ設定で再挑戦
        </button>

        <button
          type="button"
          className="results-screen__button results-screen__button--settings"
          onClick={handleChangeSettings}
          aria-label="設定を変更"
        >
          設定を変更
        </button>
      </footer>
    </div>
  );
}
