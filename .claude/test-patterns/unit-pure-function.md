# テストパターン: 純粋関数のユニットテスト

## 対象

- `src/utils/` 配下の純粋関数
- 数値計算、座標変換、バリデーション、フォーマッターなど
- 副作用がなく、同じ入力に対して常に同じ出力を返す関数

## 特徴

- **テスト容易性**: 高（モック不要）
- **TDD方式**: テストファースト
- **配置**: colocated（`xxx.ts` と `xxx.test.ts` を同階層）

## テストの構造

```typescript
import { describe, test, expect } from 'vitest';
import { targetFunction } from './targetFunction';

describe('targetFunction', () => {
  describe('正常系', () => {
    test('基本的な入力で正しい出力を返す', () => {
      // Arrange
      const input = ...;
      const expected = ...;

      // Act
      const result = targetFunction(input);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe('境界値', () => {
    test('最小値で正しく動作する', () => { ... });
    test('最大値で正しく動作する', () => { ... });
    test('境界値ちょうどで正しく動作する', () => { ... });
  });

  describe('エッジケース', () => {
    test('ゼロで正しく動作する', () => { ... });
    test('負の値で正しく動作する', () => { ... });
  });

  describe('異常系', () => {
    test('無効な入力でエラーをスローする', () => {
      expect(() => targetFunction(invalidInput)).toThrow();
    });
  });
});
```

## カバーすべきシナリオ

1. **正常系**: 典型的な入力パターン
2. **境界値**: 範囲の最小値、最大値、境界ちょうど
3. **エッジケース**: ゼロ、負の値、空文字列、空配列など
4. **異常系**: 無効な入力、型違い、範囲外

## アサーションパターン

### 数値の等価性

```typescript
// 厳密な等価性
expect(result).toBe(60);

// 浮動小数点の比較（誤差許容）
expect(result).toBeCloseTo(103.5, 1); // 小数点1桁まで
```

### オブジェクトの等価性

```typescript
// 構造的等価性
expect(result).toEqual({ x: 100, y: 200 });

// 部分一致
expect(result).toMatchObject({ x: 100 }); // y は任意
```

### 配列の検証

```typescript
// 完全一致
expect(result).toEqual([1, 2, 3]);

// 要素を含む
expect(result).toContain(2);

// 長さ
expect(result).toHaveLength(3);
```

### エラーのテスト

```typescript
// エラーがスローされる
expect(() => targetFunction(invalid)).toThrow();

// 特定のエラーメッセージ
expect(() => targetFunction(invalid)).toThrow('Invalid input');

// エラーの型
expect(() => targetFunction(invalid)).toThrow(TypeError);
```

## 具体例: coordinateTransform.ts

```typescript
import { describe, test, expect } from 'vitest';
import { CoordinateTransform } from './coordinateTransform';

describe('CoordinateTransform', () => {
  describe('constructor', () => {
    test('正しいパラメータでインスタンスを生成できる', () => {
      const transform = new CoordinateTransform(800, 600, 225);
      expect(transform).toBeInstanceOf(CoordinateTransform);
    });

    test('無効なボード半径でエラーをスローする', () => {
      expect(() => new CoordinateTransform(800, 600, 0)).toThrow();
      expect(() => new CoordinateTransform(800, 600, -10)).toThrow();
    });
  });

  describe('physicalToScreen', () => {
    const transform = new CoordinateTransform(800, 600, 225);

    describe('正常系', () => {
      test('物理座標(0,0)はキャンバス中心に変換される', () => {
        const screen = transform.physicalToScreen(0, 0);
        expect(screen.x).toBe(400);
        expect(screen.y).toBe(300);
      });

      test('物理座標(100,0)は中心から右に変換される', () => {
        const screen = transform.physicalToScreen(100, 0);
        expect(screen.x).toBeGreaterThan(400);
        expect(screen.y).toBe(300);
      });
    });

    describe('境界値', () => {
      test('ボード端(225,0)はキャンバス端付近に変換される', () => {
        const screen = transform.physicalToScreen(225, 0);
        expect(screen.x).toBeCloseTo(800, 0);
      });

      test('ボード端(-225,0)はキャンバス左端付近に変換される', () => {
        const screen = transform.physicalToScreen(-225, 0);
        expect(screen.x).toBeCloseTo(0, 0);
      });
    });

    describe('エッジケース', () => {
      test('ボード外の座標も変換できる', () => {
        const screen = transform.physicalToScreen(300, 0);
        expect(screen.x).toBeGreaterThan(800); // キャンバス外
      });
    });
  });

  describe('screenToPhysical', () => {
    const transform = new CoordinateTransform(800, 600, 225);

    test('キャンバス中心(400,300)は物理座標(0,0)に変換される', () => {
      const physical = transform.screenToPhysical(400, 300);
      expect(physical.x).toBeCloseTo(0, 1);
      expect(physical.y).toBeCloseTo(0, 1);
    });

    test('往復変換で元の値に戻る', () => {
      const original = { x: 103, y: 50 };
      const screen = transform.physicalToScreen(original.x, original.y);
      const back = transform.screenToPhysical(screen.x, screen.y);

      expect(back.x).toBeCloseTo(original.x, 1);
      expect(back.y).toBeCloseTo(original.y, 1);
    });
  });
});
```

## ベストプラクティス

### 1. テストケースの独立性

各テストは他のテストに依存しない：

```typescript
// ✅ 良い例
describe('calculator', () => {
  test('加算', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('減算', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});

// ❌ 悪い例
let result;
describe('calculator', () => {
  test('加算', () => {
    result = add(1, 2); // 外部変数に依存
  });

  test('結果が3', () => {
    expect(result).toBe(3); // 前のテストに依存
  });
});
```

### 2. 明確なテスト名

何をテストしているかが一目で分かる名前：

```typescript
// ✅ 良い例
test('トリプル20（セグメント20、距離103mm）は60点を返す', () => { ... });

// ❌ 悪い例
test('test1', () => { ... });
test('動作する', () => { ... });
```

### 3. Arrange-Act-Assert の分離

コメントで明確に区切る：

```typescript
test('説明', () => {
  // Arrange
  const input = 100;
  const expected = 200;

  // Act
  const result = targetFunction(input);

  // Assert
  expect(result).toBe(expected);
});
```

## 注意事項

- **副作用を持たない**: テスト対象が純粋関数であることを確認
- **モックは不要**: 純粋関数は外部依存がないため、モック不要
- **数値精度**: 浮動小数点は `toBeCloseTo()` を使用
- **往復変換**: 座標変換などは往復して元に戻ることを確認
