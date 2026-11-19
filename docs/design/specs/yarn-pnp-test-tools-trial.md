# Design candidate: yarn の PnP と Vitest・Playwright・Stryker の相性の試し（tascon-frontend）

- root bead: tf-30mw（superpowers-build）/ target: tf-ddw4（HQ 依頼 gc-vjh8 の 3/4）
- brainstorm bead: tf-83q9（attempt 1, iteration 1）
- approval mode: autonomous
- approval status: **承認済み（autonomous、approval bead tf-mamp、2026-11-19）**。自律承認の根拠は末尾に記録

## Superpowers checklist（1–5）の状態

1. project context inspected: 済。下の「調べた事実」に記録
2. visual questions ahead?: なし。試しの手順と報告文書の設計で、画面や図で比べる問いがない → Visual Companion は提示しない
3. clarifying questions: 設計を決めるのに人の答えが要る問いはない。解釈を選んだ点（「コンテナ」の意味、試す範囲）は「前提として置いたこと」に記録
4. approaches: 3 案を比較し推奨を決定
5. design sections: 下記「設計」に記録

## 求められている成果（Requested outcome）

1. yarn の PnP（Plug'n'Play）と Vitest・Playwright・Stryker の相性を、使い捨ての環境（`node_modules` のない新しい取り出しとコンテナ）で試す
2. 結果（版、通ったこと、回避策）を報告する
3. 今夜は PR を出すところまで

## 制約（Constraints）

- 本体の設定（`.yarnrc.yml` の `nodeLinker: node-modules`）は変えない。`package.json`・`yarn.lock`・`.yarn/cache` にも試しの道具を入れない
- 同じ依頼の他の部分（ライセンスの洗い出し、静的な確かめの CI、lefthook）とは独立。互いを待たない
- リポジトリのルール・スキルに従う（`git-spice-workflow`: PR は英語・テンプレート使用、Conventional Commits、コミット body 必須。Markdown は markdownlint の pre-commit を通す）

## 対象外（Non-goals）

- PnP への切り替え、Vitest・Playwright・Stryker の導入（どちらも別の作業。今回は試しと報告のみ）
- PnP に切り替えるかどうかの決定と、その `docs/decisions/` への記録（決定は道具を入れる PR で行う。依頼の「決めた理由はその道具を入れる PR の中で」に従う）
- 既存の道具（Biome・Knip・markuplint・lefthook・エディタの SDK）の PnP での動作の網羅的な確認。Playwright の試しに要る `next build` / `next start` だけは前提として確かめる
- 試しを作り直すスクリプトや CI の追加（一回きりの試し。手順と設定は報告に書く）
- x64・macOS での試し（この環境は aarch64 の Linux のみ。違いは報告に限界として書く）

## 調べた事実（project context、2026-11-19、`main` の `ffa7ffcc`）

### yarn と PnP の経緯

- Yarn 4.4.0（`yarnPath: .yarn/releases/yarn-4.4.0.cjs`）、`enableGlobalCache: false`、`compressionLevel: mixed`、`.yarn/cache` はコミット済み
- `.yarnrc.yml` の `nodeLinker: node-modules` には「TEMP: Avoid errors in ESLint and Prettier VSCode extensions.」の注記（`f051b680`、2024-08-05、Yarn 3.5.1→4.4.0 の更新時）。それ以前は PnP で、`.pnp.cjs` は `e9ff60ba`（2024-08-04）で削除された。今は ESLint・Prettier を使っておらず Biome に移っている
- PnP の名残: `Dockerfile` の `CMD`（`node -r ./.pnp.cjs $(yarn bin next) dev --turbopack`）、`package.json` の `debug` script（`-r ./.pnp.cjs`）、`knip.json` の `ignoreUnresolved: ["\\.pnp\\.cjs$"]`
- `packageExtensions` に `next-pwa@5.6.0`（`@babel/core`・`webpack`）などの補いがある（PnP の厳密な依存解決で要った物の名残）

### テストの道具

- リポジトリにテストの道具・テストはまだない（`vitest`・`playwright`・`stryker` の記述は追跡対象にない）
- 試す版（公開から 2 週間以上たった最新の安定版、2026-11-19 時点）:
  - `vitest` 5.1.0（2026-11-02。5.1.1 は 2026-11-18 公開で新しすぎる）。engines `node ^22.12.0 || ^24.0.0 || >=26.0.0`、peer に `vite ^6.4.0 || ^7.0.0 || ^8.0.0`
  - `@playwright/test` 1.64.1（2026-10-14。1.65.1 は 2026-11-13 公開で新しすぎる）。engines `node >=20`
  - `@stryker-mutator/core`・`@stryker-mutator/vitest-runner` 10.1.1（2026-10-23）。vitest-runner の peer は `vitest >=2.0.0`
- `tsconfig.json` の `paths` に `@/*` → `./src/*`。`src/utils/` に純粋な関数がある（単体テストと変異テストの対象にできる）

### 試す環境

- この作業環境は devcontainer（`node:22.22.2`、Debian 12 bookworm、aarch64）。`Dockerfile` と同じ Node の版
- コンテナの中から新しいコンテナは作れない（`docker`・`podman` なし）。`sudo` は使える（Playwright のブラウザの依存を `apt` で入れられる）
- npm レジストリへの網はある
- `~/.cache/ms-playwright` はない（ブラウザ未取得）

## 方式の比較（Approach tradeoffs）

### 案 A: リポジトリの外の使い捨ての取り出しで試し、報告 1 ファイル（設定と手順を中に書く）を PR にする（推奨）

- 試し: `main` を作業環境の一時ディレクトリへ新しく取り出し（`node_modules` なし）、その取り出しの中だけで `nodeLinker: pnp` にして道具を足し、試す。終わったら一時ディレクトリごと消す
- PR: `docs/yarn-pnp-test-tools-trial.md`（日本語）1 ファイル。試した設定・テスト・コマンドはコードブロックで報告の中に書く
- 長所: 本体の設定に触れない。報告を読めば同じ試しをやり直せる。追加の仕組みなし
- 短所: 設定は報告の中のコードブロックで、そのまま実行できるファイルではない

### 案 B: 案 A に加え、試しの設定一式とやり直し用のスクリプトをリポジトリに置く

- 長所: やり直しがコマンド 1 つ
- 短所: 使わない設定ファイルがリポジトリに残り、Knip や Biome の対象になる。依頼は一回の試しと報告で、作り直しの仕組みは求められていない（AGENTS.md の「単発利用コードの抽象化禁止」）

### 案 C: PnP に切り替えて道具を入れたブランチで PR を出し、CI で試す（マージしない前提）

- 長所: GitHub の x64 の新しいコンテナで試せる
- 短所: 「本体の設定は変えない」に反するブランチ・PR ができる。マージしない PR が残る。CI がまだない（静的な確かめの CI は別作業で並行中）

**推奨: 案 A**。制約（本体を変えない）を確実に守り、依頼の成果（版・通ったこと・回避策の報告）を最小の構成で満たす。

## 設計（Recommended design）

### 1. 使い捨ての環境

- 取り出し: `git clone --no-hardlinks`（または `git archive main` の展開）で `main` の基準コミットを、OS の一時ディレクトリ（リポジトリと worktree の外）に新しく作る。`node_modules`・`.pnp.cjs` がないことを確かめてから始める
- 隔離: その一時ディレクトリの中に専用の `HOME` を作り、`HOME`・`YARN_GLOBAL_FOLDER`・`PLAYWRIGHT_BROWSERS_PATH` をそこへ向けて実行する（作業環境の利用者の yarn・Playwright のキャッシュや設定を使わない、汚さない）。`enableGlobalCache: false` のため依存の zip は取り出しの中の `.yarn/cache` に入る
- コンテナ: この devcontainer（`node:22.22.2`、Debian 12、aarch64）の中で行う。新しいコンテナは作れないため、上の「新しい取り出し＋専用の `HOME`」で、使い捨てのコンテナに近い条件を作る。この点を報告の「環境」と「限界」に書く
- 後片付け: 試しが終わったら一時ディレクトリを消す。Playwright のブラウザの依存を `sudo` で入れた場合は、入れたパッケージ名を報告に書く（devcontainer は作り直せば元に戻る）

### 2. 試しの段取り（すべて取り出しの中で）

0. **PnP への切り替えと前提の確かめ**: `.yarnrc.yml` を `nodeLinker: pnp` にして `yarn install`。`yarn build`（`next build`）と `yarn start`（`next start`）が動くか確かめる（Playwright の前提）。動かなければ回避策を試し、結果を書く
1. **Vitest**（`vitest@5.1.0`）:
   - `src/utils/` の純粋な関数 1 つに単体テストを 1 つ書き、`yarn vitest run` で通るか
   - React のコンポーネント 1 つを `jsdom` と `@testing-library/react` で描画するテストを 1 つ書き、通るか（`@/` の別名の解決、React の JSX 変換を含む）
   - `yarn vitest related <ファイル> --run` が動くか（依頼の 5 で後に pre-push に入れる予定のため）
2. **Playwright**（`@playwright/test@1.64.1`）:
   - `yarn playwright install --with-deps chromium` でブラウザを取れるか
   - `webServer` で `yarn start` を立て、バックエンドの API なしで表示できるページ（ログインの画面、なければ 404 のページ）を開いて見出しを確かめる E2E を 1 つ書き、`yarn playwright test` で通るか
3. **Stryker**（`@stryker-mutator/core@10.1.1`・`@stryker-mutator/vitest-runner@10.1.1`）:
   - 1. の単体テストの対象ファイルだけを `mutate` にして `yarn stryker run` が最後まで走り、変異のスコアが出るか
4. **比べるための試し（失敗したときのみ）**: PnP で失敗した道具は、別の新しい取り出しで `nodeLinker: node-modules` のまま同じ試しを行い、失敗が PnP によるものかを切り分ける

- 道具の版は上の固定の版を `yarn add -D <名前>@<版>` で入れる（範囲指定でなく正確な版）。補助のパッケージ（`jsdom`、`@testing-library/react`、`@vitejs/plugin-react` など）が要れば、同じく公開から 2 週間以上たった版を選び、版を報告に書く
- 失敗したとき: エラーの要点を控え、回避策（`packageExtensions` での依存の補い、`dependenciesMeta` の `unplugged`、`pnpMode: loose`、`yarn dlx`、設定での `--require .pnp.cjs` など）を順に試す。試した回避策は効いた・効かなかったの両方を書く。1 つの道具の回避策の試しは、効く物が見つかるか、上の候補を試し終えたところで止める

### 3. 報告 `docs/yarn-pnp-test-tools-trial.md`（日本語）の構成

1. 冒頭: 試した日付、基準コミット（`main` の SHA）、目的（PnP と 3 つの道具の相性を、本体の設定を変えずに確かめる）、本体の設定は変えていない旨
2. 結論の要約: 道具ごとに「そのまま通った／回避策で通った／通らなかった」の 1 行と、要る回避策の一覧
3. 環境: Node・Yarn の版、OS・CPU（aarch64）、devcontainer の中で行ったこと、使い捨ての取り出しと専用の `HOME` での隔離の方法
4. 版: 試した道具と補助のパッケージの正確な版
5. 道具ごとの結果: 試したこと（コマンド）、結果（通った／失敗）、失敗したときのエラーの要点、試した回避策と効いたかどうか、比べるための試し（node-modules）の結果
6. 試した設定とテスト: `.yarnrc.yml` の差分、`vitest.config.*`・`playwright.config.*`・`stryker.config.*`、書いたテストの中身（コードブロック）
7. 限界: aarch64 のみ（CI の x64 や macOS は未確認）、新しいコンテナではなく devcontainer の中の隔離、各道具は最小の例で試したこと
8. 次に決めること: PnP に切り替えるかどうかは、道具を入れる作業の中で決め `docs/decisions/` に残す旨（依頼のとおり）

### 4. 変更するファイル

- `docs/yarn-pnp-test-tools-trial.md`（新規）のみ。`.yarnrc.yml`・`package.json`・`yarn.lock`・`.yarn/cache`・`Dockerfile`・`knip.json` は変えない
- `docs/decisions/` には入れない（決定ではなく、ある時点の試しの結果のため）

### 5. コミット・PR

- `git-spice-workflow` に従い、作業用の worktree でブランチ・コミット（`docs:`、body 付き）・PR（英語・テンプレート）。PR は 1 本
- PR 本文の Summary に、道具ごとの結論（通った／回避策で通った／通らなかった）を書く
- Related Documents は今のテンプレートの記法に従い、対応する plan・spec がなければ N/A

## 受け入れ基準（Acceptance criteria）

1. `docs/yarn-pnp-test-tools-trial.md` があり、試した日付、基準コミットの SHA、本体の設定を変えていない旨が書かれている
2. 環境の節に、Node・Yarn の版、OS・CPU、使い捨ての取り出しと隔離の方法、devcontainer の中で行ったことが書かれている
3. Vitest・Playwright・Stryker のそれぞれについて、試した正確な版、コマンド、結果（通った／回避策で通った／通らなかった）が書かれている。補助のパッケージの版も書かれている
4. 失敗した物には、エラーの要点、試した回避策とその結果、node-modules での比べる試しの結果が書かれている
5. 前提の確かめ（PnP での `yarn install`・`next build`・`next start`）の結果が書かれている
6. 試した設定とテストの中身がコードブロックで書かれ、報告だけで同じ試しをやり直せる
7. 限界（aarch64 のみ、コンテナの扱い、最小の例）と、PnP に切り替えるかの決定はこの PR でしない旨が書かれている
8. `docs/yarn-pnp-test-tools-trial.md` 以外のファイルが変わっていない（`.yarnrc.yml`・`package.json`・`yarn.lock`・`.yarn/cache` を含む）。試しの一時ディレクトリが消されている
9. markdownlint が通る。PR が英語でテンプレートに沿い、Summary に道具ごとの結論がある

## 前提として置いたこと（Assumptions）

- 「使い捨ての環境（node_modules の無い新しい取り出しとコンテナ）」は、コンテナ（この devcontainer）の中で、`node_modules` のない新しい取り出しを作って試すことと解釈する。コンテナの中から新しいコンテナは作れないため、専用の `HOME` などで利用者の設定・キャッシュから切り離す。この解釈と限界を報告に書く
- 試す範囲は、各道具が「この Next.js 16 のアプリで最小の典型的な使い方をして動くか」とする（Vitest: 純粋な関数と React コンポーネント、`vitest related`。Playwright: 本番ビルドを立てて 1 ページ。Stryker: Vitest の上で 1 ファイル）
- 版は公開から 2 週間以上たった最新の安定版にする（新しすぎる版での一時的な不具合を避ける）
- 報告の置き場所は `docs/yarn-pnp-test-tools-trial.md`、日本語（`docs/` の文書と依頼の言語に合わせる）。PR 本文は英語（リポジトリのルール）
- 失敗した道具だけ node-modules で比べる（全部を二重に試すのは、成功した物については情報が増えないため）

## 未解決の問い（Unresolved questions）

- 設計を決めるための人への問いはない
- 試しの結果として報告に書く事項（設計の問いではない）: x64・macOS での動作、新しいコンテナでの動作（どちらも今回の環境では確かめられない）

## 自律承認の根拠（Autonomous approval basis）

- 依頼本文が、試す物（PnP と Vitest・Playwright・Stryker）、環境（`node_modules` のない新しい取り出しとコンテナ）、報告の中身（版・通ったこと・回避策）、制約（本体の設定を変えない）、到達点（PR まで）を明示している
- 残る選択（試しの範囲、版、置き場所、コンテナの扱い）は、リポジトリの状態（テストの道具がない、PnP の経緯）と、作業環境で確かめた事実（docker なし、sudo あり、aarch64、npm の版と公開日）で決まり、「前提として置いたこと」に記録した
- 推奨案以外を選ぶ理由になる人の好み・外部制約は見つからなかった
- この候補の承認判定（verdict）は design approval lane が行う
