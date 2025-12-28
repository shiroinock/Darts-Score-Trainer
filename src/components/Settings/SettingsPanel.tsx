/**
 * SettingsPanel - 設定パネルコンポーネント（ウィザード形式）
 *
 * 4ステップのウィザード形式で設定を行います：
 * - Step 1: プリセット選択
 * - Step 2: 難易度選択
 * - Step 3: セッション設定
 * - Step 4: 確認画面
 */

import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Step1Preset } from './SetupWizard/Step1Preset';
import { Step2Difficulty } from './SetupWizard/Step2Difficulty';
import { Step3Session } from './SetupWizard/Step3Session';
import { Step4Confirm } from './SetupWizard/Step4Confirm';

/**
 * ウィザードのステップ定義
 */
type WizardStep = 1 | 2 | 3 | 4;

/**
 * 設定パネルコンポーネント
 */
export function SettingsPanel(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const startPractice = useGameStore((state) => state.startPractice);

  /**
   * 次のステップへ進む
   */
  const handleNext = (): void => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  /**
   * 前のステップに戻る
   */
  const handleBack = (): void => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  /**
   * 練習開始
   */
  const handleStart = (): void => {
    startPractice();
  };

  const progressContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto 1rem',
    padding: '0.5rem 1rem',
    flexShrink: 0,
    boxSizing: 'border-box',
  };

  const progressBarStyle: React.CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '1rem',
  };

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    background: 'linear-gradient(90deg, #4a90e2 0%, #357ab8 100%)',
    transition: 'width 0.3s ease',
    borderRadius: '4px',
    width: `${(currentStep / 4) * 100}%`,
  };

  const progressStepsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const getStepStyle = (step: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: '1.125rem',
      transition: 'all 0.3s ease',
    };

    if (step === currentStep) {
      return {
        ...baseStyle,
        backgroundColor: '#4a90e2',
        color: 'white',
        boxShadow: '0 4px 8px rgba(74, 144, 226, 0.3)',
        transform: 'scale(1.1)',
      };
    } else if (step < currentStep) {
      return {
        ...baseStyle,
        backgroundColor: '#4caf50',
        color: 'white',
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: '#e0e0e0',
        color: '#999',
      };
    }
  };

  return (
    <div className="settings-panel">
      {/* 進捗インジケーター */}
      <div style={progressContainerStyle}>
        <div style={progressBarStyle}>
          <div style={progressFillStyle} />
        </div>
        <div style={progressStepsStyle}>
          {[1, 2, 3, 4].map((step) => (
            <div key={step} style={getStepStyle(step)}>
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* ステップコンテンツ */}
      <div className="setup-wizard__content">
        {currentStep === 1 && <Step1Preset />}
        {currentStep === 2 && <Step2Difficulty />}
        {currentStep === 3 && <Step3Session />}
        {currentStep === 4 && <Step4Confirm />}
      </div>

      {/* ナビゲーションボタン */}
      <div className="setup-wizard__navigation">
        {/* 戻るボタン（ステップ1では非表示） */}
        {currentStep > 1 && (
          <button
            type="button"
            className="setup-wizard__button setup-wizard__button--back"
            onClick={handleBack}
            aria-label="前のステップに戻る"
          >
            ← 戻る
          </button>
        )}

        {/* 次へ/練習開始ボタン */}
        {currentStep < 4 ? (
          <button
            type="button"
            className="setup-wizard__button setup-wizard__button--next"
            onClick={handleNext}
            aria-label="次のステップへ進む"
          >
            次へ →
          </button>
        ) : (
          <button
            type="button"
            className="setup-wizard__button setup-wizard__button--start"
            onClick={handleStart}
            aria-label="練習を開始"
          >
            練習を開始
          </button>
        )}
      </div>
    </div>
  );
}
