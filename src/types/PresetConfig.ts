import type { PracticeConfig } from './PracticeConfig';

/**
 * プリセット設定
 *
 * PracticeConfigを拡張し、プリセット専用の必須フィールドを定義します。
 * プリセットは常にicon、description、isPreset=trueを持ちます。
 */
export interface PresetConfig extends PracticeConfig {
  /** アイコン（絵文字等、プリセットでは必須） */
  icon: string;
  /** 説明文（プリセットでは必須） */
  description: string;
  /** プリセット設定フラグ（常にtrue） */
  isPreset: true;
}
