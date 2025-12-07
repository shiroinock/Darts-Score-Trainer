import type { PracticeConfig } from './PracticeConfig';
import type { SessionConfig } from './SessionConfig';
import type { Stats } from './Stats';

/**
 * セッション結果
 *
 * 練習セッション終了時の完全な結果データです。
 */
export interface SessionResult {
  /** 使用した練習設定 */
  config: PracticeConfig;
  /** 使用したセッション設定 */
  sessionConfig: SessionConfig;
  /** 統計情報 */
  stats: Stats;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** 完了日時（ISO 8601形式） */
  completedAt: string;
  /** 終了理由 */
  finishReason: 'completed' | 'timeout' | 'manual' | 'game_finished';
}
