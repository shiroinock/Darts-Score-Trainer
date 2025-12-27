/**
 * PresetSelectorコンポーネントのテスト
 * プリセット選択UI、インタラクション、アクセシビリティを検証
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PRESETS } from '../../stores/config/presets';
import { PresetSelector } from './PresetSelector';

// useGameStoreのモック
const mockSelectPreset = vi.fn();
const mockCurrentConfigId = 'preset-basic';

vi.mock('../../stores/gameStore', () => ({
  useGameStore: (
    selector: (state: { config: { configId: string }; selectPreset: () => void }) => unknown
  ) => {
    const mockState = {
      config: { configId: mockCurrentConfigId },
      selectPreset: mockSelectPreset,
    };
    return selector(mockState);
  },
}));

describe('PresetSelector', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
  });

  describe('レンダリング', () => {
    test('5つのプリセットボタンがレンダリングされる', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    test('各ボタンにアイコンが表示される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const presetValues = Object.values(PRESETS);
      presetValues.forEach((preset) => {
        const icon = screen.getByText(preset.icon);
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    test('各ボタンに名前が表示される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const presetValues = Object.values(PRESETS);
      presetValues.forEach((preset) => {
        const name = screen.getByText(preset.configName);
        expect(name).toBeInTheDocument();
      });
    });

    test('各ボタンに説明が表示される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const presetValues = Object.values(PRESETS);
      presetValues.forEach((preset) => {
        const description = screen.getByText(preset.description);
        expect(description).toBeInTheDocument();
      });
    });

    test('タイトル「練習モードを選択」が表示される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const title = screen.getByText('練習モードを選択');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H2');
    });
  });

  describe('インタラクション', () => {
    test('基礎練習ボタンをクリックするとgameStore.selectPresetが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PresetSelector />);

      // Act
      const basicButton = screen.getByText('基礎練習').closest('button');
      await user.click(basicButton!);

      // Assert
      expect(mockSelectPreset).toHaveBeenCalledTimes(1);
      expect(mockSelectPreset).toHaveBeenCalledWith('preset-basic');
    });

    test('プレイヤー練習ボタンをクリックすると正しいプリセットIDが渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PresetSelector />);

      // Act
      const playerButton = screen.getByText('プレイヤー練習').closest('button');
      await user.click(playerButton!);

      // Assert
      expect(mockSelectPreset).toHaveBeenCalledTimes(1);
      expect(mockSelectPreset).toHaveBeenCalledWith('preset-player');
    });

    test('コーラー基礎ボタンをクリックすると正しいプリセットIDが渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PresetSelector />);

      // Act
      const callerBasicButton = screen.getByText('コーラー基礎').closest('button');
      await user.click(callerBasicButton!);

      // Assert
      expect(mockSelectPreset).toHaveBeenCalledTimes(1);
      expect(mockSelectPreset).toHaveBeenCalledWith('preset-caller-basic');
    });

    test('コーラー累積ボタンをクリックすると正しいプリセットIDが渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PresetSelector />);

      // Act
      const callerCumulativeButton = screen.getByText('コーラー累積').closest('button');
      await user.click(callerCumulativeButton!);

      // Assert
      expect(mockSelectPreset).toHaveBeenCalledTimes(1);
      expect(mockSelectPreset).toHaveBeenCalledWith('preset-caller-cumulative');
    });

    test('総合練習ボタンをクリックすると正しいプリセットIDが渡される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PresetSelector />);

      // Act
      const comprehensiveButton = screen.getByText('総合練習').closest('button');
      await user.click(comprehensiveButton!);

      // Assert
      expect(mockSelectPreset).toHaveBeenCalledTimes(1);
      expect(mockSelectPreset).toHaveBeenCalledWith('preset-comprehensive');
    });

    test('複数のボタンを連続してクリックできる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PresetSelector />);

      // Act
      const basicButton = screen.getByText('基礎練習').closest('button');
      const playerButton = screen.getByText('プレイヤー練習').closest('button');
      const comprehensiveButton = screen.getByText('総合練習').closest('button');

      await user.click(basicButton!);
      await user.click(playerButton!);
      await user.click(comprehensiveButton!);

      // Assert
      expect(mockSelectPreset).toHaveBeenCalledTimes(3);
      expect(mockSelectPreset).toHaveBeenNthCalledWith(1, 'preset-basic');
      expect(mockSelectPreset).toHaveBeenNthCalledWith(2, 'preset-player');
      expect(mockSelectPreset).toHaveBeenNthCalledWith(3, 'preset-comprehensive');
    });
  });

  describe('スタイリング', () => {
    test('アクティブプリセットボタンに preset-button--active クラスが付与される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const basicButton = screen.getByText('基礎練習').closest('button');
      expect(basicButton).toHaveClass('preset-button--active');
      expect(basicButton).toHaveClass('preset-button');
    });

    test('非アクティブボタンには preset-button--active クラスが付与されない', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const playerButton = screen.getByText('プレイヤー練習').closest('button');
      expect(playerButton).toHaveClass('preset-button');
      expect(playerButton).not.toHaveClass('preset-button--active');
    });

    test('全ての非アクティブボタンに preset-button--active クラスが付与されない', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const allButtons = screen.getAllByRole('button');
      const presetValues = Object.values(PRESETS);

      allButtons.forEach((button, index) => {
        const preset = presetValues[index];
        if (preset.configId === mockCurrentConfigId) {
          expect(button).toHaveClass('preset-button--active');
        } else {
          expect(button).not.toHaveClass('preset-button--active');
        }
      });
    });
  });

  describe('アクセシビリティ', () => {
    test('アクティブボタンに aria-pressed="true" が設定される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const basicButton = screen.getByText('基礎練習').closest('button');
      expect(basicButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('非アクティブボタンに aria-pressed="false" が設定される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const playerButton = screen.getByText('プレイヤー練習').closest('button');
      expect(playerButton).toHaveAttribute('aria-pressed', 'false');
    });

    test('全てのボタンが適切な aria-pressed 属性を持つ', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const allButtons = screen.getAllByRole('button');
      const presetValues = Object.values(PRESETS);

      allButtons.forEach((button, index) => {
        const preset = presetValues[index];
        if (preset.configId === mockCurrentConfigId) {
          expect(button).toHaveAttribute('aria-pressed', 'true');
        } else {
          expect(button).toHaveAttribute('aria-pressed', 'false');
        }
      });
    });

    test('各ボタンに title 属性が設定される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const presetValues = Object.values(PRESETS);
      presetValues.forEach((preset) => {
        const button = screen.getByText(preset.configName).closest('button');
        expect(button).toHaveAttribute('title', preset.description);
      });
    });

    test('全てのボタンが type="button" を持つ', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const allButtons = screen.getAllByRole('button');
      allButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    test('アイコンに aria-hidden="true" が設定される', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const presetValues = Object.values(PRESETS);
      presetValues.forEach((preset) => {
        const iconElement = screen.getByText(preset.icon);
        expect(iconElement).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('エッジケース', () => {
    test('存在しないconfigIdがアクティブでも正常にレンダリングされる', () => {
      // Arrange
      // モックを一時的に変更
      vi.doMock('../../stores/gameStore', () => ({
        useGameStore: (
          selector: (state: { config: { configId: string }; selectPreset: () => void }) => unknown
        ) => {
          const mockState = {
            config: { configId: 'non-existent-preset' },
            selectPreset: mockSelectPreset,
          };
          return selector(mockState);
        },
      }));

      // Act & Assert
      // この場合、全てのボタンが非アクティブとして表示される
      expect(() => render(<PresetSelector />)).not.toThrow();
    });

    test('プリセットの順序が定義通りにレンダリングされる', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const allButtons = screen.getAllByRole('button');
      const presetValues = Object.values(PRESETS);

      allButtons.forEach((button, index) => {
        const expectedPreset = presetValues[index];
        const buttonName = button.querySelector('.preset-button__name');
        expect(buttonName).toHaveTextContent(expectedPreset.configName);
      });
    });

    test('プリセット数が5つであることを検証', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const presetValues = Object.values(PRESETS);
      expect(presetValues).toHaveLength(5);
      expect(screen.getAllByRole('button')).toHaveLength(5);
    });
  });

  describe('レイアウト構造', () => {
    test('preset-selector クラスを持つ外側のdivが存在する', () => {
      // Arrange & Act
      const { container } = render(<PresetSelector />);

      // Assert
      const outerDiv = container.querySelector('.preset-selector');
      expect(outerDiv).toBeInTheDocument();
    });

    test('preset-selector__grid クラスを持つグリッドコンテナが存在する', () => {
      // Arrange & Act
      const { container } = render(<PresetSelector />);

      // Assert
      const gridContainer = container.querySelector('.preset-selector__grid');
      expect(gridContainer).toBeInTheDocument();
    });

    test('各ボタンが preset-button クラスを持つ', () => {
      // Arrange & Act
      render(<PresetSelector />);

      // Assert
      const allButtons = screen.getAllByRole('button');
      allButtons.forEach((button) => {
        expect(button).toHaveClass('preset-button');
      });
    });

    test('各ボタンに __icon, __name, __description の子要素が存在する', () => {
      // Arrange & Act
      const { container } = render(<PresetSelector />);

      // Assert
      const allButtons = container.querySelectorAll('.preset-button');
      allButtons.forEach((button) => {
        expect(button.querySelector('.preset-button__icon')).toBeInTheDocument();
        expect(button.querySelector('.preset-button__name')).toBeInTheDocument();
        expect(button.querySelector('.preset-button__description')).toBeInTheDocument();
      });
    });
  });

  describe('プリセット定義の整合性', () => {
    test('各プリセットが必須プロパティを持つ', () => {
      // Arrange
      const presetValues = Object.values(PRESETS);

      // Assert
      presetValues.forEach((preset) => {
        expect(preset).toHaveProperty('configId');
        expect(preset).toHaveProperty('configName');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('icon');
        expect(typeof preset.configId).toBe('string');
        expect(typeof preset.configName).toBe('string');
        expect(typeof preset.description).toBe('string');
        expect(typeof preset.icon).toBe('string');
      });
    });

    test('全てのプリセットIDがユニークである', () => {
      // Arrange
      const presetValues = Object.values(PRESETS);
      const configIds = presetValues.map((p) => p.configId);

      // Assert
      const uniqueIds = new Set(configIds);
      expect(uniqueIds.size).toBe(configIds.length);
    });

    test('全てのプリセット名がユニークである', () => {
      // Arrange
      const presetValues = Object.values(PRESETS);
      const configNames = presetValues.map((p) => p.configName);

      // Assert
      const uniqueNames = new Set(configNames);
      expect(uniqueNames.size).toBe(configNames.length);
    });
  });

  describe('スナップショットテスト', () => {
    test('デフォルト状態（基礎練習選択）のスナップショット', () => {
      // Arrange & Act
      const { container } = render(<PresetSelector />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
