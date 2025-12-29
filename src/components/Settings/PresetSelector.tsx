/**
 * PresetSelector - プリセット選択UIコンポーネント
 *
 * 5つのプリセットボタンを表示し、選択するとストアのselectPresetアクションを呼び出します。
 */

import './PresetSelector.css';
import { PRESETS } from '../../stores/config/presets';
import { useGameStore } from '../../stores/gameStore';

/**
 * プリセット選択UIコンポーネント
 */
export function PresetSelector(): JSX.Element {
  const currentConfigId = useGameStore((state) => state.config.configId);
  const selectPreset = useGameStore((state) => state.selectPreset);

  // プリセット一覧を配列として取得（順序を保証）
  const presets = Object.values(PRESETS);

  return (
    <div className="preset-selector">
      <h2 className="preset-selector__title">練習モードを選択</h2>
      <div className="preset-selector__grid">
        {presets.map((preset) => {
          const isActive = preset.configId === currentConfigId;

          return (
            <button
              key={preset.configId}
              className={`preset-button ${isActive ? 'preset-button--active' : ''}`}
              onClick={() => selectPreset(preset.configId)}
              type="button"
              aria-pressed={isActive}
              title={preset.description}
            >
              <span className="preset-button__icon" aria-hidden="true">
                {preset.icon}
              </span>
              <span className="preset-button__name">{preset.configName}</span>
              <span className="preset-button__description">{preset.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
