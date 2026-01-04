/**
 * DualNumPad - 2フィールド対応テンキー入力コンポーネント
 *
 * 得点と残り点数の両方を入力するための数字キーパッド。
 * アクティブフィールドの切り替え機能を持ち、キーボード入力に対応。
 */

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useKeyboardInput } from '../../hooks/useKeyboardInput';
import { MAX_INPUT_DIGITS } from '../../utils/constants';
import { isValidRoundScore, isValidSingleThrowScore } from '../../utils/validation';
import './DualNumPad.css';

interface DualNumPadProps {
  onConfirm: (scoreValue: number, remainingValue: number) => void;
  maxScoreValue?: number;
  maxRemainingValue?: number;
}

type ActiveField = 'score' | 'remaining';

/**
 * 得点入力値が有効かどうかを判定する
 */
function isValidScoreInput(value: number, maxValue: number | undefined): boolean {
  // 空入力は無効
  if (!Number.isFinite(value)) {
    return false;
  }

  // maxValue制約チェック
  if (maxValue !== undefined && value > maxValue) {
    return false;
  }

  // 1投単位の得点 または 3投単位の得点として有効
  return isValidSingleThrowScore(value) || isValidRoundScore(value);
}

/**
 * 残り点数入力値が有効かどうかを判定する
 */
function isValidRemainingInput(value: number, maxValue: number | undefined): boolean {
  // 空入力は無効
  if (!Number.isFinite(value)) {
    return false;
  }

  // maxValue制約チェック
  if (maxValue !== undefined && value > maxValue) {
    return false;
  }

  // 残り点数は0以上の整数
  return Number.isInteger(value) && value >= 0;
}

export const DualNumPad: React.FC<DualNumPadProps> = ({
  onConfirm,
  maxScoreValue,
  maxRemainingValue,
}) => {
  const [scoreInput, setScoreInput] = useState<string>('');
  const [remainingInput, setRemainingInput] = useState<string>('');
  const [activeField, setActiveField] = useState<ActiveField>('score');

  /**
   * 数字ボタンのクリックハンドラ
   */
  const handleNumberClick = useCallback(
    (digit: number) => {
      if (activeField === 'score') {
        setScoreInput((prev) => {
          const newValue = prev + digit.toString();
          // MAX_INPUT_DIGITS桁以上は入力させない
          if (newValue.length > MAX_INPUT_DIGITS) {
            return prev;
          }
          return newValue;
        });
      } else {
        setRemainingInput((prev) => {
          const newValue = prev + digit.toString();
          // MAX_INPUT_DIGITS桁以上は入力させない
          if (newValue.length > MAX_INPUT_DIGITS) {
            return prev;
          }
          return newValue;
        });
      }
    },
    [activeField]
  );

  /**
   * クリアボタンのクリックハンドラ
   */
  const handleClear = useCallback(() => {
    if (activeField === 'score') {
      setScoreInput('');
    } else {
      setRemainingInput('');
    }
  }, [activeField]);

  /**
   * バックスペースボタンのクリックハンドラ
   */
  const handleBackspace = useCallback(() => {
    if (activeField === 'score') {
      setScoreInput((prev) => prev.slice(0, -1));
    } else {
      setRemainingInput((prev) => prev.slice(0, -1));
    }
  }, [activeField]);

  /**
   * フィールド切り替えハンドラ
   */
  const handleToggleField = useCallback(() => {
    setActiveField((prev) => (prev === 'score' ? 'remaining' : 'score'));
  }, []);

  /**
   * 確定ボタンのクリックハンドラ
   */
  const handleConfirm = useCallback(() => {
    const scoreValue = Number(scoreInput);
    const remainingValue = Number(remainingInput);

    if (
      isValidScoreInput(scoreValue, maxScoreValue) &&
      isValidRemainingInput(remainingValue, maxRemainingValue)
    ) {
      onConfirm(scoreValue, remainingValue);
      setScoreInput('');
      setRemainingInput('');
      setActiveField('score');
    }
  }, [scoreInput, remainingInput, maxScoreValue, maxRemainingValue, onConfirm]);

  /**
   * キーボード入力のハンドリング（基本キー：0-9, Enter, Backspace, Escape）
   */
  useKeyboardInput({
    onDigit: handleNumberClick,
    onEnter: handleConfirm,
    onBackspace: handleBackspace,
    onEscape: handleClear,
  });

  /**
   * 追加のキーボードショートカット（C/cキー、Tabキー）
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // C/cキーでクリア
      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        handleClear();
      }

      // Tabキーでフィールド切り替え
      if (event.key === 'Tab') {
        event.preventDefault();
        handleToggleField();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClear, handleToggleField]);

  // 確定ボタンの有効/無効判定
  const scoreValue = Number(scoreInput);
  const remainingValue = Number(remainingInput);
  const isConfirmEnabled =
    scoreInput !== '' &&
    remainingInput !== '' &&
    isValidScoreInput(scoreValue, maxScoreValue) &&
    isValidRemainingInput(remainingValue, maxRemainingValue);

  return (
    <div className="dual-num-pad">
      {/* 入力表示エリア */}
      <div className="dual-num-pad__displays">
        {/* 得点入力表示 */}
        <button
          type="button"
          className={`dual-num-pad__display ${
            activeField === 'score' ? 'dual-num-pad__display--active' : ''
          }`}
          onClick={() => setActiveField('score')}
        >
          <div className="dual-num-pad__input-value">{scoreInput || '0'}</div>
          <div className="dual-num-pad__label">点</div>
        </button>

        {/* 残り点数入力表示 */}
        <button
          type="button"
          className={`dual-num-pad__display ${
            activeField === 'remaining' ? 'dual-num-pad__display--active' : ''
          }`}
          onClick={() => setActiveField('remaining')}
        >
          <div className="dual-num-pad__input-value">{remainingInput || '0'}</div>
          <div className="dual-num-pad__label">残り</div>
        </button>
      </div>

      {/* 数字ボタングリッド（3x4） */}
      <div className="dual-num-pad__grid">
        {/* 1行目: 1, 2, 3 */}
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(1)}
          aria-label="1"
        >
          1
        </button>
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(2)}
          aria-label="2"
        >
          2
        </button>
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(3)}
          aria-label="3"
        >
          3
        </button>

        {/* 2行目: 4, 5, 6 */}
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(4)}
          aria-label="4"
        >
          4
        </button>
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(5)}
          aria-label="5"
        >
          5
        </button>
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(6)}
          aria-label="6"
        >
          6
        </button>

        {/* 3行目: 7, 8, 9 */}
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(7)}
          aria-label="7"
        >
          7
        </button>
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(8)}
          aria-label="8"
        >
          8
        </button>
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(9)}
          aria-label="9"
        >
          9
        </button>

        {/* 4行目: C, 0, ⌫ */}
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--clear"
          onClick={handleClear}
          aria-label="Clear"
        >
          C
        </button>
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--number"
          onClick={() => handleNumberClick(0)}
          aria-label="0"
        >
          0
        </button>
        <button
          type="button"
          className="dual-num-pad__button dual-num-pad__button--backspace"
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>

      {/* 確定ボタン */}
      <button
        type="button"
        className="dual-num-pad__confirm"
        onClick={handleConfirm}
        disabled={!isConfirmEnabled}
        aria-label="Confirm"
      >
        確定
      </button>
    </div>
  );
};
