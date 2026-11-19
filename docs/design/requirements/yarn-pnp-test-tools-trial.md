# Requirements: yarn の PnP と Vitest・Playwright・Stryker の相性の試し（tascon-frontend）

- workflow root: tf-30mw（superpowers-build）
- target: tf-ddw4（HQ 依頼 gc-vjh8 の tascon-frontend の部分、4 つのうちの 3）
- 承認済みの設計: `docs/design/specs/yarn-pnp-test-tools-trial.md`（承認: autonomous、approval bead tf-mamp）
- 設計文書の置き場: 作業中は受け入れ基準 AC-08 が PR の変更を報告 1 ファイルに限っていたため、設計と要件は build の作業用の置き場にだけ置いていた。その後、リポジトリの決まりの置き場（`docs/design/requirements/`・`docs/design/specs/`・`docs/design/plans/active/`）へ文書だけの PR として入れた。AC-08 は試しの PR（報告 1 ファイル）についての基準で、この文書の PR には当てはまらない

## Problem Statement

`tascon-frontend` は今 `.yarnrc.yml` で `nodeLinker: node-modules` を使っている。2024-08 に ESLint・Prettier の VSCode 拡張のエラーを避けるため一時的に PnP から戻したもので（注記「TEMP」）、今は ESLint・Prettier を使っていない。これからテストの道具（Vitest・Playwright・Stryker）を入れる予定があり、その前に「PnP に戻してもこれらの道具が動くか」を知りたい。

この作業では、本体の設定を変えずに、使い捨ての環境で PnP と 3 つの道具の相性を試し、結果（版、通ったこと、回避策）を日本語の報告 1 ファイルにまとめ、PR を 1 本出す。PnP に切り替えるかどうかは決めない。

## W6H

- Who（誰が）: この workflow の実装担当（superpowers.implementer の lane）が試しを行い、報告と PR を作る
- Whom（誰のため）: 後で Vitest・Playwright・Stryker を入れ、PnP に切り替えるかを決める人（その PR の中で決め、`docs/decisions/` に残す）
- What（何を）: PnP で `yarn install`・`next build`・`next start` が動くか、Vitest 5.1.0・`@playwright/test` 1.64.1・`@stryker-mutator/core` と `@stryker-mutator/vitest-runner` 10.1.1 が最小の典型的な使い方で動くか、動かないときにどの回避策が効くか
- When（いつ）: 今夜（2026-11-19）中に PR を出すところまで。同じ依頼のほかの部分（ライセンスの洗い出し、静的な確かめの CI、lefthook）を待たない
- Where（どこで）: この devcontainer（`node:22.22.2`、Debian 12 bookworm、aarch64）の中の、リポジトリと worktree の外の OS の一時ディレクトリ。報告はリポジトリの `docs/yarn-pnp-test-tools-trial.md`
- Why（なぜ）: 本体を PnP に戻す判断と、テストの道具の入れ方の判断に、実際に試した結果を使えるようにするため
- How（どうやって）: `main` の基準コミットを一時ディレクトリへ新しく取り出し、専用の `HOME` などで隔離し、その取り出しの中だけ `nodeLinker: pnp` にして道具を正確な版で入れ、小さなテストを書いて走らせる。失敗した道具だけ `nodeLinker: node-modules` の別の取り出しで同じ試しをして比べる

## User Stories

- US-1: 後でテストの道具を入れる人として、PnP で各道具がそのまま動くか、回避策が要るか、動かないかを道具ごとに 1 行で知りたい。それにより PnP に戻すかを決められる
- US-2: 同じ人として、試した正確な版・コマンド・設定・テストの中身を知りたい。それにより同じ試しを自分でやり直したり、版を上げたときに比べたりできる
- US-3: 同じ人として、試しの限界（aarch64 のみ、新しいコンテナではないこと、最小の例であること）を知りたい。それにより結果をどこまで信じてよいかがわかる
- US-4: リポジトリの持ち主として、この試しで本体の設定・依存・キャッシュが変わらないことを確かめたい

## Technical Stories

- TS-1: 基準コミットの新しい取り出しを OS の一時ディレクトリに作り、`node_modules` と `.pnp.cjs` がないことを確かめる
- TS-2: 取り出しの中に専用の `HOME` を作り、`HOME`・`YARN_GLOBAL_FOLDER`・`PLAYWRIGHT_BROWSERS_PATH` をそこへ向けてすべてのコマンドを走らせる。`enableGlobalCache: false` のため依存の zip は取り出しの中の `.yarn/cache` に入る
- TS-3: 取り出しの `.yarnrc.yml` を `nodeLinker: pnp` にして `yarn install`・`yarn build`・`yarn start` を確かめる
- TS-4: 道具を `yarn add -D <名前>@<正確な版>` で入れ、Vitest・Playwright・Stryker の設定ファイルと小さなテストを取り出しの中に書いて走らせる
- TS-5: 失敗した道具には回避策の候補を順に試し、なお比べるために `nodeLinker: node-modules` の別の新しい取り出しで同じ試しをする
- TS-6: 結果を `docs/yarn-pnp-test-tools-trial.md` に書き、作業用の worktree で `git-spice-workflow` に従ってブランチ・コミット・PR を作る
- TS-7: 試しの一時ディレクトリを消し、`sudo apt` で入れたパッケージがあれば名前を報告に書く

## Behavior Requirements

### REQ-001: 使い捨ての環境と後片付け

- 試しは、`main` の基準コミット（試しを始める時点の `main` の SHA）を `git clone --no-hardlinks` または `git archive` の展開で OS の一時ディレクトリへ新しく取り出したものの中で行う。リポジトリの本体の取り出しと worktree の中では行わない
- 始める前に、取り出しに `node_modules` と `.pnp.cjs` がないことを確かめる
- すべてのコマンドは、取り出しの中に作った専用の `HOME` に `HOME`・`YARN_GLOBAL_FOLDER`・`PLAYWRIGHT_BROWSERS_PATH` を向けて走らせる。作業環境の利用者の yarn・Playwright のキャッシュと設定を読まない、書かない
- 新しいコンテナは作れない（`docker`・`podman` がない）ため、devcontainer の中での上の隔離で代える。この扱いを報告の「環境」と「限界」に書く
- 試しが終わったら一時ディレクトリ（node-modules での比べる試しの取り出しを含む）を消す。`sudo` で devcontainer にシステムのパッケージを入れた場合は、入れたパッケージ名を報告に書く

### REQ-002: PnP での前提の確かめ

- 取り出しの `.yarnrc.yml` だけを `nodeLinker: pnp` にして、`yarn install`、`yarn build`（`next build`）、`yarn start`（`next start`）が動くかを確かめ、結果を報告に書く
- `yarn start` の確かめは、サーバーが立ち上がり、HTTP の要求に応答を返すことで判断する
- どれかが動かない場合は、REQ-006 の回避策を試し、結果を書く。`next build`・`next start` が回避策でも動かない場合、Playwright の試しは「通らなかった（前提が満たせない）」と書く

### REQ-003: Vitest（`vitest@5.1.0`）

- `src/utils/` の純粋な関数 1 つに単体テストを 1 つ書き、`yarn vitest run` で通るかを試す
- React のコンポーネント 1 つを `jsdom` と `@testing-library/react` で描画するテストを 1 つ書き、通るかを試す。このテストは `@/` の別名（`tsconfig.json` の `paths`）の解決と React の JSX の変換を含む
- `yarn vitest related <ファイル> --run` が動くかを試す（後に pre-push で使う予定のため）

### REQ-004: Playwright（`@playwright/test@1.64.1`）

- `yarn playwright install --with-deps chromium` でブラウザとその依存を取れるかを試す（ブラウザは専用の `PLAYWRIGHT_BROWSERS_PATH` に入る）
- `playwright.config.*` の `webServer` で `yarn start` を立て、バックエンドの API なしで表示できるページを開いて見出しを確かめる E2E を 1 つ書き、`yarn playwright test` で通るかを試す
- 開くページは `/login` とする。`/login` がバックエンドなしで表示できない場合は 404 のページに切り替え、切り替えた理由を報告に書く

### REQ-005: Stryker（`@stryker-mutator/core@10.1.1`・`@stryker-mutator/vitest-runner@10.1.1`）

- REQ-003 の単体テストの対象ファイルだけを `mutate` にして `yarn stryker run` が最後まで走り、変異のスコアが出るかを試す

### REQ-006: 失敗したときの回避策と比べる試し

- 道具や前提の確かめが失敗したら、エラーの要点を控え、次の回避策の候補を順に試す: `packageExtensions` での依存の補い、`dependenciesMeta` の `unplugged`、`pnpMode: loose`、`yarn dlx`、設定やコマンドでの `--require .pnp.cjs`。この順は目安で、エラーの内容から明らかに効く候補を先に試してよい
- 1 つの道具の回避策の試しは、効く物が見つかったところ、または上の候補を試し終えたところで止める
- 試した回避策は、効いた物も効かなかった物も報告に書く
- PnP で（回避策を試したうえで）失敗が残った道具、または回避策が要った道具は、別の新しい取り出しで `nodeLinker: node-modules` のまま同じ試しを行い、失敗が PnP によるものかを切り分けて結果を書く。PnP でそのまま通った道具には比べる試しをしない

### REQ-007: 報告 `docs/yarn-pnp-test-tools-trial.md`

- 日本語で書き、次の節をこの順に置く:
  1. 冒頭: 試した日付、基準コミット（`main` の SHA）、目的、本体の設定を変えていない旨
  2. 結論の要約: 道具ごと（前提の確かめを含む）に「そのまま通った／回避策で通った／通らなかった」の 1 行と、要る回避策の一覧
  3. 環境: Node・Yarn の版、OS・CPU（aarch64）、devcontainer の中で行ったこと、新しい取り出しと専用の `HOME` による隔離の方法
  4. 版: 試した道具と補助のパッケージの正確な版
  5. 道具ごとの結果: 試したコマンド、結果、失敗したときのエラーの要点、試した回避策と効いたかどうか、node-modules での比べる試しの結果
  6. 試した設定とテスト: `.yarnrc.yml` の差分、`vitest.config.*`・`playwright.config.*`・`stryker.config.*`、書いたテストの中身（コードブロック）
  7. 限界: aarch64 の Linux のみ（CI の x64 や macOS は確かめていない）、新しいコンテナではなく devcontainer の中の隔離、各道具は最小の例で試したこと
  8. 次に決めること: PnP に切り替えるかは、道具を入れる作業の中で決めて `docs/decisions/` に残す旨
- 結果の 3 つの区分の意味は次のとおり:
  - そのまま通った: `nodeLinker: pnp` と道具（と補助のパッケージ）を入れることのほかに、設定を足さずに通った
  - 回避策で通った: REQ-006 の回避策（または、そのほかに PnP のために足した設定）を入れて通った
  - 通らなかった: 回避策の候補を試し終えても通らなかった
- 報告だけで同じ試しをやり直せるよう、コマンドと設定・テストの中身をそのまま載せる
- 補助のパッケージ（`jsdom`、`@testing-library/react`、`@vitejs/plugin-react`、`vite` など、要った物）は、試す日に公開から 2 週間以上たった最新の安定版を正確な版で入れ、版と公開日を報告に書く
- markdownlint（リポジトリの pre-commit）を通る

### REQ-008: 本体を変えない

- PR の変更は `docs/yarn-pnp-test-tools-trial.md` の新規 1 ファイルだけ。`.yarnrc.yml`・`package.json`・`yarn.lock`・`.yarn/cache`・`Dockerfile`・`knip.json` を含め、ほかのファイルは変えない
- 報告は `docs/decisions/` に入れない（決定ではなく、ある時点の試しの結果のため）
- 本体の取り出し（リポジトリの root）のブランチを切り替えない。追跡されないファイルを残さない

### REQ-009: コミットと PR

- `git-spice-workflow` に従い、作業用の worktree でブランチを作り、`docs:` の Conventional Commits でコミットする。コミットには body を書く
- PR は 1 本、英語で、リポジトリの PR テンプレートに沿う。Summary に道具ごとの結論（そのまま通った／回避策で通った／通らなかった）を書く
- Related Documents はテンプレートの今の記法に従う。リポジトリの中に対応する plan・spec がないため N/A とする
- PR を作るところまで行う。マージはこの作業に含まない

## Example Mapping

### 規則: 結果の区分（REQ-007）

- 例: `yarn add -D vitest@5.1.0` のあと、設定を足さずに `yarn vitest run` が通った → Vitest の該当の試しは「そのまま通った」
- 例: Stryker の vitest-runner が PnP でモジュールを見つけられず、`packageExtensions` で依存を補ったら通った → 「回避策で通った」。効いた回避策と、その前に試して効かなかった回避策を書く
- 例: 候補を全部試しても Playwright の E2E が通らなかった → 「通らなかった」。エラーの要点と、node-modules での比べる試しの結果を書く
- 例: `vitest.config.ts` で `@/` の別名を設定した → これは PnP に関係なく node-modules でも要る通常の設定なので「回避策」に数えない。PnP のためだけに足した設定だけを「回避策」とし、どちらか判断した理由を報告に書く

### 規則: 比べる試しは失敗・回避策ありの道具だけ（REQ-006）

- 例: Vitest がそのまま通り、Playwright が回避策で通った → Playwright だけ node-modules の取り出しで同じ試しをする
- 例: 全部そのまま通った → 比べる試しはしない。そのことを報告に書く

### 規則: 開くページ（REQ-004）

- 例: `/login` がバックエンドなしで表示され見出しがある → `/login` を使う
- 例: `/login` がバックエンドへの要求で表示できない → 404 のページに切り替え、理由を報告に書く

### 規則: 隔離と後片付け（REQ-001）

- 例: `PLAYWRIGHT_BROWSERS_PATH` を専用の `HOME` の下へ向けた → 試しの後に一時ディレクトリごとブラウザも消える。`~/.cache/ms-playwright` はできていない
- 例: `--with-deps` で `sudo apt` によりパッケージが入った → パッケージ名を報告の「環境」か「限界」に書く（devcontainer は作り直せば元に戻る）

### 規則: 版（REQ-003〜REQ-005、REQ-007）

- 例: 試す日に `vitest` の新しい版が出ていても、道具の版は設計で決めた 5.1.0・1.64.1・10.1.1 のまま試す
- 例: 補助のパッケージ `jsdom` の最新の版が公開から 2 週間たっていない → 2 週間以上たった中で最新の版を選ぶ

## Acceptance Criteria

- AC-01（REQ-007、REQ-008）: `docs/yarn-pnp-test-tools-trial.md` があり、試した日付、基準コミットの SHA、本体の設定を変えていない旨が書かれている
- AC-02（REQ-001、REQ-007）: 環境の節に、Node・Yarn の版、OS・CPU、新しい取り出しと隔離の方法、devcontainer の中で行ったことが書かれている
- AC-03（REQ-003、REQ-004、REQ-005、REQ-007）: Vitest・Playwright・Stryker のそれぞれについて、試した正確な版、コマンド、結果（そのまま通った／回避策で通った／通らなかった）が書かれている。補助のパッケージの版も書かれている
- AC-04（REQ-006）: 失敗した物・回避策が要った物には、エラーの要点、試した回避策とその結果、node-modules での比べる試しの結果が書かれている
- AC-05（REQ-002）: PnP での `yarn install`・`next build`・`next start` の結果が書かれている
- AC-06（REQ-007）: 試した設定とテストの中身がコードブロックで書かれ、報告だけで同じ試しをやり直せる
- AC-07（REQ-007）: 限界（aarch64 のみ、コンテナの扱い、最小の例）と、PnP に切り替えるかの決定はこの PR でしない旨が書かれている
- AC-08（REQ-001、REQ-008）: PR の変更は `docs/yarn-pnp-test-tools-trial.md` だけで、`.yarnrc.yml`・`package.json`・`yarn.lock`・`.yarn/cache` を含むほかのファイルは変わっていない。試しの一時ディレクトリは消されている。本体の取り出しは `main` のままで、追跡されないファイルが増えていない
- AC-09（REQ-007、REQ-009）: markdownlint が通る。コミットは `docs:` で body がある。PR は 1 本で、英語、テンプレートに沿い、Summary に道具ごとの結論がある

### テストの期待（Testing expectations）

- この作業はリポジトリに実行するコードを足さないため、リポジトリのテストは足さない。確かめは次で行う:
  - 試しそのものの結果（各コマンドの終了コードと出力）を、報告の根拠として控える
  - `git diff --stat main...HEAD` で変更が報告 1 ファイルだけであることを確かめる（AC-08）
  - 本体の取り出しで `git status` を見て、`main` のままで追跡されないファイルが増えていないことを確かめる（AC-08）
  - 一時ディレクトリが消えたことを確かめる（AC-08）
  - markdownlint を報告に走らせる（pre-commit で走る。AC-09）

### 要件の対応

| ID | Status | 受け入れ基準 |
| --- | --- | --- |
| REQ-001 | covered | AC-02, AC-08 |
| REQ-002 | covered | AC-05 |
| REQ-003 | covered | AC-03 |
| REQ-004 | covered | AC-03 |
| REQ-005 | covered | AC-03 |
| REQ-006 | covered | AC-04 |
| REQ-007 | covered | AC-01, AC-02, AC-03, AC-06, AC-07, AC-09 |
| REQ-008 | covered | AC-01, AC-08 |
| REQ-009 | covered | AC-09 |

## Out Of Scope

- 本体を PnP に切り替えること、Vitest・Playwright・Stryker を本体に入れること
- PnP に切り替えるかの決定と、その `docs/decisions/` への記録（道具を入れる PR で行う）
- 既存の道具（Biome・Knip・markuplint・lefthook・エディタの SDK）の PnP での網羅的な確かめ。`next build`・`next start` だけは前提として確かめる
- 試しを作り直すスクリプト・CI・設定ファイルをリポジトリに置くこと（一回きりの試し。手順と設定は報告に書く）
- x64・macOS での試し、新しいコンテナでの試し（この環境ではできない。限界として報告に書く）
- PR のマージ
- 同じ依頼のほかの部分（ライセンスの洗い出し、静的な確かめの CI、lefthook）

## Open Questions

- 実装を進めるために人の答えが要る問いはない
- 試しの結果として報告の「限界」に書く事項（問いとして残すものではない）: x64・macOS での動作、新しいコンテナでの動作
