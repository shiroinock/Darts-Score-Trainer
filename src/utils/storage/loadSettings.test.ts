import { beforeEach, describe, expect, test } from 'vitest';
import type { PracticeConfig } from '../../types/index.js';
import { STORAGE_KEY } from '../constants/index.js';
import { loadSettings, saveSettings } from './index.js';

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

describe('loadSettings', () => {
  describe('正常系', () => {
    test('保存された設定を読み込める', () => {
      // Arrange
      saveSettings(mockConfig);

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toEqual(mockConfig);
    });

    test('設定が保存されていない場合はnullを返す', () => {
      // Arrange
      // localStorageは空の状態

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();
    });

    test('保存された設定の全プロパティが正しく復元される', () => {
      // Arrange
      saveSettings(mockConfig);

      // Act
      const result = loadSettings();

      // Assert
      expect(result).not.toBeNull();
      expect(result!.configId).toBe(mockConfig.configId);
      expect(result!.configName).toBe(mockConfig.configName);
      expect(result!.description).toBe(mockConfig.description);
      expect(result!.icon).toBe(mockConfig.icon);
      expect(result!.throwUnit).toBe(mockConfig.throwUnit);
      expect(result!.questionType).toBe(mockConfig.questionType);
      expect(result!.judgmentTiming).toBe(mockConfig.judgmentTiming);
      expect(result!.startingScore).toBe(mockConfig.startingScore);
      expect(result!.target).toEqual(mockConfig.target);
      expect(result!.stdDevMM).toBe(mockConfig.stdDevMM);
      expect(result!.isPreset).toBe(mockConfig.isPreset);
      expect(result!.createdAt).toBe(mockConfig.createdAt);
      expect(result!.lastPlayedAt).toBe(mockConfig.lastPlayedAt);
    });
  });

  describe('異常系', () => {
    test('不正なJSONが保存されている場合、nullを返す', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, 'invalid-json{{{');

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();
    });

    test('空文字列が保存されている場合、nullを返す', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, '');

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();
    });

    test('null文字列が保存されている場合、nullを返す', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, 'null');

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();
    });

    test('配列が保存されている場合、nullを返す', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, '[]');

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();
    });

    test('オブジェクト以外のJSON値が保存されている場合、nullを返す', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, '123');

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('エッジケース - localStorageが使用不可', () => {
    test('getItemがエラーをスローした場合、nullを返す', () => {
      // Arrange
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();

      // Cleanup
      getItemSpy.mockRestore();
    });

    test('JSON.parseがエラーをスローした場合、nullを返す', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, '{broken json');

      // Act
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();
    });
  });
});
