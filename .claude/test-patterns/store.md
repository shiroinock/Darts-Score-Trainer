# テストパターン: Zustand ストアのテスト

## 対象

- `src/stores/` 配下の Zustand ストア
- グローバル状態管理、アクション、セレクター

## 特徴

- **テスト容易性**: 中（状態のリセットが必要）
- **TDD方式**: テストファースト
- **配置**: colocated（`xxxStore.ts` と `xxxStore.test.ts` を同階層）

## テストの構造

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useGameStore.setState(useGameStore.getInitialState());
  });

  describe('初期状態', () => {
    test('デフォルト値が正しく設定されている', () => {
      const state = useGameStore.getState();
      expect(state.gameState).toBe('setup');
      expect(state.score).toBe(501);
    });
  });

  describe('アクション', () => {
    test('setConfig で設定を更新できる', () => { ... });
    test('startPractice で状態遷移する', () => { ... });
  });

  describe('セレクター', () => {
    test('計算済みの値が正しく取得できる', () => { ... });
  });
});
```

## カバーすべきシナリオ

1. **初期状態**: ストアのデフォルト値
2. **アクション実行**: 状態の更新
3. **状態遷移**: gameState などの遷移パターン
4. **セレクター**: 派生値の計算
5. **副作用**: ローカルストレージへの保存など

## 具体例: gameStore.ts

```typescript
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './gameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    // ストアをリセット
    useGameStore.setState(useGameStore.getInitialState());
  });

  describe('初期状態', () => {
    test('デフォルト状態は setup', () => {
      expect(useGameStore.getState().gameState).toBe('setup');
    });

    test('デフォルトスコアは 501', () => {
      expect(useGameStore.getState().score).toBe(501);
    });

    test('デフォルト設定が正しい', () => {
      const { config } = useGameStore.getState();
      expect(config.stdDevMM).toBe(30);
      expect(config.throwUnit).toBe(3);
      expect(config.questionType).toBe('both');
    });
  });

  describe('setConfig', () => {
    test('部分的な設定更新が可能', () => {
      // Arrange
      const initialConfig = useGameStore.getState().config;

      // Act
      useGameStore.getState().setConfig({ stdDevMM: 15 });

      // Assert
      const updatedConfig = useGameStore.getState().config;
      expect(updatedConfig.stdDevMM).toBe(15);
      expect(updatedConfig.throwUnit).toBe(initialConfig.throwUnit); // 他は変わらない
    });

    test('設定更新で新しいオブジェクトが生成される', () => {
      const before = useGameStore.getState().config;
      useGameStore.getState().setConfig({ stdDevMM: 20 });
      const after = useGameStore.getState().config;

      expect(after).not.toBe(before); // 参照が異なる
    });
  });

  describe('状態遷移', () => {
    test('startPractice で setup → practicing に遷移', () => {
      // Arrange
      expect(useGameStore.getState().gameState).toBe('setup');

      // Act
      useGameStore.getState().startPractice();

      // Assert
      expect(useGameStore.getState().gameState).toBe('practicing');
    });

    test('submitAnswer で practicing → result に遷移', () => {
      // Arrange
      useGameStore.getState().startPractice();
      expect(useGameStore.getState().gameState).toBe('practicing');

      // Act
      useGameStore.getState().submitAnswer(60);

      // Assert
      expect(useGameStore.getState().gameState).toBe('result');
    });

    test('resetPractice で result → setup に遷移', () => {
      // Arrange
      useGameStore.getState().startPractice();
      useGameStore.getState().submitAnswer(60);
      expect(useGameStore.getState().gameState).toBe('result');

      // Act
      useGameStore.getState().resetPractice();

      // Assert
      expect(useGameStore.getState().gameState).toBe('setup');
    });
  });

  describe('スコア管理', () => {
    test('submitThrow でスコアが減算される', () => {
      // Arrange
      useGameStore.getState().startPractice();
      const initialScore = useGameStore.getState().score;

      // Act
      useGameStore.getState().submitThrow(60);

      // Assert
      const updatedScore = useGameStore.getState().score;
      expect(updatedScore).toBe(initialScore - 60);
    });

    test('スコアが0になったら完了状態になる', () => {
      // Arrange
      useGameStore.setState({ score: 60, gameState: 'practicing' });

      // Act
      useGameStore.getState().submitThrow(60);

      // Assert
      expect(useGameStore.getState().score).toBe(0);
      expect(useGameStore.getState().gameState).toBe('complete');
    });
  });

  describe('履歴管理', () => {
    test('投擲履歴が記録される', () => {
      // Arrange
      useGameStore.getState().startPractice();
      expect(useGameStore.getState().history).toHaveLength(0);

      // Act
      useGameStore.getState().submitThrow(60);
      useGameStore.getState().submitThrow(40);

      // Assert
      const history = useGameStore.getState().history;
      expect(history).toHaveLength(2);
      expect(history[0].score).toBe(60);
      expect(history[1].score).toBe(40);
    });

    test('履歴がタイムスタンプを含む', () => {
      useGameStore.getState().startPractice();
      useGameStore.getState().submitThrow(60);

      const history = useGameStore.getState().history;
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });
  });
});
```

## ストアのリセット

各テスト前に必ずストアをリセット：

```typescript
beforeEach(() => {
  // 方法1: getInitialState() を使用
  useGameStore.setState(useGameStore.getInitialState());

  // 方法2: 直接デフォルト値を設定
  useGameStore.setState({
    gameState: 'setup',
    score: 501,
    config: { ... },
    history: [],
  });
});
```

## ローカルストレージのモック

副作用がある場合はモック化：

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

describe('useGameStore（永続化）', () => {
  beforeEach(() => {
    // localStorage をモック
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('設定変更時に localStorage に保存される', () => {
    // Act
    useGameStore.getState().setConfig({ stdDevMM: 15 });

    // Assert
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'gameConfig',
      expect.stringContaining('"stdDevMM":15')
    );
  });
});
```

## ベストプラクティス

### 1. 状態のイミュータビリティ

Zustand は自動的に新しいオブジェクトを生成するが、確認する：

```typescript
test('状態更新で参照が変わる', () => {
  const before = useGameStore.getState().config;
  useGameStore.getState().setConfig({ stdDevMM: 20 });
  const after = useGameStore.getState().config;

  expect(after).not.toBe(before);
});
```

### 2. 状態遷移の網羅

すべての遷移パターンをテスト：

```typescript
describe('状態遷移', () => {
  test('setup → practicing', () => { ... });
  test('practicing → result', () => { ... });
  test('result → setup', () => { ... });
  test('practicing → setup（キャンセル）', () => { ... });
});
```

### 3. 計算済みセレクターのテスト

セレクターがある場合はその結果をテスト：

```typescript
test('remainingScore セレクターが正しく計算される', () => {
  useGameStore.setState({ score: 501, currentRoundScore: 60 });

  const remaining = useGameStore.getState().remainingScore;
  expect(remaining).toBe(441); // 501 - 60
});
```
