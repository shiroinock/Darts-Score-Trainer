import type { Meta, StoryObj } from '@storybook/react-vite';
import { P5Canvas } from './P5Canvas';

const meta = {
  title: 'DartBoard/P5Canvas',
  component: P5Canvas,
  parameters: { layout: 'centered' },
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
  args: { coords: [], dartCount: 0 },
};

export const SingleDartOnTriple20: Story = {
  args: { coords: [{ x: 0, y: -103 }], dartCount: 1 },
};

export const ThreeDartsWithLegend: Story = {
  args: {
    coords: [
      { x: 0, y: -103 },
      { x: 50, y: -90 },
      { x: -30, y: -95 },
    ],
    dartCount: 3,
  },
};

export const BullsEyeHit: Story = {
  args: { coords: [{ x: 0, y: 0 }], dartCount: 1 },
};
