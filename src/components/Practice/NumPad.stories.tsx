import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumPad } from './NumPad';

/**
 * デフォルトのonConfirmハンドラー
 * コンソールに値を出力します
 */
const defaultOnConfirm = (value: number) => {
  console.log('Confirmed value:', value);
};

const meta = {
  title: 'Practice/NumPad',
  component: NumPad,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '練習画面で使用するテンキー入力コンポーネント。数字入力、クリア、バックスペース、確定機能を提供します。',
      },
      story: {
        height: '700px',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    questionType: {
      control: 'select',
      options: ['score', 'remaining', 'both'],
      description: '問題のタイプ（得点/残り点数/両方）',
    },
    maxValue: {
      control: 'number',
      description: '最大入力値（オプション）',
    },
    onConfirm: {
      description: '確定ボタン押下時のコールバック',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumPad>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 得点入力モード
 * 1投または3投合計として有効な得点のみ入力可能
 */
export const ScoreMode: Story = {
  args: {
    questionType: 'score',
    onConfirm: defaultOnConfirm,
  },
};

/**
 * 残り点数入力モード
 * 0以上の整数を入力可能
 */
export const RemainingMode: Story = {
  args: {
    questionType: 'remaining',
    onConfirm: defaultOnConfirm,
  },
};

/**
 * 両方モード
 * 得点と残り点数の両方を許容
 */
export const BothMode: Story = {
  args: {
    questionType: 'both',
    onConfirm: defaultOnConfirm,
  },
};

/**
 * 最大値制限付き
 * maxValueプロパティで入力可能な最大値を制限
 */
export const WithMaxValue: Story = {
  args: {
    questionType: 'remaining',
    maxValue: 501,
    onConfirm: defaultOnConfirm,
  },
};

/**
 * インタラクティブデモ
 * 実際の操作を試すことができます
 */
export const Interactive: Story = {
  args: {
    questionType: 'score',
    onConfirm: (value: number) => {
      // eslint-disable-next-line no-alert
      alert(`確定された値: ${value}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '数字ボタンをクリックして入力し、確定ボタンで値を送信できます。キーボード入力（0-9, Enter, Backspace, C/Escape）にも対応しています。',
      },
    },
  },
};

/**
 * モバイル表示
 * 小さい画面でのレイアウトを確認
 */
export const MobileView: Story = {
  args: {
    questionType: 'score',
    onConfirm: defaultOnConfirm,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
