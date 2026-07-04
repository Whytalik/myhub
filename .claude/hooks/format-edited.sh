#!/bin/bash
# PostToolUse hook: format the single file Claude just edited/wrote.
# Deliberately does NOT run eslint or tsc here -- those are slow (10-30s) and
# their output floods context on every edit. Prettier is fast and silent.

FILE=$(jq -r '.tool_input.file_path // empty' < /dev/stdin)

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  exit 0
fi

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    cd "${CLAUDE_PROJECT_DIR:-.}" && npx --no-install prettier --write --log-level silent -- "$FILE" 2>/dev/null
    ;;
esac

exit 0
