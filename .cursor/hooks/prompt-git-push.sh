#!/bin/bash
# After agent work: if there are sizable git changes, ask about commit/push.
set -euo pipefail

input=$(cat)
status=$(echo "$input" | jq -r '.status // empty')
loop_count=$(echo "$input" | jq -r '.loop_count // 0')
root=$(echo "$input" | jq -r '.workspace_roots[0] // empty')

emit_empty() {
  echo '{}'
  exit 0
}

if [ "$status" != "completed" ] || [ "$loop_count" -gt 0 ]; then
  emit_empty
fi

if [ -n "$root" ] && [ -d "$root" ]; then
  cd "$root"
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  emit_empty
fi

MIN_FILES=3
MIN_LINES=80

count_lines() {
  git diff --numstat "$@" 2>/dev/null | awk '{s += $1 + $2} END {print s + 0}'
}

changed_files=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
staged_files=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
untracked_files=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
total_files=$((changed_files + staged_files + untracked_files))

diff_lines=$(count_lines)
staged_lines=$(count_lines --cached)
total_lines=$((diff_lines + staged_lines))

ahead=0
if git rev-parse --abbrev-ref @{u} >/dev/null 2>&1; then
  ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)
fi

dirty=0
if [ "$total_files" -gt 0 ] || [ "$total_lines" -gt 0 ]; then
  dirty=1
fi

big_change=0
if [ "$total_files" -ge "$MIN_FILES" ] || [ "$total_lines" -ge "$MIN_LINES" ]; then
  big_change=1
fi

should_prompt=0
if [ "$big_change" -eq 1 ] && [ "$dirty" -eq 1 ]; then
  should_prompt=1
elif [ "$ahead" -gt 0 ] && [ "$dirty" -eq 1 ]; then
  should_prompt=1
fi

if [ "$should_prompt" -eq 0 ]; then
  emit_empty
fi

summary="Изменено файлов: ${total_files} (незакоммичено), строк в diff: ~${total_lines}."
if [ "$ahead" -gt 0 ]; then
  summary="${summary} Незапушенных коммитов: ${ahead}."
fi

message=$(cat <<EOF
${summary}

Проверь git status и кратко резюмируй изменения. Спроси меня, хочу ли я сейчас закоммитить и запушить на GitHub (origin/main). Не делай commit и push без моего явного согласия.
EOF
)

jq -n --arg msg "$message" '{followup_message: $msg}'
