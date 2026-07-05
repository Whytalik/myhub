#!/bin/bash
# Status line: model/dir header, then context window usage and Pro plan rate-limit
# usage (5h/7d) each rendered as its own color-coded bar, right-aligned into
# matching columns so all three read as one tidy block.

input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
FIVE_H=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
FIVE_H_RESET=$(echo "$input" | jq -r '.rate_limits.five_hour.resets_at // empty')
WEEK=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')
WEEK_RESET=$(echo "$input" | jq -r '.rate_limits.seven_day.resets_at // empty')
EMAIL=$(claude auth status 2>/dev/null | jq -r '.email // empty')

GREEN='\033[32m'; YELLOW='\033[33m'; RED='\033[31m'; CYAN='\033[36m'; GRAY='\033[90m'; RESET='\033[0m'

# Renders one usage row: right-aligned label, 10-segment colored bar, right-aligned
# percentage, and (if given) the reset date/time as a epoch-seconds 3rd argument.
render_bar() {
  local label="$1" raw_pct="$2" resets_at="$3" rounded filled empty fill pad bar color reset_str
  rounded=$(printf '%.0f' "$raw_pct")
  if [ "$rounded" -ge 90 ]; then color="$RED"
  elif [ "$rounded" -ge 70 ]; then color="$YELLOW"
  else color="$GREEN"; fi
  filled=$((rounded / 10)); empty=$((10 - filled))
  printf -v fill "%${filled}s"; printf -v pad "%${empty}s"
  bar="${fill// /█}${pad// /░}"
  reset_str=""
  if [ -n "$resets_at" ]; then
    reset_str=" ${GRAY}resets $(date -r "$resets_at" "+%a %H:%M")${RESET}"
  fi
  printf "${GRAY}%3s${RESET} ${color}%s${RESET} %3d%%${reset_str}\n" "$label" "$bar" "$rounded"
}

EMAIL_SUFFIX=""
[ -n "$EMAIL" ] && EMAIL_SUFFIX=" ${GRAY}${EMAIL}${RESET}"
echo -e "${CYAN}[$MODEL]${RESET} 📁 ${DIR##*/}${EMAIL_SUFFIX}"
render_bar "ctx" "$PCT"
[ -n "$FIVE_H" ] && render_bar "5h" "$FIVE_H" "$FIVE_H_RESET"
[ -n "$WEEK" ] && render_bar "7d" "$WEEK" "$WEEK_RESET"
