# tascon-frontend の lefthook の段を確かめに要る物で決める Implementation Plan

Spec: docs/design/specs/lefthook-stage-placement.md
Worktree: 実装 item の準備時に個別の worktree を記録する。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `check-docs.sh` を pre-push に移し、Semgrep を CI と同じ版・同じ規則でステージした JS/TS だけに pre-commit で走らせ、その用意（venv と規則のキャッシュ）を Dev Container の作成時と最初の実行時に行う。markuplint は直さない形のまま残し、決定の記録を足し、doc-gardening の Skill の事実を正す。

**Architecture:** `lefthook.yml` は backend PR #853 と同じ形で `check-docs.sh` の `jobs` を pre-push へ移す。Semgrep は 2 つのシェルスクリプトに分ける。`semgrep-setup.sh` が `.github/requirements/semgrep.txt` と `static-checks.yml` の job `semgrep` の規則の checkout の段を読み、リポジトリの外のキャッシュに venv と規則を用意して、その場所を標準出力に返す。`semgrep.sh` はその出力だけを使って `semgrep scan` を走らせる。

**Tech Stack:** lefthook 2.0.4、bash（`flock`・`sha256sum`・`git`）、Python 3.11.2 の `venv`（Debian bookworm の `python3-venv`）、Semgrep 1.184.0（`semgrep.txt`）、`ruamel.yaml` 0.19.1（`semgrep.txt` の依存）、`semgrep/semgrep-rules`、git-spice

---

## Context/Purpose

- 依頼: tf-9x49i（依頼 gc-wvsr の tascon-frontend の分）。workflow root: tf-d6xae。承認済み requirements: `/home/node/tascon-frontend/.gc-artifacts/lefthook-stage-placement/requirements.md`（REQ-001〜REQ-012）。承認済み設計: `brainstorming/design.md`（案 A1・B1・C1）
- 実装タスクは **1 つ**（Task 1、ブランチ `chore/lefthook-stage-placement`）。人の返事が「lefthook の設定の直しはルールの PR と別の PR」と求めており、`check-docs.sh` の移動・Semgrep・Dev Container・文書は同じ PR に入る。Semgrep の 2 つのスクリプトと `lefthook.yml` の項目は、Skill `git-spice-workflow` の「新設した物は使うコードと同じコミット」のため分けられず、Task を分けても同じブランチを直列に触るだけになるため 1 つにする
- Task 1 の中のコミットは 5 つ（どれも英語で body 付き）
  1. `chore: run check-docs.sh before push instead of before commit`（`lefthook.yml`）
  2. `chore: run Semgrep on staged JS and TS files before commit`（`lefthook.yml`、`semgrep.sh`、`semgrep-setup.sh`）
  3. `chore: set up Semgrep when the Dev Container is created`（`postCreateCommand.sh`）
  4. `docs: record how lefthook stages follow what each check needs`（新しい決定の記録、`index.md`）
  5. `docs: stop naming the lefthook stage that runs check-docs.sh in doc-gardening`（`doc-gardening/SKILL.md`）
- Task 1 はコミットまでで、push しない。push は publish の段（`push=true`）が行い、PR は作らない（`open_pr=false`）

### 工程との対応（traceability）

この formula は requirements・plan・plan-review・decompose・implement・summarize-implementation・review・finalize・publish の各段を自分で実行している。この計画の `### Task N` はソースの変更だけを扱う。

| 段 | この計画での扱い |
| --- | --- |
| decompose | `### Task 1` を 1 つの実装 bead にする。見出しのブランチ名を準備の段が使う名前の案として渡す |
| implement（準備） | 準備の段が worktree とブランチを 1 本作る。親は `origin/<tf-d6xae の gc.var.base_branch>`（保存の段が文書の枝に書き換えた後の値。元の土台は `build/add-stryker`） |
| implement | Task 1 の Step を上から順に実行する。コミットまでで、push しない |
| summarize-implementation・finalize | Task 1 の item の実装の要約に、確かめの出力（pip の版、`semgrep-setup.sh` の 1 回目・2 回目の時間、AC-4 の規則 ID）を書く |
| publish | `push=true` のため publish の段が push する。push の pre-push で `check-docs.sh`（文書を含むため）・knip・tsc などが走る |

### 計画時に置いた仮定（headless のため質問せず記録）

1. **土台**: 準備の段が作るブランチの親は、実装の時点の root tf-d6xae の `gc.var.base_branch`（保存の段が `build/add-stryker` の上に積んだ文書の枝）とする。Step 1 で、その親の `lefthook.yml` が「Current System」の形（pre-commit に `check-docs.sh` の `jobs`、`semgrep` の項目が無い）であることを確かめ、違えばコミットせずに止める
2. **コミットの type**: `lefthook.yml` と `.lefthook/` は `chore`（requirements の Open Questions）。`postCreateCommand.sh` は `chore` とする。根拠は `git log -- .devcontainer` で、`postCreateCommand.sh` を変えた最後のコミット `80fe30c4 chore: drop gh-stack in favor of git-spice` が `chore`、`build(devcontainer)` の前例が無いこと。決定の記録と Skill の訂正は `docs`
3. **規則の取り出しの git の形**: 設計は `git fetch ... https://github.com/semgrep/semgrep-rules.git <SHA>` と URL を直に書くが、`--filter=blob:none` は git が partial clone の remote として登録した remote にしか使えない。そのため一時ディレクトリで `git remote add origin <URL>` をしてから `git fetch --depth 1 --filter=blob:none origin <SHA>` とする（計画の段で、空の repo に `git sparse-checkout set typescript/react` → `remote add` → この fetch → `git checkout FETCH_HEAD` が SHA `16b9e6d4…` で通ることを確かめた）。取り出しの後は `.git` を消し、規則のファイルだけを残す
4. **git のフックの環境変数**: pre-commit のフックの中では git が `GIT_DIR`・`GIT_INDEX_FILE` などを設定している。規則を取り出す git コマンドがこのリポジトリを触らないよう、取り出しの部分だけ `unset $(git rev-parse --local-env-vars)` をしたサブシェルで走らせる
5. **YAML の読み方**: `ruamel.yaml` 0.19.1 の既定の `YAML()`（round-trip、純 Python）で読む。`typ="safe"` は C 拡張の有無で振る舞いが変わりうるため使わない
6. **AC-4 の試しの規則**: `typescript/react/security/audit/react-dangerouslysetinnerhtml.yaml`（SHA `16b9e6d4…`）は taint の規則で、関数の分割代入の引数を source、`dangerouslySetInnerHTML={{__html: $X}}` を sink にする。試しのファイルはこれに当たる形（Step 12）にした
7. **`doc-gardening/SKILL.md` の訂正と `claude-md-maintenance` の比べる試し**: requirements の Open Questions のとおり、決まり・手順を足したり変えたりしない事実の訂正のため、比べる試しは行わない。この判断をコミット 5 の body に書く
8. **計画の段で済ませた下確かめ**: Step 6・10 の 2 つのスクリプトを計画から取り出し、scratchpad の写しのリポジトリで走らせた。`python3-venv` 無しの失敗（`exit=1`、標準出力は空、`.lock` だけが残る）、`semgrep.sh` の引数無しの `exit=0`、用意の失敗で `semgrep.sh` が `exit=1` になることは実物で確かめた。規則の部分は、本物の venv の代わりに `--without-pip --system-site-packages` の venv と PyYAML で `ruamel.yaml` の `YAML().load` を真似た物・偽の `semgrep` で走らせ、取り出し（約 2.2 秒）、2 回目に取り直さないこと、同時の 2 つの実行で取り出しが 1 回なこと、形の不一致・存在しない SHA での失敗と古い規則の印が残ること、`GIT_DIR`・`GIT_INDEX_FILE` を設定した環境でも取り出せることを確かめた。本物の pip の install と `ruamel.yaml` 0.19.1 での読み取りは実装の段の Step 9 で確かめる
9. **コミットメッセージの日本語訳**: Skill `git-spice-workflow` は「コミット前に日本語訳を提示する」と求める。headless のため、各コミットの前に英語の全文と日本語訳を bead ノートに書いてからコミットする（承認は待たない。trial の上書きの決まり）

## Current System

土台 `build/add-stryker`（origin の先端 `c2892711`）の事実。

- `lefthook.yml`（`min_version: 2.0.0`）
  - pre-commit（`parallel: true`）の `commands`: `biome`（`--write`、`stage_fixed: true`）、`markuplint`（`yarn markuplint {staged_files}`、`--fix`・`stage_fixed` 無し）、`markdownlint`、`check-logger-trace`、`protect-branch`
  - pre-commit の `jobs`: `bash .lefthook/pre-commit/check-docs.sh`（glob `ARCHITECTURE.md`・`docs/*.md`・`docs/**/*.md`、`fail_text: 'Read the report above.'`）
  - pre-push の `commands`: `knip`、`check-git-clean`、`tsc`（`yarn next typegen && yarn tsc --noEmit`）、`vitest-related`（`{push_files}`）。`jobs` は無い
  - Semgrep の項目は無い
- `.lefthook/pre-commit/check-docs.sh`（mode 100755）: `docs/tech-debt`・`docs/decisions` の形式、`docs/decisions/index.md` からのリンク、`docs/design/plans` のファイル名、`ARCHITECTURE.md` のリンク・パス、`ARCHITECTURE.md` と `docs` 配下のすべての md の相対リンク切れを確かめる。参照元は `lefthook.yml`、`static-checks.yml` の job `check-docs`、`.claude/hooks/check-docs-hook.sh`
- `.github/workflows/static-checks.yml` の job `semgrep`: `actions/checkout`（`repository: semgrep/semgrep-rules`、`ref: 16b9e6d45f10649f6a531ec4838ed9924372c3bc`、`path: .semgrep-rules`、`sparse-checkout: |` に `typescript/react`・`typescript/lang`・`javascript/react`・`javascript/browser`・`javascript/lang`）→ Python 3.13.18 → `python -m pip install --require-hashes -r .github/requirements/semgrep.txt` → `semgrep scan` に 5 つの `--config` と `--metrics=off --error --exclude .yarn`
- `.github/requirements/semgrep.txt`: pip-compile の hash 付き。`semgrep==1.184.0`、`ruamel-yaml==0.19.1` を含む
- `.devcontainer/postCreateCommand.sh`（`set -eu`、`postCreateCommand` から `bash ./.devcontainer/postCreateCommand.sh`、cwd は `/home/node/tascon-frontend`）: 最後の 2 段が `echo 'Setting up Lefthook...'` → `yarn lefthook install`、`echo 'Setting up TypeScript Language Server...'` → `(cd "${HOME}" && sudo npm install -g typescript-language-server)`
- Dev Container: `python3` 3.11.2、`flock`・`sha256sum`・`git` は在る。`python3-venv`・`python3.11-venv` は入っていない（`dpkg -l` が `un`）。`pip`・`ensurepip`・`semgrep` は無い
- `.claude/skills/doc-gardening/SKILL.md` の 8 行目: 「書式・必須項目等の形式的な規約準拠は`check-docs.sh`（lefthook pre-commit）が機械的に検証するため、このスキルでは対象としない。」
- `docs/decisions/index.md`: 12 件のリンク。最後の行は `- Yarnのリンカーはnode-modulesのままにし、PnPに切り替えない (`keep-node-modules-linker.md`)`
- 既存の決定の記録で段に触れる物: `local-hooks-vs-ci-checks.md`（markuplint は検査だけ）、`static-checks-in-pr-ci.md` の 23 行目「lefthookのpre-commitで中身を確かめているmarkdownlint・check-logger-trace・`check-docs.sh`はCIになく…」、`security-and-review-checks-in-pr-ci.md`（規則はリポジトリに写さない、規則の SHA は手で更新）
- `.markdownlint-cli2.jsonc`: `default: true`、`MD007` indent 2、`MD013` 無効、`MD033` 無効、`gitignore: true`
- 決定の記録の形式（`.claude/rules/decisions-maintenance.md`）: 見出し `# <タイトル>`、`Status`・`Verification Status`・`Date`・`Related Files` の 4 項目、`## Context`・`## Decision`・`## Considered Options`・`## Consequences`。日本語。`check-docs.sh` が項目・見出し・`index.md` からのリンクを確かめる
- 単体テストの道具（Vitest）はあるが、この変更（シェルスクリプトと設定）は対象外。確かめは実際に走らせて行う

## Proposed Implementation

### File Structure

- Modify: `lefthook.yml` — pre-commit の `jobs` を消し、pre-push に同じ `jobs` を足す。pre-commit の `commands` の `check-logger-trace` の後に `semgrep` を足す。ほかの項目（markuplint を含む）は変えない
- Create: `.lefthook/pre-commit/semgrep-setup.sh`（mode 100755）— venv と規則をキャッシュに用意し、`semgrep` と規則のディレクトリの絶対パスを標準出力に返す。単独でも走る
- Create: `.lefthook/pre-commit/semgrep.sh`（mode 100755）— `semgrep-setup.sh` の出力を使って、引数のファイルに `semgrep scan` を走らせる
- Modify: `.devcontainer/postCreateCommand.sh` — 末尾に「Setting up Semgrep...」の段
- Create: `docs/decisions/lefthook-stage-by-check-needs.md` — 決定の記録
- Modify: `docs/decisions/index.md` — 末尾に 1 行
- Modify: `.claude/skills/doc-gardening/SKILL.md` — 8 行目の「（lefthook pre-commit）」を消す
- 変えないファイル: `.lefthook/pre-commit/check-docs.sh`、`.github/workflows/static-checks.yml`、`.github/requirements/`、`.claude/rules/`、`.claude/hooks/`、既存の決定の記録の本文、`docs/design/` の過去の文書、`.devcontainer/` のほかのファイル
- リポジトリの外に作る物（コミットしない）: `${XDG_CACHE_HOME:-$HOME/.cache}/tascon-frontend/semgrep/` の下の `.lock`・`venv/`（印 `venv/.requirements-sha256`）・`rules/`（印 `rules/.rules-spec`）

### Task 1: lefthook の段を確かめに要る物で決め、Semgrep を pre-commit に入れる（`chore/lefthook-stage-placement`）

**Files:**

- Modify: `lefthook.yml`、`.devcontainer/postCreateCommand.sh`、`docs/decisions/index.md`、`.claude/skills/doc-gardening/SKILL.md`
- Create: `.lefthook/pre-commit/semgrep-setup.sh`、`.lefthook/pre-commit/semgrep.sh`、`docs/decisions/lefthook-stage-by-check-needs.md`
- Test: 自動テストなし（シェルスクリプトと設定）。`yarn lefthook validate`、`yarn lefthook run`、`semgrep-setup.sh` の単独実行、一時的な試しのファイル（コミットしない）で確かめる

**Behavior / Acceptance:** requirements の REQ-001〜REQ-012（AC-1〜AC-12）

**前提条件（実装セッション）:**

- セッションの作業ディレクトリが、準備の段の作ったこの item の worktree（`.claude/worktrees/<name>`）であること。main checkout（`/home/node/tascon-frontend`）のブランチは切り替えない。以下のコマンドはすべて worktree の根で走らせる
- ブランチ・コミットは Skill `git-spice-workflow` に従う。コミットは `git-spice commit create`（素の `git commit` は使わない）。`gh stack` は使わない
- 試しのファイルは worktree の中（コミットしない）かシステムの一時ディレクトリにだけ置き、確かめの後に消す
- 確かめのコマンドの出力（要所）を bead ノートに残す
- シェルの変数は Bash の呼び出しをまたいで残らない。`$BASE` を使う Step では、先に Step 1 と同じ `BASE="$(gc bd show tf-d6xae --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.var.base_branch"]')"` を走らせる

- [ ] **Step 1: 土台と作業ブランチを確かめる**

  ```bash
  git fetch origin
  BASE="$(gc bd show tf-d6xae --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.var.base_branch"]')"
  echo "BASE=$BASE"
  git branch --show-current
  git merge-base --is-ancestor "origin/$BASE" HEAD && echo "HEAD contains origin/$BASE"
  git log --oneline "origin/$BASE"..HEAD
  git status --porcelain
  git show "origin/$BASE:lefthook.yml" | grep -nE 'check-docs|semgrep|^pre-push:|^  jobs:'
  git-spice ls
  ```

  Expected: `BASE` が空でない（保存の段の後なら文書の枝、まだなら `build/add-stryker`）。ブランチが `chore/lefthook-stage-placement`（準備の段が別の名前で作っていれば、名前を変えずに実際の名前を bead ノートと実装の要約に書いて続ける）。`HEAD contains origin/$BASE` が出る。`git log` と `git status --porcelain` が空。`grep` の出力が `  jobs:`、`    - run: bash .lefthook/pre-commit/check-docs.sh`、`pre-push:` の 3 行で、行番号がこの順に増え（`jobs` と `check-docs.sh` が pre-commit 側にある）、`semgrep` を含まない。

  満たさない場合（`lefthook.yml` に既に `semgrep` がある、`check-docs.sh` が pre-push にある等）は、コミットせずに確かめた値を bead ノートに書き、bead を blocked にして理由を書き、人への通知スクリプトで報告し、assignee を外して drain する。満たす場合は「土台: $BASE ($(git rev-parse --short "origin/$BASE"))」を bead ノートに書く。

- [ ] **Step 2: `check-docs.sh` の `jobs` を pre-push へ移す**

  `lefthook.yml` の pre-commit から次の 7 行（`  jobs:` から `fail_text` まで）を消す。

  ```yaml
    jobs:
      - run: bash .lefthook/pre-commit/check-docs.sh
        glob:
          - "ARCHITECTURE.md"
          - "docs/*.md"
          - "docs/**/*.md"
        fail_text: 'Read the report above.'
  ```

  同じ 7 行を、pre-push の `commands` の最後の項目（`vitest-related`）の後、ファイルの末尾に足す。編集後の pre-push 全体は次のとおり。

  ```yaml
  pre-push:
    commands:
      knip:
        run: yarn knip
        fail_text: 'Read the report above.'
      check-git-clean:
        run: test -z "$(git status --porcelain | tee /dev/tty)"
        fail_text: 'ERROR: Commit or stash changes before pushing.'
      tsc:
        run: yarn next typegen && yarn tsc --noEmit
        fail_text: 'Read the report above.'
      vitest-related:
        glob: '*.{ts,tsx}'
        run: yarn vitest related --run --passWithNoTests {push_files}
        fail_text: 'Read the report above.'
    jobs:
      - run: bash .lefthook/pre-commit/check-docs.sh
        glob:
          - "ARCHITECTURE.md"
          - "docs/*.md"
          - "docs/**/*.md"
        fail_text: 'Read the report above.'
  ```

  `.lefthook/pre-commit/check-docs.sh` は動かさず、中身も変えない。

- [ ] **Step 3: 設定と pre-commit 側を確かめる（AC-1 の一部、AC-12）**

  ```bash
  yarn lefthook validate
  git diff --stat
  git diff "origin/$BASE" -- .lefthook/pre-commit/check-docs.sh
  yarn lefthook run pre-commit --file docs/decisions/index.md 2>&1 | tee /tmp/lefthook-pre-commit-docs.txt
  grep -c 'check-docs' /tmp/lefthook-pre-commit-docs.txt
  ```

  Expected: `validate` が成功（`All good`）。`--stat` が `lefthook.yml` だけ。`check-docs.sh` の差分が空。pre-commit の実行が成功し（`markdownlint` が通る、`protect-branch` が通る）、`grep -c` が `0`。

- [ ] **Step 4: コミット 1**

  bead ノートに、下のメッセージの英語の全文と日本語訳を書いてからコミットする。

  ```bash
  git add lefthook.yml
  git-spice commit create \
    -m "chore: run check-docs.sh before push instead of before commit" \
    -m "check-docs.sh checks the format of decision and tech-debt records and every relative link under ARCHITECTURE.md and docs/, so it needs the whole project rather than the staged files alone. Move its lefthook job from pre-commit to pre-push and keep the same run, glob and fail_text, so it still runs only when the pushed files include documents." \
    -m "Keep the script in .lefthook/pre-commit/, as the backend did, so the CI job check-docs, the Claude hook check-docs-hook.sh and the existing documents keep pointing at the same path."
  git log -1 --format='%h %s%n%n%b'
  git branch --show-current
  ```

  日本語訳（bead ノート用）: 件名「check-docs.sh をコミットの前ではなく push の前に走らせる」。本文「check-docs.sh は決定の記録と技術的負債の記録の形式、ARCHITECTURE.md と docs/ の下のすべての相対リンクを確かめるので、ステージしたファイルだけでなくプロジェクト全体が要る。lefthook の job を pre-commit から pre-push へ移し、run・glob・fail_text は同じに保つ。文書を push するファイルに含むときだけ走るのは変わらない。」「backend と同じく、スクリプトは .lefthook/pre-commit/ に残す。CI の job check-docs、Claude のフック check-docs-hook.sh、既存の文書が同じパスを指したままになる。」

  Expected: pre-commit が通り、`chore:` のコミットが 1 つでき、body が 2 段落ある。`git branch --show-current` が作業ブランチのまま（`gs commit create` の後に別のブランチへ移っていない）。

- [ ] **Step 5: pre-push 側を確かめる（AC-1）**

  ```bash
  git status --porcelain
  yarn lefthook run pre-push --file docs/decisions/index.md 2>&1 | tee /tmp/lefthook-pre-push-docs.txt; echo "exit=${PIPESTATUS[0]}"
  yarn lefthook run pre-push --file src/app/api/log/route.ts 2>&1 | tee /tmp/lefthook-pre-push-src.txt; echo "exit=${PIPESTATUS[0]}"
  grep -n 'check-docs' /tmp/lefthook-pre-push-docs.txt /tmp/lefthook-pre-push-src.txt
  ```

  `--force` は glob を飛ばすので使わない。

  Expected: `git status --porcelain` が空（`check-git-clean` が通るため）。1 つ目は `exit=0` で、出力に `bash .lefthook/pre-commit/check-docs.sh` の job が走って成功した行がある（knip・tsc も走って通る。`vitest-related` は glob に当たらず skip）。2 つ目は `exit=0` で、check-docs の job が `(skip) no matching push files` と出る（`vitest-related` は `route.ts` に関係するテストを走らせ、無ければ `--passWithNoTests` で通る）。出力の文言が違っても、1 つ目で check-docs が走り 2 つ目で走らないことが読み取れればよい。読み取れない場合は、出力の全文を bead ノートに残し、`lefthook.yml` を変えずに実装の要約の「確かめで想定と違った所」に書く。

- [ ] **Step 6: `semgrep-setup.sh` を書く**

  `.lefthook/pre-commit/semgrep-setup.sh` を次の中身で作り、`chmod 755` する。

  ```bash
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
  ```

  コードブロックの中身を、リストの字下げ（各行の先頭の 2 桁）を除いてそのまま書く。heredoc の Python の行と閉じの `PY` の行は 1 桁目から始まる（字下げすると heredoc が閉じず、Python も字下げの誤りになる）。

  ```bash
  chmod 755 .lefthook/pre-commit/semgrep-setup.sh
  bash -n .lefthook/pre-commit/semgrep-setup.sh && echo syntax-ok
  command -v shellcheck && shellcheck .lefthook/pre-commit/semgrep-setup.sh
  ```

  Expected: `syntax-ok`。`shellcheck` が在れば指摘が無い（無ければ飛ばしたことを bead ノートに書く）。

- [ ] **Step 7: `python3-venv` が無いときの失敗を確かめる（AC-5 の失敗の道）**

  ```bash
  dpkg -s python3.11-venv >/dev/null 2>&1 && echo "python3.11-venv installed" || echo "python3.11-venv missing"
  TEST_CACHE="$(mktemp -d)"
  XDG_CACHE_HOME="${TEST_CACHE}" bash .lefthook/pre-commit/semgrep-setup.sh >/tmp/semgrep-setup-novenv.out 2>/tmp/semgrep-setup-novenv.err; echo "exit=$?"
  cat /tmp/semgrep-setup-novenv.err
  wc -c </tmp/semgrep-setup-novenv.out
  ls -A "${TEST_CACHE}/tascon-frontend/semgrep"
  rm -rf "${TEST_CACHE}"
  ```

  Expected（`python3.11-venv missing` のとき）: `exit=1`。標準エラーに Python の `ensurepip is not available` の文と、`semgrep-setup: ERROR: python3 -m venv failed. Run 'sudo apt-get install -y python3-venv' or rebuild the Dev Container.` がある。標準出力は `0` バイト。`ls -A` は `.lock` だけ（半端な `venv/` は消えている）。

  `python3.11-venv installed` のとき（ほかの作業が既に入れていた）は、実際には試せないため、Step 6 のスクリプトの `python3 -m venv` が失敗したときの分岐（`rm -rf` と `die` の文）を読んで確かめた旨を bead ノートに書く。

- [ ] **Step 8: Dev Container の作成時と同じ手順で `python3-venv` を入れる（AC-7 の手での実行の前半）**

  ```bash
  sudo apt-get update
  sudo apt-get install -y --no-install-recommends python3-venv
  dpkg -s python3-venv python3.11-venv | grep -E '^(Package|Status|Version):'
  ```

  Expected: 2 つのパッケージが `install ok installed`。版を bead ノートに書く。失敗した場合は出力の全文を bead ノートに残し、bead を blocked にして人への通知スクリプトで報告する（Dev Container の作成時の段も同じ理由で落ちるため、計画から外れる）。

- [ ] **Step 9: `semgrep-setup.sh` の振る舞いを一時的なキャッシュで確かめる（AC-5）**

  キャッシュは一時ディレクトリにし、ふだんのキャッシュを触らない。各段の標準出力と標準エラーをファイルに分けて残す。

  ```bash
  TEST_CACHE="$(mktemp -d)"
  run_setup() {
    local name="$1"
    local start end
    start="$(date +%s.%N)"
    XDG_CACHE_HOME="${TEST_CACHE}" bash .lefthook/pre-commit/semgrep-setup.sh >"/tmp/semgrep-setup-${name}.out" 2>"/tmp/semgrep-setup-${name}.err"
    local status=$?
    end="$(date +%s.%N)"
    echo "${name}: exit=${status} seconds=$(echo "${end} - ${start}" | bc)"
    grep -E 'Creating|Fetching|ERROR' "/tmp/semgrep-setup-${name}.err" || true
  }
  ```

  9-a 空から作る:

  ```bash
  run_setup empty
  cat /tmp/semgrep-setup-empty.out
  "$(head -n 1 /tmp/semgrep-setup-empty.out)" --version
  "${TEST_CACHE}/tascon-frontend/semgrep/venv/bin/python" -m pip --version
  ls -A "${TEST_CACHE}/tascon-frontend/semgrep" "${TEST_CACHE}/tascon-frontend/semgrep/rules"
  ```

  Expected: `exit=0`、`Creating the Semgrep virtual environment` と `Fetching the Semgrep rules` の 2 行。標準出力は 6 行で、1 行目が `${TEST_CACHE}/tascon-frontend/semgrep/venv/bin/semgrep`、2〜6 行目が `${TEST_CACHE}/tascon-frontend/semgrep/rules/` の下の `typescript/react`・`typescript/lang`・`javascript/react`・`javascript/browser`・`javascript/lang`（この順）。`--version` が `1.184.0`。pip の版（Debian bookworm の ensurepip の pip）と `seconds` を bead ノートに書く（requirements の Risks が求める記録）。`ls -A` が `.lock`・`rules`・`venv` で `rules.tmp.*` が無い。`rules` の下に `.rules-spec`・`javascript`・`typescript` と、cone mode の sparse-checkout が含める `semgrep-rules` の最上段のファイル（`README.md`・`LICENSE` など）があり、`.git` が無い。

  pip の install が失敗した場合（`exit=1` で `pip install --require-hashes ... failed`）は、出力の全文を bead ノートに残し、計画から外れる直しになるため、コミットせずに bead を blocked にして人への通知スクリプトで報告する（requirements の Risks）。

  9-b 揃っていれば作り直さない:

  ```bash
  run_setup second
  diff /tmp/semgrep-setup-empty.out /tmp/semgrep-setup-second.out && echo same-output
  ```

  Expected: `exit=0`、`Creating`・`Fetching` の行が無い、`same-output`。`seconds` が 1 秒未満の目安（9-a より大きく短い）。値を bead ノートに書く。

  9-c 印の無い venv は使わずに作り直す:

  ```bash
  rm "${TEST_CACHE}/tascon-frontend/semgrep/venv/.requirements-sha256"
  run_setup no-venv-stamp
  diff /tmp/semgrep-setup-empty.out /tmp/semgrep-setup-no-venv-stamp.out && echo same-output
  ```

  Expected: `exit=0`、`Creating` の行だけ（`Fetching` は無い）、`same-output`。

  9-d `semgrep.txt` が変わると venv だけを作り直す:

  ```bash
  echo '# probe' >>.github/requirements/semgrep.txt
  run_setup requirements-changed
  git checkout -- .github/requirements/semgrep.txt
  git status --porcelain
  ```

  Expected: `exit=0`、`Creating` の行だけ。`git status --porcelain` が空（この後の段は venv の印が試しの中身のままだが、一時キャッシュなので作り直さない）。

  9-e `static-checks.yml` の `sparse-checkout` が変わると規則だけを取り直す:

  ```bash
  sed -i '/^            javascript\/lang$/d' .github/workflows/static-checks.yml
  git diff --stat
  run_setup sparse-changed
  wc -l </tmp/semgrep-setup-sparse-changed.out
  git checkout -- .github/workflows/static-checks.yml
  run_setup sparse-restored
  diff /tmp/semgrep-setup-empty.out /tmp/semgrep-setup-sparse-restored.out && echo same-output
  git status --porcelain
  ```

  Expected: `git diff --stat` が `static-checks.yml` の 1 行の削除。`sparse-changed` は `exit=0` で、`Creating` の行が 1 つ（9-d の印のずれを直すため）と `Fetching` の行、出力が 5 行（規則のディレクトリが 4 つ）。`sparse-restored` は `exit=0` で `Fetching` の行だけ、`same-output`。`git status --porcelain` が空。

  9-f `static-checks.yml` の形が合わないと理由を出して止まる:

  ```bash
  sed -i 's#repository: semgrep/semgrep-rules#repository: example/other-rules#' .github/workflows/static-checks.yml
  run_setup shape-mismatch
  cat /tmp/semgrep-setup-shape-mismatch.err
  wc -c </tmp/semgrep-setup-shape-mismatch.out
  git checkout -- .github/workflows/static-checks.yml
  ```

  Expected: `exit=1`。標準エラーに `semgrep-setup: ERROR: expected one actions/checkout step for semgrep/semgrep-rules in the job 'semgrep' of .../static-checks.yml, found 0.` と `semgrep-setup: ERROR: Could not read the Semgrep rules from .../static-checks.yml.`。標準出力は `0` バイト。

  9-g 取り出しに失敗すると理由を出して止まり、半端な物を残さない:

  ```bash
  sed -i 's#ref: 16b9e6d45f10649f6a531ec4838ed9924372c3bc#ref: ffffffffffffffffffffffffffffffffffffffff#' .github/workflows/static-checks.yml
  run_setup fetch-failed
  cat /tmp/semgrep-setup-fetch-failed.err
  ls -A "${TEST_CACHE}/tascon-frontend/semgrep"
  cat "${TEST_CACHE}/tascon-frontend/semgrep/rules/.rules-spec" | head -n 1
  git checkout -- .github/workflows/static-checks.yml
  git status --porcelain
  ```

  Expected: `exit=1`。標準エラーに git の fetch の失敗（`fatal: remote error: upload-pack: not our ref ffffffffffffffffffffffffffffffffffffffff`）と `semgrep-setup: ERROR: Could not fetch https://github.com/semgrep/semgrep-rules.git at ffffffffffffffffffffffffffffffffffffffff. Check the network and run this script again.`。存在しない SHA を英字で作るのは、数字だけの値は YAML が整数として読み、取り出しの前に形の不一致として止まるため。`ls -A` に `rules.tmp.*` が無い。前の `rules/.rules-spec` の 1 行目は `16b9e6d45f10649f6a531ec4838ed9924372c3bc` のまま（古い規則は印が合わないので使われない）。`git status --porcelain` が空。

  9-h 同時に走っても壊れない:

  ```bash
  rm -rf "${TEST_CACHE}/tascon-frontend/semgrep/rules"
  XDG_CACHE_HOME="${TEST_CACHE}" bash .lefthook/pre-commit/semgrep-setup.sh >/tmp/semgrep-setup-p1.out 2>/tmp/semgrep-setup-p1.err &
  pid1=$!
  XDG_CACHE_HOME="${TEST_CACHE}" bash .lefthook/pre-commit/semgrep-setup.sh >/tmp/semgrep-setup-p2.out 2>/tmp/semgrep-setup-p2.err &
  pid2=$!
  wait "${pid1}"; echo "p1 exit=$?"
  wait "${pid2}"; echo "p2 exit=$?"
  cat /tmp/semgrep-setup-p1.err /tmp/semgrep-setup-p2.err | grep -c 'Fetching'
  diff /tmp/semgrep-setup-empty.out /tmp/semgrep-setup-p1.out && diff /tmp/semgrep-setup-empty.out /tmp/semgrep-setup-p2.out && echo same-output
  rm -rf "${TEST_CACHE}"
  ```

  Expected: `p1 exit=0`、`p2 exit=0`、`Fetching` が `1`（後の方は `flock` で待ち、印が合うので取り直さない）、`same-output`。

  9-a〜9-h の `exit`・`seconds`・想定と違った所を bead ノートに書く。

- [ ] **Step 10: `semgrep.sh` を書く**

  `.lefthook/pre-commit/semgrep.sh` を次の中身で作り、`chmod 755` する。

  ```bash
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
  ```

  ```bash
  chmod 755 .lefthook/pre-commit/semgrep.sh
  bash -n .lefthook/pre-commit/semgrep.sh && echo syntax-ok
  command -v shellcheck && shellcheck .lefthook/pre-commit/semgrep.sh
  bash .lefthook/pre-commit/semgrep.sh; echo "no-args exit=$?"
  ```

  Expected: `syntax-ok`、`shellcheck` の指摘が無い（在れば）、`no-args exit=0`（用意を呼ばずに終わる）。

- [ ] **Step 11: `lefthook.yml` の pre-commit に `semgrep` を足す**

  pre-commit の `commands` の `check-logger-trace` の後、`protect-branch` の前に次を足す。

  ```yaml
      semgrep:
        glob: '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'
        exclude:
          - '.yarn/**'
        run: bash .lefthook/pre-commit/semgrep.sh {staged_files}
        fail_text: 'Read the report above.'
  ```

  `stage_fixed` は付けない。markuplint の項目は触らない。

  ```bash
  yarn lefthook validate
  git diff -- lefthook.yml
  ```

  Expected: `validate` が成功。差分は上の 6 行の追加だけ（コミット 1 の分は既にコミット済み）。

- [ ] **Step 12: ふだんのキャッシュを用意し、pre-commit の `semgrep` を確かめる（AC-4、AC-7 の手での実行の後半）**

  Dev Container の作成時の段と同じく、ふだんのキャッシュに用意する。

  ```bash
  bash .lefthook/pre-commit/semgrep-setup.sh
  bash .lefthook/pre-commit/semgrep-setup.sh >/dev/null && echo second-ok
  ```

  Expected: 1 回目は、ふだんのキャッシュが無ければ `Creating`・`Fetching` を標準エラーに出し（既にあれば何も作らない）、標準出力に `$HOME/.cache/tascon-frontend/semgrep/venv/bin/semgrep`（`XDG_CACHE_HOME` が在ればその下）と規則のディレクトリ 5 つ。2 回目は何も作らず `second-ok`。

  規則に当たるファイル:

  ```bash
  cat >src/semgrep-probe.tsx <<'EOF'
  export function SemgrepProbe({ html }: { html: string }) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }
  EOF
  git add src/semgrep-probe.tsx
  yarn lefthook run pre-commit --command semgrep 2>&1 | tee /tmp/lefthook-semgrep-hit.txt; echo "exit=${PIPESTATUS[0]}"
  grep -c 'react-dangerouslysetinnerhtml' /tmp/lefthook-semgrep-hit.txt
  git diff --cached --stat
  git restore --staged src/semgrep-probe.tsx
  rm src/semgrep-probe.tsx
  ```

  Expected: `exit=1`（0 以外）。出力に Semgrep の報告（`typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml` を含む）と `Read the report above.`。`grep -c` が 1 以上。`git diff --cached --stat` が `src/semgrep-probe.tsx` だけ（ファイルは書き換わっておらず、再ステージもされていない）。

  規則に当たらないファイル:

  ```bash
  cat >src/semgrep-probe.ts <<'EOF'
  export const semgrepProbe = 1;
  EOF
  git add src/semgrep-probe.ts
  yarn lefthook run pre-commit --command semgrep 2>&1 | tee /tmp/lefthook-semgrep-clean.txt; echo "exit=${PIPESTATUS[0]}"
  git restore --staged src/semgrep-probe.ts
  rm src/semgrep-probe.ts
  ```

  Expected: `exit=0`。出力で `semgrep` が走って成功している（Semgrep の報告に指摘が無い）。

  JS/TS を含まないステージ:

  ```bash
  printf '# Semgrep probe\n' >docs/semgrep-probe.md
  git add docs/semgrep-probe.md
  yarn lefthook run pre-commit --command semgrep 2>&1 | tee /tmp/lefthook-semgrep-docs.txt; echo "exit=${PIPESTATUS[0]}"
  git restore --staged docs/semgrep-probe.md
  rm docs/semgrep-probe.md
  yarn lefthook run pre-commit --command semgrep --file .yarn/releases/yarn-4.4.0.cjs 2>&1 | tee /tmp/lefthook-semgrep-yarn.txt; echo "exit=${PIPESTATUS[0]}"
  git status --porcelain
  ```

  Expected: どちらも `exit=0` で、`semgrep` が `(skip)` と出る（1 つ目は glob に当たらない、2 つ目は `exclude` に当たる）。`git status --porcelain` が空。

  4 つの実行の `exit` と要所の出力を bead ノートに書く。

- [ ] **Step 13: スクリプトに規則の SHA と規則名が無いこと、キャッシュがリポジトリの外にあることを確かめる（AC-3、AC-6）**

  ```bash
  grep -nE '16b9e6d4|typescript/|javascript/|\.semgrep-rules' .lefthook/pre-commit/semgrep.sh .lefthook/pre-commit/semgrep-setup.sh; echo "grep exit=$?"
  grep -n -- '--autofix' .lefthook/pre-commit/semgrep.sh .lefthook/pre-commit/semgrep-setup.sh; echo "autofix grep exit=$?"
  grep -n -- '--metrics=off --error' .lefthook/pre-commit/semgrep.sh
  git status --porcelain --ignored | grep -vE '\.lefthook/pre-commit/semgrep(-setup)?\.sh$' | grep -iE 'semgrep|venv' || echo "nothing in the repository"
  ```

  Expected: 1 つ目・2 つ目の `grep exit=1`（当たり無し）。3 つ目が `exec` の行に当たる。最後が `nothing in the repository`（新しい 2 つのスクリプトの `??` の行を除くと、リポジトリの中に Semgrep・venv の物が無い）。

- [ ] **Step 14: コミット 2**

  bead ノートに英語の全文と日本語訳を書いてからコミットする。

  ```bash
  git add lefthook.yml .lefthook/pre-commit/semgrep.sh .lefthook/pre-commit/semgrep-setup.sh
  git diff --cached --stat
  git-spice commit create \
    -m "chore: run Semgrep on staged JS and TS files before commit" \
    -m "Semgrep applies its rules to each file on its own, so it can check the staged files alone. Add a pre-commit command that runs it on the staged JS and TS files outside .yarn/ with --metrics=off --error. It reports findings and stops the commit, but never rewrites files." \
    -m "semgrep-setup.sh prepares the Semgrep version and rules that CI uses. It installs .github/requirements/semgrep.txt with --require-hashes into a venv, and checks out the semgrep/semgrep-rules commit and directories that the semgrep job in static-checks.yml names, so the SHA and the rule list stay in that one place. Both live in a cache outside the repository and are rebuilt only when semgrep.txt or that checkout step changes. The venv is built in place and stamped last because a venv cannot be moved, and a lock keeps parallel hooks and worktrees from building at the same time."
  git log -1 --format='%h %s%n%n%b'
  git branch --show-current
  ```

  日本語訳（bead ノート用）: 件名「ステージした JS と TS のファイルにコミットの前に Semgrep を走らせる」。本文「Semgrep は規則をファイルごとに当てるので、ステージしたファイルだけで確かめられる。.yarn/ の外のステージした JS・TS のファイルに --metrics=off --error で走らせる pre-commit のコマンドを足す。指摘を出してコミットを止めるが、ファイルを書き換えない。」「semgrep-setup.sh は CI と同じ Semgrep の版と規則を用意する。.github/requirements/semgrep.txt を --require-hashes で venv に入れ、static-checks.yml の job semgrep が指す semgrep/semgrep-rules のコミットとディレクトリを取り出すので、SHA と規則の一覧はその 1 か所に留まる。どちらもリポジトリの外のキャッシュに置き、semgrep.txt かその checkout の段が変わったときだけ作り直す。venv は移せないのでその場で作って印を最後に書き、ロックで並列のフックと worktree が同時に作らないようにする。」

  Expected: `--stat` が 3 ファイル。pre-commit が通る（JS/TS を含まないので `semgrep` は skip）。`chore:` のコミットができ、作業ブランチのまま。

- [ ] **Step 15: `postCreateCommand.sh` に Semgrep の段を足し、コミット 3（AC-7）**

  `.devcontainer/postCreateCommand.sh` の末尾（`(cd "${HOME}" && sudo npm install -g typescript-language-server)` の行の後）に次の 5 行を足す（最初の行は空行）。

  ```bash

  echo 'Setting up Semgrep...'
  sudo apt-get update
  sudo apt-get install -y --no-install-recommends python3-venv
  bash .lefthook/pre-commit/semgrep-setup.sh
  ```

  `set -eu` はそのままにし、失敗を警告に変える包みは付けない。足した段と同じ手順は Step 8 と Step 12 の 1 回目で手で走らせ済み。念のためもう 1 度、足した 3 行を上から走らせる。

  ```bash
  bash -n .devcontainer/postCreateCommand.sh && echo syntax-ok
  tail -n 6 .devcontainer/postCreateCommand.sh
  sudo apt-get update >/dev/null && sudo apt-get install -y --no-install-recommends python3-venv >/dev/null && bash .lefthook/pre-commit/semgrep-setup.sh; echo "exit=$?"
  ```

  Expected: `syntax-ok`。`tail` の最後の 4 行が上の 4 行。最後の実行が `exit=0` で、標準出力に `semgrep` と規則のディレクトリ 5 つ（作り直しは起きない）。

  bead ノートに英語の全文と日本語訳を書いてからコミットする。

  ```bash
  git add .devcontainer/postCreateCommand.sh
  git-spice commit create \
    -m "chore: set up Semgrep when the Dev Container is created" \
    -m "The image has python3 but no ensurepip, so python3 -m venv cannot create a venv with pip. Install python3-venv and run semgrep-setup.sh at the end of postCreateCommand.sh, so the first commit with JS or TS files does not have to build the venv and fetch the rules." \
    -m "The step comes last so that a network failure here leaves the earlier steps done; the pre-commit hook builds the cache on its first run in that case."
  git log -1 --format='%h %s%n%n%b'
  git branch --show-current
  ```

  日本語訳（bead ノート用）: 件名「Dev Container の作成時に Semgrep を用意する」。本文「イメージには python3 はあるが ensurepip が無く、python3 -m venv で pip 付きの venv を作れない。postCreateCommand.sh の最後で python3-venv を入れて semgrep-setup.sh を走らせ、JS か TS のファイルを含む最初のコミットが venv の作成と規則の取り出しを待たなくてよいようにする。」「ここでネットワークが失敗しても前の段は済んでいるよう、この段を最後に置く。その場合は pre-commit のフックが最初の実行でキャッシュを作る。」

  Expected: pre-commit が通り、`chore:` のコミットができ、作業ブランチのまま。

- [ ] **Step 16: 決定の記録を足し、コミット 4（AC-10）**

  `docs/decisions/lefthook-stage-by-check-needs.md` を次の中身で作る。`Date` は実装した日（`date +%F`。計画作成時点では `2026-11-21`）にする。

  ```markdown
  # lefthookの段は確かめに要る物で決め、SemgrepはステージしたファイルにCIと同じ版と規則で走らせる

  - **Status:** Accepted
  - **Verification Status:** Verified
  - **Date:** 2026-11-21
  - **Related Files:** lefthook.yml, .lefthook/pre-commit/semgrep.sh, .lefthook/pre-commit/semgrep-setup.sh, .devcontainer/postCreateCommand.sh

  ## Context

  lefthookの段を、それぞれの確かめに要る物で決めることにした（人の決定）。pre-commitは変えたファイルだけで確かめられる物、pre-pushはプロジェクト全体は要るがビルド・サーバー・ブラウザ・DBは要らない物とする。lefthookで直すのは、意味を変えないと保証された直しだけとする。

  これまでの形と、検討の過程で確認したこと:

  - `check-docs.sh`は決定の記録・技術的負債の記録の形式と、`ARCHITECTURE.md`・`docs`配下のすべての相対リンクを確かめ、プロジェクト全体を見る。これを、文書を含むコミットのたびにpre-commitで走らせていた
  - SemgrepはPRごとのCI（`static-checks.yml`のジョブ`semgrep`）だけで走り、lefthookになかった。Semgrepの規則はファイルごとに当たるため、変えたファイルだけで確かめられる
  - CIのSemgrepは、版を`.github/requirements/semgrep.txt`（hash付き）で固定し、規則を`semgrep/semgrep-rules`の`actions/checkout`の`ref`（コミットのSHA）と`sparse-checkout`で取り出して使う。規則はライセンス上リポジトリに写さない（セキュリティと変更の影響を見る道具をPRごとのCIに入れ、指摘で落ちる物だけをchecksのneedsに入れる (path: security-and-review-checks-in-pr-ci.md)）
  - Dev Containerには`python3`（3.11）があるが、`pip`・`ensurepip`・`semgrep`がない。Debianの`python3-venv`を入れると、`python3 -m venv`でpip付きのvenvを作れる
  - CIのPython 3.13向けに作った`semgrep.txt`は、Dev ContainerのPython 3.11にも`pip install --require-hashes`で入った
  - venvは作った場所の絶対パスを中のスクリプトに持つため、別の場所で作ってから移せない
  - markuplintは手元のgitフックは意味を変えない自動修正と速い検査に限り、CIは検査だけを行う (path: local-hooks-vs-ci-checks.md)で既に検査だけにしている
  - tascon-backendは同じ決まりに合わせて、`check-docs.sh`を`.lefthook/pre-commit/`に置いたままpre-pushへ移した

  ## Decision

  - `check-docs.sh`はpre-pushで、pushするファイルに文書（`ARCHITECTURE.md`・`docs`配下のMarkdown）が含まれるときだけ走らせる。スクリプトの置き場所（`.lefthook/pre-commit/`）とglobは変えない
  - Semgrepはpre-commitで、ステージしたJS・TSのファイル（`.yarn`配下を除く）だけに`--metrics=off --error`で走らせる。指摘があればコミットを止め、直さない（`--autofix`も`stage_fixed`も使わない）
  - 手元のSemgrepの版と規則はCIと同じ所から取る。版は`semgrep.txt`から、規則のSHAと取り出すディレクトリは`static-checks.yml`のジョブ`semgrep`の規則の`actions/checkout`の段から読み、スクリプトには書かない
  - Semgrepのvenvと規則はリポジトリの外のキャッシュ（`${XDG_CACHE_HOME:-$HOME/.cache}/tascon-frontend/semgrep/`）に置き、`semgrep.txt`、または規則のSHA・ディレクトリが変わったときだけ作り直す。venvはその場で作り、出来上がった後に印を書く
  - Dev Containerの作成時に`python3-venv`を入れてキャッシュを用意する。用意がない・古いときは、pre-commitの最初の実行で用意する。用意に失敗したときは理由を出してコミットを止める
  - markuplintは引き続き検査だけを行う
  - CIのジョブ`check-docs`・`semgrep`は変えず、リポジトリ全体を確かめ続ける

  ## Considered Options

  - `check-docs.sh`の`jobs`をpre-pushへ移し、置き場所とglobを変えない（採用）: CI・Claudeのフック・決定の記録・過去の計画が指すパスが古くならず、backendと同じ形になる。ディレクトリ名（`pre-commit/`）と走る段がずれる。文書以外のファイルの削除でリンクが切れるpushでは走らない
  - `check-docs.sh`を`.lefthook/pre-push/`へ移す: 置き場所と段がそろう一方、`static-checks.yml`と`.claude/hooks/check-docs-hook.sh`を変える必要があり、決定の記録と過去の計画のパスが古くなる。backendと形が分かれる
  - `check-docs.sh`のglobを外し、すべてのpushで走らせる: 文書以外の変更によるリンク切れもpushの前に見つかる一方、backendと形が分かれ、CIが同じ物を全体で確かめている
  - Dev Containerの作成時に`python3-venv`を入れ、用意スクリプトがvenvと規則をキャッシュに用意する（採用）: pipはDebianの署名付きパッケージから来て、版の固定を自分で持たない。worktreeの間でキャッシュを共有できる。Dev Containerの作成が`apt-get`の分遅くなり、作り直すまでは同じ手順を手で1回走らせる必要がある
  - フックのスクリプトがpipのwheelを固定のhashで取り、`--without-pip`のvenvに入れる: `sudo`・`apt-get`・作り直しが要らない一方、pipの版とhashを手で保守する所が増え、Dependabotも更新しない
  - `Dockerfile`に`python3-venv`とSemgrepを焼き込む: コンテナを作るたびに用意済みになる一方、composeのappイメージに開発だけの道具が混ざり、配布できない規則をイメージに入れることになる。版の更新のたびにイメージの作り直しが要る
  - 規則のSHAと取り出すディレクトリを`static-checks.yml`から読む（採用）: SHAと規則の一覧がCIの1か所だけにあり、手で更新しても手元が追う。手元のスクリプトがCIのワークフローの形に依存する
  - 用意スクリプトにSHAとディレクトリを書く: スクリプトが単純な一方、片方だけ更新されると手元とCIで結果が分かれる

  ## Consequences

  - 文書を含まないコミット・pushでは`check-docs.sh`が走らない。文書以外のファイルの削除でリンクが切れても、pushの前には気づかず、CIのジョブ`check-docs`で気づく
  - `check-docs.sh`の置き場所のディレクトリ名（`pre-commit/`）と走る段（pre-push）がずれる
  - JS・TSを含むコミットは、Semgrepの分（数秒）遅くなる。キャッシュがない最初のコミットは、venvの作成と規則の取り出しで、さらに時間とネットワークが要る
  - ネットワークがなくキャッシュが古いと、JS・TSを含むコミットが止まる。`--no-verify`で飛ばしても、CIのジョブ`semgrep`が確かめる
  - `static-checks.yml`のジョブ`semgrep`の規則の段の形が変わると、手元の用意が理由を出して失敗し、`semgrep-setup.sh`の読み方を直す必要がある
  - `semgrep.txt`を更新したとき、Python 3.11向けのwheelがない依存があると、手元の用意が失敗する
  - Dev Containerの作成が`apt-get`の分（数十秒）遅くなる
  - 型・Lint・未使用コード・マークアップ・Markdown・ドキュメント・テスト・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する (path: static-checks-in-pr-ci.md)のContextにある「lefthookのpre-commitで中身を確かめている…`check-docs.sh`」の記述と、`docs/design/plans/`の過去の計画は、その時点の事実として`check-docs.sh`をpre-commitと書いたまま残る（本文は書き換えない）
  ```

  `docs/decisions/index.md` の末尾（`keep-node-modules-linker.md` の行の後）に次の 1 行を足す。

  ```markdown
  - lefthookの段は確かめに要る物で決め、SemgrepはステージしたファイルにCIと同じ版と規則で走らせる (path: lefthook-stage-by-check-needs.md)
  ```

  ```bash
  bash .lefthook/pre-commit/check-docs.sh; echo "check-docs exit=$?"
  yarn markdownlint-cli2 docs/decisions/lefthook-stage-by-check-needs.md docs/decisions/index.md; echo "markdownlint exit=$?"
  git diff --name-status "origin/$BASE" -- docs/decisions/
  ```

  Expected: どちらも `exit=0`。`--name-status` が `A docs/decisions/lefthook-stage-by-check-needs.md` と `M docs/decisions/index.md` の 2 行だけ（既存の決定の記録の本文に差分が無い）。markdownlint は追跡するファイルとこの 2 つだけを渡す（`'**/*.md'` の全体の glob は `.claude/worktrees` 等を拾うため使わない）。

  bead ノートに英語の全文と日本語訳を書いてからコミットする。

  ```bash
  git add docs/decisions/lefthook-stage-by-check-needs.md docs/decisions/index.md
  git-spice commit create \
    -m "docs: record how lefthook stages follow what each check needs" \
    -m "Record why check-docs.sh moves to pre-push, why Semgrep runs on the staged JS and TS files before commit with the version and rules that CI uses, why the venv and rules live in a cache outside the repository, and the options that were weighed. The existing records keep their text; the new record notes that static-checks-in-pr-ci.md and the past plans still describe check-docs.sh as a pre-commit check."
  git log -1 --format='%h %s%n%n%b'
  git branch --show-current
  ```

  日本語訳（bead ノート用）: 件名「lefthook の段がそれぞれの確かめに要る物に従う決定を記録する」。本文「check-docs.sh を pre-push へ移す理由、Semgrep を CI と同じ版と規則でコミットの前にステージした JS と TS のファイルに走らせる理由、venv と規則をリポジトリの外のキャッシュに置く理由と、比べた案を記録する。既存の記録の本文は変えず、static-checks-in-pr-ci.md と過去の計画が check-docs.sh を pre-commit の確かめとして書いたまま残ることを新しい記録に書く。」

  Expected: pre-commit の markdownlint が通り（`check-docs.sh` は pre-commit で走らない）、`docs:` のコミットができ、作業ブランチのまま。

- [ ] **Step 17: `doc-gardening/SKILL.md` の段の名前を消し、コミット 5（AC-11）**

  `.claude/skills/doc-gardening/SKILL.md` の 8 行目を次のとおりにする（「（lefthook pre-commit）」だけを消す。ほかの文は変えない）。

  変更前:

  ```markdown
  既存のドキュメントの陳腐化（実装・実際の状態との乖離）を検知する。書式・必須項目等の形式的な規約準拠は`check-docs.sh`（lefthook pre-commit）が機械的に検証するため、このスキルでは対象としない。
  ```

  変更後:

  ```markdown
  既存のドキュメントの陳腐化（実装・実際の状態との乖離）を検知する。書式・必須項目等の形式的な規約準拠は`check-docs.sh`が機械的に検証するため、このスキルでは対象としない。
  ```

  ```bash
  git diff -- .claude/skills/doc-gardening/SKILL.md
  grep -n 'lefthook pre-commit' .claude/skills/doc-gardening/SKILL.md; echo "grep exit=$?"
  yarn markdownlint-cli2 .claude/skills/doc-gardening/SKILL.md; echo "markdownlint exit=$?"
  ```

  Expected: 差分は 8 行目の 1 行だけ。`grep exit=1`。`markdownlint exit=0`。

  `claude-md-maintenance` の比べる試しは行わない（仮定 7）。bead ノートに英語の全文と日本語訳を書いてからコミットする。

  ```bash
  git add .claude/skills/doc-gardening/SKILL.md
  git-spice commit create \
    -m "docs: stop naming the lefthook stage that runs check-docs.sh in doc-gardening" \
    -m "check-docs.sh now runs before push, not before commit. Remove the stage name from the doc-gardening skill so the sentence stays true wherever the script runs." \
    -m "This corrects a fact and does not add or change a rule or a step, so the comparison test in claude-md-maintenance.md is not run. That test checks whether an added or changed rule changes behavior and deletes the rule when it does not, which here would keep the outdated stage name."
  git log -1 --format='%h %s%n%n%b'
  git branch --show-current
  ```

  日本語訳（bead ノート用）: 件名「doc-gardening で check-docs.sh を走らせる lefthook の段の名前を書かない」。本文「check-docs.sh はコミットの前ではなく push の前に走るようになった。doc-gardening の Skill から段の名前を消し、スクリプトがどこで走っても文が正しいままにする。」「これは事実の訂正で、決まりも手順も足したり変えたりしないため、claude-md-maintenance.md の比べる試しは行わない。この試しは足した・変えた決まりが振る舞いを変えるかを見て、変えなければその決まりを消すもので、ここに当てると古い段の名前を残すことになる。」

  Expected: pre-commit の markdownlint が通り、`docs:` のコミットができ、作業ブランチのまま。

- [ ] **Step 18: 全体を確かめ、結果を残す（AC-1〜AC-12 のまとめ）**

  ```bash
  git status --porcelain
  git log --format='%h %s' "origin/$BASE"..HEAD
  git diff --stat "origin/$BASE"...HEAD
  git diff "origin/$BASE"...HEAD -- .github/workflows/static-checks.yml .claude/rules/ .lefthook/pre-commit/check-docs.sh .github/requirements/
  git diff "origin/$BASE"...HEAD -- lefthook.yml | grep -nE 'markuplint|--fix|stage_fixed'; echo "markuplint grep exit=$?"
  git show HEAD:lefthook.yml | sed -n '/^    markuplint:/,/^    [a-z-]*:$/p'
  git diff --name-status "origin/$BASE"...HEAD -- docs/decisions/
  yarn lefthook validate
  bash .lefthook/pre-commit/check-docs.sh; echo "check-docs exit=$?"
  yarn markdownlint-cli2 docs/decisions/lefthook-stage-by-check-needs.md docs/decisions/index.md .claude/skills/doc-gardening/SKILL.md; echo "markdownlint exit=$?"
  yarn lefthook run pre-push --file docs/decisions/lefthook-stage-by-check-needs.md; echo "pre-push exit=$?"
  git status --porcelain
  ```

  Expected:

  - 最初と最後の `git status --porcelain` が空（AC-6）
  - コミットが 5 つ（`chore:` 3 つ、`docs:` 2 つ）
  - `--stat` が 7 ファイル: `.claude/skills/doc-gardening/SKILL.md`、`.devcontainer/postCreateCommand.sh`、`.lefthook/pre-commit/semgrep-setup.sh`、`.lefthook/pre-commit/semgrep.sh`、`docs/decisions/index.md`、`docs/decisions/lefthook-stage-by-check-needs.md`、`lefthook.yml`
  - `static-checks.yml`・`.claude/rules/`・`check-docs.sh`・`.github/requirements/` の差分が空（AC-1・AC-9）
  - `lefthook.yml` の差分に `markuplint`・`--fix`・`stage_fixed` が出ず `markuplint grep exit=1`。`markuplint` の項目が `glob`・`run: yarn markuplint {staged_files}`・`fail_text` の 3 つだけ（AC-8）
  - `docs/decisions/` の差分が `A lefthook-stage-by-check-needs.md` と `M index.md` だけ（AC-10）
  - `validate`・`check-docs`・`markdownlint`・`pre-push` がどれも成功（AC-10・AC-12。pre-push では check-docs の job が走る）

  bead ノートに次を書く: ブランチ名、`<BASE>` と SHA、5 つのコミットの SHA と件名、push していない（publish の段が行う）、AC-1〜AC-12 のそれぞれの結果（Step 3・5・7・9・12・13・16・17・18 の出力の要所）、pip の版、`semgrep-setup.sh` の 1 回目・2 回目の時間、`python3-venv` を今のコンテナに入れたこと、想定と違った所。item の実装の要約にも同じ要点を書く。

## Non-Goals

- `.github/workflows/static-checks.yml` など CI のワークフローの変更（job `check-docs`・`semgrep` と `checks` の `needs` はそのまま）
- `.claude/rules/` の文の変更（#846・#847 の関心事）
- backend の lefthook（PR #853 と別の PR が受け持つ）
- `check-docs.sh` の置き場所と中身の変更
- Semgrep の規則の選び直し、規則の SHA の自動更新（Dependabot の対象外のまま）
- knip・tsc・vitest-related・markdownlint・biome・check-logger-trace・protect-branch・check-git-clean の段の変更
- markuplint の設定と lefthook の項目の変更（#955 で既に直さない形）
- 既存の決定の記録の本文の書き換え、`docs/design/` の過去の文書の書き換え
- Dev Container の `Dockerfile` の変更と、作業の中での Dev Container の作り直し
- push と PR の作成（publish の段と後段が受け持つ）

## Validation and Acceptance

### Coverage

| ID | Status | Task / Step | 確かめ |
| --- | --- | --- | --- |
| REQ-001 | covered | Task 1 Step 2・3・5・18 | pre-commit の `--file docs/…` で check-docs が出ない。pre-push の `--file docs/…` で走り、`--file src/…` で skip。`check-docs.sh` の差分が空 |
| REQ-002 | covered | Task 1 Step 11・14 | `lefthook.yml` の `semgrep` の項目（glob・`exclude`・`{staged_files}`・`fail_text`、`stage_fixed` 無し） |
| REQ-003 | covered | Task 1 Step 6・10・13 | スクリプトを読み、SHA・規則名・`--autofix` の `grep` が当たらない。`--metrics=off --error` が在る |
| REQ-004 | covered | Task 1 Step 12 | 当たるファイルで `exit` 0 以外と `react-dangerouslysetinnerhtml`、当たらないファイルで `exit=0`、md と `.yarn` で skip |
| REQ-005 | covered | Task 1 Step 7・9 | 空から作る、2 回目は作らない、印の無い venv、`semgrep.txt`・`sparse-checkout` の変更、形の不一致、取り出しの失敗、同時の実行、`python3-venv` 無し |
| REQ-006 | covered | Task 1 Step 9・13・18 | キャッシュが `XDG_CACHE_HOME`／`~/.cache` の下、`git status --porcelain` が空 |
| REQ-007 | covered | Task 1 Step 8・12・15 | 末尾の段の差分と、同じ手順の手での実行 |
| REQ-008 | covered | Task 1 Step 11・18 | `lefthook.yml` の差分に markuplint が無く、項目に `--fix`・`stage_fixed` が無い |
| REQ-009 | covered | Task 1 Step 18 | `static-checks.yml` と `.claude/rules/` の差分が空 |
| REQ-010 | covered | Task 1 Step 16・18 | `check-docs.sh`・markdownlint が通り、`docs/decisions/` の差分が新しいファイルと `index.md` だけ |
| REQ-011 | covered | Task 1 Step 17 | 差分が 1 行、`lefthook pre-commit` の `grep` が当たらない |
| REQ-012 | covered | Task 1 Step 3・11・18 | `yarn lefthook validate` |

### requirements の「確かめ方」との対応

- AC-1: Step 3（`check-docs.sh` の差分、pre-commit の `--file`）と Step 5（pre-push の `--file docs/…`・`--file src/…`、`--force` を使わない）
- AC-2・AC-8: Step 11 と Step 18 の `lefthook.yml` の差分
- AC-3: Step 13 の `grep`
- AC-4: Step 12 の `yarn lefthook run pre-commit --command semgrep`（他の command の失敗と混ざらない絞り込み）。試しのファイルはコミットせず消す
- AC-5: Step 7（`python3-venv` 無し）と Step 9（9-a〜9-h）
- AC-6: Step 13・18 の `git status`
- AC-7: Step 15 の差分と、Step 8・12・15 の手での実行（Dev Container の作り直しの代わり）
- AC-9・AC-10・AC-12: Step 16・18
- AC-11: Step 17
- Testing Expectations の「変更したファイルに biome・markdownlint・check-docs」: 変更したファイルに biome の対象（JS/TS/JSON）が無いため biome は走らせない。markdownlint と check-docs は Step 16・17・18

### Risks

- `semgrep.txt` は Python 3.13 向けで、Dev Container の pip は Debian bookworm の ensurepip の版（設計の段の試しの pip 26.3 より古い）。Step 9-a で `pip install --require-hashes` が失敗したら、計画から外れる直しになるため止めて報告する
- `ruamel.yaml` 0.19.1 の既定の `YAML()` の読み方が想定と違うと、Step 9-a の規則の読み取りが失敗する。そのときは標準エラーの Python の例外を bead ノートに残し、直しを heredoc の Python の部分だけに留めて（出力の形「1 行目に SHA、続く行にディレクトリ」は変えない）Step 9 を走らせ直し、直した所を実装の要約に書く
- `static-checks.yml` の job `semgrep` の形が変わると、手元の用意が理由を出して止まる（Step 9-f で確かめる振る舞い）
- 最初のコミット（キャッシュが空）はネットワークと時間が要る。Dev Container の作成時に用意して普段は起きにくくする
- `postCreateCommand.sh` の `apt-get` は Dev Container の作成を数十秒遅くする
- 同じキャッシュを別の worktree が別の `static-checks.yml` で使うと、片方の規則の取り直しの最中にもう片方の Semgrep が規則を読む可能性がある（`flock` は用意の間だけ）。規則の SHA を変える PR が並ぶときだけ起きるため受け入れる
- `.lefthook/pre-commit/check-docs.sh` の置き場所のディレクトリ名と走る段がずれる（backend #853 と同じ形で受け入れる）
- Step 5 の `lefthook run pre-push --file` の出力の文言は lefthook の版で変わりうる。読み取れなければ設定を変えずに記録する

## Decision Log

- 2026-11-20: plan-review で計画を承認。正式な plan/spec を保存する方針を採用。保存しない旨の旧記述はこの決定で変更。出典: /home/node/tascon-frontend/.gc-artifacts/lefthook-stage-placement/requirements.md, /home/node/tascon-frontend/.gc-artifacts/lefthook-stage-placement/brainstorming/design.md, /home/node/tascon-frontend/.gc-artifacts/lefthook-stage-placement/implementation-plan.md。 保存時の documents base に存在しないリンクは、リンクテキストと元の参照先をプレーンテキストで保持: `keep-node-modules-linker.md`。

## Progress

- plan-review 承認済み。実装前。
