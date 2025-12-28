import { useEffect, useRef } from 'react';

/**
 * キーボード入力コールバック
 */
export interface KeyboardCallbacks {
  onDigit?: (digit: number) => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  onEscape?: () => void;
  /**
   * キーボード入力を有効にするかどうか
   * @default true
   */
  enabled?: boolean;
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
 * - enabled が false の場合はイベントリスナーを登録しない（デフォルト: true）
 * - コンポーネントアンマウント時にリスナーを削除
 * - callbacksまたはenabledが更新された場合はリスナーを再登録
 *
 * @example
 * ```tsx
 * function NumberInput() {
 *   const [value, setValue] = useState('');
 *   const [isActive, setIsActive] = useState(true);
 *
 *   useKeyboardInput({
 *     onDigit: (digit) => setValue(prev => prev + digit),
 *     onBackspace: () => setValue(prev => prev.slice(0, -1)),
 *     onEnter: () => console.log('Submitted:', value),
 *     onEscape: () => setValue(''),
 *     enabled: isActive, // フォーカス状態に応じて有効/無効を制御
 *   });
 *
 *   return <div>{value}</div>;
 * }
 * ```
 */
export const useKeyboardInput = (callbacks: KeyboardCallbacks): void => {
  // コールバックをrefで保持してイベントリスナーの再登録を防ぐ
  const callbacksRef = useRef(callbacks);

  // callbacksが変更されたらrefを更新
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    // enabled が false の場合はイベントリスナーを登録しない
    const enabled = callbacks.enabled ?? true;
    if (!enabled) {
      return;
    }

    // キーボードイベントハンドラ
    const handleKeyDown = (event: KeyboardEvent): void => {
      const { key } = event;

      // 数字キー（0-9）の処理
      if (key >= '0' && key <= '9') {
        event.preventDefault();
        const digit = parseInt(key, 10);
        callbacksRef.current.onDigit?.(digit);
        return;
      }

      // Enterキーの処理
      if (key === 'Enter') {
        event.preventDefault();
        callbacksRef.current.onEnter?.();
        return;
      }

      // Backspaceキーの処理
      if (key === 'Backspace') {
        event.preventDefault();
        callbacksRef.current.onBackspace?.();
        return;
      }

      // Escapeキーの処理
      if (key === 'Escape') {
        event.preventDefault();
        callbacksRef.current.onEscape?.();
        return;
      }

      // それ以外のキーは無視
    };

    // イベントリスナーを登録
    window.addEventListener('keydown', handleKeyDown);

    // クリーンアップ: コンポーネントアンマウント時にリスナーを削除
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callbacks.enabled]); // enabled の変更を検知
};
