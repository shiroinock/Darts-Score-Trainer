/**
 * SessionConfigSelectorコンポーネントのテスト
 * セッション設定UI、モード切り替え、インタラクション、アクセシビリティを検証
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SessionConfigSelector } from './SessionConfigSelector';

// モック用の型定義
type MockSessionConfig = {
  mode: 'questions' | 'time';
  questionCount?: 10 | 20 | 50 | 100;
  timeLimit?: 3 | 5 | 10;
};

// セッション設定モックのファクトリー関数
const createMockSessionConfig = (overrides?: Partial<MockSessionConfig>): MockSessionConfig => ({
  mode: 'questions',
  questionCount: 10,
  ...overrides,
});

// useGameStoreのモック
const mockSetSessionConfig = vi.fn();
let mockSessionConfig: MockSessionConfig = createMockSessionConfig();

vi.mock('../../stores/gameStore', () => ({
  useGameStore: (
    selector: (state: {
      sessionConfig: MockSessionConfig;
      setSessionConfig: (config: unknown) => void;
    }) => unknown
  ) => {
    const mockState = {
      sessionConfig: mockSessionConfig,
      setSessionConfig: mockSetSessionConfig,
    };
    return selector(mockState);
  },
}));

describe('SessionConfigSelector', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
    // デフォルト状態に戻す（ファクトリー関数で新しいオブジェクトを生成）
    mockSessionConfig = createMockSessionConfig();
  });

  describe('レンダリング', () => {
    test('タイトル「セッション設定」が表示される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const title = screen.getByText('セッション設定');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H2');
    });

    test('サブタイトル「モード」が表示される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const subtitle = screen.getByText('モード');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.tagName).toBe('H3');
    });

    test('モード選択トグルが表示される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const questionsModeButton = screen.getByRole('button', { name: '問題数' });
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });

      expect(questionsModeButton).toBeInTheDocument();
      expect(timeModeButton).toBeInTheDocument();
    });

    test('初期状態では問題数モードの選択肢が表示される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const questionCountSubtitle = screen.getAllByText('問題数')[1]; // 2つ目が問題数選択セクション
      expect(questionCountSubtitle).toBeInTheDocument();

      const button10 = screen.getByRole('button', { name: '10問' });
      const button20 = screen.getByRole('button', { name: '20問' });
      const button50 = screen.getByRole('button', { name: '50問' });
      const button100 = screen.getByRole('button', { name: '100問' });

      expect(button10).toBeInTheDocument();
      expect(button20).toBeInTheDocument();
      expect(button50).toBeInTheDocument();
      expect(button100).toBeInTheDocument();
    });

    test('時間制限モード選択時に時間選択肢が表示される', () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 3;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const timeLimitSubtitle = screen.getAllByText('時間制限')[1]; // 2つ目が時間制限選択セクション
      expect(timeLimitSubtitle).toBeInTheDocument();

      const button3 = screen.getByRole('button', { name: '3分' });
      const button5 = screen.getByRole('button', { name: '5分' });
      const button10 = screen.getByRole('button', { name: '10分' });

      expect(button3).toBeInTheDocument();
      expect(button5).toBeInTheDocument();
      expect(button10).toBeInTheDocument();
    });

    test('問題数モード選択時に時間選択肢が非表示になる', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      expect(screen.queryByText('3分')).not.toBeInTheDocument();
      expect(screen.queryByText('5分')).not.toBeInTheDocument();
      expect(screen.queryByText('10分')).not.toBeInTheDocument();
    });

    test('時間制限モード選択時に問題数選択肢が非表示になる', () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 3;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      expect(screen.queryByText('10問')).not.toBeInTheDocument();
      expect(screen.queryByText('20問')).not.toBeInTheDocument();
      expect(screen.queryByText('50問')).not.toBeInTheDocument();
      expect(screen.queryByText('100問')).not.toBeInTheDocument();
    });
  });

  describe('インタラクション - モード切り替え', () => {
    test('時間制限モードボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });
      await user.click(timeModeButton);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'time',
        timeLimit: 3, // デフォルト値
      });
    });

    test('問題数モードボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 5;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const questionsModeButton = screen.getByRole('button', { name: '問題数' });
      await user.click(questionsModeButton);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'questions',
        questionCount: 10, // デフォルト値
      });
    });

    test('既存のquestionCountを保持してquestionsモードに切り替える', async () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 5;
      mockSessionConfig.questionCount = 50; // 既存の値

      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const questionsModeButton = screen.getByRole('button', { name: '問題数' });
      await user.click(questionsModeButton);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'questions',
        questionCount: 50, // 既存値が保持される
      });
    });

    test('既存のtimeLimitを保持してtimeモードに切り替える', async () => {
      // Arrange
      mockSessionConfig.mode = 'questions';
      mockSessionConfig.questionCount = 20;
      (mockSessionConfig as { timeLimit?: number }).timeLimit = 10; // 既存の値

      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });
      await user.click(timeModeButton);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'time',
        timeLimit: 10, // 既存値が保持される
      });
    });
  });

  describe('インタラクション - 問題数選択', () => {
    test('10問ボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button10 = screen.getByRole('button', { name: '10問' });
      await user.click(button10);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'questions',
        questionCount: 10,
      });
    });

    test('20問ボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button20 = screen.getByRole('button', { name: '20問' });
      await user.click(button20);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'questions',
        questionCount: 20,
      });
    });

    test('50問ボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button50 = screen.getByRole('button', { name: '50問' });
      await user.click(button50);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'questions',
        questionCount: 50,
      });
    });

    test('100問ボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button100 = screen.getByRole('button', { name: '100問' });
      await user.click(button100);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'questions',
        questionCount: 100,
      });
    });

    test('複数の問題数ボタンを連続してクリックできる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button10 = screen.getByRole('button', { name: '10問' });
      const button50 = screen.getByRole('button', { name: '50問' });
      const button100 = screen.getByRole('button', { name: '100問' });

      await user.click(button10);
      await user.click(button50);
      await user.click(button100);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(3);
      expect(mockSetSessionConfig).toHaveBeenNthCalledWith(1, {
        mode: 'questions',
        questionCount: 10,
      });
      expect(mockSetSessionConfig).toHaveBeenNthCalledWith(2, {
        mode: 'questions',
        questionCount: 50,
      });
      expect(mockSetSessionConfig).toHaveBeenNthCalledWith(3, {
        mode: 'questions',
        questionCount: 100,
      });
    });
  });

  describe('インタラクション - 時間制限選択', () => {
    beforeEach(() => {
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 3;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;
    });

    test('3分ボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button3 = screen.getByRole('button', { name: '3分' });
      await user.click(button3);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'time',
        timeLimit: 3,
      });
    });

    test('5分ボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button5 = screen.getByRole('button', { name: '5分' });
      await user.click(button5);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'time',
        timeLimit: 5,
      });
    });

    test('10分ボタンをクリックするとsetSessionConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button10 = screen.getByRole('button', { name: '10分' });
      await user.click(button10);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(1);
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'time',
        timeLimit: 10,
      });
    });

    test('複数の時間制限ボタンを連続してクリックできる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button3 = screen.getByRole('button', { name: '3分' });
      const button5 = screen.getByRole('button', { name: '5分' });
      const button10 = screen.getByRole('button', { name: '10分' });

      await user.click(button3);
      await user.click(button5);
      await user.click(button10);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledTimes(3);
      expect(mockSetSessionConfig).toHaveBeenNthCalledWith(1, {
        mode: 'time',
        timeLimit: 3,
      });
      expect(mockSetSessionConfig).toHaveBeenNthCalledWith(2, {
        mode: 'time',
        timeLimit: 5,
      });
      expect(mockSetSessionConfig).toHaveBeenNthCalledWith(3, {
        mode: 'time',
        timeLimit: 10,
      });
    });
  });

  describe('スタイリング - モード選択', () => {
    test('問題数モードがアクティブな場合、問題数ボタンに--activeクラスが付与される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const questionsModeButton = screen.getByRole('button', { name: '問題数' });
      expect(questionsModeButton).toHaveClass('session-mode-button--active');
      expect(questionsModeButton).toHaveClass('session-mode-button');
    });

    test('問題数モードがアクティブな場合、時間制限ボタンに--activeクラスが付与されない', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });
      expect(timeModeButton).toHaveClass('session-mode-button');
      expect(timeModeButton).not.toHaveClass('session-mode-button--active');
    });

    test('時間制限モードがアクティブな場合、時間制限ボタンに--activeクラスが付与される', () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 3;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });
      expect(timeModeButton).toHaveClass('session-mode-button--active');
      expect(timeModeButton).toHaveClass('session-mode-button');
    });

    test('時間制限モードがアクティブな場合、問題数ボタンに--activeクラスが付与されない', () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 3;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const questionsModeButton = screen.getByRole('button', { name: '問題数' });
      expect(questionsModeButton).toHaveClass('session-mode-button');
      expect(questionsModeButton).not.toHaveClass('session-mode-button--active');
    });
  });

  describe('スタイリング - 問題数選択', () => {
    test('選択された問題数ボタンに--activeクラスが付与される', () => {
      // Arrange
      mockSessionConfig.questionCount = 20;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const button20 = screen.getByRole('button', { name: '20問' });
      expect(button20).toHaveClass('session-param-button--active');
      expect(button20).toHaveClass('session-param-button');
    });

    test('非選択の問題数ボタンに--activeクラスが付与されない', () => {
      // Arrange
      mockSessionConfig.questionCount = 20;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const button10 = screen.getByRole('button', { name: '10問' });
      const button50 = screen.getByRole('button', { name: '50問' });
      const button100 = screen.getByRole('button', { name: '100問' });

      expect(button10).toHaveClass('session-param-button');
      expect(button10).not.toHaveClass('session-param-button--active');
      expect(button50).not.toHaveClass('session-param-button--active');
      expect(button100).not.toHaveClass('session-param-button--active');
    });
  });

  describe('スタイリング - 時間制限選択', () => {
    beforeEach(() => {
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 5;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;
    });

    test('選択された時間制限ボタンに--activeクラスが付与される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const button5 = screen.getByRole('button', { name: '5分' });
      expect(button5).toHaveClass('session-param-button--active');
      expect(button5).toHaveClass('session-param-button');
    });

    test('非選択の時間制限ボタンに--activeクラスが付与されない', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const button3 = screen.getByRole('button', { name: '3分' });
      const button10 = screen.getByRole('button', { name: '10分' });

      expect(button3).toHaveClass('session-param-button');
      expect(button3).not.toHaveClass('session-param-button--active');
      expect(button10).not.toHaveClass('session-param-button--active');
    });
  });

  describe('アクセシビリティ - モード選択', () => {
    test('アクティブな問題数モードボタンに aria-pressed="true" が設定される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const questionsModeButton = screen.getByRole('button', { name: '問題数' });
      expect(questionsModeButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('非アクティブな時間制限モードボタンに aria-pressed="false" が設定される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });
      expect(timeModeButton).toHaveAttribute('aria-pressed', 'false');
    });

    test('アクティブな時間制限モードボタンに aria-pressed="true" が設定される', () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 3;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });
      expect(timeModeButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('モード選択ボタンに type="button" が設定される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const questionsModeButton = screen.getByRole('button', { name: '問題数' });
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });

      expect(questionsModeButton).toHaveAttribute('type', 'button');
      expect(timeModeButton).toHaveAttribute('type', 'button');
    });
  });

  describe('アクセシビリティ - 問題数選択', () => {
    test('選択された問題数ボタンに aria-pressed="true" が設定される', () => {
      // Arrange
      mockSessionConfig.questionCount = 50;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const button50 = screen.getByRole('button', { name: '50問' });
      expect(button50).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択の問題数ボタンに aria-pressed="false" が設定される', () => {
      // Arrange
      mockSessionConfig.questionCount = 50;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const button10 = screen.getByRole('button', { name: '10問' });
      const button20 = screen.getByRole('button', { name: '20問' });
      const button100 = screen.getByRole('button', { name: '100問' });

      expect(button10).toHaveAttribute('aria-pressed', 'false');
      expect(button20).toHaveAttribute('aria-pressed', 'false');
      expect(button100).toHaveAttribute('aria-pressed', 'false');
    });

    test('全ての問題数ボタンに type="button" が設定される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const button10 = screen.getByRole('button', { name: '10問' });
      const button20 = screen.getByRole('button', { name: '20問' });
      const button50 = screen.getByRole('button', { name: '50問' });
      const button100 = screen.getByRole('button', { name: '100問' });

      expect(button10).toHaveAttribute('type', 'button');
      expect(button20).toHaveAttribute('type', 'button');
      expect(button50).toHaveAttribute('type', 'button');
      expect(button100).toHaveAttribute('type', 'button');
    });
  });

  describe('アクセシビリティ - 時間制限選択', () => {
    beforeEach(() => {
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 10;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;
    });

    test('選択された時間制限ボタンに aria-pressed="true" が設定される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const button10 = screen.getByRole('button', { name: '10分' });
      expect(button10).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択の時間制限ボタンに aria-pressed="false" が設定される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const button3 = screen.getByRole('button', { name: '3分' });
      const button5 = screen.getByRole('button', { name: '5分' });

      expect(button3).toHaveAttribute('aria-pressed', 'false');
      expect(button5).toHaveAttribute('aria-pressed', 'false');
    });

    test('全ての時間制限ボタンに type="button" が設定される', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const button3 = screen.getByRole('button', { name: '3分' });
      const button5 = screen.getByRole('button', { name: '5分' });
      const button10 = screen.getByRole('button', { name: '10分' });

      expect(button3).toHaveAttribute('type', 'button');
      expect(button5).toHaveAttribute('type', 'button');
      expect(button10).toHaveAttribute('type', 'button');
    });
  });

  describe('レイアウト構造', () => {
    test('session-config-selector クラスを持つ外側のdivが存在する', () => {
      // Arrange & Act
      const { container } = render(<SessionConfigSelector />);

      // Assert
      const outerDiv = container.querySelector('.session-config-selector');
      expect(outerDiv).toBeInTheDocument();
    });

    test('session-config-selector__mode クラスを持つモード選択セクションが存在する', () => {
      // Arrange & Act
      const { container } = render(<SessionConfigSelector />);

      // Assert
      const modeSection = container.querySelector('.session-config-selector__mode');
      expect(modeSection).toBeInTheDocument();
    });

    test('session-config-selector__params クラスを持つパラメータセクションが存在する', () => {
      // Arrange & Act
      const { container } = render(<SessionConfigSelector />);

      // Assert
      const paramsSection = container.querySelector('.session-config-selector__params');
      expect(paramsSection).toBeInTheDocument();
    });

    test('session-config-selector__buttons クラスを持つボタンコンテナが存在する', () => {
      // Arrange & Act
      const { container } = render(<SessionConfigSelector />);

      // Assert
      const buttonContainers = container.querySelectorAll('.session-config-selector__buttons');
      // モード選択と問題数選択の2つが存在
      expect(buttonContainers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('エッジケース', () => {
    test('questionCountがundefinedでも正常にレンダリングされる', () => {
      // Arrange
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      // Act & Assert
      expect(() => render(<SessionConfigSelector />)).not.toThrow();
    });

    test('timeLimitがundefinedでも正常にレンダリングされる', () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      delete (mockSessionConfig as { timeLimit?: number }).timeLimit;

      // Act & Assert
      expect(() => render(<SessionConfigSelector />)).not.toThrow();
    });

    test('問題数選択肢が4つであることを検証', () => {
      // Arrange & Act
      render(<SessionConfigSelector />);

      // Assert
      const button10 = screen.getByRole('button', { name: '10問' });
      const button20 = screen.getByRole('button', { name: '20問' });
      const button50 = screen.getByRole('button', { name: '50問' });
      const button100 = screen.getByRole('button', { name: '100問' });

      expect([button10, button20, button50, button100]).toHaveLength(4);
    });

    test('時間制限選択肢が3つであることを検証', () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 3;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      // Act
      render(<SessionConfigSelector />);

      // Assert
      const button3 = screen.getByRole('button', { name: '3分' });
      const button5 = screen.getByRole('button', { name: '5分' });
      const button10 = screen.getByRole('button', { name: '10分' });

      expect([button3, button5, button10]).toHaveLength(3);
    });
  });

  describe('統合シナリオ', () => {
    test('モード切り替え後にsetSessionConfigが正しく呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act: 時間制限モードに切り替え
      const timeModeButton = screen.getByRole('button', { name: '時間制限' });
      await user.click(timeModeButton);

      // Assert: モード切り替えが呼び出されることを確認
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'time',
        timeLimit: 3,
      });
    });

    test('問題数を変更してもモードは維持される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button50 = screen.getByRole('button', { name: '50問' });
      await user.click(button50);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'questions',
        questionCount: 50,
      });
    });

    test('時間制限を変更してもモードは維持される', async () => {
      // Arrange
      mockSessionConfig.mode = 'time';
      mockSessionConfig.timeLimit = 3;
      delete (mockSessionConfig as { questionCount?: number }).questionCount;

      const user = userEvent.setup();
      render(<SessionConfigSelector />);

      // Act
      const button10 = screen.getByRole('button', { name: '10分' });
      await user.click(button10);

      // Assert
      expect(mockSetSessionConfig).toHaveBeenCalledWith({
        mode: 'time',
        timeLimit: 10,
      });
    });
  });

  describe('スナップショットテスト', () => {
    test('基本的なレンダリング（デフォルト状態: 問題数モード・10問）', () => {
      // Arrange
      mockSessionConfig.mode = 'questions';
      mockSessionConfig.questionCount = 10;
      delete (mockSessionConfig as { timeLimit?: number }).timeLimit;

      // Act
      const { container } = render(<SessionConfigSelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    describe('問題数モードのバリエーション', () => {
      test('問題数モード: 10問選択', () => {
        // Arrange
        mockSessionConfig.mode = 'questions';
        mockSessionConfig.questionCount = 10;
        delete (mockSessionConfig as { timeLimit?: number }).timeLimit;

        // Act
        const { container } = render(<SessionConfigSelector />);

        // Assert
        expect(container.firstChild).toMatchSnapshot();
      });

      test('問題数モード: 20問選択', () => {
        // Arrange
        mockSessionConfig.mode = 'questions';
        mockSessionConfig.questionCount = 20;
        delete (mockSessionConfig as { timeLimit?: number }).timeLimit;

        // Act
        const { container } = render(<SessionConfigSelector />);

        // Assert
        expect(container.firstChild).toMatchSnapshot();
      });

      test('問題数モード: 50問選択', () => {
        // Arrange
        mockSessionConfig.mode = 'questions';
        mockSessionConfig.questionCount = 50;
        delete (mockSessionConfig as { timeLimit?: number }).timeLimit;

        // Act
        const { container } = render(<SessionConfigSelector />);

        // Assert
        expect(container.firstChild).toMatchSnapshot();
      });

      test('問題数モード: 100問選択', () => {
        // Arrange
        mockSessionConfig.mode = 'questions';
        mockSessionConfig.questionCount = 100;
        delete (mockSessionConfig as { timeLimit?: number }).timeLimit;

        // Act
        const { container } = render(<SessionConfigSelector />);

        // Assert
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    describe('時間制限モードのバリエーション', () => {
      test('時間制限モード: 3分選択', () => {
        // Arrange
        mockSessionConfig.mode = 'time';
        mockSessionConfig.timeLimit = 3;
        delete (mockSessionConfig as { questionCount?: number }).questionCount;

        // Act
        const { container } = render(<SessionConfigSelector />);

        // Assert
        expect(container.firstChild).toMatchSnapshot();
      });

      test('時間制限モード: 5分選択', () => {
        // Arrange
        mockSessionConfig.mode = 'time';
        mockSessionConfig.timeLimit = 5;
        delete (mockSessionConfig as { questionCount?: number }).questionCount;

        // Act
        const { container } = render(<SessionConfigSelector />);

        // Assert
        expect(container.firstChild).toMatchSnapshot();
      });

      test('時間制限モード: 10分選択', () => {
        // Arrange
        mockSessionConfig.mode = 'time';
        mockSessionConfig.timeLimit = 10;
        delete (mockSessionConfig as { questionCount?: number }).questionCount;

        // Act
        const { container } = render(<SessionConfigSelector />);

        // Assert
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
});
