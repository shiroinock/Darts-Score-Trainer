/**
 * TargetSelector - ターゲット選択UIコンポーネント
 *
 * プレイヤーが狙う位置（ターゲット）を選択するUIを提供します。
 * タイプ（Single, Double, Triple, Bull）とセグメント番号（1-20）を選択できます。
 */

import { useGameStore } from '../../stores/gameStore';
import type { Target, TargetType } from '../../types';

/**
 * ターゲットタイプの選択肢
 */
const TARGET_TYPES: { value: TargetType; label: string }[] = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'DOUBLE', label: 'Double' },
  { value: 'TRIPLE', label: 'Triple' },
  { value: 'BULL', label: 'Bull' },
];

/**
 * セグメント番号（20から1まで降順）
 */
const NUMBERS = Array.from({ length: 20 }, (_, i) => 20 - i);

/**
 * ターゲットタイプの接頭辞
 */
const TARGET_TYPE_PREFIX: Record<TargetType, string> = {
  SINGLE: 'S',
  DOUBLE: 'D',
  TRIPLE: 'T',
  BULL: '',
};

/**
 * ターゲット選択UIコンポーネント
 */
export function TargetSelector(): JSX.Element {
  const config = useGameStore((state) => state.config);
  const setTarget = useGameStore((state) => state.setTarget);

  const handleTypeChange = (type: TargetType) => {
    if (type === 'BULL') {
      // Bullの場合はnumberをnullに設定
      const newTarget: Target = {
        type: 'BULL',
        number: null,
        label: 'BULL',
      };
      setTarget(newTarget);
    } else {
      // 他のタイプの場合、現在のnumberを維持（nullの場合は20を設定）
      const number = config.target?.number ?? 20;
      const prefix = TARGET_TYPE_PREFIX[type];
      const newTarget: Target = {
        type,
        number,
        label: `${prefix}${number}`,
      };
      setTarget(newTarget);
    }
  };

  const handleNumberChange = (number: number) => {
    if (!config.target) {
      return;
    }

    const { type } = config.target;
    // Bullの場合は数字選択を無視
    if (type === 'BULL') {
      return;
    }

    const prefix = TARGET_TYPE_PREFIX[type];
    const newTarget: Target = {
      type,
      number,
      label: `${prefix}${number}`,
    };
    setTarget(newTarget);
  };

  return (
    <div className="target-selector">
      <h2 className="target-selector__title">ターゲットを選択</h2>

      {/* タイプ選択 */}
      <div className="target-selector__section">
        <h3 className="target-selector__subtitle">タイプ</h3>
        <div className="target-selector__type-buttons">
          {TARGET_TYPES.map((targetType) => {
            const isActive = config.target?.type === targetType.value;

            return (
              <button
                key={targetType.value}
                className={`target-type-button ${isActive ? 'target-type-button--active' : ''}`}
                onClick={() => handleTypeChange(targetType.value)}
                type="button"
                aria-pressed={isActive}
                title={`${targetType.label}を選択`}
              >
                {targetType.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 数字選択（Bullの場合は非表示） */}
      {config.target?.type !== 'BULL' && (
        <div className="target-selector__section">
          <h3 className="target-selector__subtitle">数字</h3>
          <div className="target-selector__number-grid">
            {NUMBERS.map((number) => {
              const isActive = config.target?.number === number;

              return (
                <button
                  key={number}
                  className={`target-number-button ${isActive ? 'target-number-button--active' : ''}`}
                  onClick={() => handleNumberChange(number)}
                  type="button"
                  aria-pressed={isActive}
                  title={`${number}を選択`}
                >
                  {number}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
