# 次のタスクを選定してブランチを作成

TODO.mdとCOMPLETE_SPECIFICATION.mdを参照し、次に着手すべき最小単位のタスクを選定してブランチを作成してください。

## 手順

1. **TODO.mdを読み込み**、未完了のタスク（`- [ ]`）を特定する
2. **依存関係を確認**：
   - 先行タスクが完了しているか確認
   - 同一サブセクション内のタスクは上から順に実行
   - 例：1.1の型定義が完了していないと1.2以降に着手しない
3. **最小単位のタスクを選定**：
   - サブセクション単位（例：1.1 型定義、1.2 定数定義）を1タスクとする
   - サブセクションが大きい場合は、さらに分割を検討
4. **COMPLETE_SPECIFICATION.md**から該当タスクの詳細仕様を抽出
5. **ブランチ名を生成**：
   - 形式: `feature/<phase>-<section>-<short-description>`
   - 例: `feature/1-1-type-definitions`
   - 例: `feature/2-1-dartboard-renderer`
6. **ユーザーに確認**を求める：
   - 選定したタスクの概要
   - 関連する仕様のサマリー
   - 提案するブランチ名
7. **承認されたらブランチを作成**：
   ```bash
   git checkout -b <branch-name>
   ```

## ブランチ命名規則

- `feature/` プレフィックス
- Phase番号とセクション番号をハイフン区切りで含める
- 短い英語の説明（ケバブケース）
- 例：
  - `feature/1-1-type-definitions`
  - `feature/1-3-coordinate-transform`
  - `feature/2-2-p5-canvas`
  - `feature/5-1-preset-selector`

## 出力フォーマット

```
## 次のタスク

**Phase**: X
**セクション**: X.Y タスク名
**ブランチ名**: `feature/x-y-description`

### タスク内容
- [ ] タスク1
- [ ] タスク2
...

### 関連仕様
COMPLETE_SPECIFICATION.mdからの抜粋...

### 依存関係
- 先行タスク: （あれば）
- 後続タスク: （あれば）

このブランチを作成してよろしいですか？
```

## 注意事項

- mainブランチから新しいブランチを切る
- 既に同名のブランチが存在しないか確認
- 選定理由を明確にする
