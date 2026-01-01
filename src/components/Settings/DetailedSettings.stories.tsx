import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { JudgmentTiming, QuestionType } from '../../types';
import { DetailedSettings } from './DetailedSettings';

interface ConfigOptions {
  throwUnit?: 1 | 3;
  questionType?: QuestionType;
  judgmentTiming?: JudgmentTiming;
  startingScore?: number;
}

const withMockStore =
  (configOptions: ConfigOptions = {}) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        // マウント時に設定を適用
        const currentConfig = useGameStore.getState().config;
        useGameStore.setState({
          config: {
            ...currentConfig,
            ...configOptions,
          },
        });

        // クリーンアップ
        return () => {
          useGameStore.setState({
            config: {
              throwUnit: 1,
              questionType: 'score',
              judgmentTiming: 'independent',
              startingScore: 501,
            },
          });
        };
      }, [configOptions]);

      return <Story />;
    }

    return <StoryWrapper />;
  };

const meta = {
  title: 'Settings/DetailedSettings',
  component: DetailedSettings,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '折りたたみ可能な詳細設定UIコンポーネント。投擲単位、問う内容、判定タイミング、開始点数を設定できます。',
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
} satisfies Meta<typeof DetailedSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態（折りたたまれている）
 */
export const Default: Story = {
  decorators: [withMockStore()],
};

/**
 * 1投モード
 * 得点のみを問う基本設定
 */
export const OneThrowMode: Story = {
  decorators: [
    withMockStore({
      throwUnit: 1,
      questionType: 'score',
    }),
  ],
};

/**
 * 3投モード・独立判定
 * 判定タイミングのセクションが表示される
 */
export const ThreeThrowIndependent: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'score',
      judgmentTiming: 'independent',
    }),
  ],
};

/**
 * 3投モード・累積判定
 * 判定タイミングが累積に設定されている
 */
export const ThreeThrowCumulative: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'score',
      judgmentTiming: 'cumulative',
    }),
  ],
};

/**
 * 残り点数モード
 * 開始点数のセクションが表示される
 */
export const RemainingMode: Story = {
  decorators: [
    withMockStore({
      throwUnit: 1,
      questionType: 'remaining',
      startingScore: 501,
    }),
  ],
};

/**
 * 両方モード（3投・累積）
 * 判定タイミングと開始点数の両方が表示される最も複雑な設定
 */
export const BothModeWithAllOptions: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'both',
      judgmentTiming: 'cumulative',
      startingScore: 701,
    }),
  ],
};

/**
 * 開始点数301
 * 301ゲームの設定例
 */
export const StartingScore301: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'remaining',
      startingScore: 301,
    }),
  ],
};

/**
 * 開始点数701
 * 701ゲームの設定例
 */
export const StartingScore701: Story = {
  decorators: [
    withMockStore({
      throwUnit: 3,
      questionType: 'both',
      startingScore: 701,
    }),
  ],
};
