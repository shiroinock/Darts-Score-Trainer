/**
 * QuestionDisplayコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../../stores/gameStore';
import type { Question } from '../../types/Question';
import { QuestionDisplay } from './QuestionDisplay';

/**
 * テスト用定数
 */
const TEST_CONSTANTS = {
  // 標準偏差（mm）
  STD_DEV: {
    DEFAULT: 30,
  },
  // スコア
  SCORE: {
    STARTING_501: 501,
    STARTING_0: 0,
  },
} as const;

/**
 * モック問題データ生成ヘルパー
 */
const createMockQuestion = (): Question => ({
  mode: 'score',
  throws: [
    {
      target: { type: 'TRIPLE', number: 20, label: 'T20' },
      landingPoint: { x: 0, y: -103 },
      score: 60,
    },
  ],
  correctAnswer: 60,
  questionText: 'この投擲の得点は？',
});

describe('QuestionDisplay', () => {
  beforeEach(() => {
    // ストアをリセット
    useGameStore.setState({
      currentQuestion: null,
      currentThrowIndex: 1,
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

  describe('問題が存在しない場合', () => {
    it('「問題を生成中...」と表示される', () => {
      // currentQuestion が null の状態
      useGameStore.setState({ currentQuestion: null });

      render(<QuestionDisplay />);

      expect(screen.getByText('問題を生成中...')).toBeInTheDocument();
    });

    it('aria-label="問題表示"が設定されている', () => {
      useGameStore.setState({ currentQuestion: null });

      render(<QuestionDisplay />);

      const section = screen.getByLabelText('問題表示');
      expect(section).toBeInTheDocument();
    });
  });

  describe('questionType による問題文の変化', () => {
    describe('scoreモード（1投単位）', () => {
      it('「この投擲の得点は？」と表示される', () => {
        useGameStore.setState({
          currentQuestion: createMockQuestion(),
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

        render(<QuestionDisplay />);

        expect(screen.getByText('この投擲の得点は？')).toBeInTheDocument();
      });
    });

    describe('scoreモード（3投単位）', () => {
      it('「3投の合計得点は？」と表示される', () => {
        useGameStore.setState({
          currentQuestion: createMockQuestion(),
          config: {
            configId: 'preset-player',
            configName: 'プレイヤー練習',
            description: '3投ごとに得点を答える',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
            stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
            target: undefined,
            icon: '🎮',
            isPreset: true,
          },
        });

        render(<QuestionDisplay />);

        expect(screen.getByText('3投の合計得点は？')).toBeInTheDocument();
      });
    });

    describe('remainingモード', () => {
      it('「残り点数は？」と表示される', () => {
        useGameStore.setState({
          currentQuestion: {
            mode: 'remaining',
            throws: [],
            correctAnswer: 441,
            questionText: '残り点数は？',
            startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
          },
          config: {
            configId: 'preset-caller-basic',
            configName: 'コーラー基礎',
            description: '3投ごとに残り点数を答える',
            throwUnit: 3,
            questionType: 'remaining',
            judgmentTiming: 'independent',
            startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
            stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
            target: undefined,
            icon: '🎤',
            isPreset: true,
          },
        });

        render(<QuestionDisplay />);

        expect(screen.getByText('残り点数は？')).toBeInTheDocument();
      });
    });

    describe('bothモード', () => {
      it('「3投の合計得点は？」と「残り点数は？」の両方が表示される（3投）', () => {
        useGameStore.setState({
          currentQuestion: {
            mode: 'both',
            throws: [],
            correctAnswer: 60,
            questionText: '3投の合計得点は？ / 残り点数は？',
            startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
          },
          config: {
            configId: 'preset-comprehensive',
            configName: '総合練習',
            description: '得点と残り点数の両方を答える',
            throwUnit: 3,
            questionType: 'both',
            judgmentTiming: 'cumulative',
            startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
            stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
            target: undefined,
            icon: '🏆',
            isPreset: true,
          },
        });

        render(<QuestionDisplay />);

        expect(screen.getByText('3投の合計得点は？')).toBeInTheDocument();
        expect(screen.getByText('残り点数は？')).toBeInTheDocument();
      });

      it('「この投擲の得点は？」と「残り点数は？」の両方が表示される（1投）', () => {
        useGameStore.setState({
          currentQuestion: {
            mode: 'both',
            throws: [],
            correctAnswer: 60,
            questionText: 'この投擲の得点は？ / 残り点数は？',
            startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
          },
          config: {
            configId: 'custom-both-1throw',
            configName: 'カスタム練習',
            description: '1投で両方を答える',
            throwUnit: 1,
            questionType: 'both',
            judgmentTiming: 'independent',
            startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
            stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
            target: undefined,
            isPreset: false,
          },
        });

        render(<QuestionDisplay />);

        expect(screen.getByText('この投擲の得点は？')).toBeInTheDocument();
        expect(screen.getByText('残り点数は？')).toBeInTheDocument();
      });
    });
  });

  describe('投擲単位表示（3投モード）', () => {
    beforeEach(() => {
      // 3投モードに設定
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        config: {
          configId: 'preset-player',
          configName: 'プレイヤー練習',
          description: '3投ごとに得点を答える',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎮',
          isPreset: true,
        },
      });
    });

    it('currentThrowIndex = 1 のとき「1本目」と表示される', () => {
      useGameStore.setState({ currentThrowIndex: 1 });

      render(<QuestionDisplay />);

      expect(screen.getByText('1本目')).toBeInTheDocument();
    });

    it('currentThrowIndex = 2 のとき「2本目」と表示される', () => {
      useGameStore.setState({ currentThrowIndex: 2 });

      render(<QuestionDisplay />);

      expect(screen.getByText('2本目')).toBeInTheDocument();
    });

    it('currentThrowIndex = 3 のとき「3本目」と表示される', () => {
      useGameStore.setState({ currentThrowIndex: 3 });

      render(<QuestionDisplay />);

      expect(screen.getByText('3本目')).toBeInTheDocument();
    });
  });

  describe('投擲単位表示（1投モード）', () => {
    it('1投モードでは投擲単位表示が表示されない', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        currentThrowIndex: 1,
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

      render(<QuestionDisplay />);

      expect(screen.queryByText('1本目')).not.toBeInTheDocument();
      expect(screen.queryByText('2本目')).not.toBeInTheDocument();
      expect(screen.queryByText('3本目')).not.toBeInTheDocument();
    });
  });

  describe('判定タイミング表示', () => {
    it('cumulative + 3投モード の場合、「合計」ラベルが表示される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        currentThrowIndex: 2,
        config: {
          configId: 'preset-caller-cumulative',
          configName: 'コーラー累積',
          description: '累積で判定する練習',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎯',
          isPreset: true,
        },
      });

      render(<QuestionDisplay />);

      expect(screen.getByText('合計')).toBeInTheDocument();
    });

    it('independent + 3投モード の場合、「合計」ラベルは表示されない', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        currentThrowIndex: 2,
        config: {
          configId: 'preset-player',
          configName: 'プレイヤー練習',
          description: '独立で判定する練習',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎮',
          isPreset: true,
        },
      });

      render(<QuestionDisplay />);

      expect(screen.queryByText('合計')).not.toBeInTheDocument();
    });

    it('cumulative + 1投モード の場合、「合計」ラベルは表示されない', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        currentThrowIndex: 1,
        config: {
          configId: 'custom-cumulative-1throw',
          configName: 'カスタム練習',
          description: '1投で累積判定（通常は使用しない組み合わせ）',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          isPreset: false,
        },
      });

      render(<QuestionDisplay />);

      // 1投モードでは累積ラベルは表示されない
      expect(screen.queryByText('合計')).not.toBeInTheDocument();
    });
  });

  describe('複合条件の検証', () => {
    it('3投モード + cumulative + currentThrowIndex=2 で、「2本目」と「合計」の両方が表示される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        currentThrowIndex: 2,
        config: {
          configId: 'preset-caller-cumulative',
          configName: 'コーラー累積',
          description: '累積で判定する練習',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎯',
          isPreset: true,
        },
      });

      render(<QuestionDisplay />);

      expect(screen.getByText('2本目')).toBeInTheDocument();
      expect(screen.getByText('合計')).toBeInTheDocument();
    });

    it('3投モード + cumulative + bothモード で、「合計」と2つの質問文が表示される', () => {
      useGameStore.setState({
        currentQuestion: {
          mode: 'both',
          throws: [],
          correctAnswer: 60,
          questionText: '3投の合計得点は？ / 残り点数は？',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
        },
        currentThrowIndex: 1,
        config: {
          configId: 'preset-comprehensive',
          configName: '総合練習',
          description: '累積で両方を答える',
          throwUnit: 3,
          questionType: 'both',
          judgmentTiming: 'cumulative',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🏆',
          isPreset: true,
        },
      });

      render(<QuestionDisplay />);

      expect(screen.getByText('1本目')).toBeInTheDocument();
      expect(screen.getByText('合計')).toBeInTheDocument();
      expect(screen.getByText('3投の合計得点は？')).toBeInTheDocument();
      expect(screen.getByText('残り点数は？')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('section要素にaria-label="問題表示"が設定されている', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
      });

      render(<QuestionDisplay />);

      const section = screen.getByLabelText('問題表示');
      expect(section.tagName).toBe('SECTION');
    });

    it('問題文はh3要素で表示される', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
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

      const { container } = render(<QuestionDisplay />);

      const h3Elements = container.querySelectorAll('h3.question-display__text');
      expect(h3Elements.length).toBeGreaterThan(0);
    });
  });

  describe('スナップショットテスト', () => {
    it('問題が存在しない場合の見た目が一致する', () => {
      useGameStore.setState({ currentQuestion: null });

      const { container } = render(<QuestionDisplay />);

      expect(container).toMatchSnapshot();
    });

    it('1投モード + scoreモード の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        currentThrowIndex: 1,
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

      const { container } = render(<QuestionDisplay />);

      expect(container).toMatchSnapshot();
    });

    it('3投モード + scoreモード + 2本目 の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        currentThrowIndex: 2,
        config: {
          configId: 'preset-player',
          configName: 'プレイヤー練習',
          description: '3投ごとに得点を答える',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎮',
          isPreset: true,
        },
      });

      const { container } = render(<QuestionDisplay />);

      expect(container).toMatchSnapshot();
    });

    it('remainingモード の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: {
          mode: 'remaining',
          throws: [],
          correctAnswer: 441,
          questionText: '残り点数は？',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
        },
        config: {
          configId: 'preset-caller-basic',
          configName: 'コーラー基礎',
          description: '3投ごとに残り点数を答える',
          throwUnit: 3,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎤',
          isPreset: true,
        },
      });

      const { container } = render(<QuestionDisplay />);

      expect(container).toMatchSnapshot();
    });

    it('bothモード（3投）の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: {
          mode: 'both',
          throws: [],
          correctAnswer: 60,
          questionText: '3投の合計得点は？ / 残り点数は？',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
        },
        currentThrowIndex: 1,
        config: {
          configId: 'preset-comprehensive',
          configName: '総合練習',
          description: '得点と残り点数の両方を答える',
          throwUnit: 3,
          questionType: 'both',
          judgmentTiming: 'cumulative',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_501,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🏆',
          isPreset: true,
        },
      });

      const { container } = render(<QuestionDisplay />);

      expect(container).toMatchSnapshot();
    });

    it('cumulative + 3投モード + 3本目 + 合計ラベル表示 の見た目が一致する', () => {
      useGameStore.setState({
        currentQuestion: createMockQuestion(),
        currentThrowIndex: 3,
        config: {
          configId: 'preset-caller-cumulative',
          configName: 'コーラー累積',
          description: '累積で判定する練習',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: TEST_CONSTANTS.SCORE.STARTING_0,
          stdDevMM: TEST_CONSTANTS.STD_DEV.DEFAULT,
          target: undefined,
          icon: '🎯',
          isPreset: true,
        },
      });

      const { container } = render(<QuestionDisplay />);

      expect(container).toMatchSnapshot();
    });
  });
});
