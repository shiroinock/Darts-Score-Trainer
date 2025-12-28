# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Darts Score Trainer - プレイヤーの実力（標準偏差）に基づいてダーツの投擲をシミュレーションし、点数計算をクイズ形式で出題する練習アプリ。

対象ゲーム: 01ゲーム（501、701、301）
初期プラットフォーム: Web（GitHub Pages）

## 技術スタック

- **React 18.2.0** + TypeScript
- **Vite 5.0** - ビルドツール
- **p5.js**（react-p5 1.3.35経由） - ダーツボード描画
- **Zustand 4.4.0** - 状態管理
- **gh-pages** - デプロイ

## よく使うコマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # TypeScriptコンパイル + Viteビルド
npm run preview    # 本番ビルドのプレビュー
npm run deploy     # ビルドしてGitHub Pagesにデプロイ
```

## アーキテクチャ

### 座標系（重要）
2つの座標系を厳密に分離する：

1. **物理座標系（mm単位）** - すべてのロジック・計算に使用
   - 原点: ボード中心 (0, 0)
   - X軸: 右が正、Y軸: 下が正
   - ボード半径: 225mm

2. **画面座標系（ピクセル単位）** - 描画のみに使用
   - 原点: キャンバス左上
   - ウィンドウサイズに応じて可変

`CoordinateTransform`クラスが座標系間の変換を担当。

### ダーツボード仕様（13.2インチ スティールチップ）
- インナーブル（50点）: 半径 3.175mm
- アウターブル（25点）: 半径 7.95mm
- トリプルリング: 99-107mm
- ダブルリング: 162-170mm
- ボード端: 225mm

セグメント配置（真上から時計回り）: `[20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]`

### 投擲シミュレーション
2次元正規分布（Box-Muller法）で標準偏差（mm）に基づき散らばりを再現：
- 初心者: 50mm
- 中級者: 30mm
- 上級者: 15mm
- エキスパート: 8mm

### 練習モードのパラメーター
4つの軸で練習設定を定義：
- `throwUnit`: 1投 or 3投単位
- `questionType`: 'score'（得点） | 'remaining'（残り点数） | 'both'（両方）
- `judgmentTiming`: 'independent'（独立） | 'cumulative'（累積）
- `startingScore`: 501/701/301 or null

プリセット5種: 基礎練習、プレイヤー練習、コーラー基礎、コーラー累積、総合練習

### プロジェクト構成（2025-12-08更新: 1定義1ファイル原則適用後）
```
src/
├── types/                          # TypeScript型定義（14ファイル）
│   ├── Coordinates.ts              # 座標インターフェース
│   ├── RingType.ts                 # リング種別
│   ├── Target.ts, ThrowResult.ts   # ターゲット・投擲結果
│   ├── PracticeConfig.ts           # 練習設定
│   └── index.ts                    # 再エクスポート
├── components/
│   ├── DartBoard/                  # p5.jsキャンバスと描画
│   ├── Settings/                   # 設定UI
│   ├── Practice/                   # クイズ画面、テンキー
│   └── Results/                    # 結果画面
├── hooks/                          # カスタムフック
├── stores/                         # Zustand状態管理
│   ├── gameStore.ts                # メインストア
│   ├── config/presets.ts           # プリセット定義
│   ├── utils/typeGuards.ts         # 型ガード
│   └── session/initialState.ts     # 初期状態
└── utils/                          # コアロジック（1関数1ファイル）
    ├── coordinateTransform.ts      # 座標変換クラス
    ├── constants/                  # 定数（14ファイル）
    │   ├── boardPhysical.ts
    │   ├── segments.ts
    │   └── index.ts
    ├── scoreCalculator/            # 得点計算（7関数）
    │   ├── getRing.ts
    │   ├── calculateScore.ts
    │   ├── coordinateToScore.ts
    │   └── index.ts
    ├── gameLogic/                  # ゲームロジック（3関数）
    │   ├── checkBust.ts
    │   ├── canFinishWithDouble.ts
    │   └── index.ts
    ├── validation/                 # 入力検証（4関数）
    │   ├── isValidSingleThrowScore.ts
    │   ├── isValidRoundScore.ts
    │   └── index.ts
    ├── targetCoordinates/          # ターゲット座標（3関数）
    │   ├── getSegmentAngle.ts
    │   ├── getTargetCoordinates.ts
    │   └── index.ts
    ├── throwSimulator/             # 投擲シミュレーション（3関数）
    │   ├── generateNormalDistribution.ts
    │   ├── simulateThrow.ts
    │   └── index.ts
    └── storage/                    # ローカルストレージ（3関数）
        ├── saveSettings.ts
        ├── loadSettings.ts
        └── index.ts

注: 各サブディレクトリには関数ごとの.test.tsファイルも配置
    （例: scoreCalculator/getRing.test.ts）
```

## 実装上の注意点

- スパイダー（ワイヤー）境界: 境界線上の座標は最も近い有効エリアにずらす
- ボード外（>225mm）: 0点、再投擲なし
- ビジネスロジックは必ず物理座標で処理し、描画時のみ画面座標に変換
- モバイルファーストのレスポンシブデザイン、タッチ操作に配慮

## 開発プロセス

### エージェント評価レポート

このプロジェクトでは、TDDパイプラインで使用するエージェント（test-writer、implement、review-fileなど）の品質を継続的に評価しています。

評価レポートは `.claude/reports/` ディレクトリに配置され、**意図的にGitリポジトリにコミット**されています。これにより：

1. **改善履歴の追跡**: エージェントの改善プロセスを時系列で記録
2. **パフォーマンス分析**: 各エージェントの成功率、実行時間、品質指標を分析
3. **ベストプラクティスの蓄積**: 成功パターンと失敗パターンを学習
4. **チーム共有**: プロジェクトメンバー間で品質基準を共有

### 評価レポートの構成

```
.claude/reports/
├── test-runner/
│   ├── evaluation_20251229_*.md    # test-runnerエージェントの評価
│   └── summary.md                   # 総合評価サマリー
├── implement/
│   └── ...
└── review-file/
    └── ...
```

**注意**: 評価レポートは開発プロセスの一部であり、削除や `.gitignore` への追加は推奨されません。
