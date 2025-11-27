# テストパターン: 統合テスト

## 対象

- `src/__tests__/integration/` に配置
- 複数モジュールの連携、エンドツーエンドのシナリオ
- 描画ロジック（p5.js）、全体フローなど

## 特徴

- **テスト容易性**: 低〜中（モック最小限、実際の連携を検証）
- **TDD方式**: テストレイター（実装完了後に統合を確認）
- **配置**: separated（`src/__tests__/integration/` に分離）

## テストの構造

```typescript
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../App';

describe('統合テスト: 01ゲームフロー', () => {
  test('設定 → 練習 → 結果の一連のフローが動作する', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 設定画面
    await user.selectOptions(screen.getByLabelText('ゲームタイプ'), '501');
    await user.click(screen.getByRole('button', { name: '開始' }));

    // 練習画面
    expect(screen.getByText('501')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: '送信' }));

    // 結果画面
    await screen.findByText(/正解/i);
    expect(screen.getByText('321')).toBeInTheDocument(); // 501 - 180
  });
});
```

## カバーすべきシナリオ

1. **ユーザーシナリオ**: 実際の使用フロー全体
2. **モジュール連携**: ストア ↔ コンポーネント ↔ ユーティリティ
3. **状態遷移**: アプリ全体の状態管理
4. **エッジケース統合**: 複数のエッジケースが組み合わさった場合

## 具体例: drawing.test.ts（p5.js 描画テスト）

```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CoordinateTransform } from '../../utils/coordinateTransform';
import { dartBoardRenderer } from '../../utils/dartBoardRenderer';

describe('統合テスト: ダーツボード描画', () => {
  let mockP5: any;
  let transform: CoordinateTransform;

  beforeEach(() => {
    // p5.js のモック
    mockP5 = {
      fill: vi.fn(),
      stroke: vi.fn(),
      strokeWeight: vi.fn(),
      ellipse: vi.fn(),
      arc: vi.fn(),
      line: vi.fn(),
      noFill: vi.fn(),
      width: 800,
      height: 600,
    };

    transform = new CoordinateTransform(800, 600, 225);
  });

  describe('ボード全体の描画', () => {
    test('すべてのエリア（ブル、トリプル、ダブル）が描画される', () => {
      // Act
      dartBoardRenderer(mockP5, transform);

      // Assert: ellipse が複数回呼ばれている（ブル、各リング）
      expect(mockP5.ellipse).toHaveBeenCalled();
      const ellipseCalls = mockP5.ellipse.mock.calls.length;
      expect(ellipseCalls).toBeGreaterThan(5); // 最低限のリング数

      // Assert: arc が呼ばれている（セグメント描画）
      expect(mockP5.arc).toHaveBeenCalled();
    });

    test('20セグメントが描画される', () => {
      dartBoardRenderer(mockP5, transform);

      // arc は各セグメント × リング数分呼ばれる
      const arcCalls = mockP5.arc.mock.calls.length;
      expect(arcCalls).toBeGreaterThanOrEqual(20); // 最低20セグメント
    });
  });

  describe('座標変換の統合', () => {
    test('物理座標のインナーブルがキャンバス中心に描画される', () => {
      dartBoardRenderer(mockP5, transform);

      // インナーブルは中心に描画されるはず
      const ellipseCalls = mockP5.ellipse.mock.calls;
      const centerEllipse = ellipseCalls.find((call) => {
        const [x, y] = call;
        return Math.abs(x - 400) < 1 && Math.abs(y - 300) < 1;
      });

      expect(centerEllipse).toBeDefined();
    });

    test('物理座標のトリプルリングが正しい位置に描画される', () => {
      dartBoardRenderer(mockP5, transform);

      // トリプルリング: 物理半径 99-107mm
      const expectedScreenRadius = transform.physicalToScreen(103, 0).x - 400;

      const arcCalls = mockP5.arc.mock.calls;
      const tripleArcs = arcCalls.filter((call) => {
        const [x, y, w, h] = call;
        const radius = w / 2;
        return Math.abs(radius - expectedScreenRadius) < 5; // 誤差許容5px
      });

      expect(tripleArcs.length).toBeGreaterThan(0);
    });
  });

  describe('色の設定', () => {
    test('ブルエリアは赤と緑で描画される', () => {
      dartBoardRenderer(mockP5, transform);

      const fillCalls = mockP5.fill.mock.calls;

      // 赤色（インナーブル）
      const redFill = fillCalls.some((call) => {
        const [r, g, b] = call;
        return r > 200 && g < 50 && b < 50;
      });

      // 緑色（アウターブル）
      const greenFill = fillCalls.some((call) => {
        const [r, g, b] = call;
        return r < 50 && g > 200 && b < 50;
      });

      expect(redFill).toBe(true);
      expect(greenFill).toBe(true);
    });
  });
});
```

## 具体例: user-scenario.test.ts（E2Eシナリオ）

```typescript
import { describe, test, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../App';

describe('統合テスト: ユーザーシナリオ', () => {
  describe('初心者練習フロー', () => {
    test('設定 → 1投練習 → 正解 → 次の問題', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 1. 設定画面で初心者設定
      expect(screen.getByRole('heading', { name: /設定/i })).toBeInTheDocument();

      await user.selectOptions(screen.getByLabelText('スキルレベル'), '初心者');
      await user.selectOptions(screen.getByLabelText('投擲単位'), '1投');
      await user.click(screen.getByRole('button', { name: '練習開始' }));

      // 2. 練習画面に遷移
      expect(screen.getByRole('heading', { name: /練習/i })).toBeInTheDocument();

      // ダーツが表示される
      expect(screen.getByText(/ダーツの得点は/i)).toBeInTheDocument();

      // 得点を入力（例: 20点）
      await user.click(screen.getByRole('button', { name: '2' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '送信' }));

      // 3. 結果表示
      const result = await screen.findByText(/正解|不正解/i);
      expect(result).toBeInTheDocument();

      // 4. 次の問題へ
      await user.click(screen.getByRole('button', { name: /次へ|続ける/i }));

      // 新しいダーツが表示される
      expect(screen.getByText(/ダーツの得点は/i)).toBeInTheDocument();
    });
  });

  describe('501ゲームフロー', () => {
    test('設定 → 3投練習 → スコア減算 → ゲーム完了', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 設定
      await user.selectOptions(screen.getByLabelText('ゲームタイプ'), '501');
      await user.selectOptions(screen.getByLabelText('投擲単位'), '3投');
      await user.click(screen.getByRole('button', { name: '練習開始' }));

      // 初期スコア確認
      expect(screen.getByText('501')).toBeInTheDocument();

      // 3投の得点を入力（例: 60, 60, 60 = 180点）
      // 投擲1
      await user.click(screen.getByRole('button', { name: '6' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '送信' }));

      // 投擲2
      await user.click(screen.getByRole('button', { name: '6' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '送信' }));

      // 投擲3
      await user.click(screen.getByRole('button', { name: '6' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '送信' }));

      // 3投合計の質問
      expect(screen.getByText(/3投の合計は/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '8' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '送信' }));

      // スコア減算確認
      await screen.findByText('321'); // 501 - 180 = 321
    });
  });

  describe('エラーハンドリング', () => {
    test('無効な入力でエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: '練習開始' }));

      // 何も入力せずに送信
      await user.click(screen.getByRole('button', { name: '送信' }));

      expect(await screen.findByText(/入力してください/i)).toBeInTheDocument();
    });

    test('180点を超える入力は受け付けない', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: '練習開始' }));

      // 200 を入力しようとする
      await user.click(screen.getByRole('button', { name: '2' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '0' }));

      // 最後の 0 は無視される
      expect(screen.getByRole('textbox')).toHaveValue('20');
    });
  });
});
```

## モックの最小化

統合テストではモックは最小限に：

```typescript
// ✅ 良い例: 外部依存のみモック
vi.mock('p5', () => ({ ... }));

// ❌ 悪い例: 内部モジュールをモック（統合テストの意味がない）
vi.mock('../../utils/scoreCalculator');
vi.mock('../../stores/gameStore');
```

## ディレクトリ構造

```
src/__tests__/
├── integration/
│   ├── drawing.test.ts          # 描画統合テスト
│   ├── tdd-flow.test.ts         # TDDワークフローテスト
│   └── user-scenarios.test.ts   # ユーザーシナリオE2E
└── e2e/
    └── full-game.test.ts         # 完全なゲームフロー
```

## ベストプラクティス

### 1. 実際のユーザー操作を再現

```typescript
// ✅ 良い例
await user.click(screen.getByRole('button', { name: '1' }));
await user.click(screen.getByRole('button', { name: '2' }));
await user.click(screen.getByRole('button', { name: '送信' }));

// ❌ 悪い例
fireEvent.change(input, { target: { value: '12' } }); // 直接値を設定
```

### 2. 状態遷移を確認

```typescript
expect(screen.getByText('設定')).toBeInTheDocument();
// → 操作
expect(screen.queryByText('設定')).not.toBeInTheDocument();
expect(screen.getByText('練習')).toBeInTheDocument();
```

### 3. findBy で非同期を待つ

```typescript
// 結果表示を待つ
const result = await screen.findByText(/正解/i);
expect(result).toBeInTheDocument();
```
