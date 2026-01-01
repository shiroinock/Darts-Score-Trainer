import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { getDefaultConfig, PRESETS } from '../../../stores/config/presets';
import { useGameStore } from '../../../stores/gameStore';
import { Step1Preset } from './Step1Preset';

const withMockStore =
  (configId = 'preset-basic') =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        const config = PRESETS[configId];
        useGameStore.setState({ config });

        return () => {
          useGameStore.setState({ config: getDefaultConfig() });
        };
      }, [configId]);

      return <Story />;
    }

    return <StoryWrapper />;
  };

const meta = {
  title: 'Settings/SetupWizard/Step1Preset',
  component: Step1Preset,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ウィザードステップ1: プリセット選択。練習モードのプリセットを選択します。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '600px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Step1Preset>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態（基礎練習が選択）
 */
export const Default: Story = {
  decorators: [withMockStore('preset-basic')],
};

/**
 * プレイヤー練習が選択されている状態
 */
export const PlayerPresetSelected: Story = {
  decorators: [withMockStore('preset-player')],
};

/**
 * コーラー基礎が選択されている状態
 */
export const CallerBasicSelected: Story = {
  decorators: [withMockStore('preset-caller-basic')],
};

/**
 * コーラー累積が選択されている状態
 */
export const CallerCumulativeSelected: Story = {
  decorators: [withMockStore('preset-caller-cumulative')],
};

/**
 * 総合練習が選択されている状態
 */
export const ComprehensiveSelected: Story = {
  decorators: [withMockStore('preset-comprehensive')],
};
