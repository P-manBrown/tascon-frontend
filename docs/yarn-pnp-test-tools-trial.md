# yarn の PnP と Vitest・Playwright・Stryker の相性の試し

- 試した日: 2026-11-19（日本時間。開始 05:16、終了 05:24）
- 基準コミット: `main` の `ffa7ffccfc3f59b58f166a9ad8a31b0eaf864dca`
- 目的: 本体を PnP（`nodeLinker: pnp`）に戻してもテストの道具（Vitest・Playwright・Stryker）が動くかを、本体の設定を変えずに確かめる
- 本体の設定は変えていない: `.yarnrc.yml`（`nodeLinker: node-modules`）・`package.json`・`yarn.lock`・`.yarn/cache` はこの試しで変えていない。試しはリポジトリの外の使い捨ての取り出しで行い、終わったあとで消した

## 結論の要約

- 前提の確かめ（`yarn install`・`next build`・`next start`）: 回避策で通った。`yarn install` はそのまま通った。`yarn build`（Turbopack）は通らず、Yarn を 4.4.0 から 4.18.1 に上げて `next build --webpack` にすると通った。`next start` は、この回避策で作ったビルドの後で、追加の回避策なしに通った。根拠: `ANALYZE=true yarn next build --webpack`（終了コード 0）
- Vitest 5.1.0: 回避策で通った。Yarn 4.4.0 では jsdom を使う描画テストが `ERR_REQUIRE_ESM` で落ち、Yarn 4.18.1 に上げると通った。根拠: `yarn vitest run`（`Test Files  2 passed (2)`、`Tests  4 passed (4)`）
- Playwright 1.64.1: 回避策で通った。ブラウザの取得・`webServer`・E2E 自体はそのまま動いたが、前提の `next build` に上の回避策が要った。根拠: `yarn playwright test`（`1 passed`）
- Stryker 10.1.1（vitest-runner）: 回避策で通った。Yarn 4.18.1 に上げたうえで、`stryker.config.json` に `plugins` を明示すると通った。根拠: `yarn stryker run`（変異 4 つ、スコア 75.00、終了コード 0）
- 要る回避策: Yarn を 4.4.0 から 4.18.1 に上げる、`next build` を `--webpack` で走らせる、Stryker の設定に `"plugins": ["@stryker-mutator/vitest-runner"]` を足す
- 区分の意味: そのまま通った＝`nodeLinker: pnp` と道具・補助のパッケージを入れることのほかに設定を足さずに通った。回避策で通った＝回避策、またはそのほかに PnP のために足した設定を入れて通った。通らなかった＝回避策の候補を試し終えても通らなかった
- node-modules（`nodeLinker: node-modules`、Yarn 4.4.0）の取り出しでは、`yarn build`（Turbopack）を含めて 4 つとも回避策なしで通った。上の失敗はすべて PnP によるもの

## 環境

- Node: `v22.22.2`
- Yarn: 既定は `4.4.0`（`yarnPath: .yarn/releases/yarn-4.4.0.cjs`）。回避策の確かめでは `4.18.1`（2026-09-24 公開）に上げた取り出しも使った
- OS・CPU: Debian GNU/Linux 12 (bookworm)（`debian_version` は 12.13）、`aarch64`
- カーネル: `7.0.14-linuxkit`
- devcontainer の中で行ったこと: 新しいコンテナは作れない（`docker`・`podman` がない）ため、devcontainer の中で、新しい取り出しと専用の `HOME` で隔離した
- 取り出しの方法: `git clone --no-hardlinks` で基準コミットを一時ディレクトリへ取り出し、`node_modules`・`.pnp.cjs`・`.pnp.loader.mjs`・`.yarn/unplugged`・`.yarn/install-state.gz` がないことを確かめた
- 隔離の方法: 次の `env.sh` を毎回 `source` してから実行した。専用の `HOME` により、利用者の yarn・corepack・npm・Playwright のキャッシュと設定を使っていない。`enableGlobalCache: false` のため、依存の zip は取り出しの中の `.yarn/cache` に入る。プロキシの変数はネットワークに出るために残し、`localhost`・`127.0.0.1` だけを `NO_PROXY` に足した

```bash
export TRIAL=/tmp/yarn-pnp-trial-tf-30mw
export HOME="$TRIAL/home"
export YARN_GLOBAL_FOLDER="$HOME/.yarn/berry"
export PLAYWRIGHT_BROWSERS_PATH="$HOME/ms-playwright"
unset XDG_CACHE_HOME XDG_CONFIG_HOME XDG_DATA_HOME XDG_STATE_HOME
export NO_PROXY="${NO_PROXY:+$NO_PROXY,}localhost,127.0.0.1"
export no_proxy="$NO_PROXY"
```

- `--with-deps` が `sudo apt-get` で入れたパッケージ: 67 個。フォントと、Chromium の実行に要る共有ライブラリ。専用の `HOME` では隔離できない、システム全体への変更。全パッケージ名:

```text
at-spi2-common
fonts-freefont-ttf
fonts-ipafont-gothic
fonts-liberation
fonts-noto-color-emoji
fonts-tlwg-loma-otf
fonts-unifont
fonts-wqy-zenhei
libasound2
libasound2-data
libatk1.0-0
libatk-bridge2.0-0
libatspi2.0-0
libavahi-client3
libavahi-common3
libavahi-common-data
libcups2
libdbus-1-3
libdrm2
libdrm-amdgpu1
libdrm-common
libdrm-nouveau2
libdrm-radeon1
libfontenc1
libgbm1
libgl1
libgl1-mesa-dri
libglapi-mesa
libglvnd0
libglx0
libglx-mesa0
libllvm15
libnspr4
libnss3
libsensors5
libsensors-config
libunwind8
libwayland-server0
libx11-xcb1
libxaw7
libxcb-dri2-0
libxcb-dri3-0
libxcb-glx0
libxcb-present0
libxcb-randr0
libxcb-sync1
libxcb-xfixes0
libxcomposite1
libxdamage1
libxfixes3
libxfont2
libxi6
libxkbcommon0
libxkbfile1
libxmu6
libxpm4
libxrandr2
libxshmfence1
libxxf86vm1
libz3-4
x11-xkb-utils
xfonts-encodings
xfonts-scalable
xfonts-utils
xkb-data
xserver-common
xvfb
```

- 後片付け: 一時ディレクトリ（比べる試しの取り出しを含む）を消した。Playwright のブラウザは一時ディレクトリの中にだけ入り、利用者の `~/.cache/ms-playwright` はできていない

## 版

- 道具（公開日時）:
  - `vitest` 5.1.0（2026-11-02T16:12:37Z）
  - `@playwright/test` 1.64.1（2026-10-14T11:58:13Z）
  - `@stryker-mutator/core` 10.1.1（2026-10-23T19:18:22Z）
  - `@stryker-mutator/vitest-runner` 10.1.1（2026-10-23T19:18:49Z）
- 補助のパッケージ（公開日時）。版を選んだ規則は、試した日に公開から 2 週間以上たった最新の安定版（基準時刻 2026-11-04T20:20:20Z）:
  - `vite` 8.3.5（2026-10-21T06:38:54Z）。`vitest` 5.1.0 の `vite` の範囲 `^6.4.0 || ^7.0.0 || ^8.0.0` に入る
  - `jsdom` 30.1.3（2026-10-15T09:24:38Z）。`yarn add` が `@types/jsdom` の `^30` も自動で足した
  - `@testing-library/react` 16.3.3（2026-08-27T17:41:18Z）
  - `@testing-library/dom` 10.4.2（2026-09-13T18:08:36Z）。`@testing-library/react` の peer の範囲 `^10.0.0` に入る
  - `@vitejs/plugin-react` 6.2.1（2026-11-02T09:18:16Z）は版を控えただけで、入れていない（JSX の変換は Vitest だけで通ったため）
- 解決された `next` は 16.1.6、`react` は 19.2.4（`yarn.lock` の版）
- 回避策で上げた Yarn は 4.18.1（2026-09-24 公開）

## 道具ごとの結果

### 前提の確かめ（yarn install・next build・next start）

- `yarn install`（`nodeLinker: pnp`、Yarn 4.4.0）: 終了コード 0。`.pnp.cjs` と `.pnp.loader.mjs` ができ、`node_modules` はできない。警告は `YN0086`（peer の不整合）1 件と `YN0068`（`packageExtensions` の `typescript` が不要）2 件。ビルドが要る `@evilmartians/lefthook` と `sharp` の `YN0007` も出た。`YN0002`（peer の不足）は出ていない
- `yarn build`（`ANALYZE=true next build --turbopack`、Yarn 4.4.0）: 終了コード 1。エラーの要点は次のとおり。Turbopack は PnP の下でパッケージを解決できない

```text
Error: Turbopack build failed with 1 errors:
./src/app
Error: Next.js inferred your workspace root, but it may not be correct.
    We couldn't find the Next.js package (next/package.json) from the project directory: /tmp/yarn-pnp-trial-tf-30mw/pnp/src/app
```

- 試した回避策と結果:
  - `.yarnrc.yml` に `pnpMode: loose`: 効かなかった（同じエラー）
  - `NODE_OPTIONS="--require .pnp.cjs"` を付けて `yarn build`: 効かなかった（同じエラー）
  - `package.json` に `dependenciesMeta` で `next` を `unplugged: true`: 効かなかった（同じエラー）
  - `ANALYZE=true yarn next build --webpack`（Yarn 4.4.0）: コンパイルは通ったが、型の確かめで失敗した。`Type error: Cannot find module 'next/dist/lib/metadata/types/metadata-interface.js' or its corresponding type declarations.`。`next/dist/...` に加えて `React`・`react/jsx-runtime` も解決できず、`yarn tsc --noEmit` だけでも 2889 件の `error TS` が出た
  - `--webpack` と `unplugged` の組み合わせ（Yarn 4.4.0）: 効かなかった（同じ型のエラー）
  - 型のエラーの原因: Yarn 4.4.0 が TypeScript に当てる互換パッチ（`optional!builtin<compat/typescript>`）が TypeScript 5.9.3 に当たっていない。パッチ済みの zip の `typescript.js` に `pnpapi` が 0 件だった（パッチが当たっていれば 13 件）
  - `yarn set version 4.18.1`: 効いた。パッチが当たり（`pnpapi` が 13 件）、`yarn tsc --noEmit` は終了コード 0、エラー 0 件。このとき `yarn build`（Turbopack）は同じエラーのまま失敗し、`ANALYZE=true yarn next build --webpack` は終了コード 0 で通った
- 回避策を入れた状態で `yarn start`（`next start`）: 起動し、`/login` は `200`、`<h1 class="text-center font-bold text-3xl mb-7">ログイン</h1>` が出た。存在しないページは `404`。止めたあとはポート 3000 が空いた。ログにバックエンドへの要求の失敗（`ContentTypeError`）が出たが、`/login` の描画には影響しなかった
- node-modules の取り出し（Yarn 4.4.0）: `yarn install`・`yarn build`（Turbopack）とも終了コード 0。失敗は PnP によるもの

### Vitest

- コマンド: `yarn vitest run`、`yarn vitest related src/utils/string-count/count-graphemes.ts --run`
- Yarn 4.18.1 の PnP: `yarn vitest run` は `Test Files  2 passed (2)`、`Tests  4 passed (4)`、終了コード 0。`related` は関連する 1 ファイルだけが走り、`Test Files  1 passed (1)`、`Tests  3 passed (3)`、終了コード 0。起動時に `Using Yarn PnP with Vite is discouraged and PnP-specific bugs will no longer be actively worked on.` という警告が出る（Vitest 側が PnP の不具合をもう積極的には直さないという意味）
- Yarn 4.4.0 の PnP: 純粋な関数のテストは通る（`Tests  3 passed (3)`）が、jsdom を使う描画テストが落ちる。`yarn vitest run` は終了コード 1。エラーの要点:

```text
Error: [vitest-pool]: Failed to start forks worker for test files .../src/components/headings/auth-heading/index.test.tsx.
Caused by: Error: require() of ES Module .../@exodus/bytes/encoding-lite.js from .../html-encoding-sniffer/lib/html-encoding-sniffer.js not supported.
Serialized Error: { code: 'ERR_REQUIRE_ESM' }
```

- 回避策: Yarn を 4.18.1 に上げる。効いた（上のとおり）。ほかの候補（`packageExtensions`・`unplugged`・`pnpMode: loose`・`yarn dlx`・`--require`）は、効く見込みが読めなかったため試していない
- `@/` の別名は `tsconfig.json` の `paths` と同じ対応で、node-modules でも要る通常の設定のため、回避策に数えない。`@vitejs/plugin-react` は JSX の変換が通ったので入れておらず、回避策に数えない
- node-modules の取り出し（Yarn 4.4.0）: `yarn vitest run` は `Test Files  2 passed (2)`、`Tests  4 passed (4)`、`related` も 1 ファイル・3 テストで通った。失敗は PnP と Yarn 4.4.0 の組み合わせによる

### Playwright

- コマンド: `yarn playwright install --with-deps chromium`、`yarn playwright test --reporter=list`
- 結果: `yarn playwright --version` は `Version 1.64.1`。`install --with-deps chromium` は終了コード 0（Chrome Headless Shell 156.0.8078.4 と FFmpeg を `$HOME/ms-playwright` に取得、`apt` で 67 パッケージが入った）。`yarn playwright test` は `1 passed`、終了コード 0
- 開いたページ: `/login`。`next start` の応答が `200` で、見出し「ログイン」が `<h1>` に出たため、404 のページには切り替えていない
- 回避策: Playwright 自体の取得・設定の読み込み・`webServer`（`yarn start`）・E2E に回避策は要らなかった。前提の `next build` に上の回避策（Yarn 4.18.1、`--webpack`）が要るため、全体の区分は「回避策で通った」。Yarn 4.4.0 では前提の `next build` が通らず、Playwright を試せない
- node-modules の取り出し（Yarn 4.4.0）: `yarn build`（Turbopack）のあと `yarn playwright test` は `1 passed`、終了コード 0

### Stryker

- コマンド: `yarn stryker --version`、`yarn stryker run`
- 回避策なし（Yarn 4.18.1、設定は `plugins` なし）: 終了コード 1。エラーの要点は次のとおり。Stryker が `@stryker-mutator/*` のプラグインを探せていない

```text
Could not inject [class ChildProcessTestRunnerWorker]. Cause: Cannot find TestRunner plugin "vitest". In fact, no TestRunner plugins were loaded. Did you forget to install it?
```

- 試した回避策と結果:
  - `"inPlace": true`（砂場を作らず元の場所で変異させる）: 効かなかった（同じエラー）
  - `"plugins": ["@stryker-mutator/vitest-runner"]`（プラグインを名前で明示）: 効いた。`yarn stryker run` は終了コード 0
- 結果: `yarn stryker --version` は `10.1.1`。変異は 4 つで、3 つが killed、1 つが survived、スコアは 75.00。生き残った変異は `new Intl.Segmenter("ja-JP", { granularity: "grapheme" })` の `{ granularity: "grapheme" }` を `{}` に変えた物。`granularity` の既定値が `grapheme` なので、消してもどのテストの結果も変わらない
- Yarn 4.4.0 の PnP（`plugins` ありの設定）: 終了コード 1。`Error: [BABEL]: require() of ES Module .../@babel/plugin-proposal-decorators/lib/index.js from .../@babel/core/lib/config/files/index.js not supported.`。Vitest の jsdom と同じ `ERR_REQUIRE_ESM` で、Yarn 4.18.1 に上げると通る
- node-modules の取り出し（Yarn 4.4.0、設定は `plugins` なし）: `yarn stryker run` は終了コード 0、スコア 75.00。失敗は PnP によるもの

## 試した設定とテスト

回避策を入れた PnP の取り出しの `.yarnrc.yml` の差分（`yarn set version 4.18.1` が全体を整形し直し、コメントを落とし、`approvedGitRepositories`・`enableScripts`・`npmMinimalAgeGate` を足した。`nodeLinker` の書き換えと `yarnPath` 以外は Yarn による自動の変更）:

```diff
--- .yarnrc.yml (main)
+++ .yarnrc.yml (trial)
@@ -1,21 +1,26 @@
-# TEMP: Avoid errors in ESLint and Prettier VSCode extensions.
-#   See https://is.gd/ne40Ud, https://is.gd/nkQqxC
-nodeLinker: node-modules
+approvedGitRepositories:
+  - "**"
 
 compressionLevel: mixed
 
 enableGlobalCache: false
 
+enableScripts: true
+
+nodeLinker: pnp
+
+npmMinimalAgeGate: 0
+
 packageExtensions:
-  next-pwa@5.6.0:
-    dependencies:
-      '@babel/core': ^7.0.0
-      webpack: '>=5.9.0 <6.0.0'
-  '@typescript-eslint/utils@5.62.0':
+  "@typescript-eslint/utils@5.62.0":
     peerDependencies:
-      typescript: '>= 3.7.0-beta'
+      typescript: ">= 3.7.0-beta"
   eslint-plugin-storybook@0.8.0:
     peerDependencies:
-      typescript: '>= 3.7.0-beta'
+      typescript: ">= 3.7.0-beta"
+  next-pwa@5.6.0:
+    dependencies:
+      "@babel/core": ^7.0.0
+      webpack: ">=5.9.0 <6.0.0"
 
-yarnPath: .yarn/releases/yarn-4.4.0.cjs
+yarnPath: .yarn/releases/yarn-4.18.1.cjs
```

`package.json` の差分:

```diff
@@ -51,13 +51,22 @@
     "@evilmartians/lefthook": "^2.0.4",
     "@markuplint/jsx-parser": "^4.7.23",
     "@markuplint/react-spec": "^4.5.23",
+    "@playwright/test": "1.64.1",
+    "@stryker-mutator/core": "10.1.1",
+    "@stryker-mutator/vitest-runner": "10.1.1",
     "@tailwindcss/postcss": "^4.1.17",
+    "@testing-library/dom": "10.4.2",
+    "@testing-library/react": "16.3.3",
+    "@types/jsdom": "^30",
+    "jsdom": "30.1.3",
     "knip": "^6.44.1",
     "markdownlint-cli2": "^0.21.0",
     "markuplint": "^4.14.1",
     "pino-pretty": "^13.1.3",
     "postcss": "^8.5.6",
-    "tailwindcss": "^4.2.1"
+    "tailwindcss": "^4.2.1",
+    "vite": "8.3.5",
+    "vitest": "5.1.0"
   },
-  "packageManager": "yarn@4.4.0"
+  "packageManager": "yarn@4.18.1"
 }
```

`vitest.config.mts`（`package.json` に `"type": "module"` がないため、ESM として読ませるために拡張子で指定した。node-modules でも同じ）:

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

`playwright.config.ts`:

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

`stryker.config.json`（`plugins` の行が PnP のための回避策。`$schema` は `node_modules` の中を指す形が通例だが、PnP では `node_modules` がないため付けていない）:

```json
{
  "testRunner": "vitest",
  "mutate": ["src/utils/string-count/count-graphemes.ts"],
  "reporters": ["clear-text", "progress"],
  "vitest": {
    "configFile": "vitest.config.mts"
  },
  "plugins": ["@stryker-mutator/vitest-runner"]
}
```

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

`src/components/headings/auth-heading/index.test.tsx`:

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

`e2e/login.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("the login page shows its heading without the backend", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: "ログイン" }),
  ).toBeVisible();
});
```

同じ試しをやり直す手順（回避策を入れた形）:

```bash
export TRIAL=/tmp/yarn-pnp-trial-tf-30mw
mkdir -p "$TRIAL/home" && source "$TRIAL/env.sh"   # 上の env.sh を TRIAL の下に保存しておく
git clone --no-hardlinks REPO_PATH "$TRIAL/pnp"
git -C "$TRIAL/pnp" checkout --detach ffa7ffccfc3f59b58f166a9ad8a31b0eaf864dca
cd "$TRIAL/pnp"
sed -i 's/^nodeLinker: node-modules$/nodeLinker: pnp/' .yarnrc.yml
yarn set version 4.18.1   # 回避策。4.4.0 のままだと next build の型の確かめ・jsdom・Stryker が落ちる
yarn install
yarn add -D vitest@5.1.0 vite@8.3.5 jsdom@30.1.3 @testing-library/react@16.3.3 @testing-library/dom@10.4.2
yarn add -D @playwright/test@1.64.1
yarn add -D @stryker-mutator/core@10.1.1 @stryker-mutator/vitest-runner@10.1.1
# 上の設定とテストの 6 ファイルを置く（vitest.config.mts・playwright.config.ts・stryker.config.json・2 つのテスト・e2e/login.spec.ts）
ANALYZE=true yarn next build --webpack   # 回避策。--turbopack は PnP で失敗する
yarn vitest run
yarn vitest related src/utils/string-count/count-graphemes.ts --run
yarn playwright install --with-deps chromium
yarn playwright test --reporter=list
yarn stryker run
```

node-modules の比べる取り出しは、同じ基準コミットを取り出して `nodeLinker` を書き換えず、`yarn set version` もせずに、同じ `yarn add -D` と設定・テスト（`stryker.config.json` は `plugins` なし）で、`yarn build`（Turbopack）から同じコマンドを走らせた。

## 限界

- aarch64 の Linux（Debian 12）でだけ試した。CI の x64 や macOS では確かめていない
- 新しいコンテナではなく、devcontainer の中で、新しい取り出しと専用の `HOME` で隔離して試した。devcontainer にもともと入っているシステムのパッケージ（と `--with-deps` で入れた物）の影響は除けていない
- 各道具は最小の例で試した（Vitest: 純粋な関数 1 つと React のコンポーネント 1 つ、`vitest related`。Playwright: 本番ビルドを立てて 1 ページ。Stryker: Vitest の上で 1 ファイル）。カバレッジ、ブラウザ 1 種類のほか、Biome・Knip・markuplint・lefthook・エディタの SDK の PnP での動作は確かめていない
- 回避策の Yarn 4.18.1 では、`yarn set version` が `.yarnrc.yml` を整形し直した。本体で使うなら `.yarnrc.yml` のコメントの扱いと、`yarn.lock`・`.yarn/releases` の差分が大きくなる点を別に確かめる必要がある
- 回避策のうち、Yarn 4.18.1 に上げる効果は、Yarn 4.4.0 に戻して同じ依存で比べて確かめた。`--webpack` でなく Turbopack を使う場合の PnP は、4.18.1 でも通らなかった
- Vitest が PnP の不具合をもう積極的には直さないと警告している点は、長く PnP を使う場合の危険として残る

## 次に決めること

PnP に切り替えるかはこの文書では決めない。Vitest・Playwright・Stryker を入れる作業の中で決め、`docs/decisions/` に残す。決めるときの材料は、Turbopack のビルドが PnP で通らず `--webpack` が要ること、Yarn を 4.4.0 から上げる必要があること、Vitest が PnP を推奨しなくなったことの 3 つ。
