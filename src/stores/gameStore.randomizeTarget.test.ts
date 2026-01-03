import { act } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import type { PracticeConfig } from '../types';
import { useGameStore } from './gameStore';

/**
 * gameStore.ts - シャッフルバッグモード（randomizeTarget）のテスト
 *
 * このテストは基礎練習モード（randomizeTarget === true）の問題数制限修正をテストします。
 *
 * テストパターン: store（Zustand ストア）
 * 配置戦略: colocated（src/stores/gameStore.randomizeTarget.test.ts）
 *
 * Red フェーズ: 実装が未修正のため、すべて失敗します。
 */

describe('gameStore - シャッフルバッグモード（randomizeTarget）', () => {
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
          randomizeTarget: true, // シャッフルバッグモード
          useBasicTargets: true,
        },
        sessionConfig: { mode: 'questions', questionCount: 10 },
        currentQuestion: null,
        currentThrowIndex: 0,
        displayedDarts: [],
        visibleDarts: [true, true, true],
        remainingScore: 0,
        roundStartScore: 0,
        stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
        elapsedTime: 0,
        isTimerRunning: false,
        practiceStartTime: undefined,
        targetBag: undefined,
        targetBagIndex: undefined,
      });
    });

    // ローカルストレージをクリア
    localStorage.clear();
  });

  describe('submitAnswer - 問題数制限', () => {
    describe('基礎練習モード（randomizeTarget: true）', () => {
      test('問題数10問に設定した場合、10問目で終了すること', () => {
        // Arrange
        act(() => {
          useGameStore.setState({
            sessionConfig: { mode: 'questions', questionCount: 10 },
          });
          useGameStore.getState().startPractice();
        });

        // Act: 9問回答（まだ終了しない）
        for (let i = 0; i < 9; i++) {
          act(() => {
            const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
            useGameStore.getState().submitAnswer(correctAnswer);
            if (i < 8) {
              // 最後の問題でなければ次の問題を生成
              useGameStore.getState().nextQuestion();
            }
          });

          // Assert: まだ practicing 状態
          expect(useGameStore.getState().gameState).toBe('practicing');
          expect(useGameStore.getState().stats.total).toBe(i + 1);
        }

        // Act: 10問目を回答（セッション終了）
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
        });

        // Assert: results 状態に遷移
        expect(useGameStore.getState().gameState).toBe('results');
        expect(useGameStore.getState().isTimerRunning).toBe(false);
        expect(useGameStore.getState().stats.total).toBe(10);
      });

      test('問題数20問に設定した場合、20問目で終了すること', () => {
        // Arrange
        act(() => {
          useGameStore.setState({
            sessionConfig: { mode: 'questions', questionCount: 20 },
          });
          useGameStore.getState().startPractice();
        });

        // Act: 19問回答（まだ終了しない）
        for (let i = 0; i < 19; i++) {
          act(() => {
            const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
            useGameStore.getState().submitAnswer(correctAnswer);
            if (i < 18) {
              useGameStore.getState().nextQuestion();
            }
          });

          // Assert: まだ practicing 状態
          expect(useGameStore.getState().gameState).toBe('practicing');
          expect(useGameStore.getState().stats.total).toBe(i + 1);
        }

        // Act: 20問目を回答（セッション終了）
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
        });

        // Assert: results 状態に遷移
        expect(useGameStore.getState().gameState).toBe('results');
        expect(useGameStore.getState().isTimerRunning).toBe(false);
        expect(useGameStore.getState().stats.total).toBe(20);
      });

      test('問題数50問に設定した場合、50問目で終了すること', () => {
        // Arrange
        act(() => {
          useGameStore.setState({
            sessionConfig: { mode: 'questions', questionCount: 50 },
          });
          useGameStore.getState().startPractice();
        });

        // Act: 49問回答（まだ終了しない）
        for (let i = 0; i < 49; i++) {
          act(() => {
            const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
            useGameStore.getState().submitAnswer(correctAnswer);
            if (i < 48) {
              useGameStore.getState().nextQuestion();
            }
          });

          // Assert: まだ practicing 状態（10問目ごとに確認）
          if (i % 10 === 9) {
            expect(useGameStore.getState().gameState).toBe('practicing');
            expect(useGameStore.getState().stats.total).toBe(i + 1);
          }
        }

        // Act: 50問目を回答（セッション終了）
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
        });

        // Assert: results 状態に遷移
        expect(useGameStore.getState().gameState).toBe('results');
        expect(useGameStore.getState().isTimerRunning).toBe(false);
        expect(useGameStore.getState().stats.total).toBe(50);
      });

      test('問題数100問に設定した場合、100問目で終了すること', () => {
        // Arrange
        act(() => {
          useGameStore.setState({
            sessionConfig: { mode: 'questions', questionCount: 100 },
          });
          useGameStore.getState().startPractice();
        });

        // Act: 99問回答（まだ終了しない）
        for (let i = 0; i < 99; i++) {
          act(() => {
            const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
            useGameStore.getState().submitAnswer(correctAnswer);
            if (i < 98) {
              useGameStore.getState().nextQuestion();
            }
          });

          // Assert: まだ practicing 状態（10問目ごとに確認）
          if (i % 10 === 9) {
            expect(useGameStore.getState().gameState).toBe('practicing');
            expect(useGameStore.getState().stats.total).toBe(i + 1);
          }
        }

        // Act: 100問目を回答（セッション終了）
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
        });

        // Assert: results 状態に遷移
        expect(useGameStore.getState().gameState).toBe('results');
        expect(useGameStore.getState().isTimerRunning).toBe(false);
        expect(useGameStore.getState().stats.total).toBe(100);
      });
    });

    describe('従来の練習モード（randomizeTarget: false）', () => {
      test('問題数10問に設定した場合、正しく動作すること', () => {
        // Arrange: randomizeTarget を false に設定
        act(() => {
          useGameStore.setState({
            config: {
              configId: 'preset-player',
              configName: 'プレイヤー練習',
              description: '3投単位で得点を問う',
              icon: '🎯',
              throwUnit: 3,
              questionType: 'score',
              judgmentTiming: 'independent',
              startingScore: 501,
              stdDevMM: 15,
              isPreset: true,
              createdAt: '2025-01-01T00:00:00.000Z',
              lastPlayedAt: undefined,
              randomizeTarget: false, // 従来モード
            },
            sessionConfig: { mode: 'questions', questionCount: 10 },
          });
          useGameStore.getState().startPractice();
        });

        // Act: 9問回答（まだ終了しない）
        for (let i = 0; i < 9; i++) {
          act(() => {
            const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
            useGameStore.getState().submitAnswer(correctAnswer);
            if (i < 8) {
              useGameStore.getState().nextQuestion();
            }
          });

          // Assert: まだ practicing 状態
          expect(useGameStore.getState().gameState).toBe('practicing');
          expect(useGameStore.getState().stats.total).toBe(i + 1);
        }

        // Act: 10問目を回答（セッション終了）
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
        });

        // Assert: results 状態に遷移
        expect(useGameStore.getState().gameState).toBe('results');
        expect(useGameStore.getState().isTimerRunning).toBe(false);
        expect(useGameStore.getState().stats.total).toBe(10);
      });

      test('問題数20問に設定した場合、正しく動作すること', () => {
        // Arrange: randomizeTarget を false に設定
        act(() => {
          useGameStore.setState({
            config: {
              configId: 'preset-player',
              configName: 'プレイヤー練習',
              description: '3投単位で得点を問う',
              icon: '🎯',
              throwUnit: 3,
              questionType: 'score',
              judgmentTiming: 'independent',
              startingScore: 501,
              stdDevMM: 15,
              isPreset: true,
              createdAt: '2025-01-01T00:00:00.000Z',
              lastPlayedAt: undefined,
              randomizeTarget: false, // 従来モード
            },
            sessionConfig: { mode: 'questions', questionCount: 20 },
          });
          useGameStore.getState().startPractice();
        });

        // Act: 19問回答（まだ終了しない）
        for (let i = 0; i < 19; i++) {
          act(() => {
            const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
            useGameStore.getState().submitAnswer(correctAnswer);
            if (i < 18) {
              useGameStore.getState().nextQuestion();
            }
          });

          // Assert: まだ practicing 状態
          expect(useGameStore.getState().gameState).toBe('practicing');
          expect(useGameStore.getState().stats.total).toBe(i + 1);
        }

        // Act: 20問目を回答（セッション終了）
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
        });

        // Assert: results 状態に遷移
        expect(useGameStore.getState().gameState).toBe('results');
        expect(useGameStore.getState().isTimerRunning).toBe(false);
        expect(useGameStore.getState().stats.total).toBe(20);
      });
    });

    describe('エッジケース', () => {
      test('randomizeTarget が undefined の場合、従来モードとして動作すること', () => {
        // Arrange: randomizeTarget を undefined に設定
        act(() => {
          const configWithoutRandomize: PracticeConfig = {
            configId: 'custom',
            configName: 'カスタム',
            description: 'カスタム設定',
            icon: '⚙️',
            throwUnit: 1,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            stdDevMM: 15,
            isPreset: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            lastPlayedAt: undefined,
            // randomizeTarget: undefined（省略）
          };

          useGameStore.setState({
            config: configWithoutRandomize,
            sessionConfig: { mode: 'questions', questionCount: 10 },
          });
          useGameStore.getState().startPractice();
        });

        // Act: 9問回答
        for (let i = 0; i < 9; i++) {
          act(() => {
            const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
            useGameStore.getState().submitAnswer(correctAnswer);
            if (i < 8) {
              useGameStore.getState().nextQuestion();
            }
          });
        }

        // Act: 10問目を回答
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
        });

        // Assert: results 状態に遷移（従来モードとして問題数制限が適用される）
        expect(useGameStore.getState().gameState).toBe('results');
        expect(useGameStore.getState().stats.total).toBe(10);
      });
    });

    describe('時間制限モードとの併用', () => {
      test('基礎練習モードで時間制限モードの場合、問題数制限は無効化されること', () => {
        // Arrange: 時間制限モードに設定
        act(() => {
          useGameStore.setState({
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
              randomizeTarget: true,
              useBasicTargets: true,
            },
            sessionConfig: { mode: 'time', timeLimit: 3 }, // 3分間
          });
          useGameStore.getState().startPractice();
        });

        // Act: 15問回答（時間制限モードなので問題数に制限なし）
        for (let i = 0; i < 15; i++) {
          act(() => {
            const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
            useGameStore.getState().submitAnswer(correctAnswer);
            if (i < 14) {
              useGameStore.getState().nextQuestion();
            }
          });

          // Assert: まだ practicing 状態（時間制限に達するまで継続）
          expect(useGameStore.getState().gameState).toBe('practicing');
          expect(useGameStore.getState().stats.total).toBe(i + 1);
        }

        // Assert: 15問回答してもまだ practicing 状態
        expect(useGameStore.getState().gameState).toBe('practicing');
        expect(useGameStore.getState().stats.total).toBe(15);
      });
    });
  });

  describe('targetBagIndex のインクリメント', () => {
    test('基礎練習モードで回答後、targetBagIndex がインクリメントされること', () => {
      // Arrange
      act(() => {
        useGameStore.getState().startPractice();
      });

      const initialIndex = useGameStore.getState().targetBagIndex;
      expect(initialIndex).toBe(0);

      // Act: 回答を送信
      act(() => {
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        useGameStore.getState().submitAnswer(correctAnswer);
      });

      // Assert: インデックスがインクリメントされる
      const newIndex = useGameStore.getState().targetBagIndex;
      expect(newIndex).toBe(1);
    });

    test('従来モードでは targetBagIndex が undefined のまま', () => {
      // Arrange: 従来モード
      act(() => {
        useGameStore.setState({
          config: {
            configId: 'preset-player',
            configName: 'プレイヤー練習',
            description: '3投単位で得点を問う',
            icon: '🎯',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: 501,
            stdDevMM: 15,
            isPreset: true,
            createdAt: '2025-01-01T00:00:00.000Z',
            lastPlayedAt: undefined,
            randomizeTarget: false,
          },
          sessionConfig: { mode: 'questions', questionCount: 10 },
        });
        useGameStore.getState().startPractice();
      });

      expect(useGameStore.getState().targetBagIndex).toBeUndefined();

      // Act: 回答を送信
      act(() => {
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        useGameStore.getState().submitAnswer(correctAnswer);
      });

      // Assert: インデックスは undefined のまま
      expect(useGameStore.getState().targetBagIndex).toBeUndefined();
    });
  });

  describe('状態遷移の一貫性', () => {
    test('基礎練習モードで最終問題回答後、isTimerRunning が false になること', () => {
      // Arrange
      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: 10 },
        });
        useGameStore.getState().startPractice();
      });

      expect(useGameStore.getState().isTimerRunning).toBe(true);

      // Act: 10問回答
      for (let i = 0; i < 9; i++) {
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          useGameStore.getState().submitAnswer(correctAnswer);
          useGameStore.getState().nextQuestion();
        });
      }

      // 最終問題を回答
      act(() => {
        const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
        useGameStore.getState().submitAnswer(correctAnswer);
      });

      // Assert
      expect(useGameStore.getState().gameState).toBe('results');
      expect(useGameStore.getState().isTimerRunning).toBe(false);
    });

    test('基礎練習モードで正答率が正しく計算されること', () => {
      // Arrange
      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: 10 },
        });
        useGameStore.getState().startPractice();
      });

      // Act: 正解7問、不正解3問
      for (let i = 0; i < 10; i++) {
        act(() => {
          const correctAnswer = useGameStore.getState().getCurrentCorrectAnswer();
          const answer = i < 7 ? correctAnswer : 0; // 最初の7問は正解、残り3問は不正解
          useGameStore.getState().submitAnswer(answer);

          if (i < 9) {
            useGameStore.getState().nextQuestion();
          }
        });
      }

      // Assert: 正答率70%
      const accuracy = useGameStore.getState().getAccuracy();
      expect(accuracy).toBeCloseTo(0.7, 2);
      expect(useGameStore.getState().stats.correct).toBe(7);
      expect(useGameStore.getState().stats.total).toBe(10);
    });
  });
});
