# 仕様準拠チェック

## 説明
実装が `COMPLETE_SPECIFICATION.md` の仕様に準拠しているか確認します。

## 適用条件
以下のいずれかに該当するファイル：
- `src/types/` 内のファイル（型定義が仕様通りか）
- `src/utils/constants.ts`（定数が仕様通りか）
- `src/utils/scoreCalculator.ts`（点数計算ロジック）
- `src/utils/presets.ts`（プリセット定義）
- `src/utils/gameLogic.ts`（01ゲームロジック）
- `src/stores/` 内のファイル（状態構造が仕様通りか）

## チェック項目
- [ ] ダーツボードの寸法が仕様通りか（インナーブル半径3.175mm等）
- [ ] セグメント配置が正しいか（20が真上、時計回り）
- [ ] 難易度プリセットの標準偏差が仕様通りか
- [ ] 練習モードの5種類のプリセットが正しく実装されているか
- [ ] 01ゲームのルール（ダブルアウト、バスト処理）が正しいか

## 重要度
high

## 参照
- `COMPLETE_SPECIFICATION.md`
