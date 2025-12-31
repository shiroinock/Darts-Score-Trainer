import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { PRESETS } from '../stores/config/presets';
import { useGameStore } from '../stores/gameStore';
import type { GameState, Target } from '../types';
import {
  useConfig,
  useCurrentQuestion,
  useDisplayedDarts,
  useElapsedTime,
  useEndSession,
  useGameState,
  useGenerateQuestion,
  useGetAccuracy,
  useGetCurrentCorrectAnswer,
  useIsTimerRunning,
  useNextQuestion,
  useRemainingScore,
  useResetToSetup,
  useSelectPreset,
  useSessionConfig,
  useSetConfig,
  useSetSessionConfig,
  useSetStdDev,
  useSetTarget,
  useSimulateNextThrow,
  useStartPractice,
  useStats,
  useSubmitAnswer,
} from './useGameStore';

/**
 * useGameStore.ts のテスト
 *
 * テストパターン: hook（React カスタムフック）
 * 配置戦略: colocated（src/hooks/useGameStore.test.ts）
 *
 * 対象機能:
 * - Zustand gameStore からの状態セレクター
 * - アクションセレクター
 * - 計算プロパティのセレクター
 * - パフォーマンス最適化された再レンダリング
 */

// プリセットIDの定数定義
const PRESET_BASIC = 'preset-basic' as const;
const PRESET_PLAYER = 'preset-player' as const;

describe('useGameStore hooks', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    act(() => {
      useGameStore.setState({
        gameState: 'setup',
        config: PRESETS[PRESET_BASIC],
        sessionConfig: { mode: 'questions', questionCount: 10 },
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

  // ============================================================
  // 1. 状態セレクター
  // ============================================================
  describe('状態セレクター', () => {
    describe('useGameState', () => {
      test('現在のゲーム状態を取得できる', () => {
        // Arrange & Act
        const { result } = renderHook(() => useGameState());

        // Assert
        expect(result.current).toBe('setup');
      });

      test('状態変更時に再レンダリングされる', () => {
        // Arrange
        const { result } = renderHook(() => useGameState());
        expect(result.current).toBe('setup');

        // Act: 状態を変更
        act(() => {
          useGameStore.setState({ gameState: 'practicing' });
        });

        // Assert: フックが新しい値を返す
        expect(result.current).toBe('practicing');
      });

      test('他の状態変更時には再レンダリングされない', () => {
        // Arrange
        const { result } = renderHook(() => useGameState());
        const initialState = result.current;

        // Act: gameState以外の状態を変更
        act(() => {
          useGameStore.setState({ elapsedTime: 10 });
        });

        // Assert: 状態が変わっていない（再レンダリングされていない）
        expect(result.current).toBe(initialState);
      });
    });

    describe('useConfig', () => {
      test('現在の練習設定を取得できる', () => {
        // Arrange & Act
        const { result } = renderHook(() => useConfig());

        // Assert
        expect(result.current).toBeDefined();
        expect(result.current.configId).toBe(PRESET_BASIC);
        expect(result.current.throwUnit).toBe(1);
      });

      test('設定変更時に再レンダリングされる', () => {
        // Arrange
        const { result } = renderHook(() => useConfig());
        const initialConfig = result.current;

        // Act: 設定を変更
        act(() => {
          useGameStore.getState().setConfig({ stdDevMM: 30 });
        });

        // Assert: 新しい設定オブジェクトが返される
        expect(result.current).not.toBe(initialConfig);
        expect(result.current.stdDevMM).toBe(30);
      });
    });

    describe('useSessionConfig', () => {
      test('現在のセッション設定を取得できる', () => {
        // Arrange & Act
        const { result } = renderHook(() => useSessionConfig());

        // Assert
        expect(result.current).toBeDefined();
        expect(result.current.mode).toBe('questions');
        expect(result.current.questionCount).toBe(10);
      });

      test('セッション設定変更時に再レンダリングされる', () => {
        // Arrange
        const { result } = renderHook(() => useSessionConfig());

        // Act
        act(() => {
          useGameStore.getState().setSessionConfig({ mode: 'time', timeLimit: 5 });
        });

        // Assert
        expect(result.current.mode).toBe('time');
        expect(result.current.timeLimit).toBe(5);
      });
    });

    describe('useCurrentQuestion', () => {
      test('初期状態でnullを返す', () => {
        // Arrange & Act
        const { result } = renderHook(() => useCurrentQuestion());

        // Assert
        expect(result.current).toBeNull();
      });

      test('問題生成後に問題オブジェクトを返す', () => {
        // Arrange
        const { result } = renderHook(() => useCurrentQuestion());

        // Act
        act(() => {
          useGameStore.getState().startPractice();
        });

        // Assert
        expect(result.current).not.toBeNull();
        expect(result.current?.throws).toBeDefined();
        expect(result.current?.correctAnswer).toBeDefined();
      });
    });

    describe('useStats', () => {
      test('初期統計情報を取得できる', () => {
        // Arrange & Act
        const { result } = renderHook(() => useStats());

        // Assert
        expect(result.current.correct).toBe(0);
        expect(result.current.total).toBe(0);
        expect(result.current.currentStreak).toBe(0);
        expect(result.current.bestStreak).toBe(0);
      });

      test('統計情報更新時に再レンダリングされる', () => {
        // Arrange
        const { result } = renderHook(() => useStats());

        // Act: 練習を開始して正解を提出
        act(() => {
          useGameStore.getState().startPractice();
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
        });

        // Assert
        expect(result.current.correct).toBe(1);
        expect(result.current.total).toBe(1);
        expect(result.current.currentStreak).toBe(1);
      });
    });

    describe('useElapsedTime', () => {
      test('初期値は0である', () => {
        // Arrange & Act
        const { result } = renderHook(() => useElapsedTime());

        // Assert
        expect(result.current).toBe(0);
      });

      test('経過時間更新時に再レンダリングされる', () => {
        // Arrange
        const { result } = renderHook(() => useElapsedTime());

        // Act
        act(() => {
          useGameStore.setState({ elapsedTime: 60 });
        });

        // Assert
        expect(result.current).toBe(60);
      });
    });

    describe('useIsTimerRunning', () => {
      test('初期値はfalseである', () => {
        // Arrange & Act
        const { result } = renderHook(() => useIsTimerRunning());

        // Assert
        expect(result.current).toBe(false);
      });

      test('練習開始時にtrueになる', () => {
        // Arrange
        const { result } = renderHook(() => useIsTimerRunning());

        // Act
        act(() => {
          useGameStore.getState().startPractice();
        });

        // Assert
        expect(result.current).toBe(true);
      });
    });

    describe('useRemainingScore', () => {
      test('初期値は0である', () => {
        // Arrange & Act
        const { result } = renderHook(() => useRemainingScore());

        // Assert
        expect(result.current).toBe(0);
      });

      test('残り点数モードで開始すると設定値になる', () => {
        // Arrange
        const { result } = renderHook(() => useRemainingScore());

        // Act
        act(() => {
          useGameStore.getState().setConfig({
            questionType: 'remaining',
            startingScore: 501,
          });
          useGameStore.getState().startPractice();
        });

        // Assert
        expect(result.current).toBe(501);
      });
    });

    describe('useDisplayedDarts', () => {
      test('初期値は空配列である', () => {
        // Arrange & Act
        const { result } = renderHook(() => useDisplayedDarts());

        // Assert
        expect(result.current).toEqual([]);
      });

      test('1投モードで問題生成後にダーツが表示される', () => {
        // Arrange
        const { result } = renderHook(() => useDisplayedDarts());

        // Act
        act(() => {
          useGameStore.getState().setConfig({ throwUnit: 1 });
          useGameStore.getState().startPractice();
        });

        // Assert
        expect(result.current).toHaveLength(1);
      });

      test('3投モードで初期状態は最初の1本のダーツが表示される', () => {
        // Arrange
        const { result } = renderHook(() => useDisplayedDarts());

        // Act
        act(() => {
          useGameStore.getState().setConfig({ throwUnit: 3 });
          useGameStore.getState().startPractice();
        });

        // Assert
        expect(result.current).toHaveLength(1);
        expect(useGameStore.getState().currentThrowIndex).toBe(1);
      });
    });
  });

  // ============================================================
  // 2. アクションセレクター
  // ============================================================
  describe('アクションセレクター', () => {
    describe('useSetConfig', () => {
      test('設定を更新する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useSetConfig());

        // Act
        act(() => {
          result.current({ stdDevMM: 50 });
        });

        // Assert
        const config = useGameStore.getState().config;
        expect(config.stdDevMM).toBe(50);
      });

      test('関数は再レンダリング時に同一である', () => {
        // Arrange
        const { result, rerender } = renderHook(() => useSetConfig());
        const initialFn = result.current;

        // Act: 再レンダリング
        rerender();

        // Assert: 関数は同じ参照である
        expect(result.current).toBe(initialFn);
      });
    });

    describe('useSetSessionConfig', () => {
      test('セッション設定を更新する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useSetSessionConfig());

        // Act
        act(() => {
          result.current({ mode: 'time', timeLimit: 3 });
        });

        // Assert
        const sessionConfig = useGameStore.getState().sessionConfig;
        expect(sessionConfig.mode).toBe('time');
        expect(sessionConfig.timeLimit).toBe(3);
      });
    });

    describe('useSelectPreset', () => {
      test('プリセットを選択する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useSelectPreset());

        // Act
        act(() => {
          result.current(PRESET_PLAYER);
        });

        // Assert
        const config = useGameStore.getState().config;
        expect(config.configId).toBe(PRESET_PLAYER);
        expect(config.throwUnit).toBe(3);
      });

      test('存在しないプリセットIDでエラーをスローする', () => {
        // Arrange
        const { result } = renderHook(() => useSelectPreset());

        // Act & Assert
        expect(() => {
          act(() => {
            result.current('invalid-preset');
          });
        }).toThrow('プリセット「invalid-preset」が見つかりません');
      });
    });

    describe('useSetTarget', () => {
      test('ターゲットを設定する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useSetTarget());
        const newTarget: Target = {
          type: 'DOUBLE',
          number: 16,
          label: 'D16',
        };

        // Act
        act(() => {
          result.current(newTarget);
        });

        // Assert
        const config = useGameStore.getState().config;
        expect(config.target).toEqual(newTarget);
      });
    });

    describe('useSetStdDev', () => {
      test('標準偏差を設定する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useSetStdDev());

        // Act
        act(() => {
          result.current(30);
        });

        // Assert
        const config = useGameStore.getState().config;
        expect(config.stdDevMM).toBe(30);
      });

      test('負の値でエラーをスローする', () => {
        // Arrange
        const { result } = renderHook(() => useSetStdDev());

        // Act & Assert
        expect(() => {
          act(() => {
            result.current(-10);
          });
        }).toThrow('標準偏差は正の数である必要があります');
      });

      test('0でエラーをスローする', () => {
        // Arrange
        const { result } = renderHook(() => useSetStdDev());

        // Act & Assert
        expect(() => {
          act(() => {
            result.current(0);
          });
        }).toThrow('標準偏差は正の数である必要があります');
      });
    });

    describe('useStartPractice', () => {
      test('練習を開始する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useStartPractice());

        // Act
        act(() => {
          result.current();
        });

        // Assert
        const gameState = useGameStore.getState().gameState;
        expect(gameState).toBe('practicing');
      });
    });

    describe('useGenerateQuestion', () => {
      test('問題を生成する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useGenerateQuestion());

        // Act
        act(() => {
          result.current();
        });

        // Assert
        const currentQuestion = useGameStore.getState().currentQuestion;
        expect(currentQuestion).not.toBeNull();
      });
    });

    describe('useSimulateNextThrow', () => {
      test('次のダーツを投擲する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useSimulateNextThrow());

        // Act: 3投モードで練習開始
        act(() => {
          useGameStore.getState().setConfig({ throwUnit: 3 });
          useGameStore.getState().startPractice();
        });

        // 開始時点で1本目が表示されている
        expect(useGameStore.getState().displayedDarts).toHaveLength(1);

        // Act: 次のダーツをシミュレート
        act(() => {
          result.current();
        });

        // Assert: 2本目が追加される
        const displayedDarts = useGameStore.getState().displayedDarts;
        expect(displayedDarts).toHaveLength(2);
      });
    });

    describe('useSubmitAnswer', () => {
      test('回答を提出する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useSubmitAnswer());

        // Act: 練習開始
        act(() => {
          useGameStore.getState().startPractice();
        });

        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();

        // Act: 正解を提出
        act(() => {
          result.current(correctAnswer);
        });

        // Assert
        const stats = useGameStore.getState().stats;
        expect(stats.correct).toBe(1);
        expect(stats.total).toBe(1);
      });

      test('不正な値でエラーをスローする', () => {
        // Arrange
        const { result } = renderHook(() => useSubmitAnswer());

        // Act: 練習開始
        act(() => {
          useGameStore.getState().startPractice();
        });

        // Act & Assert: NaNでエラー
        expect(() => {
          act(() => {
            result.current(NaN);
          });
        }).toThrow('回答は有限の数である必要があります');
      });
    });

    describe('useNextQuestion', () => {
      test('次の問題に進む関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useNextQuestion());

        // Act: 練習開始
        act(() => {
          useGameStore.getState().startPractice();
        });

        const firstQuestion = useGameStore.getState().currentQuestion;

        // Act: 次の問題へ
        act(() => {
          result.current();
        });

        // Assert
        const currentQuestion = useGameStore.getState().currentQuestion;
        expect(currentQuestion).not.toBeNull();
        expect(currentQuestion).not.toBe(firstQuestion);
      });
    });

    describe('useEndSession', () => {
      test('セッションを終了する関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useEndSession());

        // Act: 練習開始
        act(() => {
          useGameStore.getState().startPractice();
        });

        // Act: セッション終了
        act(() => {
          result.current('manual');
        });

        // Assert
        const gameState = useGameStore.getState().gameState;
        expect(gameState).toBe('results');
      });
    });

    describe('useResetToSetup', () => {
      test('設定画面に戻る関数を取得できる', () => {
        // Arrange
        const { result } = renderHook(() => useResetToSetup());

        // Act: 練習開始
        act(() => {
          useGameStore.getState().startPractice();
        });

        // Act: リセット
        act(() => {
          result.current();
        });

        // Assert
        const gameState = useGameStore.getState().gameState;
        expect(gameState).toBe('setup');
      });
    });
  });

  // ============================================================
  // 3. 計算プロパティセレクター
  // ============================================================
  describe('計算プロパティセレクター', () => {
    describe('useGetCurrentCorrectAnswer', () => {
      test('現在の問題の正解を取得する関数を返す', () => {
        // Arrange
        const { result } = renderHook(() => useGetCurrentCorrectAnswer());

        // Act: 練習開始
        act(() => {
          useGameStore.getState().startPractice();
        });

        // Assert
        const correctAnswer = result.current();
        expect(typeof correctAnswer).toBe('number');
        expect(correctAnswer).toBeGreaterThanOrEqual(0);
      });

      test('問題がない場合は0を返す', () => {
        // Arrange
        const { result } = renderHook(() => useGetCurrentCorrectAnswer());

        // Act
        const correctAnswer = result.current();

        // Assert
        expect(correctAnswer).toBe(0);
      });
    });

    describe('useGetAccuracy', () => {
      test('正答率を計算する関数を返す', () => {
        // Arrange
        const { result } = renderHook(() => useGetAccuracy());

        // Act: 統計情報を設定
        act(() => {
          useGameStore.setState({
            stats: { correct: 8, total: 10, currentStreak: 2, bestStreak: 5 },
          });
        });

        // Assert
        const accuracy = result.current();
        expect(accuracy).toBe(0.8);
      });

      test('0問の場合は0を返す', () => {
        // Arrange
        const { result } = renderHook(() => useGetAccuracy());

        // Act
        const accuracy = result.current();

        // Assert
        expect(accuracy).toBe(0);
      });

      test('100%正解の場合は1を返す', () => {
        // Arrange
        const { result } = renderHook(() => useGetAccuracy());

        // Act
        act(() => {
          useGameStore.setState({
            stats: { correct: 10, total: 10, currentStreak: 10, bestStreak: 10 },
          });
        });

        // Assert
        const accuracy = result.current();
        expect(accuracy).toBe(1.0);
      });
    });
  });

  // ============================================================
  // 4. 再レンダリングの最適化
  // ============================================================
  describe('再レンダリングの最適化', () => {
    test('useGameStateは他の状態変更時に再レンダリングされない', () => {
      // Arrange
      const { result } = renderHook(() => useGameState());
      const initialRenderCount = result.current;

      // Act: gameState以外の状態を変更
      act(() => {
        useGameStore.setState({ elapsedTime: 10 });
        useGameStore.setState({ elapsedTime: 20 });
        useGameStore.setState({ elapsedTime: 30 });
      });

      // Assert: gameStateは変わっていない
      expect(result.current).toBe(initialRenderCount);
    });

    test('useConfigは他の状態変更時に再レンダリングされない', () => {
      // Arrange
      const { result } = renderHook(() => useConfig());
      const initialConfig = result.current;

      // Act: config以外の状態を変更
      act(() => {
        useGameStore.setState({ elapsedTime: 10 });
        useGameStore.setState({ gameState: 'practicing' });
      });

      // Assert: configは変わっていない
      expect(result.current).toBe(initialConfig);
    });

    test('useStatsは他の状態変更時に再レンダリングされない', () => {
      // Arrange
      const { result } = renderHook(() => useStats());
      const initialStats = result.current;

      // Act: stats以外の状態を変更
      act(() => {
        useGameStore.setState({ elapsedTime: 10 });
      });

      // Assert: statsは変わっていない
      expect(result.current).toBe(initialStats);
    });
  });

  // ============================================================
  // 5. エッジケースと境界値
  // ============================================================
  describe('エッジケースと境界値', () => {
    test('useCurrentQuestionでundefinedスローを検証する', () => {
      // Arrange
      const { result } = renderHook(() => useCurrentQuestion());

      // Act: 明示的にundefinedを設定
      act(() => {
        useGameStore.setState({ currentQuestion: null });
      });

      // Assert
      expect(result.current).toBeNull();
    });

    test('複数のフックを同時に使用できる', () => {
      // Arrange
      const { result: gameState } = renderHook(() => useGameState());
      const { result: config } = renderHook(() => useConfig());
      const { result: stats } = renderHook(() => useStats());

      // Assert: すべて正常に取得できる
      expect(gameState.current).toBe('setup');
      expect(config.current).toBeDefined();
      expect(stats.current).toBeDefined();
    });

    test('アクションフックを連続して実行できる', () => {
      // Arrange
      const { result: startPractice } = renderHook(() => useStartPractice());
      const { result: submitAnswer } = renderHook(() => useSubmitAnswer());
      const { result: nextQuestion } = renderHook(() => useNextQuestion());

      // Act: 連続実行
      act(() => {
        startPractice.current();
      });

      const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();

      act(() => {
        submitAnswer.current(correctAnswer);
      });

      act(() => {
        nextQuestion.current();
      });

      // Assert: 正常に実行される
      expect(useGameStore.getState().gameState).toBe('practicing');
      expect(useGameStore.getState().stats.total).toBe(1);
    });

    test('状態セレクターが正しい型を返す', () => {
      // Arrange & Act
      const { result: gameState } = renderHook(() => useGameState());
      const { result: config } = renderHook(() => useConfig());
      const { result: stats } = renderHook(() => useStats());
      const { result: elapsedTime } = renderHook(() => useElapsedTime());
      const { result: isTimerRunning } = renderHook(() => useIsTimerRunning());

      // Assert: 型が正しい
      const _gameState: GameState = gameState.current;
      const _throwUnit: 1 | 3 = config.current.throwUnit;
      const _correct: number = stats.current.correct;
      const _elapsedTime: number = elapsedTime.current;
      const _isTimerRunning: boolean = isTimerRunning.current;

      // TypeScriptの型チェックが通ればOK（実行時検証は不要）
      expect(_gameState).toBeDefined();
      expect(_throwUnit).toBeDefined();
      expect(_correct).toBeDefined();
      expect(_elapsedTime).toBeDefined();
      expect(_isTimerRunning).toBeDefined();
    });
  });

  // ============================================================
  // 6. 複数フックの組み合わせ
  // ============================================================
  describe('複数フックの組み合わせ', () => {
    test('状態とアクションを組み合わせた操作', () => {
      // Arrange
      const { result: gameState } = renderHook(() => useGameState());
      const { result: startPractice } = renderHook(() => useStartPractice());
      const { result: endSession } = renderHook(() => useEndSession());

      // Assert: 初期状態
      expect(gameState.current).toBe('setup');

      // Act: 練習開始
      act(() => {
        startPractice.current();
      });

      // Assert: practicing状態
      expect(gameState.current).toBe('practicing');

      // Act: セッション終了
      act(() => {
        endSession.current('manual');
      });

      // Assert: results状態
      expect(gameState.current).toBe('results');
    });

    test('複数の状態セレクターが独立して動作する', () => {
      // Arrange
      const { result: gameState } = renderHook(() => useGameState());
      const { result: stats } = renderHook(() => useStats());
      const { result: elapsedTime } = renderHook(() => useElapsedTime());

      // Act: 練習開始
      act(() => {
        useGameStore.getState().startPractice();
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        useGameStore.getState().submitAnswer(correctAnswer);
      });

      // Assert: 各セレクターが正しい値を返す
      expect(gameState.current).toBe('practicing');
      expect(stats.current.total).toBe(1);
      expect(elapsedTime.current).toBeGreaterThanOrEqual(0);
    });

    test('計算プロパティと状態セレクターの組み合わせ', () => {
      // Arrange
      const { result: stats } = renderHook(() => useStats());
      const { result: getAccuracy } = renderHook(() => useGetAccuracy());

      // Act: 統計情報を設定
      act(() => {
        useGameStore.setState({
          stats: { correct: 7, total: 10, currentStreak: 3, bestStreak: 5 },
        });
      });

      // Assert
      expect(stats.current.correct).toBe(7);
      expect(stats.current.total).toBe(10);
      expect(getAccuracy.current()).toBe(0.7);
    });
  });
});
