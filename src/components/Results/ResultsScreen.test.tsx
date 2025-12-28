/**
 * ResultsScreenコンポーネントのテスト
 *
 * 練習結果画面の振る舞いを検証します。
 * - SessionSummaryコンポーネントの表示
 * - 「同じ設定で再挑戦」ボタンのクリックでstartPractice()が呼ばれること
 * - 「設定を変更」ボタンのクリックでresetToSetup()が呼ばれること
 * - gameState !== 'results'の場合の防御的表示
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useGameStore } from '../../stores/gameStore';
import type { Stats } from '../../types';
import type { PracticeConfig } from '../../types/PracticeConfig';
import type { SessionConfig } from '../../types/SessionConfig';
import { ResultsScreen } from './ResultsScreen';

/**
 * テスト用定数
 */
const TEST_CONSTANTS = {
  // スコア
  SCORE: {
    STARTING_501: 501,
    STARTING_0: 0,
  },
  // 統計値
  STATS: {
    CORRECT_15: 15,
    TOTAL_20: 20,
    CURRENT_STREAK_3: 3,
    BEST_STREAK_5: 5,
  },
  // 時間（秒）
  TIME: {
    ELAPSED_125_SEC: 125, // 2分5秒
  },
  // 標準偏差（mm）
  STD_DEV: {
    DEFAULT_30: 30,
  },
} as const;

/**
 * テスト用PracticeConfig生成ヘルパー
 */
const createMockConfig = (overrides: Partial<PracticeConfig> = {}): PracticeConfig => ({
  configId: 'preset-basic',
  configName: '基礎練習',
  description: '1投ごとに得点を答える基本モード',
  throwUnit: 1,
  questionType: 'score',
  judgmentTiming: 'independent',
  startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
  stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT_30,
  target: undefined,
  icon: '🎯',
  isPreset: true,
  ...overrides,
});

/**
 * テスト用SessionConfig生成ヘルパー
 */
const createMockSessionConfig = (overrides: Partial<SessionConfig> = {}): SessionConfig => ({
  mode: 'questions',
  questionCount: 20,
  ...overrides,
});

/**
 * テスト用Stats生成ヘルパー
 */
const createMockStats = (overrides: Partial<Stats> = {}): Stats => ({
  correct: TEST_CONSTANTS.STATS.CORRECT_15,
  total: TEST_CONSTANTS.STATS.TOTAL_20,
  currentStreak: TEST_CONSTANTS.STATS.CURRENT_STREAK_3,
  bestStreak: TEST_CONSTANTS.STATS.BEST_STREAK_5,
  ...overrides,
});

describe('ResultsScreen', () => {
  beforeEach(() => {
    // ストアをリセット
    useGameStore.setState({
      gameState: 'results',
      config: createMockConfig(),
      sessionConfig: createMockSessionConfig(),
      stats: createMockStats(),
      elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_125_SEC,
    });

    // モックをクリア
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===============================================
  // セマンティックテスト: ユーザー視点の振る舞い検証
  // ===============================================

  describe('子コンポーネントの表示', () => {
    test('SessionSummaryコンポーネントが表示される', () => {
      // Arrange & Act
      render(<ResultsScreen />);

      // Assert
      // SessionSummaryは aria-label="セッション結果" を持つsection要素
      const summarySection = screen.getByRole('region', { name: 'セッション結果' });
      expect(summarySection).toBeInTheDocument();
    });

    test('SessionSummaryに正しい結果データが渡される', () => {
      // Arrange
      const mockStats = createMockStats({
        correct: TEST_CONSTANTS.STATS.CORRECT_15,
        total: TEST_CONSTANTS.STATS.TOTAL_20,
      });
      useGameStore.setState({
        stats: mockStats,
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_125_SEC,
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      // SessionSummaryが表示する統計情報を確認
      const statItems = screen.getAllByRole('term');
      const totalLabel = statItems.find((item) => item.textContent === '総問題数');
      expect(totalLabel).toBeInTheDocument();

      const totalValue = totalLabel?.nextElementSibling;
      expect(totalValue?.textContent).toBe('20');

      const correctLabel = statItems.find((item) => item.textContent === '正解数');
      const correctValue = correctLabel?.nextElementSibling;
      expect(correctValue?.textContent).toBe('15');
    });
  });

  describe('「同じ設定で再挑戦」ボタンのアクション', () => {
    test('ボタンが表示される', () => {
      // Arrange & Act
      render(<ResultsScreen />);

      // Assert
      const retryButton = screen.getByRole('button', { name: '同じ設定で再挑戦' });
      expect(retryButton).toBeInTheDocument();
    });

    test('ボタンをクリックするとstartPractice()が呼ばれる', async () => {
      // Arrange
      const user = userEvent.setup();
      const startPracticeMock = vi.fn();

      useGameStore.setState({
        startPractice: startPracticeMock,
      });

      render(<ResultsScreen />);

      // Act
      const retryButton = screen.getByRole('button', { name: '同じ設定で再挑戦' });
      await user.click(retryButton);

      // Assert
      expect(startPracticeMock).toHaveBeenCalledTimes(1);
    });

    test('ボタンに適切なaria-labelが設定されている', () => {
      // Arrange & Act
      render(<ResultsScreen />);

      // Assert
      const retryButton = screen.getByRole('button', { name: '同じ設定で再挑戦' });
      expect(retryButton).toHaveAttribute('aria-label', '同じ設定で再挑戦');
    });
  });

  describe('「設定を変更」ボタンのアクション', () => {
    test('ボタンが表示される', () => {
      // Arrange & Act
      render(<ResultsScreen />);

      // Assert
      const settingsButton = screen.getByRole('button', { name: '設定を変更' });
      expect(settingsButton).toBeInTheDocument();
    });

    test('ボタンをクリックするとresetToSetup()が呼ばれる', async () => {
      // Arrange
      const user = userEvent.setup();
      const resetToSetupMock = vi.fn();

      useGameStore.setState({
        resetToSetup: resetToSetupMock,
      });

      render(<ResultsScreen />);

      // Act
      const settingsButton = screen.getByRole('button', { name: '設定を変更' });
      await user.click(settingsButton);

      // Assert
      expect(resetToSetupMock).toHaveBeenCalledTimes(1);
    });

    test('ボタンに適切なaria-labelが設定されている', () => {
      // Arrange & Act
      render(<ResultsScreen />);

      // Assert
      const settingsButton = screen.getByRole('button', { name: '設定を変更' });
      expect(settingsButton).toHaveAttribute('aria-label', '設定を変更');
    });
  });

  describe('gameStateに応じた表示分岐', () => {
    test('gameState="results"の場合、結果画面が表示される', () => {
      // Arrange
      useGameStore.setState({
        gameState: 'results',
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      expect(screen.getByRole('region', { name: 'セッション結果' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '同じ設定で再挑戦' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '設定を変更' })).toBeInTheDocument();
    });

    test('gameState="setup"の場合、「結果がありません」と表示される', () => {
      // Arrange
      useGameStore.setState({
        gameState: 'setup',
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      expect(screen.getByText('結果がありません')).toBeInTheDocument();
      // SessionSummaryとボタンは表示されない
      expect(screen.queryByRole('region', { name: 'セッション結果' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '同じ設定で再挑戦' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '設定を変更' })).not.toBeInTheDocument();
    });

    test('gameState="practicing"の場合、「結果がありません」と表示される', () => {
      // Arrange
      useGameStore.setState({
        gameState: 'practicing',
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      expect(screen.getByText('結果がありません')).toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'セッション結果' })).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('メインコンテンツがmain要素で構造化されている', () => {
      // Arrange & Act
      const { container } = render(<ResultsScreen />);

      // Assert
      const main = container.querySelector('main.results-screen__main');
      expect(main).toBeInTheDocument();
    });

    test('フッターがfooter要素で構造化されている', () => {
      // Arrange & Act
      const { container } = render(<ResultsScreen />);

      // Assert
      const footer = container.querySelector('footer.results-screen__footer');
      expect(footer).toBeInTheDocument();
    });

    test('ボタンに適切なtype属性が設定されている', () => {
      // Arrange & Act
      render(<ResultsScreen />);

      // Assert
      const retryButton = screen.getByRole('button', { name: '同じ設定で再挑戦' });
      expect(retryButton).toHaveAttribute('type', 'button');

      const settingsButton = screen.getByRole('button', { name: '設定を変更' });
      expect(settingsButton).toHaveAttribute('type', 'button');
    });
  });

  describe('様々な終了理由でのSessionResultの構築', () => {
    test('finishReasonが"manual"として設定される', () => {
      // Arrange
      useGameStore.setState({
        gameState: 'results',
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      // SessionResultのfinishReasonは現在常に"manual"
      // TODO: 実際の終了理由を記録する機能が実装されたら更新
      expect(screen.getByText('手動終了')).toBeInTheDocument();
    });

    test('configとsessionConfigがSessionResultに含まれる', () => {
      // Arrange
      const mockConfig = createMockConfig({
        configName: 'コーラー基礎',
        icon: '📢',
        startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
      });
      const mockSessionConfig = createMockSessionConfig({
        mode: 'time',
        timeLimit: 3,
      });

      useGameStore.setState({
        config: mockConfig,
        sessionConfig: mockSessionConfig,
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      // SessionSummaryにconfigの情報が表示されることを確認
      expect(screen.getByText(/📢.*コーラー基礎/)).toBeInTheDocument();
      expect(screen.getByText(/開始点数/i)).toBeInTheDocument();
      expect(screen.getByText('501')).toBeInTheDocument();
    });
  });

  describe('様々な練習設定での表示', () => {
    test('開始点数が501の場合、SessionSummaryに表示される', () => {
      // Arrange
      const mockConfig = createMockConfig({
        startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
      });

      useGameStore.setState({
        config: mockConfig,
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      expect(screen.getByText(/開始点数/i)).toBeInTheDocument();
      expect(screen.getByText('501')).toBeInTheDocument();
    });

    test('開始点数が0の場合、開始点数は表示されない', () => {
      // Arrange
      const mockConfig = createMockConfig({
        startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
      });

      useGameStore.setState({
        config: mockConfig,
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      expect(screen.queryByText(/開始点数/i)).not.toBeInTheDocument();
    });

    test('ターゲット設定ありの場合、SessionSummaryに表示される', () => {
      // Arrange
      const mockConfig = createMockConfig({
        target: {
          type: 'TRIPLE',
          number: 20,
          label: 'T20',
        },
      });

      useGameStore.setState({
        config: mockConfig,
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      const configSection = screen.getByText(/ターゲット/i).parentElement;
      expect(configSection?.textContent).toContain('T20');
    });

    test('ターゲット設定なしの場合、「自動」と表示される', () => {
      // Arrange
      const mockConfig = createMockConfig({
        target: undefined,
      });

      useGameStore.setState({
        config: mockConfig,
      });

      // Act
      render(<ResultsScreen />);

      // Assert
      const configSection = screen.getByText(/ターゲット/i).parentElement;
      expect(configSection?.textContent).toContain('自動');
    });
  });

  // ===============================================
  // スナップショットテスト: 構造・見た目の検証
  // ===============================================

  describe('スナップショットテスト', () => {
    test('基本的なレンダリング結果が一致する', () => {
      // Arrange & Act
      const { container } = render(<ResultsScreen />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('gameState="setup"の見た目が一致する', () => {
      // Arrange
      useGameStore.setState({
        gameState: 'setup',
      });

      // Act
      const { container } = render(<ResultsScreen />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('gameState="practicing"の見た目が一致する', () => {
      // Arrange
      useGameStore.setState({
        gameState: 'practicing',
      });

      // Act
      const { container } = render(<ResultsScreen />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('開始点数が設定されている場合の見た目が一致する', () => {
      // Arrange
      useGameStore.setState({
        config: createMockConfig({
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
        }),
      });

      // Act
      const { container } = render(<ResultsScreen />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('ターゲットが設定されている場合の見た目が一致する', () => {
      // Arrange
      useGameStore.setState({
        config: createMockConfig({
          target: {
            type: 'TRIPLE',
            number: 20,
            label: 'T20',
          },
        }),
      });

      // Act
      const { container } = render(<ResultsScreen />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('時間制限モードの場合の見た目が一致する', () => {
      // Arrange
      useGameStore.setState({
        sessionConfig: createMockSessionConfig({
          mode: 'time',
          timeLimit: 3,
        }),
      });

      // Act
      const { container } = render(<ResultsScreen />);

      // Assert
      expect(container).toMatchSnapshot();
    });
  });
});
