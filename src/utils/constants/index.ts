/**
 * Darts Score Trainer - 定数定義
 *
 * このファイルはプロジェクト全体で使用するすべての定数を再エクスポートします。
 * 各定数は個別のファイルで管理されており、ここで一括エクスポートしています。
 */

// ダーツボード物理仕様
export { BOARD_PHYSICAL } from './boardPhysical.js';
// 難易度・セッション設定
export { CHECKOUT_RANGES, CHECKOUT_TABLE } from './checkoutTable.js';
// UI表示設定
export { DART_COLORS } from './dartColors.js';
export { DART_MARKER_RADII } from './dartMarkerRadii.js';
export { DART_MARKER_TEXT_SIZE } from './dartMarkerTextSize.js';
export { DEFAULT_TARGET } from './defaultTargets.js';
export { DIFFICULTY_PRESETS } from './difficultyPresets.js';
export { FEEDBACK_ICONS } from './feedbackIcons.js';
export { ONE_DART_FINISHABLE } from './finishableScores.js';
export {
  CHECKOUT_MAX_SINGLE_DART_SCORE,
  CHECKOUT_MIN_SCORE,
  IMPOSSIBLE_FINISH_SCORE,
  MIN_FINISHABLE_SCORE,
  MIN_SCORE,
} from './gameRules.js';
export { MAX_INPUT_DIGITS } from './inputValidation.js';
export { LEGEND_LAYOUT, LEGEND_TEXT_SIZE } from './legendLayout.js';
export { SEGMENT_ANGLE } from './segmentAngle.js';
export { SEGMENT_NUMBER_TEXT_SIZE } from './segmentNumberTextSize.js';
export { MAX_SEGMENT_NUMBER, MIN_SEGMENT_NUMBER, SEGMENTS } from './segments.js';
export { SESSION_QUESTION_COUNTS } from './sessionQuestionCounts.js';
export { SESSION_TIME_LIMITS } from './sessionTimeLimits.js';
// ストレージ
export { STORAGE_KEY } from './storageKey.js';
export { TARGET_RADII } from './targetRadii.js';
// タイマー
export { TIMER_INTERVAL_MS } from './timerInterval.js';
