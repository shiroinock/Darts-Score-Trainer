import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { initialSessionConfig } from '../../stores/session/initialState';
import type { SessionConfig } from '../../types';
import { SessionConfigSelector } from './SessionConfigSelector';

const withMockStore = (sessionConfig: SessionConfig) => (Story: React.ComponentType) => {
  // 状態設定とクリーンアップを行うラッパーコンポーネント
  function StoryWrapper() {
    useEffect(() => {
      // マウント時に特定の状態を設定
      useGameStore.setState({ sessionConfig });

      // アンマウント時に初期状態に戻す
      return () => {
        useGameStore.setState({ sessionConfig: initialSessionConfig });
      };
    }, [sessionConfig]);

    return <Story />;
  }

  return <StoryWrapper />;
};

const meta = {
  title: 'Settings/SessionConfigSelector',
  component: SessionConfigSelector,
  parameters: {
    layout: 'centered',
    docs: {
      story: {
        height: '400px',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SessionConfigSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QuestionsMode10: Story = {
  decorators: [
    withMockStore({
      mode: 'questions',
      questionCount: 10,
    }),
  ],
};

export const QuestionsMode50: Story = {
  decorators: [
    withMockStore({
      mode: 'questions',
      questionCount: 50,
    }),
  ],
};

export const TimeMode3Min: Story = {
  decorators: [
    withMockStore({
      mode: 'time',
      timeLimit: 3,
    }),
  ],
};

export const TimeMode10Min: Story = {
  decorators: [
    withMockStore({
      mode: 'time',
      timeLimit: 10,
    }),
  ],
};
