/**
 * SettingsPanel のStorybookストーリー
 * ウィザード形式の設定パネル（4ステップ）
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';

// ウィザードナビゲーション機能付きラッパー
function SettingsPanelWithControls() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <SettingsPanel />
    </div>
  );
}

// インタラクティブなデモ用ラッパー（Controlledモードを使用）
function SettingsPanelInteractive({ initialStep }: { initialStep: number }) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(initialStep as 1 | 2 | 3 | 4);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Controlledモードで制御 */}
      <SettingsPanel currentStep={currentStep} onStepChange={setCurrentStep} />

      {/* デバッグ情報 */}
      <div
        style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}
      >
        <h3 style={{ marginTop: 0 }}>デバッグ情報</h3>
        <p>
          <strong>現在のステップ:</strong> {currentStep} / 4
        </p>
        <p>
          <strong>進捗:</strong> {(currentStep / 4) * 100}%
        </p>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
          ※ このストーリーはControlledモードで動作しており、外部から状態を制御しています。
        </p>
      </div>
    </div>
  );
}

const meta: Meta<typeof SettingsPanel> = {
  title: 'Components/Settings/SettingsPanel',
  component: SettingsPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'ウィザード形式の設定パネルコンポーネント。4つのステップで練習設定を行います。',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsPanel>;

/**
 * デフォルト状態（ステップ1から開始）
 */
export const Default: Story = {
  render: () => <SettingsPanelWithControls />,
  parameters: {
    docs: {
      description: {
        story: 'デフォルトの状態。ステップ1（プリセット選択）から開始します。',
      },
    },
  },
};

/**
 * ステップ1: プリセット選択
 */
export const Step1_PresetSelection: Story = {
  render: () => <SettingsPanelInteractive initialStep={1} />,
  parameters: {
    docs: {
      description: {
        story: 'ステップ1: プリセット選択画面。練習モードのプリセットを選択します。進捗バーは25%。',
      },
    },
  },
};

/**
 * ステップ2: 難易度選択
 */
export const Step2_DifficultySelection: Story = {
  render: () => <SettingsPanelInteractive initialStep={2} />,
  parameters: {
    docs: {
      description: {
        story:
          'ステップ2: 難易度選択画面。プレイヤーの実力（標準偏差）を選択します。進捗バーは50%。「戻る」ボタンが表示されます。',
      },
    },
  },
};

/**
 * ステップ3: セッション設定
 */
export const Step3_SessionConfiguration: Story = {
  render: () => <SettingsPanelInteractive initialStep={3} />,
  parameters: {
    docs: {
      description: {
        story:
          'ステップ3: セッション設定画面。練習セッションのモード（問題数/時間制限）を選択します。進捗バーは75%。',
      },
    },
  },
};

/**
 * ステップ4: 確認画面
 */
export const Step4_Confirmation: Story = {
  render: () => <SettingsPanelInteractive initialStep={4} />,
  parameters: {
    docs: {
      description: {
        story:
          'ステップ4: 確認画面。設定内容を確認して練習を開始します。進捗バーは100%。「次へ」ボタンが「練習を開始」ボタンに変わります。',
      },
    },
  },
};

/**
 * インタラクティブデモ
 */
export const Interactive: Story = {
  render: () => <SettingsPanelInteractive initialStep={1} />,
  parameters: {
    docs: {
      description: {
        story:
          'インタラクティブなデモ。ボタンをクリックしてステップを前後に移動できます。デバッグ情報も表示されます。',
      },
    },
  },
};

/**
 * 全ステップのプレビュー
 */
export const AllSteps: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '40px', padding: '20px' }}>
      <div>
        <h3 style={{ marginBottom: '20px' }}>ステップ 1/4: プリセット選択</h3>
        <SettingsPanelInteractive initialStep={1} />
      </div>
      <div>
        <h3 style={{ marginBottom: '20px' }}>ステップ 2/4: 難易度選択</h3>
        <SettingsPanelInteractive initialStep={2} />
      </div>
      <div>
        <h3 style={{ marginBottom: '20px' }}>ステップ 3/4: セッション設定</h3>
        <SettingsPanelInteractive initialStep={3} />
      </div>
      <div>
        <h3 style={{ marginBottom: '20px' }}>ステップ 4/4: 確認画面</h3>
        <SettingsPanelInteractive initialStep={4} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '全4ステップを一覧表示。各ステップの見た目と進捗状態を確認できます。',
      },
    },
  },
};
