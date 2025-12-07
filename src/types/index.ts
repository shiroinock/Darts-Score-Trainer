/**
 * Darts Score Trainer - TypeScript型定義
 *
 * このファイルはプロジェクトで使用するすべての型定義を再エクスポートします。
 * 各型定義は個別のファイルで管理されており、ここで一括エクスポートしています。
 */

// 座標系
export type { Coordinates } from './Coordinates';

// ダーツボード要素
export type { RingType } from './RingType';
export type { TargetType } from './TargetType';
export type { Target } from './Target';

// 投擲関連
export type { ThrowResult } from './ThrowResult';

// 練習設定
export type { QuestionType } from './QuestionType';
export type { JudgmentTiming } from './JudgmentTiming';
export type { PracticeConfig } from './PracticeConfig';
export type { SessionConfig } from './SessionConfig';

// 問題・ゲーム状態
export type { Question } from './Question';
export type { GameState } from './GameState';

// 統計・結果
export type { Stats } from './Stats';
export type { SessionResult } from './SessionResult';

// ゲームロジック
export type { BustInfo } from './BustInfo';
