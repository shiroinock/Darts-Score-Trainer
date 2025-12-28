---
description: GitHub Actions CI相当のチェックをローカルで実行し、全て成功したことを確認するエージェント
allowed-tools: Task
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

### タイムアウト時の振る舞い

タイムアウトを超過した場合、該当するチェックは **FAILED** として扱われます（SKIPPEDではありません）。

1. **タイムアウト発生時の処理**
   - サブエージェントの実行が強制的に終了されます
   - 該当するチェックは失敗として記録されます
   - 他のサブエージェントは並列実行を継続します

2. **エラーメッセージ**
   ```
   ❌ Tests failed

   Error: Task timed out after 300000ms (5 minutes)

   Possible causes:
   - Too many tests running
   - Infinite loop in test code
   - External service timeout (if tests depend on external APIs)

   Debugging steps:
   1. Run tests locally: npm run test:run
   2. Check for slow tests: npm run test:run -- --reporter=verbose
   3. Increase timeout if necessary (in .claude/agents/ci-checker.md)
   ```

3. **タイムアウト調整が必要な場合**
   - プロジェクトの成長に伴い、テストの実行時間が増加する可能性があります
   - タイムアウト値は `.claude/agents/ci-checker.md` の Step 2 で調整できます
   - 推奨: タイムアウトを増やす前に、テストのパフォーマンスを確認してください

### タイムアウトの妥当性

現在の設定値は以下の根拠に基づいています：

- **Biome check（2分）**: 通常は5-10秒で完了。2分は十分な余裕
- **Test（5分）**: 現在約1,700テストで1-2分。5分は成長を見込んだ余裕
- **Build（3分）**: 通常は30-60秒で完了。3分は十分な余裕

### タイムアウト調整ガイド

プロジェクトの成長に伴い、タイムアウト値の調整が必要になる場合があります。以下のガイドラインに従ってください。

#### 調整が必要なケース

1. **テスト数の増加**
   - 現在: 約1,700テスト、実行時間 1-2分
   - 目安: テスト数が2倍（3,400テスト）になったら、タイムアウトを1.5倍（7.5分）に調整
   - 調整基準: 通常の実行時間の2.5-3倍を目安にタイムアウトを設定

2. **ビルド時間の増加**
   - 現在: 30-60秒
   - 目安: ビルド時間が2分を超えるようになったら、タイムアウトを5分に調整
   - 調整基準: 通常のビルド時間の2-3倍を目安にタイムアウトを設定

3. **Biome check の増加**
   - 現在: 5-10秒
   - 目安: ファイル数が500を超えたら実行時間を測定し、必要に応じて調整
   - 調整基準: 通常の実行時間の10倍程度を目安にタイムアウトを設定

#### 調整前の確認事項

タイムアウトを増やす前に、以下を確認してください：

1. **パフォーマンス分析**
   ```bash
   # テストの実行時間を詳細に確認
   npm run test:run -- --reporter=verbose

   # 遅いテストを特定
   npm run test:run -- --reporter=verbose | grep -E "SLOW|[0-9]{4,}ms"
   ```

2. **テストの最適化**
   - 不要な `await` の削除
   - モックの適切な使用
   - 並列実行の設定確認（`.vitest.config.ts` の `threads` オプション）

3. **ビルドの最適化**
   - 不要な依存関係の削除
   - Tree-shaking の確認
   - TypeScript の `skipLibCheck` オプションの検討

#### 調整手順

1. **現在の実行時間を測定**
   ```bash
   time npm run check      # Biome check
   time npm run test:run   # Test
   time npm run build      # Build
   ```

2. **タイムアウト値を計算**
   - 通常の実行時間 × 2.5-3倍 = 推奨タイムアウト値
   - 例: テスト実行が3分 → タイムアウトは7.5-9分（450-540秒）

3. **ci-checker.md の Step 2 を更新**
   ```javascript
   // 例: テストのタイムアウトを5分 → 9分に変更
   Task({
     "subagent_type": "test-check",
     "model": "haiku",
     "description": "Run tests",
     "prompt": "npm run test:run を実行し、結果を報告してください。",
     "timeout": 540000  // 9分（540秒）← ここを変更
   })
   ```

4. **変更をコミット**
   ```bash
   git add .claude/agents/ci-checker.md
   git commit -m "chore: テストタイムアウトを9分に調整（テスト数増加に対応）"
   ```

#### 調整後の確認

1. **複数回実行して確認**
   ```bash
   # 3回実行してタイムアウトが発生しないことを確認
   npm run test:run
   npm run test:run
   npm run test:run
   ```

2. **CI でも確認**
   - GitHub Actions でタイムアウトが発生していないか確認
   - ローカルとCIで実行時間に大きな差がないか確認

#### 参考: プロジェクト成長の目安

| プロジェクト規模 | テスト数 | 実行時間（目安） | 推奨タイムアウト |
|------------------|----------|------------------|------------------|
| 小規模 | 〜1,000 | 30秒-1分 | 3分 |
| 中規模（現在） | 1,000-3,000 | 1-3分 | 5-9分 |
| 大規模 | 3,000-10,000 | 3-10分 | 10-30分 |
| 超大規模 | 10,000+ | 10分以上 | 30分以上 |

**注意**: テスト実行時間が10分を超える場合は、テストの分割やキャッシュの導入を検討してください。

## サブエージェント出力フォーマット

3つのサブエージェント（biome-check、test-check、build-check）は、構造化された共通フォーマットで結果を返す必要があります。

各サブエージェントのドキュメント（`.claude/agents/biome-check.md`、`.claude/agents/test-check.md`、`.claude/agents/build-check.md`）に詳細な仕様が記載されています。

### 基本形式

```json
{
  "check": "biome|test|build",
  "status": "PASSED|FAILED",
  "duration": 1234,
  "summary": {
    "message": "簡潔な結果サマリー（1行）"
  },
  "details": { /* チェック固有の詳細 */ },
  "errors": [ /* エラー情報（失敗時のみ） */ ]
}
```

この共通フォーマットにより、ci-checkerは各サブエージェントの出力を一貫した方法で処理できます。

## 実装手順

### Step 1: 開始メッセージ

```
🔍 Running CI checks locally (in parallel)...
```

### Step 2: 3つのサブエージェントを並列起動

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

### Step 3: 結果の集計

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

### Step 4: サマリー表示

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

## 並列実行時の出力分離

3つのサブエージェント（biome-check、test-check、build-check）は並列実行されますが、各エージェントの出力は適切に分離されます。

### 出力分離の仕組み

1. **サブエージェントの独立性**
   - 各サブエージェントは独立したプロセスとして実行されます
   - 各エージェントの標準出力は個別にキャプチャされます
   - TaskOutputツールを使用して、各エージェントの完了後に出力を取得します

2. **出力の集約**
   - ci-checkerエージェントは、全てのサブエージェントの完了を待ちます
   - 各サブエージェントの出力を個別に取得し、整形して表示します
   - 出力順序は常に一定（Biome → Test → Build）

3. **大量出力への対応**
   - test-checkエージェントは大量の出力を生成する可能性があります
   - 各エージェントの出力は完全にキャプチャされ、混在しません
   - 失敗時のみ詳細な出力を表示し、成功時はサマリーのみ表示します

### 出力例

#### 全て成功した場合
```
🔍 Running CI checks locally (in parallel)...

📋 Biome check
✅ Biome check passed

🧪 Running tests
✅ Tests passed (1,736 tests)

🏗️  Building project
✅ Build passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All CI checks passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  - Biome check: ✓
  - Tests: ✓ (1,736 tests passed)
  - Build: ✓

🎉 Ready to create a pull request!
```

#### 一部失敗した場合
```
🔍 Running CI checks locally (in parallel)...

📋 Biome check
✅ Biome check passed

🧪 Running tests
❌ Tests failed

[テストエラー出力]
Test Files:  1 failed | 45 passed (46)
     Tests:  1 failed | 1735 passed (1736)

FAIL  src/utils/validation.test.ts
  ● isValidRemainingScore › should return false for negative scores
    expect(received).toBe(expected)
    Expected: false
    Received: true

🏗️  Building project
❌ Build failed

[ビルドエラー出力]
src/types/Question.ts:5:3 - error TS2322: Type 'number | undefined' is not assignable to type 'number'.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ CI checks failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  - Biome check: ✓
  - Tests: ✗
  - Build: ✗

Failed checks:
  - Tests: 1 test failed in src/utils/validation.test.ts
  - Build: Type error in src/types/Question.ts:5:3

Fix the issues above and re-run the checks.
```

### 実装上の注意点

1. **TaskOutputツールの使用**
   - 各サブエージェントの出力を取得するために、TaskOutputツールを使用します
   - block=trueを指定して、サブエージェントの完了を待ちます

2. **エラーメッセージの整形**
   - 長いエラーメッセージは適切に切り詰めます
   - 重要な情報（ファイル名、行番号、エラー内容）を抽出します

3. **一貫した出力順序**
   - サブエージェントの完了順序にかかわらず、常に Biome → Test → Build の順で表示します
   - ユーザーが結果を理解しやすくします

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
