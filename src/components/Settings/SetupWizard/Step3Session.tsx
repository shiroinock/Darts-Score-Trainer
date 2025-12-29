/**
 * Step3Session - ウィザードステップ3: セッション設定
 *
 * 練習セッションのモード（問題数/時間制限）を選択するステップです。
 */

import { SessionConfigSelector } from '../SessionConfigSelector';

/**
 * ステップ3: セッション設定コンポーネント
 */
export function Step3Session(): JSX.Element {
  return (
    <div className="setup-wizard__step">
      <div className="setup-wizard__step-header">
        <h2 className="setup-wizard__step-title">ステップ 3/4</h2>
        <p className="setup-wizard__step-description">セッション設定を選択してください</p>
      </div>
      <div className="setup-wizard__step-content">
        <SessionConfigSelector />
      </div>
    </div>
  );
}
