/**
 * App - アプリケーションルートコンポーネント
 *
 * ゲーム状態に応じて適切な画面を表示します。
 * - setup: 設定画面（PresetSelector + DifficultySelector + TargetSelector + StartButton）
 * - practicing: 練習画面（PracticeScreen）
 * - results: 結果画面（ResultsScreen）
 */

import { PracticeScreen } from './components/Practice/PracticeScreen';
import { ResultsScreen } from './components/Results/ResultsScreen';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { useGameStore } from './stores/gameStore';

function App(): JSX.Element {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <div className="app">
      {gameState === 'setup' && <SettingsPanel />}
      {gameState === 'practicing' && <PracticeScreen />}
      {gameState === 'results' && <ResultsScreen />}
    </div>
  );
}

export default App;
