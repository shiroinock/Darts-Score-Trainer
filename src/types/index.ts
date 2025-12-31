/**
 * Darts Score Trainer - TypeScript型定義
 *
 * このファイルはプロジェクトで使用するすべての型定義を再エクスポートします。
 * 各型定義は個別のファイルで管理されており、ここで一括エクスポートしています。
 */

// ゲームロジック
export type { BustInfo } from './BustInfo';
export type { BustQuestionAnswer } from './BustQuestionAnswer';
// 座標系
export type { Coordinates } from './Coordinates';
export type { EndReason } from './EndReason';
export { END_REASONS } from './EndReason';
export type { GameState } from './GameState';
export type { JudgmentTiming } from './JudgmentTiming';
export type { PracticeConfig } from './PracticeConfig';
export type { PresetConfig } from './PresetConfig';
// 問題・ゲーム状態
export type { Question } from './Question';
// 練習設定
export type { QuestionType } from './QuestionType';
// ダーツボード要素
export type { RingType } from './RingType';
export type { SessionConfig } from './SessionConfig';
export type { SessionResult } from './SessionResult';
// 統計・結果
export type { Stats } from './Stats';
export type { Target } from './Target';
export type { TargetType } from './TargetType';
// 投擲関連
export type { ThrowResult } from './ThrowResult';
