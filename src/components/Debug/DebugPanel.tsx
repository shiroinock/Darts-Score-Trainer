/**
 * DebugPanel - 判定結果表示と正しい位置入力パネル
 */

import { useState } from 'react';
import type { RingType } from '../../types';
import { getScoreLabel } from '../../utils/scoreCalculator/index.js';
import type { ClickInfo } from './DebugScreen';

/**
 * DebugPanelのプロパティ
 */
interface DebugPanelProps {
  /** クリック情報（nullの場合は未クリック状態） */
  clickInfo: ClickInfo | null;
  /** 記録追加時のコールバック */
  onAddRecord: (actual: { segment: number; ring: RingType }) => void;
}

/**
 * セグメント番号の選択肢
 */
const SEGMENT_OPTIONS = [
  { value: 25, label: 'BULL' },
  { value: 20, label: '20' },
  { value: 1, label: '1' },
  { value: 18, label: '18' },
  { value: 4, label: '4' },
  { value: 13, label: '13' },
  { value: 6, label: '6' },
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 2, label: '2' },
  { value: 17, label: '17' },
  { value: 3, label: '3' },
  { value: 19, label: '19' },
  { value: 7, label: '7' },
  { value: 16, label: '16' },
  { value: 8, label: '8' },
  { value: 11, label: '11' },
  { value: 14, label: '14' },
  { value: 9, label: '9' },
  { value: 12, label: '12' },
  { value: 5, label: '5' },
  { value: 0, label: 'OUT' },
];

/**
 * リング種別の選択肢
 */
const RING_OPTIONS: { value: RingType; label: string }[] = [
  { value: 'INNER_BULL', label: 'インナーブル (50点)' },
  { value: 'OUTER_BULL', label: 'アウターブル (25点)' },
  { value: 'TRIPLE', label: 'トリプル (×3)' },
  { value: 'DOUBLE', label: 'ダブル (×2)' },
  { value: 'INNER_SINGLE', label: 'インナーシングル' },
  { value: 'OUTER_SINGLE', label: 'アウターシングル' },
  { value: 'OUT', label: 'アウト (0点)' },
];

/**
 * リング種別を日本語に変換
 */
function getRingLabel(ring: RingType): string {
  const option = RING_OPTIONS.find((o) => o.value === ring);
  return option?.label ?? ring;
}

/**
 * DebugPanelコンポーネント
 */
export function DebugPanel({ clickInfo, onAddRecord }: DebugPanelProps): JSX.Element {
  // 入力状態
  const [actualSegment, setActualSegment] = useState<number>(20);
  const [actualRing, setActualRing] = useState<RingType>('TRIPLE');

  /**
   * 記録ボタンクリック時のハンドラー
   */
  const handleRecord = (): void => {
    onAddRecord({ segment: actualSegment, ring: actualRing });
  };

  /**
   * セグメント変更時にリングを適切に調整
   */
  const handleSegmentChange = (value: number): void => {
    setActualSegment(value);

    // BULLの場合はブル用のリングに変更
    if (value === 25) {
      if (actualRing !== 'INNER_BULL' && actualRing !== 'OUTER_BULL') {
        setActualRing('INNER_BULL');
      }
    }
    // OUTの場合はOUTリングに変更
    else if (value === 0) {
      setActualRing('OUT');
    }
    // 通常セグメントでブル/アウトリングが選択されていたら変更
    else if (actualRing === 'INNER_BULL' || actualRing === 'OUTER_BULL' || actualRing === 'OUT') {
      setActualRing('TRIPLE');
    }
  };

  /**
   * リング選択肢をセグメントに応じてフィルタリング
   */
  const getAvailableRings = (): { value: RingType; label: string }[] => {
    if (actualSegment === 25) {
      // BULLの場合はブル用のリングのみ
      return RING_OPTIONS.filter((r) => r.value === 'INNER_BULL' || r.value === 'OUTER_BULL');
    }
    if (actualSegment === 0) {
      // OUTの場合はOUTのみ
      return RING_OPTIONS.filter((r) => r.value === 'OUT');
    }
    // 通常セグメントの場合はブルとアウト以外
    return RING_OPTIONS.filter(
      (r) => r.value !== 'INNER_BULL' && r.value !== 'OUTER_BULL' && r.value !== 'OUT'
    );
  };

  return (
    <div className="debug-panel">
      {/* 判定結果表示 */}
      <section className="debug-panel__section">
        <h2 className="debug-panel__section-title">判定結果</h2>
        {clickInfo ? (
          <div className="debug-panel__result">
            <div className="debug-panel__row">
              <span className="debug-panel__label">画面座標:</span>
              <span className="debug-panel__value">
                ({clickInfo.screenX.toFixed(1)}, {clickInfo.screenY.toFixed(1)}) px
              </span>
            </div>
            <div className="debug-panel__row">
              <span className="debug-panel__label">物理座標:</span>
              <span className="debug-panel__value">
                ({clickInfo.physicalX.toFixed(2)}, {clickInfo.physicalY.toFixed(2)}) mm
              </span>
            </div>
            <div className="debug-panel__row">
              <span className="debug-panel__label">中心距離:</span>
              <span className="debug-panel__value">
                {Math.sqrt(clickInfo.physicalX ** 2 + clickInfo.physicalY ** 2).toFixed(2)} mm
              </span>
            </div>
            <div className="debug-panel__divider" />
            <div className="debug-panel__row debug-panel__row--highlight">
              <span className="debug-panel__label">判定:</span>
              <span className="debug-panel__value debug-panel__value--large">
                {getScoreLabel(clickInfo.detected.ring, clickInfo.detected.segment)}
              </span>
            </div>
            <div className="debug-panel__row">
              <span className="debug-panel__label">セグメント:</span>
              <span className="debug-panel__value">{clickInfo.detected.segment}</span>
            </div>
            <div className="debug-panel__row">
              <span className="debug-panel__label">リング:</span>
              <span className="debug-panel__value">{getRingLabel(clickInfo.detected.ring)}</span>
            </div>
            <div className="debug-panel__row">
              <span className="debug-panel__label">得点:</span>
              <span className="debug-panel__value">{clickInfo.detected.score}点</span>
            </div>
          </div>
        ) : (
          <p className="debug-panel__placeholder">ボードをクリックしてください</p>
        )}
      </section>

      {/* 正しい位置入力 */}
      <section className="debug-panel__section">
        <h2 className="debug-panel__section-title">正しい位置を入力</h2>
        <div className="debug-panel__form">
          <div className="debug-panel__field">
            <label htmlFor="actual-segment" className="debug-panel__label">
              セグメント:
            </label>
            <select
              id="actual-segment"
              className="debug-panel__select"
              value={actualSegment}
              onChange={(e) => handleSegmentChange(Number(e.target.value))}
            >
              {SEGMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="debug-panel__field">
            <label htmlFor="actual-ring" className="debug-panel__label">
              リング:
            </label>
            <select
              id="actual-ring"
              className="debug-panel__select"
              value={actualRing}
              onChange={(e) => setActualRing(e.target.value as RingType)}
            >
              {getAvailableRings().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="debug-panel__record-button"
            onClick={handleRecord}
            disabled={!clickInfo}
          >
            記録する
          </button>
        </div>
      </section>
    </div>
  );
}
