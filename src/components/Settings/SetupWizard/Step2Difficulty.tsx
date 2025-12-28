/**
 * Step2Difficulty - ウィザードステップ2: 難易度選択
 *
 * プレイヤーの実力（標準偏差）を選択するステップです。
 */

import { DifficultySelector } from '../DifficultySelector';

/**
 * ステップ2: 難易度選択コンポーネント
 */
export function Step2Difficulty(): JSX.Element {
  return (
    <div className="setup-wizard__step">
      <div className="setup-wizard__step-header">
        <h2 className="setup-wizard__step-title">ステップ 2/4</h2>
        <p className="setup-wizard__step-description">難易度を選択してください</p>
      </div>
      <div className="setup-wizard__step-content">
        <DifficultySelector />
      </div>
    </div>
  );
}
