/**
 * プレイヤーの実力レベル別の標準偏差設定
 *
 * 投擲シミュレーションで使用する散らばり（標準偏差）をmm単位で定義します。
 * 値が小さいほど精度が高く、ターゲットに近い位置に着弾します。
 */
export const DIFFICULTY_PRESETS = {
  beginner: {
    label: '初心者',
    stdDevMM: 50, // 初心者レベルの標準偏差（広い散らばり）
  },
  intermediate: {
    label: '中級者',
    stdDevMM: 30, // 中級者レベルの標準偏差
  },
  advanced: {
    label: '上級者',
    stdDevMM: 15, // 上級者レベルの標準偏差
  },
  expert: {
    label: 'エキスパート',
    stdDevMM: 8, // エキスパートレベルの標準偏差（狭い散らばり）
  },
} as const;
