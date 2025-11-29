import Sketch from 'react-p5';
import type p5Types from 'p5';
import { CoordinateTransform } from './utils/coordinateTransform';
import { drawBoard } from './components/DartBoard/dartBoardRenderer';

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
