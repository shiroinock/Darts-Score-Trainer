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
   - `.claude/` ディレクトリ内のすべてのファイル
   - `.gitkeep`
   - `node_modules/`
   - `dist/`
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
- `.claude/` ディレクトリ内のファイルは除外（分析対象外）
- 1ファイルに複数の観点が適用されることがある
- 観点が適用されないファイルは `uncovered_files` に理由とともに報告
- 新しい観点が必要と思われる場合は `suggested_aspects` で提案
- **テストパターン判定は全ファイルに対して実行**
- テストファイル（.test.ts, .test.tsx）自体は分類対象外
- CSSファイル（.css, .scss, .sass）は `uncovered_files` に記載

### 2025-11-29: 純粋な列挙関数の判定基準追加

#### 背景
`getAllTargets()` 関数（全ターゲットリスト生成）のテストパターン判定において、純粋な列挙・リスト生成関数の扱いを明確化する必要がある。

#### 追加ガイドライン

##### 列挙・リスト生成関数の判定基準
```typescript
// 列挙・リスト生成関数の特徴
function isEnumerationFunction(file: FileInfo, functionName: string): boolean {
  return (
    // 関数名にget/list/enumerate/allを含む
    functionName.match(/^(get|list|enumerate).*|.*All.*/) &&
    // 配列を返す
    hasReturnType(file, functionName, 'Array') &&
    // 固定値またはループによる生成
    isGeneratingFixedSet(file, functionName)
  );
}
```

##### 列挙関数のテストパターン判定
`getAllTargets()` のような列挙関数の特徴：
- **test-first推奨**: 期待される出力が仕様から明確
- **単純なユニットテスト**: 配列の内容と順序を確認
- **網羅性の確認**: 全要素が含まれているかの検証

##### 判定の具体例
```json
{
  "testPattern": {
    "tddMode": "test-first",
    "pattern": "unit",
    "placement": "colocated",
    "rationale": "純粋な列挙関数、期待される出力が明確",
    "testFilePath": "src/utils/targetCoordinates.test.ts",
    "testingFocus": [
      "全61ターゲットの存在確認",
      "ターゲットの順序と構造の検証",
      "型の一貫性確認"
    ]
  }
}
```

### 2025-11-30: 描画コンポーネントとテストファイルの扱いの明確化

#### 背景
`dartBoardRenderer.ts` の分析において、以下の点について改善が必要：

1. **描画専用ファイルのテストパターン判定**
   - p5.js の描画専用コンポーネントの判定精度向上
   - 描画関数（drawDoubleRing, drawTripleRing等）の集合体の扱い

2. **テストファイル自体の扱い**
   - コメントアウトされたテストファイルの適切な分類
   - テストファイルに観点を適用すべきかの判断基準

#### 追加ガイドライン

##### 描画専用ファイルの判定基準
```typescript
// 描画専用ファイルの特徴
function isRenderingOnlyFile(file: FileInfo): boolean {
  return (
    // ファイル名に renderer/render/drawing を含む
    file.name.match(/(renderer|render|drawing)/i) &&
    // 複数の draw 関数を含む
    file.functions.filter(f => f.name.startsWith('draw')).length > 3 &&
    // p5 インスタンスを使用
    file.imports.includes('p5') || file.parameters.includes('p: p5')
  );
}
```

##### 描画専用ファイルのテストパターン
- **必ず test-later + integration**: 視覚的確認が主目的
- **placement は separated**: 統合テストとして別管理
- **rationale に「描画専用」を明記**: 判定理由を明確化

##### テストファイルの扱い
1. **基本方針**: テストファイル（.test.ts, .test.tsx）は分類対象外
2. **例外**: 以下の場合は分析対象に含める
   - テストファイル自体に問題がある場合（コメントアウトなど）
   - テストファイルの移動・リネームがある場合
3. **観点適用**: テストファイルには通常観点を適用しない
   - 適用する場合は `uncovered_files` に理由付きで記載

##### 参考ファイル（.js）の扱い
- **基本方針**: 参考用ファイルは分類対象外
- **明記方法**: `uncovered_files` に「参考実装ファイル」として記載
- **観点適用**: しない（TypeScript観点など適用不可）

### 2025-12-29: エージェント定義ファイルとCSSファイルの扱い明確化

#### 背景
実行結果で以下の問題が確認された：
1. `.claude/` ディレクトリ内のファイルに観点を適用しようとした
2. CSSファイルの扱いが不明確だった
3. 出力が途中で切れる問題が発生した

#### 追加ガイドライン

##### 除外対象の明確化
以下のファイルは分析対象外とし、出力に含めない：
- `.claude/` ディレクトリ内のすべてのファイル（エージェント定義、レポートなど）
- `.gitkeep` ファイル
- バイナリファイル（画像、フォントなど）

##### CSSファイルの扱い
- **基本方針**: CSSファイル（`.css`, `.scss`, `.sass`）は `uncovered_files` に記載
- **理由**: 現在の観点（TypeScript、座標系、仕様）では適用不可
- **テストパターン**: 判定対象外
- **重要**: CSSファイルに対してテストパターン判定を求められた場合でも、以下のように応答すること：
  ```json
  {
    "error": "CSS files are not eligible for test pattern determination",
    "reason": "CSS files do not contain executable logic and cannot be unit tested",
    "suggestion": "For CSS validation, consider using CSS linters or visual regression testing tools"
  }
  ```

##### 出力の簡潔化
出力が長大になる場合は、以下の優先順位で情報を含める：
1. 重要なファイル（ソースコード）の完全な分析結果
2. `matrix` と `summary` 
3. `testSummary`（存在する場合）
4. `suggested_aspects` と `uncovered_files`

### 2025-12-29: まだ存在しないファイルの扱いの明確化

#### 背景
エージェントが存在しないファイル（`src/styles/index.css`）に対してテストパターン判定を行おうとした際に、以下の問題が発生：
1. ファイルの存在確認を行わずに判定を試みた
2. 出力が途中で切れてしまった

#### 追加ガイドライン

##### 存在しないファイルへの対応
エージェントは、ファイルのテストパターン判定を求められた場合：

1. **必ずファイルの存在を確認**：Read ツールまたは LS ツールで確認
2. **存在しない場合の応答**：
   ```json
   {
     "error": "File does not exist",
     "path": "対象ファイルパス",
     "message": "The specified file does not exist yet. Test pattern determination requires an actual file to analyze."
   }
   ```

3. **TODO.mdとの整合性**：存在しないファイルがTODO.mdに記載されている場合は、実装前の段階であることを明記

##### エラー時の出力形式
エラーや特殊なケースでは、必ず完全なJSON形式で応答すること。出力が途中で切れることを防ぐため、簡潔な形式を使用。

### 2025-12-31: 動的レイアウト調整コンポーネントの判定基準追加

#### 背景
Phase 8.5「ボードサイズの動的調整」のテストパターン判定において、以下の改善点を発見：
1. 動的レイアウト調整機能を持つコンポーネントの判定基準が不明確
2. ResizeObserver や windowResized などの動的サイズ調整に関する判定基準が不足

#### 追加ガイドライン

##### 動的レイアウトコンポーネントの判定基準
```typescript
// 動的レイアウト調整コンポーネントの特徴
function isDynamicLayoutComponent(file: FileInfo): boolean {
  return (
    // ResizeObserver または window.resize イベントを使用
    (file.content.includes('ResizeObserver') || 
     file.content.includes('window.addEventListener') ||
     file.content.includes('windowResized')) &&
    // サイズ計算関数を持つ
    hasCalculateSizeFunction(file) &&
    // コンポーネントまたはキャンバス要素
    (file.path.includes('/components/') || file.content.includes('canvas'))
  );
}
```

##### 動的レイアウトコンポーネントのテストパターン
動的にサイズ調整を行うコンポーネント：
- **test-later必須**: 実装後の視覚的確認とリサイズ動作の確認が必要
- **componentパターン**: リサイズイベントのシミュレーションが必要
- **統合テストも検討**: p5.jsキャンバスの場合は統合テストが適切

##### テスト実装時の注意点
動的レイアウト調整のテストでは以下に注意：
- ウィンドウサイズの変更をモック/シミュレート
- 計算されたサイズが正しく適用されることを確認
- デバウンス/スロットリングがある場合はタイミングも考慮
- レスポンシブデザインの各ブレークポイントでのテスト

## 改善履歴

### 2025-11-30: ファイル名パターンと責務の整合性チェック強化

#### 背景
実際のサブエージェント実行で、`dartBoardRenderer.ts` を「レンダラーファイル」として正しく分類できていたが、以下の改善点を発見：

1. **ファイル名と内容の整合性確認の重要性**
   - `renderer` という名前のファイルは描画専用であることが期待される
   - 実際の関数名（drawXXX）との整合性を確認すべき

2. **testPatternの判定根拠の具体化**
   - 「描画ロジック中心のため視覚的確認が必要」という根拠は適切
   - より具体的な判定基準（関数数、p5依存度など）を追加

#### 追加ガイドライン

##### ファイル名パターンによる事前分類
```typescript
const fileNamePatterns = {
  rendering: /(renderer|render|drawing|canvas|board)/i,
  utility: /(utils?|helper|service)/i,
  store: /(store|state)/i,
  hook: /(use[A-Z]|hooks?)/i,
  component: /(component|view|page)/i,
  types: /(types?|interface|model)/i,
  config: /(config|settings?|constants?)/i
};
```

##### 責務の一貫性チェック
ファイル名から期待される責務と実際の内容が一致するか確認：
- `renderer` → 描画関数が主体であることを確認
- `calculator` → 計算関数が主体であることを確認
- `validator` → バリデーション関数が主体であることを確認

不一致の場合は、`notes` フィールドに記載して注意喚起。

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

### 2025-11-29: 統計的アルゴリズム関数の判定基準追加

#### 背景
`generateNormalDistribution(mean, stdDev)` 関数（Box-Muller法）のテストパターン判定において、統計的アルゴリズムに関する判定基準の明確化が必要。

#### 追加ガイドライン

##### 統計的アルゴリズム関数の判定基準
```typescript
// 統計的・数学的アルゴリズム関数の特徴
function isStatisticalFunction(file: FileInfo, functionName: string): boolean {
  return (
    // 関数名に統計・数学用語を含む
    functionName.match(/(generate|calculate|compute).*(Distribution|Random|Probability|Mean|Deviation|Variance)/) ||
    // ファイル名が simulator/generator/calculator を含む
    file.path.match(/(simulator|generator|calculator)\.ts$/) &&
    // 純粋関数である
    isPureFunction(file)
  );
}
```

##### 統計的関数のテストパターン判定
`throwSimulator.ts` のような統計的計算を行う関数：
- **test-first必須**: アルゴリズムの正確性が重要
- **統計的検証**: 分布の検証、平均・分散のテストが必要
- **シード固定テスト**: 再現性のためのテストも考慮

##### 出力形式の完全性確保
エージェントは必ず完全な JSON 形式で出力すること：
```json
{
  "tddMode": "test-first",
  "testPattern": "unit",
  "placement": "colocated",
  "rationale": "統計的アルゴリズム、数値計算の正確性が重要",
  "testFilePath": "src/utils/throwSimulator.test.ts",
  "testingFocus": [
    "正規分布の生成確認",
    "平均値・標準偏差の検証",
    "境界値テスト（極端な標準偏差）"
  ]
}
```

### 2025-12-27: プリセット関数の判定基準追加

#### 背景
`src/utils/presets.ts` のテストパターン判定において、プリセット定義と関連ユーティリティ関数の判定基準を明確化する必要がある。

#### 追加ガイドライン

##### プリセット関連関数の判定基準
```typescript
// プリセット関連関数の特徴
function isPresetFunction(file: FileInfo, functionName: string): boolean {
  return (
    // ファイルパスにpresetを含む
    file.path.includes('preset') &&
    // プリセット関連の関数名
    functionName.match(/(find|get|generate).*Preset|generateCustomId/) &&
    // 純粋関数である
    isPureFunction(file)
  );
}
```

##### プリセット関数のテストパターン判定
`presets.ts` のようなプリセット定義・検索関数：
- **test-first推奨**: プリセット定義は仕様から明確
- **網羅的なテスト**: 全プリセットパターンのマッチング確認
- **エッジケース**: カスタム設定、部分一致、不一致の検証

##### 判定の具体例
```json
{
  "testPattern": {
    "tddMode": "test-first",
    "pattern": "unit",
    "placement": "colocated",
    "rationale": "プリセット定義と検索ロジック、仕様が明確",
    "testFilePath": "src/utils/presets.test.ts",
    "testingFocus": [
      "全5種類のプリセット定義の確認",
      "findMatchingPreset の正確なマッチング",
      "generateCustomId の一意性確保",
      "getPresetById の取得確認"
    ]
  }
}

### 2025-12-28: 設定UIコンポーネントのテストパターン判定強化

#### 背景
`DetailedSettings.tsx` のテストパターン判定において、複雑な条件付きレンダリングと状態管理を持つ設定UIコンポーネントの判定基準を明確化する必要がある。特に、出力が途中で切れてしまう問題も確認された。

#### 追加ガイドライン

##### 設定UIコンポーネントの判定基準
```typescript
// 設定UIコンポーネントの特徴
function isSettingsUIComponent(file: FileInfo): boolean {
  return (
    // ファイルパスにsettings/configを含む
    file.path.match(/\/(settings|config).*\.tsx$/) &&
    // フォーム要素（ラジオボタン、セレクトボックスなど）を含む
    hasFormElements(file) &&
    // 状態管理ストアと連携
    usesStateManagement(file) &&
    // 条件付きレンダリングを含む
    hasConditionalRendering(file)
  );
}
```

##### 設定UIコンポーネントのテストパターン判定
`DetailedSettings.tsx` のような複雑な設定UIコンポーネント：
- **test-later必須**: UIの視覚的確認と相互作用のテストが必要
- **componentパターン**: React Testing Libraryでのユーザインタラクションテスト
- **統合的なテスト**: 状態管理との連携、条件付きレンダリングの確認

##### 出力形式の簡潔化と完全性の確保
テストパターン判定の出力は、以下の形式で簡潔にまとめること：
```json
{
  "tddMode": "test-later",
  "testPattern": "component",
  "placement": "colocated",
  "rationale": "複雑なUI相互作用と条件付きレンダリング、視覚的確認が必要",
  "testFilePath": "src/components/Settings/DetailedSettings.test.tsx"
}
```

### 2025-12-29: ルートコンポーネントのテストパターン判定とエージェントの汎用性改善

#### 背景
`App.tsx` のテストパターン判定において、以下の問題が確認された：
1. ルートコンポーネント（純粋な画面切り替えロジック）の判定基準が不明確
2. エージェントが特定のタスクに特化した出力をしてしまい、汎用的な分類ができていない
3. レビュー観点のマッピングが行われなかった

#### 追加ガイドライン

##### ルートコンポーネントの判定基準
```typescript
// ルートコンポーネントの特徴
function isRootComponent(file: FileInfo): boolean {
  return (
    // App.tsx または index.tsx
    file.name.match(/^(App|index)\.tsx$/) &&
    // 条件付きレンダリングで画面を切り替える
    hasConditionalScreenRendering(file) &&
    // ビジネスロジックを含まない
    !hasBusinessLogic(file) &&
    // 主に他のコンポーネントを組み合わせるだけ
    isComposingComponents(file)
  );
}
```

##### ルートコンポーネントのテストパターン判定
`App.tsx` のような純粋なルートコンポーネント：
- **test-later推奨**: シンプルなUI切り替えのため、実装後の確認で十分
- **componentパターン**: 各画面の表示条件をテスト
- **colocated配置**: 同階層にテストファイルを配置

##### 汎用的な分類の徹底
エージェントは以下の情報を**常に**含めること：
1. **ファイル分類情報**: type, description, applicable_aspects
2. **テストパターン情報**: tddMode, pattern, placement, rationale, testFilePath
3. **レビュー観点マッピング**: matrix, summary

特定のタスク（単一ファイルのテストパターン判定など）を求められた場合でも、classify-filesエージェントとしての本来の機能を忘れずに、完全な分類情報を出力すること。

##### 判定の具体例
```json
{
  "files": [{
    "path": "src/App.tsx",
    "type": "component",
    "description": "ルートコンポーネント、画面切り替え",
    "applicable_aspects": ["typescript"],
    "testPattern": {
      "tddMode": "test-later",
      "pattern": "component",
      "placement": "colocated",
      "rationale": "純粋なUI分岐ロジック、ビジネスロジックなし",
      "testFilePath": "src/App.test.tsx"
    }
  }],
  "matrix": {
    "typescript": ["src/App.tsx"]
  },
  "summary": {
    "total_files": 1,
    "total_reviews": 1,
    "aspects_used": ["typescript"]
  }
}
```

### 2025-12-29: CSS分離リファクタリングタスクのテストパターン判定強化

#### 背景
`PresetSelector.tsx` のCSS分離タスクにおいて、エージェントが以下の問題を示した：
1. 特定のテストパターン判定のみに集中し、完全な分類出力を行わなかった
2. レビュー観点のマッピングを実施しなかった

#### 追加ガイドライン

##### CSS分離リファクタリングの判定基準
CSS分離リファクタリングタスクの特徴：
- **既存機能の変更なし**: 機能は一切変わらず、スタイルの配置場所のみ変更
- **test-later必須**: リファクタリングであり、新規機能追加ではない
- **視覚的確認が必要**: CSSが正しく適用されているか確認が必要
- **回帰テストの重要性**: 分離前後で見た目と動作が同一であることを保証

##### エージェントの出力要件の再確認
単一ファイルのテストパターン判定を求められた場合でも、以下を必ず含めること：

1. **標準的な分類出力形式の使用**
   - `files` 配列内にファイル情報を格納
   - `testPattern` オブジェクトを各ファイルに含める

2. **レビュー観点の適用**
   - TypeScript ファイルには最低限 `typescript` 観点を適用
   - 該当する他の観点も判定して適用

3. **完全な出力構造**
   ```json
   {
     "files": [...],
     "matrix": {...},
     "summary": {...}
   }
   ```

##### CSS分離タスクの判定例
```json
{
  "files": [{
    "path": "src/components/Settings/PresetSelector.tsx",
    "type": "component",
    "description": "プリセット選択UIコンポーネント",
    "applicable_aspects": ["typescript"],
    "testPattern": {
      "tddMode": "test-later",
      "pattern": "component",
      "placement": "colocated",
      "rationale": "既存機能のスタイル分離リファクタリング、視覚的確認が必要",
      "testFilePath": "src/components/Settings/PresetSelector.test.tsx",
      "testingFocus": [
        "CSS適用の確認（グリッドレイアウト、ホバー状態）",
        "機能の維持確認（5つのプリセットボタン表示、クリック動作）",
        "回帰テスト（CSS分離前後で同一動作）"
      ]
    }
  }],
  "matrix": {
    "typescript": ["src/components/Settings/PresetSelector.tsx"]
  },
  "summary": {
    "total_files": 1,
    "total_reviews": 1,
    "aspects_used": ["typescript"]
  }
}
```

### 2025-12-31: 出力の簡潔化と完全性の強化

#### 背景
`PracticeScreen.tsx` のテストパターン判定において、以下の問題が確認された：
1. 出力が途中で切れてしまった（コードの引用が長すぎた）
2. 完全なJSON形式での出力が行われなかった
3. コードの引用が過剰で、判定に不要な情報を含めていた

#### 追加ガイドライン

##### 出力の簡潔化ルール
テストパターン判定時は、以下のルールを厳守すること：

1. **コードの引用は最小限に**
   - ファイルの内容を長く引用しない
   - 判定に必要な特徴（関数名、importなど）のみを言及
   - 現在のコードの詳細な引用は不要

2. **即座にJSON出力に移行**
   - ファイルの特徴を簡潔に述べた後、すぐにJSON形式で結果を出力
   - 判定理由は `rationale` フィールド内に含める

3. **出力文字数の上限意識**
   - 全体の出力が2000文字を超えないよう意識
   - 長くなりそうな場合は、詳細を省略して必須項目のみ出力

##### 必須出力形式（簡潔版）
単一ファイルのテストパターン判定を求められた場合は、以下の簡潔な形式で出力すること：

```json
{
  "file": "src/components/Practice/PracticeScreen.tsx",
  "type": "component",
  "applicable_aspects": ["typescript"],
  "tddMode": "test-later",
  "testPattern": "component",
  "placement": "colocated",
  "rationale": "Reactコンポーネント、状態管理とUI相互作用、視覚的確認が必要",
  "testFilePath": "src/components/Practice/PracticeScreen.test.tsx"
}
```

##### 複雑なコンポーネントの判定基準
`PracticeScreen.tsx` のような複雑な画面コンポーネント：
- **test-later必須**: 複数の状態、イベントハンドラ、条件付きレンダリングを含む
- **componentパターン**: React Testing Libraryでのユーザインタラクションテスト
- **統合的なテスト**: ストアとの連携、複数の子コンポーネントの協調動作

##### 過剰な分析の回避
以下の情報は出力に含めないこと：
- ファイル内の具体的なコード（5行以上の引用）
- TODO.mdの詳細な内容
- 関連しない関数やコンポーネントの説明
- 実装方針の提案（判定結果のみを出力）

### 2026-01-01: 複数ファイル判定時の出力完全性強化

#### 背景
Phase F「チェックアウトトライ時のフィニッシュ選択肢追加」の判定において、出力がJSON開始直後で切れてしまう問題が発生した。複数ファイル（4ファイル）の判定を求められた際に、出力が完了しなかった。

#### 問題の根本原因
1. 複数ファイルの判定時に、各ファイルの分析に時間をかけすぎた
2. 導入テキスト（「〜について分析した結果です」等）が長すぎた
3. JSON出力の開始が遅れ、途中で切れた

#### 追加ガイドライン

##### 複数ファイル判定時の出力戦略

**最重要ルール**: JSON出力を最優先で開始すること

1. **導入文は1行以内**
   - ❌ 悪い例: 「Phase F「チェックアウトトライ時のフィニッシュ選択肢追加」に関連する主要な実装対象ファイルについて、TDDの観点から分析した結果です。」
   - ✅ 良い例: 「判定結果:」

2. **即座にJSON出力を開始**
   - ファイルの分析が完了次第、すぐにJSONを出力
   - 分析の途中経過は出力しない

3. **簡潔なrationale**
   - 各ファイルの `rationale` は20文字以内を目標
   - 詳細な説明は不要

##### 複数ファイル判定時の出力形式

```json
{
  "files": [
    {
      "path": "src/stores/gameStore.ts",
      "tddMode": "test-first",
      "testPattern": "store",
      "placement": "colocated",
      "rationale": "状態遷移ロジック",
      "testFilePath": "src/stores/gameStore.test.ts"
    },
    {
      "path": "src/components/Practice/BustQuestion.tsx",
      "tddMode": "test-later",
      "testPattern": "component",
      "placement": "colocated",
      "rationale": "UI拡張",
      "testFilePath": "src/components/Practice/BustQuestion.test.tsx"
    }
  ]
}
```

##### 出力文字数の厳格な制限

- **合計出力: 1500文字以内**
- 導入文: 50文字以内
- 各ファイルの判定: 200文字以内
- ファイル数が多い場合は、重要なファイルを優先

##### 判定を省略してよいケース

以下のファイルは、標準的なパターンとして簡易判定してよい：
- `gameStore.ts` → test-first, store, colocated
- `*Screen.tsx` / `*Question.tsx` → test-later, component, colocated
- `src/utils/` 内の純粋関数 → test-first, unit, colocated

##### エラーリカバリー

出力が途中で切れるリスクがある場合：
1. まず最小限の判定結果を出力
2. 余裕があれば詳細を追加
3. 詳細よりも完全性を優先

### 2026-01-01: 単一ファイル判定時の出力完全性強化

#### 背景
Phase H「プレイヤー練習モードでの残り点数減算」の `gameStore.ts` 判定において、単一ファイル判定にもかかわらず出力が途中で切れる問題が発生した。出力は「判定結果:\n\n```json\n{\n  \」で終了し、JSONが完成しなかった。

#### 問題の根本原因
1. 単一ファイルでも出力が途中で切れるケースが存在
2. JSON 出力開始後に処理が中断された可能性
3. 出力の完全性確認が行われていない

#### 追加ガイドライン

##### 単一ファイル判定の最優先ルール

**最重要**: 単一ファイル判定は最もシンプルなケースであり、確実に完全な出力を行うこと

1. **標準パターンファイルの即時判定**
   以下のファイルは分析不要で即座に判定結果を出力：
   - `*Store.ts` / `*store.ts` → test-first, store, colocated
   - `src/hooks/use*.ts` → test-first, hook, colocated
   - `src/utils/` 内の `.ts` ファイル → test-first, unit, colocated
   - `*.tsx` コンポーネント → test-later, component, colocated

2. **gameStore.ts の標準判定**
   `gameStore.ts` は Zustand ストアの標準パターンとして、以下の固定出力を使用：
   ```json
   {
     "file": "src/stores/gameStore.ts",
     "type": "store",
     "tddMode": "test-first",
     "testPattern": "store",
     "placement": "colocated",
     "rationale": "Zustandストア、状態遷移ロジック",
     "testFilePath": "src/stores/gameStore.test.ts"
   }
   ```

3. **出力の完全性チェック**
   JSON を出力する際は、必ず閉じ括弧 `}` まで出力すること。
   出力が途中で切れる場合は、より簡潔な形式に切り替える：
   ```json
   {"tddMode":"test-first","testPattern":"store","placement":"colocated","testFilePath":"src/stores/gameStore.test.ts"}
   ```

##### 単一ファイル判定の出力テンプレート

導入文なしで即座に JSON を出力してもよい：

```
{"file":"[パス]","tddMode":"[test-first|test-later]","testPattern":"[unit|store|hook|component|integration]","placement":"colocated","testFilePath":"[テストファイルパス]"}
```

##### 出力が切れた場合の自己診断

エージェントは自身の出力を監視し、JSON が完成していない場合は再出力を試みること。ただし、外部からの中断には対応できないため、最初から簡潔な出力を心がける。

### 2026-01-01: CSSファイルのみのリストに対する早期エラー応答

#### 背景
Phase 9.1.2「画面レイアウトの動的サイズ対応」のテストパターン判定において、対象ファイルが全てCSSファイル（`QuestionDisplay.css`, `NumPad.css`, `PracticeScreen.css`）であったにもかかわらず、エージェントが通常の判定処理を開始し、出力が途中で切れてしまった。

#### 問題の根本原因
1. CSSファイルはテストパターン判定対象外であることは記載されていたが、「全てのファイルがCSSの場合」の早期応答ルールが明確でなかった
2. エージェントがCSSファイルに対して判定処理を開始してしまった
3. 結果として出力が途中で切れた

#### 追加ガイドライン

##### CSSファイルのみのリストに対する早期応答

**最重要ルール**: 対象ファイルリストに実行可能なコード（`.ts`, `.tsx`, `.js`, `.jsx`）が1つも含まれていない場合、即座にエラー応答を返すこと

1. **判定対象ファイルの事前チェック**
   テストパターン判定を求められた場合、最初に対象ファイルの拡張子を確認：
   - `.css`, `.scss`, `.sass` のみの場合 → 即座にエラー応答
   - `.md`, `.json`, `.yaml` のみの場合 → 即座にエラー応答
   - 上記と `.ts`/`.tsx` の混在 → `.ts`/`.tsx` のみを判定対象に

2. **CSSファイルのみの場合のエラー応答**
   ```json
   {
     "error": "No testable files in the list",
     "reason": "All specified files are CSS files which cannot be unit tested",
     "files": ["src/components/Practice/QuestionDisplay.css", "src/components/Practice/NumPad.css", "src/components/Practice/PracticeScreen.css"],
     "suggestion": "CSS changes should be verified through visual regression testing or manual review. Consider using Storybook snapshots or Chromatic for CSS validation."
   }
   ```

3. **判定処理を開始しない**
   CSSファイルのみの場合、分析や判定処理を一切行わず、即座にエラー応答を返すこと。これにより出力が途中で切れるリスクを回避する。

##### ファイル拡張子による早期フィルタリング

```typescript
function filterTestableFiles(files: string[]): { testable: string[], untestable: string[] } {
  const testable = files.filter(f => /\.(ts|tsx|js|jsx)$/.test(f));
  const untestable = files.filter(f => /\.(css|scss|sass|md|json|yaml|yml)$/.test(f));
  return { testable, untestable };
}

// 使用例
const { testable, untestable } = filterTestableFiles(requestedFiles);
if (testable.length === 0) {
  return {
    error: "No testable files in the list",
    reason: "All specified files are non-testable file types",
    files: untestable,
    suggestion: "..."
  };
}
```

##### CSSリファクタリングタスクへの対応

CSS関連のタスク（レイアウト調整、レスポンシブ対応など）でテストパターン判定を求められた場合：

1. **視覚的確認の推奨**: CSSの変更は視覚的な確認が必要であることを明記
2. **代替テスト手段の提案**: Storybook、Chromatic、Percy等のビジュアルリグレッションツールを推奨
3. **関連するTypeScriptファイルの確認**: CSSと連動するコンポーネント（.tsx）がある場合は、そちらのテストパターンを判定

### 2026-01-01: 既存ファイル内の特定機能修正タスクの判定

#### 背景
「gameStore.tsのgenerateQuestionアクションを修正（シャッフルバッグ方式）」のテストパターン判定において、既存ファイル内の特定機能を修正するタスクに対するガイドラインが不明確であった。また、出力が途中で切れる問題が発生した。

#### 問題の根本原因
1. 既存ファイルの一部機能を修正する場合でも、ファイル全体のテストパターンを判定しようとした
2. タスクの詳細説明に時間をかけ、JSON出力が遅れた
3. 標準パターンファイル（gameStore.ts）に対して過剰な分析を行った

#### 追加ガイドライン

##### 既存ファイルの機能修正タスクの扱い

**最重要ルール**: 既存ファイル内の特定機能を修正するタスクの場合、ファイルの種類に基づいて標準パターンを即座に適用すること

1. **既存ファイル修正の判定基準**
   以下の条件に該当する場合、標準パターンを即座に適用：
   - 既にテストファイルが存在するファイルの修正
   - ファイルタイプが明確（store/hook/utility/component）
   - 新規ファイル作成ではなく、既存ファイルの機能追加・修正

2. **gameStore.ts の機能修正に対する標準応答**
   `gameStore.ts` の任意の機能修正（アクション追加、状態追加など）に対しては、即座に以下を出力：
   ```json
   {"file":"src/stores/gameStore.ts","tddMode":"test-first","testPattern":"store","placement":"colocated","testFilePath":"src/stores/gameStore.test.ts"}
   ```

3. **機能の詳細は判定に影響しない**
   - 「シャッフルバッグ方式」「Fisher-Yatesアルゴリズム」などの実装詳細は判定に不要
   - ファイルタイプ（store/hook/utility/component）のみで判定可能
   - タスク概要の詳細な分析は行わない

##### 超簡潔な出力形式の使用

既存ファイルの機能修正に対しては、導入文なしで1行JSON形式で出力してもよい：

```
{"file":"[パス]","tddMode":"[モード]","testPattern":"[パターン]","placement":"colocated","testFilePath":"[テストパス]"}
```

##### ファイルタイプ別の標準応答

| ファイルパターン | 標準応答 |
|----------------|---------|
| `src/stores/*.ts` | `{"tddMode":"test-first","testPattern":"store","placement":"colocated"}` |
| `src/hooks/*.ts` | `{"tddMode":"test-first","testPattern":"hook","placement":"colocated"}` |
| `src/utils/*.ts` | `{"tddMode":"test-first","testPattern":"unit","placement":"colocated"}` |
| `src/components/*/*.tsx` | `{"tddMode":"test-later","testPattern":"component","placement":"colocated"}` |

### 2026-01-01: 新規コンポーネント作成タスクの判定と出力途中切れ対策

#### 背景
「ZoomViewコンポーネントを作成（src/components/DartBoard/ZoomView.tsx）」のテストパターン判定において、出力が `{"` の直後で途中切れする問題が発生した。新規コンポーネント作成タスクの判定時の問題点：
1. まだ存在しないファイルに対して過剰な分析を試みた
2. JSON出力開始が遅れた
3. ファイルの種類（.tsx）から標準判定を即座に適用しなかった

#### 問題の根本原因
1. **標準パターンの即時適用不足**: `.tsx` ファイルは常に `test-later, component, colocated` であることが確立しているのに、個別分析を試みた
2. **存在しないファイルへの不必要な処理**: 新規作成ファイルは実装後のテストが必須なので、分析不要
3. **出力形式の冗長性**: 簡潔な1行JSON形式を使用すべきだった

#### 追加ガイドライン

##### 新規コンポーネント作成タスクの最優先ルール

**最重要**: 拡張子が `.tsx` の新規ファイルに対しては、ファイルの存在確認や詳細分析を一切行わず、即座に標準パターンを適用すること

1. **新規 .tsx ファイルの標準判定**
   ```typescript
   if (file.endsWith('.tsx') && !fileExists(file)) {
     return {"file": file, "tddMode": "test-later", "testPattern": "component", "placement": "colocated", "testFilePath": file.replace('.tsx', '.test.tsx')};
   }
   ```

2. **ZoomView.tsx の即時判定例**
   タスク詳細（ズーム機能、タップ操作など）に関係なく、即座に以下を出力：
   ```json
   {"file":"src/components/DartBoard/ZoomView.tsx","tddMode":"test-later","testPattern":"component","placement":"colocated","testFilePath":"src/components/DartBoard/ZoomView.test.tsx"}
   ```

3. **導入文の完全省略**
   新規コンポーネント判定時は、導入文を一切書かずにJSON出力のみを行う

##### 拡張子ベースの超高速判定

以下の拡張子は分析不要で即座に標準パターンを適用：

| 拡張子 | 新規ファイル判定 |
|-------|--------------|
| `.tsx` | `{"tddMode":"test-later","testPattern":"component","placement":"colocated"}` |
| `.ts` (components/ 以外) | `{"tddMode":"test-first","testPattern":"unit","placement":"colocated"}` |
| `.ts` (stores/) | `{"tddMode":"test-first","testPattern":"store","placement":"colocated"}` |
| `.ts` (hooks/) | `{"tddMode":"test-first","testPattern":"hook","placement":"colocated"}` |
| `.css` | エラー応答（テスト対象外） |

##### 出力の完全性確保の最終手段

JSON出力が途中で切れるリスクを最小化するため：

1. **最小限のフィールドのみ出力**
   ```json
   {"file":"[パス]","tddMode":"test-later","testPattern":"component","testFilePath":"[テストパス]"}
   ```
   `placement` は省略可能（常に colocated）

2. **改行なしの1行JSON**
   複数行のフォーマットではなく、1行で完結させる

3. **閉じ括弧の優先確保**
   出力制限に達しそうな場合は、フィールドを省略してでも `}` を出力する

##### 新規コンポーネント判定の処理フロー

```typescript
function determineTestPattern(file: string, taskDescription: string): Output {
  // ステップ1: 拡張子チェック
  if (file.endsWith('.css')) {
    return errorResponse("CSS file cannot be tested");
  }

  // ステップ2: 存在確認（新規作成の場合）
  if (!fileExists(file)) {
    // ステップ3: 拡張子ベース判定（分析なし）
    if (file.endsWith('.tsx')) {
      return {
        file,
        tddMode: "test-later",
        testPattern: "component",
        placement: "colocated",
        testFilePath: file.replace('.tsx', '.test.tsx')
      };
    }
    // 他の拡張子も同様に標準パターン適用
  }

  // 既存ファイルの場合は従来のロジック
  // ...
}
```

##### 実行時の注意事項

- タスク詳細（「2-3倍ズーム」「タップでズーム位置変更」など）は判定に一切影響しない
- TODO.mdの内容も参照不要
- 「モバイルデバイスでの視認性」などの要件も判定に無関係
- ファイルパスと拡張子のみで判定完了