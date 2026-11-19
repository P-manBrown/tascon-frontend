# frontend-test-tools specification

## Approved requirements

## 要件: テストの道具（Vitest・React Testing Library・MSW・V8 coverage・Playwright・Stryker）を入れる（tascon-frontend）

- workflow root: tf-q3hon（superpowers-build）／依頼の部分: tf-dj4bc（依頼 gc-xtys の 2）
- 元の設計: `/home/node/tascon-frontend/.gc-artifacts/frontend-test-tools/brainstorming/design.md`（承認済み、autonomous、承認の bead tf-2qkxw、記録は同じディレクトリの `design-approval.md`）
- この要件を書いた bead: tf-3kust（requirements.write-requirements-spec、iteration 1、attempt 1）
- 書いた日: 2026-11-20（日本時間）
- 設計文書の写し: `docs/superpowers/specs/` には置かない。この lane は main checkout で動いており、そこへ書くと人が開いている作業ツリーに追跡外のファイルが残るため、安全に写せない。正本はこのファイルと上の設計の 2 つ（ワークフローの成果物の置き場所 `gc.var.artifact_root` の下）

### Problem Statement

tascon-frontend にはテストの道具が 1 つもなく、テストのファイルもない。依頼 gc-xtys の 2（部分 tf-dj4bc）は、Vitest・React Testing Library・MSW・V8 coverage・Playwright・Stryker を入れ、必須にする確かめをまとめ役のジョブ `checks`（`.github/workflows/static-checks.yml`）の `needs` に入れることを求めている。関心事ごとに PR を分ける。

あわせて、PnP の試し（#947、`docs/yarn-pnp-test-tools-trial.md`）が「この作業の中で決め、`docs/decisions/` に残す」とした「PnP に切り替えるか」を決めて記録する。#947 の結論は、node-modules（Yarn 4.4.0）では `yarn build`（Turbopack）・Vitest・Playwright・Stryker の 4 つとも回避策なしで通り、PnP では Yarn の版上げ・`next build --webpack`・Stryker の `plugins` の明示が要る、というもの。

人の決定を守る:

- 「Vitest の全部のテストは CI だけ（pre-push は関係するテストだけ）が決まった置き場所です。」（mail gc-wisp-1vhmdg）
- 「pre-push に tsc --noEmit を足す（vitest related はテストの道具を入れた後）」（mail gc-wisp-dxo75r）。tsc は #955 で入った。`vitest related` はこの build で足す

### W6H

- Who（誰のため）: tascon-frontend の開発者とレビュアー。変更が既存の振る舞いを壊していないことを、手元（pre-push）と PR の CI で確かめられるようにする
- What（何を）: テストの道具 6 つの導入、各道具が動くことを示す最小のテスト、CI のジョブ（`vitest`・`e2e`・`stryker`）と `checks` の `needs` への追加、pre-push の `vitest related`、node-modules を続ける決定の記録、関係する決定の記録・`ARCHITECTURE.md`・`README.md` の更新
- When（いつ）: 2026-11-20 の朝（日本時間 07:00）までに PR を出せる状態にする（mayor の notes、mail gc-wisp-r8xjh8）。同時に走る build tf-rrr6j（まとめ役 `checks` を入れる 1a〜1c）と tf-p0zkq（CodeQL など）の上に積む
- Where（どこで）: リポジトリ tascon-frontend。スタックの位置は下から … → `docs/yarn-pnp-test-tools-trial`（#947）→ `chore/lefthook-safe-autofix-and-typecheck`（#955）→ tf-rrr6j の 1a → 1b → 1c → tf-p0zkq の枝 → この build の 7 本
- Why（なぜ）: 依頼が求めている。テストがないと、変更の正しさを確かめる手段が型検査・静的解析・ビルドに限られる。PnP の判断は #947 が残した宿題
- Which（どれを選ぶか）: node-modules のまま（PnP にしない）。道具ごとに 7 本の PR。Vitest（カバレッジ付き）・Playwright・Stryker の 3 ジョブとも必須。カバレッジ・変異スコアのしきい値は付けない
- How（どうやって）: `git-spice-workflow` Skill でスタックを作り、道具ごとに設定・最小のテスト・CI・文書を 1 本ずつ足す。版は #947 で確かめた組み合わせを使う

### Constraints

- スタック・ブランチ・PR の操作は `git-spice-workflow` Skill で行う（`gh stack` は使わない）。ブランチ名・Conventional Commits の type は同じ Skill の基準で決める
- 始めは `chore/lefthook-safe-autofix-and-typecheck` から切ってよい。push の前までに tf-p0zkq の最上段（origin に push 済みの先端）の上へ一直線に並べ直す。並べた後の `static-checks.yml` に合わせて自分のジョブを `checks` の `needs` に足し、並べた後の中身で確かめを通す。下の build がまだ push されていないときは、枝分かれのまま push せず `gc mail send mayor` で知らせる
- ワークフローの変数: `push=true`、`open_pr=false`。この build はブランチを push するが、PR は作らない（REQ-011 の扱いを参照）
- CI は検査だけを行い、自動修正しない（`docs/decisions/local-hooks-vs-ci-checks.md`）。`permissions: contents: read` と `pull_request` トリガーを保つ
- 新しい外部の Action は使わない（使う場合は公開から 2 週間以上たったリリースのコミット SHA で固定し、行末にタグを書く。`docs/decisions/static-checks-in-pr-ci.md`）
- `AGENTS.md` の方針: 依頼の範囲外の機能・設定を足さない。既存のスタイルに合わせる
- 決定の記録は `.claude/rules/decisions-maintenance.md` の形式（1 決定 1 ファイル、日本語、Status・Verification Status・Date・Related Files）
- `ARCHITECTURE.md` は `.claude/rules/architecture-md-maintenance.md` に従い、パスでなく名前で書き、150 行程度に保つ
- 依存の版（npm の公開日時を 2026-11-20 に確認、どれも公開から 2 週間以上）。`package.json` には既存に合わせて `^` を付ける
  - `vitest` 5.1.0、`vite` 8.3.5、`jsdom` 30.1.3、`@testing-library/react` 16.3.3、`@testing-library/dom` 10.4.2、`@playwright/test` 1.64.1、`@stryker-mutator/core`・`@stryker-mutator/vitest-runner` 10.1.1（以上は #947 で組み合わせを確かめた版）
  - `@vitest/coverage-v8` 5.1.0（`vitest` と同じ版）、`msw` 3.0.3
  - より新しい版（`@playwright/test` 1.65.0・`jsdom` 31.0.0・`vite` 8.3.6）は #947 で確かめていない組み合わせになるため使わない

### User Stories

- US-1: 開発者として、push する前に、変えた `.ts`・`.tsx` に関係するテストだけが走ってほしい。全部のテストを待たずに、壊したことに早く気づける
- US-2: レビュアーとして、PR の CI で単体テスト・E2E・変異テストが走り、どれかが落ちたら必須のチェック `checks` が落ちてほしい。テストが通らない変更をマージしないで済む
- US-3: レビュアーとして、PR の CI の出力でカバレッジと変異スコアの数値を見たい。しきい値で止めるのでなく、数値を判断の材料にする
- US-4: 開発者として、純粋な関数・React の描画・HTTP を呼ぶコードのテストを、どう書けばよいかの例がリポジトリにほしい
- US-5: 開発者として、手元で E2E を走らせる手順を `README.md` で知りたい
- US-6: 保守する人として、node-modules を続ける理由と、PnP を見直す条件を `docs/decisions/` で読みたい

### Technical Stories

- TS-1: Yarn は 4.4.0・`nodeLinker: node-modules` のまま。`.yarnrc.yml` の先頭の「TEMP: Avoid errors in ESLint and Prettier VSCode extensions.」の 2 行を、node-modules を続ける決定の記録を指すコメントに置き換える（設定値は変えない）
- TS-2: Vitest の設定は `vitest.config.mts`（`tsconfig.json` の `include` に `*.mts` は入らない）。既定の環境は `node`、描画するテストのファイルだけ先頭に `// @vitest-environment jsdom` を書く
- TS-3: 共通の準備は `vitest.setup.ts`（リポジトリ直下）に置き、`test.setupFiles` から読む。RTL の `cleanup`、MSW のサーバーの開始・リセット・終了、`server-only` の差し替えを持つ
- TS-4: `server-only` は `react-server` の条件の外で import すると例外を投げる。`vitest.setup.ts` で `vi.mock("server-only", () => ({}))` とし、全部のテストで空のモジュールに差し替える。`resolve.conditions` に `react-server` を足す方法は React 自体の解決が変わるため使わない
- TS-5: E2E は `next start` で本番のビルドを配る。ビルドのコマンドは、並べ直した時点の `static-checks.yml` の `build` ジョブと同じにする（tf-rrr6j の 1b の後なら `yarn next build --turbopack`）。`next build` に要る環境変数は追跡対象の `.env` にあり、`/login` はバックエンドなしで描画できる
- TS-6: `checks` はワークフローの全ジョブを `needs` で待ち、`toJSON(needs)` と `jq` で判定し、`if: always()` を持つ（tf-rrr6j の 1a）。まとめ役が待てるのは同じワークフローのジョブだけなので、テストのジョブも `static-checks.yml`（ワークフロー名 `Static Checks`）に置く
- TS-7: Knip は Vitest・Playwright・Stryker・MSW の設定を自動で見つけるプラグインを持つ。新しい依存が未使用と判定されたら、不要な依存を入れない・外す方を先に検討し、`ignoreDependencies` 等の除外を足すときは理由を PR に書く

### Accepted Design

承認済みの設計（`design.md` の節 1〜9）の要約。細部は設計を正とする。

- PR 1（docs）: `docs/decisions/keep-node-modules-linker.md` を足す。Context に #947 の結論、Decision に「`nodeLinker: node-modules` を続け、Yarn は 4.4.0 のまま」、Considered Options に「node-modules のまま（採用）」「PnP に切り替え、Yarn 4.18.1・`next build --webpack`・Stryker の `plugins` の回避策を入れる」「決めずに後回し」、Consequences に PnP を見直す条件（Turbopack が PnP で通る、Vitest が PnP を推奨に戻す等）。Related Files は `.yarnrc.yml`。`docs/decisions/index.md` にリンクを足す。TS-1 の `.yarnrc.yml` のコメントの置き換え
- PR 2（Vitest）: 依存 `vitest`・`vite`。`vitest.config.mts`（`resolve.alias` で `@` → `./src`、`test.environment: "node"`、`test.include: ["src/**/*.test.{ts,tsx}"]`）。最小のテスト `src/utils/string-count/count-graphemes.test.ts`（#947 と同じ 3 件）。単体テストは対象のファイルの隣に `*.test.ts(x)` で置く。CI のジョブ `vitest`（表示名 `vitest`、準備は `./.github/actions/setup`、`yarn vitest run`）を `checks` の `needs` に足す。`lefthook.yml` の pre-push に `vitest-related`（`glob: '*.{ts,tsx}'`、`run: yarn vitest related --run --passWithNoTests {push_files}`、`fail_text: 'Read the report above.'`）。`local-hooks-vs-ci-checks.md` の「`vitest related`をpre-pushに加えるかは、テストの道具を導入した後に決める」を「pre-push は関係するテストだけ、全部のテストは CI だけ」に更新し、人の決定（mail gc-wisp-1vhmdg）を Context に書く。`static-checks-in-pr-ci.md` の確かめの一覧に `vitest` を足し、ワークフロー名 `Static Checks` のままテストも置く理由（TS-6）を書き、タイトルを「…テスト・ビルドの確かめは…」に更新して `index.md` のリンクの文も合わせる。`ARCHITECTURE.md` の横断的な仕組みに「テスト」を短く足す
- PR 3（React Testing Library）: 依存 `@testing-library/react`・`@testing-library/dom`・`jsdom`。`vitest.setup.ts` を作り `afterEach(cleanup)`、`test.setupFiles` に足す。最小のテスト `src/components/headings/auth-heading/index.test.tsx`（`// @vitest-environment jsdom`、`getByRole("heading", { level: 1, name: "ログイン" })`）。CI・決定の記録・`ARCHITECTURE.md` は変えない
- PR 4（MSW）: 依存 `msw`。`src/mocks/server.ts` で `setupServer()` を 1 つ作って公開する（共通のハンドラは持たず、各テストが `server.use(...)` で足す）。`vitest.setup.ts` に `beforeAll(() => server.listen({ onUnhandledRequest: "error" }))`・`afterEach(() => server.resetHandlers())`・`afterAll(() => server.close())` と TS-4 の差し替え。最小のテスト `src/utils/api/fetch-data.test.ts`（Example Mapping の R4）。CI は変えない
- PR 5（V8 coverage）: 依存 `@vitest/coverage-v8`。`test.coverage` に `provider: "v8"`・`include: ["src/**/*.{ts,tsx}"]`、しきい値なし。CI の `vitest` ジョブを `yarn vitest run --coverage` にする（ジョブを分けない）。`static-checks-in-pr-ci.md` の `vitest` の行を `--coverage` 付きにし、しきい値を付けないことを書く。`/coverage` は `.gitignore` 済み
- PR 6（Playwright）: 依存 `@playwright/test`。`playwright.config.ts`（`testDir: "./e2e"`、`projects` は chromium だけ、`use.baseURL: "http://127.0.0.1:3000"`、`webServer` は `yarn start`・`url` は `/login`・`reuseExistingServer: !process.env.CI`、`forbidOnly: !!process.env.CI`）。最小のテスト `e2e/login.spec.ts`。E2E は `e2e/` に `*.spec.ts` で置く。`.gitignore` に `/test-results/`・`/playwright-report/`。CI のジョブ `e2e`（表示名 `playwright`、準備 → `yarn playwright install --with-deps chromium` → TS-5 のビルド → `yarn playwright test`）を `checks` の `needs` に足す。`README.md` に手元の手順。`static-checks-in-pr-ci.md` に `e2e` を足し、ビルドの指定を変えるときは `e2e` も合わせることを Consequences に書く。`ARCHITECTURE.md` のテストの項に E2E の置き場所を足す
- PR 7（Stryker）: 依存 `@stryker-mutator/core`・`@stryker-mutator/vitest-runner`。`stryker.config.json`（`$schema` は `./node_modules/@stryker-mutator/core/schema/stryker-schema.json`、`testRunner: "vitest"`、`vitest.configFile: "vitest.config.mts"`、`mutate`・`reporters`・`thresholds` は既定、`plugins` は書かない）。`.gitignore` に `/reports/`・`/.stryker-tmp/`。CI のジョブ `stryker`（表示名 `stryker`、準備 → `yarn stryker run`）を `checks` の `needs` に足す。`static-checks-in-pr-ci.md` に `stryker` を足し、しきい値なし・テストが増えると時間が伸びることを Consequences に書く

### Behavior Requirements

- REQ-001（スタック）: tf-p0zkq の最上段の上に、この build の 7 ブランチが下から「PnP の決定 → Vitest → React Testing Library → MSW → V8 coverage → Playwright → Stryker」の順に一直線に積まれる。各ブランチは 1 つの関心事だけを変え、1 ブランチ 1 PR に対応する
- REQ-002（node-modules の決定）: `docs/decisions/keep-node-modules-linker.md` があり、#947 の材料・検討した 3 つの案・PnP を見直す条件が書かれ、`docs/decisions/index.md` からリンクされている。`.yarnrc.yml` の TEMP コメントがその記録を指すコメントに置き換わり、設定値（`nodeLinker`・`yarnPath` 等）は変わっていない
- REQ-003（依存）: `package.json` の devDependencies に、Constraints の版で 10 個（`vitest`・`vite`・`@testing-library/react`・`@testing-library/dom`・`jsdom`・`msw`・`@vitest/coverage-v8`・`@playwright/test`・`@stryker-mutator/core`・`@stryker-mutator/vitest-runner`）が `^` 付きで入り、`yarn install --immutable` が通る。Yarn は 4.4.0、`nodeLinker` は `node-modules` のまま
- REQ-004（単体テスト）: `yarn vitest run --coverage` が終了コード 0 で終わり、純粋な関数（`countGraphemes`）・jsdom の描画（`AuthHeading`）・MSW を使う `fetchData` のテストが走り、カバレッジの表が出力される
- REQ-005（E2E）: `yarn playwright test` が `/login` の E2E（見出し「ログイン」が見える）を通す
- REQ-006（変異テスト）: `yarn stryker run` が終了コード 0 で終わり、変異スコアを出力する。変異が生き残っても失敗しない（しきい値なし）
- REQ-007（CI）: `static-checks.yml` に `vitest`（`yarn vitest run --coverage`）・`e2e`・`stryker` のジョブがあり、3 つとも `checks` の `needs` に入っている。並べ直した後の `checks` の `needs` が、ワークフローの `checks` 以外の全ジョブの id と一致する
- REQ-008（pre-push）: `lefthook.yml` の pre-push に `vitest-related` があり、push する `.ts`・`.tsx` に関係するテストだけを走らせる。`.ts`・`.tsx` を含まない push では走らない。`.ts`・`.tsx` を消しただけの push が、消したファイルのパスだけを理由に失敗しない。全部のテスト・カバレッジ・Playwright・Stryker は pre-push で走らせない
- REQ-009（文書）: `local-hooks-vs-ci-checks.md`・`static-checks-in-pr-ci.md`（タイトルと `index.md` のリンクの文を含む）が上の変更に合わせて更新されている。`ARCHITECTURE.md` にテストの置き場所（単体は対象の隣の `*.test.*`、E2E は `e2e/`）が名前で書かれている。`README.md` に手元で E2E を走らせる手順がある
- REQ-010（既存の確かめ）: 並べ直した後の中身で、既存の確かめ（`yarn biome ci --error-on-warnings`・`yarn knip`・`yarn next typegen && yarn tsc --noEmit`・`yarn lint-jsx`・`yarn markdownlint-cli2`・`next build`）が通る。新しい `ignoreDependencies` 等の除外を足す場合は、理由を PR に書く（理由のない除外は足さない）
- REQ-011（PR の CI）: 各 PR の CI で `checks` が通る。この build は `open_pr=false` のため PR を作らず、PR を作った後に確かめる（coverage は `deferred`）

### Example Mapping

- R1: 既定のテストの環境は `node`。描画するテストだけ jsdom
  - 例: `count-graphemes.test.ts` は先頭の指定なしで `node` で走る
  - 例: `auth-heading/index.test.tsx` は先頭に `// @vitest-environment jsdom` があり、`getByRole("heading", { level: 1, name: "ログイン" })` で見出しを見つける
- R2: テストのファイルの置き場所で Vitest と Playwright を分ける
  - 例: `src/**/*.test.{ts,tsx}` は Vitest が拾い、Playwright は拾わない
  - 例: `e2e/login.spec.ts` は Playwright が拾い、Vitest の `test.include` に入らない
- R3: `server-only` を import するコードもテストできる
  - 例: `src/utils/api/fetch-data.ts`（`import "server-only"`）を `fetch-data.test.ts` が import しても例外にならない（`vitest.setup.ts` の `vi.mock`）
- R4: `fetchData` は HTTP の結果を型付きの結果に変える（MSW で応答を作る）
  - 例: 200 と JSON の本文 → `data` に本文が入る
  - 例: 204 → `data` が `null`
  - 例: 404 → `HttpError` を返す
  - 例: `HttpResponse.error()`（ネットワークの失敗）→ `NetworkError` を返す
  - 例: ハンドラのない URL への要求 → `onUnhandledRequest: "error"` でテストが落ちる（PR 4 で一度だけ手元で確かめる。この確かめのためのテストは残さない）
- R5: pre-push は push する `.ts`・`.tsx` に関係するテストだけを走らせる
  - 例: `src/utils/string-count/count-graphemes.ts` を含む push → `count-graphemes.test.ts` の 1 ファイルだけが走る
  - 例: `.md` だけの push → `vitest-related` は飛ばされる
  - 例: 関係するテストのない `.ts` だけの push → `--passWithNoTests` で成功する
- R6: しきい値は付けず、壊れたときだけ落とす
  - 例: カバレッジが低くても `vitest` ジョブは落ちない
  - 例: 生き残った変異があっても `stryker` ジョブは落ちない
  - 例: Stryker の最初のテストの実行が落ちる・設定が壊れる → `stryker` が落ち、`checks` が落ちる
- R7: どの必須のジョブが落ちても `checks` が落ちる
  - 例: `e2e` のビルド・サーバーの起動が失敗 → `webServer` の待ち（既定のタイムアウト）で `e2e` が落ち、`checks` が落ちる
  - 例: テストが 1 件落ちる → `vitest`（と、テストの初回実行に失敗する `stryker`）が落ち、`checks` が落ちる

### Acceptance Criteria

1. REQ-001: `gs log short`（`git-spice-workflow` Skill）で、tf-p0zkq の最上段の上に 7 ブランチが REQ-001 の順で一直線に並ぶ。各ブランチの差分が 1 つの道具（PR 1 は決定の記録）だけに関わる
2. REQ-002: `docs/decisions/keep-node-modules-linker.md` が `decisions-maintenance.md` の形式を満たし、`index.md` にリンクがある。`git diff` で `.yarnrc.yml` の変更がコメントの行だけ
3. REQ-003: devDependencies の 10 個の版が Constraints と一致し、`yarn install --immutable` が終了コード 0
4. REQ-004: `yarn vitest run --coverage` が終了コード 0、3 つのテストのファイルが走り、カバレッジの表が出る
5. REQ-005: `yarn next build --turbopack`（並べ直した時点の `build` ジョブと同じコマンド）の後、`yarn playwright test` が終了コード 0
6. REQ-006: `yarn stryker run` が終了コード 0、変異スコアが出力に出る
7. REQ-007: `static-checks.yml` が YAML として読め、`checks` の `needs` が `checks` 以外の全ジョブの id と一致し、`vitest`・`e2e`・`stryker` を含む
8. REQ-008: `.ts` を含む push と含まない push の両方で lefthook の pre-push を実際に通し、R5 の例どおりに動く
9. REQ-009: 3 つの文書と `README.md` の更新が REQ-009 を満たし、`yarn markdownlint-cli2` が通る
10. REQ-010: 既存の確かめが並べ直した後の中身ですべて終了コード 0。除外を足した場合は理由が PR の本文にある
11. REQ-011: PR を作った後、各 PR の CI で `checks` が成功する

| ID | Status | 確かめ方 |
| --- | --- | --- |
| REQ-001 | covered | 受け入れ基準 1 |
| REQ-002 | covered | 受け入れ基準 2 |
| REQ-003 | covered | 受け入れ基準 3 |
| REQ-004 | covered | 受け入れ基準 4 |
| REQ-005 | covered | 受け入れ基準 5 |
| REQ-006 | covered | 受け入れ基準 6 |
| REQ-007 | covered | 受け入れ基準 7 |
| REQ-008 | covered | 受け入れ基準 8 |
| REQ-009 | covered | 受け入れ基準 9 |
| REQ-010 | covered | 受け入れ基準 10 |
| REQ-011 | deferred | 受け入れ基準 11（PR を作った後） |

### Testing Expectations

- 各 PR で、並べ直した後の中身で次を通す（すべて終了コード 0）
  - `yarn install --immutable`
  - `yarn biome ci --error-on-warnings .`（入れ子の worktree があるときは追跡ファイルを渡す）・`yarn knip`・`yarn next typegen && yarn tsc --noEmit`・`yarn lint-jsx`・`yarn markdownlint-cli2`（変えた文書）
  - PR 2〜4: `yarn vitest run`。PR 5 以降: `yarn vitest run --coverage`
  - PR 2: `yarn vitest related --run --passWithNoTests src/utils/string-count/count-graphemes.ts` が 1 ファイルだけ走らせる。lefthook の pre-push を実際に通す（R5）
  - PR 4: R4 の最後の例を一度だけ確かめる
  - PR 6: `yarn next build --turbopack` の後に `yarn playwright test`。devcontainer で `--with-deps` が使えないときは、その旨を bead の notes に書き、CI の結果で確かめる
  - PR 7: `yarn stryker run`
  - `static-checks.yml` を変えた PR: YAML として読めること、`checks` の `needs` が全ジョブと一致すること
- テストは各道具が動くことを示す最小のものだけを足す。既存のコードへの網羅的なテストは足さない

### Risks

- 下の build（tf-rrr6j・tf-p0zkq）が `static-checks.yml` を変えるため、並べ直しで衝突しうる。並べ直した時点のファイルを読み、`needs` と `build` のコマンドを合わせる。下の build が push されていなければ push せず mayor に知らせる
- Stryker の CI の所要時間はテストが増えると伸びる。今回、目安 15 分を超えたら bead に記録して mayor に知らせる（止めはしない）
- Playwright のブラウザ・システムのパッケージは devcontainer に入っていない。手元で E2E を確かめられない場合は CI の結果で確かめる
- Knip が `@testing-library/dom`・`vite`・Yarn が自動で足す型の依存を未使用と判定しうる（TS-7 で扱う）
- 朝（日本時間 07:00）の期限に対し 7 本の PR は多い。順序（下から）を守って進め、間に合わない場合は進んだ段までを bead に記録する

### Out Of Scope

- PnP への切り替え、Yarn の版上げ（4.4.0 のまま）
- CodeQL・Semgrep・Dependency Review・code-review-graph（別の部分 tf-c7ibz）、tascon-backend の Mutant（別のリポジトリ）
- ブランチ保護の必須のチェックの登録変更（人がリポジトリの設定で行う）
- カバレッジ・変異スコアのしきい値、Stryker の増分モード
- 既存のコードへの網羅的なテストの追加
- `@testing-library/user-event`・`@testing-library/jest-dom`・`@vitejs/plugin-react` など依頼にない補助の道具
- devcontainer への Playwright のブラウザ・システムのパッケージの導入（devcontainer の定義は変えない）
- Playwright の複数ブラウザ、CI でのレポートのアップロード、ブラウザ・依存のキャッシュ（tf-in9ab の保留作業の範囲）
- `package.json` へのテスト用の scripts の追加（既存の CI・lefthook と同じく道具を直接呼ぶ）
- この build の中での PR の作成（`open_pr=false`）

### Open Questions

人の答えが要る問いはない。次は実装で確かめる事実で、扱い方を決めてある:

- lefthook の `{push_files}` が消したファイルを含むときの `vitest related` の挙動。REQ-008 の「消したファイルのパスだけを理由に失敗しない」を満たさない場合は、`lefthook.yml` の該当のコマンドの中で対処し、方法を PR に書く
- Knip が新しい依存を未使用と判定するか（TS-7 と REQ-010 で扱う）
- Stryker の CI の所要時間（Risks で扱う）
- tf-p0zkq の枝が `static-checks.yml` をどう変えたか（並べ直す時点で読み、REQ-007 を満たすように合わせる）
- 前提（bead に記録）: 人の「朝までに PR を出す」（mail gc-wisp-r8xjh8）と、この build の変数 `open_pr=false` は、PR を作る段がこの build の外にあると読み、変数に従う

## Adopted design

## 設計候補: テストの道具（Vitest・React Testing Library・MSW・V8 coverage・Playwright・Stryker）を入れる（tascon-frontend）

- root bead: tf-q3hon（superpowers-build）／依頼の部分: tf-dj4bc（依頼 gc-xtys の 2）
- この候補を書いた bead: tf-fomgo（requirements.brainstorm-design、iteration 1、attempt 1）
- 承認の状態: **承認済み（autonomous、承認の bead tf-2qkxw、記録は design-approval.md）**。下の「autonomous で決めた根拠」に、人の答えを待たずに決めた理由を書いた
- 書いた日: 2026-11-20（日本時間）

### Superpowers チェックリストの記録（項目 1〜5）

1. **プロジェクトの文脈を確かめた**: 済み
   - `main`（`9bfdad89`）と土台ブランチ `origin/chore/lefthook-safe-autofix-and-typecheck`（PR #955、#947 の上）の中身を読んだ: `package.json`・`.yarnrc.yml`・`lefthook.yml`・`.github/workflows/static-checks.yml`・`.github/actions/setup/action.yml`・`knip.json`・`biome.json`・`tsconfig.json`・`.gitignore`・`AGENTS.md`・`ARCHITECTURE.md` の見出し・`.claude/rules/decisions-maintenance.md`・`.claude/rules/architecture-md-maintenance.md`
   - PnP の試しの報告 `docs/yarn-pnp-test-tools-trial.md`（#947）を全部読んだ
   - 決定の記録 `docs/decisions/local-hooks-vs-ci-checks.md`・`docs/decisions/static-checks-in-pr-ci.md`（土台ブランチの版）を読んだ
   - 同時に走る build tf-rrr6j（部分 tf-1jtse、まとめ役 `checks` を入れる 1a〜1c）の設計候補 `.gc-artifacts/ci-checks-aggregator/brainstorming/design.md` を読み、`checks` の形（`needs` 全体を `toJSON(needs)` と `jq` で判定、`if: always()`）と 1b の `yarn next build --turbopack` を確かめた
   - テストの対象の候補 `src/utils/api/fetch-data.ts`（`import "server-only"`、`fetch` を呼ぶ）・`src/utils/string-count/count-graphemes.ts`・`src/components/headings/auth-heading` を確かめた。既存のテストのファイルはない
   - npm の公開日時を確かめた（下の「版」）
2. **見た目の問い**: なし。CI・設定・テストの道具の導入で、画面の見た目を選ぶ問いがない。Visual Companion は申し出ていない
3. **確認の問い**: autonomous のため人には聞いていない。文脈から決めた問いと答えを「確認の問いと答え」に書いた。人の答えが要る問いは残っていない
4. **案と長所・短所・推奨**: 「案の比較」に書いた
5. **推奨の設計を節に分けて示した**: 「設計（推奨案）」に書いた

### 求められている結果

- tascon-frontend に Vitest・React Testing Library・MSW・V8 coverage・Playwright・Stryker を入れる。PnP の試しの結果（#947）を踏まえる
- 必須にする確かめは、まとめ役のジョブ `checks`（`static-checks.yml`）の `needs` に入れる（依頼 gc-wisp-aaqkt4 と同じ形）
- 関心事ごとに PR を分ける
- 人の決定を守る:
  - 「Vitest の全部のテストは CI だけ（pre-push は関係するテストだけ）が決まった置き場所です。」（mail gc-wisp-1vhmdg）
  - 「pre-push に tsc --noEmit を足す（vitest related はテストの道具を入れた後）」（mail gc-wisp-dxo75r）。tsc は #955 で入った。`vitest related` はこの build で足す
- PnP に切り替えるかを、この作業の中で決めて `docs/decisions/` に残す（#947 の報告の「次に決めること」）

### 制約

- スタック・ブランチ・PR の操作は `git-spice-workflow` Skill で行う（`gh stack` は使わない）
- 始めは `chore/lefthook-safe-autofix-and-typecheck` から切ってよい。push の前までに build tf-p0zkq（部分 tf-c7ibz、CodeQL など）の最上段（origin に push 済みの先端）の上へ一直線に並べ直す。並べた後の `static-checks.yml` に合わせて、必須にする確かめを `checks` の `needs` に入れ、並べた後の中身で確かめが通ること。下の build がまだ push されていないときは、枝分かれのまま push せず mayor に知らせる
- 仕上がりの並び（下から）: … → `docs/yarn-pnp-test-tools-trial`（#947）→ `chore/lefthook-safe-autofix-and-typecheck`（#955）→ tf-rrr6j の 1a → 1b → 1c → tf-p0zkq の枝 → この build の枝
- CI は検査だけを行い、自動修正しない（`local-hooks-vs-ci-checks.md`）。`permissions: contents: read`・`pull_request` トリガーを保つ
- 外部の Action を新しく使うときは、公開から 2 週間以上たったリリースのコミット SHA で固定し、行末にタグを書く（`static-checks-in-pr-ci.md`）。この設計では新しい外部の Action を使わない
- `AGENTS.md` の方針: 依頼の範囲外の機能・設定の追加はしない。既存のスタイルに合わせる
- 決定の記録は `.claude/rules/decisions-maintenance.md` の形式（1 決定 1 ファイル、日本語、Status・Verification Status・Date・Related Files）
- `ARCHITECTURE.md` は `.claude/rules/architecture-md-maintenance.md` に従い、パスでなく名前で書き、150 行程度に保つ

### やらないこと（非目標）

- PnP への切り替え（下の決定で node-modules のままにする）。Yarn の版上げ（4.4.0 のまま）
- CodeQL・Semgrep・Dependency Review・code-review-graph（別の部分 tf-c7ibz）。tascon-backend の Mutant（別のリポジトリ）
- ブランチ保護の必須のチェックの登録変更（人がリポジトリの設定で行う。`checks` を登録する前提は tf-rrr6j の側）
- カバレッジ・変異スコアのしきい値（依頼にない。数値を出すだけにする）
- 既存のコードへの網羅的なテストの追加。各道具が動くことを示す最小のテストだけを足す
- `@testing-library/user-event`・`@testing-library/jest-dom`・`@vitejs/plugin-react` など依頼にない補助の道具（試しで JSX の変換は Vitest だけで通った）
- devcontainer への Playwright のブラウザ・システムのパッケージの導入（`--with-deps` はシステム全体を変える。手元で E2E を走らせる手順は書くが、devcontainer の定義は変えない）
- Playwright の複数ブラウザ・CI でのレポートのアップロード・ブラウザのキャッシュ、依存のキャッシュ（tf-in9ab の保留作業の範囲）
- `package.json` へのテスト用の scripts の追加（既存の CI・lefthook は `yarn knip`・`yarn tsc` のように道具を直接呼んでおり、それに合わせる）

### 確かめた事実

- `.yarnrc.yml` は `nodeLinker: node-modules`、`yarnPath` は Yarn 4.4.0。先頭に「TEMP: Avoid errors in ESLint and Prettier VSCode extensions.」というコメントがある（ESLint・Prettier は今は使っておらず Biome に移っている）
- #947 の結論: node-modules（Yarn 4.4.0）では `yarn build`（Turbopack）・Vitest（jsdom の描画テストと `vitest related` を含む）・Playwright・Stryker の 4 つとも回避策なしで通った。PnP では Yarn を 4.18.1 に上げ、`next build` を `--webpack` にし、Stryker に `plugins` を明示する回避策が要った。Turbopack は PnP で通らない。Vitest は起動時に「Using Yarn PnP with Vite is discouraged…」と警告する
- 土台の `lefthook.yml` の pre-push は `knip`・`check-git-clean`・`tsc`（`yarn next typegen && yarn tsc --noEmit`）
- `docs/decisions/local-hooks-vs-ci-checks.md` の Decision に「`vitest related`をpre-pushに加えるかは、テストの道具を導入した後に決める」がある
- `static-checks.yml` は土台では 5 ジョブ（`typecheck`・`biome`・`knip`・`markuplint`・`build`）。tf-rrr6j の 1a で `checks`（`needs` 全体を `jq` で判定）、1b で `build` が `yarn next build --turbopack`、1c で `markdownlint`・`check-logger-trace`・`check-docs` が足される予定。tf-p0zkq の枝の中身はこの候補を書いた時点では未確定
- `next build` に要る環境変数は追跡対象の `.env` にあり、`/login` はバックエンドなしで描画できる（#947 の試しで `200`、見出し「ログイン」）
- `src/utils/api/fetch-data.ts` は `import "server-only"` を持つ。`server-only` は `react-server` の条件の外で import すると例外を投げる
- `.gitignore` は `/coverage` を無視済み。Playwright（`test-results`・`playwright-report`）と Stryker（`reports`・`.stryker-tmp`）の出力は未対応
- `tsconfig.json` の `include` は `**/*.ts`・`**/*.tsx` で、`*.mts` は入らない
- `knip.json` は `ignoreDependencies` を持つ。Knip は Vitest・Playwright・Stryker・MSW の設定を自動で見つけるプラグインを持つ（導入時に `yarn knip` で確かめる）

#### 版（npm の公開日時を 2026-11-20 に確認）

- 試しで組み合わせを確かめた版をそのまま使う。どれも公開から 2 週間以上たっている
  - `vitest` 5.1.0（2026-11-02）、`vite` 8.3.5（2026-10-21）
  - `jsdom` 30.1.3（2026-10-15）
  - `@testing-library/react` 16.3.3（2026-08-27）、`@testing-library/dom` 10.4.2（2026-09-13）
  - `@playwright/test` 1.64.1（2026-10-14）
  - `@stryker-mutator/core`・`@stryker-mutator/vitest-runner` 10.1.1（2026-10-23）
- 試しになかった物は、公開から 2 週間以上たった最新の安定版（基準 2026-11-06）
  - `@vitest/coverage-v8` 5.1.0（2026-11-02。`vitest` と同じ版にそろえる必要がある）
  - `msw` 3.0.3（2026-10-10）
- より新しい版（`@playwright/test` 1.65.0・`jsdom` 31.0.0・`vite` 8.3.6 は 2 週間の条件を満たす）もあるが、#947 で確かめていない組み合わせになるため使わない
- `package.json` の書き方は既存に合わせて `^` を付ける（`yarn.lock` で版が固定される）

### 確認の問いと答え（autonomous のため文脈から決めた）

- Q1: PnP に切り替えるか → **切り替えず node-modules のままにする**。根拠は「autonomous で決めた根拠」
- Q2: どの確かめを必須（`checks` の `needs`）にするか → Vitest（カバレッジ付き）・Playwright・Stryker の 3 ジョブすべて。依頼は「必須にする確かめは needs に入れる」形を求め、土台の基準（tf-cg4pi から引き継ぐ「中身を確かめる物は全部 CI に入れてリポジトリ全体を見る必須のチェックにする」）に合う。カバレッジと Stryker はしきい値を付けないため、道具が壊れたとき・テストが落ちたときだけ失敗する
- Q3: pre-push に何を足すか → `vitest related` だけ（mail gc-wisp-1vhmdg の「pre-push は関係するテストだけ」）。Playwright・Stryker・カバレッジは CI だけ
- Q4: PR の分け方 → 道具ごと（関心事ごと）に 7 本。下の「節 1」
- Q5: jsdom の使い分け → 既定は `node`、描画するテストのファイルだけ先頭に `// @vitest-environment jsdom` を書く（#947 で確かめた形）
- Q6: `server-only` を import するコードのテスト → `vitest.setup.ts` で `vi.mock("server-only", () => ({}))` とし、全部のテストで空のモジュールに差し替える（差し替え先のファイルを増やさない）。`resolve.conditions` に `react-server` を足すと React 自体の解決が変わるため使わない
- Q7: `.yarnrc.yml` の「TEMP」コメント → node-modules を続ける決定と食い違うため、決定の記録を指すコメントに置き換える（PnP の決定の PR に含める）

### autonomous で決めた根拠

- 人の答えを待たずに決められるのは、次の理由で目標と文脈から結果が決まるため
  - 道具の一覧・必須の確かめの形・PR の分け方・pre-push の範囲は、依頼の原文と人の決定（mail gc-wisp-1vhmdg・gc-wisp-dxo75r）が指定している
  - PnP の判断は、#947 の報告が「この作業の中で決め、`docs/decisions/` に残す」とし、材料（Turbopack が PnP で通らない、Yarn を上げる必要がある、Vitest が PnP を推奨しない）を挙げている。node-modules では 4 つとも回避策なしで通り、PnP を選ぶ材料が報告の中にない。PnP への切り替えは Yarn の版上げとビルド方式の変更を伴い、依頼（テストの道具を入れる）の範囲を超える
  - 版は #947 で確かめた組み合わせと、既存の「公開から 2 週間以上」の基準で決まる
- 前提として bead tf-fomgo の notes に書く: PnP は採らない、Stryker とカバレッジはしきい値なしで必須のジョブにする、`.yarnrc.yml` の TEMP コメントを置き換える

### 案の比較

#### PnP にするか（Q1）

- **案 A（推奨）: node-modules のままにし、決定を記録する**
  - 長所: #947 で 4 つとも回避策なしで通った。Turbopack のビルドを続けられる。Yarn・ビルドの設定を変えない
  - 短所: PnP の利点（厳密な依存の解決・install の速さ）は得られない
- 案 B: PnP に切り替え、Yarn 4.18.1・`next build --webpack`・Stryker の `plugins` の回避策を入れる
  - 長所: PnP の利点が得られる
  - 短所: Turbopack を捨てる。Vitest が PnP の不具合をもう積極的に直さない。Biome・Knip・markuplint・lefthook・エディタの SDK の PnP での動作は未確認。テストの道具の導入の範囲を超える
- 案 C: 決めずに後回しにする
  - 短所: #947 の報告がこの作業で決めることを求めている。`.yarnrc.yml` の TEMP コメントが残り続ける

#### PR の分け方（Q4）

- **案 A（推奨）: 道具ごとに 7 本（PnP の決定 → Vitest → React Testing Library → MSW → V8 coverage → Playwright → Stryker）**
  - 長所: 依頼の「関心事ごとに PR を分ける」に合う。各 PR が 1 つの道具の設定・最小のテスト・CI の変更・決定の記録の更新だけを持ち、読みやすい。後の道具は前の道具に依存する順に並ぶ
  - 短所: PR の本数が多く、`static-checks.yml` と決定の記録を複数の PR が順に触る
- 案 B: 単体テスト（Vitest・RTL・MSW・coverage）で 1 本、E2E で 1 本、変異テストで 1 本の 3 本
  - 長所: 本数が少ない
  - 短所: 1 本に 4 つの道具が混ざり、関心事ごとの分割にならない
- 案 C: すべてを 1 本
  - 短所: 依頼に反する

#### Stryker を CI でどう走らせるか（Q2）

- **案 A（推奨）: `static-checks.yml` のジョブにし、`checks` の `needs` に入れる。しきい値なし、`mutate` は既定（`src` の全ファイル）**
  - 長所: 依頼の「必須にする確かめは needs に入れる」の形。設定が壊れたら PR で気づく。`vitest-runner` は `perTest` のカバレッジ分析を使うため、テストに覆われない変異は走らせず、今の時間は短い
  - 短所: テストが増えるにつれ PR ごとの時間が伸びる（増分モード等は今は入れない）
- 案 B: CI に入れず、手元で走らせる道具にする
  - 短所: 壊れても気づかない。依頼の形に合わない
- 案 C: 別のワークフローで、必須にしない
  - 短所: まとめ役が待てるのは同じワークフローのジョブだけで、必須にできない

#### `vitest related` の pre-push の書き方（Q3）

- **案 A（推奨）: lefthook の `{push_files}` を `glob: '*.{ts,tsx}'` で絞り、`yarn vitest related --run --passWithNoTests {push_files}`**
  - 長所: push する変更に関係するテストだけが走る。対象のファイルがなければ lefthook がコマンドを飛ばす
  - 短所: `{push_files}` の中身（消したファイル等）の扱いを導入時に確かめる必要がある
- 案 B: `git diff --name-only @{push}...HEAD` を自前で組む
  - 短所: 上流のない新しいブランチで壊れやすく、lefthook の機能と重複する

### 設計（推奨案）

#### 節 1: スタックの形

この build の 7 本は、tf-p0zkq の最上段の上に下から次の順で積む（各 1 ブランチ・1 PR）。ブランチ名・Conventional Commits の type は `git-spice-workflow` Skill の基準で決める。

1. PnP の決定（docs）
2. Vitest
3. React Testing Library
4. MSW
5. V8 coverage
6. Playwright
7. Stryker

始めは `chore/lefthook-safe-autofix-and-typecheck` の上で作ってよい。push の前に tf-p0zkq の push 済みの先端の上に並べ直し、その時点の `static-checks.yml` の `checks` の `needs` に自分のジョブを足し、並べた後の中身で手元の確かめ（節 9）を通す。下の build がまだ push されていなければ push せず mayor に知らせる。

#### 節 2: PR 1 — node-modules を続ける決定

- `docs/decisions/` に新しい記録 `keep-node-modules-linker.md` を足す。Context に #947 の結論、Decision に「`nodeLinker: node-modules` を続け、Yarn は 4.4.0 のまま」、Considered Options に上の案 A〜C、Consequences に「PnP を見直す条件（Turbopack が PnP で通る、Vitest が PnP を推奨に戻す等）」を書く。Related Files は `.yarnrc.yml`
- `docs/decisions/index.md` にリンクを足す
- `.yarnrc.yml` の先頭の「TEMP: …」の 2 行を、この決定の記録を指すコメントに置き換える。設定値は変えない

#### 節 3: PR 2 — Vitest

- 依存: `vitest`・`vite`（devDependencies）
- `vitest.config.mts`: `resolve.alias` で `@` → `./src`、`test.environment: "node"`、`test.include: ["src/**/*.test.{ts,tsx}"]`（#947 の形）
- 最小のテスト: `src/utils/string-count/count-graphemes.test.ts`（#947 と同じ 3 件）。テストは対象のファイルの隣に `*.test.ts(x)` で置く
- CI: `static-checks.yml` にジョブ `vitest`（表示名 `vitest`）。準備は `./.github/actions/setup`、`yarn vitest run`。`checks` の `needs` に足す
- pre-push: `lefthook.yml` に `vitest-related`（`glob: '*.{ts,tsx}'`、`run: yarn vitest related --run --passWithNoTests {push_files}`、`fail_text: 'Read the report above.'`）
- 決定の記録:
  - `local-hooks-vs-ci-checks.md`: 「`vitest related`をpre-pushに加えるかは、テストの道具を導入した後に決める」を、pre-push で関係するテストだけを走らせ、全部のテストは CI だけ、に更新（人の決定 mail gc-wisp-1vhmdg を Context に書く）
  - `static-checks-in-pr-ci.md`: Decision の確かめの一覧に `vitest` を足す。ワークフロー名 `Static Checks` のままテストも置く理由（`checks` が待てるのは同じワークフローのジョブだけ）を Context か Consequences に書く。タイトルを「…テスト・ビルドの確かめは…」に更新し、`index.md` のリンクの文も合わせる
- `ARCHITECTURE.md`: 横断的な仕組みに「テスト」を短く足す（単体テストは対象の隣の `*.test.*`、Vitest で走らせる）。以後の PR で E2E の置き場所を足す

#### 節 4: PR 3 — React Testing Library

- 依存: `@testing-library/react`・`@testing-library/dom`・`jsdom`
- `vitest.setup.ts`（リポジトリ直下）を作り、`afterEach(cleanup)` を置く。`vitest.config.mts` の `test.setupFiles` に足す
- 最小のテスト: `src/components/headings/auth-heading/index.test.tsx`（先頭に `// @vitest-environment jsdom`、`getByRole("heading", { level: 1, name: "ログイン" })`）
- CI の変更はない（`vitest` ジョブが新しいテストも走らせる）
- 決定の記録・`ARCHITECTURE.md` の変更はない

#### 節 5: PR 4 — MSW

- 依存: `msw`
- `src/mocks/server.ts`: `setupServer()` を 1 つ作って公開する（共通のハンドラは今は持たない。各テストが `server.use(...)` で足す）
- `vitest.setup.ts`: `beforeAll(() => server.listen({ onUnhandledRequest: "error" }))`・`afterEach(() => server.resetHandlers())`・`afterAll(() => server.close())`
- `vitest.setup.ts`: `vi.mock("server-only", () => ({}))` を足す（Q6）
- 最小のテスト: `src/utils/api/fetch-data.test.ts`。200 の JSON → `data` を返す、204 → `data` が `null`、404 → `HttpError` を返す、ネットワークの失敗（`HttpResponse.error()`）→ `NetworkError` を返す
- CI の変更はない

#### 節 6: PR 5 — V8 coverage

- 依存: `@vitest/coverage-v8`（`vitest` と同じ版）
- `vitest.config.mts`: `test.coverage` に `provider: "v8"`・`include: ["src/**/*.{ts,tsx}"]`。しきい値は付けない
- CI: `vitest` ジョブを `yarn vitest run --coverage` にする（テストを 2 回走らせないため、ジョブを分けない）。出力の表で数値を見る
- 決定の記録: `static-checks-in-pr-ci.md` の `vitest` の行を `--coverage` 付きに更新。しきい値を付けないことを書く
- `/coverage` は `.gitignore` 済み

#### 節 7: PR 6 — Playwright

- 依存: `@playwright/test`
- `playwright.config.ts`: `testDir: "./e2e"`、`projects` は chromium だけ、`use.baseURL: "http://127.0.0.1:3000"`、`webServer` は `yarn start`（`url` は `/login`、`reuseExistingServer: !process.env.CI`）、`forbidOnly: !!process.env.CI`
- 最小のテスト: `e2e/login.spec.ts`（`/login` の見出し「ログイン」が見える）。E2E は `e2e/` に `*.spec.ts` で置き、Vitest の `*.test.*` と分ける
- `.gitignore`: `/test-results/`・`/playwright-report/` を足す
- CI: ジョブ `e2e`（表示名 `playwright`）。準備 → `yarn playwright install --with-deps chromium` → その時点の `build` ジョブと同じビルドのコマンド（1b の後なら `yarn next build --turbopack`）→ `yarn playwright test`。`checks` の `needs` に足す
- 手元で走らせる手順（`yarn next build --turbopack`・`yarn playwright install --with-deps chromium`・`yarn playwright test`、`--with-deps` はシステムのパッケージを入れる）を `README.md` に短く書く
- 決定の記録: `static-checks-in-pr-ci.md` に `e2e` を足す。ビルドの指定を変えるときは `e2e` ジョブも合わせることを Consequences に書く
- `ARCHITECTURE.md` のテストの項に E2E の置き場所を足す

#### 節 8: PR 7 — Stryker

- 依存: `@stryker-mutator/core`・`@stryker-mutator/vitest-runner`
- `stryker.config.json`: `$schema`（`./node_modules/@stryker-mutator/core/schema/stryker-schema.json`）、`testRunner: "vitest"`、`vitest.configFile: "vitest.config.mts"`。`mutate`・`reporters`・`thresholds` は既定のまま（しきい値の `break` は既定で付かない）。node-modules では `plugins` の明示は要らない（#947）
- `.gitignore`: `/reports/`・`/.stryker-tmp/` を足す
- CI: ジョブ `stryker`（表示名 `stryker`）。準備 → `yarn stryker run`。`checks` の `needs` に足す
- 決定の記録: `static-checks-in-pr-ci.md` に `stryker` を足す。しきい値を付けないこと、テストが増えると時間が伸びることを Consequences に書く

#### 節 9: エラー時の挙動と確かめ方（テスト）

- エラー時:
  - テストが落ちる → `vitest`・`e2e`・`stryker` のどれかが失敗し、`checks` が失敗する
  - Stryker の最初のテストの実行が落ちる・設定が壊れる → `stryker` が失敗する。変異が生き残ってもしきい値がないため失敗しない
  - `e2e` のビルド・サーバーの起動が失敗する → `webServer` の待ち（既定のタイムアウト）で失敗する
  - pre-push の `vitest-related` が落ちる → push が止まる。`.ts`・`.tsx` を含まない push では走らない
- 各 PR で手元で確かめること（並べ直した後の中身で、すべて終了コード 0）:
  - `yarn install --immutable`（`yarn.lock` が一致）
  - `yarn biome ci --error-on-warnings .`（入れ子の worktree があるときは追跡ファイルを渡す。memory の `biome_check_fails_with_nested_worktrees`）・`yarn knip`・`yarn next typegen && yarn tsc --noEmit`・`yarn lint-jsx`・`yarn markdownlint-cli2` の対象の文書
  - PR 2 以降: `yarn vitest run`。PR 5 以降は `yarn vitest run --coverage`
  - PR 2: `yarn vitest related --run --passWithNoTests src/utils/string-count/count-graphemes.ts` が 1 ファイルだけ走らせること。lefthook の pre-push を実際に通す（`.ts` を含む push と含まない push）
  - PR 4: `fetch-data.test.ts` のハンドラを外すと `onUnhandledRequest: "error"` で落ちることを一度確かめる
  - PR 6: `yarn next build --turbopack` の後に `yarn playwright test`（devcontainer で `--with-deps` が使えないときは、その旨を bead に書き、CI の結果で確かめる）
  - PR 7: `yarn stryker run` が終了コード 0、変異スコアが表示される
  - `static-checks.yml`: YAML として読めること、`checks` の `needs` がワークフローの全ジョブの id と一致すること
- PR を出した後: CI の `checks` が通ることを確かめる

### 受け入れ基準

1. tf-p0zkq の最上段の上に、この build の 7 ブランチが下から節 1 の順に一直線に積まれ、各ブランチは 1 つの関心事だけを変えている
2. `docs/decisions/` に node-modules を続ける決定の記録があり、#947 の材料・検討した案・見直す条件が書かれ、`index.md` からリンクされている。`.yarnrc.yml` の TEMP コメントがその記録を指すコメントに置き換わり、設定値は変わっていない
3. `package.json` の devDependencies に `vitest`・`vite`・`@testing-library/react`・`@testing-library/dom`・`jsdom`・`msw`・`@vitest/coverage-v8`・`@playwright/test`・`@stryker-mutator/core`・`@stryker-mutator/vitest-runner` が「版」の節の版で入り、`yarn install --immutable` が通る。Yarn は 4.4.0、`nodeLinker` は `node-modules` のまま
4. `yarn vitest run --coverage` が通り、純粋な関数・jsdom の描画・MSW を使う `fetchData` のテストが走り、カバレッジの表が出る
5. `yarn playwright test` が `/login` の E2E を通す
6. `yarn stryker run` が終了コード 0 で変異スコアを出す
7. `static-checks.yml` に `vitest`（`--coverage` 付き）・`e2e`・`stryker` のジョブがあり、3 つとも `checks` の `needs` に入っている。並べ直した後の `needs` がワークフローの全ジョブと一致する
8. `lefthook.yml` の pre-push に `vitest related` があり、push する `.ts`・`.tsx` に関係するテストだけを走らせる。全部のテストは CI だけで走る
9. `local-hooks-vs-ci-checks.md`・`static-checks-in-pr-ci.md` が上の変更に合わせて更新されている。`ARCHITECTURE.md` にテストの置き場所（単体は対象の隣の `*.test.*`、E2E は `e2e/`）が書かれている
10. 既存の確かめ（biome・knip・tsc・markuplint・markdownlint・next build）が、新しい `ignoreDependencies` 等の除外を理由なく足さずに通る
11. 各 PR の CI で `checks` が通る

### 未解決の問い

- 人の答えが要る問いはない
- 実装で確かめて決める事項（設計の判断ではない）:
  - lefthook の `{push_files}` が消したファイルを含むときの `vitest related` の挙動
  - Knip が `@testing-library/dom`・`@types/jsdom`（Yarn が自動で足す場合）・`vite` を未使用と判定するか。判定されたら、不要な依存は入れない・外す方を先に検討し、除外を足すときは理由を PR に書く
  - Stryker の CI の所要時間。極端に長いとき（目安 15 分超）は bead に記録して mayor に知らせる
  - tf-p0zkq の枝が `static-checks.yml` をどう変えたか（並べ直す時点で読む）

### 承認の状態

- 承認済み（autonomous、2026-11-20、承認の bead tf-2qkxw）。承認時の確定は `design-approval.md` に書いた
