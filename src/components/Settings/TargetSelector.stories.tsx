import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { Target } from '../../types';
import { TargetSelector } from './TargetSelector';

const withMockStore = (target: Target | null) => (Story: React.ComponentType) => {
  // 状態設定とクリーンアップを行うラッパーコンポーネント
  function StoryWrapper() {
    useEffect(() => {
      // マウント時に特定のターゲットを設定
      useGameStore.setState((state) => ({
        config: { ...state.config, target },
      }));

      // アンマウント時にデフォルト設定に戻す
      return () => {
        useGameStore.setState((state) => ({
          config: { ...state.config, target: null },
        }));
      };
    }, [target]);

    return <Story />;
  }

  return <StoryWrapper />;
};

const meta = {
  title: 'Settings/TargetSelector',
  component: TargetSelector,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TargetSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSelection: Story = {
  decorators: [withMockStore(null)],
};

export const BullSelected: Story = {
  decorators: [
    withMockStore({
      type: 'BULL',
      number: null,
      label: 'BULL',
    }),
  ],
};

export const Single20Selected: Story = {
  decorators: [
    withMockStore({
      type: 'SINGLE',
      number: 20,
      label: 'S20',
    }),
  ],
};

export const Double19Selected: Story = {
  decorators: [
    withMockStore({
      type: 'DOUBLE',
      number: 19,
      label: 'D19',
    }),
  ],
};

export const Triple20Selected: Story = {
  decorators: [
    withMockStore({
      type: 'TRIPLE',
      number: 20,
      label: 'T20',
    }),
  ],
};

export const Triple1Selected: Story = {
  decorators: [
    withMockStore({
      type: 'TRIPLE',
      number: 1,
      label: 'T1',
    }),
  ],
};

export const Single5Selected: Story = {
  decorators: [
    withMockStore({
      type: 'SINGLE',
      number: 5,
      label: 'S5',
    }),
  ],
};
