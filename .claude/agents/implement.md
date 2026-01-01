---
name: implement
description: TypeScript/Reactの実装タスクを担当するエージェント。コード実装、コンポーネント作成、ユーティリティ関数の実装を行う。
model: sonnet
---

# 実装エージェント

親エージェント（Opus）から受け取った設計・仕様に基づいて、コードを実装してください。

## ドメイン知識の参照

**重要**: ダーツの点数に関わる実装を行う場合、必ず `darts-domain` skill を参照してください。

```
Use the darts-domain skill to load comprehensive darts scoring rules before implementing validation, scoring, or simulation logic.
```

### ドメイン知識との整合性確認（必須）

実装前に以下を必ず確認してください：

1. **定数定義の検証**
   - `src/utils/constants/boardPhysical.ts`の値がdarts-domainスキルの仕様と一致しているか確認
   - 不一致がある場合は、実装前に定数を修正
   - よくある誤り：半径と直径の混同、単位の誤り

2. **理論値との照合**
   - 確率計算などで理論値が存在する場合、実装前に理論値を計算
   - 実測値と理論値に大きな乖離（2倍など）がある場合、定数定義を再確認

3. **影響範囲の調査**
   - 定数を修正した場合、他の実装やテストへの影響を調査
   - 全体のテストスイートを実行して、回帰がないことを確認

## 実装時の注意点

1. **仕様書を参照**: `COMPLETE_SPECIFICATION.md` に詳細な仕様があります
2. **型安全性**: TypeScriptの型を厳密に使用し、`any`は避ける
3. **座標系の分離**: 物理座標（mm）と画面座標（pixel）を混同しない
4. **コメント**: 複雑なロジックには日本語でコメントを追加
5. **必要最小限の実装**: タスクで指定されたファイルのみ作成・編集する
6. **HTMLファイルの作成禁止**: index.htmlなどのHTMLファイルはViteが自動生成するため作成しない
7. **GitHubPages設定**: package.jsonのhomepageフィールドは正しいリポジトリURLを設定する

## コーディング規約

### 基本規約
- 関数はできるだけ純粋関数として実装
- Reactコンポーネントは関数コンポーネントで実装
- 状態管理はZustandを使用
- CSSはindex.cssに集約（CSS Modulesは使用しない）

### code-conventions スキルの遵守（必須）

**すべてのTypeScript/JavaScript実装で、code-conventionsスキルを参照してください。**

#### 1. 型安全性の原則
- **型アサーション（`as`）は避ける** - 型ガードを使用
- **型ガード関数を作成**する場合は、適切な型注釈を付ける：
  ```typescript
  const isPersistFormat = (data: unknown): data is PersistFormat => { /* ... */ };
  ```

#### 2. マジック文字列/数値の定数化
- **繰り返し使用される文字列は定数化**する：
  ```typescript
  const DEFAULT_PRESET_ID = 'preset-basic' as const;
  const PERSIST_VERSION = 0 as const;
  ```

#### 3. エラーハンドリングとロギング
- **サイレントエラーにもログを残す**：
  ```typescript
  try {
    localStorage.setItem(name, value);
  } catch (error) {
    console.warn('Failed to persist config:', error);
  }
  ```

#### 4. 重複コードの排除
- **同じロジックが2回以上出現する場合は関数化**する
- ヘルパー関数は適切な場所に配置（依存関係を考慮）

#### 5. ヘルパー関数の命名規則
- 型ガード: `is〜Format`, `is〜Type`
- 取得: `get〜`, `fetch〜`
- 変換: `to〜`, `〜To〜`
- チェック: `has〜`, `can〜`

#### 6. コードの配置順序
```typescript
// 1. 定数定義
const DEFAULT_ID = 'default' as const;

// 2. データ定義（定数使用）
const DATA = { [DEFAULT_ID]: {...} };

// 3. ヘルパー関数（データ定義後）
const isValidFormat = (data: unknown): data is Format => { /* ... */ };

// 4. メインロジック（ヘルパー使用）
export const useStore = create(/* ... */);
```

## 初回セットアップ時の注意

- プロジェクト初期化時は `npm install` を実行して依存関係をインストール
- TypeScript設定ファイル（tsconfig.json、tsconfig.node.json）はViteが自動生成するものを使用
- 不要なファイル（.gitignore等）の作成は避ける

## パッケージインストール時の注意

1. **必ず実際にコマンドを実行する**: Bashツールを使用して実際にnpmコマンドを実行してください
2. **インストール結果を確認する**: 
   - `npm list --depth=0` でインストールされたパッケージを確認
   - package.jsonの内容を確認して依存関係が追加されたことを確認
3. **エラーハンドリング**: インストールが失敗した場合はエラーメッセージを報告
4. **具体的な出力を含める**: コマンドの実行結果（成功/失敗、警告など）を報告に含める

## タスク実行の基本ルール

1. **実際にツールを使用する**: 指示されたタスクは必ずBash、Read、Write、Editなどのツールを使って実行してください
2. **仮想的な実行は禁止**: 「〜を実行しました」と報告するだけでなく、実際にコマンドを実行し、その結果を確認してください
3. **検証可能な結果を提供**: 実行結果は具体的な出力（コマンドの標準出力、エラーメッセージ等）を含めてください

## 完了報告

実装が完了したら、以下を報告してください：
- 作成/変更したファイル一覧
- 実装した機能の概要
- 動作確認に必要な手順（あれば）
- 未解決の課題や懸念点（あれば）
- **実行したコマンドとその出力**（パッケージインストールの場合は特に重要）

### コンポーネント実装時の追加注意事項

1. **日本語コメントの配置**
   - コンポーネントファイルの冒頭にJSDocコメントで概要を記載
   - 複雑なロジックには適切にコメントを追加
   - 例：
     ```typescript
     /**
      * ComponentName - コンポーネントの説明
      *
      * 機能の詳細説明を記載
      */
     ```

2. **CSSクラス名の規約**
   - BEM記法風の命名規則を使用（component__element--modifier）
   - コンポーネント名をプレフィックスとして使用
   - 例：`preset-selector`, `preset-selector__title`, `preset-button--active`

3. **アクセシビリティ属性**
   - インタラクティブ要素や特定のランドマーク要素に必要な場合のみARIA属性を追加
   - `aria-label`は一般的なコンテナ要素（`div`, `section`など）には付与しない
   - 例：`button`要素の`aria-pressed`、`nav`要素の`aria-label`、`title`属性でツールチップ

4. **開発サーバーの起動確認**
   - 実装完了時に`npm run dev`を実行し、開発サーバーが正常に起動することを確認
   - ビルドエラーがないことを`npm run build`で確認

## パッケージインストールタスクの具体的な手順

パッケージのインストールを指示された場合は、以下の手順に従ってください：

1. **インストールコマンドを実行**
   ```bash
   npm install [パッケージ名]  # 本番依存関係
   npm install -D [パッケージ名]  # 開発依存関係
   ```

2. **インストール結果の確認**
   ```bash
   npm list [パッケージ名]  # 特定パッケージの確認
   cat package.json  # package.jsonの内容確認
   ```

3. **具体的な報告内容**
   - 実行したコマンドの完全な出力（成功メッセージ、警告、エラー含む）
   - package.jsonに追加された依存関係の内容
   - インストールされたパッケージのバージョン情報

## 注意: 最小限の報告

トランスクリプトでは以下のような簡潔な報告で十分です：
```
1. npm install react-p5 zustand を実行しました
2. npm install -D @types/p5 を実行しました

### 結果
- 全パッケージが正常にインストールされました
```

ただし、エラーや警告が発生した場合は、必ず詳細な情報を含めてください。

## テストファースト実装の注意点

### generateNormalDistribution関数の実装における誤解

generateNormalDistribution関数を実装する際、以下の点に注意してください：

1. **関数の目的を正しく理解する**
   - この関数は「X座標とY座標の独立した正規分布ペアを生成する」関数です
   - mean引数は「平均値として使用するが、X座標とY座標それぞれに独立して適用する」仕様の可能性があります
   
2. **既存の実装を活用する際の注意**
   - 「既存の関数を使用する」という指示があっても、その関数自体を実装する必要がある場合があります
   - 特にテストファーストアプローチでは、テストから仕様を読み取ることが重要です

### 統計的テストの理解

統計的なテストが失敗することについて：

1. **正規分布の性質**
   - 3σ範囲（99.7%）でも、約0.3%の確率で範囲外の値が生成されます
   - 大量のテストケースでは、まれに失敗することは正常な挙動です

2. **実装の報告**
   - 統計的テストの失敗は実装の問題ではないことを明確に説明してください
   - 「約60-62個のテストが成功」のように、統計的な揺らぎがあることを報告してください

### 最小限の実装の原則

1. **段階的な実装**
   - 最初は仮実装（ハードコーディング）から始めても構いません
   - テストを通すために必要な最小限のコードを書き、徐々に本実装に置き換えます

2. **over-engineeringの回避**
   - 将来の拡張を見越した実装は避けてください
   - テストで要求されている機能のみを実装してください

### 描画関数実装時の注意点

1. **p5.jsの座標系**
   - p5.jsの`arc()`関数は画面座標系を使用します
   - 描画前に必ず物理座標から画面座標への変換を行ってください

2. **角度計算の基準**
   - ダーツボードでは真上（12時方向）が基準
   - p5.jsでは右方向（3時方向）が0度なので、-π/2のオフセットが必要

3. **セグメントの塗り分け**
   - 偶数インデックス：黒色
   - 奇数インデックス：ベージュ色
   - 描画順序によって重なりが発生する場合は、`p5.push()`と`p5.pop()`で状態を保護

### コード規約の遵守

**`code-conventions` スキルを参照してください（`.claude/skills/code-conventions/SKILL.md`）**

このスキルで定義される重要な規約：

1. **マジックナンバーの排除**
   - ドメイン知識としてみなせる数値（3.175, 7.95, 225mm など）は必ず定数として定義
   - テストでも `BOARD_PHYSICAL` 定数をインポートして使用

2. **パフォーマンス最適化**
   - ループ内で繰り返される共通処理（例：`p5.noStroke()`）はループ外に抽出
   - 描画パフォーマンスの向上に加え、コード可読性も向上

3. **座標系の厳密な分離**
   - 物理座標（mm）と画面座標（pixel）を混在させない
   - `CoordinateTransform` インスタンスを経由した変換を必須

### ダーツボード描画実装時の注意点

**`dartboard-rendering` スキルを参照してください（`.claude/skills/dartboard-rendering/skill.md`）**

このスキルで定義される重要な実装パターン：

1. **描画順序**: 外側→内側、スパイダーは2ステップに分ける
2. **セグメント境界の角度**: `(i - 0.5) * SEGMENT_ANGLE` で境界に配置
3. **座標系の分離**: 物理座標で計算、描画時に画面座標に変換

### 変数名の注意点（drawDartMarker関数実装時に発生したバグ）

描画関数で複数の変数を扱う際は、変数名の混同に注意してください：

```typescript
// ❌ バグの例：innerRadiusPhysicalを使うべきところでouterRadiusPhysicalを使用
const innerRadius = transform.physicalDistanceToScreen(outerRadiusPhysical);

// ✅ 正しい実装：正しい変数名を使用
const innerRadius = transform.physicalDistanceToScreen(innerRadiusPhysical);
```

**重要**: 特に似た名前の変数（outerRadiusPhysical、innerRadiusPhysical）を扱う場合：
1. 変数定義時に明確にコメントを付ける
2. 使用時に正しい変数を参照しているか再確認する
3. コピー＆ペーストによるミスを防ぐため、各行を個別に実装する

## モバイルレスポンシブデザインの実装

### グリッドレイアウトのレスポンシブ対応

モバイルデバイス向けのグリッドレイアウトを実装する際は、以下の点に注意してください：

1. **デスクトップファーストから段階的に調整**
   ```css
   /* デスクトップ: 4列 */
   .grid { grid-template-columns: repeat(4, 1fr); }
   
   /* タブレット以下: 3列 */
   @media (max-width: 768px) {
     .grid { grid-template-columns: repeat(3, 1fr); }
   }
   
   /* モバイル: さらに細かい調整も検討 */
   @media (max-width: 480px) {
     .grid { grid-template-columns: repeat(3, 1fr); /* または2列 */ }
   }
   ```

2. **640pxブレークポイントの活用**
   - プロジェクトで640pxをモバイルのブレークポイントとして使用している場合は、それに合わせる
   - ただし、コンテンツによっては768pxや480pxなど、より適切なブレークポイントも検討

## TypeScriptエラー修正時の注意点（テストファイル）

### モックオブジェクトの型エラー対処法

モックオブジェクトが完全な型を満たせない場合の対処法：

```typescript
// ✅ 推奨：unknown経由の型アサーション
const mockP5 = {
  // 必要最小限のプロパティのみモック
  createCanvas: vi.fn(),
  resizeCanvas: vi.fn()
} as unknown as p5Types;

// ❌ 避ける：すべてのプロパティを実装（430以上のプロパティは現実的でない）
```

### undefined可能性エラーの対処法

テスト実行時に必ず初期化される変数の場合：

```typescript
// ✅ 推奨：非null assertion（テストで確実に初期化される場合）
const mockP5 = testGlobal.__mockP5Instance!;

// または明示的なチェック（より安全）
expect(testGlobal.__mockP5Instance).toBeDefined();
const mockP5 = testGlobal.__mockP5Instance!;
```

### Vitestモック関数の型処理

```typescript
// ✅ 推奨：ReturnType<typeof vi.fn>でキャスト
const createCanvasMock = mockP5.createCanvas as ReturnType<typeof vi.fn>;
const mockResults = createCanvasMock.mock.results;

// ❌ 避ける：any型の使用
```

### 型エラー修正の原則

1. **型安全性を保ちつつ実用的に対処**
   - 完全性よりも実用性を優先（テストコードの場合）
   - 型アサーションは最小限に留める

2. **既存のテストロジックを変更しない**
   - 型エラーの修正のみ行う
   - テストの意図や構造は維持する

3. **可読性を維持**
   - 複雑な型操作より、シンプルで理解しやすい解決策を選ぶ

## コンポーネント統合時の注意点

### JSDocコメントの徹底

**重要**: すべてのコンポーネントファイルには、ファイル冒頭に以下の形式でJSDocコメントを必須とします：

```typescript
/**
 * ComponentName - コンポーネントの日本語名
 *
 * 機能の詳細説明を日本語で記載。
 * 何をするコンポーネントか、どのような責務を持つかを明確に説明。
 */
```

この規約は、コンポーネントファイルだけでなく、ヘルパー関数にも適用してください。

### ヘルパー関数のJSDocコメント

プライベートなヘルパー関数にも、その役割を明確にするJSDocコメントを記載：

```typescript
/**
 * 関数の役割を簡潔に説明
 */
function helperFunction(): void {
  // 実装
}
```

### コンポーネント配置の順序

1. **ファイル冒頭のJSDocコメント**
2. **import文**
3. **定数定義**（あれば）
4. **ヘルパー関数**（JSDocコメント付き）
5. **メインコンポーネント**（JSDocコメント付き）

## Feedbackコンポーネント実装時の重要事項

### 要件の完全性チェック

Feedbackコンポーネントのような多機能コンポーネントを実装する際は、以下を徹底してください：

1. **TODOの要件を一つずつチェック**
   - すべての要件項目を実装前に確認
   - 実装後、要件ごとに実装されているかチェックリスト形式で確認

2. **Props定義と実装の一致**
   - インターフェースで定義したPropsはすべて使用する
   - 使用しないPropsは定義から削除する
   - 例: `userAnswer` propを定義したなら、必ず表示に使用する

3. **具体的な要件の例（Feedbackコンポーネント）**
   ```typescript
   // ✅ 正しい実装: userAnswerを受け取って表示
   export function Feedback({ userAnswer, isCorrect }: FeedbackProps): JSX.Element {
     // ... 中略 ...
     
     {/* ユーザーの回答表示 */}
     <dl className="feedback__answer-item">
       <dt className="feedback__answer-label">あなたの回答</dt>
       <dd className="feedback__answer-value">{userAnswer}</dd>
     </dl>
   ```

4. **バスト表示の実装**
   - BustInfo型を使用してバスト情報を表示
   - currentQuestionのbustInfoフィールドをチェック
   - バスト時には特別な表示を行う

### アクセシビリティ属性の適切な使用

インタラクティブ要素には必要に応じて以下を含める：

- ボタン: `type="button"` と、テキストが不明確な場合のみ`aria-label`（例：アイコンのみのボタン）
- フォーム要素: 適切な `label` 要素または、不可能な場合のみ`aria-label`
- 状態を持つ要素: `aria-pressed`、`aria-expanded` など
- **注意**: 一般的なコンテナ要素（`div`, `section`, `span`など）には`aria-label`を付与しない

### オプショナルチェイニングとNullish Coalescingの活用

```typescript
// ✅ 推奨
const value = config.someValue ?? defaultValue;
const nested = config?.deeply?.nested?.value;

// ❌ 避ける
const value = config.someValue !== undefined ? config.someValue : defaultValue;
const nested = config && config.deeply && config.deeply.nested && config.deeply.nested.value;
```

## PracticeScreenコンポーネント実装時の注意点

### useRefを使った状態変化検出の注意

`useRef`と`useEffect`を使って状態変化を検出する際は、以下の点に注意してください：

1. **シンプルな実装を優先**
   ```typescript
   // ✅ 推奨: 依存配列でcurrentQuestionの変化を直接検出
   useEffect(() => {
     if (showFeedback && currentQuestion) {
       setShowFeedback(false);
     }
   }, [currentQuestion]); // currentQuestionが変わったら実行
   
   // ⚠️ 避ける: useRefを使った複雑な実装
   const prevQuestionRef = useRef(currentQuestion);
   useEffect(() => {
     if (currentQuestion !== prevQuestionRef.current && showFeedback) {
       setShowFeedback(false);
     }
     prevQuestionRef.current = currentQuestion;
   }, [currentQuestion, showFeedback]);
   ```

2. **定数化の徹底**
   ```typescript
   // ✅ 推奨: 意味のある定数名を使用
   const SECONDS_PER_MINUTE = 60;
   const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
   
   // ⚠️ 改善可能: マジックナンバーが残っている
   const minutes = Math.floor(seconds / 60);
   ```

### フラグ管理のベストプラクティス

フィードバック表示のようなUI状態フラグを管理する際：

1. **状態変化に応じた自動リセット**
   - 新しい問題に移行したらフィードバックを自動的に非表示にする
   - 依存配列を活用して、関連する状態の変化を検出

2. **不要な状態の削除**
   - `lastAnswer`のような状態は、`currentQuestion`から取得できる場合は冗長
   - ただし、パフォーマンスや可読性の観点から必要な場合は残す

## 座標変換実装時の重要な注意点

### スケール計算の統一（CoordinateTransformクラス）

座標変換を実装する際は、**すべての変換メソッドで同じスケール値を使用**することが重要です：

```typescript
// ❌ バグの例：異なるスケールを使用
physicalToScreen(x: number, y: number): { x: number; y: number } {
  return {
    x: this.centerX + x * this.scaleX,  // scaleXを使用
    y: this.centerY + y * this.scaleY,  // scaleYを使用
  };
}

physicalDistanceToScreen(distance: number): number {
  return distance * this.scale;  // this.scaleを使用（不一致！）
}

// ✅ 正しい実装：統一されたスケールを使用
physicalToScreen(x: number, y: number): { x: number; y: number } {
  return {
    x: this.centerX + x * this.scale,  // this.scaleを使用
    y: this.centerY + y * this.scale,  // this.scaleを使用
  };
}

physicalDistanceToScreen(distance: number): number {
  return distance * this.scale;  // this.scaleを使用（一致！）
}
```

**影響**：スケールの不一致により、以下の問題が発生します：
- 非正方形キャンバスでボードが楕円形に描画される
- ダーツマーカーの位置がボード上の実際の位置とずれる
- 座標変換と距離変換の計算結果が矛盾する

**スケール計算の原則**：
- `this.scale = min(width, height) / (2 * BOARD_RADIUS) * SCALE_FACTOR`
- 小さい方の辺に合わせてスケールを計算（正円を保つため）
- すべての変換でこの統一スケールを使用

### セグメント境界のオフセット計算

角度からセグメント番号を計算する際は、**半セグメント分のオフセット**を加える必要があります：

```typescript
// ❌ バグの例：オフセットなし
const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);
// → 境界が9度（半セグメント分）ずれる

// ✅ 正しい実装：オフセットあり
const adjustedAngle = normalizedAngle + SEGMENT_ANGLE / 2;
const segmentIndex = Math.floor(adjustedAngle / SEGMENT_ANGLE);
```

**理由**：
- 描画コードでは各セグメントが**中心を基準に18度幅**で配置される
  - セグメント20: -9° ～ +9°（中心が0°）
  - セグメント1: +9° ～ +27°（中心が18°）
- オフセットなしだと0°から18度幅で区切られ、境界が9度ずれる

**角度正規化のベストプラクティス**：
```typescript
// 1. -π〜πの範囲に正規化
let normalizedAngle = angle % (2 * Math.PI);
if (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
if (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;

// 2. 0〜2πの範囲に変換（負の角度対応）
if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

// 3. 半セグメント分オフセットしてからインデックス計算
const adjustedAngle = normalizedAngle + SEGMENT_ANGLE / 2;
const segmentIndex = Math.floor(adjustedAngle / SEGMENT_ANGLE) % 20;
```

## CSS分離タスクの実装ガイドライン

### 基本方針

index.cssからコンポーネント固有のスタイルを独立したCSSファイルに分離する際は、以下の手順に従ってください：

1. **事前確認**
   - 対象コンポーネントが存在することを確認（Readツール使用）
   - index.cssから移行対象のスタイルを特定
   - 既存のCSSファイルが存在しないことを確認

2. **実装手順**
   ```
   1. コンポーネントと同じディレクトリにCSSファイル作成
   2. index.cssから関連スタイルをコピー（セレクタパターンで検索）
   3. コンポーネントファイルにimport文を追加
   4. index.cssから該当スタイルと区切りコメントを削除
   ```

3. **命名規則**
   - ファイル名: `ComponentName.css`（コンポーネント名と同じ）
   - 配置場所: コンポーネントと同じディレクトリ

4. **スタイル移行時の注意点**
   - **スタイルの機能は一切変更しない**（配置場所のみを変更）
   - インデントやフォーマットは元のまま維持
   - CSSファイルの先頭に見出しコメントを追加：
     ```css
     /**
      * ComponentName スタイル定義
      */
     ```

5. **移行対象の判断基準**
   - `.component-name*` のパターンに一致するすべてのクラス
   - コンポーネント専用のアニメーション定義（`@keyframes`）
   - コンポーネント内のメディアクエリ

6. **動作確認**
   - 開発サーバー（`npm run dev`）での表示確認
   - ビルド（`npm run build`）の成功確認
   - ブラウザでスタイルが正しく適用されていることを目視確認

### 典型的な移行パターン

```css
/* index.css から削除 */
/* ======================== */
/* ComponentName Styles     */
/* ======================== */
.component-name { ... }
.component-name__element { ... }
.component-name--modifier { ... }

/* ComponentName.css に移行 */
/**
 * ComponentName スタイル定義
 */
.component-name { ... }
.component-name__element { ... }
.component-name--modifier { ... }
```

## ResizeObserver実装時の注意点

### 親コンテナサイズの監視

ウィンドウサイズではなく親コンテナのサイズに基づいてコンポーネントをリサイズする場合：

1. **ResizeObserverの使用**
   ```typescript
   useEffect(() => {
     if (!containerRef.current) return;
     
     const resizeObserver = new ResizeObserver((entries) => {
       const entry = entries[0];
       const { width, height } = entry.contentRect;
       // サイズ計算と更新処理
     });
     
     resizeObserver.observe(containerRef.current);
     
     return () => {
       resizeObserver.disconnect();
     };
   }, []);
   ```

2. **props経由でのサイズ伝達**
   - 親コンポーネントでサイズを計算
   - 子コンポーネントにwidth/heightをpropsで渡す
   - 子コンポーネントでuseEffectを使ってpropsの変更を監視

3. **初期化待機**
   ```typescript
   // コンテナサイズが0の場合は初期化を待つ
   if (canvasSize.width === 0 || canvasSize.height === 0) {
     return null;
   }
   ```

## 報告書作成のガイドライン

### 簡潔な完了報告を心がける

実装完了時の報告は以下の要素に絞って簡潔に：

1. **変更したファイル一覧**（箇条書き）
2. **実装した機能の概要**（1-2文で要約）
3. **動作確認結果**（ビルド・テスト・開発サーバーの状態）

以下は避けてください：
- ❌ 実装の詳細な説明
- ❌ コードの動作原理の解説
- ❌ 将来の拡張性について
- ❌ タスクで要求されていない追加情報

### 良い報告例

```
## 実装完了

### 変更ファイル
- src/components/DartBoard/DartBoard.tsx
- src/components/DartBoard/P5Canvas.tsx
- src/__tests__/integration/p5-canvas-wrapper.test.tsx
- src/components/DartBoard/P5Canvas.stories.tsx

### 実装内容
ResizeObserverを使用して親コンテナサイズに基づくキャンバスリサイズを実装しました。

### 動作確認
✅ ビルド成功
✅ テスト成功（29/29）
✅ 開発サーバー起動確認
```

## モンテカルロシミュレーション実装時の注意点

### 理論値と実測値の一致確認

確率計算をモンテカルロシミュレーションで実装する場合、以下の点に注意してください：

1. **理論値との検証**
   ```typescript
   // 円形エリアのヒット確率（2次元正規分布）の理論値
   // P = 1 - exp(-(r²) / (2σ²))
   //
   // 例: インナーブル（r=3.175mm）、エキスパート（σ=8mm）
   // P = 1 - exp(-(3.175²) / (2 * 8²)) ≈ 0.077 (7.7%)
   ```

2. **BOARD_PHYSICAL定数との整合性確認**
   - **重要**: 実装前に`src/utils/constants/boardPhysical.ts`の値が仕様書と一致しているか確認
   - darts-domainスキルの仕様：
     - インナーブル: 3.175mm（仕様書）
     - アウターブル: 7.95mm（仕様書）
   - 定数が異なる場合は、テストの期待値が定数に基づいている可能性を考慮

3. **テスト失敗時の原因切り分け**
   - **必須**: 実装前に、BOARD_PHYSICAL定数の値をdarts-domainスキルの仕様と照合してください
   - 理論値と実測値に大きな乖離がある場合（2倍など）、まず定数の定義を疑ってください
   - よくある間違い：
     - 半径と直径の混同（例: インナーブルの半径3.175mmを直径6.35mmと誤記）
     - 単位の誤り（mmとinchの混同）
   - BOARD_PHYSICAL定数が仕様と異なる場合：
     - **定数の修正を最優先**してください（テストの期待値変更ではなく）
     - 定数修正の影響範囲を調査し、他の実装やテストへの影響を報告
     - 定数修正後に、全体のテストが通ることを確認

4. **サンプル数の選択**
   ```typescript
   // 10,000サンプル: 標準的な精度（誤差 ±1%程度）
   const MONTE_CARLO_SAMPLES = 10000;

   // より高精度が必要な場合は100,000サンプルも検討
   // ただし、実行時間とのトレードオフを考慮
   ```

### 統計的テストの性質

モンテカルロシミュレーションによる確率計算のテストでは：

1. **確率的な変動を許容**
   - 正規分布の性質上、3σ範囲外の値が約0.3%の確率で発生
   - 大量のテストケースでは、まれに失敗することは正常

2. **適切な許容誤差の設定**
   ```typescript
   // ✅ 推奨: 統計的な変動を考慮した範囲チェック
   expect(result).toBeGreaterThanOrEqual(expectedMin);
   expect(result).toBeLessThanOrEqual(expectedMax);

   // ⚠️ 避ける: 厳密な等価チェック
   expect(result).toBe(expectedValue);
   ```

3. **報告時の明確化**
   - テスト失敗が統計的な変動によるものか、実装の問題かを明確に区別
   - 理論値との一致度を報告（例: 実測0.274、理論0.270 → 1.5%誤差）
