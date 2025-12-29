/**
 * Step2Difficulty のテスト
 * ウィザードステップ2: 難易度選択画面
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Step2Difficulty } from './Step2Difficulty';

describe('Step2Difficulty', () => {
  test('ステップタイトル"ステップ 2/4"が表示される', () => {
    render(<Step2Difficulty />);
    expect(screen.getByText('ステップ 2/4')).toBeInTheDocument();
  });

  test('ステップ説明文"難易度を選択してください"が表示される', () => {
    render(<Step2Difficulty />);
    expect(screen.getByText('難易度を選択してください')).toBeInTheDocument();
  });

  test('DifficultySelectorコンポーネントが表示される', () => {
    render(<Step2Difficulty />);
    // DifficultySelectorに含まれる難易度ラベルが表示されることを確認
    expect(screen.getByText('初心者')).toBeInTheDocument();
  });

  test('setup-wizard__stepクラスを持つ要素が存在する', () => {
    const { container } = render(<Step2Difficulty />);
    const stepElement = container.querySelector('.setup-wizard__step');
    expect(stepElement).toBeInTheDocument();
  });

  test('setup-wizard__step-headerクラスを持つ要素が存在する', () => {
    const { container } = render(<Step2Difficulty />);
    const headerElement = container.querySelector('.setup-wizard__step-header');
    expect(headerElement).toBeInTheDocument();
  });

  test('setup-wizard__step-contentクラスを持つ要素が存在する', () => {
    const { container } = render(<Step2Difficulty />);
    const contentElement = container.querySelector('.setup-wizard__step-content');
    expect(contentElement).toBeInTheDocument();
  });

  test('ステップタイトルがh2要素として表示される', () => {
    render(<Step2Difficulty />);
    const title = screen.getByRole('heading', { level: 2, name: 'ステップ 2/4' });
    expect(title).toBeInTheDocument();
  });

  test('全ての難易度プリセット（4つ）のボタンが表示される', () => {
    render(<Step2Difficulty />);
    // DifficultySelectorは4つの難易度ボタンを持つ
    expect(screen.getByText('初心者')).toBeInTheDocument();
    expect(screen.getByText('中級者')).toBeInTheDocument();
    expect(screen.getByText('上級者')).toBeInTheDocument();
    expect(screen.getByText('エキスパート')).toBeInTheDocument();
  });
});
