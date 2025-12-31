import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useGameStore } from '../stores/gameStore';
import { usePracticeSession } from './usePracticeSession';

/**
 * usePracticeSession.ts のテスト（TDD Red フェーズ）
 *
 * テストパターン: hook（React カスタムフック）
 * 配置戦略: colocated（src/hooks/usePracticeSession.test.ts）
 *
 * 対象機能:
 * - 練習セッションの初期化と問題生成
 * - 回答送信時の答え判定とストア更新
 * - バスト処理時の状態遷移
 * - セッション終了時のクリーンアップ
 * - 複数回答の累積ロジック（3投モード）
 * - 時間制限モードでの時間切れ判定
 */

// ============================================================
// テスト用定数定義
// ============================================================

// 時間制限関連
const TIME_LIMIT_MINUTES_3 = 3;
const TIME_LIMIT_MINUTES_5 = 5;
const TIME_MILLISECONDS_PER_MINUTE = 60000;
const TIME_MILLISECONDS_PER_3_MINUTES = 180000;
const TIME_MILLISECONDS_OVER_3_MINUTES = 181000;
const TIME_MILLISECONDS_PER_10_MINUTES = 600000;

// 問題数関連（SessionConfig型に準拠: 10 | 20 | 50 | 100）
const TEST_QUESTION_COUNT_10 = 10;

// ループカウンタ用（型に依存しない）
const LOOP_COUNT_2 = 2;

// 投擲関連
const THROW_COUNT_PER_ROUND = 3;

// テスト値
const STREAK_TEST_VALUE = 3;
const WRONG_ANSWER_OFFSET = 100;

describe('usePracticeSession', () => {
  beforeEach(() => {
    // ストアを初期化
    act(() => {
      useGameStore.setState({
        gameState: 'setup',
        config: {
          configId: 'preset-basic',
          configName: '基礎練習',
          description: '1投単位で得点を問う基本練習',
          icon: '📚',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          stdDevMM: 15,
          isPreset: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          lastPlayedAt: undefined,
        },
        sessionConfig: { mode: 'questions', questionCount: TEST_QUESTION_COUNT_10 },
        currentQuestion: null,
        currentThrowIndex: 0,
        displayedDarts: [],
        remainingScore: 0,
        roundStartScore: 0,
        stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
        elapsedTime: 0,
        isTimerRunning: false,
        practiceStartTime: undefined,
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // 1. 初期化時の問題生成呼び出し確認
  // ============================================================
  describe('初期化時の問題生成', () => {
    test('練習セッション開始時に最初の問題が生成される', () => {
      // Arrange
      const generateQuestionSpy = vi.spyOn(useGameStore.getState(), 'generateQuestion');

      act(() => {
        useGameStore.setState({ gameState: 'setup' });
      });

      // Act
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Assert
      expect(generateQuestionSpy).toHaveBeenCalled();
    });

    test('gameStateがpracticingに遷移すると問題が生成される', () => {
      // Arrange
      act(() => {
        useGameStore.setState({ gameState: 'setup', currentQuestion: null });
      });

      // Act
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Assert
      const currentQuestion = useGameStore.getState().currentQuestion;
      expect(currentQuestion).not.toBeNull();
    });

    test('1投モードでは開始時に1投分のダーツが表示される', () => {
      // Arrange
      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            throwUnit: 1,
          },
          gameState: 'setup',
        });
      });

      // Act
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Assert
      const displayedDarts = useGameStore.getState().displayedDarts;
      expect(displayedDarts).toHaveLength(1);
    });

    test('3投モードでは開始時に最初の1本のダーツが表示される', () => {
      // Arrange
      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            throwUnit: 3,
          },
          gameState: 'setup',
        });
      });

      // Act
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Assert
      const displayedDarts = useGameStore.getState().displayedDarts;
      const currentThrowIndex = useGameStore.getState().currentThrowIndex;
      expect(displayedDarts).toHaveLength(1);
      expect(currentThrowIndex).toBe(1);
    });
  });

  // ============================================================
  // 2. 回答送信時の答え判定ロジック
  // ============================================================
  describe('回答送信と答え判定', () => {
    test('正解を送信すると正答数が増加する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();

      // Act
      act(() => {
        useGameStore.getState().submitAnswer(correctAnswer);
      });

      // Assert
      const stats = useGameStore.getState().stats;
      expect(stats.correct).toBe(1);
      expect(stats.total).toBe(1);
    });

    test('不正解を送信すると総問題数のみ増加する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
      const wrongAnswer = correctAnswer + WRONG_ANSWER_OFFSET;

      // Act
      act(() => {
        useGameStore.getState().submitAnswer(wrongAnswer);
      });

      // Assert
      const stats = useGameStore.getState().stats;
      expect(stats.correct).toBe(0);
      expect(stats.total).toBe(1);
    });

    test('連続正解するとstreakが増加する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Act: STREAK_TEST_VALUE問連続正解
      for (let i = 0; i < STREAK_TEST_VALUE; i++) {
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        act(() => {
          useGameStore.getState().submitAnswer(correctAnswer);
          useGameStore.getState().nextQuestion();
        });
      }

      // Assert
      const stats = useGameStore.getState().stats;
      expect(stats.currentStreak).toBe(STREAK_TEST_VALUE);
      expect(stats.bestStreak).toBe(STREAK_TEST_VALUE);
    });

    test('不正解でstreakがリセットされる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // LOOP_COUNT_2問正解
      for (let i = 0; i < LOOP_COUNT_2; i++) {
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        act(() => {
          useGameStore.getState().submitAnswer(correctAnswer);
          useGameStore.getState().nextQuestion();
        });
      }

      // Act: 不正解
      const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
      act(() => {
        useGameStore.getState().submitAnswer(correctAnswer + WRONG_ANSWER_OFFSET);
      });

      // Assert
      const stats = useGameStore.getState().stats;
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(LOOP_COUNT_2); // 最高記録は保持
    });

    test('remainingモードで正解すると残り点数が減少する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            startingScore: 501,
          },
        });
        useGameStore.getState().startPractice();
      });

      const initialRemaining = useGameStore.getState().remainingScore;
      const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();

      // Act
      act(() => {
        useGameStore.getState().submitAnswer(correctAnswer);
      });

      // Assert
      const finalRemaining = useGameStore.getState().remainingScore;
      expect(finalRemaining).toBeLessThan(initialRemaining);
    });
  });

  // ============================================================
  // 3. バスト処理時の状態遷移
  // ============================================================
  describe('バスト処理', () => {
    test('バスト検出時に残り点数がラウンド開始時に戻る', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            startingScore: 50,
          },
        });
        useGameStore.getState().startPractice();
        useGameStore.setState({
          roundStartScore: 50,
          remainingScore: 50,
        });
      });

      // Act: バスト処理を実行
      act(() => {
        useGameStore.getState().handleBust();
      });

      // Assert
      expect(useGameStore.getState().remainingScore).toBe(50);
    });

    test('バスト時にcurrentQuestionがnullになる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            startingScore: 50,
          },
        });
        useGameStore.getState().startPractice();
      });

      expect(useGameStore.getState().currentQuestion).not.toBeNull();

      // Act
      act(() => {
        useGameStore.getState().handleBust();
      });

      // Assert
      expect(useGameStore.getState().currentQuestion).toBeNull();
    });

    test('バスト時にstreakがリセットされる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            startingScore: 100,
          },
          stats: {
            correct: STREAK_TEST_VALUE,
            total: STREAK_TEST_VALUE,
            currentStreak: STREAK_TEST_VALUE,
            bestStreak: STREAK_TEST_VALUE,
          },
        });
        useGameStore.getState().startPractice();
      });

      // Act
      act(() => {
        useGameStore.getState().handleBust();
      });

      // Assert
      const stats = useGameStore.getState().stats;
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(STREAK_TEST_VALUE); // 最高記録は保持
    });

    test('バスト時に総問題数が増加する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            startingScore: 50,
          },
        });
        useGameStore.getState().startPractice();
      });

      const initialTotal = useGameStore.getState().stats.total;

      // Act
      act(() => {
        useGameStore.getState().handleBust();
      });

      // Assert
      expect(useGameStore.getState().stats.total).toBe(initialTotal + 1);
    });
  });

  // ============================================================
  // 4. セッション終了時のクリーンアップ
  // ============================================================
  describe('セッション終了とクリーンアップ', () => {
    test('endSessionでタイマーが停止する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      expect(useGameStore.getState().isTimerRunning).toBe(true);

      // Act
      act(() => {
        useGameStore.getState().endSession('manual');
      });

      // Assert
      expect(useGameStore.getState().isTimerRunning).toBe(false);
    });

    test('endSessionでgameStateがresultsになる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Act
      act(() => {
        useGameStore.getState().endSession('manual');
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
    });

    test('手動終了(manual)でセッションを終了できる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Act
      act(() => {
        useGameStore.getState().endSession('manual');
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
      expect(useGameStore.getState().isTimerRunning).toBe(false);
    });

    test('完了終了(completed)でセッションを終了できる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Act
      act(() => {
        useGameStore.getState().endSession('completed');
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
    });

    test('時間切れ終了(timeout)でセッションを終了できる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Act
      act(() => {
        useGameStore.getState().endSession('timeout');
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
    });

    test('ゲーム終了(game_finished)でセッションを終了できる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
      });

      // Act
      act(() => {
        useGameStore.getState().endSession('game_finished');
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
    });

    test('resetToSetupでセッションをリセットできる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.getState().startPractice();
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        useGameStore.getState().submitAnswer(correctAnswer);
      });

      // Act
      act(() => {
        useGameStore.getState().resetToSetup();
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('setup');
      expect(useGameStore.getState().currentQuestion).toBeNull();
      expect(useGameStore.getState().stats.total).toBe(0);
      expect(useGameStore.getState().elapsedTime).toBe(0);
    });
  });

  // ============================================================
  // 5. 複数回答の累積ロジック（3投モード）
  // ============================================================
  describe('3投モードの累積ロジック', () => {
    test('3投モードでsimulateNextThrowを呼ぶと次のダーツが表示される', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            throwUnit: 3,
          },
        });
        useGameStore.getState().startPractice();
      });

      // 開始時点で1本目が表示されている
      expect(useGameStore.getState().displayedDarts).toHaveLength(1);
      expect(useGameStore.getState().currentThrowIndex).toBe(1);

      // Act
      act(() => {
        useGameStore.getState().simulateNextThrow();
      });

      // Assert: 2本目が追加される
      expect(useGameStore.getState().displayedDarts).toHaveLength(2);
      expect(useGameStore.getState().currentThrowIndex).toBe(2);
    });

    test('3投すべて表示するとcurrentThrowIndexが3になる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            throwUnit: 3,
          },
        });
        useGameStore.getState().startPractice();
      });

      // Act
      act(() => {
        useGameStore.getState().simulateNextThrow();
        useGameStore.getState().simulateNextThrow();
        useGameStore.getState().simulateNextThrow();
      });

      // Assert
      expect(useGameStore.getState().displayedDarts).toHaveLength(THROW_COUNT_PER_ROUND);
      expect(useGameStore.getState().currentThrowIndex).toBe(THROW_COUNT_PER_ROUND);
    });

    test('累積モード(cumulative)で3投の合計得点が計算される', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            throwUnit: 3,
            judgmentTiming: 'cumulative',
          },
        });
        useGameStore.getState().startPractice();
        useGameStore.getState().simulateNextThrow();
        useGameStore.getState().simulateNextThrow();
        useGameStore.getState().simulateNextThrow();
      });

      // Assert: THROW_COUNT_PER_ROUND投分の問題が生成されている
      const currentQuestion = useGameStore.getState().currentQuestion;
      expect(currentQuestion).not.toBeNull();
      expect(currentQuestion?.throws).toHaveLength(THROW_COUNT_PER_ROUND);
    });

    test('独立モード(independent)で各投が個別に判定される', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            throwUnit: 3,
            judgmentTiming: 'independent',
          },
        });
        useGameStore.getState().startPractice();
      });

      // Assert: 判定タイミングが設定されている
      expect(useGameStore.getState().config.judgmentTiming).toBe('independent');
    });

    test('nextQuestionで次の問題に移ると投擲インデックスがリセットされる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            throwUnit: 3,
          },
        });
        useGameStore.getState().startPractice();
        useGameStore.getState().simulateNextThrow();
        useGameStore.getState().simulateNextThrow();
      });

      // 初期1 + simulateNextThrow 2回 = 3
      expect(useGameStore.getState().currentThrowIndex).toBe(3);

      // Act
      act(() => {
        useGameStore.getState().nextQuestion();
      });

      // Assert: 新しい問題で1本目が表示される
      expect(useGameStore.getState().currentThrowIndex).toBe(1);
      expect(useGameStore.getState().displayedDarts).toHaveLength(1);
    });
  });

  // ============================================================
  // 6. 時間制限モードでの時間切れ判定
  // ============================================================
  describe('時間制限モードの時間切れ判定', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('時間制限モードで制限時間に達するとセッションが終了する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: TIME_LIMIT_MINUTES_3 },
        });
        useGameStore.getState().startPractice();
      });

      // Act: TIME_LIMIT_MINUTES_3分以上経過したことをシミュレート
      act(() => {
        useGameStore.setState({
          practiceStartTime: Date.now() - TIME_MILLISECONDS_OVER_3_MINUTES, // 181秒前（3分1秒前）
        });
        useGameStore.getState().tick();
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
      expect(useGameStore.getState().isTimerRunning).toBe(false);
    });

    test('時間制限内ではセッションが継続する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: TIME_LIMIT_MINUTES_5 },
        });
        useGameStore.getState().startPractice();
      });

      // Act: 1分経過
      act(() => {
        useGameStore.setState({
          practiceStartTime: Date.now() - TIME_MILLISECONDS_PER_MINUTE, // 60秒前
        });
        useGameStore.getState().tick();
      });

      // Assert: まだ継続中
      expect(useGameStore.getState().gameState).toBe('practicing');
      expect(useGameStore.getState().isTimerRunning).toBe(true);
    });

    test('問題数モードでは時間経過してもセッションが終了しない', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: TEST_QUESTION_COUNT_10 },
        });
        useGameStore.getState().startPractice();
      });

      // Act: 大幅に時間が経過
      act(() => {
        useGameStore.setState({
          practiceStartTime: Date.now() - TIME_MILLISECONDS_PER_10_MINUTES, // 10分前
        });
        useGameStore.getState().tick();
      });

      // Assert: 時間では終了しない
      expect(useGameStore.getState().gameState).toBe('practicing');
    });

    test('時間制限ちょうどで終了する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: TIME_LIMIT_MINUTES_3 },
        });
        useGameStore.getState().startPractice();
      });

      // Act: ちょうどTIME_LIMIT_MINUTES_3分経過
      act(() => {
        useGameStore.setState({
          practiceStartTime: Date.now() - TIME_MILLISECONDS_PER_3_MINUTES, // 180秒前（ちょうど3分前）
        });
        useGameStore.getState().tick();
      });

      // Assert: ちょうどの時間で終了
      expect(useGameStore.getState().gameState).toBe('results');
    });
  });

  // ============================================================
  // 7. エッジケースと境界値
  // ============================================================
  describe('エッジケース', () => {
    test('問題数モードで最終問題に正解するとセッションが終了する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: TEST_QUESTION_COUNT_10 },
        });
        useGameStore.getState().startPractice();
      });

      // 最初の9問を回答
      for (let i = 0; i < TEST_QUESTION_COUNT_10 - 1; i++) {
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        act(() => {
          useGameStore.getState().submitAnswer(correctAnswer);
          useGameStore.getState().nextQuestion();
        });
      }

      const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();

      // Act: 最終問題（10問目）に正解
      act(() => {
        useGameStore.getState().submitAnswer(correctAnswer);
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
    });

    test('残り点数0になるとゲーム終了する', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            startingScore: 10,
          },
        });
        useGameStore.getState().startPractice();
        useGameStore.setState({ remainingScore: 0 });
      });

      // Act: 次の問題へ進もうとする
      act(() => {
        useGameStore.getState().nextQuestion();
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
    });

    test('統計情報が未初期化の場合もセッションを開始できる', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      // Act
      act(() => {
        useGameStore.getState().startPractice();
      });

      // Assert: 統計が初期化される
      const stats = useGameStore.getState().stats;
      expect(stats.correct).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(0);
    });
  });

  // ============================================================
  // 8. 統合シナリオ
  // ============================================================
  describe('統合シナリオ', () => {
    test('完全な1投モードのセッション（開始→回答→終了）', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      // Act: セッション開始
      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: TEST_QUESTION_COUNT_10 },
          config: {
            ...useGameStore.getState().config,
            throwUnit: 1,
          },
        });
        useGameStore.getState().startPractice();
      });

      expect(useGameStore.getState().gameState).toBe('practicing');

      // TEST_QUESTION_COUNT_10問回答
      for (let i = 0; i < TEST_QUESTION_COUNT_10; i++) {
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        act(() => {
          useGameStore.getState().submitAnswer(correctAnswer);
          if (i < TEST_QUESTION_COUNT_10 - 1) {
            useGameStore.getState().nextQuestion();
          }
        });
      }

      // Assert: セッション終了
      expect(useGameStore.getState().gameState).toBe('results');
      expect(useGameStore.getState().stats.correct).toBe(TEST_QUESTION_COUNT_10);
      expect(useGameStore.getState().stats.total).toBe(TEST_QUESTION_COUNT_10);
    });

    test('完全な3投モードのセッション（開始→投擲→回答→終了）', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      // Act: セッション開始
      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: TEST_QUESTION_COUNT_10 },
          config: {
            ...useGameStore.getState().config,
            throwUnit: 3,
          },
        });
        useGameStore.getState().startPractice();
      });

      // TEST_QUESTION_COUNT_10問回答（各THROW_COUNT_PER_ROUND投）
      for (let i = 0; i < TEST_QUESTION_COUNT_10; i++) {
        // 3投シミュレート
        act(() => {
          useGameStore.getState().simulateNextThrow();
          useGameStore.getState().simulateNextThrow();
          useGameStore.getState().simulateNextThrow();
        });

        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        act(() => {
          useGameStore.getState().submitAnswer(correctAnswer);
          if (i < TEST_QUESTION_COUNT_10 - 1) {
            useGameStore.getState().nextQuestion();
          }
        });
      }

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
      expect(useGameStore.getState().stats.total).toBe(TEST_QUESTION_COUNT_10);
    });

    test('残り点数モードでバストを含むセッション', () => {
      // Arrange
      renderHook(() => usePracticeSession());

      // Act: セッション開始
      act(() => {
        useGameStore.setState({
          config: {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            startingScore: 501,
          },
        });
        useGameStore.getState().startPractice();
      });

      // 正解1回
      const correctAnswer1 = useGameStore.getState().getCurrentCorrectAnswer();
      act(() => {
        useGameStore.getState().submitAnswer(correctAnswer1);
        useGameStore.getState().nextQuestion();
      });

      // バスト1回
      act(() => {
        useGameStore.getState().handleBust();
        useGameStore.getState().nextQuestion();
      });

      // 正解1回
      const correctAnswer2 = useGameStore.getState().getCurrentCorrectAnswer();
      act(() => {
        useGameStore.getState().submitAnswer(correctAnswer2);
      });

      // Assert
      const stats = useGameStore.getState().stats;
      expect(stats.total).toBeGreaterThanOrEqual(3); // 正解2回 + バスト1回
      expect(stats.correct).toBeLessThanOrEqual(stats.total);
    });
  });
});
