import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { SessionConfig, Stats } from '../../types';
import { StatsBar } from './StatsBar';

interface MockOptions {
  stats?: Stats;
  sessionConfig?: SessionConfig;
  elapsedTime?: number;
  remainingScore?: number;
  startingScore?: number;
}

const withMockStore =
  (options: MockOptions = {}) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        const {
          stats = { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
          sessionConfig = { mode: 'questions', questionCount: 10 },
          elapsedTime = 0,
          remainingScore = 501,
          startingScore = 0,
        } = options;

        useGameStore.setState({
          stats,
          sessionConfig,
          elapsedTime,
          remainingScore,
          config: {
            configId: 'basic-practice',
            configName: '基礎練習',
            isPreset: true,
            throwUnit: 1,
            questionType: 'score',
            judgmentTiming: 'independent',
            stdDevMM: 30,
            startingScore,
          },
        });

        return () => {
          useGameStore.setState({
            stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
          });
        };
      }, [options]);

      return <Story />;
    }

    return <StoryWrapper />;
  };

const meta = {
  title: 'Practice/StatsBar',
  component: StatsBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '統計情報バーコンポーネント。正解数/総問題数、正答率、連続正解数、残り問題数/残り時間、残り点数（01モード時）を表示します。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '800px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 初期状態（問題数モード）
 * 0問回答、10問中
 */
export const Initial: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
      sessionConfig: { mode: 'questions', questionCount: 10 },
    }),
  ],
};

/**
 * 進行中（問題数モード）
 * 7/10問正解、70%正答率、3連続正解
 */
export const InProgress: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 7, total: 10, currentStreak: 3, bestStreak: 5 },
      sessionConfig: { mode: 'questions', questionCount: 20 },
    }),
  ],
};

/**
 * 高正答率
 * 18/20問正解、90%正答率、10連続正解
 */
export const HighAccuracy: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 18, total: 20, currentStreak: 10, bestStreak: 10 },
      sessionConfig: { mode: 'questions', questionCount: 50 },
    }),
  ],
};

/**
 * 完璧な成績
 * 10/10問正解、100%正答率、10連続正解
 */
export const PerfectScore: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 10, total: 10, currentStreak: 10, bestStreak: 10 },
      sessionConfig: { mode: 'questions', questionCount: 10 },
    }),
  ],
};

/**
 * 時間制限モード（3分）
 * 1分30秒経過、残り1分30秒
 */
export const TimerMode3Minutes: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 5, total: 7, currentStreak: 2, bestStreak: 3 },
      sessionConfig: { mode: 'time', timeLimit: 3 },
      elapsedTime: 90,
    }),
  ],
};

/**
 * 時間制限モード（残り少ない）
 * 4分50秒経過、残り10秒
 */
export const TimerModeAlmostOver: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 12, total: 15, currentStreak: 5, bestStreak: 7 },
      sessionConfig: { mode: 'time', timeLimit: 5 },
      elapsedTime: 290,
    }),
  ],
};

/**
 * 01モード（501ゲーム）
 * 残り点数301
 */
export const ZeroOneMode501: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 8, total: 10, currentStreak: 4, bestStreak: 6 },
      sessionConfig: { mode: 'questions', questionCount: 20 },
      remainingScore: 301,
      startingScore: 501,
    }),
  ],
};

/**
 * 01モード（701ゲーム、接戦）
 * 残り点数40
 */
export const ZeroOneMode701CloseGame: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 15, total: 20, currentStreak: 3, bestStreak: 8 },
      sessionConfig: { mode: 'questions', questionCount: 50 },
      remainingScore: 40,
      startingScore: 701,
    }),
  ],
};

/**
 * 01モード（ゲームクリア直前）
 * 残り点数2
 */
export const ZeroOneModeAboutToFinish: Story = {
  decorators: [
    withMockStore({
      stats: { correct: 20, total: 23, currentStreak: 8, bestStreak: 10 },
      sessionConfig: { mode: 'questions', questionCount: 50 },
      remainingScore: 2,
      startingScore: 501,
    }),
  ],
};
