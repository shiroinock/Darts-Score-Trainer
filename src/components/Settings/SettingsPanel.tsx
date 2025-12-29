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
import './SettingsPanel.css';
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
 * 設定パネルのProps
 */
interface SettingsPanelProps {
  /** 現在のステップ（Controlledモード用） */
  currentStep?: WizardStep;
  /** ステップ変更時のコールバック（Controlledモード用） */
  onStepChange?: (step: WizardStep) => void;
}

/**
 * 設定パネルコンポーネント
 *
 * Uncontrolledモード（デフォルト）:
 * - propsを渡さない場合、内部で状態管理
 *
 * Controlledモード:
 * - currentStepとonStepChangeを渡すことで、外部から制御可能
 */
export function SettingsPanel({
  currentStep: controlledStep,
  onStepChange,
}: SettingsPanelProps = {}): JSX.Element {
  const [internalStep, setInternalStep] = useState<WizardStep>(1);
  const startPractice = useGameStore((state) => state.startPractice);

  // Controlled/Uncontrolledモードの判定
  const isControlled = controlledStep !== undefined;
  const currentStep = isControlled ? controlledStep : internalStep;

  /**
   * ステップを変更する（Controlled/Uncontrolled両対応）
   */
  const changeStep = (newStep: WizardStep): void => {
    if (!isControlled) {
      setInternalStep(newStep);
    }
    onStepChange?.(newStep);
  };

  /**
   * 次のステップへ進む
   */
  const handleNext = (): void => {
    const nextStep = Math.min(currentStep + 1, 4) as WizardStep;
    changeStep(nextStep);
  };

  /**
   * 前のステップに戻る
   */
  const handleBack = (): void => {
    const prevStep = Math.max(currentStep - 1, 1) as WizardStep;
    changeStep(prevStep);
  };

  /**
   * 練習開始
   */
  const handleStart = (): void => {
    startPractice();
  };

  /**
   * ステップの状態を判定してCSSクラスを返す
   */
  const getStepClassName = (step: number): string => {
    const baseClass = 'setup-wizard__progress-step';
    if (step === currentStep) {
      return `${baseClass} setup-wizard__progress-step--active`;
    } else if (step < currentStep) {
      return `${baseClass} setup-wizard__progress-step--completed`;
    } else {
      return `${baseClass} setup-wizard__progress-step--pending`;
    }
  };

  return (
    <div className="settings-panel">
      {/* 進捗インジケーター */}
      <div className="setup-wizard__progress">
        <div className="setup-wizard__progress-bar">
          <div className="setup-wizard__progress-fill" data-step={currentStep} />
        </div>
        <div className="setup-wizard__progress-steps">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={`step-${step}`}
              data-testid={`progress-step-${step}`}
              className={getStepClassName(step)}
            >
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
