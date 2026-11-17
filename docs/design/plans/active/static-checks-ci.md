# 静的な確かめを PR ごとの CI に入れる（tascon-frontend）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PR ごとに 5 つの静的な確かめ（`tsc --noEmit`、Biome、Knip、markuplint、`next build`）を GitHub Actions の別々のジョブとして並列に走らせ、その判断を `docs/decisions/` に残す。

**Architecture:** 新しいワークフロー `.github/workflows/static-checks.yml`（`name: Static Checks`、`pull_request` のみ、5 ジョブ並列）と、準備手順をまとめたローカル composite action `.github/actions/setup/action.yml` を作る。外部 Action は `actions/checkout` と `actions/setup-node` の 2 つだけで、どちらもコミット SHA で固定する。決定記録 `docs/decisions/static-checks-in-pr-ci.md` と索引の 1 行を同じブランチに入れる。

**Tech Stack:** GitHub Actions（composite action）、Node.js 22.22.2、Yarn 4.4.0（corepack、`nodeLinker: node-modules`）、Next 16.1.6（`next typegen`）、TypeScript、Biome 2.4、Knip 6、markuplint 4、markdownlint-cli2、lefthook、git-spice、`gh`

---

## Context/Purpose

- 依頼: tf-uhcl（HQ 依頼 gc-vjh8 の 2/4）。承認済み requirements: `docs/design/requirements/static-checks-ci-requirements.md`（REQ-001〜REQ-010）。承認済み design: `docs/design/specs/static-checks-ci.md`（案 A）
- 実装タスクは **Task 1 の 1 つだけ**。新規 3 ファイル＋既存 1 ファイル（索引）への 1 行追加。コミットは 2 つ（`ci` と `docs`）で、ブランチ `ci/static-checks` 1 本に積む
- 作業順序: 作業用 worktree の確認 → ブランチ作成 → 構造の確かめスクリプトを先に書いて「失敗」を確かめる → composite action とワークフローを書く → 構造の確かめが通る → 5 つのコマンドをローカルで実行 → 型エラーで `tsc --noEmit` が落ちることを確かめる（未コミットで、取り除く） → `ci` コミット → 決定記録と索引 → markdownlint・`check-docs.sh` → `docs` コミット → 変更範囲の確かめ → PR 本文の下書きと後続作業をノートに残す
- この計画の `### Task N` はソースの変更だけを扱う。ビルドのライフサイクル（requirements → plan → plan-review → decompose → implement → review → finalize → publish）は本 formula が実行中で、実装レーンは Task 1 をローカルのコミットまで行う。push は後段の publish（`push=true`）が行い、PR は作らない（`open_pr=false`）。PR の作成と PR 上でしか確かめられない事項は run の外の後続作業（REQ-010）
- 計画作成時点（2026-11-19）で解決済みの外部 Action の SHA: `actions/checkout` v7.0.1 → `3d3c42e5aac5ba805825da76410c181273ba90b1`、`actions/setup-node` v7.1.0 → `949feb2413d6458794dcd2491c4babbbce0c15c1`（どちらも軽量タグでコミットを直接指す。公開日 2026-07-20 と 2026-10-08）。実装時に Step 3 で再解決し、違えば実装時の値を使う

## Current System

- CI は `.github/workflows/semantic-pull-request.yml`（PR タイトル検証、`amannn/action-semantic-pull-request@v5`、SHA 未固定）だけ。`.github/actions/` はない
- 静的な確かめはローカルの `lefthook.yml` だけ: pre-commit で Biome（`yarn biome check --write --error-on-warnings {staged_files}`）・markuplint・markdownlint・`check-docs.sh`（`docs/**/*.md` 等が対象）、pre-push で `yarn knip`
- `package.json`: `packageManager: yarn@4.4.0`。scripts は `build` = `ANALYZE=true next build --turbopack`、`lint-jsx` = `markuplint "src/**/*.{jsx,tsx}"` 等。tsc・knip の script はない（`yarn tsc`・`yarn knip` は依存のバイナリとして直接呼べる。`typescript`・`knip`・`@biomejs/biome`・`markuplint`・`next` はすべて依存にある）
- `Dockerfile` は `FROM node:22.22.2` と `RUN corepack enable npm yarn`。`.nvmrc` 等はない
- `.gitignore` に `/.next/`、`*.tsbuildinfo`、`next-env.d.ts`。`tsconfig.json` の `include` は `next-env.d.ts`・`**/*.ts`・`**/*.tsx`・`.next/types/**/*.ts` 等
- `.env` は追跡対象で `API_ORIGIN`・`NEXT_PUBLIC_*`・`REMOTE_PATTERN_*` を持つ（`next build` にシークレット不要）
- Knip の github-actions プラグインは `.github/workflows/*.{yml,yaml}` と `.github/**/action.{yml,yaml}` を読み、`run:` のバイナリを確かめる。`corepack` は Knip の無視リストにある（`node_modules/knip/dist/constants.js`）
- `docs/decisions/` の形式は `.claude/rules/decisions-maintenance.md`。`check-docs.sh` は決定記録の `Status`・`Verification Status`・`Date`・`Related Files` の値と `## Context`・`## Decision`・`## Consequences` の見出し、ファイル名の kebab-case、`index.md` からのリンクを検査する（索引にない決定記録はコミットで落ちる → 決定記録と索引は同じコミットに入れる）
- `docs/decisions/index.md` は `# Decisions 索引` の下に、題を `[]` で囲んでリンク先の `.md` ファイル名を括弧で続けた形の 1 行を 8 行並べている。最後の行の題は「読み込み中表示はServer Componentのファイルに本物と並べて置く」、リンク先は `loading-component-in-server-file.md`
- `.github/pull_request_template.md`（main）: 見出しは `### Summary` / `### Changes` / `### Testing` / `### Related Issues (Optional)` / `### Related Documents` / `### Notes (Optional)`。Related Documents は `- 🏃 Plan: docs/design/plans/active/<name>.md`・`- 🏃 Spec: docs/design/specs/<name>.md` の形式で、`⬜️` は N/A。`docs/design/specs/` にこの作業の plan はない
- git-spice の状態（計画作成時点）: 未マージのスタック `refactor/move-design-and-tech-debt-to-docs (#942)` → `chore/drop-gh-stack (#943)`、`main` の上に同じ HQ 依頼の別レーン `ci/english-pull-requests`。`main` は `ffa7ffcc`
- 外部 Action のリリース（2026-11-19 時点）: `actions/checkout` 最新 v7.0.1（2026-07-20）、`actions/setup-node` 最新 v7.1.0（2026-10-08）。どちらも公開から 2 週間以上たっている

## Progress

- [x] Task 1: ワークフロー・composite action・決定記録・索引の追加を実装し、ブランチ`ci/add-static-checks-workflow`にpushした（PR #946）。build（superpowers-build）はレビューとgap analysisの承認後にpublishまで完了している
- [ ] PR #946のレビュー・マージ
- [ ] 後続作業（run の外。Task 1 Step 16の一覧）: PR上の5ジョブの実際の表示名と結果の確認とPR本文の更新、x64 runnerでの`yarn install --immutable`の確認、決定記録の`Verification Status`を`Verified`に変えること
- [ ] マージ後、このplanを`docs/design/plans/completed/`へ移動する（`execution-plan`スキルの完了処理）
- 下のStepsはbuildの実行手順を残したもの。チェックボックスはbuildが実行した記録で、再実行する場合は新しく作る

## Proposed Implementation

### File Structure

- Create: `.github/actions/setup/action.yml` — 準備手順（setup-node 22.22.2 → `corepack enable` → `yarn install --immutable`）。Node 版と setup-node の SHA の唯一の置き場
- Create: `.github/workflows/static-checks.yml` — `Static Checks`。5 ジョブ（checkout → `./.github/actions/setup` → 確かめのコマンド）
- Create: `docs/decisions/static-checks-in-pr-ci.md` — 決定記録（日本語、`Verification Status: Unverified`）
- Modify: `docs/decisions/index.md` — 末尾に 1 行追加
- 変更しない: `package.json`、`lefthook.yml`、`.github/workflows/semantic-pull-request.yml`、`.github/dependabot.yml`、`Dockerfile`、その他すべて
- 作業用の一時ファイル（構造の確かめスクリプト、型エラーの試しのファイル）はコミットしない。スクリプトはシステムの一時ディレクトリに置く

### ライフサイクルとの関係

| 段階 | 担当 | 本計画での扱い |
| --- | --- | --- |
| plan-review・decompose | 本 formula の後続ステップ | Task 1 を 1 つの実装 bead にする |
| implement | 実装レーン（Task 1） | Task 1 の手順をローカルの 2 コミットまで行い、PR 本文の下書きと後続作業を bead ノートに残す |
| review・finalize | 本 formula の後続ステップ | 実装レーンは関与しない |
| publish | 本 formula の後続ステップ | `push=true` でブランチを push。`open_pr=false` で PR は作らない |
| PR 作成・PR 上の確かめ | run の外の後続作業 | Task 1 Step 16 の一覧を bead ノートに残すだけ |

### Task 1: Static Checks ワークフロー・composite action・決定記録を追加する

**Files:**

- Create: `.github/actions/setup/action.yml`
- Create: `.github/workflows/static-checks.yml`
- Create: `docs/decisions/static-checks-in-pr-ci.md`
- Modify: `docs/decisions/index.md`（末尾に 1 行）
- Test: 自動テストは追加しない（アプリのコードを変えないため）。構造の確かめスクリプト（一時ディレクトリ、コミットしない）、5 つのコマンドのローカル実行、型エラーでの失敗確認、markdownlint・`check-docs.sh`、`git diff --name-only` で確かめる

**Behavior / Acceptance:** requirements の Acceptance Criteria 1〜9（REQ-001〜REQ-010）

**前提条件（実装セッション）:**

- セッションの作業ディレクトリが、このタスク用の作業 worktree（`.claude/worktrees/<name>`）であること。メインチェックアウト（`/home/node/tascon-frontend`）でブランチを切り替えたり、ファイルを書いたりしない。作業ディレクトリが worktree でなければ、bead を blocked にして理由を書き、人への通知スクリプトで報告する
- ブランチ・コミット操作は `git-spice-workflow` Skill に従う（`git-spice branch create`・`git-spice commit create`。素の `git commit` は使わない）
- コミットメッセージは英語、Conventional Commits、body 必須。コミット前にメッセージ全文の日本語訳を bead ノートに `コミットN 日本語訳` として追記する（自律実行のため、日本語訳の提示はノートへの記録で満たす）
- 以下の手順の `<WT>` は作業 worktree の絶対パス（`git rev-parse --show-toplevel` の出力）

- [ ] **Step 1: 作業ディレクトリを確かめ、依存を入れる**

  ```bash
  pwd
  git rev-parse --show-toplevel
  git status --short
  bash .claude/skills/project-setup/scripts/setup.sh
  ```

  Expected: `pwd` と `--show-toplevel` が `/home/node/tascon-frontend/.claude/worktrees/<name>`（メインチェックアウトの `/home/node/tascon-frontend` ではない）。`git status --short` が空。`setup.sh` が終了コード 0（中で `yarn install --immutable` を行う）。

- [ ] **Step 2: ブランチ `ci/static-checks` を `main` の上に作る**

  ```bash
  git-spice ls
  git fetch origin main
  git rev-parse main origin/main
  git-spice branch create ci/static-checks --no-commit --target main
  git branch --show-current
  git-spice ls
  ```

  Expected: `git branch --show-current` が `ci/static-checks`。`git-spice ls` で `ci/static-checks` が `main` の直上にある。`main` と `origin/main` の SHA を bead ノートに記録する（違っていても `main` を更新しない。`main` はメインチェックアウトで使用中。違いはノートに書くだけで、publish の restack に任せる）。

  base を `main` にする理由と、Skill の「未マージのスタックがあれば最上段に積む」との違いは「前提と判断」の A-1 を参照。ブランチ `ci/static-checks` が既にある場合は作らずに止まり、bead ノートに状態（`git log --oneline main..ci/static-checks`）を書いて blocked にする。

- [ ] **Step 3: 外部 Action のコミット SHA を解決する**

  ```bash
  for r in actions/checkout actions/setup-node; do
    echo "== $r"
    gh api "repos/$r/releases?per_page=10" \
      --jq '.[] | select(.draft == false and .prerelease == false) | "\(.tag_name) \(.published_at)"'
  done
  ```

  公開日が実装日の 14 日以上前のリリースのうち、版番号が最大のものを選ぶ（計画作成時点: checkout `v7.0.1`、setup-node `v7.1.0`）。選んだタグごとに:

  ```bash
  resolve() {
    r="$1"; t="$2"
    read -r typ sha < <(gh api "repos/$r/git/ref/tags/$t" --jq '"\(.object.type) \(.object.sha)"')
    if [ "$typ" = "tag" ]; then
      sha="$(gh api "repos/$r/git/tags/$sha" --jq '.object.sha')"
    fi
    echo "$r $t $sha"
  }
  resolve actions/checkout v7.0.1
  resolve actions/setup-node v7.1.0
  ```

  Expected（計画作成時点の値）:

  ```text
  actions/checkout v7.0.1 3d3c42e5aac5ba805825da76410c181273ba90b1
  actions/setup-node v7.1.0 949feb2413d6458794dcd2491c4babbbce0c15c1
  ```

  注釈付きタグ（`object.type` が `tag`）の場合はタグオブジェクトの SHA を使わず、上のように指すコミットの SHA まで解決する。選んだタグ・公開日・SHA を bead ノートに記録する。値が上と違う場合は、以降の Step 5・Step 6 の YAML と Step 7 の確かめスクリプトの `EXPECTED_PINS`、Step 15 の PR 本文の版番号を実装時の値に置き換える。

- [ ] **Step 4: 構造の確かめスクリプトを書き、まだ失敗することを確かめる**

  一時ディレクトリにスクリプトを置く（コミットしない）:

  ```bash
  CHECK_DIR="$(mktemp -d)"
  echo "$CHECK_DIR"
  ```

  `$CHECK_DIR/check_static_checks.py` に次の内容を書く（Write ツールで。パスは上で表示された絶対パス）:

  ```python
  import re
  import sys
  from pathlib import Path

  import yaml

  root = Path(sys.argv[1])
  errors = []

  EXPECTED_JOBS = {
      "typecheck": ("tsc --noEmit", ["yarn next typegen", "yarn tsc --noEmit"]),
      "biome": ("biome", ["yarn biome ci --error-on-warnings ."]),
      "knip": ("knip", ["yarn knip"]),
      "markuplint": ("markuplint", ["yarn lint-jsx"]),
      "build": ("next build", ["yarn build"]),
  }
  EXPECTED_PINS = {
      "actions/checkout": ("3d3c42e5aac5ba805825da76410c181273ba90b1", "v7.0.1"),
      "actions/setup-node": ("949feb2413d6458794dcd2491c4babbbce0c15c1", "v7.1.0"),
  }
  wf_path = root / ".github/workflows/static-checks.yml"
  action_path = root / ".github/actions/setup/action.yml"


  def load(path):
      if not path.is_file():
          errors.append(f"missing file: {path}")
          return None
      return yaml.safe_load(path.read_text(encoding="utf-8"))


  wf = load(wf_path)
  action = load(action_path)

  if wf is not None:
      if wf.get("name") != "Static Checks":
          errors.append(f"workflow name: {wf.get('name')!r}")
      on = wf.get("on", wf.get(True))  # PyYAML reads the key `on` as True
      if not (isinstance(on, dict) and list(on) == ["pull_request"] and not on["pull_request"]):
          errors.append(f"trigger must be bare pull_request, got {on!r}")
      if wf.get("permissions") != {"contents": "read"}:
          errors.append(f"permissions: {wf.get('permissions')!r}")
      for key in ("concurrency", "env", "defaults"):
          if key in wf:
              errors.append(f"unexpected top-level key: {key}")
      jobs = wf.get("jobs") or {}
      if list(jobs) != list(EXPECTED_JOBS):
          errors.append(f"job ids: {list(jobs)}")
      for job_id, (name, commands) in EXPECTED_JOBS.items():
          job = jobs.get(job_id) or {}
          if job.get("name") != name:
              errors.append(f"{job_id}: name {job.get('name')!r} != {name!r}")
          if job.get("runs-on") != "ubuntu-latest":
              errors.append(f"{job_id}: runs-on {job.get('runs-on')!r}")
          if "needs" in job:
              errors.append(f"{job_id}: has needs")
          steps = job.get("steps") or []
          uses = [s.get("uses") for s in steps if "uses" in s]
          runs = [s.get("run") for s in steps if "run" in s]
          if len(steps) != 2 + len(commands):
              errors.append(f"{job_id}: step count {len(steps)}")
          if len(uses) != 2 or not str(uses[0]).startswith("actions/checkout@") or uses[1] != "./.github/actions/setup":
              errors.append(f"{job_id}: uses {uses}")
          if runs != commands:
              errors.append(f"{job_id}: runs {runs} != {commands}")
          if steps and steps[0].get("uses") is None:
              errors.append(f"{job_id}: first step must be checkout")

  if action is not None:
      runs = action.get("runs") or {}
      if runs.get("using") != "composite":
          errors.append(f"action using: {runs.get('using')!r}")
      steps = runs.get("steps") or []
      if len(steps) != 3:
          errors.append(f"action step count {len(steps)}")
      else:
          node = steps[0]
          if not str(node.get("uses", "")).startswith("actions/setup-node@"):
              errors.append(f"action step 1 uses {node.get('uses')!r}")
          if node.get("with") != {"node-version": "22.22.2"}:
              errors.append(f"action step 1 with {node.get('with')!r}")
          for step, cmd in zip(steps[1:], ["corepack enable", "yarn install --immutable"]):
              if step.get("run") != cmd or step.get("shell") != "bash":
                  errors.append(f"action step {step!r} != run {cmd!r} with shell bash")

  pin_re = re.compile(r"^\s*-?\s*uses:\s*([^@\s]+)@(\S+)(?:\s+#\s*(\S+))?\s*$")
  seen = set()
  for path in (wf_path, action_path):
      if not path.is_file():
          continue
      for line in path.read_text(encoding="utf-8").splitlines():
          m = pin_re.match(line)
          if not m:
              continue
          repo, ref, comment = m.groups()
          if repo.startswith("./"):
              continue
          seen.add(repo)
          if repo not in EXPECTED_PINS:
              errors.append(f"{path.name}: unexpected external action {repo}")
              continue
          sha, tag = EXPECTED_PINS[repo]
          if not re.fullmatch(r"[0-9a-f]{40}", ref) or ref != sha:
              errors.append(f"{path.name}: {repo}@{ref} is not pinned to {sha}")
          if comment != tag:
              errors.append(f"{path.name}: {repo} tag comment {comment!r} != {tag!r}")
  if seen != set(EXPECTED_PINS):
      errors.append(f"external actions seen: {sorted(seen)}")

  if errors:
      print("FAIL")
      print("\n".join(errors))
      sys.exit(1)
  print("OK")
  ```

  ```bash
  python3 "$CHECK_DIR/check_static_checks.py" "$(git rev-parse --show-toplevel)"
  ```

  Expected: 終了コード 1、`FAIL` の後に `missing file: .../.github/workflows/static-checks.yml` と `missing file: .../.github/actions/setup/action.yml`、`external actions seen: []` が出る。

- [ ] **Step 5: composite action を書く**

  `<WT>/.github/actions/setup/action.yml` を作る（内容はこのとおり。SHA は Step 3 の値）:

  ```yaml
  name: Setup
  description: Set up Node.js and install dependencies with Yarn

  runs:
    using: composite
    steps:
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 22.22.2
      - run: corepack enable
        shell: bash
      - run: yarn install --immutable
        shell: bash
  ```

  `cache` は指定しない（REQ-001・REQ-003）。`node-version` は `Dockerfile` の `node:22.22.2` と同じ値。

- [ ] **Step 6: ワークフローを書く**

  `<WT>/.github/workflows/static-checks.yml` を作る（内容はこのとおり。SHA は Step 3 の値）:

  ```yaml
  name: Static Checks

  on:
    pull_request:

  permissions:
    contents: read

  jobs:
    typecheck:
      name: tsc --noEmit
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn next typegen
        - run: yarn tsc --noEmit

    biome:
      name: biome
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn biome ci --error-on-warnings .

    knip:
      name: knip
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn knip

    markuplint:
      name: markuplint
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn lint-jsx

    build:
      name: next build
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn build
  ```

  `types`・`branches` を書かない（既定の opened / synchronize / reopened、全マージ先）。`needs`・`concurrency`・`push` トリガー・キャッシュを入れない。ローカル action `./.github/actions/setup` は checkout の後でないと読めないため、各ジョブで checkout を先に置く。

- [ ] **Step 7: 構造の確かめが通ることを確かめる**

  ```bash
  python3 "$CHECK_DIR/check_static_checks.py" "$(git rev-parse --show-toplevel)"
  grep -rn 'uses:' .github/workflows/static-checks.yml .github/actions/setup/action.yml
  ```

  Expected: `OK`（終了コード 0）。`grep` の出力が計 11 行（ワークフローの checkout 5 行と `./.github/actions/setup` 5 行、composite action の setup-node 1 行）で、外部 Action の行（checkout 5 行・setup-node 1 行）はすべて `@<40 桁の SHA> # v<版>` の形。`FAIL` なら出力の項目を YAML で直して再実行する。

- [ ] **Step 8: 5 つのコマンドを作業 worktree で実行する**

  1 つずつ実行し、それぞれの終了コードと最後の数行を bead ノートに `ローカル確認` として記録する:

  ```bash
  yarn next typegen && yarn tsc --noEmit; echo "typecheck exit=$?"
  yarn biome ci --error-on-warnings .; echo "biome exit=$?"
  yarn knip; echo "knip exit=$?"
  yarn lint-jsx; echo "markuplint exit=$?"
  yarn build; echo "build exit=$?"
  git status --short
  ```

  Expected: 5 つとも `exit=0`。`knip` は新しいワークフローと composite action の `run:` も読むが、`corepack` は無視リストにあり、`next`・`tsc`・`biome`・`knip` は依存にあるため指摘は出ない。`git status --short` は `?? .github/actions/` と `?? .github/workflows/static-checks.yml` の 2 行だけ（`next-env.d.ts`・`.next/` は gitignore 対象で出ない）。

  失敗した場合:
  - `biome` が作業 worktree の環境だけの理由（入れ子の `biome.json`、`.beads` の権限など、追跡対象外のファイル）で失敗した場合は、Step 10 のコミットの後に、まっさらな checkout で `biome` を確かめ直す: `FRESH="$(mktemp -d)"; git archive HEAD | tar -x -C "$FRESH"; (cd "$FRESH" && yarn install --immutable && yarn biome ci --error-on-warnings .); echo "fresh biome exit=$?"`。出力の要約を bead ノートに残す
  - 追跡対象のファイルが原因でどれかが失敗した場合（新しい YAML への指摘を含む）は、エラー全文を bead ノートに残す。原因が今回の 2 ファイルなら直して Step 7 からやり直す。原因が既存のコードなら変更範囲（REQ-008）の外なので直さず、bead を blocked にして人へ報告する

- [ ] **Step 9: 型エラーで `tsc --noEmit` が失敗することを確かめ、取り除く（REQ-005）**

  未コミットの一時ファイルで確かめる（コミットしない）:

  ```bash
  printf '%s\n' 'export const ciTypecheckProbe: number = "not a number";' > src/ci-typecheck-probe.ts
  yarn next typegen && yarn tsc --noEmit; echo "typecheck exit=$?"
  rm src/ci-typecheck-probe.ts
  yarn next typegen && yarn tsc --noEmit; echo "typecheck exit=$?"
  git status --short
  ```

  Expected: 1 回目は `src/ci-typecheck-probe.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.` と `typecheck exit=` が 0 以外（tsc は型エラーで通常 2）。削除後の 2 回目は `typecheck exit=0`。`git status --short` に `src/ci-typecheck-probe.ts` がない。どのファイルに何を入れ、どのエラーで何番の終了コードだったかを bead ノートに `失敗の確認` として記録する（Step 15 の Testing に使う）。

- [ ] **Step 10: ワークフローと composite action をコミットする（`ci`）**

  ```bash
  git add .github/workflows/static-checks.yml .github/actions/setup/action.yml
  git status --short
  ```

  Expected: `A  .github/actions/setup/action.yml` と `A  .github/workflows/static-checks.yml` の 2 行だけ。

  メッセージ（英語）:

  ```text
  ci: run static checks on every pull request

  Add a Static Checks workflow that runs on pull_request for every base
  branch, so stacked pull requests whose base is not main are checked
  too. It runs five jobs in parallel: tsc --noEmit (after next typegen,
  because next-env.d.ts is gitignored and a fresh checkout cannot
  resolve image imports without it), biome ci --error-on-warnings, knip,
  markuplint (yarn lint-jsx) and next build (yarn build).

  Each job checks out the repository and calls the local composite
  action .github/actions/setup, which installs Node.js 22.22.2 (the same
  version as the Dockerfile), enables corepack and runs
  yarn install --immutable. Keeping these steps in one place leaves a
  single spot for the Node.js version and the setup-node pin.

  actions/checkout and actions/setup-node are pinned to full commit SHAs
  with the release tag in a trailing comment, so a moved tag cannot
  change what runs. The workflow only reads the repository contents and
  adds no dependency cache, concurrency group or push trigger.
  ```

  日本語訳を bead ノートに `コミット1 日本語訳` として追記してから（SHA の版番号が Step 3 で変わった場合も本文は同じ）:

  ```bash
  git-spice commit create \
    -m "ci: run static checks on every pull request" \
    -m "Add a Static Checks workflow that runs on pull_request for every base branch, so stacked pull requests whose base is not main are checked too. It runs five jobs in parallel: tsc --noEmit (after next typegen, because next-env.d.ts is gitignored and a fresh checkout cannot resolve image imports without it), biome ci --error-on-warnings, knip, markuplint (yarn lint-jsx) and next build (yarn build)." \
    -m "Each job checks out the repository and calls the local composite action .github/actions/setup, which installs Node.js 22.22.2 (the same version as the Dockerfile), enables corepack and runs yarn install --immutable. Keeping these steps in one place leaves a single spot for the Node.js version and the setup-node pin." \
    -m "actions/checkout and actions/setup-node are pinned to full commit SHAs with the release tag in a trailing comment, so a moved tag cannot change what runs. The workflow only reads the repository contents and adds no dependency cache, concurrency group or push trigger."
  git branch --show-current
  git log --oneline -1
  git status --short
  ```

  Expected: lefthook の pre-commit が通る（YAML は Biome・markuplint・markdownlint・`check-docs.sh` の対象外で、`protect-branch` は `ci/static-checks` なので通る）。`git branch --show-current` が `ci/static-checks`、`git log` の先頭が `ci: run static checks on every pull request`、`git status --short` が空。hook が失敗した場合は `--no-verify` で回避せず、出力全文を bead ノートに残して原因を直す。

- [ ] **Step 11: 決定記録を書く（REQ-006）**

  `Date` はコミットする日（`TZ=Asia/Tokyo date +%F`。計画作成時点は `2026-11-19`）。`<WT>/docs/decisions/static-checks-in-pr-ci.md` を作る（内容はこのとおり。`Date` だけ実装日に合わせる）:

  ```markdown
  # 型・Lint・未使用コード・マークアップ・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する

  - **Status:** Accepted
  - **Verification Status:** Unverified
  - **Date:** 2026-11-19
  - **Related Files:** .github/workflows/static-checks.yml, .github/actions/setup/action.yml

  ## Context

  CIはPRタイトルの検証（`semantic-pull-request.yml`）だけで、型・Lint・未使用コード・マークアップ・ビルドの確かめはローカルのlefthookに任せていた。pre-commitはステージしたファイルだけを検査し、hookは飛ばせるため、壊れた変更がPRに入っても誰にも見えない。スタックPRのマージ手順は`mergeStateStatus`が`CLEAN`になるのを待つが、その裏づけになるCIの確かめがなかった。

  まっさらなcheckout（`git archive HEAD`を展開したディレクトリ）で各コマンドを試し、次のことを確認した。

  - `yarn tsc --noEmit`だけを実行すると、`public/logos/*.png`のimportが`TS2307`で失敗する。画像の型の宣言を読み込む`next-env.d.ts`はNextが生成するファイルで、gitの追跡対象外のため
  - `yarn next typegen`の後なら`yarn tsc --noEmit`は成功する（`next-env.d.ts`と`.next/types/*`が生成される）
  - `yarn build`（`next build`）はビルドの中で型検査も行うが、最初のエラーで止まる
  - `next build`に要る環境変数は追跡対象の`.env`にあり、シークレットは要らない

  ## Decision

  - PRごと（`pull_request`）に走るワークフロー`Static Checks`で、次の5つの確かめを別々のジョブとして並列に実行する。マージ先のブランチで絞らない（スタックPRのマージ先は`main`以外のブランチにもなる）
    - `tsc --noEmit`: `yarn next typegen`の後に`yarn tsc --noEmit`
    - `biome`: `yarn biome ci --error-on-warnings .`（pre-commitと同じく警告も失敗にする）
    - `knip`: `yarn knip`（pre-pushと同じ）
    - `markuplint`: `yarn lint-jsx`
    - `next build`: `yarn build`（本番と同じビルド手順）
  - 準備手順（Node.jsの用意、`corepack enable`、`yarn install --immutable`）はローカルのcomposite action（`.github/actions/setup`）1か所にまとめる。Node.jsの版は`Dockerfile`と同じ`22.22.2`にする
  - 外部のActionはタグではなく、公開から2週間以上たったリリースのコミットSHAで固定し、行末にタグをコメントで書く
  - 依存のキャッシュ・`concurrency`・`push`トリガーは入れない

  ## Considered Options

  - ジョブを分けて並列に実行し、準備手順をcomposite actionにまとめる（採用）: PRのchecks欄に確かめごとの成否が出て、1つが落ちても他は最後まで走る。Node.jsの版とsetup-nodeのSHAの置き場が1か所になる。ファイルが1つ増え、installを5回行う
  - ジョブを分けて並列に実行し、準備手順を各ジョブに直接書く: 1ファイルで全部読めるが、Node.jsの版とsetup-nodeのSHAが5か所に重複し、更新時にずれやすい
  - 1つのジョブで5つのステップとして直列に実行する: installが1回で済みActionsの使用時間が最小になるが、checks欄には1つしか出ず、どの確かめが落ちたかは開かないと分からない。直列のため待ち時間が長い
  - `tsc --noEmit`を独立したジョブにせず`next build`の型検査に任せる: ジョブが1つ減るが、`next build`は最初のエラーで止まり、すべての型エラーを報告しない
  - `tsc --noEmit`を`next build`の後に同じジョブで実行する: buildが`next-env.d.ts`を生成するので`next typegen`は要らないが、直列になり遅い。`next typegen`で型ファイルだけ生成すれば並列のまま実行できる

  ## Consequences

  - 確かめの結果がPR上で誰にも見える形で残り、lefthookを飛ばしたコミットも検出される
  - ブランチ保護のrequired status checksに登録するまでは、ジョブが失敗してもマージは止まらない
  - installを5回行う分、Actionsの使用時間が増える（1回約15秒）
  - `Dockerfile`のNode.jsの版を上げるときは、`.github/actions/setup/action.yml`の`node-version`も合わせる必要がある
  - `next typegen`はNext 15.5以降のコマンドで、Nextの更新で挙動が変わると`tsc --noEmit`のジョブが壊れる
  - GitHubのrunnerはx64で、`.yarn/cache`にないx64用のオプション依存はinstall時にnpmから取得される
  - 固定したSHAは自動では更新されないため、Actionの更新は手で行う
  ```

- [ ] **Step 12: 索引に 1 行追加する（REQ-007）**

  `<WT>/docs/decisions/index.md` の末尾の行（題「読み込み中表示はServer Componentのファイルに本物と並べて置く」、リンク先 `loading-component-in-server-file.md`）の直後に、同じ形式の 1 行を追加する。題は Step 11 の `#` 見出しと同じ文字列「型・Lint・未使用コード・マークアップ・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する」、リンク先は `static-checks-in-pr-ci.md`。

  ファイル末尾の改行は 1 つに保つ。

- [ ] **Step 13: markdownlint と `check-docs.sh` を通す**

  ```bash
  yarn markdownlint-cli2 docs/decisions/static-checks-in-pr-ci.md docs/decisions/index.md; echo "markdownlint exit=$?"
  bash .lefthook/pre-commit/check-docs.sh; echo "check-docs exit=$?"
  tail -n 2 docs/decisions/index.md
  ```

  Expected: どちらも `exit=0`。`tail` の最後の行が Step 12 の行。指摘が出たら文書を直して再実行する（内容の意味は変えない。意味を変えないと直せない指摘は bead ノートに残す）。

- [ ] **Step 14: 決定記録と索引をコミットする（`docs`）**

  決定記録と索引は同じコミットに入れる（`check-docs.sh` は索引にない決定記録を失敗にする）。

  ```bash
  git add docs/decisions/static-checks-in-pr-ci.md docs/decisions/index.md
  git status --short
  ```

  Expected: `A  docs/decisions/static-checks-in-pr-ci.md` と `M  docs/decisions/index.md` の 2 行だけ。

  メッセージ（英語）:

  ```text
  docs: record why static checks run per pull request in CI

  Add a decision record under docs/decisions/ explaining why the five
  static checks run as separate parallel jobs on every pull request, why
  tsc --noEmit runs after next typegen instead of relying on next build,
  why setup steps live in a local composite action, and why external
  actions are pinned to commit SHAs. It also lists the options that
  were considered and their trade-offs.

  The record starts as Unverified because the workflow has not run on a
  pull request yet; it will be marked Verified after all five jobs pass
  there. The decisions index links the new record.
  ```

  日本語訳を bead ノートに `コミット2 日本語訳` として追記してから:

  ```bash
  git-spice commit create \
    -m "docs: record why static checks run per pull request in CI" \
    -m "Add a decision record under docs/decisions/ explaining why the five static checks run as separate parallel jobs on every pull request, why tsc --noEmit runs after next typegen instead of relying on next build, why setup steps live in a local composite action, and why external actions are pinned to commit SHAs. It also lists the options that were considered and their trade-offs." \
    -m "The record starts as Unverified because the workflow has not run on a pull request yet; it will be marked Verified after all five jobs pass there. The decisions index links the new record."
  git branch --show-current
  git log --oneline main..HEAD
  git status --short
  ```

  Expected: pre-commit（markdownlint・`check-docs.sh`）が通る。`git branch --show-current` が `ci/static-checks`。`git log` が 2 行（`docs: record why static checks run per pull request in CI` と `ci: run static checks on every pull request`）。`git status --short` が空。

- [ ] **Step 15: 変更範囲・コミット・構造を最終確認する（REQ-004・REQ-008・REQ-009）**

  ```bash
  git diff --name-only main...HEAD
  git log --format='%h %s%n%b---' main..HEAD
  python3 "$CHECK_DIR/check_static_checks.py" "$(git rev-parse --show-toplevel)"
  ```

  Expected: `git diff --name-only` がちょうど次の 4 行:

  ```text
  .github/actions/setup/action.yml
  .github/workflows/static-checks.yml
  docs/decisions/index.md
  docs/decisions/static-checks-in-pr-ci.md
  ```

  2 つのコミットとも body がある。確かめスクリプトが `OK`。出力を bead ノートに `最終確認` として記録する。

- [ ] **Step 16: PR 本文の下書きと後続作業を bead ノートに残す（REQ-010）**

  PR は作らない（`open_pr=false`）。実装 bead のノートに `PR 本文の下書き` として次を追記する。下の版番号・コマンドの結果・エラー文は計画作成時点の見込みなので、Step 3・Step 8・Step 9 の実際の記録と違う箇所は実際の値に直し、記録と違うことを書かない:

  ````markdown
  Title: ci: run static checks on every pull request

  ### Summary

  Add a GitHub Actions workflow that runs five static checks (type check, Biome, Knip, markuplint and the Next.js build) on every pull request, so broken changes show up on the pull request even when the local lefthook hooks are skipped.

  ### Changes

  - Add `.github/workflows/static-checks.yml` (`Static Checks`). It runs on `pull_request` for every base branch, so stacked pull requests are checked too, and runs five jobs in parallel. Expected check names on the pull request:
    - `Static Checks / tsc --noEmit (pull_request)` — `yarn next typegen`, then `yarn tsc --noEmit`
    - `Static Checks / biome (pull_request)` — `yarn biome ci --error-on-warnings .`
    - `Static Checks / knip (pull_request)` — `yarn knip`
    - `Static Checks / markuplint (pull_request)` — `yarn lint-jsx`
    - `Static Checks / next build (pull_request)` — `yarn build`
  - Add the local composite action `.github/actions/setup` (setup-node with Node.js 22.22.2, `corepack enable`, `yarn install --immutable`), used by all five jobs
  - Pin `actions/checkout` (v7.0.1) and `actions/setup-node` (v7.1.0) to full commit SHAs, with the tag in a trailing comment
  - Add the decision record `docs/decisions/static-checks-in-pr-ci.md` (Verification Status: Unverified) and link it from `docs/decisions/index.md`

  ### Testing

  - Ran each job's command locally in a worktree; all five passed: `yarn next typegen && yarn tsc --noEmit`, `yarn biome ci --error-on-warnings .`, `yarn knip`, `yarn lint-jsx`, `yarn build`
  - Added a one-line type error as an uncommitted file (`src/ci-typecheck-probe.ts`: `export const ciTypecheckProbe: number = "not a number";`) and confirmed that `yarn next typegen && yarn tsc --noEmit` failed with `error TS2322: Type 'string' is not assignable to type 'number'.` (non-zero exit code). Removed the file before committing; it is not in the branch history
  - The workflow runs only on `pull_request`, so it has not run yet. The job results on this pull request will be added here after the first run

  ### Related Documents

  <!-- Plan and spec this pull request implements -->
  <!-- ✅ = this pull request completes it, 🏃 = in progress, ⬜️ = not applicable (write N/A as the path) -->
  - ⬜️ Plan: N/A
  - ⬜️ Spec: N/A

  ### Notes (Optional)

  - The existing `.github/workflows/semantic-pull-request.yml` uses `amannn/action-semantic-pull-request@v5`, which is not pinned to a commit SHA. This pull request leaves that workflow unchanged.
  - Adding these checks to the required status checks in branch protection is a manual GitHub settings change for the repository owner.
  ````

  見出しは PR を作る時点の `.github/pull_request_template.md` に合わせる（`### Related Issues (Optional)` は該当なしのため省く）。Related Documents は、PR を作る時点でリポジトリの plan・spec の置き場（`docs/design/plans/`・`docs/design/specs/`）にこの作業の plan・spec がなければ両方 `⬜️` と `N/A` のまま。

  続けて、同じノートに `後続作業（run の外、PR 作成後）` として次の一覧を追記する:

  1. ブランチ `ci/static-checks` から PR を作る（タイトル `ci: run static checks on every pull request`、本文は上の下書き、`git-spice-workflow` Skill に従う）
  2. `gh pr checks <PR>` で 5 ジョブの実際の表示名と結果を確かめ、PR 本文の Changes の表示名と Testing の結果を実際の値に直す
  3. x64 runner で `yarn install --immutable` が通ったかを確かめる。失敗していたら原因を bead に記録し、キャッシュ方針や `--immutable` の扱いを変える判断が要るなら人に返す
  4. 5 ジョブがすべて成功したら、決定記録の `Verification Status` を `Verified` に変える `docs` コミットを同じブランチに積む（履歴は書き換えない）。その再実行の結果も `gh pr checks` で確かめる

  最後に bead ノートへ、ブランチ名・base（`main` の SHA）・2 つのコミットの SHA・push と PR は後段（publish・run の外）であることを記録する。一時ディレクトリ `$CHECK_DIR` は削除してよい（コミットしていない）。

## Non-Goals

- PR の作成、PR 上での 5 ジョブの結果確認、`Verification Status` を `Verified` に変えるコミット（run の外の後続作業。Task 1 Step 16 でノートに残すだけ）
- push（後段の publish が行う）
- Related Documents と英語の確かめ（PR 本文の確かめ）、同じ HQ 依頼の他の部分（ライセンスの洗い出し、PnP の相性の試し、lefthook）
- 既存 `semantic-pull-request.yml` の Action の SHA 固定（PR の Notes に書くだけ）
- ブランチ保護の required status checks の設定（人の GitHub 設定作業）
- dependabot への `github-actions` エコシステムの追加
- 依存のキャッシュ、`concurrency`、`push: main` トリガー、`actions/checkout` の `persist-credentials` などの追加の入力
- `actionlint` など新しい道具の導入、単体テスト・E2E テストの導入
- `package.json`・`lefthook.yml`・`Dockerfile`・`.github/dependabot.yml` の変更

## Validation and Acceptance

### Coverage

| ID | Status | Task / Step |
| --- | --- | --- |
| REQ-001 | covered | Task 1 Step 6（骨組み）、Step 4・7・15（構造の確かめ: name、bare `pull_request`、`permissions`、`needs` なし、`concurrency` なし） |
| REQ-002 | covered | Task 1 Step 6（5 ジョブの id・表示名・コマンド）、Step 8（5 コマンドのローカル実行） |
| REQ-003 | covered | Task 1 Step 5（composite action）、Step 4・7（`using: composite`、3 steps、`shell: bash`、`node-version: 22.22.2`、`cache` なし） |
| REQ-004 | covered | Task 1 Step 3（2 週間以上たった最新リリースのコミット SHA 解決）、Step 5・6（SHA＋タグのコメント）、Step 4・7・15（外部 Action が 2 つだけ・40 桁） |
| REQ-005 | covered | Task 1 Step 9（未コミットの型エラーで失敗、取り除いて成功）、Step 16（Testing に記載） |
| REQ-006 | covered | Task 1 Step 11（決定記録、`Unverified`）、Step 13（markdownlint・`check-docs.sh`）、Step 14（pre-commit）、Step 16（`Verified` は後続作業） |
| REQ-007 | covered | Task 1 Step 12（索引の 1 行）、Step 13（`check-docs.sh` の索引リンク検査） |
| REQ-008 | covered | Task 1 Step 15（`git diff --name-only main...HEAD` が 4 ファイル） |
| REQ-009 | covered | Task 1 Step 2（`main` の上に 1 本）、Step 10（`ci`）、Step 14（`docs`）、`git-spice commit create`・body あり |
| REQ-010 | covered | Task 1 Step 16（PR 本文の下書き・後続作業の一覧を bead ノートへ）。PR 作成は `open_pr=false` のため run の外 |

### 受け入れ基準との対応

- AC1: Step 6・7・15（確かめスクリプトの `OK`）
- AC2: Step 5・7、全ジョブが `./.github/actions/setup` を使う（確かめスクリプトの `uses` 検査）
- AC3: Step 3・7・15（`EXPECTED_PINS` と `grep 'uses:'`）
- AC4: Step 8（5 つとも `exit=0`。biome は環境起因ならまっさらな checkout で再確認）
- AC5: Step 9・16、`git log main..HEAD` に試しのファイルがない（Step 15 の `git diff --name-only` に `src/` がない）
- AC6: Step 11〜14
- AC7: Step 15
- AC8: Step 10・14・15
- AC9: Step 16

### 確かめの一覧（実装レーンが実行するもの）

- `python3 "$CHECK_DIR/check_static_checks.py" <WT>` → Step 4 で `FAIL`（ファイルなし）、Step 7・15 で `OK`
- 5 コマンド → すべて終了コード 0（Step 8）
- 型エラーの試し → 終了コード 0 以外と `TS2322`、取り除いた後に 0（Step 9）
- `yarn markdownlint-cli2 …`・`bash .lefthook/pre-commit/check-docs.sh` → 0（Step 13）、2 つのコミットで lefthook の pre-commit が通る（Step 10・14）
- `git diff --name-only main...HEAD` → 4 ファイル（Step 15）
- この run の中で確かめられないもの（後続作業）: PR 上での 5 ジョブの実行結果と実際の表示名、x64 runner での `yarn install --immutable`

### Risks

- x64 runner では `.yarn/cache` にないオプション依存（`sharp`、`lightningcss`、`@biomejs/cli-linux-x64` など）を install 時に npm から取得する。`--immutable` は lockfile を変えなければ通る見込みだが、run の中では確かめられない（後続作業 3）
- `actions/setup-node` v7 は依存のキャッシュを自動で有効にする条件を持つが、対象は npm で、このリポジトリは `packageManager: yarn@4.4.0` のため有効にならない見込み。初回実行のログに `cache` の step が出たら後続作業で記録し、`package-manager-cache: false` を加えるかを判断する
- 作業 worktree での `biome ci .` が追跡対象外のファイル（入れ子の設定、`.beads` の権限）で失敗する可能性。Step 8 の手順でまっさらな checkout で確かめ直す
- `yarn build` は `ANALYZE=true` のため `.next/analyze/` にレポートを書く（gitignore 対象で、コミットに入らない）
- Step 3 で実装日に新しいリリースが 2 週間を超えていれば版と SHA が変わる。そのときは YAML・確かめスクリプト・PR 本文の版を合わせて置き換える
- PR を作る時点で #942/#943 がマージ済みなら、PR テンプレートの Related Documents の置き場が変わる（`docs/design/plans/` 等）。後続作業 1 でその時点のテンプレートに合わせる

## Decision Log

- A-1（Skill と requirements の違い）: `git-spice-workflow` Skill の「ブランチ作成ルール」は、未マージのスタックがあれば新しい作業のブランチをその最上段に積むよう求める。計画作成時点で未マージのスタック（#942 → #943）がある。一方、承認済み requirements の REQ-009 は「ブランチは `main` の上に 1 本」と定め、HQ 依頼の 4 つの部分は互いを待たない前提で、同じ依頼の別レーン（`ci/english-pull-requests`）も `main` の上にある。#942/#943 の変更ファイルとこの作業の 4 ファイルは重ならない。本計画は承認済みの REQ-009 に従い `main` の上に作る。この違いは plan-review が判断できるよう、ここと実装 bead のノートに残す
- A-2: 実装レーンの範囲はローカルの 2 コミットまで。push は publish、PR 作成は run の外（requirements の「When」と run の変数 `open_pr=false`・`push=true`）
- A-3: 2 つのコミット（`ci` と `docs`）を 1 つの Task にまとめる。同じブランチ・同じ作業 worktree で順に積む変更で、分けると 2 つの実装レーンが同じブランチを奪い合うため
- A-4: REQ-005 の試しは `src/` に新しい 1 行のファイルを置く方法で行う。既存ファイルを書き換えないため、取り除いた後に差分が残らない
- A-5: 構造の確かめは一時ディレクトリの Python スクリプト（PyYAML）で行う。リポジトリに新しい道具やファイルを足さない（REQ-008、`actionlint` を入れない）
- A-6: 決定記録の文体は既存の `docs/decisions/*.md` に合わせる（日本語と英字・コードの間に空白を入れない）
- A-7: このplanを`docs/design/plans/active/`へ入れる際、決定記録の索引に足す行の書式例（Markdownリンクの形）は、`check-docs.sh`が`docs/design/plans`配下のリンクをplanからの相対パスで検査して壊れたリンクと判定するため、リンク記法を使わない文章に書き換えた。足す行の中身（題とリンク先）は変えていない
