# Darts-Score-Trainer

プレイヤーの実力（標準偏差）に基づいてダーツの投擲をシミュレーションし、点数計算をクイズ形式で出題する練習アプリ。

## セットアップ

### 環境変数の設定

プロジェクトには環境変数のサンプルファイル（`.env.example`）が含まれています。

開発環境用の設定ファイルを作成するには：

```bash
cp .env.example .env.development
```

本番環境用の設定ファイルを作成するには：

```bash
cp .env.example .env.production
```

### 利用可能な環境変数

- `VITE_ENABLE_DEBUG_MODE`: デバッグボタンの表示/非表示を制御
  - `true`: デバッグボタンを表示（開発環境推奨）
  - `false`: デバッグボタンを非表示（本番環境推奨）

詳細は [Vite の環境変数ドキュメント](https://vitejs.dev/guide/env-and-mode.html) を参照してください。
