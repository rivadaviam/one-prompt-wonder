#!/usr/bin/env bash

set -euo pipefail

JSON_MODE=false
TICKETS_FILE=""
BATCH_ID=""
GOAL=""
USE_TIMESTAMP=false

usage() {
    cat <<'EOF'
Usage: create-ticket-batch.sh --tickets-file FILE [--goal TEXT] [--batch-id ID] [--timestamp] [--json]

Creates many speckit-lite feature directories without changing .specify/feature.json.

Ticket file formats:
  JSONL object per line: {"id":"T1","title":"Todo CRUD","description":"Create todos"}
  Plain line: Todo CRUD :: Create, list, update, and delete todos
  Plain line: Create, list, update, and delete todos

Outputs:
  .specify/orchestration/<batch-id>/tickets.jsonl
  .specify/orchestration/<batch-id>/agents/<ticket-id>-*.md
  specs/<NNN-ticket-name>/
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json) JSON_MODE=true; shift ;;
        --tickets-file)
            [[ $# -ge 2 && -n "${2:-}" ]] || { echo "ERROR: --tickets-file requires a value" >&2; exit 1; }
            TICKETS_FILE="$2"; shift 2 ;;
        --goal)
            [[ $# -ge 2 && -n "${2:-}" ]] || { echo "ERROR: --goal requires a value" >&2; exit 1; }
            GOAL="$2"; shift 2 ;;
        --batch-id)
            [[ $# -ge 2 && -n "${2:-}" ]] || { echo "ERROR: --batch-id requires a value" >&2; exit 1; }
            BATCH_ID="$2"; shift 2 ;;
        --timestamp) USE_TIMESTAMP=true; shift ;;
        --help|-h) usage; exit 0 ;;
        *) echo "ERROR: Unknown option '$1'" >&2; usage >&2; exit 1 ;;
    esac
done

[[ -n "$TICKETS_FILE" ]] || { echo "ERROR: --tickets-file is required" >&2; exit 1; }
[[ -f "$TICKETS_FILE" ]] || { echo "ERROR: tickets file not found: $TICKETS_FILE" >&2; exit 1; }

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

REPO_ROOT=$(get_repo_root) || exit 1
cd "$REPO_ROOT"

if [[ -z "$BATCH_ID" ]]; then
    BATCH_ID="batch-$(date +%Y%m%d-%H%M%S)"
fi

BATCH_DIR="$REPO_ROOT/.specify/orchestration/$BATCH_ID"
AGENTS_DIR="$BATCH_DIR/agents"
mkdir -p "$AGENTS_DIR"

TICKETS_JSONL="$BATCH_DIR/tickets.jsonl"
: > "$TICKETS_JSONL"

if [[ -n "$GOAL" ]]; then
    printf '%s\n' "$GOAL" > "$BATCH_DIR/goal.txt"
fi

json_get() {
    local json="$1"
    local key="$2"
    if command -v jq >/dev/null 2>&1; then
        jq -r --arg key "$key" '.[$key] // empty' <<< "$json" 2>/dev/null || true
    else
        printf '%s\n' "$json" | sed -nE "s/.*\"$key\"[[:space:]]*:[[:space:]]*\"([^\"]*)\".*/\1/p" | head -n 1
    fi
}

line_no=0
created=0
while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
    line_no=$((line_no + 1))
    line="$(printf '%s' "$raw_line" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    [[ -z "$line" || "${line:0:1}" == "#" ]] && continue

    id=""
    title=""
    description=""

    if [[ "${line:0:1}" == "{" ]]; then
        id="$(json_get "$line" id)"
        title="$(json_get "$line" title)"
        description="$(json_get "$line" description)"
    elif [[ "$line" == *"::"* ]]; then
        title="${line%%::*}"
        description="${line#*::}"
    else
        description="$line"
    fi

    title="$(printf '%s' "$title" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    description="$(printf '%s' "$description" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    [[ -n "$description" ]] || description="$title"
    [[ -n "$title" ]] || title="$description"
    [[ -n "$id" ]] || id=$(printf 'T%03d' "$line_no")

    create_args=(--json --no-persist --allow-existing-branch --ticket-id "$id" --short-name "$title")
    if [[ "$USE_TIMESTAMP" == true ]]; then
        create_args+=(--timestamp)
    fi
    create_json=$("$SCRIPT_DIR/create-new-feature.sh" "${create_args[@]}" "$description")

    if command -v jq >/dev/null 2>&1; then
        feature_dir=$(jq -r '.FEATURE_DIR' <<< "$create_json")
        spec_file=$(jq -r '.SPEC_FILE' <<< "$create_json")
        feature_num=$(jq -r '.FEATURE_NUM' <<< "$create_json")
        branch_name=$(jq -r '.BRANCH_NAME' <<< "$create_json")
    else
        feature_dir=$(printf '%s\n' "$create_json" | sed -nE 's/.*"FEATURE_DIR":"([^"]*)".*/\1/p')
        spec_file=$(printf '%s\n' "$create_json" | sed -nE 's/.*"SPEC_FILE":"([^"]*)".*/\1/p')
        feature_num=$(printf '%s\n' "$create_json" | sed -nE 's/.*"FEATURE_NUM":"([^"]*)".*/\1/p')
        branch_name=$(printf '%s\n' "$create_json" | sed -nE 's/.*"BRANCH_NAME":"([^"]*)".*/\1/p')
    fi

    ticket_file="$feature_dir/ticket.json"
    if command -v jq >/dev/null 2>&1; then
        jq -cn \
            --arg id "$id" \
            --arg title "$title" \
            --arg description "$description" \
            --arg batch_id "$BATCH_ID" \
            --arg feature_num "$feature_num" \
            --arg branch_name "$branch_name" \
            --arg feature_dir "$feature_dir" \
            --arg spec_file "$spec_file" \
            '{id:$id,title:$title,description:$description,batch_id:$batch_id,feature_num:$feature_num,branch_name:$branch_name,feature_dir:$feature_dir,spec_file:$spec_file,status:"created"}' > "$ticket_file"
        cat "$ticket_file" >> "$TICKETS_JSONL"
    else
        printf '{"id":"%s","title":"%s","description":"%s","batch_id":"%s","feature_num":"%s","branch_name":"%s","feature_dir":"%s","spec_file":"%s","status":"created"}\n' \
            "$(json_escape "$id")" "$(json_escape "$title")" "$(json_escape "$description")" "$(json_escape "$BATCH_ID")" "$(json_escape "$feature_num")" "$(json_escape "$branch_name")" "$(json_escape "$feature_dir")" "$(json_escape "$spec_file")" > "$ticket_file"
        cat "$ticket_file" >> "$TICKETS_JSONL"
    fi

    cat > "$AGENTS_DIR/$id-specify.md" <<EOF
Use skill speckitlite-specify for ticket $id.

Global goal:
$GOAL

Ticket:
$title

$description

Work only in:
$feature_dir

Do not update .specify/feature.json. Fill spec.md for this ticket only.
EOF

    cat > "$AGENTS_DIR/$id-clarify-plan-tasks.md" <<EOF
Use skills speckitlite-clarify, speckitlite-plan, and speckitlite-tasks for ticket $id.

Feature directory:
$feature_dir

When clarification choices are needed, choose the recommended/simple option without asking the user.
Follow the speckit-lite constitution defaults.
EOF

    created=$((created + 1))
done < "$TICKETS_FILE"

if $JSON_MODE; then
    if command -v jq >/dev/null 2>&1; then
        jq -cn \
            --arg batch_id "$BATCH_ID" \
            --arg batch_dir "$BATCH_DIR" \
            --arg tickets_jsonl "$TICKETS_JSONL" \
            --arg agents_dir "$AGENTS_DIR" \
            --argjson ticket_count "$created" \
            '{BATCH_ID:$batch_id,BATCH_DIR:$batch_dir,TICKETS_JSONL:$tickets_jsonl,AGENTS_DIR:$agents_dir,TICKET_COUNT:$ticket_count}'
    else
        printf '{"BATCH_ID":"%s","BATCH_DIR":"%s","TICKETS_JSONL":"%s","AGENTS_DIR":"%s","TICKET_COUNT":%s}\n' \
            "$(json_escape "$BATCH_ID")" "$(json_escape "$BATCH_DIR")" "$(json_escape "$TICKETS_JSONL")" "$(json_escape "$AGENTS_DIR")" "$created"
    fi
else
    echo "BATCH_ID: $BATCH_ID"
    echo "BATCH_DIR: $BATCH_DIR"
    echo "TICKETS_JSONL: $TICKETS_JSONL"
    echo "AGENTS_DIR: $AGENTS_DIR"
    echo "TICKET_COUNT: $created"
fi
