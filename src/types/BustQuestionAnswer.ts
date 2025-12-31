/**
 * バスト判定の回答タイプ
 *
 * 3投モードで1本目・2本目の後に表示されるバスト判定の回答を表す。
 * - bust: バスト（残り点数超過、1点残し、ダブル外しフィニッシュ）
 * - safe: セーフ（続行可能）
 * - finish: フィニッシュ（ダブルで0点到達）
 */
export type BustQuestionAnswer = 'bust' | 'safe' | 'finish';
