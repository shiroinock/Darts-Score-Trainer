import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: true,
    testTimeout: 12000, // 厳しめのタイムアウト設定（flaky test対策）
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test-setup.ts', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    },
    // retry: 0 (デフォルト) - 失敗を隠蔽しない
    // maxConcurrency: 未指定 - Vitestが環境に応じて自動決定
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
