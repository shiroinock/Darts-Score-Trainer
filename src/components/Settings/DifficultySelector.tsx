/**
 * DifficultySelector - 難易度（標準偏差）選択UIコンポーネント
 *
 * プレイヤーの実力レベル（標準偏差）を選択するUIを提供します。
 * プリセットボタン（初心者、中級者、上級者、エキスパート）とスライダーで選択できます。
 */

import { useGameStore } from '../../stores/gameStore';

/**
 * 難易度プリセットの定義
 */
export const DIFFICULTY_PRESETS = [
  { label: '初心者', stdDevMM: 50 },
  { label: '中級者', stdDevMM: 30 },
  { label: '上級者', stdDevMM: 15 },
  { label: 'エキスパート', stdDevMM: 8 },
] as const;

/**
 * スライダーの範囲定義
 */
export const SLIDER_MIN = 5;
export const SLIDER_MAX = 100;
export const SLIDER_STEP = 1;

/**
 * 難易度選択UIコンポーネント
 */
export function DifficultySelector(): JSX.Element {
  const stdDevMM = useGameStore((state) => state.config.stdDevMM);
  const setStdDev = useGameStore((state) => state.setStdDev);

  const handlePresetClick = (presetStdDev: number) => {
    setStdDev(presetStdDev);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setStdDev(value);
  };

  return (
    <div className="difficulty-selector">
      <h2 className="difficulty-selector__title">難易度を選択</h2>

      <div className="difficulty-selector__presets">
        {DIFFICULTY_PRESETS.map((preset) => {
          const isActive = stdDevMM === preset.stdDevMM;

          return (
            <button
              key={preset.label}
              className={`difficulty-preset-button ${isActive ? 'difficulty-preset-button--active' : ''}`}
              onClick={() => handlePresetClick(preset.stdDevMM)}
              type="button"
              aria-pressed={isActive}
              title={`${preset.label}（${preset.stdDevMM}mm）を選択`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="difficulty-selector__slider">
        <input
          type="range"
          className="difficulty-slider"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={stdDevMM}
          onChange={handleSliderChange}
          aria-label="標準偏差スライダー"
        />
      </div>

      <div className="difficulty-selector__display">{stdDevMM}mm</div>
    </div>
  );
}
