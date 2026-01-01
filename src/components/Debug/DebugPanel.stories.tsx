import type { Meta, StoryObj } from '@storybook/react-vite';
import { DebugPanel } from './DebugPanel';
import type { ClickInfo } from './DebugScreen';

const meta = {
  title: 'Debug/DebugPanel',
  component: DebugPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '判定結果表示と正しい位置入力パネル。クリック位置の座標情報と判定結果を表示し、正しい位置を入力して記録します。',
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
} satisfies Meta<typeof DebugPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのonAddRecordハンドラー
 * ストーリーでの動作確認用（何もしない）
 */
const defaultOnAddRecord = (_actual: {
  segment: number;
  ring: 'INNER_BULL' | 'OUTER_BULL' | 'TRIPLE' | 'DOUBLE' | 'INNER_SINGLE' | 'OUTER_SINGLE' | 'OUT';
}) => {
  // Storybook上での動作確認用のハンドラー
  // 記録情報を受け取りますが、何もしません
};

/**
 * クリック前の状態
 * 「ボードをクリックしてください」と表示
 */
export const NoClick: Story = {
  args: {
    clickInfo: null,
    onAddRecord: defaultOnAddRecord,
  },
};

/**
 * T20判定（Triple 20）
 */
export const TripleT20: Story = {
  args: {
    clickInfo: {
      screenX: 300,
      screenY: 100,
      physicalX: 0,
      physicalY: -103,
      detected: {
        segment: 20,
        ring: 'TRIPLE',
        score: 60,
      },
    } as ClickInfo,
    onAddRecord: defaultOnAddRecord,
  },
};

/**
 * D16判定（Double 16）
 */
export const DoubleD16: Story = {
  args: {
    clickInfo: {
      screenX: 450,
      screenY: 300,
      physicalX: 166,
      physicalY: 0,
      detected: {
        segment: 16,
        ring: 'DOUBLE',
        score: 32,
      },
    } as ClickInfo,
    onAddRecord: defaultOnAddRecord,
  },
};

/**
 * インナーブル判定（50点）
 */
export const InnerBull: Story = {
  args: {
    clickInfo: {
      screenX: 300,
      screenY: 300,
      physicalX: 0,
      physicalY: 0,
      detected: {
        segment: 25,
        ring: 'INNER_BULL',
        score: 50,
      },
    } as ClickInfo,
    onAddRecord: defaultOnAddRecord,
  },
};

/**
 * アウターブル判定（25点）
 */
export const OuterBull: Story = {
  args: {
    clickInfo: {
      screenX: 310,
      screenY: 300,
      physicalX: 10,
      physicalY: 0,
      detected: {
        segment: 25,
        ring: 'OUTER_BULL',
        score: 25,
      },
    } as ClickInfo,
    onAddRecord: defaultOnAddRecord,
  },
};

/**
 * シングル判定（S18）
 */
export const SingleS18: Story = {
  args: {
    clickInfo: {
      screenX: 250,
      screenY: 150,
      physicalX: -50,
      physicalY: -80,
      detected: {
        segment: 18,
        ring: 'INNER_SINGLE',
        score: 18,
      },
    } as ClickInfo,
    onAddRecord: defaultOnAddRecord,
  },
};

/**
 * アウト判定（0点）
 */
export const OutOfBoard: Story = {
  args: {
    clickInfo: {
      screenX: 100,
      screenY: 100,
      physicalX: -250,
      physicalY: -250,
      detected: {
        segment: 0,
        ring: 'OUT',
        score: 0,
      },
    } as ClickInfo,
    onAddRecord: defaultOnAddRecord,
  },
};

/**
 * 中心から遠い位置（200mm）
 */
export const FarFromCenter: Story = {
  args: {
    clickInfo: {
      screenX: 500,
      screenY: 200,
      physicalX: 141.4,
      physicalY: -141.4,
      detected: {
        segment: 1,
        ring: 'DOUBLE',
        score: 2,
      },
    } as ClickInfo,
    onAddRecord: defaultOnAddRecord,
  },
};
