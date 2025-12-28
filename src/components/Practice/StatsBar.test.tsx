/**
 * StatsBarコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../../stores/gameStore';
import { StatsBar } from './StatsBar';

/**
 * テスト用定数
 */
const TEST_CONSTANTS = {
  // 統計値
  STATS: {
    CORRECT_5: 5,
    CORRECT_7: 7,
    CORRECT_8: 8,
    TOTAL_10: 10,
    TOTAL_7: 7,
    TOTAL_20: 20,
    STREAK_2: 2,
    STREAK_3: 3,
    STREAK_5: 5,
  },
  // 時間（秒）
  TIME: {
    ELAPSED_120_SEC: 120, // 2分経過
    ELAPSED_125_SEC: 125, // 2分5秒経過
    ELAPSED_200_SEC: 200, // 3分20秒経過
    LIMIT_3_MIN: 3,
    LIMIT_5_MIN: 5,
  },
  // 点数
  SCORE: {
    STARTING_501: 501,
    REMAINING_381: 381,
    STARTING_0: 0,
  },
  // 問題数
  QUESTIONS: {
    COUNT_10: 10,
    COUNT_20: 20,
    REMAINING_13: 13,
    REMAINING_0: 0,
  },
  // 表示文字列
  DISPLAY: {
    ACCURACY_70: '70.0%',
    ACCURACY_50: '50.0%',
    ACCURACY_0: '0.0%',
    TIME_3_00: '3:00',
    TIME_0_55: '0:55',
    TIME_0_00: '0:00',
    SCORE_5_10: '5 / 10',
    QUESTIONS_13: '13問',
    QUESTIONS_0: '0問',
  },
  // 標準偏差（mm）
  STD_DEV: {
    DEFAULT: 30,
  },
} as const;

describe('StatsBar', () => {
  beforeEach(() => {
    // ストアをリセット
    useGameStore.setState({
      stats: {
        correct: 0,
        total: 0,
        currentStreak: 0,
        bestStreak: 0,
      },
      sessionConfig: {
        mode: 'questions',
        questionCount: TEST_CONSTANTS.QUESTIONS.COUNT_10,
      },
      elapsedTime: 0,
      remainingScore: TEST_CONSTANTS.SCORE.STARTING_501,
      config: {
        configId: 'preset-basic',
        configName: '基礎練習',
        description: '1投ごとに得点を答える基本モード',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
        stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
        target: undefined,
        icon: '🎯',
        isPreset: true,
      },
    });
  });

  describe('基本表示', () => {
    it('正解数と総問題数が表示される', () => {
      useGameStore.setState({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_5,
          total: TEST_CONSTANTS.STATS.TOTAL_10,
          currentStreak: TEST_CONSTANTS.STATS.STREAK_2,
          bestStreak: TEST_CONSTANTS.STATS.STREAK_3,
        },
      });

      render(<StatsBar />);

      expect(screen.getByText('正解数')).toBeInTheDocument();
      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.SCORE_5_10)).toBeInTheDocument();
    });

    it('正答率が表示される（パーセント表記）', () => {
      useGameStore.setState({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_7,
          total: TEST_CONSTANTS.STATS.TOTAL_10,
          currentStreak: TEST_CONSTANTS.STATS.STREAK_2,
          bestStreak: TEST_CONSTANTS.STATS.STREAK_3,
        },
      });

      render(<StatsBar />);

      expect(screen.getByText('正答率')).toBeInTheDocument();
      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.ACCURACY_70)).toBeInTheDocument();
    });

    it('連続正解数が表示される', () => {
      useGameStore.setState({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_5,
          total: TEST_CONSTANTS.STATS.TOTAL_10,
          currentStreak: TEST_CONSTANTS.STATS.STREAK_3,
          bestStreak: TEST_CONSTANTS.STATS.STREAK_5,
        },
      });

      render(<StatsBar />);

      expect(screen.getByText('連続正解')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('問題数が0の場合、正答率は0%と表示される', () => {
      useGameStore.setState({
        stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
      });

      render(<StatsBar />);

      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.ACCURACY_0)).toBeInTheDocument();
    });
  });

  describe('問題数モード', () => {
    it('残り問題数が表示される', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'questions',
          questionCount: TEST_CONSTANTS.QUESTIONS.COUNT_20,
        },
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_5,
          total: TEST_CONSTANTS.STATS.TOTAL_7,
          currentStreak: TEST_CONSTANTS.STATS.STREAK_2,
          bestStreak: TEST_CONSTANTS.STATS.STREAK_3,
        },
      });

      render(<StatsBar />);

      expect(screen.getByText('残り問題数')).toBeInTheDocument();
      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.QUESTIONS_13)).toBeInTheDocument();
    });

    it('全問題を解答した場合、残り0問と表示される', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'questions',
          questionCount: TEST_CONSTANTS.QUESTIONS.COUNT_10,
        },
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_8,
          total: TEST_CONSTANTS.STATS.TOTAL_10,
          currentStreak: 0,
          bestStreak: TEST_CONSTANTS.STATS.STREAK_5,
        },
      });

      render(<StatsBar />);

      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.QUESTIONS_0)).toBeInTheDocument();
    });
  });

  describe('時間制限モード', () => {
    it('残り時間が表示される（分:秒形式）', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: TEST_CONSTANTS.TIME.LIMIT_5_MIN,
        },
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_120_SEC, // 2分経過
      });

      render(<StatsBar />);

      expect(screen.getByText('残り時間')).toBeInTheDocument();
      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.TIME_3_00)).toBeInTheDocument(); // 5分 - 2分 = 3分
    });

    it('残り時間が1分未満の場合も正しく表示される', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: TEST_CONSTANTS.TIME.LIMIT_3_MIN,
        },
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_125_SEC, // 2分5秒経過
      });

      render(<StatsBar />);

      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.TIME_0_55)).toBeInTheDocument(); // 3分 - 2分5秒 = 55秒
    });

    it('時間切れの場合、0:00と表示される', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: TEST_CONSTANTS.TIME.LIMIT_3_MIN,
        },
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_200_SEC, // 3分20秒経過（制限超過）
      });

      render(<StatsBar />);

      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.TIME_0_00)).toBeInTheDocument();
    });
  });

  describe('01モード（残り点数表示）', () => {
    it('startingScoreが0より大きい場合、残り点数が表示される', () => {
      useGameStore.setState({
        config: {
          configId: 'preset-caller-basic',
          configName: 'コーラー基礎',
          description: '3投ごとに残り点数を答えるモード',
          throwUnit: 3,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎤',
          isPreset: true,
        },
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_381,
      });

      render(<StatsBar />);

      expect(screen.getByText('残り点数')).toBeInTheDocument();
      expect(screen.getByText('381')).toBeInTheDocument();
    });

    it('startingScoreが0の場合、残り点数は表示されない', () => {
      useGameStore.setState({
        config: {
          configId: 'preset-basic',
          configName: '基礎練習',
          description: '1投ごとに得点を答える基本モード',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎯',
          isPreset: true,
        },
        remainingScore: TEST_CONSTANTS.SCORE.STARTING_0,
      });

      render(<StatsBar />);

      expect(screen.queryByText('残り点数')).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('role="status"が設定されている', () => {
      render(<StatsBar />);

      const statsBar = screen.getByRole('status');
      expect(statsBar).toBeInTheDocument();
    });

    it('セマンティックHTML（dl/dt/dd）を使用している', () => {
      useGameStore.setState({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_5,
          total: TEST_CONSTANTS.STATS.TOTAL_10,
          currentStreak: TEST_CONSTANTS.STATS.STREAK_2,
          bestStreak: TEST_CONSTANTS.STATS.STREAK_3,
        },
      });

      const { container } = render(<StatsBar />);

      // dl要素（definition list）が使用されている
      const dlElements = container.querySelectorAll('dl.stats-bar__item');
      expect(dlElements.length).toBeGreaterThan(0);

      // dt要素（definition term）が使用されている
      const dtElements = container.querySelectorAll('dt.stats-bar__label');
      expect(dtElements.length).toBeGreaterThan(0);

      // dd要素（definition description）が使用されている
      const ddElements = container.querySelectorAll('dd.stats-bar__value');
      expect(ddElements.length).toBeGreaterThan(0);
    });
  });
});
