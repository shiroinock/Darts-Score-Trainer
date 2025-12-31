---
name: local-ci-checker
description: remote CI (GitHub Actions) 相当のチェックをローカルで実行し、全て成功したことを確認するエージェント
allowed-tools: Task
model: haiku
---

# Local CI Checker エージェント

**このエージェントの役割**: `local-ci` スキルを使用して、local CI チェック（remote CI 相当）を**ローカルマシン上**で実行します。

## check-remote-ci コマンドとの違い

| エージェント/コマンド | 実行場所 | 目的 | 使用場面 |
|---------------------|---------|------|----------|
| **local-ci-checker** (このエージェント) | **local** | local CI チェック（remote CI 相当）をローカル実行 | TDD完了後、PR作成前の検証 |
| **check-remote-ci** | **remote** (GitHub Actions) | remote CI の実行状態確認 | PR作成後、remote CI が失敗した際の調査 |

## 目的

TDD パイプライン完了後、PR作成前に**ローカルマシン上**で local CI チェック（remote CI 相当）を実行し、全てのチェックが成功することを確認します。

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
   3. Increase timeout if necessary (in .claude/agents/local-ci-checker.md)
   ```

3. **タイムアウト調整が必要な場合**
   - プロジェクトの成長に伴い、テストの実行時間が増加する可能性があります
   - タイムアウト値は `.claude/agents/local-ci-checker.md` の Step 2 で調整できます
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

3. **local-ci-checker.md の Step 2 を更新**
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
   git add .claude/agents/local-ci-checker.md
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

この共通フォーマットにより、local-ci-checkerは各サブエージェントの出力を一貫した方法で処理できます。

## サブエージェント構造

このエージェントは、以下の**3つの専用サブエージェント**を並列起動します：

1. **biome-check** (`.claude/agents/biome-check.md`)
   - 役割: Biome check を実行し、構造化されたJSON形式で結果を返す
   - コマンド: `npm run check`
   - タイムアウト: 2分

2. **test-check** (`.claude/agents/test-check.md`)
   - 役割: テストを実行し、構造化されたJSON形式で結果を返す
   - コマンド: `npm run test:run`
   - タイムアウト: 5分

3. **build-check** (`.claude/agents/build-check.md`)
   - 役割: ビルドを実行し、構造化されたJSON形式で結果を返す
   - コマンド: `npm run build`
   - タイムアウト: 3分

**重要**: これらはBashコマンドを直接実行するのではなく、**個別のエージェント定義ファイル**（`.claude/agents/`配下）として存在します。各エージェントの詳細な仕様は各mdファイルを参照してください。

## 実装手順

### Step 1: 開始メッセージ

```
🔍 Running local CI checks (in parallel)...
```

### Step 2: 3つのサブエージェントを並列起動

**単一のメッセージで**3つのサブエージェント（上記「サブエージェント構造」参照）を並列起動します：

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

**TaskOutput ツールを使用して各サブエージェントの出力を取得します：**

並列実行されたサブエージェントの出力は、TaskOutput ツールを使用して個別に取得します。これにより、出力の混在を防ぎ、各チェックの結果を明確に分離できます。

```javascript
// Step 2 で起動した3つのサブエージェントのタスクIDを取得
const biomeTaskId = "{biome-check のタスクID}";
const testTaskId = "{test-check のタスクID}";
const buildTaskId = "{build-check のタスクID}";

// 各サブエージェントの完了を待ち、出力を取得
const biomeResult = TaskOutput({
  "task_id": biomeTaskId,
  "block": true,      // 完了まで待機
  "timeout": 120000   // 2分
});

const testResult = TaskOutput({
  "task_id": testTaskId,
  "block": true,
  "timeout": 300000   // 5分
});

const buildResult = TaskOutput({
  "task_id": buildTaskId,
  "block": true,
  "timeout": 180000   // 3分
});
```

**出力のパース**:

各サブエージェントの出力をJSON形式でパースし、構造化されたデータを取得します：

```javascript
// JSON形式の出力をパース（詳細は「サブエージェント出力フォーマット」セクション参照）
const biomeData = JSON.parse(biomeResult.output);
const testData = JSON.parse(testResult.output);
const buildData = JSON.parse(buildResult.output);
```

**結果の判定**:

各サブエージェントの結果を確認し、成功・失敗を記録します：

- **Biome check**:
  - ✅ 成功: `biomeData.status === "PASSED"` → `Biome check: ✓`
  - ❌ 失敗: `biomeData.status === "FAILED"` → `Biome check: ✗` + エラー内容

- **Test**:
  - ✅ 成功: `testData.status === "PASSED"` → `Tests: ✓ (${testData.details.tests.total} tests passed)`
  - ❌ 失敗: `testData.status === "FAILED"` → `Tests: ✗` + エラー内容

- **Build**:
  - ✅ 成功: `buildData.status === "PASSED"` → `Build: ✓`
  - ❌ 失敗: `buildData.status === "FAILED"` → `Build: ✗` + エラー内容

**出力順序の保証**:

サブエージェントは並列実行されるため完了順序は不定ですが、TaskOutput で取得後に常に **Biome → Test → Build** の順序で表示します。これにより、ユーザーは一貫した形式で結果を確認できます。

### Step 4: サマリー表示

**全て成功した場合**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All local CI checks passed!
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
❌ Local CI checks failed
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
  "message": "All local CI checks passed!"
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
  "message": "Local CI checks failed at {step}"
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

### JSON パースエラー時の対応（フォールバック機構）

サブエージェント（biome-check、test-check、build-check）は構造化されたJSON形式で出力することが期待されますが、予期しないエラーやモデルの制限により、JSON形式でない出力が返される可能性があります。

**JSONパースエラーの検出**:

```javascript
let biomeData;
try {
  biomeData = JSON.parse(biomeResult.output);
} catch (error) {
  // JSON パースエラー: フォールバック処理
  biomeData = parseFallback(biomeResult.output, "biome");
}
```

**フォールバック処理**:

JSON形式でない場合、以下の手順でプレーンテキスト出力を解析します：

1. **ステータスの判定**:
   - 出力に "PASSED" または "✓" または "success" が含まれる → `status: "PASSED"`
   - 出力に "FAILED" または "✗" または "error" が含まれる → `status: "FAILED"`
   - いずれも含まれない → `status: "FAILED"`（安全側に倒す）

2. **エラーメッセージの抽出**:
   - 出力全体を `errors` 配列の1要素として含める
   - ファイル名や行番号が含まれている場合、可能な範囲で抽出

3. **警告メッセージの表示**:
   ```
   ⚠️  Warning: Subagent output format is invalid (expected JSON)
   Check: biome-check
   Falling back to plain text parsing. Result accuracy may be reduced.
   ```

**フォールバックデータ構造**:

```javascript
function parseFallback(output, checkType) {
  // キーワードベースでステータスを判定
  const isPassed = /PASSED|✓|success/i.test(output);
  const isFailed = /FAILED|✗|error/i.test(output);

  return {
    check: checkType,
    status: isPassed && !isFailed ? "PASSED" : "FAILED",
    duration: 0,  // 不明
    summary: {
      message: isFailed ?
        `${checkType} check failed (output format error)` :
        `${checkType} check passed (output format error)`
    },
    details: {
      formatError: true,
      rawOutput: output.substring(0, 500)  // 最大500文字
    },
    errors: isFailed ? [
      {
        message: "Unable to parse subagent output. Raw output included in details.",
        severity: "error"
      }
    ] : []
  };
}
```

**推奨される改善策**:

JSONパースエラーが発生した場合、以下の対応を検討してください：

1. サブエージェントのプロンプトを確認し、JSON出力の指示が明確か確認
2. サブエージェントのモデル（現在: haiku）が適切か確認（必要に応じて sonnet に変更）
3. エラーログをレポートし、サブエージェントの実装を改善

**リスク軽減**:

- フォールバック処理により、JSONパースエラーが発生しても local-ci-checker は完全に失敗しません
- ただし、結果の精度が低下する可能性があるため、ユーザーに警告を表示します
- フォールバック処理が頻繁に発生する場合、サブエージェントの実装を見直す必要があります

### 部分的失敗時の再実行方針

修正後は、**全てのチェックを再実行**します（失敗したものだけではなく）。これは以下の理由によります：

1. **依存関係の確認**: コード修正により、以前は成功していたチェックが失敗する可能性がある
2. **一貫性の保証**: 全てのチェックが同じコードベースで実行されることを保証
3. **並列実行の利点**: 3つのチェックを並列実行するため、再実行コストは最小限

**コスト比較**:

従来の逐次実行と比較して、並列実行は再実行時も効率的です：

| シナリオ | 逐次実行（従来） | 並列実行（現在） | 短縮時間 |
|----------|------------------|------------------|----------|
| **Biome のみ失敗** | Biome(10秒) → Test(2分) → Build(1分) = 3分10秒 | 並列実行 = 2分（最も遅い Test） | **-1分10秒** |
| **Test のみ失敗** | Test(2分) → Biome(10秒) → Build(1分) = 3分10秒 | 並列実行 = 2分 | **-1分10秒** |
| **Build のみ失敗** | Build(1分) → Biome(10秒) → Test(2分) = 3分10秒 | 並列実行 = 2分 | **-1分10秒** |
| **複数失敗** | 最大 3分10秒 | 最大 2分 | **-1分10秒** |

**実行時間の計算**:
- 逐次実行: 各チェックの時間を合計（Biome 10秒 + Test 2分 + Build 1分 = 3分10秒）
- 並列実行: 最も時間のかかるチェック（Test 2分）が全体の実行時間を決定

**結論**: 並列実行により、どのチェックが失敗しても再実行時間は約**2分**に固定され、逐次実行と比較して**約37%の時間短縮**を実現します。

**例**:
- Biome checkのみ失敗 → 修正後、Biome、Test、Build の3つ全てを並列実行（2分で完了）
- Test と Build が失敗 → 修正後、3つ全てを並列実行（2分で完了）

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
- remote CI (GitHub Actions) でも同様の並列実行を行っており、問題は発生していません
- Vitest、TypeScript、Biome は全て並列実行に対応した設計になっています

## 並列実行時の出力分離

3つのサブエージェント（biome-check、test-check、build-check）は並列実行されますが、各エージェントの出力は適切に分離されます。

### 出力分離の仕組み

1. **サブエージェントの独立性**
   - 各サブエージェントは独立したプロセスとして実行されます
   - 各エージェントの標準出力は個別にキャプチャされます
   - TaskOutputツールを使用して、各エージェントの完了後に出力を取得します

2. **出力の集約**
   - local-ci-checkerエージェントは、全てのサブエージェントの完了を待ちます
   - 各サブエージェントの出力を個別に取得し、整形して表示します
   - 出力順序は常に一定（Biome → Test → Build）

3. **大量出力への対応**
   - test-checkエージェントは大量の出力を生成する可能性があります
   - 各エージェントの出力は完全にキャプチャされ、混在しません
   - 失敗時のみ詳細な出力を表示し、成功時はサマリーのみ表示します

### 出力例

#### 全て成功した場合
```
🔍 Running local CI checks (in parallel)...

📋 Biome check
✅ Biome check passed

🧪 Running tests
✅ Tests passed (1,736 tests)

🏗️  Building project
✅ Build passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All local CI checks passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  - Biome check: ✓
  - Tests: ✓ (1,736 tests passed)
  - Build: ✓

🎉 Ready to create a pull request!
```

#### 一部失敗した場合
```
🔍 Running local CI checks (in parallel)...

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
❌ Local CI checks failed
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

## 注意事項

- remote CI と完全に同じ環境ではないため、local CI で成功しても remote CI で失敗する可能性はある
- ただし、ほとんどの問題は事前に検出できる
- 実行時間は環境によって異なるが、通常3-5分程度
- **3つのサブエージェントを必ず並列実行する**（単一メッセージで3つのTaskツール呼び出し）
- 全てのサブエージェントの完了を待ってからサマリーを表示する
- 複数のチェックが失敗した場合、全ての問題を一度に確認できる
- `npm ci` は実行しない（依存関係は既にインストール済みと仮定）

## 重要な実装上の注意事項

### このエージェントの責務を正しく理解する

**このエージェントは検索や調査を行うエージェントではありません。** CIチェックを実行するエージェントです。

1. **検索・調査は行わない**
   - ファイルの検索や読み取りは不要です
   - コードベースの理解や分析も不要です
   - 純粋にCIチェックの実行に集中してください

2. **必須の実行手順**
   - Step 1: 開始メッセージを表示
   - Step 2: 3つのサブエージェントを**必ず**並列起動
   - Step 3: 全てのサブエージェントの完了を待機
   - Step 4: 結果を集計してサマリーを表示

3. **サブエージェントの起動は必須**
   - biome-check、test-check、build-check の3つを**必ず**起動してください
   - これらを起動しない場合、CIチェックは実行されません
   - 「準備ができた」と言うだけでは何も実行されません

### プロンプトの解釈

以下のようなプロンプトを受け取った場合：
```
TDDパイプラインが完了しました。local-ci スキルに従って、Biome check、テスト、ビルドを並列実行し、全てのチェックが成功することを確認してください。
```

これは「CIチェックを実行してください」という指示です。以下を実行してください：

1. local-ci スキルの参照（オプション、既にこのドキュメントに手順があります）
2. 3つのサブエージェントの並列起動（必須）
3. 結果の集計と報告（必須）

**決して**「準備ができました、何を調査しますか？」のような応答をしないでください。

## フィードバックループ

### 成功時

- レポート不要（標準的なCI実行のため）

### 失敗時

- 失敗したステップ（Biome/Test/Build）を記録
- エラー内容をユーザーに報告
- 修正方法の提案（Biomeの場合は `npm run check:fix`）

## トラブルシューティング

### エージェントがCIチェックを実行しない場合

以下のようなプロンプトを受け取っても、実際のCIチェックが実行されない場合の対処法：

```
PresetSelector.tsxのCSS分離が完了しました。local-ci スキルに従って、ローカルマシン上で Biome check、テスト、ビルドを並列実行し、全てのチェックが成功することを確認してください。
```

**症状**: 
- 「準備ができました」「何を調査しますか？」のような応答
- CIチェックが実行されない
- サブエージェントが起動されない

**原因**:
このエージェントが自分の役割を「調査・探索エージェント」と誤解している可能性があります。

**解決策**:
プロンプトに以下の要素を含めてください：

1. **明確な実行指示**
   ```
   以下の手順を実行してください：
   1. 開始メッセージ「🔍 Running local CI checks (in parallel)...」を表示
   2. biome-check、test-check、build-check の3つのサブエージェントを並列起動
   3. 全てのサブエージェントの完了を待機
   4. 結果を集計してサマリーを表示
   ```

2. **具体的なコマンド指定**
   ```
   npm run check、npm run test:run、npm run build を実行し、
   全てのチェックが成功することを確認してください。
   ```

3. **禁止事項の明示**
   ```
   注意: ファイルの検索や読み取りは不要です。
   CIチェックの実行のみを行ってください。
   ```

## local-ci スキルの明示的な参照

### 推奨事項

プロンプトで「local-ci スキルに従って」と指示された場合、以下のように動作してください：

1. **スキルファイルの確認を宣言**
   ```
   local-ci スキルを参照して、CIチェックを実行します。
   ```

2. **スキルの内容に言及**
   ```
   local-ci スキルに従い、Biome check、テスト、ビルドの3つのチェックを並列実行します。
   ```

3. **スキルベースの実装であることを明示**
   ```
   local-ci スキルで定義された手順に従って実行します。
   ```

これにより、エージェントがスキルを参照していることが明確になり、ユーザーの期待に沿った動作となります。

### 実装例

```
ユーザー: local-ci スキルに従って、CIチェックを実行してください。

エージェント: local-ci スキルを参照して、ローカルCIチェックを実行します。

🔍 Running local CI checks (in parallel)...

local-ci スキルで定義された3つのチェック（Biome check、テスト、ビルド）を並列実行しています...

[以降は通常の実装手順に従う]
```

**注意**: スキルファイルが存在しない場合でも、このドキュメントに記載された手順は local-ci スキルと同等の内容を含んでいるため、問題なく実行できます。

## テスト失敗時の詳細報告

### 改善点

サブエージェントの実行において、テストが部分的に失敗した場合の報告方法を改善してください：

1. **テスト分離問題の明確な報告**
   - 全テスト実行時と個別実行時で結果が異なる場合、「テスト分離問題」として明確に報告してください
   - 例: 「全テスト実行時: 2 failed, 個別実行時: 0 failed → テスト分離問題の可能性」

2. **失敗したテストの詳細表示**
   - 失敗したテストファイル名とテストケース名を明確に表示してください
   - タイムアウトが原因の場合、その旨を明記してください

3. **サマリーの改善**
   - 「PARTIAL FAILURE」という用語を使用する場合、その意味を明確にしてください
   - 例: 「⚠️ Tests - **PARTIAL FAILURE** (1,936/1,938 passed, 2 failed due to timeout)」

4. **次のアクションの提案**
   - テスト分離問題が検出された場合、以下を提案してください：
     - 個別テストファイルの実行を推奨
     - テスト間の依存関係の確認を促す
     - 必要に応じて `beforeEach`/`afterEach` の追加を提案

## 結果報告の統一フォーマット

### 重要な改善点

サブエージェントの結果を報告する際、以下のフォーマットに統一してください：

1. **各チェックの結果表示**
   ```
   **Biome Check**
   ✓ PASSED
   - Checked X files in Yms
   - No style or lint issues found
   
   **Tests**
   ✗ FAILED
   - X tests passed
   - Y tests failed (理由: timeout、rendering issues等)
   
   **Build**
   ✓ PASSED
   - Built successfully in Xs
   ```

2. **失敗したテストの詳細**
   - 失敗したテストファイルのパスを明確に表示
   - 失敗の原因（タイムアウト、アサーション失敗等）を明記
   - 例:
     ```
     Failed Tests:
     1. `src/components/Practice/NumPad.test.tsx` - Test timed out in 5000ms
     2. `src/hooks/useDartBoard.test.tsx` - Rendering error: ResizeObserver is not defined
     ```

3. **横線を使用したセクション区切り**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Local CI Checks Complete
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

4. **タイムアウトエラーの特別な扱い**
   - タイムアウトが発生した場合、「Test timed out」として明確に表示
   - タイムアウト時間も含める（例: "Test timed out in 5000ms"）
   - テスト分離問題の可能性がある場合、その旨を注記

5. **修正提案の具体化**
   - 各失敗に対する具体的な修正方法を提示
   - 例:
     ```
     Suggested Actions:
     - For timeout issues: Run tests individually with `npm test -- src/components/Practice/NumPad.test.tsx`
     - For ResizeObserver errors: Add ResizeObserver mock in test setup
     ```

## タイムアウトしたテストの報告改善

### 重要な改善点

テストがタイムアウトにより失敗した場合、以下の情報を含めて報告してください：

1. **タイムアウトしたテストの明確な表示**
   ```
   3つのテストがタイムアウトにより失敗しました：

   1. `src/components/Practice/NumPad.test.tsx`
      - テスト: "handles keyboard event handling"
      - タイムアウト: 5000ms

   2. `src/hooks/useDartBoard.test.tsx`  
      - テスト: "renders without crashing"
      - タイムアウト: 5000ms

   3. `src/hooks/useErrorReport.test.tsx`
      - テスト: "collects and formats error information"
      - タイムアウト: 5000ms
   ```

2. **成功/失敗の内訳**
   - 明確な統計情報を提供
   - 例: "Tests (3 failed, 1,948 passed)"
   - 失敗の原因も含める: "3 failed due to timeout"

3. **推奨アクションの追加**
   - タイムアウト問題に対する具体的な解決策
   ```
   推奨アクション:
   - 個別にテストを実行して問題を特定: 
     npm test -- src/components/Practice/NumPad.test.tsx
   - タイムアウト値を増やす（一時的な対処）:
     npm test -- --testTimeout=10000
   - テストの非同期処理を確認
   ```

## 結果報告フォーマットの改善（2025-12-31追加）

### 重要な改善点

サブエージェントの結果を報告する際、以下の点を改善してください：

1. **問題の優先度表示**
   - 修正の優先度を明確に示してください
   - 例:
     ```
     **📋 問題の優先順位:**
     
     1. **Biome format (高優先度)** - 自動修正可能
        ```bash
        npm run check:fix
        ```
     
     2. **ResizeObserver テストエラー (高優先度)** - DartBoard.test.tsxでのモック設定が不十分
     ```

2. **横線セクション区切りの統一**
   - 長い横線（80文字）を使用してセクションを明確に区切ってください
   - 例:
     ```
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ローカルCIチェック結果
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ```

3. **各チェックの詳細表示**
   - 失敗時は具体的なエラー内容を含めてください
   - 成功時は簡潔にまとめてください
   - 例:
     ```
     **Biome check: ✗ FAILED**
     
     2つのテストファイルの形式エラーが検出されました：
     
     1. `src/__tests__/integration/p5-canvas-wrapper.test.tsx` - 行110-143でフォーマット修正が必要
        - JSX要素の折り返しが必要
     
     2. `src/components/DartBoard/DartBoard.test.tsx` - 複数の行でフォーマット修正が必要
        - インデンテーション、JSX構造の折り返しが必要
     ```

4. **obsolete スナップショットの明確な報告**
   - スナップショットの状態を明確に報告してください
   - 例: "スナップショット: 8個が obsolete 状態"

5. **次のステップの明確化**
   - 失敗時は、最初に何を修正すべきかを明確にしてください
   - 例: "まず Biome format を自動修正してから、ResizeObserver のテストエラーを解決する必要があります。"

## テスト失敗分析の改善（2025-12-31追加）

### 重要な改善点

テストが失敗した場合、以下の分析を含めてください：

1. **失敗パターンの分析**
   - 共通の失敗パターンを識別してください
   - 例: 「3投モードの初期状態管理に関する問題」
   - 根本原因の推測を含めてください

2. **具体的な修正方法の提案**
   - 各失敗に対する具体的な修正アプローチを提案
   - 例:
     ```
     修正案:
     - displayedDartsの初期化ロジックを確認
     - currentThrowIndexの初期値設定を見直す（2ではなく3になっている可能性）
     - 3投モード開始時の状態初期化処理を確認
     ```

3. **次のステップの明確な指示**
   - テスト失敗時は必ず次のアクションを明記
   - 例:
     ```
     ## 次のステップ

     テストの失敗は3投モードの初期状態管理に関連しています。以下の順序で対応してください：

     1. `src/stores/gameStore.ts` で displayedDarts の初期化ロジックを確認
     2. `src/hooks/usePracticeSession.ts` で 3投モード時の初期状態を確認
     3. currentThrowIndex の初期値が正しく設定されているか確認
     ```

## サマリー表示の必須化（2025-12-31追加）

### 重要な改善点

結果報告には、必ず以下の形式でサマリーを表示してください：

1. **必須サマリーセクション**
   - 結果の詳細表示後、必ずサマリーセクションを追加してください
   - 例:
     ```
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     サマリー
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     | チェック | 結果 | 詳細 |
     |---------|------|------|
     | Biome   | ❌ FAILED | 2エラー（フォーマット1、複雑性1） |
     | Tests   | ✅ PASSED | 2,066 tests passed |
     | Build   | ❌ FAILED | 13個の型エラー |
     ```

2. **次のステップの必須表示**
   - 失敗時には必ず「次のステップ」セクションを含めてください
   - 修正の優先順位を明確にしてください
   - 例:
     ```
     ## 次のステップ

     1. **Biomeフォーマットエラー（自動修正可能）**
        ```bash
        npm run check:fix
        ```

     2. **TypeScript型エラー（手動修正必要）**
        - `src/stores/gameStore.test.ts` で `null` を `undefined` に変更
        - 該当箇所: 行 3287, 3420, 3565, 3590, 3609, 3636, 3666, 3829, 3936, 4014, 4046, 4114, 4143
        - 修正例: `currentQuestion: null` → `currentQuestion: undefined`

     3. **複雑性エラー（リファクタリング必要）**
        - `src/stores/gameStore.ts:454` の `simulateNextThrow` メソッドをリファクタリング
        - 推奨: 関数を小さな関数に分割して複雑性を15以下に下げる
     ```

3. **自動修正可能/不可能の明確化**
   - Biomeエラーには「自動修正可能」と「手動修正必要」を明確に分けてください
   - 複雑性エラーは自動修正**不可能**です
   - 例:
     ```
     **Biome check: ❌ FAILED**

     - ✅ 自動修正可能: 1件（フォーマット違反）
       → `npm run check:fix` で修正可能

     - ⚠️ 手動修正必要: 1件（複雑性超過）
       → `simulateNextThrow`メソッドのリファクタリングが必要
     ```
