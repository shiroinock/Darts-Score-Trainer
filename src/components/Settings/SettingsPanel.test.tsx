/**
 * SettingsPanelコンポーネントのテスト
 * 統合設定パネル、サマリー表示、練習開始ボタンのテストを検証
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PracticeConfig, SessionConfig } from '../../types';
import { SettingsPanel } from './SettingsPanel';

// モック用の型定義
type MockState = {
  config: PracticeConfig;
  sessionConfig: SessionConfig;
  startPractice: () => void;
};

// 設定モックのファクトリー関数
const createMockState = (overrides?: Partial<MockState>): MockState => ({
  config: {
    configId: 'preset-basic',
    configName: '基礎練習',
    throwUnit: 1,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: null,
    stdDevMM: 15,
    isPreset: true,
  },
  sessionConfig: {
    mode: 'questions',
    questionCount: 10,
    timeLimit: undefined,
  },
  startPractice: vi.fn(),
  ...overrides,
});

// useGameStoreのモック
let mockState: MockState = createMockState();

vi.mock('../../stores/gameStore', () => ({
  useGameStore: (selector: (state: MockState) => unknown) => {
    return selector(mockState);
  },
}));

// 子コンポーネントのモック
vi.mock('./PresetSelector', () => ({
  PresetSelector: () => <div data-testid="preset-selector">PresetSelector</div>,
}));

vi.mock('./SessionConfigSelector', () => ({
  SessionConfigSelector: () => (
    <div data-testid="session-config-selector">SessionConfigSelector</div>
  ),
}));

vi.mock('./DetailedSettings', () => ({
  DetailedSettings: () => <div data-testid="detailed-settings">DetailedSettings</div>,
}));

vi.mock('./TargetSelector', () => ({
  TargetSelector: () => <div data-testid="target-selector">TargetSelector</div>,
}));

vi.mock('./DifficultySelector', () => ({
  DifficultySelector: () => <div data-testid="difficulty-selector">DifficultySelector</div>,
  // DIFFICULTY_PRESETSもエクスポート（getDifficultyLabel関数が使用）
  DIFFICULTY_PRESETS: [
    { label: '初心者', stdDevMM: 50 },
    { label: '中級者', stdDevMM: 30 },
    { label: '上級者', stdDevMM: 15 },
    { label: 'エキスパート', stdDevMM: 8 },
  ],
}));

describe('SettingsPanel', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
    // デフォルト状態に戻す
    mockState = createMockState();
  });

  describe('基本レンダリング', () => {
    test('SettingsPanelコンポーネントが正常にレンダリングされる', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      const panel = screen.getByRole('button', { name: '練習を開始' }).closest('.settings-panel');
      expect(panel).toBeInTheDocument();
    });

    test('4つの子コンポーネントが全て存在する', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByTestId('preset-selector')).toBeInTheDocument();
      expect(screen.getByTestId('session-config-selector')).toBeInTheDocument();
      expect(screen.getByTestId('detailed-settings')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-selector')).toBeInTheDocument();
    });

    test('設定サマリーセクションが表示される', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('現在の設定')).toBeInTheDocument();
    });

    test('練習開始ボタンが表示される', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      const startButton = screen.getByRole('button', { name: '練習を開始' });
      expect(startButton).toBeInTheDocument();
      expect(startButton).toHaveTextContent('練習を開始');
    });
  });

  describe('子コンポーネントのレンダリング順序', () => {
    test('コンポーネントが正しい順序で表示される', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const panel = container.querySelector('.settings-panel');
      const children = panel?.children;

      expect(children).toHaveLength(6); // 4つの設定 + サマリー + ボタン
      expect(children?.[0]).toHaveAttribute('data-testid', 'preset-selector');
      expect(children?.[1]).toHaveAttribute('data-testid', 'session-config-selector');
      expect(children?.[2]).toHaveAttribute('data-testid', 'difficulty-selector');
      expect(children?.[3]).toHaveAttribute('data-testid', 'detailed-settings');
      expect(children?.[4]).toHaveClass('settings-panel__summary');
      expect(children?.[5]).toHaveClass('settings-panel__start-button');
    });
  });

  describe('設定サマリー表示 - プリセット名', () => {
    test('プリセット「基礎練習」が正しく表示される', () => {
      // Arrange
      mockState.config.configId = 'preset-basic';
      mockState.config.configName = '基礎練習';
      mockState.config.isPreset = true;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('プリセット:')).toBeInTheDocument();
      expect(screen.getByText('基礎練習')).toBeInTheDocument();
    });

    test('プリセット「プレイヤー練習」が正しく表示される', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-player',
        configName: 'プレイヤー練習',
        throwUnit: 3,
        questionType: 'score', // プリセット定義に合わせて修正
        judgmentTiming: 'independent',
        startingScore: null,
        stdDevMM: 15,
        isPreset: true,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('プレイヤー練習')).toBeInTheDocument();
    });

    test('プリセット「コーラー基礎」が正しく表示される', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-caller-basic',
        configName: 'コーラー基礎',
        throwUnit: 3, // プリセット定義に合わせて修正
        questionType: 'remaining',
        judgmentTiming: 'independent',
        startingScore: 501,
        stdDevMM: 15,
        isPreset: true,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('コーラー基礎')).toBeInTheDocument();
    });

    test('プリセット「コーラー累積」が正しく表示される', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-caller-cumulative',
        configName: 'コーラー累積',
        throwUnit: 3, // プリセット定義に合わせて修正
        questionType: 'remaining',
        judgmentTiming: 'cumulative',
        startingScore: 501,
        stdDevMM: 15,
        isPreset: true,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('コーラー累積')).toBeInTheDocument();
    });

    test('プリセット「総合練習」が正しく表示される', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-comprehensive',
        configName: '総合練習',
        throwUnit: 3,
        questionType: 'both',
        judgmentTiming: 'cumulative', // プリセット定義に合わせて修正
        startingScore: 501,
        stdDevMM: 15,
        isPreset: true,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('総合練習')).toBeInTheDocument();
    });

    test('カスタム設定の場合、「カスタム設定」と表示される', () => {
      // Arrange
      // プリセットに一致しない設定（基礎練習のthrowUnitだけ変更してもプレイヤー練習と一致してしまうため、難易度も変更）
      mockState.config = {
        configId: 'custom',
        configName: 'カスタム',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
        stdDevMM: 25, // カスタム難易度にしてどのプリセットとも一致しないようにする
        isPreset: false,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム設定')).toBeInTheDocument();
    });

    test('プリセットの一部が異なる場合、「カスタム設定」と表示される', () => {
      // Arrange
      // 基礎練習とほぼ同じだが、stdDevMMが異なる
      mockState.config = {
        configId: 'preset-basic',
        configName: '基礎練習',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
        stdDevMM: 30, // 異なる難易度
        isPreset: false,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム設定')).toBeInTheDocument();
    });
  });

  describe('設定サマリー表示 - セッション設定', () => {
    test('問題数モード: 10問が正しく表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'questions',
        questionCount: 10,
        timeLimit: undefined,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('セッション:')).toBeInTheDocument();
      expect(screen.getByText('問題数モード: 10問')).toBeInTheDocument();
    });

    test('問題数モード: 20問が正しく表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'questions',
        questionCount: 20,
        timeLimit: undefined,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('問題数モード: 20問')).toBeInTheDocument();
    });

    test('問題数モード: 50問が正しく表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'questions',
        questionCount: 50,
        timeLimit: undefined,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('問題数モード: 50問')).toBeInTheDocument();
    });

    test('時間制限モード: 3分が正しく表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 3,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('時間制限モード: 3分')).toBeInTheDocument();
    });

    test('時間制限モード: 5分が正しく表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 5,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('時間制限モード: 5分')).toBeInTheDocument();
    });

    test('時間制限モード: 10分が正しく表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 10,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('時間制限モード: 10分')).toBeInTheDocument();
    });

    test('問題数がundefinedの場合、デフォルト10問が表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'questions',
        questionCount: undefined,
        timeLimit: undefined,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('問題数モード: 10問')).toBeInTheDocument();
    });

    test('時間制限がundefinedの場合、デフォルト3分が表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'time',
        questionCount: undefined,
        timeLimit: undefined,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('時間制限モード: 3分')).toBeInTheDocument();
    });
  });

  describe('設定サマリー表示 - 難易度情報', () => {
    test('難易度「初心者」が正しく表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 50;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('難易度:')).toBeInTheDocument();
      expect(screen.getByText('初心者')).toBeInTheDocument();
    });

    test('難易度「中級者」が正しく表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 30;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('中級者')).toBeInTheDocument();
    });

    test('難易度「上級者」が正しく表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 15;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('上級者')).toBeInTheDocument();
    });

    test('難易度「エキスパート」が正しく表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 8;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('エキスパート')).toBeInTheDocument();
    });

    test('カスタム難易度「カスタム 25mm」が正しく表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 25;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム 25mm')).toBeInTheDocument();
    });

    test('カスタム難易度「カスタム 100mm」が正しく表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 100;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム 100mm')).toBeInTheDocument();
    });

    test('カスタム難易度「カスタム 5mm」が正しく表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 5;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム 5mm')).toBeInTheDocument();
    });
  });

  describe('サマリーセクションの構造', () => {
    test('サマリーセクションのタイトルがH2要素である', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      const title = screen.getByText('現在の設定');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H2');
    });

    test('サマリーセクションが3つの項目を持つ', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const summaryContent = container.querySelector('.settings-panel__summary-content');
      expect(summaryContent).toBeInTheDocument();

      const items = summaryContent?.querySelectorAll('.settings-panel__summary-item');
      expect(items).toHaveLength(3); // プリセット、セッション、難易度
    });

    test('各サマリー項目がラベルと値のペアを持つ', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const items = container.querySelectorAll('.settings-panel__summary-item');

      items.forEach((item) => {
        const label = item.querySelector('.settings-panel__summary-label');
        const value = item.querySelector('.settings-panel__summary-value');

        expect(label).toBeInTheDocument();
        expect(value).toBeInTheDocument();
      });
    });

    test('サマリー項目が正しい順序で表示される', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const labels = container.querySelectorAll('.settings-panel__summary-label');

      expect(labels[0]).toHaveTextContent('プリセット:');
      expect(labels[1]).toHaveTextContent('セッション:');
      expect(labels[2]).toHaveTextContent('難易度:');
    });
  });

  describe('練習開始ボタンの動作', () => {
    test('ボタンをクリックするとstartPractice()が呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      const startButton = screen.getByRole('button', { name: '練習を開始' });
      await user.click(startButton);

      // Assert
      expect(mockState.startPractice).toHaveBeenCalledTimes(1);
    });

    test('ボタンを複数回クリックすると複数回呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Act
      const startButton = screen.getByRole('button', { name: '練習を開始' });
      await user.click(startButton);
      await user.click(startButton);
      await user.click(startButton);

      // Assert
      expect(mockState.startPractice).toHaveBeenCalledTimes(3);
    });

    test('ボタンがtype="button"を持つ', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      const startButton = screen.getByRole('button', { name: '練習を開始' });
      expect(startButton).toHaveAttribute('type', 'button');
    });

    test('ボタンがaria-label属性を持つ', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      const startButton = screen.getByRole('button', { name: '練習を開始' });
      expect(startButton).toHaveAttribute('aria-label', '練習を開始');
    });

    test('ボタンが適切なCSSクラスを持つ', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      const startButton = screen.getByRole('button', { name: '練習を開始' });
      expect(startButton).toHaveClass('settings-panel__start-button');
    });
  });

  describe('レイアウト構造', () => {
    test('settings-panel クラスを持つ外側のdivが存在する', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const panel = container.querySelector('.settings-panel');
      expect(panel).toBeInTheDocument();
    });

    test('settings-panel__summary クラスを持つサマリーセクションが存在する', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const summary = container.querySelector('.settings-panel__summary');
      expect(summary).toBeInTheDocument();
    });

    test('settings-panel__summary-title クラスを持つタイトルが存在する', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const title = container.querySelector('.settings-panel__summary-title');
      expect(title).toBeInTheDocument();
      expect(title?.tagName).toBe('H2');
    });

    test('settings-panel__summary-content クラスを持つコンテンツ領域が存在する', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const content = container.querySelector('.settings-panel__summary-content');
      expect(content).toBeInTheDocument();
    });

    test('settings-panel__start-button クラスを持つボタンが存在する', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const button = container.querySelector('.settings-panel__start-button');
      expect(button).toBeInTheDocument();
      expect(button?.tagName).toBe('BUTTON');
    });
  });

  describe('統合シナリオ', () => {
    test('全プリセット + 問題数モード + 各難易度の組み合わせ', () => {
      // Arrange & Act
      const { rerender } = render(<SettingsPanel />);

      // 基礎練習 + 問題数10問 + 上級者
      expect(screen.getByText('基礎練習')).toBeInTheDocument();
      expect(screen.getByText('問題数モード: 10問')).toBeInTheDocument();
      expect(screen.getByText('上級者')).toBeInTheDocument();

      // 設定を変更
      mockState.config.stdDevMM = 50;
      mockState.sessionConfig.timeLimit = 5;
      mockState.sessionConfig.mode = 'time';

      rerender(<SettingsPanel />);

      expect(screen.getByText('時間制限モード: 5分')).toBeInTheDocument();
      expect(screen.getByText('初心者')).toBeInTheDocument();
    });

    test('カスタム設定 + 時間制限モード + カスタム難易度', () => {
      // Arrange
      mockState.config = {
        configId: 'custom',
        configName: 'カスタム',
        throwUnit: 3,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
        stdDevMM: 25,
        isPreset: false,
      };
      mockState.sessionConfig = {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 10,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム設定')).toBeInTheDocument();
      expect(screen.getByText('時間制限モード: 10分')).toBeInTheDocument();
      expect(screen.getByText('カスタム 25mm')).toBeInTheDocument();
    });

    test('すべての子コンポーネントとサマリーが同時に表示される', () => {
      // Act
      render(<SettingsPanel />);

      // Assert - 子コンポーネント
      expect(screen.getByTestId('preset-selector')).toBeInTheDocument();
      expect(screen.getByTestId('session-config-selector')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-selector')).toBeInTheDocument();
      expect(screen.getByTestId('detailed-settings')).toBeInTheDocument();

      // Assert - サマリー
      expect(screen.getByText('現在の設定')).toBeInTheDocument();
      expect(screen.getByText('プリセット:')).toBeInTheDocument();
      expect(screen.getByText('セッション:')).toBeInTheDocument();
      expect(screen.getByText('難易度:')).toBeInTheDocument();

      // Assert - ボタン
      expect(screen.getByRole('button', { name: '練習を開始' })).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    test('問題数が最小値(10問)の場合でも正常に表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'questions',
        questionCount: 10,
        timeLimit: undefined,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('問題数モード: 10問')).toBeInTheDocument();
    });

    test('時間制限が最小値(3分)の場合でも正常に表示される', () => {
      // Arrange
      mockState.sessionConfig = {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 3,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('時間制限モード: 3分')).toBeInTheDocument();
    });

    test('標準偏差が極端に小さい値(1mm)でも正常に表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 1;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム 1mm')).toBeInTheDocument();
    });

    test('標準偏差が極端に大きい値(500mm)でも正常に表示される', () => {
      // Arrange
      mockState.config.stdDevMM = 500;

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム 500mm')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('サマリータイトルがセマンティックなH2要素である', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      const title = screen.getByText('現在の設定');
      expect(title.tagName).toBe('H2');
      expect(title).toHaveClass('settings-panel__summary-title');
    });

    test('練習開始ボタンが適切なaria-label属性を持つ', () => {
      // Act
      render(<SettingsPanel />);

      // Assert
      const button = screen.getByRole('button', { name: '練習を開始' });
      expect(button).toHaveAttribute('aria-label', '練習を開始');
    });

    test('サマリー項目のラベルと値が適切に構造化されている', () => {
      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      const items = container.querySelectorAll('.settings-panel__summary-item');

      items.forEach((item) => {
        const label = item.querySelector('.settings-panel__summary-label');
        const value = item.querySelector('.settings-panel__summary-value');

        expect(label).toBeInTheDocument();
        expect(value).toBeInTheDocument();

        // spanタグでマークアップされている
        expect(label?.tagName).toBe('SPAN');
        expect(value?.tagName).toBe('SPAN');
      });
    });
  });

  describe('スナップショットテスト', () => {
    test('基礎練習 + 問題数10問 + 上級者のスナップショット', () => {
      // Arrange
      mockState = createMockState();

      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('カスタム設定 + 時間制限5分 + カスタム25mmのスナップショット', () => {
      // Arrange
      mockState.config = {
        configId: 'custom',
        configName: 'カスタム',
        throwUnit: 3,
        questionType: 'both',
        judgmentTiming: 'cumulative',
        startingScore: 701,
        stdDevMM: 25,
        isPreset: false,
      };
      mockState.sessionConfig = {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 5,
      };

      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    test('総合練習 + 時間制限10分 + 初心者のスナップショット', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-comprehensive',
        configName: '総合練習',
        throwUnit: 3,
        questionType: 'both',
        judgmentTiming: 'cumulative', // プリセット定義に合わせて修正
        startingScore: 501,
        stdDevMM: 50,
        isPreset: true,
      };
      mockState.sessionConfig = {
        mode: 'time',
        questionCount: undefined,
        timeLimit: 10,
      };

      // Act
      const { container } = render(<SettingsPanel />);

      // Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('プリセット判定ロジック（findMatchingPreset）', () => {
    test('全てのプロパティが一致する場合、プリセット名が表示される', () => {
      // Arrange - 基礎練習のプリセット設定と完全一致
      mockState.config = {
        configId: 'preset-basic',
        configName: '基礎練習',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
        stdDevMM: 15,
        isPreset: true,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('基礎練習')).toBeInTheDocument();
      expect(screen.queryByText('カスタム設定')).not.toBeInTheDocument();
    });

    test('throwUnitが異なる場合、カスタム設定と判定される', () => {
      // Arrange
      // throwUnitを3に変更するとプレイヤー練習と一致してしまうため、難易度も変更
      mockState.config = {
        configId: 'preset-basic',
        configName: '基礎練習',
        throwUnit: 3, // 異なる値
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
        stdDevMM: 25, // カスタム難易度にしてどのプリセットとも一致しないようにする
        isPreset: false,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム設定')).toBeInTheDocument();
      expect(screen.queryByText('基礎練習')).not.toBeInTheDocument();
    });

    test('questionTypeが異なる場合、カスタム設定と判定される', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-basic',
        configName: '基礎練習',
        throwUnit: 1,
        questionType: 'remaining', // 異なる値
        judgmentTiming: 'independent',
        startingScore: null,
        stdDevMM: 15,
        isPreset: false,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム設定')).toBeInTheDocument();
    });

    test('judgmentTimingが異なる場合、カスタム設定と判定される', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-basic',
        configName: '基礎練習',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'cumulative', // 異なる値
        startingScore: null,
        stdDevMM: 15,
        isPreset: false,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム設定')).toBeInTheDocument();
    });

    test('startingScoreが異なる場合、カスタム設定と判定される', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-basic',
        configName: '基礎練習',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: 501, // 異なる値
        stdDevMM: 15,
        isPreset: false,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム設定')).toBeInTheDocument();
    });

    test('stdDevMMが異なる場合、カスタム設定と判定される', () => {
      // Arrange
      mockState.config = {
        configId: 'preset-basic',
        configName: '基礎練習',
        throwUnit: 1,
        questionType: 'score',
        judgmentTiming: 'independent',
        startingScore: null,
        stdDevMM: 30, // 異なる値
        isPreset: false,
      };

      // Act
      render(<SettingsPanel />);

      // Assert
      expect(screen.getByText('カスタム設定')).toBeInTheDocument();
    });
  });
});
