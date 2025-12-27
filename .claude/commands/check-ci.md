# 現在のブランチのCI状態を確認して修正方針を提案

現在チェックアウトしているブランチのCI/CD実行状態を確認し、失敗がある場合は原因を分析して修正方針を提案してください。

**重要**: このコマンドは **サブエージェントを使用せず**、Bashツールで直接実装してください。

## 実装手順

### 1. 現在のブランチの最新CI実行を取得（並列実行）

```bash
# 現在のブランチ名
git branch --show-current

# 最新のCI実行リスト（JSON形式、CIワークフローのみ）
gh run list --branch $(git branch --show-current) --limit 5 --json databaseId,status,conclusion,createdAt,name,event
```

### 2. CIワークフローを特定

`name: "CI"` のワークフローを見つける（Claude Code ReviewやDeployは除外）

### 3. ステータスに応じた処理

#### ✅ success（完了・成功）
```markdown
## CI Status Report

**ブランチ**: {branch}
**ステータス**: ✅ すべてのチェックがパスしました

**実行されたジョブ:**
- biome-check: ✅ 成功
- test: ✅ 成功
- build: ✅ 成功

このブランチはマージ可能な状態です。
```

#### ❌ failure（完了・失敗）

```bash
# 失敗したジョブのログを取得
gh run view <run-id> --log-failed
```

**ログから以下を抽出:**
1. どのジョブが失敗したか（biome-check / test / build）
2. どのステップで失敗したか
3. エラーメッセージの内容

**エラーパターンマッチング:**
- `npm ci` + `lock file` → package-lock.json不整合
- `biome check` + `fixed` → コードスタイル違反
- `test` + `FAIL` → テスト失敗
- `error TS` + 行番号 → TypeScript型エラー
- その他 → ログから推測

**修正方針レポートを生成:**
```markdown
## CI Status Report

**ブランチ**: {branch}
**CI実行**: {run-id} (completed - failure)

### 失敗したジョブ
- {job-name}: "{step-name}"で失敗

### エラー内容
{エラーメッセージ抜粋}

### 原因
{特定した原因}

### 修正方針
1. {修正手順1}
2. {修正手順2}

### 修正コマンド（推奨）
```bash
{具体的なコマンド}
```

### 次のステップ
- [ ] 上記コマンドを実行
- [ ] 変更をコミット
- [ ] プッシュしてCIを再実行
```

#### 🔄 in_progress（実行中）

```bash
# 現在の進行状況を表示
gh run view <run-id>
```

```markdown
## CI Status Report

**ブランチ**: {branch}
**ステータス**: 🔄 CI実行中

**進行状況:**
- biome-check: {status}
- test: {status}
- build: {status}

完了まで待機するか、現状を監視しますか？
```

#### ⏸️ queued（待機中）

```markdown
## CI Status Report

**ブランチ**: {branch}
**ステータス**: ⏸️ CI待機中

ジョブがキューに入っています。しばらく待ってから再度確認してください。
```

### 4. ユーザーに確認・修正実行

修正方針を提示した後、ユーザーに確認：
```
この修正方針で進めてよろしいですか？
```

承認されたら、提案したコマンドを実行。

## 実装上の注意事項

### ❌ やってはいけないこと
- WebFetchツールでGitHub ActionsのHTMLページを取得する
- review-fileやその他のサブエージェントにログ解析を依頼する
- サブエージェントを使用する

### ✅ 正しい実装
- Bashツールで `gh` コマンドを直接実行
- JSON出力を解析（`--json` オプション）
- ログは `--log-failed` で取得
- エラーパターンは文字列マッチングで判定

## エラーパターン辞書

| パターン | 原因 | 修正コマンド |
|---------|------|------------|
| `npm ci` + `EUSAGE` + `lock file` | package-lock.json不整合 | `rm -rf node_modules package-lock.json && npm install` |
| `biome check` + `fixed` | コードスタイル違反 | `npm run check` |
| `test` + `FAIL` + ファイル名 | テスト失敗 | `npm run test` で確認して修正 |
| `error TS2322` / `TS2564` など | TypeScript型エラー | 該当ファイルを修正 |
| `exclude` + テストファイル | tsconfig.json設定不足 | tsconfig.jsonにexclude追加 |

## 使用例

```
User: /check-ci
Assistant: 現在のブランチのCI状態を確認します...
          [Bashツールでgh runコマンドを実行]
          [結果を分析してレポート生成]
          [修正方針を提示]
```
