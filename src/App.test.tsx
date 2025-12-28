/**
 * Appコンポーネントのテスト
 *
 * ゲーム状態（gameState）に応じた画面切り替えを検証します。
 * - setup: SettingsPanel（設定画面）
 * - practicing: PracticeScreen（練習画面）
 * - results: ResultsScreen（結果画面）
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App';
import type { GameState } from './types';

// モック用の型定義
type MockState = {
  gameState: GameState;
};

// 設定モックのファクトリー関数
const createMockState = (overrides?: Partial<MockState>): MockState => ({
  gameState: 'setup',
  ...overrides,
});

// useGameStoreのモック
let mockState: MockState = createMockState();

vi.mock('./stores/gameStore', () => ({
  useGameStore: (selector: (state: MockState) => unknown) => {
    return selector(mockState);
  },
}));

// 子コンポーネントのモック
vi.mock('./components/Settings/SettingsPanel', () => ({
  SettingsPanel: () => <div data-testid="settings-panel">SettingsPanel</div>,
}));

vi.mock('./components/Practice/PracticeScreen', () => ({
  PracticeScreen: () => <div data-testid="practice-screen">PracticeScreen</div>,
}));

vi.mock('./components/Results/ResultsScreen', () => ({
  ResultsScreen: () => <div data-testid="results-screen">ResultsScreen</div>,
}));

describe('App', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
    // デフォルト状態（setup）に戻す
    mockState = createMockState();
  });

  describe('セマンティックテスト - gameStateによる画面切り替え', () => {
    describe('setup状態', () => {
      test('gameStateが"setup"の時、SettingsPanelがレンダリングされる', () => {
        // Arrange
        mockState.gameState = 'setup';

        // Act
        render(<App />);

        // Assert
        expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
      });

      test('gameStateが"setup"の時、PracticeScreenはレンダリングされない', () => {
        // Arrange
        mockState.gameState = 'setup';

        // Act
        render(<App />);

        // Assert
        expect(screen.queryByTestId('practice-screen')).not.toBeInTheDocument();
      });

      test('gameStateが"setup"の時、ResultsScreenはレンダリングされない', () => {
        // Arrange
        mockState.gameState = 'setup';

        // Act
        render(<App />);

        // Assert
        expect(screen.queryByTestId('results-screen')).not.toBeInTheDocument();
      });
    });

    describe('practicing状態', () => {
      test('gameStateが"practicing"の時、PracticeScreenがレンダリングされる', () => {
        // Arrange
        mockState.gameState = 'practicing';

        // Act
        render(<App />);

        // Assert
        expect(screen.getByTestId('practice-screen')).toBeInTheDocument();
      });

      test('gameStateが"practicing"の時、SettingsPanelはレンダリングされない', () => {
        // Arrange
        mockState.gameState = 'practicing';

        // Act
        render(<App />);

        // Assert
        expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
      });

      test('gameStateが"practicing"の時、ResultsScreenはレンダリングされない', () => {
        // Arrange
        mockState.gameState = 'practicing';

        // Act
        render(<App />);

        // Assert
        expect(screen.queryByTestId('results-screen')).not.toBeInTheDocument();
      });
    });

    describe('results状態', () => {
      test('gameStateが"results"の時、ResultsScreenがレンダリングされる', () => {
        // Arrange
        mockState.gameState = 'results';

        // Act
        render(<App />);

        // Assert
        expect(screen.getByTestId('results-screen')).toBeInTheDocument();
      });

      test('gameStateが"results"の時、SettingsPanelはレンダリングされない', () => {
        // Arrange
        mockState.gameState = 'results';

        // Act
        render(<App />);

        // Assert
        expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
      });

      test('gameStateが"results"の時、PracticeScreenはレンダリングされない', () => {
        // Arrange
        mockState.gameState = 'results';

        // Act
        render(<App />);

        // Assert
        expect(screen.queryByTestId('practice-screen')).not.toBeInTheDocument();
      });
    });
  });

  describe('セマンティックテスト - 画面遷移シナリオ', () => {
    test('setup → practicing への状態遷移時、画面が正しく切り替わる', () => {
      // Arrange
      mockState.gameState = 'setup';
      const { rerender } = render(<App />);

      // Act: setup画面を確認
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();

      // Act: practicing状態に変更
      mockState.gameState = 'practicing';
      rerender(<App />);

      // Assert: practicing画面に切り替わる
      expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('practice-screen')).toBeInTheDocument();
    });

    test('practicing → results への状態遷移時、画面が正しく切り替わる', () => {
      // Arrange
      mockState.gameState = 'practicing';
      const { rerender } = render(<App />);

      // Act: practicing画面を確認
      expect(screen.getByTestId('practice-screen')).toBeInTheDocument();

      // Act: results状態に変更
      mockState.gameState = 'results';
      rerender(<App />);

      // Assert: results画面に切り替わる
      expect(screen.queryByTestId('practice-screen')).not.toBeInTheDocument();
      expect(screen.getByTestId('results-screen')).toBeInTheDocument();
    });

    test('results → setup への状態遷移時、画面が正しく切り替わる', () => {
      // Arrange
      mockState.gameState = 'results';
      const { rerender } = render(<App />);

      // Act: results画面を確認
      expect(screen.getByTestId('results-screen')).toBeInTheDocument();

      // Act: setup状態に変更
      mockState.gameState = 'setup';
      rerender(<App />);

      // Assert: setup画面に切り替わる
      expect(screen.queryByTestId('results-screen')).not.toBeInTheDocument();
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
    });

    test('setup → practicing → results → setup の完全サイクル', () => {
      // Arrange
      mockState.gameState = 'setup';
      const { rerender } = render(<App />);

      // Assert: setup画面
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();

      // Act & Assert: practicing画面へ遷移
      mockState.gameState = 'practicing';
      rerender(<App />);
      expect(screen.getByTestId('practice-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();

      // Act & Assert: results画面へ遷移
      mockState.gameState = 'results';
      rerender(<App />);
      expect(screen.getByTestId('results-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('practice-screen')).not.toBeInTheDocument();

      // Act & Assert: setup画面へ戻る
      mockState.gameState = 'setup';
      rerender(<App />);
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('results-screen')).not.toBeInTheDocument();
    });
  });

  describe('セマンティックテスト - DOM構造', () => {
    test('ルート要素に"app"クラスが適用される（setup状態）', () => {
      // Arrange
      mockState.gameState = 'setup';

      // Act
      const { container } = render(<App />);

      // Assert
      const appDiv = container.querySelector('.app');
      expect(appDiv).toBeInTheDocument();
      expect(appDiv).toContainElement(screen.getByTestId('settings-panel'));
    });

    test('ルート要素に"app"クラスが適用される（practicing状態）', () => {
      // Arrange
      mockState.gameState = 'practicing';

      // Act
      const { container } = render(<App />);

      // Assert
      const appDiv = container.querySelector('.app');
      expect(appDiv).toBeInTheDocument();
      expect(appDiv).toContainElement(screen.getByTestId('practice-screen'));
    });

    test('ルート要素に"app"クラスが適用される（results状態）', () => {
      // Arrange
      mockState.gameState = 'results';

      // Act
      const { container } = render(<App />);

      // Assert
      const appDiv = container.querySelector('.app');
      expect(appDiv).toBeInTheDocument();
      expect(appDiv).toContainElement(screen.getByTestId('results-screen'));
    });

    test('各状態で1つの子コンポーネントのみがレンダリングされる', () => {
      // setup状態
      mockState.gameState = 'setup';
      const { container: container1, rerender } = render(<App />);
      let appDiv = container1.querySelector('.app');
      expect(appDiv?.children).toHaveLength(1);

      // practicing状態
      mockState.gameState = 'practicing';
      rerender(<App />);
      appDiv = container1.querySelector('.app');
      expect(appDiv?.children).toHaveLength(1);

      // results状態
      mockState.gameState = 'results';
      rerender(<App />);
      appDiv = container1.querySelector('.app');
      expect(appDiv?.children).toHaveLength(1);
    });
  });

  describe('スナップショットテスト', () => {
    test('setup状態のレンダリング結果が一致する', () => {
      // Arrange
      mockState.gameState = 'setup';

      // Act
      const { container } = render(<App />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('practicing状態のレンダリング結果が一致する', () => {
      // Arrange
      mockState.gameState = 'practicing';

      // Act
      const { container } = render(<App />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('results状態のレンダリング結果が一致する', () => {
      // Arrange
      mockState.gameState = 'results';

      // Act
      const { container } = render(<App />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
