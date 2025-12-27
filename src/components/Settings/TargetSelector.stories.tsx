import type { Meta, StoryObj } from '@storybook/react-vite';
import { useGameStore } from '../../stores/gameStore';
import type { Target } from '../../types';
import { TargetSelector } from './TargetSelector';

const meta = {
  title: 'Settings/TargetSelector',
  component: TargetSelector,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TargetSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSelection: Story = {
  play: async () => {
    useGameStore.setState((state) => ({
      config: { ...state.config, target: null },
    }));
  },
};

export const BullSelected: Story = {
  play: async () => {
    useGameStore.setState((state) => ({
      config: {
        ...state.config,
        target: {
          type: 'BULL',
          number: null,
          label: 'BULL',
        },
      },
    }));
  },
};

export const Single20Selected: Story = {
  play: async () => {
    useGameStore.setState((state) => ({
      config: {
        ...state.config,
        target: {
          type: 'SINGLE',
          number: 20,
          label: 'S20',
        },
      },
    }));
  },
};

export const Double19Selected: Story = {
  play: async () => {
    useGameStore.setState((state) => ({
      config: {
        ...state.config,
        target: {
          type: 'DOUBLE',
          number: 19,
          label: 'D19',
        },
      },
    }));
  },
};

export const Triple20Selected: Story = {
  play: async () => {
    useGameStore.setState((state) => ({
      config: {
        ...state.config,
        target: {
          type: 'TRIPLE',
          number: 20,
          label: 'T20',
        },
      },
    }));
  },
};

export const Triple1Selected: Story = {
  play: async () => {
    useGameStore.setState((state) => ({
      config: {
        ...state.config,
        target: {
          type: 'TRIPLE',
          number: 1,
          label: 'T1',
        },
      },
    }));
  },
};

export const Single5Selected: Story = {
  play: async () => {
    useGameStore.setState((state) => ({
      config: {
        ...state.config,
        target: {
          type: 'SINGLE',
          number: 5,
          label: 'S5',
        },
      },
    }));
  },
};
