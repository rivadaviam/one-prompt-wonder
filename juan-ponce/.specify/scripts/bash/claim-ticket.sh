#!/usr/bin/env bash

set -euo pipefail

ACTION="claim"
BATCH_ID=""
FEATURE_DIR_ARG=""
AGENT_ID="${AGENT_ID:-agent-$$}"
JSON_MODE=false

usage() {
    cat <<'EOF'
Usage: claim-ticket.sh [--claim|--release|--status] [--batch-id ID | --feature-dir DIR] [--agent-id ID] [--json]

Creates a filesystem lock for a feature ticket so parallel agents do not work
the same ticket at the same time.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --claim) ACTION="claim"; shift ;;
        --release) ACTION="release"; shift ;;
        --status) ACTION="status"; shift ;;
        --batch-id)
            [[ $# -ge 2 && -n "${2:-}" ]] || { echo "ERROR: --batch-id requires a value" >&2; exit 1; }
            BATCH_ID="$2"; shift 2 ;;
        --feature-dir)
            [[ $# -ge 2 && -n "${2:-}" ]] || { echo "ERROR: --feature-dir requires a value" >&2; exit 1; }
            FEATURE_DIR_ARG="$2"; shift 2 ;;
        --agent-id)
            [[ $# -ge 2 && -n "${2:-}" ]] || { echo "ERROR: --agent-id requires a value" >&2; exit 1; }
            AGENT_ID="$2"; shift 2 ;;
        --json) JSON_MODE=true; shift ;;
        --help|-h) usage; exit 0 ;;
        *) echo "ERROR: Unknown option '$1'" >&2; usage >&2; exit 1 ;;
    esac
done

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

REPO_ROOT=$(get_repo_root) || exit 1

if [[ -n "$FEATURE_DIR_ARG" ]]; then
    feature_dir="$FEATURE_DIR_ARG"
    [[ "$feature_dir" != /* ]] && feature_dir="$REPO_ROOT/$feature_dir"
else
    [[ -n "$BATCH_ID" ]] || { echo "ERROR: provide --feature-dir or --batch-id" >&2; exit 1; }
    tickets="$REPO_ROOT/.specify/orchestration/$BATCH_ID/tickets.jsonl"
    [[ -f "$tickets" ]] || { echo "ERROR: tickets file not found for batch $BATCH_ID" >&2; exit 1; }
    feature_dir=""
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        if command -v jq >/dev/null 2>&1; then
            candidate=$(jq -r '.feature_dir // empty' <<< "$line")
        else
            candidate=$(printf '%s\n' "$line" | sed -nE 's/.*"feature_dir":"([^"]*)".*/\1/p')
        fi
        [[ -n "$candidate" ]] || continue
        [[ "$candidate" != /* ]] && candidate="$REPO_ROOT/$candidate"
        lock_dir="$candidate/.agent-lock"
        if [[ "$ACTION" != "claim" || ! -d "$lock_dir" ]]; then
            feature_dir="$candidate"
            break
        fi
    done < "$tickets"
    [[ -n "$feature_dir" ]] || { echo "ERROR: no unclaimed ticket found in batch $BATCH_ID" >&2; exit 2; }
fi

lock_dir="$feature_dir/.agent-lock"
lock_info="$lock_dir/info.json"

emit() {
    local status="$1"
    local message="$2"
    if $JSON_MODE; then
        if command -v jq >/dev/null 2>&1; then
            jq -cn --arg status "$status" --arg message "$message" --arg feature_dir "$feature_dir" --arg agent_id "$AGENT_ID" \
                '{STATUS:$status,MESSAGE:$message,FEATURE_DIR:$feature_dir,AGENT_ID:$agent_id}'
        else
            printf '{"STATUS":"%s","MESSAGE":"%s","FEATURE_DIR":"%s","AGENT_ID":"%s"}\n' \
                "$(json_escape "$status")" "$(json_escape "$message")" "$(json_escape "$feature_dir")" "$(json_escape "$AGENT_ID")"
        fi
    else
        echo "STATUS: $status"
        echo "MESSAGE: $message"
        echo "FEATURE_DIR: $feature_dir"
        echo "AGENT_ID: $AGENT_ID"
    fi
}

case "$ACTION" in
    claim)
        if mkdir "$lock_dir" 2>/dev/null; then
            if command -v jq >/dev/null 2>&1; then
                jq -cn --arg agent_id "$AGENT_ID" --arg claimed_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                    '{agent_id:$agent_id,claimed_at:$claimed_at}' > "$lock_info"
            else
                printf '{"agent_id":"%s","claimed_at":"%s"}\n' "$(json_escape "$AGENT_ID")" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$lock_info"
            fi
            emit "claimed" "ticket claimed"
        else
            emit "locked" "ticket is already claimed"
            exit 2
        fi
        ;;
    release)
        if [[ -d "$lock_dir" ]]; then
            rm -rf "$lock_dir"
            emit "released" "ticket released"
        else
            emit "unlocked" "ticket was not locked"
        fi
        ;;
    status)
        if [[ -d "$lock_dir" ]]; then
            emit "locked" "ticket is locked"
        else
            emit "unlocked" "ticket is available"
        fi
        ;;
esac
