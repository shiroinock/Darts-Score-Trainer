import type { Target } from '../../types/Target';

/**
 * デフォルトターゲット定義
 *
 * ターゲットが未指定の場合に使用されるデフォルトのターゲットです。
 * 一般的に最も狙われる頻度が高いT20（トリプル20）を設定しています。
 */
export const DEFAULT_TARGET: Target = {
  type: 'TRIPLE',
  number: 20,
  label: 'T20',
} as const;
