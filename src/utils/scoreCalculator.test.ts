import { describe, test, expect } from 'vitest';
import {
  getRing,
  getSegmentNumber,
  calculateScore,
  coordinateToScore,
  coordinateToScoreDetail,
  adjustForSpider,
  getScoreLabel
} from './scoreCalculator';
import { BOARD_PHYSICAL, SEGMENTS } from './constants';
import type { RingType } from '../types';

describe('scoreCalculator', () => {
  describe('getRing', () => {
    describe('正常系 - BULL エリア', () => {
      test('中心（0mm）はINNER_BULLを返す', () => {
        // Arrange
        const distance = 0;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('INNER_BULL');
      });

      test('インナーブル境界内（3mm）はINNER_BULLを返す', () => {
        // Arrange
        const distance = 3;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('INNER_BULL');
      });

      test('アウターブル内（10mm）はOUTER_BULLを返す', () => {
        // Arrange
        const distance = 10;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUTER_BULL');
      });
    });

    describe('境界値 - インナーブル/アウターブル境界', () => {
      test('ちょうど6.35mmはOUTER_BULLを返す', () => {
        // Arrange
        const distance = BOARD_PHYSICAL.rings.innerBull; // 6.35mm

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUTER_BULL');
      });
    });

    describe('境界値 - アウターブル/シングル境界', () => {
      test('ちょうど16mmはINNER_SINGLEを返す', () => {
        // Arrange
        const distance = BOARD_PHYSICAL.rings.outerBull; // 16mm

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('INNER_SINGLE');
      });
    });

    describe('正常系 - INNER_SINGLE エリア', () => {
      test('内側シングルエリア中央（50mm）はINNER_SINGLEを返す', () => {
        // Arrange
        const distance = 50;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('INNER_SINGLE');
      });

      test('トリプル境界手前（98mm）はINNER_SINGLEを返す', () => {
        // Arrange
        const distance = 98;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('INNER_SINGLE');
      });
    });

    describe('境界値 - シングル/トリプル境界', () => {
      test('ちょうど99mmはTRIPLEを返す', () => {
        // Arrange
        const distance = BOARD_PHYSICAL.rings.tripleInner; // 99mm

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('TRIPLE');
      });
    });

    describe('正常系 - TRIPLE エリア', () => {
      test('トリプルリング中央（103mm）はTRIPLEを返す', () => {
        // Arrange
        const distance = 103;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('TRIPLE');
      });

      test('トリプル境界手前（106mm）はTRIPLEを返す', () => {
        // Arrange
        const distance = 106;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('TRIPLE');
      });
    });

    describe('境界値 - トリプル/外側シングル境界', () => {
      test('ちょうど107mmはOUTER_SINGLEを返す', () => {
        // Arrange
        const distance = BOARD_PHYSICAL.rings.tripleOuter; // 107mm

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUTER_SINGLE');
      });
    });

    describe('正常系 - OUTER_SINGLE エリア', () => {
      test('外側シングルエリア中央（134mm）はOUTER_SINGLEを返す', () => {
        // Arrange
        const distance = 134;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUTER_SINGLE');
      });

      test('ダブル境界手前（161mm）はOUTER_SINGLEを返す', () => {
        // Arrange
        const distance = 161;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUTER_SINGLE');
      });
    });

    describe('境界値 - 外側シングル/ダブル境界', () => {
      test('ちょうど162mmはDOUBLEを返す', () => {
        // Arrange
        const distance = BOARD_PHYSICAL.rings.doubleInner; // 162mm

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('DOUBLE');
      });
    });

    describe('正常系 - DOUBLE エリア', () => {
      test('ダブルリング中央（166mm）はDOUBLEを返す', () => {
        // Arrange
        const distance = 166;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('DOUBLE');
      });

      test('ダブル境界手前（169mm）はDOUBLEを返す', () => {
        // Arrange
        const distance = 169;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('DOUBLE');
      });
    });

    describe('境界値 - ダブル/外側シングル境界', () => {
      test('ちょうど170mmはOUTER_SINGLEを返す', () => {
        // Arrange
        const distance = BOARD_PHYSICAL.rings.doubleOuter; // 170mm

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUTER_SINGLE');
      });
    });

    describe('正常系 - ボード端付近', () => {
      test('ボード端手前（220mm）はOUTER_SINGLEを返す', () => {
        // Arrange
        const distance = 220;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUTER_SINGLE');
      });
    });

    describe('境界値 - ボード外境界', () => {
      test('ちょうど225mmはOUTを返す', () => {
        // Arrange
        const distance = BOARD_PHYSICAL.rings.boardEdge; // 225mm

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUT');
      });

      test('ボード外（226mm）はOUTを返す', () => {
        // Arrange
        const distance = 226;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUT');
      });

      test('遠く離れた位置（1000mm）はOUTを返す', () => {
        // Arrange
        const distance = 1000;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUT');
      });
    });

    describe('エッジケース', () => {
      test('負の距離（-1mm）は適切に処理される', () => {
        // Arrange
        const distance = -1;

        // Act & Assert
        // 負の距離は物理的にあり得ないが、エラーをスローするか特定の値を返すべき
        expect(() => getRing(distance)).toThrow();
      });

      test('浮動小数点の距離（6.34mm）はINNER_BULLを返す', () => {
        // Arrange
        const distance = 6.34;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('INNER_BULL');
      });

      test('浮動小数点の距離（6.36mm）はOUTER_BULLを返す', () => {
        // Arrange
        const distance = 6.36;

        // Act
        const result = getRing(distance);

        // Assert
        expect(result).toBe('OUTER_BULL');
      });
    });
  });

  describe('getSegmentNumber', () => {
    describe('正常系 - 基準セグメント', () => {
      test('真上（0ラジアン）は20を返す', () => {
        // Arrange
        const angle = 0;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(20);
      });

      test('右方向（π/2ラジアン）は6を返す', () => {
        // Arrange
        const angle = Math.PI / 2;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(6);
      });

      test('下方向（πラジアン）は3を返す', () => {
        // Arrange
        const angle = Math.PI;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(3);
      });

      test('左方向（-π/2ラジアン）は11を返す', () => {
        // Arrange
        const angle = -Math.PI / 2;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(11);
      });
    });

    describe('境界値 - セグメント境界', () => {
      test('20と1の境界（π/10ラジアン）は1を返す', () => {
        // Arrange
        const angle = Math.PI / 10; // 18度

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(1);
      });

      test('1と18の境界（2*π/10ラジアン）は18を返す', () => {
        // Arrange
        const angle = 2 * Math.PI / 10; // 36度

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(18);
      });
    });

    describe('正常系 - 各セグメント中央', () => {
      test('セグメント1の中央（π/10 + π/20ラジアン）は1を返す', () => {
        // Arrange
        const angle = Math.PI / 10 + Math.PI / 20; // 27度（1の中央）

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(1);
      });

      test('セグメント18の中央（2*π/10 + π/20ラジアン）は18を返す', () => {
        // Arrange
        const angle = 2 * Math.PI / 10 + Math.PI / 20; // 45度（18の中央）

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(18);
      });
    });

    describe('エッジケース - 負の角度と2π超え', () => {
      test('負の角度（-π/10ラジアン）は適切なセグメント番号を返す', () => {
        // Arrange
        const angle = -Math.PI / 10;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(5); // 時計の11時方向
      });

      test('2πを超える角度（2π + π/10ラジアン）は1を返す', () => {
        // Arrange
        const angle = 2 * Math.PI + Math.PI / 10;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(1);
      });

      test('複数周回転した角度（4π + π/5ラジアン）は適切なセグメント番号を返す', () => {
        // Arrange
        const angle = 4 * Math.PI + Math.PI / 5;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(18);
      });
    });

    describe('境界値 - 浮動小数点精度', () => {
      test('境界値に非常に近い角度（π/10 - 0.0001ラジアン）は20を返す', () => {
        // Arrange
        const angle = Math.PI / 10 - 0.0001;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(20);
      });

      test('境界値に非常に近い角度（π/10 + 0.0001ラジアン）は1を返す', () => {
        // Arrange
        const angle = Math.PI / 10 + 0.0001;

        // Act
        const result = getSegmentNumber(angle);

        // Assert
        expect(result).toBe(1);
      });
    });
  });

  describe('calculateScore', () => {
    describe('正常系 - BULL', () => {
      test('INNER_BULLは常に50点を返す', () => {
        // Arrange
        const ring: RingType = 'INNER_BULL';
        const segmentNumber = 20; // BULL時は無視される

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(50);
      });

      test('OUTER_BULLは常に25点を返す', () => {
        // Arrange
        const ring: RingType = 'OUTER_BULL';
        const segmentNumber = 20; // BULL時は無視される

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(25);
      });
    });

    describe('正常系 - TRIPLE', () => {
      test('トリプル20は60点を返す', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 20;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(60);
      });

      test('トリプル19は57点を返す', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 19;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(57);
      });

      test('トリプル1は3点を返す', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 1;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(3);
      });
    });

    describe('正常系 - DOUBLE', () => {
      test('ダブル20は40点を返す', () => {
        // Arrange
        const ring: RingType = 'DOUBLE';
        const segmentNumber = 20;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(40);
      });

      test('ダブル16は32点を返す', () => {
        // Arrange
        const ring: RingType = 'DOUBLE';
        const segmentNumber = 16;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(32);
      });

      test('ダブル1は2点を返す', () => {
        // Arrange
        const ring: RingType = 'DOUBLE';
        const segmentNumber = 1;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(2);
      });
    });

    describe('正常系 - SINGLE', () => {
      test('内側シングル20は20点を返す', () => {
        // Arrange
        const ring: RingType = 'INNER_SINGLE';
        const segmentNumber = 20;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(20);
      });

      test('外側シングル18は18点を返す', () => {
        // Arrange
        const ring: RingType = 'OUTER_SINGLE';
        const segmentNumber = 18;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(18);
      });

      test('内側シングル5は5点を返す', () => {
        // Arrange
        const ring: RingType = 'INNER_SINGLE';
        const segmentNumber = 5;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(5);
      });
    });

    describe('正常系 - OUT', () => {
      test('OUTは常に0点を返す', () => {
        // Arrange
        const ring: RingType = 'OUT';
        const segmentNumber = 20; // OUT時は無視される

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(0);
      });
    });

    describe('境界値', () => {
      test('セグメント番号1で最小点（TRIPLE 1 = 3点）を返す', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 1;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(3);
      });

      test('セグメント番号20で最大点（TRIPLE 20 = 60点）を返す', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 20;

        // Act
        const result = calculateScore(ring, segmentNumber);

        // Assert
        expect(result).toBe(60);
      });
    });

    describe('エッジケース', () => {
      test('無効なセグメント番号（0）でエラーをスローする', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 0;

        // Act & Assert
        expect(() => calculateScore(ring, segmentNumber)).toThrow();
      });

      test('無効なセグメント番号（21）でエラーをスローする', () => {
        // Arrange
        const ring: RingType = 'DOUBLE';
        const segmentNumber = 21;

        // Act & Assert
        expect(() => calculateScore(ring, segmentNumber)).toThrow();
      });

      test('無効なセグメント番号（-1）でエラーをスローする', () => {
        // Arrange
        const ring: RingType = 'INNER_SINGLE';
        const segmentNumber = -1;

        // Act & Assert
        expect(() => calculateScore(ring, segmentNumber)).toThrow();
      });
    });
  });

  describe('coordinateToScore', () => {
    describe('正常系 - BULL座標', () => {
      test('中心（0, 0）は50点を返す', () => {
        // Arrange
        const x = 0;
        const y = 0;

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(50);
      });

      test('インナーブル内（2, 0）は50点を返す', () => {
        // Arrange
        const x = 2;
        const y = 0;

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(50);
      });

      test('アウターブル内（10, 0）は25点を返す', () => {
        // Arrange
        const x = 10;
        const y = 0;

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(25);
      });
    });

    describe('正常系 - TRIPLE座標', () => {
      test('トリプル20の位置（0, -103）は60点を返す', () => {
        // Arrange
        const x = 0;
        const y = -103; // 真上、トリプルリング中央

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(60);
      });

      test('トリプル6の位置（103, 0）は18点を返す', () => {
        // Arrange
        const x = 103; // 右方向、トリプルリング中央
        const y = 0;

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(18); // セグメント6のトリプル: 6 * 3 = 18
      });
    });

    describe('正常系 - DOUBLE座標', () => {
      test('ダブル20の位置（0, -166）は40点を返す', () => {
        // Arrange
        const x = 0;
        const y = -166; // 真上、ダブルリング中央

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(40);
      });

      test('ダブル3の位置（0, 166）は6点を返す', () => {
        // Arrange
        const x = 0;
        const y = 166; // 真下、ダブルリング中央

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(6); // セグメント3のダブル: 3 * 2 = 6
      });
    });

    describe('正常系 - SINGLE座標', () => {
      test('内側シングル20の位置（0, -50）は20点を返す', () => {
        // Arrange
        const x = 0;
        const y = -50; // 真上、内側シングルエリア

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(20);
      });

      test('外側シングル20の位置（0, -134）は20点を返す', () => {
        // Arrange
        const x = 0;
        const y = -134; // 真上、外側シングルエリア

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(20);
      });
    });

    describe('境界値 - ボード外', () => {
      test('ボード外（0, -225）は0点を返す', () => {
        // Arrange
        const x = 0;
        const y = -225; // ちょうどボード端

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(0);
      });

      test('ボード外（0, -300）は0点を返す', () => {
        // Arrange
        const x = 0;
        const y = -300; // ボード外

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBe(0);
      });
    });

    describe('エッジケース - 斜め座標', () => {
      test('斜め座標（73, -73）は適切な点数を返す', () => {
        // Arrange
        const x = 73;
        const y = -73;
        const distance = Math.sqrt(x * x + y * y); // 約103mm（トリプルリング）
        const angle = Math.atan2(y, x); // 約-45度（20と1の間）

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        // 距離約103mm（TRIPLE）、角度約-45度（セグメント1またはその付近）
        // セグメント1のトリプル = 3点、または近傍のセグメント
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThanOrEqual(60);
      });

      test('負の座標（-103, 0）は適切な点数を返す', () => {
        // Arrange
        const x = -103;
        const y = 0;

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        // 左方向、トリプルリング中央、セグメント11
        // 11 * 3 = 33点
        expect(result).toBe(33);
      });
    });

    describe('エッジケース - 浮動小数点座標', () => {
      test('浮動小数点座標（103.5, -0.5）は適切な点数を返す', () => {
        // Arrange
        const x = 103.5;
        const y = -0.5;

        // Act
        const result = coordinateToScore(x, y);

        // Assert
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThanOrEqual(60);
      });
    });
  });

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

  describe('adjustForSpider', () => {
    describe('基本動作確認', () => {
      test('スパイダー境界上でない座標はそのまま返される', () => {
        // Arrange
        const distance = 103; // トリプルリング中央
        const angle = 0; // 真上

        // Act
        const result = adjustForSpider(distance, angle);

        // Assert
        expect(result.distance).toBeCloseTo(distance, 2);
        expect(result.angle).toBeCloseTo(angle, 2);
      });

      test('リング境界上の座標は調整される', () => {
        // Arrange
        const distance = 99; // トリプルリング内側境界（ちょうどスパイダー上）
        const angle = 0;

        // Act
        const result = adjustForSpider(distance, angle);

        // Assert
        // 境界から少しずれた値が返される
        expect(result.distance).not.toBe(distance);
      });

      test('セグメント境界上の座標は調整される', () => {
        // Arrange
        const distance = 103; // トリプルリング中央
        const angle = Math.PI / 10; // セグメント境界（20と1の境界）

        // Act
        const result = adjustForSpider(distance, angle);

        // Assert
        // 境界から少しずれた値が返される
        expect(result.angle).not.toBe(angle);
      });
    });

    describe('エッジケース', () => {
      test('複数の境界に近い座標でも適切に調整される', () => {
        // Arrange
        const distance = 99.0; // リング境界
        const angle = Math.PI / 10; // セグメント境界

        // Act
        const result = adjustForSpider(distance, angle);

        // Assert
        // 何らかの調整が行われる（詳細は実装依存）
        expect(result).toBeDefined();
        expect(result.distance).toBeGreaterThan(0);
      });
    });
  });

  describe('getScoreLabel', () => {
    describe('正常系 - BULL', () => {
      test('INNER_BULLは"BULL"を返す', () => {
        // Arrange
        const ring: RingType = 'INNER_BULL';
        const segmentNumber = 0; // BULLの場合は無視される

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('BULL');
      });

      test('OUTER_BULLは"25"を返す', () => {
        // Arrange
        const ring: RingType = 'OUTER_BULL';
        const segmentNumber = 0;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('25');
      });
    });

    describe('正常系 - TRIPLE', () => {
      test('トリプル20は"T20"を返す', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 20;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('T20');
      });

      test('トリプル1は"T1"を返す', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 1;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('T1');
      });

      test('トリプル19は"T19"を返す', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 19;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('T19');
      });
    });

    describe('正常系 - DOUBLE', () => {
      test('ダブル20は"D20"を返す', () => {
        // Arrange
        const ring: RingType = 'DOUBLE';
        const segmentNumber = 20;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('D20');
      });

      test('ダブル16は"D16"を返す', () => {
        // Arrange
        const ring: RingType = 'DOUBLE';
        const segmentNumber = 16;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('D16');
      });

      test('ダブル1は"D1"を返す', () => {
        // Arrange
        const ring: RingType = 'DOUBLE';
        const segmentNumber = 1;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('D1');
      });
    });

    describe('正常系 - SINGLE', () => {
      test('内側シングル20は"20"を返す', () => {
        // Arrange
        const ring: RingType = 'INNER_SINGLE';
        const segmentNumber = 20;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('20');
      });

      test('外側シングル18は"18"を返す', () => {
        // Arrange
        const ring: RingType = 'OUTER_SINGLE';
        const segmentNumber = 18;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('18');
      });

      test('内側シングル5は"5"を返す', () => {
        // Arrange
        const ring: RingType = 'INNER_SINGLE';
        const segmentNumber = 5;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('5');
      });
    });

    describe('正常系 - OUT', () => {
      test('OUTは"OUT"を返す', () => {
        // Arrange
        const ring: RingType = 'OUT';
        const segmentNumber = 0;

        // Act
        const result = getScoreLabel(ring, segmentNumber);

        // Assert
        expect(result).toBe('OUT');
      });
    });

    describe('境界値', () => {
      test('セグメント1の各リングタイプで適切なラベルを返す', () => {
        // Arrange & Act & Assert
        expect(getScoreLabel('TRIPLE', 1)).toBe('T1');
        expect(getScoreLabel('DOUBLE', 1)).toBe('D1');
        expect(getScoreLabel('INNER_SINGLE', 1)).toBe('1');
        expect(getScoreLabel('OUTER_SINGLE', 1)).toBe('1');
      });

      test('セグメント20の各リングタイプで適切なラベルを返す', () => {
        // Arrange & Act & Assert
        expect(getScoreLabel('TRIPLE', 20)).toBe('T20');
        expect(getScoreLabel('DOUBLE', 20)).toBe('D20');
        expect(getScoreLabel('INNER_SINGLE', 20)).toBe('20');
        expect(getScoreLabel('OUTER_SINGLE', 20)).toBe('20');
      });
    });

    describe('エッジケース', () => {
      test('無効なセグメント番号（0）でエラーをスローする', () => {
        // Arrange
        const ring: RingType = 'TRIPLE';
        const segmentNumber = 0;

        // Act & Assert
        expect(() => getScoreLabel(ring, segmentNumber)).toThrow();
      });

      test('無効なセグメント番号（21）でエラーをスローする', () => {
        // Arrange
        const ring: RingType = 'DOUBLE';
        const segmentNumber = 21;

        // Act & Assert
        expect(() => getScoreLabel(ring, segmentNumber)).toThrow();
      });
    });
  });
});
