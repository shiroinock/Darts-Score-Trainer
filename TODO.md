# Darts Score Trainer - 実装TODO

COMPLETE_SPECIFICATION.md に基づく実装計画です。

---

## Phase 0: プロジェクトセットアップ

### 0.1 Vite + React + TypeScript 初期化
- [x] `npm create vite@latest . -- --template react-ts` でプロジェクト作成
- [x] 不要なボイラープレートファイルを削除（App.css, assets/など）

### 0.2 依存パッケージのインストール
- [x] `npm install react-p5 zustand`
- [x] `npm install -D @types/p5 gh-pages` (gh-pagesは0.1で完了)

### 0.3 設定ファイルの調整
- [x] `vite.config.ts` に `base: '/Darts-Score-Trainer-/'` を追加
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

---

## Phase 1: 基盤実装

### 1.1 型定義 (`src/types/index.ts`)
- [x] `Coordinates` インターフェース（x, y）
- [x] `RingType` 型（'INNER_BULL' | 'OUTER_BULL' | 'TRIPLE' | 'DOUBLE' | 'INNER_SINGLE' | 'OUTER_SINGLE' | 'OUT'）
- [x] `TargetType` 型（'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'BULL'）
- [x] `Target` インターフェース（type, number, label）
- [x] `ThrowResult` インターフェース（target, landingPoint, score, ring, segmentNumber）
- [x] `PracticeConfig` インターフェース（全練習設定）
- [x] `SessionConfig` インターフェース（mode, questionCount, timeLimit）
- [x] `Question` インターフェース（mode, throws, correctAnswer, questionText, startingScore）
- [x] `GameState` 型（'setup' | 'practicing' | 'results'）
- [x] `Stats` インターフェース（correct, total, currentStreak, bestStreak）
- [x] `SessionResult` インターフェース（config, sessionConfig, stats, elapsedTime, completedAt, finishReason）
- [x] `BustInfo` インターフェース（isBust, reason）
- [x] `QuestionType` 型（'score' | 'remaining' | 'both'）
- [x] `JudgmentTiming` 型（'independent' | 'cumulative'）

### 1.2 定数定義 (`src/utils/constants.ts`)
- [x] `BOARD_PHYSICAL` オブジェクト（リング半径、スパイダー幅、セグメント配列）
- [x] `TARGET_RADII` オブジェクト（TRIPLE, DOUBLE, SINGLE_OUTER, BULL）
- [x] `DIFFICULTY_PRESETS` オブジェクト（beginner, intermediate, advanced, expert）
- [x] `SESSION_QUESTION_COUNTS` 配列（[10, 20, 50, 100]）
- [x] `SESSION_TIME_LIMITS` 配列（[3, 5, 10]）
- [x] `DART_COLORS` オブジェクト（first, second, third）
- [x] `FEEDBACK_ICONS` オブジェクト（correct, incorrect）
- [x] `STORAGE_KEY` 定数
- [x] `SEGMENT_ANGLE` 定数（Math.PI / 10）
- [x] `SEGMENTS` 配列（[20, 1, 18, 4, 13, ...]）

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

---

## Phase 2: ボード描画

### 2.1 ダーツボードレンダラー (`src/components/DartBoard/dartBoardRenderer.ts`)
- [ ] `drawBoard(p5, transform)` 関数 - ボード全体描画
- [ ] `drawSegments(p5, transform)` 関数 - セグメント描画（色分け）
- [ ] `drawRings(p5, transform)` 関数 - リング描画（トリプル、ダブル）
- [ ] `drawBull(p5, transform)` 関数 - ブル描画（インナー、アウター）
- [ ] `drawSpider(p5, transform)` 関数 - ワイヤー描画
- [ ] `drawNumbers(p5, transform)` 関数 - セグメント番号描画
- [ ] `drawDartMarker(p5, transform, coords, color, index)` 関数 - ダーツマーカー描画
- [ ] `drawLegend(p5, dartCount)` 関数 - 凡例描画（3投時）
- [ ] ボードの色定義（黒、白、赤、緑など）

### 2.2 P5キャンバスラッパー (`src/components/DartBoard/P5Canvas.tsx`)
- [ ] react-p5 を使用したコンポーネント作成
- [ ] setup関数の実装
- [ ] draw関数の実装
- [ ] windowResized対応
- [ ] propsでダーツ位置配列を受け取る

### 2.3 DartBoardコンポーネント (`src/components/DartBoard/DartBoard.tsx`)
- [ ] P5Canvasをラップするコンポーネント
- [ ] レスポンシブサイズ計算
- [ ] ダーツ位置の受け渡し
- [ ] 凡例表示の制御

---

## Phase 3: 状態管理

### 3.1 Zustand Store (`src/stores/gameStore.ts`)
- [ ] 基本状態の定義
  - [ ] `gameState: GameState`
  - [ ] `config: PracticeConfig`
  - [ ] `sessionConfig: SessionConfig`
  - [ ] `currentQuestion: Question | null`
  - [ ] `currentThrowIndex: number`（3投モード用）
  - [ ] `displayedDarts: ThrowResult[]`
  - [ ] `remainingScore: number`
  - [ ] `roundStartScore: number`（バスト時のリセット用）
  - [ ] `stats: Stats`
  - [ ] `elapsedTime: number`
  - [ ] `isTimerRunning: boolean`

- [ ] 設定アクション
  - [ ] `setConfig(config: Partial<PracticeConfig>)`
  - [ ] `setSessionConfig(config: SessionConfig)`
  - [ ] `selectPreset(presetId: string)`
  - [ ] `setTarget(target: Target)`
  - [ ] `setStdDev(stdDevMM: number)`

- [ ] ゲームアクション
  - [ ] `startPractice()` - 練習開始
  - [ ] `generateQuestion()` - 問題生成
  - [ ] `simulateNextThrow()` - 次の投擲シミュレーション（プレイヤーモード用）
  - [ ] `submitAnswer(answer: number)` - 回答送信
  - [ ] `nextQuestion()` - 次の問題へ
  - [ ] `endSession(reason: string)` - セッション終了
  - [ ] `resetToSetup()` - 設定画面に戻る
  - [ ] `handleBust()` - バスト処理
  - [ ] `tick()` - タイマー更新

- [ ] 計算プロパティ（getterまたはセレクター）
  - [ ] `getCurrentCorrectAnswer()` - 現在の問題の正解
  - [ ] `getAccuracy()` - 正答率

### 3.2 localStorage連携 (`src/utils/storage.ts`)
- [ ] `saveSettings(config)` 関数
- [ ] `loadSettings()` 関数
- [ ] `clearSettings()` 関数
- [ ] zustand の persist ミドルウェア設定（設定のみ保存）

### 3.3 カスタムフック (`src/hooks/`)
- [ ] `useGameStore.ts` - store のセレクター
- [ ] `useTimer.ts` - タイマー管理（setInterval）
- [ ] `usePracticeSession.ts` - 練習セッションロジック
- [ ] `useKeyboardInput.ts` - キーボードショートカット（0-9, Enter, Backspace, Escape）

---

## Phase 4: 問題生成

### 4.1 プリセット定義 (`src/utils/presets.ts`)
- [ ] `PRACTICE_PRESETS` オブジェクト（5種類）
  - [ ] basic（基礎練習）
  - [ ] player（プレイヤー練習）
  - [ ] callerBasic（コーラー基礎）
  - [ ] callerCumulative（コーラー累積）
  - [ ] comprehensive（総合練習）
- [ ] `findMatchingPreset(config)` 関数
- [ ] `generateCustomId(config)` 関数
- [ ] `getPresetById(id)` 関数

### 4.2 クイズジェネレーター (`src/utils/quizGenerator.ts`)
- [ ] `generateQuestion(config, remainingScore)` 関数
- [ ] `generateQuestionText(config, throwIndex, isCumulative)` 関数
- [ ] `calculateCorrectAnswer(throws, config, throwIndex, previousRemaining)` 関数

---

## Phase 5: UI（設定画面）

### 5.1 プリセットセレクター (`src/components/Settings/PresetSelector.tsx`)
- [ ] 5つのプリセットボタン横並び
- [ ] アクティブ状態のスタイル
- [ ] アイコン表示
- [ ] 説明ツールチップ

### 5.2 セッション設定 (`src/components/Settings/SessionConfigSelector.tsx`)
- [ ] モード切り替え（問題数 / 時間制限）
- [ ] 問題数選択（10, 20, 50, 100）
- [ ] 時間制限選択（3分, 5分, 10分）

### 5.3 詳細設定 (`src/components/Settings/DetailedSettings.tsx`)
- [ ] 折りたたみUI
- [ ] 投擲単位選択（1投 / 3投）
- [ ] 問う内容選択（得点 / 残り点数 / 両方）
- [ ] 判定タイミング選択（独立 / 累積）※3投時のみ表示
- [ ] 開始点数選択（501 / 701 / 301）※残り点数モード時のみ表示
- [ ] 設定変更時のプリセット自動判定

### 5.4 ターゲットセレクター (`src/components/Settings/TargetSelector.tsx`)
- [ ] タイプ選択ボタン（Single, Double, Triple, Bull）
- [ ] 数字選択グリッド（4x5、セグメント順）
- [ ] Bull選択時は数字非表示
- [ ] アクティブ状態のスタイル

### 5.5 難易度セレクター (`src/components/Settings/DifficultySelector.tsx`)
- [ ] プリセットボタン（初心者、中級者、上級者、エキスパート）
- [ ] 標準偏差スライダー（5mm〜100mm）
- [ ] 現在値表示

### 5.6 設定パネル統合 (`src/components/Settings/SettingsPanel.tsx`)
- [ ] 全設定コンポーネントの統合
- [ ] 現在の設定サマリー表示
- [ ] 練習開始ボタン
- [ ] レイアウト調整

---

## Phase 6: UI（練習画面）

### 6.1 統計バー (`src/components/Practice/StatsBar.tsx`)
- [ ] 正解数 / 総問題数 表示
- [ ] 正答率表示
- [ ] 連続正解数表示
- [ ] 残り問題数 or 残り時間表示（モードに応じて）
- [ ] 01モードの場合は残り点数表示

### 6.2 問題表示 (`src/components/Practice/QuestionDisplay.tsx`)
- [ ] 問題文表示（「この投擲の得点は？」「残り点数は？」など）
- [ ] 3投モードの場合「1本目」「2本目」「3本目」表示
- [ ] 累積モードの場合「合計」表示

### 6.3 テンキー入力 (`src/components/Practice/NumPad.tsx`)
- [ ] 3x4グリッドレイアウト
- [ ] 数字ボタン（0-9）
- [ ] クリアボタン（C）
- [ ] バックスペースボタン（⌫）
- [ ] 入力表示エリア
- [ ] 確定ボタン
- [ ] 入力バリデーション（確定ボタン有効/無効）
- [ ] キーボード入力対応
- [ ] モード別ラベル（「点」「残り」）
- [ ] タッチフレンドリーなサイズ

### 6.4 フィードバック (`src/components/Practice/Feedback.tsx`)
- [ ] 正解/不正解表示（✓/✗ アイコン + テキスト）
- [ ] ユーザーの回答表示
- [ ] 正解表示
- [ ] スコアラベル表示（例: T20 → 60点）
- [ ] 連続正解数表示（正解時）
- [ ] バスト表示
- [ ] 「次へ」ボタン
- [ ] ゲームクリア表示（0点到達時）

### 6.5 練習画面統合 (`src/components/Practice/PracticeScreen.tsx`)
- [ ] StatsBar配置
- [ ] DartBoard配置
- [ ] QuestionDisplay配置
- [ ] NumPad配置
- [ ] Feedback配置（モーダルまたはオーバーレイ）
- [ ] 「設定に戻る」「終了」ボタン
- [ ] タイマー管理
- [ ] 時間切れ処理

---

## Phase 7: UI（結果画面）

### 7.1 セッションサマリー (`src/components/Results/SessionSummary.tsx`)
- [ ] 総問題数表示
- [ ] 正解数表示
- [ ] 正答率表示
- [ ] 連続正解記録表示
- [ ] 経過時間表示
- [ ] 設定情報表示（プリセット名、難易度、ターゲット）
- [ ] 終了理由表示（完了、時間切れ、手動終了、ゲームクリア）

### 7.2 結果画面 (`src/components/Results/ResultsScreen.tsx`)
- [ ] SessionSummary配置
- [ ] 「同じ設定で再挑戦」ボタン
- [ ] 「設定を変更」ボタン
- [ ] レイアウト調整

---

## Phase 8: 統合

### 8.1 App.tsx
- [ ] GameStateに応じた画面切り替え
  - [ ] setup → SettingsPanel
  - [ ] practicing → PracticeScreen
  - [ ] results → ResultsScreen
- [ ] 初期設定のロード（localStorage）

### 8.2 スタイリング (`src/styles/index.css`)
- [ ] CSS変数定義（色、フォントサイズ、スペーシング）
- [ ] リセットCSS
- [ ] 共通コンポーネントスタイル
- [ ] ボタンスタイル（通常、アクティブ、無効）
- [ ] 入力フィールドスタイル
- [ ] カードスタイル

### 8.3 レスポンシブ対応
- [ ] スマートフォン（〜600px）
- [ ] タブレット（601px〜900px）
- [ ] デスクトップ（901px〜）
- [ ] タッチデバイス対応
- [ ] ボードサイズの動的調整

---

## Phase 9: テスト・調整

### 9.1 動作確認
- [ ] 各プリセットモードの動作確認
  - [ ] 基礎練習（1投・得点・独立）
  - [ ] プレイヤー練習（3投・残り点数・累積）
  - [ ] コーラー基礎（3投・得点・独立）
  - [ ] コーラー累積（3投・得点・累積）
  - [ ] 総合練習（3投・両方・累積）
- [ ] 問題数モードの動作確認
- [ ] 時間制限モードの動作確認
- [ ] バスト処理の動作確認
- [ ] ダブルアウトの動作確認
- [ ] ゲームクリア（0点到達）の動作確認
- [ ] 入力バリデーションの動作確認
- [ ] キーボード操作の動作確認
- [ ] localStorage保存/復元の確認

### 9.2 バグフィックス
- [ ] 発見したバグの修正（随時追加）

### 9.3 パフォーマンス最適化
- [ ] p5.js描画の最適化（必要に応じて）
- [ ] 不要な再レンダリングの防止（React.memo, useMemo, useCallback）
- [ ] バンドルサイズの確認

### 9.4 ブラウザ互換性
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] モバイルブラウザ

---

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

### 機能追加
- [ ] ストレートアウト（シングルアウト）オプション
- [ ] インナーシングル狙い位置オプション
- [ ] 統計履歴の長期保存
- [ ] ランキング機能
- [ ] 戦略サジェスト機能
- [ ] 弱点エリア分析
- [ ] グラフ・チャート可視化
- [ ] 投擲アニメーション
- [ ] 英語対応（i18n）

### 技術的改善
- [ ] ユニットテスト追加
- [ ] E2Eテスト追加
- [ ] ESLint + Prettier 設定
- [ ] CI/CD パイプライン構築

---

## 進捗管理

| Phase | 項目数 | 完了数 | 進捗 |
|-------|--------|--------|------|
| 0 | 11 | 11 | 100% |
| 1 | 38 | 30 | 79% |
| 2 | 13 | 0 | 0% |
| 3 | 25 | 0 | 0% |
| 4 | 7 | 0 | 0% |
| 5 | 17 | 0 | 0% |
| 6 | 22 | 0 | 0% |
| 7 | 9 | 0 | 0% |
| 8 | 10 | 0 | 0% |
| 9 | 15 | 0 | 0% |
| 10 | 6 | 0 | 0% |
| **合計** | **173** | **41** | **24%** |
