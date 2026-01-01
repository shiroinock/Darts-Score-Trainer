import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../../stores/gameStore';
import type { SessionConfig } from '../../../types';
import { Step3Session } from './Step3Session';

const withMockStore =
  (sessionConfig: SessionConfig = { mode: 'count', count: 10 }) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        useGameStore.setState({ sessionConfig });

        return () => {
          useGameStore.setState({
            sessionConfig: { mode: 'count', count: 10 },
          });
        };
      }, [sessionConfig]);

      return <Story />;
    }

    return <StoryWrapper />;
  };

const meta = {
  title: 'Settings/SetupWizard/Step3Session',
  component: Step3Session,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ウィザードステップ3: セッション設定。練習セッションのモード（問題数/時間制限）を選択します。',
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
} satisfies Meta<typeof Step3Session>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態（問題数モード、10問）
 */
export const Default: Story = {
  decorators: [withMockStore({ mode: 'count', count: 10 })],
};

/**
 * 問題数モード - 5問
 */
export const Count5Questions: Story = {
  decorators: [withMockStore({ mode: 'count', count: 5 })],
};

/**
 * 問題数モード - 10問
 */
export const Count10Questions: Story = {
  decorators: [withMockStore({ mode: 'count', count: 10 })],
};

/**
 * 問題数モード - 20問
 */
export const Count20Questions: Story = {
  decorators: [withMockStore({ mode: 'count', count: 20 })],
};

/**
 * 時間制限モード - 1分
 */
export const Timer1Minute: Story = {
  decorators: [withMockStore({ mode: 'timer', seconds: 60 })],
};

/**
 * 時間制限モード - 3分
 */
export const Timer3Minutes: Story = {
  decorators: [withMockStore({ mode: 'timer', seconds: 180 })],
};

/**
 * 時間制限モード - 5分
 */
export const Timer5Minutes: Story = {
  decorators: [withMockStore({ mode: 'timer', seconds: 300 })],
};

/**
 * エンドレスモード
 */
export const EndlessMode: Story = {
  decorators: [withMockStore({ mode: 'endless' })],
};
