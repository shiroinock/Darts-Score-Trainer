/**
 * 設定関連のヘルパー関数
 * Step4ConfirmとSessionSummaryで共通使用する関数を提供
 */

import { PRESETS } from '../stores/config/presets.js';
import type { PracticeConfig, SessionConfig } from '../types/index.js';
import { DIFFICULTY_PRESETS } from './constants/index.js';

/**
 * 現在の設定が既存プリセットと完全一致するか判定する
 * @param config - 練習設定
 * @returns プリセットID（一致する場合）またはnull
 */
export function findMatchingPreset(config: PracticeConfig): string | null {
  if (!config.isPreset) {
    return null;
  }
  if (config.configId.startsWith('preset-') && config.configId in PRESETS) {
    return config.configId;
  }
  return null;
}

/**
 * 標準偏差から難易度ラベルを取得する
 * @param stdDevMM - 標準偏差（mm単位）
 * @returns 難易度ラベル（例: "上級者", "15mm"）
 */
export function getDifficultyLabel(stdDevMM: number): string {
  // プリセットと一致する標準偏差を探す
  for (const [_, preset] of Object.entries(DIFFICULTY_PRESETS)) {
    if (preset.stdDevMM === stdDevMM) {
      return preset.label;
    }
  }
  // プリセットにない場合は数値をそのまま表示
  return `${stdDevMM}mm`;
}

/**
 * セッション設定のサマリー文字列を生成する
 * @param sessionConfig - セッション設定
 * @returns セッション設定のサマリー文字列（例: "問題数モード: 10問", "時間制限モード: 3分"）
 */
export function getSessionSummary(sessionConfig: SessionConfig): string {
  if (sessionConfig.mode === 'questions') {
    return `問題数モード: ${sessionConfig.questionCount ?? 10}問`;
  }
  return `時間制限モード: ${sessionConfig.timeLimit ?? 3}分`;
}
