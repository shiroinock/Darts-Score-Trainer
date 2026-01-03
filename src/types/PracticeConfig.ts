import type { JudgmentTiming } from './JudgmentTiming';
import type { QuestionType } from './QuestionType';
import type { Target } from './Target';

/**
 * 練習設定
 *
 * 練習セッションのすべての設定を含む中核的な型定義です。
 * プリセットとカスタム設定の両方に対応しています。
 */
export interface PracticeConfig {
  // 識別情報
  /** 設定ID（プリセット: 'preset-xxx'、カスタム: 'custom-xxxxx'） */
  configId: string;
  /** 設定名（例: '基礎練習'、'プレイヤー練習'） */
  configName: string;
  /** 説明文（オプション） */
  description?: string;
  /** アイコン（絵文字等、オプション） */
  icon?: string;

  // 練習パラメーター（4つの軸）
  /** 投擲単位（1投 or 3投） */
  throwUnit: 1 | 3;
  /** 問う内容 */
  questionType: QuestionType;
  /** 判定タイミング */
  judgmentTiming: JudgmentTiming;
  /** 開始点数（501/701/301等、全モードで必須） */
  startingScore: number;

  // ターゲット・難易度
  /** 狙う位置（オプショナル、残り点数モードでは自動決定） */
  target?: Target;
  /** 標準偏差（mm単位、散らばりの大きさ） */
  stdDevMM: number;
  /**
   * ランダムターゲットモード（オプショナル、デフォルトfalse）
   * trueの場合、投擲シミュレーションを行わず、全62ターゲットからランダムに選んで出題
   * 注: randomizeTarget: true の場合、stdDevMM は使用されない
   */
  randomizeTarget?: boolean;

  // メタデータ
  /** プリセット設定かどうか */
  isPreset: boolean;
  /** 作成日時（ISO 8601形式、オプション） */
  createdAt?: string;
  /** 最終プレイ日時（ISO 8601形式、オプション） */
  lastPlayedAt?: string;
}
