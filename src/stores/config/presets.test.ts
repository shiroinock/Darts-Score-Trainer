import { describe, expect, test } from 'vitest';
import type { PresetConfig } from '../../types';
import { DEFAULT_PRESET_ID, getDefaultConfig, PRESETS } from './presets';

describe('presets', () => {
  describe('DEFAULT_PRESET_ID', () => {
    test('デフォルトプリセットIDは"preset-basic"である', () => {
      // Arrange & Act
      const id = DEFAULT_PRESET_ID;

      // Assert
      expect(id).toBe('preset-basic');
    });
  });

  describe('PRESETS', () => {
    describe('正常系', () => {
      test('5つのプリセットを含む', () => {
        // Arrange & Act
        const presetKeys = Object.keys(PRESETS);

        // Assert
        expect(presetKeys).toHaveLength(5);
      });

      test('全てのプリセットキーが正しい', () => {
        // Arrange & Act
        const presetKeys = Object.keys(PRESETS);

        // Assert
        expect(presetKeys).toEqual([
          'preset-basic',
          'preset-player',
          'preset-caller-basic',
          'preset-caller-cumulative',
          'preset-comprehensive',
        ]);
      });
    });

    describe('preset-basic（基礎練習）', () => {
      test('configIdは"preset-basic"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.configId).toBe('preset-basic');
      });

      test('configNameは"基礎練習"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.configName).toBe('基礎練習');
      });

      test('descriptionは"1投単位で得点を問う基本練習（62ターゲットからランダム出題）"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.description).toBe(
          '1投単位で得点を問う基本練習（62ターゲットからランダム出題）'
        );
      });

      test('iconは"📚"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.icon).toBe('📚');
      });

      test('throwUnitは1である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.throwUnit).toBe(1);
      });

      test('questionTypeは"score"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.questionType).toBe('score');
      });

      test('judgmentTimingは"independent"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.judgmentTiming).toBe('independent');
      });

      test('startingScoreは501である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.startingScore).toBe(501);
      });

      test('stdDevMMは15である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.stdDevMM).toBe(15);
      });

      test('randomizeTargetはtrueである', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.randomizeTarget).toBe(true);
      });

      test('useBasicTargetsはtrueである', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.useBasicTargets).toBe(true);
      });

      test('isPresetはtrueである', () => {
        // Arrange & Act
        const preset = PRESETS['preset-basic'];

        // Assert
        expect(preset.isPreset).toBe(true);
      });
    });

    describe('preset-player（プレイヤー練習）', () => {
      test('configIdは"preset-player"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-player'];

        // Assert
        expect(preset.configId).toBe('preset-player');
      });

      test('configNameは"プレイヤー練習"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-player'];

        // Assert
        expect(preset.configName).toBe('プレイヤー練習');
      });

      test('throwUnitは3である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-player'];

        // Assert
        expect(preset.throwUnit).toBe(3);
      });

      test('questionTypeは"score"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-player'];

        // Assert
        expect(preset.questionType).toBe('score');
      });
    });

    describe('preset-caller-basic（コーラー基礎）', () => {
      test('configIdは"preset-caller-basic"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.configId).toBe('preset-caller-basic');
      });

      test('configNameは"コーラー基礎"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.configName).toBe('コーラー基礎');
      });

      test('descriptionは"1投ごとに残り点数を問う基礎練習"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.description).toBe('1投ごとに残り点数を問う基礎練習');
      });

      test('iconは"📢"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.icon).toBe('📢');
      });

      test('throwUnitは1である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.throwUnit).toBe(1);
      });

      test('questionTypeは"remaining"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.questionType).toBe('remaining');
      });

      test('judgmentTimingは"independent"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.judgmentTiming).toBe('independent');
      });

      test('startingScoreは501である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.startingScore).toBe(501);
      });

      test('stdDevMMは15である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.stdDevMM).toBe(15);
      });

      test('isPresetはtrueである', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-basic'];

        // Assert
        expect(preset.isPreset).toBe(true);
      });
    });

    describe('preset-caller-cumulative（コーラー累積）', () => {
      test('configIdは"preset-caller-cumulative"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-cumulative'];

        // Assert
        expect(preset.configId).toBe('preset-caller-cumulative');
      });

      test('configNameは"コーラー累積"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-cumulative'];

        // Assert
        expect(preset.configName).toBe('コーラー累積');
      });

      test('throwUnitは3である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-cumulative'];

        // Assert
        expect(preset.throwUnit).toBe(3);
      });

      test('judgmentTimingは"cumulative"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-caller-cumulative'];

        // Assert
        expect(preset.judgmentTiming).toBe('cumulative');
      });
    });

    describe('preset-comprehensive（総合練習）', () => {
      test('configIdは"preset-comprehensive"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-comprehensive'];

        // Assert
        expect(preset.configId).toBe('preset-comprehensive');
      });

      test('configNameは"総合練習"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-comprehensive'];

        // Assert
        expect(preset.configName).toBe('総合練習');
      });

      test('throwUnitは3である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-comprehensive'];

        // Assert
        expect(preset.throwUnit).toBe(3);
      });

      test('questionTypeは"both"である', () => {
        // Arrange & Act
        const preset = PRESETS['preset-comprehensive'];

        // Assert
        expect(preset.questionType).toBe('both');
      });
    });

    describe('プリセット構造の検証', () => {
      test('全てのプリセットがPresetConfig型である', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          // 型としての適合性を検証
          const validatedPreset: PresetConfig = preset;
          expect(validatedPreset).toBe(preset);
        });
      });

      test('全てのプリセットがiconプロパティを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          expect(preset.icon).toBeDefined();
          expect(typeof preset.icon).toBe('string');
          expect(preset.icon.length).toBeGreaterThan(0);
        });
      });

      test('全てのプリセットがdescriptionプロパティを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          expect(preset.description).toBeDefined();
          expect(typeof preset.description).toBe('string');
          expect(preset.description.length).toBeGreaterThan(0);
        });
      });

      test('全てのプリセットのisPresetがtrueである', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          expect(preset.isPreset).toBe(true);
        });
      });

      test('全てのプリセットが有効なthrowUnit（1または3）を持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          expect([1, 3]).toContain(preset.throwUnit);
        });
      });

      test('全てのプリセットが有効なquestionTypeを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          expect(['score', 'remaining', 'both']).toContain(preset.questionType);
        });
      });

      test('全てのプリセットが有効なjudgmentTimingを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          expect(['independent', 'cumulative']).toContain(preset.judgmentTiming);
        });
      });

      test('全てのプリセットが有効なstartingScoreを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          expect([301, 501, 701]).toContain(preset.startingScore);
        });
      });

      test('全てのプリセットが有効なstdDevMMを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);

        // Assert
        presets.forEach((preset) => {
          expect(preset.stdDevMM).toBeGreaterThan(0);
          expect(preset.stdDevMM).toBeLessThanOrEqual(100);
        });
      });
    });

    describe('一意性の検証', () => {
      test('全てのプリセットが一意なconfigIdを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);
        const configIds = presets.map((p) => p.configId);

        // Assert
        const uniqueIds = new Set(configIds);
        expect(uniqueIds.size).toBe(presets.length);
      });

      test('全てのプリセットが一意なconfigNameを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);
        const configNames = presets.map((p) => p.configName);

        // Assert
        const uniqueNames = new Set(configNames);
        expect(uniqueNames.size).toBe(presets.length);
      });

      test('全てのプリセットが一意なiconを持つ', () => {
        // Arrange & Act
        const presets = Object.values(PRESETS);
        const icons = presets.map((p) => p.icon);

        // Assert
        const uniqueIcons = new Set(icons);
        expect(uniqueIcons.size).toBe(presets.length);
      });
    });

    describe('エッジケース', () => {
      test('存在しないプリセットIDへのアクセスはundefinedを返す', () => {
        // Arrange & Act
        const preset = PRESETS['non-existent-preset'];

        // Assert
        expect(preset).toBeUndefined();
      });
    });
  });

  describe('getDefaultConfig', () => {
    describe('正常系', () => {
      test('デフォルトプリセット（preset-basic）の設定を返す', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        expect(config.configId).toBe('preset-basic');
        expect(config.configName).toBe('基礎練習');
      });

      test('返される設定はPresetConfig型である', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        const validatedConfig: PresetConfig = config;
        expect(validatedConfig).toBe(config);
      });

      test('返される設定はコピーである（元のオブジェクトとは異なる参照）', () => {
        // Arrange
        const originalPreset = PRESETS[DEFAULT_PRESET_ID];

        // Act
        const config = getDefaultConfig();

        // Assert
        expect(config).not.toBe(originalPreset);
        expect(config).toEqual(originalPreset);
      });

      test('返される設定を変更しても元のプリセットは変更されない', () => {
        // Arrange
        const originalPreset = { ...PRESETS[DEFAULT_PRESET_ID] };

        // Act
        const config = getDefaultConfig();
        config.stdDevMM = 999; // 設定を変更

        // Assert
        expect(PRESETS[DEFAULT_PRESET_ID]).toEqual(originalPreset);
        expect(PRESETS[DEFAULT_PRESET_ID].stdDevMM).toBe(15);
      });
    });

    describe('プロパティの検証', () => {
      test('throwUnitは1である', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        expect(config.throwUnit).toBe(1);
      });

      test('questionTypeは"score"である', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        expect(config.questionType).toBe('score');
      });

      test('judgmentTimingは"independent"である', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        expect(config.judgmentTiming).toBe('independent');
      });

      test('startingScoreは501である', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        expect(config.startingScore).toBe(501);
      });

      test('stdDevMMは15である', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        expect(config.stdDevMM).toBe(15);
      });

      test('isPresetはtrueである', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        expect(config.isPreset).toBe(true);
      });

      test('useBasicTargetsはtrueである', () => {
        // Arrange & Act
        const config = getDefaultConfig();

        // Assert
        expect(config.useBasicTargets).toBe(true);
      });
    });
  });
});
