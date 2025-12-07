/**
 * localStorageから練習設定を削除します
 *
 * @remarks
 * - 設定が存在しない場合もエラーにはなりません
 * - localStorage操作のエラーは呼び出し元に伝播します
 */

import { STORAGE_KEY } from '../constants/index.js';

export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}
