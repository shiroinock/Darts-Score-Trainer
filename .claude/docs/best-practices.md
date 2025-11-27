# TDDベストプラクティス集

このドキュメントでは、Claude Code を使用した TDD 開発のベストプラクティスを説明します。

## 目次

1. [テスト設計](#テスト設計)
2. [実装原則](#実装原則)
3. [エージェント活用](#エージェント活用)
4. [プロジェクト固有のルール](#プロジェクト固有のルール)
5. [パフォーマンス最適化](#パフォーマンス最適化)
6. [メンテナンス](#メンテナンス)

---

## テスト設計

### AAA パターン（Arrange-Act-Assert）

すべてのテストで3段階構造を明示します。

```typescript
test("getRing は距離からリング種類を判定する", () => {
  // Arrange: テストデータを準備
  const distance = 3.0; // インナーブル範囲内

  // Act: テスト対象を実行
  const result = getRing(distance);

  // Assert: 結果を検証
  expect(result).toBe('INNER_BULL');
});
```

**利点**:
- テストの意図が明確
- 可読性が高い
- デバッグしやすい

### 境界値テスト

境界値を必ずテストします。

```typescript
describe("getRing - 境界値テスト", () => {
  test("インナーブル境界（3.175mm）- ギリギリ内側", () => {
    expect(getRing(3.174)).toBe('INNER_BULL');
  });

  test("インナーブル境界（3.175mm）- ちょうど", () => {
    expect(getRing(3.175)).toBe('OUTER_BULL');
  });

  test("インナーブル境界（3.175mm）- ギリギリ外側", () => {
    expect(getRing(3.176)).toBe('OUTER_BULL');
  });
});
```

**境界値リスト**（このプロジェクト）:
- インナーブル: 3.175mm
- アウターブル: 7.95mm
- トリプル内側: 99mm
- トリプル外側: 107mm
- ダブル内側: 162mm
- ダブル外側: 170mm
- ボード端: 225mm

### 浮動小数点比較

`toBeCloseTo()` を使用して許容誤差を指定します。

```typescript
// ❌ 厳密な等価比較（浮動小数点誤差で失敗する可能性）
expect(result).toBe(103);

// ✅ 許容誤差付き比較
expect(result).toBeCloseTo(103, 1);  // 小数第1位まで一致

// ✅ 座標の往復変換
const screen = transform.physicalToScreen(100, 50);
const back = transform.screenToPhysical(screen.x, screen.y);
expect(back.x).toBeCloseTo(100, 1);
expect(back.y).toBeCloseTo(50, 1);
```

**許容誤差の目安**:
- 座標変換: 小数第1位（0.1mm）
- 距離計算: 小数第1位（0.1mm）
- 角度計算: 小数第2位（0.01ラジアン）

### 可逆性テスト

往復変換で元の値に戻ることを確認します。

```typescript
test("座標変換の可逆性 - physicalToScreen → screenToPhysical", () => {
  // Arrange
  const original = { x: 103, y: 0 }; // T20の位置

  // Act: 往復変換
  const screen = coordinateTransform.physicalToScreen(original.x, original.y);
  const back = coordinateTransform.screenToPhysical(screen.x, screen.y);

  // Assert: 元の値に戻る
  expect(back.x).toBeCloseTo(original.x, 1);
  expect(back.y).toBeCloseTo(original.y, 1);
});
```

**可逆性が重要な関数**:
- 座標変換（physicalToScreen ↔ screenToPhysical）
- 距離変換（physicalDistanceToScreen ↔ screenDistanceToPhysical）

### テストケース名の命名規則

```typescript
// ✅ 良い命名（何をテストするか明確）
test("getRing は距離0mmでINNER_BULLを返す", () => { ... });
test("getSegmentNumber は角度0でセグメント20を返す", () => { ... });
test("coordinateToScore はボード外で0点を返す", () => { ... });

// ❌ 悪い命名（曖昧）
test("正しく動作する", () => { ... });
test("テスト1", () => { ... });
test("境界値", () => { ... });
```

**命名パターン**:
- `{関数名} は {入力} で {期待結果} を返す`
- `{関数名} は {条件} の場合 {動作} する`

---

## 実装原則

### YAGNI（You Aren't Gonna Need It）

将来使うかもしれない機能は実装しません。

```typescript
// ❌ over-engineering（将来使うかもしれない機能）
interface ScoreCalculatorConfig {
  boardType: 'steel' | 'soft';
  units: 'mm' | 'inch';
  spiderAdjustment: boolean;
}

export function getRing(
  distance: number,
  config?: ScoreCalculatorConfig
): RingType {
  // 複雑な設定処理...
}

// ✅ YAGNI原則（今必要な機能のみ）
export function getRing(distance: number): RingType {
  if (distance < BOARD_PHYSICAL.rings.innerBull) return 'INNER_BULL';
  if (distance < BOARD_PHYSICAL.rings.outerBull) return 'OUTER_BULL';
  // ...
}
```

**避けるべきパターン**:
- 設定ファイルの作成（まだ設定可能にする必要がない）
- 抽象化層の追加（まだ複数の実装がない）
- デザインパターンの適用（まだパターンが必要ない）

### テストを通す最小限の実装

```typescript
// テスト
test("calculateScore はTRIPLEで3倍を返す", () => {
  expect(calculateScore('TRIPLE', 20)).toBe(60);
});

// ❌ over-implementation（不要な処理）
export function calculateScore(ring: RingType, segmentNumber: number): number {
  // 入力値の詳細なバリデーション（テストされていない）
  if (typeof segmentNumber !== 'number') {
    throw new Error('segmentNumber must be a number');
  }
  if (!Number.isInteger(segmentNumber)) {
    throw new Error('segmentNumber must be an integer');
  }

  // キャッシング（パフォーマンスが問題になってから）
  const cacheKey = `${ring}-${segmentNumber}`;
  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey)!;
  }

  // ... 実際の計算
}

// ✅ 最小限の実装（テストを通すのに必要な処理のみ）
export function calculateScore(ring: RingType, segmentNumber: number): number {
  if (ring === 'INNER_BULL') return 50;
  if (ring === 'OUTER_BULL') return 25;
  if (ring === 'TRIPLE') return segmentNumber * 3;
  if (ring === 'DOUBLE') return segmentNumber * 2;
  if (ring === 'INNER_SINGLE' || ring === 'OUTER_SINGLE') return segmentNumber;
  return 0; // OUT
}
```

### DRY（Don't Repeat Yourself） vs WET（Write Everything Twice）

**3回繰り返したら抽象化**を検討します。

```typescript
// ❌ 1回しか使わないのに抽象化
const createRingChecker = (radius: number) => (distance: number) => distance < radius;
const isInnerBull = createRingChecker(BOARD_PHYSICAL.rings.innerBull);
const isOuterBull = createRingChecker(BOARD_PHYSICAL.rings.outerBull);

// ✅ シンプルな実装（まだ抽象化不要）
if (distance < BOARD_PHYSICAL.rings.innerBull) return 'INNER_BULL';
if (distance < BOARD_PHYSICAL.rings.outerBull) return 'OUTER_BULL';
```

**抽象化のタイミング**:
1. 同じパターンが3回以上登場
2. 変更が複数箇所に影響する
3. テストで複数パターンを検証済み

### エラーハンドリング

必要最小限のエラーハンドリングのみ実装します。

```typescript
// ❌ 過剰なエラーハンドリング
export function getRing(distance: number): RingType {
  if (distance === null || distance === undefined) {
    throw new Error('distance is required');
  }
  if (typeof distance !== 'number') {
    throw new Error('distance must be a number');
  }
  if (isNaN(distance)) {
    throw new Error('distance must not be NaN');
  }
  if (!isFinite(distance)) {
    throw new Error('distance must be finite');
  }
  if (distance < 0) {
    throw new Error('distance must be non-negative');
  }
  // ... 実際の処理
}

// ✅ 必要最小限のエラーハンドリング
export function getRing(distance: number): RingType {
  if (distance < 0) {
    throw new Error('Distance cannot be negative');
  }
  // ... 実際の処理
}
```

**エラーハンドリングが必要なケース**:
- 物理的に不可能な値（負の距離など）
- 計算エラーを引き起こす値（ゼロ除算など）
- ドメインルール違反（セグメント番号が1-20の範囲外など）

---

## エージェント活用

### エージェント実行は順次実行

**重要**: 依存関係のあるエージェントは**必ず順次実行**します。

```javascript
// ❌ 並列実行（依存関係があるため不可）
async function runPipeline() {
  await Promise.all([
    Task(test-writer),
    Task(implement)  // test-writerの結果に依存
  ]);
}

// ✅ 順次実行
async function runPipeline() {
  await Task(test-writer);
  // test-writerの完了を待つ

  await Task(test-runner, { expectation: 'RED_EXPECTED' });
  // test-runnerの完了を待つ

  await Task(implement);
  // implementの完了を待つ
}
```

### 状態の明示的な受け渡し

各エージェントの出力を次のエージェントに明示的に渡します。

```typescript
// ✅ 状態を明示的に受け渡し
const classifyResult = await Task(classifyFiles, {
  filePath: 'src/utils/scoreCalculator.ts'
});

const testWriterResult = await Task(testWriter, {
  testPattern: classifyResult.testPattern,  // classify-filesの結果を使用
  testFilePath: classifyResult.testFilePath,
  implFilePath: 'src/utils/scoreCalculator.ts'
});

const testRunnerResult = await Task(testRunner, {
  testFilePath: testWriterResult.testFilePath,  // test-writerの結果を使用
  expectation: 'RED_EXPECTED'
});
```

### フィードバックフックの活用

SubagentStop フックを信頼し、自動改善に任せます。

```markdown
## エージェント定義ファイル (.claude/agents/test-writer.md)

... (元の定義) ...

## 改善提案（過去のフィードバック）

### 2025-11-28
- 浮動小数点比較には toBeCloseTo() を使用する
- テストファイルには実装コードを含めない
- 境界値テストを必ず含める

### 2025-11-27
- AAA パターンを厳守する
- テストケース名を明確にする
```

**注意**:
- 手動編集は構造的な問題のみ
- 改善提案は自動で追記される
- 削除せずに履歴として残す

---

## プロジェクト固有のルール

### 座標系の分離

**原則**: 物理座標（mm）と画面座標（pixel）を厳密に分離します。

```typescript
// ❌ 座標系の混同
export function coordinateToScore(screenX: number, screenY: number): number {
  // 画面座標を直接使用している（誤り）
  const distance = Math.sqrt(screenX * screenX + screenY * screenY);
  return getRing(distance);
}

// ✅ 座標系の分離
export function coordinateToScore(physicalX: number, physicalY: number): number {
  // 物理座標を使用
  const distance = Math.sqrt(physicalX * physicalX + physicalY * physicalY);
  return getRing(distance);
}
```

**変数名の命名規則**:
- 物理座標: `physicalX`, `physicalY`, `distanceMM`, `angleDeg`
- 画面座標: `screenX`, `screenY`, `pixelSize`, `canvasWidth`

**ファイルの役割**:
- `src/utils/*` - 物理座標のみ使用（ロジック・計算）
- `src/components/DartBoard/*` - 画面座標も使用（描画）
- `src/utils/coordinateTransform.ts` - 座標変換のみを担当

### ダーツボード仕様の遵守

BOARD_PHYSICAL 定数を必ず使用します。

```typescript
// ❌ ハードコード（magic number）
if (distance < 3.175) return 'INNER_BULL';
if (distance < 7.95) return 'OUTER_BULL';

// ✅ 定数を使用
if (distance < BOARD_PHYSICAL.rings.innerBull) return 'INNER_BULL';
if (distance < BOARD_PHYSICAL.rings.outerBull) return 'OUTER_BULL';
```

**利点**:
- 仕様変更に強い
- 可読性が高い
- 定数の一元管理

---

## パフォーマンス最適化

### 最適化は測定してから

パフォーマンスが問題になってから最適化します。

```typescript
// ❌ 早すぎる最適化
const scoreCache = new Map<string, number>();

export function calculateScore(ring: RingType, segmentNumber: number): number {
  const cacheKey = `${ring}-${segmentNumber}`;
  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey)!;
  }
  const score = /* 計算 */;
  scoreCache.set(cacheKey, score);
  return score;
}

// ✅ まずはシンプルに実装
export function calculateScore(ring: RingType, segmentNumber: number): number {
  // 単純な計算（十分高速）
  if (ring === 'TRIPLE') return segmentNumber * 3;
  if (ring === 'DOUBLE') return segmentNumber * 2;
  // ...
}
```

**最適化のタイミング**:
1. パフォーマンス問題を測定で確認
2. ボトルネックを特定
3. 最適化を実装
4. 効果を測定

### メモ化が有効なケース

```typescript
// ✅ 計算コストが高い場合のみメモ化
const segmentAngles = new Map<number, number>();

export function getSegmentAngle(segmentNumber: number): number {
  if (segmentAngles.has(segmentNumber)) {
    return segmentAngles.get(segmentNumber)!;
  }

  // 複雑な計算（三角関数など）
  const index = SEGMENTS.indexOf(segmentNumber);
  const angle = (index * SEGMENT_ANGLE) - (Math.PI / 2);

  segmentAngles.set(segmentNumber, angle);
  return angle;
}
```

**メモ化が有効な条件**:
- 計算コストが高い（三角関数、平方根など）
- 同じ入力で何度も呼ばれる
- メモリコストが許容範囲

---

## メンテナンス

### TODO.md の定期的な更新

進捗に応じて TODO.md を更新します。

```markdown
## Phase 1: 基盤実装

### 1.3 座標変換 (`src/utils/coordinateTransform.ts`)
- [x] `CoordinateTransform` クラス作成 (2025-11-28 完了)
- [x] `physicalToScreen(x, y)` メソッド (2025-11-28 完了)
...

### 1.4 点数計算 (`src/utils/scoreCalculator.ts`)
- [x] `getRing(distance)` 関数 (2025-11-28 完了)
- [x] `getSegmentNumber(angle)` 関数 (2025-11-28 完了)
...

### 1.5 入力バリデーション (`src/utils/validation.ts`)
- [ ] `isValidSingleThrowScore(score)` 関数 (次のタスク)
- [ ] `isValidRoundScore(score)` 関数
```

### フィードバックレポートの定期確認

週1回、フィードバックレポートを確認します。

```bash
# 最新のレポートを確認
ls -lt .claude/reports/test-writer/ | head -3
cat .claude/reports/test-writer/evaluation_*.md
```

**確認項目**:
- 同じ問題が繰り返し発生していないか
- エージェント定義ファイルに改善が反映されているか
- 新しいパターンが見つかっていないか

### テストカバレッジの維持

カバレッジ100%を維持します。

```bash
# カバレッジレポートを生成
npm test -- --coverage

# カバレッジを確認
cat coverage/coverage-summary.json
```

**カバレッジ目標**:
- ユニット: 100%
- ストア: 100%
- フック: 90%以上
- コンポーネント: 80%以上

### ドキュメントの更新

実装完了後、ドキュメントを更新します。

**更新対象**:
- `README.md` - プロジェクト概要
- `CLAUDE.md` - アーキテクチャ
- `.claude/docs/tdd-workflow.md` - TDD運用ガイド

---

## チェックリスト

### テスト作成時

- [ ] AAA パターンで構造化
- [ ] 境界値テストを含める
- [ ] 浮動小数点比較は toBeCloseTo()
- [ ] 可逆性テスト（往復変換）
- [ ] テストケース名が明確

### 実装時

- [ ] テストを通す最小限の実装
- [ ] YAGNI原則を遵守
- [ ] 座標系の分離を遵守
- [ ] BOARD_PHYSICAL 定数を使用
- [ ] over-engineering を避ける

### パイプライン実行時

- [ ] エージェントを順次実行
- [ ] 状態を明示的に受け渡し
- [ ] Red/Green フェーズを確認
- [ ] review-file の結果を確認
- [ ] TODO.md を更新

### リリース前

- [ ] すべてのテストが Green
- [ ] カバレッジ100%（ユニット/ストア）
- [ ] レビュー結果が PASS
- [ ] ドキュメント更新
- [ ] フィードバックレポート確認

---

## 参考資料

- [TDD運用ガイド](tdd-workflow.md)
- [トラブルシューティングガイド](troubleshooting.md)
- [Phase 5-7 実装計画書](phase5-7-implementation-plan.md)
- [エージェント定義](.claude/agents/)
- [テストパターン定義](.claude/test-patterns/)
