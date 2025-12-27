/**
 * DetailedSettingsコンポーネントのテスト
 * 折りたたみUI、投擲単位・問う内容・判定タイミング・開始点数の選択、条件付きレンダリングを検証
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { JudgmentTiming, QuestionType } from '../../types';
import { DetailedSettings } from './DetailedSettings';

// モック用の型定義
type MockConfig = {
  throwUnit: 1 | 3;
  questionType: QuestionType;
  judgmentTiming: JudgmentTiming;
  startingScore: number | null;
  stdDevMM: number;
};

// 設定モックのファクトリー関数
const createMockConfig = (overrides?: Partial<MockConfig>): MockConfig => ({
  throwUnit: 1,
  questionType: 'score',
  judgmentTiming: 'independent',
  startingScore: null,
  stdDevMM: 15,
  ...overrides,
});

// useGameStoreのモック
const mockSetConfig = vi.fn();
let mockConfig: MockConfig = createMockConfig();

vi.mock('../../stores/gameStore', () => ({
  useGameStore: (
    selector: (state: { config: MockConfig; setConfig: (config: unknown) => void }) => unknown
  ) => {
    const mockState = {
      config: mockConfig,
      setConfig: mockSetConfig,
    };
    return selector(mockState);
  },
}));

describe('DetailedSettings', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
    // デフォルト状態に戻す（ファクトリー関数で新しいオブジェクトを生成）
    mockConfig = createMockConfig();
  });

  describe('基本レンダリング', () => {
    test('折りたたみボタンが表示される', () => {
      // Arrange & Act
      render(<DetailedSettings />);

      // Assert
      const toggleButton = screen.getByRole('button', { name: /詳細設定/ });
      expect(toggleButton).toBeInTheDocument();
    });

    test('初期状態では折りたたまれている（▼が表示される）', () => {
      // Arrange & Act
      render(<DetailedSettings />);

      // Assert
      const toggleButton = screen.getByRole('button', { name: /詳細設定 ▼/ });
      expect(toggleButton).toBeInTheDocument();
    });

    test('初期状態では詳細設定コンテンツが非表示', () => {
      // Arrange & Act
      render(<DetailedSettings />);

      // Assert
      expect(screen.queryByText('投擲単位')).not.toBeInTheDocument();
      expect(screen.queryByText('問う内容')).not.toBeInTheDocument();
    });

    test('折りたたみボタンに type="button" が設定される', () => {
      // Arrange & Act
      render(<DetailedSettings />);

      // Assert
      const toggleButton = screen.getByRole('button', { name: /詳細設定/ });
      expect(toggleButton).toHaveAttribute('type', 'button');
    });

    test('折りたたみボタンに aria-expanded="false" が初期状態で設定される', () => {
      // Arrange & Act
      render(<DetailedSettings />);

      // Assert
      const toggleButton = screen.getByRole('button', { name: /詳細設定/ });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('折りたたみUI', () => {
    test('折りたたみボタンをクリックすると展開される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      const toggleButton = screen.getByRole('button', { name: /詳細設定 ▼/ });
      await user.click(toggleButton);

      // Assert
      expect(screen.getByText('投擲単位')).toBeInTheDocument();
      expect(screen.getByText('問う内容')).toBeInTheDocument();
    });

    test('展開後のボタンテキストに▲が表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      const toggleButton = screen.getByRole('button', { name: /詳細設定/ });
      await user.click(toggleButton);

      // Assert
      expect(screen.getByRole('button', { name: /詳細設定 ▲/ })).toBeInTheDocument();
    });

    test('展開後に aria-expanded="true" が設定される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      const toggleButton = screen.getByRole('button', { name: /詳細設定/ });
      await user.click(toggleButton);

      // Assert
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('再度クリックすると折りたたまれる', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);
      const toggleButton = screen.getByRole('button', { name: /詳細設定/ });

      // Act: 1回目のクリックで展開
      await user.click(toggleButton);
      expect(screen.getByText('投擲単位')).toBeInTheDocument();

      // Act: 2回目のクリックで折りたたみ
      await user.click(toggleButton);

      // Assert
      expect(screen.queryByText('投擲単位')).not.toBeInTheDocument();
      expect(screen.queryByText('問う内容')).not.toBeInTheDocument();
    });

    test('展開時にサブタイトル「投擲単位」「問う内容」が表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      const toggleButton = screen.getByRole('button', { name: /詳細設定/ });
      await user.click(toggleButton);

      // Assert
      const throwUnitSubtitle = screen.getByText('投擲単位');
      const questionTypeSubtitle = screen.getByText('問う内容');

      expect(throwUnitSubtitle).toBeInTheDocument();
      expect(throwUnitSubtitle.tagName).toBe('H3');
      expect(questionTypeSubtitle).toBeInTheDocument();
      expect(questionTypeSubtitle.tagName).toBe('H3');
    });
  });

  describe('投擲単位選択', () => {
    test('1投と3投のボタンが表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.getByRole('button', { name: '1投' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3投' })).toBeInTheDocument();
    });

    test('1投ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const button1 = screen.getByRole('button', { name: '1投' });
      await user.click(button1);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ throwUnit: 1 });
    });

    test('3投ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const button3 = screen.getByRole('button', { name: '3投' });
      await user.click(button3);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ throwUnit: 3 });
    });

    test('選択された投擲単位ボタンに--activeクラスが付与される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button3 = screen.getByRole('button', { name: '3投' });
      expect(button3).toHaveClass('detailed-setting-button--active');
      expect(button3).toHaveClass('detailed-setting-button');
    });

    test('非選択の投擲単位ボタンに--activeクラスが付与されない', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button1 = screen.getByRole('button', { name: '1投' });
      expect(button1).toHaveClass('detailed-setting-button');
      expect(button1).not.toHaveClass('detailed-setting-button--active');
    });

    test('投擲単位ボタンに type="button" が設定される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button1 = screen.getByRole('button', { name: '1投' });
      const button3 = screen.getByRole('button', { name: '3投' });

      expect(button1).toHaveAttribute('type', 'button');
      expect(button3).toHaveAttribute('type', 'button');
    });

    test('選択された投擲単位ボタンに aria-pressed="true" が設定される', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button1 = screen.getByRole('button', { name: '1投' });
      expect(button1).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択の投擲単位ボタンに aria-pressed="false" が設定される', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button3 = screen.getByRole('button', { name: '3投' });
      expect(button3).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('問う内容選択', () => {
    test('得点・残り点数・両方のボタンが表示される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.getByRole('button', { name: '得点' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '残り点数' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '両方' })).toBeInTheDocument();
    });

    test('得点ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const scoreButton = screen.getByRole('button', { name: '得点' });
      await user.click(scoreButton);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ questionType: 'score' });
    });

    test('残り点数ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const remainingButton = screen.getByRole('button', { name: '残り点数' });
      await user.click(remainingButton);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ questionType: 'remaining' });
    });

    test('両方ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const bothButton = screen.getByRole('button', { name: '両方' });
      await user.click(bothButton);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ questionType: 'both' });
    });

    test('選択された問う内容ボタンに--activeクラスが付与される', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const remainingButton = screen.getByRole('button', { name: '残り点数' });
      expect(remainingButton).toHaveClass('detailed-setting-button--active');
      expect(remainingButton).toHaveClass('detailed-setting-button');
    });

    test('非選択の問う内容ボタンに--activeクラスが付与されない', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const scoreButton = screen.getByRole('button', { name: '得点' });
      const bothButton = screen.getByRole('button', { name: '両方' });

      expect(scoreButton).toHaveClass('detailed-setting-button');
      expect(scoreButton).not.toHaveClass('detailed-setting-button--active');
      expect(bothButton).not.toHaveClass('detailed-setting-button--active');
    });

    test('問う内容ボタンに type="button" が設定される', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const scoreButton = screen.getByRole('button', { name: '得点' });
      const remainingButton = screen.getByRole('button', { name: '残り点数' });
      const bothButton = screen.getByRole('button', { name: '両方' });

      expect(scoreButton).toHaveAttribute('type', 'button');
      expect(remainingButton).toHaveAttribute('type', 'button');
      expect(bothButton).toHaveAttribute('type', 'button');
    });

    test('選択された問う内容ボタンに aria-pressed="true" が設定される', async () => {
      // Arrange
      mockConfig.questionType = 'both';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const bothButton = screen.getByRole('button', { name: '両方' });
      expect(bothButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択の問う内容ボタンに aria-pressed="false" が設定される', async () => {
      // Arrange
      mockConfig.questionType = 'both';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const scoreButton = screen.getByRole('button', { name: '得点' });
      const remainingButton = screen.getByRole('button', { name: '残り点数' });

      expect(scoreButton).toHaveAttribute('aria-pressed', 'false');
      expect(remainingButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('判定タイミング選択（3投モード時のみ表示）', () => {
    test('1投モード時に判定タイミングが非表示', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.queryByText('判定タイミング')).not.toBeInTheDocument();
    });

    test('3投モード時に判定タイミングが表示される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const subtitle = screen.getByText('判定タイミング');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.tagName).toBe('H3');
    });

    test('3投モード時に独立と累積のボタンが表示される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.getByRole('button', { name: '独立' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '累積' })).toBeInTheDocument();
    });

    test('独立ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const independentButton = screen.getByRole('button', { name: '独立' });
      await user.click(independentButton);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ judgmentTiming: 'independent' });
    });

    test('累積ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const cumulativeButton = screen.getByRole('button', { name: '累積' });
      await user.click(cumulativeButton);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ judgmentTiming: 'cumulative' });
    });

    test('選択された判定タイミングボタンに--activeクラスが付与される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.judgmentTiming = 'cumulative';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const cumulativeButton = screen.getByRole('button', { name: '累積' });
      expect(cumulativeButton).toHaveClass('detailed-setting-button--active');
      expect(cumulativeButton).toHaveClass('detailed-setting-button');
    });

    test('非選択の判定タイミングボタンに--activeクラスが付与されない', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.judgmentTiming = 'cumulative';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const independentButton = screen.getByRole('button', { name: '独立' });
      expect(independentButton).toHaveClass('detailed-setting-button');
      expect(independentButton).not.toHaveClass('detailed-setting-button--active');
    });

    test('判定タイミングボタンに type="button" が設定される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const independentButton = screen.getByRole('button', { name: '独立' });
      const cumulativeButton = screen.getByRole('button', { name: '累積' });

      expect(independentButton).toHaveAttribute('type', 'button');
      expect(cumulativeButton).toHaveAttribute('type', 'button');
    });

    test('選択された判定タイミングボタンに aria-pressed="true" が設定される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.judgmentTiming = 'independent';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const independentButton = screen.getByRole('button', { name: '独立' });
      expect(independentButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択の判定タイミングボタンに aria-pressed="false" が設定される', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.judgmentTiming = 'independent';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const cumulativeButton = screen.getByRole('button', { name: '累積' });
      expect(cumulativeButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('開始点数選択（remaining/bothモード時のみ表示）', () => {
    test('scoreモード時に開始点数が非表示', async () => {
      // Arrange
      mockConfig.questionType = 'score';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.queryByText('開始点数')).not.toBeInTheDocument();
    });

    test('remainingモード時に開始点数が表示される', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const subtitle = screen.getByText('開始点数');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.tagName).toBe('H3');
    });

    test('bothモード時に開始点数が表示される', async () => {
      // Arrange
      mockConfig.questionType = 'both';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const subtitle = screen.getByText('開始点数');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.tagName).toBe('H3');
    });

    test('remainingモード時に501/701/301のボタンが表示される', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.getByRole('button', { name: '501' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '701' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '301' })).toBeInTheDocument();
    });

    test('501ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const button501 = screen.getByRole('button', { name: '501' });
      await user.click(button501);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ startingScore: 501 });
    });

    test('701ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const button701 = screen.getByRole('button', { name: '701' });
      await user.click(button701);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ startingScore: 701 });
    });

    test('301ボタンをクリックするとsetConfigが呼び出される', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act
      const button301 = screen.getByRole('button', { name: '301' });
      await user.click(button301);

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(1);
      expect(mockSetConfig).toHaveBeenCalledWith({ startingScore: 301 });
    });

    test('選択された開始点数ボタンに--activeクラスが付与される', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      mockConfig.startingScore = 701;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button701 = screen.getByRole('button', { name: '701' });
      expect(button701).toHaveClass('detailed-setting-button--active');
      expect(button701).toHaveClass('detailed-setting-button');
    });

    test('非選択の開始点数ボタンに--activeクラスが付与されない', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      mockConfig.startingScore = 701;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button501 = screen.getByRole('button', { name: '501' });
      const button301 = screen.getByRole('button', { name: '301' });

      expect(button501).toHaveClass('detailed-setting-button');
      expect(button501).not.toHaveClass('detailed-setting-button--active');
      expect(button301).not.toHaveClass('detailed-setting-button--active');
    });

    test('開始点数ボタンに type="button" が設定される', async () => {
      // Arrange
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button501 = screen.getByRole('button', { name: '501' });
      const button701 = screen.getByRole('button', { name: '701' });
      const button301 = screen.getByRole('button', { name: '301' });

      expect(button501).toHaveAttribute('type', 'button');
      expect(button701).toHaveAttribute('type', 'button');
      expect(button301).toHaveAttribute('type', 'button');
    });

    test('選択された開始点数ボタンに aria-pressed="true" が設定される', async () => {
      // Arrange
      mockConfig.questionType = 'both';
      mockConfig.startingScore = 301;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button301 = screen.getByRole('button', { name: '301' });
      expect(button301).toHaveAttribute('aria-pressed', 'true');
    });

    test('非選択の開始点数ボタンに aria-pressed="false" が設定される', async () => {
      // Arrange
      mockConfig.questionType = 'both';
      mockConfig.startingScore = 301;
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const button501 = screen.getByRole('button', { name: '501' });
      const button701 = screen.getByRole('button', { name: '701' });

      expect(button501).toHaveAttribute('aria-pressed', 'false');
      expect(button701).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('条件付きレンダリング', () => {
    test('1投かつscoreモードの場合、判定タイミングと開始点数が両方非表示', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      mockConfig.questionType = 'score';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.queryByText('判定タイミング')).not.toBeInTheDocument();
      expect(screen.queryByText('開始点数')).not.toBeInTheDocument();
    });

    test('3投かつscoreモードの場合、判定タイミングのみ表示', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.questionType = 'score';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.getByText('判定タイミング')).toBeInTheDocument();
      expect(screen.queryByText('開始点数')).not.toBeInTheDocument();
    });

    test('1投かつremainingモードの場合、開始点数のみ表示', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.queryByText('判定タイミング')).not.toBeInTheDocument();
      expect(screen.getByText('開始点数')).toBeInTheDocument();
    });

    test('3投かつremainingモードの場合、判定タイミングと開始点数が両方表示', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.questionType = 'remaining';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.getByText('判定タイミング')).toBeInTheDocument();
      expect(screen.getByText('開始点数')).toBeInTheDocument();
    });

    test('3投かつbothモードの場合、判定タイミングと開始点数が両方表示', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.questionType = 'both';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.getByText('判定タイミング')).toBeInTheDocument();
      expect(screen.getByText('開始点数')).toBeInTheDocument();
    });

    test('1投かつbothモードの場合、開始点数のみ表示', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      mockConfig.questionType = 'both';
      const user = userEvent.setup();
      render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(screen.queryByText('判定タイミング')).not.toBeInTheDocument();
      expect(screen.getByText('開始点数')).toBeInTheDocument();
    });
  });

  describe('スナップショットテスト', () => {
    test('折りたたみ状態のスナップショット', () => {
      // Arrange
      mockConfig.throwUnit = 1;
      mockConfig.questionType = 'score';

      // Act
      const { container } = render(<DetailedSettings />);

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('展開状態のスナップショット（1投、scoreモード）', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      mockConfig.questionType = 'score';
      const user = userEvent.setup();
      const { container } = render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('3投モード時のスナップショット（判定タイミング表示）', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.questionType = 'score';
      mockConfig.judgmentTiming = 'cumulative';
      const user = userEvent.setup();
      const { container } = render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('remainingモード時のスナップショット（開始点数表示）', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      mockConfig.questionType = 'remaining';
      mockConfig.startingScore = 501;
      const user = userEvent.setup();
      const { container } = render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(container).toMatchSnapshot();
    });

    test('全フィールド表示時のスナップショット（3投、bothモード）', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.questionType = 'both';
      mockConfig.judgmentTiming = 'independent';
      mockConfig.startingScore = 701;
      const user = userEvent.setup();
      const { container } = render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      expect(container).toMatchSnapshot();
    });
  });

  describe('レイアウト構造', () => {
    test('detailed-settings クラスを持つ外側のdivが存在する', () => {
      // Arrange & Act
      const { container } = render(<DetailedSettings />);

      // Assert
      const outerDiv = container.querySelector('.detailed-settings');
      expect(outerDiv).toBeInTheDocument();
    });

    test('detailed-settings__toggle クラスを持つボタンが存在する', () => {
      // Arrange & Act
      const { container } = render(<DetailedSettings />);

      // Assert
      const toggleButton = container.querySelector('.detailed-settings__toggle');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton?.tagName).toBe('BUTTON');
    });

    test('展開時に detailed-settings__content クラスを持つdivが存在する', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const contentDiv = container.querySelector('.detailed-settings__content');
      expect(contentDiv).toBeInTheDocument();
    });

    test('展開時に detailed-settings__section クラスを持つdivが複数存在する', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.questionType = 'both';
      const user = userEvent.setup();
      const { container } = render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const sections = container.querySelectorAll('.detailed-settings__section');
      // 投擲単位、問う内容、判定タイミング、開始点数の4セクション
      expect(sections.length).toBe(4);
    });

    test('展開時に detailed-settings__buttons クラスを持つdivが存在する', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<DetailedSettings />);

      // Act
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Assert
      const buttonContainers = container.querySelectorAll('.detailed-settings__buttons');
      // 投擲単位と問う内容の2つ（最低限）
      expect(buttonContainers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('統合シナリオ', () => {
    test('投擲単位を3投に変更すると判定タイミングが表示される', async () => {
      // Arrange
      mockConfig.throwUnit = 1;
      const user = userEvent.setup();
      const { rerender } = render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act: 3投に変更（実際はストア側でthrowUnitが変わることをシミュレート）
      mockConfig.throwUnit = 3;
      rerender(<DetailedSettings />);

      // Assert
      expect(screen.getByText('判定タイミング')).toBeInTheDocument();
    });

    test('問う内容をremainingに変更すると開始点数が表示される', async () => {
      // Arrange
      mockConfig.questionType = 'score';
      const user = userEvent.setup();
      const { rerender } = render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act: remainingに変更（実際はストア側でquestionTypeが変わることをシミュレート）
      mockConfig.questionType = 'remaining';
      rerender(<DetailedSettings />);

      // Assert
      expect(screen.getByText('開始点数')).toBeInTheDocument();
    });

    test('複数の設定を連続して変更できる', async () => {
      // Arrange
      mockConfig.throwUnit = 3;
      mockConfig.questionType = 'both';
      const user = userEvent.setup();
      render(<DetailedSettings />);
      await user.click(screen.getByRole('button', { name: /詳細設定/ }));

      // Act: 複数のボタンをクリック
      await user.click(screen.getByRole('button', { name: '1投' }));
      await user.click(screen.getByRole('button', { name: '残り点数' }));
      await user.click(screen.getByRole('button', { name: '501' }));

      // Assert
      expect(mockSetConfig).toHaveBeenCalledTimes(3);
      expect(mockSetConfig).toHaveBeenNthCalledWith(1, { throwUnit: 1 });
      expect(mockSetConfig).toHaveBeenNthCalledWith(2, { questionType: 'remaining' });
      expect(mockSetConfig).toHaveBeenNthCalledWith(3, { startingScore: 501 });
    });
  });
});
