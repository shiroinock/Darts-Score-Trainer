# 座標系の分離チェック

## 説明
物理座標（mm）と画面座標（pixel）が混同されていないか確認します。
これはこのダーツアプリの最重要設計原則です。

## 適用条件
以下のいずれかに該当するファイル：
- ファイル名に `coordinate`, `transform` を含む
- `DartBoard` 関連のコンポーネント（`src/components/DartBoard/`）
- ファイル名に `throwSimulator`, `scoreCalculator`, `targetCoordinates` を含む
- `dartBoardRenderer` を含むファイル
- 内容に `physicalToScreen`, `screenToPhysical`, `p5.` を含むファイル

## チェック項目
- [ ] ビジネスロジックが物理座標（mm）のみを使用しているか
- [ ] 描画コードのみが画面座標（pixel）を使用しているか
- [ ] `CoordinateTransform` クラスを経由して座標変換しているか
- [ ] 座標を扱う変数名が明確か（例: `physicalX`, `screenY`）
- [ ] コメントで座標系が明記されているか

## 重要度
high

## 関連ファイル
- `src/utils/coordinateTransform.ts`
- `src/components/DartBoard/`
