/**
 * クイズジェネレーター
 *
 * 練習設定に基づいてクイズ問題を生成する関数群。
 * 投擲シミュレーション、問題文生成、正解計算を担当。
 */

import type { PracticeConfig } from '../types/PracticeConfig';
import type { Question } from '../types/Question';
import type { ThrowResult } from '../types/ThrowResult';
import { DEFAULT_TARGET } from './constants/defaultTargets';
import { coordinateToScore } from './scoreCalculator/coordinateToScore';
import { getRing } from './scoreCalculator/getRing';
import { getSegmentNumber } from './scoreCalculator/getSegmentNumber';
import { getTargetCoordinates } from './targetCoordinates/getTargetCoordinates';
import { simulateThrow } from './throwSimulator/simulateThrow';

/**
 * 練習設定と残り点数から1問のクイズを生成する
 *
 * @param config - 練習設定
 * @param remainingScore - 現在の残り点数（remainingモードの場合は必須、それ以外はnull）
 * @returns 生成されたクイズ問題
 * @throws {Error} 入力が不正な場合
 */
export function generateQuestion(config: PracticeConfig, remainingScore: number | null): Question {
  // バリデーション: throwUnit
  if (config.throwUnit !== 1 && config.throwUnit !== 3) {
    throw new Error('throwUnit must be 1 or 3');
  }

  // バリデーション: stdDevMM
  if (!Number.isFinite(config.stdDevMM)) {
    throw new Error('stdDevMM must be a finite number');
  }
  if (config.stdDevMM < 0) {
    throw new Error('stdDevMM must be non-negative');
  }

  // バリデーション: remainingモードの場合、startingScoreとremainingScoreが必要
  if (config.questionType === 'remaining' || config.questionType === 'both') {
    if (config.startingScore === null) {
      throw new Error('startingScore is required for remaining or both mode');
    }
    if (remainingScore === null) {
      throw new Error('remainingScore is required for remaining or both mode');
    }
  }

  // TODO: Phase 4.3 - 残り点数から最適なターゲットを自動選択
  // 現在は暫定的にT20をデフォルトターゲットとして使用
  const target = config.target ?? DEFAULT_TARGET;

  // ターゲット座標を取得
  const targetCoords = getTargetCoordinates(target.type, target.number);

  // 投擲結果を生成
  const throws: ThrowResult[] = [];
  for (let i = 0; i < config.throwUnit; i++) {
    // 投擲をシミュレーション
    const landingPoint = simulateThrow(targetCoords.x, targetCoords.y, config.stdDevMM);

    // 着地点から点数を計算
    const distance = Math.sqrt(landingPoint.x * landingPoint.x + landingPoint.y * landingPoint.y);
    const angle = Math.atan2(landingPoint.x, -landingPoint.y);
    const ring = getRing(distance);
    const segmentNumber = getSegmentNumber(angle);
    const score = coordinateToScore(landingPoint.x, landingPoint.y);

    // 投擲結果を追加
    throws.push({
      target,
      landingPoint,
      score,
      ring,
      segmentNumber,
    });
  }

  // 累積判定かどうかを判定
  const isCumulative = config.judgmentTiming === 'cumulative';

  // 問題文を生成（最初の投擲の問題文を使用）
  const FIRST_THROW_INDEX = 0;
  const questionText = generateQuestionText(config, FIRST_THROW_INDEX, isCumulative);

  // 正解を計算（最初の投擲の正解を使用）
  const correctAnswer = calculateCorrectAnswer(throws, config, FIRST_THROW_INDEX, remainingScore);

  // Questionオブジェクトを構築
  const question: Question = {
    mode: config.questionType,
    throws,
    correctAnswer,
    questionText,
  };

  // remainingモードまたはbothモードの場合、startingScoreを含める
  if (config.questionType === 'remaining' || config.questionType === 'both') {
    question.startingScore = config.startingScore ?? undefined;
  }

  return question;
}

/**
 * 1投モードの問題文を生成する（ヘルパー関数）
 */
function generateSingleThrowQuestionText(questionType: string): string {
  if (questionType === 'score') {
    return 'この投擲の得点は？';
  }
  if (questionType === 'remaining') {
    return 'この投擲後の残り点数は？';
  }
  if (questionType === 'both') {
    return 'この投擲の得点と残り点数は？';
  }
  throw new Error('Invalid question type');
}

/**
 * 3投モードの問題文を生成する（ヘルパー関数）
 */
function generateMultiThrowQuestionText(
  questionType: string,
  throwNumber: number,
  isCumulative: boolean
): string {
  if (questionType === 'score') {
    return isCumulative ? `${throwNumber}本目までの合計得点は？` : `${throwNumber}本目の得点は？`;
  }
  if (questionType === 'remaining') {
    return `${throwNumber}本目投擲後の残り点数は？`;
  }
  if (questionType === 'both') {
    return isCumulative
      ? `${throwNumber}本目までの得点と残り点数は？`
      : `${throwNumber}本目の得点と残り点数は？`;
  }
  throw new Error('Invalid question type');
}

/**
 * 投擲インデックスと設定から問題文を生成する
 *
 * @param config - 練習設定
 * @param throwIndex - 投擲インデックス（0-2）
 * @param isCumulative - 累積判定かどうか
 * @returns 問題文
 * @throws {Error} 入力が不正な場合
 */
export function generateQuestionText(
  config: PracticeConfig,
  throwIndex: number,
  isCumulative: boolean
): string {
  // バリデーション: throwIndex
  if (!Number.isFinite(throwIndex) || !Number.isInteger(throwIndex)) {
    throw new Error('throwIndex must be an integer');
  }
  if (throwIndex < 0) {
    throw new Error('throwIndex must be non-negative');
  }
  if (throwIndex >= config.throwUnit) {
    throw new Error(`throwIndex must be less than throwUnit (${config.throwUnit})`);
  }

  // 1投モードの場合
  if (config.throwUnit === 1) {
    return generateSingleThrowQuestionText(config.questionType);
  }

  // 3投モードの場合
  if (config.throwUnit === 3) {
    const throwNumber = throwIndex + 1;
    return generateMultiThrowQuestionText(config.questionType, throwNumber, isCumulative);
  }

  throw new Error('Invalid configuration');
}

/**
 * 0投目からthrowIndexまでの累積得点を計算する（ヘルパー関数）
 */
function calculateCumulativeScore(throws: ThrowResult[], throwIndex: number): number {
  let totalScore = 0;
  for (let i = 0; i <= throwIndex; i++) {
    totalScore += throws[i].score;
  }
  return totalScore;
}

/**
 * scoreモードの正解を計算する（ヘルパー関数）
 */
function calculateScoreModeAnswer(
  throws: ThrowResult[],
  throwIndex: number,
  isCumulative: boolean
): number {
  return isCumulative ? calculateCumulativeScore(throws, throwIndex) : throws[throwIndex].score;
}

/**
 * remainingモードの正解を計算する（ヘルパー関数）
 */
function calculateRemainingModeAnswer(
  throws: ThrowResult[],
  throwIndex: number,
  previousRemaining: number,
  isCumulative: boolean
): number {
  if (isCumulative) {
    const totalScore = calculateCumulativeScore(throws, throwIndex);
    return previousRemaining - totalScore;
  }
  return previousRemaining - throws[throwIndex].score;
}

/**
 * 投擲結果と設定から正解を計算する
 *
 * @param throws - 投擲結果の配列
 * @param config - 練習設定
 * @param throwIndex - 投擲インデックス（0-2）
 * @param previousRemaining - 前回の残り点数（remainingモードの場合は必須）
 * @returns 正解の数値
 * @throws {Error} 入力が不正な場合
 */
export function calculateCorrectAnswer(
  throws: ThrowResult[],
  config: PracticeConfig,
  throwIndex: number,
  previousRemaining: number | null
): number {
  // バリデーション: throws
  if (!Array.isArray(throws) || throws.length === 0) {
    throw new Error('throws must be a non-empty array');
  }

  // バリデーション: throwIndex
  if (!Number.isFinite(throwIndex) || !Number.isInteger(throwIndex)) {
    throw new Error('throwIndex must be an integer');
  }
  if (throwIndex < 0 || throwIndex >= throws.length) {
    throw new Error(`throwIndex must be between 0 and ${throws.length - 1}`);
  }

  // バリデーション: remainingモードの場合、previousRemainingが必要
  const isRemainingMode = config.questionType === 'remaining' || config.questionType === 'both';
  if (isRemainingMode && previousRemaining === null) {
    throw new Error('previousRemaining is required for remaining or both mode');
  }

  const isCumulative = config.judgmentTiming === 'cumulative';

  // 得点モード
  if (config.questionType === 'score') {
    return calculateScoreModeAnswer(throws, throwIndex, isCumulative);
  }

  // 残り点数モード
  if (config.questionType === 'remaining') {
    // previousRemainingは既にLine 247-248で検証済み
    return calculateRemainingModeAnswer(throws, throwIndex, previousRemaining!, isCumulative);
  }

  // bothモード（得点を返す）
  if (config.questionType === 'both') {
    return calculateScoreModeAnswer(throws, throwIndex, isCumulative);
  }

  throw new Error('Invalid question type');
}
