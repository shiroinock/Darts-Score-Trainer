---
name: code-conventions
description: Defines project-wide code conventions for magic number elimination, constant usage, performance optimization, and coordinate system separation. Use when implementing, testing, or reviewing code to ensure consistency across the codebase.
allowed-tools: Read
---

# コード規約スキル

このスキルは、プロジェクトの共通コード規約を定義し、エージェント定義ファイルから参照されます。

## 基本原則

### 1. マジックナンバーの排除

**原則**: ドメイン知識としてみなせる数値は、必ず定数として定義し、コード中での直接記述を避ける。

**定義例**:
```typescript
// ❌ マジックナンバー（避けるべき）
const expectedInnerRadius = mockTransform.physicalDistanceToScreen(7.95);
const expectedOuterRadius = mockTransform.physicalDistanceToScreen(225);

// ✅ 定数インポート（推奨）
import { BOARD_PHYSICAL } from '../../utils/constants';
const expectedInnerRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.outerBull);
const expectedOuterRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.boardEdge);
```

**ドメイン知識として扱う数値の例**:
- ダーツボード物理サイズ（mm）: 3.175, 7.95, 99, 107, 162, 170, 225など
- セグメント角度: π/10（18度）
- セグメント番号: 1-20
- 有効な得点: 0-60点の特定値
- ゲーム設定: 501, 701, 301点

### 2. 定数参照の原則

**実装ファイルでの定義**:
```typescript
// src/utils/constants.ts
export const BOARD_PHYSICAL = {
  rings: {
    innerBull: 3.175,      // mm
    outerBull: 7.95,       // mm
    tripleInner: 99,       // mm
    tripleOuter: 107,      // mm
    doubleInner: 162,      // mm
    doubleOuter: 170,      // mm
    boardEdge: 225         // mm
  }
} as const;
```

**テストファイルでの使用**:
```typescript
// src/__tests__/integration/dartboard-rendering.test.ts
import { BOARD_PHYSICAL } from '../../utils/constants';

test('期待される半径でテストする', () => {
  const expectedInnerRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.outerBull);
  // ...
});
```

**メリット**:
1. 定数値の変更時にテストが自動的に追従する
2. コメントで値の意味を説明する必要がなくなる
3. タイポや値の誤りを防げる
4. ドメイン知識の一元管理が実現される

### 3. パフォーマンス最適化

**原則**: 描画関数などで繰り返し使われる共通処理は、ループ外に抽出する。

**例**:
```typescript
// ❌ 非効率（20回呼び出し）
SEGMENTS.forEach((_, index) => {
  p5.fill(fillColor);
  p5.noStroke();  // ← 毎回呼び出し
  // ...
});

// ✅ 効率的（1回呼び出し）
p5.noStroke();  // ← ループ外で一度だけ
SEGMENTS.forEach((_, index) => {
  p5.fill(fillColor);
  // ...
});
```

### 4. 座標系の分離

**原則**: 物理座標（mm）と画面座標（pixel）を厳密に分離する。

**実装例**:
```typescript
// ✅ 物理座標で計算してから画面座標に変換
const innerRadius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.outerBull);
const outerRadius = transform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.boardEdge);

// ❌ 避けるべき：物理座標と画面座標の混在
const radius = 225 * scale;  // マジックナンバー + スケール計算の混在
```

### 5. コメント規約

**物理座標定数のコメント例**:
```typescript
export const BOARD_PHYSICAL = {
  rings: {
    innerBull: 3.175,      // mm: インナーブル半径（50点エリア）
    outerBull: 7.95,       // mm: アウターブル半径（25点エリア）
    tripleInner: 99,       // mm: トリプルリング内側
    tripleOuter: 107,      // mm: トリプルリング外側
    // ...
  }
} as const;
```

**テストコメント例**:
```typescript
// 期待される半径（画面座標）
// BOARD_PHYSICAL.rings.outerBullを画面座標に変換
const expectedInnerRadius = mockTransform.physicalDistanceToScreen(BOARD_PHYSICAL.rings.outerBull);
```

## チェックリスト

コード実装時に確認すべき項目：

- [ ] ドメイン知識としてみなせる数値が定数として定義されているか
- [ ] テストファイルでも定数をインポートして使用しているか
- [ ] ループ外で実行可能な処理がループ内に含まれていないか
- [ ] 物理座標と画面座標が混在していないか
- [ ] 定数値の変更時にテストが自動的に対応できるか
