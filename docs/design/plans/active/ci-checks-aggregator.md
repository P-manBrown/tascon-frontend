# static-checks.yml のまとめ役 checks・解析なしの next build・確かめのジョブ追加 Implementation Plan

Spec: docs/design/specs/ci-checks-aggregator.md
Worktree: 実装 item の準備時に個別の worktree を記録する。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `.github/workflows/static-checks.yml` に、全ジョブを待って成功以外なら落ちるまとめ役 `checks` を足し（1a）、`build` ジョブを解析なしの `yarn next build --turbopack` にし（1b）、markdownlint・check-logger-trace・check-docs.sh のジョブを足して `checks` の `needs` に入れる（1c）。各段で決定の記録 `docs/decisions/static-checks-in-pr-ci.md`（1c では `docs/decisions/index.md` も）を更新する。1a・1b・1c は `chore/lefthook-safe-autofix-and-typecheck`（PR #955）の上に 3 ブランチのスタックとして積む。

**Architecture:** 1a・1b・1c を Task 1・Task 2・Task 3 に分け、1 つの Task を 1 つの実装 item にする。item の準備の段が item ごとに worktree とブランチを 1 つ作り（Task 1 の親は `chore/lefthook-safe-autofix-and-typecheck`、Task 2・3 の親は前の Task のブランチ）、各 Task はそのブランチに `ci:` コミットを 1 つ置く。ワークフローは PR が出るまで GitHub で走らないため、ワークフローの YAML を Python（PyYAML）で読んで `checks` の `needs` と判定のスクリプトを取り出し、`needs` を模した JSON で手元の `bash -eo pipefail`（GitHub Actions の `run` の既定のシェルと同じ）に流して確かめる。追加・変更したジョブのコマンドは worktree で実際に走らせ、markdownlint だけは `git archive` で展開した木で走らせる。

**Tech Stack:** GitHub Actions（`ubuntu-latest`、`jq`）、bash、Python 3 + PyYAML（手元の確かめ）、Yarn 4.4.0（`nodeLinker: node-modules`）、Next.js 16（Turbopack）、markdownlint-cli2 0.21.0、lefthook（pre-commit・pre-push）、git-spice、gc/bd（bead ノート）

---

## Context/Purpose

- 依頼: tf-1jtse（依頼 gc-tmf1 の部分）。承認済み requirements: `/home/node/tascon-frontend/.gc-artifacts/ci-checks-aggregator/requirements.md`（REQ-001〜REQ-008、受け入れ基準 1〜8）。承認済み設計: 同ディレクトリの `brainstorming/design.md`（判定は案 A: `toJSON(needs)` を `jq` で見る、1b は案 A: ワークフローで `yarn next build --turbopack`、1c は案 A: install は markdownlint だけ）
- 実装タスクは 3 つ: Task 1 = 1a（`checks` と決定の記録）、Task 2 = 1b（解析なしの `next build` と決定の記録、Task 1 に依存）、Task 3 = 1c（3 ジョブ・`needs`・決定の記録と索引、Task 2 に依存）。各 Task は item の準備の段が作ったブランチの上で作業し、ブランチの作成・push・PR の作成はしない
- 変えるファイルは 3 つだけ: `.github/workflows/static-checks.yml`（Task 1・2・3）、`docs/decisions/static-checks-in-pr-ci.md`（Task 1・2・3）、`docs/decisions/index.md`（Task 3 だけ）
- 各 Task の流れ: 作業場所と親の確かめ → 確かめ用スクリプトの用意 → 失敗する確かめ → ワークフローの変更 → 確かめ成功（必要ならコマンドを実際に走らせる）→ 決定の記録 → コミット → 展開した木での markdownlint・check-docs と親との差分の確かめ。Task 3 は最後に 3 段通しの確かめと後段への申し送りを行う
- この formula がライフサイクル（requirements・plan・plan-review・decompose・implement・review・finalize・publish）を実行中。本計画の `### Task N` はソースの変更だけを扱う

## Current System

計画作成時点（2026-11-20、土台 `chore/lefthook-safe-autofix-and-typecheck` = `a0345abeeea3bab242244edd00c008949dfc3725`）で確かめた事実:

- workflow root の `gc.var.base_branch` は `chore/lefthook-safe-autofix-and-typecheck`、`gc.var.push=true`、`gc.var.open_pr=false`
- 未マージのスタック（`git-spice ls`）: `main` ← `refactor/move-design-and-tech-debt-to-docs`（#942）← `chore/drop-gh-stack`（#943）← `docs/yarn-pnp-test-tools-plan-spec`（#953）← `docs/yarn-pnp-test-tools-trial`（#947）← `chore/lefthook-safe-autofix-and-typecheck`（#955、OPEN）。別の枝に `docs/license-inventory-plan-spec`（#949）← `docs/license-inventory`（#944）、`main` の上に `ci/english-pull-requests`（PR なし）
- `chore/lefthook-safe-autofix-and-typecheck` は別の worker の worktree がチェックアウト中のことがある。親のブランチがほかの worktree でチェックアウト中でもブランチを作る手順は item の準備の段（`do-work/prepare-worktree.md`）にあり、本計画の Task はブランチを作らない
- 土台の `.github/workflows/static-checks.yml`: `on: pull_request:`、`permissions: contents: read`、ジョブは `typecheck`（`tsc --noEmit`）・`biome`・`knip`・`markuplint`・`build`（表示名 `next build`、`run: yarn build`）の 5 つ。どのジョブも `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` → `./.github/actions/setup` → コマンド。`concurrency` なし
- `.github/actions/setup/action.yml`: `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`（`node-version: 22.22.2`）→ `corepack enable` → `yarn install --immutable`
- `package.json` の `build` は `ANALYZE=true next build --turbopack`。Turbopack のビルドでは `@next/bundle-analyzer` が「The Next Bundle Analyzer is not compatible with Turbopack builds, no report will be generated.」と警告するだけでレポートを作らない（設計段階で確認）。`ANALYZE` はスクリプトの中で付くため、ワークフローの `env` では上書きできない
- `lefthook.yml` の pre-commit: `markdownlint`（`yarn markdownlint-cli2 {staged_files}`）、`check-logger-trace`（`glob: 'src/**/*.{js,jsx,ts,tsx}'`、`grep -nFH 'logger.trace' {staged_files} && exit 1 || exit 0`）、`jobs` で `bash .lefthook/pre-commit/check-docs.sh`（`ARCHITECTURE.md`・`docs/**/*.md`）。pre-push: `knip`・`check-git-clean`・`tsc`（`yarn next typegen && yarn tsc --noEmit`）
- `.markdownlint-cli2.jsonc`: `"gitignore": true`、`"ignores": [".github/**/*"]`
- 土台を `git archive` で展開した木で、計画作成時に次を確認した
  - `node <node_modules>/markdownlint-cli2/markdownlint-cli2-bin.mjs '**/*.md'` → `Linting: 47 file(s)`・`Summary: 0 error(s)`、exit 0
  - `bash .lefthook/pre-commit/check-docs.sh` → exit 0（依存の install なし）
  - `src` 配下の `*.{js,jsx,ts,tsx}` に `logger.trace` は 0 件
- 計画作成時の試作（scratchpad）で、本計画の `checks` の判定のスクリプトを `bash --noprofile --norc -eo pipefail` で走らせ、全 `success` → exit 0、`failure`・`cancelled`・`skipped` が 1 つ → exit 1 になることを確かめた。logger.trace の検索のスクリプトも、0 件 → exit 0、1 件 → `src/a.tsx:1:logger.trace(1)` と ERROR 行で exit 1、`*.md` だけに有る → exit 0、`src` が無い → exit 2 になることを確かめた
- `docs/decisions/static-checks-in-pr-ci.md`（土台）: タイトル「型・Lint・未使用コード・マークアップ・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する」、Status `Accepted`、Verification Status `Unverified`、Date `2026-11-19`、Related Files `.github/workflows/static-checks.yml, .github/actions/setup/action.yml`。置き換え前の文は本計画の Step 6・Step 13・Step 20 で引用する
- `docs/decisions/index.md`（土台）の該当行: `- 型・Lint・未使用コード・マークアップ・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する (`static-checks-in-pr-ci.md`)`
- `.lefthook/pre-commit/check-docs.sh` は決定の記録の Status・Verification Status・Date・Related Files の有無と値、`index.md` からのリンク（`(static-checks-in-pr-ci.md)` を含むか）を確かめる
- コミットの type: `.github/COMMIT_CONVENTION/COMMIT_CONVENTION.md` の `ci`（CI の設定ファイルやスクリプトの変更）
- 手元の道具: `jq` あり、`actionlint` なし、`yq` なし、Python 3 の PyYAML あり

## Proposed Implementation

### File Structure

- Modify: `.github/workflows/static-checks.yml`
  - Task 1（1a）: 末尾にジョブ `checks` を足す（`name:` なし、`needs: [typecheck, biome, knip, markuplint, build]`、`if: always()`、checkout なし、判定の 1 ステップ）
  - Task 2（1b）: `build` ジョブの `run: yarn build` を `run: yarn next build --turbopack` に変える（ジョブ id・表示名は変えない）
  - Task 3（1c）: `build` と `checks` の間に `markdownlint`・`check-logger-trace`・`check-docs` の 3 ジョブを足し、`checks` の `needs` を 8 つにする
- Modify: `docs/decisions/static-checks-in-pr-ci.md` — Task 1・2・3 で同じファイルに書き足し・該当の項目を更新する。Status・Verification Status・Date・Related Files・ファイル名は変えない
- Modify: `docs/decisions/index.md` — Task 3 でリンクの文だけを新しいタイトルに変える
- 変えないファイル（REQ-008）: `lefthook.yml`、`package.json`、`.github/actions/`、`.markdownlint-cli2.jsonc`、`.claude/memory/` 配下、`docs/design/` 配下
- 確かめ用のスクリプト（`check_needs.py`・`judge_checks.py`・`job_run.py`・`invariants.py`）はリポジトリに置かず、システムの一時ディレクトリ `${TMPDIR:-/tmp}/ci-checks-aggregator-verify/`（以下 `$V`）に置く。中身は下の「確かめ用スクリプト」の節にあり、各 Task が最初に必要な物を置く（Task ごとに別のセッションで走るため、前の Task が置いた物を当てにしない）

### ブランチとコミット

| Task | ブランチ名の案 | 親 | コミット |
| --- | --- | --- | --- |
| Task 1（1a） | `ci/static-checks-aggregator` | `chore/lefthook-safe-autofix-and-typecheck`（`gc.var.base_branch`） | `ci: add a checks job that gates on every static check` |
| Task 2（1b） | `ci/next-build-without-analyzer` | Task 1 のブランチ | `ci: build without the bundle analyzer in the static checks` |
| Task 3（1c） | `ci/markdown-docs-trace-checks` | Task 2 のブランチ | `ci: run markdownlint, the logger.trace check and check-docs.sh in CI` |

ブランチ名の案は Skill `git-spice-workflow` の `<type>/<変更内容>`（type は CI の設定の変更なので `ci`）。ブランチの作成と source anchor への `gc.git_branch` の記録は item の準備の段が行う。準備の段が案と違う名前を選んだ場合は、手順中のブランチ名をすべて `git branch --show-current` の値で読み替える。決定の記録の更新は、その段の CI の変更の理由なので同じコミットに入れる。

### ライフサイクルとの関係

| 段階 | 担当 | 本計画での扱い |
| --- | --- | --- |
| plan-review・decompose | 本 formula の後続の段 | Task 1・2・3 を 3 つの実装 item にする。依存は Task 2 → Task 1、Task 3 → Task 2 |
| implement の準備 | item の準備の段（`do-work/prepare-worktree.md`） | item ごとに worktree `.claude/worktrees/gc-<source-anchor-id>` とブランチを 1 つ作り、`gc.git_branch` を記録する。親は Task 1 が `chore/lefthook-safe-autofix-and-typecheck`、Task 2・3 が依存先の item の `gc.git_branch` |
| implement | 実装レーン（Task 1〜3） | 各 Task の手順を、準備の段が作ったブランチの上で実行し、コミットまで行う。ブランチの作成・push・PR の作成はしない |
| review | 本 formula の後続の段 | 各 item の変更をレビューする |
| finalize | 本 formula の後続の段 | 各 item の `gc.git_branch` を集めて `gc.build.branches` を下から並べ、スタックの並び（土台 → 1a → 1b → 1c）を最終的に確かめる |
| publish | 本 formula の後続の段 | `push=true` のため、`gc.build.branches` を Skill `git-spice-workflow` に従って下から push し、`gc.build.publish_*` を記録する。PR はこの build では作らない |

### 共通の前提（各 Task の実装セッション）

- セッションの作業ディレクトリが、item の準備の段が作ったこの Task 用の worktree（`.claude/worktrees/gc-<source-anchor-id>`）であること。本体の取り出し（`/home/node/tascon-frontend`）のブランチを切り替えない。ほかの worker の worktree を読み書きしない
- 作業するブランチは準備の段が作ったブランチ（`git branch --show-current`）だけ。ブランチを新しく作らない・切り替えない・push しない。親が想定と違えば作業せず、bead を blocked にして理由を書き、人への通知スクリプトで報告する
- コミットは Skill `git-spice-workflow` に従い `git-spice commit create` で行う（素の `git commit` は使わない）
- コミットの前に、コミットメッセージ全文の日本語訳を bead ノートに記録する（自律実行のため、提示の代わり）
- 確かめで作る一時ファイルは `$V` か、worktree の中で確かめ後に消す物だけにする
- 以下のコマンドは bash で実行する（zsh では `$V:l` のような書き方が修飾子として解釈されるため、変数は `"${V}"` のように書く）
- 前の試みの残りでこの Task のコミットが既にある場合（`git log --format=%s -1 HEAD` がこの Task のコミットの subject）は、コミットの手順を飛ばし、コミットの後の確かめから再開する

### 確かめ用スクリプト

各 Task の最初のステップで、その Task が使う物を `$V` に置く（既にあっても上書きする）。

`$V/check_needs.py`（`checks` の `needs` が自分以外の全ジョブとファイル順で一致し、`if: always()` があり、`name:` が無いこと。第 2 引数があれば `needs` がその並びと一致すること）:

```python
import sys

import yaml

workflow = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
jobs = workflow["jobs"]
checks = jobs["checks"]
others = [job_id for job_id in jobs if job_id != "checks"]
print("jobs :", others)
print("needs:", checks["needs"])
assert checks["needs"] == others, "checks.needs must list every other job in file order"
if len(sys.argv) > 2:
    expected = sys.argv[2].split(",")
    assert checks["needs"] == expected, f"checks.needs must be {expected}"
assert checks.get("if") == "always()", "checks must have if: always()"
assert "name" not in checks, "checks must not have name"
assert checks.get("runs-on") == "ubuntu-latest", "checks must run on ubuntu-latest"
assert all("uses" not in step for step in checks["steps"]), "checks must not check out or use actions"
print("NEEDS_OK")
```

`$V/judge_checks.py`（`checks` の判定のステップを、`needs` を模した JSON で走らせる。全 `success` → 0、最後のジョブが `failure`・`cancelled`・`skipped`、最初のジョブが `failure` → 非 0 を期待する）:

```python
import json
import os
import subprocess
import sys

import yaml

workflow = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
checks = workflow["jobs"]["checks"]
step = checks["steps"][0]
assert step["env"]["NEEDS"] == "${{ toJSON(needs) }}", "NEEDS must be toJSON(needs)"
ids = checks["needs"]
cases = [("all success", None, None)]
cases += [(f"{ids[-1]}={result}", ids[-1], result) for result in ("failure", "cancelled", "skipped")]
cases += [(f"{ids[0]}=failure", ids[0], "failure")]
ok = True
for label, target, result in cases:
    needs = {job_id: {"result": result if job_id == target else "success", "outputs": {}} for job_id in ids}
    proc = subprocess.run(
        ["bash", "--noprofile", "--norc", "-eo", "pipefail", "-c", step["run"]],
        env={**os.environ, "NEEDS": json.dumps(needs)},
        capture_output=True,
        text=True,
    )
    passed = (proc.returncode == 0) == (target is None)
    ok = ok and passed
    print(f"[{label}] exit={proc.returncode} {'OK' if passed else 'UNEXPECTED'}")
    print(proc.stdout + proc.stderr, end="")
print("JUDGE_OK" if ok else "JUDGE_NG")
sys.exit(0 if ok else 1)
```

`$V/job_run.py`（指定したジョブの最後の `run` を標準出力に出す）:

```python
import sys

import yaml

workflow = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
steps = workflow["jobs"][sys.argv[2]]["steps"]
runs = [step["run"] for step in steps if "run" in step]
print(runs[-1], end="")
```

`$V/invariants.py`（2 つの rev の `static-checks.yml` で、`on`・`permissions`・`uses:` の値の集合が同じで、`concurrency` が無いこと）:

```python
import subprocess
import sys

import yaml


def load(rev):
    text = subprocess.run(
        ["git", "show", f"{rev}:.github/workflows/static-checks.yml"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return yaml.safe_load(text)


def uses(workflow):
    return sorted({step["uses"] for job in workflow["jobs"].values() for step in job.get("steps", []) if "uses" in step})


base, head = load(sys.argv[1]), load(sys.argv[2])
# PyYAML reads the bare key "on" as True.
assert base[True] == head[True] == {"pull_request": None}, f"on changed: {head[True]!r}"
assert base["permissions"] == head["permissions"] == {"contents": "read"}, "permissions changed"
assert uses(base) == uses(head), f"uses changed: {uses(base)} -> {uses(head)}"
assert "concurrency" not in head, "concurrency added"
print("uses:", uses(head))
print("INVARIANTS_OK")
```

### Task 1: まとめ役 checks を足す（1a）

**Files:**

- Modify: `.github/workflows/static-checks.yml`
- Modify: `docs/decisions/static-checks-in-pr-ci.md`
- Test: 自動テストのファイルは作らない。`$V` の `check_needs.py`・`judge_checks.py`・`invariants.py` でワークフローの YAML を読み、`checks` の `needs` と判定を手元で走らせる。markdownlint・check-docs は `git archive` で展開した木で走らせる

**Depends on:** なし（親は `gc.var.base_branch` の `chore/lefthook-safe-autofix-and-typecheck`）

**Behavior / Acceptance:**

- `checks` ジョブが `needs: [typecheck, biome, knip, markuplint, build]`・`if: always()`・`name:` なし・checkout なしで、`toJSON(needs)` を `jq` で読み、全ジョブの結果が `success` のときだけ成功する（REQ-002、受け入れ基準 2）
- 決定の記録に、まとめ役の理由・必須のチェックを `checks`（と `Validate PR title`）だけにする理由・判定の方式・検討した案・影響を書く（REQ-003、受け入れ基準 3）
- コミットは `ci: add a checks job that gates on every static check` の 1 つで、差分は上の 2 ファイルだけ。`on`・`permissions`・`uses:` は変わらない（REQ-001・REQ-008 の 1a の分、受け入れ基準 1・7）

- [ ] **Step 1: 作業場所と親を確かめ、依存とスクリプトを用意する**

  ```bash
  git branch --show-current
  git-spice ls
  git log --oneline -3
  git status --short
  git rev-parse HEAD origin/chore/lefthook-safe-autofix-and-typecheck
  git log --oneline origin/chore/lefthook-safe-autofix-and-typecheck..HEAD
  test -f node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs || bash .claude/skills/project-setup/scripts/setup.sh
  mkdir -p "${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  ```

  Expected: 今のブランチは準備の段が作った item のブランチ（`main`・`chore/lefthook-safe-autofix-and-typecheck` ではない）。`git-spice ls` でそのブランチが `chore/lefthook-safe-autofix-and-typecheck` の直上にある。`git status --short` が空。`git rev-parse` の 2 行が同じ SHA で、`origin/...HEAD` の `git log` が空（まだコミットが無い）。前の試みのコミット `ci: add a checks job that gates on every static check` が既にあれば、共通の前提に従い Step 8 から再開する。親が `chore/lefthook-safe-autofix-and-typecheck` でない、または `HEAD` に別のコミットが載っている場合は作業せず、bead を blocked にして報告する。

  「確かめ用スクリプト」の節の `check_needs.py`・`judge_checks.py`・`invariants.py` を `$V` に置く。

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  ls "${V}"
  python3 -c 'import yaml; print(yaml.__version__)'
  ```

  Expected: 3 つのスクリプトがあり、PyYAML の版が出る。

- [ ] **Step 2: 失敗する確かめを走らせる（1a の前）**

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  python3 "${V}/check_needs.py" .github/workflows/static-checks.yml typecheck,biome,knip,markuplint,build; echo "exit=$?"
  ```

  Expected: `KeyError: 'checks'` で `exit=1`。

- [ ] **Step 3: `checks` ジョブを足す**

  `.github/workflows/static-checks.yml` の末尾（`build` ジョブの `- run: yarn build` の行の後）に、空行 1 つを挟んで次を足す（インデントはスペース 2 つ。`name:` は付けない）:

  ```yaml

    checks:
      runs-on: ubuntu-latest
      needs: [typecheck, biome, knip, markuplint, build]
      if: always()
      steps:
        - env:
            NEEDS: ${{ toJSON(needs) }}
          run: |
            jq -r 'to_entries[] | "\(.key)=\(.value.result)"' <<<"$NEEDS"
            jq -e 'all(.[]; .result == "success")' <<<"$NEEDS" > /dev/null
  ```

  1 行目の `jq` が各ジョブの `<id>=<result>` を 1 行ずつ出し、2 行目の `jq -e` がすべて `success` でなければ終了コード 1 を返す（`run` の既定のシェル `bash -e -o pipefail` でステップが失敗する）。

- [ ] **Step 4: 確かめが通ることを見る（1a）**

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  python3 "${V}/check_needs.py" .github/workflows/static-checks.yml typecheck,biome,knip,markuplint,build; echo "exit=$?"
  python3 "${V}/judge_checks.py" .github/workflows/static-checks.yml; echo "exit=$?"
  git diff --stat
  ```

  Expected: `NEEDS_OK` で `exit=0`。`judge_checks.py` は 5 つのケースすべてに `OK`、各ケースで `typecheck=success` 等 5 行が出て、`JUDGE_OK` で `exit=0`。`git diff --stat` は `.github/workflows/static-checks.yml` だけ（11 行追加）。

- [ ] **Step 5: 決定の記録を更新する（1a、REQ-003）**

  `docs/decisions/static-checks-in-pr-ci.md` を次のとおり編集する（タイトル・Status・Verification Status・Date・Related Files は変えない）。

  5-1. Context の最後の箇条（`- \`next build\`に要る環境変数は追跡対象の\`.env\`にあり、シークレットは要らない`）の後に、空行 1 つを挟んで次の段落を足す:

  ```markdown
  ブランチ保護のrequired status checksはジョブ（check run）ごとに登録する。確かめのジョブを1つずつ登録すると、確かめを足すたびに登録し直す必要があり、登録を忘れたジョブは失敗してもマージを止めない。GitHub Actionsの`needs`が待てるのは同じワークフローのジョブだけである。
  ```

  5-2. Decision の「準備手順（Node.jsの用意、…）」の箇条の直前に、次の 3 つの箇条を足す:

  ```markdown
  - 確かめのジョブの後に、まとめ役のジョブ`checks`を置く。`checks`は`needs`で同じワークフローの確かめのジョブをすべて待ち、`if: always()`で前のジョブが落ちても必ず走る。`toJSON(needs)`を`jq`で読んで各ジョブの`<ジョブのid>=<結果>`を表示し、結果が`success`でないジョブ（`failure`・`cancelled`・`skipped`）が1つでもあれば失敗する。判定の式にジョブ名を並べず、`needs`全体を見る
  - ブランチ保護のrequired status checksに登録するのは`checks`（と`Validate PR title`）だけにする。確かめを足すたびに必須のチェックを登録し直さなくて済み、登録を忘れても関門から漏れないため
  - 必須にする確かめはこのワークフロー（`static-checks.yml`）1つに置く。`needs`が待てるのは同じワークフローのジョブだけのため
  ```

  5-3. Considered Options の最後の箇条（`- \`tsc --noEmit\`を\`next build\`の後に同じジョブで実行する: …`）の後に、次の 5 つの箇条を足す:

  ```markdown
  - まとめ役`checks`だけを必須のチェックに登録する（採用）: 確かめを足すときに変えるのはワークフローの`needs`だけで、リポジトリの設定を触らない。`needs`に足し忘れたジョブは関門に入らない
  - 各ジョブを必須のチェックに個別に登録する: まとめ役のジョブが要らないが、確かめを足すたびにリポジトリの設定で登録し直す必要があり、登録を忘れたジョブは失敗してもマージを止めない
  - `checks`の判定で`toJSON(needs)`全体を`jq`で見る（採用）: `needs`に足したジョブが自動で判定の対象になり、各ジョブの結果を1行ずつ表示できる。`jq`の式を読む必要がある
  - `checks`の判定でジョブごとに`needs.<id>.result`を`env`で受けてシェルで比べる: 式は単純だが、ジョブを足すたびに`needs`・`env`・比較の3か所を変える必要があり、比較を書き忘れたジョブの失敗は関門を素通りする
  - `checks`の判定でステップの`if`に`contains(needs.*.result, 'failure')`等を並べる: シェルなしで書けるが、失敗とみなす値を列挙するため「`success`以外は失敗」にならず、どのジョブが何の結果だったかがログに出ない
  ```

  5-4. Consequences の箇条 `- ブランチ保護のrequired status checksに登録するまでは、ジョブが失敗してもマージは止まらない` を次の 3 つの箇条に置き換える:

  ```markdown
  - ブランチ保護のrequired status checksに`checks`を登録するまでは、確かめのジョブが失敗してもマージは止まらない
  - 確かめのジョブを足すときは、`checks`の`needs`にも足す必要がある。足さないとそのジョブは関門に入らない
  - ワークフローが途中で取り消されると`checks`は成功しないため、必須のチェックは通らない
  ```

  ```bash
  yarn markdownlint-cli2 docs/decisions/static-checks-in-pr-ci.md; echo "exit=$?"
  bash .lefthook/pre-commit/check-docs.sh; echo "exit=$?"
  git diff --stat
  ```

  Expected: 両方 `exit=0`。`git diff --stat` は `.github/workflows/static-checks.yml` と `docs/decisions/static-checks-in-pr-ci.md` の 2 つだけ。

- [ ] **Step 6: 1a をコミットする**

  コミットメッセージを `${TMPDIR:-/tmp}/ci-checks-aggregator-verify/msg-1a.txt` に書く:

  ```text
  ci: add a checks job that gates on every static check

  Branch protection registers required checks per job, so each new
  check would have to be registered again, and a check left
  unregistered would not block merges. Add a checks job that waits on
  every job in the workflow through needs, always runs, prints each
  job's result, and fails unless every result is success.

  It reads the whole needs context with jq, so a job added to needs is
  judged without touching the condition. Record the decision, why only
  checks (and Validate PR title) are to be required, and the options
  considered in the static checks decision record.
  ```

  bead ノートに日本語訳を記録する:

  > ci: すべての静的な確かめを関門にする checks ジョブを足す
  >
  > ブランチ保護は必須のチェックをジョブごとに登録するため、確かめを足すたびに登録し直す必要があり、登録されていない確かめはマージを止めない。needs でワークフローの全ジョブを待ち、必ず走り、各ジョブの結果を表示し、すべての結果が success でなければ失敗する checks ジョブを足す。
  >
  > needs 全体を jq で読むため、needs に足したジョブは条件を変えずに判定される。決定、checks（と Validate PR title）だけを必須にする理由、検討した案を静的な確かめの決定の記録に書く。

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  BRANCH="$(git branch --show-current)"
  git add .github/workflows/static-checks.yml docs/decisions/static-checks-in-pr-ci.md
  git status --short
  git-spice commit create -F "${V}/msg-1a.txt"
  test "$(git branch --show-current)" = "${BRANCH}"; echo "same-branch exit=$?"
  git status --short
  git log --oneline -1
  ```

  Expected: コミット前の `git status --short` は `M ` の 2 行だけ（未ステージの変更なし）。pre-commit（markdownlint・check-docs.sh）が通る。コミット後も同じブランチ（`same-branch exit=0`）、`git status --short` が空、最新コミットが `ci: add a checks job that gates on every static check`。pre-commit が失敗したら出力を読んで直し、`git add` し直してから同じコマンドでコミットする（`--no-verify` で回避しない）。

- [ ] **Step 7: 1a を展開した木と親との差分で確かめる（REQ-001・REQ-008 の 1a の分）**

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  WT="$(git rev-parse --show-toplevel)"
  T="$(mktemp -d)"
  git archive HEAD | tar -x -C "$T"
  (cd "$T" && node "${WT}/node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs" '**/*.md'; echo "markdownlint exit=$?")
  (cd "$T" && bash .lefthook/pre-commit/check-docs.sh; echo "check-docs exit=$?")
  rm -rf "$T"
  git log --oneline HEAD~1..HEAD
  git diff --name-only HEAD~1 HEAD
  python3 "${V}/invariants.py" HEAD~1 HEAD | tail -1
  ```

  Expected: markdownlint が `Summary: 0 error(s)` で `exit=0`、check-docs が `exit=0`。親からのコミットは 1 つ、差分は `.github/workflows/static-checks.yml`・`docs/decisions/static-checks-in-pr-ci.md` の 2 つだけ、`INVARIANTS_OK`。bead ノートに `1a: <ブランチ名> <SHA> NEEDS_OK JUDGE_OK INVARIANTS_OK markdownlint(archive) 0 errors check-docs exit=0` を記録する。

  1 つでも想定と違えば、同じブランチで直して `git add` → `git-spice commit amend --no-edit` し、このステップをやり直す。直せなければ bead を blocked にして報告する。

### Task 2: 解析なしの next build にする（1b）

**Files:**

- Modify: `.github/workflows/static-checks.yml`
- Modify: `docs/decisions/static-checks-in-pr-ci.md`
- Test: 自動テストのファイルは作らない。`$V` の `job_run.py`・`check_needs.py`・`invariants.py` で `build` ジョブの `run` を取り出して確かめ、`yarn next build --turbopack` を worktree で実際に走らせる。markdownlint・check-docs は `git archive` で展開した木で走らせる

**Depends on:** Task 1（親は Task 1 のブランチ）

**Behavior / Acceptance:**

- `build` ジョブの `run` が `yarn next build --turbopack` で、ジョブ id `build`・表示名 `next build` は変わらず、ワークフローに `ANALYZE` も `yarn build` も無い。ビルドが exit 0 で、解析の警告が出ない（REQ-004、受け入れ基準 4）
- 決定の記録に、`ANALYZE=true` が Turbopack で効かない事実・ワークフローで直接ビルドする決定・検討した案・`build` スクリプトとワークフローを合わせる必要を書く（REQ-004、受け入れ基準 4）
- コミットは `ci: build without the bundle analyzer in the static checks` の 1 つで、差分は上の 2 ファイルだけ（`package.json` は変えない）。`on`・`permissions`・`uses:` は変わらない（REQ-001・REQ-008 の 1b の分、受け入れ基準 1・7）

- [ ] **Step 8: 作業場所と親を確かめ、依存とスクリプトを用意する**

  ```bash
  git branch --show-current
  git-spice ls
  git log --oneline -3
  git status --short
  git log --format=%s -1 HEAD
  test -f node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs || bash .claude/skills/project-setup/scripts/setup.sh
  mkdir -p "${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  ```

  Expected: 今のブランチは準備の段が作った item のブランチ。`git-spice ls` でそのブランチが Task 1 のブランチ（案: `ci/static-checks-aggregator`）の直上にあり、その下が `chore/lefthook-safe-autofix-and-typecheck`。`git status --short` が空。`HEAD` の subject が `ci: add a checks job that gates on every static check`（Task 1 のコミット。この Task のコミットはまだ無い）。前の試みのコミット `ci: build without the bundle analyzer in the static checks` が既にあれば、共通の前提に従い Step 14 から再開する。親が Task 1 のブランチでなければ作業せず、bead を blocked にして報告する。

  「確かめ用スクリプト」の節の `check_needs.py`・`job_run.py`・`invariants.py` を `$V` に置き、`ls "${TMPDIR:-/tmp}/ci-checks-aggregator-verify"` で 3 つがあることを見る。

- [ ] **Step 9: 失敗する確かめを走らせる（1b の前）**

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  test "$(python3 "${V}/job_run.py" .github/workflows/static-checks.yml build)" = 'yarn next build --turbopack'; echo "exit=$?"
  ```

  Expected: 今の `run` が `yarn build` のため `exit=1`。

- [ ] **Step 10: `build` ジョブを変える**

  `.github/workflows/static-checks.yml` の `build` ジョブの

  ```yaml
        - run: yarn build
  ```

  を

  ```yaml
        - run: yarn next build --turbopack
  ```

  に変える。`build:`・`name: next build`・ほかの行は変えない。

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  test "$(python3 "${V}/job_run.py" .github/workflows/static-checks.yml build)" = 'yarn next build --turbopack'; echo "exit=$?"
  grep -n 'ANALYZE\|yarn build' .github/workflows/static-checks.yml; echo "grep exit=$?"
  python3 -c 'import yaml,sys; j=yaml.safe_load(open(".github/workflows/static-checks.yml"))["jobs"]["build"]; print(j["name"])'
  python3 "${V}/check_needs.py" .github/workflows/static-checks.yml typecheck,biome,knip,markuplint,build
  git diff --stat
  ```

  Expected: `test` が `exit=0`。`grep` は何も出さず `grep exit=1`。表示名は `next build`。`NEEDS_OK`。`git diff --stat` は `.github/workflows/static-checks.yml` の 1 行の変更だけ。

- [ ] **Step 11: ビルドを実際に走らせる（REQ-004）**

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  bash --noprofile --norc -eo pipefail -c "$(python3 "${V}/job_run.py" .github/workflows/static-checks.yml build)" > "${V}/build-1b.log" 2>&1; echo "exit=$?"
  tail -20 "${V}/build-1b.log"
  grep -c 'Bundle Analyzer' "${V}/build-1b.log"
  git status --short
  ```

  Expected: `exit=0`。`grep -c` が `0`（解析の警告が出ない）。`git status --short` は `M .github/workflows/static-checks.yml` だけ（`.next` は追跡外）。ビルドが失敗したら、ログの最後を bead ノートに残し、同じ worktree で `yarn build` も失敗するかを見る。`yarn build` も失敗するなら土台の問題として bead を blocked にして報告する。

- [ ] **Step 12: 決定の記録を更新する（1b、REQ-004）**

  `docs/decisions/static-checks-in-pr-ci.md` を次のとおり編集する。

  12-1. Context の、Task 1 の Step 5-1 で足した段落（`ブランチ保護のrequired status checksはジョブ（check run）ごとに登録する。…`）の後に、空行 1 つを挟んで次の段落を足す:

  ```markdown
  `package.json`の`build`スクリプトは`ANALYZE=true next build --turbopack`である。Turbopackのビルドでは`ANALYZE=true`でも`@next/bundle-analyzer`は解析のレポートを作らず、「The Next Bundle Analyzer is not compatible with Turbopack builds, no report will be generated.」という警告だけを出す。`ANALYZE`は`build`スクリプトの中で付くため、ワークフローの`env`では上書きできない。
  ```

  12-2. Decision の箇条

  ```markdown
    - `next build`: `yarn build`（本番と同じビルド手順）
  ```

  を

  ```markdown
    - `next build`: `yarn next build --turbopack`（`build`スクリプトから`ANALYZE=true`を除いたビルド手順。バンドルの解析をしない）
  ```

  に置き換える。

  12-3. Considered Options の最後の箇条（Task 1 の Step 5-3 で足した `- \`checks\`の判定でステップの\`if\`に…`）の後に、次の 3 つの箇条を足す:

  ```markdown
  - `next build`のジョブでワークフローから`yarn next build --turbopack`を直接実行する（採用）: CIのジョブだけを変え、手元の`yarn build`の挙動は変わらない。ビルドの指定が`package.json`とワークフローの2か所になる
  - `package.json`の`build`から`ANALYZE=true`を外し、解析用のスクリプトを分ける: CIは`yarn build`のままで手順が1か所になるが、手元の`yarn build`の挙動が変わる。Turbopackでは解析のレポートが作られないため、解析用のスクリプトの中身という別の判断も要る
  - ワークフローの`env`で`ANALYZE=false`を渡す: `build`スクリプトの中の`ANALYZE=true`が優先されるため効かない
  ```

  12-4. Consequences の最後の箇条（`- 固定したSHAは自動では更新されないため、Actionの更新は手で行う`）の後に、次の箇条を足す:

  ```markdown
  - `build`スクリプトのビルドの指定（`--turbopack`等）を変えるときは、`static-checks.yml`の`next build`のジョブも合わせる必要がある
  ```

  ```bash
  yarn markdownlint-cli2 docs/decisions/static-checks-in-pr-ci.md; echo "exit=$?"
  bash .lefthook/pre-commit/check-docs.sh; echo "exit=$?"
  git diff --stat
  ```

  Expected: 両方 `exit=0`。`git diff --stat` は `.github/workflows/static-checks.yml` と `docs/decisions/static-checks-in-pr-ci.md` の 2 つだけ（`package.json` は無い）。

- [ ] **Step 13: 1b をコミットする**

  コミットメッセージを `${TMPDIR:-/tmp}/ci-checks-aggregator-verify/msg-1b.txt` に書く:

  ```text
  ci: build without the bundle analyzer in the static checks

  The build script sets ANALYZE=true, but the bundle analyzer does not
  support Turbopack builds: it only prints a warning and writes no
  report. Run next build --turbopack directly in the next build job so
  CI builds without the analyzer flag, and leave the local build script
  as it is.

  ANALYZE is set inside the build script, so overriding it from the
  workflow env would have no effect. Record these facts, the options
  considered, and that the workflow has to follow future changes to the
  build flags in the decision record.
  ```

  bead ノートに日本語訳を記録する:

  > ci: 静的な確かめでバンドル解析なしでビルドする
  >
  > build スクリプトは ANALYZE=true を付けるが、バンドル解析は Turbopack のビルドに対応しておらず、警告を出すだけでレポートを書かない。next build のジョブで next build --turbopack を直接実行し、CI は解析の指定なしでビルドし、手元の build スクリプトはそのままにする。
  >
  > ANALYZE は build スクリプトの中で付くため、ワークフローの env で上書きしても効かない。これらの事実、検討した案、ビルドの指定を今後変えるときはワークフローも合わせる必要があることを決定の記録に書く。

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  BRANCH="$(git branch --show-current)"
  git add .github/workflows/static-checks.yml docs/decisions/static-checks-in-pr-ci.md
  git status --short
  git-spice commit create -F "${V}/msg-1b.txt"
  test "$(git branch --show-current)" = "${BRANCH}"; echo "same-branch exit=$?"
  git status --short
  git log --oneline -1
  ```

  Expected: Step 6 と同じ（同じブランチのまま、最新コミットが `ci: build without the bundle analyzer in the static checks`）。

- [ ] **Step 14: 1b を展開した木と親との差分で確かめる（REQ-001・REQ-008 の 1b の分）**

  Step 7 のコマンドブロックをそのまま実行する。

  Expected: markdownlint が `Summary: 0 error(s)` で `exit=0`、check-docs が `exit=0`。親からのコミットは 1 つ、差分は `.github/workflows/static-checks.yml`・`docs/decisions/static-checks-in-pr-ci.md` の 2 つだけ（`package.json` が無い）、`INVARIANTS_OK`。bead ノートに `1b: <ブランチ名> <SHA> build exit=0 analyzer-warning=0 INVARIANTS_OK markdownlint(archive) 0 errors check-docs exit=0` を記録する。想定と違うときの扱いは Step 7 と同じ。

### Task 3: markdownlint・check-logger-trace・check-docs.sh のジョブを足す（1c）

**Files:**

- Modify: `.github/workflows/static-checks.yml`
- Modify: `docs/decisions/static-checks-in-pr-ci.md`
- Modify: `docs/decisions/index.md`
- Test: 自動テストのファイルは作らない。`$V` の 4 つのスクリプトで `needs`・判定・各ジョブの `run` を確かめ、logger.trace の検索・`check-docs.sh` を worktree で、markdownlint を `git archive` で展開した木で走らせる

**Depends on:** Task 2（親は Task 2 のブランチ）

**Behavior / Acceptance:**

- `markdownlint`（composite action で準備し `yarn markdownlint-cli2 '**/*.md'`）・`check-logger-trace`（checkout だけ。`src` の `*.{js,jsx,ts,tsx}` に `logger.trace` があれば `ファイル:行` を出して失敗、`grep` 自体のエラーも失敗）・`check-docs`（表示名 `check-docs.sh`、checkout だけ）の 3 ジョブがあり、`checks` の `needs` が 8 つ（REQ-005・REQ-006、受け入れ基準 5）
- 決定の記録のタイトル・Context・Decision・Considered Options・Consequences と `index.md` のリンクの文を更新し、タイトルと索引の文が一致する（REQ-007、受け入れ基準 6）
- コミットは `ci: run markdownlint, the logger.trace check and check-docs.sh in CI` の 1 つ。土台から 3 段通しの差分は 3 ファイルだけで、`on`・`permissions`・既存の `uses:` は変わらない（REQ-001・REQ-008、受け入れ基準 1・7・8）

- [ ] **Step 15: 作業場所と親を確かめ、依存とスクリプトを用意し、Markdown の数を測る**

  ```bash
  git branch --show-current
  git-spice ls
  git log --oneline -4
  git status --short
  git log --format=%s -1 HEAD
  test -f node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs || bash .claude/skills/project-setup/scripts/setup.sh
  mkdir -p "${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  ```

  Expected: 今のブランチは準備の段が作った item のブランチ。`git-spice ls` でそのブランチが Task 2 のブランチ（案: `ci/next-build-without-analyzer`）の直上にあり、その下が Task 1 のブランチ、さらに下が `chore/lefthook-safe-autofix-and-typecheck`。`git status --short` が空。`HEAD` の subject が `ci: build without the bundle analyzer in the static checks`（Task 2 のコミット）。前の試みのコミット `ci: run markdownlint, the logger.trace check and check-docs.sh in CI` が既にあれば、共通の前提に従い Step 20 のコミット後の確かめから再開する。親が Task 2 のブランチでなければ作業せず、bead を blocked にして報告する。

  「確かめ用スクリプト」の節の 4 つ（`check_needs.py`・`judge_checks.py`・`job_run.py`・`invariants.py`）を `$V` に置く。

  決定の記録に書く markdownlint の対象の数を、今の `HEAD` を展開した木で測る（1c は Markdown の本数を変えないため、この数がコミット後の数になる）:

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  ls "${V}"
  WT="$(git rev-parse --show-toplevel)"
  T="$(mktemp -d)"
  git archive HEAD | tar -x -C "$T"
  (cd "$T" && node "${WT}/node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs" '**/*.md') > "${V}/md-count.log" 2>&1; echo "markdownlint exit=$?"
  rm -rf "$T"
  grep -oP '(?<=Linting: )\d+(?= file)' "${V}/md-count.log" | tee "${V}/md-count"
  ```

  Expected: 4 つのスクリプトがある。`markdownlint exit=0`。`md-count` に数（計画作成時は 47）が 1 行入る。以降、この数を `<N>` と書く。

- [ ] **Step 16: 失敗する確かめを走らせる（1c の前）**

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  python3 "${V}/check_needs.py" .github/workflows/static-checks.yml typecheck,biome,knip,markuplint,build,markdownlint,check-logger-trace,check-docs; echo "exit=$?"
  ```

  Expected: `AssertionError: checks.needs must be [...]` で `exit=1`。

- [ ] **Step 17: 3 つのジョブを足し、`checks` の `needs` を変える（REQ-005・REQ-006）**

  `.github/workflows/static-checks.yml` の `build` ジョブ（`- run: yarn next build --turbopack` の行）と `checks:` の間に、次の 3 ジョブを足す（各ジョブの間に空行 1 つ。インデントはスペース 2 つ。checkout の行は既存のジョブと同じ SHA とコメント）:

  ```yaml

    markdownlint:
      name: markdownlint
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn markdownlint-cli2 '**/*.md'

    check-logger-trace:
      name: check-logger-trace
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - run: |
            status=0
            grep -rnF --include='*.js' --include='*.jsx' --include='*.ts' --include='*.tsx' 'logger.trace' src || status=$?
            if [ "$status" -eq 0 ]; then
              echo "ERROR: Remove 'logger.trace' from the files above."
              exit 1
            fi
            if [ "$status" -ne 1 ]; then
              exit "$status"
            fi

    check-docs:
      name: check-docs.sh
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - run: bash .lefthook/pre-commit/check-docs.sh
  ```

  `checks` ジョブの `needs` の行を次に変える:

  ```yaml
      needs: [typecheck, biome, knip, markuplint, build, markdownlint, check-logger-trace, check-docs]
  ```

  check-logger-trace の `run`: `grep` は見つかれば 0（`ファイル:行:内容` を出す）、見つからなければ 1、自身のエラーなら 2 を返す。`|| status=$?` で `-e` によるその場の終了を止め、0 なら ERROR 行を出して失敗、1 なら成功、それ以外は `grep` の終了コードで失敗する。lefthook の `&& exit 1 || exit 0` は `grep` のエラーを成功にするため使わない。

- [ ] **Step 18: 確かめが通ることを見る（1c）**

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  WF=.github/workflows/static-checks.yml
  python3 "${V}/check_needs.py" "$WF" typecheck,biome,knip,markuplint,build,markdownlint,check-logger-trace,check-docs; echo "needs exit=$?"
  python3 "${V}/judge_checks.py" "$WF"; echo "judge exit=$?"
  python3 - "$WF" <<'EOF'
  import sys

  import yaml

  jobs = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))["jobs"]
  setup = [job_id for job_id, job in jobs.items() if any(step.get("uses") == "./.github/actions/setup" for step in job["steps"])]
  print("setup:", setup)
  assert setup == ["typecheck", "biome", "knip", "markuplint", "build", "markdownlint"], setup
  assert [jobs[j]["name"] for j in ("markdownlint", "check-logger-trace", "check-docs")] == ["markdownlint", "check-logger-trace", "check-docs.sh"]
  print("SETUP_OK")
  EOF
  ```

  Expected: `NEEDS_OK`（`needs exit=0`）、`JUDGE_OK`（各ケースで 8 行の `<id>=<result>`、`judge exit=0`）、`SETUP_OK`。

  3 つのジョブのコマンドを worktree で実際に走らせる:

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  WF=.github/workflows/static-checks.yml
  bash --noprofile --norc -eo pipefail -c "$(python3 "${V}/job_run.py" "$WF" check-logger-trace)"; echo "trace exit=$?"
  bash --noprofile --norc -eo pipefail -c "$(python3 "${V}/job_run.py" "$WF" check-docs)"; echo "check-docs exit=$?"
  ```

  Expected: `trace exit=0`（何も出さない）、`check-docs exit=0`。

  logger.trace が見つかったときに失敗することを確かめる（コミットしない）:

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  WF=.github/workflows/static-checks.yml
  printf "export const probe = () => logger.trace('probe')\n" > src/logger-trace-probe.ts
  bash --noprofile --norc -eo pipefail -c "$(python3 "${V}/job_run.py" "$WF" check-logger-trace)"; echo "trace exit=$?"
  rm src/logger-trace-probe.ts
  git status --short
  ```

  Expected: `src/logger-trace-probe.ts:1:export const probe = () => logger.trace('probe')` と `ERROR: Remove 'logger.trace' from the files above.` が出て `trace exit=1`。後の `git status --short` は `M .github/workflows/static-checks.yml` だけ。

  `grep` 自体のエラーを成功にしないことを確かめる（`src` の無いディレクトリで走らせる）:

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  WF="$(git rev-parse --show-toplevel)/.github/workflows/static-checks.yml"
  E="$(mktemp -d)"
  (cd "$E" && bash --noprofile --norc -eo pipefail -c "$(python3 "${V}/job_run.py" "$WF" check-logger-trace)"; echo "trace exit=$?")
  rm -rf "$E"
  ```

  Expected: `grep: src: No such file or directory` が出て `trace exit=2`。

- [ ] **Step 19: 決定の記録と索引を更新する（1c、REQ-007）**

  `docs/decisions/static-checks-in-pr-ci.md` を次のとおり編集する（ファイル名・Status・Verification Status・Date・Related Files は変えない）。

  19-1. 1 行目のタイトルを次に置き換える:

  ```markdown
  # 型・Lint・未使用コード・マークアップ・Markdown・ドキュメント・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する
  ```

  19-2. Context の、Task 2 の Step 12-1 で足した段落（`` `package.json`の`build`スクリプトは… ``）の後に、空行 1 つを挟んで次を足す。`<N>` は Step 15 で測った数に置き換える:

  ```markdown
  lefthookのpre-commitで中身を確かめているmarkdownlint・check-logger-trace・`check-docs.sh`はCIになく、hookを飛ばした変更がPRに入っても見えなかった。この3つをCIのジョブにする時点（`chore/lefthook-safe-autofix-and-typecheck`の上）で、リポジトリ全体に対して次のことを確認した。

  - `yarn markdownlint-cli2 '**/*.md'`は<N>ファイルを見てエラー0件（`.markdownlint-cli2.jsonc`の`gitignore`・`ignores`で`node_modules`と`.github`配下を除く）
  - `src`配下の`*.js`・`*.jsx`・`*.ts`・`*.tsx`に`logger.trace`は0件
  - `bash .lefthook/pre-commit/check-docs.sh`はリポジトリ全体（`docs`配下と`ARCHITECTURE.md`）を見て成功し、依存のinstallが要らない（`ubuntu-latest`にあるGNUの`grep -P`と`date -d`を使う）
  ```

  19-3. Decision の最初の箇条の文 `次の5つの確かめを別々のジョブとして並列に実行する` を `次の8つの確かめを別々のジョブとして並列に実行する` に変え、その下の `next build` の箇条（Task 2 の Step 12-2 で変えた行）の後に次の 3 つの箇条を同じインデント（スペース 2 つ）で足す:

  ```markdown
    - `markdownlint`: `yarn markdownlint-cli2 '**/*.md'`（リポジトリ全体。対象の除外は`.markdownlint-cli2.jsonc`の`gitignore`・`ignores`に従う）
    - `check-logger-trace`: `src`配下の`*.js`・`*.jsx`・`*.ts`・`*.tsx`を`grep -rnF 'logger.trace'`で探し、見つかれば該当の`ファイル:行`を出して失敗する。`grep`自体のエラーも失敗にする
    - `check-docs.sh`: `bash .lefthook/pre-commit/check-docs.sh`
  ```

  さらに、Decision の「準備手順（Node.jsの用意、…）」の箇条の直後に次の箇条を足す:

  ```markdown
  - `check-logger-trace`と`check-docs.sh`は依存のinstallが要らないため、checkoutだけで走らせる（composite actionを使わない）
  ```

  19-4. Considered Options の最後の箇条（Task 2 の Step 12-3 で足した `- ワークフローの\`env\`で\`ANALYZE=false\`を渡す: …`）の後に、次の 2 つの箇条を足す:

  ```markdown
  - installが要るmarkdownlintだけがcomposite actionを使い、`check-logger-trace`と`check-docs.sh`はcheckoutだけで走らせる（採用）: 使わない依存のinstall（1回約15秒）を2回減らせる。ジョブごとに準備の手順が違う
  - 3つとも既存のジョブと同じくcomposite actionを使う: 全ジョブの形がそろうが、使わない依存のinstallに時間を使う
  ```

  19-5. Consequences の箇条 `- installを5回行う分、Actionsの使用時間が増える（1回約15秒）` を次に置き換える:

  ```markdown
  - installを6回行う分、Actionsの使用時間が増える（1回約15秒。`check-logger-trace`と`check-docs.sh`のジョブはinstallしない）
  ```

  Consequences の最後の箇条（Task 2 の Step 12-4 で足した行）の後に次の箇条を足す:

  ```markdown
  - lefthookで中身を確かめる物（biome・markuplint・markdownlint・check-logger-trace・`check-docs.sh`・knip・tsc）はすべてCIでも走る。手元だけに残るのは、手元の状態を見るprotect-branch・check-git-cleanになる
  ```

  `docs/decisions/index.md` の行

  ```markdown
  - 型・Lint・未使用コード・マークアップ・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する (path: static-checks-in-pr-ci.md)
  ```

  を

  ```markdown
  - 型・Lint・未使用コード・マークアップ・Markdown・ドキュメント・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する (path: static-checks-in-pr-ci.md)
  ```

  に置き換える（位置は変えない）。

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  yarn markdownlint-cli2 docs/decisions/static-checks-in-pr-ci.md docs/decisions/index.md; echo "exit=$?"
  bash .lefthook/pre-commit/check-docs.sh; echo "exit=$?"
  test "$(sed -n 1p docs/decisions/static-checks-in-pr-ci.md)" = "# $(grep -oP '(?<=^- \[)[^]]+(?=\]\(static-checks-in-pr-ci\.md\))' docs/decisions/index.md)"; echo "title-match exit=$?"
  grep -c "は$(cat "${V}/md-count")ファイルを見てエラー0件" docs/decisions/static-checks-in-pr-ci.md
  git diff --stat
  ```

  Expected: 3 つとも `exit=0`。`grep -c` が `1`。`git diff --stat` は `.github/workflows/static-checks.yml`・`docs/decisions/static-checks-in-pr-ci.md`・`docs/decisions/index.md` の 3 つだけ。

- [ ] **Step 20: 1c をコミットし、展開した木と親との差分で確かめる**

  コミットメッセージを `${TMPDIR:-/tmp}/ci-checks-aggregator-verify/msg-1c.txt` に書く:

  ```text
  ci: run markdownlint, the logger.trace check and check-docs.sh in CI

  These checks ran only in the lefthook pre-commit hook, so a commit
  made with hooks skipped could bring violations into a pull request
  unseen. Add a job for each that checks the whole repository, and add
  them to the needs of the checks job so they gate merges.

  Only markdownlint needs the installed dependencies; the other two run
  right after checkout. The logger.trace check fails when grep itself
  fails, not only when it finds a match. Update the decision record,
  its title and its index entry to cover the new checks.
  ```

  bead ノートに日本語訳を記録する:

  > ci: markdownlint・logger.trace の確かめ・check-docs.sh を CI で走らせる
  >
  > これらの確かめは lefthook の pre-commit だけで走っていたため、hook を飛ばしたコミットは違反を誰にも見えないまま PR に入れられた。それぞれにリポジトリ全体を見るジョブを足し、checks ジョブの needs に入れてマージの関門にする。
  >
  > 依存の install が要るのは markdownlint だけで、ほかの 2 つは checkout の直後に走る。logger.trace の確かめは、見つかったときだけでなく grep 自体が失敗したときも失敗する。新しい確かめに合わせて、決定の記録とそのタイトル・索引の行を更新する。

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  BRANCH="$(git branch --show-current)"
  git add .github/workflows/static-checks.yml docs/decisions/static-checks-in-pr-ci.md docs/decisions/index.md
  git status --short
  git-spice commit create -F "${V}/msg-1c.txt"
  test "$(git branch --show-current)" = "${BRANCH}"; echo "same-branch exit=$?"
  git status --short
  git log --oneline -1
  ```

  Expected: コミット前の `git status --short` は `M ` の 3 行だけ。コミット後も同じブランチ（`same-branch exit=0`）、`git status --short` が空、最新コミットが `ci: run markdownlint, the logger.trace check and check-docs.sh in CI`。

  Step 7 のコマンドブロックをそのまま実行する。

  Expected: markdownlint が `Linting: <N> file(s)`・`Summary: 0 error(s)` で `exit=0`（`<N>` は Step 15 の数と同じ）、check-docs が `exit=0`。親からのコミットは 1 つ、差分は `.github/workflows/static-checks.yml`・`docs/decisions/static-checks-in-pr-ci.md`・`docs/decisions/index.md` の 3 つ、`INVARIANTS_OK`（1c は既存と同じ `uses:` の値だけを足すため、値の集合は変わらない）。

  worktree で `yarn markdownlint-cli2 '**/*.md'` を走らせて追跡外の `.claude/memory` 等のエラーが出ても、判定に使わない。`.markdownlint-cli2.jsonc` と `.claude/memory` のファイルは変えない。

  bead ノートに `1c: <ブランチ名> <SHA> NEEDS_OK JUDGE_OK SETUP_OK trace exit=0/probe exit=1/no-src exit=2 check-docs exit=0 INVARIANTS_OK markdownlint(archive) <N> files 0 errors` を記録する。想定と違うときの扱いは Step 7 と同じ。

- [ ] **Step 21: 土台から 3 段通しの確かめと申し送り（REQ-001・REQ-008、受け入れ基準 1・7・8）**

  ```bash
  V="${TMPDIR:-/tmp}/ci-checks-aggregator-verify"
  git-spice ls
  git log --format=%s HEAD~3..HEAD
  for i in 2 1 0; do
    echo "== HEAD~$i"
    git diff --name-only "HEAD~$((i + 1))" "HEAD~$i"
  done
  echo "== all"
  git diff --name-only HEAD~3 HEAD
  git diff HEAD~3 HEAD -- .github/workflows/static-checks.yml | grep -nE '^[-+].*(uses:|permissions|contents:|^[-+]on:|pull_request|concurrency|push:)'; echo "grep exit=$?"
  for i in 2 1 0; do
    python3 "${V}/invariants.py" HEAD~3 "HEAD~$i" | tail -1
  done
  command -v actionlint || echo "actionlint not installed"
  ```

  Expected:

  - `git-spice ls` で `chore/lefthook-safe-autofix-and-typecheck` → Task 1 のブランチ → Task 2 のブランチ → 今のブランチが一直線に並ぶ
  - `git log --format=%s HEAD~3..HEAD` が上から `ci: run markdownlint, the logger.trace check and check-docs.sh in CI`・`ci: build without the bundle analyzer in the static checks`・`ci: add a checks job that gates on every static check` の 3 行（各段のコミットは 1 つ）
  - 各段の差分のファイルは 1a: `.github/workflows/static-checks.yml`・`docs/decisions/static-checks-in-pr-ci.md`、1b: 同じ 2 つ、1c: その 2 つと `docs/decisions/index.md`
  - 通しの差分は上の 3 ファイルだけ（`lefthook.yml`・`package.json`・`.github/actions/` が無い）
  - `grep` が出すのは 1c の 3 ジョブの `+        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` と `+        - uses: ./.github/actions/setup`（markdownlint の 1 行）だけで、`-` の行・`permissions`・`on:`・`concurrency`・`push:` の行は無い
  - `INVARIANTS_OK` が 3 行
  - `actionlint` は無いので `actionlint not installed`。bead ノートに「actionlint はこの環境に無く実行していない。YAML は PyYAML で読めることを Step 4・10・18 で確かめた」と記録する（受け入れ基準 8）

  1c の分が想定と違えば、このブランチで直して `git add` → `git-spice commit amend --no-edit` し、Step 20 の確かめからやり直す。1a・1b の分が想定と違う（下の Task のブランチの中身の問題）場合は、下のブランチを切り替えて直さず、bead を blocked にして理由を書き、報告する。

  bead ノートに、3 ブランチの名前と SHA、REQ-001〜REQ-008 と受け入れ基準 1〜8 の結果、後段への申し送りを記録する。申し送り: push は publish の段が下から行い、PR はこの build では作らない。必須のチェックの登録を `checks` と `Validate PR title` だけにするのは人がリポジトリの設定で行う。tf-in9ab（`cache: yarn`）はこのスタックが `static-checks.yml` を変えていることを前提にする。1c の上に別の build（tf-c7ibz → tf-dj4bc）の枝が積まれ、`checks` の `needs` を触る。

## Non-Goals

- ブランチ保護の必須のチェックの登録の変更（`checks` と `Validate PR title` だけにする）。人がリポジトリの設定で行う
- `lefthook.yml` の変更・手元のフックからの確かめの削除
- `package.json` の `build` スクリプトの変更（手元の `yarn build` の挙動は変えない）
- 依存のキャッシュ（`cache: yarn`、tf-in9ab）・`concurrency`・`push` トリガー・新しい外部の Action の追加
- `docs/design/specs/static-checks-ci.md`・`docs/design/requirements/static-checks-ci-requirements.md` の書き換え
- 決定の記録の Status・Verification Status・Date・Related Files・ファイル名の変更（Verification Status は CI が実際に走るまで `Unverified` のまま）
- backend リポジトリ側のまとめ役、CodeQL 等のセキュリティの確かめ、テストの道具（それぞれ別の build）
- 実装の Task でのブランチの作成・push・PR の作成（ブランチは item の準備の段、push は publish の段が行い、PR はこの build では作らない）
- `docs/superpowers/specs/`・`docs/superpowers/plans/` への写し（requirements と同じく、この build の成果物は `.gc-artifacts/ci-checks-aggregator/` を正とする）

## Validation and Acceptance

### Coverage

| ID | Status | Task / Step | Acceptance |
| --- | --- | --- | --- |
| REQ-001 | covered | Task 1 Step 1・Step 7、Task 2 Step 8・Step 14、Task 3 Step 15・Step 20・Step 21（スタックの並びの最終の確かめは finalize の段） | 受け入れ基準 1 |
| REQ-002 | covered | Task 1 Step 2・Step 3・Step 4、Task 3 Step 18 | 受け入れ基準 2 |
| REQ-003 | covered | Task 1 Step 5・Step 6・Step 7 | 受け入れ基準 3 |
| REQ-004 | covered | Task 2 Step 9・Step 10・Step 11・Step 12・Step 14 | 受け入れ基準 4 |
| REQ-005 | covered | Task 3 Step 16・Step 17・Step 18・Step 20 | 受け入れ基準 5 |
| REQ-006 | covered | Task 3 Step 17・Step 18 | 受け入れ基準 5 |
| REQ-007 | covered | Task 3 Step 15・Step 19・Step 20 | 受け入れ基準 6 |
| REQ-008 | covered | Task 1 Step 7、Task 2 Step 10・Step 14、Task 3 Step 18・Step 21 | 受け入れ基準 7・8 |

### 確かめの一覧

- 受け入れ基準 1: 各 Task の最初のステップ（親が想定どおり）と最後の確かめ（親からのコミット 1 つ・差分のファイル）、Task 3 Step 21 の `git-spice ls` と `HEAD~3..HEAD` の subject。`gc.build.branches` としての並びは finalize の段が確かめる
- 受け入れ基準 2: Task 1 Step 4（1a）と Task 3 Step 18（1c）の `NEEDS_OK`・`JUDGE_OK`。`judge_checks.py` は判定のステップを `bash -eo pipefail` で、全 `success` → 0、`failure`・`cancelled`・`skipped` → 非 0 を確かめる
- 受け入れ基準 3: Task 1 Step 5 の 5-1〜5-4 の文が 1a のコミットにある（`git show <Task 1 のブランチ> -- docs/decisions/static-checks-in-pr-ci.md`）
- 受け入れ基準 4: Task 2 Step 10（`run` が `yarn next build --turbopack`、`ANALYZE` 無し）、Step 11（ビルド exit 0、解析の警告 0 件）、Step 12（決定の記録）、Step 14（`package.json` が差分に無い）
- 受け入れ基準 5: Task 3 Step 18（3 ジョブ・`needs`・setup は markdownlint だけ、logger.trace 0 件で成功・1 件で失敗・`grep` のエラーで失敗、check-docs 成功）、Step 20（展開した木で markdownlint 成功）
- 受け入れ基準 6: Task 3 Step 19（タイトルと索引の一致、Markdown の数、check-docs 成功）、Step 20（展開した木で markdownlint 成功）
- 受け入れ基準 7: 各 Task の最後の確かめの `invariants.py`、Task 3 Step 21 の通しの差分・`grep`・`INVARIANTS_OK`
- 受け入れ基準 8: Task 1 Step 4・Task 2 Step 10・Task 3 Step 18 で PyYAML が読めること。`actionlint` は無いため実行していないと Task 3 Step 21 で記録する
- GitHub Actions での実際の実行（`checks` の表示・成否）は、publish の後に人が PR を作ったときの PR のチェックで確かめる

### Risks

- `checks` の `needs` にジョブを入れ忘れると、そのジョブは関門から漏れる: `check_needs.py` が `needs` と全ジョブの一致を確かめる。決定の記録の Consequences にも書く
- `--turbopack` の指定が `package.json` とワークフローの 2 か所になる: 決定の記録の Consequences に書く
- `git-spice commit create` の後、未ステージの変更が残っていると HEAD が上段のブランチへ移る（メモリ `gs_commit_restack_dirty_tree.md`）: 各コミットの前に `git status --short` で未ステージの変更が無いことを見て、後に同じブランチのままかを確かめる。各 Task は自分の item のブランチより上にブランチを持たないため、移る先は無いはず
- 準備の段が想定と違う親でブランチを作る（依存の記録の欠け等）: 各 Task の最初のステップで `git-spice ls` と `HEAD` の subject を見て、違えば作業せずに止める
- PR #955 が実装までにマージ・更新される: 土台は workflow root の `gc.var.base_branch` で決まり、Task 1 の準備の段が `origin/chore/lefthook-safe-autofix-and-typecheck` の最新から作る。Task 1 Step 1 で `HEAD` と `origin/...` の一致を見る
- worktree で `yarn markdownlint-cli2 '**/*.md'` を走らせると追跡外の `.claude/memory`（symlink）を拾って失敗する（メモリ `markdownlint_glob_lints_untracked_memory.md`）: 全体の markdownlint は `git archive` で展開した木だけで判定する
- logger.trace の確かめの一時ファイルがコミットに入る: Task 3 Step 18 で消して `git status --short` を見る。pre-push の check-git-clean も止める
- 1c の上に別の build（tf-c7ibz → tf-dj4bc）が積まれ `needs` を触る: 後から並ぶ側が積み直しで合わせる（Task 3 Step 21 で bead ノートに申し送る）

### 前提と判断（headless のため質問せず記録）

- 実装タスクは 3 つ（Task 1 = 1a、Task 2 = 1b、Task 3 = 1c）。依存は Task 2 → Task 1、Task 3 → Task 2。ブランチの作成と `gc.git_branch` の記録は item の準備の段、push は publish の段が行う
- ブランチ名の案は `ci/static-checks-aggregator`・`ci/next-build-without-analyzer`・`ci/markdown-docs-trace-checks`（`<type>/<変更内容>`、type は `ci`）。準備の段が別の名前を選んだときは `git branch --show-current` の値で読み替える
- 決定の記録の Related Files は変えない（requirements が変更を求めておらず、ワークフローのファイルは既に載っている）
- 決定の記録の Context に書く markdownlint の対象の数は、Task 3 Step 15 で展開した木で測った数にする（計画作成時は 47）
- コミット前の日本語訳の提示は、自律実行のため bead ノートへの記録で満たす

## Decision Log

- 2026-11-19: plan-review で計画を承認。正式な plan/spec を保存する方針を採用。保存しない旨の旧記述はこの決定で変更。出典: /home/node/tascon-frontend/.gc-artifacts/ci-checks-aggregator/requirements.md, /home/node/tascon-frontend/.gc-artifacts/ci-checks-aggregator/brainstorming/design.md, /home/node/tascon-frontend/.gc-artifacts/ci-checks-aggregator/implementation-plan.md。 保存時の documents base に存在しないリンクは、リンクテキストと元の参照先をプレーンテキストで保持: `static-checks-in-pr-ci.md`。

## Progress

- plan-review 承認済み。実装前。
