/**
 * Step1Preset - ウィザードステップ1: プリセット選択
 *
 * 練習モードのプリセットを選択するステップです。
 */

import { PresetSelector } from '../PresetSelector';

/**
 * ステップ1: プリセット選択コンポーネント
 */
export function Step1Preset(): JSX.Element {
  return (
    <div className="setup-wizard__step">
      <div className="setup-wizard__step-header">
        <h2 className="setup-wizard__step-title">ステップ 1/4</h2>
        <p className="setup-wizard__step-description">練習モードを選択してください</p>
      </div>
      <div className="setup-wizard__step-content">
        <PresetSelector />
      </div>
    </div>
  );
}
