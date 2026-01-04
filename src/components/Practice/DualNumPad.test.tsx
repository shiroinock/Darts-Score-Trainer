/**
 * DualNumPadコンポーネントのテスト
 *
 * test-writer.md セクション4（component パターン）に従い、以下の順序でテストを実施：
 * 1. セマンティックテスト（ユーザー視点の振る舞い検証）
 * 2. スナップショットテスト（構造・見た目の検証）
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DualNumPad } from './DualNumPad';

describe('DualNumPad', () => {
  // =============================================================
  // セマンティックテスト: ユーザー視点の振る舞い検証
  // =============================================================

  describe('基本レンダリング', () => {
    it('2つの入力フィールドが表示される', () => {
      render(<DualNumPad onConfirm={vi.fn()} />);

      // 得点フィールド
      const scoreDisplay = screen.getAllByText('0')[0];
      expect(scoreDisplay).toBeInTheDocument();
      expect(screen.getByText('点')).toBeInTheDocument();

      // 残り点数フィールド
      const remainingDisplay = screen.getAllByText('0')[1];
      expect(remainingDisplay).toBeInTheDocument();
      expect(screen.getByText('残り')).toBeInTheDocument();
    });

    it('初期状態で得点フィールドがアクティブである', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      expect(displays[0]).toHaveClass('dual-num-pad__display--active'); // 得点
      expect(displays[1]).not.toHaveClass('dual-num-pad__display--active'); // 残り
    });

    it('すべての数字ボタン（0-9）が表示される', () => {
      render(<DualNumPad onConfirm={vi.fn()} />);
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
    });

    it('クリアボタン（C）が表示される', () => {
      render(<DualNumPad onConfirm={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('バックスペースボタン（⌫）が表示される', () => {
      render(<DualNumPad onConfirm={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Backspace' })).toBeInTheDocument();
    });

    it('確定ボタンが表示される', () => {
      render(<DualNumPad onConfirm={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('アクティブフィールドの切り替え（クリック）', () => {
    it('残り点数フィールドをクリックするとアクティブになる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const remainingDisplay = displays[1]; // 残り点数

      // 初期状態: 得点がアクティブ
      expect(displays[0]).toHaveClass('dual-num-pad__display--active');
      expect(displays[1]).not.toHaveClass('dual-num-pad__display--active');

      // 残り点数をクリック
      fireEvent.click(remainingDisplay);

      // 残り点数がアクティブになる
      expect(displays[0]).not.toHaveClass('dual-num-pad__display--active');
      expect(displays[1]).toHaveClass('dual-num-pad__display--active');
    });

    it('得点フィールドをクリックするとアクティブになる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreDisplay = displays[0]; // 得点
      const remainingDisplay = displays[1]; // 残り点数

      // まず残り点数をアクティブにする
      fireEvent.click(remainingDisplay);
      expect(displays[1]).toHaveClass('dual-num-pad__display--active');

      // 得点をクリック
      fireEvent.click(scoreDisplay);

      // 得点がアクティブになる
      expect(displays[0]).toHaveClass('dual-num-pad__display--active');
      expect(displays[1]).not.toHaveClass('dual-num-pad__display--active');
    });
  });

  describe('アクティブフィールドの切り替え（Tabキー）', () => {
    it('Tabキーで得点→残りに切り替わる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 初期状態: 得点がアクティブ
      expect(displays[0]).toHaveClass('dual-num-pad__display--active');
      expect(displays[1]).not.toHaveClass('dual-num-pad__display--active');

      // Tabキーを押す
      fireEvent.keyDown(window, { key: 'Tab' });

      // 残り点数がアクティブになる
      expect(displays[0]).not.toHaveClass('dual-num-pad__display--active');
      expect(displays[1]).toHaveClass('dual-num-pad__display--active');
    });

    it('Tabキーで残り→得点に切り替わる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // まず残り点数をアクティブにする
      fireEvent.keyDown(window, { key: 'Tab' });
      expect(displays[1]).toHaveClass('dual-num-pad__display--active');

      // もう一度Tabキーを押す
      fireEvent.keyDown(window, { key: 'Tab' });

      // 得点がアクティブになる
      expect(displays[0]).toHaveClass('dual-num-pad__display--active');
      expect(displays[1]).not.toHaveClass('dual-num-pad__display--active');
    });
  });

  describe('数字入力（アクティブフィールドに入力される）', () => {
    it('得点フィールドがアクティブな状態で数字を入力すると、得点フィールドに反映される', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');
      const remainingInputValue = displays[1].querySelector('.dual-num-pad__input-value');

      // 数字ボタンをクリック
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 得点フィールドに入力される
      expect(scoreInputValue?.textContent).toBe('60');
      // 残り点数フィールドは変化しない
      expect(remainingInputValue?.textContent).toBe('0');
    });

    it('残り点数フィールドがアクティブな状態で数字を入力すると、残り点数フィールドに反映される', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');
      const remainingInputValue = displays[1].querySelector('.dual-num-pad__input-value');

      // 残り点数フィールドをアクティブにする
      fireEvent.click(displays[1]);

      // 数字ボタンをクリック
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 残り点数フィールドに入力される
      expect(remainingInputValue?.textContent).toBe('441');
      // 得点フィールドは変化しない
      expect(scoreInputValue?.textContent).toBe('0');
    });

    it('4桁以上の入力は受け付けない（得点フィールド）', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');
      const button1 = screen.getByRole('button', { name: '1' });

      // 4回クリック
      fireEvent.click(button1);
      fireEvent.click(button1);
      fireEvent.click(button1);
      fireEvent.click(button1);

      // 3桁までしか表示されない
      expect(scoreInputValue?.textContent).toBe('111');
    });

    it('4桁以上の入力は受け付けない（残り点数フィールド）', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const remainingInputValue = displays[1].querySelector('.dual-num-pad__input-value');

      // 残り点数フィールドをアクティブにする
      fireEvent.click(displays[1]);

      const button2 = screen.getByRole('button', { name: '2' });

      // 4回クリック
      fireEvent.click(button2);
      fireEvent.click(button2);
      fireEvent.click(button2);
      fireEvent.click(button2);

      // 3桁までしか表示されない
      expect(remainingInputValue?.textContent).toBe('222');
    });
  });

  describe('クリア機能', () => {
    it('得点フィールドがアクティブな状態でクリアボタンを押すと、得点フィールドのみがリセットされる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');
      const remainingInputValue = displays[1].querySelector('.dual-num-pad__input-value');

      // 得点に入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      expect(scoreInputValue?.textContent).toBe('60');

      // 残り点数に入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      expect(remainingInputValue?.textContent).toBe('401');

      // 得点をアクティブに戻してクリア
      fireEvent.click(displays[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

      // 得点のみがリセットされる
      expect(scoreInputValue?.textContent).toBe('0');
      // 残り点数は変化しない
      expect(remainingInputValue?.textContent).toBe('401');
    });

    it('残り点数フィールドがアクティブな状態でクリアボタンを押すと、残り点数フィールドのみがリセットされる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');
      const remainingInputValue = displays[1].querySelector('.dual-num-pad__input-value');

      // 得点に入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      expect(scoreInputValue?.textContent).toBe('60');

      // 残り点数に入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      expect(remainingInputValue?.textContent).toBe('401');

      // 残り点数フィールドでクリア
      fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

      // 残り点数のみがリセットされる
      expect(remainingInputValue?.textContent).toBe('0');
      // 得点は変化しない
      expect(scoreInputValue?.textContent).toBe('60');
    });

    it('C/cキーでアクティブフィールドがクリアされる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');

      // 得点に入力
      fireEvent.keyDown(window, { key: '6' });
      fireEvent.keyDown(window, { key: '0' });
      expect(scoreInputValue?.textContent).toBe('60');

      // Cキーでクリア
      fireEvent.keyDown(window, { key: 'c' });
      expect(scoreInputValue?.textContent).toBe('0');
    });

    it('Escapeキーでアクティブフィールドがクリアされる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const remainingInputValue = displays[1].querySelector('.dual-num-pad__input-value');

      // 残り点数をアクティブにして入力
      fireEvent.click(displays[1]);
      fireEvent.keyDown(window, { key: '5' });
      fireEvent.keyDown(window, { key: '0' });
      fireEvent.keyDown(window, { key: '1' });
      expect(remainingInputValue?.textContent).toBe('501');

      // Escapeキーでクリア
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(remainingInputValue?.textContent).toBe('0');
    });
  });

  describe('バックスペース機能', () => {
    it('バックスペースボタンでアクティブフィールドの最後の1文字が削除される', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');

      // 得点に入力
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      expect(scoreInputValue?.textContent).toBe('123');

      // バックスペース
      fireEvent.click(screen.getByRole('button', { name: 'Backspace' }));
      expect(scoreInputValue?.textContent).toBe('12');

      fireEvent.click(screen.getByRole('button', { name: 'Backspace' }));
      expect(scoreInputValue?.textContent).toBe('1');

      fireEvent.click(screen.getByRole('button', { name: 'Backspace' }));
      expect(scoreInputValue?.textContent).toBe('0');
    });

    it('Backspaceキーでアクティブフィールドの最後の1文字が削除される', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const remainingInputValue = displays[1].querySelector('.dual-num-pad__input-value');

      // 残り点数をアクティブにして入力
      fireEvent.click(displays[1]);
      fireEvent.keyDown(window, { key: '5' });
      fireEvent.keyDown(window, { key: '0' });
      fireEvent.keyDown(window, { key: '1' });
      expect(remainingInputValue?.textContent).toBe('501');

      // Backspaceキーで削除
      fireEvent.keyDown(window, { key: 'Backspace' });
      expect(remainingInputValue?.textContent).toBe('50');
    });
  });

  describe('確定ボタンの有効/無効状態', () => {
    it('初期状態では確定ボタンが無効である', () => {
      render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toBeDisabled();
    });

    it('得点フィールドのみ入力された場合、確定ボタンが無効である', () => {
      render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 確定ボタンは無効のまま
      expect(confirmButton).toBeDisabled();
    });

    it('残り点数フィールドのみ入力された場合、確定ボタンが無効である', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 残り点数をアクティブにして入力
      fireEvent.click(displays[1]);
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 確定ボタンは無効のまま
      expect(confirmButton).toBeDisabled();
    });

    it('両方のフィールドに有効な値が入力された場合、確定ボタンが有効になる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に441点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 確定ボタンが有効になる
      expect(confirmButton).not.toBeDisabled();
    });

    it('得点フィールドに無効な値が入力された場合、確定ボタンが無効である', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に163点を入力（無効な得点：取りえない値）
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));

      // 残り点数に441点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 確定ボタンは無効のまま
      expect(confirmButton).toBeDisabled();
    });

    it('残り点数フィールドに無効な値が入力された場合でも確定ボタンは有効である（残り点数は0以上の整数であればOK）', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に999点を入力（0以上の整数として有効）
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '9' }));
      fireEvent.click(screen.getByRole('button', { name: '9' }));
      fireEvent.click(screen.getByRole('button', { name: '9' }));

      // 確定ボタンは有効
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('maxValue制約', () => {
    it('maxScoreValueを超える得点を入力すると確定ボタンが無効になる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} maxScoreValue={100} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に105点を入力（maxScoreValue=100を超える）
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      fireEvent.click(screen.getByRole('button', { name: '5' }));

      // 残り点数に100点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 確定ボタンは無効のまま
      expect(confirmButton).toBeDisabled();
    });

    it('maxRemainingValueを超える残り点数を入力すると確定ボタンが無効になる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} maxRemainingValue={500} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に501点を入力（maxRemainingValue=500を超える）
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '5' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 確定ボタンは無効のまま
      expect(confirmButton).toBeDisabled();
    });

    it('両方のmaxValueを満たす場合、確定ボタンが有効になる', () => {
      const { container } = render(
        <DualNumPad onConfirm={vi.fn()} maxScoreValue={100} maxRemainingValue={500} />
      );
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に441点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 確定ボタンが有効になる
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('確定機能', () => {
    it('確定ボタンをクリックするとonConfirmコールバックが呼ばれる', () => {
      const onConfirm = vi.fn();
      const { container } = render(<DualNumPad onConfirm={onConfirm} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に441点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 確定
      fireEvent.click(confirmButton);

      // コールバックが呼ばれる
      expect(onConfirm).toHaveBeenCalledWith(60, 441);
    });

    it('Enterキーで確定できる', () => {
      const onConfirm = vi.fn();
      render(<DualNumPad onConfirm={onConfirm} />);

      // 得点に60点を入力
      fireEvent.keyDown(window, { key: '6' });
      fireEvent.keyDown(window, { key: '0' });

      // Tabキーで残り点数フィールドに切り替え
      fireEvent.keyDown(window, { key: 'Tab' });

      // 残り点数に441点を入力
      fireEvent.keyDown(window, { key: '4' });
      fireEvent.keyDown(window, { key: '4' });
      fireEvent.keyDown(window, { key: '1' });

      // Enterキーで確定
      fireEvent.keyDown(window, { key: 'Enter' });

      // コールバックが呼ばれる
      expect(onConfirm).toHaveBeenCalledWith(60, 441);
    });

    it('確定後に両方のフィールドがリセットされる', () => {
      const onConfirm = vi.fn();
      const { container } = render(<DualNumPad onConfirm={onConfirm} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');
      const remainingInputValue = displays[1].querySelector('.dual-num-pad__input-value');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に441点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 確定
      fireEvent.click(confirmButton);

      // 両方のフィールドがリセットされる
      expect(scoreInputValue?.textContent).toBe('0');
      expect(remainingInputValue?.textContent).toBe('0');
    });

    it('確定後にアクティブフィールドが得点に戻る', () => {
      const onConfirm = vi.fn();
      const { container } = render(<DualNumPad onConfirm={onConfirm} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に441点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      // 確認: 残り点数がアクティブ
      expect(displays[1]).toHaveClass('dual-num-pad__display--active');

      // 確定
      fireEvent.click(confirmButton);

      // アクティブフィールドが得点に戻る
      expect(displays[0]).toHaveClass('dual-num-pad__display--active');
      expect(displays[1]).not.toHaveClass('dual-num-pad__display--active');
    });

    it('無効な入力時にEnterキーを押してもonConfirmは呼ばれない', () => {
      const onConfirm = vi.fn();
      render(<DualNumPad onConfirm={onConfirm} />);

      // 得点に163点を入力（無効な得点）
      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: '6' });
      fireEvent.keyDown(window, { key: '3' });

      // Tabキーで残り点数フィールドに切り替え
      fireEvent.keyDown(window, { key: 'Tab' });

      // 残り点数に441点を入力
      fireEvent.keyDown(window, { key: '4' });
      fireEvent.keyDown(window, { key: '4' });
      fireEvent.keyDown(window, { key: '1' });

      // Enterキーを押す
      fireEvent.keyDown(window, { key: 'Enter' });

      // コールバックは呼ばれない
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('バリデーション（得点フィールド）', () => {
    it('有効な1投得点が入力可能', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に20点（有効な1投得点）を入力
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に100点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      expect(confirmButton).not.toBeDisabled();
    });

    it('有効な3投合計得点が入力可能', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に180点（有効な3投合計得点）を入力
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '8' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に321点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      expect(confirmButton).not.toBeDisabled();
    });

    it('無効な得点（取りえない値）は確定できない', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に163点を入力（無効な得点：取りえない値）
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));

      // 残り点数に100点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      expect(confirmButton).toBeDisabled();
    });
  });

  describe('バリデーション（残り点数フィールド）', () => {
    it('0以上の整数が入力可能', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に501点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '5' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      expect(confirmButton).not.toBeDisabled();
    });

    it('残り点数に0点を入力可能', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に0点を入力
      fireEvent.click(displays[1]); // 残りをアクティブ
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('キーボード入力（数字キー）', () => {
    it('数字キーでアクティブフィールドに入力できる', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');
      const scoreInputValue = displays[0].querySelector('.dual-num-pad__input-value');

      fireEvent.keyDown(window, { key: '1' });
      expect(scoreInputValue?.textContent).toBe('1');

      fireEvent.keyDown(window, { key: '2' });
      expect(scoreInputValue?.textContent).toBe('12');

      fireEvent.keyDown(window, { key: '0' });
      expect(scoreInputValue?.textContent).toBe('120');
    });
  });

  // =============================================================
  // スナップショットテスト: 構造・見た目の検証
  // =============================================================

  describe('スナップショットテスト', () => {
    it('デフォルト状態の描画結果が一致する', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);
      expect(container).toMatchSnapshot();
    });

    it('得点フィールドがアクティブで入力値がある状態の描画結果が一致する', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      expect(container).toMatchSnapshot();
    });

    it('残り点数フィールドがアクティブで入力値がある状態の描画結果が一致する', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 残り点数をアクティブにして入力
      fireEvent.click(displays[1]);
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      expect(container).toMatchSnapshot();
    });

    it('両方のフィールドに入力値があり、確定ボタンが有効な状態の描画結果が一致する', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に60点を入力
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '0' }));

      // 残り点数に441点を入力
      fireEvent.click(displays[1]);
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      expect(container).toMatchSnapshot();
    });

    it('maxValue制約が設定された状態の描画結果が一致する', () => {
      const { container } = render(
        <DualNumPad onConfirm={vi.fn()} maxScoreValue={100} maxRemainingValue={500} />
      );
      expect(container).toMatchSnapshot();
    });

    it('得点フィールドに無効な値が入力され、確定ボタンが無効な状態の描画結果が一致する', () => {
      const { container } = render(<DualNumPad onConfirm={vi.fn()} />);

      const displays = container.querySelectorAll('.dual-num-pad__display');

      // 得点に163点を入力（無効な得点）
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '6' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));

      // 残り点数に441点を入力
      fireEvent.click(displays[1]);
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      fireEvent.click(screen.getByRole('button', { name: '1' }));

      expect(container).toMatchSnapshot();
    });
  });
});
