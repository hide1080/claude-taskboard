#!/usr/bin/env bash
# .claude/hooks/check-after-edit.sh
changed_file="$(jq -r '.tool_input.file_path // empty')"
case "$changed_file" in
  *.ts|*.tsx)
    npm run lint && npm run test:run
    ;;
esac
