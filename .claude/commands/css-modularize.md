---
description: コンポーネントのCSSスタイルを独立ファイルに分離。スナップショットで差分検証。
---

# CSSモジュール化コマンド

index.cssからコンポーネント固有のCSSスタイルを独立した.cssファイルに分離します。
スナップショットテストでCSS分離前後の差分がないことを保証します。

## 使用方法

```bash
/css-modularize
```

パラメータは不要です。TODO.mdから自動的に次のCSSモジュール化タスクを選択します。

## このコマンドが実行されたら

以下の手順を**順次実行**してください（並列実行は不可）：

1. **TODO.mdを読み込み**、Phase 8.3セクションから次の未完了タスクを特定
2. タスク記述からコンポーネント名、CSSクラス、カテゴリを抽出
3. **ブランチ作成**: `refactor/css-{コンポーネント名}`
4. **test-writer**: スナップショットテスト作成（CSS分離前）
5. **implement**: CSS分離実施
6. **test-runner**: スナップショット差分が0件であることを確認
7. **local-ci-checker**: 全体CIチェック
8. **コミット作成**: 3コミット（CSS分離 + TODO.md更新 + 評価レポート）
9. **TODO.md更新**: タスクを完了状態に変更

**重要**: 各ステップが完了してから次に進んでください。エラーが出たら報告してください。

## 実行フロー

### 0. TODO.mdから次タスクを選定

Read ツールで TODO.md を読み込み、Phase 8.3（CSSモジュール化）セクションから最初の `- [ ]` (pending) タスクを特定します。

**対象セクション**: TODO.mdの「### 8.3 CSSモジュール化」以下

**検索パターン**:
1. Phase 8.3のセクションを探す（行番号: 427-468あたり）
2. その中で最初の `- [ ]` を見つける
3. Settings配下、Practice配下、Results配下のいずれかに分類

**タスク記述例**:
```markdown
#### Settings配下のコンポーネント（8タスク）
- [x] `PresetSelector.tsx`のスタイルを分離（...）
- [ ] `SessionConfigSelector.tsx`のスタイルを分離（`SessionConfigSelector.css`作成、`.session-config-selector*`, `.session-mode-button*`, `.session-param-button*`を移行）
```

**抽出する情報**:
- **コンポーネント名**: バッククォート内の`.tsx`ファイル名から拡張子を除去 → `SessionConfigSelector`
- **CSSクラスプレフィックス**: カッコ内で`.`で始まる文字列のリスト → `.session-config-selector*`, `.session-mode-button*`, `.session-param-button*`
- **コンポーネントカテゴリ**: サブセクション名から判定
  - "Settings配下のコンポーネント" → `src/components/Settings/`
  - "Practice配下のコンポーネント" → `src/components/Practice/`
  - "Results配下のコンポーネント" → `src/components/Results/`
- **完全なコンポーネントパス**: `src/components/{カテゴリ}/{コンポーネント名}.tsx`

**例**:
- タスク: `` `SessionConfigSelector.tsx`のスタイルを分離（...） ``
- カテゴリ: "Settings配下のコンポーネント"
- 結果: `src/components/Settings/SessionConfigSelector.tsx`

### 1. ブランチ作成

タスク内容に基づいてrefactorブランチを作成します。

**ブランチ命名規則**: `refactor/css-{コンポーネント名をケバブケース化}`

**手順**:
```bash
git checkout main
git pull origin main
git checkout -b refactor/css-{component-name}
```

**例**:
- `SessionConfigSelector` → `refactor/css-session-config-selector`
- `DetailedSettings` → `refactor/css-detailed-settings`

### 2. classify-files でテストパターン判定（オプショナル）

CSSモジュール化タスクは常に以下のパターンになります：
- **tddMode**: `test-later`（既存機能のリファクタリング）
- **testPattern**: `component`
- **placement**: `colocated`
- **testFilePath**: `src/components/{カテゴリ}/{コンポーネント名}.test.tsx`

**判定をスキップする場合**: 上記の前提で直接次のステップに進む

**判定を実行する場合**: classify-filesエージェントを起動して確認

### 3. test-writer でスナップショットテスト作成（CSS分離前）

**目的**: CSS分離前の描画状態をキャプチャ

**重要**: この時点ではCSS分離を行わず、現在の状態でスナップショットを作成します。

**プロンプト例**:
```
{コンポーネント名}.tsx のスナップショットテストを作成してください。

## 目的
CSS分離の前後で、コンポーネントの描画結果に差分が出ないことを検証するためのスナップショットテストを作成します。

## タスク内容
src/components/{カテゴリ}/{コンポーネント名}.test.tsx を作成（または既存ファイルに追加）し、以下のスナップショットテストを実装してください：

1. **基本的なレンダリング**: デフォルト状態のスナップショット
2. **主要な状態バリエーション**: 重要な状態（アクティブ、選択済みなど）のスナップショット

## 実装方針
- test-writer.md セクション4の component パターンに従う
- このタスクではスナップショットテストのみを作成（セマンティックテストは既存のまま）
- CSS分離前の状態をキャプチャすることが目的
- テストは**成功する状態（Green）**で作成（既存の実装に対するスナップショット）

## テストファイルパス
src/components/{カテゴリ}/{コンポーネント名}.test.tsx

## 実装ファイル
src/components/{カテゴリ}/{コンポーネント名}.tsx
```

### 4. implement でCSS分離を実施

**目的**: index.cssからスタイルを抽出し、独立したCSSファイルを作成

**プロンプト例**:
```
{コンポーネント名}.tsxのスタイルを独立したCSSファイルに分離してください。

## タスク概要
index.cssから{コンポーネント名}関連のスタイルを抽出し、{コンポーネント名}.css を作成します。

## 実施手順
1. src/components/{カテゴリ}/{コンポーネント名}.css を作成
2. index.css から .{クラス名プレフィックス}* のスタイルをコピー
3. {コンポーネント名}.tsx に import './{コンポーネント名}.css' を追加
4. index.css から該当部分を削除

## 移行対象のスタイル
- {対象となるCSSクラスのリスト}

## 注意事項
- 機能は一切変更しない（スタイルの配置場所のみを変更）
- index.css の区切りコメントも削除
- {コンポーネント名}.css には見出しコメントを追加
- インデントやフォーマットはそのまま維持
```

**移行対象のスタイル特定方法**:
```bash
# index.cssで対象クラスを検索
grep -n "\.{クラス名プレフィックス}" src/index.css
```

### 5. test-runner でスナップショット差分確認

**目的**: CSS分離前後で描画結果が一致することを確認

**期待する状態**: GREEN_EXPECTED

**プロンプト例**:
```
{コンポーネント名}.test.tsx のテストを実行し、スナップショットに差分が出ないことを確認してください。

## 実行対象
src/components/{カテゴリ}/{コンポーネント名}.test.tsx

## 期待する状態
GREEN_EXPECTED - CSS分離前に作成したスナップショットと、CSS分離後の描画結果が一致すること

## 確認ポイント
- 全テストが成功すること
- スナップショットの差分が0件であること
- 特にスナップショットテストが全て成功すること

もし差分が出た場合は、詳細を報告してください。
```

### 6. local-ci-checker で全体CIチェック

**目的**: 全体への影響がないことを確認

**プロンプト例**:
```
{コンポーネント名}.tsxのCSS分離が完了しました。local-ci スキルに従って、ローカルマシン上で Biome check、テスト、ビルドを並列実行し、全てのチェックが成功することを確認してください。全ての結果をまとめて報告してください。
```

**期待する結果**:
- Biome check: PASSED
- Tests: PASSED (全1914テスト)
- Build: PASSED

### 7. コミット作成

**1コンポーネントにつき3コミット**を作成します：

#### 7.1. CSS分離のコミット

```bash
git add src/components/{カテゴリ}/{コンポーネント名}.tsx \
        src/components/{カテゴリ}/{コンポーネント名}.css \
        src/components/{カテゴリ}/{コンポーネント名}.test.tsx \
        src/components/{カテゴリ}/__snapshots__/{コンポーネント名}.test.tsx.snap \
        src/index.css

git commit -m "refactor: {コンポーネント名}のスタイルを独立したCSSファイルに分離

index.cssから.{クラス名プレフィックス}*のスタイルを
{コンポーネント名}.cssに移行。コンポーネントのモジュール化を推進。

変更内容:
- {コンポーネント名}.cssを新規作成（X行）
- {コンポーネント名}.tsxにCSSインポートを追加
- index.cssから該当スタイル（X行）を削除
- スナップショットテストで差分がないことを確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### 7.2. TODO.md更新のコミット

```bash
git add TODO.md

git commit -m "docs: {コンポーネント名}のCSS分離タスクを完了とマーク

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### 7.3. 評価レポートのコミット

```bash
git add .claude/

git commit -m "chore: エージェント評価レポートを追加

{コンポーネント名}のCSS分離で使用したエージェントの評価レポート:
- test-writer: スナップショットテスト作成
- implement: CSS分離実施
- test-runner: スナップショット差分確認
- local-ci-checker: 全体CIチェック

エージェント定義ファイルも自動更新（フィードバックフック）。

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 8. TODO.md更新

TODO.mdで該当タスクを完了状態に変更：

```markdown
- [x] `{コンポーネント名}.tsx`のスタイルを分離（...）
```

**重要**: 全パイプライン完了後（local-ci-checkerが成功し、コミットが完了した後）に更新してください。

## タスク情報の抽出方法

TODO.mdのタスク記述から以下の情報を抽出します：

**タスク記述例**:
```markdown
- [ ] `SessionConfigSelector.tsx`のスタイルを分離（`SessionConfigSelector.css`作成、`.session-config-selector*`, `.session-mode-button*`, `.session-param-button*`を移行）
```

**抽出する情報**:
1. **コンポーネント名**: バッククォート内の`.tsx`ファイル名 → `SessionConfigSelector`
2. **CSSクラスプレフィックス**: カッコ内の`.`で始まる文字列 → `.session-config-selector*`, `.session-mode-button*`, `.session-param-button*`
3. **コンポーネントカテゴリ**: Phase 8.3のサブセクションから判定
   - "Settings配下" → `src/components/Settings/`
   - "Practice配下" → `src/components/Practice/`
   - "Results配下" → `src/components/Results/`

## エージェント実行の注意点

### 順次実行が必須

エージェント間に依存関係があるため、**必ず順次実行**してください。

```javascript
// ❌ 並列実行 (不可)
[Task(test-writer), Task(implement)]

// ✅ 順次実行
Task(test-writer) → 完了待ち
→ Task(implement) → 完了待ち
→ Task(test-runner) → 完了待ち
→ Task(local-ci-checker)
```

### 状態の受け渡し

各エージェントの出力結果を次のエージェントに渡します：

```
test-writer の出力:
  - testFilePath: "src/components/Settings/SessionConfigSelector.test.tsx"
  - スナップショット作成完了

→ implement に渡す:
  - implFilePath: "src/components/Settings/SessionConfigSelector.tsx"
  - cssFilePath: "src/components/Settings/SessionConfigSelector.css"

→ test-runner に渡す:
  - testFilePath: "src/components/Settings/SessionConfigSelector.test.tsx"
  - expectation: "GREEN_EXPECTED"
```

## トラブルシューティング

### スナップショットに差分が出た場合

1. **原因調査**: どのスナップショットで差分が出たか確認
2. **CSS適用の確認**: CSSファイルが正しくインポートされているか確認
3. **スタイル内容の確認**: index.cssからの移行が正確か確認
4. **差分の評価**: 許容できる差分か、バグか判断
5. **修正**: implement エージェントで修正、または手動修正
6. **再実行**: test-runner で再確認

### local-ci-checkerが失敗した場合

1. **失敗したチェックを確認**: Biome/Test/Build のどれが失敗したか
2. **エラー内容を分析**: ログから原因を特定
3. **修正**: 必要に応じて implement エージェントで修正
4. **再実行**: local-ci-checker で再確認
5. **最大3回までリトライ**: それでも失敗 → ユーザーに報告

## 完了条件

以下がすべて満たされた場合、タスク完了とみなします：

- ✅ 独立したCSSファイルが作成された
- ✅ コンポーネントにCSSインポートが追加された
- ✅ index.cssから該当スタイルが削除された
- ✅ スナップショットテストの差分が0件
- ✅ local-ci-checkerが全て成功（Biome/Test/Build）
- ✅ 3つのコミットが作成された（CSS分離 + TODO.md更新 + 評価レポート）
- ✅ TODO.mdが更新された
- ✅ 評価レポートとエージェント定義の更新がコミットされた

## 次のタスクへ

Phase 8.3（CSSモジュール化）の次のタスクに進むには、再度同じコマンドを実行します：

```bash
/css-modularize
```

TODO.mdから自動的に次の未完了タスクが選択されます。

**注意**: Phase 8.3のすべてのタスクが完了している場合（すべて `- [x]`）、エラーになります。その場合は他のPhaseのタスクに進んでください。

```bash
/tdd-next  # 汎用的な次タスク実行（Phase問わず）
```

---

## Phase 8.3対応コンポーネント一覧（参考）

### Settings配下（8タスク）
1. PresetSelector ✅
2. SessionConfigSelector
3. DetailedSettings
4. TargetSelector
5. DifficultySelector
6. SettingsPanel
7. SetupWizard（Step1-4）
8. 設定サマリー・開始ボタン（SettingsPanel.cssに統合）

### Practice配下（5タスク）
9. StatsBar
10. QuestionDisplay
11. NumPad
12. Feedback
13. PracticeScreen

### Results配下（2タスク）
14. SessionSummary
15. ResultsScreen

### 最終確認（4タスク）
16. index.cssの最終整理
17. 全コンポーネントの視覚的確認
18. 全テスト確認
19. ビルド確認
