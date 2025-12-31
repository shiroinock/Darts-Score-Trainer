/**
 * useFeedback フックのテスト
 *
 * フィードバック状態管理フックの動作を検証します。
 * スコア回答とバスト判定回答の両方に対応したテストを実施します。
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useGameStore } from '../stores/gameStore';
import type { Question } from '../types';
import { useFeedback } from './useFeedback';

// Zustandストアをモック
vi.mock('../stores/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('useFeedback', () => {
  // モック関数
  const mockSubmitAnswer = vi.fn();
  const mockSimulateNextThrow = vi.fn();
  const mockGetCurrentCorrectAnswer = vi.fn();
  const mockGetBustCorrectAnswer = vi.fn();
  const mockNextQuestion = vi.fn();

  // モックされた問題
  const mockQuestion: Question = {
    mode: 'score',
    throws: [
      {
        target: { type: 'TRIPLE', number: 20, label: 'T20' },
        landingPoint: { x: 0, y: -100 },
        score: 60,
      },
    ],
    correctAnswer: 60,
    questionText: 'この投擲の得点は？',
  };

  beforeEach(() => {
    // 各テスト前にモックをリセット
    vi.clearAllMocks();

    // useGameStoreのモックをセットアップ
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) =>
        selector({
          currentQuestion: mockQuestion,
          submitAnswer: mockSubmitAnswer,
          simulateNextThrow: mockSimulateNextThrow,
          getCurrentCorrectAnswer: mockGetCurrentCorrectAnswer,
          getBustCorrectAnswer: mockGetBustCorrectAnswer,
          nextQuestion: mockNextQuestion,
        })
    );
  });

  describe('初期状態', () => {
    test('初期状態はフィードバック非表示で、回答情報がnull', () => {
      // Act
      const { result } = renderHook(() => useFeedback());

      // Assert
      expect(result.current.showFeedback).toBe(false);
      expect(result.current.lastAnswer).toBeNull();
      expect(result.current.bustAnswer).toBeNull();
    });
  });

  describe('handleConfirm（スコア回答）', () => {
    test('正しい回答を送信すると、フィードバックが表示される', () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());
      mockGetCurrentCorrectAnswer.mockReturnValue(60);

      // Act
      act(() => {
        result.current.handleConfirm(60);
      });

      // Assert
      expect(result.current.showFeedback).toBe(true);
      expect(result.current.lastAnswer).toEqual({ value: 60, isCorrect: true });
      expect(mockSubmitAnswer).toHaveBeenCalledWith(60);
    });

    test('誤った回答を送信すると、不正解フィードバックが表示される', () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());
      mockGetCurrentCorrectAnswer.mockReturnValue(60);

      // Act
      act(() => {
        result.current.handleConfirm(40);
      });

      // Assert
      expect(result.current.showFeedback).toBe(true);
      expect(result.current.lastAnswer).toEqual({ value: 40, isCorrect: false });
      expect(mockSubmitAnswer).toHaveBeenCalledWith(40);
    });

    test('問題がない場合は何もしない', () => {
      // Arrange
      (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) =>
          selector({
            currentQuestion: null,
            submitAnswer: mockSubmitAnswer,
            simulateNextThrow: mockSimulateNextThrow,
            getCurrentCorrectAnswer: mockGetCurrentCorrectAnswer,
            getBustCorrectAnswer: mockGetBustCorrectAnswer,
            nextQuestion: mockNextQuestion,
          })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      act(() => {
        result.current.handleConfirm(60);
      });

      // Assert
      expect(result.current.showFeedback).toBe(false);
      expect(result.current.lastAnswer).toBeNull();
      expect(mockSubmitAnswer).not.toHaveBeenCalled();
    });
  });

  describe('handleBustAnswer（バスト判定回答）', () => {
    test('バスト判定回答（true）を送信すると、フィードバックが表示される', () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act
      act(() => {
        result.current.handleBustAnswer(true);
      });

      // Assert
      expect(result.current.showFeedback).toBe(true);
      expect(result.current.bustAnswer).toBe(true);
    });

    test('バスト判定回答（false）を送信すると、フィードバックが表示される', () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act
      act(() => {
        result.current.handleBustAnswer(false);
      });

      // Assert
      expect(result.current.showFeedback).toBe(true);
      expect(result.current.bustAnswer).toBe(false);
    });

    test('問題がない場合は何もしない', () => {
      // Arrange
      (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) =>
          selector({
            currentQuestion: null,
            submitAnswer: mockSubmitAnswer,
            simulateNextThrow: mockSimulateNextThrow,
            getCurrentCorrectAnswer: mockGetCurrentCorrectAnswer,
            getBustCorrectAnswer: mockGetBustCorrectAnswer,
            nextQuestion: mockNextQuestion,
          })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      act(() => {
        result.current.handleBustAnswer(true);
      });

      // Assert
      expect(result.current.showFeedback).toBe(false);
      expect(result.current.bustAnswer).toBeNull();
    });
  });

  describe('handleBustFeedbackComplete（バストフィードバック完了）', () => {
    describe('正解がバストの場合（bustCorrectAnswer === true）', () => {
      test('nextQuestion()が呼び出される', () => {
        // Arrange
        const { result } = renderHook(() => useFeedback());
        mockGetBustCorrectAnswer.mockReturnValue(true);

        // バスト判定回答を設定
        act(() => {
          result.current.handleBustAnswer(true);
        });

        // Act
        act(() => {
          result.current.handleBustFeedbackComplete();
        });

        // Assert
        expect(mockNextQuestion).toHaveBeenCalledTimes(1);
        expect(mockSimulateNextThrow).not.toHaveBeenCalled();
      });

      test('フィードバック状態がリセットされる', () => {
        // Arrange
        const { result } = renderHook(() => useFeedback());
        mockGetBustCorrectAnswer.mockReturnValue(true);

        // バスト判定回答を設定
        act(() => {
          result.current.handleBustAnswer(true);
        });

        // Act
        act(() => {
          result.current.handleBustFeedbackComplete();
        });

        // Assert
        expect(result.current.showFeedback).toBe(false);
        expect(result.current.bustAnswer).toBeNull();
      });
    });

    describe('正解がセーフの場合（bustCorrectAnswer === false）', () => {
      test('simulateNextThrow()が呼び出される', () => {
        // Arrange
        const { result } = renderHook(() => useFeedback());
        mockGetBustCorrectAnswer.mockReturnValue(false);

        // バスト判定回答を設定
        act(() => {
          result.current.handleBustAnswer(false);
        });

        // Act
        act(() => {
          result.current.handleBustFeedbackComplete();
        });

        // Assert
        expect(mockSimulateNextThrow).toHaveBeenCalledTimes(1);
        expect(mockNextQuestion).not.toHaveBeenCalled();
      });

      test('フィードバック状態がリセットされる', () => {
        // Arrange
        const { result } = renderHook(() => useFeedback());
        mockGetBustCorrectAnswer.mockReturnValue(false);

        // バスト判定回答を設定
        act(() => {
          result.current.handleBustAnswer(false);
        });

        // Act
        act(() => {
          result.current.handleBustFeedbackComplete();
        });

        // Assert
        expect(result.current.showFeedback).toBe(false);
        expect(result.current.bustAnswer).toBeNull();
      });
    });

    describe('状態リセットの一貫性', () => {
      test('バスト時もセーフ時も setBustAnswer(null) と setShowFeedback(false) が呼び出される', () => {
        // Arrange
        const { result } = renderHook(() => useFeedback());

        // Test 1: バスト時
        mockGetBustCorrectAnswer.mockReturnValue(true);
        act(() => {
          result.current.handleBustAnswer(true);
        });

        // Act & Assert
        act(() => {
          result.current.handleBustFeedbackComplete();
        });
        expect(result.current.showFeedback).toBe(false);
        expect(result.current.bustAnswer).toBeNull();

        // Test 2: セーフ時
        mockGetBustCorrectAnswer.mockReturnValue(false);
        act(() => {
          result.current.handleBustAnswer(false);
        });

        // Act & Assert
        act(() => {
          result.current.handleBustFeedbackComplete();
        });
        expect(result.current.showFeedback).toBe(false);
        expect(result.current.bustAnswer).toBeNull();
      });
    });
  });

  describe('問題変更時のリセット', () => {
    test('問題が変更されるとフィードバックがリセットされる', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useFeedback());
      mockGetCurrentCorrectAnswer.mockReturnValue(60);

      // フィードバックを表示
      act(() => {
        result.current.handleConfirm(60);
      });

      expect(result.current.showFeedback).toBe(true);

      // 問題を変更
      const newQuestion: Question = {
        mode: 'score',
        throws: [
          {
            target: { type: 'DOUBLE', number: 20, label: 'D20' },
            landingPoint: { x: 0, y: -165 },
            score: 40,
          },
        ],
        correctAnswer: 40,
        questionText: 'この投擲の得点は？',
      };

      (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) =>
          selector({
            currentQuestion: newQuestion,
            submitAnswer: mockSubmitAnswer,
            simulateNextThrow: mockSimulateNextThrow,
            getCurrentCorrectAnswer: mockGetCurrentCorrectAnswer,
            getBustCorrectAnswer: mockGetBustCorrectAnswer,
            nextQuestion: mockNextQuestion,
          })
      );

      // Act
      rerender();

      // Assert
      expect(result.current.showFeedback).toBe(false);
      expect(result.current.lastAnswer).toBeNull();
      expect(result.current.bustAnswer).toBeNull();
    });

    test('フィードバック非表示時は問題変更でリセットされない', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useFeedback());

      // 初期状態（フィードバック非表示）を確認
      expect(result.current.showFeedback).toBe(false);

      // 問題を変更
      const newQuestion: Question = {
        mode: 'score',
        throws: [
          {
            target: { type: 'DOUBLE', number: 20, label: 'D20' },
            landingPoint: { x: 0, y: -165 },
            score: 40,
          },
        ],
        correctAnswer: 40,
        questionText: 'この投擲の得点は？',
      };

      (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) =>
          selector({
            currentQuestion: newQuestion,
            submitAnswer: mockSubmitAnswer,
            simulateNextThrow: mockSimulateNextThrow,
            getCurrentCorrectAnswer: mockGetCurrentCorrectAnswer,
            getBustCorrectAnswer: mockGetBustCorrectAnswer,
            nextQuestion: mockNextQuestion,
          })
      );

      // Act
      rerender();

      // Assert - 状態が維持される（リセット処理が走らない）
      expect(result.current.showFeedback).toBe(false);
      expect(result.current.lastAnswer).toBeNull();
      expect(result.current.bustAnswer).toBeNull();
    });
  });
});
