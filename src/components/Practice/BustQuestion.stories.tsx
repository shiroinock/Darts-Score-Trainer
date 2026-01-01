import type { Meta, StoryObj } from '@storybook/react-vite';
import type { BustQuestionAnswer } from '../../types';
import { BustQuestion } from './BustQuestion';

const meta = {
  title: 'Practice/BustQuestion',
  component: BustQuestion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'バスト判定コンポーネント。バスト/セーフ/フィニッシュの判定を問います。キーボードショートカット（B/S/F）に対応。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    correctAnswer: {
      control: 'select',
      options: ['bust', 'safe', 'finish'],
      description: '正解（bust/safe/finish）',
    },
    onAnswer: {
      description: '回答送信コールバック',
    },
    showFeedback: {
      control: 'boolean',
      description: 'フィードバック表示中かどうか',
    },
    userAnswer: {
      control: 'select',
      options: ['bust', 'safe', 'finish'],
      description: 'ユーザーの回答（フィードバック表示時）',
    },
    showFinishOption: {
      control: 'boolean',
      description: 'フィニッシュ選択肢を表示するか',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '500px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BustQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのonAnswerハンドラー
 * ストーリーでの動作確認用（何もしない）
 */
const defaultOnAnswer = (_answer: BustQuestionAnswer) => {
  // Storybook上での動作確認用のハンドラー
  // 実際のアプリケーションでは適切なハンドラーが渡されます
};

/**
 * デフォルト状態（バスト/セーフの2択）
 *
 * キーボードショートカット: B (バスト), S (セーフ)
 */
export const Default: Story = {
  args: {
    correctAnswer: 'bust',
    onAnswer: defaultOnAnswer,
    showFeedback: false,
    showFinishOption: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'キーボードショートカット: B (バスト), S (セーフ)',
      },
    },
  },
};

/**
 * フィニッシュ選択肢あり（3択）
 * 残り点数が1本でフィニッシュ可能な場合
 *
 * キーボードショートカット: B (バスト), S (セーフ), F (フィニッシュ)
 */
export const WithFinishOption: Story = {
  args: {
    correctAnswer: 'finish',
    onAnswer: defaultOnAnswer,
    showFeedback: false,
    showFinishOption: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'キーボードショートカット: B (バスト), S (セーフ), F (フィニッシュ)',
      },
    },
  },
};

/**
 * バスト正解のフィードバック
 */
export const FeedbackCorrectBust: Story = {
  args: {
    correctAnswer: 'bust',
    onAnswer: defaultOnAnswer,
    showFeedback: true,
    userAnswer: 'bust',
    showFinishOption: false,
  },
};

/**
 * セーフ正解のフィードバック
 */
export const FeedbackCorrectSafe: Story = {
  args: {
    correctAnswer: 'safe',
    onAnswer: defaultOnAnswer,
    showFeedback: true,
    userAnswer: 'safe',
    showFinishOption: false,
  },
};

/**
 * フィニッシュ正解のフィードバック
 */
export const FeedbackCorrectFinish: Story = {
  args: {
    correctAnswer: 'finish',
    onAnswer: defaultOnAnswer,
    showFeedback: true,
    userAnswer: 'finish',
    showFinishOption: true,
  },
};

/**
 * バスト不正解のフィードバック（セーフと誤答）
 */
export const FeedbackIncorrectBust: Story = {
  args: {
    correctAnswer: 'bust',
    onAnswer: defaultOnAnswer,
    showFeedback: true,
    userAnswer: 'safe',
    showFinishOption: false,
  },
};

/**
 * セーフ不正解のフィードバック（バストと誤答）
 */
export const FeedbackIncorrectSafe: Story = {
  args: {
    correctAnswer: 'safe',
    onAnswer: defaultOnAnswer,
    showFeedback: true,
    userAnswer: 'bust',
    showFinishOption: false,
  },
};

/**
 * フィニッシュ不正解のフィードバック（バストと誤答）
 */
export const FeedbackIncorrectFinish: Story = {
  args: {
    correctAnswer: 'finish',
    onAnswer: defaultOnAnswer,
    showFeedback: true,
    userAnswer: 'bust',
    showFinishOption: true,
  },
};

/**
 * インタラクティブデモ
 * ボタンをクリックしてみてください
 */
export const Interactive: Story = {
  args: {
    correctAnswer: 'safe',
    onAnswer: (answer: BustQuestionAnswer) => {
      // eslint-disable-next-line no-alert
      alert(`選択された回答: ${answer}`);
    },
    showFeedback: false,
    showFinishOption: false,
  },
};

/**
 * インタラクティブデモ（フィニッシュ選択肢あり）
 */
export const InteractiveWithFinish: Story = {
  args: {
    correctAnswer: 'finish',
    onAnswer: (answer: BustQuestionAnswer) => {
      // eslint-disable-next-line no-alert
      alert(`選択された回答: ${answer}`);
    },
    showFeedback: false,
    showFinishOption: true,
  },
};
