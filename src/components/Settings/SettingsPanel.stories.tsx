import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { getDefaultConfig, PRESETS } from '../../stores/config/presets';
import { useGameStore } from '../../stores/gameStore';
import type { PracticeConfig } from '../../types';
import { SettingsPanel } from './SettingsPanel';

/**
 * 特定の設定でSettingsPanelをレンダリングするデコレーター
 */
const withConfig =
  (configOverrides: Partial<PracticeConfig> = {}, sessionConfigOverrides = {}) =>
  (Story: React.ComponentType) => {
    function StoryWrapper() {
      useEffect(() => {
        // マウント時に設定を適用
        useGameStore.setState((state) => ({
          config: { ...state.config, ...configOverrides },
          sessionConfig: { ...state.sessionConfig, ...sessionConfigOverrides },
        }));

        // アンマウント時にデフォルト設定に戻す
        return () => {
          useGameStore.setState({
            config: getDefaultConfig(),
            sessionConfig: {
              mode: 'questions',
              questionCount: 10,
              timeLimit: undefined,
            },
          });
        };
      }, [configOverrides, sessionConfigOverrides]);

      return <Story />;
    }

    return <StoryWrapper />;
  };

/**
 * プリセット設定でSettingsPanelをレンダリングするデコレーター
 */
const withPreset = (presetId: string) => (Story: React.ComponentType) => {
  function StoryWrapper() {
    useEffect(() => {
      // マウント時に特定のプリセットを設定
      const config = PRESETS[presetId];
      useGameStore.setState({ config });

      // アンマウント時にデフォルト設定に戻す
      return () => {
        useGameStore.setState({ config: getDefaultConfig() });
      };
    }, [presetId]);

    return <Story />;
  }

  return <StoryWrapper />;
};

const meta = {
  title: 'Settings/SettingsPanel',
  component: SettingsPanel,
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        height: '900px',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// プリセット設定のストーリー
// =============================================================================

export const BasicPreset: Story = {
  decorators: [withPreset('preset-basic')],
};

export const PlayerPreset: Story = {
  decorators: [withPreset('preset-player')],
};

export const CallerBasicPreset: Story = {
  decorators: [withPreset('preset-caller-basic')],
};

export const CallerCumulativePreset: Story = {
  decorators: [withPreset('preset-caller-cumulative')],
};

export const ComprehensivePreset: Story = {
  decorators: [withPreset('preset-comprehensive')],
};

// =============================================================================
// カスタム設定のストーリー
// =============================================================================

export const CustomSettings: Story = {
  decorators: [
    withConfig({
      configId: 'custom',
      configName: 'カスタム',
      isPreset: false,
      throwUnit: 3,
      questionType: 'both',
      judgmentTiming: 'cumulative',
      startingScore: 701,
      stdDevMM: 25,
    }),
  ],
};

// =============================================================================
// セッション設定のバリエーション
// =============================================================================

export const QuestionMode10: Story = {
  decorators: [
    withConfig(
      {},
      {
        mode: 'questions',
        questionCount: 10,
        timeLimit: undefined,
      }
    ),
  ],
};

export const QuestionMode50: Story = {
  decorators: [
    withConfig(
      {},
      {
        mode: 'questions',
        questionCount: 50,
        timeLimit: undefined,
      }
    ),
  ],
};

export const TimeMode3Min: Story = {
  decorators: [
    withConfig(
      {},
      {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 3,
      }
    ),
  ],
};

export const TimeMode10Min: Story = {
  decorators: [
    withConfig(
      {},
      {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 10,
      }
    ),
  ],
};

// =============================================================================
// 難易度のバリエーション
// =============================================================================

export const BeginnerDifficulty: Story = {
  decorators: [
    withConfig({
      stdDevMM: 50,
    }),
  ],
};

export const ExpertDifficulty: Story = {
  decorators: [
    withConfig({
      stdDevMM: 8,
    }),
  ],
};

export const CustomDifficulty: Story = {
  decorators: [
    withConfig({
      stdDevMM: 25,
    }),
  ],
};

// =============================================================================
// 複合的なシナリオ
// =============================================================================

export const AdvancedPlayerScenario: Story = {
  decorators: [
    withConfig(
      {
        configId: 'custom',
        configName: 'カスタム',
        isPreset: false,
        throwUnit: 3,
        questionType: 'remaining',
        judgmentTiming: 'cumulative',
        startingScore: 501,
        stdDevMM: 15,
      },
      {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 5,
      }
    ),
  ],
};

export const BeginnerPracticeScenario: Story = {
  decorators: [
    withConfig(
      {
        configId: 'custom',
        configName: 'カスタム',
        isPreset: false,
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: 501,
        stdDevMM: 50,
      },
      {
        mode: 'questions',
        questionCount: 20,
        timeLimit: undefined,
      }
    ),
  ],
};
