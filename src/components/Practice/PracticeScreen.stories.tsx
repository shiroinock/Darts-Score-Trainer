import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { DART_POSITIONS } from '../../stories/fixtures/sampleData';
import type { Question, SessionConfig, Stats, ThrowResult } from '../../types';
import { PracticeScreen } from './PracticeScreen';

interface MockOptions {
  gameState?: 'setup' | 'practicing' | 'results';
  sessionConfig?: SessionConfig;
  elapsedTime?: number;
  currentQuestion?: Question | null;
  stats?: Stats;
  displayedDarts?: ThrowResult[];
  remainingScore?: number;
  startingScore?: number;
}

const withMockStore =
  (options: MockOptions = {}) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        const {
          gameState = 'practicing',
          sessionConfig = { mode: 'questions', questionCount: 10 },
          elapsedTime = 0,
          currentQuestion = {
            mode: 'score',
            throws: [
              {
                target: { type: 'TRIPLE', number: 20 },
                landingPoint: DART_POSITIONS.T20_CENTER,
                ring: 'TRIPLE',
                segmentNumber: 20,
                score: 60,
              },
            ],
            correctAnswer: 60,
            questionText: 'この投擲の得点は？',
          },
          stats = { correct: 5, total: 7, currentStreak: 3, bestStreak: 5 },
          displayedDarts = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: DART_POSITIONS.T20_CENTER,
              score: 60,
            },
          ],
          remainingScore = 501,
          startingScore = 0,
        } = options;

        useGameStore.setState({
          gameState,
          config: {
            configId: 'basic-practice',
            configName: '基礎練習',
            isPreset: true,
            throwUnit: 1,
            questionType: 'score',
            judgmentTiming: 'independent',
            stdDevMM: 30,
            startingScore,
            icon: '📚',
          },
          sessionConfig,
          elapsedTime,
          currentQuestion,
          stats,
          displayedDarts,
          remainingScore,
          currentThrowIndex: 1,
          visibleDarts: [true, true, true],
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
  title: 'Practice/PracticeScreen',
  component: PracticeScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '練習画面コンテナコンポーネント。StatsBar、DartBoard、QuestionDisplay、NumPad、Feedbackを統合して表示します。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PracticeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 練習中でない状態
 */
export const NotPracticing: Story = {
  decorators: [
    withMockStore({
      gameState: 'setup',
    }),
  ],
};

/**
 * 問題数モード（10問中7問回答済み）
 */
export const QuestionMode: Story = {
  decorators: [
    withMockStore({
      gameState: 'practicing',
      sessionConfig: { mode: 'questions', questionCount: 10 },
      stats: { correct: 5, total: 7, currentStreak: 3, bestStreak: 5 },
    }),
  ],
};

/**
 * 時間制限モード（3分経過/5分）
 */
export const TimerMode: Story = {
  decorators: [
    withMockStore({
      gameState: 'practicing',
      sessionConfig: { mode: 'time', timeLimit: 5 },
      elapsedTime: 180,
      stats: { correct: 8, total: 11, currentStreak: 4, bestStreak: 6 },
    }),
  ],
};

/**
 * 501モード（残り301点）
 */
export const Game501: Story = {
  decorators: [
    withMockStore({
      gameState: 'practicing',
      sessionConfig: { mode: 'questions', questionCount: 20 },
      remainingScore: 301,
      startingScore: 501,
      stats: { correct: 10, total: 12, currentStreak: 5, bestStreak: 7 },
    }),
  ],
};

/**
 * 高正答率（90%）
 */
export const HighAccuracy: Story = {
  decorators: [
    withMockStore({
      gameState: 'practicing',
      sessionConfig: { mode: 'questions', questionCount: 20 },
      stats: { correct: 18, total: 20, currentStreak: 10, bestStreak: 10 },
    }),
  ],
};

/**
 * 連続正解中（15連続）
 */
export const HighStreak: Story = {
  decorators: [
    withMockStore({
      gameState: 'practicing',
      sessionConfig: { mode: 'questions', questionCount: 50 },
      stats: { correct: 20, total: 25, currentStreak: 15, bestStreak: 15 },
    }),
  ],
};

/**
 * 3投表示（T20 x 3）
 */
export const ThreeDarts: Story = {
  decorators: [
    withMockStore({
      gameState: 'practicing',
      sessionConfig: { mode: 'questions', questionCount: 10 },
      displayedDarts: [
        { target: { type: 'TRIPLE', number: 20 }, landingPoint: { x: -2, y: -103 }, score: 60 },
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: DART_POSITIONS.T20_CENTER,
          score: 60,
        },
        { target: { type: 'TRIPLE', number: 20 }, landingPoint: { x: 2, y: -103 }, score: 60 },
      ],
      stats: { correct: 3, total: 4, currentStreak: 2, bestStreak: 2 },
    }),
  ],
};

/**
 * 初期状態（0問回答）
 */
export const InitialState: Story = {
  decorators: [
    withMockStore({
      gameState: 'practicing',
      sessionConfig: { mode: 'questions', questionCount: 10 },
      stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
    }),
  ],
};
