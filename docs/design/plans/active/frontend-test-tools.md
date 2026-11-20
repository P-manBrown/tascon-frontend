# テストの道具（Vitest・React Testing Library・MSW・V8 coverage・Playwright・Stryker）を入れる Implementation Plan

Spec: docs/design/specs/frontend-test-tools.md
Worktree: 実装 item の準備時に個別の worktree を記録する。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** tascon-frontend に 6 つのテストの道具を、道具ごとに 1 ブランチ（計 7 ブランチ、先頭は node-modules を続ける決定の記録）で入れ、`vitest`・`e2e`・`stryker` の 3 ジョブを `static-checks.yml` のまとめ役 `checks` の `needs` に入れ、pre-push に `vitest related` を足す。7 本は build tf-p0zkq の最上段の上に一直線に積まれた状態で publish の段に渡す（push は publish の段が行う）。

**Architecture:** Vitest の設定は `vitest.config.mts`（既定の環境 `node`、描画するテストだけファイル先頭で jsdom）、共通の準備は `vitest.setup.ts`（RTL の `cleanup`、MSW の `server` の開始・リセット・終了、`server-only` の差し替え）、MSW の `server` は `src/mocks/server.ts`。E2E は `e2e/` に置き、Playwright が本番ビルドを `next start` で配って確かめる。Stryker は Vitest の上で既定の `mutate` を変異させる。しきい値は付けない。CI は既存のワークフロー `Static Checks` にジョブを足すだけで、新しい外部 Action は使わない。

**Tech Stack:** Yarn 4.4.0（`nodeLinker: node-modules`、`.yarn/cache` を追跡）、Next.js 16（Turbopack）、TypeScript、Biome、Knip 6、markuplint、markdownlint-cli2、lefthook 2、GitHub Actions、git-spice。追加する依存: `vitest` 5.1.0、`vite` 8.3.5、`jsdom` 30.1.3、`@testing-library/react` 16.3.3、`@testing-library/dom` 10.4.2、`msw` 3.0.3、`@vitest/coverage-v8` 5.1.0、`@playwright/test` 1.64.1、`@stryker-mutator/core` 10.1.1、`@stryker-mutator/vitest-runner` 10.1.1

---

## Context/Purpose

- 依頼: tf-dj4bc（依頼 gc-xtys の 2）。workflow root: tf-q3hon。承認済み requirements: `/home/node/tascon-frontend/.gc-artifacts/frontend-test-tools/requirements.md`（REQ-001〜REQ-011）。承認済み設計: `brainstorming/design.md`（節 1〜9）
- 実装タスクは 7 つ。1 つの Task が 1 つの実装 item で、item の準備の段（prepare-worktree）が作った item ブランチ 1 本にコミットする。Task はブランチを作らず、push もしない（括弧内はブランチ名の案）
  - Task 1: `docs/keep-node-modules-linker`（REQ-002）
  - Task 2: `build/add-vitest`（REQ-003〜004・007〜010 の Vitest 分）
  - Task 3: `build/add-react-testing-library`
  - Task 4: `build/add-msw`
  - Task 5: `build/add-vitest-coverage`
  - Task 6: `build/add-playwright`（REQ-005）
  - Task 7: `build/add-stryker`（REQ-006）。最後に 7 本のスタック全体を読むだけで確かめる（REQ-001・007）
- 依存の順: Task N（N=2〜7）は Task N-1 に依存する。Task 1〜7 は直列にしか進められない（各ブランチが 1 つ下のブランチの上に積まれる）
- 7 本を tf-p0zkq の最上段の上に一直線に積み、`checks` の `needs` を全ジョブに合わせた状態で publish の段に渡す。Task 1 の土台が最終の土台でなかった場合（仮定 1）は、Task 7 の Step 8 が publish の前に止め、並べ直しを mayor に頼む
- PR は作らない（`open_pr=false`、`push=true`）。REQ-011 は PR を作った後に確かめる（deferred）

### 工程との対応（traceability）

この formula は requirements・plan・plan-review・decompose・implement・review・finalize・publish の各段を自分で実行している。この計画の `### Task N` はソースの変更だけを扱う。

| 段 | この計画での扱い |
| --- | --- |
| decompose | `### Task 1`〜`### Task 7` をそれぞれ実装 bead にする。Task N は Task N-1 に依存（直列） |
| implement の準備 | item の準備の段（`do-work/prepare-worktree.md`）が item ごとに worktree `.claude/worktrees/gc-<source-anchor-id>` と item ブランチを 1 本作り、`gc.git_branch` に記録する。親は Task 1 が準備の時点の `gc.var.base_branch`（`origin` から取った commit）、Task 2〜7 が 1 つ前の Task の `gc.git_branch`。ブランチ名は `git-spice-workflow` Skill の「ブランチ作成ルール」に従って準備の段が決める（この計画の名前は案） |
| implement | 各 Task の Step を上から順に、準備の段が作った item ブランチの上で実行し、コミットまで行う。ブランチの作成・切り替え・push はしない。Task 7 は最後にスタック全体を読むだけで確かめ、並べ直しが要れば publish の前に止める |
| 並べ直し（要る場合だけ） | この計画の Task の外。Task 1 の土台が最終の土台（tf-p0zkq の push 済みの最上段）でなかったときに、Task 7 の Step 8 の報告を受けて mayor が行う（仮定 1） |
| review | 各 Task の最後の確認 Step の出力と bead ノートを材料にする |
| close（item ごと） | `close-source-anchor.md` が記録したブランチを確かめてから worktree を外す。Task はブランチから外れない |
| finalize | 各 item の `gc.git_branch` を下から並べて `gc.build.branches` にし、スタックの並びを確かめる |
| publish | `push=true` のため、`gc.build.branches` を `git-spice-workflow` Skill に従って下から push する（pre-push の lefthook もここで走る）。計画の Task は push しない。PR は作らない |

### 計画時に置いた仮定（headless のため質問せず記録）

1. **土台の選び方**: 土台は、Task 1 の item の準備の段がその時点の root tf-q3hon の `gc.var.base_branch` から決める。mayor は tf-p0zkq の push が済んだらこの値をその最上段に替える（root の notes）。値が `chore/lefthook-safe-autofix-and-typecheck` のまま（tf-p0zkq がまだ push されていない）で始まった場合も、そのまま作り進める（requirements の Constraints が許す）。その場合の tf-p0zkq の最上段への並べ直しは、計画の Task では行わない（Task が親のブランチを書き換えることになるため）。Task 7 の Step 8 が、最後に読んだ `gc.var.base_branch` の上に 7 本が一直線に積まれていないことを見つけた時点で、bead を blocked にして mayor に並べ直しと `needs` の整合を頼み、publish の前で止める（requirements の「枝分かれのまま push せず mayor に知らせる」）。並べ直した後は、各ブランチで共通 B と道具ごとの確かめをやり直す必要があることも伝える
2. **`checks` がまだない土台で作る場合**: tf-rrr6j の 1a（`checks`）が土台に入っていない間は、Task 2・6・7 はジョブだけを足す。`needs` への追加は仮定 1 の並べ直しの中で行う（Task 7 の Step 8 が `needs` の不一致を見つけて報告する）。土台に `checks` があればその場で `needs` に足す
3. **版の固定**: `package.json` は `^` 付き（既存の書き方）。`^` の範囲にはより新しい版（例: `vite` 8.3.6）が入るため、`yarn add` の後に `yarn.lock` の解決を確かめ、指定の版でなければ `yarn set resolution` で指定の版に固定する（requirements の Constraints「#947 で確かめていない組み合わせは使わない」）
4. **`@types/jsdom`**: Yarn 4 は型を持たないパッケージを `yarn add` すると `@types/*` を自動で足す。テストのコードは `jsdom` を import しないため、`@types/jsdom` が足されたら外す（TS-7「不要な依存は入れない・外す方を先に検討」）
5. **ロガー**: `fetchData` は `logger`（pino、本番以外では `pino-pretty` の transport を別スレッドで起動する）を呼ぶ。テストの出力と実行を安定させるため、`fetch-data.test.ts` は `vi.mock("@/lib/pino/logger", ...)` で `logger` を差し替える。ログの検証はしない
6. **Playwright のブラウザの置き場所**: worktree とシステムの一時ディレクトリの外へ書かないため、手元の確かめでは `PLAYWRIGHT_BROWSERS_PATH` を一時ディレクトリにする（`README.md` の手順には書かない。人の手元は既定の場所でよい）
7. **ブランチ名・コミットの type**: 依存を足すブランチは `build`（`.github/COMMIT_CONVENTION/COMMIT_CONVENTION.md`「外部依存の追加は build」）。ブランチ内のコミットは技術的な性質で分ける（依存・設定・テスト＝`build`、ワークフロー＝`ci`、lefthook の設定だけ＝`chore`、決定の記録・`ARCHITECTURE.md`・`README.md`＝`docs`）
8. **決定の記録の `Date`**: 既存の記録を更新するときは `Date` を変えない（`decisions-maintenance.md` に更新時の定めがないため、初めの決定日を保つ）。新しい記録は `2026-11-20`

## Current System

計画作成時点（`origin/chore/lefthook-safe-autofix-and-typecheck` = `a0345abe`、main = `9bfdad89`）の状態。行番号は計画作成時点で、実装時は文字列で探す。

- origin にあるブランチ: `main`・`docs/yarn-pnp-test-tools-trial`（#947）・`docs/yarn-pnp-test-tools-plan-spec`・`chore/lefthook-safe-autofix-and-typecheck`（#955）・`chore/drop-gh-stack`・`refactor/move-design-and-tech-debt-to-docs`。tf-rrr6j（1a〜1c）と tf-p0zkq の枝はまだ origin にない
- worktree: `.claude/worktrees/gc-tf-z5eba-walkthrough` が `chore/lefthook-safe-autofix-and-typecheck` をチェックアウト中（locked）。この build はそのブランチを動かさない（上に積むだけ）
- `.yarnrc.yml`: 先頭 2 行が `# TEMP: Avoid errors in ESLint and Prettier VSCode extensions.` と `#   See https://is.gd/ne40Ud, https://is.gd/nkQqxC`。続いて `nodeLinker: node-modules`・`compressionLevel: mixed`・`enableGlobalCache: false`・`packageExtensions`・`yarnPath: .yarn/releases/yarn-4.4.0.cjs`
- `.gitignore`: `.yarn/*` を無視し `!.yarn/cache` 等を戻す（依存の zip は追跡対象）。`/coverage` は無視済み。Playwright・Stryker の出力は未対応。末尾は `# BMAD` の `/_bmad-output/`
- `package.json`: devDependencies に `@biomejs/biome`・`@evilmartians/lefthook`・`@markuplint/*`・`@tailwindcss/postcss`・`knip`・`markdownlint-cli2`・`markuplint`・`pino-pretty`・`postcss`・`tailwindcss`。テストの道具・テストのファイルはない。`scripts.build` は `ANALYZE=true next build --turbopack`、`scripts.start` は `next start`
- `tsconfig.json`: `include` は `**/*.ts`・`**/*.tsx` 等（`*.mts` は入らない）。`paths` は `@/*` → `./src/*`
- `knip.json`: `ignoreUnresolved: ["\\.pnp\\.cjs$"]`、`ignoreDependencies` は `@evilmartians/lefthook`・`@markuplint/jsx-parser`・`@markuplint/react-spec`・`client-only`・`pino-pretty`
- `lefthook.yml` の pre-push（`commands`）: `knip`（`yarn knip`）・`check-git-clean`・`tsc`（`yarn next typegen && yarn tsc --noEmit`）。すべて `fail_text: 'Read the report above.'`（check-git-clean だけ別文）。lefthook 2 の `run` は `--file`・`--command` を持つ
- `.github/workflows/static-checks.yml`（`name: Static Checks`、`on: pull_request`、`permissions: contents: read`）: ジョブ `typecheck`（表示名 `tsc --noEmit`）・`biome`・`knip`・`markuplint`・`build`（`yarn build`）。各ジョブは `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` → `./.github/actions/setup`（setup-node 22.22.2・`corepack enable`・`yarn install --immutable`）→ `run`。tf-rrr6j が 1a で `checks`（`needs` 全体を `toJSON(needs)` と `jq` で判定、`if: always()`）、1b で `build` を `yarn next build --turbopack`、1c で `markdownlint`・`check-logger-trace`・`check-docs` を足す予定。tf-p0zkq も変える（中身は未確定）
- `docs/decisions/local-hooks-vs-ci-checks.md`（Verified、Date 2026-11-19、Related Files `lefthook.yml`）: Decision の最後の項目が「`vitest related`をpre-pushに加えるかは、テストの道具を導入した後に決める」
- `docs/decisions/static-checks-in-pr-ci.md`（Unverified、Date 2026-11-19）: タイトル「型・Lint・未使用コード・マークアップ・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する」、Decision に「次の5つの確かめを別々のジョブとして並列に実行する」と一覧。tf-rrr6j の 1c はタイトルを「型・Lint・未使用コード・マークアップ・Markdown・ドキュメント・ビルドの確かめは…」に替える予定。`docs/decisions/index.md` は各記録へのリンク 1 行ずつ（タイトルと同じ文）
- `ARCHITECTURE.md`（98 行）: `## 横断的な仕組み` の下に `### 認証`・`### エラー処理とユーザー通知`・`### ロギング`・`### リクエスト前処理`・`### URL 状態`、その後に `## 変更時の参照先`。名前で書き、パスを書かない
- `README.md`: 目次（`- [開発環境](#開発環境)` が最後）と、最後の節 `## 開発環境`。です・ます調、行末に半角スペース 2 つの改行
- テストの対象:
  - `src/utils/string-count/count-graphemes.ts`: `countGraphemes(str)`（`Intl.Segmenter("ja-JP", { granularity: "grapheme" })`）
  - `src/components/headings/auth-heading/index.tsx`: `AuthHeading({ className = "", children })` が `<h1>` を返す
  - `src/utils/api/fetch-data.ts`: 先頭で `import "server-only"`、`fetchData(url, { method, ...})`。204 → `data = null`。それ以外は `validateContentType`（`content-type` に `application/json` がなければ `ContentTypeError`）→ `res.json()`。`!res.ok` → `HttpError`（`statusCode`）を返す。`TypeError` かつ `isNetworkError(err)` → `NetworkError` を返す。`logger.debug`・`warn`・`error`・`fatal` を呼ぶ
- #947 の報告（`docs/yarn-pnp-test-tools-trial.md`）: node-modules・Yarn 4.4.0 で `yarn build`（Turbopack）・Vitest（jsdom の描画・`vitest related` を含む）・Playwright・Stryker が回避策なしで通った。PnP では Yarn 4.18.1・`next build --webpack`・Stryker の `plugins` の明示が要った。Turbopack は PnP で通らない。Vitest は PnP を推奨しないと警告する。報告の「次に決めること」が、PnP の判断をこの作業で `docs/decisions/` に残すことを求めている
- コミット規約（`git-spice-workflow` Skill）: 英語、Conventional Commits、body 必須、コミット前に全文の日本語訳を示す（autonomous なので bead ノートに書いて満たす）。コミットは `git-spice commit create -F <file>`。素の `git commit` は使わない
- memory の既知の問題: 入れ子の worktree があると `yarn biome ci .` が失敗する（追跡ファイルだけを渡せば通る）。`yarn info --manifest` は他のアーキテクチャの zip まで `.yarn/cache` に落とすので使わない

## Proposed Implementation

### File Structure

- Task 1（`docs/keep-node-modules-linker`）
  - Create: `docs/decisions/keep-node-modules-linker.md` — node-modules を続ける決定
  - Modify: `docs/decisions/index.md`（1 行追加）、`.yarnrc.yml`（先頭のコメント 2 行だけ）
- Task 2（`build/add-vitest`）
  - Modify: `package.json`・`yarn.lock`、Create: `.yarn/cache/*.zip`（追加分）
  - Create: `vitest.config.mts` — Vitest の設定（以後の Task で育てる）
  - Create: `src/utils/string-count/count-graphemes.test.ts`
  - Modify: `.github/workflows/static-checks.yml`（ジョブ `vitest`）、`lefthook.yml`（pre-push の `vitest-related`）
  - Modify: `docs/decisions/local-hooks-vs-ci-checks.md`、`docs/decisions/static-checks-in-pr-ci.md`、`docs/decisions/index.md`（リンクの文）、`ARCHITECTURE.md`（`### テスト`）
- Task 3（`build/add-react-testing-library`）
  - Modify: `package.json`・`yarn.lock`・`.yarn/cache`
  - Create: `vitest.setup.ts` — 全テスト共通の準備（以後の Task で育てる）
  - Modify: `vitest.config.mts`（`setupFiles`）
  - Create: `src/components/headings/auth-heading/index.test.tsx`
- Task 4（`build/add-msw`）
  - Modify: `package.json`・`yarn.lock`・`.yarn/cache`
  - Create: `src/mocks/server.ts` — テスト用の MSW の `server`
  - Modify: `vitest.setup.ts`
  - Create: `src/utils/api/fetch-data.test.ts`
- Task 5（`build/add-vitest-coverage`）
  - Modify: `package.json`・`yarn.lock`・`.yarn/cache`、`vitest.config.mts`（`coverage`）、`.github/workflows/static-checks.yml`（`--coverage`）、`docs/decisions/static-checks-in-pr-ci.md`
- Task 6（`build/add-playwright`）
  - Modify: `package.json`・`yarn.lock`・`.yarn/cache`、`.gitignore`
  - Create: `playwright.config.ts`、`e2e/login.spec.ts`
  - Modify: `.github/workflows/static-checks.yml`（ジョブ `e2e`）、`docs/decisions/static-checks-in-pr-ci.md`、`ARCHITECTURE.md`、`README.md`
- Task 7（`build/add-stryker`）
  - Modify: `package.json`・`yarn.lock`・`.yarn/cache`、`.gitignore`
  - Create: `stryker.config.json`
  - Modify: `.github/workflows/static-checks.yml`（ジョブ `stryker`）、`docs/decisions/static-checks-in-pr-ci.md`
- Task 7 の Step 8（スタック全体の確かめ）はファイルを読むだけで変えない
- 変えないファイル: `package.json` の `scripts`、`.github/actions/setup/action.yml`、`.devcontainer/*`、`biome.json`、`tsconfig.json`、`knip.json`（Knip が未使用と判定した場合だけ、Task の中の判断の手順に従う）

### 共通の手順（各 Task から参照する）

#### 共通 A: 依存を足して版を確かめる

`<PKGS>` はその Task の「パッケージ名@版」の並び（例: `vitest@5.1.0 vite@8.3.5`）。

```bash
yarn add -D $(for p in <PKGS>; do printf '%s ' "${p%@*}@^${p##*@}"; done)
```

足した後、各パッケージの解決した版を確かめる（`yarn info` は使わない）:

```bash
for p in <PKGS>; do
  name="${p%@*}"; want="${p##*@}"
  got="$(jq -r .version "node_modules/$name/package.json")"
  locked="$(grep -A2 -E "^\"?${name}@" yarn.lock | grep -E '^\s+version:' | sort -u | tr -d ' ' )"
  echo "$name want=$want got=$got locked=[$locked]"
done
```

Expected: どのパッケージも `got` が `want` と一致し、`locked` が `version:<want>` の 1 種類だけ。一致しないパッケージがあれば、`yarn.lock` のそのパッケージの記述子（`"<name>@npm:^<want>"` や、ほかのパッケージが要求する範囲の記述子）ごとに次で固定し、上の確かめをやり直す:

```bash
yarn set resolution "<name>@npm:<記述子の範囲>" npm:<want>
```

`grep '"@types/' package.json` で、自分で足していない `@types/*` が増えていないかを確かめる。増えていたら（例: `@types/jsdom`）`yarn remove <その名前>` で外す（仮定 4）。最後に:

```bash
yarn install --immutable
git status --short -- package.json yarn.lock .yarn/cache | head
```

Expected: `yarn install --immutable` が終了コード 0。`package.json`・`yarn.lock` と、`.yarn/cache` の追加の zip が変更として出る（zip はコミットに含める）。`.yarn/cache` 以外の `.yarn/` の変更（`install-state.gz` 等）は `.gitignore` で無視される。

#### 共通 B: 既存の確かめ

```bash
yarn biome ci --error-on-warnings $(git ls-files -co --exclude-standard | grep -E '\.(js|jsx|ts|tsx|mts|json|jsonc)$')
yarn knip
yarn next typegen && yarn tsc --noEmit
yarn lint-jsx
yarn markdownlint-cli2 $(git diff --name-only --diff-filter=AM "$(git merge-base HEAD <BASE>)" -- '*.md') README.md
```

`<BASE>` はこの Task のブランチの 1 つ下のブランチ（Step 1 で確かめた親。Task 1 は `origin/<gc.var.base_branch>`）。各 Step の見出しにある `<BASE>` の名前は案なので、準備の段が別の名前を付けていれば Step 1 で読んだ実際の名前に読み替える。Expected: すべて終了コード 0。Biome が整形・import の並びの違反を出したら、新しく作った・変えたファイルにだけ `yarn biome check --write <ファイル>` をかけ（安全な修正だけ）、差分を読んでから再実行する。

Knip が新しい依存・ファイルを未使用と報告したときの判断（TS-7）:

1. その依存が本当に要らないなら外す（`yarn remove`）
2. 要る依存（REQ-003 の 10 個）なら、Knip のプラグインが設定ファイルを見つけているか（`yarn knip --debug 2>&1 | grep -i -E 'vitest|playwright|stryker'`）を確かめ、見つけていない原因を直す
3. それでも残る場合だけ `knip.json` の `ignoreDependencies` に足し、理由を bead ノートに「PR 本文に書く理由: <理由>」として書く（PR を作るときに本文へ写す）

#### 共通 C: `static-checks.yml` の `checks` と全ジョブの照合

```bash
python3 - <<'PY'
import yaml
jobs = yaml.safe_load(open(".github/workflows/static-checks.yml"))["jobs"]
others = sorted(j for j in jobs if j != "checks")
needs = jobs.get("checks", {}).get("needs")
needs = sorted([needs] if isinstance(needs, str) else (needs or []))
print("jobs :", others)
print("needs:", needs if "checks" in jobs else "(no checks job)")
print("match:", "checks" in jobs and needs == others)
PY
```

Expected（`checks` がある場合）: `match: True`。`checks` がまだない土台では `needs: (no checks job)` と出る（仮定 2）。

#### 共通 D: コミット

メッセージを一時ファイルに書き、日本語訳を bead ノートに書いてからコミットする。

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

Expected: 現在のブランチがこの Task のブランチのまま（memory: `gs commit` の後に別のブランチに残ることがある）で、最新のコミットが今のメッセージ。pre-commit（biome・markdownlint・check-docs 等）が通る。

#### 共通 E: Task の始めに item ブランチと親を確かめる

ブランチは item の準備の段が作って `gc.git_branch` に記録している。Task はブランチを作らず、確かめるだけにする。`<PARENT>` は、Task 1 では準備の段が使った `gc.var.base_branch`、Task 2〜7 では 1 つ前の Task の item ブランチ（その source anchor の `gc.git_branch`。名前の案は各 Task の見出しの 1 つ前の Task の名前）。

```bash
git branch --show-current
git status --short
git-spice ls
git log --oneline -3
```

Expected:

- 今のブランチが、この Task の source anchor の `gc.git_branch` と同じ（`gc bd show <source anchor> --json` で読む）。名前がこの計画の案と違っても、その名前でそのまま進め、以降の手順のブランチ名を読み替える
- `git-spice ls` で、今のブランチのすぐ下が `<PARENT>` で、今のブランチにはまだこの Task のコミットが無い（前の試みのコミットがあれば、そのコミットの後の Step から続ける）
- `git status --short` が空

どれかが違えば、ブランチを作り直したり別のブランチに切り替えたりせず、bead を blocked にして違いを書き、報告する（準備の段の作り直しは工程の側で行う）。

#### 共通 F: Task の終わりの記録

```bash
git status --short
git branch --show-current
gc bd update <TASK_BEAD_ID> --append-notes "<このTaskのブランチ> の先端 $(git rev-parse --short HEAD) でコミット済み。push は publish の段が行う。"
```

Expected: `git status --short` が空で、今のブランチが共通 E で確かめた item ブランチのまま。ブランチから外れない（`git switch --detach` はしない。worktree の後片付けは `close-source-anchor.md` が記録したブランチを確かめてから行う）。

### Task 1: node-modules を続ける決定を記録する（`docs/keep-node-modules-linker`）

**Files:**

- Create: `docs/decisions/keep-node-modules-linker.md`
- Modify: `docs/decisions/index.md`（末尾に 1 行）、`.yarnrc.yml:1-2`
- Test: 自動テストなし。markdownlint・check-docs（pre-commit）と `git diff` で確かめる

**前提条件（実装セッション）:** セッションの作業ディレクトリが、item の準備の段が作ったこの Task 用の worktree（`.claude/worktrees/gc-<source-anchor-id>`）であること。main checkout のブランチは切り替えない。`gh stack` は使わない。ブランチの作成・切り替え・push はしない（共通 E）。

- [ ] **Step 1: item ブランチと土台を確かめる（共通 E、`<PARENT>` = `gc.var.base_branch`）**

  共通 E を走らせた後、土台を読む:

  ```bash
  BASE="$(gc bd show tf-q3hon --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.var.base_branch"]')"
  echo "BASE=$BASE"
  git rev-parse HEAD "origin/$BASE"
  gc bd update <TASK_BEAD_ID> --append-notes "Task 1 の土台: $BASE ($(git rev-parse --short HEAD))。tf-p0zkq の push 済みの最上段かどうか: <はい/いいえ（gc.var.base_branch が chore/lefthook-safe-autofix-and-typecheck のまま）>。いいえの場合は Task 7 の Step 8 で並べ直しを頼む（仮定 1）"
  ```

  Expected: 共通 E のとおり（`git-spice ls` で今のブランチのすぐ下が `$BASE`）。`git rev-parse` の 2 行が同じ SHA（準備の段は `origin/$BASE` の commit からブランチを作る）。違えば共通 E と同じく blocked にして報告する。土台が `chore/lefthook-safe-autofix-and-typecheck` のままでも止めずに進める（仮定 1）。

- [ ] **Step 2: 決定の記録を書く**

  `docs/decisions/keep-node-modules-linker.md` を次の内容で作る:

  ```markdown
  # Yarnのリンカーはnode-modulesのままにし、PnPに切り替えない

  - **Status:** Accepted
  - **Verification Status:** Verified
  - **Date:** 2026-11-20
  - **Related Files:** .yarnrc.yml

  ## Context

  `.yarnrc.yml`は`nodeLinker: node-modules`で、Yarnは4.4.0を使っている。テストの道具（Vitest・Playwright・Stryker）を入れる前に、PnP（`nodeLinker: pnp`）に戻しても道具が動くかを、本体の設定を変えない使い捨ての取り出しで試した（`docs/yarn-pnp-test-tools-trial.md`）。

  - node-modules（Yarn 4.4.0）では、`yarn build`（Turbopack）・Vitest（jsdomの描画テストと`vitest related`を含む）・Playwright・Strykerの4つとも回避策なしで通った
  - PnPでは、Turbopackの`next build`がパッケージを解決できず失敗した。Yarnを4.18.1に上げて`next build --webpack`にすると通った。Turbopackのままでは4.18.1でも通らなかった
  - PnPでは、Yarn 4.4.0のままだとjsdomを使う描画テストが`ERR_REQUIRE_ESM`で落ちた。Yarn 4.18.1で通った
  - PnPでは、Strykerの設定に`"plugins": ["@stryker-mutator/vitest-runner"]`を明示する必要があった
  - Vitestは起動時にPnPとViteの組み合わせを推奨しないと警告し、PnPの不具合を積極的には直さないとしている
  - Biome・Knip・markuplint・lefthook・エディタのSDKのPnPでの動作は確かめていない

  ## Decision

  - `nodeLinker: node-modules`を続ける。Yarnは4.4.0のままにする
  - テストの道具は、PnPのための回避策（Yarnの版上げ・`--webpack`・Strykerの`plugins`の明示）を入れずに導入する

  ## Considered Options

  - node-modulesのままにする（採用）: 4つの道具が回避策なしで動き、Turbopackのビルドを続けられる。Yarn・ビルドの設定を変えない。PnPの利点（厳密な依存の解決・installの速さ）は得られない
  - PnPに切り替え、Yarn 4.18.1・`next build --webpack`・Strykerの`plugins`の回避策を入れる: PnPの利点が得られる一方、Turbopackのビルドを捨てることになり、VitestがPnPを推奨していない。Biome・Knip等のPnPでの動作は未確認のまま
  - 決めずに後回しにする: 判断の材料はそろっており、`.yarnrc.yml`の一時的なコメントが残り続ける

  ## Consequences

  - 依存は`node_modules`に展開される。宣言していない依存をimportしても、PnPのようには止まらない
  - 次のいずれかが起きたら、PnPへの切り替えを見直す
    - TurbopackのビルドがPnPで通るようになる
    - VitestがPnPを推奨する・不具合を直す方針に戻る
    - Biome・Knip・markuplint・lefthookなど使っている道具がPnPで動くことを確かめられる
  ```

- [ ] **Step 3: 索引と `.yarnrc.yml` のコメントを直す**

  `docs/decisions/index.md` の末尾に 1 行足す:

  ```markdown
  - Yarnのリンカーはnode-modulesのままにし、PnPに切り替えない (path: keep-node-modules-linker.md)
  ```

  `.yarnrc.yml` の先頭 2 行

  ```yaml
  # TEMP: Avoid errors in ESLint and Prettier VSCode extensions.
  #   See https://is.gd/ne40Ud, https://is.gd/nkQqxC
  ```

  を次の 1 行に置き換える（ほかの行は変えない）:

  ```yaml
  # Keep the node-modules linker. See docs/decisions/keep-node-modules-linker.md.
  ```

- [ ] **Step 4: 確かめる**

  ```bash
  git diff -U0 -- .yarnrc.yml
  yarn config get nodeLinker
  yarn --version
  yarn markdownlint-cli2 docs/decisions/keep-node-modules-linker.md docs/decisions/index.md
  bash .lefthook/pre-commit/check-docs.sh
  ```

  Expected: `.yarnrc.yml` の差分がコメントの行だけ（`-` 2 行、`+` 1 行）。`node-modules`、`4.4.0`。markdownlint と check-docs が終了コード 0。

- [ ] **Step 5: コミット（共通 D）**

  ```bash
  git add docs/decisions/keep-node-modules-linker.md docs/decisions/index.md .yarnrc.yml
  ```

  メッセージ:

  ```text
  docs: decide to keep the node-modules linker

  The PnP trial (docs/yarn-pnp-test-tools-trial.md) showed that Vitest,
  Playwright, Stryker and the Turbopack build all work without workarounds
  on the node-modules linker with Yarn 4.4.0, while PnP needs a Yarn
  upgrade, a webpack build and an explicit Stryker plugin list. Record the
  decision to stay on node-modules, with the conditions for revisiting PnP,
  and replace the stale TEMP comment in .yarnrc.yml with a pointer to it.
  ```

- [ ] **Step 6: 終わりの記録（共通 F）**

### Task 2: Vitest を入れる（`build/add-vitest`）

**依存:** Task 1 のコミット（`docs/keep-node-modules-linker`）。

**Files:**

- Modify: `package.json`、`yarn.lock`、`.yarn/cache/*`
- Create: `vitest.config.mts`、`src/utils/string-count/count-graphemes.test.ts`
- Modify: `.github/workflows/static-checks.yml`、`lefthook.yml`（pre-push）
- Modify: `docs/decisions/local-hooks-vs-ci-checks.md`、`docs/decisions/static-checks-in-pr-ci.md`、`docs/decisions/index.md`、`ARCHITECTURE.md`
- Test: `src/utils/string-count/count-graphemes.test.ts`

**前提条件（実装セッション）:** Task 1 と同じ。

- [ ] **Step 1: item ブランチと親を確かめる（共通 E、`<PARENT>` = Task 1 の item ブランチ（案: `docs/keep-node-modules-linker`））**

  ブランチは作らない。今のブランチ（案: `build/add-vitest`）が Task 1 の item ブランチのすぐ上にあることを共通 E で確かめる。

- [ ] **Step 2: 依存を足す（共通 A、`<PKGS>` = `vitest@5.1.0 vite@8.3.5`）**

- [ ] **Step 3: 設定を書く**

  `vitest.config.mts`:

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

- [ ] **Step 4: 落ちるテストを書いて落ちることを確かめる**

  `src/utils/string-count/count-graphemes.test.ts`:

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

  テストが本当に対象を見ていることを確かめるため、一時的に `src/utils/string-count/count-graphemes.ts` の `return Array.from(graphemeSegments).length;` を `return str.length;` に変えて走らせる:

  ```bash
  yarn vitest run
  ```

  Expected: FAIL（絵文字のテストが `expected 8 to be 1` 等で落ちる。ほかの 2 件は通る）。確かめたら `git checkout -- src/utils/string-count/count-graphemes.ts` で元に戻す。

- [ ] **Step 5: 通ることを確かめる**

  ```bash
  git diff --quiet -- src/utils/string-count/count-graphemes.ts && echo restored
  yarn vitest run
  yarn vitest related --run --passWithNoTests src/utils/string-count/count-graphemes.ts
  yarn vitest related --run --passWithNoTests src/utils/string-count/count-characters.ts
  ```

  Expected: `restored`。1 つ目が `Test Files  1 passed (1)`、`Tests  3 passed (3)`。2 つ目が `count-graphemes.test.ts` の 1 ファイルだけを走らせて通る。3 つ目は関係するテストがなく `No test files found` 相当の表示で終了コード 0。

- [ ] **Step 6: コミット（共通 D）— 依存・設定・テスト**

  ```bash
  git add package.json yarn.lock .yarn/cache vitest.config.mts src/utils/string-count/count-graphemes.test.ts
  git status --short
  ```

  Expected: 未ステージの変更が残っていない（`??` も含めて）。メッセージ:

  ```text
  build: add Vitest with a first unit test

  Add vitest 5.1.0 and vite 8.3.5, the versions checked together in the
  PnP trial, and a Vitest config that resolves the @ alias, runs in the
  node environment by default and only collects src/**/*.test.{ts,tsx}.
  Unit tests live next to the file they test. The countGraphemes test is
  the smallest test that shows the runner works.
  ```

- [ ] **Step 7: CI のジョブを足す**

  `.github/workflows/static-checks.yml` に、`checks` ジョブがあればその直前に、なければ `jobs` の末尾に次を足す（SHA・タグは既存のジョブと同じ）:

  ```yaml
    vitest:
      name: vitest
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn vitest run
  ```

  `checks` ジョブがあれば、その `needs` の並びの末尾に `vitest` を足す。その後、共通 C を走らせる。

  Expected: `checks` があれば `match: True`、なければ `(no checks job)`（仮定 2。`needs` への追加は並べ直しの中で行い、Task 7 の Step 8 が不一致を報告する）。

- [ ] **Step 8: コミット（共通 D）— CI**

  ```bash
  git add .github/workflows/static-checks.yml
  ```

  メッセージ:

  ```text
  ci: run Vitest on every pull request

  Add a vitest job to the Static Checks workflow so the whole unit test
  suite runs on every pull request, and make the checks gate wait for it
  when the gate exists, so a failing test fails the required check.
  ```

  （土台に `checks` がない場合は本文の最後の節「and make … required check」を消し、`needs` は仮定 1・2 の並べ直しの中で足す旨を bead ノートに書く。）

- [ ] **Step 9: pre-push に `vitest-related` を足す**

  `lefthook.yml` の `pre-push.commands` の末尾（`tsc` の後）に足す:

  ```yaml
      vitest-related:
        glob: '*.{ts,tsx}'
        run: yarn vitest related --run --passWithNoTests {push_files}
        fail_text: 'Read the report above.'
  ```

- [ ] **Step 10: pre-push の動きを確かめる（R5・REQ-008）**

  ```bash
  yarn lefthook run pre-push --command vitest-related --file src/utils/string-count/count-graphemes.ts
  yarn lefthook run pre-push --command vitest-related --file README.md
  yarn lefthook run pre-push --command vitest-related --file src/utils/string-count/count-characters.ts
  yarn lefthook run pre-push --command vitest-related --file src/utils/string-count/removed-file.ts
  ```

  Expected:
  1. `vitest-related` が走り、`count-graphemes.test.ts` の 1 ファイルだけが通る
  2. `vitest-related` が `skip`（glob に合うファイルがない）と表示される
  3. 関係するテストがなく、終了コード 0
  4. 存在しないファイル（消したファイルの代わり）でも終了コード 0（REQ-008「消したファイルのパスだけを理由に失敗しない」）

  4 が失敗した場合は、`run` を `yarn vitest related --run --passWithNoTests $(for f in {push_files}; do [ -e "$f" ] && printf '%s ' "$f"; done)` に替え、4 と 1 をやり直し、替えたことと理由を bead ノートに「PR 本文に書く: …」として書く。結果（各コマンドの要点）を bead ノートに残す。

- [ ] **Step 11: 決定の記録 `local-hooks-vs-ci-checks.md` を更新する**

  - Context の最後の箇条書き（「作業はふだん`.claude/worktrees/`配下の…」）の後に足す:

    ```markdown
    - テストの道具（Vitest）を導入した。Vitestのテスト全体はCIだけで走らせ、pre-pushでは関係するテストだけを走らせると決めた（人の決定）
    - `vitest related`は、渡したファイルが import するテストだけを選んで走らせる。関係するテストがなくても`--passWithNoTests`で成功する
    ```

  - Decision の「`vitest related`をpre-pushに加えるかは、テストの道具を導入した後に決める」を次に置き換える:

    ```markdown
    - pre-pushでは、pushする`.ts`・`.tsx`に関係するテストだけを`vitest related`で走らせる。Vitestのテスト全体・カバレッジ・E2E・変異テストはCIだけで走らせる
    ```

  - Considered Options の末尾に足す:

    ```markdown
    - pre-pushで関係するテストだけを`vitest related`で走らせる（採用）: 壊したテストにpushの前に気づける。テストが増えてもpushの待ち時間は変更の範囲に比例する
    - pre-pushでテスト全体を走らせる: 取りこぼしはないが、テストが増えるほどpushが遅くなる。全体はCIで走る
    - pre-pushではテストを走らせない: pushは速いが、テストの失敗にCIで初めて気づく
    ```

  - Consequences の末尾に足す:

    ```markdown
    - `.ts`・`.tsx`を含むpushでは、関係するテストが落ちるとpushの前に止まる。`.ts`・`.tsx`を含まないpushでは走らない
    ```

  `Status`・`Verification Status`（Verified のまま。Step 10 で確かめた）・`Date` は変えない。

- [ ] **Step 12: 決定の記録 `static-checks-in-pr-ci.md` と索引を更新する**

  - タイトル（1 行目）と `docs/decisions/index.md` のこの記録へのリンクの文: 今のタイトルの「ビルドの確かめ」の直前に「テスト・」を入れる（例: 「…マークアップ・ビルドの確かめは…」→「…マークアップ・テスト・ビルドの確かめは…」。1c の後なら「…ドキュメント・テスト・ビルドの確かめは…」）。2 か所を同じ文にする
  - Decision の確かめの一覧（「次のN個の確かめ」の箇条書き）の末尾に足し、「次のN個」の数を一覧の項目数に合わせる:

    ```markdown
      - `vitest`: `yarn vitest run`（Vitestのテスト全体）
    ```

  - Context の末尾に足す:

    ```markdown
    - まとめ役の`checks`が`needs`で待てるのは同じワークフローのジョブだけのため、テストのジョブも静的な確かめと同じワークフロー（`Static Checks`）に置く
    ```

  - ファイル名・`Status`・`Verification Status`・`Date` は変えない。`Related Files` は変えない

- [ ] **Step 13: `ARCHITECTURE.md` に「テスト」を足す**

  `## 横断的な仕組み` の最後の小節（`### URL 状態` の段落）の後、`## 変更時の参照先` の前に足す:

  ```markdown
  ### テスト

  単体テストは Vitest で走らせ、対象のファイルの隣に `*.test.ts`・`*.test.tsx` として置く。
  ```

- [ ] **Step 14: 文書を確かめてコミットする（共通 D）— lefthook と記録を分ける**

  ```bash
  yarn markdownlint-cli2 docs/decisions/local-hooks-vs-ci-checks.md docs/decisions/static-checks-in-pr-ci.md docs/decisions/index.md ARCHITECTURE.md
  bash .lefthook/pre-commit/check-docs.sh
  wc -l ARCHITECTURE.md
  git add lefthook.yml
  ```

  Expected: 終了コード 0、`ARCHITECTURE.md` が 150 行程度以下。lefthook のコミットのメッセージ:

  ```text
  chore: run related Vitest tests before push

  Add a vitest-related pre-push command that runs only the tests related
  to the pushed .ts and .tsx files. The full suite runs only in CI, so
  pushes stay fast while still catching broken tests early.
  ```

  続いて `git add docs/decisions/local-hooks-vs-ci-checks.md docs/decisions/static-checks-in-pr-ci.md docs/decisions/index.md ARCHITECTURE.md` で記録のコミット:

  ```text
  docs: record where Vitest runs and where unit tests live

  Update the local hooks decision: pre-push now runs vitest related and
  the full suite stays in CI. Add the vitest job to the static checks
  decision and explain why test jobs live in the same workflow as the
  checks gate. Describe the unit test location in ARCHITECTURE.md.
  ```

- [ ] **Step 15: 既存の確かめ（共通 B、`<BASE>` = `docs/keep-node-modules-linker`）と `yarn vitest run`**

  Expected: すべて終了コード 0。

- [ ] **Step 16: 終わりの記録（共通 F）**

### Task 3: React Testing Library を入れる（`build/add-react-testing-library`）

**依存:** Task 2 のコミット（`build/add-vitest`）。

**Files:**

- Modify: `package.json`、`yarn.lock`、`.yarn/cache/*`、`vitest.config.mts`
- Create: `vitest.setup.ts`、`src/components/headings/auth-heading/index.test.tsx`
- Test: `src/components/headings/auth-heading/index.test.tsx`

**前提条件（実装セッション）:** Task 1 と同じ。

- [ ] **Step 1: item ブランチと親を確かめる（共通 E、`<PARENT>` = Task 2 の item ブランチ（案: `build/add-vitest`））**

  ブランチは作らない。今のブランチ（案: `build/add-react-testing-library`）が Task 2 の item ブランチのすぐ上にあることを共通 E で確かめる。

- [ ] **Step 2: 依存を足す（共通 A、`<PKGS>` = `@testing-library/react@16.3.3 @testing-library/dom@10.4.2 jsdom@30.1.3`）**

  `@types/jsdom` が足されたら外す（仮定 4）。

- [ ] **Step 3: 落ちるテストを書く**

  `src/components/headings/auth-heading/index.test.tsx`:

  ```tsx
  // @vitest-environment jsdom
  import { render, screen } from "@testing-library/react";
  import { expect, it } from "vitest";
  import { AuthHeading } from "@/components/headings/auth-heading";

  it("renders the text as a level 1 heading", () => {
    render(<AuthHeading>ログイン</AuthHeading>);
    expect(
      screen.getByRole("heading", { level: 1, name: "ログイン" }),
    ).toBeDefined();
  });
  ```

  一時的に `src/components/headings/auth-heading/index.tsx` の `<h1` と `</h1>` を `<h2` と `</h2>` に変えて走らせる:

  ```bash
  yarn vitest run src/components/headings/auth-heading
  ```

  Expected: FAIL（`Unable to find an accessible element with the role "heading" and name "ログイン"`）。確かめたら `git checkout -- src/components/headings/auth-heading/index.tsx` で戻す。

- [ ] **Step 4: 共通の準備で `cleanup` する**

  `vitest.setup.ts`（リポジトリ直下）:

  ```ts
  import { cleanup } from "@testing-library/react";
  import { afterEach } from "vitest";

  afterEach(() => {
    cleanup();
  });
  ```

  `vitest.config.mts` の `test` に `setupFiles` を足す:

  ```ts
    test: {
      environment: "node",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["./vitest.setup.ts"],
    },
  ```

- [ ] **Step 5: 通ることを確かめる**

  ```bash
  git diff --quiet -- src/components/headings/auth-heading/index.tsx && echo restored
  yarn vitest run
  ```

  Expected: `restored`。`Test Files  2 passed (2)`、`Tests  4 passed (4)`。`count-graphemes.test.ts` は `node` の環境のまま通る（R1）。

- [ ] **Step 6: 既存の確かめ（共通 B、`<BASE>` = `build/add-vitest`）**

  Knip が `@testing-library/dom`・`jsdom` を未使用と報告したら、共通 B の判断の手順に従う（両方とも `@testing-library/react`・`vitest` の peer の依存）。

- [ ] **Step 7: コミット（共通 D）**

  ```bash
  git add package.json yarn.lock .yarn/cache vitest.config.mts vitest.setup.ts src/components/headings/auth-heading/index.test.tsx
  git status --short
  ```

  メッセージ:

  ```text
  build: add React Testing Library with a first render test

  Add @testing-library/react 16.3.3, @testing-library/dom 10.4.2 and
  jsdom 30.1.3. Tests that render components opt into jsdom with a file
  comment, while other tests keep the node environment. A shared setup
  file unmounts rendered trees after each test. The AuthHeading test is
  the smallest test that shows rendering works.
  ```

- [ ] **Step 8: 終わりの記録（共通 F）**

### Task 4: MSW を入れる（`build/add-msw`）

**依存:** Task 3 のコミット（`build/add-react-testing-library`）。

**Files:**

- Modify: `package.json`、`yarn.lock`、`.yarn/cache/*`、`vitest.setup.ts`
- Create: `src/mocks/server.ts`、`src/utils/api/fetch-data.test.ts`
- Test: `src/utils/api/fetch-data.test.ts`

**前提条件（実装セッション）:** Task 1 と同じ。

- [ ] **Step 1: item ブランチと親を確かめる（共通 E、`<PARENT>` = Task 3 の item ブランチ（案: `build/add-react-testing-library`））**

  ブランチは作らない。今のブランチ（案: `build/add-msw`）が Task 3 の item ブランチのすぐ上にあることを共通 E で確かめる。

- [ ] **Step 2: 依存を足す（共通 A、`<PKGS>` = `msw@3.0.3`）**

- [ ] **Step 3: `server` と共通の準備を書く**

  `src/mocks/server.ts`:

  ```ts
  import { setupServer } from "msw/node";

  export const server = setupServer();
  ```

  `vitest.setup.ts` を次の内容にする:

  ```ts
  import { cleanup } from "@testing-library/react";
  import { afterAll, afterEach, beforeAll, vi } from "vitest";
  import { server } from "@/mocks/server";

  vi.mock("server-only", () => ({}));

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
  ```

- [ ] **Step 4: テストを書く**

  `src/utils/api/fetch-data.test.ts`:

  ```ts
  import { HttpResponse, http } from "msw";
  import { describe, expect, it, vi } from "vitest";
  import { server } from "@/mocks/server";
  import { HttpError } from "../error/custom/http-error";
  import { NetworkError } from "../error/custom/network-error";
  import { fetchData } from "./fetch-data";

  vi.mock("@/lib/pino/logger", () => ({
    logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
  }));

  const url = "http://backend.test/tasks";

  describe("fetchData", () => {
    it("returns the JSON body as data for a 200 response", async () => {
      server.use(http.get(url, () => HttpResponse.json({ id: 1 })));

      const result = await fetchData(url, { method: "GET" });

      expect(result).not.toBeInstanceOf(Error);
      expect(result).toMatchObject({ data: { id: 1 } });
    });

    it("returns null as data for a 204 response", async () => {
      server.use(http.get(url, () => new HttpResponse(null, { status: 204 })));

      const result = await fetchData(url, { method: "GET" });

      expect(result).toMatchObject({ data: null });
    });

    it("returns an HttpError for a 404 response", async () => {
      server.use(
        http.get(url, () =>
          HttpResponse.json({ error: "not found" }, { status: 404 }),
        ),
      );

      const result = await fetchData(url, { method: "GET" });

      expect(result).toBeInstanceOf(HttpError);
      expect(result).toMatchObject({ statusCode: 404 });
    });

    it("returns a NetworkError when the request fails", async () => {
      server.use(http.get(url, () => HttpResponse.error()));

      const result = await fetchData(url, { method: "GET" });

      expect(result).toBeInstanceOf(NetworkError);
    });
  });
  ```

- [ ] **Step 5: 落ちることと通ることを確かめる**

  まず、`server-only` の差し替えが効いていることを確かめるため、`vitest.setup.ts` の `vi.mock("server-only", () => ({}));` の行を一時的に消して走らせる:

  ```bash
  yarn vitest run src/utils/api
  ```

  Expected: FAIL（`server-only` の import が例外を投げ、`fetch-data.test.ts` が読み込めない。R3）。行を戻す。

  次に、R4 の最後の例（ハンドラのない URL）を一度だけ確かめる。一時的に 1 件目のテストの `server.use(...)` の行を消して走らせる:

  ```bash
  yarn vitest run src/utils/api
  ```

  Expected: 1 件目が FAIL し、出力に MSW の `[MSW] Error: intercepted a request without a matching request handler` 相当の表示がある（`onUnhandledRequest: "error"`）。行を戻す（この確かめのためのテストは残さない）。

  ```bash
  git diff -- src/utils/api/fetch-data.test.ts vitest.setup.ts | head -5
  yarn vitest run
  ```

  Expected: 一時的な変更が残っていない（上の Step 3・4 の内容のまま）。`Test Files  3 passed (3)`、`Tests  8 passed (8)`。

  `NetworkError` のテストだけが落ちる場合（`HttpResponse.error()` の失敗が `isNetworkError` に当たらない）は、`yarn vitest run src/utils/api --reporter=verbose` の出力でエラーの `message` を読み、bead ノートに書く。`fetchData` は変えず、テストの期待を変えずに直せない場合は、Task を blocked にして理由を書く（R4 の例が要件のため）。

- [ ] **Step 6: 既存の確かめ（共通 B、`<BASE>` = `build/add-react-testing-library`）**

- [ ] **Step 7: コミット（共通 D）**

  ```bash
  git add package.json yarn.lock .yarn/cache vitest.setup.ts src/mocks/server.ts src/utils/api/fetch-data.test.ts
  git status --short
  ```

  メッセージ:

  ```text
  build: add MSW to mock HTTP in unit tests

  Add msw 3.0.3 and one shared server that every test starts, resets and
  closes through the Vitest setup file. Unhandled requests fail the test,
  and each test adds its own handlers with server.use. The setup also
  replaces server-only with an empty module, because it throws outside
  the react-server condition. The fetchData test covers 200, 204, 404 and
  network failures.
  ```

- [ ] **Step 8: 終わりの記録（共通 F）**

### Task 5: V8 coverage を入れる（`build/add-vitest-coverage`）

**依存:** Task 4 のコミット（`build/add-msw`）。

**Files:**

- Modify: `package.json`、`yarn.lock`、`.yarn/cache/*`、`vitest.config.mts`、`.github/workflows/static-checks.yml`、`docs/decisions/static-checks-in-pr-ci.md`
- Test: `yarn vitest run --coverage`

**前提条件（実装セッション）:** Task 1 と同じ。

- [ ] **Step 1: item ブランチと親を確かめる（共通 E、`<PARENT>` = Task 4 の item ブランチ（案: `build/add-msw`））**

  ブランチは作らない。今のブランチ（案: `build/add-vitest-coverage`）が Task 4 の item ブランチのすぐ上にあることを共通 E で確かめる。

- [ ] **Step 2: 依存を足す（共通 A、`<PKGS>` = `@vitest/coverage-v8@5.1.0`）**

- [ ] **Step 3: 設定を足す**

  `vitest.config.mts` の `test` を次にする:

  ```ts
    test: {
      environment: "node",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["./vitest.setup.ts"],
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
      },
    },
  ```

- [ ] **Step 4: 確かめる**

  ```bash
  yarn vitest run --coverage
  git status --short --ignored coverage | head -3
  ```

  Expected: 終了コード 0、`Tests  8 passed (8)`、`% Stmts` 等の列を持つカバレッジの表が出て、`count-graphemes.ts`・`fetch-data.ts` の行がある。`coverage/` は `!!`（無視）として出る。

- [ ] **Step 5: CI と記録を変える**

  `.github/workflows/static-checks.yml` の `vitest` ジョブの `run: yarn vitest run` を `run: yarn vitest run --coverage` にする。

  `docs/decisions/static-checks-in-pr-ci.md` の Decision の `vitest` の項目を次にする:

  ```markdown
    - `vitest`: `yarn vitest run --coverage`（Vitestのテスト全体とV8のカバレッジ。カバレッジは出力の表で見るだけで、しきい値は付けない）
  ```

  Consequences の末尾に足す:

  ```markdown
  - カバレッジ・変異スコアにはしきい値を付けないため、数値が下がってもジョブは落ちない。落ちるのはテストの失敗・道具の故障のときだけ
  ```

- [ ] **Step 6: 既存の確かめ（共通 B、`<BASE>` = `build/add-msw`）と共通 C**

- [ ] **Step 7: コミット（共通 D）— 2 つに分ける**

  `git add package.json yarn.lock .yarn/cache vitest.config.mts`:

  ```text
  build: add V8 coverage to Vitest

  Add @vitest/coverage-v8 5.1.0, matching the vitest version, and
  measure coverage for src/**/*.{ts,tsx} without thresholds, so the
  numbers inform reviews without blocking them.
  ```

  `git add .github/workflows/static-checks.yml docs/decisions/static-checks-in-pr-ci.md`:

  ```text
  ci: report coverage from the vitest job

  Run the vitest job with --coverage instead of adding another job, so
  the suite runs once per pull request and prints the coverage table.
  Record in the static checks decision that coverage has no threshold.
  ```

- [ ] **Step 8: 終わりの記録（共通 F）**

### Task 6: Playwright を入れる（`build/add-playwright`）

**依存:** Task 5 のコミット（`build/add-vitest-coverage`）。

**Files:**

- Modify: `package.json`、`yarn.lock`、`.yarn/cache/*`、`.gitignore`
- Create: `playwright.config.ts`、`e2e/login.spec.ts`
- Modify: `.github/workflows/static-checks.yml`、`docs/decisions/static-checks-in-pr-ci.md`、`ARCHITECTURE.md`、`README.md`
- Test: `e2e/login.spec.ts`

**前提条件（実装セッション）:** Task 1 と同じ。

- [ ] **Step 1: item ブランチと親を確かめる（共通 E、`<PARENT>` = Task 5 の item ブランチ（案: `build/add-vitest-coverage`））**

  ブランチは作らない。今のブランチ（案: `build/add-playwright`）が Task 5 の item ブランチのすぐ上にあることを共通 E で確かめる。

- [ ] **Step 2: 依存を足す（共通 A、`<PKGS>` = `@playwright/test@1.64.1`）**

- [ ] **Step 3: 設定と E2E を書く**

  `playwright.config.ts`:

  ```ts
  import { defineConfig, devices } from "@playwright/test";

  export default defineConfig({
    testDir: "./e2e",
    forbidOnly: !!process.env.CI,
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    use: {
      baseURL: "http://127.0.0.1:3000",
    },
    webServer: {
      command: "yarn start",
      url: "http://127.0.0.1:3000/login",
      reuseExistingServer: !process.env.CI,
    },
  });
  ```

  `e2e/login.spec.ts`:

  ```ts
  import { expect, test } from "@playwright/test";

  test("the login page shows its heading without the backend", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { level: 1, name: "ログイン" }),
    ).toBeVisible();
  });
  ```

  `.gitignore` の `# testing` の節（`/coverage` の行の後）に足す:

  ```gitignore
  /test-results/
  /playwright-report/
  ```

- [ ] **Step 4: Vitest と Playwright が互いのテストを拾わないことを確かめる（R2）**

  ```bash
  yarn vitest run 2>&1 | grep -c 'e2e/' || true
  yarn playwright test --list
  ```

  Expected: 1 つ目が `0`（Vitest は `e2e/` を拾わない。テストは 8 件のまま）。2 つ目が `[chromium] › login.spec.ts` の 1 件だけ（`src` の `*.test.*` を拾わない）。

- [ ] **Step 5: 手元で E2E を走らせる（REQ-005）**

  ビルドのコマンドは、この時点の `static-checks.yml` の `build` ジョブの `run` と同じにする（1b の後なら `yarn next build --turbopack`、まだ `yarn build` なら `yarn build`）。

  ```bash
  BUILD_CMD="$(python3 -c 'import yaml;print([s["run"] for s in yaml.safe_load(open(".github/workflows/static-checks.yml"))["jobs"]["build"]["steps"] if "run" in s][-1])')"
  echo "$BUILD_CMD"
  export PLAYWRIGHT_BROWSERS_PATH="${TMPDIR:-/tmp}/ms-playwright-tf-q3hon"
  yarn playwright install chromium
  eval "$BUILD_CMD"
  yarn playwright test
  ```

  Expected: `1 passed`。ブラウザの共有ライブラリが足りずに起動できない場合は `yarn playwright install --with-deps chromium` を試す（`sudo apt-get` を使う。#947 と同じ）。それも使えない場合は、エラーの要点を bead ノートに書き、REQ-005 は PR を作った後の CI の結果で確かめる旨を書いて次へ進む。

  E2E が本当に画面を見ていることを、一時的に `e2e/login.spec.ts` の `name: "ログイン"` を `name: "ログアウト"` に変えて `yarn playwright test` で確かめる。Expected: FAIL（`toBeVisible` が時間切れ）。戻して `git diff --quiet -- e2e/login.spec.ts && echo restored`。

- [ ] **Step 6: CI のジョブを足す**

  `.github/workflows/static-checks.yml` に、`checks` があればその直前に、なければ末尾に足す（`<BUILD_CMD>` は Step 5 の `$BUILD_CMD` と同じ文字列）:

  ```yaml
    e2e:
      name: playwright
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn playwright install --with-deps chromium
        - run: <BUILD_CMD>
        - run: yarn playwright test
  ```

  `checks` があれば `needs` の末尾に `e2e` を足し、共通 C を走らせる。

- [ ] **Step 7: 文書を更新する**

  `docs/decisions/static-checks-in-pr-ci.md`:

  - Decision の確かめの一覧の末尾に足し、「次のN個」の数を合わせる:

    ```markdown
      - `playwright`（ジョブ`e2e`）: Chromiumを入れ、`build`ジョブと同じコマンドでビルドし、`yarn playwright test`（`next start`で配った本番のビルドを確かめる）
    ```

  - Consequences の末尾に足す:

    ```markdown
    - `build`ジョブのビルドのコマンドを変えるときは、`e2e`ジョブのビルドのコマンドも合わせる必要がある
    ```

  `ARCHITECTURE.md` の `### テスト` の段落の後に 1 文足す（段落を次にする）:

  ```markdown
  単体テストは Vitest で走らせ、対象のファイルの隣に `*.test.ts`・`*.test.tsx` として置く。ブラウザで画面を確かめる E2E テストは Playwright で走らせ、単体テストと分けて `e2e` ディレクトリに `*.spec.ts` として置く。
  ```

  `README.md`:

  - 目次の `- [開発環境](#開発環境)` の後に `- [テスト](#テスト)` を足す
  - 末尾に節を足す:

    ````markdown
    ## テスト

    E2E テストは本番用のビルドを `next start` で起動して確かめます。手元では次の手順で実行します。`--with-deps` はブラウザの実行に必要なシステムのパッケージもインストールします。  

    ```bash
    yarn playwright install --with-deps chromium
    yarn next build --turbopack
    yarn playwright test
    ```
    ````

    （`yarn next build --turbopack` の行は Step 5 の `$BUILD_CMD` に合わせる。）

- [ ] **Step 8: 既存の確かめ（共通 B、`<BASE>` = `build/add-vitest-coverage`）と `yarn vitest run --coverage`**

  Knip は Playwright のプラグインで `playwright.config.ts` と `e2e/` を見つける。`e2e/login.spec.ts` を未使用のファイルと報告したら共通 B の判断の手順に従う。

- [ ] **Step 9: コミット（共通 D）— 3 つに分ける**

  `git add package.json yarn.lock .yarn/cache .gitignore playwright.config.ts e2e/login.spec.ts`:

  ```text
  build: add Playwright with a login page E2E test

  Add @playwright/test 1.64.1 with a Chromium-only config that serves the
  production build with next start and checks the login page heading,
  which renders without the backend. E2E tests live in e2e/ as *.spec.ts
  so Vitest and Playwright never pick up each other's files. Ignore the
  Playwright output folders.
  ```

  `git add .github/workflows/static-checks.yml`:

  ```text
  ci: run the Playwright E2E tests on every pull request

  Add an e2e job that installs Chromium, builds with the same command as
  the build job and runs Playwright, and make the checks gate wait for it
  when the gate exists.
  ```

  `git add docs/decisions/static-checks-in-pr-ci.md ARCHITECTURE.md README.md`:

  ```text
  docs: describe the E2E job and how to run E2E tests locally

  Add the e2e job to the static checks decision and note that its build
  command must follow the build job. Describe where E2E tests live in
  ARCHITECTURE.md and add the local steps to README.md.
  ```

- [ ] **Step 10: 終わりの記録（共通 F）**

### Task 7: Stryker を入れる（`build/add-stryker`）

**依存:** Task 6 のコミット（`build/add-playwright`）。

**Files:**

- Modify: `package.json`、`yarn.lock`、`.yarn/cache/*`、`.gitignore`
- Create: `stryker.config.json`
- Modify: `.github/workflows/static-checks.yml`、`docs/decisions/static-checks-in-pr-ci.md`
- Test: `yarn stryker run`

**前提条件（実装セッション）:** Task 1 と同じ。

- [ ] **Step 1: item ブランチと親を確かめる（共通 E、`<PARENT>` = Task 6 の item ブランチ（案: `build/add-playwright`））**

  ブランチは作らない。今のブランチ（案: `build/add-stryker`）が Task 6 の item ブランチのすぐ上にあることを共通 E で確かめる。

- [ ] **Step 2: 依存を足す（共通 A、`<PKGS>` = `@stryker-mutator/core@10.1.1 @stryker-mutator/vitest-runner@10.1.1`）**

- [ ] **Step 3: 設定を書く**

  `stryker.config.json`:

  ```json
  {
    "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
    "testRunner": "vitest",
    "vitest": {
      "configFile": "vitest.config.mts"
    }
  }
  ```

  `.gitignore` の `# testing` の節（Task 6 で足した行の後）に足す:

  ```gitignore
  /reports/
  /.stryker-tmp/
  ```

- [ ] **Step 4: 走らせる（REQ-006・R6）**

  ```bash
  time yarn stryker run
  git status --short
  ```

  Expected: 終了コード 0。出力に `Mutation score` 等の変異スコアと、`count-graphemes.ts`・`fetch-data.ts` の行を持つ表がある。`git status --short` に `reports/`・`.stryker-tmp/` が出ない（無視される）。かかった時間を bead ノートに書く（15 分を超えたら Risks に従い mayor に知らせる。止めない）。

  設定が壊れたときに落ちることを、一時的に `stryker.config.json` の `"configFile": "vitest.config.mts"` を `"configFile": "missing.config.mts"` に変えて `yarn stryker run` で確かめる。Expected: 非 0 で終わる。戻して `git diff --quiet -- stryker.config.json && echo restored`。

- [ ] **Step 5: CI のジョブと記録**

  `.github/workflows/static-checks.yml` に、`checks` があればその直前に、なければ末尾に足す:

  ```yaml
    stryker:
      name: stryker
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - uses: ./.github/actions/setup
        - run: yarn stryker run
  ```

  `checks` があれば `needs` の末尾に `stryker` を足し、共通 C を走らせる。

  `docs/decisions/static-checks-in-pr-ci.md`:

  - Decision の確かめの一覧の末尾に足し、「次のN個」の数を合わせる:

    ```markdown
      - `stryker`: `yarn stryker run`（Vitestの上で`src`を変異させる変異テスト。しきい値は付けず、変異スコアを出力で見る）
    ```

  - Consequences の末尾に足す:

    ```markdown
    - `stryker`ジョブの時間は、テストとテストが覆うコードが増えるほど伸びる
    ```

- [ ] **Step 6: 既存の確かめ（共通 B、`<BASE>` = `build/add-playwright`）と `yarn vitest run --coverage`**

  Knip が `@stryker-mutator/vitest-runner` を未使用と報告したら共通 B の判断の手順に従う（`testRunner: "vitest"` で読み込まれる）。

- [ ] **Step 7: コミット（共通 D）— 2 つに分ける**

  `git add package.json yarn.lock .yarn/cache .gitignore stryker.config.json`:

  ```text
  build: add Stryker mutation testing on top of Vitest

  Add @stryker-mutator/core and @stryker-mutator/vitest-runner 10.1.1
  with a config that reuses the Vitest config and keeps the default
  mutate globs, reporters and thresholds, so surviving mutants never fail
  the run. No plugins list is needed on the node-modules linker. Ignore
  the Stryker report and sandbox folders.
  ```

  `git add .github/workflows/static-checks.yml docs/decisions/static-checks-in-pr-ci.md`:

  ```text
  ci: run Stryker on every pull request

  Add a stryker job and make the checks gate wait for it when the gate
  exists, so a broken Stryker setup or a failing initial test run fails
  the required check. Record in the static checks decision that it has
  no threshold and that its run time grows with the tests.
  ```

- [ ] **Step 8: スタック全体を読むだけで確かめる（REQ-001・REQ-007、仮定 1・2）**

  publish の段が `gc.build.branches` をそのまま push するので、その前に 7 本の並びと `checks` の `needs` を確かめる。ブランチの切り替え・並べ直し・ほかのブランチへのコミットはしない（`git show <ブランチ>:<パス>` で読むだけ）。

  7 本の item ブランチの名前を、下から順に読む。decomposition の成果物（root tf-q3hon の `gc.build.decomposition_path`）で Task 1〜7 の source anchor の bead を引き、各 bead の `gc.git_branch` を読む:

```bash
git fetch origin
BASE="$(gc bd show tf-q3hon --json | jq -r '(if type=="array" then .[0] else . end).metadata["gc.var.base_branch"]')"
echo "BASE=$BASE"
BRANCHES="<Task 1 の gc.git_branch> <Task 2 の gc.git_branch> … <Task 7 の gc.git_branch>"
test "$(git branch --show-current)" = "${BRANCHES##* }" && echo "top=current"
git-spice ls
prev="origin/$BASE"
for b in $BRANCHES; do
  if git merge-base --is-ancestor "$prev" "$b"; then echo "$b on $prev: ok"; else echo "$b on $prev: NOT STACKED"; fi
  prev="$b"
done
for b in $BRANCHES; do
  git show "$b:.github/workflows/static-checks.yml" | python3 -c '
import sys, yaml
jobs = yaml.safe_load(sys.stdin)["jobs"]
others = sorted(j for j in jobs if j != "checks")
needs = jobs.get("checks", {}).get("needs")
needs = sorted([needs] if isinstance(needs, str) else (needs or []))
print(sys.argv[1], "has_checks:", "checks" in jobs, "missing:", sorted(set(others) - set(needs)), "extra:", sorted(set(needs) - set(others)))
' "$b"
done
TOP="${BRANCHES##* }"
git show "$TOP:.github/workflows/static-checks.yml" | python3 -c '
import sys, yaml
jobs = yaml.safe_load(sys.stdin)["jobs"]
build = [s["run"] for s in jobs["build"]["steps"] if "run" in s][-1]
e2e = [s["run"] for s in jobs["e2e"]["steps"] if "run" in s][-2]
print("build=[%s] e2e=[%s] %s" % (build, e2e, "same" if build == e2e else "DIFFERENT"))
'
```

  Expected:

- `BASE` が `chore/lefthook-safe-autofix-and-typecheck` ではない（mayor が tf-p0zkq の push 済みの最上段に替えている）
- `top=current`。`git-spice ls` で `$BASE` の上に 7 本が下から Task 1〜7 の順に一直線に並び、ループのすべてが `ok`（REQ-001）
- 7 本とも `has_checks: True missing: [] extra: []`（REQ-007）
- 最後の行が `same`（`e2e` のビルドが `build` ジョブと同じ）。続けて `git show "$TOP:README.md" | grep -nF '<build= の値>'` が 1 行以上出す（`README.md` の手順も同じコマンド。Task 6 Step 7）

  すべて満たせば、7 本の名前と先端の SHA、`$BASE` とその SHA を bead ノートに書いて共通 F に進む。

  1 つでも満たさない場合（Task 1 の土台が最終の土台でなかった、`checks` が無い・`needs` が合わない、`e2e` のビルドの行が `build` ジョブと違う）は、ほかのブランチを書き換えずに次を行い、この bead を閉じない（閉じると publish の段が枝分かれのまま push する）:

  1. 結果の全文を bead ノートに書く
  2. bead を blocked にし（`gc bd update <TASK_BEAD_ID> --status blocked`）、人への通知スクリプトで報告する。requirements の求めに従い `gc mail send mayor` でも知らせる。知らせる内容: 「tf-q3hon の 7 ブランチ（<名前>）はコミット済み・未 push。土台 <BASE> が tf-p0zkq の push 済みの最上段でない／`needs` に <id> が足りない／`e2e` のビルドの行が違う。tf-p0zkq の最上段への並べ直し（`git-spice upstack onto`）、各ブランチの `checks` の `needs` の整合、`e2e` の行と `README.md` の手順の合わせ直しを行い、並べ直した後の各ブランチで共通 B と道具ごとの確かめをやり直してから、この bead を開き直す必要がある」
  3. assignee を外し（`gc bd update <TASK_BEAD_ID> --assignee ""`）、`gc runtime drain-ack` で終える

  開き直された後は、この Step 8 から確かめ直す。

- [ ] **Step 9: 終わりの記録（共通 F）**

## Non-Goals

- PnP への切り替え・Yarn の版上げ（4.4.0 のまま）
- CodeQL・Semgrep・Dependency Review・code-review-graph（別の部分 tf-c7ibz）、tascon-backend の Mutant
- ブランチ保護の必須のチェックの登録変更（人がリポジトリの設定で行う）
- カバレッジ・変異スコアのしきい値、Stryker の増分モード
- 既存のコードへの網羅的なテスト（各道具が動くことを示す最小のテストだけ）
- `@testing-library/user-event`・`@testing-library/jest-dom`・`@vitejs/plugin-react` など依頼にない補助の道具
- devcontainer の定義の変更（Playwright のブラウザ・システムのパッケージを入れない）
- Playwright の複数ブラウザ、CI のレポートのアップロード、ブラウザ・依存のキャッシュ（tf-in9ab の範囲）
- `package.json` へのテスト用の `scripts` の追加
- この build の中での PR の作成（`open_pr=false`）。lifecycle の段（plan-review・decompose・item の準備・review・finalize・publish）と、土台が最終でなかったときの並べ直しは `### Task N` にしていない（Task はブランチの作成・切り替え・push をしない）

## Validation and Acceptance

### Coverage

| ID | Status | 実装する Task と確かめ方 |
| --- | --- | --- |
| REQ-001 | covered | Task 1〜7 で 1 ブランチ 1 道具に作り（各 Task の Step 1 で親を確かめる）、Task 7 Step 8 で `$BASE` の上の一直線の並びを確かめる。最終の並びは finalize の段も確かめる |
| REQ-002 | covered | Task 1 Step 2〜4（記録・索引・`.yarnrc.yml` のコメントだけの差分） |
| REQ-003 | covered | Task 2〜7 の共通 A（版の一致と `yarn install --immutable`） |
| REQ-004 | covered | Task 2〜5 のテストと `yarn vitest run --coverage`（Task 5 以降の共通 B の Step） |
| REQ-005 | covered | Task 6 Step 5、Task 7 Step 8（`e2e` のビルドの行が `build` ジョブと同じ） |
| REQ-006 | covered | Task 7 Step 4 |
| REQ-007 | covered | Task 2・5・6・7 のジョブ、共通 C、Task 7 Step 8（7 本すべての `needs`） |
| REQ-008 | covered | Task 2 Step 9〜10（`lefthook run --file` の 4 例）。実際の push での pre-push は publish の段で走る |
| REQ-009 | covered | Task 2 Step 11〜13、Task 5 Step 5、Task 6 Step 7、Task 7 Step 5、markdownlint |
| REQ-010 | covered | 各 Task の共通 B（各ブランチの最終の中身。並べ直しが要った場合はその後にやり直す。仮定 1） |
| REQ-011 | deferred | PR を作った後に各 PR の CI で `checks` を確かめる（`open_pr=false`） |

### 確かめの一覧（Testing Expectations との対応）

- `yarn install --immutable`・biome・knip・`next typegen && tsc --noEmit`・`lint-jsx`・markdownlint: 各 Task の共通 B
- `yarn vitest run`（Task 2〜4）・`yarn vitest run --coverage`（Task 5 以降）: 各 Task
- `vitest related` が 1 ファイルだけ走らせる・lefthook の pre-push: Task 2 Step 5・10（実際の push では publish の段で走る）
- R4 の最後の例（ハンドラのない URL で落ちる）: Task 4 Step 5 で一度だけ
- E2E: Task 6 Step 5（devcontainer で動かせなければ bead に書き、CI で確かめる）、Task 7 Step 8（`e2e` のビルドの行）
- Stryker: Task 7 Step 4
- `static-checks.yml` の YAML と `checks` の `needs`: 共通 C、Task 7 Step 8
- 各テストが対象を本当に見ていること: Task 2 Step 4・Task 3 Step 3・Task 4 Step 5・Task 6 Step 5・Task 7 Step 4 で一時的に壊して落ちることを確かめ、戻す

### Risks

- Task 1 の準備の時点で tf-p0zkq がまだ push されていないと、7 本は `chore/lefthook-safe-autofix-and-typecheck` の上に作られ、`needs` も足せない（仮定 1・2）。Task 7 Step 8 が publish の前に止め、mayor に並べ直しを頼む。下の build（tf-rrr6j・tf-p0zkq）が `static-checks.yml` と `static-checks-in-pr-ci.md` を変えるため、並べ直しでは衝突しうる。朝（日本時間 07:00）の期限に間に合わない場合は、進んだ段までが bead ノートに残る
- 準備の段がブランチ名を計画の案と違う名前にしうる。各 Task は共通 E で実際の名前を読み、以降の手順で読み替える
- `^` の範囲がより新しい版に解決されうる。共通 A で確かめ、`yarn set resolution` で固定する
- `.yarn/cache` に依存の zip が大量に増え、差分が大きくなる（追跡対象のため避けられない）
- devcontainer に Chromium の共有ライブラリが無い場合、手元で E2E を確かめられない。CI の結果で確かめる
- Stryker の時間（CI）は PR を作るまで分からない。手元の時間を記録し、目安 15 分を超えたら mayor に知らせる
- Knip が新しい依存を未使用と判定しうる。共通 B の判断の手順で扱い、除外を足したら理由を PR 本文に写せるよう bead ノートに書く

## Decision Log

- 2026-11-19: plan-review で計画を承認。正式な plan/spec を保存する方針を採用。保存しない旨の旧記述はこの決定で変更。出典: /home/node/tascon-frontend/.gc-artifacts/frontend-test-tools/requirements.md, /home/node/tascon-frontend/.gc-artifacts/frontend-test-tools/brainstorming/design.md, /home/node/tascon-frontend/.gc-artifacts/frontend-test-tools/implementation-plan.md。

## Progress

- plan-review 承認済み。実装前。
