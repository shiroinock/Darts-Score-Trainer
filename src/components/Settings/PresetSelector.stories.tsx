import type { Meta, StoryObj } from '@storybook/react-vite';
import { PRESETS } from '../../stores/config/presets';
import { useGameStore } from '../../stores/gameStore';
import { PresetSelector } from './PresetSelector';

const withMockStore =
  (configId = 'preset-basic') =>
  (Story: React.ComponentType) => {
    // プリセットから完全な設定を取得して状態を設定
    const config = PRESETS[configId];
    useGameStore.setState({ config });
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
