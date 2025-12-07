import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PracticeConfig } from '../types';
import { STORAGE_KEY } from './constants';
import { clearSettings, loadSettings, saveSettings } from './storage';

describe('storage', () => {
  // テスト用のPracticeConfigデータ
  const mockConfig: PracticeConfig = {
    configId: 'test-config-001',
    configName: 'テスト設定',
    description: 'テスト用の練習設定',
    icon: '🎯',
    throwUnit: 3,
    questionType: 'score',
    judgmentTiming: 'cumulative',
    startingScore: 501,
    target: {
      type: 'TRIPLE',
      number: 20,
      label: 'T20',
    },
    stdDevMM: 15,
    isPreset: false,
    createdAt: '2025-12-08T00:00:00.000Z',
    lastPlayedAt: '2025-12-08T12:00:00.000Z',
  };

  // 各テスト前にlocalStorageをクリア
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
        expect(() => saveSettings(emptyConfig as Partial<PracticeConfig>)).toThrow('config must not be an empty object');
      });

      test('nullを保存しようとするとTypeErrorをスローする', () => {
        // Arrange
        const nullConfig: null = null;

        // Act & Assert
        expect(() => saveSettings(nullConfig as unknown as Partial<PracticeConfig>)).toThrow(TypeError);
        expect(() => saveSettings(nullConfig as unknown as Partial<PracticeConfig>)).toThrow('config must not be null or undefined');
      });

      test('配列を保存しようとするとTypeErrorをスローする', () => {
        // Arrange
        const arrayConfig: unknown[] = [];

        // Act & Assert
        expect(() => saveSettings(arrayConfig as Partial<PracticeConfig>)).toThrow(TypeError);
        expect(() => saveSettings(arrayConfig as Partial<PracticeConfig>)).toThrow('config must be an object, not an array');
      });

      test('その他の型（プリミティブ）を保存しようとするとTypeErrorをスローする', () => {
        // Arrange
        const stringConfig = 'test';
        const numberConfig = 123;
        const booleanConfig = true;

        // Act & Assert
        expect(() => saveSettings(stringConfig as unknown as Partial<PracticeConfig>)).toThrow(TypeError);
        expect(() => saveSettings(stringConfig as unknown as Partial<PracticeConfig>)).toThrow('config must be an object');

        expect(() => saveSettings(numberConfig as unknown as Partial<PracticeConfig>)).toThrow(TypeError);
        expect(() => saveSettings(numberConfig as unknown as Partial<PracticeConfig>)).toThrow('config must be an object');

        expect(() => saveSettings(booleanConfig as unknown as Partial<PracticeConfig>)).toThrow(TypeError);
        expect(() => saveSettings(booleanConfig as unknown as Partial<PracticeConfig>)).toThrow('config must be an object');
      });
    });
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
});
