/**
 * ゲーム状態
 *
 * アプリケーションの現在の状態を表します。
 */
export type GameState =
  | 'setup' // 設定画面
  | 'practicing' // 練習中
  | 'results' // 結果表示
  | 'debug'; // デバッグ画面
