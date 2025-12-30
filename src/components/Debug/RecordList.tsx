/**
 * RecordList - 記録一覧表示とJSONエクスポート
 */

import { getScoreLabel } from '../../utils/scoreCalculator/index.js';
import type { DebugRecord } from './DebugScreen';

/**
 * RecordListのプロパティ
 */
interface RecordListProps {
  /** 記録リスト */
  records: DebugRecord[];
  /** キャンバス情報（エクスポート用） */
  canvasInfo: { width: number; height: number; scale: number } | null;
  /** クリア時のコールバック */
  onClear: () => void;
}

/**
 * RecordListコンポーネント
 */
export function RecordList({ records, canvasInfo, onClear }: RecordListProps): JSX.Element {
  /**
   * JSONエクスポート
   */
  const handleExport = (): void => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      canvasSize: canvasInfo ? { width: canvasInfo.width, height: canvasInfo.height } : null,
      scale: canvasInfo?.scale ?? null,
      totalRecords: records.length,
      correctCount: records.filter((r) => r.isCorrect).length,
      incorrectCount: records.filter((r) => !r.isCorrect).length,
      records,
    };

    // JSONファイルをダウンロード
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-records-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 正解数と不正解数
  const correctCount = records.filter((r) => r.isCorrect).length;
  const incorrectCount = records.filter((r) => !r.isCorrect).length;

  return (
    <div className="record-list">
      {/* ヘッダー */}
      <div className="record-list__header">
        <h2 className="record-list__title">
          記録一覧 ({records.length}件)
          {records.length > 0 && (
            <span className="record-list__stats">
              <span className="record-list__correct">✓ {correctCount}</span>
              <span className="record-list__incorrect">✗ {incorrectCount}</span>
            </span>
          )}
        </h2>
        <div className="record-list__actions">
          <button
            type="button"
            className="record-list__button record-list__button--export"
            onClick={handleExport}
            disabled={records.length === 0}
          >
            JSONエクスポート
          </button>
          <button
            type="button"
            className="record-list__button record-list__button--clear"
            onClick={onClear}
            disabled={records.length === 0}
          >
            クリア
          </button>
        </div>
      </div>

      {/* 記録一覧 */}
      {records.length > 0 ? (
        <div className="record-list__items">
          {records.map((record) => (
            <div
              key={record.id}
              className={`record-list__item ${
                record.isCorrect ? 'record-list__item--correct' : 'record-list__item--incorrect'
              }`}
            >
              <span className="record-list__item-id">#{record.id}</span>
              <span className="record-list__item-detected">
                判定: {getScoreLabel(record.detected.ring, record.detected.segment)}
              </span>
              <span className="record-list__item-arrow">→</span>
              <span className="record-list__item-actual">
                実際: {getScoreLabel(record.actual.ring, record.actual.segment)}
              </span>
              <span className="record-list__item-status">{record.isCorrect ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="record-list__empty">まだ記録がありません</p>
      )}
    </div>
  );
}
