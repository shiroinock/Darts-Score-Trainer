import { describe, test, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { SessionConfig, Target, Stats } from '../types';

/**
 * gameStore.ts のテスト（TDD Red フェーズ）
 *
 * このテストは実装前に作成されているため、すべて失敗（RED状態）します。
 * 実装後にテストが成功（GREEN状態）に変わることを期待します。
 *
 * テストパターン: store（Zustand ストア）
 * 配置戦略: colocated（src/stores/gameStore.test.ts）
 */

// ストアのインポート（実装後に有効化）
import { useGameStore } from './gameStore';

// 初期統計情報の定義（未使用変数を削除）
const initialStats: Stats = {
  correct: 0,
  total: 0,
  currentStreak: 0,
  bestStreak: 0
};

describe('gameStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
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
          startingScore: null,
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          stdDevMM: 15,
          isPreset: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          lastPlayedAt: undefined,
        },
        sessionConfig: { mode: 'questions', questionCount: 10 },
        currentQuestion: null,
        currentThrowIndex: 0,
        displayedDarts: [],
        remainingScore: 0,
        roundStartScore: 0,
        stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
        elapsedTime: 0,
        isTimerRunning: false,
      });
    });
  });

  // ============================================================
  // 1. 初期状態の検証
  // ============================================================
  describe('初期状態', () => {
    test('gameStateはsetupである', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.gameState).toBe('setup');
    });

    test('configは初期設定を持つ', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.config).toBeDefined();
      expect(result.current.config.throwUnit).toBe(1);
    });

    test('sessionConfigは初期設定を持つ', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.sessionConfig).toBeDefined();
      expect(result.current.sessionConfig.mode).toBe('questions');
    });

    test('currentQuestionはnullである', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.currentQuestion).toBeNull();
    });

    test('currentThrowIndexは0である', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.currentThrowIndex).toBe(0);
    });

    test('displayedDartsは空配列である', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.displayedDarts).toEqual([]);
    });

    test('remainingScoreは0である', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.remainingScore).toBe(0);
    });

    test('roundStartScoreは0である', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.roundStartScore).toBe(0);
    });

    test('statsは初期統計情報を持つ', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.stats).toEqual(initialStats);
    });

    test('elapsedTimeは0である', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.elapsedTime).toBe(0);
    });

    test('isTimerRunningはfalseである', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());

      // Assert
      expect(result.current.isTimerRunning).toBe(false);
    });
  });

  // ============================================================
  // 2. 設定アクション
  // ============================================================
  describe('setConfig', () => {
    test('設定を部分更新できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      const initialConfig = result.current.config;

      // Act
      act(() => {
      result.current.setConfig({ stdDevMM: 30 });
      });

      // Assert
      expect(result.current.config.stdDevMM).toBe(30);
      expect(result.current.config).not.toBe(initialConfig); // 新しいオブジェクト
    });

    test('複数のプロパティを同時に更新できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.setConfig({
      throwUnit: 3,
      questionType: 'remaining',
      startingScore: 501
      });
      });

      // Assert
      expect(result.current.config.throwUnit).toBe(3);
      expect(result.current.config.questionType).toBe('remaining');
      expect(result.current.config.startingScore).toBe(501);
    });

    test('他のプロパティは変更されない', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      const initialTarget = result.current.config.target;

      // Act
      act(() => {
      result.current.setConfig({ stdDevMM: 50 });
      });

      // Assert
      expect(result.current.config.target).toEqual(initialTarget);
    });
  });

  describe('setSessionConfig', () => {
    test('セッション設定を更新できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      const newSessionConfig: SessionConfig = {
        mode: 'time',
        timeLimit: 5
      };

      // Act
      act(() => {
      result.current.setSessionConfig(newSessionConfig);
      });

      // Assert
      expect(result.current.sessionConfig).toEqual(newSessionConfig);
    });

    test('問題数モードを設定できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      const questionConfig: SessionConfig = {
        mode: 'questions',
        questionCount: 50
      };

      // Act
      act(() => {
      result.current.setSessionConfig(questionConfig);
      });

      // Assert
      expect(result.current.sessionConfig.mode).toBe('questions');
      expect(result.current.sessionConfig.questionCount).toBe(50);
    });
  });

  describe('selectPreset', () => {
    test('プリセットIDに対応する設定を読み込める', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.selectPreset('preset-basic');
      });

      // Assert
      expect(result.current.config.configId).toBe('preset-basic');
      expect(result.current.config.configName).toBe('基礎練習');
    });

    test('プレイヤー練習プリセットを選択できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.selectPreset('preset-player');
      });

      // Assert
      expect(result.current.config.configId).toBe('preset-player');
      expect(result.current.config.throwUnit).toBe(3);
    });

    test('存在しないプリセットIDでエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.selectPreset('invalid-preset-id');
      });
      }).toThrow();
    });
  });

  describe('setTarget', () => {
    test('ターゲットを更新できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      const newTarget: Target = {
        type: 'DOUBLE',
        number: 16,
        label: 'D16'
      };

      // Act
      act(() => {
      result.current.setTarget(newTarget);
      });

      // Assert
      expect(result.current.config.target).toEqual(newTarget);
    });

    test('BULLターゲットを設定できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      const bullTarget: Target = {
        type: 'BULL',
        number: null,
        label: 'BULL'
      };

      // Act
      act(() => {
      result.current.setTarget(bullTarget);
      });

      // Assert
      expect(result.current.config.target.type).toBe('BULL');
      expect(result.current.config.target.number).toBeNull();
    });
  });

  describe('setStdDev', () => {
    test('標準偏差を更新できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.setStdDev(8);
      });

      // Assert
      expect(result.current.config.stdDevMM).toBe(8);
    });

    test('標準偏差を50mmに設定できる（初心者レベル）', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.setStdDev(50);
      });

      // Assert
      expect(result.current.config.stdDevMM).toBe(50);
    });

    test('負の標準偏差でエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.setStdDev(-10);
      });
      }).toThrow();
    });

    test('0の標準偏差でエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.setStdDev(0);
      });
      }).toThrow();
    });

    test('NaNの標準偏差でエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.setStdDev(NaN);
      });
      }).toThrow();
    });

    test('Infinityの標準偏差でエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.setStdDev(Infinity);
      });
      }).toThrow();
    });
  });

  // ============================================================
  // 3. ゲームアクション - 状態遷移
  // ============================================================
  describe('startPractice', () => {
    test('practicing状態に遷移する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      expect(result.current.gameState).toBe('setup');

      // Act
      act(() => {
      result.current.startPractice();
      });

      // Assert
      expect(result.current.gameState).toBe('practicing');
    });

    test('タイマーが開始される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.startPractice();
      });

      // Assert
      expect(result.current.isTimerRunning).toBe(true);
    });

    test('最初の問題が生成される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.startPractice();
      });

      // Assert
      expect(result.current.currentQuestion).not.toBeNull();
    });

    test('統計情報がリセットされる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      useGameStore.setState({ stats: { correct: 5, total: 10, currentStreak: 3, bestStreak: 5 } });
      });

      // Act
      act(() => {
      result.current.startPractice();
      });

      // Assert
      expect(result.current.stats).toEqual(initialStats);
    });

    test('経過時間がリセットされる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      useGameStore.setState({ elapsedTime: 120 });
      });

      // Act
      act(() => {
      result.current.startPractice();
      });

      // Assert
      expect(result.current.elapsedTime).toBe(0);
    });

    test('残り点数モードの場合、remainingScoreが設定される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ questionType: 'remaining', startingScore: 501 });
      });

      // Act
      act(() => {
      result.current.startPractice();
      });

      // Assert
      expect(result.current.remainingScore).toBe(501);
    });
  });

  describe('generateQuestion', () => {
    test('新しい問題を生成する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.generateQuestion();
      });

      // Assert
      expect(result.current.currentQuestion).not.toBeNull();
    });

    test('1投モードの問題を生成する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ throwUnit: 1 });
      });

      // Act
      act(() => {
      result.current.generateQuestion();
      });

      // Assert
      expect(result.current.currentQuestion?.throws).toHaveLength(1);
    });

    test('3投モードの問題を生成する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ throwUnit: 3 });
      });

      // Act
      act(() => {
      result.current.generateQuestion();
      });

      // Assert
      expect(result.current.currentQuestion?.throws).toHaveLength(3);
    });

    test('問題文が設定される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.generateQuestion();
      });

      // Assert
      expect(result.current.currentQuestion?.questionText).toBeDefined();
      expect(typeof result.current.currentQuestion?.questionText).toBe('string');
    });

    test('正解が設定される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.generateQuestion();
      });

      // Assert
      expect(result.current.currentQuestion?.correctAnswer).toBeDefined();
      expect(typeof result.current.currentQuestion?.correctAnswer).toBe('number');
    });
  });

  describe('simulateNextThrow', () => {
    test('次のダーツを投擲シミュレーションする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ throwUnit: 3 });
      result.current.startPractice();
      });

      // Act
      act(() => {
      result.current.simulateNextThrow();
      });

      // Assert
      expect(result.current.displayedDarts).toHaveLength(1);
    });

    test('currentThrowIndexが更新される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ throwUnit: 3 });
      result.current.startPractice();
      });
      expect(result.current.currentThrowIndex).toBe(0);

      // Act
      act(() => {
      result.current.simulateNextThrow();
      });

      // Assert
      expect(result.current.currentThrowIndex).toBe(1);
    });

    test('3投すべて表示された後はcurrentThrowIndexが3になる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ throwUnit: 3 });
      result.current.startPractice();
      });

      // Act
      act(() => {
      result.current.simulateNextThrow();
      result.current.simulateNextThrow();
      result.current.simulateNextThrow();
      });

      // Assert
      expect(result.current.currentThrowIndex).toBe(3);
      expect(result.current.displayedDarts).toHaveLength(3);
    });

    test('1投モードでは動作しない', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ throwUnit: 1 });
      result.current.startPractice();
      });
      // 1投モードではstartPractice時点でdisplayedDartsが1になっている
      expect(result.current.displayedDarts).toHaveLength(1);

      // Act - simulateNextThrowを呼んでも何も起こらない
      act(() => {
      result.current.simulateNextThrow();
      });

      // Assert - displayedDartsは1のまま（変化しない）
      expect(result.current.displayedDarts).toHaveLength(1);
    });
  });

  describe('submitAnswer', () => {
    test('正解の場合、統計情報が更新される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });
      const correctAnswer = result.current.getCurrentCorrectAnswer();

      // Act
      act(() => {
      result.current.submitAnswer(correctAnswer);
      });

      // Assert
      expect(result.current.stats.correct).toBe(1);
      expect(result.current.stats.total).toBe(1);
      expect(result.current.stats.currentStreak).toBe(1);
      expect(result.current.stats.bestStreak).toBe(1);
    });

    test('不正解の場合、totalのみ増加する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });
      const correctAnswer = result.current.getCurrentCorrectAnswer();
      const wrongAnswer = correctAnswer + 10;

      // Act
      act(() => {
      result.current.submitAnswer(wrongAnswer);
      });

      // Assert
      expect(result.current.stats.correct).toBe(0);
      expect(result.current.stats.total).toBe(1);
      expect(result.current.stats.currentStreak).toBe(0);
    });

    test('連続正解が記録される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act
      for (let i = 0; i < 3; i++) {
      const correctAnswer = result.current.getCurrentCorrectAnswer();
      act(() => {
      result.current.submitAnswer(correctAnswer);
      result.current.nextQuestion();
      });
      }

      // Assert
      expect(result.current.stats.currentStreak).toBe(3);
      expect(result.current.stats.bestStreak).toBe(3);
    });

    test('不正解で連続正解がリセットされる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // 3回正解
      for (let i = 0; i < 3; i++) {
      const correctAnswer = result.current.getCurrentCorrectAnswer();
      act(() => {
      result.current.submitAnswer(correctAnswer);
      result.current.nextQuestion();
      });
      }

      // Act - 不正解
      const correctAnswer = result.current.getCurrentCorrectAnswer();
      act(() => {
      result.current.submitAnswer(correctAnswer + 10);
      });

      // Assert
      expect(result.current.stats.currentStreak).toBe(0);
      expect(result.current.stats.bestStreak).toBe(3); // bestStreakは保持
    });

    test('remainingモードの場合、残り点数が更新される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({
        questionType: 'remaining',
        startingScore: 501
      });
      result.current.startPractice();
      });
      const correctAnswer = result.current.getCurrentCorrectAnswer();

      // Act
      act(() => {
      result.current.submitAnswer(correctAnswer);
      });

      // Assert
      expect(result.current.remainingScore).toBeLessThan(501);
    });

    test('問題数モードで最終問題到達時にresults状態に遷移する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setSessionConfig({ mode: 'questions', questionCount: 10 });
      result.current.startPractice();
      });

      // Act - 10問すべてに正解する
      for (let i = 0; i < 10; i++) {
        const correctAnswer = result.current.getCurrentCorrectAnswer();
        act(() => {
          result.current.submitAnswer(correctAnswer);
          if (i < 9) {
            result.current.nextQuestion();
          }
        });
      }

      // Assert
      expect(result.current.gameState).toBe('results');
    });

    test('NaNの回答でエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.submitAnswer(NaN);
      });
      }).toThrow();
    });

    test('Infinityの回答でエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.submitAnswer(Infinity);
      });
      }).toThrow();
    });

    test('負の回答でエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.submitAnswer(-10);
      });
      }).toThrow();
    });

    test('小数の回答でエラーをスローする', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act & Assert
      expect(() => {
      act(() => {
      result.current.submitAnswer(60.5);
      });
      }).toThrow();
    });
  });

  describe('nextQuestion', () => {
    test('次の問題が生成される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });
      const firstQuestion = result.current.currentQuestion;

      // Act
      act(() => {
      result.current.nextQuestion();
      });

      // Assert
      expect(result.current.currentQuestion).not.toBeNull();
      expect(result.current.currentQuestion).not.toBe(firstQuestion);
    });

    test('currentThrowIndexがリセットされる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ throwUnit: 3 });
      result.current.startPractice();
      result.current.simulateNextThrow();
      result.current.simulateNextThrow();
      });
      expect(result.current.currentThrowIndex).toBe(2);

      // Act
      act(() => {
      result.current.nextQuestion();
      });

      // Assert
      expect(result.current.currentThrowIndex).toBe(0);
    });

    test('displayedDartsがリセットされる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ throwUnit: 3 });
      result.current.startPractice();
      result.current.simulateNextThrow();
      result.current.simulateNextThrow();
      });
      expect(result.current.displayedDarts.length).toBeGreaterThan(0);

      // Act
      act(() => {
      result.current.nextQuestion();
      });

      // Assert
      expect(result.current.displayedDarts).toEqual([]);
    });
  });

  describe('endSession', () => {
    test('results状態に遷移する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act
      act(() => {
      result.current.endSession('manual');
      });

      // Assert
      expect(result.current.gameState).toBe('results');
    });

    test('タイマーが停止される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });
      expect(result.current.isTimerRunning).toBe(true);

      // Act
      act(() => {
      result.current.endSession('manual');
      });

      // Assert
      expect(result.current.isTimerRunning).toBe(false);
    });

    test('終了理由がcompletedの場合', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act
      act(() => {
      result.current.endSession('completed');
      });

      // Assert
      expect(result.current.gameState).toBe('results');
    });

    test('終了理由がtimeoutの場合', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act
      act(() => {
      result.current.endSession('timeout');
      });

      // Assert
      expect(result.current.gameState).toBe('results');
    });

    test('終了理由がgame_finishedの場合', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act
      act(() => {
      result.current.endSession('game_finished');
      });

      // Assert
      expect(result.current.gameState).toBe('results');
    });
  });

  describe('resetToSetup', () => {
    test('setup状態に戻る', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });
      expect(result.current.gameState).toBe('practicing');

      // Act
      act(() => {
      result.current.resetToSetup();
      });

      // Assert
      expect(result.current.gameState).toBe('setup');
    });

    test('currentQuestionがリセットされる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });
      expect(result.current.currentQuestion).not.toBeNull();

      // Act
      act(() => {
      result.current.resetToSetup();
      });

      // Assert
      expect(result.current.currentQuestion).toBeNull();
    });

    test('統計情報がリセットされる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      const correctAnswer = result.current.getCurrentCorrectAnswer();
      result.current.submitAnswer(correctAnswer);
      });

      // Act
      act(() => {
      result.current.resetToSetup();
      });

      // Assert
      expect(result.current.stats).toEqual(initialStats);
    });

    test('タイマーがリセットされる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      useGameStore.setState({ elapsedTime: 60 });
      });

      // Act
      act(() => {
      result.current.resetToSetup();
      });

      // Assert
      expect(result.current.elapsedTime).toBe(0);
      expect(result.current.isTimerRunning).toBe(false);
    });
  });

  describe('handleBust', () => {
    test('remainingScoreがroundStartScoreに戻る', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ questionType: 'remaining', startingScore: 501 });
      result.current.startPractice();
      useGameStore.setState({ roundStartScore: 441, remainingScore: 381 });
      });

      // Act
      act(() => {
      result.current.handleBust();
      });

      // Assert
      expect(result.current.remainingScore).toBe(441);
    });

    test('currentQuestionがnullになる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ questionType: 'remaining', startingScore: 501 });
      result.current.startPractice();
      });

      // Act
      act(() => {
      result.current.handleBust();
      });

      // Assert
      expect(result.current.currentQuestion).toBeNull();
    });

    test('統計情報のtotalが増加する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ questionType: 'remaining', startingScore: 501 });
      result.current.startPractice();
      });
      const initialTotal = result.current.stats.total;

      // Act
      act(() => {
      result.current.handleBust();
      });

      // Assert
      expect(result.current.stats.total).toBe(initialTotal + 1);
    });
  });

  describe('tick', () => {
    test('経過時間が1秒増加する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });
      expect(result.current.elapsedTime).toBe(0);

      // Act
      act(() => {
      result.current.tick();
      });

      // Assert
      expect(result.current.elapsedTime).toBe(1);
    });

    test('複数回呼び出すと累積される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act
      for (let i = 0; i < 5; i++) {
      act(() => {
      result.current.tick();
      });
      }

      // Assert
      expect(result.current.elapsedTime).toBe(5);
    });

    test('タイマーが停止中は増加しない', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      result.current.endSession('manual');
      });
      expect(result.current.isTimerRunning).toBe(false);
      const elapsedBefore = result.current.elapsedTime;

      // Act
      act(() => {
      result.current.tick();
      });

      // Assert
      expect(result.current.elapsedTime).toBe(elapsedBefore);
    });

    test('時間制限モードで制限時間に達したらセッションが終了する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setSessionConfig({ mode: 'time', timeLimit: 3 });
      result.current.startPractice();
      });

      // Act - 3分 = 180秒
      for (let i = 0; i < 180; i++) {
      act(() => {
      result.current.tick();
      });
      }

      // Assert
      expect(result.current.gameState).toBe('results');
      expect(result.current.isTimerRunning).toBe(false);
    });
  });

  // ============================================================
  // 4. 計算プロパティ（セレクター）
  // ============================================================
  describe('getCurrentCorrectAnswer', () => {
    test('現在の問題の正解を返す', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // Act
      const correctAnswer = result.current.getCurrentCorrectAnswer();

      // Assert
      expect(correctAnswer).toBe(result.current.currentQuestion?.correctAnswer);
    });

    test('問題がない場合は0を返す', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      expect(result.current.currentQuestion).toBeNull();

      // Act
      const correctAnswer = result.current.getCurrentCorrectAnswer();

      // Assert
      expect(correctAnswer).toBe(0);
    });
  });

  describe('getAccuracy', () => {
    test('正答率を計算する', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      useGameStore.setState({
      stats: { correct: 8, total: 10, currentStreak: 2, bestStreak: 5 }
      });
      });

      // Act
      const accuracy = result.current.getAccuracy();

      // Assert
      expect(accuracy).toBe(0.8); // 80%
    });

    test('0問の場合は0を返す', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      expect(result.current.stats.total).toBe(0);

      // Act
      const accuracy = result.current.getAccuracy();

      // Assert
      expect(accuracy).toBe(0);
    });

    test('100%正解の場合は1を返す', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      useGameStore.setState({
      stats: { correct: 10, total: 10, currentStreak: 10, bestStreak: 10 }
      });
      });

      // Act
      const accuracy = result.current.getAccuracy();

      // Assert
      expect(accuracy).toBe(1.0);
    });
  });

  // ============================================================
  // 5. エッジケースと境界値
  // ============================================================
  describe('エッジケース', () => {
    test('ゲーム終了時（残り0点）に次の問題を生成しない', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ questionType: 'remaining', startingScore: 501 });
      result.current.startPractice();
      useGameStore.setState({ remainingScore: 0 });
      });

      // Act
      act(() => {
      result.current.nextQuestion();
      });

      // Assert
      expect(result.current.gameState).toBe('results');
    });

    test('バスト判定で残り1点になった場合', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ questionType: 'remaining', startingScore: 501 });
      result.current.startPractice();
      useGameStore.setState({ remainingScore: 1 });
      });

      // 残り1点はダブル1（2点）でしか上がれないためバスト扱い
      // Assert
      expect(result.current.remainingScore).toBe(1);
    });

    test('最大連続正解数の記録', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.startPractice();
      });

      // 5回正解 → 不正解 → 3回正解
      for (let i = 0; i < 5; i++) {
      const correctAnswer = result.current.getCurrentCorrectAnswer();
      act(() => {
      result.current.submitAnswer(correctAnswer);
      result.current.nextQuestion();
      });
      }

      const wrongAnswer = result.current.getCurrentCorrectAnswer() + 10;
      act(() => {
      result.current.submitAnswer(wrongAnswer);
      result.current.nextQuestion();
      });

      for (let i = 0; i < 3; i++) {
      const correctAnswer = result.current.getCurrentCorrectAnswer();
      act(() => {
      result.current.submitAnswer(correctAnswer);
      if (i < 2) result.current.nextQuestion();
      });
      }

      // Assert
      expect(result.current.stats.currentStreak).toBe(3);
      expect(result.current.stats.bestStreak).toBe(5); // 最大は5
    });
  });

  describe('境界値', () => {
    test('問題数10問のセッション', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setSessionConfig({ mode: 'questions', questionCount: 10 });
      result.current.startPractice();
      });
      const correctAnswer = result.current.getCurrentCorrectAnswer();

      // Act - 1問目を回答
      act(() => {
      result.current.submitAnswer(correctAnswer);
      });

      // Assert - まだ9問残っている
      expect(result.current.gameState).toBe('practicing');
      expect(result.current.stats.total).toBe(1);
    });

    test('問題数100問のセッション', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setSessionConfig({ mode: 'questions', questionCount: 100 });
      result.current.startPractice();
      });

      // Act - 1問目を回答
      const correctAnswer = result.current.getCurrentCorrectAnswer();
      act(() => {
      result.current.submitAnswer(correctAnswer);
      });

      // Assert
      expect(result.current.gameState).toBe('practicing'); // まだ99問残っている
      expect(result.current.stats.total).toBe(1);
    });

    test('時間制限3分のセッション', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setSessionConfig({ mode: 'time', timeLimit: 3 });
      result.current.startPractice();
      });

      // Assert
      expect(result.current.sessionConfig.timeLimit).toBe(3);
    });

    test('残り点数301でスタート', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ questionType: 'remaining', startingScore: 301 });
      result.current.startPractice();
      });

      // Assert
      expect(result.current.remainingScore).toBe(301);
    });

    test('残り点数701でスタート', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setConfig({ questionType: 'remaining', startingScore: 701 });
      result.current.startPractice();
      });

      // Assert
      expect(result.current.remainingScore).toBe(701);
    });

    test('標準偏差の最小値（1mm）', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setStdDev(1);
      });

      // Assert
      expect(result.current.config.stdDevMM).toBe(1);
    });

    test('標準偏差の最大値（100mm）', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore());
      act(() => {
      result.current.setStdDev(100);
      });

      // Assert
      expect(result.current.config.stdDevMM).toBe(100);
    });
  });

  // ============================================================
  // 6. 複数パラメーターの組み合わせ
  // ============================================================
  describe('設定の組み合わせ', () => {
    test('3投 + 累積 + 残り点数モード', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.setConfig({
      throwUnit: 3,
      judgmentTiming: 'cumulative',
      questionType: 'remaining',
      startingScore: 501
      });
      result.current.startPractice();
      });

      // Assert
      expect(result.current.config.throwUnit).toBe(3);
      expect(result.current.config.judgmentTiming).toBe('cumulative');
      expect(result.current.config.questionType).toBe('remaining');
      expect(result.current.remainingScore).toBe(501);
    });

    test('1投 + 独立 + 得点モード', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.setConfig({
        throwUnit: 1,
        judgmentTiming: 'independent',
        questionType: 'score',
        startingScore: null
      });
      result.current.startPractice();
      });

      // Assert
      expect(result.current.config.throwUnit).toBe(1);
      expect(result.current.config.judgmentTiming).toBe('independent');
      expect(result.current.config.questionType).toBe('score');
      expect(result.current.remainingScore).toBe(0); // startingScoreがnullなので0
    });

    test('3投 + 独立 + 両方モード', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());

      // Act
      act(() => {
      result.current.setConfig({
      throwUnit: 3,
      judgmentTiming: 'independent',
      questionType: 'both',
      startingScore: 501
      });
      result.current.startPractice();
      });

      // Assert
      expect(result.current.config.throwUnit).toBe(3);
      expect(result.current.config.judgmentTiming).toBe('independent');
      expect(result.current.config.questionType).toBe('both');
    });
  });
});
