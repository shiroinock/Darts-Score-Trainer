#!/bin/bash
# サブエージェント実行結果を評価し、各エージェント定義を改善するスクリプト
# 対応エージェント: test-writer, implement, test-runner, review-file, classify-files, plan-fix

# プロジェクトディレクトリ
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# ベースディレクトリ
AGENTS_DIR="$PROJECT_DIR/.claude/agents"
EVAL_PROMPTS_DIR="$PROJECT_DIR/.claude/evaluation-prompts"
REPORT_BASE_DIR="$PROJECT_DIR/.claude/reports"

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

# サブエージェントタイプに応じて評価を実行
case "$SUBAGENT_TYPE" in
  test-writer|implement|test-runner|review-file|classify-files|plan-fix)
    EVAL_PROMPT_FILE="$EVAL_PROMPTS_DIR/${SUBAGENT_TYPE}.md"
    REPORT_SUBDIR="$REPORT_BASE_DIR/$SUBAGENT_TYPE"
    TARGET_AGENT_FILE="$AGENTS_DIR/${SUBAGENT_TYPE}.md"

    echo "✅ $SUBAGENT_TYPE サブエージェントを検出。評価を開始します。"
    ;;
  *)
    echo "ℹ️ サブエージェントタイプ '$SUBAGENT_TYPE' は評価対象外です（対応: test-writer, implement, test-runner, review-file, classify-files, plan-fix）"
    exit 0
    ;;
esac

# 評価プロンプトファイルの存在確認
if [ ! -f "$EVAL_PROMPT_FILE" ]; then
  echo "⚠️ 評価プロンプトファイルが見つかりません: $EVAL_PROMPT_FILE"
  exit 0
fi

# レポートファイルを作成
mkdir -p "$REPORT_SUBDIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_SUBDIR/evaluation_${TIMESTAMP}.md"

# ログ関数
log_report() {
  echo "$1" >> "$REPORT_FILE"
}

# レポートヘッダー
log_report "# $SUBAGENT_TYPE エージェント評価レポート"
log_report ""
log_report "- **実行日時**: $(date '+%Y-%m-%d %H:%M:%S')"
log_report "- **イベント**: ${HOOK_EVENT:-'(不明)'}"
log_report "- **セッションID**: ${SESSION_ID:-'(不明)'}"
log_report "- **サブエージェントタイプ**: ${SUBAGENT_TYPE:-'(JSON未取得)'}"
log_report "- **対象ファイル**: ${TARGET_AGENT_FILE}"
log_report ""
log_report "✅ $SUBAGENT_TYPE サブエージェントの評価を実行します。"
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

# 評価プロンプトを作成（テンプレートと入力を結合）
echo "📋 評価プロンプトを作成中: $EVAL_PROMPT_FILE"

# 一時ファイルにプロンプトを作成
TEMP_PROMPT=$(mktemp)
cat "$EVAL_PROMPT_FILE" | sed 's/{EVALUATION_INPUT}/---サブエージェント情報開始---/' > "$TEMP_PROMPT"
echo "" >> "$TEMP_PROMPT"
echo "$EVALUATION_INPUT" >> "$TEMP_PROMPT"
echo "" >> "$TEMP_PROMPT"
echo "---サブエージェント情報終了---" >> "$TEMP_PROMPT"

# Claudeに評価を依頼し、結果をキャプチャ
log_report "## 評価結果"
log_report ""

echo "📋 Claude に評価を依頼中..."
EVALUATION_RESULT=$(cat "$TEMP_PROMPT" | claude --allowedTools "Edit,Read" -p 2>&1)
rm -f "$TEMP_PROMPT"

log_report "$EVALUATION_RESULT"
log_report ""
log_report "---"
log_report ""
log_report "✅ 評価完了"

echo "$EVALUATION_RESULT"
echo ""
echo "📄 レポート出力: $REPORT_FILE"
