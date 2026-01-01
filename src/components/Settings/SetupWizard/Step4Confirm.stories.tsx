import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { PRESETS } from '../../../stores/config/presets';
import { useGameStore } from '../../../stores/gameStore';
import type { SessionConfig } from '../../../types';
import { Step4Confirm } from './Step4Confirm';

interface StoreOptions {
  configId?: string;
  sessionConfig?: SessionConfig;
}

const withMockStore =
  (options: StoreOptions = {}) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        const { configId = 'preset-basic', sessionConfig = { mode: 'count', count: 10 } } = options;
        const config = PRESETS[configId];
        useGameStore.setState({ config, sessionConfig });

        return () => {
          useGameStore.setState({
            config: PRESETS['preset-basic'],
            sessionConfig: { mode: 'count', count: 10 },
          });
        };
      }, [options]);

      return <Story />;
    }

    return <StoryWrapper />;
  };

const meta = {
  title: 'Settings/SetupWizard/Step4Confirm',
  component: Step4Confirm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ウィザードステップ4: 確認画面。設定内容を確認し、詳細設定を調整してから練習を開始できます。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '700px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Step4Confirm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態（基礎練習、10問）
 */
export const Default: Story = {
  decorators: [
    withMockStore({
      configId: 'preset-basic',
      sessionConfig: { mode: 'count', count: 10 },
    }),
  ],
};

/**
 * プレイヤー練習、20問
 */
export const PlayerPractice20Questions: Story = {
  decorators: [
    withMockStore({
      configId: 'preset-player',
      sessionConfig: { mode: 'count', count: 20 },
    }),
  ],
};

/**
 * コーラー基礎、3分タイマー
 */
export const CallerBasic3Minutes: Story = {
  decorators: [
    withMockStore({
      configId: 'preset-caller-basic',
      sessionConfig: { mode: 'timer', seconds: 180 },
    }),
  ],
};

/**
 * コーラー累積、5分タイマー
 */
export const CallerCumulative5Minutes: Story = {
  decorators: [
    withMockStore({
      configId: 'preset-caller-cumulative',
      sessionConfig: { mode: 'timer', seconds: 300 },
    }),
  ],
};

/**
 * 総合練習、エンドレスモード
 */
export const ComprehensiveEndless: Story = {
  decorators: [
    withMockStore({
      configId: 'preset-comprehensive',
      sessionConfig: { mode: 'endless' },
    }),
  ],
};

/**
 * 基礎練習、1分タイマー（短時間練習）
 */
export const BasicPractice1Minute: Story = {
  decorators: [
    withMockStore({
      configId: 'preset-basic',
      sessionConfig: { mode: 'timer', seconds: 60 },
    }),
  ],
};
