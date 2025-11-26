#!/bin/bash
# サブエージェント実行結果を評価し、implement.md を改善するスクリプト
# 注意: このスクリプトは「implement」サブエージェントの完了時のみ評価を実行します

# プロジェクトディレクトリ
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
IMPLEMENT_MD="$PROJECT_DIR/.claude/agents/implement.md"

# レポート出力ディレクトリ
REPORT_DIR="$PROJECT_DIR/.claude/reports"

# stdin からJSONを読み取る
INPUT_JSON=$(cat)

# jqがあればjqを使用、なければgrepで抽出
if command -v jq &> /dev/null; then
  AGENT_ID=$(echo "$INPUT_JSON" | jq -r '.agent_id // empty')
  AGENT_TRANSCRIPT_PATH=$(echo "$INPUT_JSON" | jq -r '.agent_transcript_path // empty')
  PARENT_TRANSCRIPT_PATH=$(echo "$INPUT_JSON" | jq -r '.transcript_path // empty')
  HOOK_EVENT=$(echo "$INPUT_JSON" | jq -r '.hook_event_name // empty')
  SESSION_ID=$(echo "$INPUT_JSON" | jq -r '.session_id // empty')
else
  # jqがない場合はgrep/sedで抽出（簡易的）
  AGENT_ID=$(echo "$INPUT_JSON" | grep -o '"agent_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"agent_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  AGENT_TRANSCRIPT_PATH=$(echo "$INPUT_JSON" | grep -o '"agent_transcript_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"agent_transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  PARENT_TRANSCRIPT_PATH=$(echo "$INPUT_JSON" | grep -o '"transcript_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  HOOK_EVENT=$(echo "$INPUT_JSON" | grep -o '"hook_event_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"hook_event_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  SESSION_ID=$(echo "$INPUT_JSON" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# ~ を展開
AGENT_TRANSCRIPT_PATH="${AGENT_TRANSCRIPT_PATH/#\~/$HOME}"
PARENT_TRANSCRIPT_PATH="${PARENT_TRANSCRIPT_PATH/#\~/$HOME}"

echo "📋 Agent ID: $AGENT_ID"
echo "📋 Agent Transcript: $AGENT_TRANSCRIPT_PATH"
echo "📋 Parent Transcript: $PARENT_TRANSCRIPT_PATH"

# サブエージェントのタイプを親セッションのトランスクリプトから検索
# agent_id を含むTaskツール呼び出し行から subagent_type を抽出
SUBAGENT_TYPE=""
if [ -n "$PARENT_TRANSCRIPT_PATH" ] && [ -f "$PARENT_TRANSCRIPT_PATH" ]; then
  # 親トランスクリプトでこのagent_idを含む行を探し、その前後でsubagent_typeを探す
  # Task ツールの入力には subagent_type が含まれている
  SUBAGENT_TYPE=$(grep -o '"subagent_type":"[^"]*"' "$PARENT_TRANSCRIPT_PATH" | tail -1 | sed 's/"subagent_type":"\([^"]*\)"/\1/')
  echo "📋 検出されたサブエージェントタイプ: $SUBAGENT_TYPE"
fi

# implementサブエージェントかどうか判定
if [ "$SUBAGENT_TYPE" != "implement" ]; then
  echo "サブエージェント '$SUBAGENT_TYPE' はimplement以外のため、評価をスキップします。"
  exit 0
fi

echo "✅ implementサブエージェントを検出。評価を開始します。"

# ここからimplementサブエージェントと判定された場合のみ実行
# レポートファイルを作成
mkdir -p "$REPORT_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/evaluation_${TIMESTAMP}.md"

# ログ関数
log_report() {
  echo "$1" >> "$REPORT_FILE"
}

# レポートヘッダー
log_report "# サブエージェント評価レポート"
log_report ""
log_report "- **実行日時**: $(date '+%Y-%m-%d %H:%M:%S')"
log_report "- **イベント**: ${HOOK_EVENT:-'(不明)'}"
log_report "- **セッションID**: ${SESSION_ID:-'(不明)'}"
log_report "- **サブエージェントタイプ**: ${SUBAGENT_TYPE:-'(JSON未取得)'}"
log_report ""
log_report "✅ implementサブエージェントを検出。評価を実行します。"
log_report ""

# サブエージェントのトランスクリプトから情報を抽出
EVALUATION_INPUT=""

if [ -n "$AGENT_TRANSCRIPT_PATH" ] && [ -f "$AGENT_TRANSCRIPT_PATH" ]; then
  echo "📋 サブエージェントトランスクリプトを読み込み中..."

  # トランスクリプトの最後のアシスタントメッセージ（結果）を抽出
  # 最後の行から"role":"assistant"を含む最後のメッセージのtextを取得
  SUBAGENT_RESULT=$(grep '"role":"assistant"' "$AGENT_TRANSCRIPT_PATH" | tail -1 | grep -o '"text":"[^"]*"' | head -1 | sed 's/"text":"\([^"]*\)"/\1/' | head -c 3000)

  # 親トランスクリプトからプロンプトを抽出（Task ツールの prompt パラメータ）
  if [ -n "$PARENT_TRANSCRIPT_PATH" ] && [ -f "$PARENT_TRANSCRIPT_PATH" ]; then
    SUBAGENT_PROMPT=$(grep -o '"prompt":"[^"]*' "$PARENT_TRANSCRIPT_PATH" | tail -1 | sed 's/"prompt":"//' | head -c 2000)
  fi

  if [ -n "$SUBAGENT_RESULT" ]; then
    EVALUATION_INPUT="## サブエージェントの結果（最終メッセージ抜粋）

$SUBAGENT_RESULT"
  fi

  if [ -n "$SUBAGENT_PROMPT" ]; then
    EVALUATION_INPUT="$EVALUATION_INPUT

## サブエージェントに渡されたプロンプト（抜粋）

$SUBAGENT_PROMPT"
  fi
else
  echo "⚠️ サブエージェントトランスクリプトが見つかりません: $AGENT_TRANSCRIPT_PATH"
fi

# 評価入力が空の場合はスキップ
if [ -z "$EVALUATION_INPUT" ]; then
  log_report "⚠️ サブエージェントの結果・プロンプトが取得できませんでした。"
  log_report ""
  log_report "評価をスキップします。"
  echo "サブエージェントの結果が取得できないため、評価をスキップします。"
  exit 0
fi

echo "📋 評価入力を準備完了"

log_report "## サブエージェント情報"
log_report ""
log_report '```'
# 長すぎる場合は最初の5000文字のみ
log_report "$(echo "$EVALUATION_INPUT" | head -c 5000)"
log_report '```'
log_report ""

# Claudeに評価を依頼し、結果をキャプチャ
log_report "## 評価結果"
log_report ""

EVALUATION_RESULT=$(claude --allowedTools "Edit,Read" -p "以下はimplementサブエージェントの実行情報です。

---サブエージェント情報---
$EVALUATION_INPUT
---情報終了---

このサブエージェントの実行結果を評価してください。
評価後、$IMPLEMENT_MD の指示内容に改善すべき点があれば、そのファイルに追記してください。

評価観点:
1. 指示が明確で十分だったか
2. 成果物の品質は期待通りか
3. 不足していた指示や、追加すべきガイドラインはないか

改善点がなければ何もしないでください。
注意: サブエージェント(Task tool)を再帰的に呼び出さないでください。" 2>&1)

log_report "$EVALUATION_RESULT"
log_report ""
log_report "---"
log_report ""
log_report "✅ 評価完了"

echo "$EVALUATION_RESULT"
echo ""
echo "📄 レポート出力: $REPORT_FILE"
