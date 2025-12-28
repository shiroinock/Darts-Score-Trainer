---
description: GitHub Actions CI相当のチェックをローカルで実行し、全て成功したことを確認するエージェント
allowed-tools: Bash, Skill
model: haiku
---

# CI Checker エージェント

## 目的

TDDパイプライン完了後、PR作成前にローカルでCI相当のチェックを実行し、全てのチェックが成功することを確認します。

## 実行内容

`.claude/skills/local-ci/SKILL.md` の手順に従い、以下の3つのチェックを**並列**実行します：

1. **Biome Check** (`npm run check`) - タイムアウト: 2分
2. **Test** (`npm run test:run`) - タイムアウト: 5分
3. **Build** (`npm run build`) - タイムアウト: 3分

## タイムアウト設定

各サブエージェントには以下のタイムアウトが設定されています：

- **biome-check**: 120秒（2分）- コードスタイル・リントチェック
- **test-check**: 300秒（5分）- 全テストスイートの実行
- **build-check**: 180秒（3分）- TypeScript コンパイル + Vite ビルド

タイムアウトを超過した場合、該当するチェックは失敗として扱われます。

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
  "prompt": "npm run check を実行し、結果を報告してください。",
  "timeout": 120000  // 2分（120秒）
})
```

```javascript
Task({
  "subagent_type": "test-check",
  "model": "haiku",
  "description": "Run tests",
  "prompt": "npm run test:run を実行し、結果を報告してください。",
  "timeout": 300000  // 5分（300秒）
})
```

```javascript
Task({
  "subagent_type": "build-check",
  "model": "haiku",
  "description": "Run build",
  "prompt": "npm run build を実行し、結果を報告してください。",
  "timeout": 180000  // 3分（180秒）
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

**1つ以上失敗した場合（部分的失敗を含む）**:

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
    "test": "PASSED|FAILED",
    "build": "PASSED|FAILED"
  },
  "failedStep": "biome|test|build",
  "message": "CI checks failed at {step}"
}
```

**注**: 並列実行のため、全てのチェックが実行されます。SKIPPED状態は発生しません。

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

### 部分的失敗時の再実行方針

修正後は、**全てのチェックを再実行**します（失敗したものだけではなく）。これは以下の理由によります：

1. **依存関係の確認**: コード修正により、以前は成功していたチェックが失敗する可能性がある
2. **一貫性の保証**: 全てのチェックが同じコードベースで実行されることを保証
3. **並列実行の利点**: 3つのチェックを並列実行するため、再実行コストは最小限

**例**:
- Biome checkのみ失敗 → 修正後、Biome、Test、Build の3つ全てを再実行
- Test と Build が失敗 → 修正後、3つ全てを再実行

## 並列実行の安全性

3つのチェック（Biome、Test、Build）は並列実行されますが、以下の理由により安全です：

### 読み取り専用操作
全てのチェックは**読み取り専用**の操作です：
- **Biome check**: コードを読み取り、スタイル違反を検出（ファイル変更なし）
- **Test**: テストコードを実行（node_modules、dist は変更されない）
- **Build**: TypeScript をコンパイルして dist/ に出力（他のチェックと独立）

### ファイルシステムの競合
以下の共有リソースへの同時アクセスは問題ありません：
- **package-lock.json**: 読み取りのみ
- **node_modules**: インストール済み、読み取りのみ
- **dist ディレクトリ**: Build のみが書き込み（他は読み取らない）

### 検証済みの安全性
- GitHub Actions CI でも同様の並列実行を行っており、問題は発生していません
- Vitest、TypeScript、Biome は全て並列実行に対応した設計になっています

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
