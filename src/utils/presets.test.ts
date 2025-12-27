import { describe, expect, test } from 'vitest';
import type { PracticeConfig } from '../types/PracticeConfig';
import { findMatchingPreset, generateCustomId, getPresetById, PRACTICE_PRESETS } from './presets';

describe('PRACTICE_PRESETS', () => {
  describe('プリセットの存在確認', () => {
    test('basicプリセットが存在する', () => {
      // Assert
      expect(PRACTICE_PRESETS.basic).toBeDefined();
    });

    test('playerプリセットが存在する', () => {
      // Assert
      expect(PRACTICE_PRESETS.player).toBeDefined();
    });

    test('callerBasicプリセットが存在する', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerBasic).toBeDefined();
    });

    test('callerCumulativeプリセットが存在する', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerCumulative).toBeDefined();
    });

    test('comprehensiveプリセットが存在する', () => {
      // Assert
      expect(PRACTICE_PRESETS.comprehensive).toBeDefined();
    });
  });

  describe('basic（基礎練習）', () => {
    test('configIdが"preset-basic"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.basic.configId).toBe('preset-basic');
    });

    test('throwUnitが1である', () => {
      // Assert
      expect(PRACTICE_PRESETS.basic.throwUnit).toBe(1);
    });

    test('questionTypeが"score"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.basic.questionType).toBe('score');
    });

    test('judgmentTimingが"independent"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.basic.judgmentTiming).toBe('independent');
    });

    test('startingScoreがnullである', () => {
      // Assert
      expect(PRACTICE_PRESETS.basic.startingScore).toBeNull();
    });

    test('isPresetがtrueである', () => {
      // Assert
      expect(PRACTICE_PRESETS.basic.isPreset).toBe(true);
    });

    test('configNameが設定されている', () => {
      // Assert
      expect(PRACTICE_PRESETS.basic.configName).toBeTruthy();
      expect(typeof PRACTICE_PRESETS.basic.configName).toBe('string');
    });
  });

  describe('player（プレイヤー練習）', () => {
    test('configIdが"preset-player"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.player.configId).toBe('preset-player');
    });

    test('throwUnitが3である', () => {
      // Assert
      expect(PRACTICE_PRESETS.player.throwUnit).toBe(3);
    });

    test('questionTypeが"remaining"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.player.questionType).toBe('remaining');
    });

    test('judgmentTimingが"cumulative"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.player.judgmentTiming).toBe('cumulative');
    });

    test('startingScoreが501である', () => {
      // Assert
      expect(PRACTICE_PRESETS.player.startingScore).toBe(501);
    });

    test('isPresetがtrueである', () => {
      // Assert
      expect(PRACTICE_PRESETS.player.isPreset).toBe(true);
    });
  });

  describe('callerBasic（コーラー基礎）', () => {
    test('configIdが"preset-caller-basic"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerBasic.configId).toBe('preset-caller-basic');
    });

    test('throwUnitが3である', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerBasic.throwUnit).toBe(3);
    });

    test('questionTypeが"score"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerBasic.questionType).toBe('score');
    });

    test('judgmentTimingが"independent"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerBasic.judgmentTiming).toBe('independent');
    });

    test('startingScoreがnullである', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerBasic.startingScore).toBeNull();
    });

    test('isPresetがtrueである', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerBasic.isPreset).toBe(true);
    });
  });

  describe('callerCumulative（コーラー累積）', () => {
    test('configIdが"preset-caller-cumulative"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerCumulative.configId).toBe('preset-caller-cumulative');
    });

    test('throwUnitが3である', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerCumulative.throwUnit).toBe(3);
    });

    test('questionTypeが"score"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerCumulative.questionType).toBe('score');
    });

    test('judgmentTimingが"cumulative"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerCumulative.judgmentTiming).toBe('cumulative');
    });

    test('startingScoreがnullである', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerCumulative.startingScore).toBeNull();
    });

    test('isPresetがtrueである', () => {
      // Assert
      expect(PRACTICE_PRESETS.callerCumulative.isPreset).toBe(true);
    });
  });

  describe('comprehensive（総合練習）', () => {
    test('configIdが"preset-comprehensive"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.comprehensive.configId).toBe('preset-comprehensive');
    });

    test('throwUnitが3である', () => {
      // Assert
      expect(PRACTICE_PRESETS.comprehensive.throwUnit).toBe(3);
    });

    test('questionTypeが"both"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.comprehensive.questionType).toBe('both');
    });

    test('judgmentTimingが"cumulative"である', () => {
      // Assert
      expect(PRACTICE_PRESETS.comprehensive.judgmentTiming).toBe('cumulative');
    });

    test('startingScoreが501である', () => {
      // Assert
      expect(PRACTICE_PRESETS.comprehensive.startingScore).toBe(501);
    });

    test('isPresetがtrueである', () => {
      // Assert
      expect(PRACTICE_PRESETS.comprehensive.isPreset).toBe(true);
    });
  });
});

describe('findMatchingPreset', () => {
  describe('正常系', () => {
    test('basicプリセットに合致する設定でbasicを返す', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
      };

      // Act
      const result = findMatchingPreset(config as PracticeConfig);

      // Assert
      expect(result).toBe('basic');
    });

    test('playerプリセットに合致する設定でplayerを返す', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'remaining',
        judgmentTiming: 'cumulative',
        startingScore: 501,
      };

      // Act
      const result = findMatchingPreset(config as PracticeConfig);

      // Assert
      expect(result).toBe('player');
    });

    test('callerBasicプリセットに合致する設定でcallerBasicを返す', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
      };

      // Act
      const result = findMatchingPreset(config as PracticeConfig);

      // Assert
      expect(result).toBe('callerBasic');
    });

    test('callerCumulativeプリセットに合致する設定でcallerCumulativeを返す', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'score',
        judgmentTiming: 'cumulative',
        startingScore: null,
      };

      // Act
      const result = findMatchingPreset(config as PracticeConfig);

      // Assert
      expect(result).toBe('callerCumulative');
    });

    test('comprehensiveプリセットに合致する設定でcomprehensiveを返す', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'both',
        judgmentTiming: 'cumulative',
        startingScore: 501,
      };

      // Act
      const result = findMatchingPreset(config as PracticeConfig);

      // Assert
      expect(result).toBe('comprehensive');
    });
  });

  describe('カスタム設定', () => {
    test('どのプリセットにも合致しない設定でnullを返す', () => {
      // Arrange - throwUnitが1でquestionTypeが'remaining'というプリセットは存在しない
      const config: Partial<PracticeConfig> = {
        throwUnit: 1,
        questionType: 'remaining',
        judgmentTiming: 'independent',
        startingScore: 501,
      };

      // Act
      const result = findMatchingPreset(config as PracticeConfig);

      // Assert
      expect(result).toBeNull();
    });

    test('異なるstartingScore（701）でnullを返す', () => {
      // Arrange - playerと似ているがstartingScoreが701
      const config: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'remaining',
        judgmentTiming: 'cumulative',
        startingScore: 701,
      };

      // Act
      const result = findMatchingPreset(config as PracticeConfig);

      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('generateCustomId', () => {
  describe('決定性', () => {
    test('同じ設定で常に同じIDを生成する', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
      };

      // Act
      const id1 = generateCustomId(config as PracticeConfig);
      const id2 = generateCustomId(config as PracticeConfig);

      // Assert
      expect(id1).toBe(id2);
    });

    test('IDが"custom-"で始まる', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'both',
        judgmentTiming: 'cumulative',
        startingScore: 501,
      };

      // Act
      const id = generateCustomId(config as PracticeConfig);

      // Assert
      expect(id).toMatch(/^custom-/);
    });
  });

  describe('識別性', () => {
    test('異なるthrowUnitで異なるIDを生成する', () => {
      // Arrange
      const config1: Partial<PracticeConfig> = {
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
      };
      const config2: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
      };

      // Act
      const id1 = generateCustomId(config1 as PracticeConfig);
      const id2 = generateCustomId(config2 as PracticeConfig);

      // Assert
      expect(id1).not.toBe(id2);
    });

    test('異なるquestionTypeで異なるIDを生成する', () => {
      // Arrange
      const config1: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'score',
        judgmentTiming: 'cumulative',
        startingScore: null,
      };
      const config2: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'remaining',
        judgmentTiming: 'cumulative',
        startingScore: 501,
      };

      // Act
      const id1 = generateCustomId(config1 as PracticeConfig);
      const id2 = generateCustomId(config2 as PracticeConfig);

      // Assert
      expect(id1).not.toBe(id2);
    });

    test('異なるjudgmentTimingで異なるIDを生成する', () => {
      // Arrange
      const config1: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
      };
      const config2: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'score',
        judgmentTiming: 'cumulative',
        startingScore: null,
      };

      // Act
      const id1 = generateCustomId(config1 as PracticeConfig);
      const id2 = generateCustomId(config2 as PracticeConfig);

      // Assert
      expect(id1).not.toBe(id2);
    });

    test('異なるstartingScoreで異なるIDを生成する', () => {
      // Arrange
      const config1: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'remaining',
        judgmentTiming: 'cumulative',
        startingScore: 501,
      };
      const config2: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'remaining',
        judgmentTiming: 'cumulative',
        startingScore: 701,
      };

      // Act
      const id1 = generateCustomId(config1 as PracticeConfig);
      const id2 = generateCustomId(config2 as PracticeConfig);

      // Assert
      expect(id1).not.toBe(id2);
    });
  });

  describe('エッジケース', () => {
    test('startingScoreがnullの設定でもIDを生成できる', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
      };

      // Act
      const id = generateCustomId(config as PracticeConfig);

      // Assert
      expect(id).toBeTruthy();
      expect(id).toMatch(/^custom-/);
    });

    test('startingScoreが301の設定でIDを生成できる', () => {
      // Arrange
      const config: Partial<PracticeConfig> = {
        throwUnit: 3,
        questionType: 'remaining',
        judgmentTiming: 'cumulative',
        startingScore: 301,
      };

      // Act
      const id = generateCustomId(config as PracticeConfig);

      // Assert
      expect(id).toBeTruthy();
      expect(id).toMatch(/^custom-/);
    });
  });
});

describe('getPresetById', () => {
  describe('正常系', () => {
    test('preset-basicでbasicプリセットを取得できる', () => {
      // Act
      const result = getPresetById('preset-basic');

      // Assert
      expect(result).toBeDefined();
      expect(result?.configId).toBe('preset-basic');
      expect(result?.throwUnit).toBe(1);
      expect(result?.questionType).toBe('score');
    });

    test('preset-playerでplayerプリセットを取得できる', () => {
      // Act
      const result = getPresetById('preset-player');

      // Assert
      expect(result).toBeDefined();
      expect(result?.configId).toBe('preset-player');
      expect(result?.throwUnit).toBe(3);
      expect(result?.questionType).toBe('remaining');
      expect(result?.startingScore).toBe(501);
    });

    test('preset-caller-basicでcallerBasicプリセットを取得できる', () => {
      // Act
      const result = getPresetById('preset-caller-basic');

      // Assert
      expect(result).toBeDefined();
      expect(result?.configId).toBe('preset-caller-basic');
      expect(result?.throwUnit).toBe(3);
      expect(result?.questionType).toBe('score');
      expect(result?.judgmentTiming).toBe('independent');
    });

    test('preset-caller-cumulativeでcallerCumulativeプリセットを取得できる', () => {
      // Act
      const result = getPresetById('preset-caller-cumulative');

      // Assert
      expect(result).toBeDefined();
      expect(result?.configId).toBe('preset-caller-cumulative');
      expect(result?.throwUnit).toBe(3);
      expect(result?.questionType).toBe('score');
      expect(result?.judgmentTiming).toBe('cumulative');
    });

    test('preset-comprehensiveでcomprehensiveプリセットを取得できる', () => {
      // Act
      const result = getPresetById('preset-comprehensive');

      // Assert
      expect(result).toBeDefined();
      expect(result?.configId).toBe('preset-comprehensive');
      expect(result?.throwUnit).toBe(3);
      expect(result?.questionType).toBe('both');
      expect(result?.startingScore).toBe(501);
    });
  });

  describe('異常系', () => {
    test('存在しないIDでundefinedを返す', () => {
      // Act
      const result = getPresetById('preset-nonexistent');

      // Assert
      expect(result).toBeUndefined();
    });

    test('custom-で始まるIDでundefinedを返す', () => {
      // カスタムIDはプリセットではないため
      // Act
      const result = getPresetById('custom-12345');

      // Assert
      expect(result).toBeUndefined();
    });

    test('空文字列でundefinedを返す', () => {
      // Act
      const result = getPresetById('');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('大文字小文字の区別', () => {
    test('preset-BASICでは取得できない（大文字小文字を区別する）', () => {
      // Act
      const result = getPresetById('preset-BASIC');

      // Assert
      expect(result).toBeUndefined();
    });

    test('PRESET-basicでは取得できない（大文字小文字を区別する）', () => {
      // Act
      const result = getPresetById('PRESET-basic');

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
