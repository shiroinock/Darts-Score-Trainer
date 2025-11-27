# テストパターン: React コンポーネントのテスト

## 対象

- `src/components/` 配下の UI コンポーネント
- Settings, Practice, Results, DartBoard など

## 特徴

- **テスト容易性**: 中〜高（React Testing Library使用）
- **TDD方式**: テストレイター（実装後にテスト）
- **配置**: colocated（`Component.tsx` と `Component.test.tsx` を同階層）

## テストの構造

```typescript
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from './Component';

describe('Component', () => {
  test('レンダリングされる', () => {
    render(<Component />);
    expect(screen.getByRole('...  ')).toBeInTheDocument();
  });

  test('ユーザー操作で状態が変わる', async () => {
    const user = userEvent.setup();
    render(<Component />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
```

## カバーすべきシナリオ

1. **レンダリング**: 初期表示が正しいか
2. **ユーザー操作**: クリック、入力、フォーカスなど
3. **条件付きレンダリング**: props や state に応じた表示切り替え
4. **イベントハンドラ**: コールバック関数の呼び出し
5. **アクセシビリティ**: role, aria属性の検証

## 具体例: NumPad.tsx

```typescript
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumPad } from './NumPad';

describe('NumPad', () => {
  describe('レンダリング', () => {
    test('数字ボタン0-9が表示される', () => {
      render(<NumPad onSubmit={vi.fn()} />);

      for (let i = 0; i <= 9; i++) {
        expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
    });

    test('クリアボタンが表示される', () => {
      render(<NumPad onSubmit={vi.fn()} />);
      expect(screen.getByRole('button', { name: /clear|C/i })).toBeInTheDocument();
    });

    test('送信ボタンが表示される', () => {
      render(<NumPad onSubmit={vi.fn()} />);
      expect(screen.getByRole('button', { name: /submit|OK|確定/i })).toBeInTheDocument();
    });

    test('入力値を表示するテキストボックスがある', () => {
      render(<NumPad onSubmit={vi.fn()} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('数字ボタンをクリックすると入力値が更新される', async () => {
      const user = userEvent.setup();
      render(<NumPad onSubmit={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '2' }));
      await user.click(screen.getByRole('button', { name: '3' }));

      expect(screen.getByRole('textbox')).toHaveValue('123');
    });

    test('クリアボタンで入力値がリセットされる', async () => {
      const user = userEvent.setup();
      render(<NumPad onSubmit={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: '9' }));
      expect(screen.getByRole('textbox')).toHaveValue('9');

      await user.click(screen.getByRole('button', { name: /clear|C/i }));

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    test('送信ボタンで onSubmit が呼ばれる', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<NumPad onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '8' }));
      await user.click(screen.getByRole('button', { name: /submit|OK|確定/i }));

      expect(onSubmit).toHaveBeenCalledWith(18);
    });

    test('Enterキーで送信される', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<NumPad onSubmit={onSubmit} />);

      const textbox = screen.getByRole('textbox');
      await user.click(textbox);
      await user.type(textbox, '45{Enter}');

      expect(onSubmit).toHaveBeenCalledWith(45);
    });
  });

  describe('バリデーション', () => {
    test('空の状態で送信するとエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<NumPad onSubmit={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /submit|OK|確定/i }));

      expect(screen.getByText(/入力してください/i)).toBeInTheDocument();
    });

    test('180を超える値は入力できない', async () => {
      const user = userEvent.setup();
      render(<NumPad onSubmit={vi.fn()} max={180} />);

      await user.click(screen.getByRole('button', { name: '2' }));
      await user.click(screen.getByRole('button', { name: '0' }));
      await user.click(screen.getByRole('button', { name: '0' }));

      // 180を超えたら最後の入力が無視される
      expect(screen.getByRole('textbox')).toHaveValue('20');
    });
  });

  describe('無効状態', () => {
    test('disabled prop で全ボタンが無効になる', () => {
      render(<NumPad onSubmit={vi.fn()} disabled />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});
```

## クエリの優先順位

React Testing Library は「ユーザーがどう見えるか」を重視：

### 1. role（最優先）

```typescript
screen.getByRole('button', { name: '送信' });
screen.getByRole('textbox');
screen.getByRole('heading', { level: 1 });
```

### 2. label

```typescript
screen.getByLabelText('ユーザー名');
```

### 3. placeholder

```typescript
screen.getByPlaceholderText('メールアドレスを入力');
```

### 4. text

```typescript
screen.getByText('こんにちは');
```

### 5. testId（最終手段）

```typescript
screen.getByTestId('custom-element');
```

## userEvent の使用

ユーザー操作をシミュレート：

```typescript
const user = userEvent.setup();

// クリック
await user.click(element);

// ダブルクリック
await user.dblClick(element);

// テキスト入力
await user.type(element, 'Hello');

// キー入力
await user.keyboard('{Enter}');
await user.keyboard('{Escape}');

// フォーカス
await user.tab(); // 次の要素にフォーカス

// ホバー
await user.hover(element);
```

## 非同期処理の待機

### waitFor

```typescript
import { waitFor } from '@testing-library/react';

test('非同期で表示される', async () => {
  render(<AsyncComponent />);

  await waitFor(() => {
    expect(screen.getByText('読み込み完了')).toBeInTheDocument();
  });
});
```

### findBy（waitFor の糖衣構文）

```typescript
test('非同期で表示される', async () => {
  render(<AsyncComponent />);

  const element = await screen.findByText('読み込み完了');
  expect(element).toBeInTheDocument();
});
```

## モックとスタブ

### Props のモック

```typescript
const mockOnClick = vi.fn();
render(<Button onClick={mockOnClick} />);

await user.click(screen.getByRole('button'));

expect(mockOnClick).toHaveBeenCalledOnce();
```

### Context のモック

```typescript
import { GameContext } from './GameContext';

test('Context の値を使用する', () => {
  const mockContextValue = { score: 501, gameState: 'playing' };

  render(
    <GameContext.Provider value={mockContextValue}>
      <Component />
    </GameContext.Provider>
  );

  expect(screen.getByText('501')).toBeInTheDocument();
});
```

### Zustand Store のモック

```typescript
import { useGameStore } from './gameStore';

vi.mock('./gameStore', () => ({
  useGameStore: vi.fn(),
}));

test('ストアの値を使用する', () => {
  useGameStore.mockReturnValue({
    score: 301,
    gameState: 'playing',
    submitThrow: vi.fn(),
  });

  render(<Component />);

  expect(screen.getByText('301')).toBeInTheDocument();
});
```

## アクセシビリティのテスト

### role の検証

```typescript
test('適切な role が設定されている', () => {
  render(<Component />);

  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

### aria属性の検証

```typescript
test('aria-label が設定されている', () => {
  render(<IconButton icon="close" />);

  const button = screen.getByRole('button', { name: /close|閉じる/i });
  expect(button).toBeInTheDocument();
});

test('aria-expanded が動的に変わる', async () => {
  const user = userEvent.setup();
  render(<Accordion />);

  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-expanded', 'false');

  await user.click(button);

  expect(button).toHaveAttribute('aria-expanded', 'true');
});
```

## スナップショットテスト（補助的）

```typescript
test('スナップショット', () => {
  const { container } = render(<Component />);
  expect(container).toMatchSnapshot();
});
```

注意: スナップショットは補助的に使用。メインは具体的なアサーション。

## ベストプラクティス

### 1. 実装詳細に依存しない

```typescript
// ✅ 良い例（ユーザー視点）
expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();

// ❌ 悪い例（実装詳細）
expect(container.querySelector('.submit-button')).toBeInTheDocument();
```

### 2. 非同期は await を使う

```typescript
// ✅ 良い例
await user.click(button);

// ❌ 悪い例
user.click(button); // await なし
```

### 3. cleanup は自動

```typescript
// 不要（自動で実行される）
afterEach(() => {
  cleanup();
});
```
