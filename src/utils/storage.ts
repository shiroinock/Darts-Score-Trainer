/**
 * Darts Score Trainer - ローカルストレージ管理
 *
 * PracticeConfigの永続化を担当するモジュールです。
 * ユーザーの練習設定をlocalStorageに保存・読み込み・削除する機能を提供します。
 */

import type { PracticeConfig } from '../types';
import { STORAGE_KEY } from './constants';

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

/**
 * localStorageから練習設定を削除します
 *
 * @remarks
 * - 設定が存在しない場合もエラーにはなりません
 * - localStorage操作のエラーは呼び出し元に伝播します
 */
export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}
