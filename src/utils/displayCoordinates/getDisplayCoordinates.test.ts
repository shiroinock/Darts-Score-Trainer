/**
 * getDisplayCoordinates のテスト
 * 極座標系で半径と角度を独立に補正する実装のテスト
 */

import { describe, expect, test } from 'vitest';
import { BOARD_PHYSICAL } from '../constants/boardPhysical.js';
import { DART_DISPLAY_ADJUSTMENT } from '../constants/dartMarkerRadii.js';
import { getDisplayCoordinates } from './getDisplayCoordinates.js';

/**
 * アウターブル表示用の半径（mm）
 * インナーブルとアウターブルの中間点
 */
const OUTER_BULL_DISPLAY_RADIUS =
  (BOARD_PHYSICAL.rings.innerBull + BOARD_PHYSICAL.rings.outerBull) / 2;

describe('getDisplayCoordinates', () => {
  describe('正常系 - アウト（OUT）', () => {
    test('真上方向（x=0, y=-300）は半径180mmに配置される', () => {
      // Arrange
      const coords = { x: 0, y: -300 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(-DART_DISPLAY_ADJUSTMENT.outRadius, 2);
    });

    test('右方向（x=250, y=0）は半径180mmに配置される', () => {
      // Arrange
      const coords = { x: 250, y: 0 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      expect(result.x).toBeCloseTo(DART_DISPLAY_ADJUSTMENT.outRadius, 2);
      expect(result.y).toBeCloseTo(0, 2);
    });

    test('斜め方向（x=212, y=-212）は半径180mm、角度45度に配置される', () => {
      // Arrange
      const coords = { x: 212, y: -212 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      const expectedX = DART_DISPLAY_ADJUSTMENT.outRadius * Math.sin(Math.PI / 4);
      const expectedY = -DART_DISPLAY_ADJUSTMENT.outRadius * Math.cos(Math.PI / 4);

      expect(result.x).toBeCloseTo(expectedX, 2);
      expect(result.y).toBeCloseTo(expectedY, 2);
    });
  });

  describe('正常系 - アウターブル（OUTER_BULL）', () => {
    test('真上方向（x=0, y=-10）は半径11.175mmに配置される', () => {
      // Arrange
      const coords = { x: 0, y: -10 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(-OUTER_BULL_DISPLAY_RADIUS, 2);
    });

    test('右方向（x=12, y=0）は半径11.175mmに配置される', () => {
      // Arrange
      const coords = { x: 12, y: 0 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      expect(result.x).toBeCloseTo(OUTER_BULL_DISPLAY_RADIUS, 2);
      expect(result.y).toBeCloseTo(0, 2);
    });
  });

  describe('正常系 - インナーブル（INNER_BULL）', () => {
    test('(3, 0) は中心に向かって20%引っ張られて (2.4, 0) になる', () => {
      // Arrange
      const coords = { x: 3, y: 0 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // 半径3mmが中心に向かって20%引っ張られる: 3 * (1 - 0.2) = 2.4
      expect(result.x).toBeCloseTo(2.4, 2);
      expect(result.y).toBeCloseTo(0, 2);
    });

    test('(0, -3) は中心に向かって20%引っ張られて (0, -2.4) になる', () => {
      // Arrange
      const coords = { x: 0, y: -3 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(-2.4, 2);
    });

    test('原点 (0, 0) はそのまま変わらない', () => {
      // Arrange
      const coords = { x: 0, y: 0 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(0, 2);
    });
  });

  describe('正常系 - トリプル（TRIPLE）', () => {
    test('トリプル20（真上、x=0, y=-105）は半径103mm、角度は20%セグメント中心に寄る', () => {
      // Arrange
      const coords = { x: 0, y: -105 }; // トリプルリング内、真上

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // 半径はリング中心（103mm）に完全に載せる
      // 角度は真上（0ラジアン）のまま（セグメント20の中心が真上）
      const ringCenterRadius =
        (BOARD_PHYSICAL.rings.tripleInner + BOARD_PHYSICAL.rings.tripleOuter) / 2;

      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(-ringCenterRadius, 2);
    });

    test('トリプル18（右側）は半径103mmに載せられる', () => {
      // Arrange
      // セグメント18は右側付近（時計回り162度）
      const coords = { x: 100, y: 30 }; // トリプルリング内、右下方向

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // 半径はリング中心（103mm）に完全に載せる
      const ringCenterRadius =
        (BOARD_PHYSICAL.rings.tripleInner + BOARD_PHYSICAL.rings.tripleOuter) / 2;
      const actualRadius = Math.sqrt(result.x ** 2 + result.y ** 2);

      expect(actualRadius).toBeCloseTo(ringCenterRadius, 2);
    });
  });

  describe('正常系 - ダブル（DOUBLE）', () => {
    test('ダブル20（真上、x=0, y=-166）は半径166mm、角度はそのまま', () => {
      // Arrange
      const coords = { x: 0, y: -166 }; // ダブルリング内、真上

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // 半径はリング中心（166mm）に完全に載せる
      const ringCenterRadius =
        (BOARD_PHYSICAL.rings.doubleInner + BOARD_PHYSICAL.rings.doubleOuter) / 2;

      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(-ringCenterRadius, 2);
    });

    test('ダブル5（右下側）は半径166mmに載せられる', () => {
      // Arrange
      const coords = { x: 165, y: 30 }; // ダブルリング内、右下方向

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // 半径はリング中心（166mm）に完全に載せる
      const ringCenterRadius =
        (BOARD_PHYSICAL.rings.doubleInner + BOARD_PHYSICAL.rings.doubleOuter) / 2;
      const actualRadius = Math.sqrt(result.x ** 2 + result.y ** 2);

      expect(actualRadius).toBeCloseTo(ringCenterRadius, 2);
    });
  });

  describe('正常系 - シングル（INNER_SINGLE, OUTER_SINGLE）', () => {
    test('INNER_SINGLE（真上）は半径が20%リング中心に近づく', () => {
      // Arrange
      const coords = { x: 0, y: -90 }; // INNER_SINGLE範囲内、真上

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // 半径が20%リング中心に近づく
      const ringCenterRadius =
        (BOARD_PHYSICAL.rings.outerBull + BOARD_PHYSICAL.rings.tripleInner) / 2;
      const currentRadius = 90;
      const expectedRadius =
        currentRadius +
        (ringCenterRadius - currentRadius) * DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor;

      const actualRadius = Math.sqrt(result.x ** 2 + result.y ** 2);

      expect(actualRadius).toBeCloseTo(expectedRadius, 2);
      // 真上なので、角度はそのまま（セグメント20の中心が真上）
      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeLessThan(0); // 上方向
    });

    test('OUTER_SINGLE（真上）は半径が20%リング中心に近づく', () => {
      // Arrange
      const coords = { x: 0, y: -130 }; // OUTER_SINGLE範囲内、真上

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      const ringCenterRadius =
        (BOARD_PHYSICAL.rings.tripleOuter + BOARD_PHYSICAL.rings.doubleInner) / 2;
      const currentRadius = 130;
      const expectedRadius =
        currentRadius +
        (ringCenterRadius - currentRadius) * DART_DISPLAY_ADJUSTMENT.segmentCenterPullFactor;

      const actualRadius = Math.sqrt(result.x ** 2 + result.y ** 2);

      expect(actualRadius).toBeCloseTo(expectedRadius, 2);
      // 真上なので、角度はそのまま
      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeLessThan(0); // 上方向
    });
  });

  describe('境界値テスト', () => {
    test('アウターブルとINNER_SINGLEの境界（r=7.95mm）', () => {
      // Arrange
      const coords = { x: 0, y: -7.95 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // アウターブルとして扱われるので、半径11.175mmの円周上に配置される
      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(-OUTER_BULL_DISPLAY_RADIUS, 2);
    });

    test('ダブルリングの外側境界付近（r=169mm）', () => {
      // Arrange
      const coords = { x: 0, y: -169 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // ダブルリングとして扱われるので、半径166mmに載せられる
      const ringCenterRadius =
        (BOARD_PHYSICAL.rings.doubleInner + BOARD_PHYSICAL.rings.doubleOuter) / 2;

      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(-ringCenterRadius, 2);
    });
  });

  describe('エッジケース', () => {
    test('非常に遠い座標（x=1000, y=0）は半径180mmに配置される', () => {
      // Arrange
      const coords = { x: 1000, y: 0 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      expect(result.x).toBeCloseTo(DART_DISPLAY_ADJUSTMENT.outRadius, 2);
      expect(result.y).toBeCloseTo(0, 2);
    });

    test('負の座標（x=-100, y=-100）も正しく処理される', () => {
      // Arrange
      const coords = { x: -100, y: -100 };

      // Act
      const result = getDisplayCoordinates(coords);

      // Assert
      // OUTER_SINGLE範囲内として処理される
      expect(result).toBeDefined();
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
    });
  });
});
