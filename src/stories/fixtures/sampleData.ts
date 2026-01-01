import type { DebugRecord } from '../../components/Debug/DebugScreen';
import type { RingType } from '../../types';

/**
 * ストーリーで使用するサンプルRingTypeの配列
 *
 * 型定義から直接参照することで、将来の型変更に自動追従します。
 */
export const SAMPLE_RINGS: RingType[] = ['TRIPLE', 'DOUBLE', 'INNER_SINGLE', 'OUTER_SINGLE'];

/**
 * ダーツの座標位置のサンプルデータ
 *
 * テスト・ストーリーで使用する典型的な座標値を定数化しています。
 */
export const DART_POSITIONS = {
  /** T20の中心位置 */
  T20_CENTER: { x: 0, y: -103 },
  /** ブルの中心位置 */
  BULL_CENTER: { x: 0, y: 0 },
  /** D16の中心位置 */
  D16_CENTER: { x: 166, y: 0 },
  /** ボード外（ミス） */
  OUT_OF_BOARD: { x: 300, y: 0 },
} as const;

/**
 * デバッグ記録のサンプルデータ（15件）
 *
 * RecordListストーリーで使用する事前計算されたフィクスチャデータです。
 * パフォーマンス向上のため、ストーリー定義時の計算を避けています。
 */
export const SAMPLE_DEBUG_RECORDS_15: DebugRecord[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  timestamp: new Date(Date.now() - (15 - i) * 60000).toISOString(),
  click: {
    screenX: 300 + ((i * 13) % 200),
    screenY: 200 + ((i * 17) % 200),
    physicalX: -100 + ((i * 23) % 200),
    physicalY: -100 + ((i * 29) % 200),
  },
  detected: {
    segment: (i % 20) + 1,
    ring: SAMPLE_RINGS[i % SAMPLE_RINGS.length],
    score: ((i * 3) % 60) + 1,
  },
  actual: {
    segment: ((i + 5) % 20) + 1,
    ring: SAMPLE_RINGS[(i + 1) % SAMPLE_RINGS.length],
  },
  isCorrect: i % 3 !== 0, // 約67%の正答率
}));
