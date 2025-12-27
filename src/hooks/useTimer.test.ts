import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useGameStore } from '../stores/gameStore';
import { useTimer } from './useTimer';

/**
 * useTimer.ts のテスト
 *
 * テストパターン: hook（React カスタムフック）
 * 配置戦略: colocated（src/hooks/useTimer.test.ts）
 *
 * 対象機能:
 * - sessionConfig.timeLimit に基づくタイマー起動制御
 * - isTimerRunning が true の間、1秒毎に tick() を呼び出す
 * - isTimerRunning が false になったらタイマーをクリア
 * - アンマウント時のクリーンアップ
 * - 二重タイマー防止
 */

describe('useTimer', () => {
  beforeEach(() => {
    // フェイクタイマーを使用
    vi.useFakeTimers();

    // ストアを初期化
    act(() => {
      useGameStore.setState({
        gameState: 'setup',
        sessionConfig: { mode: 'questions', questionCount: 10 },
        isTimerRunning: false,
        elapsedTime: 0,
        practiceStartTime: undefined,
        stats: { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 },
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // 正常系: タイマー開始条件
  // ============================================================
  describe('正常系: タイマー開始条件', () => {
    test('timeLimit が設定されている場合、タイマーが開始される', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 3 },
          isTimerRunning: true,
        });
      });

      // Act
      renderHook(() => useTimer());

      // 1秒進める
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert
      expect(tickSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 正常系: タイマーが開始されない条件
  // ============================================================
  describe('正常系: タイマーが開始されない条件', () => {
    test('timeLimit が未設定の場合、タイマーは開始されない', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: 10 },
          isTimerRunning: true,
        });
      });

      // Act
      renderHook(() => useTimer());

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert: tick は呼ばれない
      expect(tickSpy).not.toHaveBeenCalled();
    });

    test('isTimerRunning が false の場合、タイマーは開始されない', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: false,
        });
      });

      // Act
      renderHook(() => useTimer());

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert
      expect(tickSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 正常系: tick の呼び出し頻度
  // ============================================================
  describe('正常系: tick の呼び出し頻度', () => {
    test('1秒毎に tick が呼ばれる', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: true,
        });
      });

      // Act
      renderHook(() => useTimer());

      // 3秒進める
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Assert: 3回呼ばれる
      expect(tickSpy).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================================
  // 正常系: タイマークリーンアップ
  // ============================================================
  describe('正常系: タイマークリーンアップ', () => {
    test('isTimerRunning が false になるとタイマーがクリアされる', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: true,
        });
      });

      const { rerender } = renderHook(() => useTimer());

      // 1秒進める
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(tickSpy).toHaveBeenCalledTimes(1);

      // Act: isTimerRunning を false に変更
      act(() => {
        useGameStore.setState({ isTimerRunning: false });
      });

      rerender();

      // さらに3秒進める
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Assert: タイマーがクリアされたため、tick は1回のまま
      expect(tickSpy).toHaveBeenCalledTimes(1);
    });

    test('コンポーネントアンマウント時にタイマーがクリアされる', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: true,
        });
      });

      const { unmount } = renderHook(() => useTimer());

      // 1秒進める
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(tickSpy).toHaveBeenCalledTimes(1);

      // Act: アンマウント
      unmount();

      // さらに3秒進める
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Assert: アンマウント後は tick が呼ばれない
      expect(tickSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 正常系: 状態変更への反応
  // ============================================================
  describe('正常系: 状態変更への反応', () => {
    test('isTimerRunning が true に変わるとタイマーが開始される', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: false,
        });
      });

      const { rerender } = renderHook(() => useTimer());

      // 1秒進める（タイマーは動いていない）
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(tickSpy).not.toHaveBeenCalled();

      // Act: isTimerRunning を true に変更
      act(() => {
        useGameStore.setState({ isTimerRunning: true });
      });

      rerender();

      // さらに1秒進める
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert: タイマーが開始され、tick が呼ばれる
      expect(tickSpy).toHaveBeenCalledTimes(1);
    });

    test('timeLimit が設定されるとタイマーが開始される', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: 10 },
          isTimerRunning: true,
        });
      });

      const { rerender } = renderHook(() => useTimer());

      // 1秒進める（タイマーは動いていない）
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(tickSpy).not.toHaveBeenCalled();

      // Act: timeLimit を設定
      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 3 },
        });
      });

      rerender();

      // さらに1秒進める
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert
      expect(tickSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // エッジケース: 二重タイマー防止
  // ============================================================
  describe('エッジケース: 二重タイマー防止', () => {
    test('再マウント時に既存タイマーがクリアされる', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: true,
        });
      });

      // Act: 1回目のマウント
      const { unmount: unmount1 } = renderHook(() => useTimer());

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(tickSpy).toHaveBeenCalledTimes(1);

      // 2回目のマウント（既存タイマーをクリア）
      unmount1();
      const { unmount: unmount2 } = renderHook(() => useTimer());

      tickSpy.mockClear();

      // さらに2秒進める
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Assert: 新しいタイマーのみが動作（2回のみ）
      expect(tickSpy).toHaveBeenCalledTimes(2);

      unmount2();
    });

    test('複数の useTimer が同時に存在しても各タイマーが独立して動作する', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: true,
        });
      });

      // Act: 2つのフックを同時にマウント
      const { unmount: unmount1 } = renderHook(() => useTimer());
      const { unmount: unmount2 } = renderHook(() => useTimer());

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert: tick は各フックから1回ずつ、合計2回呼ばれる
      expect(tickSpy).toHaveBeenCalledTimes(2);

      unmount1();
      unmount2();
    });
  });

  // ============================================================
  // エッジケース: 境界値
  // ============================================================
  describe('エッジケース: 境界値', () => {
    test('タイマー開始直後（0ms）では tick は呼ばれない', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: true,
        });
      });

      // Act
      renderHook(() => useTimer());

      // 時間を進めない
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // Assert
      expect(tickSpy).not.toHaveBeenCalled();
    });

    test('999ms経過時点では tick は呼ばれない', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: true,
        });
      });

      // Act
      renderHook(() => useTimer());

      act(() => {
        vi.advanceTimersByTime(999);
      });

      // Assert
      expect(tickSpy).not.toHaveBeenCalled();
    });

    test('ちょうど1000ms経過時点で tick が呼ばれる', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 5 },
          isTimerRunning: true,
        });
      });

      // Act
      renderHook(() => useTimer());

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert
      expect(tickSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 統合テスト: 実際の使用シナリオ
  // ============================================================
  describe('統合テスト: 実際の使用シナリオ', () => {
    test('練習開始から終了までのタイマー動作', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      // Act: 練習開始（timeモード、3分）
      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'time', timeLimit: 3 },
          isTimerRunning: true,
          gameState: 'practicing',
        });
      });

      const { unmount } = renderHook(() => useTimer());

      // 10秒経過
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(tickSpy).toHaveBeenCalledTimes(10);

      // 練習終了
      act(() => {
        useGameStore.setState({
          isTimerRunning: false,
          gameState: 'results',
        });
      });

      // さらに5秒経過（タイマーは停止しているはず）
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Assert: tick は10回のまま
      expect(tickSpy).toHaveBeenCalledTimes(10);

      unmount();
    });

    test('問題数モードではタイマーが動作しない', () => {
      // Arrange
      const tickSpy = vi.spyOn(useGameStore.getState(), 'tick');

      // Act: 練習開始（questionsモード、10問）
      act(() => {
        useGameStore.setState({
          sessionConfig: { mode: 'questions', questionCount: 10 },
          isTimerRunning: true,
          gameState: 'practicing',
        });
      });

      renderHook(() => useTimer());

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Assert: tick は呼ばれない
      expect(tickSpy).not.toHaveBeenCalled();
    });
  });
});
