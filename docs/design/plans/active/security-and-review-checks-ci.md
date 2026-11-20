# CodeQL・Semgrep・Dependency Review・code-review-graph を PR ごとの CI に入れる Implementation Plan

Spec: docs/design/specs/security-and-review-checks-ci.md
Worktree: 実装 item の準備時に個別の worktree を記録する。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** tascon-frontend に、`static-checks.yml` のジョブ `semgrep`・`dependency-review`（どちらも `checks` の `needs` に入れる）、別のワークフロー `codeql.yml`・`code-review-graph.yml`（`needs` に入れない）、hash 付きの Python の requirements、`dependabot.yml` の `pip`、決定の記録を、tf-rrr6j の最上段（origin に push 済みの先端）の上に一直線に積んだ 3 本のブランチで入れる（push は publish の段が行う）。

**Architecture:** 合否を返す Semgrep と Dependency Review は `checks` が待てる同じワークフロー `Static Checks` のジョブにし、マージ先（`main`）の解析が要る CodeQL と報告だけの code-review-graph は別のワークフローに置く。外から持ち込む物はすべて不変の ID（Action は 40 桁の SHA と行末のタグ、Python の道具は `--hash=sha256:` 付きの requirements と `pip install --require-hashes`、規則とレンダラは `actions/checkout` の `ref:` の SHA）で固定する。形はバックエンドの先例（tascon-backend の PR #837・#839・#840）に合わせる。

**Tech Stack:** GitHub Actions、`actions/checkout` v7.0.1、`actions/setup-python` v7.1.0（Python 3.13.18）、`github/codeql-action` v4.39.3、`actions/dependency-review-action` v5.0.0、Semgrep 1.186.0（`semgrep/semgrep-rules` の SHA `a5ad1714…`）、code-review-graph 2.4.0、pip-compile の hash 付き requirements、Dependabot、git-spice

---

## Context/Purpose

- 依頼: tf-c7ibz（依頼 gc-xtys の 2 の一部）。workflow root: tf-p0zkq。承認済み requirements: `/home/node/tascon-frontend/.gc-artifacts/security-and-review-checks-ci/requirements.md`（REQ-001〜REQ-012）。承認済み設計: `brainstorming/design.md`（案 A）
- 実装タスクは 3 つ。各 Task は、実装の段の準備（`do-work/prepare-worktree`）が item ごとに作る worktree とブランチの上で作業し、自分ではブランチを作らない。Task 1 の親は tf-rrr6j の最上段、Task 2・3 の親は前の Task のブランチ
  - Task 1: `ci/add-codeql-and-semgrep`（REQ-001・003・005・006・007・008・009・010・012）。ジョブ `semgrep` と `checks` の `needs` への `semgrep` の追加を含む
  - Task 2: `ci/add-dependency-review`（REQ-002・009・010・012）。ジョブ `dependency-review` と `checks` の `needs` への `dependency-review` の追加を含む
  - Task 3: `ci/add-code-review-graph-report`（REQ-004・005・007・008・009・010・011・012）。積んだ後の中身での最終確認と、PR 本文用の情報（この item の実装の要約）を含む
- 依存の順: Task 2 は Task 1、Task 3 は Task 2 に依存する（直列）
- Task 1 は tf-rrr6j の最上段が origin に push され、そこに `checks` があるときだけ進める。満たさなければコミットせずに blocked にして mayor に知らせる（REQ-010）。そのため、ブランチは始めから tf-rrr6j の最上段の上に積まれ、後から並べ直さない
- push は publish の段（`build-base/publish`、`push=true`）が `gc.build.branches` を下から行う。PR は作らない（`open_pr=false`）

### 工程との対応（traceability）

この formula は requirements・plan・plan-review・decompose・implement・review・finalize・publish の各段を自分で実行している。この計画の `### Task N` はソースの変更だけを扱う。

| 段 | この計画での扱い |
| --- | --- |
| decompose | `### Task 1`〜`### Task 3` をそれぞれ実装 bead にする。Task N は Task N-1 に依存（直列）。各 Task の見出しのブランチ名を、準備の段が使う名前の案として渡す |
| implement（準備） | 準備の段が item ごとに worktree とブランチを 1 本作り、source anchor に `gc.git_branch` を記録する。親は依存先の item の `gc.git_branch`、依存が無ければ `origin/<base_branch>`（tf-rrr6j の最上段） |
| implement | 各 Task の Step を上から順に実行する。どの Task もコミットまでで、push しない |
| summarize-implementation・finalize | Task 1 の item の実装の要約に Semgrep の件数（REQ-008）、Task 3 の item の実装の要約に PR 本文用の情報（REQ-011）を書く。finalize が root の正本（`gc.build.implementation_summary_path`）を作るときに引き継ぐ。root の正本のパスには Task から直接書かない |
| publish | `push=true` のため、publish の段が `gc.build.branches` を下から push する。PR は作らない（後段の stack-review が出す） |

### 計画時に置いた仮定（headless のため質問せず記録）

1. **土台の選び方**: mayor は tf-rrr6j の push が済んだら root tf-p0zkq の `gc.var.base_branch` をその最上段に替える（root の notes）。準備の段はその値から Task 1 の親を決める。requirements の「始めは `chore/lefthook-safe-autofix-and-typecheck` から切ってよい」は許すだけで求めてはいないため、この計画は tf-rrr6j の push を待ってから Task 1 を始める。Task 1 の前提条件で、親が tf-rrr6j の最上段で `checks` があることを確かめ、満たさなければコミットせずに止める。朝の期限のために tf-rrr6j の push を待たずに始める必要が出た場合は、`needs` の追加を別のブランチに移す等で REQ-010 の割り当てが変わるため、計画の中で決めず requirements の段に戻す
2. **requirements の `.txt` の作り方**: 手元の Python は 3.11.2 で、CI は 3.13.18。pip-compile の結果は Python の版で変わりうるため、手元で作り直さず、同じ `.in`（`semgrep==1.186.0`・`code-review-graph==2.4.0`）から Python 3.13 の pip-compile で作られたバックエンドの `.txt` を写す。写し元は tascon-backend のコミット `b375ab11ea86aa1a0be740ee6bf1e99a8fd7c8c1`（ブランチ `ci/add-code-review-graph-report` の先端、計画作成時点）の blob（`semgrep.txt` = `f5195cab76eecaea7ba203459747733a959e7b69`、`code-review-graph.txt` = `f8ac78c20534b13d63281b5f710b28ffe2c23945`、`semgrep.in` = `8c1b6331b2dd4d66fd0a9a93a9a2cc599dfe15f7`、`code-review-graph.in` = `4ed6dd521ed6bdba6e50715b858aded8188ab6f8`）。blob の SHA で取り出すため、ブランチが動いても同じ中身になる。中身のヘッダー（`pip-compile --allow-unsafe --generate-hashes --no-emit-index-url --output-file=… --strip-extras ….in`）はそのまま残す
3. **手元の Semgrep**: 確かめのために、システムの一時ディレクトリの venv に `pip install --require-hashes -r .github/requirements/semgrep.txt` で入れる。Python 3.11 で `--require-hashes` の install が失敗した場合（3.13 で要らない依存が足りない等）は、`--no-deps` で入れ、足りない物だけを hash なしで同じ venv に足して走らせる（手元の確かめだけ。コミットする `.txt` は変えない）。どちらで走らせたかを bead ノートに書く
4. **規則の取り出し（手元）**: `semgrep/semgrep-rules` を一時ディレクトリへ `git clone --filter=blob:none --sparse` し、`git checkout a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2` する。リポジトリへは写さない（REQ-012）
5. **ブランチ名とコミットの type**: ブランチ名は requirements の REQ-010 のとおりで、準備の段がその名前でブランチを作る前提で書く（以下、各 Task の見出しの名前で呼ぶ）。準備の段が別の名前で作った場合は、名前を変えず（`gc.git_branch` と食い違うため）、実際の名前を bead ノートと item の実装の要約に書いて続ける。ワークフロー・requirements・dependabot の変更は `ci`。`nosemgrep` のコメントの追加は挙動を変えない注記で、ワークフローとは別の目的なので、別の `chore` コミットにする。決定の記録は `docs`

## Current System

計画作成時点（`origin/chore/lefthook-safe-autofix-and-typecheck` = `a0345abe`）の状態。

- `.github/workflows/`: `semantic-pull-request.yml`・`static-checks.yml`。`static-checks.yml` は `name: Static Checks`、`on: pull_request:`、`permissions: contents: read`、ジョブ `typecheck`（表示名 `tsc --noEmit`）・`biome`・`knip`・`markuplint`・`build`。各ジョブは `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` → `./.github/actions/setup` → `run`。tf-rrr6j が 1a で `checks`（`needs` 全体を `toJSON(needs)` と `jq` で判定、`if: always()`、`needs` は flow 形式の 1 行の予定）、1b で `build` を `yarn next build --turbopack`、1c で `markdownlint`・`check-logger-trace`・`check-docs` を足す予定。tf-rrr6j の枝はまだ origin にない
- `.github/dependabot.yml`: `docker`（`directory: '/'`、`reviewers`、`ignore` あり）と `npm`（`directory: '/'`）の 2 項目。値はシングルクォート。`npm` の項目は `schedule`（`interval: 'daily'`・`time: '03:00'`・`timezone: 'Asia/Tokyo'`）・`commit-message.prefix: 'build'`・`target-branch: 'main'`
- `.github/requirements/` はない。`.semgrepignore` はない
- `docs/decisions/index.md`: 記録へのリンクを 1 行ずつ並べる。`docs/decisions/static-checks-in-pr-ci.md` が「外部の Action は公開から 2 週間以上たったリリースのコミット SHA で固定し、行末にタグ」「Action の更新は手で行う」を決めている
- `.yarn/`: 追跡対象（`cache` の zip と `releases/yarn-4.4.0.cjs`）。解析の道具から外す必要がある（TS-3）
- アプリのコードは `src/`（Next.js・React・TypeScript）
- 手元の道具: `python3` 3.11.2（`venv` あり）、`gh`。`uv`・`pip-compile`・`actionlint`・`semgrep` はない
- バックエンドの先例（tascon-backend、すべて OPEN）: #837 `ci/add-codeql-and-semgrep`（`codeql.yml`、`ci.yml` の `semgrep`、`semgrep.in`/`.txt`、`dependabot.yml` の `pip`、既存の 8 件を `nosemgrep` と理由のコメントで外した）、#839 `ci/add-dependency-review`、#840 `ci/add-code-review-graph-report`。決定の記録 `test-and-check-tool-selection.md`・`ci-required-and-report-only-checks.md`（DeepSec・`/security-review`・レジストリ・`fail-on-risk` を採らない理由を Considered Options に書いている）
- コミット規約（`git-spice-workflow` Skill）: 英語、Conventional Commits、body 必須、コミット前に日本語訳を示す（autonomous なので bead ノートに書く）。`git-spice commit create -F <file>` を使い、素の `git commit` は使わない
- `lefthook.yml` の pre-commit は `markdownlint`（`*.md`）・`biome`・`check-docs` 等、pre-push は `knip`・`check-git-clean`・`tsc`

## Proposed Implementation

### File Structure

- Task 1（`ci/add-codeql-and-semgrep`）
  - Create: `.github/workflows/codeql.yml` — CodeQL の解析（`pull_request` と `main` への `push`）
  - Modify: `.github/workflows/static-checks.yml` — ジョブ `semgrep` を足し、`checks` の `needs` の末尾に `semgrep` を足す（REQ-012 の例外の `needs` の 1 行を除き、行の追加だけ）
  - Create: `.github/requirements/semgrep.in`・`.github/requirements/semgrep.txt`
  - Modify: `.github/dependabot.yml` — `pip` の項目
  - Modify（指摘がある場合だけ）: `src/**` の該当行に `nosemgrep` と理由のコメント
  - Create: `docs/decisions/security-and-review-checks-in-pr-ci.md`、Modify: `docs/decisions/index.md`（1 行）
- Task 2（`ci/add-dependency-review`）
  - Modify: `.github/workflows/static-checks.yml`（ジョブ `dependency-review` と、`checks` の `needs` の末尾への `dependency-review`）、`docs/decisions/security-and-review-checks-in-pr-ci.md`
- Task 3（`ci/add-code-review-graph-report`）
  - Create: `.github/workflows/code-review-graph.yml`、`.github/requirements/code-review-graph.in`・`.txt`
  - Create（道具が除外の仕組みを持つ場合だけ）: その仕組みのファイル（`.yarn/` を外す）
  - Modify: `docs/decisions/security-and-review-checks-in-pr-ci.md`
  - リポジトリの外: この item の実装の要約に PR 本文用の情報の節（REQ-011）。root の `gc.build.implementation_summary_path` には直接書かない
- 変えないファイル（REQ-012）: `lefthook.yml`、`.lefthook/`、`static-checks.yml` の既存のジョブ・トリガー・`permissions`、`semantic-pull-request.yml`、`package.json`

### 共通の手順（各 Task から参照する）

#### 共通 A: コミット

```bash
MSG="$(mktemp)"
cat > "$MSG" <<'EOF'
<subject>

<body>
EOF
gc bd update <TASK_BEAD_ID> --append-notes "コミット予定（日本語訳）: <件名と本文の日本語訳>"
git-spice commit create -F "$MSG"
git log --oneline -1
git branch --show-current
```

Expected: 現在のブランチがこの Task のブランチのまま、最新のコミットが今のメッセージ、pre-commit が通る。

#### 共通 B: 準備の段が作ったブランチと親を確かめる

各 Task は自分でブランチを作らない（`git-spice branch create` を使わない）。準備の段が作った worktree とブランチの上で作業する。`<PARENT>` は Task ごとに決まる想定の親（Task 1 は `origin/$BASE`、Task 2 は Task 1 の item の `gc.git_branch`、Task 3 は Task 2 の item の `gc.git_branch`）。

```bash
ITEM_BRANCH="$(git branch --show-current)"
PARENT="<PARENT>"
echo "ITEM_BRANCH=$ITEM_BRANCH PARENT=$PARENT"
git status --short
git rev-parse --short HEAD "$PARENT"
git merge-base --is-ancestor "$PARENT" HEAD && echo "parent is an ancestor"
git log --oneline "$PARENT"..HEAD
git-spice ls
test -f node_modules/markdownlint-cli2/markdownlint-cli2-bin.mjs || bash .claude/skills/project-setup/scripts/setup.sh
gc bd update <TASK_BEAD_ID> --append-notes "作業ブランチ: $ITEM_BRANCH（親 $PARENT = $(git rev-parse --short "$PARENT")）"
```

Expected: `ITEM_BRANCH` が空でなく、その Task の見出しのブランチ名（違う場合は仮定 5）。`git status --short` が空。`parent is an ancestor`。`git log` は初回なら空（再試行ではこの Task 自身のコミットだけ）。`git-spice ls` で `ITEM_BRANCH` が `PARENT` の 1 つ上に積まれている。満たさない場合は、2 本目のブランチを作らず、コミットもせずに、食い違いを bead ノートに書き、bead を blocked にして assignee を外し、`gc mail send mayor` で知らせて drain する。

#### 共通 C: `uses:` の固定の確かめ（REQ-005）

```bash
grep -rhoE 'uses:\s*\S+(\s+#.*)?' .github/workflows .github/actions | sort -u
grep -rnE 'uses:\s*\S+' .github/workflows .github/actions \
  | grep -vE 'uses:\s*\./\.github/actions/setup\s*$' \
  | grep -vE 'uses:\s*[^@[:space:]]+@[0-9a-f]{40}\s+#\s*v[0-9]' || echo "all pinned"
```

Expected: 2 つ目が `all pinned`。tf-rrr6j が持ち込んだ行が出た場合は、この build の変更でなければそのまま（bead ノートに書く）。

#### 共通 D: YAML の読み込みと `checks` の照合

```bash
python3 - <<'PY'
import glob, yaml
for f in sorted(glob.glob(".github/workflows/*.yml")) + [".github/dependabot.yml"]:
    yaml.safe_load(open(f)); print("ok", f)
jobs = yaml.safe_load(open(".github/workflows/static-checks.yml"))["jobs"]
needs = jobs.get("checks", {}).get("needs")
needs = [needs] if isinstance(needs, str) else (needs or [])
print("jobs :", list(jobs))
print("needs:", needs if "checks" in jobs else "(no checks job)")
print("missing:", sorted(set(jobs) - {"checks"} - set(needs)))
PY
```

#### 共通 E: 手元で Semgrep を走らせる（REQ-008）

```bash
T="${TMPDIR:-/tmp}/semgrep-tf-p0zkq"
mkdir -p "$T"
[ -d "$T/rules" ] || git clone --filter=blob:none --sparse https://github.com/semgrep/semgrep-rules "$T/rules"
git -C "$T/rules" sparse-checkout set typescript/react typescript/lang javascript/react javascript/browser javascript/lang
git -C "$T/rules" checkout --quiet a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2
git -C "$T/rules" rev-parse HEAD
[ -x "$T/venv/bin/semgrep" ] || { python3 -m venv "$T/venv" && "$T/venv/bin/python" -m pip install --require-hashes -r .github/requirements/semgrep.txt; }
"$T/venv/bin/semgrep" --version
"$T/venv/bin/semgrep" scan \
  --config "$T/rules/typescript/react" --config "$T/rules/typescript/lang" \
  --config "$T/rules/javascript/react" --config "$T/rules/javascript/browser" \
  --config "$T/rules/javascript/lang" \
  --metrics=off --error --exclude .yarn
echo "exit=$?"
```

Expected: `rev-parse` が `a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2`、`semgrep --version` が `1.186.0`。`--require-hashes` の install が Python 3.11 で失敗したら仮定 3 に従う。規則のディレクトリが読み込めない（`Invalid rule`・存在しない等で設定のエラーになる）場合は、そのディレクトリを外して走らせ、外したディレクトリと理由を bead ノートに書く（Task 1 の決定の記録とワークフローからも外す）。

### Task 1: CodeQL と Semgrep を入れる（`ci/add-codeql-and-semgrep`）

**Files:**

- Create: `.github/workflows/codeql.yml`、`.github/requirements/semgrep.in`、`.github/requirements/semgrep.txt`、`docs/decisions/security-and-review-checks-in-pr-ci.md`
- Modify: `.github/workflows/static-checks.yml`（ジョブ `semgrep` の追加と、`checks` の `needs` の末尾への `semgrep`）、`.github/dependabot.yml`、`docs/decisions/index.md`、指摘がある場合は `src/**` の該当行
- Test: 共通 B・C・D・E、`pip install --require-hashes`、markdownlint、check-docs

**前提条件（実装セッション）:** セッションの作業ディレクトリが準備の段の作ったこの item の worktree（`.claude/worktrees/gc-<source-anchor-id>`）であること。main checkout のブランチは切り替えない。`gh stack` は使わない。準備の段が作ったブランチの親が tf-rrr6j の最上段（origin に push 済みの先端）で、そこに `checks` ジョブがあること（Step 1 で確かめる）。

- [ ] **Step 1: 親が tf-rrr6j の最上段で `checks` があることを確かめる（REQ-010）**

  ```bash
  git fetch origin
  BASE="$(gc bd show tf-p0zkq --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.var.base_branch"]')"
  RRR_TOP="$(gc bd show tf-rrr6j --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.build.branches"] // empty | fromjson | last')"
  echo "BASE=$BASE RRR_TOP=$RRR_TOP"
  git rev-parse "origin/$BASE"
  git show "origin/$BASE:.github/workflows/static-checks.yml" | grep -nE '^  checks:|^    needs:'
  ```

  続いて共通 B を `PARENT="origin/$BASE"` で走らせ、共通 D を走らせる。

  Expected: `BASE` が `chore/lefthook-safe-autofix-and-typecheck` ではない。`origin/$BASE` がある。`RRR_TOP` が空でなければ `BASE` と同じ。`static-checks.yml` に `checks:` と `needs:` がある。共通 B が通り、共通 D の `needs` が `(no checks job)` ではない。

  満たさない場合（土台が `chore/lefthook-safe-autofix-and-typecheck` のまま、`origin/$BASE` が無い、`RRR_TOP` と食い違う、`checks` が無い）は、コミットせずに、確かめた値を bead ノートに書き、bead を blocked にして理由を書き、assignee を外し、`gc mail send mayor` で「tf-p0zkq の Task 1 は tf-rrr6j の最上段が push され gc.var.base_branch が替わるのを待っている（または `checks` が無い）」と知らせて drain する（REQ-010）。満たす場合は「Task 1 の親: $BASE ($(git rev-parse --short "origin/$BASE"))、tf-rrr6j の最上段と一致、`checks` あり」を bead ノートに書く。

- [ ] **Step 2: 新しく持ち込む物が公開から 2 週間以上たっていることを確かめる（REQ-005）**

  基準日は 2026-11-06（実装日の 2 週間前。実装日がずれたらその 2 週間前）。

  ```bash
  gh api repos/actions/setup-python/git/ref/tags/v7.1.0 --jq .object.sha
  gh release view v7.1.0 -R actions/setup-python --json publishedAt
  gh api repos/github/codeql-action/git/ref/tags/v4.39.3 --jq .object.sha
  gh release view v4.39.3 -R github/codeql-action --json publishedAt
  gh api repos/actions/dependency-review-action/git/ref/tags/v5.0.0 --jq .object.sha
  gh release view v5.0.0 -R actions/dependency-review-action --json publishedAt
  gh api repos/semgrep/semgrep-rules/commits/a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2 --jq .commit.committer.date
  gh api repos/tirth8205/code-review-graph/git/ref/tags/v2.4.0 --jq .object.sha
  gh api repos/tirth8205/code-review-graph/commits/b3f1285965a1337b3821e4423da03b65d70ee423 --jq .commit.committer.date
  curl -s https://pypi.org/pypi/semgrep/1.186.0/json | jq -r '.urls[0].upload_time'
  curl -s https://pypi.org/pypi/code-review-graph/2.4.0/json | jq -r '.urls[0].upload_time'
  ```

  Expected: タグの SHA が `6d4fd22b20465ccc0f7354476588e8df7c9ca0e0`・`33d7b85da1a04171e211befe2c739303b9a4c066`・`a1d282b36b6f3519aa1f3fc636f609c47dddb294`・`b3f1285965a1337b3821e4423da03b65d70ee423` と一致する（注釈付きタグで `object.sha` がタグの物なら `gh api repos/<repo>/git/tags/<sha> --jq .object.sha` でコミットの SHA を引く）。日付がすべて基準日以前。結果を bead ノートに書く（決定の記録の根拠にもなる）。満たさない物があれば、その道具の公開から 2 週間以上たった直近のリリースに替え、Task 1〜3 の該当の行を替え、替えたことと理由を決定の記録の Consequences に書く。

- [ ] **Step 3: requirements を写す（仮定 2）**

  ```bash
  mkdir -p .github/requirements
  R=P-manBrown/tascon-backend
  gh api repos/$R/git/blobs/8c1b6331b2dd4d66fd0a9a93a9a2cc599dfe15f7 --jq .content | base64 -d > .github/requirements/semgrep.in
  gh api repos/$R/git/blobs/f5195cab76eecaea7ba203459747733a959e7b69 --jq .content | base64 -d > .github/requirements/semgrep.txt
  cat .github/requirements/semgrep.in
  head -8 .github/requirements/semgrep.txt
  git hash-object .github/requirements/semgrep.in .github/requirements/semgrep.txt
  python3 - <<'PY'
  import re
  text = open(".github/requirements/semgrep.txt").read()
  pkgs = re.findall(r"^([A-Za-z0-9_.\-]+)==\S+((?:\s*\\\n\s+--hash=sha256:[0-9a-f]{64})*)", text, re.M)
  total = len(re.findall(r"^[A-Za-z0-9_.\-]+==", text, re.M))
  print("packages:", total, "with hash:", sum(1 for _, h in pkgs if h))
  PY
  ```

  Expected: `.in` が `semgrep==1.186.0` の 1 行。`.txt` のヘッダーに `pip-compile … --generate-hashes …`。`git hash-object` が `8c1b6331…`・`f5195cab…`。`packages` と `with hash` の数が一致する（バックエンドの記録では 67 / 67）。

- [ ] **Step 4: Semgrep を手元で走らせ、既存の指摘を扱う（共通 E、REQ-008）**

  この時点の作業ツリーは tf-rrr6j の最上段の上に積まれているため、ここでの結果が REQ-008 の「積み直した後の中身」での結果になる（Task 2・3 は `src` を変えない。Task 3 Step 6 でもう一度だけ走らせる）。

  `exit=0` なら指摘 0 件として bead ノートに書き、Step 5 へ。

  指摘がある場合は、1 件ずつ該当のコードを読み、次で分ける:

  - 誤検知・意図した使い方（例: 定数の文字列だけを渡す、React がエスケープする所への指摘）: 挙動を変えず、指摘の行の直前（または同じ行の末尾）に理由と `nosemgrep: <rule-id>` を書く。`.ts`・`.tsx` の式の中なら `// <理由>. nosemgrep: <rule-id>`、JSX の中なら `{/* <理由>. nosemgrep: <rule-id> */}`。理由は英語で 1 文（コードのコメントの既存の言語に合わせる）
  - 本物の問題: 外さない。指摘（規則の id・ファイル:行・内容）を bead ノートに書き、`gc mail send mayor` で知らせ、bead を blocked にして理由を書き、assignee を外して drain する（requirements の REQ-008・設計の節 8）

  付け終えたら共通 E をもう一度走らせる。Expected: `exit=0`。件数（付ける前の件数、外した件数、規則ごとの内訳、最終の終了コード）を bead ノートと、この item の実装の要約に書く（REQ-008）。`git diff --stat -- src` で、変えたのがコメントの行だけであることを確かめる（`git diff -U0 -- src | grep '^[+-][^+-]' | grep -v 'nosemgrep'` が何も出さない）。

- [ ] **Step 5: ワークフローを書く**

  `.github/workflows/codeql.yml`:

  ```yaml
  name: CodeQL

  on:
    pull_request:
    push:
      branches: [main]

  permissions:
    contents: read
    security-events: write

  jobs:
    analyze:
      name: Analyze (javascript-typescript)
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
          with:
            persist-credentials: false
        - uses: github/codeql-action/init@33d7b85da1a04171e211befe2c739303b9a4c066 # v4.39.3
          with:
            languages: javascript-typescript
            build-mode: none
            config: |
              paths-ignore:
                - .yarn
        - uses: github/codeql-action/analyze@33d7b85da1a04171e211befe2c739303b9a4c066 # v4.39.3
          with:
            category: "/language:javascript-typescript"
  ```

  `.github/workflows/static-checks.yml` の `jobs` の `checks` ジョブの直前に足す（既存の行は変えない）。Step 4 で外した規則のディレクトリがあれば `sparse-checkout` と `--config` から除く:

  ```yaml
    semgrep:
      name: semgrep
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
          with:
            persist-credentials: false
        - name: Check out the Semgrep rules
          uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
          with:
            repository: semgrep/semgrep-rules
            ref: a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2
            path: .semgrep-rules
            sparse-checkout: |
              typescript/react
              typescript/lang
              javascript/react
              javascript/browser
              javascript/lang
            persist-credentials: false
        - name: Move the rules out of the workspace
          run: mv .semgrep-rules "$RUNNER_TEMP/semgrep-rules"
        - uses: actions/setup-python@6d4fd22b20465ccc0f7354476588e8df7c9ca0e0 # v7.1.0
          with:
            python-version: "3.13.18"
        - name: Install Semgrep
          run: python -m pip install --require-hashes -r .github/requirements/semgrep.txt
        - name: semgrep
          run: >-
            semgrep scan
            --config "$RUNNER_TEMP/semgrep-rules/typescript/react"
            --config "$RUNNER_TEMP/semgrep-rules/typescript/lang"
            --config "$RUNNER_TEMP/semgrep-rules/javascript/react"
            --config "$RUNNER_TEMP/semgrep-rules/javascript/browser"
            --config "$RUNNER_TEMP/semgrep-rules/javascript/lang"
            --metrics=off --error --exclude .yarn
  ```

  続いて `checks` の `needs` の末尾に `semgrep` を足す（REQ-001・REQ-010・REQ-012）。書き方は今の形に合わせる（flow 形式 `needs: [a, b]` なら同じ行の `]` の前に `, semgrep`、block 形式なら最後の `- …` の後に `- semgrep`）。既存の項目と並びは変えない。`checks` の形が想定と違い（`needs` が無い、判定が `needs` を使わない等）、この書き足しで `semgrep` を待たせられない場合は、コミットせずに blocked にして理由を書き、mayor に知らせる（REQ-010）。

  `.github/dependabot.yml` の末尾（`npm` の項目の後）に足す:

  ```yaml
    - package-ecosystem: 'pip'
      directory: '/.github/requirements'
      schedule:
        interval: 'daily'
        time: '03:00'
        timezone: 'Asia/Tokyo'
      commit-message:
        prefix: 'build'
      target-branch: 'main'
  ```

- [ ] **Step 6: 確かめる**

  ```bash
  git diff -U0 -- .github/workflows/static-checks.yml
  git diff -U0 -- .github/workflows/static-checks.yml | grep '^-[^-]' || echo "additions only"
  git diff --name-only "origin/$BASE" -- lefthook.yml .lefthook package.json .github/workflows/semantic-pull-request.yml
  ```

  共通 C・D を走らせる。Expected: 消えた行は、flow 形式の `needs` なら元の `needs` の 1 行だけ（block 形式なら `additions only`）。新しい `needs` の行で既存の項目が同じ並びのまま前にあり、`semgrep` が末尾にある（REQ-012 の例外）。それ以外の差分は `semgrep` ジョブの追加だけ。3 つ目は何も出さない。共通 C が `all pinned`。共通 D がすべて `ok`、`jobs` に `semgrep`、`needs` に `semgrep`、`missing: []`、`codeql.yml` の `analyze` は `static-checks.yml` に無い。`actionlint` は手元にないので「実行していない」と bead ノートに書く。

- [ ] **Step 7: 決定の記録と索引を書く（REQ-009）**

  `docs/decisions/security-and-review-checks-in-pr-ci.md`（Dependency Review は Task 2、code-review-graph は Task 3 が書き足す）:

  ```markdown
  # セキュリティと変更の影響を見る道具をPRごとのCIに入れ、指摘で落ちる物だけをchecksのneedsに入れる

  - **Status:** Accepted
  - **Verification Status:** Unverified
  - **Date:** 2026-11-20
  - **Related Files:** .github/workflows/static-checks.yml, .github/workflows/codeql.yml, .github/requirements/semgrep.in, .github/requirements/semgrep.txt, .github/dependabot.yml

  ## Context

  PRごとのCI（`Static Checks`）は型・Lint・未使用コード・マークアップ・ビルド等を確かめるが、コードの脆弱性の解析、セキュリティの規則での静的解析、PRで新しく入る依存の既知の脆弱性の確かめ、変更の影響の報告が無かった。

  - 必須チェックはまとめ役のjob`checks`（と`Validate PR title`）に絞り、必須にする確かめは`checks`の`needs`に入れる。`needs`が待てるのは同じワークフローのjobだけ
  - CodeQLのPRの関門は、GitHubが出すチェック「Code scanning results / CodeQL」で、PRのheadの解析とマージ先のブランチの解析を比べて新しいアラートを決める。そのためマージ先（`main`）の解析が要る
  - リポジトリはpublicで、CodeQLのcode scanningとDependency Reviewは追加の契約なしで使える
  - `.yarn/`（依存のzipと`releases/yarn-4.4.0.cjs`）は追跡対象で、解析の道具が自分のコードとして読むと結果が汚れる

  ## Decision

  - PRごとのCIで次の道具を使う
    - Semgrep: `semgrep/semgrep-rules`の`typescript/react`・`typescript/lang`・`javascript/react`・`javascript/browser`・`javascript/lang`の規則（`Static Checks`のjob`semgrep`、`--error`で指摘があれば落ちる）
    - CodeQL（`javascript-typescript`、`build-mode: none`）: コードの脆弱性の解析。結果はcode scanningに上がる（ワークフロー`CodeQL`、`pull_request`と`main`への`push`）
  - 置き場所: 指摘で落ちる物は`Static Checks`のjobにし、`checks`の`needs`に入れる。CodeQLはマージ先の解析のために`main`への`push`でも走らせる必要があり、`Static Checks`は`pull_request`だけで走るため、別のワークフローに置き、`checks`の`needs`に入れない。CodeQLの関門は「Code scanning results / CodeQL」
  - 固定の仕方: Actionは公開から2週間以上たったリリースの40桁のコミットSHAと行末のタグ、Pythonの道具は`.github/requirements/`の`--hash=sha256:`付きのrequirements（`pip-compile --generate-hashes`で作り、`pip install --require-hashes`で入れる）、取り出す規則は`actions/checkout`の`ref:`のSHA。Pythonの道具はDependabot（`pip`）が更新する
  - `.yarn/`は解析から外す（Semgrepは`--exclude .yarn`、CodeQLは`init`の`config:`の`paths-ignore`）

  ## Considered Options

  - Semgrep・Dependency Reviewを`Static Checks`のjobにし、CodeQLは別のワークフローに置く（採用）: 指摘で落ちる物が`checks`で必須になり、必須チェックを`checks`に絞ったまま保てる。CodeQLは`main`の解析と比べて新しいアラートだけを関門にできる。CodeQLの関門を必須にするかは別に決める必要がある
  - CodeQLも`Static Checks`のjobにして`needs`に入れる: `checks`で必須にできるが、`Static Checks`に`main`への`push`を足すか、マージ先の解析が無いまま比べることになる。解析の失敗では落ちても、アラートの有無ではjobが落ちない
  - CodeQLのSARIFに結果があれば落とすjobを`Static Checks`に入れる: `checks`で必須にできるが、`main`との比較ができず、既存のアラートでもすべてのPRが落ちる
  - DeepSec（vercel-labs/deepsec）: 正規表現のmatcherで候補を見つけ、AIで調べる。モデルの利用にAPIキーとその費用が要り、READMEは実行する環境で全権のshellを持つcoding agentとして扱うよう求めている。CIで使うにはsecretが要り、DependabotのPRにはActionsのsecretが渡らない
  - Claude Codeの`/security-review`をCIで走らせる（`anthropics/claude-code-security-review`）: 規則に書かれていない種類の問題も指摘できるが、Anthropic APIのキーが要り、実行ごとに費用がかかる。DependabotのPRにはActionsのsecretが渡らない
  - Semgrepの規則をレジストリ（`p/react`など）から取る: 設定が短いが、規則の版が固定されず、コードを変えていないPRの結果が規則の更新で変わりうる

  ## Consequences

  - CodeQLのアラートは、人が「Code scanning results / CodeQL」を必須チェックに登録しないとPRを止めない
  - Semgrepの規則は`semgrep/semgrep-rules`のライセンス（Semgrep Rules License v1.0）が規則の配布を許さないと読めるため、リポジトリに写さず、CIで取り出して使う
  - Semgrepの規則のSHA（job`semgrep`の`ref:`）とActionのSHAはDependabotの対象外で、手で更新する
  - 導入時にSemgrepが見つけたN件は、挙動を変えずに行ごとの`nosemgrep`と理由のコメントで外した。外した行を変えるときは、外す理由がまだ正しいかを見直す
  ```

  Consequences の「N件」は Step 4 の件数にする。0 件ならその項目を「導入時のSemgrepの指摘は0件だった。今後`nosemgrep`で外すときは、行ごとに理由のコメントを付ける」にする。Step 2・4 で版や規則のディレクトリを替えた・外した場合は、その事実と理由を Consequences に足す。

  `docs/decisions/index.md` の末尾に足す:

  ```markdown
  - セキュリティと変更の影響を見る道具をPRごとのCIに入れ、指摘で落ちる物だけをchecksのneedsに入れる (path: security-and-review-checks-in-pr-ci.md)
  ```

  ```bash
  yarn markdownlint-cli2 docs/decisions/security-and-review-checks-in-pr-ci.md docs/decisions/index.md
  bash .lefthook/pre-commit/check-docs.sh
  ```

  Expected: 終了コード 0。

- [ ] **Step 8: コミット（共通 A）— 分けて作る**

  指摘を外した場合だけ、先に `git add <nosemgrepを付けたファイル>`:

  ```text
  chore: mark existing Semgrep findings that are intended

  Add a reason comment and a nosemgrep marker to each line that the
  pinned Semgrep rules report but that is intended or a false positive,
  without changing behavior, so the new semgrep job starts green.
  ```

  次に `git add .github/workflows/codeql.yml .github/workflows/static-checks.yml .github/requirements/semgrep.in .github/requirements/semgrep.txt .github/dependabot.yml`:

  ```text
  ci: add CodeQL and Semgrep checks

  Add a CodeQL workflow for JavaScript and TypeScript that runs on pull
  requests and on pushes to main, so code scanning can compare a pull
  request with main. Add a semgrep job to Static Checks that runs the
  TypeScript, JavaScript and React rules of semgrep-rules pinned to a
  commit, installed from hash-pinned requirements, and make the checks
  gate wait for it so a Semgrep finding fails the required check. Exclude
  .yarn from both and let Dependabot update the Python requirements.
  ```

  最後に `git add docs/decisions/security-and-review-checks-in-pr-ci.md docs/decisions/index.md`:

  ```text
  docs: record where the security checks run in pull request CI

  Record that checks which fail on findings live in Static Checks and are
  gated by the checks job, while CodeQL runs in its own workflow because
  it needs an analysis of main. Record how the tools are pinned and the
  options that were not taken.
  ```

  `git status --short` が空であることを確かめる。bead ノートに作業ブランチの先端の SHA を書く。push しない（publish の段が行う）。

### Task 2: Dependency Review を入れる（`ci/add-dependency-review`）

**依存:** Task 1 のコミット（`ci/add-codeql-and-semgrep`）。

**Files:**

- Modify: `.github/workflows/static-checks.yml`（ジョブ `dependency-review` の追加と、`checks` の `needs` の末尾への `dependency-review`）、`docs/decisions/security-and-review-checks-in-pr-ci.md`
- Test: 共通 B・C・D、markdownlint

**前提条件（実装セッション）:** セッションの作業ディレクトリが準備の段の作ったこの item の worktree であること。main checkout のブランチは切り替えない。`gh stack` は使わない。

- [ ] **Step 1: 作業ブランチと親を確かめる（共通 B）**

  ```bash
  PARENT="$(gc bd show <Task 1 の source anchor の bead ID> --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.git_branch"]')"
  echo "PARENT=$PARENT"
  ```

  共通 B を、この `PARENT`（想定は `ci/add-codeql-and-semgrep`）で走らせる。共通 D で `needs` に `semgrep` があることも確かめる。

- [ ] **Step 2: ジョブを足し、`checks` に待たせる**

  `.github/workflows/static-checks.yml` の `semgrep` ジョブの後（`checks` の前）に足す。`permissions:` と `with:` は付けない:

  ```yaml
    dependency-review:
      name: dependency-review
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
          with:
            persist-credentials: false
        - uses: actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0
  ```

  続いて `checks` の `needs` の末尾（`semgrep` の後）に `dependency-review` を足す（REQ-002・REQ-010・REQ-012）。書き方は Task 1 Step 5 と同じ（今の形に合わせ、既存の項目と並びは変えない）。

- [ ] **Step 3: 決定の記録に書き足す**

  `docs/decisions/security-and-review-checks-in-pr-ci.md`:

  - Decision の道具の一覧（CodeQL の項目の後）に足す:

    ```markdown
      - Dependency Review: PRで新しく入る依存の既知の脆弱性（`Static Checks`のjob`dependency-review`、既定の設定。脆弱な依存を足すと落ちる）
    ```

  - `Related Files` は変えない（`static-checks.yml` は Task 1 で入っている）

- [ ] **Step 4: 確かめる**

  ```bash
  git diff -U0 "$PARENT" -- .github/workflows/static-checks.yml
  git diff -U0 "$PARENT" -- .github/workflows/static-checks.yml | grep '^-[^-]' || echo "additions only"
  yarn markdownlint-cli2 docs/decisions/security-and-review-checks-in-pr-ci.md
  ```

  共通 C・D。Expected: 消えた行は、flow 形式の `needs` なら元の `needs` の 1 行だけ（block 形式なら `additions only`）。新しい `needs` の行で既存の項目（`semgrep` を含む）が同じ並びのまま前にあり、`dependency-review` が末尾にある。それ以外の差分は `dependency-review` ジョブの追加だけ。markdownlint が 0、`all pinned`、`jobs` と `needs` に `dependency-review`、`missing: []`。

- [ ] **Step 5: コミット（共通 A）**

  `git add .github/workflows/static-checks.yml docs/decisions/security-and-review-checks-in-pr-ci.md`:

  ```text
  ci: add a dependency review job

  Add a dependency-review job to Static Checks with the default settings
  and make the checks gate wait for it, so a pull request that adds a
  dependency with a known vulnerability fails the required check. Record
  the job in the security checks decision.
  ```

  `git status --short` が空であることを確かめ、bead ノートに作業ブランチの先端の SHA を書く。push しない。

### Task 3: code-review-graph の報告を入れる（`ci/add-code-review-graph-report`）

**依存:** Task 2 のコミット（`ci/add-dependency-review`）。

**Files:**

- Create: `.github/workflows/code-review-graph.yml`、`.github/requirements/code-review-graph.in`、`.github/requirements/code-review-graph.txt`
- Create（道具が除外の仕組みを持つ場合だけ）: その仕組みのファイル
- Modify: `docs/decisions/security-and-review-checks-in-pr-ci.md`
- リポジトリの外: この item の実装の要約に PR 本文用の情報の節（REQ-011）
- Test: 共通 B、hash の数え上げ、手元での `build`・`detect-changes`・レンダラ、共通 C・D・E（積んだ後の中身での最終確認）

**前提条件（実装セッション）:** Task 2 と同じ。

- [ ] **Step 1: 作業ブランチと親を確かめる（共通 B）**

  ```bash
  PARENT="$(gc bd show <Task 2 の source anchor の bead ID> --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.git_branch"]')"
  BASE="$(gc bd show tf-p0zkq --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.var.base_branch"]')"
  echo "PARENT=$PARENT BASE=$BASE"
  ```

  共通 B を、この `PARENT`（想定は `ci/add-dependency-review`）で走らせる。共通 D で `needs` に `semgrep`・`dependency-review` があることも確かめる。

- [ ] **Step 2: requirements を写して確かめる（仮定 2）**

  ```bash
  R=P-manBrown/tascon-backend
  gh api repos/$R/git/blobs/4ed6dd521ed6bdba6e50715b858aded8188ab6f8 --jq .content | base64 -d > .github/requirements/code-review-graph.in
  gh api repos/$R/git/blobs/f8ac78c20534b13d63281b5f710b28ffe2c23945 --jq .content | base64 -d > .github/requirements/code-review-graph.txt
  cat .github/requirements/code-review-graph.in
  git hash-object .github/requirements/code-review-graph.in .github/requirements/code-review-graph.txt
  python3 - <<'PY'
  import re
  text = open(".github/requirements/code-review-graph.txt").read()
  blocks = re.split(r"\n(?=[A-Za-z0-9_.\-]+==)", text)
  pkgs = [b for b in blocks if re.match(r"[A-Za-z0-9_.\-]+==", b)]
  print("packages:", len(pkgs), "with hash:", sum(1 for b in pkgs if "--hash=sha256:" in b))
  PY
  ```

  Expected: `.in` が `code-review-graph==2.4.0`、hash-object が `4ed6dd52…`・`f8ac78c2…`、`packages` と `with hash` が一致。

- [ ] **Step 3: 手元で入れて、`.yarn/` を外す仕組みを確かめる（REQ-007）**

  ```bash
  C="${TMPDIR:-/tmp}/crg-tf-p0zkq"
  python3 -m venv "$C/venv"
  "$C/venv/bin/python" -m pip install --require-hashes -r .github/requirements/code-review-graph.txt \
    || { echo "require-hashes failed on Python 3.11"; "$C/venv/bin/python" -m pip install --no-deps --require-hashes -r .github/requirements/code-review-graph.txt && "$C/venv/bin/python" -m pip install code-review-graph==2.4.0; }
  "$C/venv/bin/code-review-graph" --help
  "$C/venv/bin/code-review-graph" build --help
  grep -rn -i -E 'ignore|exclude' "$C"/venv/lib/python3*/site-packages/code_review_graph/*.py | grep -i -E 'file|path|glob|\.code' | head -20
  ```

  ソースと `--help` から、解析の対象を外す仕組み（無視のファイル名・設定のキー・オプション）を探す。

  - 仕組みがある場合: その仕組みで `.yarn/` を外す（例: 無視のファイルなら、そのファイルをリポジトリ直下に作り `.yarn/` の 1 行を書く。オプションなら Step 4 の `build`・`detect-changes` に付ける）。使った仕組みを bead ノートに書く
  - 無い・使えない場合: 外さない。「code-review-graph には `.yarn/` を外す仕組みが無かった（<確かめた内容>）」を bead ノートに書き、Step 8 で実装の要約の Notes に写す（REQ-007・REQ-011）

  手元で動かす（作業ツリーにできるファイルは一時ディレクトリへ逃がす。道具がリポジトリの中にデータベース等を作る場合は、それが `git status` に出ないこと・消せることを確かめる）:

  ```bash
  "$C/venv/bin/code-review-graph" build
  "$C/venv/bin/code-review-graph" detect-changes --base "$PARENT" > "$C/report.json"; echo "exit=$?"
  git status --short --ignored | head
  ```

  `--base` は CI と同じく、この item の PR のマージ先になる親（`$PARENT`）にする。

  Expected: `build` と `detect-changes` が終わり、`report.json` ができる。道具が作ったファイルが `git status` に未追跡として出る場合は、それを消し（自分が今作った物だけ）、CI では関係しない（取り出しのたびに作り直す）ので `.gitignore` は変えない。

  レンダラを同じ SHA で取り出して走らせる:

  ```bash
  git clone --filter=blob:none --no-checkout https://github.com/tirth8205/code-review-graph "$C/renderer"
  git -C "$C/renderer" checkout --quiet b3f1285965a1337b3821e4423da03b65d70ee423 -- scripts/render_pr_comment.py
  "$C/venv/bin/python" "$C/renderer/scripts/render_pr_comment.py" --input "$C/report.json" --output "$C/comment.md"; echo "render exit=$?"
  head -20 "$C/comment.md"
  ```

  Expected: `render exit=0`（解析が走った）で、Markdown の報告ができる。`4` が返る場合は手元の解析が走っていないので、原因（`--base` の指定等）を bead ノートに書く。CI の動きは PR のチェックで確かめる（requirements の確かめ方）。

  CI は `actions/checkout` の既定（`fetch-depth: 1`）とマージ先の `--depth=1` の fetch で走るため、手元の完全な clone では見えない差がありうる。次のどちらかを確かめて bead ノートに書く（結果で計画のワークフローは変えない。走らない見込みなら、その事実を Step 8 の Notes に足す）:

  - 浅い clone で同じ手順を試す: `git clone --depth=1 --branch "$(git branch --show-current)" "file://$(git rev-parse --show-toplevel)" "$C/shallow"` の中で `git fetch --no-tags --depth=1 origin "+refs/heads/$PARENT:refs/remotes/origin/$PARENT"` → `build` → `detect-changes --base "origin/$PARENT"` → レンダラの終了コード
  - バックエンドの #840 の CI の結果: `gh pr checks 840 -R P-manBrown/tascon-backend` で `report` のジョブが通っているか

- [ ] **Step 4: ワークフローを書く**

  `.github/workflows/code-review-graph.yml`（Step 3 で `.yarn/` を外すオプションを見つけた場合は、`build`・`detect-changes` の行に付ける）:

  ```yaml
  name: code-review-graph

  on:
    pull_request:

  permissions:
    contents: read

  defaults:
    run:
      shell: bash

  jobs:
    report:
      name: report
      runs-on: ubuntu-latest
      env:
        BASE_REF: ${{ github.base_ref }}
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
          with:
            persist-credentials: false
        - name: Fetch the base branch
          run: git fetch --no-tags --depth=1 origin "+refs/heads/${BASE_REF}:refs/remotes/origin/${BASE_REF}"
        - name: Check out the report renderer
          uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
          with:
            repository: tirth8205/code-review-graph
            ref: b3f1285965a1337b3821e4423da03b65d70ee423 # v2.4.0
            path: .crg-renderer
            sparse-checkout: scripts/render_pr_comment.py
            sparse-checkout-cone-mode: false
            persist-credentials: false
        - name: Move the renderer out of the workspace
          run: mv .crg-renderer "$RUNNER_TEMP/crg-renderer"
        - uses: actions/setup-python@6d4fd22b20465ccc0f7354476588e8df7c9ca0e0 # v7.1.0
          with:
            python-version: "3.13.18"
        - name: Install code-review-graph
          run: python -m pip install --require-hashes -r .github/requirements/code-review-graph.txt
        - name: Build the graph
          run: code-review-graph build
        - name: Analyze the changes
          run: code-review-graph detect-changes --base "origin/${BASE_REF}" > "$RUNNER_TEMP/crg-report.json"
        - name: Render the report
          run: |
            set +e
            python "$RUNNER_TEMP/crg-renderer/scripts/render_pr_comment.py" \
              --input "$RUNNER_TEMP/crg-report.json" \
              --output "$RUNNER_TEMP/crg-comment.md"
            status=$?
            set -e
            if [ "$status" -ne 0 ] && [ "$status" -ne 4 ]; then
              exit "$status"
            fi
            echo "RENDER_STATUS=$status" >> "$GITHUB_ENV"
        - name: Write the report to the step summary
          run: cat "$RUNNER_TEMP/crg-comment.md" >> "$GITHUB_STEP_SUMMARY"
        - name: Fail when the analysis did not run
          if: env.RENDER_STATUS == '4'
          run: |
            echo "::error::code-review-graph could not analyze this pull request"
            exit 1
  ```

  `--fail-on-risk`・PR へのコメント・`actions/cache` を足さない。

- [ ] **Step 5: 決定の記録に書き足す**

  `docs/decisions/security-and-review-checks-in-pr-ci.md`:

  - `Related Files` の末尾に `, .github/workflows/code-review-graph.yml, .github/requirements/code-review-graph.in, .github/requirements/code-review-graph.txt` を足す（Step 3 で無視のファイルを作った場合はそれも）
  - Decision の道具の一覧の末尾に足す:

    ```markdown
      - code-review-graph: 変更の影響の報告（ワークフロー`code-review-graph`のjob`report`）。報告をStep Summaryに書くだけで、リスクの点数では落とさず、解析が走らなかったとき（レンダラの終了コード4）だけ落ちる。`checks`の`needs`に入れない
    ```

  - Decision の「`.yarn/`は解析から外す」の項目に、code-review-graph での外し方（Step 3 の結果。外せなかった場合は「code-review-graphには外す仕組みが無く、外していない」）を足す
  - Considered Options の末尾に足す:

    ```markdown
    - code-review-graphに`fail-on-risk`を付ける、または必須にする: 全体のリスクの点数が`high`（0.70以上）・`critical`（0.85以上）に達するとjobを落とせるため、影響の広い関数の変更をPRで止められる。点数は変えた関数の置かれた所（flowへの参加、別のcommunityからの呼び出し、テストの無さ、セキュリティらしい名前、呼び出し元の数）から計算され、変更が正しいかは見ないため、そうした関数への正しい変更も落ちる
    ```

  - Consequences の末尾に足す:

    ```markdown
    - code-review-graphのレンダラ（`code-review-graph.yml`の`tirth8205/code-review-graph`の`ref:`）はDependabotの対象外で、Dependabotが`.github/requirements/code-review-graph.txt`の本体の版を上げたときに、同じ版のタグのSHAへ手で合わせる。ずれるとレンダラが本体の出力を読めない可能性がある
    ```

  ```bash
  yarn markdownlint-cli2 docs/decisions/security-and-review-checks-in-pr-ci.md
  bash .lefthook/pre-commit/check-docs.sh
  ```

- [ ] **Step 6: 確かめる（積んだ後の中身での最終確認）**

  ```bash
  git diff --name-only "$PARENT" -- .github/workflows/static-checks.yml
  git diff -U0 "origin/$BASE" -- .github/workflows/static-checks.yml | grep '^-[^-]'
  git diff --name-only "origin/$BASE" -- lefthook.yml .lefthook package.json .github/workflows/semantic-pull-request.yml
  grep -n -E 'fail-on-risk|actions/cache|pull-requests: write' .github/workflows/code-review-graph.yml || echo "none"
  ```

  共通 C・D・E と `bash .lefthook/pre-commit/check-docs.sh`、`yarn markdownlint-cli2 docs/decisions/security-and-review-checks-in-pr-ci.md docs/decisions/index.md` を走らせる。

  Expected: 1 つ目は何も出さない（この Task は `static-checks.yml` を変えない）。2 つ目は、flow 形式の `needs` なら元の `needs` の 1 行だけ（block 形式なら何も出ない）。3 つ目は何も出さない（REQ-012）。4 つ目が `none`。共通 C が `all pinned`。共通 D がすべての YAML で `ok`、`needs` が既存の項目を同じ並びで前に持ち `semgrep`・`dependency-review` が末尾、`missing: []`、`static-checks.yml` の `jobs` と `needs` に `report`・`analyze` が無い。共通 E の `exit=0`（REQ-008 の最終確認。新しい指摘が出た場合は Task 1 Step 4 と同じ扱いで分け、外す必要があれば bead ノートに書いて mayor に知らせ、blocked にする。Task 1 の item のブランチにはこの Task からコミットしない）。check-docs・markdownlint が 0。

  土台に tf-rrr6j の `check-docs` ジョブ等があれば、その `run` の手順のうち Node が要らない物を手元でも走らせる。

- [ ] **Step 7: コミット（共通 A）— 2 つに分ける**

  `git add .github/workflows/code-review-graph.yml .github/requirements/code-review-graph.in .github/requirements/code-review-graph.txt`（無視のファイルを作った場合はそれも）:

  ```text
  ci: add a report-only code-review-graph workflow

  Add a code-review-graph workflow that builds the graph, analyzes the
  changes against the pull request base and writes the rendered report
  to the step summary. It only fails when the analysis did not run, never
  on the risk score, and it is not part of the checks gate. The tool and
  its renderer are pinned to the same 2.4.0 release.
  ```

  `git add docs/decisions/security-and-review-checks-in-pr-ci.md`:

  ```text
  docs: record why code-review-graph only reports

  Add code-review-graph to the security checks decision, explain why it
  reports without failing on risk and is not required, and note that the
  renderer SHA must follow the tool version by hand.
  ```

  `git status --short` が空であることを確かめ、bead ノートに作業ブランチの先端の SHA を書く。push しない（publish の段が行う）。

- [ ] **Step 8: PR 本文用の情報をこの item の実装の要約に書く（REQ-011）**

  この item の実装の要約（implement の段が書き、source anchor の `gc.implementation.summary_path` に記録する物）に次の 2 節を入れる。finalize が root の正本（`gc.build.implementation_summary_path`）を作るときに引き継ぐ材料にする。root の正本のパスには直接書かない。Semgrep の件数は Task 1 の bead ノート（Task 1 Step 4）と Step 6 の結果から取る。

  ```markdown
  ## New check names

  - `Static Checks / semgrep (pull_request)`
  - `Static Checks / dependency-review (pull_request)`
  - `CodeQL / Analyze (javascript-typescript) (pull_request)`
  - `code-review-graph / report (pull_request)`
  - `Code scanning results / CodeQL` (created by GitHub)

  ## Notes for the pull request bodies

  - Whether to make `Code scanning results / CodeQL` a required check is left to the repository owner; this stack does not change branch protection.
  - Whether Dependency Review can read the Yarn 4 `yarn.lock` is checked by the checks of the pull request.
  - <REQ-007: code-review-graph が `.yarn/` を外せなかった場合だけ、その事実。外せた場合はこの行を消す>
  - <Semgrep の指摘を nosemgrep で外した件数と理由の要約。0 件なら「Semgrep reported no findings on the pinned rules.」>
  - <Step 3 の浅い clone の確かめで CI の解析が走らない見込みになった場合だけ、その事実>
  - `actionlint` was not run (not installed).
  ```

  PR 本文は英語のため、この 2 節も英語で書く（`git-spice-workflow` Skill の PR 作成ルール）。

  後片付け: 一時ディレクトリ（`semgrep-tf-p0zkq`・`crg-tf-p0zkq`）を消してよい。`git -C /home/node/tascon-frontend branch --show-current` が `main` のままで、`git -C /home/node/tascon-frontend status --short` に変更が無いことを確かめる。bead ノートに 3 本のブランチの SHA と土台の SHA を書く。

## Non-Goals

- 必須チェック（ブランチ保護）とリポジトリの設定の変更（「Allow GitHub Actions to create and approve pull requests」を含む）
- `static-checks.yml` の既存のジョブ・トリガー・`permissions` の変更、`push` トリガーの追加
- `dependabot.yml` への `github-actions` の追加
- Semgrep の規則のリポジトリへの写し、レジストリからの規則の取得
- code-review-graph の `--fail-on-risk`、PR へのコメント、キャッシュ、必須化
- CodeQL の `schedule`、`main` 以外へのブランチの `push` の解析
- テストの道具（Vitest など、部分 tf-dj4bc。この build の上に積まれる）
- 既存の指摘を外すための挙動の変更、本物の問題の修正（人が決める）
- `lefthook.yml` と `.lefthook/` の変更
- この build の中での PR の作成（`open_pr=false`）。lifecycle の段は `### Task N` にしていない
- `### Task N` の中での push、ほかの item のブランチの付け替え・コミット、root の実装の要約の正本の作成（それぞれ publish・準備・finalize の段が行う）

## Validation and Acceptance

### Coverage

| ID | Status | 実装する Task と確かめ方 |
| --- | --- | --- |
| REQ-001 | covered | Task 1 Step 5（ジョブ `semgrep` と `needs`）・Step 6、Task 3 Step 6 |
| REQ-002 | covered | Task 2 Step 2（ジョブ `dependency-review` と `needs`）・Step 4、Task 3 Step 6 |
| REQ-003 | covered | Task 1 Step 5（`codeql.yml`）、共通 C・D |
| REQ-004 | covered | Task 3 Step 3〜6 |
| REQ-005 | covered | Task 1 Step 2（2 週間の確かめ）・Step 3、Task 3 Step 2、共通 C |
| REQ-006 | covered | Task 1 Step 5（`dependabot.yml`）、共通 D |
| REQ-007 | covered | Task 1 Step 5（`--exclude .yarn`・`paths-ignore`）、Task 3 Step 3（仕組みの確かめ、無ければ記録） |
| REQ-008 | covered | Task 1 Step 4（tf-rrr6j の最上段の上で実行、件数を実装の要約へ）、Task 3 Step 6（最終確認） |
| REQ-009 | covered | Task 1 Step 7、Task 2 Step 3、Task 3 Step 5 |
| REQ-010 | covered | 準備の段のブランチ（共通 B）、Task 1 前提条件・Step 1（tf-rrr6j の最上段と `checks` の確かめ、満たさなければ停止）、Task 1 Step 5・Task 2 Step 2（`needs`）、push は publish の段 |
| REQ-011 | covered | Task 3 Step 8（この item の実装の要約。finalize が正本へ引き継ぐ） |
| REQ-012 | covered | Task 1 Step 6、Task 2 Step 4、Task 3 Step 6 の差分の確かめ |

### 確かめの一覧（requirements の「確かめ方」との対応）

- `actionlint`: 手元にないため実行しない。Task 1 Step 6 と Task 3 Step 8 で「実行していない」と記録する
- 固定した版・規則の Semgrep を積んだ後の中身で終了コード 0: Task 1 Step 4、Task 3 Step 6（共通 E）
- 2 つの requirements の `--require-hashes` の install と hash の数え上げ: Task 1 Step 3・共通 E、Task 3 Step 2・3
- `static-checks.yml` の差分が追加だけ（`needs` の例外を除く）、`needs` に `semgrep`・`dependency-review`、`analyze`・`report` が無い: Task 1 Step 6、Task 2 Step 4、Task 3 Step 6
- 全 `uses:` の固定: 共通 C
- 決定の記録の形式と `check-docs.sh`: Task 1 Step 7、Task 3 Step 5・Step 6
- GitHub Actions での実行（Dependency Review の `yarn.lock`、CodeQL のアップロード、code-review-graph の Step Summary）: PR のチェックで確かめる（この build の外）

### Risks

- tf-rrr6j の最上段が push されるまで Task 1 は進まない（朝の期限に間に合わない可能性）。待たずに始める必要が出た場合は REQ-010 の割り当ての変更になるため、requirements の段に戻す（仮定 1）
- `checks` の形が想定（`needs` を `toJSON(needs)` で判定）と違う場合、`needs` への書き足しで待たせられない可能性がある。Task 1 Step 5 で blocked にして mayor に知らせる
- 準備の段が想定と違うブランチ名や親でブランチを作る可能性がある。名前の違いは記録して続け（仮定 5）、親の違いは共通 B で止める
- CI の浅い clone で `detect-changes` が merge base を見つけられない可能性がある。Task 3 Step 3 で浅い clone またはバックエンドの #840 の結果で確かめる
- Python 3.11（手元）と 3.13（CI）の違いで、手元の `--require-hashes` の install が失敗しうる。仮定 3 の回避は手元の確かめだけで、コミットする `.txt` は変えない
- Semgrep の規則のディレクトリが読み込めない、または本物の問題の指摘が出る。前者は外して記録、後者は build を止めて人に判断を仰ぐ
- code-review-graph に `.yarn/` を外す仕組みが無い場合、`.yarn/releases/yarn-4.4.0.cjs` を解析の対象に含めたまま報告する（REQ-007 の定めどおり記録する）
- 2 週間の条件を満たさない物が見つかった場合、版を替える必要があり、バックエンドの `.txt` を写す仮定 2 が使えなくなる（本体の版を替えたら `.txt` を Python 3.13 の pip-compile で作り直す必要がある。手元に 3.13 が無ければ blocked にして理由を書く）
- tf-q3hon（テストの道具）がこの build の最上段の上に積まれる。この build の push の後、mayor が tf-q3hon の `gc.var.base_branch` を `ci/add-code-review-graph-report` に替える

## Decision Log

- 2026-11-19: plan-review で計画を承認。正式な plan/spec を保存する方針を採用。保存しない旨の旧記述はこの決定で変更。出典: /home/node/tascon-frontend/.gc-artifacts/security-and-review-checks-ci/requirements.md, /home/node/tascon-frontend/.gc-artifacts/security-and-review-checks-ci/brainstorming/design.md, /home/node/tascon-frontend/.gc-artifacts/security-and-review-checks-ci/implementation-plan.md。

## Progress

- plan-review 承認済み。実装前。
