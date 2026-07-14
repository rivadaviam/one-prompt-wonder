#!/usr/bin/env bash

set -e

# Parse command line arguments
JSON_MODE=false
FEATURE_DIR_ARG=""
ARGS=()

while [[ $# -gt 0 ]]; do
    arg="$1"
    case "$arg" in
        --json)
            JSON_MODE=true
            shift
            ;;
        --feature-dir)
            if [[ $# -lt 2 || -z "${2:-}" ]]; then
                echo "ERROR: --feature-dir requires a value" >&2
                exit 1
            fi
            FEATURE_DIR_ARG="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--json] [--feature-dir DIR]"
            echo "  --json    Output results in JSON format"
            echo "  --feature-dir DIR  Use an explicit feature directory instead of .specify/feature.json"
            echo "  --help    Show this help message"
            exit 0
            ;;
        *)
            ARGS+=("$arg")
            shift
            ;;
    esac
done

# Get script directory and load common functions
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get all paths and variables from common functions
if [[ -n "$FEATURE_DIR_ARG" ]]; then
    _paths_output=$(get_feature_paths --no-persist --feature-dir "$FEATURE_DIR_ARG") || { echo "ERROR: Failed to resolve feature paths" >&2; exit 1; }
else
    _paths_output=$(get_feature_paths) || { echo "ERROR: Failed to resolve feature paths" >&2; exit 1; }
fi
eval "$_paths_output"
unset _paths_output

# Ensure the feature directory exists
mkdir -p "$FEATURE_DIR"

# Copy plan template if plan doesn't already exist
if [[ -f "$IMPL_PLAN" ]]; then
    if $JSON_MODE; then
        echo "Plan already exists at $IMPL_PLAN, skipping template copy" >&2
    else
        echo "Plan already exists at $IMPL_PLAN, skipping template copy"
    fi
else
    TEMPLATE=$(resolve_template "plan-template" "$REPO_ROOT") || true
    if [[ -n "$TEMPLATE" ]] && [[ -f "$TEMPLATE" ]]; then
        cp "$TEMPLATE" "$IMPL_PLAN"
        if $JSON_MODE; then
            echo "Copied plan template to $IMPL_PLAN" >&2
        else
            echo "Copied plan template to $IMPL_PLAN"
        fi
    else
        if $JSON_MODE; then
            echo "Warning: Plan template not found" >&2
        else
            echo "Warning: Plan template not found"
        fi
        # Create a basic plan file if template doesn't exist
        touch "$IMPL_PLAN"
    fi
fi

# Output results
if $JSON_MODE; then
    if has_jq; then
        jq -cn \
            --arg feature_spec "$FEATURE_SPEC" \
            --arg impl_plan "$IMPL_PLAN" \
            --arg specs_dir "$FEATURE_DIR" \
            --arg quickstart "$QUICKSTART" \
            --arg data_model "$DATA_MODEL" \
            --arg contracts_dir "$CONTRACTS_DIR" \
            --arg branch "$CURRENT_BRANCH" \
            '{FEATURE_SPEC:$feature_spec,IMPL_PLAN:$impl_plan,SPECS_DIR:$specs_dir,QUICKSTART:$quickstart,DATA_MODEL:$data_model,CONTRACTS_DIR:$contracts_dir,BRANCH:$branch}'
    else
        printf '{"FEATURE_SPEC":"%s","IMPL_PLAN":"%s","SPECS_DIR":"%s","QUICKSTART":"%s","DATA_MODEL":"%s","CONTRACTS_DIR":"%s","BRANCH":"%s"}\n' \
            "$(json_escape "$FEATURE_SPEC")" "$(json_escape "$IMPL_PLAN")" "$(json_escape "$FEATURE_DIR")" "$(json_escape "$QUICKSTART")" "$(json_escape "$DATA_MODEL")" "$(json_escape "$CONTRACTS_DIR")" "$(json_escape "$CURRENT_BRANCH")"
    fi
else
    echo "FEATURE_SPEC: $FEATURE_SPEC"
    echo "IMPL_PLAN: $IMPL_PLAN"
    echo "SPECS_DIR: $FEATURE_DIR"
    echo "QUICKSTART: $QUICKSTART"
    echo "DATA_MODEL: $DATA_MODEL"
    echo "CONTRACTS_DIR: $CONTRACTS_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
fi
