/**
 * Darts Score Trainer - 点数計算モジュール
 *
 * このファイルは物理座標から点数を計算する関数を再エクスポートします。
 * すべての座標は物理座標（mm単位）で処理されます。
 */

export { adjustForSpider } from './adjustForSpider.js';
export { calculateScore } from './calculateScore.js';
export { coordinateToScore } from './coordinateToScore.js';
export { coordinateToScoreDetail } from './coordinateToScoreDetail.js';
export { getRing } from './getRing.js';
export { getScoreLabel } from './getScoreLabel.js';
export { getSegmentNumber } from './getSegmentNumber.js';
