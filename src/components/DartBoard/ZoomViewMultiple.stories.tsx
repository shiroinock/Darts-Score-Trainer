import type { Meta, StoryObj } from '@storybook/react-vite';
import { DART_POSITIONS } from '../../stories/fixtures/sampleData';
import { ZoomViewMultiple } from './ZoomViewMultiple';

const meta = {
  title: 'DartBoard/ZoomViewMultiple',
  component: ZoomViewMultiple,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '3投モード用の複数ダーツ拡大表示コンポーネント。3つの独立したp5.js Sketchインスタンスで各ダーツの着地点を個別にズーム表示します。デスクトップでは横並び（各160×160px）、モバイル（≤640px）では縦並び（各140×140px）でレスポンシブに対応します。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    coords: {
      description: 'ダーツ位置配列（物理座標、mm単位）',
    },
    dartCount: {
      description: 'ダーツ数（0-3）',
      control: { type: 'range', min: 0, max: 3, step: 1 },
    },
    visibleDarts: {
      description: '表示/非表示状態の配列',
    },
    zoomFactor: {
      description: 'ズーム倍率（デフォルト: 8.0）',
      control: { type: 'range', min: 2, max: 20, step: 0.5 },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ZoomViewMultiple>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ダーツなし（非表示）
 */
export const NoDarts: Story = {
  args: {
    coords: [],
    dartCount: 0,
    visibleDarts: [],
  },
};

/**
 * 1投（T20中心）
 */
export const SingleDartT20: Story = {
  args: {
    coords: [DART_POSITIONS.T20_CENTER],
    dartCount: 1,
    visibleDarts: [true],
  },
};

/**
 * 2投（T20 + T19）
 */
export const TwoDarts: Story = {
  args: {
    coords: [
      { x: 0, y: -103 }, // T20
      { x: 50, y: -90 }, // T19
    ],
    dartCount: 2,
    visibleDarts: [true, true],
  },
};

/**
 * 3投（T20 + T20 + T20）
 */
export const ThreeDartsT20: Story = {
  args: {
    coords: [
      { x: -2, y: -103 },
      { x: 0, y: -103 },
      { x: 2, y: -103 },
    ],
    dartCount: 3,
    visibleDarts: [true, true, true],
  },
};

/**
 * 3投（散らばり）
 */
export const ThreeDartsScattered: Story = {
  args: {
    coords: [
      { x: 0, y: -103 }, // T20
      { x: 80, y: 0 }, // D16
      { x: 0, y: 10 }, // Outer Bull
    ],
    dartCount: 3,
    visibleDarts: [true, true, true],
  },
};

/**
 * 3投（1本のみ表示）
 */
export const ThreeDartsOneVisible: Story = {
  args: {
    coords: [
      { x: 0, y: -103 },
      { x: 0, y: -100 },
      { x: 0, y: -97 },
    ],
    dartCount: 3,
    visibleDarts: [true, false, false],
  },
};

/**
 * 3投（2本のみ表示）
 */
export const ThreeDartsTwoVisible: Story = {
  args: {
    coords: [
      { x: 0, y: -103 },
      { x: 2, y: -103 },
      { x: 4, y: -103 },
    ],
    dartCount: 3,
    visibleDarts: [true, true, false],
  },
};

/**
 * 高倍率ズーム（20倍）
 */
export const HighZoom: Story = {
  args: {
    coords: [
      { x: -2, y: -103 },
      { x: 0, y: -103 },
      { x: 2, y: -103 },
    ],
    dartCount: 3,
    visibleDarts: [true, true, true],
    zoomFactor: 20,
  },
};

/**
 * 低倍率ズーム（4倍）
 */
export const LowZoom: Story = {
  args: {
    coords: [
      { x: -2, y: -103 },
      { x: 0, y: -103 },
      { x: 2, y: -103 },
    ],
    dartCount: 3,
    visibleDarts: [true, true, true],
    zoomFactor: 4,
  },
};

/**
 * スパイダー境界（20と1の境界）
 */
export const SpiderBoundary: Story = {
  args: {
    coords: [
      { x: -8, y: -103 }, // 20側
      { x: 0, y: -103 }, // 中央
      { x: 8, y: -103 }, // 1側
    ],
    dartCount: 3,
    visibleDarts: [true, true, true],
  },
};

/**
 * 各ダーツ異なるエリア
 */
export const DifferentAreas: Story = {
  args: {
    coords: [
      DART_POSITIONS.BULL_CENTER, // ブル
      DART_POSITIONS.T20_CENTER, // T20
      DART_POSITIONS.D16_CENTER, // D16
    ],
    dartCount: 3,
    visibleDarts: [true, true, true],
  },
};
