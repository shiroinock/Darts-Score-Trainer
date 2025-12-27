import type { PracticeConfig } from '../types/PracticeConfig';

/**
 * プリセット名
 */
export type PresetName = 'basic' | 'player' | 'callerBasic' | 'callerCumulative' | 'comprehensive';

/**
 * デフォルトターゲット（T20）
 */
const DEFAULT_TARGET = { type: 'TRIPLE' as const, number: 20 };

/**
 * デフォルト標準偏差（30mm：中級者レベル）
 */
const DEFAULT_STD_DEV_MM = 30;

/**
 * プリセット設定集
 */
export const PRACTICE_PRESETS: Record<PresetName, PracticeConfig> = {
  basic: {
    configId: 'preset-basic',
    configName: '基礎練習',
    throwUnit: 1,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: null,
    target: DEFAULT_TARGET,
    stdDevMM: DEFAULT_STD_DEV_MM,
    isPreset: true,
  },
  player: {
    configId: 'preset-player',
    configName: 'プレイヤー練習',
    throwUnit: 3,
    questionType: 'remaining',
    judgmentTiming: 'cumulative',
    startingScore: 501,
    target: DEFAULT_TARGET,
    stdDevMM: DEFAULT_STD_DEV_MM,
    isPreset: true,
  },
  callerBasic: {
    configId: 'preset-caller-basic',
    configName: 'コーラー基礎',
    throwUnit: 3,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: null,
    target: DEFAULT_TARGET,
    stdDevMM: DEFAULT_STD_DEV_MM,
    isPreset: true,
  },
  callerCumulative: {
    configId: 'preset-caller-cumulative',
    configName: 'コーラー累積',
    throwUnit: 3,
    questionType: 'score',
    judgmentTiming: 'cumulative',
    startingScore: null,
    target: DEFAULT_TARGET,
    stdDevMM: DEFAULT_STD_DEV_MM,
    isPreset: true,
  },
  comprehensive: {
    configId: 'preset-comprehensive',
    configName: '総合練習',
    throwUnit: 3,
    questionType: 'both',
    judgmentTiming: 'cumulative',
    startingScore: 501,
    target: DEFAULT_TARGET,
    stdDevMM: DEFAULT_STD_DEV_MM,
    isPreset: true,
  },
};

/**
 * PracticeConfigから確定的にIDを生成する
 *
 * @param config - 練習設定
 * @returns カスタムID（例: "custom-single-score-independent-null"）
 */
export function generateCustomId(config: PracticeConfig): string {
  const throwUnitStr = config.throwUnit === 1 ? 'single' : 'round';
  const startingScoreStr = config.startingScore === null ? 'null' : String(config.startingScore);

  return `custom-${throwUnitStr}-${config.questionType}-${config.judgmentTiming}-${startingScoreStr}`;
}

/**
 * configの4つの軸が完全一致するプリセットを検索する
 *
 * @param config - 練習設定
 * @returns 合致するプリセット名、なければnull
 */
export function findMatchingPreset(config: PracticeConfig): PresetName | null {
  const presetEntries = Object.entries(PRACTICE_PRESETS) as [PresetName, PracticeConfig][];

  for (const [name, preset] of presetEntries) {
    if (
      preset.throwUnit === config.throwUnit &&
      preset.questionType === config.questionType &&
      preset.judgmentTiming === config.judgmentTiming &&
      preset.startingScore === config.startingScore
    ) {
      return name;
    }
  }

  return null;
}

/**
 * IDからプリセットを取得する
 *
 * @param id - プリセットID（例: 'preset-basic'）
 * @returns 該当するプリセット、なければnull
 */
export function getPresetById(id: string): PracticeConfig | null {
  const presetEntries = Object.entries(PRACTICE_PRESETS) as [PresetName, PracticeConfig][];

  for (const [, preset] of presetEntries) {
    if (preset.configId === id) {
      return preset;
    }
  }

  return null;
}
