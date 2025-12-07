/**
 * セッション設定
 *
 * 練習セッションの実行条件（問題数 or 時間制限）を指定します。
 */
export interface SessionConfig {
  /** セッションモード */
  mode: 'questions' | 'time';
  /** 問題数（questionsモードの場合） */
  questionCount?: 10 | 20 | 50 | 100;
  /** 時間制限（分、timeモードの場合） */
  timeLimit?: 3 | 5 | 10;
}
