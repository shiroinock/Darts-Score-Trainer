# Darts Score Trainer - 実装TODO

COMPLETE_SPECIFICATION.md に基づく実装計画です。

---

## Phase 9: バグフィックス・テスト・調整

### 9.2 UI/UX改善（着手すべき項目）

#### 9.2.9 総合練習の2つの入力欄実装
- [ ] 新規コンポーネント `src/components/Practice/DualNumPad.tsx` を作成
  - 得点用と残り点数用の2つの入力表示エリア
  - アクティブフィールドの切り替え機能
  - 数字ボタングリッド（NumPadと同様）
  - 確定ボタン（両方入力時のみ有効）
- [ ] 新規CSS `src/components/Practice/DualNumPad.css` を作成
- [ ] `src/hooks/useFeedback.ts` を修正
  - `handleDualConfirm(scoreValue, remainingValue)` を追加
  - `dualAnswer` state を追加（2つの回答情報を保持）
  - 両方正解の場合のみ正解扱い
- [ ] `src/stores/gameStore.ts` の `determineQuestionMode` を修正
  - 'both' モードでランダム選択を廃止
  - 固定で 'both' を返す（判定はDualNumPad側で実施）
- [ ] `src/components/Practice/PracticeScreen.tsx` を修正
  - `questionType === 'both'` の場合、`DualNumPad` を表示
- [ ] 総合練習で2つの入力欄が表示され、両方正解で正解判定されることを確認

**リスク:** 高（フィードバックロジックとの統合が複雑）


#### 9.2.10 テスト戦略

**単体テスト更新:**
- [ ] `SettingsPanel.test.tsx` - ステップスキップロジック、環境変数制御
- [ ] `DetailedSettings.test.tsx` - 表示/非表示条件
- [ ] `getAllTargetsExpanded.test.ts` - 62ターゲット検証
- [ ] `gameStore.test.ts` - 問題数制限、残り点数管理、determineQuestionMode
- [ ] `presets.test.ts` - コーラー基礎の投擲単位

**統合テスト:**
- [ ] 基礎練習フロー全体
  - 難易度選択スキップ
  - 62問題のランダム出題
  - 問題数制限（10/20/50/100問）
  - 残り点数管理の無効化
- [ ] 3投累積ズームビュー
  - 3つのズームビューの表示
  - レスポンシブレイアウト
  - 個別ダーツへのフォーカス
- [ ] 総合練習の2入力欄
  - 2つの値の同時判定
  - フィードバック表示
  - キーボード操作

**Storybook更新:**
- [ ] `ZoomViewMultiple.stories.tsx`（新規作成）
- [ ] `DualNumPad.stories.tsx`（新規作成）
- [ ] 既存ストーリーの更新（SettingsPanel、DetailedSettings）

### 9.3 動作確認（バグフィックス後に実施）
- [ ] 手動テストチェックリストに従って全項目を確認
  - 詳細: [docs/MANUAL_TEST_CHECKLIST.md](docs/MANUAL_TEST_CHECKLIST.md)
  - 16セクション、約100項目の確認観点
  - ブラウザ互換性（Chrome, Safari, Firefox, モバイル）も含む


## Phase 10: デプロイ

### 10.1 ビルド確認
- [ ] `npm run build` でエラーなくビルド
- [ ] `npm run preview` でローカル確認
- [ ] TypeScriptエラーがないこと確認

### 10.2 GitHub Pages設定
- [ ] リポジトリ Settings → Pages で gh-pages ブランチを設定
- [ ] `npm run deploy` で初回デプロイ
- [ ] デプロイされたURLで動作確認

### 10.3 最終確認
- [ ] 本番環境での全機能動作確認
- [ ] README.md の更新（使い方、デプロイURL記載）

---

## 将来のTODO（MVP後）

### 機能追加（優先度：高）

#### セッション終了理由の記録機能
- [ ] ResultsScreenで実際の終了理由を記録する機能を実装
  - [ ] 'completed': 問題数達成による終了
  - [ ] 'timeout': 時間切れによる終了
  - [ ] 'manual': ユーザーによる手動終了
  - [ ] 'cleared': ゲームクリア（01ゲームで0点到達）
- [ ] gameStoreにfinishReasonフィールドを追加
- [ ] 各終了条件でfinishReasonを設定するロジックを実装
- [ ] SessionSummaryで終了理由を表示

#### バスト表示機能の完全実装（PR #68で実装完了 - 2025-12-29）
Phase 6.4のフィードバックコンポーネントに、バスト表示機能を追加しました。

**実装内容**:

1. **Question型の拡張** (`src/types/Question.ts`)
   - [x] `bustInfo?: BustInfo` フィールドを追加
   - [x] 型テストの作成（15テスト、型の整合性確認）

2. **gameStoreの修正** (`src/stores/gameStore.ts`)
   - [x] `generateQuestion()`でバスト判定を実施（1本ずつ判定）
   - [x] `calculateBustInfo()`でsubscribe経由の自動判定を実施
   - [x] バスト発生時に`bustInfo`を問題に含める
   - [x] バストの理由（over, finish_impossible, double_out_required）を設定
   - [x] テスト作成: バスト発生時にbustInfoが設定されることを検証（19テスト追加）
   - [x] テスト作成: バストの理由が正しく判定されることを検証

3. **Feedbackコンポーネントの拡張** (`src/components/Practice/Feedback.tsx`)
   - [x] `currentQuestion.bustInfo`を確認
   - [x] バスト時の表示を追加（警告アイコン⚠️、理由の説明）
   - [x] CSSスタイル追加（`.feedback__bust`、モバイル対応含む）
   - [x] テスト作成: バスト表示のセマンティックテスト（6テスト）
   - [x] テスト作成: スナップショットテスト（3テスト）

**実装したUI**:
```
⚠️ バスト！
[理由に応じたメッセージ]
- over: 残り点数を超えています
- finish_impossible: 残り1点では上がれません
- double_out_required: ダブルで上がる必要があります
```

**TDDアプローチ（実施済み）**:
- Phase 1 (Question型): test-first, unit（15テスト）
- Phase 2 (gameStore): test-first, store（19テスト追加、計136テスト）
- Phase 3 (Feedback UI): test-later, component（9テスト追加、計38テスト）

**技術的な実装詳細**:
- **バスト判定ロジック**: ダーツのルールに従い、1本投げるごとにバスト判定を実施
- **3投モード**: 各投擲後に累積でバスト判定（合計判定ではない）
- **checkBust()関数**: 入力値バリデーション（0-60点）を厳密に適用
- **自動バスト判定**: Zustandのsubscribeで状態変更時に自動的にbustInfoを計算・設定

### 機能追加（優先度：中）
- [ ] ストレートアウト（シングルアウト）オプション
- [ ] インナーシングル狙い位置オプション
- [ ] 統計履歴の長期保存
- [ ] ランキング機能
- [ ] **ウィザード中断時の状態保持を検証する**
  - 懸念: SettingsPanelがアンマウント→マウント時に`currentStep`がリセットされる可能性
  - 検証内容:
    - ステップ2で難易度変更 → ステップ1に戻る → ステップ2に進む、で設定が保持されるか
    - SettingsPanelのアンマウント→マウント時の動作確認
  - 対策案（必要な場合）: `currentStep`をZustand storeまたはlocalStorageで管理
- [ ] **戦略サジェスト機能（AI最適ターゲット決定）**
  - Phase 4.3の固定対応表方式からの発展版
  - 入力パラメータ：
    - 残り点数
    - 残り本数（3本、2本、1本）
    - プレイヤーの実力（stdDevMM）
  - 処理内容：
    - モンテカルロシミュレーションで各ターゲット候補の成功確率を計算
    - 上がり目（フィニッシュ可能な状態）への到達確率を評価
    - バスト確率の計算とリスク評価
    - 期待値最大化アルゴリズムで最適ターゲットを決定
  - UI表示：
    - 推奨ターゲット（第1候補、第2候補、第3候補）
    - 各候補の成功確率とリスク評価
    - 「安全策」「攻撃的」などの戦略タイプ選択
  - 実装ファイル：
    - `src/utils/dartStrategy/aiTargetSelector.ts`
    - `src/utils/dartStrategy/monteCarloSimulator.ts`
    - `src/utils/dartStrategy/finishProbabilityCalculator.ts`
- [ ] 弱点エリア分析
- [ ] グラフ・チャート可視化
- [ ] 投擲アニメーション
- [ ] 英語対応（i18n）
- [ ] **手動テスト記録の自動化**
  - 目的: `docs/MANUAL_TEST_CHECKLIST.md` のテスト実施記録を自動的に管理
  - 実装案:
    - GitHub Issues/PRと連携してテスト実施状況を記録
    - テスト結果をJSONファイルに出力し、履歴を追跡
    - チェックリストのマークダウンを自動更新するスクリプト
  - 評価基準: テスト実施時間の50%削減、記録漏れの防止

### 技術的改善（その他）
- [ ] ユニットテスト追加
- [ ] E2Eテスト追加
- [ ] ESLint + Prettier 設定
- [ ] CI/CD パイプライン構築

### 技術的改善（型安全性強化 - Branded Type導入）
**背景**: `checkBust`関数の第2引数は`number`型だが、実際には0-60の範囲を期待している。累積スコア（最大180）を渡すと実行時エラーが発生する問題が発生（2025-12-31）。型レベルで制約を表現することで、コンパイル時にエラーを検出できるようにする。

**目的**: ドメイン固有の数値制約をBranded Typeで表現し、仕組みで不正な値の使用を防ぐ

#### Phase 1: Branded Type型定義の作成
- [ ] `src/types/branded/` ディレクトリを作成
- [ ] `SingleThrowScore` 型を定義（0-60の整数）
  ```typescript
  type SingleThrowScore = number & { readonly __brand: 'SingleThrowScore' };
  ```
- [ ] `RoundScore` 型を定義（0-180の整数）
- [ ] `PositiveInteger` 型を定義（1以上の整数、残り点数用）
- [ ] `PhysicalDistance` 型を定義（mm単位の距離、座標変換用）
- [ ] `ScreenDistance` 型を定義（pixel単位の距離、描画用）

#### Phase 2: 型ガード/コンストラクタ関数の作成
- [ ] `asSingleThrowScore(value: number): SingleThrowScore` - バリデーション付きコンストラクタ
- [ ] `asRoundScore(value: number): RoundScore` - バリデーション付きコンストラクタ
- [ ] `asPositiveInteger(value: number): PositiveInteger` - バリデーション付きコンストラクタ
- [ ] `isSingleThrowScore(value: number): value is SingleThrowScore` - 型ガード

#### Phase 3: 既存関数シグネチャの変更
- [ ] `checkBust(remainingScore: PositiveInteger, throwScore: SingleThrowScore, ...)` に変更
- [ ] `calculateScore(ring, segmentNumber): SingleThrowScore` に変更
- [ ] `coordinateToScore(x, y): SingleThrowScore` に変更
- [ ] 座標変換関数でPhysicalDistance/ScreenDistanceを使用

#### Phase 4: 呼び出し箇所の修正
- [ ] `gameStore.ts`の投擲シミュレーション結果をBranded Typeでラップ
- [ ] `PracticeScreen.tsx`のbust判定計算をBranded Typeでラップ
- [ ] テストファイルでのモック値をBranded Typeでラップ

**要修正箇所の特定観点**:
1. **`number`型の引数/戻り値を持つ関数を検索**:
   - `grep -r "throwScore: number" src/`
   - `grep -r "remainingScore: number" src/`
   - `grep -r "): number" src/utils/scoreCalculator/`
2. **ドメイン固有の制約がある箇所**:
   - 1投スコア: 0-60の特定値のみ（`getValidSingleScores()`参照）
   - ラウンドスコア: 0-180
   - 残り点数: 1以上（0はゲーム終了）
   - 物理距離: mm単位（ボード寸法）
   - 画面距離: pixel単位（描画）
3. **型アサーション（`as`）を使っている箇所**:
   - `grep -r " as number" src/`
   - これらはBranded Type導入で解消できる可能性あり
4. **実行時バリデーションがある箇所**:
   - `if (throwScore < 0 || throwScore > 60)` のようなチェック
   - Branded Type導入後は型レベルで保証されるため、内部関数では不要になる可能性

**参考資料**:
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
- Branded Types pattern: https://egghead.io/blog/using-branded-types-in-typescript

### 技術的改善（プリセット構造のリファクタリング）

**背景**: 現在、基礎練習モード判定に `config.configId === DEFAULT_PRESET_ID` という文字列比較を使用している。この方式は動作するが、マジックストリング依存により保守性が低下する可能性がある。

**目的**: プリセット定義側にフラグを追加し、文字列比較を排除して型安全性と保守性を向上させる。

#### Phase 1: PresetConfig型の拡張
- [ ] `src/types/PracticeConfig.ts` に `isBasicMode?: boolean` フラグを追加
- [ ] 既存のPresetConfig型定義を更新
- [ ] 型定義のテストを追加

#### Phase 2: プリセット定義の更新
- [ ] `src/stores/config/presets.ts` の各プリセットに `isBasicMode` フラグを設定
  - `preset-basic`: `isBasicMode: true`
  - その他のプリセット: `isBasicMode: false` (または省略)
- [ ] プリセット定義のテストを更新

#### Phase 3: 判定ロジックの置き換え
- [ ] `src/components/Settings/DetailedSettings.tsx` の判定を変更
  - 現状: `const isBasicMode = config.configId === DEFAULT_PRESET_ID;`
  - 変更後: `const isBasicMode = config.isBasicMode ?? false;`
- [ ] `src/components/Settings/SettingsPanel.tsx` の判定も同様に変更（9.2.7タスク実装時）
- [ ] コンポーネントテストを更新

#### Phase 4: 検証
- [ ] 全テストが通ることを確認
- [ ] 基礎練習モードの動作確認
- [ ] 他のプリセットの動作確認
- [ ] 型チェックの確認（TypeScriptコンパイル）

**利点**:
- 文字列比較の排除により、タイポによるバグを防止
- プリセットの意図が型定義から明確になる
- 将来的に他のフラグ（`isCallerMode`, `isCumulativeMode` など）を追加しやすくなる

**リスク**: 低（既存の機能には影響なし、型定義の拡張のみ）

**関連タスク**: 9.2.6（完了）、9.2.7（未実装）

---

## 進捗管理

| Phase | 項目数 | 完了数 | 進捗 |
|-------|--------|--------|------|
| 0 | 11 | 11 | 100% |
| 1 | 39 | 39 | 100% |
| 2 | 12 | 12 | 100% |
| 3 | 28 | 31 | 111% |
| 4 | 13 | 13 | 100% |
| 5 | 23 | 23 | 100% |
| 6 | 22 | 12 | 55% |
| 7 | 9 | 7 | 78% |
| 8 | 10 | 0 | 0% |
| 9 | 15 | 0 | 0% |
| 10 | 6 | 0 | 0% |
| **合計** | **188** | **148** | **79%** |


