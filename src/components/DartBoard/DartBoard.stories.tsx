import type { Meta, StoryObj } from '@storybook/react-vite';
import { DART_POSITIONS } from '../../stories/fixtures/sampleData';
import { DartBoard } from './DartBoard';

const meta = {
  title: 'DartBoard/DartBoard',
  component: DartBoard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        height: '800px',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    coords: { description: 'ダーツ位置配列（物理座標、mm単位）' },
    dartCount: {
      description: 'ダーツ数（0-3）',
      control: { type: 'range', min: 0, max: 3, step: 1 },
    },
  },
} satisfies Meta<typeof DartBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { coords: [], dartCount: 0 },
};

export const SingleDart: Story = {
  args: { coords: [DART_POSITIONS.T20_CENTER], dartCount: 1 },
};

export const ThreeDarts: Story = {
  args: {
    coords: [DART_POSITIONS.T20_CENTER, { x: 50, y: -90 }, { x: -30, y: -95 }],
    dartCount: 3,
  },
};

export const BullsEye: Story = {
  args: { coords: [DART_POSITIONS.BULL_CENTER], dartCount: 1 },
};

export const OuterBull: Story = {
  args: { coords: [{ x: 5, y: 0 }], dartCount: 1 },
};

export const OffBoard: Story = {
  args: { coords: [{ x: 300, y: 300 }], dartCount: 1 },
};

export const MobileViewport: Story = {
  args: {
    coords: [DART_POSITIONS.T20_CENTER, { x: 50, y: -90 }, { x: -30, y: -95 }],
    dartCount: 3,
  },
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
