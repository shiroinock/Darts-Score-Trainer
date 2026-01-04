
### 9.2 UI/UX改善（着手すべき項目）

#### 9.2.1 基礎練習の出題削減（82→62種類）✅
  - 基礎練習の出題対象からINNER_SINGLEを除外（OUTER_SINGLEのみ使用）
  - ゲーム全体ではINNER_SINGLEとOUTER_SINGLEの区別を維持
  - 実装ファイル: src/utils/targetCoordinates/getAllTargetsExpanded.ts
  - テストファイル: src/utils/targetCoordinates/getAllTargetsExpanded.test.ts
  - 「82ターゲット」→「62ターゲット」
  - src/stores/gameStore.test.ts: 82→62の期待値更新
  - src/types/PracticeConfig.ts: コメント更新
  - 期待される配列長を82→62に変更
  - INNER_SINGLEが含まれないことを確認

**リスク:** 低

#### 9.2.2 デバッグボタンの環境変数制御
  - `const ENABLE_DEBUG_MODE = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';`
  - テストで環境変数による制御を検証済み（src/components/Settings/SettingsPanel.test.tsx）

**リスク:** 低

#### 9.2.3 コーラー基礎の投擲単位変更（3投→1投）
  - `throwUnit: 3` → `throwUnit: 1`
  - `description` を更新：「1投ごとに残り点数を問う基礎練習」

**リスク:** 低

#### 9.2.4 基礎練習の問題数制限修正
  - `submitAnswer` 内の条件から `randomizeTarget !== true` を削除
  - 基礎練習でも設定した問題数（10/20/50/100）でセッション終了するように修正
  ```typescript
  if (
    state.sessionConfig.mode === 'questions' &&
    state.stats.total >= (state.sessionConfig.questionCount || 0)
  ) {
    state.gameState = 'results';
    state.isTimerRunning = false;
  }
  ```
  - テストファイル: `src/stores/gameStore.randomizeTarget.test.ts` (12テスト全て成功)

**リスク:** 低

#### 9.2.5 基礎練習の残り点数管理無効化
  - `randomizeTarget === true` の場合、`checkAndUpdateBust` をスキップ
  - バスト判定を完全に無効化
  ```typescript
  let isBust = false;
  let newRemainingScore = state.remainingScore;

  if (state.config.randomizeTarget !== true) {
    const bustResult = checkAndUpdateBust(
      state.currentQuestion,
      state.remainingScore,
      state.roundStartScore
    );
    isBust = bustResult.isBust;
    newRemainingScore = bustResult.newRemainingScore;
  }

  state.remainingScore = newRemainingScore;
  ```
  - 実装ファイル: `src/stores/gameStore.ts`
  - テストファイル: `src/stores/gameStore.bustSkip.test.ts` (17テスト全て成功)

**リスク:** 中（バスト判定ロジックとの依存関係）


---


## Phase 0: プロジェクトセットアップ

### 0.1 Vite + React + TypeScript 初期化
- [x] `npm create vite@latest . -- --template react-ts` でプロジェクト作成
- [x] 不要なボイラープレートファイルを削除（App.css, assets/など）
### 0.2 依存パッケージのインストール
- [x] `npm install react-p5 zustand`
- [x] `npm install -D @types/p5 gh-pages` (gh-pagesは0.1で完了)
### 0.3 設定ファイルの調整
- [x] `vite.config.ts` に `base: '/Darts-Score-Trainer/'` を追加
- [x] `package.json` に deploy スクリプトを追加
- [x] `tsconfig.json` の strict モードを確認
### 0.4 フォルダ構成の作成
- [x] `src/types/` ディレクトリ作成
- [x] `src/components/DartBoard/` ディレクトリ作成
- [x] `src/components/Settings/` ディレクトリ作成
- [x] `src/components/Practice/` ディレクトリ作成
- [x] `src/components/Results/` ディレクトリ作成
- [x] `src/hooks/` ディレクトリ作成
- [x] `src/stores/` ディレクトリ作成
- [x] `src/utils/` ディレクトリ作成
- [x] `src/styles/` ディレクトリ作成

## Phase 1: 基盤実装

### 1.1 型定義 (`src/types/`)
- [x] `Coordinates` インターフェース（x, y） → `src/types/Coordinates.ts`
- [x] `RingType` 型（'INNER_BULL' | 'OUTER_BULL' | 'TRIPLE' | 'DOUBLE' | 'INNER_SINGLE' | 'OUTER_SINGLE' | 'OUT'） → `src/types/RingType.ts`
- [x] `TargetType` 型（'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'BULL'） → `src/types/TargetType.ts`
- [x] `Target` インターフェース（type, number, label） → `src/types/Target.ts`
- [x] `ThrowResult` インターフェース（target, landingPoint, score, ring, segmentNumber） → `src/types/ThrowResult.ts`
- [x] `PracticeConfig` インターフェース（全練習設定） → `src/types/PracticeConfig.ts`
- [x] `SessionConfig` インターフェース（mode, questionCount, timeLimit） → `src/types/SessionConfig.ts`
- [x] `Question` インターフェース（mode, throws, correctAnswer, questionText, startingScore） → `src/types/Question.ts`
- [x] `GameState` 型（'setup' | 'practicing' | 'results'） → `src/types/GameState.ts`
- [x] `Stats` インターフェース（correct, total, currentStreak, bestStreak） → `src/types/Stats.ts`
- [x] `SessionResult` インターフェース（config, sessionConfig, stats, elapsedTime, completedAt, finishReason） → `src/types/SessionResult.ts`
- [x] `BustInfo` インターフェース（isBust, reason） → `src/types/BustInfo.ts`
- [x] `QuestionType` 型（'score' | 'remaining' | 'both'） → `src/types/QuestionType.ts`
- [x] `JudgmentTiming` 型（'independent' | 'cumulative'） → `src/types/JudgmentTiming.ts`
- [x] `src/types/index.ts` で再エクスポート設定
### 1.2 定数定義 (`src/utils/constants/`)
- [x] `BOARD_PHYSICAL` オブジェクト（リング半径、スパイダー幅、セグメント配列） → `src/utils/constants/boardPhysical.ts`
- [x] `TARGET_RADII` オブジェクト（TRIPLE, DOUBLE, SINGLE_OUTER, BULL） → `src/utils/constants/targetRadii.ts`
- [x] `DIFFICULTY_PRESETS` オブジェクト（beginner, intermediate, advanced, expert） → `src/utils/constants/difficultyPresets.ts`
- [x] `SESSION_QUESTION_COUNTS` 配列（[10, 20, 50, 100]） → `src/utils/constants/sessionQuestionCounts.ts`
- [x] `SESSION_TIME_LIMITS` 配列（[3, 5, 10]） → `src/utils/constants/sessionTimeLimits.ts`
- [x] `DART_COLORS` オブジェクト（first, second, third） → `src/utils/constants/dartColors.ts`
- [x] `FEEDBACK_ICONS` オブジェクト（correct, incorrect） → `src/utils/constants/feedbackIcons.ts`
- [x] `STORAGE_KEY` 定数 → `src/utils/constants/storageKey.ts`
- [x] `SEGMENT_ANGLE` 定数（Math.PI / 10） → `src/utils/constants/segmentAngle.ts`
- [x] `SEGMENTS` 配列（[20, 1, 18, 4, 13, ...]） → `src/utils/constants/segments.ts`
- [x] `DART_MARKER_RADII` オブジェクト → `src/utils/constants/dartMarkerRadii.ts`
- [x] `DART_MARKER_TEXT_SIZE` 定数 → `src/utils/constants/dartMarkerTextSize.ts`
- [x] `SEGMENT_NUMBER_TEXT_SIZE` 定数 → `src/utils/constants/segmentNumberTextSize.ts`
- [x] `LEGEND_LAYOUT` & `LEGEND_TEXT_SIZE` → `src/utils/constants/legendLayout.ts`
- [x] `src/utils/constants/index.ts` で再エクスポート設定
- [x] `src/utils/constants.ts` を互換性レイヤーに変更
### 1.3 座標変換 (`src/utils/coordinateTransform.ts`)
- [x] `CoordinateTransform` クラス作成
- [x] コンストラクタ（canvasWidth, canvasHeight, boardPhysicalRadius）
- [x] `physicalToScreen(x, y)` メソッド
- [x] `screenToPhysical(x, y)` メソッド
- [x] `physicalDistanceToScreen(distance)` メソッド
- [x] `screenDistanceToPhysical(distance)` メソッド
- [x] `updateCanvasSize(width, height)` メソッド
- [x] `getScale()` ゲッター
- [x] `getCenter()` ゲッター
### 1.4 点数計算 (`src/utils/scoreCalculator.ts`)
- [x] `getRing(distance)` 関数 - 距離からリング種類を判定
- [x] `getSegmentNumber(angle)` 関数 - 角度からセグメント番号を取得
- [x] `calculateScore(ring, segmentNumber)` 関数 - リングとセグメントから点数計算
- [x] `coordinateToScore(x, y)` 関数 - 座標から点数を一括計算
- [x] `coordinateToScoreDetail(x, y)` 関数 - 点数に加えてリング・セグメント情報も返す
- [x] `adjustForSpider(distance, angle)` 関数 - スパイダー境界の調整処理
- [x] `getScoreLabel(ring, segmentNumber)` 関数 - "T20", "D16", "BULL" などのラベル生成
### 1.5 入力バリデーション (`src/utils/validation.ts`)
- [x] `isValidSingleThrowScore(score)` 関数 - 1投の得点として有効か（0-60, 特定値のみ）
- [x] `isValidRoundScore(score)` 関数 - 1ラウンド(3投)の得点として有効か（0-180）
- [x] `getValidSingleScores()` 関数 - 1投で取りうる全得点のセットを返す (src/utils/validation.ts:88-94)
- [x] `isValidRemainingScore(remaining, current)` 関数 - 残り点数として有効か (src/utils/validation.ts:158-218)
### 1.6 投擲シミュレーション (`src/utils/throwSimulator.ts`)
- [x] `generateNormalDistribution(mean, stdDev)` 関数 - Box-Muller法 (src/utils/throwSimulator.ts)
- [x] `simulateThrow(targetX, targetY, stdDevMM)` 関数 - 着弾点生成 (src/utils/throwSimulator.ts)
- [x] `executeThrow(target, stdDevMM)` 関数 - ターゲットから投擲実行 (src/utils/throwSimulator.ts)
### 1.7 ターゲット座標 (`src/utils/targetCoordinates.ts`)
- [x] `getSegmentAngle(number)` 関数 - セグメント番号から角度 (src/utils/targetCoordinates.ts)
- [x] `getTargetCoordinates(targetType, number)` 関数 - ターゲットの物理座標 (src/utils/targetCoordinates.ts)
- [x] `getAllTargets()` 関数 - 全61ターゲットのリストを生成 (src/utils/targetCoordinates.ts:110-145)
### 1.8 01ゲームロジック (`src/utils/gameLogic.ts`)
- [x] `checkBust(remainingScore, throwScore, isDouble)` 関数 - バスト判定 (src/utils/gameLogic.ts:1-54, src/utils/gameLogic.test.ts)
- [x] `canFinishWithDouble(remainingScore)` 関数 - ダブルアウト可能か (src/utils/gameLogic.ts:82-110, src/utils/gameLogic.test.ts)
- [x] `isGameFinished(remainingScore)` 関数 - ゲーム終了判定 (src/utils/gameLogic.ts:112-130, src/utils/gameLogic.test.ts)

## Phase 2: ボード描画

### 2.1 ダーツボードレンダラー (`src/components/DartBoard/dartBoardRenderer.ts`)
- [x] `drawBoard(p5, transform)` 関数 - ボード全体描画の順序制御 (src/components/DartBoard/dartBoardRenderer.ts:30-44)
- [x] `drawDoubleRing(p5, transform)` 関数 - ダブルリング描画（170mm円全体、赤/緑交互） (src/components/DartBoard/dartBoardRenderer.ts:53-80)
- [x] `drawOuterSingle(p5, transform)` 関数 - アウターシングル描画（162mm円全体、黒/ベージュ交互） (src/components/DartBoard/dartBoardRenderer.ts:88-115)
- [x] `drawTripleRing(p5, transform)` 関数 - トリプルリング描画（107mm円全体、赤/緑交互） (src/components/DartBoard/dartBoardRenderer.ts:123-150)
- [x] `drawInnerSingle(p5, transform)` 関数 - インナーシングル描画（99mm円全体、黒/ベージュ交互） (src/components/DartBoard/dartBoardRenderer.ts:158-185)
- [x] `drawOuterBull(p5, transform)` 関数 - アウターブル描画（緑の円、半径7.95mm） (src/components/DartBoard/dartBoardRenderer.ts:192-203)
- [x] `drawInnerBull(p5, transform)` 関数 - インナーブル描画（赤の円、半径3.175mm） (src/components/DartBoard/dartBoardRenderer.ts:210-221)
- [x] `drawSpider(p5, transform)` 関数 - スパイダー（ワイヤー境界線）描画 (src/components/DartBoard/dartBoardRenderer.ts:183-223, src/__tests__/integration/dartboard-spider-rendering.test.ts)
- [x] `drawNumbers(p5, transform)` 関数 - セグメント番号描画 (src/components/DartBoard/dartBoardRenderer.ts:285-314, src/__tests__/integration/dartboard-numbers-rendering.test.ts)
- [x] `drawDartMarker(p5, transform, coords, color, index)` 関数 - ダーツマーカー描画 (src/components/DartBoard/dartBoardRenderer.ts:317-361, src/__tests__/integration/dartboard-marker-rendering.test.ts)
- [x] `drawLegend(p5, dartCount)` 関数 - 凡例描画（3投時） (src/components/DartBoard/dartBoardRenderer.ts:359-400, src/__tests__/integration/dartboard-legend-rendering.test.ts)
- [x] 色定義（SEGMENT_COLORS, RING_COLORS） (src/components/DartBoard/dartBoardRenderer.ts:13-22)
### 2.2 P5キャンバスラッパー (`src/components/DartBoard/P5Canvas.tsx`)
- [x] react-p5 を使用したコンポーネント作成
- [x] setup関数の実装
- [x] draw関数の実装
- [x] windowResized対応
- [x] propsでダーツ位置配列を受け取る
### 2.3 DartBoardコンポーネント (`src/components/DartBoard/DartBoard.tsx`)
- [x] P5Canvasをラップするコンポーネント
- [x] レスポンシブサイズ計算
- [x] ダーツ位置の受け渡し
- [x] 凡例表示の制御

## Phase 3: 状態管理

### 3.1 Zustand Store (`src/stores/`)
- [x] 基本状態の定義（`gameStore.ts`）
- [x] プリセット定義 → `src/stores/config/presets.ts`
- [x] 型ガード関数 → `src/stores/utils/typeGuards.ts`
- [x] 初期状態定義 → `src/stores/session/initialState.ts`
- [x] 設定アクション
- [x] ゲームアクション
- [x] 計算プロパティ（getterまたはセレクター）
### 3.2 localStorage連携 (`src/utils/storage.ts`)
- [x] `saveSettings(config)` 関数 (src/utils/storage.ts:20-35, src/utils/storage.test.ts:6-143)
- [x] `loadSettings()` 関数 (src/utils/storage.ts:37-63, src/utils/storage.test.ts:145-282)
- [x] `clearSettings()` 関数 (src/utils/storage.ts:65-72, src/utils/storage.test.ts:284-327)
- [x] zustand の persist ミドルウェア設定（設定のみ保存） (src/stores/gameStore.ts:8-9,176-211, src/stores/gameStore.test.ts:1510-1991)
### 3.3 カスタムフック (`src/hooks/`)
- [x] `useGameStore.ts` - store のセレクター (src/hooks/useGameStore.ts, src/hooks/useGameStore.test.ts)
- [x] `useTimer.ts` - タイマー管理（setInterval） (src/hooks/useTimer.ts, src/hooks/useTimer.test.ts)
- [x] `usePracticeSession.ts` - 練習セッションロジック (src/hooks/usePracticeSession.ts, src/hooks/usePracticeSession.test.ts)
- [x] `useKeyboardInput.ts` - キーボードショートカット（0-9, Enter, Backspace, Escape） (src/hooks/useKeyboardInput.ts, src/hooks/useKeyboardInput.test.ts)

## Phase 4: 問題生成

### 4.1 プリセット定義 (`src/utils/presets.ts`)
- [x] `PRACTICE_PRESETS` オブジェクト（5種類）
- [x] `findMatchingPreset(config)` 関数
- [x] `generateCustomId(config)` 関数
- [x] `getPresetById(id)` 関数
### 4.2 クイズジェネレーター (`src/utils/quizGenerator.ts`)
- [x] `generateQuestion(config, remainingScore)` 関数
- [x] `generateQuestionText(config, throwIndex, isCumulative)` 関数
- [x] `calculateCorrectAnswer(throws, config, throwIndex, previousRemaining)` 関数
### 4.3 ターゲット自動選択機能 (`src/utils/dartStrategy/`)
- [x] `getOptimalTarget(remainingScore, throwsRemaining)` 関数
- [x] ターゲット対応表の定義 (`src/utils/constants/checkoutTable.ts`)
- [x] `PracticeConfig`型からtargetフィールドをオプショナル化
- [x] `TargetSelector`コンポーネントの実装
- [x] 全プリセットに `startingScore` を設定
- [x] `PracticeConfig.startingScore` を必須化
- [x] `gameStore.generateQuestion()` の修正

## Phase 5: UI（設定画面）

### 5.1 プリセットセレクター (`src/components/Settings/PresetSelector.tsx`)
- [x] 5つのプリセットボタン横並び
- [x] アクティブ状態のスタイル
- [x] アイコン表示
- [x] 説明ツールチップ
### 5.2 セッション設定 (`src/components/Settings/SessionConfigSelector.tsx`)
- [x] モード切り替え（問題数 / 時間制限）
- [x] 問題数選択（10, 20, 50, 100）
- [x] 時間制限選択（3分, 5分, 10分）
### 5.3 詳細設定 (`src/components/Settings/DetailedSettings.tsx`)
- [x] 折りたたみUI
- [x] 投擲単位選択（1投 / 3投）
- [x] 問う内容選択（得点 / 残り点数 / 両方）
- [x] 判定タイミング選択（独立 / 累積）※3投時のみ表示
- [x] 開始点数選択（501 / 701 / 301）※残り点数モード時のみ表示
- [x] 設定変更時のプリセット自動判定
### 5.4 ターゲットセレクター (`src/components/Settings/TargetSelector.tsx`)
- [x] タイプ選択ボタン（Single, Double, Triple, Bull）
- [x] 数字選択グリッド（4x5、セグメント順）
- [x] Bull選択時は数字非表示
- [x] アクティブ状態のスタイル
### 5.5 難易度セレクター (`src/components/Settings/DifficultySelector.tsx`)
- [x] プリセットボタン（初心者、中級者、上級者、エキスパート）
- [x] 標準偏差スライダー（5mm〜100mm）
- [x] 現在値表示
### 5.6 設定パネル統合 (`src/components/Settings/SettingsPanel.tsx`)
- [x] 全設定コンポーネントの統合
- [x] 現在の設定サマリー表示
- [x] 練習開始ボタン
- [x] レイアウト調整
### 5.7 ウィザード形式対応（PR #75）
- [x] **CSSモジュール化の優先度を決定する**（2025-12-29完了）
- [x] **インラインスタイルの削除**（完了済み）

## Phase 6: UI（練習画面）

### 6.1 統計バー (`src/components/Practice/StatsBar.tsx`)
- [x] 正解数 / 総問題数 表示
- [x] 正答率表示
- [x] 連続正解数表示
- [x] 残り問題数 or 残り時間表示（モードに応じて）
- [x] 01モードの場合は残り点数表示
### 6.2 問題表示 (`src/components/Practice/QuestionDisplay.tsx`)
- [x] 問題文表示（「この投擲の得点は？」「残り点数は？」など）
- [x] 3投モードの場合「1本目」「2本目」「3本目」表示
- [x] 累積モードの場合「合計」表示
### 6.3 テンキー入力 (`src/components/Practice/NumPad.tsx`)
- [x] 3x4グリッドレイアウト
- [x] 数字ボタン（0-9）
- [x] クリアボタン（C）
- [x] バックスペースボタン（⌫）
- [x] 入力表示エリア
- [x] 確定ボタン
- [x] 入力バリデーション（確定ボタン有効/無効）
- [x] キーボード入力対応
- [x] モード別ラベル（「点」「残り」）
- [x] タッチフレンドリーなサイズ
### 6.4 フィードバック (`src/components/Practice/Feedback.tsx`)
- [x] 正解/不正解表示（✓/✗ アイコン + テキスト）
- [x] ユーザーの回答表示
- [x] 正解表示
- [x] スコアラベル表示（例: T20 → 60点）
- [x] 連続正解数表示（正解時）
- [x] バスト表示（PR #68で実装完了）
- [x] 「次へ」ボタン
- [x] ゲームクリア表示（0点到達時）
### 6.5 練習画面統合 (`src/components/Practice/PracticeScreen.tsx`)
- [x] StatsBar配置
- [x] DartBoard配置
- [x] QuestionDisplay配置
- [x] NumPad配置
- [x] Feedback配置（モーダルまたはオーバーレイ）
- [x] 「設定に戻る」「終了」ボタン
- [x] タイマー管理
- [x] 時間切れ処理

## Phase 7: UI（結果画面）

### 7.1 セッションサマリー (`src/components/Results/SessionSummary.tsx`)
- [x] 総問題数表示
- [x] 正解数表示
- [x] 正答率表示
- [x] 連続正解記録表示
- [x] 経過時間表示
- [x] 設定情報表示（プリセット名、難易度、ターゲット）
- [x] 終了理由表示（完了、時間切れ、手動終了、ゲームクリア）
### 7.2 結果画面 (`src/components/Results/ResultsScreen.tsx`)
- [x] SessionSummary配置
- [x] 「同じ設定で再挑戦」ボタン
- [x] 「設定を変更」ボタン
- [x] レイアウト調整

## Phase 8: 統合

### 8.1 App.tsx
- [x] GameStateに応じた画面切り替え (src/App.tsx, src/App.test.tsx)
- [x] 初期設定のロード（localStorage）（gameStore.ts の persist ミドルウェアで実装済み）
### 8.2 スタイリング (`src/styles/index.css`)
- [x] CSS変数定義（色、フォントサイズ、スペーシング）
- [x] リセットCSS
- [x] 共通コンポーネントスタイル
- [x] ボタンスタイル（通常、アクティブ、無効）
- [x] 入力フィールドスタイル
- [x] カードスタイル
### 8.3 CSSモジュール化（コンポーネント単位でのスタイル分離）
- [x] `PresetSelector.tsx`のスタイルを分離（`PresetSelector.css`作成、`.preset-selector*`, `.preset-button*`を移行）
- [x] `SessionConfigSelector.tsx`のスタイルを分離（`SessionConfigSelector.css`作成、`.session-config-selector*`, `.session-mode-button*`, `.session-param-button*`を移行）
- [x] `DetailedSettings.tsx`のスタイルを分離（`DetailedSettings.css`作成、`.detailed-settings*`, `.detailed-setting-button*`を移行）
- [x] `TargetSelector.tsx`のスタイルを分離（`TargetSelector.css`作成、`.target-selector*`, `.target-type-button*`, `.target-number-button*`を移行）
- [x] `DifficultySelector.tsx`のスタイルを分離（`DifficultySelector.css`作成、`.difficulty-selector*`, `.difficulty-preset-button*`, `.difficulty-slider*`を移行）
- [x] `SettingsPanel.tsx`のスタイルを分離（`SettingsPanel.css`作成、`.settings-panel*`および`.setup-wizard*`を移行）
- [x] `SetupWizard/*.tsx`（Step1-4）のスタイルを分離（`SettingsPanel.css`に統合済み）
- [x] 設定サマリー・開始ボタンのスタイルを`SettingsPanel.css`に統合（`SettingsPanel.css`に含まれる）
- [x] `StatsBar.tsx`のスタイルを分離（`StatsBar.css`作成、`.stats-bar*`を移行）
- [x] `QuestionDisplay.tsx`のスタイルを分離（`QuestionDisplay.css`作成、`.question-display*`を移行）
- [x] `NumPad.tsx`のスタイルを分離（`NumPad.css`作成、`.num-pad*`を移行）
- [x] `Feedback.tsx`のスタイルを分離（`Feedback.css`作成、`.feedback*`を移行）
- [x] `PracticeScreen.tsx`のスタイルを分離（`PracticeScreen.css`作成、`.practice-screen*`を移行）
- [x] `SessionSummary.tsx`のスタイルを分離（`SessionSummary.css`作成、`.session-summary*`を移行）
- [x] `ResultsScreen.tsx`のスタイルを分離（`ResultsScreen.css`作成、`.results-screen*`を移行）
- [x] `index.css`の最終整理（グローバルスタイルのみが残っていることを確認）
- [x] 全コンポーネントで正しくスタイルが適用されているか視覚的に確認
- [x] 全テストが通ることを確認（`npm test`）
- [x] ビルドが成功することを確認（`npm run build`）
### 8.4 座標変換の修正（ダーツボード描画・判定のズレ解消）
- [x] `coordinateTransform.ts`の`physicalToScreen`メソッドを修正（`scaleX`, `scaleY` → `scale`に統一）
- [x] `coordinateTransform.ts`の`screenToPhysical`メソッドを修正（`scaleX`, `scaleY` → `scale`に統一）
- [x] 修正後、ダーツボードが正しい円形で描画されることを確認
- [x] 修正後、ダーツマーカーがボード上の正しい位置に表示されることを確認
- [x] `coordinateTransform.test.ts`のテストが通ることを確認
### 8.5 レスポンシブ対応
- [x] スマートフォン（〜640px）対応（各コンポーネントCSSに `@media (max-width: 640px)` 追加済み）
- [x] タブレット（641px〜1024px）対応（各コンポーネントCSSに `@media (min-width: 641px) and (max-width: 1024px)` 追加済み）
- [x] デスクトップ（1025px〜）対応（デフォルトスタイルとして実装済み）
- [x] タッチデバイス対応（各コンポーネントCSSに `@media (hover: none)` 追加済み）
- [x] ボードサイズの動的調整（ResizeObserverによる親コンテナサイズ監視を実装 - 2025-12-31）
### 8.6 ビューポート固定レイアウト（スクロールなし）
- [x] `App.tsx`にビューポート固定ラッパーを追加（`width: 100vw; height: 100vh; overflow: hidden`）
- [x] 全画面共通のCSSクラス `.app` を定義（`display: flex; flex-direction: column`）
- [x] `SettingsPanel`の全体レイアウトを縦方向flex配置に変更
- [x] 進捗インジケーターの高さを固定（`--layout-header-height: 80px`）
- [x] ウィザードコンテンツエリアを `flex: 1` で残りスペースを占有
- [x] ナビゲーションボタンエリアの高さを固定（`--layout-footer-height: 80px`）
- [x] `Step1Preset`コンポーネントの高さ調整（親の高さに収まるように）
- [x] `Step2Difficulty`コンポーネントの高さ調整（親の高さに収まるように）
- [x] `Step3Session`コンポーネントの高さ調整（親の高さに収まるように）
- [x] `Step4Confirm`コンポーネントの高さ調整（親の高さに収まるように、内容が多い場合はスクロール可能に）
- [x] `PracticeScreen`の全体レイアウトを縦方向flex配置に変更
- [x] `StatsBar`の高さを固定（`--layout-stats-bar-height: 60px`）
- [x] メインコンテンツエリア（`.practice-screen__main`）を `flex: 1` で残りスペースを占有
- [x] フッターボタンエリアの高さを固定（`--layout-footer-height: 80px`）
- [x] `DartBoard`のサイズを親コンテナに適応（アスペクト比を維持しつつ、縦横どちらかに収まる）
- [x] `QuestionDisplay`の高さ調整（親の高さに依存）
- [x] `NumPad`の高さ調整（親の高さに依存、ボタンサイズを動的に調整）
- [x] `Feedback`の高さ調整（親の高さに依存、内容が多い場合はスクロール可能に）
- [x] `ResultsScreen`の全体レイアウトを縦方向flex配置に変更
- [x] メインコンテンツエリア（`.results-screen__main`）を `flex: 1` で残りスペースを占有
- [x] フッターボタンエリアの高さを固定（`--layout-footer-height: 80px`）
- [x] `SessionSummary`の内部スクロール対応（`overflow: auto`、内容が多い場合にスクロール）
- [x] CSS変数でレイアウト高さを定義（`--layout-header-height`, `--layout-footer-height`, `--layout-stats-bar-height`など）
- [x] 全画面で一貫したスペーシング・マージンを定義（`--layout-content-padding`, `--layout-content-gap`）
- [x] レスポンシブブレークポイントで高さ比率を調整（モバイル用: `*-mobile`変数）

## Phase 9: バグフィックス・テスト・調整

### 9.1 バグフィックス（優先実施）
- [x] `generateQuestion`時に3本のダーツを事前にシミュレーション（現状維持）
- [x] `allThrows: ThrowResult[]`として全投擲を保持（内部用、`currentQuestion.throws`）
- [x] `displayedDarts`は`currentThrowIndex`までの投擲のみを含む
- [x] 3投モードでgenerateQuestion時に最初の1本を表示し、`currentThrowIndex = 1`
- [x] `simulateNextThrow`で次の1本を追加し、`currentThrowIndex++`
- [x] `Question`型に`questionPhase`を追加（src/types/Question.ts:24-33, src/types/Question.test.ts:547-876）
- [x] 1本目・2本目の後: バスト判定を2択で問う
- [x] バスト判定の正解: 現在の残り点数と投擲結果から計算（コンポーネントのpropsで受け取る設計）
- [x] `BustQuestion`コンポーネント作成（src/components/Practice/BustQuestion.tsx, BustQuestion.css, BustQuestion.test.tsx）
- [x] 正解/不正解フィードバックを表示（showFeedback props で制御）
- [x] 3本目の後: 合計点数を`NumPad`で問う
- [x] 正解: 3投の合計得点（バストの場合は0点）
- [x] フィードバック後、次のラウンドへ
- [x] questionPhaseフィールドによる3投モードのフェーズ管理
- [x] PracticeScreenでBustQuestion/NumPadの切り替え実装
- [x] 1本目・2本目でバスト判定が「バスト」の場合、次のダーツシミュレーションをスキップ
- [x] バスト発生時は残り点数をラウンド開始時の値にリセット（維持）
- [x] バスト発生時は次のラウンド（新しい3投）に進む
- [x] `handleBustFeedbackComplete`の分岐処理を追加
- [x] バスト発生時、残り点数の正解はラウンド開始時の値を維持すべき
- [x] 修正: `correctAnswer`の計算ロジックを見直し
- [x] チェックアウト可能な残り点数（2-170点、ダブルアウト可能）の場合、3択UIを表示
- [x] フィニッシュ判定条件: `remainingScore - throwScore === 0 && isDouble`
- [x] `BustQuestion`コンポーネントを拡張
- [x] キーボードショートカット追加: Fキーでフィニッシュ
- [x] 正解判定ロジックの拡張
- [x] フィニッシュ判定のテスト追加
- [x] 正誤判定表示中の「次へ」ボタンをEnterキーでも進行できるようにする
- [x] BustQuestionのフィードバック表示時もEnterキーで次へ
- [x] Feedbackコンポーネント表示時もEnterキーで次へ
- [x] キーボードイベントリスナーの追加
- [x] scoreモード（3投の合計点数を問う）でも残り点数を減らしていく
- [x] 現状: scoreモードでは残り点数が変化しない
- [x] 修正: 正解回答後、累積得点分だけ残り点数を減算
- [x] バスト発生時は残り点数をラウンド開始時の値に戻す
- [x] `QuestionDisplay.css`: `max-width: 800px` → `max-width: 100%`
- [x] `NumPad.css`: `max-width: 400px` → デスクトップ400px、モバイル100%
- [x] `.practice-screen__interaction-section`に`overflow-x: hidden`を追加
- [x] 小型デバイスでのフォントサイズ調整（CSS変数使用）
- [x] NumPadボタンのサイズを親幅に応じて調整（`aspect-ratio: 1`維持）
- [x] `RingType`を使った82ターゲット定義を追加（`src/utils/targetCoordinates/getAllTargetsExpanded.ts`）
- [x] `PracticeConfig`型に`randomizeTarget: boolean`フラグを追加（オプショナル、デフォルトfalse）
- [x] `basicプリセット`に`randomizeTarget: true`を設定
- [x] `gameStore.ts`の`generateQuestion`アクションを修正（シャッフルバッグ方式）
- [x] テスト作成：シャッフルバッグの品質保証（23テスト追加）
- [x] 別の手段で解決：`getDisplayCoordinates`による表示座標補正
- [x] `ZoomView`コンポーネントを作成（`src/components/DartBoard/ZoomView.tsx`）
- [x] ダーツ着地点を中心に拡大表示（2-3倍ズーム）
- [x] スパイダーラインとダーツの位置関係を明確に表示
- [x] 画面上の配置を決定（以下の観点で評価）
- [x] タップ/ホバーでズーム位置を変更可能に
- [x] `src/utils/scoreCalculator/getRing.ts`の37-38行目を削除
- [x] `getRing.test.ts`にアウトボード判定のテストを追加
- [x] 既存テストが壊れないことを確認（26 tests passing, before: 24）
### 9.2 UI/UX改善（着手すべき項目）
- [x] `src/utils/targetCoordinates/getAllTargetsExpanded.ts` を修正
- [x] `src/stores/config/presets.ts` の説明文を更新
- [x] 関連ドキュメント・テストの更新
- [x] 新構成: SINGLE×20 + DOUBLE×20 + TRIPLE×20 + BULL×2 = **62個**
- [x] `.env.development` を作成し `VITE_ENABLE_DEBUG_MODE=true` を設定
- [x] `.env.production` を作成し `VITE_ENABLE_DEBUG_MODE=false` を設定
- [x] `src/components/Settings/SettingsPanel.tsx` の23行目を修正
- [x] 開発環境でのみデバッグボタンが表示されることを確認
- [x] `src/stores/config/presets.ts` の47-60行目を修正
- [x] 既存のlocalStorage設定との互換性確認
- [x] コーラー基礎と累積で出題単位が異なることを確認
- [x] `src/stores/gameStore.ts` の735-749行目を修正
- [x] 修正後のコード:
- [x] 基礎練習で10問設定時、10問目で終了することを確認
- [x] `src/stores/gameStore.ts` の `submitAnswer` を修正
- [x] 修正コード:
- [x] 基礎練習でバスト判定が発生しないことを確認

## Phase 10: デプロイ

### 技術的改善（Biome関連 - PR #44レビュー指摘事項）
- [x] CI/CDへの統合（重要度: 高）
- [x] ルール設定の厳格化検討（重要度: 中）
- [x] pre-commitフックの追加（重要度: 中）


### 9.2 UI/UX改善（着手すべき項目）

#### 9.2.1 基礎練習の出題削減（82→62種類）✅
  - 基礎練習の出題対象からINNER_SINGLEを除外（OUTER_SINGLEのみ使用）
  - ゲーム全体ではINNER_SINGLEとOUTER_SINGLEの区別を維持
  - 実装ファイル: src/utils/targetCoordinates/getAllTargetsExpanded.ts
  - テストファイル: src/utils/targetCoordinates/getAllTargetsExpanded.test.ts
  - 「82ターゲット」→「62ターゲット」
  - src/stores/gameStore.test.ts: 82→62の期待値更新
  - src/types/PracticeConfig.ts: コメント更新
  - 期待される配列長を82→62に変更
  - INNER_SINGLEが含まれないことを確認

**リスク:** 低

#### 9.2.2 デバッグボタンの環境変数制御
  - `const ENABLE_DEBUG_MODE = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';`
  - テストで環境変数による制御を検証済み（src/components/Settings/SettingsPanel.test.tsx）

**リスク:** 低

#### 9.2.3 コーラー基礎の投擲単位変更（3投→1投）
  - `throwUnit: 3` → `throwUnit: 1`
  - `description` を更新：「1投ごとに残り点数を問う基礎練習」

**リスク:** 低

#### 9.2.4 基礎練習の問題数制限修正
  - `submitAnswer` 内の条件から `randomizeTarget !== true` を削除
  - 基礎練習でも設定した問題数（10/20/50/100）でセッション終了するように修正
  ```typescript
  if (
    state.sessionConfig.mode === 'questions' &&
    state.stats.total >= (state.sessionConfig.questionCount || 0)
  ) {
    state.gameState = 'results';
    state.isTimerRunning = false;
  }
  ```
  - テストファイル: `src/stores/gameStore.randomizeTarget.test.ts` (12テスト全て成功)

**リスク:** 低

#### 9.2.5 基礎練習の残り点数管理無効化
  - `randomizeTarget === true` の場合、`checkAndUpdateBust` をスキップ
  - バスト判定を完全に無効化
  ```typescript
  let isBust = false;
  let newRemainingScore = state.remainingScore;

  if (state.config.randomizeTarget !== true) {
    const bustResult = checkAndUpdateBust(
      state.currentQuestion,
      state.remainingScore,
      state.roundStartScore
    );
    isBust = bustResult.isBust;
    newRemainingScore = bustResult.newRemainingScore;
  }

  state.remainingScore = newRemainingScore;
  ```
  - 実装ファイル: `src/stores/gameStore.ts`
  - テストファイル: `src/stores/gameStore.bustSkip.test.ts` (17テスト全て成功)

**リスク:** 中（バスト判定ロジックとの依存関係）

#### 9.2.6 基礎練習の詳細設定で選択肢非表示
- [x] `src/components/Settings/DetailedSettings.tsx` を修正
  - 基礎練習時（`config.configId === DEFAULT_PRESET_ID`）、以下を非表示：
    - 投擲単位の選択
    - 問う内容の選択
    - 判定タイミングの選択
    - 開始点数の選択
  - 代わりに説明文を表示
- [x] CSS追加: `detailed-settings__notice`クラスを追加
- [x] 基礎練習選択時、詳細設定で投擲単位・問う内容が非表示になることを確認
  - 実装: src/components/Settings/DetailedSettings.tsx (DEFAULT_PRESET_IDインポート、isBasicMode判定追加)
  - CSS: src/components/Settings/DetailedSettings.css (.detailed-settings__notice追加)
  - テスト: src/components/Settings/DetailedSettings.test.tsx (9テスト追加、計89テスト)
  - 2026-01-04

**リスク:** 低

#### 9.2.7 基礎練習の難易度選択スキップ
- [x] `src/components/Settings/SettingsPanel.tsx` を修正
  - 基礎練習選択時、Step 2（難易度選択）をスキップ
  - Step 1 → Step 3 へ直接遷移
  - Step 3 → Step 1 へ戻る際もスキップ
  - 進捗インジケーターでStep 2をグレーアウト表示
- [x] ナビゲーションロジックの修正（isBasicMode判定追加）
- [x] CSS追加（.setup-wizard__progress-step--skipped）
- [x] テスト追加（src/components/Settings/SettingsPanel.test.tsx、26テスト追加、計61テスト）
  - 実装: src/components/Settings/SettingsPanel.tsx, src/components/Settings/SettingsPanel.css
  - 2026-01-04

**リスク:** 中（ウィザードナビゲーションの複雑化）


---

**最終更新**: 2026-01-04
