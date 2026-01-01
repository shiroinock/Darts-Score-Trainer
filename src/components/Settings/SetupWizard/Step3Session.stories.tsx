import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../../stores/gameStore';
import type { SessionConfig } from '../../../types';
import { Step3Session } from './Step3Session';

const withMockStore =
  (sessionConfig: SessionConfig = { mode: 'questions', questionCount: 10 }) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        useGameStore.setState({ sessionConfig });

        return () => {
          useGameStore.setState({
            sessionConfig: { mode: 'questions', questionCount: 10 },
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
  decorators: [withMockStore({ mode: 'questions', questionCount: 10 })],
};

/**
 * 問題数モード - 10問
 */
export const Count10Questions: Story = {
  decorators: [withMockStore({ mode: 'questions', questionCount: 10 })],
};

/**
 * 問題数モード - 20問
 */
export const Count20Questions: Story = {
  decorators: [withMockStore({ mode: 'questions', questionCount: 20 })],
};

/**
 * 問題数モード - 50問
 */
export const Count50Questions: Story = {
  decorators: [withMockStore({ mode: 'questions', questionCount: 50 })],
};

/**
 * 時間制限モード - 3分
 */
export const Timer3Minutes: Story = {
  decorators: [withMockStore({ mode: 'time', timeLimit: 3 })],
};

/**
 * 時間制限モード - 5分
 */
export const Timer5Minutes: Story = {
  decorators: [withMockStore({ mode: 'time', timeLimit: 5 })],
};

/**
 * 時間制限モード - 10分
 */
export const Timer10Minutes: Story = {
  decorators: [withMockStore({ mode: 'time', timeLimit: 10 })],
};
