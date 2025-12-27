import type { Meta, StoryObj } from '@storybook/react-vite';
import { PresetSelector } from './PresetSelector';

const withMockStore =
  (configId = 'preset-basic') =>
  (Story: React.ComponentType) => {
    const mockUseGameStore = (selector: (state: unknown) => unknown) => {
      const mockState = {
        config: { configId },
        selectPreset: (id: string) => console.log('Selected:', id),
      };
      return selector(mockState);
    };

    vi.doMock('../../stores/gameStore', () => ({ useGameStore: mockUseGameStore }));

    return <Story />;
  };

const meta = {
  title: 'Settings/PresetSelector',
  component: PresetSelector,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof PresetSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicPresetActive: Story = {
  decorators: [withMockStore('preset-basic')],
};

export const PlayerPresetActive: Story = {
  decorators: [withMockStore('preset-player')],
};

export const CallerBasicActive: Story = {
  decorators: [withMockStore('preset-caller-basic')],
};

export const CallerCumulativeActive: Story = {
  decorators: [withMockStore('preset-caller-cumulative')],
};

export const ComprehensiveActive: Story = {
  decorators: [withMockStore('preset-comprehensive')],
};
