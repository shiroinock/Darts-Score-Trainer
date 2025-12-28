/**
 * Feedbackコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../../stores/gameStore';
import type { Question } from '../../types/Question';
import type { ThrowResult } from '../../types/ThrowResult';
import { FEEDBACK_ICONS } from '../../utils/constants/feedbackIcons';
import { Feedback } from './Feedback';

/**
 * テスト用定数
 */
const TEST_CONSTANTS = {
  // スコア
  SCORE: {
    STARTING_501: 501,
    REMAINING_100: 100,
    REMAINING_40: 40,
    REMAINING_0: 0,
    SINGLE_THROW: 60,
    THREE_THROWS: 100,
  },
  // 連続正解数
  STREAK: {
    FIRST: 1,
    FIVE: 5,
    TEN: 10,
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
 * モック投擲結果生成ヘルパー（D20 → 40点）
 */
const createMockThrowD20 = (): ThrowResult => ({
  target: { type: 'DOUBLE', number: 20, label: 'D20' },
  landingPoint: { x: 0, y: -165 },
  score: 40,
  ring: 'DOUBLE',
  segmentNumber: 20,
});

/**
 * モック問題データ生成ヘルパー（1投）
 */
const createMockQuestionSingleThrow = (): Question => ({
  mode: 'score',
  throws: [createMockThrowT20()],
  correctAnswer: TEST_CONSTANTS.SCORE.SINGLE_THROW,
  questionText: 'この投擲の得点は？',
});

/**
 * モック問題データ生成ヘルパー（3投）
 */
const createMockQuestionThreeThrows = (): Question => ({
  mode: 'score',
  throws: [createMockThrowT20(), createMockThrowD20(), createMockThrowT20()],
  correctAnswer: 160,
  questionText: '3投の合計得点は？',
});

/**
 * モック問題データ生成ヘルパー（残り点数モード）
 */
const createMockQuestionRemaining = (startingScore: number, totalScore: number): Question => ({
  mode: 'remaining',
  throws: [createMockThrowT20()],
  correctAnswer: startingScore - totalScore,
  questionText: '残り点数は？',
  startingScore,
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

describe('Feedback', () => {
  beforeEach(() => {
    // ストアをリセット
    useGameStore.setState({
      currentQuestion: null,
      remainingScore: 0,
      stats: {
        total: 0,
        correct: 0,
        currentStreak: 0,
        bestStreak: 0,
      },
      config: createMockConfig(),
    });
  });

  describe('問題が存在しない場合', () => {
    it('何も表示されない（nullを返す）', () => {
      useGameStore.setState({ currentQuestion: null });

      const { container } = render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('正解時の表示', () => {
    beforeEach(() => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.STARTING_501,
      });
    });

    it('✓アイコンと「正解」テキストが表示される', () => {
      const { container } = render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.getByText(FEEDBACK_ICONS.correct)).toBeInTheDocument();

      // feedback__textクラスに「正解」が含まれることを検証
      const feedbackText = container.querySelector('.feedback__text');
      expect(feedbackText).toHaveTextContent('正解');
    });

    it('正解の数値が表示される', () => {
      const { container } = render(<Feedback userAnswer={60} isCorrect={true} />);

      // dt要素に「正解」ラベルが表示される
      const answerLabel = container.querySelector('dt.feedback__answer-label');
      expect(answerLabel).toHaveTextContent('正解');

      // dd要素に正解の数値が表示される
      const answerValue = container.querySelector('dd.feedback__answer-value');
      expect(answerValue).toHaveTextContent('60');
    });

    it('スコア詳細（T20 → 60点）が表示される', () => {
      render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.getByText(/T20.*60点/)).toBeInTheDocument();
    });

    it('連続正解数が1回の場合「1回連続正解！」と表示される', () => {
      useGameStore.setState({
        stats: {
          total: 1,
          correct: 1,
          currentStreak: TEST_CONSTANTS.STREAK.FIRST,
          bestStreak: TEST_CONSTANTS.STREAK.FIRST,
        },
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.getByText(/1回連続正解/)).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('連続正解数が5回の場合「5回連続正解！」と表示される', () => {
      useGameStore.setState({
        stats: {
          total: 5,
          correct: 5,
          currentStreak: TEST_CONSTANTS.STREAK.FIVE,
          bestStreak: TEST_CONSTANTS.STREAK.FIVE,
        },
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.getByText(/5回連続正解/)).toBeInTheDocument();
    });

    it('正解だがcurrentStreakが0の場合、連続正解表示は表示されない', () => {
      useGameStore.setState({
        stats: {
          total: 1,
          correct: 1,
          currentStreak: 0,
          bestStreak: 0,
        },
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.queryByText(/連続正解/)).not.toBeInTheDocument();
      expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    });
  });

  describe('不正解時の表示', () => {
    beforeEach(() => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.STARTING_501,
      });
    });

    it('✗アイコンと「不正解」テキストが表示される', () => {
      render(<Feedback userAnswer={50} isCorrect={false} />);

      expect(screen.getByText(FEEDBACK_ICONS.incorrect)).toBeInTheDocument();
      expect(screen.getByText('不正解')).toBeInTheDocument();
    });

    it('正解の数値が表示される', () => {
      render(<Feedback userAnswer={50} isCorrect={false} />);

      expect(screen.getByText('60')).toBeInTheDocument();
    });

    it('連続正解表示は表示されない', () => {
      useGameStore.setState({
        stats: {
          total: 2,
          correct: 1,
          currentStreak: 0, // 不正解でリセット
          bestStreak: 1,
        },
      });

      render(<Feedback userAnswer={50} isCorrect={false} />);

      expect(screen.queryByText(/連続正解/)).not.toBeInTheDocument();
      expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    });
  });

  describe('スコア詳細の表示', () => {
    it('1投の場合「T20 → 60点」形式で表示される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.getByText(/T20.*→.*60点/)).toBeInTheDocument();
    });

    it('3投の場合「T20 (60点) + D20 (40点) + T20 (60点) = 160点」形式で表示される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionThreeThrows(),
      });

      render(<Feedback userAnswer={160} isCorrect={true} />);

      expect(screen.getByText(/T20.*60点.*D20.*40点.*T20.*60点.*160点/)).toBeInTheDocument();
    });
  });

  describe('ゲームクリア時の表示', () => {
    it('残り0点到達時に「ゲームクリア！」が表示される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionRemaining(
          TEST_CONSTANTS.SCORE.REMAINING_40,
          TEST_CONSTANTS.SCORE.REMAINING_40
        ),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_0,
        config: createMockConfig({
          questionType: 'remaining',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
        }),
      });

      render(<Feedback userAnswer={0} isCorrect={true} />);

      expect(screen.getByText('ゲームクリア！')).toBeInTheDocument();
      expect(screen.getByText('おめでとうございます！')).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    it('ゲームクリア時は「次へ」ボタンが表示されない', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionRemaining(
          TEST_CONSTANTS.SCORE.REMAINING_40,
          TEST_CONSTANTS.SCORE.REMAINING_40
        ),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_0,
        config: createMockConfig({
          questionType: 'remaining',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
        }),
      });

      render(<Feedback userAnswer={0} isCorrect={true} />);

      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
      expect(screen.queryByText('次へ')).not.toBeInTheDocument();
    });

    it('scoreモードでは残り0点でもゲームクリア表示はされない', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_0,
        config: createMockConfig({
          questionType: 'score',
          startingScore: 0,
        }),
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.queryByText('ゲームクリア！')).not.toBeInTheDocument();
    });

    it('startingScore=0の場合はゲームクリア表示されない', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_0,
        config: createMockConfig({
          questionType: 'remaining',
          startingScore: 0,
        }),
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.queryByText('ゲームクリア！')).not.toBeInTheDocument();
    });
  });

  describe('「次へ」ボタンのクリック動作', () => {
    it('「次へ」ボタンをクリックするとnextQuestion()が呼ばれる', async () => {
      const user = userEvent.setup();
      const nextQuestionSpy = vi.fn();

      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_100,
        nextQuestion: nextQuestionSpy,
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(nextQuestionSpy).toHaveBeenCalledTimes(1);
    });

    it('「次へ」ボタンが通常時に表示される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_100,
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText('次へ')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('section要素にaria-label="フィードバック"が設定されている', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      const section = screen.getByLabelText('フィードバック');
      expect(section.tagName).toBe('SECTION');
    });

    it('正誤アイコンにaria-hidden="true"が設定されている', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
      });

      const { container } = render(<Feedback userAnswer={60} isCorrect={true} />);

      const icon = container.querySelector('.feedback__icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('「次へ」ボタンにaria-label="Next Question"が設定されている', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_100,
      });

      render(<Feedback userAnswer={60} isCorrect={true} />);

      const nextButton = screen.getByRole('button', { name: /next question/i });
      expect(nextButton).toHaveAttribute('aria-label', 'Next Question');
    });

    it('正解表示がdl/dt/dd要素で構造化されている', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
      });

      const { container } = render(<Feedback userAnswer={60} isCorrect={true} />);

      const dl = container.querySelector('dl.feedback__answer-item');
      expect(dl).toBeInTheDocument();

      const dt = container.querySelector('dt.feedback__answer-label');
      expect(dt).toHaveTextContent('正解');

      const dd = container.querySelector('dd.feedback__answer-value');
      expect(dd).toHaveTextContent('60');
    });
  });

  describe('CSS class名の検証', () => {
    it('正解時にfeedback__result--correctクラスが適用される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
      });

      const { container } = render(<Feedback userAnswer={60} isCorrect={true} />);

      const resultElement = container.querySelector('.feedback__result--correct');
      expect(resultElement).toBeInTheDocument();
    });

    it('不正解時にfeedback__result--incorrectクラスが適用される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
      });

      const { container } = render(<Feedback userAnswer={50} isCorrect={false} />);

      const resultElement = container.querySelector('.feedback__result--incorrect');
      expect(resultElement).toBeInTheDocument();
    });
  });

  describe('スナップショットテスト', () => {
    it('正解時（連続正解あり）の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_100,
        stats: {
          total: 5,
          correct: 5,
          currentStreak: TEST_CONSTANTS.STREAK.FIVE,
          bestStreak: TEST_CONSTANTS.STREAK.FIVE,
        },
      });

      const { container } = render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(container).toMatchSnapshot();
    });

    it('正解時（連続正解なし）の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_100,
        stats: {
          total: 1,
          correct: 1,
          currentStreak: 0,
          bestStreak: 0,
        },
      });

      const { container } = render(<Feedback userAnswer={60} isCorrect={true} />);

      expect(container).toMatchSnapshot();
    });

    it('不正解時の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionSingleThrow(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_100,
        stats: {
          total: 2,
          correct: 1,
          currentStreak: 0,
          bestStreak: 1,
        },
      });

      const { container } = render(<Feedback userAnswer={50} isCorrect={false} />);

      expect(container).toMatchSnapshot();
    });

    it('3投の場合のスコア詳細表示の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionThreeThrows(),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_100,
      });

      const { container } = render(<Feedback userAnswer={160} isCorrect={true} />);

      expect(container).toMatchSnapshot();
    });

    it('ゲームクリア時の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestionRemaining(
          TEST_CONSTANTS.SCORE.REMAINING_40,
          TEST_CONSTANTS.SCORE.REMAINING_40
        ),
        remainingScore: TEST_CONSTANTS.SCORE.REMAINING_0,
        config: createMockConfig({
          questionType: 'remaining',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
        }),
      });

      const { container } = render(<Feedback userAnswer={0} isCorrect={true} />);

      expect(container).toMatchSnapshot();
    });
  });
});
