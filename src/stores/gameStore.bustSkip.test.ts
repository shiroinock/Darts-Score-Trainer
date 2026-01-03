import { act } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import type { PracticeConfig } from '../types';
import { useGameStore } from './gameStore';

/**
 * gameStore.ts の submitAnswer におけるバスト判定スキップのテスト（TDD Red フェーズ）
 *
 * このテストは実装前に作成されているため、すべて失敗（RED状態）します。
 * 実装後にテストが成功（GREEN状態）に変わることを期待します。
 *
 * テストパターン: store（Zustand ストア）
 * 配置戦略: colocated（src/stores/gameStore.bustSkip.test.ts）
 *
 * タスク: 基礎練習の残り点数管理無効化
 * - `submitAnswer` メソッドで `randomizeTarget === true` の場合、`checkAndUpdateBust` をスキップ
 * - バスト判定を完全に無効化
 */

describe('gameStore - submitAnswer バスト判定スキップ', () => {
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
          randomizeTarget: false, // デフォルトはfalse
          isPreset: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          lastPlayedAt: undefined,
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
  });

  describe('randomizeTarget === false（従来モード）', () => {
    describe('バスト判定が有効', () => {
      test('オーバーでバストした場合、残り点数がラウンド開始時に戻る', () => {
        // Arrange: remainingモードでバスト状況を作成
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            randomizeTarget: false,
          };
          useGameStore.setState({
            config,
            remainingScore: 50,
            roundStartScore: 50,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60, // 50点残りで60点取得 → オーバー
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 50, // バスト時は残り点数がそのまま正解
              questionText: '残り点数は？',
              startingScore: 50,
              bustInfo: { isBust: true, reason: 'over' },
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(50);
        });

        // Assert: 残り点数がラウンド開始時（50点）に戻っている
        expect(useGameStore.getState().remainingScore).toBe(50);
      });

      test('1点残しでバストした場合、残り点数がラウンド開始時に戻る', () => {
        // Arrange: 1点残しのバスト状況を作成
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            randomizeTarget: false,
          };
          useGameStore.setState({
            config,
            remainingScore: 41,
            roundStartScore: 41,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'DOUBLE', number: 20, label: 'D20' },
                  landingPoint: { x: 0, y: -166 },
                  score: 40, // 41点残りで40点取得 → 1点残し
                  ring: 'DOUBLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 41, // バスト時は残り点数がそのまま正解
              questionText: '残り点数は？',
              startingScore: 41,
              bustInfo: { isBust: true, reason: 'finish_impossible' },
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(41);
        });

        // Assert: 残り点数がラウンド開始時（41点）に戻っている
        expect(useGameStore.getState().remainingScore).toBe(41);
      });

      test('ダブルアウトでない場合、残り点数がラウンド開始時に戻る', () => {
        // Arrange: ダブルでないフィニッシュ → バスト
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            randomizeTarget: false,
          };
          useGameStore.setState({
            config,
            remainingScore: 20,
            roundStartScore: 20,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: -180 },
                  score: 20, // 20点残りで20点取得（シングル） → ダブルアウトでない
                  ring: 'OUTER_SINGLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 20, // バスト時は残り点数がそのまま正解
              questionText: '残り点数は？',
              startingScore: 20,
              bustInfo: { isBust: true, reason: 'double_out_required' },
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(20);
        });

        // Assert: 残り点数がラウンド開始時（20点）に戻っている
        expect(useGameStore.getState().remainingScore).toBe(20);
      });

      test('バストでない場合、残り点数が正しく減算される', () => {
        // Arrange: 通常の投擲
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            randomizeTarget: false,
          };
          useGameStore.setState({
            config,
            remainingScore: 100,
            roundStartScore: 100,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60,
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 40, // 100 - 60 = 40
              questionText: '残り点数は？',
              startingScore: 100,
              bustInfo: undefined, // バストなし
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(40);
        });

        // Assert: 残り点数が正しく減算されている（100 - 60 = 40）
        expect(useGameStore.getState().remainingScore).toBe(40);
      });
    });

    describe('scoreモードでもバスト判定が行われる', () => {
      test('scoreモードでオーバーした場合、残り点数がラウンド開始時に戻る', () => {
        // Arrange: scoreモードでバスト状況を作成
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'score',
            randomizeTarget: false,
          };
          useGameStore.setState({
            config,
            remainingScore: 30,
            roundStartScore: 30,
            currentQuestion: {
              mode: 'score',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60, // 30点残りで60点取得 → オーバー
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 60,
              questionText: 'この投擲の得点は？',
              startingScore: undefined,
              bustInfo: undefined, // scoreモードではbustInfoは設定されない
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(60);
        });

        // Assert: scoreモードでもバスト判定が行われ、残り点数がラウンド開始時（30点）に戻る
        expect(useGameStore.getState().remainingScore).toBe(30);
      });

      test('scoreモードで1点残しの場合、残り点数がラウンド開始時に戻る', () => {
        // Arrange: scoreモードで1点残し
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'score',
            randomizeTarget: false,
          };
          useGameStore.setState({
            config,
            remainingScore: 61,
            roundStartScore: 61,
            currentQuestion: {
              mode: 'score',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60, // 61点残りで60点取得 → 1点残し
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 60,
              questionText: 'この投擲の得点は？',
              startingScore: undefined,
              bustInfo: undefined,
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(60);
        });

        // Assert: scoreモードでもバスト判定が行われ、残り点数がラウンド開始時（61点）に戻る
        expect(useGameStore.getState().remainingScore).toBe(61);
      });
    });
  });

  describe('randomizeTarget === true（基礎練習モード）', () => {
    describe('バスト判定が無効化される', () => {
      test('オーバーでも残り点数が減算される', () => {
        // Arrange: randomizeTarget: trueでバスト状況を作成
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'score',
            randomizeTarget: true, // 基礎練習モード
          };
          useGameStore.setState({
            config,
            remainingScore: 50,
            roundStartScore: 50,
            currentQuestion: {
              mode: 'score',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60, // 50点残りで60点取得 → 通常はオーバー
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 60,
              questionText: 'この投擲の得点は？',
              startingScore: undefined,
              bustInfo: undefined,
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(60);
        });

        // Assert: バスト判定がスキップされ、残り点数が減算される（50 - 60 = -10）
        expect(useGameStore.getState().remainingScore).toBe(-10);
      });

      test('1点残しでも残り点数が減算される', () => {
        // Arrange: randomizeTarget: trueで1点残し状況を作成
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'score',
            randomizeTarget: true,
          };
          useGameStore.setState({
            config,
            remainingScore: 41,
            roundStartScore: 41,
            currentQuestion: {
              mode: 'score',
              throws: [
                {
                  target: { type: 'DOUBLE', number: 20, label: 'D20' },
                  landingPoint: { x: 0, y: -166 },
                  score: 40, // 41点残りで40点取得 → 通常は1点残しバスト
                  ring: 'DOUBLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 40,
              questionText: 'この投擲の得点は？',
              startingScore: undefined,
              bustInfo: undefined,
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(40);
        });

        // Assert: バスト判定がスキップされ、残り点数が減算される（41 - 40 = 1）
        expect(useGameStore.getState().remainingScore).toBe(1);
      });

      test('ダブルでないフィニッシュでも残り点数が0になる', () => {
        // Arrange: randomizeTarget: trueでシングルフィニッシュ
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'score',
            randomizeTarget: true,
          };
          useGameStore.setState({
            config,
            remainingScore: 20,
            roundStartScore: 20,
            currentQuestion: {
              mode: 'score',
              throws: [
                {
                  target: { type: 'SINGLE', number: 20, label: '20' },
                  landingPoint: { x: 0, y: -180 },
                  score: 20, // 20点残りで20点取得（シングル） → 通常はダブルアウトでないバスト
                  ring: 'OUTER_SINGLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 20,
              questionText: 'この投擲の得点は？',
              startingScore: undefined,
              bustInfo: undefined,
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(20);
        });

        // Assert: バスト判定がスキップされ、残り点数が0になる（20 - 20 = 0）
        expect(useGameStore.getState().remainingScore).toBe(0);
      });

      test('複数回オーバーしても継続して減算される', () => {
        // Arrange: randomizeTarget: trueで複数回バスト
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'score',
            randomizeTarget: true,
          };
          useGameStore.setState({
            config,
            remainingScore: 100,
            roundStartScore: 100,
          });
        });

        // 1回目: 60点取得（残り40点）
        act(() => {
          useGameStore.setState({
            currentQuestion: {
              mode: 'score',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60,
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 60,
              questionText: 'この投擲の得点は？',
              startingScore: undefined,
              bustInfo: undefined,
            },
          });
          useGameStore.getState().submitAnswer(60);
        });

        expect(useGameStore.getState().remainingScore).toBe(40);

        // nextQuestionでroundStartScoreを更新
        act(() => {
          useGameStore.setState({
            roundStartScore: 40,
          });
        });

        // 2回目: 60点取得（残り-20点、バスト判定がスキップされる）
        act(() => {
          useGameStore.setState({
            currentQuestion: {
              mode: 'score',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60,
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 60,
              questionText: 'この投擲の得点は？',
              startingScore: undefined,
              bustInfo: undefined,
            },
          });
          useGameStore.getState().submitAnswer(60);
        });

        // Assert: バスト判定がスキップされ、マイナスになる（40 - 60 = -20）
        expect(useGameStore.getState().remainingScore).toBe(-20);
      });

      test('負の残り点数からさらに減算される', () => {
        // Arrange: 既にマイナスの状態からさらに減算
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'score',
            randomizeTarget: true,
          };
          useGameStore.setState({
            config,
            remainingScore: -20,
            roundStartScore: -20,
            currentQuestion: {
              mode: 'score',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60,
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 60,
              questionText: 'この投擲の得点は？',
              startingScore: undefined,
              bustInfo: undefined,
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(60);
        });

        // Assert: さらに減算される（-20 - 60 = -80）
        expect(useGameStore.getState().remainingScore).toBe(-80);
      });
    });

    describe('remainingモードでもバスト判定が無効化される', () => {
      test('remainingモードでオーバーしても残り点数が減算される', () => {
        // Arrange: randomizeTarget: true + remainingモード
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            randomizeTarget: true,
          };
          useGameStore.setState({
            config,
            remainingScore: 50,
            roundStartScore: 50,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'TRIPLE', number: 20, label: 'T20' },
                  landingPoint: { x: 0, y: -103 },
                  score: 60, // 50点残りで60点取得 → 通常はオーバー
                  ring: 'TRIPLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: -10, // バスト判定がスキップされるため、50 - 60 = -10
              questionText: '残り点数は？',
              startingScore: 50,
              bustInfo: undefined, // randomizeTarget: trueではbustInfoは使用されない
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(-10);
        });

        // Assert: バスト判定がスキップされ、残り点数が減算される（50 - 60 = -10）
        expect(useGameStore.getState().remainingScore).toBe(-10);
      });

      test('remainingモードで1点残しでも残り点数が1になる', () => {
        // Arrange: randomizeTarget: true + remainingモード + 1点残し
        act(() => {
          const config: PracticeConfig = {
            ...useGameStore.getState().config,
            questionType: 'remaining',
            randomizeTarget: true,
          };
          useGameStore.setState({
            config,
            remainingScore: 41,
            roundStartScore: 41,
            currentQuestion: {
              mode: 'remaining',
              throws: [
                {
                  target: { type: 'DOUBLE', number: 20, label: 'D20' },
                  landingPoint: { x: 0, y: -166 },
                  score: 40,
                  ring: 'DOUBLE',
                  segmentNumber: 20,
                },
              ],
              correctAnswer: 1, // バスト判定がスキップされるため、41 - 40 = 1
              questionText: '残り点数は？',
              startingScore: 41,
              bustInfo: undefined,
            },
          });
        });

        // Act: 正解を送信
        act(() => {
          useGameStore.getState().submitAnswer(1);
        });

        // Assert: バスト判定がスキップされ、残り点数が1になる（41 - 40 = 1）
        expect(useGameStore.getState().remainingScore).toBe(1);
      });
    });
  });

  describe('エッジケース', () => {
    test('currentQuestionがnullの場合、バスト判定をスキップして残り点数は変化しない', () => {
      // Arrange: currentQuestionがnull
      act(() => {
        const config: PracticeConfig = {
          ...useGameStore.getState().config,
          randomizeTarget: false,
        };
        useGameStore.setState({
          config,
          remainingScore: 100,
          roundStartScore: 100,
          currentQuestion: null,
        });
      });

      // Act: 回答を送信（getCurrentCorrectAnswerは0を返す）
      act(() => {
        useGameStore.getState().submitAnswer(0);
      });

      // Assert: 残り点数は変化しない
      expect(useGameStore.getState().remainingScore).toBe(100);
    });

    test('randomizeTargetがundefinedの場合、falseとして扱われる', () => {
      // Arrange: randomizeTargetがundefined（デフォルト）
      act(() => {
        const config: PracticeConfig = {
          ...useGameStore.getState().config,
          questionType: 'remaining',
          randomizeTarget: undefined, // 明示的にundefined
        };
        useGameStore.setState({
          config,
          remainingScore: 50,
          roundStartScore: 50,
          currentQuestion: {
            mode: 'remaining',
            throws: [
              {
                target: { type: 'TRIPLE', number: 20, label: 'T20' },
                landingPoint: { x: 0, y: -103 },
                score: 60,
                ring: 'TRIPLE',
                segmentNumber: 20,
              },
            ],
            correctAnswer: 50,
            questionText: '残り点数は？',
            startingScore: 50,
            bustInfo: { isBust: true, reason: 'over' },
          },
        });
      });

      // Act: 正解を送信
      act(() => {
        useGameStore.getState().submitAnswer(50);
      });

      // Assert: バスト判定が有効で、残り点数がラウンド開始時に戻る
      expect(useGameStore.getState().remainingScore).toBe(50);
    });
  });

  describe('統計情報の更新（バスト判定との連携）', () => {
    test('randomizeTarget: falseでバスト時、正解でもストリークがリセットされる', () => {
      // Arrange: ストリークが継続中でバスト発生
      act(() => {
        const config: PracticeConfig = {
          ...useGameStore.getState().config,
          questionType: 'remaining',
          randomizeTarget: false,
        };
        useGameStore.setState({
          config,
          remainingScore: 50,
          roundStartScore: 50,
          stats: { correct: 5, total: 5, currentStreak: 5, bestStreak: 5 },
          currentQuestion: {
            mode: 'remaining',
            throws: [
              {
                target: { type: 'TRIPLE', number: 20, label: 'T20' },
                landingPoint: { x: 0, y: -103 },
                score: 60,
                ring: 'TRIPLE',
                segmentNumber: 20,
              },
            ],
            correctAnswer: 50, // バスト時の正解は元の残り点数
            questionText: '残り点数は？',
            startingScore: 50,
            bustInfo: { isBust: true, reason: 'over' },
          },
        });
      });

      // Act: 正解を送信
      act(() => {
        useGameStore.getState().submitAnswer(50);
      });

      const stats = useGameStore.getState().stats;

      // Assert: 正解数は増えるが、ストリークはリセットされる
      expect(stats.correct).toBe(6);
      expect(stats.total).toBe(6);
      expect(stats.currentStreak).toBe(0); // バストによりリセット
      expect(stats.bestStreak).toBe(5); // 最高記録は保持
    });

    test('randomizeTarget: trueでバスト相当の状況でも、通常の正解としてストリークが継続する', () => {
      // Arrange: randomizeTarget: trueでストリーク継続中、バスト相当の状況
      act(() => {
        const config: PracticeConfig = {
          ...useGameStore.getState().config,
          questionType: 'score',
          randomizeTarget: true,
        };
        useGameStore.setState({
          config,
          remainingScore: 50,
          roundStartScore: 50,
          stats: { correct: 5, total: 5, currentStreak: 5, bestStreak: 5 },
          currentQuestion: {
            mode: 'score',
            throws: [
              {
                target: { type: 'TRIPLE', number: 20, label: 'T20' },
                landingPoint: { x: 0, y: -103 },
                score: 60,
                ring: 'TRIPLE',
                segmentNumber: 20,
              },
            ],
            correctAnswer: 60,
            questionText: 'この投擲の得点は？',
            startingScore: undefined,
            bustInfo: undefined, // バスト判定がスキップされるためbustInfoは生成されない
          },
        });
      });

      // Act: 正解を送信
      act(() => {
        useGameStore.getState().submitAnswer(60);
      });

      const stats = useGameStore.getState().stats;

      // Assert: バスト判定がスキップされるため、通常の正解としてストリークが継続
      expect(stats.correct).toBe(6);
      expect(stats.total).toBe(6);
      expect(stats.currentStreak).toBe(6); // ストリーク継続
      expect(stats.bestStreak).toBe(6); // 最高記録更新
    });
  });
});
