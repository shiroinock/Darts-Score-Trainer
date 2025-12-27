import { useEffect } from 'react';

/**
 * キーボード入力コールバック
 */
export interface KeyboardCallbacks {
  onDigit?: (digit: number) => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  onEscape?: () => void;
}

/**
 * キーボード入力管理フック
 *
 * キーボードショートカット（0-9, Enter, Backspace, Escape）を処理します。
 * useEffectでキーボードイベントリスナーを登録・削除します。
 *
 * @param callbacks - キーボードイベントに対応するコールバック
 *
 * @remarks
 * - 数字キー（0-9）: onDigit(digit: number) を呼び出し
 * - Enterキー: onEnter() を呼び出し
 * - Backspaceキー: onBackspace() を呼び出し
 * - Escapeキー: onEscape() を呼び出し
 * - それ以外のキー: 無視
 * - コンポーネントアンマウント時にリスナーを削除
 * - callbacksが更新された場合はリスナーを再登録
 *
 * @example
 * ```tsx
 * function NumberInput() {
 *   const [value, setValue] = useState('');
 *
 *   useKeyboardInput({
 *     onDigit: (digit) => setValue(prev => prev + digit),
 *     onBackspace: () => setValue(prev => prev.slice(0, -1)),
 *     onEnter: () => console.log('Submitted:', value),
 *     onEscape: () => setValue(''),
 *   });
 *
 *   return <div>{value}</div>;
 * }
 * ```
 */
export const useKeyboardInput = (callbacks: KeyboardCallbacks): void => {
  useEffect(() => {
    // キーボードイベントハンドラ
    const handleKeyDown = (event: KeyboardEvent): void => {
      const { key } = event;

      // 数字キー（0-9）の処理
      if (key >= '0' && key <= '9') {
        const digit = parseInt(key, 10);
        callbacks.onDigit?.(digit);
        return;
      }

      // Enterキーの処理
      if (key === 'Enter') {
        callbacks.onEnter?.();
        return;
      }

      // Backspaceキーの処理
      if (key === 'Backspace') {
        callbacks.onBackspace?.();
        return;
      }

      // Escapeキーの処理
      if (key === 'Escape') {
        callbacks.onEscape?.();
        return;
      }

      // それ以外のキーは無視
    };

    // イベントリスナーを登録
    window.addEventListener('keydown', handleKeyDown);

    // クリーンアップ: コンポーネントアンマウント時またはcallbacks更新時にリスナーを削除
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callbacks]);
};
