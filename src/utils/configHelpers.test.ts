/**
 * configHelpers.ts のテスト
 * 設定関連のヘルパー関数のテスト
 */

import { describe, expect, test } from 'vitest';
import { PRESETS } from '../stores/config/presets.js';
import type { PracticeConfig, SessionConfig } from '../types/index.js';
import { findMatchingPreset, getDifficultyLabel, getSessionSummary } from './configHelpers.js';

describe('configHelpers', () => {
  describe('findMatchingPreset', () => {
    test('プリセット設定の場合、プリセットIDを返す', () => {
      const config: PracticeConfig = {
        ...PRESETS['preset-basic'],
        isPreset: true,
        configId: 'preset-basic',
      };

      const result = findMatchingPreset(config);
      expect(result).toBe('preset-basic');
    });

    test('カスタム設定（isPreset=false）の場合、nullを返す', () => {
      const config: PracticeConfig = {
        ...PRESETS['preset-basic'],
        isPreset: false,
        configId: 'custom-12345',
      };

      const result = findMatchingPreset(config);
      expect(result).toBeNull();
    });

    test('configIdがpresetプレフィックスで始まらない場合、nullを返す', () => {
      const config: PracticeConfig = {
        ...PRESETS['preset-basic'],
        isPreset: true,
        configId: 'custom-basic',
      };

      const result = findMatchingPreset(config);
      expect(result).toBeNull();
    });

    test('存在しないプリセットIDの場合、nullを返す', () => {
      const config: PracticeConfig = {
        ...PRESETS['preset-basic'],
        isPreset: true,
        configId: 'preset-nonexistent',
      };

      const result = findMatchingPreset(config);
      expect(result).toBeNull();
    });

    test('全てのプリセットIDが正しく識別される', () => {
      const presetIds = Object.keys(PRESETS);

      for (const presetId of presetIds) {
        const config: PracticeConfig = {
          ...PRESETS[presetId],
          isPreset: true,
          configId: presetId,
        };

        const result = findMatchingPreset(config);
        expect(result).toBe(presetId);
      }
    });
  });

  describe('getDifficultyLabel', () => {
    test('初心者（50mm）の場合、"初心者"を返す', () => {
      const result = getDifficultyLabel(50);
      expect(result).toBe('初心者');
    });

    test('中級者（30mm）の場合、"中級者"を返す', () => {
      const result = getDifficultyLabel(30);
      expect(result).toBe('中級者');
    });

    test('上級者（15mm）の場合、"上級者"を返す', () => {
      const result = getDifficultyLabel(15);
      expect(result).toBe('上級者');
    });

    test('エキスパート（8mm）の場合、"エキスパート"を返す', () => {
      const result = getDifficultyLabel(8);
      expect(result).toBe('エキスパート');
    });

    test('カスタム値（20mm）の場合、"20mm"を返す', () => {
      const result = getDifficultyLabel(20);
      expect(result).toBe('20mm');
    });

    test('カスタム値（100mm）の場合、"100mm"を返す', () => {
      const result = getDifficultyLabel(100);
      expect(result).toBe('100mm');
    });

    test('小数点を含むカスタム値（12.5mm）の場合、"12.5mm"を返す', () => {
      const result = getDifficultyLabel(12.5);
      expect(result).toBe('12.5mm');
    });
  });

  describe('getSessionSummary', () => {
    test('問題数モード10問の場合、"問題数モード: 10問"を返す', () => {
      const sessionConfig: SessionConfig = {
        mode: 'questions',
        questionCount: 10,
      };

      const result = getSessionSummary(sessionConfig);
      expect(result).toBe('問題数モード: 10問');
    });

    test('問題数モード20問の場合、"問題数モード: 20問"を返す', () => {
      const sessionConfig: SessionConfig = {
        mode: 'questions',
        questionCount: 20,
      };

      const result = getSessionSummary(sessionConfig);
      expect(result).toBe('問題数モード: 20問');
    });

    test('問題数モードでquestionCountがundefinedの場合、デフォルト10問を表示', () => {
      const sessionConfig: SessionConfig = {
        mode: 'questions',
        questionCount: undefined,
      };

      const result = getSessionSummary(sessionConfig);
      expect(result).toBe('問題数モード: 10問');
    });

    test('時間制限モード3分の場合、"時間制限モード: 3分"を返す', () => {
      const sessionConfig: SessionConfig = {
        mode: 'time',
        timeLimit: 3,
      };

      const result = getSessionSummary(sessionConfig);
      expect(result).toBe('時間制限モード: 3分');
    });

    test('時間制限モード5分の場合、"時間制限モード: 5分"を返す', () => {
      const sessionConfig: SessionConfig = {
        mode: 'time',
        timeLimit: 5,
      };

      const result = getSessionSummary(sessionConfig);
      expect(result).toBe('時間制限モード: 5分');
    });

    test('時間制限モードでtimeLimitがundefinedの場合、デフォルト3分を表示', () => {
      const sessionConfig: SessionConfig = {
        mode: 'time',
        timeLimit: undefined,
      };

      const result = getSessionSummary(sessionConfig);
      expect(result).toBe('時間制限モード: 3分');
    });
  });
});
