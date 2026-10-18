#!/usr/bin/env bash
# .claude/hooks/block-dangerous-command.sh
command="$(jq -r '.tool_input.command // empty')"
if echo "$command" | grep -Eq 'rm[[:space:]]+-rf|git[[:space:]]+push[[:space:]]+--force|sudo'; then
  echo "Blocked dangerous command: $command" >&2
  exit 2
fi
