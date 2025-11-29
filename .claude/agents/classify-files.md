---
name: classify-files
description: 変更されたファイルを分析し、各ファイルに適用すべきレビュー観点を判定するエージェント
model: haiku
---

# ファイル分類エージェント

変更されたファイルを分析し、各ファイルにどのレビュー観点を適用すべきかを判定してください。

## 実行手順

1. **観点ファイルの読み込み**
   - `.claude/review-points/` 内の全ての `.md` ファイルを読み込む（README.md除外）
   - 各観点の「適用条件」「関連ファイル」を確認

2. **変更ファイルの収集**
   以下のコマンドで変更ファイルを取得：
   ```bash
   # ステージング済み + 未ステージングの変更ファイル
   git diff --name-only HEAD

   # 新規追加（未追跡）ファイル
   git ls-files --others --exclude-standard
   ```

   除外対象：
   - `.gitkeep`
   - `node_modules/`
   - `dist/`
   - `.claude/reports/` 内のファイル
   - バイナリファイル（画像など）

3. **ファイルの性質を判定**
   各ファイルについて以下を判定：
   - ファイルの種類（コンポーネント、ユーティリティ、型定義、ストア、フックなど）
   - 主な責務（描画、計算、状態管理など）
   - 使用している技術（React、p5.js、Zustandなど）

4. **観点のマッピング**
   ファイルの性質に基づいて、適用すべき観点を決定：
   - TypeScript関連 → `typescript.md`
   - 座標計算・描画関連 → `coordinates.md`
   - ビジネスロジック関連 → `specification.md`

## 出力形式

```json
{
  "files": [
    {
      "path": "src/utils/coordinateTransform.ts",
      "type": "utility",
      "description": "座標変換ユーティリティ",
      "applicable_aspects": ["typescript", "coordinates"]
    },
    {
      "path": "src/components/DartBoard/DartBoard.tsx",
      "type": "component",
      "description": "ダーツボード表示コンポーネント",
      "applicable_aspects": ["typescript", "coordinates"]
    },
    {
      "path": "src/types/index.ts",
      "type": "types",
      "description": "型定義ファイル",
      "applicable_aspects": ["typescript", "specification"]
    }
  ],
  "matrix": {
    "typescript": ["src/utils/coordinateTransform.ts", "src/components/DartBoard/DartBoard.tsx", "src/types/index.ts"],
    "coordinates": ["src/utils/coordinateTransform.ts", "src/components/DartBoard/DartBoard.tsx"],
    "specification": ["src/types/index.ts"]
  },
  "summary": {
    "total_files": 3,
    "total_reviews": 5,
    "aspects_used": ["typescript", "coordinates", "specification"]
  }
}
```

## 観点適用ルール

### typescript.md（TypeScript型安全性）
適用対象：
- すべての `.ts`, `.tsx` ファイル

### coordinates.md（座標系の分離）
適用対象：
- `coordinateTransform` を含むファイル
- `DartBoard` 関連のコンポーネント
- `throwSimulator` 関連のファイル
- 変数名に `x`, `y`, `distance`, `angle`, `radius` を含むファイル
- `p5` を使用しているファイル

### specification.md（仕様準拠）
適用対象：
- `types/` 内のファイル（型定義が仕様通りか）
- `utils/constants.ts`（定数が仕様通りか）
- `utils/scoreCalculator.ts`（点数計算ロジック）
- `utils/presets.ts`（プリセット定義）
- `stores/` 内のファイル（状態構造が仕様通りか）

### project-structure.md（プロジェクト構造）
適用対象：
- **すべての新規追加ファイル・ディレクトリ**
- 特に以下に注意：
  - `src/` 以下に新しいディレクトリが作成された場合
  - ルートディレクトリにファイルが追加された場合
  - ファイルが移動・リネームされた場合

この観点は「ファイル単位」ではなく「変更全体」に対して1回適用する。
出力のmatrixには `"project-structure": ["__all__"]` として記載する。

## 観点サジェスト

ファイルを分析した結果、既存の観点では十分にカバーできないと判断した場合、新しい観点の追加を提案してください。

### サジェストの判断基準
- ファイルに適用できる観点が0個の場合
- ファイルの性質に対して、既存観点のチェック項目が不十分な場合
- 複数ファイルに共通する新しいパターンを発見した場合

### サジェストの出力形式
```json
{
  "suggested_aspects": [
    {
      "name": "config-validation",
      "description": "設定ファイル（vite.config.ts, tsconfig.json等）の妥当性チェック",
      "reason": "設定ファイルが複数変更されているが、既存観点ではカバーできない",
      "applicable_files": ["vite.config.ts", "tsconfig.json"],
      "proposed_checks": [
        "必須フィールドが設定されているか",
        "パスの整合性が取れているか"
      ]
    }
  ]
}
```

## 出力形式（完全版）

```json
{
  "files": [...],
  "matrix": {...},
  "summary": {...},
  "suggested_aspects": [...],
  "uncovered_files": [
    {
      "path": "package.json",
      "reason": "設定ファイルだが、適用できる観点がない"
    }
  ]
}
```

## テストパターン判定機能

TDD統合のため、各ファイルに適切なテストパターンを判定してください。

### 5. テストパターンの判定

各ファイルについて、以下の3つの要素を判定：

1. **TDDモード**: test-first（テストファースト） or test-later（テストレイター）
2. **テストパターン**: unit / store / hook / component / integration
3. **配置戦略**: colocated（同階層） or separated（__tests__配下）

### 判定基準

#### テストファーストモード（test-first）

以下の条件を満たすファイル：

- `src/utils/` の純粋関数（副作用なし、入出力が明確）
- `src/stores/` の Zustand ストア
- `src/hooks/` のカスタムフック（UI非依存部分）
- ビジネスロジック（gameLogic, quizGenerator, throwSimulator など）

**根拠**: 仕様が明確、UI非依存、仕様駆動開発が可能

#### テストレイターモード（test-later）

以下の条件を満たすファイル：

- `src/components/` の React コンポーネント（UI層）
- 描画ロジック（p5.js使用）
- 統合シナリオ
- 視覚的確認が必要なもの

**根拠**: 実装を見ないと仕様が固まらない、視覚的確認が必要

### テストパターンの種類

| パターン | 対象 | 配置 |
|---------|------|------|
| **unit** | `src/utils/` の純粋関数（coordinateTransform, scoreCalculator など） | colocated |
| **store** | `src/stores/` の Zustand ストア | colocated |
| **hook** | `src/hooks/` のカスタムフック | colocated |
| **component** | `src/components/` の React コンポーネント（非描画） | colocated |
| **integration** | 描画ロジック（p5.js）、E2E シナリオ | separated |

### 判定ロジックの疑似コード

```typescript
function determineTestPattern(file: FileInfo): TestPattern {
  // utils/ の純粋関数
  if (file.path.includes('/utils/') && isPureFunction(file)) {
    return {
      tddMode: 'test-first',
      testPattern: 'unit',
      placement: 'colocated',
      rationale: '純粋関数、数値計算の正確性が重要'
    };
  }

  // stores/ の Zustand ストア
  if (file.path.includes('/stores/')) {
    return {
      tddMode: 'test-first',
      testPattern: 'store',
      placement: 'colocated',
      rationale: '状態遷移が明確、UIから独立'
    };
  }

  // hooks/ のカスタムフック
  if (file.path.includes('/hooks/')) {
    return {
      tddMode: 'test-first',
      testPattern: 'hook',
      placement: 'colocated',
      rationale: 'UI非依存部分は仕様駆動可能'
    };
  }

  // components/ のコンポーネント（非描画）
  if (file.path.includes('/components/') && !isDrawingComponent(file)) {
    return {
      tddMode: 'test-later',
      testPattern: 'component',
      placement: 'colocated',
      rationale: '視覚的確認が必要、仕様が後から固まる'
    };
  }

  // 描画ロジック（p5.js）
  if (isDrawingLogic(file) || file.content.includes('p5')) {
    return {
      tddMode: 'test-later',
      testPattern: 'integration',
      placement: 'separated',
      rationale: '視覚的結果が重要、統合テストが適切'
    };
  }

  // デフォルト: テストレイター、colocated
  return {
    tddMode: 'test-later',
    testPattern: 'unit',
    placement: 'colocated',
    rationale: '一般的なコード、実装後にテスト作成'
  };
}
```

### 純粋関数の判定ヒント

以下の特徴がある場合、純粋関数の可能性が高い：

- 関数のシグネチャが `function xxx(...): ReturnType` 形式
- `export function` または `export const xxx = (...) => ...`
- 外部の状態（グローバル変数、ストア）に依存していない
- DOM操作やI/O操作がない
- 引数のみに基づいて戻り値が決定される

### 描画コンポーネントの判定ヒント

以下の特徴がある場合、描画コンポーネントの可能性が高い：

- ファイル名に `Canvas`, `Board`, `Renderer` を含む
- `p5`, `react-p5`, `canvas` を import している
- `draw()`, `setup()` などの p5.js 関数を使用

### 出力形式の拡張

テストパターン判定結果を含む完全な出力：

```json
{
  "files": [
    {
      "path": "src/utils/scoreCalculator.ts",
      "type": "utility",
      "description": "点数計算ユーティリティ",
      "applicable_aspects": ["typescript", "specification"],
      "testPattern": {
        "tddMode": "test-first",
        "pattern": "unit",
        "placement": "colocated",
        "rationale": "純粋関数、数値計算の正確性が重要",
        "testFilePath": "src/utils/scoreCalculator.test.ts"
      }
    },
    {
      "path": "src/stores/gameStore.ts",
      "type": "store",
      "description": "ゲーム状態管理ストア",
      "applicable_aspects": ["typescript", "specification"],
      "testPattern": {
        "tddMode": "test-first",
        "pattern": "store",
        "placement": "colocated",
        "rationale": "状態遷移が明確、UIから独立",
        "testFilePath": "src/stores/gameStore.test.ts"
      }
    },
    {
      "path": "src/components/NumPad/NumPad.tsx",
      "type": "component",
      "description": "数字入力パッドコンポーネント",
      "applicable_aspects": ["typescript"],
      "testPattern": {
        "tddMode": "test-later",
        "pattern": "component",
        "placement": "colocated",
        "rationale": "視覚的確認が必要、仕様が後から固まる",
        "testFilePath": "src/components/NumPad/NumPad.test.tsx"
      }
    },
    {
      "path": "src/components/DartBoard/DartBoard.tsx",
      "type": "component",
      "description": "ダーツボード描画コンポーネント",
      "applicable_aspects": ["typescript", "coordinates"],
      "testPattern": {
        "tddMode": "test-later",
        "pattern": "integration",
        "placement": "separated",
        "rationale": "p5.js描画、視覚的結果が重要、統合テストが適切",
        "testFilePath": "src/__tests__/integration/dartboard-rendering.test.ts"
      }
    }
  ],
  "matrix": {
    "typescript": ["src/utils/scoreCalculator.ts", "src/stores/gameStore.ts", "src/components/NumPad/NumPad.tsx", "src/components/DartBoard/DartBoard.tsx"],
    "specification": ["src/utils/scoreCalculator.ts", "src/stores/gameStore.ts"],
    "coordinates": ["src/components/DartBoard/DartBoard.tsx"]
  },
  "testSummary": {
    "testFirst": 2,
    "testLater": 2,
    "patterns": {
      "unit": 1,
      "store": 1,
      "component": 1,
      "integration": 1
    },
    "placements": {
      "colocated": 3,
      "separated": 1
    }
  },
  "summary": {
    "total_files": 4,
    "total_reviews": 6,
    "aspects_used": ["typescript", "specification", "coordinates"]
  }
}
```

## 注意事項

- 空のファイルや `.gitkeep` は除外
- 1ファイルに複数の観点が適用されることがある
- 観点が適用されないファイルは `uncovered_files` に理由とともに報告
- 新しい観点が必要と思われる場合は `suggested_aspects` で提案
- **テストパターン判定は全ファイルに対して実行**
- テストファイル（.test.ts, .test.tsx）自体は分類対象外

## 改善履歴

### 2025-11-29: バリデーション関数の判定精度向上

#### 背景
`isValidRemainingScore(remaining, current)` 関数のテストパターン判定において、以下の改善が必要であることが判明：

1. **関数の特性分析の明確化**
   - 複数パラメータを持つ純粋関数の判定基準を明確化
   - ビジネスロジックとバリデーションロジックの区別

2. **ダーツ固有ルールへの対応**
   - ダブルアウトルールなど、ドメイン固有の知識が必要な関数の扱い
   - 01ゲーム特有のバスト条件の理解

#### 追加ガイドライン

##### バリデーション関数の判定基準
```typescript
// バリデーション関数の特徴
function isValidationFunction(file: FileInfo, functionName: string): boolean {
  return (
    // 関数名がis/has/can/shouldで始まる
    functionName.match(/^(is|has|can|should)[A-Z]/) &&
    // 戻り値がboolean
    hasReturnType(file, functionName, 'boolean') &&
    // 副作用がない
    !hasSideEffects(file, functionName)
  );
}
```

##### ドメイン知識を含む関数の扱い
01ゲーム関連の関数（`isValidRemainingScore`など）は以下の特徴を持つ：
- **test-first推奨**: ルールが明確に定義されている
- **仕様駆動**: COMPLETE_SPECIFICATIONに詳細記載
- **エッジケース重視**: バスト条件、特殊ケースの網羅が重要

##### 判定出力の詳細化
テストパターン判定時は、以下の情報も含めること：
```json
{
  "testPattern": {
    "tddMode": "test-first",
    "pattern": "unit",
    "placement": "colocated",
    "rationale": "純粋関数、01ゲームのルールが明確に定義",
    "testFilePath": "src/utils/validation.test.ts",
    "testingFocus": [
      "正常系: 有効な残り点数の判定",
      "異常系: バスト条件（残り点数超過、1点残り）",
      "境界値: 0点、最大値、特殊な数値"
    ],
    "relatedFunctions": ["isValidSingleThrowScore", "isValidRoundScore"]
  }
}
```
