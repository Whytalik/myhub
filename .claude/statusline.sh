#!/bin/bash
# Status line: model/dir header, then context window usage and Pro plan rate-limit
# usage (5h/7d) each rendered as its own color-coded bar, right-aligned into
# matching columns so all three read as one tidy block.

input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
FIVE_H=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
WEEK=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')

GREEN='\033[32m'; YELLOW='\033[33m'; RED='\033[31m'; CYAN='\033[36m'; GRAY='\033[90m'; RESET='\033[0m'

# Renders one usage row: right-aligned label, 10-segment colored bar, right-aligned percentage.
render_bar() {
  local label="$1" raw_pct="$2" rounded filled empty fill pad bar color
  rounded=$(printf '%.0f' "$raw_pct")
  if [ "$rounded" -ge 90 ]; then color="$RED"
  elif [ "$rounded" -ge 70 ]; then color="$YELLOW"
  else color="$GREEN"; fi
  filled=$((rounded / 10)); empty=$((10 - filled))
  printf -v fill "%${filled}s"; printf -v pad "%${empty}s"
  bar="${fill// /█}${pad// /░}"
  printf "${GRAY}%3s${RESET} ${color}%s${RESET} %3d%%\n" "$label" "$bar" "$rounded"
}

echo -e "${CYAN}[$MODEL]${RESET} 📁 ${DIR##*/}"
render_bar "ctx" "$PCT"
[ -n "$FIVE_H" ] && render_bar "5h" "$FIVE_H"
[ -n "$WEEK" ] && render_bar "7d" "$WEEK"
