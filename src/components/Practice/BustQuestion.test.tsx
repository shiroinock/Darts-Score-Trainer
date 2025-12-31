/**
 * BustQuestionコンポーネントのテスト
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BustQuestion } from './BustQuestion';

describe('BustQuestion', () => {
  describe('初期表示', () => {
    it('質問テキスト「この投擲はバストですか?」が表示される', () => {
      render(<BustQuestion correctAnswer={true} onAnswer={vi.fn()} />);

      expect(screen.getByText('この投擲はバストですか?')).toBeInTheDocument();
    });

    it('「バスト」ボタンが表示される', () => {
      render(<BustQuestion correctAnswer={true} onAnswer={vi.fn()} />);

      expect(screen.getByRole('button', { name: /バスト/i })).toBeInTheDocument();
    });

    it('「セーフ」ボタンが表示される', () => {
      render(<BustQuestion correctAnswer={false} onAnswer={vi.fn()} />);

      expect(screen.getByRole('button', { name: /セーフ/i })).toBeInTheDocument();
    });

    it('「バスト」ボタンにショートカット表記「(B)」が表示される', () => {
      render(<BustQuestion correctAnswer={true} onAnswer={vi.fn()} />);

      expect(screen.getByText('(B)')).toBeInTheDocument();
    });

    it('「セーフ」ボタンにショートカット表記「(S)」が表示される', () => {
      render(<BustQuestion correctAnswer={false} onAnswer={vi.fn()} />);

      expect(screen.getByText('(S)')).toBeInTheDocument();
    });
  });

  describe('ボタンクリック動作', () => {
    it('「バスト」ボタンをクリックするとonAnswer(true)が呼ばれる', () => {
      const onAnswer = vi.fn();
      render(<BustQuestion correctAnswer={true} onAnswer={onAnswer} />);

      const bustButton = screen.getByRole('button', { name: /バスト/i });
      fireEvent.click(bustButton);

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(true);
    });

    it('「セーフ」ボタンをクリックするとonAnswer(false)が呼ばれる', () => {
      const onAnswer = vi.fn();
      render(<BustQuestion correctAnswer={false} onAnswer={onAnswer} />);

      const safeButton = screen.getByRole('button', { name: /セーフ/i });
      fireEvent.click(safeButton);

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(false);
    });
  });

  describe('キーボード操作', () => {
    it('Bキーで「バスト」回答が送信される', () => {
      const onAnswer = vi.fn();
      render(<BustQuestion correctAnswer={true} onAnswer={onAnswer} />);

      fireEvent.keyDown(window, { key: 'b' });

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(true);
    });

    it('大文字Bキーでも「バスト」回答が送信される', () => {
      const onAnswer = vi.fn();
      render(<BustQuestion correctAnswer={true} onAnswer={onAnswer} />);

      fireEvent.keyDown(window, { key: 'B' });

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(true);
    });

    it('Sキーで「セーフ」回答が送信される', () => {
      const onAnswer = vi.fn();
      render(<BustQuestion correctAnswer={false} onAnswer={onAnswer} />);

      fireEvent.keyDown(window, { key: 's' });

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(false);
    });

    it('大文字Sキーでも「セーフ」回答が送信される', () => {
      const onAnswer = vi.fn();
      render(<BustQuestion correctAnswer={false} onAnswer={onAnswer} />);

      fireEvent.keyDown(window, { key: 'S' });

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(false);
    });

    it('フィードバック表示中はキーボード入力が無効化される', () => {
      const onAnswer = vi.fn();
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={onAnswer}
          showFeedback={true}
          userAnswer={true}
        />
      );

      fireEvent.keyDown(window, { key: 'b' });
      fireEvent.keyDown(window, { key: 's' });

      expect(onAnswer).not.toHaveBeenCalled();
    });
  });

  describe('フィードバック表示（正解時）', () => {
    it('正解アイコン「✓」が表示される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('「正解」テキストが表示される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const correctTexts = screen.getAllByText('正解');
      expect(correctTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('「あなたの回答」に「バスト」が表示される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      expect(screen.getByText('あなたの回答')).toBeInTheDocument();
      // userAnswer=true → バスト
      const answers = screen.getAllByText('バスト');
      expect(answers.length).toBeGreaterThanOrEqual(1);
    });

    it('「正解」に正解値が表示される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const correctLabels = screen.getAllByText('正解');
      expect(correctLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('質問テキストが非表示になる', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      expect(screen.queryByText('この投擲はバストですか?')).not.toBeInTheDocument();
    });
  });

  describe('フィードバック表示（不正解時）', () => {
    it('不正解アイコン「✗」が表示される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      expect(screen.getByText('✗')).toBeInTheDocument();
    });

    it('「不正解」テキストが表示される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      expect(screen.getByText('不正解')).toBeInTheDocument();
    });

    it('「あなたの回答」に誤った回答が表示される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      expect(screen.getByText('あなたの回答')).toBeInTheDocument();
      // userAnswer=false → セーフ
      const safeTexts = screen.getAllByText('セーフ');
      expect(safeTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('「正解」に正しい答えが表示される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      const correctLabels = screen.getAllByText('正解');
      expect(correctLabels.length).toBeGreaterThanOrEqual(1);
      // correctAnswer=true → バスト
      const bustTexts = screen.getAllByText('バスト');
      expect(bustTexts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ボタンの無効化', () => {
    it('showFeedback=trueの場合、「バスト」ボタンが無効化される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const bustButton = screen.getByRole('button', { name: /バスト/i });
      expect(bustButton).toBeDisabled();
    });

    it('showFeedback=trueの場合、「セーフ」ボタンが無効化される', () => {
      render(
        <BustQuestion
          correctAnswer={false}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      const safeButton = screen.getByRole('button', { name: /セーフ/i });
      expect(safeButton).toBeDisabled();
    });

    it('フィードバック表示中にボタンをクリックしてもonAnswerは呼ばれない', () => {
      const onAnswer = vi.fn();
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={onAnswer}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const bustButton = screen.getByRole('button', { name: /バスト/i });
      fireEvent.click(bustButton);

      expect(onAnswer).not.toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('section要素にaria-label="バスト判定"が設定されている', () => {
      render(<BustQuestion correctAnswer={true} onAnswer={vi.fn()} />);

      const section = screen.getByLabelText('バスト判定');
      expect(section.tagName).toBe('SECTION');
    });

    it('「バスト」ボタンにaria-label="バスト (Bキー)"が設定されている', () => {
      render(<BustQuestion correctAnswer={true} onAnswer={vi.fn()} />);

      const bustButton = screen.getByRole('button', { name: /バスト \(Bキー\)/i });
      expect(bustButton).toHaveAttribute('aria-label', 'バスト (Bキー)');
    });

    it('「セーフ」ボタンにaria-label="セーフ (Sキー)"が設定されている', () => {
      render(<BustQuestion correctAnswer={false} onAnswer={vi.fn()} />);

      const safeButton = screen.getByRole('button', { name: /セーフ \(Sキー\)/i });
      expect(safeButton).toHaveAttribute('aria-label', 'セーフ (Sキー)');
    });

    it('フィードバック表示時、選択されたボタンにaria-pressed="true"が設定される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const bustButton = screen.getByRole('button', { name: /バスト/i });
      expect(bustButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('フィードバック表示時、選択されていないボタンにaria-pressed="false"が設定される', () => {
      render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const safeButton = screen.getByRole('button', { name: /セーフ/i });
      expect(safeButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('正誤アイコンにaria-hidden="true"が設定されている', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const icon = container.querySelector('.bust-question__icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('ショートカット表記にaria-hidden="true"が設定されている', () => {
      const { container } = render(<BustQuestion correctAnswer={true} onAnswer={vi.fn()} />);

      const shortcuts = container.querySelectorAll('.bust-question__shortcut');
      expect(shortcuts.length).toBe(2); // (B) と (S)
      shortcuts.forEach((shortcut) => {
        expect(shortcut).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('回答表示がdl/dt/dd要素で構造化されている', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const dlElements = container.querySelectorAll('dl.bust-question__answer-item');
      expect(dlElements.length).toBe(2);

      // 最初のdlは「あなたの回答」
      const firstDt = dlElements[0].querySelector('dt.bust-question__answer-label');
      expect(firstDt).toHaveTextContent('あなたの回答');

      const firstDd = dlElements[0].querySelector('dd.bust-question__answer-value');
      expect(firstDd).toHaveTextContent('バスト');

      // 2番目のdlは「正解」
      const secondDt = dlElements[1].querySelector('dt.bust-question__answer-label');
      expect(secondDt).toHaveTextContent('正解');

      const secondDd = dlElements[1].querySelector('dd.bust-question__answer-value');
      expect(secondDd).toHaveTextContent('バスト');
    });
  });

  describe('CSS class名の検証', () => {
    it('正解時にbust-question__result--correctクラスが適用される', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const resultElement = container.querySelector('.bust-question__result--correct');
      expect(resultElement).toBeInTheDocument();
    });

    it('不正解時にbust-question__result--incorrectクラスが適用される', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      const resultElement = container.querySelector('.bust-question__result--incorrect');
      expect(resultElement).toBeInTheDocument();
    });

    it('「バスト」ボタンが選択され正解した場合、bust-question__button--selected-correctクラスが適用される', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const bustButton = container.querySelector('.bust-question__button--bust');
      expect(bustButton?.classList.contains('bust-question__button--selected-correct')).toBe(true);
    });

    it('「バスト」ボタンが選択され不正解した場合、bust-question__button--selected-incorrectクラスが適用される', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={false}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      const bustButton = container.querySelector('.bust-question__button--bust');
      expect(bustButton?.classList.contains('bust-question__button--selected-incorrect')).toBe(
        true
      );
    });

    it('「セーフ」ボタンが選択され正解した場合、bust-question__button--selected-correctクラスが適用される', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={false}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      const safeButton = container.querySelector('.bust-question__button--safe');
      expect(safeButton?.classList.contains('bust-question__button--selected-correct')).toBe(true);
    });

    it('「セーフ」ボタンが選択され不正解した場合、bust-question__button--selected-incorrectクラスが適用される', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      const safeButton = container.querySelector('.bust-question__button--safe');
      expect(safeButton?.classList.contains('bust-question__button--selected-incorrect')).toBe(
        true
      );
    });
  });

  describe('userEvent による操作', () => {
    it('userEvent でボタンをクリックすると onAnswer が呼ばれる', async () => {
      const user = userEvent.setup();
      const onAnswer = vi.fn();
      render(<BustQuestion correctAnswer={true} onAnswer={onAnswer} />);

      const bustButton = screen.getByRole('button', { name: /バスト/i });
      await user.click(bustButton);

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(true);
    });

    it('userEvent でキーボード入力すると onAnswer が呼ばれる', async () => {
      const user = userEvent.setup();
      const onAnswer = vi.fn();
      render(<BustQuestion correctAnswer={false} onAnswer={onAnswer} />);

      await user.keyboard('s');

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(false);
    });
  });

  describe('スナップショットテスト', () => {
    it('初期状態（回答前）の見た目が一致する', () => {
      const { container } = render(<BustQuestion correctAnswer={true} onAnswer={vi.fn()} />);

      expect(container).toMatchSnapshot();
    });

    it('フィードバック表示（正解時）の見た目が一致する', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      expect(container).toMatchSnapshot();
    });

    it('フィードバック表示（不正解時：バスト選択）の見た目が一致する', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={false}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={true}
        />
      );

      expect(container).toMatchSnapshot();
    });

    it('フィードバック表示（不正解時：セーフ選択）の見た目が一致する', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={true}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      expect(container).toMatchSnapshot();
    });

    it('フィードバック表示（正解時：セーフが正解）の見た目が一致する', () => {
      const { container } = render(
        <BustQuestion
          correctAnswer={false}
          onAnswer={vi.fn()}
          showFeedback={true}
          userAnswer={false}
        />
      );

      expect(container).toMatchSnapshot();
    });
  });
});
