---
description: TDD対応の次タスク実装。TODO.mdから選定し、適切なパイプラインで実装。
---

# TDD対応の次タスク実装

TODO.mdから次のタスクを選定し、テストパターン判定に基づいて適切なTDDパイプラインで実装します。

## 実行フロー

### 0. ドメイン知識の参照（ダーツ関連タスクの場合）

タスクがダーツの点数、バリデーション、シミュレーション、スコア計算に関連する場合、必ず `darts-domain` skill を参照してください：

```
Use the darts-domain skill to load comprehensive darts scoring rules.
```

### 1. TODO.mdから次タスクを選定

Read ツールで TODO.md を読み込み、最初の `- [ ]` (pending) タスクを特定します。

### 2. ブランチ作成

タスク内容に基づいて適切な名前でGitブランチを作成します。

**ブランチ命名規則**:
- **機能追加**: `feature/{機能名}`
- **バグ修正**: `fix/{修正内容}`
- **リファクタリング**: `refactor/{対象}`
- **テスト追加**: `test/{対象}`

**手順**:
1. 現在のブランチを確認: `git branch --show-current`
2. mainブランチから新しいブランチを作成:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b {ブランチ名}
   ```

**例**:
- タスク「入力バリデーション: isValidSingleThrowScore」 → `feature/validation-single-throw`
- タスク「座標変換のバグ修正」 → `fix/coordinate-transform`
- タスク「ストアのリファクタリング」 → `refactor/game-store`

### 3. classify-files でテストパターン判定

Task ツールで classify-files エージェントを起動し、実装対象ファイルのテストパターンを判定します。

**プロンプト例**:
```
TODO.mdの次タスク「{タスク名}」について、実装対象ファイルのテストパターンを判定してください。

対象ファイル: {ファイルパス}

以下を出力してください:
1. tddMode (test-first / test-later)
2. testPattern (unit / store / hook / component / integration)
3. placement (colocated / separated)
4. rationale (判定理由)
5. testFilePath (テストファイルの配置パス)
```

### 4. パイプライン選択と実行

classify-files の判定結果に基づき、適切なパイプラインを**順次実行**します。

**重要**: エージェント間に依存関係があるため、**必ず順次実行**してください。並列実行は不可です。

#### 4-1. テストファーストパイプライン (tddMode: test-first)

```
1. test-writer エージェント起動
   - テストパターンに応じた失敗するテストを作成
   - classify-files が判定した testPattern と testFilePath を渡す

2. test-runner エージェント起動 (Red確認)
   - 期待する状態: RED_EXPECTED
   - 判定: 全テスト失敗 → SUCCESS
   - test-writer が作成したテストファイルパスを渡す

3. implement エージェント起動
   - テストを通す最小限の実装
   - テストファイルパスと実装ファイルパスを渡す

4. test-runner エージェント起動 (Green確認)
   - 期待する状態: GREEN_EXPECTED
   - 判定: 全テスト成功 → SUCCESS

5. review-file エージェント起動 (Refactor判断)
   - review-perspective-selector skill で観点を自動選択
   - 実装ファイルとテストファイルの両方をレビュー
   - 判定: PASS → 完了
   - 判定: WARN → ユーザーに確認「修正しますか？(y/n)」
   - 判定: FAIL → 必須修正（次へ進む）

6. (WARN時にユーザー承認 or FAIL の場合) plan-fix エージェント起動
   - review-fileの指摘事項に基づき修正計画を作成
   - 修正内容をユーザーに提示

7. (ユーザーが承認した場合) implement エージェント起動
   - plan-fixの計画に基づいてRefactor実行
   - テストファイルと実装ファイルの両方を修正可能

8. test-runner エージェント起動
   - 期待する状態: GREEN_EXPECTED
   - 判定: 全テスト成功 → 次へ
   - 判定: 失敗 → 7に戻る（最大3回まで）

9. review-file エージェント起動（再レビュー）
   - 修正後のコードを再度レビュー
   - 判定: PASS → 完了
   - 判定: WARN/FAIL → 6に戻る（最大3回まで）
```

#### 4-2. テストレイターパイプライン (tddMode: test-later)

```
1. implement エージェント起動
   - 実装優先

2. test-writer エージェント起動
   - 実装に基づくテスト作成（Green状態で作成）

3. test-runner エージェント起動
   - 期待する状態: GREEN_EXPECTED
   - 判定: 全テスト成功 → 次へ

4. review-file エージェント起動
   - review-perspective-selector skill で観点を自動選択
   - 実装ファイルとテストファイルの両方をレビュー
   - 判定: PASS → 完了
   - 判定: WARN → ユーザーに確認「修正しますか？(y/n)」
   - 判定: FAIL → 必須修正（次へ進む）

5. (WARN時にユーザー承認 or FAIL の場合) plan-fix エージェント起動
   - review-fileの指摘事項に基づき修正計画を作成

6. (ユーザーが承認した場合) implement エージェント起動
   - plan-fixの計画に基づいてRefactor実行

7. test-runner エージェント起動
   - 期待する状態: GREEN_EXPECTED
   - 判定: 全テスト成功 → 次へ
   - 判定: 失敗 → 6に戻る（最大3回まで）

8. review-file エージェント起動（再レビュー）
   - 修正後のコードを再度レビュー
   - 判定: PASS → 完了
   - 判定: WARN/FAIL → 5に戻る（最大3回まで）
```

### 5. TODO.md更新

タスク完了後、TODO.mdを更新します:
- 完了したタスクを `- [x]` に変更
- 実装したファイルパスを記録 (必要に応じて)

### 6. レポート生成

実行結果をレポートとして出力します:

```markdown
## タスク完了レポート

**タスク**: {タスク名}
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

### 次回の改善点
{エージェント定義ファイルへの改善内容}
```

## エージェント起動の注意点

### 並列 vs 順次実行

**重要**: エージェント間に依存関係があるため、**必ず順次実行**してください。

```javascript
// ❌ 並列実行 (依存関係があるため不可)
[
  Task(test-writer),
  Task(implement)  // test-writerの結果に依存
]

// ✅ 順次実行
Task(test-writer)
→ 完了待ち
→ Task(test-runner, RED_EXPECTED)
→ 完了待ち
→ Task(implement)
→ 完了待ち
→ Task(test-runner, GREEN_EXPECTED)
```

### 状態の受け渡し

各エージェントの出力結果を次のエージェントに渡します:

```
test-writer の出力:
  - testFilePath: "src/utils/scoreCalculator.test.ts"

→ test-runner に渡す:
  - targetFile: "src/utils/scoreCalculator.test.ts"
  - expectation: "RED_EXPECTED"

→ implement に渡す:
  - testFilePath: "src/utils/scoreCalculator.test.ts"
  - implFilePath: "src/utils/scoreCalculator.ts"
```

### エージェント起動例

**classify-files エージェント**:
```javascript
{
  "subagent_type": "classify-files",
  "model": "haiku",
  "prompt": "TODO.mdの次タスク「{タスク名}」について、実装対象ファイルのテストパターンを判定してください。\n\n対象ファイル: {ファイルパス}\n\n以下を出力してください:\n1. tddMode (test-first / test-later)\n2. testPattern (unit / store / hook / component / integration)\n3. placement (colocated / separated)\n4. rationale (判定理由)\n5. testFilePath (テストファイルの配置パス)"
}
```

**test-writer エージェント**:
```javascript
{
  "subagent_type": "test-writer",
  "model": "sonnet",
  "prompt": "{testPattern} パターンで {testFilePath} にテストを作成してください。\n\n実装ファイル: {implFilePath}\n\nテストは失敗する状態 (Red) で作成してください。"
}
```

**test-runner エージェント**:
```javascript
{
  "subagent_type": "test-runner",
  "model": "haiku",
  "prompt": "{testFilePath} のテストを実行し、{expectation} であることを確認してください。"
}
```

**implement エージェント**:
```javascript
{
  "subagent_type": "implement",
  "model": "sonnet",
  "prompt": "{implFilePath} を実装してください。\n\nテストファイル: {testFilePath}\n\nテストを通す最小限の実装をしてください。"
}
```

**review-file エージェント**:
```javascript
{
  "subagent_type": "review-file",
  "model": "haiku",
  "prompt": "まず、review-perspective-selector skill を使用して {implFilePath} に適切なレビュー観点を選択してください。\n\n選択された観点ファイル（.claude/review-points/*.md）を使用してレビューを実施してください。\n\n対象ファイル:\n- 実装: {implFilePath}\n- テスト: {testFilePath}\n\nPASS/WARN/FAILで判定してください。"
}
```

**plan-fix エージェント**:
```javascript
{
  "subagent_type": "plan-fix",
  "model": "haiku",
  "prompt": "review-file の指摘事項に基づき、{implFilePath} の修正計画を作成してください。"
}
```

## エラーハンドリング

### テストが Red にならない場合 (test-writer 直後)

```
→ 警告を出力
→ test-writer.md に改善提案を追加 (フィードバックフック経由)
→ 続行するかユーザーに確認
```

### テストが Green にならない場合 (implement 直後)

```
→ plan-fix エージェント起動
→ 修正計画を作成
→ implement エージェント再起動
→ 最大3回までリトライ
→ それでも失敗 → ユーザーに報告
```

### classify-files の判定が不明確な場合

```
→ ユーザーに確認
→ 手動で tddMode と testPattern を選択
→ パイプライン続行
```

## 重要な注意事項

### 1. エージェント定義ファイルを直接編集しない

フィードバックフック (SubagentStop) が自動で改善します。手動編集は構造的な問題のみに限定してください。

### 2. テストファイルパスの一貫性

classify-files が提案したパスを厳守してください:
- **colocated**: 同階層 (例: `src/utils/scoreCalculator.test.ts`)
- **separated**: `src/__tests__/integration/` (例: `src/__tests__/integration/gameFlow.test.ts`)

### 3. SubagentStop フックの自動実行

各エージェント完了時に自動評価が実行されます:
- レポートは `.claude/reports/{agent-type}/` に保存
- エージェント定義ファイルに改善が追記される (必要に応じて)

### 4. TODO.md の更新タイミング

- **全パイプライン完了後**に更新してください
- 途中でエラーが起きた場合は更新しないでください

### 5. 座標系の分離 (プロジェクト固有)

このプロジェクトでは、物理座標 (mm) と画面座標 (pixel) を厳密に分離します:
- **物理座標 (mm)**: すべてのロジック・計算
- **画面座標 (pixel)**: 描画のみ

実装時、この原則を守ってください。

## 検証方法

1. 手動で `/tdd-next` を実行
2. TODO.md の次タスクが選択される
3. classify-files が判定を行う
4. 適切なパイプラインが実行される
5. ファイルが作成される
6. テストが全て通る
7. TODO.md が更新される
8. フィードバックレポートが生成される

---

**Note**: このコマンドは複雑なパイプラインを実行します。各エージェントの完了を待ち、順次実行することを忘れないでください。
