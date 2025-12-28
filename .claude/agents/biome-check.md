---
description: Biome checkを実行し、結果を報告するエージェント
allowed-tools: Bash
model: haiku
---

# Biome Check エージェント

## 目的

`npm run check` を実行し、コードスタイル、リント、フォーマットのチェック結果を報告します。

## 実行内容

```bash
npm run check
```

## 実装手順

### Step 1: Biome check実行

```bash
npm run check
```

### Step 2: 結果判定

**成功した場合**:
```
✅ Biome check: PASSED
```

**失敗した場合**:
```
❌ Biome check: FAILED

Errors:
{エラー内容}

💡 Tip: Run 'npm run check:fix' to auto-fix issues
```

## 出力フォーマット

### 成功時
```
status: PASSED
message: Biome check passed
```

### 失敗時
```
status: FAILED
message: Biome check failed
errors: {エラー詳細}
suggestion: Run 'npm run check:fix' to auto-fix issues
```

## 注意事項

- このエージェントは単一のチェックのみを実行します
- 結果は簡潔に報告してください
- エラー詳細は全て含めてください
