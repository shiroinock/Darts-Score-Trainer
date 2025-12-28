/**
 * NumPadコンポーネントのテスト
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NumPad } from './NumPad';

describe('NumPad', () => {
  describe('基本レンダリング', () => {
    it('初期状態で0が表示される', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const displayValue = screen
        .getAllByText('0')
        .find((el) => el.className === 'num-pad__input-value');
      expect(displayValue).toBeInTheDocument();
    });

    it('questionType="score"の場合、ラベルが"点"になる', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      expect(screen.getByText('点')).toBeInTheDocument();
    });

    it('questionType="remaining"の場合、ラベルが"残り"になる', () => {
      render(<NumPad questionType="remaining" onConfirm={vi.fn()} />);
      expect(screen.getByText('残り')).toBeInTheDocument();
    });

    it('questionType="both"の場合、ラベルが"点/残り"になる', () => {
      render(<NumPad questionType="both" onConfirm={vi.fn()} />);
      expect(screen.getByText('点/残り')).toBeInTheDocument();
    });

    it('すべての数字ボタン（0-9）が表示される', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
    });

    it('クリアボタン（C）が表示される', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('バックスペースボタン（⌫）が表示される', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Backspace' })).toBeInTheDocument();
    });

    it('確定ボタンが表示される', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('数字入力', () => {
    it('数字ボタンをクリックすると入力値が更新される', () => {
      const { container } = render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const button1 = screen.getByRole('button', { name: '1' });
      const button2 = screen.getByRole('button', { name: '2' });
      const button3 = screen.getByRole('button', { name: '3' });

      fireEvent.click(button1);
      const display1 = container.querySelector('.num-pad__input-value');
      expect(display1?.textContent).toBe('1');

      fireEvent.click(button2);
      const display2 = container.querySelector('.num-pad__input-value');
      expect(display2?.textContent).toBe('12');

      fireEvent.click(button3);
      const display3 = container.querySelector('.num-pad__input-value');
      expect(display3?.textContent).toBe('123');
    });

    it('4桁以上の入力は受け付けない', () => {
      const { container } = render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const button1 = screen.getByRole('button', { name: '1' });

      // 4回クリック
      fireEvent.click(button1);
      fireEvent.click(button1);
      fireEvent.click(button1);
      fireEvent.click(button1);

      // 3桁までしか表示されない
      const display = container.querySelector('.num-pad__input-value');
      expect(display?.textContent).toBe('111');
    });
  });

  describe('クリア機能', () => {
    it('クリアボタンをクリックすると入力値がリセットされる', () => {
      const { container } = render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const button1 = screen.getByRole('button', { name: '1' });
      const button2 = screen.getByRole('button', { name: '2' });
      const clearButton = screen.getByRole('button', { name: 'Clear' });

      fireEvent.click(button1);
      fireEvent.click(button2);
      const display1 = container.querySelector('.num-pad__input-value');
      expect(display1?.textContent).toBe('12');

      fireEvent.click(clearButton);
      const display2 = container.querySelector('.num-pad__input-value');
      expect(display2?.textContent).toBe('0');
    });
  });

  describe('バックスペース機能', () => {
    it('バックスペースボタンをクリックすると最後の1文字が削除される', () => {
      const { container } = render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const button1 = screen.getByRole('button', { name: '1' });
      const button2 = screen.getByRole('button', { name: '2' });
      const button3 = screen.getByRole('button', { name: '3' });
      const backspaceButton = screen.getByRole('button', { name: 'Backspace' });

      fireEvent.click(button1);
      fireEvent.click(button2);
      fireEvent.click(button3);
      const display1 = container.querySelector('.num-pad__input-value');
      expect(display1?.textContent).toBe('123');

      fireEvent.click(backspaceButton);
      const display2 = container.querySelector('.num-pad__input-value');
      expect(display2?.textContent).toBe('12');

      fireEvent.click(backspaceButton);
      const display3 = container.querySelector('.num-pad__input-value');
      expect(display3?.textContent).toBe('1');

      fireEvent.click(backspaceButton);
      const display4 = container.querySelector('.num-pad__input-value');
      expect(display4?.textContent).toBe('0');
    });
  });

  describe('確定機能', () => {
    it('有効な得点を入力すると確定ボタンが有効になる', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const button2 = screen.getByRole('button', { name: '2' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 初期状態では無効
      expect(confirmButton).toBeDisabled();

      // 20点を入力
      fireEvent.click(button2);
      fireEvent.click(button0);

      // 確定ボタンが有効になる
      expect(confirmButton).not.toBeDisabled();
    });

    it('無効な得点を入力すると確定ボタンが無効のまま', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const button1 = screen.getByRole('button', { name: '1' });
      const button6 = screen.getByRole('button', { name: '6' });
      const button3 = screen.getByRole('button', { name: '3' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 163点を入力（無効な得点：取りえない値）
      fireEvent.click(button1);
      fireEvent.click(button6);
      fireEvent.click(button3);

      // 確定ボタンは無効のまま
      expect(confirmButton).toBeDisabled();
    });

    it('確定ボタンをクリックするとonConfirmコールバックが呼ばれる', () => {
      const onConfirm = vi.fn();
      render(<NumPad questionType="score" onConfirm={onConfirm} />);
      const button2 = screen.getByRole('button', { name: '2' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 20点を入力
      fireEvent.click(button2);
      fireEvent.click(button0);

      // 確定
      fireEvent.click(confirmButton);

      // コールバックが呼ばれる
      expect(onConfirm).toHaveBeenCalledWith(20);
    });

    it('確定後に入力値がリセットされる', () => {
      const onConfirm = vi.fn();
      const { container } = render(<NumPad questionType="score" onConfirm={onConfirm} />);
      const button2 = screen.getByRole('button', { name: '2' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 20点を入力
      fireEvent.click(button2);
      fireEvent.click(button0);
      const display1 = container.querySelector('.num-pad__input-value');
      expect(display1?.textContent).toBe('20');

      // 確定
      fireEvent.click(confirmButton);

      // 入力値がリセットされる
      const display2 = container.querySelector('.num-pad__input-value');
      expect(display2?.textContent).toBe('0');
    });
  });

  describe('maxValue制約', () => {
    it('maxValueを超える値を入力すると確定ボタンが無効になる', () => {
      render(<NumPad questionType="remaining" onConfirm={vi.fn()} maxValue={100} />);
      const button1 = screen.getByRole('button', { name: '1' });
      const button0 = screen.getByRole('button', { name: '0' });
      const button5 = screen.getByRole('button', { name: '5' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 105を入力（maxValue=100を超える）
      fireEvent.click(button1);
      fireEvent.click(button0);
      fireEvent.click(button5);

      // 確定ボタンは無効のまま
      expect(confirmButton).toBeDisabled();
    });

    it('maxValue以下の値を入力すると確定ボタンが有効になる', () => {
      render(<NumPad questionType="remaining" onConfirm={vi.fn()} maxValue={100} />);
      const button1 = screen.getByRole('button', { name: '1' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 10を入力（maxValue=100以下）
      fireEvent.click(button1);
      fireEvent.click(button0);

      // 確定ボタンが有効になる
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('バリデーション', () => {
    it('questionType="score"の場合、有効な1投得点が入力可能', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const button2 = screen.getByRole('button', { name: '2' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 20点（有効な1投得点）を入力
      fireEvent.click(button2);
      fireEvent.click(button0);

      expect(confirmButton).not.toBeDisabled();
    });

    it('questionType="score"の場合、有効な3投合計得点が入力可能', () => {
      render(<NumPad questionType="score" onConfirm={vi.fn()} />);
      const button1 = screen.getByRole('button', { name: '1' });
      const button8 = screen.getByRole('button', { name: '8' });
      const button0 = screen.getByRole('button', { name: '0' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 180点（有効な3投合計得点）を入力
      fireEvent.click(button1);
      fireEvent.click(button8);
      fireEvent.click(button0);

      expect(confirmButton).not.toBeDisabled();
    });

    it('questionType="remaining"の場合、0以上の整数が入力可能', () => {
      render(<NumPad questionType="remaining" onConfirm={vi.fn()} />);
      const button5 = screen.getByRole('button', { name: '5' });
      const button0 = screen.getByRole('button', { name: '0' });
      const button1 = screen.getByRole('button', { name: '1' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 501点を入力
      fireEvent.click(button5);
      fireEvent.click(button0);
      fireEvent.click(button1);

      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('キーボード入力', () => {
    it('数字キーで入力ができる', () => {
      const { container } = render(<NumPad questionType="score" onConfirm={vi.fn()} />);

      fireEvent.keyDown(window, { key: '1' });
      const display1 = container.querySelector('.num-pad__input-value');
      expect(display1?.textContent).toBe('1');

      fireEvent.keyDown(window, { key: '2' });
      const display2 = container.querySelector('.num-pad__input-value');
      expect(display2?.textContent).toBe('12');
    });

    it('Backspaceキーで削除ができる', () => {
      const { container } = render(<NumPad questionType="score" onConfirm={vi.fn()} />);

      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: '2' });
      const display1 = container.querySelector('.num-pad__input-value');
      expect(display1?.textContent).toBe('12');

      fireEvent.keyDown(window, { key: 'Backspace' });
      const display2 = container.querySelector('.num-pad__input-value');
      expect(display2?.textContent).toBe('1');
    });

    it('Cキーでクリアができる', () => {
      const { container } = render(<NumPad questionType="score" onConfirm={vi.fn()} />);

      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: '2' });
      const display1 = container.querySelector('.num-pad__input-value');
      expect(display1?.textContent).toBe('12');

      fireEvent.keyDown(window, { key: 'c' });
      const display2 = container.querySelector('.num-pad__input-value');
      expect(display2?.textContent).toBe('0');
    });

    it('Escapeキーでクリアができる', () => {
      const { container } = render(<NumPad questionType="score" onConfirm={vi.fn()} />);

      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: '2' });
      const display1 = container.querySelector('.num-pad__input-value');
      expect(display1?.textContent).toBe('12');

      fireEvent.keyDown(window, { key: 'Escape' });
      const display2 = container.querySelector('.num-pad__input-value');
      expect(display2?.textContent).toBe('0');
    });

    it('Enterキーで確定ができる', () => {
      const onConfirm = vi.fn();
      render(<NumPad questionType="score" onConfirm={onConfirm} />);

      fireEvent.keyDown(window, { key: '2' });
      fireEvent.keyDown(window, { key: '0' });
      expect(screen.getByText('20')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Enter' });

      // コールバックが呼ばれる
      expect(onConfirm).toHaveBeenCalledWith(20);
    });

    it('無効な入力時にEnterキーを押してもonConfirmは呼ばれない', () => {
      const onConfirm = vi.fn();
      const { container } = render(<NumPad questionType="score" onConfirm={onConfirm} />);

      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: '6' });
      fireEvent.keyDown(window, { key: '3' });
      const display = container.querySelector('.num-pad__input-value');
      expect(display?.textContent).toBe('163');

      fireEvent.keyDown(window, { key: 'Enter' });

      // コールバックは呼ばれない
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
