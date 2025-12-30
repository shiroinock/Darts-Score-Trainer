/**
 * DebugScreen - 座標変換デバッグ画面
 *
 * ダーツボードをクリックして座標変換の不具合を調査するための画面です。
 * - クリック位置のロジック判定結果を表示
 * - 実際の正しい位置を記録
 * - JSONでエクスポート
 */

import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { RingType } from '../../types';
import { DebugBoard } from './DebugBoard';
import { DebugPanel } from './DebugPanel';
import { RecordList } from './RecordList';
import './DebugScreen.css';

/**
 * クリック情報の型
 */
export interface ClickInfo {
  screenX: number;
  screenY: number;
  physicalX: number;
  physicalY: number;
  detected: {
    segment: number;
    ring: RingType;
    score: number;
  };
}

/**
 * デバッグ記録の型
 */
export interface DebugRecord {
  id: number;
  timestamp: string;
  click: {
    screenX: number;
    screenY: number;
    physicalX: number;
    physicalY: number;
  };
  detected: {
    segment: number;
    ring: RingType;
    score: number;
  };
  actual: {
    segment: number;
    ring: RingType;
  };
  isCorrect: boolean;
}

/**
 * デバッグ画面コンポーネント
 */
export function DebugScreen(): JSX.Element {
  // ストアからアクションを取得
  const exitDebugScreen = useGameStore((state) => state.exitDebugScreen);

  // 現在のクリック情報
  const [clickInfo, setClickInfo] = useState<ClickInfo | null>(null);

  // 記録リスト
  const [records, setRecords] = useState<DebugRecord[]>([]);

  // キャンバス情報（エクスポート用）
  const [canvasInfo, setCanvasInfo] = useState<{
    width: number;
    height: number;
    scale: number;
  } | null>(null);

  /**
   * ボードクリック時のハンドラー
   */
  const handleBoardClick = (
    info: ClickInfo,
    canvas: { width: number; height: number; scale: number }
  ): void => {
    setClickInfo(info);
    setCanvasInfo(canvas);
  };

  /**
   * 記録追加時のハンドラー
   */
  const handleAddRecord = (actual: { segment: number; ring: RingType }): void => {
    if (!clickInfo) return;

    const isCorrect =
      clickInfo.detected.segment === actual.segment && clickInfo.detected.ring === actual.ring;

    const newRecord: DebugRecord = {
      id: records.length + 1,
      timestamp: new Date().toISOString(),
      click: {
        screenX: clickInfo.screenX,
        screenY: clickInfo.screenY,
        physicalX: clickInfo.physicalX,
        physicalY: clickInfo.physicalY,
      },
      detected: clickInfo.detected,
      actual,
      isCorrect,
    };

    setRecords([...records, newRecord]);
    setClickInfo(null); // 記録後はクリック情報をクリア
  };

  /**
   * 記録クリア時のハンドラー
   */
  const handleClearRecords = (): void => {
    setRecords([]);
  };

  return (
    <div className="debug-screen">
      {/* ヘッダー */}
      <header className="debug-screen__header">
        <button type="button" className="debug-screen__back-button" onClick={exitDebugScreen}>
          ← 設定に戻る
        </button>
        <h1 className="debug-screen__title">座標変換デバッグ</h1>
      </header>

      {/* メインコンテンツ */}
      <main className="debug-screen__main">
        {/* 左側: ダーツボード */}
        <section className="debug-screen__board-section">
          <DebugBoard onBoardClick={handleBoardClick} />
        </section>

        {/* 右側: パネル */}
        <section className="debug-screen__panel-section">
          <DebugPanel clickInfo={clickInfo} onAddRecord={handleAddRecord} />
        </section>
      </main>

      {/* 記録一覧 */}
      <footer className="debug-screen__footer">
        <RecordList records={records} canvasInfo={canvasInfo} onClear={handleClearRecords} />
      </footer>
    </div>
  );
}
