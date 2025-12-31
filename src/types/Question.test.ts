import { describe, expect, test } from 'vitest';
import type { BustInfo } from './BustInfo';
import type { Question } from './Question';
import type { QuestionType } from './QuestionType';
import type { ThrowResult } from './ThrowResult';

/**
 * Question型の型安全性をテストします。
 *
 * bustInfoフィールドが正しく型定義に含まれ、
 * BustInfo型と整合性があることを確認します。
 */
describe('Question型', () => {
  describe('正常系 - 基本的なQuestion型の生成', () => {
    test('scoreモードの問題が作成できる', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
      ];
      const mode: QuestionType = 'score';
      const correctAnswer = 60;
      const questionText = 'この投擲の合計得点は？';

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
      };

      // Assert
      expect(question.mode).toBe('score');
      expect(question.throws).toHaveLength(1);
      expect(question.correctAnswer).toBe(60);
      expect(question.questionText).toBe('この投擲の合計得点は？');
      expect(question.startingScore).toBeUndefined();

      // bustInfoフィールドが型定義に存在することを確認（プロパティとしてアクセス可能）
      // 実装前：Question型にbustInfoフィールドがないため失敗する
      // 実装後：bustInfoフィールドが追加され、undefinedとしてアクセス可能になる
      expect(question.bustInfo).toBeUndefined();
    });

    test('remainingモードの問題が作成できる（startingScore付き）', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 321;
      const questionText = '残り点数は？';
      const startingScore = 501;

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
      };

      // Assert
      expect(question.mode).toBe('remaining');
      expect(question.throws).toHaveLength(3);
      expect(question.correctAnswer).toBe(321);
      expect(question.questionText).toBe('残り点数は？');
      expect(question.startingScore).toBe(501);
      expect(question.bustInfo).toBeUndefined();
    });
  });

  describe('正常系 - bustInfo付きのQuestion型の生成', () => {
    test('バスト情報を含む問題が作成できる', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 1; // バスト後は元の点数に戻る
      const questionText = '残り点数は？';
      const startingScore = 60;
      const bustInfo: BustInfo = {
        isBust: true,
        reason: 'over',
      };

      // Act
      // 実装前：Question型にbustInfoフィールドがないため、TypeScriptコンパイルエラーになる
      // 実装後：bustInfoフィールドが追加され、正常にコンパイル・実行できる
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
        bustInfo, // このプロパティ代入がコンパイルエラーを引き起こす
      };

      // Assert
      expect(question.bustInfo).toBeDefined();
      expect(question.bustInfo?.isBust).toBe(true);
      expect(question.bustInfo?.reason).toBe('over');

      // BustInfo型との整合性を確認
      const extractedBustInfo: BustInfo = question.bustInfo as BustInfo;
      expect(extractedBustInfo.isBust).toBe(true);
      expect(extractedBustInfo.reason).toBe('over');
    });

    test('バスト情報（finish_impossible）を含む問題が作成できる', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 1;
      const questionText = '残り点数は？';
      const startingScore = 60;
      const bustInfo: BustInfo = {
        isBust: true,
        reason: 'finish_impossible',
      };

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
        bustInfo,
      };

      // Assert
      expect(question.bustInfo).toBeDefined();
      expect(question.bustInfo?.isBust).toBe(true);
      expect(question.bustInfo?.reason).toBe('finish_impossible');
    });

    test('バスト情報（double_out_required）を含む問題が作成できる', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 20, label: '20' },
          landingPoint: { x: 0, y: -98 },
          score: 20,
        },
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 32;
      const questionText = '残り点数は？';
      const startingScore = 32;
      const bustInfo: BustInfo = {
        isBust: true,
        reason: 'double_out_required',
      };

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
        bustInfo,
      };

      // Assert
      expect(question.bustInfo).toBeDefined();
      expect(question.bustInfo?.isBust).toBe(true);
      expect(question.bustInfo?.reason).toBe('double_out_required');
    });

    test('バストしていない場合の情報を含む問題が作成できる', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'DOUBLE', number: 20, label: 'D20' },
          landingPoint: { x: 0, y: 170 },
          score: 40,
        },
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 0;
      const questionText = '残り点数は？';
      const startingScore = 40;
      const bustInfo: BustInfo = {
        isBust: false,
        reason: null,
      };

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
        bustInfo,
      };

      // Assert
      expect(question.bustInfo).toBeDefined();
      expect(question.bustInfo?.isBust).toBe(false);
      expect(question.bustInfo?.reason).toBeNull();
    });
  });

  describe('後方互換性 - bustInfo省略時の動作', () => {
    test('bustInfoなしでも問題が作成できる（既存の動作）', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
      ];
      const mode: QuestionType = 'score';
      const correctAnswer = 60;
      const questionText = 'この投擲の合計得点は？';

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
      };

      // Assert
      // bustInfoはundefinedでも型エラーにならない
      expect(question.bustInfo).toBeUndefined();
    });

    test('scoreモードでは通常bustInfoを持たない', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
      ];
      const mode: QuestionType = 'score';
      const correctAnswer = 180;
      const questionText = 'この投擲の合計得点は？';

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
      };

      // Assert
      expect(question.bustInfo).toBeUndefined();
    });

    test('remainingモードでもbustInfoは省略可能', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 441;
      const questionText = '残り点数は？';
      const startingScore = 501;

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
      };

      // Assert
      expect(question.bustInfo).toBeUndefined();
    });
  });

  describe('型の整合性 - BustInfo型との連携', () => {
    test('BustInfo型の全プロパティがQuestionに正しく格納される', () => {
      // Arrange
      const bustInfo: BustInfo = {
        isBust: true,
        reason: 'over',
      };

      const question: Question = {
        mode: 'remaining',
        throws: [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ],
        correctAnswer: 50,
        questionText: '残り点数は？',
        startingScore: 50,
        bustInfo, // Question型がbustInfoフィールドを持つことを確認
      };

      // Act & Assert
      // bustInfoのプロパティに正しくアクセスできることを確認
      expect(question.bustInfo?.isBust).toBe(true);
      expect(question.bustInfo?.reason).toBe('over');

      // 型の整合性: Question['bustInfo']がBustInfo | undefinedであることを確認
      type QuestionBustInfoType = Question['bustInfo'];
      type ExpectedType = BustInfo | undefined;

      // TypeScript型アサーションで型の一致を検証
      const _typeCheck: QuestionBustInfoType extends ExpectedType ? true : never = true;
      expect(_typeCheck).toBe(true);
    });

    test('bustInfo.reasonの型が正しく制約される', () => {
      // Arrange
      type ValidReason = 'over' | 'finish_impossible' | 'double_out_required' | null;

      const reasons: ValidReason[] = ['over', 'finish_impossible', 'double_out_required', null];

      // Act & Assert
      reasons.forEach((reason) => {
        const bustInfo: BustInfo = {
          isBust: reason !== null,
          reason,
        };

        const question: Question = {
          mode: 'remaining',
          throws: [
            {
              target: { type: 'TRIPLE', number: 20, label: 'T20' },
              landingPoint: { x: 0, y: -103 },
              score: 60,
            },
          ],
          correctAnswer: 441,
          questionText: '残り点数は？',
          startingScore: 501,
          bustInfo, // Question型がbustInfoフィールドを受け入れることを確認
        };

        expect(question.bustInfo?.reason).toBe(reason);
      });
    });

    test('Question型がBustInfo型を正しく参照している', () => {
      // Arrange: BustInfo型を直接生成
      const bustInfo: BustInfo = {
        isBust: false,
        reason: null,
      };

      // Act: Question型にBustInfo型の値を代入
      const question: Question = {
        mode: 'score',
        throws: [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ],
        correctAnswer: 60,
        questionText: 'この投擲の合計得点は？',
        bustInfo,
      };

      // Assert: bustInfoフィールドが正しくBustInfo型として扱われることを確認
      if (question.bustInfo) {
        // TypeScriptの型推論により、ここでquestion.bustInfoはBustInfo型
        const isBust: boolean = question.bustInfo.isBust;
        const reason: 'over' | 'finish_impossible' | 'double_out_required' | null =
          question.bustInfo.reason;

        expect(isBust).toBe(false);
        expect(reason).toBeNull();
      }
    });
  });

  describe('エッジケース - 複数投擲とバスト', () => {
    test('3投中の1投目でバストした場合の問題', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
        {
          target: { type: 'SINGLE', number: 20, label: '20' },
          landingPoint: { x: 0, y: 0 },
          score: 0,
        }, // バスト後の投擲は記録されない想定
        {
          target: { type: 'SINGLE', number: 20, label: '20' },
          landingPoint: { x: 0, y: 0 },
          score: 0,
        },
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 50; // バスト前の点数
      const questionText = '残り点数は？';
      const startingScore = 50;
      const bustInfo: BustInfo = {
        isBust: true,
        reason: 'over',
      };

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
        bustInfo,
      };

      // Assert
      expect(question.throws).toHaveLength(3);
      expect(question.bustInfo?.isBust).toBe(true);
      expect(question.correctAnswer).toBe(startingScore); // バスト時は元の点数
    });
  });

  describe('エッジケース - 境界値のテスト', () => {
    test('残り2点でシングル2を入れた場合（ダブルアウトルール）', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 2, label: '2' },
          landingPoint: { x: 30, y: 165 },
          score: 2,
        }, // シングル2
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 2; // バスト（ダブルアウト必要）
      const questionText = '残り点数は？';
      const startingScore = 2;
      const bustInfo: BustInfo = {
        isBust: true,
        reason: 'double_out_required',
      };

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
        bustInfo,
      };

      // Assert
      expect(question.bustInfo?.isBust).toBe(true);
      expect(question.bustInfo?.reason).toBe('double_out_required');
    });

    test('残り1点になった場合（フィニッシュ不可能）', () => {
      // Arrange
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20, label: 'T20' },
          landingPoint: { x: 0, y: -103 },
          score: 60,
        },
      ];
      const mode: QuestionType = 'remaining';
      const correctAnswer = 61; // バスト前の点数
      const questionText = '残り点数は？';
      const startingScore = 61;
      const bustInfo: BustInfo = {
        isBust: true,
        reason: 'finish_impossible',
      };

      // Act
      const question: Question = {
        mode,
        throws,
        correctAnswer,
        questionText,
        startingScore,
        bustInfo,
      };

      // Assert
      expect(question.bustInfo?.isBust).toBe(true);
      expect(question.bustInfo?.reason).toBe('finish_impossible');
    });
  });

  describe('questionPhaseフィールドの型定義', () => {
    describe('正常系 - questionPhase付きのQuestion型の生成', () => {
      test('1本目のバスト判定問題が作成できる（questionPhase.type: bust, throwIndex: 1）', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ];
        const mode: QuestionType = 'remaining';
        const correctAnswer = 441;
        const questionText = 'バストしましたか？';
        const startingScore = 501;
        const questionPhase = { type: 'bust' as const, throwIndex: 1 as const };

        // Act
        // 実装前：Question型にquestionPhaseフィールドがないため、TypeScriptコンパイルエラーになる
        // 実装後：questionPhaseフィールドが追加され、正常にコンパイル・実行できる
        const question: Question = {
          mode,
          throws,
          correctAnswer,
          questionText,
          startingScore,
          questionPhase, // このプロパティ代入がコンパイルエラーを引き起こす
        };

        // Assert
        expect(question.questionPhase).toBeDefined();
        expect(question.questionPhase?.type).toBe('bust');
        expect(question.questionPhase?.throwIndex).toBe(1);
      });

      test('2本目のバスト判定問題が作成できる（questionPhase.type: bust, throwIndex: 2）', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 19, label: 'T19' },
            landingPoint: { x: 30, y: -100 },
            score: 57,
          },
        ];
        const mode: QuestionType = 'remaining';
        const correctAnswer = 384;
        const questionText = 'バストしましたか？';
        const startingScore = 501;
        const questionPhase = { type: 'bust' as const, throwIndex: 2 as const };

        // Act
        const question: Question = {
          mode,
          throws,
          correctAnswer,
          questionText,
          startingScore,
          questionPhase,
        };

        // Assert
        expect(question.questionPhase).toBeDefined();
        expect(question.questionPhase?.type).toBe('bust');
        expect(question.questionPhase?.throwIndex).toBe(2);
      });

      test('3本目の合計点数問題が作成できる（questionPhase.type: score, throwIndex: 3）', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ];
        const mode: QuestionType = 'score';
        const correctAnswer = 180;
        const questionText = '合計得点は？';
        const questionPhase = { type: 'score' as const, throwIndex: 3 as const };

        // Act
        const question: Question = {
          mode,
          throws,
          correctAnswer,
          questionText,
          questionPhase,
        };

        // Assert
        expect(question.questionPhase).toBeDefined();
        expect(question.questionPhase?.type).toBe('score');
        expect(question.questionPhase?.throwIndex).toBe(3);
      });
    });

    describe('オプショナル性の検証', () => {
      test('questionPhaseフィールドが省略可能である', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ];
        const mode: QuestionType = 'score';
        const correctAnswer = 60;
        const questionText = 'この投擲の合計得点は？';

        // Act
        // questionPhaseを指定せずにQuestionを作成
        const question: Question = {
          mode,
          throws,
          correctAnswer,
          questionText,
        };

        // Assert
        // questionPhaseはundefinedでも型エラーにならない
        expect(question.questionPhase).toBeUndefined();
      });

      test('questionPhaseなしでも問題が作成できる（既存の動作）', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ];
        const mode: QuestionType = 'score';
        const correctAnswer = 180;
        const questionText = '合計得点は？';

        // Act
        const question: Question = {
          mode,
          throws,
          correctAnswer,
          questionText,
        };

        // Assert
        // questionPhaseフィールドが型定義に存在することを確認（プロパティとしてアクセス可能）
        // 実装前：Question型にquestionPhaseフィールドがないため失敗する
        // 実装後：questionPhaseフィールドが追加され、undefinedとしてアクセス可能になる
        expect(question.questionPhase).toBeUndefined();
      });
    });

    describe('型の整合性 - questionPhaseの型制約', () => {
      test('bustタイプのthrowIndexは1または2のみ許可される', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ];

        // Act & Assert - throwIndex: 1の場合
        const question1: Question = {
          mode: 'remaining',
          throws,
          correctAnswer: 441,
          questionText: 'バストしましたか？',
          startingScore: 501,
          questionPhase: { type: 'bust', throwIndex: 1 },
        };
        expect(question1.questionPhase?.type).toBe('bust');
        expect(question1.questionPhase?.throwIndex).toBe(1);

        // Act & Assert - throwIndex: 2の場合
        const question2: Question = {
          mode: 'remaining',
          throws,
          correctAnswer: 441,
          questionText: 'バストしましたか？',
          startingScore: 501,
          questionPhase: { type: 'bust', throwIndex: 2 },
        };
        expect(question2.questionPhase?.type).toBe('bust');
        expect(question2.questionPhase?.throwIndex).toBe(2);
      });

      test('scoreタイプのthrowIndexは3のみ許可される', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ];

        // Act
        const question: Question = {
          mode: 'score',
          throws,
          correctAnswer: 180,
          questionText: '合計得点は？',
          questionPhase: { type: 'score', throwIndex: 3 },
        };

        // Assert
        expect(question.questionPhase?.type).toBe('score');
        expect(question.questionPhase?.throwIndex).toBe(3);
      });
    });

    describe('エッジケース - questionPhaseと他フィールドの組み合わせ', () => {
      test('questionPhaseとbustInfoを同時に持つ問題が作成できる', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
        ];
        const mode: QuestionType = 'remaining';
        const correctAnswer = 50;
        const questionText = 'バストしましたか？';
        const startingScore = 50;
        const bustInfo: BustInfo = {
          isBust: true,
          reason: 'over',
        };
        const questionPhase = { type: 'bust' as const, throwIndex: 1 as const };

        // Act
        const question: Question = {
          mode,
          throws,
          correctAnswer,
          questionText,
          startingScore,
          bustInfo,
          questionPhase,
        };

        // Assert
        expect(question.questionPhase).toBeDefined();
        expect(question.questionPhase?.type).toBe('bust');
        expect(question.questionPhase?.throwIndex).toBe(1);
        expect(question.bustInfo).toBeDefined();
        expect(question.bustInfo?.isBust).toBe(true);
        expect(question.bustInfo?.reason).toBe('over');
      });

      test('scoreモードでquestionPhaseを持つ問題が作成できる', () => {
        // Arrange
        const throws: ThrowResult[] = [
          {
            target: { type: 'TRIPLE', number: 20, label: 'T20' },
            landingPoint: { x: 0, y: -103 },
            score: 60,
          },
          {
            target: { type: 'TRIPLE', number: 19, label: 'T19' },
            landingPoint: { x: 30, y: -100 },
            score: 57,
          },
          {
            target: { type: 'TRIPLE', number: 18, label: 'T18' },
            landingPoint: { x: 60, y: -90 },
            score: 54,
          },
        ];
        const mode: QuestionType = 'score';
        const correctAnswer = 171;
        const questionText = '合計得点は？';
        const questionPhase = { type: 'score' as const, throwIndex: 3 as const };

        // Act
        const question: Question = {
          mode,
          throws,
          correctAnswer,
          questionText,
          questionPhase,
        };

        // Assert
        expect(question.mode).toBe('score');
        expect(question.questionPhase?.type).toBe('score');
        expect(question.questionPhase?.throwIndex).toBe(3);
        expect(question.bustInfo).toBeUndefined(); // scoreモードでは通常bustInfoを持たない
      });
    });
  });
});
