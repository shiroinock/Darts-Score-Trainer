import { DartBoard } from './components/DartBoard';
import { PresetSelector } from './components/Settings';

function App(): JSX.Element {
  // デモ用: トリプル20を狙った3投をシミュレート（物理座標、mm単位）
  const demoCoords = [
    { x: 0, y: -103 }, // 1本目: トリプル20中央
    { x: 8, y: -105 }, // 2本目: 少し右にずれる
    { x: -5, y: -100 }, // 3本目: 少し左下にずれる
  ];

  return (
    <div className="app">
      <h1>Darts Score Trainer</h1>
      <p>ダーツスコア計算練習アプリ</p>
      <PresetSelector />
      <DartBoard coords={demoCoords} dartCount={3} />
    </div>
  );
}

export default App;
