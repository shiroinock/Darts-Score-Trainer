import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { JudgmentTiming, QuestionType } from '../../types';
import { QuestionDisplay } from './QuestionDisplay';

interface MockOptions {
  throwUnit?: 1 | 3;
  questionType?: QuestionType;
  judgmentTiming?: JudgmentTiming;
  currentThrowIndex?: number;
}

const withMockStore =
  (options: MockOptions = {}) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        const {
          throwUnit = 1,
          questionType = 'score',
          judgmentTiming = 'independent',
          currentThrowIndex = 1,
        } = options;

        useGameStore.setState({
          config: {
            configId: 'custom-test',
            configName: 'テスト設定',
            isPreset: false,
            throwUnit,
            questionType,
            judgmentTiming,
            stdDevMM: 30,
            startingScore: 501,
          },
          currentThrowIndex,
          currentQuestion: {
            throws: [],
          },
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
  title: 'Practice/QuestionDisplay',
  component: QuestionDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '問題表示コンポーネント。現在の問題文と投擲単位を表示します。得点/残り点数/両方モードに対応し、3投モード時は投擲番号も表示します。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuestionDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 得点モード・1投
 * 「この投擲の得点は？」
 */
export const ScoreSingleThrow: Story = {
  decorators: [
    withMockStore({
      throwUnit: 1,
      questionType: 'score',
    }),
  ],
};

/**
 * 得点モード・3投
 * 「3投の合計得点は？」
 */
export const ScoreThreeThrows: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'score',
    }),
  ],
};

/**
 * 残り点数モード
 * 「残り点数は？」
 */
export const RemainingMode: Story = {
  decorators: [
    withMockStore({
      throwUnit: 1,
      questionType: 'remaining',
    }),
  ],
};

/**
 * 両方モード・1投
 * 「この投擲の得点は？」「残り点数は？」の両方を表示
 */
export const BothModeSingleThrow: Story = {
  decorators: [
    withMockStore({
      throwUnit: 1,
      questionType: 'both',
    }),
  ],
};

/**
 * 両方モード・3投
 * 「3投の合計得点は？」「残り点数は？」の両方を表示
 */
export const BothModeThreeThrows: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'both',
    }),
  ],
};

/**
 * 3投モード・1本目
 * 投擲番号「1本目」を表示
 */
export const ThreeThrows1stDart: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'score',
      currentThrowIndex: 1,
    }),
  ],
};

/**
 * 3投モード・2本目
 * 投擲番号「2本目」を表示
 */
export const ThreeThrows2ndDart: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'score',
      currentThrowIndex: 2,
    }),
  ],
};

/**
 * 3投モード・3本目
 * 投擲番号「3本目」を表示
 */
export const ThreeThrows3rdDart: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'score',
      currentThrowIndex: 3,
    }),
  ],
};

/**
 * 3投モード・累積判定
 * 「合計」ラベルを表示
 */
export const ThreeThrowsCumulative: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'score',
      judgmentTiming: 'cumulative',
      currentThrowIndex: 2,
    }),
  ],
};

/**
 * 問題なし（ローディング状態）
 */
export const NoQuestion: Story = {
  render: () => {
    useEffect(() => {
      useGameStore.setState({ currentQuestion: null });
    }, []);
    return <QuestionDisplay />;
  },
};
