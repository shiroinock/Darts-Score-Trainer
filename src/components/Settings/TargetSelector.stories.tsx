import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { Target } from '../../types';
import { TargetSelector } from './TargetSelector';

/**
 * 特定のターゲット状態でTargetSelectorをレンダリングするラッパー
 */
function TargetSelectorWithState({ target }: { target: Target | null }) {
  useEffect(() => {
    useGameStore.setState((state) => ({
      config: { ...state.config, target },
    }));
  }, [target]);

  return <TargetSelector />;
}

const meta = {
  title: 'Settings/TargetSelector',
  component: TargetSelector,
  parameters: {
    layout: 'centered',
    docs: {
      story: {
        height: '600px',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TargetSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSelection: Story = {
  render: () => <TargetSelectorWithState key="no-selection" target={null} />,
};

export const BullSelected: Story = {
  render: () => (
    <TargetSelectorWithState
      key="bull-selected"
      target={{
        type: 'BULL',
        number: null,
        label: 'BULL',
      }}
    />
  ),
};

export const Single20Selected: Story = {
  render: () => (
    <TargetSelectorWithState
      key="single-20-selected"
      target={{
        type: 'SINGLE',
        number: 20,
        label: 'S20',
      }}
    />
  ),
};

export const Double19Selected: Story = {
  render: () => (
    <TargetSelectorWithState
      key="double-19-selected"
      target={{
        type: 'DOUBLE',
        number: 19,
        label: 'D19',
      }}
    />
  ),
};

export const Triple20Selected: Story = {
  render: () => (
    <TargetSelectorWithState
      key="triple-20-selected"
      target={{
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      }}
    />
  ),
};

export const Triple1Selected: Story = {
  render: () => (
    <TargetSelectorWithState
      key="triple-1-selected"
      target={{
        type: 'TRIPLE',
        number: 1,
        label: 'T1',
      }}
    />
  ),
};

export const Single5Selected: Story = {
  render: () => (
    <TargetSelectorWithState
      key="single-5-selected"
      target={{
        type: 'SINGLE',
        number: 5,
        label: 'S5',
      }}
    />
  ),
};
