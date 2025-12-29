/**
 * Step4Confirm のテスト
 * ウィザードステップ4: 確認画面
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Step4Confirm } from './Step4Confirm';

describe('Step4Confirm', () => {
  test('ステップタイトル"ステップ 4/4"が表示される', () => {
    render(<Step4Confirm />);
    expect(screen.getByText('ステップ 4/4')).toBeInTheDocument();
  });

  test('ステップ説明文"設定内容を確認してください"が表示される', () => {
    render(<Step4Confirm />);
    expect(screen.getByText('設定内容を確認してください')).toBeInTheDocument();
  });

  test('設定サマリーのタイトル"現在の設定"が表示される', () => {
    render(<Step4Confirm />);
    expect(screen.getByText('現在の設定')).toBeInTheDocument();
  });

  test('プリセット設定項目が表示される', () => {
    render(<Step4Confirm />);
    expect(screen.getByText('プリセット:')).toBeInTheDocument();
  });

  test('セッション設定項目が表示される', () => {
    render(<Step4Confirm />);
    expect(screen.getByText('セッション:')).toBeInTheDocument();
  });

  test('難易度設定項目が表示される', () => {
    render(<Step4Confirm />);
    expect(screen.getByText('難易度:')).toBeInTheDocument();
  });

  test('DetailedSettingsコンポーネントが表示される', () => {
    render(<Step4Confirm />);
    // DetailedSettingsの折りたたみボタンが表示されることを確認（▼が含まれる）
    expect(screen.getByText(/詳細設定/)).toBeInTheDocument();
  });

  test('setup-wizard__stepクラスを持つ要素が存在する', () => {
    const { container } = render(<Step4Confirm />);
    const stepElement = container.querySelector('.setup-wizard__step');
    expect(stepElement).toBeInTheDocument();
  });

  test('setup-wizard__step-headerクラスを持つ要素が存在する', () => {
    const { container } = render(<Step4Confirm />);
    const headerElement = container.querySelector('.setup-wizard__step-header');
    expect(headerElement).toBeInTheDocument();
  });

  test('setup-wizard__step-contentクラスを持つ要素が存在する', () => {
    const { container } = render(<Step4Confirm />);
    const contentElement = container.querySelector('.setup-wizard__step-content');
    expect(contentElement).toBeInTheDocument();
  });

  test('ステップタイトルがh2要素として表示される', () => {
    render(<Step4Confirm />);
    const title = screen.getByRole('heading', { level: 2, name: 'ステップ 4/4' });
    expect(title).toBeInTheDocument();
  });

  test('settings-panel__summaryクラスを持つ要素が存在する', () => {
    const { container } = render(<Step4Confirm />);
    const summaryElement = container.querySelector('.settings-panel__summary');
    expect(summaryElement).toBeInTheDocument();
  });
});
