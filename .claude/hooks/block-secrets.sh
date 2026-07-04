#!/bin/bash
# PreToolUse hook: block git add/commit commands that touch credential-shaped
# files. Defense-in-depth on top of .gitignore (.env*, *.pem already ignored) --
# this catches forced adds (`git add -f`) or new secret filenames .gitignore
# doesn't know about yet. Lightweight string match, not a full secret scanner.

COMMAND=$(jq -r '.tool_input.command // empty' < /dev/stdin)

if echo "$COMMAND" | grep -qE '\bgit\s+(add|commit)\b'; then
  if echo "$COMMAND" | grep -qE '\.env(\.|[^a-zA-Z]|$)|\.pem\b|\.key\b|creds\.|credentials\.'; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Blocked: command references a credential-shaped file (.env/.pem/.key/creds). Confirm with the user before staging or committing secrets."
      }
    }'
    exit 0
  fi
fi

exit 0
