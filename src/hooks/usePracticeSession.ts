import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

/**
 * 練習セッション管理フック
 *
 * 練習セッション中の状態を監視し、以下の処理を自動的に実行します：
 * - gameStateが'setup'から'practicing'に遷移したら問題を生成
 *
 * @remarks
 * このフックは副作用専用のフックであり、値を返しません。
 * すべてのゲームロジックはgameStoreに委譲されており、
 * このフックは状態監視とアクションのトリガーのみを担当します。
 *
 * バスト処理後など、currentQuestionがnullになっても自動的に
 * 問題を生成しません。次の問題への遷移はnextQuestion()の呼び出しに委譲されます。
 *
 * @example
 * ```tsx
 * function PracticeScreen() {
 *   usePracticeSession(); // セッション管理を有効化
 *   // UIコンポーネントを返す
 *   return null;
 * }
 * ```
 */
export const usePracticeSession = (): void => {
  const gameState = useGameStore((state) => state.gameState);
  const currentQuestion = useGameStore((state) => state.currentQuestion);

  // 前回のgameStateを保持（遷移を検知するため）
  const prevGameStateRef = useRef<string>(gameState);

  // gameStateが'setup'から'practicing'に遷移した場合のみ問題を生成
  useEffect(() => {
    const isPracticingTransition =
      prevGameStateRef.current !== 'practicing' && gameState === 'practicing';

    if (isPracticingTransition && currentQuestion === null) {
      // 最新のストア状態から直接generateQuestion関数を取得して呼び出す
      useGameStore.getState().generateQuestion();
    }

    // 次回のために現在の状態を保存
    prevGameStateRef.current = gameState;
  }, [gameState, currentQuestion]);
};
