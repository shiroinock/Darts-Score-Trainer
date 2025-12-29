/**
 * Step1Preset のテスト
 * ウィザードステップ1: プリセット選択画面
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Step1Preset } from './Step1Preset';

describe('Step1Preset', () => {
  test('ステップタイトル"ステップ 1/4"が表示される', () => {
    render(<Step1Preset />);
    expect(screen.getByText('ステップ 1/4')).toBeInTheDocument();
  });

  test('ステップ説明文"練習モードを選択してください"が表示される', () => {
    render(<Step1Preset />);
    expect(screen.getByText('練習モードを選択してください')).toBeInTheDocument();
  });

  test('PresetSelectorコンポーネントが表示される', () => {
    render(<Step1Preset />);
    // PresetSelectorに含まれるプリセット名が表示されることを確認
    expect(screen.getByText('基礎練習')).toBeInTheDocument();
  });

  test('setup-wizard__stepクラスを持つ要素が存在する', () => {
    const { container } = render(<Step1Preset />);
    const stepElement = container.querySelector('.setup-wizard__step');
    expect(stepElement).toBeInTheDocument();
  });

  test('setup-wizard__step-headerクラスを持つ要素が存在する', () => {
    const { container } = render(<Step1Preset />);
    const headerElement = container.querySelector('.setup-wizard__step-header');
    expect(headerElement).toBeInTheDocument();
  });

  test('setup-wizard__step-contentクラスを持つ要素が存在する', () => {
    const { container } = render(<Step1Preset />);
    const contentElement = container.querySelector('.setup-wizard__step-content');
    expect(contentElement).toBeInTheDocument();
  });

  test('ステップタイトルがh2要素として表示される', () => {
    render(<Step1Preset />);
    const title = screen.getByRole('heading', { level: 2, name: 'ステップ 1/4' });
    expect(title).toBeInTheDocument();
  });

  test('全てのプリセット（5つ）のボタンが表示される', () => {
    render(<Step1Preset />);
    // PresetSelectorは5つのプリセットボタンを持つ
    const presetButtons = screen.getAllByRole('button');
    expect(presetButtons.length).toBeGreaterThanOrEqual(5);
  });
});
