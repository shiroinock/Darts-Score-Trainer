/**
 * 型ガード関数
 *
 * localStorage からの読み込みデータを安全に検証します。
 */

import type { PracticeConfig } from '../../types';

/**
 * Persist バージョン番号
 */
export const PERSIST_VERSION = 0 as const;

/**
 * 型ガード: persist形式のデータか判定
 */
export const isPersistFormat = (
  data: unknown
): data is { state: { config: unknown }; version: number } => {
  return (
    data !== null &&
    typeof data === 'object' &&
    'state' in data &&
    data.state !== null &&
    typeof data.state === 'object' &&
    'config' in data.state
  );
};

/**
 * 型ガード: PracticeConfig形式のデータか判定
 */
export const isPracticeConfigFormat = (data: unknown): data is PracticeConfig => {
  return (
    data !== null &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    'configId' in data
  );
};
