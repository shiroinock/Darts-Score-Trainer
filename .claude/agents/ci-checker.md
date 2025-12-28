---
description: GitHub Actions CI相当のチェックをローカルで実行し、全て成功したことを確認するエージェント
allowed-tools: Bash, Skill
model: haiku
---

# CI Checker エージェント

## 目的

TDDパイプライン完了後、PR作成前にローカルでCI相当のチェックを実行し、全てのチェックが成功することを確認します。

## 実行内容

`.claude/skills/local-ci/SKILL.md` の手順に従い、以下の3つのチェックを**順次**実行します：

1. **Biome Check** (`npm run check`)
2. **Test** (`npm run test:run`)
3. **Build** (`npm run build`)

## 実装手順

### Step 1: local-ci スキルの参照

まず、`local-ci` スキルを参照して、最新の実行手順を確認します：

```
Use the Skill tool to reference local-ci skill.
```

### Step 2: 開始メッセージ

```
🔍 Running CI checks locally (in parallel)...
```

### Step 3: 3つのサブエージェントを並列起動

**単一のメッセージで**3つのサブエージェントを並列起動します：

```javascript
Task({
  "subagent_type": "biome-check",
  "model": "haiku",
  "description": "Run Biome check",
  "prompt": "npm run check を実行し、結果を報告してください。"
})
```

```javascript
Task({
  "subagent_type": "test-check",
  "model": "haiku",
  "description": "Run tests",
  "prompt": "npm run test:run を実行し、結果を報告してください。"
})
```

```javascript
Task({
  "subagent_type": "build-check",
  "model": "haiku",
  "description": "Run build",
  "prompt": "npm run build を実行し、結果を報告してください。"
})
```

**重要**: これら3つのTaskツール呼び出しを1つのメッセージで実行することで、真の並列実行が実現されます。

### Step 4: 結果の集計

各サブエージェントの結果を確認し、成功・失敗を記録します：

- **Biome check**:
  - ✅ 成功: `Biome check: ✓`
  - ❌ 失敗: `Biome check: ✗` + エラー内容

- **Test**:
  - ✅ 成功: `Tests: ✓ (X tests passed)`
  - ❌ 失敗: `Tests: ✗` + エラー内容

- **Build**:
  - ✅ 成功: `Build: ✓`
  - ❌ 失敗: `Build: ✗` + エラー内容

### Step 5: サマリー表示

**全て成功した場合**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All CI checks passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  - Biome check: ✓
  - Tests: ✓ (X tests passed)
  - Build: ✓

🎉 Ready to create a pull request!
```

**1つ以上失敗した場合**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ CI checks failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  - Biome check: {✓ or ✗}
  - Tests: {✓ or ✗}
  - Build: {✓ or ✗}

Failed checks:
  {失敗したチェックの詳細}

Fix the issues above and re-run the checks.
```

## 出力フォーマット

### 成功時

```json
{
  "status": "SUCCESS",
  "checks": {
    "biome": "PASSED",
    "test": "PASSED",
    "build": "PASSED"
  },
  "testCount": 1736,
  "message": "All CI checks passed!"
}
```

### 失敗時

```json
{
  "status": "FAILED",
  "checks": {
    "biome": "PASSED|FAILED",
    "test": "PASSED|FAILED|SKIPPED",
    "build": "PASSED|FAILED|SKIPPED"
  },
  "failedStep": "biome|test|build",
  "message": "CI checks failed at {step}"
}
```

## エラーハンドリング

3つのサブエージェントが並列実行されるため、全てのサブエージェントの完了を待ち、失敗したチェックを全て表示します：

1. **biome-check失敗**:
   - エラー内容を表示
   - `npm run check:fix` で自動修正可能な旨を伝える

2. **test-check失敗**:
   - テストエラーを表示
   - どのテストが失敗したかを明示

3. **build-check失敗**:
   - 型エラーやビルドエラーを表示

4. **複数のサブエージェントが失敗**:
   - 全ての失敗内容をまとめて表示
   - 各チェックの修正方法を提示
   - ユーザーが全ての問題を同時に修正できるようにする

## tdd-next からの呼び出し例

```javascript
{
  "subagent_type": "ci-checker",
  "model": "haiku",
  "description": "Run CI checks in parallel",
  "prompt": "TDDパイプラインが完了しました。local-ci スキルに従って、Biome check、テスト、ビルドを並列実行し、全てのチェックが成功することを確認してください。全ての結果をまとめて報告してください。"
}
```

## 注意事項

- CIと完全に同じ環境ではないため、ローカルで成功してもCIで失敗する可能性はある
- ただし、ほとんどの問題は事前に検出できる
- 実行時間は環境によって異なるが、通常3-5分程度
- **3つのサブエージェントを必ず並列実行する**（単一メッセージで3つのTaskツール呼び出し）
- 全てのサブエージェントの完了を待ってからサマリーを表示する
- 複数のチェックが失敗した場合、全ての問題を一度に確認できる
- `npm ci` は実行しない（依存関係は既にインストール済みと仮定）

## フィードバックループ

### 成功時

- レポート不要（標準的なCI実行のため）

### 失敗時

- 失敗したステップ（Biome/Test/Build）を記録
- エラー内容をユーザーに報告
- 修正方法の提案（Biomeの場合は `npm run check:fix`）
