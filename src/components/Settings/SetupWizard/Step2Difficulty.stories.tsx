import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../../stores/gameStore';
import { Step2Difficulty } from './Step2Difficulty';

const withMockStore =
  (stdDevMM: number = 30) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        const currentConfig = useGameStore.getState().config;
        useGameStore.setState({
          config: {
            ...currentConfig,
            stdDevMM,
          },
        });

        return () => {
          useGameStore.setState({
            config: {
              ...useGameStore.getState().config,
              stdDevMM: 30,
            },
          });
        };
      }, [stdDevMM]);

      return <Story />;
    }

    return <StoryWrapper />;
  };

const meta = {
  title: 'Settings/SetupWizard/Step2Difficulty',
  component: Step2Difficulty,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ウィザードステップ2: 難易度選択。プレイヤーの実力（標準偏差）を選択します。',
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
} satisfies Meta<typeof Step2Difficulty>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態（中級者が選択）
 */
export const Default: Story = {
  decorators: [withMockStore(30)],
};

/**
 * 初心者が選択されている状態
 */
export const BeginnerSelected: Story = {
  decorators: [withMockStore(50)],
};

/**
 * 中級者が選択されている状態
 */
export const IntermediateSelected: Story = {
  decorators: [withMockStore(30)],
};

/**
 * 上級者が選択されている状態
 */
export const AdvancedSelected: Story = {
  decorators: [withMockStore(15)],
};

/**
 * エキスパートが選択されている状態
 */
export const ExpertSelected: Story = {
  decorators: [withMockStore(8)],
};
