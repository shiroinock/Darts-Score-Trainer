/**
 * プリセット定義
 *
 * 5つの練習設定プリセットを定義します。
 */

import type { PresetConfig } from '../../types';

/**
 * デフォルトプリセットID
 */
export const DEFAULT_PRESET_ID = 'preset-basic' as const;

/**
 * プリセット練習設定
 */
export const PRESETS: Record<string, PresetConfig> = {
  [DEFAULT_PRESET_ID]: {
    configId: DEFAULT_PRESET_ID,
    configName: '基礎練習',
    description: '1投単位で得点を問う基本練習（62ターゲットからランダム出題）',
    icon: '📚',
    throwUnit: 1,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: 501,
    stdDevMM: 15,
    randomizeTarget: true, // 全62ターゲットからランダム出題
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
  'preset-player': {
    configId: 'preset-player',
    configName: 'プレイヤー練習',
    description: '3投単位で得点を問う練習',
    icon: '🎯',
    throwUnit: 3,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: 501,
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
  'preset-caller-basic': {
    configId: 'preset-caller-basic',
    configName: 'コーラー基礎',
    description: '残り点数を問う基礎練習',
    icon: '📢',
    throwUnit: 3,
    questionType: 'remaining',
    judgmentTiming: 'independent',
    startingScore: 501,
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
  'preset-caller-cumulative': {
    configId: 'preset-caller-cumulative',
    configName: 'コーラー累積',
    description: '累積での残り点数計算練習',
    icon: '🎲',
    throwUnit: 3,
    questionType: 'remaining',
    judgmentTiming: 'cumulative',
    startingScore: 501,
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
  'preset-comprehensive': {
    configId: 'preset-comprehensive',
    configName: '総合練習',
    description: '得点と残り点数の両方を問う',
    icon: '🏆',
    throwUnit: 3,
    questionType: 'both',
    judgmentTiming: 'cumulative',
    startingScore: 501,
    stdDevMM: 15,
    isPreset: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastPlayedAt: undefined,
  },
};

/**
 * デフォルト設定を取得
 */
export const getDefaultConfig = (): PresetConfig => {
  return { ...PRESETS[DEFAULT_PRESET_ID] };
};
