#!/usr/bin/env bash
set -euo pipefail

# Do nothing outside Linux (e.g. a macOS host): it would break the OS-specific parts of node_modules shared with the container
if [ "$(uname -s)" != "Linux" ]; then
  exit 0
fi

fail() {
  echo "project-setup: $1" >&2
  echo "project-setup: $1"
  exit 1
}

# Never derive the location from this script's path or CLAUDE_PROJECT_DIR (inside a worktree both point to the main checkout)
if [ "${1:-}" = "--from-hook" ]; then
  # Use the cwd of the hook input JSON (stdin)
  cwd="$(jq -r '.cwd // empty')" || fail "failed to read the hook input"
  [ -n "$cwd" ] || fail "the hook input has no cwd"
else
  # Manual run: leave stdin alone and use the current directory
  cwd="$PWD"
fi

root="$(git -C "$cwd" rev-parse --show-toplevel)" || fail "not a git repository: $cwd"
cd "$root"

# Print nothing to stdout on success (hook stdout enters the conversation)
if ! yarn install --immutable >&2; then
  fail "yarn install --immutable failed"
fi
