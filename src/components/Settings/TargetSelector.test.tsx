/**
 * TargetSelectorコンポーネントのテスト
 * ターゲット選択UI、タイプ・数字選択、条件付きレンダリング、アクセシビリティを検証
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Target, TargetType } from '../../types';
import { TargetSelector } from './TargetSelector';

// 数字の配列（20から1まで降順）
const NUMBERS = Array.from({ length: 20 }, (_, i) => 20 - i);

// モック用の型定義
type MockConfig = {
  target: Target;
};

// 設定モックのファクトリー関数
const createMockConfig = (overrides?: Partial<MockConfig>): MockConfig => ({
  target: {
    type: 'TRIPLE',
    number: 20,
    label: 'T20',
  },
  ...overrides,
});

// useGameStoreのモック
const mockSetTarget = vi.fn();
let mockConfig: MockConfig = createMockConfig();

vi.mock('../../stores/gameStore', () => ({
  useGameStore: (
    selector: (state: { config: MockConfig; setTarget: (target: Target) => void }) => unknown
  ) => {
    const mockState = {
      config: mockConfig,
      setTarget: mockSetTarget,
    };
    return selector(mockState);
  },
}));

describe('TargetSelector', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
    // デフォルト状態に戻す
    mockConfig = createMockConfig();
  });

  describe('基本レンダリング', () => {
    test('タイトル「ターゲットを選択」が表示される', () => {
      // Arrange & Act
      render(<TargetSelector />);

      // Assert
      const title = screen.getByText('ターゲットを選択');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H2');
    });

    test('タイプセクションのサブタイトル「タイプ」が表示される', () => {
      // Arrange & Act
      render(<TargetSelector />);

      // Assert
      const subtitle = screen.getByText('タイプ');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.tagName).toBe('H3');
    });

    test('4つのタイプボタンが表示される', () => {
      // Arrange & Act
      render(<TargetSelector />);

      // Assert
      expect(screen.getByRole('button', { name: 'Single' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Double' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Triple' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bull' })).toBeInTheDocument();
    });

    test('数字セクションのサブタイトル「数字」が表示される（Bull以外）', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const subtitle = screen.getByText('数字');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.tagName).toBe('H3');
    });

    test('20個の数字ボタンが表示される（Bull以外）', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      NUMBERS.forEach((number) => {
        expect(screen.getByRole('button', { name: number.toString() })).toBeInTheDocument();
      });
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('タイプ選択UI', () => {
    test('SingleボタンをクリックするとsetTargetが呼び出される', async () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const singleButton = screen.getByRole('button', { name: 'Single' });
      await user.click(singleButton);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'SINGLE',
        number: 20,
        label: 'S20',
      });
    });

    test('DoubleボタンをクリックするとsetTargetが呼び出される', async () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const doubleButton = screen.getByRole('button', { name: 'Double' });
      await user.click(doubleButton);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'DOUBLE',
        number: 20,
        label: 'D20',
      });
    });

    test('TripleボタンをクリックするとsetTargetが呼び出される', async () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const tripleButton = screen.getByRole('button', { name: 'Triple' });
      await user.click(tripleButton);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });

    test('BullボタンをクリックするとsetTargetがnumberをnullで呼び出す', async () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const bullButton = screen.getByRole('button', { name: 'Bull' });
      await user.click(bullButton);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'BULL',
        number: null,
        label: 'BULL',
      });
    });

    test('Bull状態から他のタイプに変更するとnumberが20にセットされる', async () => {
      // Arrange
      mockConfig.target.type = 'BULL';
      mockConfig.target.number = null;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const singleButton = screen.getByRole('button', { name: 'Single' });
      await user.click(singleButton);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'SINGLE',
        number: 20,
        label: 'S20',
      });
    });

    test('選択されたタイプボタンに--activeクラスが付与される', () => {
      // Arrange
      mockConfig.target.type = 'DOUBLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const doubleButton = screen.getByRole('button', { name: 'Double' });
      expect(doubleButton).toHaveClass('target-type-button--active');
      expect(doubleButton).toHaveClass('target-type-button');
    });

    test('非選択のタイプボタンに--activeクラスが付与されない', () => {
      // Arrange
      mockConfig.target.type = 'DOUBLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const singleButton = screen.getByRole('button', { name: 'Single' });
      const tripleButton = screen.getByRole('button', { name: 'Triple' });
      const bullButton = screen.getByRole('button', { name: 'Bull' });

      expect(singleButton).toHaveClass('target-type-button');
      expect(singleButton).not.toHaveClass('target-type-button--active');
      expect(tripleButton).not.toHaveClass('target-type-button--active');
      expect(bullButton).not.toHaveClass('target-type-button--active');
    });

    test('選択されたタイプボタンに aria-pressed="true" が設定される', () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const tripleButton = screen.getByRole('button', { name: 'Triple' });
      expect(tripleButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択のタイプボタンに aria-pressed="false" が設定される', () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const singleButton = screen.getByRole('button', { name: 'Single' });
      const doubleButton = screen.getByRole('button', { name: 'Double' });
      const bullButton = screen.getByRole('button', { name: 'Bull' });

      expect(singleButton).toHaveAttribute('aria-pressed', 'false');
      expect(doubleButton).toHaveAttribute('aria-pressed', 'false');
      expect(bullButton).toHaveAttribute('aria-pressed', 'false');
    });

    test('タイプボタンに type="button" が設定される', () => {
      // Arrange & Act
      render(<TargetSelector />);

      // Assert
      const singleButton = screen.getByRole('button', { name: 'Single' });
      const doubleButton = screen.getByRole('button', { name: 'Double' });
      const tripleButton = screen.getByRole('button', { name: 'Triple' });
      const bullButton = screen.getByRole('button', { name: 'Bull' });

      expect(singleButton).toHaveAttribute('type', 'button');
      expect(doubleButton).toHaveAttribute('type', 'button');
      expect(tripleButton).toHaveAttribute('type', 'button');
      expect(bullButton).toHaveAttribute('type', 'button');
    });

    test('各タイプボタンに適切なtitle属性が設定される', () => {
      // Arrange & Act
      render(<TargetSelector />);

      // Assert
      expect(screen.getByRole('button', { name: 'Single' })).toHaveAttribute(
        'title',
        'Singleを選択'
      );
      expect(screen.getByRole('button', { name: 'Double' })).toHaveAttribute(
        'title',
        'Doubleを選択'
      );
      expect(screen.getByRole('button', { name: 'Triple' })).toHaveAttribute(
        'title',
        'Tripleを選択'
      );
      expect(screen.getByRole('button', { name: 'Bull' })).toHaveAttribute('title', 'Bullを選択');
    });
  });

  describe('数字グリッドUI', () => {
    test('数字ボタンがNUMBERS配列の順序で表示される', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const numberButtons = screen
        .getAllByRole('button')
        .filter(
          (button) => !['Single', 'Double', 'Triple', 'Bull'].includes(button.textContent || '')
        );

      expect(numberButtons).toHaveLength(20);
      numberButtons.forEach((button, index) => {
        expect(button.textContent).toBe(NUMBERS[index].toString());
      });
    });

    test('数字20ボタンをクリックするとsetTargetが呼び出される', async () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 1;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const button20 = screen.getByRole('button', { name: '20' });
      await user.click(button20);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'SINGLE',
        number: 20,
        label: 'S20',
      });
    });

    test('数字1ボタンをクリックするとsetTargetが呼び出される', async () => {
      // Arrange
      mockConfig.target.type = 'DOUBLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const button1 = screen.getByRole('button', { name: '1' });
      await user.click(button1);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'DOUBLE',
        number: 1,
        label: 'D1',
      });
    });

    test('数字5ボタンをクリックするとsetTargetが呼び出される', async () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const button5 = screen.getByRole('button', { name: '5' });
      await user.click(button5);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'TRIPLE',
        number: 5,
        label: 'T5',
      });
    });

    test('選択された数字ボタンに--activeクラスが付与される', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 18;

      // Act
      render(<TargetSelector />);

      // Assert
      const button18 = screen.getByRole('button', { name: '18' });
      expect(button18).toHaveClass('target-number-button--active');
      expect(button18).toHaveClass('target-number-button');
    });

    test('非選択の数字ボタンに--activeクラスが付与されない', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 18;

      // Act
      render(<TargetSelector />);

      // Assert
      const button20 = screen.getByRole('button', { name: '20' });
      const button1 = screen.getByRole('button', { name: '1' });

      expect(button20).toHaveClass('target-number-button');
      expect(button20).not.toHaveClass('target-number-button--active');
      expect(button1).not.toHaveClass('target-number-button--active');
    });

    test('選択された数字ボタンに aria-pressed="true" が設定される', () => {
      // Arrange
      mockConfig.target.type = 'DOUBLE';
      mockConfig.target.number = 19;

      // Act
      render(<TargetSelector />);

      // Assert
      const button19 = screen.getByRole('button', { name: '19' });
      expect(button19).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択の数字ボタンに aria-pressed="false" が設定される', () => {
      // Arrange
      mockConfig.target.type = 'DOUBLE';
      mockConfig.target.number = 19;

      // Act
      render(<TargetSelector />);

      // Assert
      const button20 = screen.getByRole('button', { name: '20' });
      const button1 = screen.getByRole('button', { name: '1' });

      expect(button20).toHaveAttribute('aria-pressed', 'false');
      expect(button1).toHaveAttribute('aria-pressed', 'false');
    });

    test('数字ボタンに type="button" が設定される', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const button20 = screen.getByRole('button', { name: '20' });
      const button1 = screen.getByRole('button', { name: '1' });
      const button5 = screen.getByRole('button', { name: '5' });

      expect(button20).toHaveAttribute('type', 'button');
      expect(button1).toHaveAttribute('type', 'button');
      expect(button5).toHaveAttribute('type', 'button');
    });

    test('各数字ボタンに適切なtitle属性が設定される', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      expect(screen.getByRole('button', { name: '20' })).toHaveAttribute('title', '20を選択');
      expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('title', '1を選択');
      expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('title', '5を選択');
    });

    test('数字グリッドが4x5のレイアウト構造を持つ', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      const numberGrid = container.querySelector<HTMLElement>('.target-selector__number-grid');
      expect(numberGrid).toBeInTheDocument();

      const numberButtons = within(numberGrid!).getAllByRole('button');
      expect(numberButtons).toHaveLength(20);
    });
  });

  describe('条件付きレンダリング', () => {
    test('Bull選択時に数字グリッドが非表示になる', () => {
      // Arrange
      mockConfig.target.type = 'BULL';
      mockConfig.target.number = null;

      // Act
      render(<TargetSelector />);

      // Assert
      expect(screen.queryByText('数字')).not.toBeInTheDocument();
      // 数字ボタンが存在しないことを確認（タイプボタンは4つのみ）
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // Single, Double, Triple, Bull のみ
    });

    test('Single選択時に数字グリッドが表示される', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 20;

      // Act
      render(<TargetSelector />);

      // Assert
      expect(screen.getByText('数字')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    });

    test('Double選択時に数字グリッドが表示される', () => {
      // Arrange
      mockConfig.target.type = 'DOUBLE';
      mockConfig.target.number = 20;

      // Act
      render(<TargetSelector />);

      // Assert
      expect(screen.getByText('数字')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    });

    test('Triple選択時に数字グリッドが表示される', () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';
      mockConfig.target.number = 20;

      // Act
      render(<TargetSelector />);

      // Assert
      expect(screen.getByText('数字')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    });

    test('Bull状態で数字ボタンをクリックしても何も起こらない（renderの前にBull状態）', () => {
      // Arrange
      mockConfig.target.type = 'BULL';
      mockConfig.target.number = null;

      // Act
      render(<TargetSelector />);

      // Assert
      // 数字ボタンが表示されていないため、クリック不可
      expect(screen.queryByRole('button', { name: '20' })).not.toBeInTheDocument();
    });
  });

  describe('インタラクション', () => {
    test('タイプ変更→数字選択のフローが正しく動作する', async () => {
      // Arrange
      mockConfig.target.type = 'BULL';
      mockConfig.target.number = null;
      const user = userEvent.setup();
      const { rerender } = render(<TargetSelector />);

      // Act: BullからTripleに変更
      const tripleButton = screen.getByRole('button', { name: 'Triple' });
      await user.click(tripleButton);

      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });

      // モックの状態を更新して再レンダリング
      mockConfig.target = { type: 'TRIPLE', number: 20, label: 'T20' };
      rerender(<TargetSelector />);

      // Act: 数字19を選択
      const button19 = screen.getByRole('button', { name: '19' });
      await user.click(button19);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(2);
      expect(mockSetTarget).toHaveBeenNthCalledWith(2, {
        type: 'TRIPLE',
        number: 19,
        label: 'T19',
      });
    });

    test('複数の数字を連続して選択できる', async () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '18' }));
      await user.click(screen.getByRole('button', { name: '4' }));

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(3);
      expect(mockSetTarget).toHaveBeenNthCalledWith(1, {
        type: 'SINGLE',
        number: 1,
        label: 'S1',
      });
      expect(mockSetTarget).toHaveBeenNthCalledWith(2, {
        type: 'SINGLE',
        number: 18,
        label: 'S18',
      });
      expect(mockSetTarget).toHaveBeenNthCalledWith(3, {
        type: 'SINGLE',
        number: 4,
        label: 'S4',
      });
    });

    test('タイプを変更すると数字が保持される', async () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 19;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const doubleButton = screen.getByRole('button', { name: 'Double' });
      await user.click(doubleButton);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'DOUBLE',
        number: 19,
        label: 'D19',
      });
    });

    test('タイプをBullに変更すると数字がnullになる', async () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 19;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const bullButton = screen.getByRole('button', { name: 'Bull' });
      await user.click(bullButton);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledTimes(1);
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'BULL',
        number: null,
        label: 'BULL',
      });
    });
  });

  describe('アクセシビリティ', () => {
    test('全てのタイプボタンが適切なaria-pressed属性を持つ', () => {
      // Arrange
      mockConfig.target.type = 'DOUBLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const typeButtons: { name: string; type: TargetType }[] = [
        { name: 'Single', type: 'SINGLE' },
        { name: 'Double', type: 'DOUBLE' },
        { name: 'Triple', type: 'TRIPLE' },
        { name: 'Bull', type: 'BULL' },
      ];

      typeButtons.forEach((button) => {
        const buttonElement = screen.getByRole('button', { name: button.name });
        if (button.type === mockConfig.target.type) {
          expect(buttonElement).toHaveAttribute('aria-pressed', 'true');
        } else {
          expect(buttonElement).toHaveAttribute('aria-pressed', 'false');
        }
      });
    });

    test('全ての数字ボタンが適切なaria-pressed属性を持つ', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 13;

      // Act
      render(<TargetSelector />);

      // Assert
      NUMBERS.forEach((number) => {
        const button = screen.getByRole('button', { name: number.toString() });
        if (number === mockConfig.target.number) {
          expect(button).toHaveAttribute('aria-pressed', 'true');
        } else {
          expect(button).toHaveAttribute('aria-pressed', 'false');
        }
      });
    });

    test('全てのボタンがtype="button"を持つ', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const allButtons = screen.getAllByRole('button');
      allButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    test('セマンティックなHTML構造が使用されている', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const mainTitle = screen.getByText('ターゲットを選択');
      expect(mainTitle.tagName).toBe('H2');

      const subtitles = screen.getAllByRole('heading', { level: 3 });
      expect(subtitles).toHaveLength(2); // タイプと数字
      expect(subtitles[0]).toHaveTextContent('タイプ');
      expect(subtitles[1]).toHaveTextContent('数字');
    });
  });

  describe('スナップショットテスト', () => {
    test('Single + 20選択時のスナップショット', () => {
      // Arrange
      mockConfig.target = { type: 'SINGLE', number: 20, label: 'S20' };

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('Double + 19選択時のスナップショット', () => {
      // Arrange
      mockConfig.target = { type: 'DOUBLE', number: 19, label: 'D19' };

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('Triple + 20選択時のスナップショット', () => {
      // Arrange
      mockConfig.target = { type: 'TRIPLE', number: 20, label: 'T20' };

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('Bull選択時のスナップショット（数字グリッド非表示）', () => {
      // Arrange
      mockConfig.target = { type: 'BULL', number: null, label: 'BULL' };

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('Triple + 1選択時のスナップショット', () => {
      // Arrange
      mockConfig.target = { type: 'TRIPLE', number: 1, label: 'T1' };

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('Single + 5選択時のスナップショット', () => {
      // Arrange
      mockConfig.target = { type: 'SINGLE', number: 5, label: 'S5' };

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('レイアウト構造', () => {
    test('target-selector クラスを持つ外側のdivが存在する', () => {
      // Arrange & Act
      const { container } = render(<TargetSelector />);

      // Assert
      const outerDiv = container.querySelector('.target-selector');
      expect(outerDiv).toBeInTheDocument();
    });

    test('target-selector__title クラスを持つタイトルが存在する', () => {
      // Arrange & Act
      const { container } = render(<TargetSelector />);

      // Assert
      const title = container.querySelector('.target-selector__title');
      expect(title).toBeInTheDocument();
      expect(title?.tagName).toBe('H2');
    });

    test('target-selector__section クラスを持つセクションが存在する', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      const sections = container.querySelectorAll('.target-selector__section');
      expect(sections.length).toBe(2); // タイプセクション、数字セクション
    });

    test('target-selector__type-buttons クラスを持つコンテナが存在する', () => {
      // Arrange & Act
      const { container } = render(<TargetSelector />);

      // Assert
      const typeButtons = container.querySelector('.target-selector__type-buttons');
      expect(typeButtons).toBeInTheDocument();
    });

    test('target-selector__number-grid クラスを持つグリッドが存在する（Bull以外）', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      const numberGrid = container.querySelector('.target-selector__number-grid');
      expect(numberGrid).toBeInTheDocument();
    });

    test('target-selector__subtitle クラスを持つサブタイトルが存在する', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      const subtitles = container.querySelectorAll('.target-selector__subtitle');
      expect(subtitles.length).toBe(2); // タイプと数字
    });
  });

  describe('エッジケース', () => {
    test('全てのNUMBERS値（1-20）が数字ボタンとして表示される', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      expect(NUMBERS).toHaveLength(20);
      const expectedNumbers = [
        20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
      ];

      expectedNumbers.forEach((num, index) => {
        expect(NUMBERS[index]).toBe(num);
        expect(screen.getByRole('button', { name: num.toString() })).toBeInTheDocument();
      });
    });

    test('NUMBERS配列と数字ボタンの順序が一致する', () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';

      // Act
      render(<TargetSelector />);

      // Assert
      const numberButtons = screen
        .getAllByRole('button')
        .filter(
          (button) => !['Single', 'Double', 'Triple', 'Bull'].includes(button.textContent || '')
        );

      numberButtons.forEach((button, index) => {
        expect(button.textContent).toBe(NUMBERS[index].toString());
      });
    });

    test('Bull選択時にセクションが1つだけ表示される', () => {
      // Arrange
      mockConfig.target.type = 'BULL';

      // Act
      const { container } = render(<TargetSelector />);

      // Assert
      const sections = container.querySelectorAll('.target-selector__section');
      expect(sections.length).toBe(1); // タイプセクションのみ
    });

    test('数字がnullの状態で非BullタイプにするとデフォルトでT20になる', async () => {
      // Arrange
      mockConfig.target.type = 'BULL';
      mockConfig.target.number = null;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      const tripleButton = screen.getByRole('button', { name: 'Triple' });
      await user.click(tripleButton);

      // Assert
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'TRIPLE',
        number: 20,
        label: 'T20',
      });
    });
  });

  describe('ラベル生成ロジック', () => {
    test('Single選択時にラベルがSプレフィックスで生成される', async () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';
      mockConfig.target.number = 19;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Single' }));

      // Assert
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'SINGLE',
        number: 19,
        label: 'S19',
      });
    });

    test('Double選択時にラベルがDプレフィックスで生成される', async () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 18;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Double' }));

      // Assert
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'DOUBLE',
        number: 18,
        label: 'D18',
      });
    });

    test('Triple選択時にラベルがTプレフィックスで生成される', async () => {
      // Arrange
      mockConfig.target.type = 'DOUBLE';
      mockConfig.target.number = 7;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Triple' }));

      // Assert
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'TRIPLE',
        number: 7,
        label: 'T7',
      });
    });

    test('Bull選択時にラベルがBULLになる', async () => {
      // Arrange
      mockConfig.target.type = 'SINGLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Bull' }));

      // Assert
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'BULL',
        number: null,
        label: 'BULL',
      });
    });

    test('数字変更時にラベルが正しく更新される', async () => {
      // Arrange
      mockConfig.target.type = 'TRIPLE';
      mockConfig.target.number = 20;
      const user = userEvent.setup();
      render(<TargetSelector />);

      // Act
      await user.click(screen.getByRole('button', { name: '13' }));

      // Assert
      expect(mockSetTarget).toHaveBeenCalledWith({
        type: 'TRIPLE',
        number: 13,
        label: 'T13',
      });
    });
  });
});
