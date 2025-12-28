/**
 * SettingsPanel - 設定パネルコンポーネント
 *
 * 全設定コンポーネントを統合し、現在の設定サマリー表示と練習開始ボタンを提供します。
 */

import { PRESETS } from '../../stores/config/presets';
import { useGameStore } from '../../stores/gameStore';
import type { PracticeConfig, SessionConfig } from '../../types';
import { DetailedSettings } from './DetailedSettings';
import { DIFFICULTY_PRESETS, DifficultySelector } from './DifficultySelector';
import { PresetSelector } from './PresetSelector';
import { SessionConfigSelector } from './SessionConfigSelector';

/**
 * 現在の設定が既存プリセットと完全一致するか判定する
 */
function findMatchingPreset(config: PracticeConfig): string | null {
  for (const [presetId, preset] of Object.entries(PRESETS)) {
    // 練習パラメーターと標準偏差を比較（ターゲットは除く）
    if (
      preset.throwUnit === config.throwUnit &&
      preset.questionType === config.questionType &&
      preset.judgmentTiming === config.judgmentTiming &&
      preset.startingScore === config.startingScore &&
      preset.stdDevMM === config.stdDevMM
    ) {
      return presetId;
    }
  }
  return null;
}

/**
 * 難易度プリセット名を取得する
 */
function getDifficultyLabel(stdDevMM: number): string {
  const preset = DIFFICULTY_PRESETS.find((p) => p.stdDevMM === stdDevMM);
  return preset ? preset.label : `カスタム ${stdDevMM}mm`;
}

/**
 * セッション設定のサマリー文字列を生成する
 */
function getSessionSummary(sessionConfig: SessionConfig): string {
  if (sessionConfig.mode === 'questions') {
    return `問題数モード: ${sessionConfig.questionCount ?? 10}問`;
  }
  return `時間制限モード: ${sessionConfig.timeLimit ?? 3}分`;
}

/**
 * 設定パネルコンポーネント
 */
export function SettingsPanel(): JSX.Element {
  const config = useGameStore((state) => state.config);
  const sessionConfig = useGameStore((state) => state.sessionConfig);
  const startPractice = useGameStore((state) => state.startPractice);

  // プリセット判定
  const matchingPresetId = findMatchingPreset(config);
  const presetName = matchingPresetId ? PRESETS[matchingPresetId].configName : 'カスタム設定';

  // 設定サマリー
  const sessionSummary = getSessionSummary(sessionConfig);
  const difficultyLabel = getDifficultyLabel(config.stdDevMM);

  return (
    <div className="settings-panel">
      {/* プリセット選択 */}
      <PresetSelector />

      {/* セッション設定 */}
      <SessionConfigSelector />

      {/* 難易度選択 */}
      <DifficultySelector />

      {/* 詳細設定 */}
      <DetailedSettings />

      {/* 設定サマリー */}
      <div className="settings-panel__summary">
        <h2 className="settings-panel__summary-title">現在の設定</h2>
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

      {/* 練習開始ボタン */}
      <button
        className="settings-panel__start-button"
        onClick={startPractice}
        type="button"
        aria-label="練習を開始"
      >
        練習を開始
      </button>
    </div>
  );
}
