#!/usr/bin/env bash
set -euo pipefail

# Linux以外（ホストのmac等）では、コンテナと共有するnode_modulesのOS依存部分を壊すため何もしない
if [ "$(uname -s)" != "Linux" ]; then
  exit 0
fi

fail() {
  echo "project-setup: $1" >&2
  echo "project-setup: $1"
  exit 1
}

# 場所はスクリプトのパスやCLAUDE_PROJECT_DIRから決めない（worktreeでは両方とも本体チェックアウトを指す）
if [ "${1:-}" = "--from-hook" ]; then
  # フックの入力JSON（標準入力）のcwdから決める
  cwd="$(jq -r '.cwd // empty')" || fail "failed to read the hook input"
  [ -n "$cwd" ] || fail "the hook input has no cwd"
else
  # 手動実行では標準入力に触れず、カレントディレクトリから決める
  cwd="$PWD"
fi

root="$(git -C "$cwd" rev-parse --show-toplevel)" || fail "not a git repository: $cwd"
cd "$root"

# 成功時はstdoutへ何も出さない（フックのstdoutは会話へ入る）
if ! yarn install --immutable >&2; then
  fail "yarn install --immutable failed"
fi
