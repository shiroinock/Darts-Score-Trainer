/**
 * DifficultySelectorコンポーネントのテスト
 * 難易度（標準偏差）選択UI、プリセット選択、スライダー操作、アクセシビリティを検証
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DifficultySelector } from './DifficultySelector';

// 難易度プリセットの定義（実装と同じ）
const DIFFICULTY_PRESETS = [
  { label: '初心者', stdDevMM: 50 },
  { label: '中級者', stdDevMM: 30 },
  { label: '上級者', stdDevMM: 15 },
  { label: 'エキスパート', stdDevMM: 8 },
] as const;

// スライダー範囲定義（実装と同じ）
const SLIDER_MIN = 5;
const SLIDER_MAX = 100;

// モック用の型定義
type MockConfig = {
  stdDevMM: number;
};

// 設定モックのファクトリー関数
const createMockConfig = (overrides?: Partial<MockConfig>): MockConfig => ({
  stdDevMM: 30,
  ...overrides,
});

// useGameStoreのモック
const mockSetStdDev = vi.fn();
let mockConfig: MockConfig = createMockConfig();

vi.mock('../../stores/gameStore', () => ({
  useGameStore: (
    selector: (state: { config: MockConfig; setStdDev: (value: number) => void }) => unknown
  ) => {
    const mockState = {
      config: mockConfig,
      setStdDev: mockSetStdDev,
    };
    return selector(mockState);
  },
}));

describe('DifficultySelector', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
    // デフォルト状態に戻す
    mockConfig = createMockConfig();
  });

  describe('基本レンダリング', () => {
    test('タイトル「難易度を選択」が表示される', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      const title = screen.getByText('難易度を選択');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H2');
    });

    test('4つのプリセットボタンが表示される', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByRole('button', { name: '初心者' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '中級者' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '上級者' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'エキスパート' })).toBeInTheDocument();
    });

    test('スライダーが表示される', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('type', 'range');
    });

    test('現在値表示が表示される', () => {
      // Arrange
      mockConfig.stdDevMM = 30;

      // Act
      render(<DifficultySelector />);

      // Assert
      const display = screen.getByText('30mm');
      expect(display).toBeInTheDocument();
    });
  });

  describe('プリセット選択', () => {
    test('初心者ボタンをクリックするとsetStdDev(50)が呼び出される', async () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      const user = userEvent.setup();
      render(<DifficultySelector />);

      // Act
      const beginnerButton = screen.getByRole('button', { name: '初心者' });
      await user.click(beginnerButton);

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledTimes(1);
      expect(mockSetStdDev).toHaveBeenCalledWith(50);
    });

    test('中級者ボタンをクリックするとsetStdDev(30)が呼び出される', async () => {
      // Arrange
      mockConfig.stdDevMM = 50;
      const user = userEvent.setup();
      render(<DifficultySelector />);

      // Act
      const intermediateButton = screen.getByRole('button', { name: '中級者' });
      await user.click(intermediateButton);

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledTimes(1);
      expect(mockSetStdDev).toHaveBeenCalledWith(30);
    });

    test('上級者ボタンをクリックするとsetStdDev(15)が呼び出される', async () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      const user = userEvent.setup();
      render(<DifficultySelector />);

      // Act
      const advancedButton = screen.getByRole('button', { name: '上級者' });
      await user.click(advancedButton);

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledTimes(1);
      expect(mockSetStdDev).toHaveBeenCalledWith(15);
    });

    test('エキスパートボタンをクリックするとsetStdDev(8)が呼び出される', async () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      const user = userEvent.setup();
      render(<DifficultySelector />);

      // Act
      const expertButton = screen.getByRole('button', { name: 'エキスパート' });
      await user.click(expertButton);

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledTimes(1);
      expect(mockSetStdDev).toHaveBeenCalledWith(8);
    });

    test('複数のプリセットを連続して選択できる', async () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      const user = userEvent.setup();
      render(<DifficultySelector />);

      // Act
      await user.click(screen.getByRole('button', { name: '初心者' }));
      await user.click(screen.getByRole('button', { name: 'エキスパート' }));
      await user.click(screen.getByRole('button', { name: '上級者' }));

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledTimes(3);
      expect(mockSetStdDev).toHaveBeenNthCalledWith(1, 50);
      expect(mockSetStdDev).toHaveBeenNthCalledWith(2, 8);
      expect(mockSetStdDev).toHaveBeenNthCalledWith(3, 15);
    });
  });

  describe('スライダー操作', () => {
    test('スライダーの最小値は5である', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      expect(slider).toHaveAttribute('min', '5');
    });

    test('スライダーの最大値は100である', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      expect(slider).toHaveAttribute('max', '100');
    });

    test('スライダーのステップは1である', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      expect(slider).toHaveAttribute('step', '1');
    });

    test('スライダーの値が現在の標準偏差を反映する', () => {
      // Arrange
      mockConfig.stdDevMM = 42;

      // Act
      render(<DifficultySelector />);

      // Assert
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      expect(slider).toHaveValue('42');
    });

    test('スライダーを変更するとsetStdDevが呼び出される', () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      render(<DifficultySelector />);

      // Act
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      fireEvent.change(slider, { target: { value: '25' } });

      // Assert
      expect(mockSetStdDev).toHaveBeenCalled();
      expect(mockSetStdDev).toHaveBeenCalledWith(25);
    });

    test('スライダーで最小値（5）を選択できる', () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      render(<DifficultySelector />);

      // Act
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      fireEvent.change(slider, { target: { value: SLIDER_MIN.toString() } });

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledWith(SLIDER_MIN);
    });

    test('スライダーで最大値（100）を選択できる', () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      render(<DifficultySelector />);

      // Act
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      fireEvent.change(slider, { target: { value: SLIDER_MAX.toString() } });

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledWith(SLIDER_MAX);
    });
  });

  describe('状態反映', () => {
    test('初心者(50mm)選択時にボタンに--activeクラスが付与される', () => {
      // Arrange
      mockConfig.stdDevMM = 50;

      // Act
      render(<DifficultySelector />);

      // Assert
      const beginnerButton = screen.getByRole('button', { name: '初心者' });
      expect(beginnerButton).toHaveClass('difficulty-preset-button--active');
      expect(beginnerButton).toHaveClass('difficulty-preset-button');
    });

    test('中級者(30mm)選択時にボタンに--activeクラスが付与される', () => {
      // Arrange
      mockConfig.stdDevMM = 30;

      // Act
      render(<DifficultySelector />);

      // Assert
      const intermediateButton = screen.getByRole('button', { name: '中級者' });
      expect(intermediateButton).toHaveClass('difficulty-preset-button--active');
    });

    test('上級者(15mm)選択時にボタンに--activeクラスが付与される', () => {
      // Arrange
      mockConfig.stdDevMM = 15;

      // Act
      render(<DifficultySelector />);

      // Assert
      const advancedButton = screen.getByRole('button', { name: '上級者' });
      expect(advancedButton).toHaveClass('difficulty-preset-button--active');
    });

    test('エキスパート(8mm)選択時にボタンに--activeクラスが付与される', () => {
      // Arrange
      mockConfig.stdDevMM = 8;

      // Act
      render(<DifficultySelector />);

      // Assert
      const expertButton = screen.getByRole('button', { name: 'エキスパート' });
      expect(expertButton).toHaveClass('difficulty-preset-button--active');
    });

    test('非選択のプリセットボタンに--activeクラスが付与されない', () => {
      // Arrange
      mockConfig.stdDevMM = 30;

      // Act
      render(<DifficultySelector />);

      // Assert
      const beginnerButton = screen.getByRole('button', { name: '初心者' });
      const advancedButton = screen.getByRole('button', { name: '上級者' });
      const expertButton = screen.getByRole('button', { name: 'エキスパート' });

      expect(beginnerButton).toHaveClass('difficulty-preset-button');
      expect(beginnerButton).not.toHaveClass('difficulty-preset-button--active');
      expect(advancedButton).not.toHaveClass('difficulty-preset-button--active');
      expect(expertButton).not.toHaveClass('difficulty-preset-button--active');
    });

    test('カスタム値(25mm)の場合、どのプリセットにも--activeクラスが付与されない', () => {
      // Arrange
      mockConfig.stdDevMM = 25;

      // Act
      render(<DifficultySelector />);

      // Assert
      const allPresetButtons = DIFFICULTY_PRESETS.map((preset) =>
        screen.getByRole('button', { name: preset.label })
      );

      allPresetButtons.forEach((button) => {
        expect(button).toHaveClass('difficulty-preset-button');
        expect(button).not.toHaveClass('difficulty-preset-button--active');
      });
    });

    test('選択されたプリセットにaria-pressed="true"が設定される', () => {
      // Arrange
      mockConfig.stdDevMM = 15;

      // Act
      render(<DifficultySelector />);

      // Assert
      const advancedButton = screen.getByRole('button', { name: '上級者' });
      expect(advancedButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択のプリセットにaria-pressed="false"が設定される', () => {
      // Arrange
      mockConfig.stdDevMM = 15;

      // Act
      render(<DifficultySelector />);

      // Assert
      const beginnerButton = screen.getByRole('button', { name: '初心者' });
      const intermediateButton = screen.getByRole('button', { name: '中級者' });
      const expertButton = screen.getByRole('button', { name: 'エキスパート' });

      expect(beginnerButton).toHaveAttribute('aria-pressed', 'false');
      expect(intermediateButton).toHaveAttribute('aria-pressed', 'false');
      expect(expertButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('アクセシビリティ', () => {
    test('すべてのプリセットボタンがtype="button"を持つ', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      DIFFICULTY_PRESETS.forEach((preset) => {
        const button = screen.getByRole('button', { name: preset.label });
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    test('各プリセットボタンに適切なtitle属性が設定される', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByRole('button', { name: '初心者' })).toHaveAttribute(
        'title',
        '初心者（50mm）を選択'
      );
      expect(screen.getByRole('button', { name: '中級者' })).toHaveAttribute(
        'title',
        '中級者（30mm）を選択'
      );
      expect(screen.getByRole('button', { name: '上級者' })).toHaveAttribute(
        'title',
        '上級者（15mm）を選択'
      );
      expect(screen.getByRole('button', { name: 'エキスパート' })).toHaveAttribute(
        'title',
        'エキスパート（8mm）を選択'
      );
    });

    test('スライダーにaria-label属性が設定される', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      expect(slider).toHaveAttribute('aria-label', '標準偏差スライダー');
    });

    test('全てのプリセットボタンが適切なaria-pressed属性を持つ', () => {
      // Arrange
      mockConfig.stdDevMM = 50;

      // Act
      render(<DifficultySelector />);

      // Assert
      DIFFICULTY_PRESETS.forEach((preset) => {
        const button = screen.getByRole('button', { name: preset.label });
        if (preset.stdDevMM === mockConfig.stdDevMM) {
          expect(button).toHaveAttribute('aria-pressed', 'true');
        } else {
          expect(button).toHaveAttribute('aria-pressed', 'false');
        }
      });
    });

    test('タイトルがセマンティックなH2要素である', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      const title = screen.getByText('難易度を選択');
      expect(title.tagName).toBe('H2');
    });
  });

  describe('現在値表示', () => {
    test('初心者(50mm)の場合、"50mm"が表示される', () => {
      // Arrange
      mockConfig.stdDevMM = 50;

      // Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByText('50mm')).toBeInTheDocument();
    });

    test('中級者(30mm)の場合、"30mm"が表示される', () => {
      // Arrange
      mockConfig.stdDevMM = 30;

      // Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByText('30mm')).toBeInTheDocument();
    });

    test('上級者(15mm)の場合、"15mm"が表示される', () => {
      // Arrange
      mockConfig.stdDevMM = 15;

      // Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByText('15mm')).toBeInTheDocument();
    });

    test('エキスパート(8mm)の場合、"8mm"が表示される', () => {
      // Arrange
      mockConfig.stdDevMM = 8;

      // Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByText('8mm')).toBeInTheDocument();
    });

    test('カスタム値(25mm)の場合、"25mm"が表示される', () => {
      // Arrange
      mockConfig.stdDevMM = 25;

      // Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByText('25mm')).toBeInTheDocument();
    });

    test('最小値(5mm)の場合、"5mm"が表示される', () => {
      // Arrange
      mockConfig.stdDevMM = 5;

      // Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByText('5mm')).toBeInTheDocument();
    });

    test('最大値(100mm)の場合、"100mm"が表示される', () => {
      // Arrange
      mockConfig.stdDevMM = 100;

      // Act
      render(<DifficultySelector />);

      // Assert
      expect(screen.getByText('100mm')).toBeInTheDocument();
    });
  });

  describe('スナップショットテスト', () => {
    test('初心者(50mm)選択時のスナップショット', () => {
      // Arrange
      mockConfig.stdDevMM = 50;

      // Act
      const { container } = render(<DifficultySelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('中級者(30mm)選択時のスナップショット', () => {
      // Arrange
      mockConfig.stdDevMM = 30;

      // Act
      const { container } = render(<DifficultySelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('上級者(15mm)選択時のスナップショット', () => {
      // Arrange
      mockConfig.stdDevMM = 15;

      // Act
      const { container } = render(<DifficultySelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('エキスパート(8mm)選択時のスナップショット', () => {
      // Arrange
      mockConfig.stdDevMM = 8;

      // Act
      const { container } = render(<DifficultySelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('カスタム値(25mm)選択時のスナップショット', () => {
      // Arrange
      mockConfig.stdDevMM = 25;

      // Act
      const { container } = render(<DifficultySelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('レイアウト構造', () => {
    test('difficulty-selector クラスを持つ外側のdivが存在する', () => {
      // Arrange & Act
      const { container } = render(<DifficultySelector />);

      // Assert
      const outerDiv = container.querySelector('.difficulty-selector');
      expect(outerDiv).toBeInTheDocument();
    });

    test('difficulty-selector__title クラスを持つタイトルが存在する', () => {
      // Arrange & Act
      const { container } = render(<DifficultySelector />);

      // Assert
      const title = container.querySelector('.difficulty-selector__title');
      expect(title).toBeInTheDocument();
      expect(title?.tagName).toBe('H2');
    });

    test('difficulty-selector__presets クラスを持つプリセットコンテナが存在する', () => {
      // Arrange & Act
      const { container } = render(<DifficultySelector />);

      // Assert
      const presets = container.querySelector('.difficulty-selector__presets');
      expect(presets).toBeInTheDocument();
    });

    test('difficulty-selector__slider クラスを持つスライダーコンテナが存在する', () => {
      // Arrange & Act
      const { container } = render(<DifficultySelector />);

      // Assert
      const sliderContainer = container.querySelector('.difficulty-selector__slider');
      expect(sliderContainer).toBeInTheDocument();
    });

    test('difficulty-selector__display クラスを持つ現在値表示が存在する', () => {
      // Arrange & Act
      const { container } = render(<DifficultySelector />);

      // Assert
      const display = container.querySelector('.difficulty-selector__display');
      expect(display).toBeInTheDocument();
    });

    test('各プリセットボタンが difficulty-preset-button クラスを持つ', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      DIFFICULTY_PRESETS.forEach((preset) => {
        const button = screen.getByRole('button', { name: preset.label });
        expect(button).toHaveClass('difficulty-preset-button');
      });
    });

    test('スライダーが difficulty-slider クラスを持つ', () => {
      // Arrange & Act
      const { container } = render(<DifficultySelector />);

      // Assert
      const slider = container.querySelector('.difficulty-slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('type', 'range');
    });
  });

  describe('エッジケース', () => {
    test('プリセット値が4つであることを検証', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      expect(DIFFICULTY_PRESETS).toHaveLength(4);
      const allButtons = screen.getAllByRole('button');
      expect(allButtons).toHaveLength(4);
    });

    test('プリセットの順序が定義通りにレンダリングされる', () => {
      // Arrange & Act
      render(<DifficultySelector />);

      // Assert
      const allButtons = screen.getAllByRole('button');
      allButtons.forEach((button, index) => {
        const expectedPreset = DIFFICULTY_PRESETS[index];
        expect(button).toHaveTextContent(expectedPreset.label);
      });
    });

    test('スライダー範囲外の値(4mm)でもエラーにならない', () => {
      // Arrange
      mockConfig.stdDevMM = 4;

      // Act & Assert
      expect(() => render(<DifficultySelector />)).not.toThrow();
      expect(screen.getByText('4mm')).toBeInTheDocument();
    });

    test('スライダー範囲外の値(101mm)でもエラーにならない', () => {
      // Arrange
      mockConfig.stdDevMM = 101;

      // Act & Assert
      expect(() => render(<DifficultySelector />)).not.toThrow();
      expect(screen.getByText('101mm')).toBeInTheDocument();
    });

    test('同じプリセットを連続してクリックできる', async () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      const user = userEvent.setup();
      render(<DifficultySelector />);

      // Act
      const intermediateButton = screen.getByRole('button', { name: '中級者' });
      await user.click(intermediateButton);
      await user.click(intermediateButton);

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledTimes(2);
      expect(mockSetStdDev).toHaveBeenNthCalledWith(1, 30);
      expect(mockSetStdDev).toHaveBeenNthCalledWith(2, 30);
    });
  });

  describe('インタラクション', () => {
    test('プリセット選択後にスライダーで調整できる', async () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      const user = userEvent.setup();
      const { rerender } = render(<DifficultySelector />);

      // Act: プリセット選択
      const advancedButton = screen.getByRole('button', { name: '上級者' });
      await user.click(advancedButton);

      expect(mockSetStdDev).toHaveBeenCalledTimes(1);
      expect(mockSetStdDev).toHaveBeenCalledWith(15);

      // モック状態を更新して再レンダリング
      mockConfig.stdDevMM = 15;
      rerender(<DifficultySelector />);

      // Act: スライダーで微調整
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      fireEvent.change(slider, { target: { value: '18' } });

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledTimes(2);
      expect(mockSetStdDev).toHaveBeenNthCalledWith(2, 18);
    });

    test('スライダー調整後にプリセット選択できる', async () => {
      // Arrange
      mockConfig.stdDevMM = 30;
      const user = userEvent.setup();
      render(<DifficultySelector />);

      // Act: スライダー調整
      const slider = screen.getByRole('slider', { name: '標準偏差スライダー' });
      fireEvent.change(slider, { target: { value: '42' } });

      expect(mockSetStdDev).toHaveBeenCalled();

      // Act: プリセット選択
      const expertButton = screen.getByRole('button', { name: 'エキスパート' });
      await user.click(expertButton);

      // Assert
      expect(mockSetStdDev).toHaveBeenCalledWith(8);
    });
  });

  describe('プリセット定義の整合性', () => {
    test('各プリセットが必須プロパティを持つ', () => {
      // Assert
      DIFFICULTY_PRESETS.forEach((preset) => {
        expect(preset).toHaveProperty('label');
        expect(preset).toHaveProperty('stdDevMM');
        expect(typeof preset.label).toBe('string');
        expect(typeof preset.stdDevMM).toBe('number');
      });
    });

    test('全てのプリセットラベルがユニークである', () => {
      // Arrange
      const labels = DIFFICULTY_PRESETS.map((p) => p.label);

      // Assert
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    test('全てのプリセット標準偏差がユニークである', () => {
      // Arrange
      const stdDevs = DIFFICULTY_PRESETS.map((p) => p.stdDevMM);

      // Assert
      const uniqueStdDevs = new Set(stdDevs);
      expect(uniqueStdDevs.size).toBe(stdDevs.length);
    });

    test('プリセット値が降順（難易度上昇順）に並んでいる', () => {
      // Assert
      for (let i = 0; i < DIFFICULTY_PRESETS.length - 1; i++) {
        expect(DIFFICULTY_PRESETS[i].stdDevMM).toBeGreaterThan(DIFFICULTY_PRESETS[i + 1].stdDevMM);
      }
    });
  });
});
