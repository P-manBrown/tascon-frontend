#!/usr/bin/env bash
# Prepares the Semgrep version and rules that CI uses, in a cache outside the
# repository. The version comes from .github/requirements/semgrep.txt; the rule
# commit and directories come from the semgrep/semgrep-rules checkout step of
# the job "semgrep" in .github/workflows/static-checks.yml.
#
# On success, prints the semgrep executable on the first line of stdout and one
# rule directory per following line. Progress and errors go to stderr.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
requirements="${repo_root}/.github/requirements/semgrep.txt"
workflow="${repo_root}/.github/workflows/static-checks.yml"
cache_dir="${XDG_CACHE_HOME:-${HOME}/.cache}/tascon-frontend/semgrep"
venv_dir="${cache_dir}/venv"
venv_stamp="${venv_dir}/.requirements-sha256"
rules_dir="${cache_dir}/rules"
rules_stamp="${rules_dir}/.rules-spec"
rules_url='https://github.com/semgrep/semgrep-rules.git'

log() {
  echo "semgrep-setup: $*" >&2
}

die() {
  log "ERROR: $*"
  exit 1
}

mkdir -p "${cache_dir}"
exec 9>"${cache_dir}/.lock"
flock 9

# A venv cannot be moved after creation (its scripts hold the absolute path of
# its python), so build it in place and write the stamp last. A venv without a
# matching stamp is incomplete or outdated and is rebuilt.
venv_want="$(sha256sum "${requirements}" | cut -d ' ' -f 1)"
if [ ! -f "${venv_stamp}" ] || [ "$(cat "${venv_stamp}")" != "${venv_want}" ]; then
  log "Creating the Semgrep virtual environment in ${venv_dir}..."
  rm -rf "${venv_dir}"
  if ! python3 -m venv "${venv_dir}" >&2; then
    rm -rf "${venv_dir}"
    die "python3 -m venv failed. Run 'sudo apt-get install -y python3-venv' or rebuild the Dev Container."
  fi
  if ! "${venv_dir}/bin/python" -m pip install --quiet --disable-pip-version-check \
    --require-hashes -r "${requirements}" >&2; then
    die "pip install --require-hashes -r ${requirements} failed. Read the messages above."
  fi
  printf '%s\n' "${venv_want}" >"${venv_stamp}"
fi

# Prints the rule commit on the first line and one sparse-checkout directory
# per following line.
if ! rules_spec="$("${venv_dir}/bin/python" - "${workflow}" <<'PY'
import re
import sys

from ruamel.yaml import YAML

RULES_REPOSITORY = "semgrep/semgrep-rules"


def fail(message):
    print(f"semgrep-setup: ERROR: {message}", file=sys.stderr)
    sys.exit(1)


workflow_path = sys.argv[1]
with open(workflow_path, encoding="utf-8") as stream:
    workflow = YAML().load(stream)

jobs = workflow.get("jobs") if isinstance(workflow, dict) else None
job = jobs.get("semgrep") if isinstance(jobs, dict) else None
steps = job.get("steps") if isinstance(job, dict) else None
if not isinstance(steps, list):
    fail(f"{workflow_path} has no steps in the job 'semgrep'.")

checkouts = [
    step
    for step in steps
    if isinstance(step, dict)
    and str(step.get("uses", "")).startswith("actions/checkout@")
    and isinstance(step.get("with"), dict)
    and step["with"].get("repository") == RULES_REPOSITORY
]
if len(checkouts) != 1:
    fail(
        f"expected one actions/checkout step for {RULES_REPOSITORY} in the job "
        f"'semgrep' of {workflow_path}, found {len(checkouts)}."
    )

options = checkouts[0]["with"]
ref = str(options.get("ref", ""))
if not re.fullmatch(r"[0-9a-f]{40}", ref):
    fail(f"the ref of the {RULES_REPOSITORY} checkout is not a commit SHA: {ref!r}.")

paths = [
    line.strip()
    for line in str(options.get("sparse-checkout", "")).splitlines()
    if line.strip()
]
if not paths:
    fail(f"the {RULES_REPOSITORY} checkout has no sparse-checkout directories.")
for path in paths:
    if not re.fullmatch(r"[A-Za-z0-9_][A-Za-z0-9._-]*(/[A-Za-z0-9_][A-Za-z0-9._-]*)*", path):
        fail(f"unexpected sparse-checkout entry in the {RULES_REPOSITORY} checkout: {path!r}.")

print(ref)
for path in paths:
    print(path)
PY
)"; then
  die "Could not read the Semgrep rules from ${workflow}."
fi

# The rules are fetched into a temporary directory next to the cache and
# replace the old ones only when complete.
if [ ! -f "${rules_stamp}" ] || [ "$(cat "${rules_stamp}")" != "${rules_spec}" ]; then
  log "Fetching the Semgrep rules into ${rules_dir}..."
  rm -rf "${cache_dir}"/rules.tmp.*
  rules_tmp="$(mktemp -d "${cache_dir}/rules.tmp.XXXXXX")"
  trap 'rm -rf "${rules_tmp}"' EXIT
  rules_ref="$(head -n 1 <<<"${rules_spec}")"
  mapfile -t rules_paths < <(tail -n +2 <<<"${rules_spec}")
  # Git sets variables such as GIT_DIR and GIT_INDEX_FILE for hooks; clear them
  # so these commands work on the temporary repository, not on this one.
  # shellcheck disable=SC2046
  if ! (
    unset $(git rev-parse --local-env-vars) &&
      cd "${rules_tmp}" &&
      git init --quiet &&
      git sparse-checkout set "${rules_paths[@]}" &&
      git remote add origin "${rules_url}" &&
      git fetch --quiet --depth 1 --filter=blob:none origin "${rules_ref}" &&
      git checkout --quiet FETCH_HEAD &&
      rm -rf .git
  ) >&2; then
    die "Could not fetch ${rules_url} at ${rules_ref}. Check the network and run this script again."
  fi
  printf '%s\n' "${rules_spec}" >"${rules_tmp}/.rules-spec"
  rm -rf "${rules_dir}"
  mv "${rules_tmp}" "${rules_dir}"
  trap - EXIT
fi

semgrep_bin="${venv_dir}/bin/semgrep"
[ -x "${semgrep_bin}" ] || die "${semgrep_bin} is missing. Delete ${venv_dir} and run this script again."
rule_dirs=()
while IFS= read -r path; do
  [ -d "${rules_dir}/${path}" ] || die "${rules_dir}/${path} is missing. Delete ${rules_dir} and run this script again."
  rule_dirs+=("${rules_dir}/${path}")
done < <(tail -n +2 <<<"${rules_spec}")

printf '%s\n' "${semgrep_bin}" "${rule_dirs[@]}"
