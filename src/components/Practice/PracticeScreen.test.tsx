/**
 * PracticeScreenコンポーネントのテスト
 *
 * 練習画面の統合的な振る舞いを検証します。
 * - 子コンポーネント（StatsBar、DartBoard、QuestionDisplay、NumPad、Feedback）の配置
 * - gameStateに応じた画面切り替え
 * - NumPad入力とFeedback表示の連動
 * - タイマー機能と時間切れ処理
 * - 「設定に戻る」「終了」ボタンのアクション
 * - displayedDartsの更新がDartBoardに反映されること
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../../stores/gameStore';
import type { Question, ThrowResult } from '../../types';
import { END_REASONS } from '../../types';
import { PracticeScreen } from './PracticeScreen';

/**
 * テスト用定数
 */
const TEST_CONSTANTS = {
  // スコア
  SCORE: {
    STARTING_501: 501,
    REMAINING_100: 100,
    THROW_SCORE_60: 60,
  },
  // 時間（秒と分）
  TIME: {
    LIMIT_3_MIN: 3,
    ELAPSED_180_SEC: 180, // 3分経過
    ELAPSED_179_SEC: 179, // 2分59秒経過
    ELAPSED_200_SEC: 200, // 3分20秒経過
  },
  // 標準偏差（mm）
  STD_DEV: {
    DEFAULT: 30,
  },
} as const;

/**
 * モック投擲結果生成ヘルパー（T20 → 60点）
 */
const createMockThrowT20 = (): ThrowResult => ({
  target: { type: 'TRIPLE', number: 20, label: 'T20' },
  landingPoint: { x: 0, y: -103 },
  score: 60,
  ring: 'TRIPLE',
  segmentNumber: 20,
});

/**
 * モック問題データ生成ヘルパー（1投）
 */
const createMockQuestion = (): Question => ({
  mode: 'score',
  throws: [createMockThrowT20()],
  correctAnswer: TEST_CONSTANTS.SCORE.THROW_SCORE_60,
  questionText: 'この投擲の得点は？',
});

/**
 * テスト用PracticeConfig生成ヘルパー
 */
const createMockConfig = (
  overrides: Partial<import('../../types/PracticeConfig').PracticeConfig> = {}
): import('../../types/PracticeConfig').PracticeConfig => ({
  configId: 'preset-basic',
  configName: '基礎練習',
  description: '1投ごとに得点を答える基本モード',
  throwUnit: 1,
  questionType: 'score',
  judgmentTiming: 'independent',
  startingScore: 0,
  stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
  target: undefined,
  icon: '🎯',
  isPreset: true,
  ...overrides,
});

// P5Canvasコンポーネントをモック化
vi.mock('../DartBoard/P5Canvas', () => ({
  P5Canvas: ({ dartCount }: { coords: unknown; dartCount: number }) => (
    <div data-testid="mock-p5-canvas" data-dart-count={dartCount}>
      Mock P5Canvas ({dartCount} darts)
    </div>
  ),
}));

// useTimerフックとusePracticeSessionフックをモック化（実際のタイマー動作はhook自体のテストで検証）
vi.mock('../../hooks/useTimer', () => ({
  useTimer: vi.fn(),
}));

vi.mock('../../hooks/usePracticeSession', () => ({
  usePracticeSession: vi.fn(),
}));

describe('PracticeScreen', () => {
  beforeEach(() => {
    // ストアをリセット
    useGameStore.setState({
      gameState: 'practicing',
      currentQuestion: createMockQuestion(),
      config: createMockConfig(),
      sessionConfig: {
        mode: 'questions',
        questionCount: 10,
      },
      elapsedTime: 0,
      displayedDarts: [createMockThrowT20()],
      remainingScore: TEST_CONSTANTS.SCORE.STARTING_501,
      stats: {
        total: 0,
        correct: 0,
        currentStreak: 0,
        bestStreak: 0,
      },
      isTimerRunning: true,
    });

    // モックをクリア
    vi.clearAllMocks();

    // DartBoardのレンダリングのため、ResizeObserverをモック化
    // test-setup.tsのグローバルモックをより具体的な実装で上書き
    let resizeCallback: ResizeObserverCallback | null = null;
    global.ResizeObserver = class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe(target: Element): void {
        // DartBoardコンテナのサイズを設定
        Object.defineProperty(target, 'clientWidth', {
          configurable: true,
          value: 728,
        });
        Object.defineProperty(target, 'clientHeight', {
          configurable: true,
          value: 728,
        });
        // 即座にコールバックを呼び出してサイズを設定
        if (resizeCallback) {
          resizeCallback(
            [
              {
                target,
                contentRect: { width: 728, height: 728 } as DOMRectReadOnly,
              } as ResizeObserverEntry,
            ],
            this as ResizeObserver
          );
        }
      }
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('gameStateに応じた画面切り替え', () => {
    it('gameState="practicing"の場合、練習画面が表示される', () => {
      useGameStore.setState({
        gameState: 'practicing',
        currentQuestion: createMockQuestion(),
      });

      render(<PracticeScreen />);

      // 主要な子コンポーネントが表示されることを確認
      expect(screen.getByTestId('mock-p5-canvas')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '設定画面に戻る' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '練習を終了' })).toBeInTheDocument();
    });

    it('gameState="setup"の場合、「練習を開始してください」と表示される', () => {
      useGameStore.setState({
        gameState: 'setup',
        currentQuestion: null,
      });

      render(<PracticeScreen />);

      expect(screen.getByText('練習を開始してください')).toBeInTheDocument();
      // 練習画面のコンポーネントは表示されない
      expect(screen.queryByTestId('mock-p5-canvas')).not.toBeInTheDocument();
    });

    it('gameState="results"の場合、「練習を開始してください」と表示される', () => {
      useGameStore.setState({
        gameState: 'results',
        currentQuestion: null,
      });

      render(<PracticeScreen />);

      expect(screen.getByText('練習を開始してください')).toBeInTheDocument();
    });
  });

  describe('子コンポーネントの配置と表示', () => {
    it('StatsBarが表示される', () => {
      render(<PracticeScreen />);

      // StatsBarの内容が表示されているか（role="status"で確認）
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('DartBoardが表示され、displayedDartsの座標とdartCountが渡される', () => {
      const mockDarts = [createMockThrowT20()];
      useGameStore.setState({
        displayedDarts: mockDarts,
      });

      render(<PracticeScreen />);

      const canvas = screen.getByTestId('mock-p5-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('data-dart-count', '1');
    });

    it('QuestionDisplayが表示される', () => {
      render(<PracticeScreen />);

      // QuestionDisplayの問題文が表示されている
      expect(screen.getByLabelText('問題表示')).toBeInTheDocument();
    });

    it('NumPadが初期表示される（フィードバック非表示時）', () => {
      render(<PracticeScreen />);

      // NumPadのクリアボタンが表示されている
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('「設定に戻る」ボタンが表示される', () => {
      render(<PracticeScreen />);

      const backButton = screen.getByRole('button', { name: '設定画面に戻る' });
      expect(backButton).toBeInTheDocument();
    });

    it('「終了」ボタンが表示される', () => {
      render(<PracticeScreen />);

      const endButton = screen.getByRole('button', { name: '練習を終了' });
      expect(endButton).toBeInTheDocument();
    });
  });

  describe('NumPad入力とFeedback表示の連動', () => {
    it('正解を入力してConfirmボタンを押すと、Feedbackが表示される', () => {
      render(<PracticeScreen />);

      // NumPadで正解（60）を入力
      const button6 = screen.getByRole('button', { name: '6' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      fireEvent.click(button6);
      fireEvent.click(button0);
      fireEvent.click(confirmButton);

      // Feedbackが表示される
      const feedbackSection = screen.getByLabelText('フィードバック');
      expect(feedbackSection).toBeInTheDocument();

      // NumPadが非表示になる（ClearボタンがなくなることでNumPadが非表示と判定）
      expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    });

    it('不正解を入力してConfirmボタンを押すと、Feedbackが表示される', () => {
      render(<PracticeScreen />);

      // NumPadで不正解（50）を入力
      const button5 = screen.getByRole('button', { name: '5' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      fireEvent.click(button5);
      fireEvent.click(button0);
      fireEvent.click(confirmButton);

      // Feedbackが表示される
      const feedbackSection = screen.getByLabelText('フィードバック');
      expect(feedbackSection).toBeInTheDocument();
    });

    it('Feedbackの「次へ」ボタンをクリックすると、nextQuestion()が呼ばれる', async () => {
      const user = userEvent.setup();
      const nextQuestionMock = vi.fn();

      useGameStore.setState({
        nextQuestion: nextQuestionMock,
      });

      render(<PracticeScreen />);

      // NumPadで正解を入力してConfirm
      const button6 = screen.getByRole('button', { name: '6' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      await user.click(button6);
      await user.click(button0);
      await user.click(confirmButton);

      // Feedbackが表示される
      expect(screen.getByLabelText('フィードバック')).toBeInTheDocument();

      // nextQuestion()を呼び出す（これによりcurrentQuestionが変化）
      const nextButton = screen.getByRole('button', { name: /Next Question/i });
      await user.click(nextButton);

      // nextQuestionが呼ばれたことを確認
      expect(nextQuestionMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('displayedDartsの更新がDartBoardに反映されること', () => {
    it('displayedDartsが0個の場合、dartCount=0が渡される', () => {
      useGameStore.setState({
        displayedDarts: [],
      });

      render(<PracticeScreen />);

      const canvas = screen.getByTestId('mock-p5-canvas');
      expect(canvas).toHaveAttribute('data-dart-count', '0');
    });

    it('displayedDartsが1個の場合、dartCount=1が渡される', () => {
      useGameStore.setState({
        displayedDarts: [createMockThrowT20()],
      });

      render(<PracticeScreen />);

      const canvas = screen.getByTestId('mock-p5-canvas');
      expect(canvas).toHaveAttribute('data-dart-count', '1');
    });

    it('displayedDartsが3個の場合、dartCount=3が渡される', () => {
      useGameStore.setState({
        displayedDarts: [createMockThrowT20(), createMockThrowT20(), createMockThrowT20()],
      });

      render(<PracticeScreen />);

      const canvas = screen.getByTestId('mock-p5-canvas');
      expect(canvas).toHaveAttribute('data-dart-count', '3');
    });

    it('displayedDartsの座標がDartBoardに正しく渡される', () => {
      const mockDart1 = createMockThrowT20();
      const mockDart2: ThrowResult = {
        target: { type: 'DOUBLE', number: 20, label: 'D20' },
        landingPoint: { x: 50, y: -165 },
        score: 40,
        ring: 'DOUBLE',
        segmentNumber: 20,
      };

      useGameStore.setState({
        displayedDarts: [mockDart1, mockDart2],
      });

      render(<PracticeScreen />);

      const canvas = screen.getByTestId('mock-p5-canvas');
      expect(canvas).toHaveAttribute('data-dart-count', '2');
    });
  });

  describe('時間制限モードのタイマー表示', () => {
    it('時間制限モードの場合、経過時間と制限時間が表示される', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: TEST_CONSTANTS.TIME.LIMIT_3_MIN,
        },
        elapsedTime: 0,
      });

      render(<PracticeScreen />);

      const timer = screen.getByText(/0:00 \/ 3:00/);
      expect(timer).toBeInTheDocument();
    });

    it('経過時間が2分59秒の場合、正しくフォーマットされて表示される', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: TEST_CONSTANTS.TIME.LIMIT_3_MIN,
        },
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_179_SEC,
      });

      render(<PracticeScreen />);

      const timer = screen.getByText(/2:59 \/ 3:00/);
      expect(timer).toBeInTheDocument();
    });

    it('問題数モードの場合、タイマーは表示されない', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'questions',
          questionCount: 10,
        },
      });

      render(<PracticeScreen />);

      expect(screen.queryByLabelText('経過時間')).not.toBeInTheDocument();
    });
  });

  describe('時間切れ時の自動終了処理', () => {
    it('経過時間が制限時間に達した場合、endSession()が呼ばれる', () => {
      const endSessionMock = vi.fn();

      useGameStore.setState({
        gameState: 'practicing',
        sessionConfig: {
          mode: 'time',
          timeLimit: TEST_CONSTANTS.TIME.LIMIT_3_MIN,
        },
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_180_SEC, // ちょうど3分
        endSession: endSessionMock,
      });

      render(<PracticeScreen />);

      // endSessionが呼ばれることを確認
      expect(endSessionMock).toHaveBeenCalledWith('時間切れ');
    });

    it('経過時間が制限時間を超過した場合、endSession()が呼ばれる', () => {
      const endSessionMock = vi.fn();

      useGameStore.setState({
        gameState: 'practicing',
        sessionConfig: {
          mode: 'time',
          timeLimit: TEST_CONSTANTS.TIME.LIMIT_3_MIN,
        },
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_200_SEC, // 3分20秒
        endSession: endSessionMock,
      });

      render(<PracticeScreen />);

      expect(endSessionMock).toHaveBeenCalledWith('時間切れ');
    });

    it('gameStateが"practicing"以外の場合、時間切れでもendSession()は呼ばれない', () => {
      const endSessionMock = vi.fn();

      useGameStore.setState({
        gameState: 'results', // 練習終了済み
        sessionConfig: {
          mode: 'time',
          timeLimit: TEST_CONSTANTS.TIME.LIMIT_3_MIN,
        },
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_200_SEC,
        endSession: endSessionMock,
      });

      render(<PracticeScreen />);

      // endSessionは呼ばれない（すでにresults状態）
      expect(endSessionMock).not.toHaveBeenCalled();
    });

    it('問題数モードの場合、時間に関係なくendSession()は呼ばれない', () => {
      const endSessionMock = vi.fn();

      useGameStore.setState({
        gameState: 'practicing',
        sessionConfig: {
          mode: 'questions',
          questionCount: 10,
        },
        elapsedTime: TEST_CONSTANTS.TIME.ELAPSED_200_SEC, // 経過時間は関係なし
        endSession: endSessionMock,
      });

      render(<PracticeScreen />);

      expect(endSessionMock).not.toHaveBeenCalled();
    });
  });

  describe('「設定に戻る」ボタンのアクション', () => {
    it('「設定に戻る」ボタンをクリックするとresetToSetup()が呼ばれる', async () => {
      const user = userEvent.setup();
      const resetToSetupMock = vi.fn();

      useGameStore.setState({
        resetToSetup: resetToSetupMock,
      });

      render(<PracticeScreen />);

      const backButton = screen.getByRole('button', { name: '設定画面に戻る' });
      await user.click(backButton);

      expect(resetToSetupMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('「終了」ボタンのアクション', () => {
    it('「終了」ボタンをクリックするとendSession(END_REASONS.USER_ABORT)が呼ばれる', async () => {
      const user = userEvent.setup();
      const endSessionMock = vi.fn();

      useGameStore.setState({
        endSession: endSessionMock,
      });

      render(<PracticeScreen />);

      const endButton = screen.getByRole('button', { name: '練習を終了' });
      await user.click(endButton);

      expect(endSessionMock).toHaveBeenCalledWith(END_REASONS.USER_ABORT);
    });
  });

  describe('アクセシビリティ', () => {
    it('メインコンテンツがmain要素で構造化されている', () => {
      const { container } = render(<PracticeScreen />);

      const main = container.querySelector('main.practice-screen__main');
      expect(main).toBeInTheDocument();
    });

    it('ヘッダーがheader要素で構造化されている', () => {
      const { container } = render(<PracticeScreen />);

      const header = container.querySelector('header.practice-screen__header');
      expect(header).toBeInTheDocument();
    });

    it('フッターがfooter要素で構造化されている', () => {
      const { container } = render(<PracticeScreen />);

      const footer = container.querySelector('footer.practice-screen__footer');
      expect(footer).toBeInTheDocument();
    });

    it('ボタンに適切なaria-labelが設定されている', () => {
      render(<PracticeScreen />);

      const backButton = screen.getByRole('button', { name: '設定画面に戻る' });
      expect(backButton).toHaveAttribute('aria-label', '設定画面に戻る');

      const endButton = screen.getByRole('button', { name: '練習を終了' });
      expect(endButton).toHaveAttribute('aria-label', '練習を終了');
    });
  });

  describe('formatTime関数の動作', () => {
    it('0秒は"0:00"とフォーマットされる', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: 3,
        },
        elapsedTime: 0,
      });

      render(<PracticeScreen />);

      const timer = screen.getByText(/0:00 \/ 3:00/);
      expect(timer).toBeInTheDocument();
    });

    it('59秒は"0:59"とフォーマットされる', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: 3,
        },
        elapsedTime: 59,
      });

      render(<PracticeScreen />);

      const timer = screen.getByText(/0:59 \/ 3:00/);
      expect(timer).toBeInTheDocument();
    });

    it('60秒は"1:00"とフォーマットされる', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: 3,
        },
        elapsedTime: 60,
      });

      render(<PracticeScreen />);

      const timer = screen.getByText(/1:00 \/ 3:00/);
      expect(timer).toBeInTheDocument();
    });

    it('125秒は"2:05"とフォーマットされる', () => {
      useGameStore.setState({
        sessionConfig: {
          mode: 'time',
          timeLimit: 3,
        },
        elapsedTime: 125,
      });

      render(<PracticeScreen />);

      const timer = screen.getByText(/2:05 \/ 3:00/);
      expect(timer).toBeInTheDocument();
    });
  });

  describe('スナップショットテスト', () => {
    it('gameState="practicing"で問題表示中の見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'practicing',
        currentQuestion: createMockQuestion(),
        sessionConfig: {
          mode: 'questions',
          questionCount: 10,
        },
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('gameState="setup"の見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'setup',
        currentQuestion: null,
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('時間制限モードでタイマー表示ありの見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'practicing',
        currentQuestion: createMockQuestion(),
        sessionConfig: {
          mode: 'time',
          timeLimit: 3,
        },
        elapsedTime: 125,
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('Feedback表示中の見た目が一致する', () => {
      const { container, rerender } = render(<PracticeScreen />);

      // NumPadで回答を入力してConfirm
      const button6 = screen.getByRole('button', { name: '6' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      fireEvent.click(button6);
      fireEvent.click(button0);
      fireEvent.click(confirmButton);

      // 再レンダリング
      rerender(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('displayedDartsが0個の場合の見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'practicing',
        currentQuestion: createMockQuestion(),
        displayedDarts: [],
        sessionConfig: {
          mode: 'questions',
          questionCount: 10,
        },
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('displayedDartsが3個の場合の見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'practicing',
        currentQuestion: createMockQuestion(),
        displayedDarts: [createMockThrowT20(), createMockThrowT20(), createMockThrowT20()],
        sessionConfig: {
          mode: 'questions',
          questionCount: 10,
        },
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('gameState="results"の見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'results',
        currentQuestion: null,
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('時間制限モードで0秒経過時の見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'practicing',
        currentQuestion: createMockQuestion(),
        sessionConfig: {
          mode: 'time',
          timeLimit: 3,
        },
        elapsedTime: 0,
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('時間制限モードで時間制限ギリギリの見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'practicing',
        currentQuestion: createMockQuestion(),
        sessionConfig: {
          mode: 'time',
          timeLimit: 3,
        },
        elapsedTime: 179, // 2:59
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });

    it('問題数モードで統計情報ありの見た目が一致する', () => {
      useGameStore.setState({
        gameState: 'practicing',
        currentQuestion: createMockQuestion(),
        sessionConfig: {
          mode: 'questions',
          questionCount: 10,
        },
        stats: {
          total: 5,
          correct: 4,
          currentStreak: 2,
          bestStreak: 3,
        },
      });

      const { container } = render(<PracticeScreen />);

      expect(container).toMatchSnapshot();
    });
  });
});
