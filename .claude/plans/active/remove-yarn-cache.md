# `.yarn/cache` をリポジトリから外し、CI で setup-node の yarn キャッシュを使う Implementation Plan

Spec: .claude/specs/remove-yarn-cache.md
Worktree: /home/node/tascon-frontend/.claude/worktrees/gc-tf-wjb5y

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `.yarn/cache`（874 ファイル・約 211MB）を git の追跡から外して無視対象にし、Yarn のキャッシュをグローバル（`~/.yarn/berry/cache`）に戻し、CI の composite action の setup-node に `cache: yarn` を足し、決定を新しい ADR に記録する。`main` の上の 1 ブランチ・1 PR 分の変更として作る。

**Architecture:** 実装タスクは Task 1 の 1 つだけ（PR が 1 本のため、item の準備の段が作るブランチも 1 本）。Task 1 は準備の段が作ったブランチの上に、役割ごとに 3 つのコミットを置く: (1) `build:` 追跡の解除と設定 2 行の削除、(2) `ci:` setup-node の `cache: yarn`、(3) `docs:` ADR と索引。アプリのコードは変えないため単体テストは書かず、確かめは requirements の受け入れ基準 1〜7 のコマンド（`git ls-files`・`git check-ignore`・`yarn config get`・`git archive HEAD` を展開した一時ディレクトリでの `yarn install --immutable`・差分の範囲・lefthook）で行う。受け入れ基準 8（PR の CI でキャッシュが効くこと）は PR を開いた後でしか確かめられないため、bead ノートで final report に申し送る。

**Tech Stack:** Yarn 4.4.0（`yarnPath: .yarn/releases/yarn-4.4.0.cjs`、`nodeLinker: node-modules`、`compressionLevel: mixed`）、GitHub Actions の composite action（`actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`）、git / git-spice、lefthook（pre-commit: markdownlint・check-docs・protect-branch ほか、pre-push: knip・check-git-clean）、markdownlint-cli2、gc/bd（bead ノート）

---

## Context/Purpose

- 依頼: 部分 bead tf-in9ab の (3)（依頼 gc-z67w、人の mail gc-wisp-7keaan の 2）。承認済み requirements: `/home/node/tascon-frontend/.gc-artifacts/remove-yarn-cache/requirements.md`（REQ-001〜REQ-008、受け入れ基準 1〜9）。承認済み設計: 同ディレクトリの `brainstorming/design-candidate.md` の案 A（1 本の PR でまとめる）
- 実装タスクは Task 1 の 1 つ。変えるファイルは `.gitignore`・`.yarnrc.yml`・`.github/actions/setup/action.yml`・`docs/decisions/index.md` の 4 つと、新規の `docs/decisions/yarn-cache-out-of-repo.md`、そして追跡を外す `.yarn/cache` 配下の 874 ファイル（差分には削除として出る）
- ADR のファイル名は requirements の既定案 `yarn-cache-out-of-repo.md` をそのまま確定する（内容が分かる英語 kebab-case で、`.lefthook/pre-commit/check-docs.sh` の `<kebab-case-slug>.md` の規則に合う）
- コミットは 3 つに確定する（REQ-008 の既定案どおり）。追跡の解除を独立させ、874 ファイルの削除がほかの変更の差分を埋もれさせないようにする
- Superpowers の build のライフサイクル（prepare・requirements・plan・plan-review・decompose・implement・summarize-implementation・review・finalize・publish）はこの formula が実行している。本計画の `### Task 1` はソースの変更だけを扱い、ライフサイクルとの関係は下の表に書く

### 工程との対応（traceability）

| 段階 | 担当 | 本計画での扱い |
| --- | --- | --- |
| plan-review・decompose | 本 formula の後続の段 | `### Task 1` を 1 つの実装 item にする。依存なし |
| implement の準備 | item の準備の段 | item の worktree（`.claude/worktrees/gc-<source-anchor-id>`）とブランチを 1 本作り、`gc.git_branch` に記録する。親は workflow root tf-4tnlr の `gc.var.base_branch`（`main`）の origin の先端 |
| implement | 実装レーン（Task 1） | 準備の段が作ったブランチの上で Step 1〜12 を行い、3 つのコミットまで作る。ブランチの作成・push・PR の作成はしない |
| summarize-implementation | 本 formula の後続の段 | Task 1 が bead ノートに残した確かめの結果（コマンドと出力の要点）を implementation summary にまとめる |
| review | 本 formula の後続の段 | Task 1 の 3 コミットをレビューする |
| finalize・publish | 本 formula の後続の段 | `push=true` のため、ブランチを `git-spice-workflow` Skill に従って push する（pre-push の lefthook はここで走る）。`open_pr=false` のため PR は作らない。受け入れ基準 8 は final report に「PR を開いた後の確認」として残す |

### 計画時に置いた仮定（headless のため質問せず記録）

1. **土台**: 土台は `main`（root の `gc.var.base_branch=main`、requirements REQ-008、tf-in9ab の mayor のノート「superpowers-build（base_branch=main）」）。`git-spice-workflow` Skill の「未マージのスタックがあればその最上段に積む」とは食い違うが、#947 との順序について人が「後からマージする方を積み直す」と指示しており、requirements がそれに従って `main` を土台に決めているため、requirements を優先する。この食い違いは review の段で判断できるよう Non-Goals と Risks にも書く
2. **ブランチ名**: 案は `build/remove-yarn-cache`（`git-spice-workflow` Skill の `<type>/<変更内容>`。PR の主な変更が依存の置き場の変更のため type は `build`）。準備の段が別の名前で作った場合は名前を変えず（`gc.git_branch` と食い違うため）、`git branch --show-current` の値で読み替え、bead ノートに書く
3. **1 つ目のコミットの type**: `build`。`.github/COMMIT_CONVENTION/COMMIT_CONVENTION.md` の `build` は「ビルドシステムや外部依存の変更」で、このコミットはリポジトリに置いていた外部依存の zip を取り除き、パッケージマネージャー（ビルドシステム）が依存を置く場所を変える。エディタや devcontainer のような開発環境の設定（`chore`）ではない。2 つ目は CI の設定ファイルの変更なので `ci`、3 つ目はドキュメントだけなので `docs`
4. **ADR の Date**: 3 つ目のコミットを作る日（`TZ=Asia/Tokyo date +%F`）。計画時点では `2026-11-20`
5. **自律実行での承認**: `git-spice-workflow` Skill の「コミット前にコミットメッセージ全文の日本語訳を提示する」は、自律実行のため bead ノートへの記録で代える

## Current System

計画作成時点（2026-11-20、`main` = `9bfdad89ce1578edaa2b10fbefbafcfff53da1e3`）で確かめた事実:

- workflow root tf-4tnlr: `gc.var.base_branch=main`、`gc.var.push=true`、`gc.var.open_pr=false`、`gc.var.artifact_root=.gc-artifacts/remove-yarn-cache`
- `.yarnrc.yml`（21 行）の中身。7 行目が `enableGlobalCache: false`、8 行目が空行:

  ```yaml
  # TEMP: Avoid errors in ESLint and Prettier VSCode extensions.
  #   See https://is.gd/ne40Ud, https://is.gd/nkQqxC
  nodeLinker: node-modules

  compressionLevel: mixed

  enableGlobalCache: false

  packageExtensions:
    next-pwa@5.6.0:
      dependencies:
        '@babel/core': ^7.0.0
        webpack: '>=5.9.0 <6.0.0'
    '@typescript-eslint/utils@5.62.0':
      peerDependencies:
        typescript: '>= 3.7.0-beta'
    eslint-plugin-storybook@0.8.0:
      peerDependencies:
        typescript: '>= 3.7.0-beta'

  yarnPath: .yarn/releases/yarn-4.4.0.cjs
  ```

- `.gitignore` の 4〜10 行目: `.yarn/*`、`!.yarn/cache`、`!.yarn/patches`、`!.yarn/plugins`、`!.yarn/releases`、`!.yarn/sdks`、`!.yarn/versions`
- `git ls-files .yarn/cache | wc -l` → `874`。ファイル名に `linux`・`darwin`・`win32` を含む zip は 8 個
- `.github/actions/setup/action.yml`（13 行）:

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

- `docs/decisions/` には 9 つの ADR と `index.md` がある。`index.md` は見出し `# Decisions 索引` と空行の後に `- 題 (`ファイル名`)` の行が 9 行並び、最後の行は `- 型・Lint・未使用コード・マークアップ・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する (`static-checks-in-pr-ci.md`)`
- `docs/decisions/static-checks-in-pr-ci.md` の Decision に「依存のキャッシュ・`concurrency`・`push`トリガーは入れない」、Consequences に「GitHubのrunnerはx64で、`.yarn/cache`にないx64用のオプション依存はinstall時にnpmから取得される」がある。このファイルは変えない（REQ-005）
- ADR の形式は `.claude/rules/decisions-maintenance.md`（見出し `# <決定タイトル>`、`- **Status:**`・`- **Verification Status:**`・`- **Date:**`・`- **Related Files:**` の 4 行、`## Context`・`## Decision`・`## Considered Options`・`## Consequences`、日本語）。既存の ADR は日本語と英字・コードの間に空白を入れない書き方
- `.lefthook/pre-commit/check-docs.sh` は `docs/**/*.md` がステージされたときに走り、ADR のファイル名（kebab-case）、4 つのフィールドの有無と値、見出し、`index.md` からのリンクを確かめる
- `lefthook.yml`: pre-commit は `biome`（`*.{js,jsx,ts,tsx,json,jsonc}`）・`markuplint`（`src/**/*.{jsx,tsx}`）・`markdownlint`（`*.md`、`yarn markdownlint-cli2 {staged_files}`）・`check-logger-trace`・`protect-branch`（`main` へのコミットを拒む）と `check-docs.sh` の job。pre-push は `knip`（`yarn knip`）と `check-git-clean`（`test -z "$(git status --porcelain | tee /dev/tty)"`）
- `.markdownlint-cli2.jsonc`: `MD013: false`（行の長さを見ない）、`MD007` の indent 2、`"gitignore": true`、`.github/**/*` は対象外
- `package.json` に `preinstall`・`install`・`postinstall`・`prepare` のスクリプトはない。`packageManager` は `yarn@4.4.0`
- 計画時の試作（scratchpad に `git archive HEAD -- .yarnrc.yml .yarn/releases package.json yarn.lock` を展開）: 変更前は `yarn config get enableGlobalCache` → `false`、`yarn config get cacheFolder` → `<展開先>/.yarn/cache`。`enableGlobalCache: false` と直後の空行を消すと `true`・`/home/node/.yarn/berry/cache`。`yarn --version` → `4.4.0`。このコンテナでは Yarn の各コマンドが標準エラーに `[UNDICI-EHPA] Warning: EnvHttpProxyAgent is experimental` を出すが、プロキシ設定による警告で、結果には影響しない
- `~/.yarn/berry/cache` はこのコンテナに既にある（中身は他の作業で入った物）。依存の install にはネットワーク（npm のレジストリ）が要る
- 重なるブランチ（計画時点、`git diff main...<branch>` で確認）: `build/add-vitest`・`build/add-react-testing-library` が `.yarn/cache`（zip の追加）・`yarn.lock`・`.yarnrc.yml`（先頭のコメント）・`docs/decisions/index.md` を変える。`docs/keep-node-modules-linker` が `.yarnrc.yml` の先頭のコメントと `docs/decisions/index.md` を変える。ほかにも `docs/decisions/index.md`・`.gitignore` を変える未マージのブランチが複数ある。どれも本計画の Task では触らない（Risks に書く）
- コミットの作り方: `git-spice-workflow` Skill。コミットは `git-spice commit create`（`-F <file>` でメッセージを渡せる。`-m` は繰り返すと段落になる）、メッセージは英語、本文（body）必須

## Proposed Implementation

### File Structure

- Modify: `.gitignore` — 5 行目の `!.yarn/cache` の 1 行だけを消す（REQ-002）
- Modify: `.yarnrc.yml` — 7 行目の `enableGlobalCache: false` と 8 行目の空行を消す。ほかは 1 文字も変えない（REQ-003）
- Untrack: `.yarn/cache/**`（874 ファイル）— `git rm -r --cached .yarn/cache`。作業ツリーの zip は消さない（REQ-001）
- Modify: `.github/actions/setup/action.yml` — setup-node の `with:` の `node-version: 22.22.2` の次の行に `cache: yarn` を足す（REQ-004）
- Create: `docs/decisions/yarn-cache-out-of-repo.md` — 新しい ADR（REQ-005）
- Modify: `docs/decisions/index.md` — 末尾に 1 行足す（REQ-005）
- 変えないファイル（REQ-004・REQ-005・REQ-008）: `yarn.lock`、`package.json`、`.github/workflows/static-checks.yml`、`docs/decisions/static-checks-in-pr-ci.md`、`lefthook.yml`、`.claude/plans/`・`.claude/specs/` 配下、devcontainer の設定

### コミットの分け方（確定）

| 順 | 中身 | メッセージの subject | 対応 |
| --- | --- | --- | --- |
| 1 | `git rm -r --cached .yarn/cache`、`.gitignore`、`.yarnrc.yml` | `build: stop committing the Yarn cache to the repository` | REQ-001・REQ-002・REQ-003 |
| 2 | `.github/actions/setup/action.yml` | `ci: cache Yarn dependencies in the setup action` | REQ-004 |
| 3 | `docs/decisions/yarn-cache-out-of-repo.md`、`docs/decisions/index.md` | `docs: record why the Yarn cache stays out of the repository` | REQ-005 |

追跡の解除と 2 つの設定の削除は、どれか 1 つだけでは状態が中途半端になる（無視されない未追跡の zip が残る、またはリポジトリ内のキャッシュを使い続ける）ため、同じコミットに入れる。

### 共通の前提（実装セッション）

- セッションの作業ディレクトリが、item の準備の段が作ったこの Task の worktree（`.claude/worktrees/gc-<source-anchor-id>`）であること。本体の取り出し（`/home/node/tascon-frontend`）のブランチを切り替えない。ほかの worker の worktree を読み書きしない
- 作業するブランチは準備の段が作ったブランチだけ。ブランチを新しく作らない・切り替えない・push しない
- コマンドは bash で実行する。一時ファイルはシステムの一時ディレクトリ（`${TMPDIR:-/tmp}`）に置き、終わったら消す
- `<TASK_BEAD_ID>` はこの Task の実装 bead の ID に読み替える
- 前の試みの残りでコミットが既にある場合は、`git log --format=%s origin/main..HEAD` に出た subject のコミットの手順を飛ばし、その次から再開する

### Task 1: `.yarn/cache` を外し、CI で yarn キャッシュを使い、ADR に記録する（`build/remove-yarn-cache`）

**Files:**

- Modify: `.gitignore`（5 行目の削除）
- Modify: `.yarnrc.yml`（7〜8 行目の削除）
- Untrack: `.yarn/cache/**`（874 ファイル）
- Modify: `.github/actions/setup/action.yml`（1 行の追加）
- Create: `docs/decisions/yarn-cache-out-of-repo.md`
- Modify: `docs/decisions/index.md`（末尾に 1 行）
- Test: 新しい単体テストは書かない。確かめは Step 2（変更前に期待どおり失敗すること）、Step 5・6（変更後）、Step 8・11・12 のコマンド

**前提条件:** 上の「共通の前提」。依存は無い。

- [ ] **Step 1: 作業場所とブランチ、親を確かめる**

  ```bash
  git fetch origin main
  ITEM_BRANCH="$(git branch --show-current)"
  echo "ITEM_BRANCH=$ITEM_BRANCH PWD=$PWD"
  git status --short
  git merge-base --is-ancestor origin/main HEAD && echo "origin/main is an ancestor"
  git log --oneline origin/main..HEAD
  git-spice ls 2>&1 | grep -n -- "$ITEM_BRANCH"
  test -d node_modules || bash .claude/skills/project-setup/scripts/setup.sh
  gc bd update <TASK_BEAD_ID> --append-notes "作業ブランチ: $ITEM_BRANCH（親 origin/main = $(git rev-parse --short origin/main)）、worktree: $PWD"
  ```

  Expected: `PWD` が `.claude/worktrees/` 配下。`ITEM_BRANCH` が空でない（案は `build/remove-yarn-cache`。違えば仮定 2 に従い読み替える）。`git status --short` が空。`origin/main is an ancestor`。`git log` は初回なら空（再試行ではこの Task のコミットだけ）。`git-spice ls` に `ITEM_BRANCH` が出る。満たさない場合はコミットせずに、食い違いを bead ノートに書き、bead を blocked にして assignee を外し、`gc mail send mayor` で知らせて drain する。

- [ ] **Step 2: 変更前の状態で、確かめが期待どおり失敗することを見る**

  ```bash
  git ls-files .yarn/cache | wc -l
  git check-ignore -q .yarn/cache/probe.zip; echo "check-ignore exit=$?"
  grep -n 'enableGlobalCache' .yarnrc.yml
  yarn config get enableGlobalCache 2>/dev/null
  grep -n 'cache: yarn' .github/actions/setup/action.yml; echo "grep exit=$?"
  test -e docs/decisions/yarn-cache-out-of-repo.md; echo "adr exists exit=$?"
  ```

  Expected: `874`、`check-ignore exit=1`（無視されていない）、`7:enableGlobalCache: false`、`false`、`grep exit=1`、`adr exists exit=1`。値が違えば（`main` が計画時点から変わった等）、違いを bead ノートに書いてから続ける。874 でない場合は実際の数を記録し、以降の「874」をその数に読み替える。

- [ ] **Step 3: `.gitignore` と `.yarnrc.yml` を直し、`.yarn/cache` の追跡を外す（REQ-001〜REQ-003）**

  ```bash
  test "$(grep -cx '!\.yarn/cache' .gitignore)" = 1 && sed -i '/^!\.yarn\/cache$/d' .gitignore
  python3 - <<'PY'
  from pathlib import Path
  p = Path(".yarnrc.yml")
  s = p.read_text(encoding="utf-8")
  old = "compressionLevel: mixed\n\nenableGlobalCache: false\n\npackageExtensions:"
  new = "compressionLevel: mixed\n\npackageExtensions:"
  assert s.count(old) == 1, "unexpected .yarnrc.yml layout"
  p.write_text(s.replace(old, new), encoding="utf-8")
  PY
  git rm -r -q --cached .yarn/cache
  git add .gitignore .yarnrc.yml
  git diff --cached -- .gitignore .yarnrc.yml
  git diff --cached --name-status | awk '{print $1}' | sort | uniq -c
  git diff --cached --name-only | grep -v '^\.yarn/cache/'
  git status --short --untracked-files=all | grep -c '^?? \.yarn/cache/' || true
  ```

  Expected:
  - `.gitignore` の差分は `-!.yarn/cache` の 1 行だけ
  - `.yarnrc.yml` の差分は `-enableGlobalCache: false` と、その直後の空行 1 行の削除だけ（`-` の行が 2 つ、`+` の行は無い）
  - 状態の集計が `874 D` と `2 M`
  - `.yarn/cache/` 以外の名前は `.gitignore` と `.yarnrc.yml` だけ
  - 未追跡の `.yarn/cache/` が `0`（作業ツリーの zip は残るが無視される）

  Python の `assert` が失敗した場合は `.yarnrc.yml` が計画時点と違う。ファイルを `git checkout -- .yarnrc.yml` で戻し、実際の中身を bead ノートに書き、`enableGlobalCache: false` の行と直後の空行だけを消すように手で直してから同じ確かめをする。

- [ ] **Step 4: 1 つ目のコミットを作る**

  ```bash
  MSG="$(mktemp)"
  cat > "$MSG" <<'EOF'
  build: stop committing the Yarn cache to the repository

  Untrack .yarn/cache (874 zip archives, about 211MB) with git rm --cached
  and drop the !.yarn/cache exception from .gitignore so the directory is
  ignored. History is not rewritten.

  Remove enableGlobalCache: false from .yarnrc.yml so Yarn falls back to its
  default and keeps the archives in the global cache (~/.yarn/berry/cache).
  compressionLevel stays the same, so yarn.lock does not change.

  The committed archives only carried the aarch64 builds of the native
  packages, so x64 CI runners downloaded those from npm anyway, and every
  dependency update added archive diffs to the history. With the cache out
  of the repository, actions/setup-node can cache the dependencies in CI,
  because it locates the cache with yarn config get cacheFolder.
  EOF
  gc bd update <TASK_BEAD_ID> --append-notes "コミット1（日本語訳）: build: Yarn のキャッシュをリポジトリにコミットするのをやめる / .yarn/cache（874 個の zip、約 211MB）を git rm --cached で追跡から外し、.gitignore の !.yarn/cache の例外を消して無視対象にする。履歴は書き換えない。/ .yarnrc.yml から enableGlobalCache: false を消し、Yarn の既定に戻して zip をグローバルのキャッシュ（~/.yarn/berry/cache）に置く。compressionLevel は変えないので yarn.lock は変わらない。/ コミットしていた zip はネイティブ依存の aarch64 用だけで、x64 の CI ランナーは結局 npm から取得しており、依存を更新するたびに zip の差分が履歴に入っていた。キャッシュをリポジトリから出すと、actions/setup-node が yarn config get cacheFolder でキャッシュの場所を得るため、CI で依存をキャッシュできる。"
  git-spice commit create -F "$MSG"
  rm -f "$MSG"
  git log --oneline -1
  git branch --show-current
  git status --short
  ```

  Expected: lefthook の pre-commit（該当するのは `protect-branch` だけ）が通り、`build:` のコミットが 1 つできる。現在のブランチが `ITEM_BRANCH` のまま。`git status --short` が空。`--no-verify` は使わない。pre-commit が失敗したら、出力全文を bead ノートに書き、原因を直してから同じコマンドでやり直す。

- [ ] **Step 5: 1 つ目のコミットの結果を確かめる（受け入れ基準 1〜3）**

  ```bash
  git ls-files .yarn/cache | wc -l
  ZIP="$(ls .yarn/cache | head -1)"; echo "ZIP=$ZIP"
  git check-ignore -q ".yarn/cache/${ZIP:-probe.zip}"; echo "check-ignore exit=$?"
  git check-ignore -q .yarn/releases/yarn-4.4.0.cjs; echo "releases ignored exit=$?"
  grep -c 'enableGlobalCache' .yarnrc.yml || true
  yarn config get enableGlobalCache 2>/dev/null
  yarn config get cacheFolder 2>/dev/null
  echo "expected: $HOME/.yarn/berry/cache"
  git diff --quiet HEAD~1 HEAD -- yarn.lock package.json && echo "yarn.lock and package.json unchanged"
  ```

  Expected: `0`、`check-ignore exit=0`、`releases ignored exit=1`（`releases` の例外は残っている）、`enableGlobalCache` が `0` 件、`true`、`cacheFolder` が `expected:` の行と同じパス、`yarn.lock and package.json unchanged`。

- [ ] **Step 6: まっさらな取り出しで install を確かめる（受け入れ基準 4、REQ-006）**

  ```bash
  T="$(mktemp -d "${TMPDIR:-/tmp}/remove-yarn-cache-XXXXXX")"
  git archive HEAD | tar -x -C "$T"
  test ! -e "$T/.yarn/cache" && echo "no .yarn/cache in the archive"
  (cd "$T" && yarn config get enableGlobalCache 2>/dev/null && yarn config get cacheFolder 2>/dev/null)
  (cd "$T" && yarn install --immutable > "$T.install.log" 2>&1); echo "install exit=$?"
  grep -v -e 'UNDICI-EHPA' -e 'trace-warnings' "$T.install.log" | tail -n 20
  rm -f "$T.install.log"
  cmp "$T/yarn.lock" <(git show HEAD:yarn.lock) && echo "yarn.lock unchanged"
  test ! -e "$T/.yarn/cache" && echo "no .yarn/cache after install"
  git rev-parse --short HEAD
  rm -rf "$T"
  ```

  Expected: `no .yarn/cache in the archive`、`true`、`$HOME/.yarn/berry/cache` の絶対パス、`install exit=0`（ログの末尾に `➤ YN0000: · Done` が出る）、`yarn.lock unchanged`、`no .yarn/cache after install`。依存の取得のためネットワークが要り、数分かかる。

  `yarn install --immutable` が lockfile の変更を求めて失敗する（`YN0028: The lockfile would have been modified by this install, which is explicitly forbidden.`）、または `cmp` が差分を出す場合は想定外（REQ-003）。以降の Step に進まず、出力全文と原因の調べた結果を bead ノートに書き、bead を blocked にして assignee を外し、人への通知スクリプト（`notify-human.sh`、何が起きたか・なぜ・次にすること）で範囲を変える判断を頼み、drain する。ネットワークの一時的な失敗（`YN0001`・`ECONNRESET` 等）なら 1 回だけやり直す。

  成功したら、確かめたコミットの SHA と各行の結果を bead ノートに書く（summarize-implementation の材料）。

- [ ] **Step 7: setup-node に `cache: yarn` を足す（REQ-004）**

  `.github/actions/setup/action.yml` の 9 行目 `node-version: 22.22.2` の次に `cache: yarn` を足す（行頭は空白 8 個、`node-version` と同じ深さ）。変更後のファイル全体:

  ```yaml
  name: Setup
  description: Set up Node.js and install dependencies with Yarn

  runs:
    using: composite
    steps:
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 22.22.2
          cache: yarn
      - run: corepack enable
        shell: bash
      - run: yarn install --immutable
        shell: bash
  ```

  ```bash
  python3 - <<'PY'
  from pathlib import Path
  p = Path(".github/actions/setup/action.yml")
  s = p.read_text(encoding="utf-8")
  old = "        node-version: 22.22.2\n"
  assert s.count(old) == 1, "unexpected action.yml layout"
  p.write_text(s.replace(old, old + "        cache: yarn\n"), encoding="utf-8")
  PY
  git diff -- .github/actions/setup/action.yml
  python3 -c 'import yaml; w=yaml.safe_load(open(".github/actions/setup/action.yml")); s=w["runs"]["steps"]; print(s[0]["uses"], s[0]["with"], [x.get("run") for x in s[1:]])'
  git diff --quiet origin/main -- .github/workflows/static-checks.yml && echo "static-checks.yml unchanged"
  ```

  Expected: 差分は `+        cache: yarn` の 1 行だけ。YAML の読み込みの結果が `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 {'node-version': '22.22.2', 'cache': 'yarn'} ['corepack enable', 'yarn install --immutable']`。`static-checks.yml unchanged`。`cache-dependency-path` は足さない。

- [ ] **Step 8: 2 つ目のコミットを作る**

  ```bash
  git add .github/actions/setup/action.yml
  MSG="$(mktemp)"
  cat > "$MSG" <<'EOF'
  ci: cache Yarn dependencies in the setup action

  Add cache: yarn to actions/setup-node in the shared setup composite
  action, which all five static-check jobs use. Each job runs
  yarn install --immutable, and without a cache every run downloads all
  dependencies from npm.

  Now that the Yarn cache lives in ~/.yarn/berry/cache instead of the
  repository, setup-node saves and restores it keyed on yarn.lock. GitHub
  Actions scopes the cache to the pull request, so reruns and later pushes
  on the same pull request reuse it, while the first run of a new pull
  request still downloads from npm.
  EOF
  gc bd update <TASK_BEAD_ID> --append-notes "コミット2（日本語訳）: ci: setup の composite action で Yarn の依存をキャッシュする / 5 つの静的な確かめのジョブが使う共通の setup の composite action で、actions/setup-node に cache: yarn を足す。各ジョブは yarn install --immutable を走らせるため、キャッシュがないと毎回すべての依存を npm から取得する。/ Yarn のキャッシュがリポジトリではなく ~/.yarn/berry/cache に置かれるようになったので、setup-node は yarn.lock を鍵にそれを保存・復元する。GitHub Actions のキャッシュは PR ごとのため、同じ PR の再実行や追加の push では再利用されるが、新しい PR の 1 回目の実行は npm から取得する。"
  git-spice commit create -F "$MSG"
  rm -f "$MSG"
  git log --oneline -2
  git branch --show-current
  git status --short
  ```

  Expected: pre-commit（`protect-branch`）が通り、`ci:` のコミットができる。ブランチが `ITEM_BRANCH` のまま。`git status --short` が空。

- [ ] **Step 9: ADR を書く（REQ-005）**

  `docs/decisions/yarn-cache-out-of-repo.md` を次の内容で作る。`Date` は仮定 4 に従い、コミットする日が `2026-11-20` でなければその日（`TZ=Asia/Tokyo date +%F`）に替える。

  ```markdown
  # 依存のzipはリポジトリに入れず、CIではsetup-nodeのyarnキャッシュを使う

  - **Status:** Accepted
  - **Verification Status:** Unverified
  - **Date:** 2026-11-20
  - **Related Files:** .yarnrc.yml, .gitignore, .github/actions/setup/action.yml

  ## Context

  Yarn 4の依存のzip（`.yarn/cache`、874ファイル・約211MB）をgitで追跡していた。全依存のzipを含むが、ネイティブ依存のzip（8ファイル）はaarch64用だけで、x64のGitHubのrunnerはx64用のネイティブ依存（オプション依存）をinstallのたびにnpmから取得していた。依存を更新するたびにzipの差分がコミットに入り、cloneも重い。

  PRごとのCIの決定 (path: static-checks-in-pr-ci.md)では、5つのジョブがそれぞれ`yarn install --immutable`を実行するが、依存のキャッシュは入れなかった。`actions/setup-node`（v7.1.0）の`cache: yarn`は、キャッシュの場所を`yarn config get cacheFolder`で得る。`.yarnrc.yml`の`enableGlobalCache: false`のもとでは、それがリポジトリ内の`.yarn/cache`になり、キャッシュしてもcheckout済みのzipを重ねて保存・復元するだけになる。`.yarn/cache`の有無と`enableGlobalCache`の値は、setup-nodeがrestore-keys（キーの前方一致による古いキャッシュの利用）を使うかどうかだけを変え、キャッシュの保存・復元自体はどちらでも行う。

  この決定で、zipをリポジトリから外し、PRごとのCIの決定で入れなかった依存のキャッシュを入れる。PRごとのCIの決定のほかの部分（ジョブの分け方・composite action・SHAの固定）は変えない。

  ## Decision

  - `.yarn/cache`をgitの追跡から外す（`git rm -r --cached`。履歴は書き換えない）
  - `.gitignore`から`!.yarn/cache`を消し、`.yarn/cache`を無視対象にする。`.yarn/`のほかの例外（`patches`・`plugins`・`releases`・`sdks`・`versions`）は残す
  - `.yarnrc.yml`から`enableGlobalCache: false`を消し、Yarnの既定（`true`）に戻す。依存のzipはグローバルのキャッシュ（`~/.yarn/berry/cache`）に置く。`compressionLevel`などほかの設定は変えないため、`yarn.lock`は変わらない
  - CIの準備手順（`.github/actions/setup/action.yml`）のsetup-nodeに`cache: yarn`を足す。鍵はルートの`yarn.lock`（`cache-dependency-path`は指定しない）

  ## Considered Options

  - 1本のPRで、追跡の解除・設定2行の削除・`cache: yarn`をまとめて入れる（採用）: キャッシュが効く前提（`.yarn/cache`がない・`enableGlobalCache`が既定）と`cache: yarn`が同時にそろい、CIが毎回npmから依存を取得する状態や、`cache: yarn`が意味を持たない状態がmainに生じない。1本のPRの差分に874ファイルの削除が入り、レビューの画面が重い（追跡の解除だけのコミットを分けて読みやすくする）
  - 追跡の解除と`cache: yarn`を別のPRに分ける: 各PRが小さく役割が1つになるが、間の状態ではCIが毎回npmから依存を取得する
  - setup-nodeの`cache: yarn`ではなく`actions/cache`で`~/.yarn/berry/cache`を直接キャッシュする: 鍵と場所を細かく決められるが、外部のActionとSHAの固定が1つ増え、キャッシュの場所を手で書くためYarnの設定とずれ得る。setup-nodeは同じことを`yarn config get cacheFolder`で自動で行う
  - zipをリポジトリに残す（これまでの状態）: オフラインでのinstall（Zero-Install）ができるが、リポジトリが重いまま依存の更新のたびにzipの差分が入り、CIで依存のキャッシュを効かせられない

  ## Consequences

  - cloneとfetchが軽くなり、依存の更新のコミットにzipの差分が入らなくなる
  - オフラインでのinstall・Zero-Installはできなくなる。installにはnpmのレジストリへの接続が要る
  - devcontainerでは`~/.yarn/berry`がvolumeにないため、コンテナを作り直すと最初のinstallで依存を取得し直す
  - 同じコンテナのworktree間では`~/.yarn/berry/cache`を共有する
  - 追跡を外すコミットをpull・checkoutした取り出しでは、gitがそれまで追跡していたzipを作業ツリーから消す。残るのは、もともと追跡していなかったzip（他のアーキテクチャ用など）と、`git rm --cached`を実行した取り出しのzipで、どちらも無視対象になり、手で消してよい
  - CIのキャッシュはPRごとで、同じPRの2回目以降の実行（再実行・追加のpush）でだけrestoreされ、`yarn.lock`が変わると作り直される。新しいPRの1回目の実行はnpmから取得する。PRをまたいで効かせるにはmainで走るトリガー（`push`など）が要るが、この決定の範囲外とする
  - 1回目の実行では5つのジョブが同じ鍵で保存しようとするため、後に終わったジョブは保存できない。失敗ではない
  - setup-nodeは`corepack enable`の前にキャッシュの場所を調べるため、runnerの`yarn`が`.yarnrc.yml`の`yarnPath`を読んで4.4.0として動くことを前提にしている。キャッシュの場所が想定と違えば、`corepack enable`をsetup-nodeの前に移すなどを検討する
  ```

  続いて `docs/decisions/index.md` の末尾（最後の行 `- 型・Lint・... (`static-checks-in-pr-ci.md`)` の次）に 1 行足す:

  ```markdown
  - 依存のzipはリポジトリに入れず、CIではsetup-nodeのyarnキャッシュを使う (path: yarn-cache-out-of-repo.md)
  ```

  ```bash
  printf '%s\n' '- [依存のzipはリポジトリに入れず、CIではsetup-nodeのyarnキャッシュを使う]'"(yarn-cache-out-of-repo.md)" >> docs/decisions/index.md
  git diff -- docs/decisions/index.md
  tail -c 1 docs/decisions/index.md | od -An -c
  ```

  Expected: `index.md` の差分は `+` の 1 行だけで、ファイルの末尾が改行（`\n`）。ADR は `.claude/rules/decisions-maintenance.md` の形式どおりで、見出しの順が Context → Decision → Considered Options → Consequences。

- [ ] **Step 10: ADR を確かめる（受け入れ基準 6）**

  ```bash
  yarn markdownlint-cli2 docs/decisions/yarn-cache-out-of-repo.md docs/decisions/index.md 2>&1 | grep -v -e 'UNDICI-EHPA' -e 'trace-warnings'
  git add docs/decisions/yarn-cache-out-of-repo.md docs/decisions/index.md
  bash .lefthook/pre-commit/check-docs.sh; echo "check-docs exit=$?"
  grep -nE '^- \*\*(Status|Verification Status|Date|Related Files):\*\*' docs/decisions/yarn-cache-out-of-repo.md
  grep -n '^## ' docs/decisions/yarn-cache-out-of-repo.md
  grep -n '(yarn-cache-out-of-repo.md)' docs/decisions/index.md
  git diff --quiet origin/main -- docs/decisions/static-checks-in-pr-ci.md && echo "static-checks-in-pr-ci.md unchanged"
  ```

  Expected: markdownlint が `Summary: 0 error(s)`。`check-docs exit=0`。4 つのフィールドが `Accepted`・`Unverified`・日付・`.yarnrc.yml, .gitignore, .github/actions/setup/action.yml` で出る。見出しが `## Context`・`## Decision`・`## Considered Options`・`## Consequences` の順。`index.md` に 1 行ある。`static-checks-in-pr-ci.md unchanged`。markdownlint が指摘したら ADR の書き方を直して再実行する（`--fix` は使わず、差分を読んで直す）。

- [ ] **Step 11: 3 つ目のコミットを作る**

  ```bash
  MSG="$(mktemp)"
  cat > "$MSG" <<'EOF'
  docs: record why the Yarn cache stays out of the repository

  Add docs/decisions/yarn-cache-out-of-repo.md and list it in the
  decisions index. It records why the dependency archives are no longer
  committed, why Yarn goes back to the global cache, and why CI now uses
  the setup-node yarn cache that static-checks-in-pr-ci.md left out, along
  with the options considered and the consequences, such as losing
  offline installs and the cache only being reused within a pull request.

  static-checks-in-pr-ci.md stays as it is, because the rest of that
  decision still holds.
  EOF
  gc bd update <TASK_BEAD_ID> --append-notes "コミット3（日本語訳）: docs: Yarn のキャッシュをリポジトリに入れない理由を記録する / docs/decisions/yarn-cache-out-of-repo.md を足し、決定の索引に載せる。依存の zip をコミットしなくなった理由、Yarn をグローバルのキャッシュに戻す理由、static-checks-in-pr-ci.md で入れなかった setup-node の yarn キャッシュを CI で使うようにした理由を、検討した案と、オフラインでの install ができなくなることやキャッシュが PR の中でだけ再利用されることなどの結果とともに記録する。/ static-checks-in-pr-ci.md は、その決定のほかの部分が今も有効なため変えない。"
  git-spice commit create -F "$MSG"
  rm -f "$MSG"
  git log --oneline origin/main..HEAD
  git branch --show-current
  git status --short
  ```

  Expected: pre-commit（`markdownlint`・`check-docs.sh`・`protect-branch`）が通り、`docs:` のコミットができる。`git log` に 3 つのコミット（新しい順に `docs:`・`ci:`・`build:`）。ブランチが `ITEM_BRANCH` のまま。`git status --short` が空。

- [ ] **Step 12: 全体の範囲・pre-push 相当・申し送りを確かめる（受け入れ基準 1・7・9、REQ-007・REQ-008）**

  ```bash
  git merge-base --is-ancestor origin/main HEAD && echo "stacked on origin/main"
  git rev-list --count origin/main..HEAD
  git diff --name-only origin/main...HEAD | grep -v '^\.yarn/cache/' | sort
  git diff --name-status origin/main...HEAD -- .yarn/cache | awk '{print $1}' | sort | uniq -c
  for c in $(git rev-list origin/main..HEAD); do printf '%s body_lines=%s\n' "$(git log --format=%s -1 "$c")" "$(git log --format=%b -1 "$c" | grep -c .)"; done
  git diff --quiet origin/main...HEAD -- yarn.lock package.json .github/workflows docs/decisions/static-checks-in-pr-ci.md lefthook.yml && echo "out-of-scope files unchanged"
  git diff --quiet "$(git rev-list --reverse origin/main..HEAD | head -1)" HEAD -- .yarnrc.yml .gitignore yarn.lock package.json && echo "install check in Step 6 still applies"
  yarn knip 2>&1 | grep -v -e 'UNDICI-EHPA' -e 'trace-warnings' | tail -n 20; echo "knip exit=${PIPESTATUS[0]}"
  test -z "$(git status --porcelain)" && echo "clean"
  ```

  Expected:
  - `stacked on origin/main`、コミット数 `3`
  - `.yarn/cache/` 以外の変更ファイルが `.github/actions/setup/action.yml`・`.gitignore`・`.yarnrc.yml`・`docs/decisions/index.md`・`docs/decisions/yarn-cache-out-of-repo.md` の 5 つだけ
  - `.yarn/cache` は `874 D` だけ
  - 3 つのコミットすべてで `body_lines` が 1 以上
  - `out-of-scope files unchanged`、`install check in Step 6 still applies`
  - `knip exit=0`（pre-push の `knip` と同じコマンド）、`clean`（pre-push の `check-git-clean` と同じ条件）。本物の pre-push の hook は publish の段の push で走る

  最後に、summarize-implementation と final report のための申し送りを bead ノートに書く:

  ```bash
  gc bd update <TASK_BEAD_ID> --append-notes "確かめ: 受け入れ基準 1〜7・9 は Step 5・6・10・12 で確認済み（結果は上のノート）。PR を開いた後の確認（受け入れ基準 8、REQ-007、open_pr=false のため build の中では行わない。final report に残すこと）: (a) static-checks の 5 ジョブ（tsc・biome・knip・markuplint・next build）が成功する。(b) 1 回目の実行で setup-node の手順に 'yarn cache is not found'、少なくとも 1 つのジョブの post 手順に 'Cache saved with the key: <key>' が出る。後に終わったジョブが同じ鍵で保存できないのは失敗ではない。(c) 同じ PR の再実行または追加の push で setup-node の手順に 'Cache restored from key: <key>' が出る。(d) 'All dependencies are managed locally by yarn3, the previous cache can be used' が出ない（出たら REQ-001〜REQ-003 が効いていない）。(e) キャッシュの場所は ACTIONS_STEP_DEBUG を有効にした再実行で 'yarn's cache folder \"<…>/.yarn/berry/cache\" configured for the root directory' を見る。場所が違えば corepack（packageManager: yarn@4.4.0）と yarnPath のどちらが効いたかを調べ、corepack enable を setup-node の前に移す等をその時点で決める。"
  ```

  どれかの Expected を満たさない場合は、まず食い違いと原因を bead ノートに書く。範囲外のファイルが入っていた場合は、そのファイルを `git restore --source origin/main --staged --worktree -- <ファイル>` で戻してステージし、`git-spice commit fixup <そのファイルを入れたコミット>` でそのコミットから取り除く（`git-spice-workflow` Skill に従う。新しい修正のコミットを積み増さない）。その後 Step 12 をやり直す。原因が分からない、または範囲を変える判断が要る場合は、bead を blocked にして assignee を外し、人への通知スクリプトで報告して drain する。

**受け入れ基準（Task 1）:** requirements の受け入れ基準 1〜7・9 を満たし、受け入れ基準 8 の確認手順が bead ノートに申し送られている。

## Non-Goals

- `LICENSE` と `package.json` の `license` の追加（依頼の (5)。この PR が `main` に入った後に mayor が別に流す）
- 絵文字の変更（依頼の (4)、別の部分 tf-gidaa）、#944・#949 を積み直しの対象から外す記録（依頼の (2)）
- `compressionLevel: mixed` の変更、`yarn.lock`・`package.json` の変更
- devcontainer に `~/.yarn/berry` の volume を足すこと
- `.github/workflows/static-checks.yml` の変更、setup-node の SHA・版の変更、`cache-dependency-path` の指定、`concurrency`・`push` トリガーの追加
- `docs/decisions/static-checks-in-pr-ci.md` の本文・`Status` の変更、`.claude/plans/active/static-checks-ci.md`・`.claude/specs/static-checks-ci*.md` の書き換え
- 履歴の書き換え（`git filter-repo` 等で過去のコミットから zip を消すこと）
- 既存の取り出し（本体の取り出し・ほかの worktree・Task 1 の worktree）に残る、無視対象になった `.yarn/cache` の中身の削除
- ほかの未マージのブランチ（`build/add-vitest`・`build/add-react-testing-library`・`docs/keep-node-modules-linker`・`docs/yarn-pnp-test-tools-trial`（#947）など）の積み直しや衝突の解消。どちらを先にマージするかと積み直しは、人の指示「後からマージする方を積み直す」に従い、マージの段と mayor が扱う
- 土台を未マージのスタックの最上段にすること（仮定 1。requirements が `main` に決めている）
- PR の作成（`open_pr=false`）と、PR を開いた後の CI の確かめ（受け入れ基準 8。final report に残す）

## Validation and Acceptance

### Coverage

| ID | Status | 本計画での扱い |
| --- | --- | --- |
| REQ-001 | covered | Task 1 Step 3（`git rm -r --cached`）、Step 5・12（`git ls-files` が空、`origin/main` の上の積み増しだけ） |
| REQ-002 | covered | Task 1 Step 3（`!.yarn/cache` の 1 行の削除）、Step 5（`git check-ignore`） |
| REQ-003 | covered | Task 1 Step 3（`enableGlobalCache: false` と空行の削除）、Step 5（`yarn config get`）、Step 6（`yarn.lock` 不変、想定外なら止まる） |
| REQ-004 | covered | Task 1 Step 7・8（`cache: yarn` の 1 行、`static-checks.yml` 不変） |
| REQ-005 | covered | Task 1 Step 9〜11（`yarn-cache-out-of-repo.md`、索引の 1 行、`static-checks-in-pr-ci.md` 不変） |
| REQ-006 | covered | Task 1 Step 6（`git archive HEAD` での install）、Step 4・8・11（pre-commit を飛ばさない）、Step 12（`yarn knip` と作業ツリーが空。本物の pre-push は publish の段） |
| REQ-007 | covered | Task 1 Step 12 で PR を開いた後の確認手順（ログの行・step debug logging）を bead ノートに申し送り、final report に残す。build の中では確かめない（requirements のとおり） |
| REQ-008 | covered | 土台 `main`・1 ブランチ・`git-spice commit create` と本文つきの 3 コミット（Step 1・4・8・11）、範囲の確かめ（Step 12） |

### 確かめの一覧（受け入れ基準との対応）

| 受け入れ基準 | 確かめるところ | 方法 |
| --- | --- | --- |
| 1 | Step 5・12 | `git ls-files .yarn/cache \| wc -l` が 0、`git merge-base --is-ancestor origin/main HEAD`、コミット数 3 |
| 2 | Step 3・5 | `git diff --cached -- .gitignore` が 1 行の削除、`git check-ignore -q` が 0 |
| 3 | Step 3・5 | `.yarnrc.yml` の差分が 2 行の削除、`yarn config get enableGlobalCache` が `true`、`cacheFolder` が `$HOME/.yarn/berry/cache` |
| 4 | Step 6 | `git archive HEAD` の展開先で `yarn install --immutable` が成功、`cmp` で `yarn.lock` 不変、`.yarn/cache` ができない |
| 5 | Step 7 | 差分が `cache: yarn` の 1 行、YAML の読み込みで SHA・`node-version`・ほかの手順が同じ |
| 6 | Step 10 | markdownlint、`check-docs.sh`、4 つのフィールドと見出しの順、索引の行、`static-checks-in-pr-ci.md` 不変 |
| 7 | Step 4・8・11・12 | pre-commit を `--no-verify` なしで通す。pre-push の `knip` と `check-git-clean` と同じ確かめ。本物の pre-push は publish の段 |
| 8 | PR を開いた後 | Step 12 の申し送りに従い final report で扱う |
| 9 | Step 12 | 変更ファイルが 5 つと `.yarn/cache` の削除だけ、範囲外のファイル不変、全コミットに本文 |

### Risks

- setup-node が `corepack enable` の前にランナーの `yarn` で `yarn config get cacheFolder` を正しく得るかは、PR の CI でしか確かめられない（REQ-007）。外れた場合の対処（`corepack enable` を setup-node の前に移す等）はその時点で決める
- 1 本の PR に 874 ファイルの削除が入り、レビューの画面が重い。追跡の解除を 1 つ目のコミットに分けて、ほかの 2 つのコミットを読みやすくしている
- ほかの未マージのブランチとの衝突: `build/add-vitest`・`build/add-react-testing-library` は `.yarn/cache` に zip を足しているため、この PR の後に積み直すと、足した zip が「追跡を外した側」と食い違い、その zip の `git rm --cached` が要る。`.yarnrc.yml` は先頭のコメントの変更（`docs/keep-node-modules-linker` など）と行が離れているため衝突しない見込み。`docs/decisions/index.md` の末尾への追記は、同じく末尾に足すブランチと積み直しのときに衝突し得る。どれも本計画の Task では扱わず、後からマージする方の積み直しで解く
- 土台を `main` にしたこと（仮定 1）は `git-spice-workflow` Skill の「未マージのスタックの最上段に積む」と食い違う。requirements と人の指示に従ったもので、review の段で判断できるようここに記録する
- 1 つ目のコミットの type を `build` にしたこと（仮定 3）は、COMMIT_CONVENTION の `build`（ビルドシステム・外部依存）と `chore`（開発環境の設定）の境目の判断。review の段で別の判断になった場合は subject の type だけを直す
- Step 6 の install はネットワークと数分の時間が要る。一時的なネットワークの失敗は 1 回だけやり直し、それでも失敗すれば原因を bead ノートに書いて止まる
- 既存の取り出しに残る zip（無視対象になる）は各自が手で消してよいが、本計画では消さない（Non-Goals）

## Decision Log

- 2026-11-21: plan-review で計画を承認。正式な plan/spec を保存する方針を採用。保存しない旨の旧記述はこの決定で変更。出典: /home/node/tascon-frontend/.gc-artifacts/remove-yarn-cache/requirements.md, /home/node/tascon-frontend/.gc-artifacts/remove-yarn-cache/brainstorming/design-candidate.md, /home/node/tascon-frontend/.gc-artifacts/remove-yarn-cache/implementation-plan.md。 保存時の documents base に存在しないリンクは、リンクテキストと元の参照先をプレーンテキストで保持: `static-checks-in-pr-ci.md`, `ファイル名`。
- 2026-11-21: Task 1 の実装中、保存済み plan の例示コマンド（markdown リンク形式）と MD038 の空白が `check-docs.sh`・markdownlint に止められたため、plan の該当 2 箇所だけ書き換えた（計画の「変えないファイル」の例外）。ADR の Date は実装日の 2026-11-21 にした。

## Progress

- plan-review 承認済み。
- 2026-11-21: Task 1 のローカルコミットを作成済み（`build:`・`ci:`・plan の例の修正の `docs:`・ADR の `docs:`・進捗記録の `docs:`）。plan の例の修正は spec レビュー R1 に従い ADR のコミットから分けた。push・PR は未実施（`open_pr=false`）。
- 検証結果: 受け入れ基準 1〜7・9 を確認。クリーンな `git archive HEAD` での `yarn install --immutable` は exit 0 で `yarn.lock` 不変、`yarn knip` exit 0、作業ツリー clean。worktree 内の `yarn config get enableGlobalCache` は本体 checkout の親 `.yarnrc.yml` を継ぎ `false` になる（環境要因）。
- 未確認: 受け入れ基準 8（PR の CI でキャッシュが効くこと）は PR を開いた後に確認する。
