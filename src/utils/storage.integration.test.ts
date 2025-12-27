import { beforeEach, describe, expect, test } from 'vitest';
import type { PracticeConfig } from '../types/index.js';
import { STORAGE_KEY } from './constants/index.js';
import { clearSettings, loadSettings, saveSettings } from './storage/index.js';

const mockConfig: PracticeConfig = {
  configId: 'test-config-001',
  configName: 'テスト設定',
  description: 'テスト用の練習設定',
  icon: '🎯',
  throwUnit: 3,
  questionType: 'score',
  judgmentTiming: 'cumulative',
  startingScore: 501,
  target: { type: 'TRIPLE', number: 20, label: 'T20' },
  stdDevMM: 15,
  isPreset: false,
  createdAt: '2025-12-08T00:00:00.000Z',
  lastPlayedAt: '2025-12-08T12:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
});

describe('統合シナリオ', () => {
  test('保存→読み込み→削除→読み込みのフロー', () => {
    // Arrange
    const config = mockConfig;

    // Act & Assert: 保存
    saveSettings(config);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    // Act & Assert: 読み込み
    const loaded = loadSettings();
    expect(loaded).toEqual(config);

    // Act & Assert: 削除
    clearSettings();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Act & Assert: 削除後の読み込み
    const afterClear = loadSettings();
    expect(afterClear).toBeNull();
  });

  test('複数回の保存と読み込み', () => {
    // Arrange
    const config1: PracticeConfig = { ...mockConfig, configName: '設定1' };
    const config2: PracticeConfig = { ...mockConfig, configName: '設定2' };
    const config3: PracticeConfig = { ...mockConfig, configName: '設定3' };

    // Act & Assert
    saveSettings(config1);
    expect(loadSettings()?.configName).toBe('設定1');

    saveSettings(config2);
    expect(loadSettings()?.configName).toBe('設定2');

    saveSettings(config3);
    expect(loadSettings()?.configName).toBe('設定3');
  });
});

describe('データ型の保持', () => {
  test('数値型が正しく保存・復元される', () => {
    // Arrange
    const config: PracticeConfig = {
      ...mockConfig,
      throwUnit: 3,
      startingScore: 501,
      stdDevMM: 15.5,
    };

    // Act
    saveSettings(config);
    const result = loadSettings();

    // Assert
    expect(result).not.toBeNull();
    expect(typeof result!.throwUnit).toBe('number');
    expect(typeof result!.startingScore).toBe('number');
    expect(typeof result!.stdDevMM).toBe('number');
    expect(result!.throwUnit).toBe(3);
    expect(result!.startingScore).toBe(501);
    expect(result!.stdDevMM).toBe(15.5);
  });

  test('null値が正しく保存・復元される', () => {
    // Arrange
    const config: PracticeConfig = {
      ...mockConfig,
      startingScore: null,
      description: undefined,
      icon: undefined,
    };

    // Act
    saveSettings(config);
    const result = loadSettings();

    // Assert
    expect(result).not.toBeNull();
    expect(result!.startingScore).toBeNull();
  });

  test('boolean型が正しく保存・復元される', () => {
    // Arrange
    const config1: PracticeConfig = { ...mockConfig, isPreset: true };
    const config2: PracticeConfig = { ...mockConfig, isPreset: false };

    // Act & Assert
    saveSettings(config1);
    expect(loadSettings()?.isPreset).toBe(true);

    saveSettings(config2);
    expect(loadSettings()?.isPreset).toBe(false);
  });

  test('ネストされたオブジェクト（target）が正しく保存・復元される', () => {
    // Arrange
    const config: PracticeConfig = {
      ...mockConfig,
      target: {
        type: 'DOUBLE',
        number: 16,
        label: 'D16',
      },
    };

    // Act
    saveSettings(config);
    const result = loadSettings();

    // Assert
    expect(result).not.toBeNull();
    expect(result?.target).toEqual({
      type: 'DOUBLE',
      number: 16,
      label: 'D16',
    });
    if (result?.target) {
      expect(typeof result.target).toBe('object');
      expect(result.target.type).toBe('DOUBLE');
      expect(result.target.number).toBe(16);
      expect(result.target.label).toBe('D16');
    }
  });
});

describe('エッジケース - 特殊な文字列', () => {
  test('特殊文字を含む文字列が正しく保存・復元される', () => {
    // Arrange
    const config: PracticeConfig = {
      ...mockConfig,
      configName: 'テスト"設定"with\'quotes\'',
      description: '改行\n含む\tタブも',
    };

    // Act
    saveSettings(config);
    const result = loadSettings();

    // Assert
    expect(result).not.toBeNull();
    expect(result!.configName).toBe('テスト"設定"with\'quotes\'');
    expect(result!.description).toBe('改行\n含む\tタブも');
  });

  test('空文字列プロパティが正しく保存・復元される', () => {
    // Arrange
    const config: PracticeConfig = {
      ...mockConfig,
      description: '',
      icon: '',
    };

    // Act
    saveSettings(config);
    const result = loadSettings();

    // Assert
    expect(result).not.toBeNull();
    expect(result!.description).toBe('');
    expect(result!.icon).toBe('');
  });
});

describe('ストレージキーの一貫性', () => {
  test('複数の関数が同じストレージキーを使用する', () => {
    // Arrange
    const config = mockConfig;

    // Act
    saveSettings(config);

    // Assert: 直接localStorageにアクセスして確認
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    // Act
    clearSettings();

    // Assert: 直接localStorageにアクセスして確認
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
