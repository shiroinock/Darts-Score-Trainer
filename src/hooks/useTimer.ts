import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { TIMER_INTERVAL_MS } from '../utils/constants';

/**
 * タイマー管理フック
 *
 * sessionConfig.timeLimitが設定されている場合、
 * isTimerRunningがtrueの間、1秒毎にtick()アクションを呼び出します。
 *
 * @remarks
 * - timeLimitが未設定の場合はタイマーを開始しない
 * - isTimerRunningがfalseになるとタイマーをクリア
 * - コンポーネントアンマウント時にタイマーをクリア
 */
export const useTimer = (): void => {
  const sessionConfig = useGameStore((state) => state.sessionConfig);
  const isTimerRunning = useGameStore((state) => state.isTimerRunning);

  // タイマーIDを保持するref（クリーンアップ用）
  const timerIdRef = useRef<number | null>(null);

  useEffect(() => {
    // タイマー開始条件:
    // 1. sessionConfig.timeLimitが設定されている
    // 2. isTimerRunningがtrue
    const hasTimeLimit = sessionConfig.mode === 'time' && sessionConfig.timeLimit !== undefined;

    if (hasTimeLimit && isTimerRunning) {
      // タイマーを開始
      timerIdRef.current = setInterval(() => {
        // 最新のストア状態から直接tick関数を取得して呼び出す
        useGameStore.getState().tick();
      }, TIMER_INTERVAL_MS);
    }

    // クリーンアップ: 依存配列の値が変わった時、またはアンマウント時にタイマーをクリア
    return () => {
      if (timerIdRef.current !== null) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [sessionConfig, isTimerRunning]);
};
