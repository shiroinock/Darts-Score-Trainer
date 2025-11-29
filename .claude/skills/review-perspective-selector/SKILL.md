# Review Perspective Selector Skill

このskillは、実装ファイルの種別に応じて適切なレビュー観点デッキを自動選択します。

## 目的

- ファイルの特性（ドメインロジック、UI、ユーティリティ等）を判定
- 適切なレビュー観点ファイル（`.claude/review-points/*.md`）を選択
- review-fileエージェントに渡す観点リストを生成

## ファイル分類と観点マッピング

### 1. ドメインロジック（ビジネスロジック）

**ファイルパターン**:
- `src/utils/gameLogic.ts`
- `src/utils/scoreCalculator.ts`
- `src/utils/validation.ts`
- `src/utils/presets.ts`
- `src/utils/quizGenerator.ts`

**適用観点**:
- ✅ `specification.md` (必須) - COMPLETE_SPECIFICATION.md との整合性
- ✅ `typescript.md` (必須) - 型安全性
- ❌ `coordinates.md` - 座標を扱わない場合は不要

**理由**: ビジネスルールが正確に実装されているかが最重要

---

### 2. 座標・幾何計算

**ファイルパターン**:
- `src/utils/coordinateTransform.ts`
- `src/utils/targetCoordinates.ts`
- `src/utils/throwSimulator.ts`
- `src/components/DartBoard/dartBoardRenderer.ts`
- `src/components/DartBoard/*.tsx` (P5Canvas等)

**適用観点**:
- ✅ `coordinates.md` (必須) - 座標系の分離原則
- ✅ `typescript.md` (必須) - 型安全性
- ✅ `specification.md` (推奨) - ボード寸法等の仕様準拠

**理由**: 物理座標（mm）と画面座標（pixel）の混同が致命的

---

### 3. 型定義

**ファイルパターン**:
- `src/types/index.ts`
- `src/types/*.ts`

**適用観点**:
- ✅ `typescript.md` (必須) - 型安全性
- ✅ `specification.md` (必須) - 仕様書の型定義との整合性
- ❌ `coordinates.md` - 座標系の実装は型定義では扱わない

**理由**: 型の正確性とnull安全性が重要

---

### 4. React コンポーネント（UI層）

**ファイルパターン**:
- `src/components/Settings/*.tsx`
- `src/components/Practice/*.tsx`
- `src/components/Results/*.tsx`
- `src/App.tsx`

**適用観点**:
- ✅ `typescript.md` (必須) - 型安全性
- ✅ `project-structure.md` (推奨) - コンポーネント配置
- ❌ `specification.md` - UI設計は仕様書に詳細がない場合が多い
- ❌ `coordinates.md` - UI層では座標変換を直接扱わない

**理由**: Reactのベストプラクティスと型安全性が重要

---

### 5. 状態管理（Zustand Store）

**ファイルパターン**:
- `src/stores/gameStore.ts`
- `src/stores/*.ts`

**適用観点**:
- ✅ `typescript.md` (必須) - 型安全性
- ✅ `specification.md` (必須) - 状態構造が仕様通りか
- ❌ `coordinates.md` - ストア自体は座標変換しない

**理由**: 状態の型安全性と仕様準拠が重要

---

### 6. カスタムフック

**ファイルパターン**:
- `src/hooks/*.ts`

**適用観点**:
- ✅ `typescript.md` (必須) - 型安全性
- ❌ `specification.md` - フックは仕様書に詳細がない場合が多い
- ❌ `coordinates.md` - フックで座標変換を直接扱うことは稀

**理由**: Reactフックのルールと型安全性が重要

---

### 7. 定数定義

**ファイルパターン**:
- `src/utils/constants.ts`

**適用観点**:
- ✅ `specification.md` (必須) - 定数値が仕様通りか
- ✅ `typescript.md` (必須) - 型安全性
- ❌ `coordinates.md` - 定数定義自体は座標変換しない

**理由**: 仕様書の数値との完全一致が重要

---

### 8. テストファイル

**ファイルパターン**:
- `src/**/*.test.ts`
- `src/**/*.test.tsx`
- `src/__tests__/**/*.test.ts`

**適用観点**:
- ✅ `test-quality.md` (必須) - テスト品質チェック
- ✅ `typescript.md` (必須) - 型安全性
- ✅ 対応する実装ファイルの観点を継承
  - 例: `gameLogic.test.ts` → `specification.md` も適用
  - 例: `coordinateTransform.test.ts` → `coordinates.md` も適用

**理由**: テストは実装と同じ観点で検証すべき + テスト固有の品質観点

---

## 自動選択ロジック

```typescript
function selectReviewPerspectives(filePath: string): string[] {
  const perspectives: string[] = [];

  // 全ファイルに適用
  perspectives.push('typescript.md');

  // テストファイル
  if (/\.test\.(ts|tsx)$/.test(filePath) || /__tests__\//.test(filePath)) {
    perspectives.push('test-quality.md'); // テスト品質チェック（必須）

    // 対応する実装ファイルの観点を継承
    const implFilePath = filePath.replace(/\.test\.(ts|tsx)$/, '.$1').replace(/__tests__\//, '');
    perspectives.push(...selectReviewPerspectives(implFilePath).filter(p => p !== 'test-quality.md'));

    return [...new Set(perspectives)];
  }

  // ドメインロジック
  if (/gameLogic|scoreCalculator|validation|presets|quizGenerator/.test(filePath)) {
    perspectives.push('specification.md');
  }

  // 座標・幾何計算
  if (/coordinate|transform|throwSimulator|targetCoordinates|dartBoard/.test(filePath)) {
    perspectives.push('coordinates.md');
    if (/dartBoard/.test(filePath)) {
      perspectives.push('specification.md'); // ボード寸法も確認
    }
  }

  // 型定義
  if (/types\//.test(filePath)) {
    perspectives.push('specification.md');
  }

  // 定数定義
  if (/constants\.ts/.test(filePath)) {
    perspectives.push('specification.md');
  }

  // 状態管理
  if (/stores\//.test(filePath)) {
    perspectives.push('specification.md');
  }

  // プロジェクト構造（新規ファイル追加時）
  if (isNewFile(filePath)) {
    perspectives.push('project-structure.md');
  }

  return [...new Set(perspectives)]; // 重複削除
}
```

---

## 使用例

### review-fileエージェント呼び出し時

```javascript
// classify-filesの結果からファイル種別を取得
const filePath = "src/utils/gameLogic.ts";

// skillを使って観点を自動選択
Use the review-perspective-selector skill to determine appropriate review perspectives for ${filePath}

// 出力例:
// - typescript.md
// - specification.md

// review-fileエージェントに渡す
{
  "subagent_type": "review-file",
  "prompt": `以下の観点ファイルを使用して ${filePath} をレビューしてください:

観点ファイル:
- .claude/review-points/typescript.md
- .claude/review-points/specification.md

PASS/WARN/FAILで判定してください。`
}
```

---

## 観点デッキのskill化について

**結論: 現状の `.claude/review-points/` のままでOK**

**理由**:
1. **参照効率は同じ**: skillとして読み込んでも、直接ファイルを読んでも、Read toolの呼び出し回数は同じ
2. **明確な責務分離**:
   - `.claude/review-points/` = 観点の**内容**（what）
   - `.claude/skills/review-perspective-selector/` = 観点の**選択ロジック**（which）
3. **保守性**: 観点ファイルは独立したドキュメントとして管理しやすい

**skillにすべき場合**:
- 観点ファイルが頻繁に更新され、バージョン管理が必要な場合
- 観点の内容が複雑で、プログラム的な処理（計算、条件分岐）が必要な場合

---

## 使用方法

### TDDパイプライン (`/tdd-next`) での使用

```markdown
### ステップ5: review-file エージェント起動 (Refactor判断)

1. review-perspective-selector skill を使用して観点を選択
2. 選択された観点ファイルを指定してreview-fileエージェントを起動
3. テストファイルも必ず確認
```

### スラッシュコマンド `/review-code` での使用

既存の `/review-code` コマンドは classify-files エージェントが観点を自動選択しているため、このskillと統合できます。

---

## 今後の拡張

### 観点の追加が必要なケース

1. **パフォーマンス観点** (`performance.md`)
   - 対象: アニメーションループ、大量データ処理
2. **アクセシビリティ観点** (`accessibility.md`)
   - 対象: UIコンポーネント
3. **セキュリティ観点** (`security.md`)
   - 対象: 入力バリデーション、localStorage操作
4. **テストカバレッジ観点** (`test-coverage.md`)
   - 対象: すべてのテストファイル

これらの観点が追加されたら、このskillの選択ロジックを更新してください。
