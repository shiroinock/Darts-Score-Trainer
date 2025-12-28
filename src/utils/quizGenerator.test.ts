import { describe, expect, test } from 'vitest';
import type { PracticeConfig } from '../types/PracticeConfig';
import type { ThrowResult } from '../types/ThrowResult';
import { calculateCorrectAnswer, generateQuestion, generateQuestionText } from './quizGenerator';

describe('quizGenerator', () => {
  describe('generateQuestion', () => {
    describe('正常系', () => {
      test('1投モード・得点問題を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-1',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const remainingScore = null;

        // Act
        const result = generateQuestion(config, remainingScore);

        // Assert
        expect(result).toHaveProperty('mode');
        expect(result).toHaveProperty('throws');
        expect(result).toHaveProperty('correctAnswer');
        expect(result).toHaveProperty('questionText');
        expect(result.mode).toBe('score');
        expect(result.throws).toHaveLength(1);
        expect(typeof result.correctAnswer).toBe('number');
        expect(typeof result.questionText).toBe('string');
      });

      test('1投モード・残り点数問題を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-2',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const remainingScore = 501;

        // Act
        const result = generateQuestion(config, remainingScore);

        // Assert
        expect(result.mode).toBe('remaining');
        expect(result.throws).toHaveLength(1);
        expect(result.startingScore).toBe(501);
        expect(typeof result.correctAnswer).toBe('number');
      });

      test('3投モード（独立）・得点問題を3問生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-3',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const remainingScore = null;

        // Act
        const result = generateQuestion(config, remainingScore);

        // Assert
        expect(result.mode).toBe('score');
        expect(result.throws).toHaveLength(3);
        expect(typeof result.correctAnswer).toBe('number');
      });

      test('3投モード（累積）・得点問題を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-4',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const remainingScore = null;

        // Act
        const result = generateQuestion(config, remainingScore);

        // Assert
        expect(result.mode).toBe('score');
        expect(result.throws).toHaveLength(3);
        expect(typeof result.correctAnswer).toBe('number');
      });

      test('3投モード（累積）・残り点数問題を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-5',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'remaining',
          judgmentTiming: 'cumulative',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const remainingScore = 501;

        // Act
        const result = generateQuestion(config, remainingScore);

        // Assert
        expect(result.mode).toBe('remaining');
        expect(result.throws).toHaveLength(3);
        expect(result.startingScore).toBe(501);
        expect(typeof result.correctAnswer).toBe('number');
      });

      test('questionType: "both"で両方の問題を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-6',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'both',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const remainingScore = 501;

        // Act
        const result = generateQuestion(config, remainingScore);

        // Assert
        expect(result.mode).toBe('both');
        expect(result.throws).toHaveLength(1);
        expect(typeof result.correctAnswer).toBe('number');
      });
    });

    describe('投擲シミュレーション', () => {
      test('生成された投擲結果がThrowResult型の構造を持つ', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-7',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert
        const throwResult = result.throws[0];
        expect(throwResult).toHaveProperty('target');
        expect(throwResult).toHaveProperty('landingPoint');
        expect(throwResult).toHaveProperty('score');
        expect(throwResult).toHaveProperty('ring');
        expect(throwResult).toHaveProperty('segmentNumber');
      });

      test('3投モードで3つの独立した投擲結果を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-8',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 30,
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert
        expect(result.throws).toHaveLength(3);
        // 各投擲が有効な構造を持つことを確認（乱数性はsimulateThrowでテスト済み）
        for (const throwResult of result.throws) {
          expect(Number.isFinite(throwResult.landingPoint.x)).toBe(true);
          expect(Number.isFinite(throwResult.landingPoint.y)).toBe(true);
          expect(throwResult.score).toBeGreaterThanOrEqual(0);
          expect(throwResult.score).toBeLessThanOrEqual(60);
        }
      });

      test('targetの設定が投擲に反映される', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-9',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'BULL', number: null },
          stdDevMM: 0, // 完全な精度
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert
        expect(result.throws[0].target.type).toBe('BULL');
        expect(result.throws[0].target.number).toBeNull();
        // stdDev=0なので中心に着弾
        expect(result.throws[0].landingPoint.x).toBe(0);
        expect(result.throws[0].landingPoint.y).toBe(0);
        expect(result.throws[0].score).toBe(50); // INNER_BULL
      });
    });

    describe('Question型の構造検証', () => {
      test('Questionオブジェクトが正しいプロパティを持つ', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-10',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert
        expect(result).toHaveProperty('mode');
        expect(result).toHaveProperty('throws');
        expect(result).toHaveProperty('correctAnswer');
        expect(result).toHaveProperty('questionText');
      });

      test('remainingモードではstartingScoreが含まれる', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-11',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, 501);

        // Assert
        expect(result.startingScore).toBe(501);
      });

      test('scoreモードではstartingScoreが含まれない（undefined）', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-12',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert
        expect(result.startingScore).toBeUndefined();
      });
    });

    describe('エッジケース', () => {
      test('stdDevMM=0で完全に正確な投擲を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-13',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 0,
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert
        // T20の物理座標: (0, -103)
        expect(result.throws[0].landingPoint.x).toBe(0);
        expect(result.throws[0].landingPoint.y).toBe(-103);
        expect(result.throws[0].score).toBe(60);
      });

      test('非常に大きなstdDevMM（150mm）で問題を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-14',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'BULL', number: null },
          stdDevMM: 150,
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert
        expect(result.throws[0].score).toBeGreaterThanOrEqual(0);
        expect(result.throws[0].score).toBeLessThanOrEqual(60);
      });

      test('remainingScore=0で問題を生成する', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-15',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const remainingScore = 0;

        // Act
        const result = generateQuestion(config, remainingScore);

        // Assert
        expect(result.startingScore).toBe(501);
        expect(typeof result.correctAnswer).toBe('number');
      });

      test('target=undefinedの場合、デフォルトターゲット(T20)が使用される', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-16',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: undefined, // ターゲット未指定
          stdDevMM: 0, // 正確な着地でT20を確認
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert - デフォルトT20の物理座標: (0, -103)
        expect(result.throws[0].landingPoint.x).toBe(0);
        expect(result.throws[0].landingPoint.y).toBe(-103);
        expect(result.throws[0].score).toBe(60);
        expect(result.throws[0].target).toEqual({
          type: 'TRIPLE',
          number: 20,
          label: 'T20',
        });
      });

      test('targetが未定義でもクラッシュせず問題を生成できる', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-17',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: null,
          target: undefined, // ターゲット未指定
          stdDevMM: 15,
          isPreset: false,
        };

        // Act
        const result = generateQuestion(config, null);

        // Assert - クラッシュせず正常に問題が生成される
        expect(result).toHaveProperty('mode');
        expect(result).toHaveProperty('throws');
        expect(result).toHaveProperty('correctAnswer');
        expect(result.throws).toHaveLength(3);
        expect(result.throws[0].target).toEqual({
          type: 'TRIPLE',
          number: 20,
          label: 'T20',
        });
      });
    });

    describe('異常系', () => {
      test('throwUnit=0（無効な値）でエラーをスローする', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-16',
          configName: 'テスト設定',
          throwUnit: 0 as 1 | 3, // 型アサーションで無効な値を設定
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };

        // Act & Assert
        expect(() => generateQuestion(config, null)).toThrow();
      });

      test('負のstdDevMMでエラーをスローする', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-17',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: -10,
          isPreset: false,
        };

        // Act & Assert
        expect(() => generateQuestion(config, null)).toThrow();
      });

      test('NaNのstdDevMMでエラーをスローする', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-18',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: NaN,
          isPreset: false,
        };

        // Act & Assert
        expect(() => generateQuestion(config, null)).toThrow();
      });

      test('questionType="remaining"だがstartingScoreがnullでエラーをスローする', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-19',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };

        // Act & Assert
        expect(() => generateQuestion(config, null)).toThrow();
      });
    });
  });

  describe('generateQuestionText', () => {
    describe('正常系', () => {
      describe('1投モード', () => {
        test('得点問題で"この投擲の得点は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-20',
            configName: 'テスト設定',
            throwUnit: 1,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const isCumulative = false;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('この投擲の得点は？');
        });

        test('残り点数問題で"この投擲後の残り点数は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-21',
            configName: 'テスト設定',
            throwUnit: 1,
            questionType: 'remaining',
            judgmentTiming: 'independent',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const isCumulative = false;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('この投擲後の残り点数は？');
        });
      });

      describe('3投モード（独立判定）', () => {
        test('得点問題・1本目で"1本目の得点は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-22',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const isCumulative = false;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('1本目の得点は？');
        });

        test('得点問題・2本目で"2本目の得点は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-23',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 1;
          const isCumulative = false;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('2本目の得点は？');
        });

        test('得点問題・3本目で"3本目の得点は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-24',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 2;
          const isCumulative = false;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('3本目の得点は？');
        });

        test('残り点数問題・1本目で"1本目投擲後の残り点数は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-25',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'remaining',
            judgmentTiming: 'independent',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const isCumulative = false;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('1本目投擲後の残り点数は？');
        });
      });

      describe('3投モード（累積判定）', () => {
        test('得点問題・1本目で"1本目までの合計得点は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-26',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'cumulative',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const isCumulative = true;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('1本目までの合計得点は？');
        });

        test('得点問題・2本目で"2本目までの合計得点は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-27',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'cumulative',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 1;
          const isCumulative = true;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('2本目までの合計得点は？');
        });

        test('得点問題・3本目で"3本目までの合計得点は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-28',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'cumulative',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 2;
          const isCumulative = true;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('3本目までの合計得点は？');
        });

        test('残り点数問題・1本目で"1本目投擲後の残り点数は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-29',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'remaining',
            judgmentTiming: 'cumulative',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const isCumulative = true;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('1本目投擲後の残り点数は？');
        });

        test('残り点数問題・2本目で"2本目投擲後の残り点数は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-30',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'remaining',
            judgmentTiming: 'cumulative',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 1;
          const isCumulative = true;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('2本目投擲後の残り点数は？');
        });
      });

      describe('bothモード', () => {
        test('1投モードで"この投擲の得点と残り点数は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-31',
            configName: 'テスト設定',
            throwUnit: 1,
            questionType: 'both',
            judgmentTiming: 'independent',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const isCumulative = false;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('この投擲の得点と残り点数は？');
        });

        test('3投モード（独立）・1本目で"1本目の得点と残り点数は？"を返す', () => {
          // Arrange
          const config: PracticeConfig = {
            configId: 'test-32',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'both',
            judgmentTiming: 'independent',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const isCumulative = false;

          // Act
          const result = generateQuestionText(config, throwIndex, isCumulative);

          // Assert
          expect(result).toBe('1本目の得点と残り点数は？');
        });
      });
    });

    describe('エッジケース', () => {
      test('throwIndex=0（最初の投擲）', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-33',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 0;
        const isCumulative = false;

        // Act
        const result = generateQuestionText(config, throwIndex, isCumulative);

        // Assert
        expect(result).toBe('1本目の得点は？');
      });

      test('throwIndex=2（最後の投擲）', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-34',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 2;
        const isCumulative = false;

        // Act
        const result = generateQuestionText(config, throwIndex, isCumulative);

        // Assert
        expect(result).toBe('3本目の得点は？');
      });
    });

    describe('異常系', () => {
      test('負のthrowIndexでエラーをスローする', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-35',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = -1;
        const isCumulative = false;

        // Act & Assert
        expect(() => generateQuestionText(config, throwIndex, isCumulative)).toThrow();
      });

      test('throwUnit=3でthrowIndex=3（範囲外）でエラーをスローする', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-36',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 3;
        const isCumulative = false;

        // Act & Assert
        expect(() => generateQuestionText(config, throwIndex, isCumulative)).toThrow();
      });

      test('throwUnit=1でthrowIndex=1（範囲外）でエラーをスローする', () => {
        // Arrange
        const config: PracticeConfig = {
          configId: 'test-37',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 1;
        const isCumulative = false;

        // Act & Assert
        expect(() => generateQuestionText(config, throwIndex, isCumulative)).toThrow();
      });
    });
  });

  describe('calculateCorrectAnswer', () => {
    describe('正常系', () => {
      describe('得点モード（独立判定）', () => {
        test('1本の投擲で得点を計算する', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-38',
            configName: 'テスト設定',
            throwUnit: 1,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const previousRemaining = null;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          expect(result).toBe(60);
        });

        test('3投モードで各投擲の得点を個別に計算する', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 5, y: -103 },
              score: 57, // T19
              ring: 'TRIPLE',
              segmentNumber: 19,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-39',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'independent',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };

          // Act & Assert
          expect(calculateCorrectAnswer(throws, config, 0, null)).toBe(60);
          expect(calculateCorrectAnswer(throws, config, 1, null)).toBe(57);
          expect(calculateCorrectAnswer(throws, config, 2, null)).toBe(60);
        });
      });

      describe('得点モード（累積判定）', () => {
        test('1本目までの累積得点を計算する', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-40',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'cumulative',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const previousRemaining = null;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          expect(result).toBe(60);
        });

        test('2本目までの累積得点を計算する', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 5, y: -103 },
              score: 57,
              ring: 'TRIPLE',
              segmentNumber: 19,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-41',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'cumulative',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 1;
          const previousRemaining = null;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          expect(result).toBe(117); // 60 + 57
        });

        test('3本目までの累積得点を計算する（180点満点）', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-42',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'score',
            judgmentTiming: 'cumulative',
            startingScore: null,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 2;
          const previousRemaining = null;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          expect(result).toBe(180);
        });
      });

      describe('残り点数モード（独立判定）', () => {
        test('1本投擲後の残り点数を計算する', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-43',
            configName: 'テスト設定',
            throwUnit: 1,
            questionType: 'remaining',
            judgmentTiming: 'independent',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const previousRemaining = 501;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          expect(result).toBe(441); // 501 - 60
        });

        test('3投モード・各投擲後の残り点数を個別に計算する', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-44',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'remaining',
            judgmentTiming: 'independent',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };

          // Act & Assert
          // 1本目: 501 - 60 = 441
          expect(calculateCorrectAnswer(throws, config, 0, 501)).toBe(441);
          // 2本目: 441 - 60 = 381
          expect(calculateCorrectAnswer(throws, config, 1, 441)).toBe(381);
          // 3本目: 381 - 60 = 321
          expect(calculateCorrectAnswer(throws, config, 2, 381)).toBe(321);
        });
      });

      describe('残り点数モード（累積判定）', () => {
        test('1本目投擲後の残り点数を計算する', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-45',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'remaining',
            judgmentTiming: 'cumulative',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const previousRemaining = 501;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          expect(result).toBe(441); // 501 - 60
        });

        test('2本目投擲後の残り点数を計算する', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-46',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'remaining',
            judgmentTiming: 'cumulative',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 1;
          const previousRemaining = 501;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          expect(result).toBe(381); // 501 - 60 - 60
        });

        test('3本目投擲後の残り点数を計算する（180点）', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-47',
            configName: 'テスト設定',
            throwUnit: 3,
            questionType: 'remaining',
            judgmentTiming: 'cumulative',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 2;
          const previousRemaining = 501;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          expect(result).toBe(321); // 501 - 180
        });
      });

      describe('bothモード', () => {
        test('得点と残り点数の両方を返す（独立判定）', () => {
          // Arrange
          const throws: ThrowResult[] = [
            {
              target: { type: 'TRIPLE', number: 20 },
              landingPoint: { x: 0, y: -103 },
              score: 60,
              ring: 'TRIPLE',
              segmentNumber: 20,
            },
          ];
          const config: PracticeConfig = {
            configId: 'test-48',
            configName: 'テスト設定',
            throwUnit: 1,
            questionType: 'both',
            judgmentTiming: 'independent',
            startingScore: 501,
            target: { type: 'TRIPLE', number: 20 },
            stdDevMM: 15,
            isPreset: false,
          };
          const throwIndex = 0;
          const previousRemaining = 501;

          // Act
          const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

          // Assert
          // bothモードでは得点のみを返す、または複合値を返す
          // 実装仕様による（得点のみ、または { score, remaining } のようなオブジェクト）
          // ここでは得点のみを返すと仮定
          expect(typeof result).toBe('number');
        });
      });
    });

    describe('エッジケース', () => {
      test('0点の投擲で残り点数が変わらない', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 300, y: 300 },
            score: 0, // ボード外
            ring: 'OUT',
            segmentNumber: 0,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-49',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 0;
        const previousRemaining = 501;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        expect(result).toBe(501); // 501 - 0 = 501
      });

      test('残り点数が0になる', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'DOUBLE', number: 16 },
            landingPoint: { x: 0, y: 166 },
            score: 32,
            ring: 'DOUBLE',
            segmentNumber: 16,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-50',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'DOUBLE', number: 16 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 0;
        const previousRemaining = 32;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        expect(result).toBe(0); // 32 - 32 = 0
      });

      test('残り点数がマイナスになる（バースト）', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -103 },
            score: 60,
            ring: 'TRIPLE',
            segmentNumber: 20,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-51',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 0;
        const previousRemaining = 50;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        // バースト時の挙動は実装による（-10を返すか、エラーをスローするか）
        // ここでは単純に減算結果を返すと仮定
        expect(result).toBe(-10); // 50 - 60 = -10
      });

      test('累積得点が180点（最大値）', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -103 },
            score: 60,
            ring: 'TRIPLE',
            segmentNumber: 20,
          },
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -103 },
            score: 60,
            ring: 'TRIPLE',
            segmentNumber: 20,
          },
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -103 },
            score: 60,
            ring: 'TRIPLE',
            segmentNumber: 20,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-52',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 0, // 完全な精度
          isPreset: false,
        };
        const throwIndex = 2;
        const previousRemaining = null;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        expect(result).toBe(180);
      });

      test('累積得点が0点（全てボード外）', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 300, y: 300 },
            score: 0,
            ring: 'OUT',
            segmentNumber: 0,
          },
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 300, y: 300 },
            score: 0,
            ring: 'OUT',
            segmentNumber: 0,
          },
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 300, y: 300 },
            score: 0,
            ring: 'OUT',
            segmentNumber: 0,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-53',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 150, // 大きな散らばり
          isPreset: false,
        };
        const throwIndex = 2;
        const previousRemaining = null;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        expect(result).toBe(0);
      });
    });

    describe('異常系', () => {
      test('throwsが空配列でエラーをスローする', () => {
        // Arrange
        const throws: ThrowResult[] = [];
        const config: PracticeConfig = {
          configId: 'test-54',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 0;
        const previousRemaining = null;

        // Act & Assert
        expect(() =>
          calculateCorrectAnswer(throws, config, throwIndex, previousRemaining)
        ).toThrow();
      });

      test('throwIndexが範囲外でエラーをスローする', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -103 },
            score: 60,
            ring: 'TRIPLE',
            segmentNumber: 20,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-55',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 1; // 範囲外（throwsは1つしかない）
        const previousRemaining = null;

        // Act & Assert
        expect(() =>
          calculateCorrectAnswer(throws, config, throwIndex, previousRemaining)
        ).toThrow();
      });

      test('remainingモードでpreviousRemainingがnullでエラーをスローする', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -103 },
            score: 60,
            ring: 'TRIPLE',
            segmentNumber: 20,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-56',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'remaining',
          judgmentTiming: 'independent',
          startingScore: 501,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 0;
        const previousRemaining = null; // 本来は501であるべき

        // Act & Assert
        expect(() =>
          calculateCorrectAnswer(throws, config, throwIndex, previousRemaining)
        ).toThrow();
      });
    });

    describe('ドメイン知識の検証', () => {
      test('有効な得点（60点）が正しく計算される', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20 },
            landingPoint: { x: 0, y: -103 },
            score: 60,
            ring: 'TRIPLE',
            segmentNumber: 20,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-57',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 0;
        const previousRemaining = null;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        expect(result).toBe(60);
      });

      test('有効な得点（25点：OUTER_BULL）が正しく計算される', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'BULL', number: null },
            landingPoint: { x: 5, y: 5 },
            score: 25,
            ring: 'OUTER_BULL',
            segmentNumber: 0,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-58',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'BULL', number: null },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 0;
        const previousRemaining = null;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        expect(result).toBe(25);
      });

      test('有効な得点（50点：INNER_BULL）が正しく計算される', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'BULL', number: null },
            landingPoint: { x: 0, y: 0 },
            score: 50,
            ring: 'INNER_BULL',
            segmentNumber: 0,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-59',
          configName: 'テスト設定',
          throwUnit: 1,
          questionType: 'score',
          judgmentTiming: 'independent',
          startingScore: null,
          target: { type: 'BULL', number: null },
          stdDevMM: 0,
          isPreset: false,
        };
        const throwIndex = 0;
        const previousRemaining = null;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        expect(result).toBe(50);
      });

      test('複数のダーツの得点範囲が0-60の範囲内', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'SINGLE', number: 20 },
            landingPoint: { x: 10, y: -50 },
            score: 20,
            ring: 'INNER_SINGLE',
            segmentNumber: 20,
          },
          {
            target: { type: 'DOUBLE', number: 10 },
            landingPoint: { x: 0, y: 166 },
            score: 20,
            ring: 'DOUBLE',
            segmentNumber: 10,
          },
          {
            target: { type: 'TRIPLE', number: 19 },
            landingPoint: { x: 50, y: -90 },
            score: 57,
            ring: 'TRIPLE',
            segmentNumber: 19,
          },
        ];
        const config: PracticeConfig = {
          configId: 'test-60',
          configName: 'テスト設定',
          throwUnit: 3,
          questionType: 'score',
          judgmentTiming: 'cumulative',
          startingScore: null,
          target: { type: 'TRIPLE', number: 20 },
          stdDevMM: 15,
          isPreset: false,
        };
        const throwIndex = 2;
        const previousRemaining = null;

        // Act
        const result = calculateCorrectAnswer(throws, config, throwIndex, previousRemaining);

        // Assert
        expect(result).toBe(97); // 20 + 20 + 57
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(180); // 3投の最大値
      });
    });
  });
});
