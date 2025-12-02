import Sketch from 'react-p5';
import type p5Types from 'p5';
import { CoordinateTransform } from './utils/coordinateTransform';
import { drawBoard, drawDartMarker } from './components/DartBoard/dartBoardRenderer';
import { DART_COLORS } from './utils/constants';

function App(): JSX.Element {
  let transform: CoordinateTransform;

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // キャンバスサイズ
    const width = 800;
    const height = 600;

    // キャンバス作成
    p5.createCanvas(width, height).parent(canvasParentRef);

    // 座標変換インスタンス作成（ボード半径225mm）
    transform = new CoordinateTransform(width, height, 225);

    // 静的な描画なのでアニメーションループを停止
    p5.noLoop();
  };

  const draw = (p5: p5Types) => {
    // ダーツボード全体を描画（setup後に1回だけ実行される）
    drawBoard(p5, transform);

    // デモ用: ダーツマーカーを表示
    // トリプル20を狙った3投をシミュレート
    drawDartMarker(p5, transform, { x: 0, y: -103 }, DART_COLORS.first, 0);   // 1本目: トリプル20中央
    drawDartMarker(p5, transform, { x: 8, y: -105 }, DART_COLORS.second, 1);  // 2本目: 少し右にずれる
    drawDartMarker(p5, transform, { x: -5, y: -100 }, DART_COLORS.third, 2);  // 3本目: 少し左下にずれる
  };

  return (
    <div className="app">
      <h1>Darts Score Trainer</h1>
      <p>ダーツスコア計算練習アプリ</p>
      <Sketch setup={setup} draw={draw} />
    </div>
  )
}

export default App
