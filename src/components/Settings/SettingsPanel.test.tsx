/**
 * SettingsPanel のテスト
 * ウィザード形式の設定パネル（4ステップ）のテスト
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SettingsPanel } from './SettingsPanel';

// Zustand ストアのモック
vi.mock('../../stores/gameStore', () => ({
  useGameStore: vi.fn(),
}));

// 子コンポーネントのモック
vi.mock('./SetupWizard/Step1Preset', () => ({
  Step1Preset: () => <div data-testid="step1-preset">Step 1: Preset Selection</div>,
}));

vi.mock('./SetupWizard/Step2Difficulty', () => ({
  Step2Difficulty: () => <div data-testid="step2-difficulty">Step 2: Difficulty Selection</div>,
}));

vi.mock('./SetupWizard/Step3Session', () => ({
  Step3Session: () => <div data-testid="step3-session">Step 3: Session Configuration</div>,
}));

vi.mock('./SetupWizard/Step4Confirm', () => ({
  Step4Confirm: () => <div data-testid="step4-confirm">Step 4: Confirmation</div>,
}));

describe('SettingsPanel', () => {
  // モック関数
  const mockStartPractice = vi.fn();

  beforeEach(async () => {
    // モック関数をリセット
    mockStartPractice.mockReset();

    // useGameStore のモック実装
    const { useGameStore } = await import('../../stores/gameStore');
    vi.mocked(useGameStore).mockImplementation((selector) =>
      selector({
        startPractice: mockStartPractice,
      } as never)
    );
  });

  describe('初期表示', () => {
    test('ステップ1が表示される', () => {
      // Arrange & Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByTestId('step1-preset')).toBeInTheDocument();
      expect(screen.queryByTestId('step2-difficulty')).not.toBeInTheDocument();
      expect(screen.queryByTestId('step3-session')).not.toBeInTheDocument();
      expect(screen.queryByTestId('step4-confirm')).not.toBeInTheDocument();
    });

    test('進捗インジケーターにステップ1が表示される', () => {
      // Arrange & Act
      render(<SettingsPanel />);

      // Assert
      const progressSteps = screen.getAllByRole('generic').filter((el) => {
        return (
          el.className.includes('setup-wizard__progress-step') &&
          !el.className.includes('setup-wizard__progress-steps')
        );
      });

      // 4つのステップが表示される
      expect(progressSteps).toHaveLength(4);

      // ステップ1がアクティブ
      expect(progressSteps[0]).toHaveClass('setup-wizard__progress-step--active');
      expect(progressSteps[1]).toHaveClass('setup-wizard__progress-step--pending');
      expect(progressSteps[2]).toHaveClass('setup-wizard__progress-step--pending');
      expect(progressSteps[3]).toHaveClass('setup-wizard__progress-step--pending');
    });

    test('「次へ」ボタンが表示される', () => {
      // Arrange & Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByRole('button', { name: '次のステップへ進む' })).toBeInTheDocument();
    });

    test('「戻る」ボタンが表示されない', () => {
      // Arrange & Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.queryByRole('button', { name: '前のステップに戻る' })).not.toBeInTheDocument();
    });

    test('進捗バーの幅が25%である', () => {
      // Arrange & Act
      render(<SettingsPanel />);

      // Assert
      const progressFill = screen
        .getAllByRole('generic')
        .find((el) => el.className === 'setup-wizard__progress-fill');

      expect(progressFill).toHaveStyle({ width: '25%' });
    });
  });

  describe('次へボタンの動作', () => {
    test('ステップ1で「次へ」をクリックするとステップ2に進む', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(screen.queryByTestId('step1-preset')).not.toBeInTheDocument();
      expect(screen.getByTestId('step2-difficulty')).toBeInTheDocument();
    });

    test('ステップ2で「次へ」をクリックするとステップ3に進む', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // ステップ2まで進める
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(screen.queryByTestId('step2-difficulty')).not.toBeInTheDocument();
      expect(screen.getByTestId('step3-session')).toBeInTheDocument();
    });

    test('ステップ3で「次へ」をクリックするとステップ4に進む', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // ステップ3まで進める
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(screen.queryByTestId('step3-session')).not.toBeInTheDocument();
      expect(screen.getByTestId('step4-confirm')).toBeInTheDocument();
    });

    test('連続して「次へ」をクリックするとステップ4まで到達する', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(screen.getByTestId('step4-confirm')).toBeInTheDocument();
    });
  });

  describe('戻るボタンの動作', () => {
    test('ステップ2で「戻る」ボタンが表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(screen.getByRole('button', { name: '前のステップに戻る' })).toBeInTheDocument();
    });

    test('ステップ2で「戻る」をクリックするとステップ1に戻る', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      expect(screen.getByTestId('step2-difficulty')).toBeInTheDocument();

      // Act
      await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));

      // Assert
      expect(screen.getByTestId('step1-preset')).toBeInTheDocument();
      expect(screen.queryByTestId('step2-difficulty')).not.toBeInTheDocument();
    });

    test('ステップ3で「戻る」をクリックするとステップ2に戻る', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      expect(screen.getByTestId('step3-session')).toBeInTheDocument();

      // Act
      await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));

      // Assert
      expect(screen.getByTestId('step2-difficulty')).toBeInTheDocument();
      expect(screen.queryByTestId('step3-session')).not.toBeInTheDocument();
    });

    test('ステップ4で「戻る」をクリックするとステップ3に戻る', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      expect(screen.getByTestId('step4-confirm')).toBeInTheDocument();

      // Act
      await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));

      // Assert
      expect(screen.getByTestId('step3-session')).toBeInTheDocument();
      expect(screen.queryByTestId('step4-confirm')).not.toBeInTheDocument();
    });

    test('ステップ1に戻ると「戻る」ボタンが非表示になる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));

      // Assert
      expect(screen.getByTestId('step1-preset')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '前のステップに戻る' })).not.toBeInTheDocument();
    });
  });

  describe('進捗インジケーターの状態', () => {
    test('ステップ2では、ステップ1が完了、ステップ2がアクティブになる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const progressSteps = screen.getAllByRole('generic').filter((el) => {
        return (
          el.className.includes('setup-wizard__progress-step') &&
          !el.className.includes('setup-wizard__progress-steps')
        );
      });

      expect(progressSteps[0]).toHaveClass('setup-wizard__progress-step--completed');
      expect(progressSteps[1]).toHaveClass('setup-wizard__progress-step--active');
      expect(progressSteps[2]).toHaveClass('setup-wizard__progress-step--pending');
      expect(progressSteps[3]).toHaveClass('setup-wizard__progress-step--pending');
    });

    test('ステップ3では、ステップ1-2が完了、ステップ3がアクティブになる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const progressSteps = screen.getAllByRole('generic').filter((el) => {
        return (
          el.className.includes('setup-wizard__progress-step') &&
          !el.className.includes('setup-wizard__progress-steps')
        );
      });

      expect(progressSteps[0]).toHaveClass('setup-wizard__progress-step--completed');
      expect(progressSteps[1]).toHaveClass('setup-wizard__progress-step--completed');
      expect(progressSteps[2]).toHaveClass('setup-wizard__progress-step--active');
      expect(progressSteps[3]).toHaveClass('setup-wizard__progress-step--pending');
    });

    test('ステップ4では、ステップ1-3が完了、ステップ4がアクティブになる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const progressSteps = screen.getAllByRole('generic').filter((el) => {
        return (
          el.className.includes('setup-wizard__progress-step') &&
          !el.className.includes('setup-wizard__progress-steps')
        );
      });

      expect(progressSteps[0]).toHaveClass('setup-wizard__progress-step--completed');
      expect(progressSteps[1]).toHaveClass('setup-wizard__progress-step--completed');
      expect(progressSteps[2]).toHaveClass('setup-wizard__progress-step--completed');
      expect(progressSteps[3]).toHaveClass('setup-wizard__progress-step--active');
    });

    test('ステップ2の進捗バーの幅が50%である', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const progressFill = screen
        .getAllByRole('generic')
        .find((el) => el.className === 'setup-wizard__progress-fill');

      expect(progressFill).toHaveStyle({ width: '50%' });
    });

    test('ステップ3の進捗バーの幅が75%である', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const progressFill = screen
        .getAllByRole('generic')
        .find((el) => el.className === 'setup-wizard__progress-fill');

      expect(progressFill).toHaveStyle({ width: '75%' });
    });

    test('ステップ4の進捗バーの幅が100%である', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const progressFill = screen
        .getAllByRole('generic')
        .find((el) => el.className === 'setup-wizard__progress-fill');

      expect(progressFill).toHaveStyle({ width: '100%' });
    });
  });

  describe('最終ステップのボタン', () => {
    test('ステップ4では「次へ」ボタンが表示されない', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(screen.queryByRole('button', { name: '次のステップへ進む' })).not.toBeInTheDocument();
    });

    test('ステップ4では「練習を開始」ボタンが表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(screen.getByRole('button', { name: '練習を開始' })).toBeInTheDocument();
    });

    test('「練習を開始」ボタンをクリックするとstartPractice()が呼ばれる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Act
      await user.click(screen.getByRole('button', { name: '練習を開始' }));

      // Assert
      expect(mockStartPractice).toHaveBeenCalledTimes(1);
    });
  });

  describe('アクセシビリティ', () => {
    test('「次へ」ボタンに適切なaria-labelが設定されている', () => {
      // Arrange & Act
      render(<SettingsPanel />);

      // Assert
      const nextButton = screen.getByRole('button', { name: '次のステップへ進む' });
      expect(nextButton).toHaveAttribute('aria-label', '次のステップへ進む');
    });

    test('「戻る」ボタンに適切なaria-labelが設定されている', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const backButton = screen.getByRole('button', { name: '前のステップに戻る' });
      expect(backButton).toHaveAttribute('aria-label', '前のステップに戻る');
    });

    test('「練習を開始」ボタンに適切なaria-labelが設定されている', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const startButton = screen.getByRole('button', { name: '練習を開始' });
      expect(startButton).toHaveAttribute('aria-label', '練習を開始');
    });
  });

  describe('スナップショットテスト', () => {
    test('ステップ1の基本的なレンダリング結果が一致する', () => {
      // Arrange & Act
      const { container } = render(<SettingsPanel />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('ステップ2の見た目が一致する', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('ステップ3の見た目が一致する', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('ステップ4の見た目が一致する', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(container).toMatchSnapshot();
    });
  });
});
