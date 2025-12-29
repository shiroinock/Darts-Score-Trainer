/**
 * Step4Confirm - ウィザードステップ4: 確認画面
 *
 * 設定内容を確認し、練習を開始するステップです。
 */

import { PRESETS } from '../../../stores/config/presets';
import { useGameStore } from '../../../stores/gameStore';
import {
  findMatchingPreset,
  getDifficultyLabel,
  getSessionSummary,
} from '../../../utils/configHelpers';
import { DetailedSettings } from '../DetailedSettings';

/**
 * ステップ4: 確認画面コンポーネント
 */
export function Step4Confirm(): JSX.Element {
  const config = useGameStore((state) => state.config);
  const sessionConfig = useGameStore((state) => state.sessionConfig);

  // プリセット判定
  const matchingPresetId = findMatchingPreset(config);
  const presetName = matchingPresetId ? PRESETS[matchingPresetId].configName : 'カスタム設定';

  // 設定サマリー
  const sessionSummary = getSessionSummary(sessionConfig);
  const difficultyLabel = getDifficultyLabel(config.stdDevMM);

  return (
    <div className="setup-wizard__step">
      <div className="setup-wizard__step-header">
        <h2 className="setup-wizard__step-title">ステップ 4/4</h2>
        <p className="setup-wizard__step-description">設定内容を確認してください</p>
      </div>
      <div className="setup-wizard__step-content">
        {/* 設定サマリー */}
        <div className="settings-panel__summary">
          <h3 className="settings-panel__summary-title">現在の設定</h3>
          <div className="settings-panel__summary-content">
            <div className="settings-panel__summary-item">
              <span className="settings-panel__summary-label">プリセット:</span>
              <span className="settings-panel__summary-value">{presetName}</span>
            </div>
            <div className="settings-panel__summary-item">
              <span className="settings-panel__summary-label">セッション:</span>
              <span className="settings-panel__summary-value">{sessionSummary}</span>
            </div>
            <div className="settings-panel__summary-item">
              <span className="settings-panel__summary-label">難易度:</span>
              <span className="settings-panel__summary-value">{difficultyLabel}</span>
            </div>
          </div>
        </div>

        {/* 詳細設定（オプション） */}
        <div className="setup-wizard__advanced-settings">
          <DetailedSettings />
        </div>
      </div>
    </div>
  );
}
