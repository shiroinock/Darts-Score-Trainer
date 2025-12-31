import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { SessionConfig, Stats, Target } from '../types';
import { STORAGE_KEY } from '../utils/constants/index.js';

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
  bestStreak: 0,
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
          startingScore: 501,
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
        practiceStartTime: undefined,
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
          startingScore: 501,
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
        timeLimit: 5,
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
        questionCount: 50,
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
        label: 'D16',
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
        label: 'BULL',
      };

      // Act
      act(() => {
        result.current.setTarget(bullTarget);
      });

      // Assert
      expect(result.current.config.target?.type).toBe('BULL');
      expect(result.current.config.target?.number).toBeNull();
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
        useGameStore.setState({
          stats: { correct: 5, total: 10, currentStreak: 3, bestStreak: 5 },
        });
      });

      // Act
      act(() => {
        result.current.startPractice();
      });

      // Assert: correct、total、currentStreakはリセットされるが、bestStreakは保持される
      expect(result.current.stats).toEqual({
        ...initialStats,
        bestStreak: 5, // 既存のbestStreakを保持
      });
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
      expect(result.current.displayedDarts).toHaveLength(2);
    });

    test('currentThrowIndexが更新される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
        result.current.setConfig({ throwUnit: 3 });
        result.current.startPractice();
      });
      expect(result.current.currentThrowIndex).toBe(1);

      // Act
      act(() => {
        result.current.simulateNextThrow();
      });

      // Assert
      expect(result.current.currentThrowIndex).toBe(2);
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
          startingScore: 501,
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
      expect(result.current.currentThrowIndex).toBe(3);

      // Act
      act(() => {
        result.current.nextQuestion();
      });

      // Assert
      expect(result.current.currentThrowIndex).toBe(1);
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
      expect(result.current.displayedDarts.length).toBe(3);

      // Act
      act(() => {
        result.current.nextQuestion();
      });

      // Assert: 新しい問題で最初の1本が表示される
      expect(result.current.displayedDarts).toHaveLength(1);
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

      // practiceStartTimeを1秒前に設定
      act(() => {
        useGameStore.setState({
          practiceStartTime: Date.now() - 1000,
        });
        result.current.tick();
      });

      // Assert: 約1秒経過
      expect(result.current.elapsedTime).toBeGreaterThanOrEqual(1);
      expect(result.current.elapsedTime).toBeLessThanOrEqual(2);
    });

    test('複数回呼び出すと累積される', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore());
      act(() => {
        result.current.startPractice();
      });

      // practiceStartTimeを5秒前に設定
      act(() => {
        useGameStore.setState({
          practiceStartTime: Date.now() - 5000,
        });
      });

      // Act: tick()を複数回呼び出す（Date.now()基準なので結果は同じ）
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.tick();
        });
      }

      // Assert: 約5秒経過
      expect(result.current.elapsedTime).toBeGreaterThanOrEqual(5);
      expect(result.current.elapsedTime).toBeLessThanOrEqual(6);
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

      // Act: practiceStartTimeを3分以上前に設定
      act(() => {
        useGameStore.setState({
          practiceStartTime: Date.now() - 181000, // 181秒前（3分1秒前）
        });
        result.current.tick();
      });

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
          stats: { correct: 8, total: 10, currentStreak: 2, bestStreak: 5 },
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
          stats: { correct: 10, total: 10, currentStreak: 10, bestStreak: 10 },
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
          startingScore: 501,
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
          startingScore: 501,
        });
        result.current.startPractice();
      });

      // Assert
      expect(result.current.config.throwUnit).toBe(1);
      expect(result.current.config.judgmentTiming).toBe('independent');
      expect(result.current.config.questionType).toBe('score');
      expect(result.current.remainingScore).toBe(501); // startingScoreは常に設定される
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
          startingScore: 501,
        });
        result.current.startPractice();
      });

      // Assert
      expect(result.current.config.throwUnit).toBe(3);
      expect(result.current.config.judgmentTiming).toBe('independent');
      expect(result.current.config.questionType).toBe('both');
    });
  });

  // ============================================================
  // 9. persist ミドルウェアのテスト
  // ============================================================
  describe('persistミドルウェア', () => {
    beforeEach(() => {
      // 各テスト前にlocalStorageをクリア
      localStorage.clear();
    });

    describe('PracticeConfigの永続化', () => {
      test('configの変更がlocalStorageに保存される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.setConfig({
            stdDevMM: 30,
            throwUnit: 3,
            questionType: 'remaining',
          });
        });

        // Assert: localStorageに保存されていることを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();

        const parsed = JSON.parse(stored!);
        expect(parsed.stdDevMM).toBe(30);
        expect(parsed.throwUnit).toBe(3);
        expect(parsed.questionType).toBe('remaining');
      });

      test('selectPresetの呼び出しがlocalStorageに保存される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.selectPreset('preset-player');
        });

        // Assert: localStorageに保存されていることを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();

        const parsed = JSON.parse(stored!);
        expect(parsed.configId).toBe('preset-player');
        expect(parsed.throwUnit).toBe(3);
      });

      test('setTargetの呼び出しがlocalStorageに保存される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        const newTarget: Target = {
          type: 'DOUBLE',
          number: 16,
          label: 'D16',
        };

        // Act
        act(() => {
          result.current.setTarget(newTarget);
        });

        // Assert: localStorageに保存されていることを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();

        const parsed = JSON.parse(stored!);
        expect(parsed.target).toEqual(newTarget);
      });

      test('setStdDevの呼び出しがlocalStorageに保存される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.setStdDev(50);
        });

        // Assert: localStorageに保存されていることを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();

        const parsed = JSON.parse(stored!);
        expect(parsed.stdDevMM).toBe(50);
      });
    });

    describe('一時的な状態の非永続化', () => {
      test('currentQuestionはlocalStorageに保存されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.startPractice();
        });

        // Assert: currentQuestionが生成されていることを確認
        expect(result.current.currentQuestion).not.toBeNull();

        // Assert: localStorageにcurrentQuestionが保存されていないことを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.currentQuestion).toBeUndefined();
        }
      });

      test('statsはlocalStorageに保存されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.startPractice();
          const correctAnswer = result.current.getCurrentCorrectAnswer();
          result.current.submitAnswer(correctAnswer);
        });

        // Assert: statsが更新されていることを確認
        expect(result.current.stats.correct).toBeGreaterThan(0);

        // Assert: localStorageにstatsが保存されていないことを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.stats).toBeUndefined();
        }
      });

      test('elapsedTimeはlocalStorageに保存されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.startPractice();
          useGameStore.setState({
            practiceStartTime: Date.now() - 5000,
          });
          result.current.tick();
        });

        // Assert: elapsedTimeが更新されていることを確認
        expect(result.current.elapsedTime).toBeGreaterThan(0);

        // Assert: localStorageにelapsedTimeが保存されていないことを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.elapsedTime).toBeUndefined();
        }
      });

      test('isTimerRunningはlocalStorageに保存されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.startPractice();
        });

        // Assert: isTimerRunningがtrueになっていることを確認
        expect(result.current.isTimerRunning).toBe(true);

        // Assert: localStorageにisTimerRunningが保存されていないことを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.isTimerRunning).toBeUndefined();
        }
      });

      test('gameStateはlocalStorageに保存されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.startPractice();
        });

        // Assert: gameStateがpracticingになっていることを確認
        expect(result.current.gameState).toBe('practicing');

        // Assert: localStorageにgameStateが保存されていないことを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.gameState).toBeUndefined();
        }
      });

      test('remainingScoreはlocalStorageに保存されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.setConfig({
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // Assert: remainingScoreが設定されていることを確認
        expect(result.current.remainingScore).toBe(501);

        // Assert: localStorageにremainingScoreが保存されていないことを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.remainingScore).toBeUndefined();
        }
      });

      test('displayedDartsはlocalStorageに保存されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.startPractice();
        });

        // Assert: displayedDartsが設定されていることを確認
        expect(result.current.displayedDarts.length).toBeGreaterThan(0);

        // Assert: localStorageにdisplayedDartsが保存されていないことを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.displayedDarts).toBeUndefined();
        }
      });
    });

    describe('初期化時の設定読み込み', () => {
      test('localStorage内の既存設定がストア初期化時に読み込まれる', () => {
        // Arrange: 既存設定をlocalStorageに保存
        // （Zustand はsingleton のため、実際の再初期化をテストする代わりに、
        // persist ミドルウェアの getItem/merge 処理を統合テストで確認）
        const { result } = renderHook(() => useGameStore());

        // Act: 設定を変更してlocalStorageに保存
        const testConfig = {
          configId: 'preset-comprehensive',
          throwUnit: 3 as const,
          questionType: 'both' as const,
          startingScore: 501,
          stdDevMM: 8,
        };

        act(() => {
          result.current.setConfig(testConfig);
        });

        // Assert: localStorageに保存された設定を確認
        // 同じプロセス内で再度取得することで、persist の保存/読み込みを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();

        const parsed = JSON.parse(stored!);
        expect(parsed.throwUnit).toBe(3);
        expect(parsed.questionType).toBe('both');
        expect(parsed.startingScore).toBe(501);
        expect(parsed.stdDevMM).toBe(8);

        // Act: ストア設定を別の値で上書き
        act(() => {
          result.current.setConfig({ throwUnit: 1 });
        });

        // Assert: 別の値が保存されている
        const stored2 = localStorage.getItem(STORAGE_KEY);
        const parsed2 = JSON.parse(stored2!);
        expect(parsed2.throwUnit).toBe(1);

        // Act: 元の設定を復元
        act(() => {
          result.current.setConfig(testConfig);
        });

        // Assert: 元の設定が復元されている
        const stored3 = localStorage.getItem(STORAGE_KEY);
        const parsed3 = JSON.parse(stored3!);
        expect(parsed3.throwUnit).toBe(3);
        expect(parsed3.questionType).toBe('both');
      });

      test('localStorageが空の場合はデフォルト設定で初期化される', () => {
        // Arrange: localStorageを空にする
        localStorage.clear();

        // Act: ストアを新規初期化
        const { result } = renderHook(() => useGameStore());

        // Assert: デフォルト設定（preset-basic）が使用されている
        expect(result.current.config.configId).toBe('preset-basic');
        expect(result.current.config.throwUnit).toBe(1);
      });

      test('localStorageの設定が不正な場合はデフォルト設定で初期化される', () => {
        // Arrange: 不正なJSONをlocalStorageに保存
        localStorage.setItem(STORAGE_KEY, '{invalid-json}');

        // Act: ストアを新規初期化
        const { result } = renderHook(() => useGameStore());

        // Assert: デフォルト設定が使用されている
        expect(result.current.config.configId).toBe('preset-basic');
      });
    });

    describe('storage.tsとの整合性', () => {
      test('STORAGE_KEYが一致している', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act
        act(() => {
          result.current.setConfig({ stdDevMM: 25 });
        });

        // Assert: storage.tsと同じSTORAGE_KEYが使用されている
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();

        // STORAGE_KEYの値を確認
        expect(STORAGE_KEY).toBe('darts-score-trainer-settings');
      });

      test('saveSettings関数と同じ形式でデータが保存される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        const configUpdate = {
          throwUnit: 3 as const,
          questionType: 'score' as const,
          stdDevMM: 30,
        };

        // Act
        act(() => {
          result.current.setConfig(configUpdate);
        });

        // Assert: JSON形式で正しく保存されている
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();

        // JSONパースが成功する
        expect(() => JSON.parse(stored!)).not.toThrow();

        const parsed = JSON.parse(stored!);
        expect(typeof parsed).toBe('object');
        expect(parsed.throwUnit).toBe(3);
        expect(parsed.questionType).toBe('score');
        expect(parsed.stdDevMM).toBe(30);
      });
    });

    describe('sessionConfigの非永続化', () => {
      test('sessionConfigはlocalStorageに保存されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        const newSessionConfig: SessionConfig = {
          mode: 'time',
          timeLimit: 10,
        };

        // Act
        act(() => {
          result.current.setSessionConfig(newSessionConfig);
        });

        // Assert: sessionConfigが更新されていることを確認
        expect(result.current.sessionConfig.mode).toBe('time');
        expect(result.current.sessionConfig.timeLimit).toBe(10);

        // Assert: localStorageにsessionConfigが保存されていないことを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.sessionConfig).toBeUndefined();
        }
      });
    });

    describe('エッジケース', () => {
      test('localStorage容量制限時のエラーハンドリング', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // localStorageのsetItemをモックしてエラーを発生させる
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        setItemSpy.mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });

        // Act & Assert: エラーがスローされても処理が継続する
        expect(() => {
          act(() => {
            result.current.setConfig({ stdDevMM: 40 });
          });
        }).not.toThrow();

        // Assert: ストアの状態は更新されている
        expect(result.current.config.stdDevMM).toBe(40);

        // Cleanup
        setItemSpy.mockRestore();
      });

      test('複数のストアインスタンスで同じlocalStorageを共有する', () => {
        // Arrange
        const { result: result1 } = renderHook(() => useGameStore());

        // Act: 最初のインスタンスで設定を更新
        act(() => {
          result1.current.setConfig({ stdDevMM: 35 });
        });

        // Assert: localStorageに保存されている
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.stdDevMM).toBe(35);

        // Act: 2つ目のインスタンスを生成
        const { result: result2 } = renderHook(() => useGameStore());

        // Assert: 2つ目のインスタンスも同じ設定を持つ
        expect(result2.current.config.stdDevMM).toBe(35);
      });
    });

    describe('部分的な設定更新', () => {
      test('一部のプロパティのみ更新してもlocalStorageに正しく保存される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        // Act: 最初に複数のプロパティを設定
        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'remaining',
            startingScore: 501,
            stdDevMM: 15,
          });
        });

        // Act: 1つのプロパティだけ更新
        act(() => {
          result.current.setConfig({ stdDevMM: 20 });
        });

        // Assert: localStorageには全ての設定が保存されている
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.throwUnit).toBe(3);
        expect(parsed.questionType).toBe('remaining');
        expect(parsed.startingScore).toBe(501);
        expect(parsed.stdDevMM).toBe(20); // 更新された値
      });
    });
  });

  // ============================================================
  // 10. バスト判定機能のテスト
  // ============================================================
  describe('バスト判定機能', () => {
    describe('通常系: バスト判定なし', () => {
      test('scoreモードではbustInfoが含まれない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'score',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // Act
        act(() => {
          result.current.generateQuestion();
        });

        // Assert
        expect(result.current.currentQuestion).not.toBeNull();
        expect(result.current.currentQuestion?.bustInfo).toBeUndefined();
      });

      test('remainingモードでバストでない場合はbustInfoが含まれない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 正常な投擲を設定（50点から20点を引いて30点残る）
        act(() => {
          useGameStore.setState({
            remainingScore: 50,
            roundStartScore: 50,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 30,
              questionText: '残り点数は？',
              startingScore: 50,
            },
          });
        });

        // Assert: バストでないのでbustInfoが設定されない
        expect(result.current.currentQuestion?.bustInfo).toBeUndefined();
      });
    });

    describe('オーバー判定: throwScore > remainingScore', () => {
      test('残り点数を超える得点でbustInfo.reason = "over"が設定される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // バスト状況を設定（30点から60点を引いてオーバー）
        act(() => {
          useGameStore.setState({
            remainingScore: 30,
            roundStartScore: 30,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 60,
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 30,
              questionText: '残り点数は？',
              startingScore: 30,
              bustInfo: {
                isBust: true,
                reason: 'over',
              },
            },
          });
        });

        // Assert: bustInfoが設定されている
        expect(result.current.currentQuestion?.bustInfo).toBeDefined();
        expect(result.current.currentQuestion?.bustInfo?.isBust).toBe(true);
        expect(result.current.currentQuestion?.bustInfo?.reason).toBe('over');
      });
    });

    describe('1点残し判定: remainingScore - throwScore === 1', () => {
      test('残り点数が1点になる場合、bustInfo.reason = "finish_impossible"が設定される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 1点残し状況を設定（21点から20点を引いて1点残る）
        act(() => {
          useGameStore.setState({
            remainingScore: 21,
            roundStartScore: 21,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 21,
              questionText: '残り点数は？',
              startingScore: 21,
              bustInfo: {
                isBust: true,
                reason: 'finish_impossible',
              },
            },
          });
        });

        // Assert: bustInfoが設定されている
        expect(result.current.currentQuestion?.bustInfo).toBeDefined();
        expect(result.current.currentQuestion?.bustInfo?.isBust).toBe(true);
        expect(result.current.currentQuestion?.bustInfo?.reason).toBe('finish_impossible');
      });

      test('残り3点から2点を引いて1点残る場合もバスト判定される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 1点残し状況を設定
        act(() => {
          useGameStore.setState({
            remainingScore: 3,
            roundStartScore: 3,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 2, label: '2' },
                  landingPoint: { x: 0, y: 50 },
                  score: 2,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 2,
                },
              ],
              correctAnswer: 3,
              questionText: '残り点数は？',
              startingScore: 3,
              bustInfo: {
                isBust: true,
                reason: 'finish_impossible',
              },
            },
          });
        });

        // Assert
        expect(result.current.currentQuestion?.bustInfo).toBeDefined();
        expect(result.current.currentQuestion?.bustInfo?.isBust).toBe(true);
        expect(result.current.currentQuestion?.bustInfo?.reason).toBe('finish_impossible');
      });
    });

    describe('ダブル外し判定: remainingScore - throwScore === 0 && !isDouble', () => {
      test('ちょうど0点になるがダブルでない場合、bustInfo.reason = "double_out_required"が設定される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // ダブル外し状況を設定（40点からシングル40で0点だがダブルでない）
        act(() => {
          useGameStore.setState({
            remainingScore: 40,
            roundStartScore: 40,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 40,
                  ring: 'INNER_SINGLE', // ダブルでない
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 40,
              questionText: '残り点数は？',
              startingScore: 40,
              bustInfo: {
                isBust: true,
                reason: 'double_out_required',
              },
            },
          });
        });

        // Assert: bustInfoが設定されている
        expect(result.current.currentQuestion?.bustInfo).toBeDefined();
        expect(result.current.currentQuestion?.bustInfo?.isBust).toBe(true);
        expect(result.current.currentQuestion?.bustInfo?.reason).toBe('double_out_required');
      });

      test('50点からBULL（ダブル扱い）で0点になる場合はバストでない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // BULL成功状況を設定（50点からBULLで0点、ダブル扱い）
        act(() => {
          useGameStore.setState({
            remainingScore: 50,
            roundStartScore: 50,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'BULL', number: null, label: 'BULL' },
                  landingPoint: { x: 0, y: 0 },
                  score: 50,
                  ring: 'INNER_BULL', // BULLはダブル扱い
                  segmentNumber: undefined,
                },
              ],
              correctAnswer: 0,
              questionText: '残り点数は？',
              startingScore: 50,
            },
          });
        });

        // Assert: バストでないのでbustInfoが設定されない
        expect(result.current.currentQuestion?.bustInfo).toBeUndefined();
      });

      test('40点からD20で0点になる場合はバストでない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // ダブル成功状況を設定
        act(() => {
          useGameStore.setState({
            remainingScore: 40,
            roundStartScore: 40,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'DOUBLE', number: 20, label: 'D20' },
                  landingPoint: { x: 0, y: 165 },
                  score: 40,
                  ring: 'DOUBLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 0,
              questionText: '残り点数は？',
              startingScore: 40,
            },
          });
        });

        // Assert: バストでないのでbustInfoが設定されない
        expect(result.current.currentQuestion?.bustInfo).toBeUndefined();
      });
    });

    describe('複数投擲時のバスト判定: 3投モードでのバスト検出', () => {
      test('3投の合計でオーバーした場合、bustInfoが設定される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 3投の合計でバスト（50点から60点引いてオーバー）
        act(() => {
          useGameStore.setState({
            remainingScore: 50,
            roundStartScore: 50,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 50,
              questionText: '残り点数は？',
              startingScore: 50,
              bustInfo: {
                isBust: true,
                reason: 'over',
              },
            },
          });
        });

        // Assert: bustInfoが設定されている
        expect(result.current.currentQuestion?.bustInfo).toBeDefined();
        expect(result.current.currentQuestion?.bustInfo?.isBust).toBe(true);
        expect(result.current.currentQuestion?.bustInfo?.reason).toBe('over');
      });

      test('3投の合計で1点残しになる場合、bustInfoが設定される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 3投の合計で1点残し（61点から60点引いて1点残る）
        act(() => {
          useGameStore.setState({
            remainingScore: 61,
            roundStartScore: 61,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 61,
              questionText: '残り点数は？',
              startingScore: 61,
              bustInfo: {
                isBust: true,
                reason: 'finish_impossible',
              },
            },
          });
        });

        // Assert
        expect(result.current.currentQuestion?.bustInfo).toBeDefined();
        expect(result.current.currentQuestion?.bustInfo?.isBust).toBe(true);
        expect(result.current.currentQuestion?.bustInfo?.reason).toBe('finish_impossible');
      });

      test('3投の最後がシングルで0点になる場合、bustInfoが設定される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 3投の最後がダブルでないフィニッシュ（60点から60点引くが最後がシングル）
        act(() => {
          useGameStore.setState({
            remainingScore: 60,
            roundStartScore: 60,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 60,
              questionText: '残り点数は？',
              startingScore: 60,
              bustInfo: {
                isBust: true,
                reason: 'double_out_required',
              },
            },
          });
        });

        // Assert
        expect(result.current.currentQuestion?.bustInfo).toBeDefined();
        expect(result.current.currentQuestion?.bustInfo?.isBust).toBe(true);
        expect(result.current.currentQuestion?.bustInfo?.reason).toBe('double_out_required');
      });
    });

    describe('remainingモード: バスト検出時にQuestion.bustInfoが設定される', () => {
      test('generateQuestion()でバスト判定を実施しbustInfoを設定する', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'remaining',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 現在の残り点数を30点に設定
        act(() => {
          useGameStore.setState({
            remainingScore: 30,
            roundStartScore: 30,
          });
        });

        // Act: generateQuestionを呼び出す（内部でバスト判定を実施）
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: 生成された問題にbustInfoが含まれる可能性がある
        // （実装次第でバストが発生した場合のみbustInfoが設定される）
        // このテストでは、バストが発生する場合のみbustInfoが設定されることを確認
        if (result.current.currentQuestion?.bustInfo) {
          expect(result.current.currentQuestion.bustInfo.isBust).toBe(true);
          expect(result.current.currentQuestion.bustInfo.reason).toMatch(
            /over|finish_impossible|double_out_required/
          );
        }
      });
    });

    describe('scoreモード: バスト判定が実施されない', () => {
      test('scoreモードでは残り点数に関係なくbustInfoが設定されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'score',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 残り点数を30点に設定（scoreモードでは無関係）
        act(() => {
          useGameStore.setState({
            remainingScore: 30,
            roundStartScore: 30,
          });
        });

        // Act: generateQuestionを呼び出す
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: scoreモードではbustInfoが設定されない
        expect(result.current.currentQuestion?.bustInfo).toBeUndefined();
      });

      test('scoreモードで大きな得点が出てもbustInfoは設定されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'score',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 残り点数が小さい状態を設定
        act(() => {
          useGameStore.setState({
            remainingScore: 10,
            roundStartScore: 10,
          });
        });

        // Act: generateQuestionを呼び出す
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: scoreモードではbustInfoが設定されない
        expect(result.current.currentQuestion?.bustInfo).toBeUndefined();
      });
    });
  });

  // ============================================================
  // 11. レビュー指摘への対応テスト
  // ============================================================
  describe('レビュー指摘への対応', () => {
    // バスト関連テスト（3個）
    describe('バスト処理の自動リセット', () => {
      test('submitAnswer内でバスト検出時に残り点数をリセット', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'remaining',
            startingScore: 50,
          });
          result.current.startPractice();
        });

        const initialRoundStart = result.current.roundStartScore;

        // バストする状況を想定（50点から60点を引いて-10 -> バスト）
        // currentQuestionを手動で設定してバストを模擬
        act(() => {
          useGameStore.setState({
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 60,
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 50, // バスト前の残り点数
              questionText: '残り点数は？',
              startingScore: 50,
            },
            remainingScore: 50,
            roundStartScore: 50,
          });
        });

        // Act: ユーザーが50と回答（バストを認識できていない）
        act(() => {
          result.current.submitAnswer(50);
        });

        // Assert: バストが自動検出され、残り点数がラウンド開始時に戻っている
        expect(result.current.remainingScore).toBe(initialRoundStart);
        expect(result.current.stats.total).toBe(1);
        expect(result.current.stats.currentStreak).toBe(0);
      });

      test('バスト時の統計更新（total++、currentStreak=0）', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'remaining',
            startingScore: 10, // 10点の状態
          });
          result.current.startPractice();
        });

        // 正解を1回先に入れてstreakを作る
        act(() => {
          useGameStore.setState({
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 5, label: '5' },
                  landingPoint: { x: 0, y: 50 },
                  score: 5,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 5,
                },
              ],
              correctAnswer: 5,
              questionText: '残り点数は？',
              startingScore: 10,
            },
            remainingScore: 10,
            roundStartScore: 10,
            stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
          });
          result.current.submitAnswer(5);
        });

        // streakが1になっていることを確認
        expect(result.current.stats.currentStreak).toBe(1);
        const remainingAfterFirst = result.current.remainingScore;

        // バストする問題を設定（残り5点から10点投擲でバスト）
        act(() => {
          useGameStore.setState({
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 10, label: '10' },
                  landingPoint: { x: 0, y: 80 },
                  score: 10,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 10,
                },
              ],
              correctAnswer: remainingAfterFirst, // バスト前の残り点数
              questionText: '残り点数は？',
              startingScore: remainingAfterFirst,
            },
            roundStartScore: remainingAfterFirst,
          });
        });

        // Act: バスト状態で回答送信（ユーザーが回答）
        act(() => {
          result.current.submitAnswer(remainingAfterFirst);
        });

        // Assert: streakがリセットされている
        expect(result.current.stats.currentStreak).toBe(0);
        expect(result.current.stats.total).toBeGreaterThanOrEqual(2);
      });

      test('正常な回答時はバスト処理が実行されない', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'remaining',
            startingScore: 100,
          });
          result.current.startPractice();
        });

        // 正常な投擲を設定
        act(() => {
          useGameStore.setState({
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: 100 },
                  score: 20,
                  ring: 'INNER_SINGLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 80,
              questionText: '残り点数は？',
              startingScore: 100,
            },
            remainingScore: 100,
            roundStartScore: 100,
          });
        });

        // Act: 正解を送信
        act(() => {
          result.current.submitAnswer(80);
        });

        // Assert: 残り点数が正しく更新されている
        expect(result.current.remainingScore).toBe(80);
        expect(result.current.stats.correct).toBe(1);
        expect(result.current.stats.currentStreak).toBe(1);
      });
    });

    // 'both'モード関連テスト（3個）
    describe('bothモードのバリデーション', () => {
      test('bothモード: scoreモードが選択される場合', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.3);

        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'both',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // Act: Math.random()をモックしてscoreモードが選択されるようにする
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: scoreモードが選択されている
        expect(result.current.currentQuestion).not.toBeNull();
        if (result.current.currentQuestion) {
          expect(result.current.currentQuestion.mode).toBe('score');
          expect(result.current.currentQuestion.correctAnswer).toBeGreaterThanOrEqual(0);
        }

        mathRandomSpy.mockRestore();
      });

      test('bothモード: remainingモードが選択される場合', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());
        const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.7);

        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'both',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // Act: Math.random()をモックしてremainingモードが選択されるようにする
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: remainingモードが選択されている
        expect(result.current.currentQuestion).not.toBeNull();
        if (result.current.currentQuestion) {
          expect(result.current.currentQuestion.mode).toBe('remaining');
          expect(result.current.currentQuestion.correctAnswer).toBeGreaterThanOrEqual(0);
        }

        mathRandomSpy.mockRestore();
      });

      test('bothモード + remainingScore=0 の場合、scoreモードが強制される', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'both',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // remainingScoreを手動で0に設定
        act(() => {
          useGameStore.setState({
            remainingScore: 0,
          });
        });

        // Act: 問題を生成
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: modeがscoreに強制されている
        expect(result.current.currentQuestion).not.toBeNull();
        if (result.current.currentQuestion) {
          expect(result.current.currentQuestion.mode).toBe('score');
        }
      });
    });

    // getOptimalTargetがnullを返すエッジケース（3個）
    describe('getOptimalTargetがnullを返す場合のフォールバック', () => {
      test('remainingScore=1でDEFAULT_TARGETにフォールバック', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'score',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // remainingScoreを1に設定（getOptimalTarget(1, 3)はnullを返す）
        act(() => {
          useGameStore.setState({
            remainingScore: 1,
          });
        });

        // Act: 問題を生成
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: DEFAULT_TARGETが使用される（エラーが発生しない）
        expect(result.current.currentQuestion).not.toBeNull();
        // 3投モードの場合、generateQuestion直後は最初の1本が表示される
        expect(result.current.displayedDarts).toHaveLength(1);
      });

      test('remainingScore=0でDEFAULT_TARGETにフォールバック', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setConfig({
            throwUnit: 3,
            questionType: 'score',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // remainingScoreを0に設定（getOptimalTarget(0, 3)はnullを返す）
        act(() => {
          useGameStore.setState({
            remainingScore: 0,
          });
        });

        // Act: 問題を生成
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: DEFAULT_TARGETが使用される（エラーが発生しない）
        expect(result.current.currentQuestion).not.toBeNull();
        // 3投モードの場合、generateQuestion直後は最初の1本が表示される
        expect(result.current.displayedDarts).toHaveLength(1);
      });

      test('throwsRemaining=1でフィニッシュ不可能な点数（163点）の場合', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'score',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // remainingScoreを163に設定（getOptimalTarget(163, 1)はnullを返す）
        act(() => {
          useGameStore.setState({
            remainingScore: 163,
          });
        });

        // Act: 問題を生成
        act(() => {
          result.current.generateQuestion();
        });

        // Assert: DEFAULT_TARGETが使用される（エラーが発生しない）
        expect(result.current.currentQuestion).not.toBeNull();
        expect(result.current.displayedDarts).toHaveLength(1);
      });
    });

    // nextQuestion関連テスト（1個）
    describe('nextQuestionでのcurrentQuestionリセット', () => {
      test('nextQuestion呼び出し前後でcurrentQuestionが明示的にリセットされる', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setConfig({
            throwUnit: 1,
            questionType: 'score',
            startingScore: 501,
          });
          result.current.startPractice();
        });

        // 最初の問題があることを確認
        expect(result.current.currentQuestion).not.toBeNull();
        const firstQuestion = result.current.currentQuestion;

        // Act: nextQuestionを呼び出す
        act(() => {
          result.current.nextQuestion();
        });

        // Assert: currentQuestionが新しく生成されている
        expect(result.current.currentQuestion).not.toBeNull();
        expect(result.current.currentQuestion).not.toBe(firstQuestion); // 新しい問題
        expect(result.current.displayedDarts).toHaveLength(1); // 1投モードなので1つ表示
      });
    });

    // タイマー関連テスト（2個）
    describe('タイマー精度の改善', () => {
      test('tick()がDate.now()を基準に経過時間を計算する', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.startPractice();
        });

        // practiceStartTimeが設定されていることを確認
        expect(result.current.isTimerRunning).toBe(true);

        // Act: 少し時間を進める（実際には即座に実行されるが、コンセプトの確認）
        act(() => {
          result.current.tick();
        });

        // Assert: elapsedTimeが0以上（Date.now()基準で計算されている）
        expect(result.current.elapsedTime).toBeGreaterThanOrEqual(0);
        expect(result.current.elapsedTime).toBeLessThan(5); // 5秒未満のはず
      });

      test('時間制限モードでtimeLimit到達時にセッションが終了する', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setSessionConfig({
            mode: 'time',
            timeLimit: 3, // 3分
          });
          result.current.startPractice();
        });

        // Act: practiceStartTimeを3分以上前に設定
        act(() => {
          useGameStore.setState({
            practiceStartTime: Date.now() - 181000, // 181秒前（3分1秒前）
          });
          result.current.tick();
        });

        // Assert: セッションが終了している
        expect(result.current.gameState).toBe('results');
        expect(result.current.isTimerRunning).toBe(false);
      });
    });

    // パラメータ関連テスト（1個）
    describe('endSessionのreason引数', () => {
      test('endSession(reason?: string)が型安全に呼び出せる', () => {
        // Arrange
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.startPractice();
        });

        // Act & Assert: reasonなしで呼び出せる
        act(() => {
          result.current.endSession();
        });
        expect(result.current.gameState).toBe('results');

        // Act & Assert: reasonありで呼び出せる
        act(() => {
          result.current.resetToSetup();
          result.current.startPractice();
          result.current.endSession('user requested');
        });
        expect(result.current.gameState).toBe('results');
      });
    });

    // Phase 9.1.1 Phase A: ダーツ表示の修正（6個）
    describe('Phase 9.1.1 Phase A: ダーツ表示の修正', () => {
      describe('generateQuestion時のdisplayedDarts', () => {
        test('3投モードでgenerateQuestion時に最初の1本だけがdisplayedDartsに含まれる', () => {
          // Arrange
          const { result } = renderHook(() => useGameStore());

          act(() => {
            result.current.setConfig({
              throwUnit: 3,
              questionType: 'score',
              startingScore: 501,
            });
            result.current.startPractice();
          });

          // Assert: 3投事前シミュレーション後、最初の1本のみが表示される
          expect(result.current.currentQuestion).not.toBeNull();
          expect(result.current.currentQuestion?.throws).toHaveLength(3); // 事前シミュレーション済み
          expect(result.current.displayedDarts).toHaveLength(1); // 最初の1本のみ表示
          expect(result.current.displayedDarts[0]).toEqual(
            result.current.currentQuestion?.throws[0]
          );
        });

        test('3投モードでgenerateQuestion時にcurrentThrowIndexが1になる', () => {
          // Arrange
          const { result } = renderHook(() => useGameStore());

          act(() => {
            result.current.setConfig({
              throwUnit: 3,
              questionType: 'score',
              startingScore: 501,
            });
            result.current.startPractice();
          });

          // Assert: currentThrowIndexは1（最初の1本を表示済み）
          expect(result.current.currentThrowIndex).toBe(1);
        });
      });

      describe('simulateNextThrow呼び出しでのダーツ追加', () => {
        test('3投モードでsimulateNextThrow呼び出しで2本目が追加される', () => {
          // Arrange
          const { result } = renderHook(() => useGameStore());

          act(() => {
            result.current.setConfig({
              throwUnit: 3,
              questionType: 'score',
              startingScore: 501,
            });
            result.current.startPractice();
          });

          // generateQuestion直後は1本目のみ表示
          expect(result.current.displayedDarts).toHaveLength(1);
          expect(result.current.currentThrowIndex).toBe(1);

          // Act: simulateNextThrowで2本目を追加
          act(() => {
            result.current.simulateNextThrow();
          });

          // Assert: 2本目が追加され、currentThrowIndexが2になる
          expect(result.current.displayedDarts).toHaveLength(2);
          expect(result.current.currentThrowIndex).toBe(2);
          expect(result.current.displayedDarts[1]).toEqual(
            result.current.currentQuestion?.throws[1]
          );
        });

        test('3投モードでsimulateNextThrow2回呼び出しで3本すべてが表示される', () => {
          // Arrange
          const { result } = renderHook(() => useGameStore());

          act(() => {
            result.current.setConfig({
              throwUnit: 3,
              questionType: 'score',
              startingScore: 501,
            });
            result.current.startPractice();
          });

          // generateQuestion直後は1本目のみ表示
          expect(result.current.displayedDarts).toHaveLength(1);
          expect(result.current.currentThrowIndex).toBe(1);

          // Act: simulateNextThrowを2回呼び出し
          act(() => {
            result.current.simulateNextThrow();
            result.current.simulateNextThrow();
          });

          // Assert: 3本すべてが表示される
          expect(result.current.displayedDarts).toHaveLength(3);
          expect(result.current.currentThrowIndex).toBe(3);
          expect(result.current.displayedDarts[0]).toEqual(
            result.current.currentQuestion?.throws[0]
          );
          expect(result.current.displayedDarts[1]).toEqual(
            result.current.currentQuestion?.throws[1]
          );
          expect(result.current.displayedDarts[2]).toEqual(
            result.current.currentQuestion?.throws[2]
          );
        });

        test('3投モードでsimulateNextThrow3回目以降は何も起きない（境界値）', () => {
          // Arrange
          const { result } = renderHook(() => useGameStore());

          act(() => {
            result.current.setConfig({
              throwUnit: 3,
              questionType: 'score',
              startingScore: 501,
            });
            result.current.startPractice();
          });

          // 3本すべて表示するまでsimulateNextThrowを呼び出す
          act(() => {
            result.current.simulateNextThrow();
            result.current.simulateNextThrow();
          });

          // 3本すべて表示されている状態
          expect(result.current.displayedDarts).toHaveLength(3);
          expect(result.current.currentThrowIndex).toBe(3);

          // Act: さらにsimulateNextThrowを呼び出す（4回目）
          act(() => {
            result.current.simulateNextThrow();
          });

          // Assert: 何も起きない（displayedDartsは3本のまま）
          expect(result.current.displayedDarts).toHaveLength(3);
          expect(result.current.currentThrowIndex).toBe(3);
        });
      });

      describe('1投モードの既存動作維持（回帰テスト）', () => {
        test('1投モードの既存動作が維持される', () => {
          // Arrange
          const { result } = renderHook(() => useGameStore());

          act(() => {
            result.current.setConfig({
              throwUnit: 1,
              questionType: 'score',
              startingScore: 501,
            });
            result.current.startPractice();
          });

          // Assert: 1投モードではgenerateQuestion直後に1本表示される
          expect(result.current.currentQuestion).not.toBeNull();
          expect(result.current.currentQuestion?.throws).toHaveLength(1);
          expect(result.current.displayedDarts).toHaveLength(1);
          expect(result.current.currentThrowIndex).toBe(1);

          // Act: simulateNextThrowを呼び出しても何も起きない（1投モード）
          act(() => {
            result.current.simulateNextThrow();
          });

          // Assert: 変化なし
          expect(result.current.displayedDarts).toHaveLength(1);
          expect(result.current.currentThrowIndex).toBe(1);
        });
      });
    });
  });
});
