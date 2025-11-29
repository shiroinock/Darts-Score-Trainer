/**
 * Darts Score Trainer - TypeScript型定義
 *
 * このファイルにはプロジェクトで使用するすべての型定義が含まれています。
 * 座標系の分離、練習設定、問題生成、ゲーム状態管理など、
 * アプリケーション全体で使用される型を定義しています。
 */

/**
 * 座標を表すインターフェース
 *
 * 物理座標（mm単位）または画面座標（ピクセル単位）を表現します。
 * 使用する文脈に応じて単位が異なることに注意してください。
 */
export interface Coordinates {
  /** X座標（物理座標の場合はmm、画面座標の場合はピクセル） */
  x: number;
  /** Y座標（物理座標の場合はmm、画面座標の場合はピクセル） */
  y: number;
}

/**
 * ダーツボードのリング種類
 */
export type RingType =
  | 'INNER_BULL'      // インナーブル（50点）
  | 'OUTER_BULL'      // アウターブル（25点）
  | 'TRIPLE'          // トリプルリング（3倍）
  | 'DOUBLE'          // ダブルリング（2倍）
  | 'INNER_SINGLE'    // 内側シングルエリア（1倍）
  | 'OUTER_SINGLE'    // 外側シングルエリア（1倍）
  | 'OUT';            // ボード外（0点）

/**
 * ターゲットの種類
 */
export type TargetType =
  | 'SINGLE'   // シングル
  | 'DOUBLE'   // ダブル
  | 'TRIPLE'   // トリプル
  | 'BULL';    // ブル

/**
 * ターゲット情報
 *
 * プレイヤーが狙う位置を表現します。
 */
export interface Target {
  /** ターゲットの種類 */
  type: TargetType;
  /** セグメント番号（1-20）。Bullの場合はnull */
  number: number | null;
  /** 表示用ラベル（例: "T20", "D16", "BULL"） */
  label?: string;
}

/**
 * 投擲結果
 *
 * 1本のダーツの投擲結果を表現します。
 * 物理座標での着地点、得点、詳細情報を含みます。
 */
export interface ThrowResult {
  /** 狙ったターゲット */
  target: Target;
  /** 着地点の物理座標（mm単位） */
  landingPoint: Coordinates;
  /** 獲得した点数 */
  score: number;
  /** 着地したリング種類（詳細情報用、オプション） */
  ring?: RingType;
  /** 着地したセグメント番号（1-20、詳細情報用、オプション） */
  segmentNumber?: number;
}

/**
 * 問題タイプ
 *
 * 練習時に何を問うかを指定します。
 */
export type QuestionType =
  | 'score'      // 得点を問う
  | 'remaining'  // 残り点数を問う
  | 'both';      // 両方問う

/**
 * 判定タイミング
 *
 * 複数投の投擲時に、どのタイミングで判定を行うかを指定します。
 */
export type JudgmentTiming =
  | 'independent'  // 各投擲を独立して判定
  | 'cumulative';  // 累積で判定

/**
 * 練習設定
 *
 * 練習セッションのすべての設定を含む中核的な型定義です。
 * プリセットとカスタム設定の両方に対応しています。
 */
export interface PracticeConfig {
  // 識別情報
  /** 設定ID（プリセット: 'preset-xxx'、カスタム: 'custom-xxxxx'） */
  configId: string;
  /** 設定名（例: '基礎練習'、'プレイヤー練習'） */
  configName: string;
  /** 説明文（オプション） */
  description?: string;
  /** アイコン（絵文字等、オプション） */
  icon?: string;

  // 練習パラメーター（4つの軸）
  /** 投擲単位（1投 or 3投） */
  throwUnit: 1 | 3;
  /** 問う内容 */
  questionType: QuestionType;
  /** 判定タイミング */
  judgmentTiming: JudgmentTiming;
  /** 開始点数（501等、nullの場合は開始点数なし） */
  startingScore: number | null;

  // ターゲット・難易度
  /** 狙う位置 */
  target: Target;
  /** 標準偏差（mm単位、散らばりの大きさ） */
  stdDevMM: number;

  // メタデータ
  /** プリセット設定かどうか */
  isPreset: boolean;
  /** 作成日時（ISO 8601形式、オプション） */
  createdAt?: string;
  /** 最終プレイ日時（ISO 8601形式、オプション） */
  lastPlayedAt?: string;
}

/**
 * セッション設定
 *
 * 練習セッションの実行条件（問題数 or 時間制限）を指定します。
 */
export interface SessionConfig {
  /** セッションモード */
  mode: 'questions' | 'time';
  /** 問題数（questionsモードの場合） */
  questionCount?: 10 | 20 | 50 | 100;
  /** 時間制限（分、timeモードの場合） */
  timeLimit?: 3 | 5 | 10;
}

/**
 * 問題データ
 *
 * 1つの問題を表現します。
 * 投擲結果と正解、問題文を含みます。
 */
export interface Question {
  /** 問題モード */
  mode: QuestionType;
  /** 投擲結果の配列（1投 or 3投） */
  throws: ThrowResult[];
  /** 正解の数値 */
  correctAnswer: number;
  /** 問題文（表示用） */
  questionText: string;
  /** 開始点数（remainingモードの場合） */
  startingScore?: number;
}

/**
 * ゲーム状態
 *
 * アプリケーションの現在の状態を表します。
 */
export type GameState =
  | 'setup'       // 設定画面
  | 'practicing'  // 練習中
  | 'results';    // 結果表示

/**
 * 統計情報
 *
 * セッション中の正答率や連続正解数を追跡します。
 */
export interface Stats {
  /** 正解数 */
  correct: number;
  /** 総問題数 */
  total: number;
  /** 現在の連続正解数 */
  currentStreak: number;
  /** 最高連続正解数 */
  bestStreak: number;
}

/**
 * セッション結果
 *
 * 練習セッション終了時の完全な結果データです。
 */
export interface SessionResult {
  /** 使用した練習設定 */
  config: PracticeConfig;
  /** 使用したセッション設定 */
  sessionConfig: SessionConfig;
  /** 統計情報 */
  stats: Stats;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** 完了日時（ISO 8601形式） */
  completedAt: string;
  /** 終了理由 */
  finishReason: 'completed' | 'timeout' | 'manual' | 'game_finished';
}

/**
 * バスト情報
 *
 * 01ゲームにおけるバスト判定の結果を保持します。
 */
export interface BustInfo {
  /** バストしたかどうか */
  isBust: boolean;
  /** バストの理由（バストした場合のみ） */
  reason: 'over' | 'finish_impossible' | 'double_out_required' | null;
}
