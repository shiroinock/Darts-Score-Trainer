/**
 * SessionConfigSelector - セッション設定UIコンポーネント
 *
 * セッションモード（問題数 or 時間制限）と各モードのパラメータを選択します。
 */

import { useGameStore } from '../../stores/gameStore';

/**
 * 問題数の選択肢
 */
const SESSION_QUESTION_COUNTS = [10, 20, 50, 100] as const;

/**
 * 時間制限の選択肢（分）
 */
const SESSION_TIME_LIMITS = [3, 5, 10] as const;

/**
 * セッション設定UIコンポーネント
 */
export function SessionConfigSelector(): JSX.Element {
  const sessionConfig = useGameStore((state) => state.sessionConfig);
  const setSessionConfig = useGameStore((state) => state.setSessionConfig);

  const handleModeChange = (mode: 'questions' | 'time') => {
    if (mode === 'questions') {
      setSessionConfig({
        mode: 'questions',
        questionCount: sessionConfig.questionCount ?? 10,
      });
    } else {
      setSessionConfig({
        mode: 'time',
        timeLimit: sessionConfig.timeLimit ?? 3,
      });
    }
  };

  const handleQuestionCountChange = (count: 10 | 20 | 50 | 100) => {
    setSessionConfig({
      mode: 'questions',
      questionCount: count,
    });
  };

  const handleTimeLimitChange = (limit: 3 | 5 | 10) => {
    setSessionConfig({
      mode: 'time',
      timeLimit: limit,
    });
  };

  return (
    <div className="session-config-selector">
      <h2 className="session-config-selector__title">セッション設定</h2>

      {/* モード選択 */}
      <div className="session-config-selector__mode">
        <h3 className="session-config-selector__subtitle">モード</h3>
        <div className="session-config-selector__buttons">
          <button
            className={`session-mode-button ${
              sessionConfig.mode === 'questions' ? 'session-mode-button--active' : ''
            }`}
            onClick={() => handleModeChange('questions')}
            type="button"
            aria-pressed={sessionConfig.mode === 'questions'}
          >
            問題数
          </button>
          <button
            className={`session-mode-button ${
              sessionConfig.mode === 'time' ? 'session-mode-button--active' : ''
            }`}
            onClick={() => handleModeChange('time')}
            type="button"
            aria-pressed={sessionConfig.mode === 'time'}
          >
            時間制限
          </button>
        </div>
      </div>

      {/* 問題数選択（questionsモード時のみ表示） */}
      {sessionConfig.mode === 'questions' && (
        <div className="session-config-selector__params">
          <h3 className="session-config-selector__subtitle">問題数</h3>
          <div className="session-config-selector__buttons">
            {SESSION_QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                className={`session-param-button ${
                  sessionConfig.questionCount === count ? 'session-param-button--active' : ''
                }`}
                onClick={() => handleQuestionCountChange(count)}
                type="button"
                aria-pressed={sessionConfig.questionCount === count}
              >
                {count}問
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 時間制限選択（timeモード時のみ表示） */}
      {sessionConfig.mode === 'time' && (
        <div className="session-config-selector__params">
          <h3 className="session-config-selector__subtitle">時間制限</h3>
          <div className="session-config-selector__buttons">
            {SESSION_TIME_LIMITS.map((limit) => (
              <button
                key={limit}
                className={`session-param-button ${
                  sessionConfig.timeLimit === limit ? 'session-param-button--active' : ''
                }`}
                onClick={() => handleTimeLimitChange(limit)}
                type="button"
                aria-pressed={sessionConfig.timeLimit === limit}
              >
                {limit}分
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
