import type { Meta, StoryObj } from '@storybook/react-vite';
import { DART_POSITIONS } from '../../stories/fixtures/sampleData';
import { P5Canvas } from './P5Canvas';

const meta = {
  title: 'DartBoard/P5Canvas',
  component: P5Canvas,
  parameters: {
    layout: 'centered',
    docs: {
      story: {
        height: '800px',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '600px', height: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof P5Canvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyBoard: Story = {
  args: { coords: [], dartCount: 0, width: 600, height: 600 },
};

export const SingleDartOnTriple20: Story = {
  args: { coords: [DART_POSITIONS.T20_CENTER], dartCount: 1, width: 600, height: 600 },
};

export const ThreeDartsWithLegend: Story = {
  args: {
    coords: [DART_POSITIONS.T20_CENTER, { x: 50, y: -90 }, { x: -30, y: -95 }],
    dartCount: 3,
    width: 600,
    height: 600,
  },
};

export const BullsEyeHit: Story = {
  args: { coords: [DART_POSITIONS.BULL_CENTER], dartCount: 1, width: 600, height: 600 },
};
