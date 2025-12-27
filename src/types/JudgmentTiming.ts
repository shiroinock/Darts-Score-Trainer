/**
 * 判定タイミング
 *
 * 複数投の投擲時に、どのタイミングで判定を行うかを指定します。
 */
export type JudgmentTiming =
  | 'independent' // 各投擲を独立して判定
  | 'cumulative'; // 累積で判定
