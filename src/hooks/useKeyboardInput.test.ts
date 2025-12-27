import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useKeyboardInput } from './useKeyboardInput';

/**
 * useKeyboardInput.ts のテスト
 *
 * テストパターン: hook（React カスタムフック）
 * 配置戦略: colocated（src/hooks/useKeyboardInput.test.ts）
 *
 * 対象機能:
 * - キーボードショートカット（0-9, Enter, Backspace, Escape）の処理
 * - 各キーに対応するコールバックの呼び出し
 * - それ以外のキーの無視
 * - コンポーネントアンマウント時のリスナー削除
 * - callbacksが更新された場合のリスナー再登録
 */

// コールバック型定義
interface KeyboardCallbacks {
  onDigit?: (digit: number) => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  onEscape?: () => void;
}

describe('useKeyboardInput', () => {
  let callbacks: KeyboardCallbacks;

  beforeEach(() => {
    // コールバックのモック関数を初期化
    callbacks = {
      onDigit: vi.fn(),
      onEnter: vi.fn(),
      onBackspace: vi.fn(),
      onEscape: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // 正常系: 数字キー（0-9）の処理
  // ============================================================
  describe('正常系: 数字キー（0-9）の処理', () => {
    test('数字キー0を押すとonDigit(0)が呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '0' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onDigit).toHaveBeenCalledTimes(1);
      expect(callbacks.onDigit).toHaveBeenCalledWith(0);
    });

    test('数字キー1を押すとonDigit(1)が呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onDigit).toHaveBeenCalledTimes(1);
      expect(callbacks.onDigit).toHaveBeenCalledWith(1);
    });

    test('数字キー9を押すとonDigit(9)が呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '9' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onDigit).toHaveBeenCalledTimes(1);
      expect(callbacks.onDigit).toHaveBeenCalledWith(9);
    });

    test('複数の数字キーを順番に押すと各onDigitが順番に呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: '1' });
        const event2 = new KeyboardEvent('keydown', { key: '2' });
        const event3 = new KeyboardEvent('keydown', { key: '3' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        window.dispatchEvent(event3);
      });

      // Assert
      expect(callbacks.onDigit).toHaveBeenCalledTimes(3);
      expect(callbacks.onDigit).toHaveBeenNthCalledWith(1, 1);
      expect(callbacks.onDigit).toHaveBeenNthCalledWith(2, 2);
      expect(callbacks.onDigit).toHaveBeenNthCalledWith(3, 3);
    });
  });

  // ============================================================
  // 正常系: Enterキーの処理
  // ============================================================
  describe('正常系: Enterキーの処理', () => {
    test('Enterキーを押すとonEnterが呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onEnter).toHaveBeenCalledTimes(1);
    });

    test('Enterキーを複数回押すと各回でonEnterが呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: 'Enter' });
        const event2 = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
      });

      // Assert
      expect(callbacks.onEnter).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // 正常系: Backspaceキーの処理
  // ============================================================
  describe('正常系: Backspaceキーの処理', () => {
    test('Backspaceキーを押すとonBackspaceが呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Backspace' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onBackspace).toHaveBeenCalledTimes(1);
    });

    test('Backspaceキーを複数回押すと各回でonBackspaceが呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: 'Backspace' });
        const event2 = new KeyboardEvent('keydown', { key: 'Backspace' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
      });

      // Assert
      expect(callbacks.onBackspace).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // 正常系: Escapeキーの処理
  // ============================================================
  describe('正常系: Escapeキーの処理', () => {
    test('Escapeキーを押すとonEscapeが呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onEscape).toHaveBeenCalledTimes(1);
    });

    test('Escapeキーを複数回押すと各回でonEscapeが呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: 'Escape' });
        const event2 = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
      });

      // Assert
      expect(callbacks.onEscape).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // 正常系: それ以外のキーの無視
  // ============================================================
  describe('正常系: それ以外のキーの無視', () => {
    test('アルファベットキーを押してもコールバックは呼ばれない', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'a' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onDigit).not.toHaveBeenCalled();
      expect(callbacks.onEnter).not.toHaveBeenCalled();
      expect(callbacks.onBackspace).not.toHaveBeenCalled();
      expect(callbacks.onEscape).not.toHaveBeenCalled();
    });

    test('Spaceキーを押してもコールバックは呼ばれない', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onDigit).not.toHaveBeenCalled();
      expect(callbacks.onEnter).not.toHaveBeenCalled();
      expect(callbacks.onBackspace).not.toHaveBeenCalled();
      expect(callbacks.onEscape).not.toHaveBeenCalled();
    });

    test('矢印キーを押してもコールバックは呼ばれない', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        window.dispatchEvent(event);
      });

      // Assert
      expect(callbacks.onDigit).not.toHaveBeenCalled();
      expect(callbacks.onEnter).not.toHaveBeenCalled();
      expect(callbacks.onBackspace).not.toHaveBeenCalled();
      expect(callbacks.onEscape).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 正常系: 混在したキー入力の処理
  // ============================================================
  describe('正常系: 混在したキー入力の処理', () => {
    test('数字、Enter、Backspaceの順に押すと各コールバックが順番に呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: '1' });
        const event2 = new KeyboardEvent('keydown', { key: '0' });
        const event3 = new KeyboardEvent('keydown', { key: 'Enter' });
        const event4 = new KeyboardEvent('keydown', { key: 'Backspace' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        window.dispatchEvent(event3);
        window.dispatchEvent(event4);
      });

      // Assert
      expect(callbacks.onDigit).toHaveBeenCalledTimes(2);
      expect(callbacks.onDigit).toHaveBeenNthCalledWith(1, 1);
      expect(callbacks.onDigit).toHaveBeenNthCalledWith(2, 0);
      expect(callbacks.onEnter).toHaveBeenCalledTimes(1);
      expect(callbacks.onBackspace).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 正常系: コールバックの省略
  // ============================================================
  describe('正常系: コールバックの省略', () => {
    test('onDigitが省略されている場合、数字キーを押してもエラーにならない', () => {
      // Arrange
      const partialCallbacks = {
        onEnter: vi.fn(),
      };

      renderHook(() => useKeyboardInput(partialCallbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '5' });
        window.dispatchEvent(event);
      });

      // Assert: エラーが発生しない
      expect(partialCallbacks.onEnter).not.toHaveBeenCalled();
    });

    test('すべてのコールバックが省略されている場合、キーを押してもエラーにならない', () => {
      // Arrange
      const emptyCallbacks = {};

      renderHook(() => useKeyboardInput(emptyCallbacks));

      // Act & Assert: エラーが発生しない
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: '0' });
        const event2 = new KeyboardEvent('keydown', { key: 'Enter' });
        const event3 = new KeyboardEvent('keydown', { key: 'Backspace' });
        const event4 = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        window.dispatchEvent(event3);
        window.dispatchEvent(event4);
      });
    });
  });

  // ============================================================
  // 正常系: クリーンアップ
  // ============================================================
  describe('正常系: クリーンアップ', () => {
    test('コンポーネントアンマウント時にリスナーが削除される', () => {
      // Arrange
      const { unmount } = renderHook(() => useKeyboardInput(callbacks));

      // Act: アンマウント
      unmount();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        window.dispatchEvent(event);
      });

      // Assert: アンマウント後はコールバックが呼ばれない
      expect(callbacks.onDigit).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 正常系: callbacksの更新
  // ============================================================
  describe('正常系: callbacksの更新', () => {
    test('callbacksが更新されると新しいコールバックが呼ばれる', () => {
      // Arrange
      const initialCallbacks = {
        onDigit: vi.fn(),
      };

      const { rerender } = renderHook(({ cbs }) => useKeyboardInput(cbs), {
        initialProps: { cbs: initialCallbacks },
      });

      // 最初のコールバックで1を押す
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        window.dispatchEvent(event);
      });

      expect(initialCallbacks.onDigit).toHaveBeenCalledTimes(1);
      expect(initialCallbacks.onDigit).toHaveBeenCalledWith(1);

      // Act: callbacksを更新
      const updatedCallbacks = {
        onDigit: vi.fn(),
      };

      rerender({ cbs: updatedCallbacks });

      // 更新後に2を押す
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '2' });
        window.dispatchEvent(event);
      });

      // Assert: 古いコールバックは呼ばれず、新しいコールバックが呼ばれる
      expect(initialCallbacks.onDigit).toHaveBeenCalledTimes(1); // 変わらない
      expect(updatedCallbacks.onDigit).toHaveBeenCalledTimes(1);
      expect(updatedCallbacks.onDigit).toHaveBeenCalledWith(2);
    });
  });

  // ============================================================
  // エッジケース: 特殊なキー入力
  // ============================================================
  describe('エッジケース: 特殊なキー入力', () => {
    test('Ctrl+数字キーを押してもonDigitが呼ばれる', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1', ctrlKey: true });
        window.dispatchEvent(event);
      });

      // Assert: Ctrl修飾キーは無視して処理
      expect(callbacks.onDigit).toHaveBeenCalledTimes(1);
      expect(callbacks.onDigit).toHaveBeenCalledWith(1);
    });

    test('Shift+数字キーを押してもonDigitが呼ばれる（key="!"でも無視）', () => {
      // Arrange
      renderHook(() => useKeyboardInput(callbacks));

      // Act
      act(() => {
        // Shift+1は"!"になるが、keyが"1"ではないため無視される
        const event = new KeyboardEvent('keydown', { key: '!', shiftKey: true });
        window.dispatchEvent(event);
      });

      // Assert: key="!"は数字ではないため無視される
      expect(callbacks.onDigit).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 統合テスト: 実際の使用シナリオ
  // ============================================================
  describe('統合テスト: 実際の使用シナリオ', () => {
    test('テンキー入力シミュレーション: "180" + Enter', () => {
      // Arrange
      const inputLog: (number | string)[] = [];
      const scenarioCallbacks = {
        onDigit: (digit: number) => inputLog.push(digit),
        onEnter: () => inputLog.push('Enter'),
      };

      renderHook(() => useKeyboardInput(scenarioCallbacks));

      // Act
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: '1' });
        const event2 = new KeyboardEvent('keydown', { key: '8' });
        const event3 = new KeyboardEvent('keydown', { key: '0' });
        const event4 = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        window.dispatchEvent(event3);
        window.dispatchEvent(event4);
      });

      // Assert
      expect(inputLog).toEqual([1, 8, 0, 'Enter']);
    });

    test('訂正入力シミュレーション: "12" + Backspace + "5" + Enter', () => {
      // Arrange
      const inputLog: (number | string)[] = [];
      const scenarioCallbacks = {
        onDigit: (digit: number) => inputLog.push(digit),
        onBackspace: () => inputLog.push('Backspace'),
        onEnter: () => inputLog.push('Enter'),
      };

      renderHook(() => useKeyboardInput(scenarioCallbacks));

      // Act
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: '1' });
        const event2 = new KeyboardEvent('keydown', { key: '2' });
        const event3 = new KeyboardEvent('keydown', { key: 'Backspace' });
        const event4 = new KeyboardEvent('keydown', { key: '5' });
        const event5 = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        window.dispatchEvent(event3);
        window.dispatchEvent(event4);
        window.dispatchEvent(event5);
      });

      // Assert
      expect(inputLog).toEqual([1, 2, 'Backspace', 5, 'Enter']);
    });

    test('キャンセルシミュレーション: "123" + Escape', () => {
      // Arrange
      const inputLog: (number | string)[] = [];
      const scenarioCallbacks = {
        onDigit: (digit: number) => inputLog.push(digit),
        onEscape: () => inputLog.push('Escape'),
      };

      renderHook(() => useKeyboardInput(scenarioCallbacks));

      // Act
      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: '1' });
        const event2 = new KeyboardEvent('keydown', { key: '2' });
        const event3 = new KeyboardEvent('keydown', { key: '3' });
        const event4 = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        window.dispatchEvent(event3);
        window.dispatchEvent(event4);
      });

      // Assert
      expect(inputLog).toEqual([1, 2, 3, 'Escape']);
    });
  });
});
