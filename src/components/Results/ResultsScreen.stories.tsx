import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { SessionConfig, Stats } from '../../types';
import { ResultsScreen } from './ResultsScreen';

interface MockOptions {
  stats: Stats;
  sessionConfig: SessionConfig;
  elapsedTime: number;
  stdDevMM?: number;
  startingScore?: number;
}

const withMockStore = (options: MockOptions) => (Story: React.ComponentType) => {
  function StoryWrapper() {
    useEffect(() => {
      const { stats, sessionConfig, elapsedTime, stdDevMM = 30, startingScore = 0 } = options;

      useGameStore.setState({
        gameState: 'results',
        stats,
        sessionConfig,
        elapsedTime,
        config: {
          configId: 'basic-practice',
          configName: '基礎練習',
          isPreset: true,
          icon: '📚',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          stdDevMM,
          startingScore,
        },
      });

      return () => {
        useGameStore.setState({
          gameState: 'setup',
        });
      };
    }, []);

    return <Story />;
  }

  return <StoryWrapper />;
};

const meta = {
  title: 'Results/ResultsScreen',
  component: ResultsScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '練習セッション終了後の結果画面。SessionSummaryと再挑戦/設定変更ボタンを表示します。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResultsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 良好な成績（80%正答率）
 */
export const GoodPerformance: Story = {
  decorators: [
    withMockStore({
      stats: {
        correct: 16,
        total: 20,
        currentStreak: 5,
        bestStreak: 8,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 20,
      },
      elapsedTime: 180,
    }),
  ],
};

/**
 * 完璧な成績（100%正答率）
 */
export const PerfectScore: Story = {
  decorators: [
    withMockStore({
      stats: {
        correct: 15,
        total: 15,
        currentStreak: 15,
        bestStreak: 15,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 20,
      },
      elapsedTime: 120,
      stdDevMM: 15,
    }),
  ],
};

/**
 * 低正答率（40%）
 */
export const LowAccuracy: Story = {
  decorators: [
    withMockStore({
      stats: {
        correct: 4,
        total: 10,
        currentStreak: 0,
        bestStreak: 2,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 10,
      },
      elapsedTime: 240,
      stdDevMM: 50,
    }),
  ],
};

/**
 * 時間制限モード
 */
export const TimerMode: Story = {
  decorators: [
    withMockStore({
      stats: {
        correct: 10,
        total: 15,
        currentStreak: 2,
        bestStreak: 6,
      },
      sessionConfig: {
        mode: 'time',
        timeLimit: 5,
      },
      elapsedTime: 300,
    }),
  ],
};

/**
 * 501ゲーム
 */
export const Game501: Story = {
  decorators: [
    withMockStore({
      stats: {
        correct: 25,
        total: 28,
        currentStreak: 10,
        bestStreak: 12,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 50,
      },
      elapsedTime: 420,
      startingScore: 501,
    }),
  ],
};

/**
 * 短時間セッション（1分）
 */
export const ShortSession: Story = {
  decorators: [
    withMockStore({
      stats: {
        correct: 3,
        total: 5,
        currentStreak: 2,
        bestStreak: 2,
      },
      sessionConfig: {
        mode: 'time',
        timeLimit: 3,
      },
      elapsedTime: 60,
    }),
  ],
};

/**
 * 長時間セッション（15分）
 */
export const LongSession: Story = {
  decorators: [
    withMockStore({
      stats: {
        correct: 40,
        total: 50,
        currentStreak: 8,
        bestStreak: 15,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 50,
      },
      elapsedTime: 900,
      startingScore: 701,
    }),
  ],
};
