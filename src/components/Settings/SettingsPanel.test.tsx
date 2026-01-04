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
  const mockGoToDebugScreen = vi.fn();

  beforeEach(async () => {
    // モック関数をリセット
    mockStartPractice.mockReset();
    mockGoToDebugScreen.mockReset();

    // useGameStore のモック実装（デフォルトは非基礎練習モード）
    const { useGameStore } = await import('../../stores/gameStore');
    vi.mocked(useGameStore).mockImplementation((selector) =>
      selector({
        startPractice: mockStartPractice,
        goToDebugScreen: mockGoToDebugScreen,
        config: {
          configId: 'preset-player', // 非基礎練習モード
          configName: 'プレイヤー練習',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: 501,
          stdDevMM: 15,
          isPreset: true,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
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
      // ステップ1がアクティブ
      expect(screen.getByTestId('progress-step-1')).toHaveClass(
        'setup-wizard__progress-step--active'
      );
      expect(screen.getByTestId('progress-step-2')).toHaveClass(
        'setup-wizard__progress-step--pending'
      );
      expect(screen.getByTestId('progress-step-3')).toHaveClass(
        'setup-wizard__progress-step--pending'
      );
      expect(screen.getByTestId('progress-step-4')).toHaveClass(
        'setup-wizard__progress-step--pending'
      );
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

    test('進捗バーがステップ1を示している', () => {
      // Arrange & Act
      render(<SettingsPanel />);

      // Assert
      const progressFill = screen
        .getAllByRole('generic')
        .find((el) => el.className === 'setup-wizard__progress-fill');

      expect(progressFill).toHaveAttribute('data-step', '1');
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
      expect(screen.getByTestId('progress-step-1')).toHaveClass(
        'setup-wizard__progress-step--completed'
      );
      expect(screen.getByTestId('progress-step-2')).toHaveClass(
        'setup-wizard__progress-step--active'
      );
      expect(screen.getByTestId('progress-step-3')).toHaveClass(
        'setup-wizard__progress-step--pending'
      );
      expect(screen.getByTestId('progress-step-4')).toHaveClass(
        'setup-wizard__progress-step--pending'
      );
    });

    test('ステップ3では、ステップ1-2が完了、ステップ3がアクティブになる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      expect(screen.getByTestId('progress-step-1')).toHaveClass(
        'setup-wizard__progress-step--completed'
      );
      expect(screen.getByTestId('progress-step-2')).toHaveClass(
        'setup-wizard__progress-step--completed'
      );
      expect(screen.getByTestId('progress-step-3')).toHaveClass(
        'setup-wizard__progress-step--active'
      );
      expect(screen.getByTestId('progress-step-4')).toHaveClass(
        'setup-wizard__progress-step--pending'
      );
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
      expect(screen.getByTestId('progress-step-1')).toHaveClass(
        'setup-wizard__progress-step--completed'
      );
      expect(screen.getByTestId('progress-step-2')).toHaveClass(
        'setup-wizard__progress-step--completed'
      );
      expect(screen.getByTestId('progress-step-3')).toHaveClass(
        'setup-wizard__progress-step--completed'
      );
      expect(screen.getByTestId('progress-step-4')).toHaveClass(
        'setup-wizard__progress-step--active'
      );
    });

    test('ステップ2の進捗バーがステップ2を示している', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert
      const progressFill = screen
        .getAllByRole('generic')
        .find((el) => el.className === 'setup-wizard__progress-fill');

      expect(progressFill).toHaveAttribute('data-step', '2');
    });

    test('ステップ3の進捗バーがステップ3を示している', async () => {
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

      expect(progressFill).toHaveAttribute('data-step', '3');
    });

    test('ステップ4の進捗バーがステップ4を示している', async () => {
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

      expect(progressFill).toHaveAttribute('data-step', '4');
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

    test('現在の環境変数設定での見た目が一致する', () => {
      /**
       * このスナップショットは現在の環境変数 VITE_ENABLE_DEBUG_MODE の設定を反映します。
       * - デバッグモード有効時: デバッグボタンを含むスナップショット
       * - デバッグモード無効時: デバッグボタンを含まないスナップショット
       */
      // Arrange & Act
      const { container } = render(<SettingsPanel />);

      // Assert
      expect(container).toMatchSnapshot();
    });
  });

  describe('デバッグボタンの表示制御', () => {
    /**
     * 注意: import.meta.envは静的にビルド時に埋め込まれるため、
     * テスト実行時に動的にモックすることは困難です。
     *
     * このテストは現在の環境変数の設定に基づいて動作します：
     * - VITE_ENABLE_DEBUG_MODE='true' の場合: デバッグボタンが表示される
     * - VITE_ENABLE_DEBUG_MODE='false' または未定義の場合: デバッグボタンが非表示
     */

    const isDebugModeEnabled = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';

    test('環境変数VITE_ENABLE_DEBUG_MODEの設定に応じてデバッグボタンの表示が制御される', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      if (isDebugModeEnabled) {
        // デバッグモードが有効な場合、デバッグボタンが表示される
        expect(screen.getByRole('button', { name: 'デバッグ画面を開く' })).toBeInTheDocument();
        expect(screen.getByText('Debug')).toBeInTheDocument();
      } else {
        // デバッグモードが無効または未定義の場合、デバッグボタンが非表示
        expect(
          screen.queryByRole('button', { name: 'デバッグ画面を開く' })
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Debug')).not.toBeInTheDocument();
      }
    });

    // デバッグモードが有効な場合のみ実行されるテスト
    test.skipIf(!isDebugModeEnabled)(
      'デバッグボタンをクリックするとgoToDebugScreen()が呼ばれる',
      async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Act
        await user.click(screen.getByRole('button', { name: 'デバッグ画面を開く' }));

        // Assert
        expect(mockGoToDebugScreen).toHaveBeenCalledTimes(1);
      }
    );

    test('デバッグボタンにはsetup-wizard__button--debugクラスが適用される', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      if (isDebugModeEnabled) {
        const debugButton = screen.getByRole('button', { name: 'デバッグ画面を開く' });
        expect(debugButton).toHaveClass('setup-wizard__button');
        expect(debugButton).toHaveClass('setup-wizard__button--debug');
      }
    });

    test('デバッグボタンに適切なaria-labelが設定されている', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      if (isDebugModeEnabled) {
        const debugButton = screen.getByRole('button', { name: 'デバッグ画面を開く' });
        expect(debugButton).toHaveAttribute('aria-label', 'デバッグ画面を開く');
        expect(debugButton).toHaveAttribute('type', 'button');
      }
    });
  });

  describe('Controlledモード', () => {
    test('外部からステップを制御できる（ステップ1→3）', () => {
      // Arrange
      const handleStepChange = vi.fn();
      const { rerender } = render(
        <SettingsPanel currentStep={1} onStepChange={handleStepChange} />
      );

      // Assert: ステップ1が表示される
      expect(screen.getByTestId('step1-preset')).toBeInTheDocument();
      expect(screen.queryByTestId('step3-session')).not.toBeInTheDocument();

      // Act: 外部からステップを3に変更
      rerender(<SettingsPanel currentStep={3} onStepChange={handleStepChange} />);

      // Assert: ステップ3が表示される
      expect(screen.queryByTestId('step1-preset')).not.toBeInTheDocument();
      expect(screen.getByTestId('step3-session')).toBeInTheDocument();
    });

    test('外部からステップを制御できる（ステップ4→2）', () => {
      // Arrange
      const handleStepChange = vi.fn();
      const { rerender } = render(
        <SettingsPanel currentStep={4} onStepChange={handleStepChange} />
      );

      // Assert: ステップ4が表示される
      expect(screen.getByTestId('step4-confirm')).toBeInTheDocument();

      // Act: 外部からステップを2に変更
      rerender(<SettingsPanel currentStep={2} onStepChange={handleStepChange} />);

      // Assert: ステップ2が表示される
      expect(screen.queryByTestId('step4-confirm')).not.toBeInTheDocument();
      expect(screen.getByTestId('step2-difficulty')).toBeInTheDocument();
    });

    test('次へボタンクリック時にonStepChangeが呼ばれる', async () => {
      // Arrange
      const handleStepChange = vi.fn();
      const user = userEvent.setup();
      render(<SettingsPanel currentStep={1} onStepChange={handleStepChange} />);

      // Act: 次へボタンをクリック
      await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

      // Assert: onStepChangeが2で呼ばれる
      expect(handleStepChange).toHaveBeenCalledTimes(1);
      expect(handleStepChange).toHaveBeenCalledWith(2);
    });

    test('戻るボタンクリック時にonStepChangeが呼ばれる', async () => {
      // Arrange
      const handleStepChange = vi.fn();
      const user = userEvent.setup();
      render(<SettingsPanel currentStep={3} onStepChange={handleStepChange} />);

      // Act: 戻るボタンをクリック
      await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));

      // Assert: onStepChangeが2で呼ばれる
      expect(handleStepChange).toHaveBeenCalledTimes(1);
      expect(handleStepChange).toHaveBeenCalledWith(2);
    });

    test('ステップ4で練習開始ボタンクリック時にonStepChangeは呼ばれない', async () => {
      // Arrange
      const handleStepChange = vi.fn();
      const user = userEvent.setup();
      render(<SettingsPanel currentStep={4} onStepChange={handleStepChange} />);

      // Act: 練習開始ボタンをクリック
      await user.click(screen.getByRole('button', { name: '練習を開始' }));

      // Assert: onStepChangeは呼ばれない
      expect(handleStepChange).not.toHaveBeenCalled();
      // startPracticeは呼ばれる
      expect(mockStartPractice).toHaveBeenCalledTimes(1);
    });

    test('Controlledモードでプログレスステップが正しく表示される', () => {
      // Arrange & Act
      const { rerender } = render(<SettingsPanel currentStep={1} onStepChange={vi.fn()} />);

      // Assert: ステップ1がアクティブ
      const step1 = screen.getByTestId('progress-step-1');
      expect(step1).toHaveClass('setup-wizard__progress-step--active');
      expect(screen.getByTestId('progress-step-2')).toHaveClass(
        'setup-wizard__progress-step--pending'
      );

      // Act: ステップ3に変更
      rerender(<SettingsPanel currentStep={3} onStepChange={vi.fn()} />);

      // Assert: ステップ3がアクティブ、1-2が完了
      expect(screen.getByTestId('progress-step-1')).toHaveClass(
        'setup-wizard__progress-step--completed'
      );
      expect(screen.getByTestId('progress-step-2')).toHaveClass(
        'setup-wizard__progress-step--completed'
      );
      expect(screen.getByTestId('progress-step-3')).toHaveClass(
        'setup-wizard__progress-step--active'
      );
      expect(screen.getByTestId('progress-step-4')).toHaveClass(
        'setup-wizard__progress-step--pending'
      );
    });

    test('Controlledモードでステップ間の遷移が正しく動作する', () => {
      // Arrange
      const handleStepChange = vi.fn();
      const { rerender } = render(
        <SettingsPanel currentStep={1} onStepChange={handleStepChange} />
      );

      // Assert: 初期状態（ステップ1）
      expect(screen.getByTestId('step1-preset')).toBeInTheDocument();

      // Act & Assert: ステップ2に遷移
      rerender(<SettingsPanel currentStep={2} onStepChange={handleStepChange} />);
      expect(screen.getByTestId('step2-difficulty')).toBeInTheDocument();
      expect(screen.queryByTestId('step1-preset')).not.toBeInTheDocument();

      // Act & Assert: ステップ4に遷移
      rerender(<SettingsPanel currentStep={4} onStepChange={handleStepChange} />);
      expect(screen.getByTestId('step4-confirm')).toBeInTheDocument();
      expect(screen.queryByTestId('step2-difficulty')).not.toBeInTheDocument();
    });
  });

  describe('基礎練習モード（Step 2スキップ）', () => {
    /**
     * 基礎練習モードでは難易度選択（Step 2）をスキップします。
     * config.configId === 'preset-basic' の場合：
     * - Step 1 → Step 3 へ直接遷移
     * - Step 3 → Step 1 へ直接戻る
     * - Step 2 の進捗インジケーターがグレーアウト表示
     */

    beforeEach(async () => {
      // 基礎練習モードの設定でストアをモック
      const { useGameStore } = await import('../../stores/gameStore');
      vi.mocked(useGameStore).mockImplementation((selector) =>
        selector({
          startPractice: mockStartPractice,
          goToDebugScreen: mockGoToDebugScreen,
          config: {
            configId: 'preset-basic', // 基礎練習モード
            configName: '基礎練習',
            description: '1投単位で得点を問う基本練習（62ターゲットからランダム出題）',
            icon: '📚',
            throwUnit: 1,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: 501,
            stdDevMM: 15,
            randomizeTarget: true,
            useBasicTargets: true,
            isPreset: true,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        } as never)
      );
    });

    describe('ステップスキップの動作', () => {
      test('Step 1で「次へ」をクリックすると、Step 2をスキップしてStep 3に直接遷移する', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Assert: 初期状態でStep 1が表示
        expect(screen.getByTestId('step1-preset')).toBeInTheDocument();
        expect(screen.queryByTestId('step2-difficulty')).not.toBeInTheDocument();
        expect(screen.queryByTestId('step3-session')).not.toBeInTheDocument();

        // Act: 次へボタンをクリック
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert: Step 2をスキップしてStep 3が表示される
        expect(screen.queryByTestId('step1-preset')).not.toBeInTheDocument();
        expect(screen.queryByTestId('step2-difficulty')).not.toBeInTheDocument();
        expect(screen.getByTestId('step3-session')).toBeInTheDocument();
      });

      test('Step 3で「戻る」をクリックすると、Step 2をスキップしてStep 1に直接戻る', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Step 3まで進める（Step 1 → Step 3）
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        expect(screen.getByTestId('step3-session')).toBeInTheDocument();

        // Act: 戻るボタンをクリック
        await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));

        // Assert: Step 2をスキップしてStep 1に戻る
        expect(screen.getByTestId('step1-preset')).toBeInTheDocument();
        expect(screen.queryByTestId('step2-difficulty')).not.toBeInTheDocument();
        expect(screen.queryByTestId('step3-session')).not.toBeInTheDocument();
      });

      test('Step 1 → Step 3 → Step 4 → Step 1 の遷移が正しく動作する', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Act & Assert: Step 1 → Step 3
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        expect(screen.getByTestId('step3-session')).toBeInTheDocument();

        // Act & Assert: Step 3 → Step 4
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        expect(screen.getByTestId('step4-confirm')).toBeInTheDocument();

        // Act & Assert: Step 4 → Step 3
        await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));
        expect(screen.getByTestId('step3-session')).toBeInTheDocument();

        // Act & Assert: Step 3 → Step 1
        await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));
        expect(screen.getByTestId('step1-preset')).toBeInTheDocument();
      });
    });

    describe('進捗インジケーターの表示', () => {
      test('基礎練習モードでは、Step 2の進捗インジケーターがスキップ状態（グレーアウト）で表示される', () => {
        // Arrange & Act
        render(<SettingsPanel />);

        // Assert: Step 2がスキップクラスを持つ
        const step2 = screen.getByTestId('progress-step-2');
        expect(step2).toHaveClass('setup-wizard__progress-step--skipped');
        expect(step2).not.toHaveClass('setup-wizard__progress-step--active');
        expect(step2).not.toHaveClass('setup-wizard__progress-step--completed');
        expect(step2).not.toHaveClass('setup-wizard__progress-step--pending');
      });

      test('Step 1では、Step 1がアクティブ、Step 2がスキップ、Step 3-4が保留状態', () => {
        // Arrange & Act
        render(<SettingsPanel />);

        // Assert
        expect(screen.getByTestId('progress-step-1')).toHaveClass(
          'setup-wizard__progress-step--active'
        );
        expect(screen.getByTestId('progress-step-2')).toHaveClass(
          'setup-wizard__progress-step--skipped'
        );
        expect(screen.getByTestId('progress-step-3')).toHaveClass(
          'setup-wizard__progress-step--pending'
        );
        expect(screen.getByTestId('progress-step-4')).toHaveClass(
          'setup-wizard__progress-step--pending'
        );
      });

      test('Step 3では、Step 1が完了、Step 2がスキップ、Step 3がアクティブ、Step 4が保留状態', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Act: Step 1 → Step 3
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert
        expect(screen.getByTestId('progress-step-1')).toHaveClass(
          'setup-wizard__progress-step--completed'
        );
        expect(screen.getByTestId('progress-step-2')).toHaveClass(
          'setup-wizard__progress-step--skipped'
        );
        expect(screen.getByTestId('progress-step-3')).toHaveClass(
          'setup-wizard__progress-step--active'
        );
        expect(screen.getByTestId('progress-step-4')).toHaveClass(
          'setup-wizard__progress-step--pending'
        );
      });

      test('Step 4では、Step 1-3が完了、Step 2がスキップかつ完了、Step 4がアクティブ', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Act: Step 1 → Step 3 → Step 4
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert
        expect(screen.getByTestId('progress-step-1')).toHaveClass(
          'setup-wizard__progress-step--completed'
        );
        expect(screen.getByTestId('progress-step-2')).toHaveClass(
          'setup-wizard__progress-step--skipped'
        );
        expect(screen.getByTestId('progress-step-3')).toHaveClass(
          'setup-wizard__progress-step--completed'
        );
        expect(screen.getByTestId('progress-step-4')).toHaveClass(
          'setup-wizard__progress-step--active'
        );
      });
    });

    describe('ボタン表示の確認', () => {
      test('Step 1では「戻る」ボタンが表示されない', () => {
        // Arrange & Act
        render(<SettingsPanel />);

        // Assert
        expect(
          screen.queryByRole('button', { name: '前のステップに戻る' })
        ).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: '次のステップへ進む' })).toBeInTheDocument();
      });

      test('Step 3では「戻る」ボタンと「次へ」ボタンが両方表示される', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Act: Step 1 → Step 3
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert
        expect(screen.getByRole('button', { name: '前のステップに戻る' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '次のステップへ進む' })).toBeInTheDocument();
      });

      test('Step 4では「戻る」ボタンと「練習を開始」ボタンが表示される', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Act: Step 1 → Step 3 → Step 4
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert
        expect(screen.getByRole('button', { name: '前のステップに戻る' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '練習を開始' })).toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: '次のステップへ進む' })
        ).not.toBeInTheDocument();
      });
    });

    describe('スナップショットテスト', () => {
      test('基礎練習モードのStep 1の見た目が一致する', () => {
        // Arrange & Act
        const { container } = render(<SettingsPanel />);

        // Assert
        expect(container).toMatchSnapshot();
      });

      test('基礎練習モードのStep 3（Step 2スキップ後）の見た目が一致する', async () => {
        // Arrange
        const user = userEvent.setup();
        const { container } = render(<SettingsPanel />);

        // Act: Step 1 → Step 3
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert
        expect(container).toMatchSnapshot();
      });

      test('基礎練習モードのStep 4の見た目が一致する', async () => {
        // Arrange
        const user = userEvent.setup();
        const { container } = render(<SettingsPanel />);

        // Act: Step 1 → Step 3 → Step 4
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert
        expect(container).toMatchSnapshot();
      });
    });
  });

  describe('非基礎練習モード（通常動作）', () => {
    /**
     * 非基礎練習モード（preset-basic以外）では、
     * 全てのステップ（Step 1 → Step 2 → Step 3 → Step 4）を通常通り遷移します。
     */

    beforeEach(async () => {
      // 非基礎練習モードの設定でストアをモック（beforeEachで既に設定されているが、明示的に再定義）
      const { useGameStore } = await import('../../stores/gameStore');
      vi.mocked(useGameStore).mockImplementation((selector) =>
        selector({
          startPractice: mockStartPractice,
          goToDebugScreen: mockGoToDebugScreen,
          config: {
            configId: 'preset-player', // 非基礎練習モード
            configName: 'プレイヤー練習',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: 501,
            stdDevMM: 15,
            isPreset: true,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        } as never)
      );
    });

    describe('通常のステップ遷移', () => {
      test('Step 1 → Step 2 → Step 3 → Step 4 の順序で遷移する', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Assert: 初期状態（Step 1）
        expect(screen.getByTestId('step1-preset')).toBeInTheDocument();

        // Act & Assert: Step 1 → Step 2
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        expect(screen.getByTestId('step2-difficulty')).toBeInTheDocument();

        // Act & Assert: Step 2 → Step 3
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        expect(screen.getByTestId('step3-session')).toBeInTheDocument();

        // Act & Assert: Step 3 → Step 4
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        expect(screen.getByTestId('step4-confirm')).toBeInTheDocument();
      });

      test('Step 4 → Step 3 → Step 2 → Step 1 の順序で戻る', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Step 4まで進める
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        expect(screen.getByTestId('step4-confirm')).toBeInTheDocument();

        // Act & Assert: Step 4 → Step 3
        await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));
        expect(screen.getByTestId('step3-session')).toBeInTheDocument();

        // Act & Assert: Step 3 → Step 2
        await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));
        expect(screen.getByTestId('step2-difficulty')).toBeInTheDocument();

        // Act & Assert: Step 2 → Step 1
        await user.click(screen.getByRole('button', { name: '前のステップに戻る' }));
        expect(screen.getByTestId('step1-preset')).toBeInTheDocument();
      });
    });

    describe('進捗インジケーターの表示', () => {
      test('非基礎練習モードでは、Step 2がスキップクラスを持たない', () => {
        // Arrange & Act
        render(<SettingsPanel />);

        // Assert: Step 2はpendingクラスを持ち、skippedクラスを持たない
        const step2 = screen.getByTestId('progress-step-2');
        expect(step2).toHaveClass('setup-wizard__progress-step--pending');
        expect(step2).not.toHaveClass('setup-wizard__progress-step--skipped');
      });

      test('Step 2がアクティブ状態になる', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Act: Step 1 → Step 2
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert: Step 2がアクティブ
        expect(screen.getByTestId('progress-step-2')).toHaveClass(
          'setup-wizard__progress-step--active'
        );
        expect(screen.getByTestId('progress-step-2')).not.toHaveClass(
          'setup-wizard__progress-step--skipped'
        );
      });

      test('Step 2を通過後は完了状態になる', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SettingsPanel />);

        // Act: Step 1 → Step 2 → Step 3
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert: Step 2が完了状態
        expect(screen.getByTestId('progress-step-2')).toHaveClass(
          'setup-wizard__progress-step--completed'
        );
        expect(screen.getByTestId('progress-step-2')).not.toHaveClass(
          'setup-wizard__progress-step--skipped'
        );
      });
    });

    describe('スナップショットテスト', () => {
      test('非基礎練習モードのStep 2の見た目が一致する', async () => {
        // Arrange
        const user = userEvent.setup();
        const { container } = render(<SettingsPanel />);

        // Act: Step 1 → Step 2
        await user.click(screen.getByRole('button', { name: '次のステップへ進む' }));

        // Assert
        expect(container).toMatchSnapshot();
      });
    });
  });
});
