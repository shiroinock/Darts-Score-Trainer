import { describe, expect, test } from 'vitest';
import { SEGMENTS } from '../constants/index.js';
import { coordinateToScore } from './coordinateToScore.js';
import { coordinateToScoreDetail } from './coordinateToScoreDetail.js';

describe('coordinateToScoreDetail', () => {
  describe('正常系 - 詳細情報の取得', () => {
    test('中心（0, 0）は50点、INNER_BULL、セグメント不定を返す', () => {
      // Arrange
      const x = 0;
      const y = 0;

      // Act
      const result = coordinateToScoreDetail(x, y);

      // Assert
      expect(result.score).toBe(50);
      expect(result.ring).toBe('INNER_BULL');
      // BULLの場合、セグメント番号は定義されない（または特定の値）
    });

    test('トリプル20の位置（0, -103）は60点、TRIPLE、セグメント20を返す', () => {
      // Arrange
      const x = 0;
      const y = -103;

      // Act
      const result = coordinateToScoreDetail(x, y);

      // Assert
      expect(result.score).toBe(60);
      expect(result.ring).toBe('TRIPLE');
      expect(result.segmentNumber).toBe(20);
    });

    test('ダブル16の位置を適切に返す', () => {
      // Arrange
      // セグメント16は時計の7時方向付近
      // 角度を計算: セグメント配置から16の位置を特定
      const segmentIndex = SEGMENTS.indexOf(16);
      const angleOffset = (segmentIndex * Math.PI) / 10; // 各セグメント18度
      const x = 166 * Math.sin(angleOffset);
      const y = -166 * Math.cos(angleOffset);

      // Act
      const result = coordinateToScoreDetail(x, y);

      // Assert
      expect(result.score).toBe(32);
      expect(result.ring).toBe('DOUBLE');
      expect(result.segmentNumber).toBe(16);
    });

    test('シングル5の位置を適切に返す', () => {
      // Arrange
      // セグメント5は時計の11時方向
      const segmentIndex = SEGMENTS.indexOf(5);
      const angleOffset = (segmentIndex * Math.PI) / 10;
      const x = 50 * Math.sin(angleOffset);
      const y = -50 * Math.cos(angleOffset);

      // Act
      const result = coordinateToScoreDetail(x, y);

      // Assert
      expect(result.score).toBe(5);
      expect(result.ring).toBe('INNER_SINGLE');
      expect(result.segmentNumber).toBe(5);
    });
  });

  describe('境界値 - ボード外', () => {
    test('ボード外（0, -300）は0点、OUT、セグメント不定を返す', () => {
      // Arrange
      const x = 0;
      const y = -300;

      // Act
      const result = coordinateToScoreDetail(x, y);

      // Assert
      expect(result.score).toBe(0);
      expect(result.ring).toBe('OUT');
    });
  });

  describe('エッジケース - 往復変換の一貫性', () => {
    test('coordinateToScore()と同じ点数を返す', () => {
      // Arrange
      const x = 103;
      const y = -103;

      // Act
      const score = coordinateToScore(x, y);
      const detail = coordinateToScoreDetail(x, y);

      // Assert
      expect(detail.score).toBe(score);
    });
  });
});
