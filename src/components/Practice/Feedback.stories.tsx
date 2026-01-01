import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { Question, QuestionType, Stats } from '../../types';
import { Feedback } from './Feedback';

interface MockOptions {
  userAnswer: number;
  isCorrect: boolean;
  currentQuestion: Question;
  questionType?: QuestionType;
  startingScore?: number;
  remainingScore?: number;
  stats?: Stats;
}

const withMockStore = (options: MockOptions) => (Story: React.ComponentType) => {
  function StoryWrapper() {
    useEffect(() => {
      const {
        currentQuestion,
        questionType = 'score',
        startingScore = 0,
        remainingScore = 501,
        stats = { correct: 5, total: 7, currentStreak: 3, bestStreak: 5 },
      } = options;

      useGameStore.setState({
        currentQuestion,
        config: {
          configId: 'custom-test',
          configName: 'テスト設定',
          isPreset: false,
          throwUnit: 1,
          questionType,
          judgmentTiming: 'independent',
          stdDevMM: 30,
          startingScore,
        },
        remainingScore,
        stats,
      });

      return () => {
        useGameStore.setState({
          currentQuestion: null,
        });
      };
    }, [options]);

    return <Story />;
  }

  return <StoryWrapper />;
};

const meta = {
  title: 'Practice/Feedback',
  component: Feedback,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'フィードバック表示コンポーネント。ユーザーの回答に対する正解/不正解、スコア詳細、連続正解数、バスト情報などを表示します。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '500px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Feedback>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 正解（1投、T20で60点）
 */
export const CorrectSingleThrow: Story = {
  args: {
    userAnswer: 60,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 60,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -100 },
            ring: 'TRIPLE',
            segmentNumber: 20,
            score: 60,
          },
        ],
        correctAnswer: 60,
        questionText: 'この投擲の得点は？',
      },
      stats: { correct: 6, total: 8, currentStreak: 4, bestStreak: 5 },
    }),
  ],
};

/**
 * 不正解（1投、D16で32点、40と誤答）
 */
export const IncorrectSingleThrow: Story = {
  args: {
    userAnswer: 40,
    isCorrect: false,
  },
  decorators: [
    withMockStore({
      userAnswer: 40,
      isCorrect: false,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'DOUBLE', number: 16 },
            landingPoint: { x: 80, y: 0 },
            ring: 'DOUBLE',
            segmentNumber: 16,
            score: 32,
          },
        ],
        correctAnswer: 32,
        questionText: 'この投擲の得点は？',
      },
      stats: { correct: 5, total: 8, currentStreak: 0, bestStreak: 5 },
    }),
  ],
};

/**
 * 正解（3投、T20 + T20 + T20 = 180点満点）
 */
export const CorrectThreeThrows180: Story = {
  args: {
    userAnswer: 180,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 180,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -100 },
            ring: 'TRIPLE',
            segmentNumber: 20,
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -100 },
            ring: 'TRIPLE',
            segmentNumber: 20,
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -100 },
            ring: 'TRIPLE',
            segmentNumber: 20,
            score: 60,
          },
        ],
        correctAnswer: 180,
        questionText: '3投の合計得点は？',
      },
      stats: { correct: 10, total: 10, currentStreak: 10, bestStreak: 10 },
    }),
  ],
};

/**
 * 正解（ブル50点）
 */
export const CorrectBull: Story = {
  args: {
    userAnswer: 50,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 50,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'BULL', number: null },
            landingPoint: { x: 0, y: 0 },
            ring: 'INNER_BULL',
            score: 50,
          },
        ],
        correctAnswer: 50,
        questionText: 'この投擲の得点は？',
      },
      stats: { correct: 8, total: 9, currentStreak: 5, bestStreak: 7 },
    }),
  ],
};

/**
 * 正解（0点、ボード外）
 */
export const CorrectMiss: Story = {
  args: {
    userAnswer: 0,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 0,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'SINGLE', number: 20 },
            landingPoint: { x: 300, y: 0 },
            score: 0,
          },
        ],
        correctAnswer: 0,
        questionText: 'この投擲の得点は？',
      },
      stats: { correct: 5, total: 8, currentStreak: 2, bestStreak: 5 },
    }),
  ],
};

/**
 * 正解とバスト表示（残り超過）
 */
export const CorrectWithBustOver: Story = {
  args: {
    userAnswer: 60,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 60,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -100 },
            ring: 'TRIPLE',
            segmentNumber: 20,
            score: 60,
          },
        ],
        correctAnswer: 60,
        questionText: 'この投擲の得点は？',
        bustInfo: {
          isBust: true,
          reason: 'over',
        },
      },
      questionType: 'remaining',
      startingScore: 501,
      remainingScore: 41,
      stats: { correct: 7, total: 9, currentStreak: 3, bestStreak: 5 },
    }),
  ],
};

/**
 * 正解とバスト表示（残り1点）
 */
export const CorrectWithBustFinishImpossible: Story = {
  args: {
    userAnswer: 20,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 20,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'SINGLE', number: 20 },
            landingPoint: { x: 0, y: -100 },
            ring: 'INNER_SINGLE',
            segmentNumber: 20,
            score: 20,
          },
        ],
        correctAnswer: 20,
        questionText: 'この投擲の得点は？',
        bustInfo: {
          isBust: true,
          reason: 'finish_impossible',
        },
      },
      questionType: 'remaining',
      startingScore: 501,
      remainingScore: 1,
      stats: { correct: 12, total: 15, currentStreak: 4, bestStreak: 8 },
    }),
  ],
};

/**
 * 正解とバスト表示（ダブルアウト必要）
 */
export const CorrectWithBustDoubleOutRequired: Story = {
  args: {
    userAnswer: 20,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 20,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'SINGLE', number: 20 },
            landingPoint: { x: 0, y: -100 },
            ring: 'INNER_SINGLE',
            segmentNumber: 20,
            score: 20,
          },
        ],
        correctAnswer: 20,
        questionText: 'この投擲の得点は？',
        bustInfo: {
          isBust: true,
          reason: 'double_out_required',
        },
      },
      questionType: 'remaining',
      startingScore: 501,
      remainingScore: 0,
      stats: { correct: 15, total: 17, currentStreak: 6, bestStreak: 8 },
    }),
  ],
};

/**
 * ゲームクリア（残り0点到達）
 */
export const GameCleared: Story = {
  args: {
    userAnswer: 0,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 0,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'DOUBLE', number: 16 },
            landingPoint: { x: 80, y: 0 },
            ring: 'DOUBLE',
            segmentNumber: 16,
            score: 32,
          },
        ],
        correctAnswer: 32,
        questionText: 'この投擲の得点は？',
      },
      questionType: 'remaining',
      startingScore: 501,
      remainingScore: 0,
      stats: { correct: 20, total: 23, currentStreak: 10, bestStreak: 12 },
    }),
  ],
};

/**
 * 高連続正解数（15連続正解中）
 */
export const HighStreak: Story = {
  args: {
    userAnswer: 60,
    isCorrect: true,
  },
  decorators: [
    withMockStore({
      userAnswer: 60,
      isCorrect: true,
      currentQuestion: {
        mode: 'score',
        throws: [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -100 },
            ring: 'TRIPLE',
            segmentNumber: 20,
            score: 60,
          },
        ],
        correctAnswer: 60,
        questionText: 'この投擲の得点は？',
      },
      stats: { correct: 18, total: 21, currentStreak: 15, bestStreak: 15 },
    }),
  ],
};
