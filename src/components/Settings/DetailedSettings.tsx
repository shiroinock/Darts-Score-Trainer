/**
 * DetailedSettings - 詳細設定UIコンポーネント
 *
 * 折りたたみ可能な詳細設定UIを提供します。
 * 投擲単位、問う内容、判定タイミング、開始点数の選択が可能です。
 */

import { useState } from 'react';
import { DEFAULT_PRESET_ID } from '../../stores/config/presets';
import { useGameStore } from '../../stores/gameStore';
import type { JudgmentTiming, QuestionType } from '../../types';
import './DetailedSettings.css';

/**
 * 投擲単位の選択肢
 */
const THROW_UNITS = [1, 3] as const;

/**
 * 問う内容の選択肢
 */
const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'score', label: '得点' },
  { value: 'remaining', label: '残り点数' },
  { value: 'both', label: '両方' },
];

/**
 * 判定タイミングの選択肢
 */
const JUDGMENT_TIMINGS: { value: JudgmentTiming; label: string }[] = [
  { value: 'independent', label: '独立' },
  { value: 'cumulative', label: '累積' },
];

/**
 * 開始点数の選択肢
 */
const STARTING_SCORES = [501, 701, 301] as const;

/**
 * 詳細設定UIコンポーネント
 */
export function DetailedSettings(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = useGameStore((state) => state.config);
  const setConfig = useGameStore((state) => state.setConfig);

  const handleThrowUnitChange = (throwUnit: 1 | 3) => {
    setConfig({ throwUnit });
  };

  const handleQuestionTypeChange = (questionType: QuestionType) => {
    setConfig({ questionType });
  };

  const handleJudgmentTimingChange = (judgmentTiming: JudgmentTiming) => {
    setConfig({ judgmentTiming });
  };

  const handleStartingScoreChange = (startingScore: number) => {
    setConfig({ startingScore });
  };

  // 基礎練習モード判定
  const isBasicMode = config.configId === DEFAULT_PRESET_ID;

  // 判定タイミングの表示条件: 3投モードの場合のみ表示
  const showJudgmentTiming = config.throwUnit === 3;

  // 開始点数の表示条件: 残り点数モードまたは両方モードの場合のみ表示
  const showStartingScore = config.questionType === 'remaining' || config.questionType === 'both';

  return (
    <div className="detailed-settings">
      <button
        className="detailed-settings__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
        aria-expanded={isExpanded}
      >
        <span className="detailed-settings__header">詳細設定 {isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="detailed-settings__content">
          {isBasicMode ? (
            <div className="detailed-settings__notice">
              基礎練習モードでは設定が固定されています（1投単位、得点のみを問う）
            </div>
          ) : (
            <>
              {/* 投擲単位選択 */}
              <div className="detailed-settings__section">
                <h3 className="detailed-settings__subtitle">投擲単位</h3>
                <div className="detailed-settings__buttons">
                  {THROW_UNITS.map((unit) => (
                    <button
                      key={unit}
                      className={`detailed-setting-button ${
                        config.throwUnit === unit ? 'detailed-setting-button--active' : ''
                      }`}
                      onClick={() => handleThrowUnitChange(unit)}
                      type="button"
                      aria-pressed={config.throwUnit === unit}
                    >
                      {unit}投
                    </button>
                  ))}
                </div>
              </div>

              {/* 問う内容選択 */}
              <div className="detailed-settings__section">
                <h3 className="detailed-settings__subtitle">問う内容</h3>
                <div className="detailed-settings__buttons">
                  {QUESTION_TYPES.map((qt) => (
                    <button
                      key={qt.value}
                      className={`detailed-setting-button ${
                        config.questionType === qt.value ? 'detailed-setting-button--active' : ''
                      }`}
                      onClick={() => handleQuestionTypeChange(qt.value)}
                      type="button"
                      aria-pressed={config.questionType === qt.value}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 判定タイミング選択（3投モード時のみ表示） */}
              {showJudgmentTiming && (
                <div className="detailed-settings__section">
                  <h3 className="detailed-settings__subtitle">判定タイミング</h3>
                  <div className="detailed-settings__buttons">
                    {JUDGMENT_TIMINGS.map((jt) => (
                      <button
                        key={jt.value}
                        className={`detailed-setting-button ${
                          config.judgmentTiming === jt.value
                            ? 'detailed-setting-button--active'
                            : ''
                        }`}
                        onClick={() => handleJudgmentTimingChange(jt.value)}
                        type="button"
                        aria-pressed={config.judgmentTiming === jt.value}
                      >
                        {jt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 開始点数選択（残り点数モードまたは両方モード時のみ表示） */}
              {showStartingScore && (
                <div className="detailed-settings__section">
                  <h3 className="detailed-settings__subtitle">開始点数</h3>
                  <div className="detailed-settings__buttons">
                    {STARTING_SCORES.map((score) => (
                      <button
                        key={score}
                        className={`detailed-setting-button ${
                          config.startingScore === score ? 'detailed-setting-button--active' : ''
                        }`}
                        onClick={() => handleStartingScoreChange(score)}
                        type="button"
                        aria-pressed={config.startingScore === score}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
