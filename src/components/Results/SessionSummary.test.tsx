/**
 * SessionSummaryコンポーネントのテスト
 *
 * 練習セッション終了後の統計サマリー表示をテストします。
 * - セマンティックテスト: ユーザー視点での振る舞いと状態変化を検証
 * - スナップショットテスト: コンポーネント構造と見た目の一貫性を検証
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { SessionResult } from '../../types/SessionResult';
import { SessionSummary } from './SessionSummary';

/**
 * テスト用定数
 */
const TEST_CONSTANTS = {
  // 統計値
  STATS: {
    CORRECT_15: 15,
    CORRECT_18: 18,
    CORRECT_20: 20,
    TOTAL_20: 20,
    TOTAL_25: 25,
    TOTAL_30: 30,
    CURRENT_STREAK_3: 3,
    CURRENT_STREAK_5: 5,
    BEST_STREAK_5: 5,
    BEST_STREAK_7: 7,
    BEST_STREAK_10: 10,
  },
  // 時間（秒）
  TIME: {
    ELAPSED_125_SEC: 125, // 2:05
    ELAPSED_180_SEC: 180, // 3:00
    ELAPSED_605_SEC: 605, // 10:05
  },
  // 設定値
  CONFIG: {
    STD_DEV_50: 50, // 初心者
    STD_DEV_30: 30, // 中級者
    STD_DEV_15: 15, // 上級者
    STD_DEV_8: 8, // エキスパート
    STD_DEV_25: 25, // カスタム（プリセットにない値）
    STARTING_SCORE_501: 501,
    STARTING_SCORE_701: 701,
    STARTING_SCORE_0: 0,
  },
  // 表示文字列
  DISPLAY: {
    ACCURACY_60_0: '60.0%',
    ACCURACY_72_0: '72.0%',
    ACCURACY_75_0: '75.0%',
    ACCURACY_100_0: '100.0%',
    TIME_2_05: '2:05',
    TIME_3_00: '3:00',
    TIME_10_05: '10:05',
    DIFFICULTY_BEGINNER: '初心者',
    DIFFICULTY_INTERMEDIATE: '中級者',
    DIFFICULTY_ADVANCED: '上級者',
    DIFFICULTY_EXPERT: 'エキスパート',
    DIFFICULTY_CUSTOM_25: '25mm',
    FINISH_COMPLETED: '完了',
    FINISH_TIMEOUT: '時間切れ',
    FINISH_MANUAL: '手動終了',
    FINISH_GAME_FINISHED: 'ゲームクリア',
    TARGET_AUTO: '自動',
    TARGET_T20: 'T20',
    TARGET_D20: 'D20',
    TARGET_BULL: 'BULL',
  },
} as const;

/**
 * SessionResultのモックデータ生成ヘルパー
 */
const createMockSessionResult = (overrides: Partial<SessionResult> = {}): SessionResult => ({
  config: {
    configId: 'preset-basic',
    configName: '基礎練習',
    description: '1投ごとに得点を答える基本モード',
    icon: '🎯',
    throwUnit: 1,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: TEST_CONSTANTS.CONFIG.STARTING_SCORE_0,
    stdDevMM: TEST_CONSTANTS.CONFIG.STD_DEV_30,
    isPreset: true,
  },
  sessionConfig: {
    mode: 'questions',
    questionCount: 20,
  },
  stats: {
    correct: TEST_CONSTANTS.STATS.CORRECT_15,
    total: TEST_CONSTANTS.STATS.TOTAL_20,
    currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_3,
    bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_5,
  },
  elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_125_SEC,
  completedAt: '2025-12-29T10:30:00.000Z',
  finishReason: 'completed',
  ...overrides,
});

describe('SessionSummary', () => {
  // ===============================================
  // セマンティックテスト: ユーザー視点の振る舞い検証
  // ===============================================

  describe('統計情報の表示', () => {
    test('総問題数が正しく表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_15,
          total: TEST_CONSTANTS.STATS.TOTAL_20,
          currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_3,
          bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_5,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const totalLabel = statItems.find((item) => item.textContent === '総問題数');
      expect(totalLabel).toBeInTheDocument();

      const totalValue = totalLabel?.nextElementSibling;
      expect(totalValue?.textContent).toBe('20');
    });

    test('正解数が正しく表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_18,
          total: TEST_CONSTANTS.STATS.TOTAL_25,
          currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_5,
          bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_7,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const correctLabel = statItems.find((item) => item.textContent === '正解数');
      expect(correctLabel).toBeInTheDocument();

      const correctValue = correctLabel?.nextElementSibling;
      expect(correctValue?.textContent).toBe('18');
    });

    test('正答率が小数点1位で表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_15,
          total: TEST_CONSTANTS.STATS.TOTAL_20,
          currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_3,
          bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_5,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const accuracyLabel = statItems.find((item) => item.textContent === '正答率');
      expect(accuracyLabel).toBeInTheDocument();

      const accuracyValue = accuracyLabel?.nextElementSibling;
      expect(accuracyValue?.textContent).toBe(TEST_CONSTANTS.DISPLAY.ACCURACY_75_0);
    });

    test('100%の正答率が正しく表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_20,
          total: TEST_CONSTANTS.STATS.TOTAL_20,
          currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_5,
          bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_10,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const accuracyLabel = statItems.find((item) => item.textContent === '正答率');
      const accuracyValue = accuracyLabel?.nextElementSibling;
      expect(accuracyValue?.textContent).toBe(TEST_CONSTANTS.DISPLAY.ACCURACY_100_0);
    });

    test('最高連続正解数が正しく表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_15,
          total: TEST_CONSTANTS.STATS.TOTAL_20,
          currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_3,
          bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_7,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const streakLabel = statItems.find((item) => item.textContent === '最高連続正解');
      expect(streakLabel).toBeInTheDocument();

      const streakValue = streakLabel?.nextElementSibling;
      expect(streakValue?.textContent).toBe('7');
    });
  });

  describe('経過時間の表示', () => {
    test('2分5秒が「2:05」形式で表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_125_SEC,
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const timeLabel = statItems.find((item) => item.textContent === '経過時間');
      expect(timeLabel).toBeInTheDocument();

      const timeValue = timeLabel?.nextElementSibling;
      expect(timeValue?.textContent).toBe(TEST_CONSTANTS.DISPLAY.TIME_2_05);
    });

    test('3分ちょうどが「3:00」形式で表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_180_SEC,
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const timeLabel = statItems.find((item) => item.textContent === '経過時間');
      const timeValue = timeLabel?.nextElementSibling;
      expect(timeValue?.textContent).toBe(TEST_CONSTANTS.DISPLAY.TIME_3_00);
    });

    test('10分5秒が「10:05」形式で表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_605_SEC,
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const timeLabel = statItems.find((item) => item.textContent === '経過時間');
      const timeValue = timeLabel?.nextElementSibling;
      expect(timeValue?.textContent).toBe(TEST_CONSTANTS.DISPLAY.TIME_10_05);
    });
  });

  describe('設定情報の表示', () => {
    test('プリセット名（アイコン付き）が表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          configId: 'preset-caller-basic',
          configName: 'コーラー基礎',
          description: '3投後の残り点数を答える',
          icon: '📢',
          throwUnit: 3,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: TEST_CONSTANTS.CONFIG.STARTING_SCORE_501,
          stdDevMM: TEST_CONSTANTS.CONFIG.STD_DEV_30,
          isPreset: true,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      expect(screen.getByText(/モード/i)).toBeInTheDocument();
      // アイコンと名前が含まれていることを確認
      expect(screen.getByText(/📢.*コーラー基礎/)).toBeInTheDocument();
    });

    test('難易度がプリセット名で表示される（初心者）', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          stdDevMM: TEST_CONSTANTS.CONFIG.STD_DEV_50,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/難易度/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.DIFFICULTY_BEGINNER);
    });

    test('難易度がプリセット名で表示される（中級者）', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          stdDevMM: TEST_CONSTANTS.CONFIG.STD_DEV_30,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/難易度/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.DIFFICULTY_INTERMEDIATE);
    });

    test('難易度がプリセット名で表示される（上級者）', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          stdDevMM: TEST_CONSTANTS.CONFIG.STD_DEV_15,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/難易度/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.DIFFICULTY_ADVANCED);
    });

    test('難易度がプリセット名で表示される（エキスパート）', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          stdDevMM: TEST_CONSTANTS.CONFIG.STD_DEV_8,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/難易度/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.DIFFICULTY_EXPERT);
    });

    test('カスタム難易度がmm単位で表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          stdDevMM: TEST_CONSTANTS.CONFIG.STD_DEV_25,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/難易度/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.DIFFICULTY_CUSTOM_25);
    });

    test('ターゲット未設定時に「自動」と表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          target: undefined,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/ターゲット/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.TARGET_AUTO);
    });

    test('ターゲット設定時にラベルが表示される（T20）', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          target: {
            type: 'TRIPLE',
            number: 20,
            label: 'T20',
          },
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/ターゲット/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.TARGET_T20);
    });

    test('ターゲット設定時にラベルが表示される（D20）', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          target: {
            type: 'DOUBLE',
            number: 20,
            label: 'D20',
          },
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/ターゲット/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.TARGET_D20);
    });

    test('ターゲット設定時にラベルが表示される（BULL）', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          target: {
            type: 'BULL',
            number: null,
            label: 'BULL',
          },
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/ターゲット/i).parentElement;
      expect(configSection?.textContent).toContain(TEST_CONSTANTS.DISPLAY.TARGET_BULL);
    });

    test('ターゲットにlabelがない場合、typeとnumberから構築される', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          target: {
            type: 'TRIPLE',
            number: 19,
            // label未指定
          },
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/ターゲット/i).parentElement;
      expect(configSection?.textContent).toContain('T19');
    });

    test('開始点数が0より大きい場合に表示される（501）', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          startingScore: TEST_CONSTANTS.CONFIG.STARTING_SCORE_501,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const configSection = screen.getByText(/開始点数/i);
      expect(configSection).toBeInTheDocument();
      expect(configSection.parentElement?.textContent).toContain('501');
    });

    test('開始点数が0の場合は表示されない', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          startingScore: TEST_CONSTANTS.CONFIG.STARTING_SCORE_0,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      expect(screen.queryByText(/開始点数/i)).not.toBeInTheDocument();
    });
  });

  describe('終了理由の表示分岐', () => {
    test('完了時に「完了」と表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        finishReason: 'completed',
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      expect(screen.getByText(/終了理由:/i)).toBeInTheDocument();
      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.FINISH_COMPLETED)).toBeInTheDocument();
    });

    test('タイムアウト時に「時間切れ」と表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        finishReason: 'timeout',
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      expect(screen.getByText(/終了理由:/i)).toBeInTheDocument();
      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.FINISH_TIMEOUT)).toBeInTheDocument();
    });

    test('手動終了時に「手動終了」と表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        finishReason: 'manual',
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      expect(screen.getByText(/終了理由:/i)).toBeInTheDocument();
      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.FINISH_MANUAL)).toBeInTheDocument();
    });

    test('ゲーム終了時に「ゲームクリア」と表示される', () => {
      // Arrange
      const result = createMockSessionResult({
        finishReason: 'game_finished',
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      expect(screen.getByText(/終了理由:/i)).toBeInTheDocument();
      expect(screen.getByText(TEST_CONSTANTS.DISPLAY.FINISH_GAME_FINISHED)).toBeInTheDocument();
    });
  });

  describe('正答率の計算', () => {
    test('正答率60%が正しく計算される', () => {
      // Arrange
      const result = createMockSessionResult({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_18,
          total: TEST_CONSTANTS.STATS.TOTAL_30,
          currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_3,
          bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_7,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const accuracyLabel = statItems.find((item) => item.textContent === '正答率');
      const accuracyValue = accuracyLabel?.nextElementSibling;
      expect(accuracyValue?.textContent).toBe(TEST_CONSTANTS.DISPLAY.ACCURACY_60_0);
    });

    test('正答率72%が正しく計算される（小数点切り捨て）', () => {
      // Arrange
      const result = createMockSessionResult({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_18,
          total: TEST_CONSTANTS.STATS.TOTAL_25,
          currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_3,
          bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_7,
        },
      });

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      const statItems = screen.getAllByRole('term');
      const accuracyLabel = statItems.find((item) => item.textContent === '正答率');
      const accuracyValue = accuracyLabel?.nextElementSibling;
      expect(accuracyValue?.textContent).toBe(TEST_CONSTANTS.DISPLAY.ACCURACY_72_0);
    });
  });

  describe('アクセシビリティ', () => {
    test('セクションにaria-labelが設定されている', () => {
      // Arrange
      const result = createMockSessionResult();

      // Act
      render(<SessionSummary result={result} />);

      // Assert
      expect(screen.getByRole('region', { name: 'セッション結果' })).toBeInTheDocument();
    });

    test('統計情報が定義リスト（dl）で構造化されている', () => {
      // Arrange
      const result = createMockSessionResult();

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      const definitionLists = container.querySelectorAll('dl');
      expect(definitionLists.length).toBeGreaterThan(0);
    });
  });

  // ===============================================
  // スナップショットテスト: 構造・見た目の検証
  // ===============================================

  describe('スナップショットテスト', () => {
    test('基本的なレンダリング結果が一致する', () => {
      // Arrange
      const result = createMockSessionResult();

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('完了理由が「completed」の場合の見た目が一致する', () => {
      // Arrange
      const result = createMockSessionResult({
        finishReason: 'completed',
      });

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('完了理由が「timeout」の場合の見た目が一致する', () => {
      // Arrange
      const result = createMockSessionResult({
        finishReason: 'timeout',
      });

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('完了理由が「manual」の場合の見た目が一致する', () => {
      // Arrange
      const result = createMockSessionResult({
        finishReason: 'manual',
      });

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('完了理由が「game_finished」の場合の見た目が一致する', () => {
      // Arrange
      const result = createMockSessionResult({
        finishReason: 'game_finished',
      });

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('100%の正答率の場合の見た目が一致する', () => {
      // Arrange
      const result = createMockSessionResult({
        stats: {
          correct: TEST_CONSTANTS.STATS.CORRECT_20,
          total: TEST_CONSTANTS.STATS.TOTAL_20,
          currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_5,
          bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_10,
        },
      });

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('開始点数が設定されている場合の見た目が一致する', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          startingScore: TEST_CONSTANTS.CONFIG.STARTING_SCORE_501,
        },
      });

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('ターゲットが設定されている場合の見た目が一致する', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          target: {
            type: 'TRIPLE',
            number: 20,
            label: 'T20',
          },
        },
      });

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('カスタム難易度の場合の見た目が一致する', () => {
      // Arrange
      const result = createMockSessionResult({
        config: {
          ...createMockSessionResult().config,
          stdDevMM: TEST_CONSTANTS.CONFIG.STD_DEV_25,
        },
      });

      // Act
      const { container } = render(<SessionSummary result={result} />);

      // Assert
      expect(container).toMatchSnapshot();
    });
  });
});
