import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import type { SessionConfig } from '../../types';
import { SessionConfigSelector } from './SessionConfigSelector';

const withMockStore = (sessionConfig: SessionConfig) => (Story: React.ComponentType) => {
  const mockUseGameStore = (selector: (state: unknown) => unknown) => {
    const mockState = {
      sessionConfig,
      setSessionConfig: fn((config) => console.log('Set config:', config)),
    };
    return selector(mockState);
  };

  // @ts-expect-error - モジュールモック
  vi.doMock('../../stores/gameStore', () => ({
    useGameStore: mockUseGameStore,
  }));

  return <Story />;
};

const meta = {
  title: 'Settings/SessionConfigSelector',
  component: SessionConfigSelector,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof SessionConfigSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QuestionsMode10: Story = {
  decorators: [
    withMockStore({
      mode: 'questions',
      questionCount: 10,
    }),
  ],
};

export const QuestionsMode50: Story = {
  decorators: [
    withMockStore({
      mode: 'questions',
      questionCount: 50,
    }),
  ],
};

export const TimeMode3Min: Story = {
  decorators: [
    withMockStore({
      mode: 'time',
      timeLimit: 3,
    }),
  ],
};

export const TimeMode10Min: Story = {
  decorators: [
    withMockStore({
      mode: 'time',
      timeLimit: 10,
    }),
  ],
};
