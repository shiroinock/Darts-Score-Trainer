import type { Meta, StoryObj } from '@storybook/react-vite';
import { DebugBoard } from './DebugBoard';
import type { ClickInfo } from './DebugScreen';

const meta = {
  title: 'Debug/DebugBoard',
  component: DebugBoard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'クリック可能なダーツボード。ボードをクリックすると座標情報と判定結果を取得できます。p5.jsで描画されます。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '700px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DebugBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態
 * ボードをクリックして座標情報を確認できます
 */
export const Default: Story = {
  args: {
    onBoardClick: (info: ClickInfo, canvas: { width: number; height: number; scale: number }) => {
      console.log('Board clicked:', info);
      console.log('Canvas info:', canvas);
    },
  },
};

/**
 * クリック情報をアラートで表示
 */
export const WithAlert: Story = {
  args: {
    onBoardClick: (info: ClickInfo) => {
      // eslint-disable-next-line no-alert
      alert(
        `判定: ${info.detected.ring} ${info.detected.segment}\n` +
          `得点: ${info.detected.score}点\n` +
          `物理座標: (${info.physicalX.toFixed(2)}, ${info.physicalY.toFixed(2)}) mm`
      );
    },
  },
};
