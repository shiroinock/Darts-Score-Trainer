import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});

// p5.js のモック（描画テストで使用）
// @ts-expect-error - グローバル変数の定義
global.p5 = vi.fn();
