/**
 * 練習設定をlocalStorageに保存します
 *
 * @param config - 保存するPracticeConfig（部分的な設定も可）
 *
 * @throws {TypeError} configがnull、undefined、配列、または空オブジェクトの場合
 *
 * @remarks
 * - 既存の設定がある場合は上書きされます
 * - JSON形式で保存されます
 */

import type { PracticeConfig } from '../../types/index.js';
import { STORAGE_KEY } from '../constants/index.js';

export function saveSettings(config: Partial<PracticeConfig>): void {
  // null/undefinedチェック
  if (config == null) {
    throw new TypeError('config must not be null or undefined');
  }

  // 配列チェック
  if (Array.isArray(config)) {
    throw new TypeError('config must be an object, not an array');
  }

  // オブジェクト型チェック（プリミティブ型を弾く）
  if (typeof config !== 'object') {
    throw new TypeError('config must be an object');
  }

  // 空オブジェクトチェック
  if (Object.keys(config).length === 0) {
    throw new TypeError('config must not be an empty object');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
