#!/usr/bin/env bash
set -euo pipefail

# Linux以外（ホストのmac等）では、コンテナと共有するnode_modulesのOS依存部分を壊すため何もしない
if [ "$(uname -s)" != "Linux" ]; then
  exit 0
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$root"

# 成功時はstdoutへ何も出さない（SessionStartフックのstdoutは会話へ入る）
if ! yarn install --immutable >&2; then
  echo "project-setup: yarn install --immutable failed" >&2
  echo "project-setup: yarn install --immutable failed"
  exit 1
fi
