#!/bin/bash
# Extra safety: always ask before git push from the agent.
set -euo pipefail

input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

if [[ "$command" =~ git[[:space:]]+push ]]; then
  jq -n \
    --arg user_msg "Агент хочет выполнить git push. Разрешить отправку на GitHub?" \
    --arg agent_msg "A hook requires user approval before git push." \
    '{permission: "ask", user_message: $user_msg, agent_message: $agent_msg}'
  exit 0
fi

echo '{ "permission": "allow" }'
