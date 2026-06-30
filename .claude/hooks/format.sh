#!/usr/bin/env bash
# PostToolUse hook: auto-format edited files with Prettier + ESLint fix (TS/TSX)
# Receives JSON via stdin: { "tool_input": { "file_path": "..." } }

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$file" ] && exit 0

# Only format known text formats
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css)
    cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
    pnpm exec prettier --write "$file" >/dev/null 2>&1
    # Also run ESLint fix for TypeScript files
    case "$file" in
      *.ts|*.tsx)
        pnpm exec eslint --fix "$file" >/dev/null 2>&1
        ;;
    esac
    ;;
esac

exit 0
