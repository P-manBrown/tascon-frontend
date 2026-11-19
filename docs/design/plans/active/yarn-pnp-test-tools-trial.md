# yarn の PnP と Vitest・Playwright・Stryker の相性の試し（docs/yarn-pnp-test-tools-trial.md）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** リポジトリの外の使い捨ての取り出しで `nodeLinker: pnp` にし、`yarn install`・`next build`・`next start` と Vitest 5.1.0・`@playwright/test` 1.64.1・Stryker 10.1.1（vitest-runner）を最小の典型的な使い方で試し、結果（版・通ったこと・回避策・node-modules との比べ）を日本語の報告 `docs/yarn-pnp-test-tools-trial.md` 1 ファイルにまとめ、`docs:` コミット 1 つを push し、PR の下書きを bead ノートに残す。

**Architecture:** 試しはすべて固定の一時ディレクトリ `/tmp/yarn-pnp-trial-tf-30mw`（以下 `$TRIAL`）の中で行う。`main` の基準コミットを `git clone --no-hardlinks` で `$TRIAL/pnp` に取り出し、`$TRIAL/home` を専用の `HOME` にする環境ファイル `$TRIAL/env.sh` を毎回 `source` してから実行する。各コマンドの出力と終了コードを `$TRIAL/logs/` に控え、報告の根拠にする。失敗した道具・回避策が要った道具だけ `$TRIAL/nm`（`nodeLinker: node-modules` のままの別の取り出し）で同じ試しをする。報告を書いた後、ログを build artifact の置き場に写してから `$TRIAL` を消す。リポジトリで変えるのは報告 1 ファイルだけ。

**Tech Stack:** Node 22.22.2（devcontainer、Debian 12 bookworm、aarch64）、Yarn 4.4.0（corepack 経由、`yarnPath: .yarn/releases/yarn-4.4.0.cjs`）、Next.js 16（`next@^16.1.6`）、React 19、Vitest 5.1.0、`@playwright/test` 1.64.1、`@stryker-mutator/core`・`@stryker-mutator/vitest-runner` 10.1.1、npm（版の公開日の確かめ）、markdownlint-cli2、lefthook、git-spice、gc/bd（bead ノート）

---

## Context/Purpose

- 依頼: tf-ddw4（HQ 依頼 gc-vjh8 の 3/4）。承認済み requirements: `docs/design/requirements/yarn-pnp-test-tools-trial.md`（REQ-001〜REQ-009、AC-01〜AC-09）。承認済み design: 同ディレクトリの `brainstorming/design.md`（案 A: リポジトリの外の使い捨ての取り出しで試し、報告 1 ファイルを PR にする）
- 実装タスクは **Task 1 の 1 つだけ**。試しの各段は同じ一時ディレクトリ・同じ専用の `HOME`・前の段で入れた依存を引き継ぐため、別々の bead・別々のセッションに分けない
- リポジトリで変えるのは `docs/yarn-pnp-test-tools-trial.md` の新規追加だけ（REQ-008）。設定ファイル・テスト・やり直し用のスクリプトはリポジトリに置かず、報告の中のコードブロックに書く
- 作業の順序: ブランチ作成 → 一時ディレクトリと隔離の用意 → 取り出しと `nodeLinker: pnp` → `yarn install`・`yarn build`・`yarn start` → 補助のパッケージの版決め → Vitest → Playwright → Stryker →（失敗・回避策ありの道具だけ）node-modules での比べる試し → 版と環境の控え → 報告の執筆 → ログの写しと一時ディレクトリの削除 → 機械的な確かめ → コミット → push（PR は作らない）→ PR の下書きを bead ノートへ
- ライフサイクル（requirements・plan・plan-review・decompose・implement・review・finalize・publish）はこの formula が実行中。`### Task N` はリポジトリの変更と、その根拠になる試しだけを扱う。この run は `open_pr=false`・`push=true` のため、実装レーンは push までを行い、PR は作らず、PR のタイトルと本文の下書き（英語）を実装 bead のノートに残す（REQ-009 の PR は後続のレーンか人が下書きから作る。下の「前提と判断」を参照）

## Current System

- `main` = `ffa7ffccfc3f59b58f166a9ad8a31b0eaf864dca`（2026-11-19 計画作成時点。design・requirements の基準と同じ）。メインチェックアウト（`/home/node/tascon-frontend`）は `main` で `git status --porcelain` が空
- `.yarnrc.yml`（全文。`nodeLinker` の行だけを試しで書き換える）:

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

- `package.json`: `"type"` の指定なし（CommonJS 既定。`next.config.js` は `require`）、`packageManager: yarn@4.4.0`、`test` script なし。scripts: `build` = `ANALYZE=true next build --turbopack`、`start` = `next start`、`debug` = `NODE_OPTIONS='--inspect=0.0.0.0 -r ./.pnp.cjs' next dev`（PnP の名残）。`dependencies` に `next@^16.1.6`・`react@^19.2.4`・`react-dom@^19.2.4`。テストの道具は入っていない
- `tsconfig.json`: `"jsx": "react-jsx"`、`"moduleResolution": "bundler"`、`"paths": { "@/*": ["./src/*"] }`
- `.env` は追跡済み（`API_ORIGIN`・`NEXT_PUBLIC_API_ORIGIN`・`NEXT_PUBLIC_FRONTEND_ORIGIN`・`REMOTE_PATTERN_*` ほか）。`.env.local` は追跡されておらず、取り出しには入らない。`next.config.js` は `@next/bundle-analyzer`（`ANALYZE=true` で有効、`openAnalyzer: false`）と `next-pwa`（本番ビルドで有効）で包まれている
- 単体テストと変異テストの対象: `src/utils/string-count/count-graphemes.ts`（純粋な関数、外部への依存なし）

  ```ts
  export function countGraphemes(str: string) {
    const segmenter = new Intl.Segmenter("ja-JP", { granularity: "grapheme" });
    const graphemeSegments = segmenter.segment(str);
    return Array.from(graphemeSegments).length;
  }
  ```

- 描画テストの対象: `src/components/headings/auth-heading/index.tsx`（`AuthHeading`、`children: string` を `<h1>` で描く）。`/login` のページ（`src/app/(auth)/login/page.tsx`）はこの `AuthHeading` で見出し「ログイン」を描く
- `/login` は描画時にバックエンドを呼ばない見込み（`LoginForm` は `"use client"` のフォームで、送信時にだけ API を呼ぶ）。`src/proxy.ts` は `/tasks` などの保護されたパスだけを `/login` へ転送し、`/login` はそのまま通す。404 のページ（`src/app/not-found.tsx`）の見出しは `<h1>Page not found</h1>`
- 作業環境: devcontainer（`node:22.22.2`、Debian 12、aarch64）。`docker`・`podman` なし。`sudo -n true` が通る（パスワードなしの sudo）。`yarn` は corepack（`/usr/local/bin/yarn -> corepack/dist/yarn.js`）。`HTTP_PROXY`・`HTTPS_PROXY`・`NO_PROXY`（と小文字の各変数）が設定されている。`XDG_*` は設定されていない。`TMPDIR` は未設定。`~/.cache/ms-playwright` はない
- スタック（計画作成時点の `git-spice ls`）: `main ← refactor/move-design-and-tech-debt-to-docs (#942) ← chore/drop-gh-stack (#943)`。#942 の上には PR のないローカルだけのブランチ `ci/english-pull-requests`（別ワーカーのワークツリー `gc-tf-7fsu`）もある。#942・#943 は `package.json`・`yarn.lock`・`.yarnrc.yml`・`.yarn/`・`src/` を変えない。#942 は `.github/pull_request_template.md` の Related Documents の例を `docs/design/plans/active/<name>.md`・`docs/design/specs/<name>.md` に変える
- `git-spice-workflow` Skill: 新しい作業のブランチは未マージのスタックの最上段に積む（ドキュメントのみでも `main` から切らない）。コミット・PR は英語、コミットは body 付き、コミット前に全文の日本語訳を示す、PR は `.github/pull_request_template.md` に沿う
- lefthook: pre-commit で `yarn markdownlint-cli2 {staged_files}`（`*.md`）、`bash .lefthook/pre-commit/check-docs.sh`（`docs/*.md` の相対リンク切れなど）、`main` へのコミット禁止。pre-push で `yarn knip` と作業ツリーが clean であることの確かめ
- markdownlint 設定（`.markdownlint-cli2.jsonc`）: `default: true`、`MD007 indent 2`、`MD009 br_spaces 2`、`MD013`・`MD033` 無効。`MD024`（同じ見出しの重複）・`MD034`（裸の URL）・`MD036`（強調だけの行を見出し代わりにする）・`MD040`（コードブロックの言語）が有効

## Progress

- [x] Task 1: `docs/yarn-pnp-test-tools-trial.md` を追加して push した（ブランチ `docs/yarn-pnp-test-tools-trial`、PR #947）。build（superpowers-build）はレビューと gap analysis の承認後に publish まで完了している
- [ ] PR #947 のレビュー・マージ。マージ後、この plan を `docs/design/plans/completed/` へ移動する（`execution-plan` スキルの完了処理）
- 下の Steps は build の実行手順を残したもの。チェックボックスは build が実行した記録で、再実行する場合は新しく作る

## Proposed Implementation

### File Structure

- Create: `docs/yarn-pnp-test-tools-trial.md` — 報告本体（日本語）。冒頭・結論の要約・環境・版・道具ごとの結果・試した設定とテスト・限界・次に決めること
- リポジトリの外（コミットしない）:
  - `/tmp/yarn-pnp-trial-tf-30mw/`（`$TRIAL`）: `env.sh`（隔離の環境変数）、`pick-version.mjs`（補助のパッケージの版決め）、`pnp/`（PnP の取り出し）、`nm/`（比べる試しの取り出し。必要なときだけ）、`home/`（専用の `HOME`）、`logs/`（各コマンドの出力と終了コード）、`backup/`（回避策を試す前の設定の控え）、`commit-message.txt`、`pr-draft.txt`
  - `/home/node/tascon-frontend/.gc-artifacts/yarn-pnp-compat-trial/trial-logs/`: `$TRIAL` を消す前に写す `logs/` の写し（review の根拠。`.gc-artifacts/` は `.git/info/exclude` で無視されている）
- 取り出しの中で作るファイル（報告にそのまま載せる。リポジトリには入れない）: `vitest.config.mts`、`src/utils/string-count/count-graphemes.test.ts`、`src/components/headings/auth-heading/index.test.tsx`、`playwright.config.ts`、`e2e/login.spec.ts`、`stryker.config.json`
- ほかのファイル（`.yarnrc.yml`・`package.json`・`yarn.lock`・`.yarn/cache`・`Dockerfile`・`knip.json`・コード）は変えない

### 実行順序とライフサイクルとの関係

| 段階 | 担当 | この計画での扱い |
| --- | --- | --- |
| plan-review・decompose | この formula の後続ステップ | Task 1 を 1 つの実装 bead にする |
| implement | 実装レーン（Task 1） | 下の Task 1 を実行し、push と PR の下書きまで行う |
| review・finalize・publish | この formula の後続ステップ | PR を作るかは後続のレーンが決める（`open_pr=false`）。実装レーンは PR を作らない |

### Task 1: PnP で 3 つのテストの道具を試し、`docs/yarn-pnp-test-tools-trial.md` を追加して push する

**Files:**

- Create: `docs/yarn-pnp-test-tools-trial.md`
- Test: リポジトリに単体テストは足さない（実行するコードの変更がない）。試しの各コマンドの終了コードと出力を `$TRIAL/logs/` に控えて報告の根拠にし、差分の範囲・メインチェックアウトの状態・一時ディレクトリの削除・markdownlint を機械的に確かめる

**Behavior / Acceptance:** requirements の AC-01〜AC-09（REQ-001〜REQ-009）

**前提条件（実装セッション）:**

- セッションの作業ディレクトリが、このタスク用のワークツリー（`.claude/worktrees/<name>`）であること。報告の執筆・コミット・push はそのワークツリーで行う。メインチェックアウトのブランチは切り替えない
- 試し（Step 2〜Step 11）はワークツリーでもメインチェックアウトでもなく `$TRIAL` の中で行う。Bash の呼び出しごとにシェルの状態は引き継がれないため、試しのコマンドはすべて先頭で `source /tmp/yarn-pnp-trial-tf-30mw/env.sh` してから実行する
- `<TASK_BEAD_ID>` は実装レーンが claim した bead の ID。各 Step の結果（成功・失敗・判断）は都度 bead ノートに 1〜3 行で追記する（セッションが切れても続きから再開できるように）
- 秘密の値（`.env.local` の中身、トークン）は読まない・ログや報告に書かない。`.env` は追跡済みの開発用の値だが、報告には変数名だけを書き、値は書かない

- [ ] **Step 1: スタックの最上段を確かめ、その上に作業ブランチを作る**

  ```bash
  git-spice ls
  gh pr list --state open --json number,headRefName,baseRefName
  git branch -a --list '*yarn-pnp*'
  ```

  最上段 `<TOP>` の決め方: `git-spice ls` に出る未マージのブランチのうち、GitHub に open の PR があり、その上に PR のあるブランチが積まれていない物。候補が複数あれば PR 番号の最も大きい物。PR のないローカルだけのブランチ（計画作成時点の `ci/english-pull-requests`。別ワーカーが作業中）には積まない。未マージのスタックがなければ `<TOP>` は `main`。計画作成時点の `<TOP>` は `chore/drop-gh-stack`（#943）。ほかのタスク（ライセンスの洗い出し、静的な確かめの CI など）の PR が先に積まれていれば、それも同じ規則で最上段に含める。`docs/yarn-pnp-test-tools-trial` という名前のブランチが既にあれば、作らずに中身を確かめ、別の作業の物なら bead を blocked にして報告する。

  ```bash
  git-spice branch checkout <TOP>
  git status --short
  git rev-parse HEAD origin/<TOP>
  git-spice branch create docs/yarn-pnp-test-tools-trial --no-commit
  git-spice ls
  ```

  Expected: `git status --short` が空、2 つの SHA が一致、`docs/yarn-pnp-test-tools-trial` が `<TOP>` の上に表示され、チェックアウト中。`<TOP>` が他のワークツリーでチェックアウト中で切り替えられない場合は、`git-spice branch create docs/yarn-pnp-test-tools-trial --no-commit --target <TOP>` で作る。bead ノートに `<TOP>` とその SHA を記録する。

- [ ] **Step 2: 一時ディレクトリ・専用の `HOME`・環境ファイルを用意し、始める前の状態を控える**

  ```bash
  TRIAL=/tmp/yarn-pnp-trial-tf-30mw
  test ! -e "$TRIAL" || { echo "EXISTS: $TRIAL"; exit 1; }
  mkdir -p "$TRIAL/home" "$TRIAL/logs" "$TRIAL/backup"
  cat > "$TRIAL/env.sh" <<'EOF'
  export TRIAL=/tmp/yarn-pnp-trial-tf-30mw
  export HOME="$TRIAL/home"
  export YARN_GLOBAL_FOLDER="$HOME/.yarn/berry"
  export PLAYWRIGHT_BROWSERS_PATH="$HOME/ms-playwright"
  unset XDG_CACHE_HOME XDG_CONFIG_HOME XDG_DATA_HOME XDG_STATE_HOME
  export NO_PROXY="${NO_PROXY:+$NO_PROXY,}localhost,127.0.0.1"
  export no_proxy="$NO_PROXY"
  EOF
  git -C /home/node/tascon-frontend rev-parse main | tee "$TRIAL/logs/base-sha.txt"
  git -C /home/node/tascon-frontend branch --show-current | tee "$TRIAL/logs/main-checkout-branch-before.txt"
  git -C /home/node/tascon-frontend status --porcelain | tee "$TRIAL/logs/main-checkout-status-before.txt"
  ls -d /home/node/.cache/ms-playwright 2>&1 | tee "$TRIAL/logs/real-home-playwright-before.txt"
  dpkg-query -W -f='${Package}\n' | sort > "$TRIAL/logs/dpkg-before.txt"
  date -u +%Y-%m-%dT%H:%M:%SZ | tee "$TRIAL/logs/trial-started-at.txt"
  ```

  Expected: `EXISTS` は出ない（出たら前回の残りなので、中身を確かめてから `rm -rf /tmp/yarn-pnp-trial-tf-30mw` して Step 2 をやり直す）。`base-sha.txt` は `main` の SHA（計画作成時点は `ffa7ffcc…`。進んでいれば、その SHA を基準コミットとして使い、報告に書く）。`main-checkout-branch-before.txt` は `main`。`real-home-playwright-before.txt` は `No such file or directory`。

  隔離の意味（報告の「環境」に書く）: 専用の `HOME` により、作業環境の利用者の `~/.yarn`・`~/.cache`（corepack の yarn、npm のキャッシュ、Playwright のブラウザ）・`~/.config` を読まず、書かない。`enableGlobalCache: false` のため依存の zip は取り出しの中の `.yarn/cache` に入る。プロキシの変数はネットワークに出るために残し、`localhost`・`127.0.0.1` だけを `NO_PROXY` に足す（`next start` への要求がプロキシへ行かないように）。

- [ ] **Step 3: `main` の基準コミットを新しく取り出し、`node_modules`・`.pnp.cjs` がないことを確かめる**

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  BASE_SHA="$(cat "$TRIAL/logs/base-sha.txt")"
  git clone --no-hardlinks --quiet /home/node/tascon-frontend "$TRIAL/pnp"
  git -C "$TRIAL/pnp" checkout --quiet --detach "$BASE_SHA"
  git -C "$TRIAL/pnp" rev-parse HEAD
  for p in node_modules .pnp.cjs .pnp.loader.mjs .yarn/unplugged .yarn/install-state.gz; do test -e "$TRIAL/pnp/$p" && echo "FOUND $p"; done; echo checked
  ```

  Expected: `rev-parse HEAD` が `BASE_SHA` と同じ。`FOUND` は 1 行も出ず `checked` だけが出る。`git clone` は `HOME` を変えたあとでも動く（ローカルのパスからの取り出しで、利用者の git 設定は要らない）。

- [ ] **Step 4: 取り出しを `nodeLinker: pnp` にし、`yarn install` を試す（REQ-002）**

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  sed -i 's/^nodeLinker: node-modules$/nodeLinker: pnp/' .yarnrc.yml
  git diff -- .yarnrc.yml | tee "$TRIAL/logs/yarnrc-diff.txt"
  yarn --version | tee "$TRIAL/logs/yarn-version.txt"
  yarn install 2>&1 | tee "$TRIAL/logs/pnp-01-install.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-01-install.log"
  ls -la .pnp.cjs .pnp.loader.mjs; test -e node_modules && echo "node_modules exists" || echo "no node_modules"
  ```

  Expected: `yarnrc-diff.txt` は `-nodeLinker: node-modules` / `+nodeLinker: pnp` の 1 行の差分だけ。`yarn-version.txt` は `4.4.0`（corepack が専用の `HOME` の `.cache/node/corepack` に yarn を取ってきてから `yarnPath` に渡す。初回は取得のメッセージが出てもよい）。`exit=0`、`.pnp.cjs` と `.pnp.loader.mjs` ができ、`no node_modules`。出力の `YN0002`（peer の不足）などの警告は失敗ではないが、件数と代表例を報告に書く。

  失敗したら Step 10 の回避策の手順で回避策を試し、結果を書いてから進む。`yarn install` がどうしても通らなければ、以降の道具はすべて「通らなかった（前提が満たせない）」として Step 11 の node-modules の試しへ進む。

- [ ] **Step 5: `yarn build`（`next build`）と `yarn start`（`next start`）を試し、`/login` が開けるかを決める（REQ-002、REQ-004）**

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  yarn build 2>&1 | tee "$TRIAL/logs/pnp-02-build.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-02-build.log"
  ```

  Expected: `exit=0`、`.next/` ができる（`ANALYZE=true` のため `.next/analyze/` にバンドルの解析結果もできるが、試しでは使わない）。

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  (yarn start > "$TRIAL/logs/pnp-03-start.log" 2>&1 & echo $! > "$TRIAL/start.pid")
  for i in $(seq 1 60); do curl --noproxy '*' -s -o /dev/null http://127.0.0.1:3000/ && break; sleep 1; done
  curl --noproxy '*' -sS -o "$TRIAL/logs/pnp-03-login.html" -w 'login=%{http_code}\n' http://127.0.0.1:3000/login | tee -a "$TRIAL/logs/pnp-03-start.log"
  grep -o '<h1[^>]*>[^<]*</h1>' "$TRIAL/logs/pnp-03-login.html" | tee -a "$TRIAL/logs/pnp-03-start.log"
  curl --noproxy '*' -sS -o /dev/null -w 'notfound=%{http_code}\n' http://127.0.0.1:3000/this-page-does-not-exist | tee -a "$TRIAL/logs/pnp-03-start.log"
  pkill -P "$(cat "$TRIAL/start.pid")"; kill "$(cat "$TRIAL/start.pid")" 2>/dev/null; sleep 2
  curl --noproxy '*' -s -o /dev/null http://127.0.0.1:3000/ && echo "STILL RUNNING" || echo "stopped"
  ```

  Expected: `login=200`、`<h1 ...>ログイン</h1>` が出る、`notfound=404`、最後に `stopped`。`STILL RUNNING` なら `pkill -f 'next start'` で止める（ポート 3000 を Step 8 の `webServer` が使うため、必ず止めてから進む）。

  開くページの判断（REQ-004）: `/login` が 200 で `<h1>` に「ログイン」があれば Playwright の E2E は `/login` を開く。`/login` が 200 以外、またはバックエンドへの要求の失敗で見出しが出なければ、404 のページ（見出し「Page not found」）に切り替え、Step 8 の spec を「404 に切り替える場合」の版にし、切り替えた理由（ステータスと `pnp-03-start.log` のエラーの要点）を報告に書く。

  `yarn build` か `yarn start` が失敗したら、Step 10 の回避策の手順で回避策を試す。回避策でも通らなければ Playwright の試しは「通らなかった（前提が満たせない）」とし（REQ-002）、Step 8 を飛ばして Step 9 へ進む。

- [ ] **Step 6: 補助のパッケージの版を決める（公開から 2 週間以上たった最新の安定版、REQ-007）**

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cat > "$TRIAL/pick-version.mjs" <<'EOF'
  // Usage: node pick-version.mjs <package> <cutoff ISO date>
  // Prints the highest x.y.z version published on or before the cutoff.
  import { execFileSync } from "node:child_process";

  const [pkg, cutoffIso] = process.argv.slice(2);
  const time = JSON.parse(
    execFileSync("npm", ["view", pkg, "time", "--json"], { encoding: "utf8" }),
  );
  const cutoff = new Date(cutoffIso);
  const toNums = (v) => v.split(".").map(Number);
  const cmp = (a, b) => {
    const [x, y] = [toNums(a), toNums(b)];
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return y[i] - x[i];
    return 0;
  };
  const candidates = Object.entries(time)
    .filter(([v]) => /^\d+\.\d+\.\d+$/.test(v))
    .filter(([, t]) => new Date(t) <= cutoff)
    .map(([v]) => v)
    .sort(cmp);
  if (candidates.length === 0) throw new Error(`no stable version of ${pkg} before ${cutoffIso}`);
  console.log(`${pkg}\t${candidates[0]}\t${time[candidates[0]]}`);
  EOF
  CUTOFF="$(date -u -d '14 days ago' +%Y-%m-%dT%H:%M:%SZ)"
  echo "cutoff=$CUTOFF" | tee "$TRIAL/logs/helper-versions.tsv"
  for p in vite jsdom @testing-library/react @testing-library/dom @vitejs/plugin-react; do
    node "$TRIAL/pick-version.mjs" "$p" "$CUTOFF" | tee -a "$TRIAL/logs/helper-versions.tsv"
  done
  for p in vitest@5.1.0 @playwright/test@1.64.1 @stryker-mutator/core@10.1.1 @stryker-mutator/vitest-runner@10.1.1; do
    printf '%s\t%s\n' "$p" "$(npm view "$p" time --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const t=JSON.parse(s);console.log(t[process.argv[1]])})' "${p##*@}")" | tee -a "$TRIAL/logs/tool-published.tsv"
  done
  npm view vitest@5.1.0 peerDependencies --json | tee "$TRIAL/logs/vitest-peers.json"
  npm view @testing-library/react@"$(awk -F'\t' '$1=="@testing-library/react"{print $2}' "$TRIAL/logs/helper-versions.tsv")" peerDependencies --json | tee "$TRIAL/logs/rtl-peers.json"
  ```

  Expected: `helper-versions.tsv` に 5 行（名前・版・公開日時）。`tool-published.tsv` は vitest 5.1.0 が 2026-11-02、`@playwright/test` 1.64.1 が 2026-10-14、Stryker 10.1.1 が 2026-10-23（design の記録と同じ）。選んだ `vite` が `vitest-peers.json` の `vite` の範囲（`^6.4.0 || ^7.0.0 || ^8.0.0`）に入っていることを確かめる。入っていなければ、範囲に入る中で cutoff 以前の最新の版を選び直し、その理由を報告の「版」に書く。`rtl-peers.json` が `@testing-library/dom` の範囲を示すので、選んだ `@testing-library/dom` が入っていることも確かめる。

  `@vitejs/plugin-react` は版を控えるだけで、Step 7 で JSX の変換が通らないときにだけ入れる。入れなかった場合は報告の「版」に「入れていない」と書く（要った物だけを入れる。REQ-007）。

- [ ] **Step 7: Vitest（`vitest@5.1.0`）を試す（REQ-003）**

  `<VITE>`・`<JSDOM>`・`<RTL>`・`<RTL_DOM>` は Step 6 の `helper-versions.tsv` の版（範囲ではなく正確な版）。

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  yarn add -D vitest@5.1.0 vite@<VITE> jsdom@<JSDOM> @testing-library/react@<RTL> @testing-library/dom@<RTL_DOM> 2>&1 | tee "$TRIAL/logs/pnp-10-vitest-add.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-10-vitest-add.log"
  git diff -- package.json | tee "$TRIAL/logs/pnp-10-package-json-diff.txt"
  ```

  Expected: `exit=0`。`package.json` の `devDependencies` に 5 つが正確な版で入る。

  設定ファイル `$TRIAL/pnp/vitest.config.mts` を作る（`@/` の別名は `tsconfig.json` の `paths` と同じ対応で、node-modules でも要る通常の設定。回避策に数えない）:

  ```ts
  import { fileURLToPath } from "node:url";
  import { defineConfig } from "vitest/config";

  export default defineConfig({
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.{ts,tsx}"],
    },
  });
  ```

  純粋な関数の単体テスト `$TRIAL/pnp/src/utils/string-count/count-graphemes.test.ts`:

  ```ts
  import { describe, expect, it } from "vitest";
  import { countGraphemes } from "./count-graphemes";

  describe("countGraphemes", () => {
    it("counts a family emoji joined by ZWJ as one grapheme", () => {
      expect(countGraphemes("👨‍👩‍👧")).toBe(1);
    });

    it("counts each Japanese character as one grapheme", () => {
      expect(countGraphemes("あいう")).toBe(3);
    });

    it("returns 0 for an empty string", () => {
      expect(countGraphemes("")).toBe(0);
    });
  });
  ```

  React のコンポーネントの描画テスト `$TRIAL/pnp/src/components/headings/auth-heading/index.test.tsx`（`@/` の別名と JSX の変換を含む）:

  ```tsx
  // @vitest-environment jsdom
  import { cleanup, render, screen } from "@testing-library/react";
  import { afterEach, expect, it } from "vitest";
  import { AuthHeading } from "@/components/headings/auth-heading";

  afterEach(() => {
    cleanup();
  });

  it("renders the text as a level 1 heading", () => {
    render(<AuthHeading>ログイン</AuthHeading>);
    expect(
      screen.getByRole("heading", { level: 1, name: "ログイン" }),
    ).toBeDefined();
  });
  ```

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  yarn vitest run 2>&1 | tee "$TRIAL/logs/pnp-11-vitest-run.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-11-vitest-run.log"
  yarn vitest related src/utils/string-count/count-graphemes.ts --run 2>&1 | tee "$TRIAL/logs/pnp-12-vitest-related.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-12-vitest-related.log"
  ```

  Expected: `pnp-11` は `Test Files  2 passed (2)`、`Tests  4 passed (4)`、`exit=0`。`pnp-12` は `count-graphemes.test.ts` の 1 ファイルだけが走り（`Test Files  1 passed (1)`、`Tests  3 passed (3)`）、`exit=0`。

  JSX の変換が原因で描画テストだけ失敗した場合（例: `React is not defined`、`Unexpected token '<'`、JSX の構文エラー）: まず `vitest.config.mts` を次の形にし（`@vitejs/plugin-react@<PLUGIN_REACT>` を `yarn add -D` で入れる）、やり直す。これは Vite で React を扱う通常の設定で、node-modules でも同じく要るかを Step 11 で確かめるまでは「回避策」とは数えない。node-modules で要らずに通った場合だけ、PnP のための回避策として数える（REQ-007 の区分）。

  ```ts
  import { fileURLToPath } from "node:url";
  import react from "@vitejs/plugin-react";
  import { defineConfig } from "vitest/config";

  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.{ts,tsx}"],
    },
  });
  ```

  PnP の解決が原因で失敗した場合（例: `... tried to access ..., but it isn't declared in its dependencies`、`Cannot find module` / `Cannot find package`、`Qualified path resolution failed`）は Step 10 の回避策の手順へ進む。

- [ ] **Step 8: Playwright（`@playwright/test@1.64.1`）を試す（REQ-004）**

  Step 5 で `yarn build`・`yarn start` が回避策でも通らなかった場合はこの Step を飛ばし、報告に「通らなかった（前提が満たせない）」と書く。

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  yarn add -D @playwright/test@1.64.1 2>&1 | tee "$TRIAL/logs/pnp-20-playwright-add.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-20-playwright-add.log"
  yarn playwright --version | tee "$TRIAL/logs/pnp-21-playwright-version.log"
  yarn playwright install --with-deps chromium 2>&1 | tee "$TRIAL/logs/pnp-22-playwright-install.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-22-playwright-install.log"
  dpkg-query -W -f='${Package}\n' | sort > "$TRIAL/logs/dpkg-after.txt"
  comm -13 "$TRIAL/logs/dpkg-before.txt" "$TRIAL/logs/dpkg-after.txt" | tee "$TRIAL/logs/apt-installed-by-playwright.txt"
  ls "$PLAYWRIGHT_BROWSERS_PATH"
  ```

  Expected: `yarn playwright --version` は `Version 1.64.1`。install は `exit=0`（`--with-deps` は `sudo apt-get` で依存を入れる。sudo はパスワードなしで通る）。`apt-installed-by-playwright.txt` に入ったパッケージ名が並ぶ（何も入らなければ空。どちらでも報告の「環境」に書く）。ブラウザは `$TRIAL/home/ms-playwright/` の下に入る。

  設定ファイル `$TRIAL/pnp/playwright.config.ts`:

  ```ts
  import { defineConfig, devices } from "@playwright/test";

  export default defineConfig({
    testDir: "./e2e",
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    use: {
      baseURL: "http://127.0.0.1:3000",
    },
    webServer: {
      command: "yarn start",
      url: "http://127.0.0.1:3000/login",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  });
  ```

  E2E `$TRIAL/pnp/e2e/login.spec.ts`（`/login` を開く場合）:

  ```ts
  import { expect, test } from "@playwright/test";

  test("the login page shows its heading without the backend", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { level: 1, name: "ログイン" }),
    ).toBeVisible();
  });
  ```

  Step 5 で 404 のページに切り替えた場合は、`playwright.config.ts` の `webServer.url` を `http://127.0.0.1:3000/` に、spec を次の版にする（ファイル名は `e2e/not-found.spec.ts`）:

  ```ts
  import { expect, test } from "@playwright/test";

  test("the not found page shows its heading without the backend", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
  });
  ```

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  yarn playwright test --reporter=list 2>&1 | tee "$TRIAL/logs/pnp-23-playwright-test.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-23-playwright-test.log"
  pkill -f 'next start' || true
  ```

  Expected: `1 passed`、`exit=0`。Vitest の `include`（`src/**/*.test.{ts,tsx}`）は `e2e/` を拾わないので、Step 7 の `yarn vitest run` の結果は変わらない。

  失敗したら Step 10 の回避策の手順へ進む。`playwright.config.ts` の読み込みでの失敗（例: `Cannot find module '@playwright/test'`、TypeScript の変換の失敗）と、テストの実行での失敗（`webServer` の起動、ブラウザの起動）を分けてエラーの要点を控える。

- [ ] **Step 9: Stryker（`@stryker-mutator/core@10.1.1`・`@stryker-mutator/vitest-runner@10.1.1`）を試す（REQ-005）**

  Step 7 の単体テストが（回避策を含めて）通っていることが前提。通っていなければ Stryker も「通らなかった（Vitest の単体テストが通らないため）」と書き、Step 10 で Vitest の回避策を見つけた場合だけ、その回避策を入れたまま試す。

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  yarn add -D @stryker-mutator/core@10.1.1 @stryker-mutator/vitest-runner@10.1.1 2>&1 | tee "$TRIAL/logs/pnp-30-stryker-add.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-30-stryker-add.log"
  ```

  設定ファイル `$TRIAL/pnp/stryker.config.json`（`$schema` は `node_modules` の中を指す形が通例だが、PnP では `node_modules` がないため付けない）:

  ```json
  {
    "testRunner": "vitest",
    "mutate": ["src/utils/string-count/count-graphemes.ts"],
    "reporters": ["clear-text", "progress"],
    "vitest": {
      "configFile": "vitest.config.mts"
    }
  }
  ```

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  yarn stryker --version | tee "$TRIAL/logs/pnp-31-stryker-version.log"
  yarn stryker run 2>&1 | tee "$TRIAL/logs/pnp-32-stryker-run.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/pnp-32-stryker-run.log"
  ```

  Expected: `yarn stryker --version` は `10.1.1`。`pnp-32` に `count-graphemes.ts` の変異の表（`% score`・`# killed`・`# survived` など）と `Final mutation score of <数値>` が出て、`exit=0`。スコアの値は問わない（`{ granularity: "grapheme" }` は既定と同じなので、それを消す変異は生き残る見込み。生き残りの理由を報告に 1 行書く）。

  失敗したら Step 10 の回避策の手順へ進む。Stryker は既定でプロジェクトを `.stryker-tmp/` の下の砂場へ写して走らせるため、PnP では `.pnp.cjs` と `.yarn/cache` の扱いが原因になりうる。エラーが砂場（`.stryker-tmp`）の中での解決の失敗を示すなら、Step 10 の候補より先に `stryker.config.json` へ `"inPlace": true`（砂場を作らず元の場所で変異させる設定）を足して試してよい（REQ-006「エラーの内容から明らかに効く候補を先に試してよい」）。これは PnP のために足した設定なので、効いたら「回避策で通った」に数える。

- [ ] **Step 10: 失敗したときの回避策の手順（Step 4〜Step 9 のどこで失敗しても使う。REQ-006）**

  1. エラーの要点（最初のエラー行と、PnP の解決のメッセージがあればその全文の 1〜3 行）を、失敗したログのファイル名とともに bead ノートに控える
  2. 回避策を試す前に設定を控える:

     ```bash
     source /tmp/yarn-pnp-trial-tf-30mw/env.sh
     cd "$TRIAL/pnp"
     cp .yarnrc.yml package.json yarn.lock "$TRIAL/backup/"
     ```

  3. 次の候補を順に 1 つずつ試す。エラーの内容から明らかに効く候補があれば先に試してよい。1 つ試すごとに、元の失敗したコマンドを同じ形でやり直し、ログを `$TRIAL/logs/pnp-<番号>-workaround-<候補名>.log` に控える。効かなかったら次の候補の前に設定を戻す:

     ```bash
     source /tmp/yarn-pnp-trial-tf-30mw/env.sh
     cd "$TRIAL/pnp"
     cp "$TRIAL/backup/.yarnrc.yml" "$TRIAL/backup/package.json" "$TRIAL/backup/yarn.lock" .
     yarn install 2>&1 | tail -5
     ```

     - `packageExtensions`: エラーが「`<A>` tried to access `<B>`, but it isn't declared in its dependencies」なら、`.yarnrc.yml` の `packageExtensions` に足して `yarn install` する（`<A>` は依存を補う側のパッケージ、`<B>` は足りない依存、`<B の範囲>` はエラーに出た `<B>` の解決済みの版を `^` 付きで書く）。peer の不足なら `dependencies` の代わりに `peerDependencies` に書く:

       ```yaml
       packageExtensions:
         '<A>@*':
           dependencies:
             '<B>': '<B の範囲>'
       ```

     - `dependenciesMeta` の `unplugged`: zip の中のファイルを実ファイルとして要する物（ネイティブのバイナリ、書き込み、`__dirname` からの相対の読み込み）なら、`package.json` に足して `yarn install` する（`.yarn/unplugged/` に展開される）:

       ```json
       "dependenciesMeta": {
         "<パッケージ名>": { "unplugged": true }
       }
       ```

     - `pnpMode: loose`: `.yarnrc.yml` に `pnpMode: loose` を足して `yarn install` する（宣言されていない依存への到達を、警告を出して許す）
     - `yarn dlx`: 道具をプロジェクトの依存から外して一時的に取って走らせる。例: `yarn dlx -p vitest@5.1.0 vitest run`、`yarn dlx -p @playwright/test@1.64.1 playwright test`、`yarn dlx -p @stryker-mutator/core@10.1.1 -p @stryker-mutator/vitest-runner@10.1.1 stryker run`
     - `--require .pnp.cjs`: Node のプロセスに PnP の解決を読み込ませる。CommonJS なら `NODE_OPTIONS="--require $TRIAL/pnp/.pnp.cjs"`、ESM の読み込みで失敗するなら `NODE_OPTIONS="--require $TRIAL/pnp/.pnp.cjs --loader $TRIAL/pnp/.pnp.loader.mjs"` を付けて元のコマンドを走らせる（Playwright・Stryker が子プロセスを起こす場合に効く見込み）

  4. 効く物が見つかったら、その回避策を入れたまま次の Step へ進む（`$TRIAL/backup/` の控えは次の回避策の前に取り直す）。候補を試し終えても通らなければ、その道具は「通らなかった」とし、設定を戻してから次の Step へ進む
  5. 試した候補ごとに「候補・入れた設定の全文・結果（効いた／効かなかった）・効かなかったときのエラーの要点」を bead ノートに 1 行ずつ控える。報告の「道具ごとの結果」にそのまま使う

- [ ] **Step 11: 失敗・回避策ありの道具だけ、node-modules の取り出しで同じ試しをする（REQ-006）**

  対象の決め方: Step 4〜Step 9 で「回避策で通った」か「通らなかった」になった物（前提の確かめ・Vitest・Playwright・Stryker の単位）。全部「そのまま通った」なら、この Step は行わず、報告に「比べる試しは行っていない（全部そのまま通ったため）」と書く。Step 7 で `@vitejs/plugin-react` を足した場合は、Vitest を対象に含める（PnP のためだけの設定かを決めるため）。

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  BASE_SHA="$(cat "$TRIAL/logs/base-sha.txt")"
  git clone --no-hardlinks --quiet /home/node/tascon-frontend "$TRIAL/nm"
  git -C "$TRIAL/nm" checkout --quiet --detach "$BASE_SHA"
  cd "$TRIAL/nm"
  grep -n '^nodeLinker' .yarnrc.yml
  yarn install 2>&1 | tee "$TRIAL/logs/nm-01-install.log"; echo "exit=${PIPESTATUS[0]}" | tee -a "$TRIAL/logs/nm-01-install.log"
  ```

  Expected: `nodeLinker: node-modules`（書き換えない）、`exit=0`、`node_modules/` ができる。

  続けて、対象の道具だけ、PnP の取り出しと同じ版の `yarn add -D`（Step 7・Step 8・Step 9 と同じコマンド）、同じ設定ファイルとテスト（回避策を入れる前の版）を `cp` で写し、同じコマンドを走らせる。Playwright が対象なら先に `yarn build`（ログ `nm-02-build.log`）を走らせ、`yarn playwright install chromium`（ブラウザは同じ `PLAYWRIGHT_BROWSERS_PATH` にあるので取り直しはされない見込み）のあとで `yarn playwright test` を走らせる。

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/nm"
  mkdir -p e2e
  cp "$TRIAL/pnp/vitest.config.mts" . 2>/dev/null
  cp "$TRIAL/pnp/src/utils/string-count/count-graphemes.test.ts" src/utils/string-count/ 2>/dev/null
  cp "$TRIAL/pnp/src/components/headings/auth-heading/index.test.tsx" src/components/headings/auth-heading/ 2>/dev/null
  cp "$TRIAL/pnp/playwright.config.ts" . 2>/dev/null
  cp "$TRIAL/pnp"/e2e/*.spec.ts e2e/ 2>/dev/null
  cp "$TRIAL/pnp/stryker.config.json" . 2>/dev/null
  git status --short
  ```

  写したファイルに PnP のための回避策（例: `"inPlace": true`）が入っていれば、node-modules の側では取り除いてから走らせる。ログは `nm-<番号>-<道具>.log` の名前で控える。

  結果の読み方（報告に書く）:

  - node-modules で通り、PnP で回避策なしでは通らなかった → 失敗は PnP による
  - node-modules でも同じように失敗した → 失敗は PnP によらない（道具・版・この環境の問題）。エラーの要点を書く
  - Step 7 の `@vitejs/plugin-react` が node-modules でも要った → 通常の設定であり回避策に数えない。PnP の Vitest は「そのまま通った」と書き直す

- [ ] **Step 12: 版と環境を控える（REQ-007）**

  ```bash
  source /tmp/yarn-pnp-trial-tf-30mw/env.sh
  cd "$TRIAL/pnp"
  {
    echo "node: $(node -v)"
    echo "yarn: $(yarn --version)"
    echo "os: $(. /etc/os-release && echo "$PRETTY_NAME") / debian_version $(cat /etc/debian_version)"
    echo "cpu: $(uname -m)"
    echo "kernel: $(uname -r)"
    echo "next: $(node -e 'console.log(require("next/package.json").version)' -r ./.pnp.cjs)"
    echo "react: $(node -e 'console.log(require("react/package.json").version)' -r ./.pnp.cjs)"
  } | tee "$TRIAL/logs/environment.txt"
  git diff -- package.json | tee "$TRIAL/logs/pnp-final-package-json-diff.txt"
  git diff -- .yarnrc.yml | tee "$TRIAL/logs/pnp-final-yarnrc-diff.txt"
  git status --short | tee "$TRIAL/logs/pnp-final-status.txt"
  date -u +%Y-%m-%dT%H:%M:%SZ | tee "$TRIAL/logs/trial-finished-at.txt"
  ```

  Expected: `node: v22.22.2`、`yarn: 4.4.0`、`os: Debian GNU/Linux 12 (bookworm)`、`cpu: aarch64`。`next`・`react` は解決された正確な版（`yarn.lock` の版）。`pnp-final-package-json-diff.txt` に足した道具と補助のパッケージが正確な版で並ぶ。`-r ./.pnp.cjs` で `require` が失敗した場合は、`yarn info next --json` の代わりに `grep -A1 '^"next@' yarn.lock` で版を読む（`yarn info --manifest` は他のアーキの zip を落とすので使わない）。

- [ ] **Step 13: 報告 `docs/yarn-pnp-test-tools-trial.md` を書く（REQ-007、AC-01〜AC-07）**

  ワークツリーに次の構成で書く。見出しの名前と順番はこのとおりにする（requirements の REQ-007 の 8 つの節の順）。中身は `$TRIAL/logs/` と bead ノートの控えから書き、推測で埋めない。各節に書くことは見出しの下の箇条書きのとおり。

  ```markdown
  # yarn の PnP と Vitest・Playwright・Stryker の相性の試し

  - 試した日: 2026-11-19（`trial-started-at.txt` の日付。日本時間）
  - 基準コミット: `main` の `<base-sha.txt の 40 桁>`
  - 目的: 本体を PnP（`nodeLinker: pnp`）に戻してもテストの道具（Vitest・Playwright・Stryker）が動くかを、本体の設定を変えずに確かめる
  - 本体の設定は変えていない: `.yarnrc.yml`（`nodeLinker: node-modules`）・`package.json`・`yarn.lock`・`.yarn/cache` はこの試しで変えていない。試しはリポジトリの外の使い捨ての取り出しで行い、終わったあとで消した

  ## 結論の要約

  （前提の確かめ・Vitest・Playwright・Stryker の 4 行。それぞれ「そのまま通った／回避策で通った／通らなかった」のどれかと、根拠のコマンド 1 つ）
  （要る回避策の一覧。なければ「要る回避策はない」）
  （区分の意味: そのまま通った＝`nodeLinker: pnp` と道具・補助のパッケージを入れることのほかに設定を足さずに通った／回避策で通った＝回避策、またはそのほかに PnP のために足した設定を入れて通った／通らなかった＝回避策の候補を試し終えても通らなかった）

  ## 環境

  （Node・Yarn の版、OS・CPU、カーネル。`environment.txt` から）
  （devcontainer の中で行ったこと: 新しいコンテナは作れない（`docker`・`podman` がない）ため、devcontainer の中で、新しい取り出しと専用の `HOME` で隔離した）
  （取り出しの方法: `git clone --no-hardlinks` で基準コミットを一時ディレクトリへ取り出し、`node_modules`・`.pnp.cjs` がないことを確かめた）
  （隔離の方法: Step 2 の `env.sh` の全文をコードブロックで。専用の `HOME` で利用者の yarn・corepack・npm・Playwright のキャッシュと設定を使っていないこと）
  （`--with-deps` で `sudo apt-get` が入れたパッケージ名（`apt-installed-by-playwright.txt`）。なければ「入ったパッケージはない」）
  （後片付け: 一時ディレクトリ（比べる試しの取り出しを含む）を消したこと）

  ## 版

  （道具 4 つの正確な版と公開日（`tool-published.tsv`））
  （補助のパッケージの正確な版と公開日（`helper-versions.tsv`）。入れなかった物は「入れていない」。版を選んだ規則: 試した日に公開から 2 週間以上たった最新の安定版）
  （`next`・`react` の解決された版）

  ## 道具ごとの結果

  ### 前提の確かめ（yarn install・next build・next start）

  （コマンド、結果、警告の要点、`/login` の応答（ステータスと見出し）。失敗・回避策があればエラーの要点と試した回避策と結果）

  ### Vitest

  （`yarn vitest run`・`yarn vitest related ... --run` のコマンドと結果（通ったテストの数）。失敗・回避策があればエラーの要点、試した回避策と効いたかどうか、node-modules での比べる試しの結果。`@/` の別名・`@vitejs/plugin-react` を回避策に数えたか、その理由）

  ### Playwright

  （`yarn playwright install --with-deps chromium`・`yarn playwright test` のコマンドと結果。開いたページ（`/login`、切り替えたなら 404 のページと理由）。失敗・回避策の扱いは Vitest と同じ）

  ### Stryker

  （`yarn stryker run` のコマンドと結果（変異の数、killed・survived、スコア）。生き残った変異の理由 1 行。失敗・回避策の扱いは Vitest と同じ）

  ## 試した設定とテスト

  （`.yarnrc.yml` の差分（`pnp-final-yarnrc-diff.txt`）を `diff` のコードブロックで）
  （`package.json` の差分（`pnp-final-package-json-diff.txt`）を `diff` のコードブロックで）
  （`vitest.config.mts`・`playwright.config.ts`・`stryker.config.json` の全文を `ts`・`json` のコードブロックで。回避策を入れた場合は入れた後の版と、どこが回避策かを書く）
  （3 つのテストファイルの全文。それぞれファイルパスを書いてからコードブロック）
  （同じ試しをやり直す手順: 取り出し → `env.sh` → `nodeLinker` の書き換え → `yarn install` → `yarn add -D ...`（正確な版） → 設定とテストを置く → 各コマンド、の順のコマンドを `bash` のコードブロックで）

  ## 限界

  - aarch64 の Linux（Debian 12）でだけ試した。CI の x64 や macOS では確かめていない
  - 新しいコンテナではなく、devcontainer の中で、新しい取り出しと専用の `HOME` で隔離して試した。devcontainer にもともと入っているシステムのパッケージ（と `--with-deps` で入れた物）の影響は除けていない
  - 各道具は最小の例で試した（Vitest: 純粋な関数 1 つと React のコンポーネント 1 つ、`vitest related`。Playwright: 本番ビルドを立てて 1 ページ。Stryker: Vitest の上で 1 ファイル）。カバレッジ、ブラウザ 1 種類のほか、Biome・Knip・markuplint・lefthook・エディタの SDK の PnP での動作は確かめていない

  ## 次に決めること

  （PnP に切り替えるかはこの文書では決めない。Vitest・Playwright・Stryker を入れる作業の中で決め、`docs/decisions/` に残す）
  ```

  書き方の注意（markdownlint と check-docs を通すため）:

  - 丸括弧の中の説明は書き方の指示なので、報告には残さず中身に置き換える。`<...>` の形の値を残さない
  - コードブロックには必ず言語を付ける（`bash`・`ts`・`tsx`・`json`・`yaml`・`diff`・`text`）。ネストした ``` を避けるため、報告の中のコードブロックはそれぞれ独立に置く（MD040）
  - URL は `http://127.0.0.1:3000/login` のようにバッククォートで囲み、裸で書かない（MD034）
  - 同じ名前の見出しを 2 度使わない。道具ごとの「コマンド」「結果」は見出しにせず箇条書きの見出し語（`- コマンド:`）にする（MD024）。強調だけの行を見出し代わりにしない（MD036）
  - リポジトリの中への相対リンクを書かない（check-docs のリンク切れの確かめ。パスはバッククォートで書く）
  - `.env` の値、トークン、利用者のホームのパス（`/home/node/...` の利用者固有の部分）は書かない。一時ディレクトリのパスは書いてよい

- [ ] **Step 14: ログを build artifact の置き場へ写し、一時ディレクトリを消す（REQ-001、AC-08）**

  ```bash
  ART=/home/node/tascon-frontend/.gc-artifacts/yarn-pnp-compat-trial
  mkdir -p "$ART/trial-logs"
  cp -r /tmp/yarn-pnp-trial-tf-30mw/logs/. "$ART/trial-logs/"
  pkill -f 'next start' || true
  pkill -f 'stryker' || true
  rm -rf /tmp/yarn-pnp-trial-tf-30mw
  test ! -e /tmp/yarn-pnp-trial-tf-30mw && echo "trial dir removed"
  ls -d /home/node/.cache/ms-playwright 2>&1
  git -C /home/node/tascon-frontend branch --show-current
  git -C /home/node/tascon-frontend status --porcelain
  ```

  Expected: `trial dir removed`。`/home/node/.cache/ms-playwright` は `No such file or directory`（ブラウザは一時ディレクトリの中にだけ入った）。メインチェックアウトは `main` で、`status --porcelain` が Step 2 の `main-checkout-status-before.txt`（`$ART/trial-logs/` に写した物）と同じ（計画作成時点は空。`.gc-artifacts/` は `.git/info/exclude` で無視されるので `trial-logs/` は出ない）。消す前に報告が書き終わっていること（Step 13）を確かめる。`rm -rf` の対象は必ずこの固定のパスだけにする。

- [ ] **Step 15: 報告を機械的に確かめる（AC-01〜AC-09）**

  ```bash
  yarn markdownlint-cli2 docs/yarn-pnp-test-tools-trial.md
  bash .lefthook/pre-commit/check-docs.sh
  grep -nE '^#{1,3} ' docs/yarn-pnp-test-tools-trial.md
  grep -nE '<[A-Z_ ]+>|（.*から）$|書き直す）$' docs/yarn-pnp-test-tools-trial.md || echo "no placeholders"
  grep -c '```' docs/yarn-pnp-test-tools-trial.md
  grep -nE 'そのまま通った|回避策で通った|通らなかった' docs/yarn-pnp-test-tools-trial.md | head -20
  grep -nE '5\.1\.0|1\.64\.1|10\.1\.1|aarch64|docs/decisions/' docs/yarn-pnp-test-tools-trial.md | head -20
  git status --short
  ```

  Expected: markdownlint が `0 error(s)`、check-docs が出力なしで終了コード 0。見出しは H1 1 つと、H2 が「結論の要約・環境・版・道具ごとの結果・試した設定とテスト・限界・次に決めること」の順、「道具ごとの結果」の下に H3 が 4 つ。`no placeholders`。``` の数が偶数。結論の要約に 4 行の区分がある。版・CPU・`docs/decisions/` への言及がある。`git status --short` は `?? docs/yarn-pnp-test-tools-trial.md` の 1 行だけ。

  AC との対応を 1 つずつ目で確かめる: AC-01（冒頭の日付・SHA・本体を変えていない旨）、AC-02（環境）、AC-03（3 つの道具の版・コマンド・区分、補助のパッケージの版）、AC-04（失敗・回避策ありの物のエラー・回避策・比べる試し。なければ「比べる試しは行っていない」旨）、AC-05（前提の確かめ）、AC-06（設定とテストの全文とやり直しの手順）、AC-07（限界と、決定はこの PR でしない旨）。

- [ ] **Step 16: コミットする（`git-spice commit create`、body 付き、REQ-009）**

  コミットメッセージ（英語）を `/tmp/yarn-pnp-commit-message.txt` に書く。`<区分の 1 行>` は結論の要約の 4 行を英語にした物（例: `- Vitest: passed as is`、`- Playwright: passed with a workaround (pnpMode: loose)`、`- Stryker: did not pass`）に置き換える。

  ```text
  docs: add a yarn PnP trial report for the test tools

  Record how Vitest 5.1.0, @playwright/test 1.64.1 and Stryker 10.1.1
  with the Vitest runner behaved under nodeLinker: pnp, together with
  the prerequisite checks for yarn install, next build and next start.

  <区分の 1 行 × 4>

  The trial ran in a fresh clone of main outside the repository with an
  isolated HOME, so .yarnrc.yml, package.json, yarn.lock and .yarn/cache
  stay unchanged. The report lists the exact versions, commands,
  configuration and tests so the trial can be repeated, the workarounds
  that were tried, and the node-modules comparison runs. Whether to
  switch back to PnP is left to the work that adds the test tools.
  ```

  `git-spice-workflow` Skill の「コミット前に全文の日本語訳を示す」は、自律実行のため承認待ちをせず、次の日本語訳（区分の行は実際の結果に合わせる）を bead ノートに記録して満たす: 「docs: テストの道具の yarn PnP の試しの報告を追加する／Vitest 5.1.0、`@playwright/test` 1.64.1、Stryker 10.1.1（Vitest のランナー）が `nodeLinker: pnp` でどう動いたかを、前提の `yarn install`・`next build`・`next start` の確かめとともに記録する。／（区分の 4 行）／試しはリポジトリの外の `main` の新しい取り出しで、専用の `HOME` で行ったので、`.yarnrc.yml`・`package.json`・`yarn.lock`・`.yarn/cache` は変わっていない。報告には、試しをやり直せるよう正確な版・コマンド・設定・テストと、試した回避策、node-modules での比べる試しを載せる。PnP に戻すかは、テストの道具を入れる作業に委ねる。」

  ```bash
  git log --oneline -5 -- docs/
  git add docs/yarn-pnp-test-tools-trial.md
  git-spice commit create -m "$(cat /tmp/yarn-pnp-commit-message.txt)"
  git log -1 --format='%H%n%B'
  git-spice ls
  git branch --show-current
  git status --porcelain
  rm -f /tmp/yarn-pnp-commit-message.txt
  ```

  Expected: lefthook の pre-commit（markdownlint・check-docs・protect-branch ほか）が通り、`docs/yarn-pnp-test-tools-trial` にコミットが 1 つでき、body がある。`git branch --show-current` が `docs/yarn-pnp-test-tools-trial` のまま（`gs commit create` の後に HEAD が別のブランチへ移っていないこと）。`git status --porcelain` が空。pre-commit が失敗したら、出力を読んで報告の書式を直し、`git add` からやり直す（`--no-verify` は使わない）。

- [ ] **Step 17: 差分の範囲を確かめ、push する（PR は作らない、REQ-008、AC-08）**

  ```bash
  git diff --name-only <TOP>...HEAD
  git diff --stat <TOP>...HEAD
  git-spice branch submit --branch docs/yarn-pnp-test-tools-trial --no-publish
  git rev-parse HEAD origin/docs/yarn-pnp-test-tools-trial
  gh pr list --head docs/yarn-pnp-test-tools-trial --state all --json number
  git -C /home/node/tascon-frontend branch --show-current
  git -C /home/node/tascon-frontend status --porcelain
  ```

  Expected: 差分は `docs/yarn-pnp-test-tools-trial.md` だけ（`.yarnrc.yml`・`package.json`・`yarn.lock`・`.yarn/cache`・`Dockerfile`・`knip.json` の変更なし）。2 つの SHA が一致し、`gh pr list` が `[]`。メインチェックアウトは `main` で、`status --porcelain` が Step 2 の控えと同じ。pre-push の `yarn knip` が失敗した場合は、出力の全文を bead ノートに残し、`--no-verify` で回避せず、bead を blocked にして人へ報告する（human-notice スクリプト）。

  bead ノートに、ブランチ名・`<TOP>`・基準コミット・コミット SHA・push 済み・PR 未作成・`trial-logs/` の場所を記録する。

- [ ] **Step 18: PR のタイトルと本文の下書きを bead ノートに残す（REQ-009、AC-09）**

  作業ブランチの版の `.github/pull_request_template.md` に沿い、英語で書く（`<...>` は実際の結果に置き換える）。Related Documents は今のテンプレートの記法に従い、この変更に対応する plan・spec はリポジトリにないため ⬜️ と N/A にする。

  ```text
  Title: docs: add a yarn PnP trial report for the test tools

  ### Summary

  Add a one-time trial report (docs/yarn-pnp-test-tools-trial.md, in Japanese) on whether Vitest, Playwright and Stryker work under Yarn Plug'n'Play, to inform the later decision on switching back to nodeLinker: pnp when the test tools are added. Results under nodeLinker: pnp: prerequisites (yarn install, next build, next start): <result>; Vitest 5.1.0: <result>; Playwright 1.64.1: <result>; Stryker 10.1.1 with the Vitest runner: <result>. <Required workarounds, or "No workaround was needed.">

  ### Changes

  - docs/yarn-pnp-test-tools-trial.md: the trial date and base commit, a per-tool summary (passed as is / passed with a workaround / did not pass), the environment and how the trial was isolated (a fresh clone outside the repository with a dedicated HOME inside the dev container), exact versions of the tools and helper packages, per-tool commands, results, error summaries, workarounds tried and node-modules comparison runs, the full configuration and test files used, and the limits of the trial (aarch64 Linux only, no fresh container, minimal examples).

  ### Testing

  - Ran every command in the report in a fresh clone of main (<short SHA>) with nodeLinker: pnp and recorded exit codes and output.
  - Confirmed that this branch changes only docs/yarn-pnp-test-tools-trial.md and that the temporary trial directory was removed.
  - yarn markdownlint-cli2 docs/yarn-pnp-test-tools-trial.md passes.

  ### Related Issues (Optional)

  Related Issues: N/A

  ### Related Documents

  - ⬜️ Plan: N/A
  - ⬜️ Spec: N/A

  ### Notes (Optional)

  The repository configuration (.yarnrc.yml, package.json, yarn.lock, .yarn/cache) is unchanged. Whether to switch to PnP will be decided, and recorded in docs/decisions/, in the pull request that adds the test tools.
  ```

  ```bash
  gc bd update <TASK_BEAD_ID> --append-notes "$(cat /tmp/yarn-pnp-pr-draft.txt)"
  rm -f /tmp/yarn-pnp-pr-draft.txt
  ```

  （上の下書きを `/tmp/yarn-pnp-pr-draft.txt` に書いてから実行する。）PR の要件（1 本・英語・テンプレートどおり・Summary に道具ごとの結論）はこの下書きで満たす（AC-09）。

## Non-Goals

- 本体を PnP に切り替えること、Vitest・Playwright・Stryker を本体に入れること（`.yarnrc.yml`・`package.json`・`yarn.lock`・`.yarn/cache` は変えない）
- PnP に切り替えるかの決定と `docs/decisions/` への記録（道具を入れる PR で行う）
- 既存の道具（Biome・Knip・markuplint・lefthook・エディタの SDK）の PnP での網羅的な確かめ。`yarn install`・`next build`・`next start` だけは前提として確かめる
- 試しを作り直すスクリプト・CI・設定ファイルをリポジトリに置くこと（手順と設定は報告の中に書く）
- x64・macOS・新しいコンテナでの試し（この環境ではできない。限界として報告に書く）
- PR の作成とマージ（この run は `open_pr=false`。実装レーンは push と PR の下書きまで）
- 同じ依頼のほかの部分（ライセンスの洗い出し、静的な確かめの CI、lefthook）

## Validation and Acceptance

### Coverage

| ID | Status | Task / Step |
| --- | --- | --- |
| REQ-001 | covered | Task 1 Step 2・Step 3（新しい取り出し・専用の `HOME`・`node_modules` なしの確かめ）、Step 8（`apt` で入った物の控え）、Step 14（一時ディレクトリの削除） |
| REQ-002 | covered | Task 1 Step 4・Step 5（`nodeLinker: pnp`、`yarn install`・`yarn build`・`yarn start` と HTTP の応答） |
| REQ-003 | covered | Task 1 Step 7（純粋な関数・React のコンポーネント・`vitest related`） |
| REQ-004 | covered | Task 1 Step 5（`/login` か 404 かの判断）、Step 8（ブラウザの取得・`webServer`・E2E） |
| REQ-005 | covered | Task 1 Step 9（1 ファイルを `mutate` にした `yarn stryker run`） |
| REQ-006 | covered | Task 1 Step 10（回避策の候補を順に試す）、Step 11（node-modules での比べる試し） |
| REQ-007 | covered | Task 1 Step 6・Step 12（版と環境の控え）、Step 13（報告の 8 つの節）、Step 15（markdownlint ほか） |
| REQ-008 | covered | Task 1 Step 14・Step 17（差分が報告 1 ファイルだけ、メインチェックアウトが `main` のまま） |
| REQ-009 | covered | Task 1 Step 1（作業ブランチ）、Step 16（`docs:` のコミット、body 付き）、Step 17（push）、Step 18（英語の PR の下書き。PR の作成は後続のレーン） |

### 確かめの一覧

- 試しの根拠: `$TRIAL/logs/` の各ログの `exit=<n>` と出力。`$TRIAL` を消す前に `/home/node/tascon-frontend/.gc-artifacts/yarn-pnp-compat-trial/trial-logs/` へ写す（review レーンが報告の中身とログを突き合わせられるように）
- 隔離: Step 3 の `FOUND` が出ないこと、Step 14 で `/home/node/.cache/ms-playwright` ができていないこと
- 報告: Step 15 の markdownlint・check-docs・見出しの順・プレースホルダの残りなし（`grep` に当たった行は、書き方の指示の残りかどうかを目で確かめ、残りでなければよい）
- 差分と本体: Step 17 の `git diff --name-only <TOP>...HEAD` が報告 1 ファイル、メインチェックアウトが `main` で `status --porcelain` が始める前と同じ
- 後片付け: Step 14 の `trial dir removed`

### Risks

- `yarn build` の `ANALYZE=true next build --turbopack` が PnP で失敗する（Turbopack の PnP 対応、`next-pwa` の webpack の依存）: 前提が満たせないと Playwright の試しが「通らなかった（前提が満たせない）」になる。Step 10 の回避策を試し、node-modules の側でも `yarn build` を走らせて切り分ける
- Stryker の砂場（`.stryker-tmp`）が PnP の `.pnp.cjs` と `.yarn/cache` を写して遅い、または解決に失敗する: Step 9 で `inPlace: true` を先に試してよいとした
- `yarn start` が止まらずにポート 3000 を握ったまま残り、Playwright の `webServer` が失敗する: Step 5 と Step 8 で止まったことを確かめ、Step 14 で `pkill` する
- プロキシの変数のせいで `localhost` への要求がプロキシへ行く: `env.sh` で `NO_PROXY` に `localhost,127.0.0.1` を足し、`curl` には `--noproxy '*'` を付ける
- corepack が専用の `HOME` で yarn 4.4.0 を取り直す: ネットワークがあれば取れる。取れなければ `COREPACK_ENABLE_DOWNLOAD_PROMPT` の値と出力を控え、`node .yarn/releases/yarn-4.4.0.cjs <引数>` を `yarn` の代わりに使い、そのことを報告の「環境」に書く
- `gs commit create` 後に HEAD が上段へ移る（未ステージの変更が残っていた場合の既知の挙動）: Step 16 で `git branch --show-current` と `git status --porcelain` を確かめる
- 試しが長く、セッションが途中で切れる: 各 Step の結果を bead ノートに残し、`$TRIAL` は固定のパスなので、再開したセッションは `ls /tmp/yarn-pnp-trial-tf-30mw/logs` で済んだ Step を確かめて続きから進める（Step 2 の `EXISTS` の確かめは、再開のときは前回の続きとして扱い、消さない）

## Decision Log

- PR の作成: requirements の REQ-009 は「PR を作るところまで」だが、この run の変数は `open_pr=false`・`push=true`。同じ formula の先行の計画（ライセンスの洗い出し）と同じく、実装レーンは push と英語の PR の下書き（bead ノート）までを行い、PR の作成は後続のレーンか人に任せる。REQ-009 の PR の中身の要件（1 本・英語・テンプレート・Summary に道具ごとの結論）は下書きで満たす
- 実装タスクを 1 つにした理由: 試しの各段が同じ一時ディレクトリ・同じ専用の `HOME`・前の段で入れた依存と結果（`/login` か 404 か、Vitest の単体テストが通ったか）を引き継ぐため。別々の実装 bead にすると別々のセッション・ワークツリーで走り、状態を引き継げない
- 一時ディレクトリを固定のパス（`/tmp/yarn-pnp-trial-tf-30mw`）にした理由: Bash の呼び出しごとにシェルの状態が引き継がれず、途中で切れたセッションの再開でも同じ場所を指せるため。リポジトリとワークツリーの外という REQ-001 の条件を満たす
- 単体テスト・変異テストの対象を `countGraphemes` にした理由: `src/utils/` の中で外部の状態（環境変数・ブラウザの API）に依存しない純粋な関数で、変異の候補（文字列・オブジェクトのリテラル）がある。`getSafeRedirectUrl` はモジュールの読み込み時に `process.env` を読むため避けた
- 描画テストの対象を `AuthHeading` にした理由: `@/` の別名で読み込める、外部への依存のない小さなコンポーネントで、`/login` の見出しと同じ物を描く
- `vitest.config.mts` の `.mts`: `package.json` に `"type": "module"` がないため、ESM として読ませるために拡張子で指定する。node-modules でも同じなので回避策に数えない
- 試しのログを `.gc-artifacts/yarn-pnp-compat-trial/trial-logs/` に写すこと: AC-08 の「一時ディレクトリは消されている」は OS の一時ディレクトリについての基準で、build artifact の置き場（`.git/info/exclude` で無視、メインチェックアウトの `git status` に出ない）は対象外と解釈した
