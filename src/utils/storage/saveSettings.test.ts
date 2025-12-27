import { beforeEach, describe, expect, test } from 'vitest';
import type { PracticeConfig } from '../../types/index.js';
import { STORAGE_KEY } from '../constants/index.js';
import { saveSettings } from './saveSettings.js';

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

describe('saveSettings', () => {
  describe('正常系', () => {
    test('PracticeConfigをlocalStorageに保存できる', () => {
      // Arrange
      const config = mockConfig;

      // Act
      saveSettings(config);

      // Assert
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(config);
    });

    test('既存の設定を上書きできる', () => {
      // Arrange
      const initialConfig = mockConfig;
      const updatedConfig: PracticeConfig = {
        ...mockConfig,
        configName: '更新された設定',
        stdDevMM: 30,
      };

      // Act
      saveSettings(initialConfig);
      saveSettings(updatedConfig);

      // Assert
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed.configName).toBe('更新された設定');
      expect(parsed.stdDevMM).toBe(30);
    });

    test('最小限のPracticeConfigを保存できる', () => {
      // Arrange
      const minimalConfig: PracticeConfig = {
        configId: 'minimal-001',
        configName: '最小設定',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
        target: {
          type: 'SINGLE',
          number: 20,
        },
        stdDevMM: 50,
        isPreset: false,
      };

      // Act
      saveSettings(minimalConfig);

      // Assert
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(minimalConfig);
    });
  });

  describe('異常系', () => {
    test('空オブジェクトを保存しようとするとTypeErrorをスローする', () => {
      // Arrange
      const emptyConfig = {};

      // Act & Assert
      expect(() => saveSettings(emptyConfig as Partial<PracticeConfig>)).toThrow(TypeError);
      expect(() => saveSettings(emptyConfig as Partial<PracticeConfig>)).toThrow(
        'config must not be an empty object'
      );
    });

    test('nullを保存しようとするとTypeErrorをスローする', () => {
      // Arrange
      const nullConfig: null = null;

      // Act & Assert
      expect(() => saveSettings(nullConfig as unknown as Partial<PracticeConfig>)).toThrow(
        TypeError
      );
      expect(() => saveSettings(nullConfig as unknown as Partial<PracticeConfig>)).toThrow(
        'config must not be null or undefined'
      );
    });

    test('配列を保存しようとするとTypeErrorをスローする', () => {
      // Arrange
      const arrayConfig: unknown[] = [];

      // Act & Assert
      expect(() => saveSettings(arrayConfig as Partial<PracticeConfig>)).toThrow(TypeError);
      expect(() => saveSettings(arrayConfig as Partial<PracticeConfig>)).toThrow(
        'config must be an object, not an array'
      );
    });

    test('その他の型（プリミティブ）を保存しようとするとTypeErrorをスローする', () => {
      // Arrange
      const stringConfig = 'test';
      const numberConfig = 123;
      const booleanConfig = true;

      // Act & Assert
      expect(() => saveSettings(stringConfig as unknown as Partial<PracticeConfig>)).toThrow(
        TypeError
      );
      expect(() => saveSettings(stringConfig as unknown as Partial<PracticeConfig>)).toThrow(
        'config must be an object'
      );

      expect(() => saveSettings(numberConfig as unknown as Partial<PracticeConfig>)).toThrow(
        TypeError
      );
      expect(() => saveSettings(numberConfig as unknown as Partial<PracticeConfig>)).toThrow(
        'config must be an object'
      );

      expect(() => saveSettings(booleanConfig as unknown as Partial<PracticeConfig>)).toThrow(
        TypeError
      );
      expect(() => saveSettings(booleanConfig as unknown as Partial<PracticeConfig>)).toThrow(
        'config must be an object'
      );
    });
  });
});
