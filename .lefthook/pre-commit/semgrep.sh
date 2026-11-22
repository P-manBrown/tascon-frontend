#!/usr/bin/env bash
# Runs Semgrep with the version and rules that CI uses on the files given as
# arguments (lefthook passes the staged JS/TS files). semgrep-setup.sh prepares
# them and prints where they are.
set -euo pipefail

if [ "$#" -eq 0 ]; then
  exit 0
fi

setup="$(dirname "${BASH_SOURCE[0]}")/semgrep-setup.sh"
if ! setup_output="$(bash "${setup}")"; then
  echo "ERROR: Could not set up Semgrep. Read the messages above." >&2
  exit 1
fi

mapfile -t setup_lines <<<"${setup_output}"
semgrep_bin="${setup_lines[0]}"
config_args=()
for rules in "${setup_lines[@]:1}"; do
  config_args+=(--config "${rules}")
done

exec "${semgrep_bin}" scan "${config_args[@]}" --metrics=off --error "$@"
