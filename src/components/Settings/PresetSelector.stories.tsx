import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { getDefaultConfig, PRESETS } from '../../stores/config/presets';
import { useGameStore } from '../../stores/gameStore';
import { PresetSelector } from './PresetSelector';

const withMockStore =
  (configId = 'preset-basic') =>
  (Story: React.ComponentType) => {
    // 状態設定とクリーンアップを行うラッパーコンポーネント
    function StoryWrapper() {
      useEffect(() => {
        // マウント時に特定のプリセットを設定
        const config = PRESETS[configId];
        useGameStore.setState({ config });

        // アンマウント時にデフォルト設定に戻す
        return () => {
          useGameStore.setState({ config: getDefaultConfig() });
        };
      }, [configId]);

      return <Story />;
    }

    return <StoryWrapper />;
  };

const meta = {
  title: 'Settings/PresetSelector',
  component: PresetSelector,
  parameters: {
    layout: 'centered',
    docs: {
      story: {
        height: '300px',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PresetSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicPresetActive: Story = {
  decorators: [withMockStore('preset-basic')],
};

export const PlayerPresetActive: Story = {
  decorators: [withMockStore('preset-player')],
};

export const CallerBasicActive: Story = {
  decorators: [withMockStore('preset-caller-basic')],
};

export const CallerCumulativeActive: Story = {
  decorators: [withMockStore('preset-caller-cumulative')],
};

export const ComprehensiveActive: Story = {
  decorators: [withMockStore('preset-comprehensive')],
};
