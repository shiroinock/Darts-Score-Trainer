/**
 * NumPad - テンキー入力コンポーネント
 *
 * ダーツの得点や残り点数を入力するための数字キーパッド。
 * 3x4グリッドレイアウトで、キーボード入力にも対応。
 */

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useKeyboardInput } from '../../hooks/useKeyboardInput';
import type { QuestionType } from '../../types';
import { MAX_INPUT_DIGITS } from '../../utils/constants';
import { isValidRoundScore, isValidSingleThrowScore } from '../../utils/validation';

interface NumPadProps {
  questionType: QuestionType;
  onConfirm: (value: number) => void;
  maxValue?: number;
}

/**
 * questionTypeに応じたラベルを取得する
 */
function getInputLabel(questionType: QuestionType): string {
  switch (questionType) {
    case 'score':
      return '点';
    case 'remaining':
      return '残り';
    case 'both':
      return '点/残り';
    default:
      return '';
  }
}

/**
 * 入力値が有効かどうかを判定する
 */
function isValidInput(
  value: number,
  questionType: QuestionType,
  maxValue: number | undefined
): boolean {
  // 空入力は無効
  if (!Number.isFinite(value)) {
    return false;
  }

  // maxValue制約チェック
  if (maxValue !== undefined && value > maxValue) {
    return false;
  }

  // questionTypeに応じたバリデーション
  // 'score' の場合は1投単位または3投単位の得点として有効かチェック
  // 'remaining' の場合は残り点数として有効か（0以上の整数）
  // 'both' の場合は両方を許容
  if (questionType === 'score') {
    // 1投単位の得点 または 3投単位の得点として有効
    return isValidSingleThrowScore(value) || isValidRoundScore(value);
  }

  if (questionType === 'remaining') {
    // 残り点数は0以上の整数
    return Number.isInteger(value) && value >= 0;
  }

  // 'both' の場合は得点または残り点数として有効
  return (
    isValidSingleThrowScore(value) ||
    isValidRoundScore(value) ||
    (Number.isInteger(value) && value >= 0)
  );
}

export const NumPad: React.FC<NumPadProps> = ({ questionType, onConfirm, maxValue }) => {
  const [inputValue, setInputValue] = useState<string>('');

  /**
   * 数字ボタンのクリックハンドラ
   */
  const handleNumberClick = useCallback((digit: number) => {
    setInputValue((prev) => {
      const newValue = prev + digit.toString();
      // MAX_INPUT_DIGITS桁以上は入力させない（最大180点または最大残り点数）
      if (newValue.length > MAX_INPUT_DIGITS) {
        return prev;
      }
      return newValue;
    });
  }, []);

  /**
   * クリアボタンのクリックハンドラ
   */
  const handleClear = useCallback(() => {
    setInputValue('');
  }, []);

  /**
   * バックスペースボタンのクリックハンドラ
   */
  const handleBackspace = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  /**
   * 確定ボタンのクリックハンドラ
   */
  const handleConfirm = useCallback(() => {
    const numValue = Number(inputValue);
    if (isValidInput(numValue, questionType, maxValue)) {
      onConfirm(numValue);
      setInputValue('');
    }
  }, [inputValue, questionType, maxValue, onConfirm]);

  /**
   * キーボード入力のハンドリング（基本キー：0-9, Enter, Backspace, Escape）
   *
   * @remarks
   * enabled オプションは省略（デフォルト: true）
   * 現在のプロジェクトでは NumPad は単一インスタンスのみが想定されているため、
   * 常にキーボード入力を有効にしています。
   *
   * 将来的に複数の NumPad インスタンスが同時に存在する場合は、
   * フォーカス管理を追加して enabled オプションを動的に制御することを推奨します。
   */
  useKeyboardInput({
    onDigit: handleNumberClick,
    onEnter: handleConfirm,
    onBackspace: handleBackspace,
    onEscape: handleClear,
    // enabled: true, // デフォルト値のため省略
  });

  /**
   * 追加のキーボードショートカット（C/cキー）
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // C/cキーでクリア
      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClear]);

  // 確定ボタンの有効/無効判定
  const numValue = Number(inputValue);
  const isConfirmEnabled = inputValue !== '' && isValidInput(numValue, questionType, maxValue);

  const label = getInputLabel(questionType);

  return (
    <div className="num-pad">
      {/* 入力表示エリア */}
      <div className="num-pad__display">
        <div className="num-pad__input-value">{inputValue || '0'}</div>
        <div className="num-pad__label">{label}</div>
      </div>

      {/* 数字ボタングリッド（3x4） */}
      <div className="num-pad__grid">
        {/* 1行目: 1, 2, 3 */}
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(1)}
          aria-label="1"
        >
          1
        </button>
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(2)}
          aria-label="2"
        >
          2
        </button>
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(3)}
          aria-label="3"
        >
          3
        </button>

        {/* 2行目: 4, 5, 6 */}
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(4)}
          aria-label="4"
        >
          4
        </button>
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(5)}
          aria-label="5"
        >
          5
        </button>
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(6)}
          aria-label="6"
        >
          6
        </button>

        {/* 3行目: 7, 8, 9 */}
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(7)}
          aria-label="7"
        >
          7
        </button>
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(8)}
          aria-label="8"
        >
          8
        </button>
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(9)}
          aria-label="9"
        >
          9
        </button>

        {/* 4行目: C, 0, ⌫ */}
        <button
          type="button"
          className="num-pad__button num-pad__button--clear"
          onClick={handleClear}
          aria-label="Clear"
        >
          C
        </button>
        <button
          type="button"
          className="num-pad__button num-pad__button--number"
          onClick={() => handleNumberClick(0)}
          aria-label="0"
        >
          0
        </button>
        <button
          type="button"
          className="num-pad__button num-pad__button--backspace"
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>

      {/* 確定ボタン */}
      <button
        type="button"
        className="num-pad__confirm"
        onClick={handleConfirm}
        disabled={!isConfirmEnabled}
        aria-label="Confirm"
      >
        確定
      </button>
    </div>
  );
};
