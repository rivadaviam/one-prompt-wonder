#!/usr/bin/env bash

set -euo pipefail

JSON_MODE=false
BATCH_ID=""
ARTIFACT_BRANCH=""

usage() {
    cat <<'EOF'
Usage: stack-branch-plan.sh --batch-id ID --artifact-branch BRANCH [--json]

Reads .specify/orchestration/<batch-id>/tickets.jsonl and outputs the stacked
implementation branch order. This script does not create branches or PRs.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json) JSON_MODE=true; shift ;;
        --batch-id)
            [[ $# -ge 2 && -n "${2:-}" ]] || { echo "ERROR: --batch-id requires a value" >&2; exit 1; }
            BATCH_ID="$2"; shift 2 ;;
        --artifact-branch)
            [[ $# -ge 2 && -n "${2:-}" ]] || { echo "ERROR: --artifact-branch requires a value" >&2; exit 1; }
            ARTIFACT_BRANCH="$2"; shift 2 ;;
        --help|-h) usage; exit 0 ;;
        *) echo "ERROR: Unknown option '$1'" >&2; usage >&2; exit 1 ;;
    esac
done

[[ -n "$BATCH_ID" ]] || { echo "ERROR: --batch-id is required" >&2; exit 1; }
[[ -n "$ARTIFACT_BRANCH" ]] || { echo "ERROR: --artifact-branch is required" >&2; exit 1; }

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

REPO_ROOT=$(get_repo_root) || exit 1
TICKETS="$REPO_ROOT/.specify/orchestration/$BATCH_ID/tickets.jsonl"
[[ -f "$TICKETS" ]] || { echo "ERROR: tickets file not found: $TICKETS" >&2; exit 1; }

clean_branch_part() {
    printf '%s' "$1" \
        | tr '[:upper:]' '[:lower:]' \
        | sed 's/[^a-z0-9]/-/g' \
        | sed 's/-\+/-/g' \
        | sed 's/^-//' \
        | sed 's/-$//' \
        | cut -c1-48
}

previous="$ARTIFACT_BRANCH"
rows=()
while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" ]] && continue
    if command -v jq >/dev/null 2>&1; then
        id=$(jq -r '.id // empty' <<< "$line")
        title=$(jq -r '.title // empty' <<< "$line")
        feature_dir=$(jq -r '.feature_dir // empty' <<< "$line")
    else
        id=$(printf '%s\n' "$line" | sed -nE 's/.*"id":"([^"]*)".*/\1/p')
        title=$(printf '%s\n' "$line" | sed -nE 's/.*"title":"([^"]*)".*/\1/p')
        feature_dir=$(printf '%s\n' "$line" | sed -nE 's/.*"feature_dir":"([^"]*)".*/\1/p')
    fi
    [[ -n "$id" ]] || continue
    short_title=$(clean_branch_part "${title:-$id}")
    short_id=$(clean_branch_part "$id")
    branch="impl/${short_id}-${short_title}"
    if command -v jq >/dev/null 2>&1; then
        rows+=("$(jq -cn \
            --arg id "$id" \
            --arg title "$title" \
            --arg feature_dir "$feature_dir" \
            --arg base "$previous" \
            --arg branch "$branch" \
            '{id:$id,title:$title,feature_dir:$feature_dir,base:$base,branch:$branch}')")
    else
        rows+=("$(printf '{"id":"%s","title":"%s","feature_dir":"%s","base":"%s","branch":"%s"}' \
            "$(json_escape "$id")" "$(json_escape "$title")" "$(json_escape "$feature_dir")" "$(json_escape "$previous")" "$(json_escape "$branch")")")
    fi
    previous="$branch"
done < "$TICKETS"

if $JSON_MODE; then
    if command -v jq >/dev/null 2>&1; then
        printf '%s\n' "${rows[@]}" | jq -s \
            --arg batch_id "$BATCH_ID" \
            --arg artifact_branch "$ARTIFACT_BRANCH" \
            '{BATCH_ID:$batch_id,ARTIFACT_BRANCH:$artifact_branch,STACK:.}'
    else
        printf '{"BATCH_ID":"%s","ARTIFACT_BRANCH":"%s","STACK":[' "$(json_escape "$BATCH_ID")" "$(json_escape "$ARTIFACT_BRANCH")"
        first=true
        for row in "${rows[@]}"; do
            $first || printf ','
            first=false
            printf '%s' "$row"
        done
        printf ']}\n'
    fi
else
    for row in "${rows[@]}"; do
        if command -v jq >/dev/null 2>&1; then
            jq -r '"\(.branch) base=\(.base) feature_dir=\(.feature_dir)"' <<< "$row"
        else
            printf '%s\n' "$row"
        fi
    done
fi
