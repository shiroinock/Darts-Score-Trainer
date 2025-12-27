import { beforeEach, describe, expect, test } from 'vitest';
import type { PracticeConfig } from '../../types/index.js';
import { STORAGE_KEY } from '../constants/index.js';
import { clearSettings, loadSettings, saveSettings } from './index.js';

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

describe('clearSettings', () => {
  describe('正常系', () => {
    test('localStorageから設定を削除できる', () => {
      // Arrange
      saveSettings(mockConfig);
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      // Act
      clearSettings();

      // Assert
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    test('設定が存在しない場合もエラーにならない', () => {
      // Arrange
      // localStorageは空の状態

      // Act & Assert
      expect(() => clearSettings()).not.toThrow();
    });

    test('clearSettings後のloadSettingsはnullを返す', () => {
      // Arrange
      saveSettings(mockConfig);

      // Act
      clearSettings();
      const result = loadSettings();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('エッジケース - localStorageが使用不可', () => {
    test('removeItemがエラーをスローした場合、例外を握りつぶさない', () => {
      // Arrange
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      // Act & Assert
      expect(() => clearSettings()).toThrow('localStorage is not available');

      // Cleanup
      removeItemSpy.mockRestore();
    });
  });
});
