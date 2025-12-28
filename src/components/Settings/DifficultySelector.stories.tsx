import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { DifficultySelector } from './DifficultySelector';

/**
 * 特定の標準偏差でDifficultySelectorをレンダリングするデコレーター
 */
const withStdDev = (stdDevMM: number) => (Story: React.ComponentType) => {
  function StoryWrapper() {
    useEffect(() => {
      // マウント時に標準偏差を設定
      useGameStore.setState((state) => ({
        config: { ...state.config, stdDevMM },
      }));

      // アンマウント時にデフォルト値（30mm）に戻す
      return () => {
        useGameStore.setState((state) => ({
          config: { ...state.config, stdDevMM: 30 },
        }));
      };
    }, [stdDevMM]);

    return <Story />;
  }

  return <StoryWrapper />;
};

const meta = {
  title: 'Settings/DifficultySelector',
  component: DifficultySelector,
  parameters: {
    layout: 'centered',
    docs: {
      story: {
        height: '500px',
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
} satisfies Meta<typeof DifficultySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BeginnerSelected: Story = {
  decorators: [withStdDev(50)],
};

export const IntermediateSelected: Story = {
  decorators: [withStdDev(30)],
};

export const AdvancedSelected: Story = {
  decorators: [withStdDev(15)],
};

export const ExpertSelected: Story = {
  decorators: [withStdDev(8)],
};

export const CustomValue: Story = {
  decorators: [withStdDev(25)],
};

export const MinimumValue: Story = {
  decorators: [withStdDev(5)],
};

export const MaximumValue: Story = {
  decorators: [withStdDev(100)],
};
