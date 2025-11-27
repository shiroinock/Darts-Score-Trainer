---
description: 特定ファイルのTDD実装。ファイルパスを指定して適切なパイプラインで実装。
---

# 特定ファイルのTDD実装

指定されたファイルに対して、テストパターン判定に基づくTDD実装を実行します。

## 使用方法

```
/tdd-implement <filepath>
```

例:
```
/tdd-implement src/utils/scoreCalculator.ts
```

## 実行フロー

### 1. ファイルの存在確認

```bash
ls {filepath}
```

- **存在する** → テストレイターモード推奨 (ユーザーに確認)
- **存在しない** → classify-files で判定

### 2. classify-files でテストパターン判定

tdd-next と同じ手順でテストパターンを判定します。

**プロンプト例**:
```
ファイル「{filepath}」について、テストパターンを判定してください。

以下を出力してください:
1. tddMode (test-first / test-later)
2. testPattern (unit / store / hook / component / integration)
3. placement (colocated / separated)
4. rationale (判定理由)
5. testFilePath (テストファイルの配置パス)
```

### 3. パイプライン実行

tdd-next と同じパイプラインを**順次実行**します。

詳細は `/tdd-next` のドキュメントを参照してください。

#### テストファーストパイプライン (tddMode: test-first)

```
classify-files → test-writer → test-runner(RED) → implement → test-runner(GREEN) → review-file → (必要に応じて) plan-fix → implement → test-runner
```

#### テストレイターパイプライン (tddMode: test-later)

```
classify-files → implement → test-writer → test-runner → review-file → (必要に応じて) plan-fix → implement → test-runner
```

### 4. レポート生成

実行結果をレポートとして出力します:

```markdown
## ファイル実装完了レポート

**ファイル**: {filepath}
**TDDモード**: {test-first / test-later}
**テストパターン**: {unit / store / hook / component / integration}

### 作成ファイル
- {実装ファイルパス}
- {テストファイルパス}

### テスト結果
- 実行: {total} tests
- 成功: {passed} passed
- 失敗: {failed} failed
- カバレッジ: {coverage}%

### フィードバックループ
- test-writer: {レポートパス}
- implement: {レポートパス}
- test-runner: {レポートパス}
```

## tdd-next との違い

| 項目 | tdd-next | tdd-implement |
|------|----------|---------------|
| タスク選定 | TODO.md から自動選定 | ユーザーが明示的に指定 |
| TODO.md 更新 | ✓ (完了後に更新) | ✗ (更新なし) |
| 使用場面 | 計画的なタスク実装 | 個別ファイルの実装/修正 |
| 既存ファイル | TODO.md に応じる | テストレイター推奨 (確認あり) |

## エラーハンドリング

### ファイルパスが無効な場合

```
→ エラーメッセージ出力
→ 正しい形式を提示 (例: src/utils/xxx.ts)
→ 中止
```

**エラーメッセージ例**:
```
エラー: ファイルパスが無効です。

正しい形式: src/{directory}/{filename}.ts

例:
  /tdd-implement src/utils/scoreCalculator.ts
  /tdd-implement src/components/DartBoard/DartBoard.tsx
  /tdd-implement src/stores/gameStore.ts
```

### ファイルパスが指定されていない場合

```
→ エラーメッセージ出力
→ 使用方法を提示
→ 中止
```

**エラーメッセージ例**:
```
エラー: ファイルパスが指定されていません。

使用方法:
  /tdd-implement <filepath>

例:
  /tdd-implement src/utils/scoreCalculator.ts
```

### 既存ファイルをテストファーストで実装しようとした場合

```
→ 警告: "このファイルは既に存在します。テストレイターモードを推奨します。"
→ ユーザーに確認
→ 続行 or 中止
```

**確認メッセージ例**:
```
警告: {filepath} は既に存在します。

既存ファイルの場合、テストレイターモード (実装 → テスト作成) を推奨します。

続行しますか?
1. はい (classify-files で判定)
2. いいえ (中止)
```

### classify-files の判定が不明確な場合

```
→ ユーザーに確認
→ 手動で tddMode と testPattern を選択
→ パイプライン続行
```

## 使用例

### 例1: 新規ファイルの実装

```bash
/tdd-implement src/utils/coordinateTransform.ts
```

**期待される動作**:
1. ファイルが存在しないことを確認
2. classify-files が test-first, unit, colocated を判定
3. テストファーストパイプラインを実行
4. `coordinateTransform.ts` と `coordinateTransform.test.ts` が作成される

### 例2: 既存ファイルのテスト追加

```bash
/tdd-implement src/utils/scoreCalculator.ts
```

**期待される動作**:
1. ファイルが既に存在することを確認
2. テストレイターモードを推奨
3. ユーザーが続行を選択
4. classify-files が test-later を判定
5. テストレイターパイプラインを実行
6. `scoreCalculator.test.ts` が作成される

### 例3: コンポーネントの実装

```bash
/tdd-implement src/components/DartBoard/DartBoard.tsx
```

**期待される動作**:
1. ファイルが存在しないことを確認
2. classify-files が test-later, component, colocated を判定
3. テストレイターパイプラインを実行
4. `DartBoard.tsx` と `DartBoard.test.tsx` が作成される

## エージェント起動の注意点

### 並列 vs 順次実行

**重要**: エージェント間に依存関係があるため、**必ず順次実行**してください。

```javascript
// ❌ 並列実行 (依存関係があるため不可)
[
  Task(test-writer),
  Task(implement)
]

// ✅ 順次実行
Task(classify-files)
→ 完了待ち
→ Task(test-writer)
→ 完了待ち
→ Task(test-runner, RED_EXPECTED)
→ 完了待ち
→ Task(implement)
```

### 状態の受け渡し

各エージェントの出力結果を次のエージェントに渡します:

```
classify-files の出力:
  - tddMode: "test-first"
  - testPattern: "unit"
  - placement: "colocated"
  - testFilePath: "src/utils/scoreCalculator.test.ts"

→ test-writer に渡す:
  - testPattern: "unit"
  - testFilePath: "src/utils/scoreCalculator.test.ts"
  - implFilePath: "src/utils/scoreCalculator.ts"
```

## 重要な注意事項

### 1. エージェント定義ファイルを直接編集しない

フィードバックフック (SubagentStop) が自動で改善します。

### 2. テストファイルパスの一貫性

classify-files が提案したパスを厳守してください:
- **colocated**: 同階層 (例: `src/utils/scoreCalculator.test.ts`)
- **separated**: `src/__tests__/integration/` (例: `src/__tests__/integration/gameFlow.test.ts`)

### 3. SubagentStop フックの自動実行

各エージェント完了時に自動評価が実行されます:
- レポートは `.claude/reports/{agent-type}/` に保存
- エージェント定義ファイルに改善が追記される (必要に応じて)

### 4. 座標系の分離 (プロジェクト固有)

このプロジェクトでは、物理座標 (mm) と画面座標 (pixel) を厳密に分離します:
- **物理座標 (mm)**: すべてのロジック・計算
- **画面座標 (pixel)**: 描画のみ

実装時、この原則を守ってください。

## 検証方法

1. 手動で `/tdd-implement src/utils/scoreCalculator.ts` を実行
2. classify-files が判定を行う
3. 適切なパイプラインが実行される
4. ファイルが作成される
5. テストが全て通る
6. フィードバックレポートが生成される

---

**Note**: このコマンドは複雑なパイプラインを実行します。各エージェントの完了を待ち、順次実行することを忘れないでください。
