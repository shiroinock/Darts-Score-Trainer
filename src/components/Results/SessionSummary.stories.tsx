import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SessionResult } from '../../types/SessionResult';
import { SessionSummary } from './SessionSummary';

const meta = {
  title: 'Results/SessionSummary',
  component: SessionSummary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'セッション終了後の統計サマリーコンポーネント。総問題数、正解数、正答率、連続正解記録、経過時間、設定情報を表示します。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '600px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 良好な成績（80%正答率）
 */
export const GoodPerformance: Story = {
  args: {
    result: {
      stats: {
        correct: 16,
        incorrect: 4,
        total: 20,
        currentStreak: 5,
        bestStreak: 8,
      },
      elapsedTime: 180, // 3分
      config: {
        icon: '📚',
        configName: '基礎練習',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        stdDevMM: 30,
        startingScore: 0,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 20,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'completed',
    } as SessionResult,
  },
};

/**
 * 完璧な成績（100%正答率、15連続正解）
 */
export const PerfectScore: Story = {
  args: {
    result: {
      stats: {
        correct: 15,
        incorrect: 0,
        total: 15,
        currentStreak: 15,
        bestStreak: 15,
      },
      elapsedTime: 120, // 2分
      config: {
        icon: '🎯',
        configName: 'プレイヤー練習',
        throwUnit: 3,
        questionType: 'score',
        judgmentTiming: 'independent',
        stdDevMM: 15,
        startingScore: 0,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 15,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'completed',
    } as SessionResult,
  },
};

/**
 * 低正答率（40%）
 */
export const LowAccuracy: Story = {
  args: {
    result: {
      stats: {
        correct: 4,
        incorrect: 6,
        total: 10,
        currentStreak: 0,
        bestStreak: 2,
      },
      elapsedTime: 240, // 4分
      config: {
        icon: '🎓',
        configName: 'コーラー基礎',
        throwUnit: 3,
        questionType: 'both',
        judgmentTiming: 'independent',
        stdDevMM: 50,
        startingScore: 501,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 10,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'completed',
    } as SessionResult,
  },
};

/**
 * 時間切れ終了
 */
export const TimeoutFinish: Story = {
  args: {
    result: {
      stats: {
        correct: 10,
        incorrect: 5,
        total: 15,
        currentStreak: 2,
        bestStreak: 6,
      },
      elapsedTime: 300, // 5分（制限時間）
      config: {
        icon: '📊',
        configName: 'コーラー累積',
        throwUnit: 3,
        questionType: 'both',
        judgmentTiming: 'cumulative',
        stdDevMM: 30,
        startingScore: 501,
      },
      sessionConfig: {
        mode: 'time',
        timeLimit: 5,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'timeout',
    } as SessionResult,
  },
};

/**
 * 手動終了
 */
export const ManualFinish: Story = {
  args: {
    result: {
      stats: {
        correct: 5,
        incorrect: 2,
        total: 7,
        currentStreak: 3,
        bestStreak: 3,
      },
      elapsedTime: 90, // 1分30秒
      config: {
        icon: '🔥',
        configName: '総合練習',
        throwUnit: 1,
        questionType: 'both',
        judgmentTiming: 'independent',
        stdDevMM: 30,
        startingScore: 501,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 20,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'manual',
    } as SessionResult,
  },
};

/**
 * ゲームクリア（501達成）
 */
export const GameFinished: Story = {
  args: {
    result: {
      stats: {
        correct: 25,
        incorrect: 3,
        total: 28,
        currentStreak: 10,
        bestStreak: 12,
      },
      elapsedTime: 420, // 7分
      config: {
        icon: '🎯',
        configName: 'プレイヤー練習',
        throwUnit: 3,
        questionType: 'remaining',
        judgmentTiming: 'independent',
        stdDevMM: 15,
        startingScore: 501,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 30,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'game_finished',
    } as SessionResult,
  },
};

/**
 * 701ゲーム（長時間セッション）
 */
export const Game701: Story = {
  args: {
    result: {
      stats: {
        correct: 40,
        incorrect: 10,
        total: 50,
        currentStreak: 8,
        bestStreak: 15,
      },
      elapsedTime: 900, // 15分
      config: {
        icon: '🔥',
        configName: '総合練習',
        throwUnit: 3,
        questionType: 'both',
        judgmentTiming: 'cumulative',
        stdDevMM: 30,
        startingScore: 701,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 50,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'completed',
    } as SessionResult,
  },
};

/**
 * エキスパートレベル（高難易度）
 */
export const ExpertLevel: Story = {
  args: {
    result: {
      stats: {
        correct: 12,
        incorrect: 8,
        total: 20,
        currentStreak: 4,
        bestStreak: 7,
      },
      elapsedTime: 300, // 5分
      config: {
        icon: '🎯',
        configName: 'プレイヤー練習',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        stdDevMM: 8, // エキスパート
        startingScore: 0,
      },
      sessionConfig: {
        mode: 'time',
        timeLimit: 5,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'timeout',
    } as SessionResult,
  },
};

/**
 * 初心者レベル（低難易度）
 */
export const BeginnerLevel: Story = {
  args: {
    result: {
      stats: {
        correct: 8,
        incorrect: 2,
        total: 10,
        currentStreak: 5,
        bestStreak: 6,
      },
      elapsedTime: 150, // 2分30秒
      config: {
        icon: '📚',
        configName: '基礎練習',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        stdDevMM: 50, // 初心者
        startingScore: 0,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: 10,
      },
      completedAt: new Date().toISOString(),
      finishReason: 'completed',
    } as SessionResult,
  },
};
