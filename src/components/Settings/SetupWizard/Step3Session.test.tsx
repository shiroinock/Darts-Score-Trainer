/**
 * Step3Session のテスト
 * ウィザードステップ3: セッション設定画面
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Step3Session } from './Step3Session';

describe('Step3Session', () => {
  test('ステップタイトル"ステップ 3/4"が表示される', () => {
    render(<Step3Session />);
    expect(screen.getByText('ステップ 3/4')).toBeInTheDocument();
  });

  test('ステップ説明文"セッション設定を選択してください"が表示される', () => {
    render(<Step3Session />);
    expect(screen.getByText('セッション設定を選択してください')).toBeInTheDocument();
  });

  test('SessionConfigSelectorコンポーネントが表示される', () => {
    render(<Step3Session />);
    // SessionConfigSelectorのタイトルが表示されることを確認
    expect(screen.getByText('セッション設定')).toBeInTheDocument();
    expect(screen.getByText('モード')).toBeInTheDocument();
  });

  test('setup-wizard__stepクラスを持つ要素が存在する', () => {
    const { container } = render(<Step3Session />);
    const stepElement = container.querySelector('.setup-wizard__step');
    expect(stepElement).toBeInTheDocument();
  });

  test('setup-wizard__step-headerクラスを持つ要素が存在する', () => {
    const { container } = render(<Step3Session />);
    const headerElement = container.querySelector('.setup-wizard__step-header');
    expect(headerElement).toBeInTheDocument();
  });

  test('setup-wizard__step-contentクラスを持つ要素が存在する', () => {
    const { container } = render(<Step3Session />);
    const contentElement = container.querySelector('.setup-wizard__step-content');
    expect(contentElement).toBeInTheDocument();
  });

  test('ステップタイトルがh2要素として表示される', () => {
    render(<Step3Session />);
    const title = screen.getByRole('heading', { level: 2, name: 'ステップ 3/4' });
    expect(title).toBeInTheDocument();
  });

  test('問題数と時間制限の切り替えボタンが表示される', () => {
    render(<Step3Session />);
    // aria-pressedでモードボタンを識別
    const buttons = screen.getAllByRole('button');
    const modeButtons = buttons.filter((btn) => btn.getAttribute('aria-pressed') !== null);

    expect(modeButtons.length).toBeGreaterThanOrEqual(2);
  });
});
