/**
 * localStorageから練習設定を読み込みます
 *
 * @returns 保存されたPracticeConfig、または存在しない/不正な場合はnull
 *
 * @remarks
 * 以下の場合にnullを返します:
 * - 設定が保存されていない
 * - 不正なJSON文字列
 * - 空文字列
 * - null値
 * - 配列やオブジェクト以外の値
 * - localStorage操作エラー
 */

import type { PracticeConfig } from '../../types/index.js';
import { STORAGE_KEY } from '../constants/index.js';

export function loadSettings(): Partial<PracticeConfig> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    // 設定が存在しない、または空文字列の場合
    if (!stored) {
      return null;
    }

    // JSONをパース
    const parsed = JSON.parse(stored);

    // null、配列、オブジェクト以外の値の場合はnullを返す
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
      return null;
    }

    return parsed as Partial<PracticeConfig>;
  } catch {
    // JSON.parseエラー、localStorage操作エラーなどをキャッチ
    return null;
  }
}
