# Darts Score Trainer - 完全仕様書

この会話で決定したすべての内容を網羅的にまとめたドキュメントです。

---

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [MVPスコープ](#mvpスコープ)
3. [技術スタック](#技術スタック)
4. [ダーツボード仕様](#ダーツボード仕様)
5. [座標系設計](#座標系設計)
6. [座標→点数変換ロジック](#座標点数変換ロジック)
7. [投擲シミュレーション](#投擲シミュレーション)
8. [ターゲット選択](#ターゲット選択)
9. [練習モード設計](#練習モード設計)
10. [UI設計](#ui設計)
11. [ゲームフロー](#ゲームフロー)
12. [データ構造](#データ構造)
13. [実装計画](#実装計画)
14. [将来の拡張](#将来の拡張)
15. [追加仕様（詳細決定事項）](#追加仕様詳細決定事項)

---

## プロジェクト概要

### 目的
ダーツの点数計算練習アプリ。本人の実力を反映したダーツの刺さり方をシミュレーションし、点数計算をクイズ形式で出題する。

### 対象ゲーム
- **01ゲーム**（501、701、301）

### ターゲットユーザー
- 特に限定なし（初心者から上級者まで対応）

### プラットフォーム
- **初期**: Web版
- **将来**: マルチデバイス対応（スマホ、タブレット、PC）

### デプロイ
- **初期**: GitHub Pages
- **将来**: オンライン機能実装時にアーキテクチャ再検討

### 副次的な機能（将来実装）
- 残り点数とプレイヤー実力を考慮した戦略サジェスト
- 数理的解析によるインサイト提供
- 統計・ランキング機能

---

## MVPスコープ

### 含まれる機能
1. **投擲シミュレーション**
   - プレイヤーの実力（標準偏差）に基づく散らばり
   - ターゲットを狙った投擲の再現

2. **点数計算クイズ**
   - アプリが着弾位置を提示
   - ユーザーが点数を入力
   - 正誤判定とフィードバック

3. **練習モード**
   - プリセット5種
   - 詳細設定によるカスタマイズ

4. **基本統計**
   - 正答数/総問題数
   - 正答率
   - 連続正解数

### 含まれない機能（後回し）
- 戦略サジェスト機能
- 詳細な実力分析
- オンライン機能（ランキング、対戦等）
- 練習履歴の長期保存
- 弱点エリアの分析
- グラフ・チャートによる可視化

---

## 技術スタック

### フロントエンド
- **React 18.2.0** - UIフレームワーク
- **TypeScript** - 型安全性
- **Vite 5.0** - ビルドツール

### 描画
- **p5.js** - ダーツボード描画
- **react-p5 1.3.35** - React統合

### 状態管理
- **Zustand 4.4.0** - 軽量な状態管理ライブラリ

### デプロイ
- **gh-pages** - GitHub Pages へのデプロイ

### 開発ツール
- **@types/p5** - p5.jsの型定義
- **ESLint + Prettier**（推奨）

### データ保存
- **localStorage** - 設定・統計の保存（オフライン）
- **将来**: サーバー連携によるオンライン同期

---

## ダーツボード仕様

### ボードタイプ
- **スティールチップダーツ**
- **サイズ**: 13.2インチ（約335mm直径）
- **プレイエリア**: 直径約340mm

### 寸法（物理座標、mm単位）

#### リング半径
```
インナーブル（50点）: 半径 3.175mm （直径 6.35mm）
アウターブル（25点）: 半径 7.95mm  （直径 15.9mm）
トリプルリング内側:    半径 99mm
トリプルリング外側:    半径 107mm
ダブルリング内側:      半径 162mm
ダブルリング外側:      半径 170mm
ボード端（有効エリア）: 半径 225mm
```

#### リング幅
```
トリプルリング: 8mm  (107mm - 99mm)
ダブルリング:   8mm  (170mm - 162mm)
```

#### スパイダー幅（調整可能）
```
放射状スパイダー:  1.5mm （デフォルト）
円形スパイダー:    1.0mm  （デフォルト）
```

### セグメント配置
```javascript
[20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
```
- **20が真上**（-90度 / -π/2ラジアン）
- 時計回りに配置
- 各セグメント: 18度（π/10ラジアン）

### ターゲット座標の事前計算
各ターゲットの物理座標を計算：

```typescript
// 各リングの中央半径
TARGET_RADII = {
  TRIPLE: 103mm,        // (99 + 107) / 2
  DOUBLE: 166mm,        // (162 + 170) / 2
  SINGLE_INNER: 53.475mm,  // (7.95 + 99) / 2
  SINGLE_OUTER: 134.5mm,   // (107 + 162) / 2
  BULL: 0mm             // 中心
}

// 例: トリプル20の座標
radius = 103mm
angle = -π/2  // 真上
x = 103 * cos(-π/2) = 0
y = 103 * sin(-π/2) = -103
```

### 既存資産
- **p5.jsダーツボード描画コード**（15.5インチソフトダーツ用）
  - 13.2インチスティールダーツに調整が必要
  - 基本的な描画ロジックは流用可能
  - 寸法の比率変換が必要

---

## 座標系設計

### 設計方針
**内部ロジックと描画を完全に分離する**

理由：
- Webおよび将来のマルチデバイス化では描画サイズが可変
- ピクセル単位での処理は困難
- デバイス非依存な設計が必要

### 物理座標系（Physical Coordinates）

**目的**: すべての判定ロジック

**仕様**:
- **単位**: mm（ミリメートル）
- **原点**: ボード中心 (0, 0)
- **X軸**: 右方向が正
- **Y軸**: 下方向が正（p5.js標準）
- **特徴**: デバイスに依存しない絶対座標

**用途**:
- 点数計算
- 投擲シミュレーション
- ターゲット座標
- 当たり判定

### 画面座標系（Screen Coordinates）

**目的**: 描画のみ

**仕様**:
- **単位**: ピクセル
- **原点**: キャンバス左上 (0, 0)
- **特徴**: ウィンドウサイズに応じて可変

**用途**:
- ボード描画
- ダーツマーカー描画
- UI要素の配置

### CoordinateTransform クラス

**責務**: 2つの座標系を相互変換

**実装**:
```typescript
class CoordinateTransform {
  private canvasWidth: number;
  private canvasHeight: number;
  private boardPhysicalRadius: number;  // 225mm
  private screenRadius: number;
  private scale: number;  // mm → pixel変換係数
  private centerX: number;  // 画面中心X
  private centerY: number;  // 画面中心Y
  
  constructor(canvasWidth: number, canvasHeight: number, 
              boardPhysicalRadius = 225) {
    // マージンを考慮してスケールを計算
    const margin = 50;  // ピクセル
    const availableSize = Math.min(canvasWidth, canvasHeight) - margin * 2;
    this.screenRadius = availableSize / 2;
    this.scale = this.screenRadius / boardPhysicalRadius;
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight / 2;
  }
  
  // 物理座標 → 画面座標
  physicalToScreen(physicalX: number, physicalY: number): Coordinates {
    return {
      x: this.centerX + physicalX * this.scale,
      y: this.centerY + physicalY * this.scale
    };
  }
  
  // 画面座標 → 物理座標
  screenToPhysical(screenX: number, screenY: number): Coordinates {
    return {
      x: (screenX - this.centerX) / this.scale,
      y: (screenY - this.centerY) / this.scale
    };
  }
  
  // 距離変換
  physicalDistanceToScreen(physicalDistance: number): number {
    return physicalDistance * this.scale;
  }
  
  screenDistanceToPhysical(screenDistance: number): number {
    return screenDistance / this.scale;
  }
  
  // ウィンドウリサイズ時の更新
  updateCanvasSize(newWidth: number, newHeight: number): void {
    // スケールと中心座標を再計算
  }
}
```

**使用例**:
```typescript
// 描画時
const transform = new CoordinateTransform(800, 800);

// 物理座標のトリプル20を画面座標に変換
const physicalCoords = { x: 0, y: -103 };
const screenCoords = transform.physicalToScreen(
  physicalCoords.x, 
  physicalCoords.y
);
// 画面上に描画
ellipse(screenCoords.x, screenCoords.y, 10, 10);
```

---

## 座標→点数変換ロジック

### 全体フロー
```
1. 物理座標(x, y)を入力
   ↓
2. 中心からの距離と角度を計算
   distance = sqrt(x² + y²)
   angle = atan2(y, x)
   ↓
3. スパイダー判定
   境界線上か？
   ↓ YES
4. 最も近い有効エリアにずらす
   （計算が最も軽量な方法）
   ↓ NO
5. リング判定（距離から）
   ↓
6. セグメント判定（角度から）
   ↓
7. 点数確定
```

### スパイダー（境界線）処理

**方針**: 境界線上の座標は最も近い有効エリアに微小距離ずらす

**理由**: 
- 実際のダーツでは境界線は非常に細い
- 境界線上の判定を簡潔にする
- 計算の軽量化

**実装方法**: 計算が最も軽量な方法を採用

#### 円形スパイダー（リング境界）
```typescript
// 各臨界半径をチェック
const criticalRadii = [
  innerBull,     // 3.175mm
  outerBull,     // 7.95mm
  tripleInner,   // 99mm
  tripleOuter,   // 107mm
  doubleInner,   // 162mm
  doubleOuter    // 170mm
];

for (let radius of criticalRadii) {
  if (Math.abs(distance - radius) < spiderWidth / 2) {
    // 内側にずらす（面積が小さいため）
    distance = radius - spiderWidth / 2 - epsilon;
    break;
  }
}
```

#### 放射状スパイダー（セグメント境界）
```typescript
// 現在のセグメント内の角度位置を計算
const normalizedAngle = (angle + SEGMENT_OFFSET) % (2π);
const segmentIndex = floor(normalizedAngle / SEGMENT_ANGLE);
const angleInSegment = normalizedAngle % SEGMENT_ANGLE;

// 距離に応じた角度閾値
const angleThreshold = (spiderWidth / distance) / 2;

if (angleInSegment < angleThreshold) {
  // 左境界に近い → 右にずらす（現在のセグメント内）
  angle += angleThreshold + epsilon / distance;
} else if (angleInSegment > SEGMENT_ANGLE - angleThreshold) {
  // 右境界に近い → 左にずらす（現在のセグメント内）
  angle -= angleThreshold + epsilon / distance;
}
```

**epsilon**: 微小距離（0.1mm程度）

### リング判定

**入力**: 中心からの物理距離（mm）

**判定ロジック**:
```typescript
function getRing(distance: number): RingType {
  if (distance <= 3.175) return 'INNER_BULL';     // 50点
  if (distance <= 7.95) return 'OUTER_BULL';      // 25点
  if (distance > 225) return 'OUT';               // 0点（ボード外）
  
  // ダブルリング
  if (distance >= 162 && distance <= 170) return 'DOUBLE';
  
  // トリプルリング
  if (distance >= 99 && distance <= 107) return 'TRIPLE';
  
  // シングル
  if (distance < 99) return 'INNER_SINGLE';
  return 'OUTER_SINGLE';
}
```

### セグメント判定

**入力**: 角度（ラジアン）

**判定ロジック**:
```typescript
function getSegmentNumber(angle: number): number {
  // 20が真上（-90度）になるようオフセット
  const SEGMENT_OFFSET = π/2 + π/10;  // 90度 + 9度
  
  // 角度を正規化（0～2π）
  const normalizedAngle = (angle + SEGMENT_OFFSET) % (2π);
  
  // セグメントインデックスを計算（0～19）
  const segmentIndex = floor(normalizedAngle / (π/10));
  
  // セグメント番号を取得
  return SEGMENTS[segmentIndex];
}

// SEGMENTS配列
const SEGMENTS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 
                  3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
```

### 点数計算

**入力**: リング種類、セグメント番号

**計算ロジック**:
```typescript
function calculateScore(ring: RingType, segmentNumber: number): number {
  if (ring === 'INNER_BULL') return 50;
  if (ring === 'OUTER_BULL') return 25;
  if (ring === 'OUT') return 0;
  
  const baseScore = segmentNumber;  // 1-20
  
  if (ring === 'DOUBLE') return baseScore * 2;
  if (ring === 'TRIPLE') return baseScore * 3;
  return baseScore;  // SINGLE
}
```

### ボード外処理
- ボード外（有効エリア外、distance > 225mm）に刺さった場合は**0点**
- 再投擲はしない

---

## 投擲シミュレーション

### 正規分布による散らばり

**方針**: 狙った位置からの散らばりを2次元正規分布でモデル化

**パラメーター**: 標準偏差（mm単位）

**実装**: Box-Muller法

```typescript
function generateNormalDistribution(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

function simulateThrow(
  targetX: number,  // 物理座標（mm）
  targetY: number,  // 物理座標（mm）
  stdDevMM: number  // 標準偏差（mm）
): Coordinates {
  return {
    x: generateNormalDistribution(targetX, stdDevMM),
    y: generateNormalDistribution(targetY, stdDevMM)
  };
}
```

### 難易度プリセット

標準偏差（mm）で難易度を表現：

```typescript
const DIFFICULTY_PRESETS = {
  beginner:     { label: '初心者',     stdDevMM: 50 },
  intermediate: { label: '中級者',     stdDevMM: 30 },
  advanced:     { label: '上級者',     stdDevMM: 15 },
  expert:       { label: 'エキスパート', stdDevMM: 8 }
};
```

**調整可能**: ユーザーはスライダーで自由に調整可能（5mm～100mm程度）

### 投擲実行フロー

```typescript
function executeThrow(target: Target, stdDevMM: number): ThrowResult {
  // 1. ターゲットから物理座標を取得
  const targetCoords = getTargetCoordinates(target.type, target.number);
  
  // 2. 正規分布で着弾点をシミュレート
  const landingPoint = simulateThrow(
    targetCoords.x, 
    targetCoords.y, 
    stdDevMM
  );
  
  // 3. 点数を計算
  const score = coordinateToScore(landingPoint.x, landingPoint.y);
  
  return {
    target: target,
    landingPoint: landingPoint,  // 物理座標
    score: score
  };
}
```

---

## ターゲット選択

### ターゲットの種類

全61通りの組み合わせ：

```
BULL:          1種
Single (1-20): 20種
Double (1-20): 20種
Triple (1-20): 20種
─────────────────
合計:          61種
```

### ターゲット座標の計算

各ターゲットタイプごとに中央半径を使用：

```typescript
function getTargetCoordinates(
  targetType: TargetType, 
  number: number | null
): Coordinates {
  if (targetType === 'BULL') {
    return { x: 0, y: 0 };
  }
  
  // リングの中央半径を取得
  let radius: number;
  switch (targetType) {
    case 'TRIPLE':
      radius = 103;  // (99 + 107) / 2
      break;
    case 'DOUBLE':
      radius = 166;  // (162 + 170) / 2
      break;
    case 'SINGLE':
      radius = 134.5;  // アウターシングル (107 + 162) / 2
      break;
  }
  
  // セグメント角度を計算
  const angle = getSegmentAngle(number);
  
  // 極座標から直交座標へ変換
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  };
}

function getSegmentAngle(number: number): number {
  const index = SEGMENTS.indexOf(number);
  const SEGMENT_ANGLE = Math.PI * 2 / 20;
  const START_ANGLE = -Math.PI / 2;  // 20が真上
  return START_ANGLE + index * SEGMENT_ANGLE;
}
```

### UI設計: 2段階ボタン式

**方針**: モバイルフレンドリー、タップしやすいボタン配置

#### 第1段階: タイプ選択

```
┌────────┬────────┬────────┬────────┐
│ Single │ Double │ Triple │  Bull  │
└────────┴────────┴────────┴────────┘
```

- 横並びボタン
- アクティブ状態を視覚的に表示
- Bullを選択した場合、第2段階は非表示

#### 第2段階: 数字選択

セグメント配置順に配置（ダーツボード上の並び）：

```
┌────┬────┬────┬────┬────┐
│ 20 │  1 │ 18 │  4 │ 13 │
├────┼────┼────┼────┼────┤
│  6 │ 10 │ 15 │  2 │ 17 │
├────┼────┼────┼────┼────┤
│  3 │ 19 │  7 │ 16 │  8 │
├────┼────┼────┼────┼────┤
│ 11 │ 14 │  9 │ 12 │  5 │
└────┴────┴────┴────┴────┘
```

- 4行5列のグリッド
- 各ボタンは十分なタッチ領域
- アクティブ状態を視覚的に表示

#### インタラクション

```typescript
class TargetSelector {
  private selectedType: TargetType = 'TRIPLE';
  private selectedNumber: number = 20;
  
  selectType(type: TargetType): void {
    this.selectedType = type;
    
    // Bullの場合は数字選択を非表示
    if (type === 'BULL') {
      hideNumberSelector();
      this.selectedNumber = null;
    } else {
      showNumberSelector();
      if (this.selectedNumber === null) {
        this.selectedNumber = 20;  // デフォルト
      }
    }
    
    this.onTargetChange();
  }
  
  selectNumber(number: number): void {
    this.selectedNumber = number;
    this.onTargetChange();
  }
  
  getTarget(): Target {
    return {
      type: this.selectedType,
      number: this.selectedNumber,
      label: this.generateLabel()
    };
  }
  
  private generateLabel(): string {
    if (this.selectedType === 'BULL') return 'BULL';
    const prefix = this.selectedType[0];  // S, D, T
    return `${prefix}${this.selectedNumber}`;
  }
}
```

---

## 練習モード設計

### 統一パラメーター構造

**方針**: プリセットとカスタム設定で同じデータ構造を使用

**理由**:
- 設定の一貫性
- 将来の統計・ランキング機能での識別
- コードの保守性

**データ構造**:
```typescript
interface PracticeConfig {
  // 識別情報
  configId: string;           // 'preset-basic' or 'custom-xxxxx'
  configName: string;         // '基礎練習' 等
  description?: string;       // 説明文
  icon?: string;             // アイコン（絵文字等）
  
  // 練習パラメーター（4つの軸）
  throwUnit: 1 | 3;                    // 投擲単位
  questionType: 'score' | 'remaining' | 'both';  // 問う内容
  judgmentTiming: 'independent' | 'cumulative';  // 判定タイミング
  startingScore: number | null;        // 開始点数（501等）
  
  // ターゲット・難易度（ユーザー設定）
  target: Target;             // 狙う位置
  stdDevMM: number;          // 標準偏差
  
  // メタデータ
  isPreset: boolean;         // プリセットか
  createdAt?: string;        // 作成日時
  lastPlayedAt?: string;     // 最終プレイ日時
}
```

### 練習パラメーターの4軸

#### 1. throwUnit（投擲単位）
```
1: 1投ずつ問題を出題
3: 3投（1ラウンド）で問題を出題
```

#### 2. questionType（問う内容）
```
'score':     得点のみを問う
'remaining': 残り点数のみを問う
'both':      得点と残り点数の両方を問う
```

#### 3. judgmentTiming（判定タイミング）
```
'independent': 各投擲を独立して判定
'cumulative':  ラウンド内で累積判定
```

**独立判定の例（3投）**:
```
1本目: 60点 → 「60点ですか？」→ 判定
2本目: 20点 → 「20点ですか？」→ 判定
3本目: 5点  → 「5点ですか？」→ 判定
```

**累積判定の例（3投・得点）**:
```
1本目: 60点 → 「60点ですか？」→ 判定
2本目: 20点 → 「合計80点ですか？」→ 判定
3本目: 5点  → 「合計85点ですか？」→ 判定
```

**累積判定の例（3投・残り点数）**:
```
開始: 501
1本目: 60点 → 「残り441ですか？」→ 判定
2本目: 20点 → 「残り421ですか？」→ 判定
3本目: 5点  → 「残り416ですか？」→ 判定
```

#### 4. startingScore（開始点数）
```
501, 701, 301 など（01ゲーム用）
null（得点のみの練習の場合）
```

### プリセット5種

#### 1. 基礎練習 (preset-basic)
```typescript
{
  configId: 'preset-basic',
  configName: '基礎練習',
  description: '1投ごとに得点を計算',
  icon: '🎯',
  throwUnit: 1,
  questionType: 'score',
  judgmentTiming: 'independent',
  startingScore: null,
  isPreset: true
}
```

**シナリオ**: 
- 1投 → 得点入力 → 判定 → 次の1投

**対象**: 点数計算の基礎を学ぶ

---

#### 2. プレイヤー練習 (preset-player)
```typescript
{
  configId: 'preset-player',
  configName: 'プレイヤー練習',
  description: '残り点数を追いながら3投',
  icon: '🎮',
  throwUnit: 3,
  questionType: 'remaining',
  judgmentTiming: 'cumulative',
  startingScore: 501,
  isPreset: true
}
```

**シナリオ**:
```
開始: 501
1本目投擲 → 「残りは？」→ 判定
2本目投擲 → 「残りは？」→ 判定
3本目投擲 → 「残りは？」→ 判定
→ 次のラウンド
```

**対象**: 実際にプレイしている状況を再現

---

#### 3. コーラー基礎 (preset-caller-basic)
```typescript
{
  configId: 'preset-caller-basic',
  configName: 'コーラー基礎',
  description: '3投それぞれの得点を判定',
  icon: '📢',
  throwUnit: 3,
  questionType: 'score',
  judgmentTiming: 'independent',
  startingScore: null,
  isPreset: true
}
```

**シナリオ**:
```
3本投擲済み
「1本目は？」→ 判定
「2本目は？」→ 判定
「3本目は？」→ 判定
→ 次のラウンド
```

**対象**: 各投擲の得点を素早く判定する練習

---

#### 4. コーラー累積 (preset-caller-cumulative)
```typescript
{
  configId: 'preset-caller-cumulative',
  configName: 'コーラー累積',
  description: '3投の累積得点を計算',
  icon: '📊',
  throwUnit: 3,
  questionType: 'score',
  judgmentTiming: 'cumulative',
  startingScore: null,
  isPreset: true
}
```

**シナリオ**:
```
3本投擲済み
「1本目は？」→ 判定
「2本目までの合計は？」→ 判定
「3本目までの合計は？」→ 判定
→ 次のラウンド
```

**対象**: 累積得点の計算練習

---

#### 5. 総合練習 (preset-comprehensive)
```typescript
{
  configId: 'preset-comprehensive',
  configName: '総合練習',
  description: '得点と残り点数の両方を計算',
  icon: '💪',
  throwUnit: 3,
  questionType: 'both',
  judgmentTiming: 'cumulative',
  startingScore: 501,
  isPreset: true
}
```

**シナリオ**:
```
開始: 501
1本目投擲 → 「得点は？」→ 判定 → 「残りは？」→ 判定
2本目投擲 → 「得点は？」→ 判定 → 「残りは？」→ 判定
3本目投擲 → 「得点は？」→ 判定 → 「残りは？」→ 判定
→ 次のラウンド
```

**対象**: 最も高度な練習

---

### 詳細設定

ユーザーは各パラメーターを個別に調整可能：

**設定項目**:
1. **投擲単位**: 1投 / 3投
2. **問う内容**: 得点のみ / 残り点数のみ / 両方
3. **判定タイミング**: 独立 / 累積（3投の場合のみ表示）
4. **開始点数**: 501 / 701 / 301（残り点数を問う場合のみ表示）

**プリセット自動判定**:
- 詳細設定を変更すると、プリセットと一致するか自動判定
- 一致する場合: プリセット名を表示、configIdを設定
- 一致しない場合: 「カスタム設定」表示、configIdをハッシュ生成

```typescript
function findMatchingPreset(config: PracticeConfig): string | null {
  for (const [key, preset] of Object.entries(PRACTICE_PRESETS)) {
    if (
      config.throwUnit === preset.throwUnit &&
      config.questionType === preset.questionType &&
      config.judgmentTiming === preset.judgmentTiming &&
      config.startingScore === preset.startingScore
    ) {
      return key;
    }
  }
  return null;
}
```

### configId の生成

**プリセットの場合**:
```
'preset-basic'
'preset-player'
'preset-caller-basic'
'preset-caller-cumulative'
'preset-comprehensive'
```

**カスタムの場合**:
```typescript
function generateCustomId(config: PracticeConfig): string {
  const params = [
    config.throwUnit,
    config.questionType,
    config.judgmentTiming,
    config.startingScore
  ].join('-');
  
  // Base64エンコードして短縮
  return `custom-${btoa(params).substring(0, 8)}`;
}
```

**将来の用途**:
- 統計データの紐付け
- ランキングの分類
- 設定の共有・保存

---

## UI設計

### 画面構成

#### 1. 設定画面（Setup Screen）

**レイアウト**:
```
┌─────────────────────────────────┐
│      🎯 Darts Score Trainer     │
├─────────────────────────────────┤
│  クイックスタート（プリセット）   │
│  ┌────┬────┬────┬────┬────┐    │
│  │基礎│プレ│コラ│コラ│総合│    │
│  │練習│ヤー│基礎│累積│練習│    │
│  └────┴────┴────┴────┴────┘    │
│                                 │
│  詳細設定 ▼                     │
│  ├ 投擲単位: [1投][3投]         │
│  ├ 問う内容: [得点][残り][両方] │
│  ├ 判定: [独立][累積]           │
│  └ 開始点数: [501▼]            │
│                                 │
│  狙う位置                       │
│  ├ タイプ: [S][D][T][Bull]     │
│  └ 数字: [20][1][18][4]...     │
│                                 │
│  難易度                         │
│  [初心者][中級者][上級者][エキスパート]│
│  標準偏差: 30mm                 │
│                                 │
│  現在の設定: プレイヤー練習      │
│                                 │
│  [練習開始]                     │
└─────────────────────────────────┘
```

**コンポーネント**:
- PresetSelector
- DetailedSettings（折りたたみ可能）
- TargetSelector
- DifficultySelector
- 設定サマリー表示
- 開始ボタン

---

#### 2. 練習画面（Practice Screen）

**レイアウト**:
```
┌─────────────────────────────────┐
│  正解: 15 / 20  正答率: 75%     │
├─────────────────────────────────┤
│                                 │
│       ┌─────────────┐           │
│       │             │           │
│       │  ダーツ     │           │
│       │  ボード     │           │
│       │             │           │
│       └─────────────┘           │
│                                 │
├─────────────────────────────────┤
│  この投擲の得点は？              │
│                                 │
│  ┌─────────────┐               │
│  │     60  点  │               │
│  └─────────────┘               │
│                                 │
│  ┌───┬───┬───┐               │
│  │ 7 │ 8 │ 9 │               │
│  ├───┼───┼───┤               │
│  │ 4 │ 5 │ 6 │               │
│  ├───┼───┼───┤               │
│  │ 1 │ 2 │ 3 │               │
│  ├───┼───┼───┤               │
│  │ C │ 0 │ ⌫ │               │
│  └───┴───┴───┘               │
│                                 │
│     [確定]                      │
│                                 │
│  [設定に戻る] [終了]            │
└─────────────────────────────────┘
```

**コンポーネント**:
- StatsBar（統計バー）
- DartBoard（ボード表示）
- QuestionDisplay（問題文）
- NumPad（テンキー入力）
- Feedback（正誤フィードバック）
- ナビゲーションボタン

**フィードバック表示**:
```
┌─────────────────────┐
│   ✓ 正解！          │
│                     │
│   T20 → 60点        │
│   連続正解: 5回     │
└─────────────────────┘

┌─────────────────────┐
│   ✗ 不正解          │
│                     │
│   あなたの回答: 50  │
│   正解: 60          │
│   T20 → 60点        │
└─────────────────────┘
```

---

#### 3. 結果画面（Results Screen）

**レイアウト**:
```
┌─────────────────────────────────┐
│       練習結果                   │
├─────────────────────────────────┤
│                                 │
│   総問題数:      20問           │
│   正解数:        15問           │
│   正答率:        75%            │
│   連続正解記録:  7回            │
│                                 │
│   設定: プレイヤー練習           │
│   難易度: 中級者（30mm）        │
│   ターゲット: T20               │
│                                 │
├─────────────────────────────────┤
│                                 │
│   [同じ設定で再挑戦]            │
│   [設定を変更]                  │
│   [終了]                        │
│                                 │
└─────────────────────────────────┘
```

**コンポーネント**:
- SessionSummary（統計サマリー）
- アクションボタン

---

### テンキー入力UI

**レイアウト**: 3x4グリッド

```
┌─────────────┐
│   60  点    │  ← 入力表示エリア
└─────────────┘

┌───┬───┬───┐
│ 7 │ 8 │ 9 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
├───┼───┼───┤
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ C │ 0 │ ⌫ │
└───┴───┴───┘

  [確定]
```

**ボタン機能**:
- **0-9**: 数字入力
- **C**: クリア（全削除）
- **⌫**: バックスペース（1文字削除）
- **確定**: 回答を送信

**入力制限**:
- 最大3桁
- 先頭の0は入力不可

**キーボードサポート**:
- 数字キー: 0-9
- Backspace: 1文字削除
- Escape: クリア
- Enter: 確定

**モード別のラベル**:
- 得点モード: 「点」
- 残り点数モード: 「残り」

**実装**:
```typescript
class NumPad {
  private maxDigits = 3;
  private currentValue = '';
  
  handleKeyPress(value: string): void {
    if (value === 'clear') {
      this.currentValue = '';
    } else if (value === 'back') {
      this.currentValue = this.currentValue.slice(0, -1);
    } else if (value >= '0' && value <= '9') {
      if (this.currentValue.length < this.maxDigits) {
        // 先頭の0を防ぐ
        if (this.currentValue === '' && value === '0') return;
        this.currentValue += value;
      }
    }
    this.updateDisplay();
  }
  
  submit(): void {
    if (this.currentValue === '') return;
    const value = parseInt(this.currentValue);
    this.onSubmit(value);
    this.reset();
  }
}
```

**スタイリング**:
- 大きなタップエリア（モバイル対応）
- 視覚的フィードバック（押下時のアニメーション）
- 特殊キー（C, ⌫）は異なる色

---

### レスポンシブデザイン

**ブレークポイント**:
```css
/* スマートフォン */
@media (max-width: 600px) {
  /* ボタンサイズを調整 */
  /* フォントサイズを縮小 */
  /* レイアウトを縦に */
}

/* タブレット */
@media (min-width: 601px) and (max-width: 900px) {
  /* 中間サイズの調整 */
}

/* デスクトップ */
@media (min-width: 901px) {
  /* 横レイアウトの活用 */
}
```

**ボード描画のレスポンシブ**:
- CoordinateTransformが自動調整
- ウィンドウリサイズ時に再計算
- マージンを考慮した最大サイズ

---

## ゲームフロー

### 状態遷移

```
┌──────────┐
│  Setup   │  設定画面
└────┬─────┘
     │ [練習開始]
     ↓
┌──────────┐
│Practicing│  練習中
└────┬─────┘
     │ [終了]
     ↓
┌──────────┐
│ Results  │  結果画面
└────┬─────┘
     │ [戻る]
     ↓
   Setup
```

### 練習中のフロー

#### プレイヤーモード（1投・得点）
```
1. 投擲シミュレーション実行
   ↓
2. ボードに着弾点表示
   ↓
3. 「この投擲の得点は？」
   ↓
4. ユーザー入力
   ↓
5. 正誤判定・フィードバック
   ↓
6. [次の問題] → 1へ戻る
```

#### プレイヤーモード（3投・残り点数・累積）
```
開始点数: 501

1. 1本目投擲シミュレーション
   ↓
2. ボードに着弾点表示
   ↓
3. 「残り点数は？」
   ↓
4. ユーザー入力
   ↓
5. 正誤判定・フィードバック
   ↓
6. 2本目投擲シミュレーション
   ↓
7. ボードに2本目も追加表示
   ↓
8. 「残り点数は？」（累積後）
   ↓
9. ユーザー入力・判定
   ↓
10. 3本目も同様
   ↓
11. [次のラウンド] → 1へ戻る（残り点数引き継ぎ）
```

#### コーラーモード（3投・得点・独立）
```
1. 3本まとめて投擲シミュレーション
   ↓
2. ボードに3本の着弾点表示
   ↓
3. 「1本目の得点は？」
   ↓
4. ユーザー入力・判定
   ↓
5. 「2本目の得点は？」
   ↓
6. ユーザー入力・判定
   ↓
7. 「3本目の得点は？」
   ↓
8. ユーザー入力・判定
   ↓
9. [次の問題] → 1へ戻る
```

#### コーラーモード（3投・得点・累積）
```
1. 3本まとめて投擲シミュレーション
   ↓
2. ボードに3本の着弾点表示
   ↓
3. 「1本目の得点は？」
   ↓
4. ユーザー入力・判定
   ↓
5. 「2本目までの合計は？」
   ↓
6. ユーザー入力・判定
   ↓
7. 「3本目までの合計は？」
   ↓
8. ユーザー入力・判定
   ↓
9. [次の問題] → 1へ戻る
```

### 問題生成ロジック

```typescript
class QuizGenerator {
  static generate(config: PracticeConfig): Question {
    const throws: ThrowResult[] = [];
    
    // 投擲シミュレーション
    for (let i = 0; i < config.throwUnit; i++) {
      const result = executeThrow(config.target, config.stdDevMM);
      throws.push(result);
    }
    
    // 正解を計算
    let correctAnswer: number;
    
    if (config.questionType === 'score') {
      // 得点の合計
      correctAnswer = throws.reduce((sum, t) => sum + t.score, 0);
    } else if (config.questionType === 'remaining') {
      // 残り点数
      const totalScore = throws.reduce((sum, t) => sum + t.score, 0);
      correctAnswer = config.startingScore! - totalScore;
    }
    
    // 問題文生成
    const questionText = this.generateQuestionText(config);
    
    return {
      mode: config.questionType,
      throws: throws,
      correctAnswer: correctAnswer,
      questionText: questionText,
      startingScore: config.startingScore
    };
  }
}
```

---

## データ構造

### TypeScript型定義

完全な型定義は`TYPES.md`を参照。主要な型を抜粋：

```typescript
// 座標
interface Coordinates {
  x: number;
  y: number;
}

// ターゲット
type TargetType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'BULL';
interface Target {
  type: TargetType;
  number: number | null;
  label?: string;
}

// 投擲結果
interface ThrowResult {
  target: Target;
  landingPoint: Coordinates;  // 物理座標（mm）
  score: number;
}

// 練習設定
interface PracticeConfig {
  configId: string;
  configName: string;
  throwUnit: 1 | 3;
  questionType: 'score' | 'remaining' | 'both';
  judgmentTiming: 'independent' | 'cumulative';
  startingScore: number | null;
  target: Target;
  stdDevMM: number;
  isPreset: boolean;
}

// 問題
interface Question {
  mode: QuestionType;
  throws: ThrowResult[];
  correctAnswer: number;
  questionText: string;
  startingScore?: number;
}

// ゲーム状態
type GameState = 'setup' | 'practicing' | 'results';

// 統計
interface Stats {
  correct: number;
  total: number;
  currentStreak: number;
  bestStreak: number;
}
```

### Zustand Store

```typescript
interface GameStore {
  // 状態
  config: PracticeConfig;
  gameState: GameState;
  currentQuestion: Question | null;
  currentRound: number;
  userAnswer: number | null;
  stats: Stats;
  
  // アクション
  setConfig: (newConfig: Partial<PracticeConfig>) => void;
  setTarget: (target: Target) => void;
  setStdDev: (stdDevMM: number) => void;
  selectPreset: (presetId: string) => void;
  updateParameter: <K extends keyof PracticeConfig>(
    key: K, 
    value: PracticeConfig[K]
  ) => void;
  startPractice: () => void;
  generateQuestion: () => void;
  submitAnswer: (answer: number) => void;
  nextQuestion: () => void;
  endSession: () => void;
  resetToSetup: () => void;
}
```

---

## 実装計画

### フォルダ構成

```
darts-score-trainer/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   │
│   ├── types/
│   │   └── index.ts                   # 全型定義
│   │
│   ├── components/
│   │   ├── DartBoard/
│   │   │   ├── DartBoard.tsx
│   │   │   ├── P5Canvas.tsx
│   │   │   └── dartBoardRenderer.ts
│   │   ├── Settings/
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── PresetSelector.tsx
│   │   │   ├── TargetSelector.tsx
│   │   │   ├── DifficultySelector.tsx
│   │   │   └── DetailedSettings.tsx
│   │   ├── Practice/
│   │   │   ├── PracticeScreen.tsx
│   │   │   ├── QuestionDisplay.tsx
│   │   │   ├── NumPad.tsx
│   │   │   ├── Feedback.tsx
│   │   │   └── StatsBar.tsx
│   │   └── Results/
│   │       ├── ResultsScreen.tsx
│   │       └── SessionSummary.tsx
│   │
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   ├── usePracticeSession.ts
│   │   └── useScoreCalculator.ts
│   │
│   ├── stores/
│   │   └── gameStore.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── coordinateTransform.ts
│   │   ├── scoreCalculator.ts
│   │   ├── throwSimulator.ts
│   │   ├── targetCoordinates.ts
│   │   ├── quizGenerator.ts
│   │   └── presets.ts
│   │
│   └── styles/
│       └── index.css
│
└── public/
```

### 実装フェーズ

#### Phase 1: 基盤実装（最優先）
1. 型定義（`types/index.ts`）
2. 定数定義（`utils/constants.ts`）
3. 座標変換（`utils/coordinateTransform.ts`）
4. 点数計算（`utils/scoreCalculator.ts`）
5. 投擲シミュレーション（`utils/throwSimulator.ts`）
6. ターゲット座標（`utils/targetCoordinates.ts`）

#### Phase 2: ボード描画
7. p5.js移植（`components/DartBoard/dartBoardRenderer.ts`）
8. P5キャンバスラッパー（`components/DartBoard/P5Canvas.tsx`）
9. DartBoardコンポーネント（`components/DartBoard/DartBoard.tsx`）

#### Phase 3: 状態管理
10. Zustand Store（`stores/gameStore.ts`）
11. カスタムフック（`hooks/`）

#### Phase 4: 問題生成
12. プリセット定義（`utils/presets.ts`）
13. クイズジェネレーター（`utils/quizGenerator.ts`）

#### Phase 5: UI（設定画面）
14. プリセットセレクター
15. ターゲットセレクター
16. 難易度セレクター
17. 詳細設定
18. 設定パネル統合

#### Phase 6: UI（練習画面）
19. テンキー入力
20. 問題表示
21. フィードバック
22. 統計バー
23. 練習画面統合

#### Phase 7: UI（結果画面）
24. セッションサマリー
25. 結果画面

#### Phase 8: 統合
26. App.tsx
27. スタイリング
28. レスポンシブ対応

#### Phase 9: テスト・調整
29. 動作確認
30. バグフィックス
31. パフォーマンス最適化

#### Phase 10: デプロイ
32. ビルド確認
33. GitHub Pages設定
34. デプロイ

### 開発の優先順位

**最優先（MVP動作に必須）**:
1. Phase 1（基盤）
2. Phase 2（ボード描画）
3. Phase 3（状態管理）
4. Phase 4（問題生成）
5. Phase 5-7（UI）
6. Phase 8（統合）

**後回し可能**:
- ユニットテスト
- E2Eテスト
- 高度なアニメーション
- 統計グラフ
- オンライン機能

---

## 将来の拡張

### 統計・ランキング機能

**設計方針**:
- `configId`で設定を識別
- 同じ設定での練習結果を蓄積
- ランキング表示

**データ構造**:
```typescript
interface PracticeStats {
  configId: string;
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  bestStreak: number;
  playCount: number;
  lastPlayed: string;
  accuracy: number;  // 正答率
}
```

**保存方法**:
- **オフライン**: localStorage
- **オンライン**: サーバー連携（将来）

**ランキング**:
- 同じconfigIdでの比較
- 正答率、連続正解数などで順位付け

### 戦略サジェスト機能

**目的**: 残り点数と実力を考慮した最適な狙い位置を提案

**アルゴリズム**:
1. 現在の残り点数を取得
2. プレイヤーの標準偏差を考慮
3. 各ターゲットの期待値を計算
4. リスク・リターンを評価
5. 最適なターゲットを提案

**例**:
```
残り点数: 87
実力: 中級者（σ=30mm）

推奨:
1. T19 (期待値: 42.3)
   - 成功率: 68%
   - リスク: 低
2. T17 (期待値: 38.1)
   - 成功率: 72%
   - リスク: 極低
```

### 詳細な実力分析

**機能**:
- エリア別の精度分析
- 弱点エリアの特定
- 上達の可視化（グラフ）
- 練習履歴の記録

**分析項目**:
- トリプル成功率
- ダブル成功率
- ブル成功率
- セグメント別精度
- 経時変化

### オンライン機能

**機能案**:
- ユーザー登録・ログイン
- ランキング表示
- 対戦モード
- 設定の共有
- ソーシャル機能

**アーキテクチャ**:
- バックエンド: Node.js + Express
- データベース: PostgreSQL / MongoDB
- 認証: Firebase Auth / Auth0
- ホスティング: Vercel / Netlify + Supabase

**実装時期**: MVP完成後に検討

---

## 設定ファイル

### package.json

```json
{
  "name": "darts-score-trainer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "predeploy": "pnpm run build",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-p5": "^1.3.35",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/p5": "^1.7.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "gh-pages": "^6.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/darts-score-trainer/',  // GitHubリポジトリ名
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 主要な定数

### BOARD_PHYSICAL

```typescript
const BOARD_PHYSICAL = {
  rings: {
    innerBull: 3.175,      // mm
    outerBull: 7.95,       // mm
    tripleInner: 99,       // mm
    tripleOuter: 107,      // mm
    doubleInner: 162,      // mm
    doubleOuter: 170,      // mm
    boardEdge: 225         // mm
  },
  spider: {
    radialWidth: 1.5,      // mm
    circularWidth: 1.0     // mm
  },
  segments: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 
             3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
};
```

### TARGET_RADII

```typescript
const TARGET_RADII = {
  TRIPLE: 103,           // (99 + 107) / 2
  DOUBLE: 166,           // (162 + 170) / 2
  SINGLE_INNER: 53.475,  // (7.95 + 99) / 2
  SINGLE_OUTER: 134.5,   // (107 + 162) / 2
  BULL: 0
};
```

### DIFFICULTY_PRESETS

```typescript
const DIFFICULTY_PRESETS = {
  beginner:     { label: '初心者',     stdDevMM: 50 },
  intermediate: { label: '中級者',     stdDevMM: 30 },
  advanced:     { label: '上級者',     stdDevMM: 15 },
  expert:       { label: 'エキスパート', stdDevMM: 8 }
};
```

### PRACTICE_PRESETS

```typescript
const PRACTICE_PRESETS = {
  basic: {
    configId: 'preset-basic',
    configName: '基礎練習',
    throwUnit: 1,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: null
  },
  player: {
    configId: 'preset-player',
    configName: 'プレイヤー練習',
    throwUnit: 3,
    questionType: 'remaining',
    judgmentTiming: 'cumulative',
    startingScore: 501
  },
  callerBasic: {
    configId: 'preset-caller-basic',
    configName: 'コーラー基礎',
    throwUnit: 3,
    questionType: 'score',
    judgmentTiming: 'independent',
    startingScore: null
  },
  callerCumulative: {
    configId: 'preset-caller-cumulative',
    configName: 'コーラー累積',
    throwUnit: 3,
    questionType: 'score',
    judgmentTiming: 'cumulative',
    startingScore: null
  },
  comprehensive: {
    configId: 'preset-comprehensive',
    configName: '総合練習',
    throwUnit: 3,
    questionType: 'both',
    judgmentTiming: 'cumulative',
    startingScore: 501
  }
};
```

---

## 実装の注意点

### 座標系の一貫性
- **常に物理座標で計算**
- **描画時のみ画面座標に変換**
- 混同しないよう注意

### 型の厳密性
- `any`の使用は避ける
- 必要に応じてユニオン型を活用
- null/undefinedの扱いを明確に

### 状態管理
- 単一方向データフロー
- 状態の正規化
- 副作用の分離

### パフォーマンス
- p5.jsの描画最適化
- 不要な再レンダリングを防ぐ
- useMemo、useCallbackの活用

### レスポンシブ対応
- モバイルファーストで開発
- タッチイベントの考慮
- 画面サイズに応じたレイアウト調整

### テスト可能性
- ビジネスロジックとUIを分離
- 純粋関数を優先
- 依存性注入の考慮

---

## デプロイ手順

### 1. GitHubリポジトリ作成

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[username]/darts-score-trainer.git
git push -u origin main
```

### 2. GitHub Pagesにデプロイ

```bash
pnpm run deploy
```

### 3. 設定確認

GitHub リポジトリの Settings → Pages で以下を確認：
- Source: `gh-pages` branch
- URL: `https://[username].github.io/darts-score-trainer/`

---

## まとめ

この仕様書には、会話で決定したすべての内容が含まれています：

1. ✅ プロジェクト概要とMVPスコープ
2. ✅ 技術スタック（React + TypeScript + Vite + p5.js + Zustand）
3. ✅ ダーツボード仕様（13.2インチスティールチップ、全寸法）
4. ✅ 座標系設計（物理座標系と画面座標系の分離）
5. ✅ 座標→点数変換ロジック（スパイダー処理含む）
6. ✅ 投擲シミュレーション（正規分布、難易度プリセット）
7. ✅ ターゲット選択（61通り、2段階ボタン式UI）
8. ✅ 練習モード設計（統一パラメーター、プリセット5種）
9. ✅ UI設計（3画面、テンキー入力、レスポンシブ）
10. ✅ ゲームフロー（各モードの詳細フロー）
11. ✅ データ構造（全型定義）
12. ✅ 実装計画（10フェーズ、フォルダ構成）
13. ✅ 将来の拡張（統計、戦略サジェスト、オンライン機能）

すべての設計決定が網羅されており、実装に必要な情報が揃っています。

---

## 追加仕様（詳細決定事項）

以下は仕様レビュー時に追加で決定した詳細事項です。

### セッション終了条件

#### 終了モード
2つの終了モードを用意：

1. **問題数選択モード**
   - 選択肢: 10問、20問、50問、100問
   - クリアにかかった時間も記録

2. **時間制限モード**
   - 選択肢: 3分、5分、10分
   - 時間内に解いた問題数を記録
   - **時間切れで即終了**（問題途中でも終了）

どちらのモードでも手動終了ボタンあり。

#### 01ゲーム終了時
- 0点に到達したらセッション終了（1ゲーム完走扱い）

---

### 01ゲームルール

#### ダブルアウト
- **採用**: 最後はダブルで上がる必要あり
- 将来的にストレートアウト（シングルアウト）オプションを追加可能

#### バスト処理
- **採用**: 以下の場合はバスト（そのラウンドは無効、残り点数は変わらず）
  - 残り点数を超えた得点を取った場合
  - ダブルで上がれない点数になった場合（残り1点など）

---

### 3投モードの表示仕様

#### ダーツの色分け
- 1本目、2本目、3本目を異なる色で表示
- ボード外に凡例を表示（例: ● 1本目 ● 2本目 ● 3本目）

#### プレイヤーモード（1本ずつ投擲）
- ダーツは**残したまま追加表示**
- 最終的に3本すべてが見える状態

#### コーラーモード（3本同時投擲）
- 3本同時に表示
- 色分けで何本目かを識別

---

### エラーハンドリング

#### 入力バリデーション
- あり得ない点数は**入力を受け付けない**
  - 1投で181点以上
  - 得点として存在しない値（例: 179点）
  - 残り点数でマイナス値
- 確定ボタンを無効化、または警告表示

#### ブラウザリロード時
- **途中経過は失われる**（最初からやり直し）
- 特別な警告ダイアログは表示しない

---

### フィードバック・画面遷移

#### 正誤フィードバック後の遷移
- **ボタンクリックで次へ**進む
- 自動遷移はしない（ユーザーが確認してから進む）

---

### 「両方を問う」モード（questionType: 'both'）

#### 判定ロジック
- 得点と残り点数は**独立して判定**
- 得点を間違えても、残り点数の質問は続ける
- それぞれの正誤を個別にカウント

#### 入力UI
- **1つのテンキーを使い回す**
- フロー: 得点入力 → 確定 → 残り点数入力 → 確定

---

### アクセシビリティ

#### 色覚多様性への配慮
- 色だけでなく**アイコン・テキストも併用**
  - 正解: ✓マーク + 「正解」テキスト + 緑系の色
  - 不正解: ✗マーク + 「不正解」テキスト + 赤系の色
  - 3投の色分け: 色に加えて番号（1, 2, 3）も表示

#### 言語
- **日本語のみ**（MVP）
- i18n対応は将来検討

---

### ダーツマーカー仕様

#### 形状
- **円（ドット）** - シンプルな丸い点

#### サイズ
- ボードサイズに対する**相対的な割合**で調整
- 実装時に視認性を確認しながらチューニング

#### アニメーション
- **なし** - 即時表示（アニメーションは将来検討）

---

### localStorage仕様

#### 保存する内容
- **設定のみ**
  - 難易度（標準偏差）
  - ターゲット
  - 練習モード設定
  - 終了条件（問題数/時間）
- セッション統計は保存しない（MVP）

#### 保存タイミング
- **設定変更時に即保存**

#### バージョン管理
- **なし**
- データ構造が互換性なくなった場合はリセット

#### キー名
```typescript
const STORAGE_KEY = 'darts-score-trainer-settings';
```

---

### シングルの狙い位置

#### MVPでの仕様
- **アウターシングルのみ**（半径134.5mm）
- インナーシングル選択オプションは将来検討

---

### 定数追加

```typescript
// セッション終了条件
const SESSION_QUESTION_COUNTS = [10, 20, 50, 100];
const SESSION_TIME_LIMITS = [3, 5, 10];  // 分

// ダーツマーカーの色
const DART_COLORS = {
  first: '#FF6B6B',   // 1本目: 赤系
  second: '#4ECDC4',  // 2本目: 青緑系
  third: '#FFE66D'    // 3本目: 黄系
};

// フィードバック表示
const FEEDBACK_ICONS = {
  correct: '✓',
  incorrect: '✗'
};
```

---

### 型定義追加

```typescript
// セッション設定
interface SessionConfig {
  mode: 'questions' | 'time';
  questionCount?: 10 | 20 | 50 | 100;  // 問題数モード
  timeLimit?: 3 | 5 | 10;              // 時間制限モード（分）
}

// セッション結果
interface SessionResult {
  config: PracticeConfig;
  sessionConfig: SessionConfig;
  stats: Stats;
  elapsedTime: number;        // 経過時間（秒）
  completedAt: string;        // 完了日時
  finishReason: 'completed' | 'timeout' | 'manual' | 'game_finished';
}

// バスト情報
interface BustInfo {
  isBust: boolean;
  reason?: 'over_score' | 'no_double_out';  // 超過 or ダブルアウト不可
}
```

---

### ゲームフロー補足

#### バスト発生時のフロー
```
1. ユーザーが回答を入力
   ↓
2. 正誤判定
   ↓
3. バスト判定（残り点数モードの場合）
   - 残り点数 < 0 → バスト
   - 残り点数 == 1 → バスト（ダブルで上がれない）
   - 残り点数 == 0 かつ 最後がダブルでない → バスト
   ↓
4. バストの場合:
   - 「バスト！」と表示
   - 残り点数をラウンド開始時に戻す
   - 次のラウンドへ
   ↓
5. 正常終了（0点）の場合:
   - 「ゲームクリア！」と表示
   - セッション終了 → 結果画面へ
```

#### 時間切れ時のフロー
```
1. タイマーが0になる
   ↓
2. 即座にセッション終了
   ↓
3. 結果画面へ（途中の問題は未回答扱い）
```
