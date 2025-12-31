/**
 * EndReason - セッション終了理由の型定義
 *
 * 練習セッションが終了する際の理由を表す文字列リテラル型。
 * 型安全性のために定義されています。
 */

/**
 * セッション終了理由
 *
 * - 'finish': ダブルでフィニッシュした（ゲームクリア）
 * - '時間切れ': タイムモードで制限時間に達した
 * - 'ユーザーによる終了': ユーザーが終了ボタンを押した
 */
export type EndReason = 'finish' | '時間切れ' | 'ユーザーによる終了' | (string & {});

/**
 * 終了理由の定数
 *
 * 使用例:
 * ```typescript
 * endSession(END_REASONS.FINISH);
 * endSession(END_REASONS.TIMEOUT);
 * ```
 */
export const END_REASONS = {
  /** ダブルでフィニッシュした（ゲームクリア） */
  FINISH: 'finish',
  /** タイムモードで制限時間に達した */
  TIMEOUT: '時間切れ',
  /** ユーザーが終了ボタンを押した */
  USER_ABORT: 'ユーザーによる終了',
} as const;
