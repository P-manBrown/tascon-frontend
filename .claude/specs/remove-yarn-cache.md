# remove-yarn-cache specification

## Approved requirements

## Requirements: `.yarn/cache` をリポジトリから外し、CI で setup-node の yarn キャッシュを使う

- build target: remove-yarn-cache（root bead tf-4tnlr、対象部分 bead tf-in9ab、依頼 gc-z67w の (3) と人の mail gc-wisp-7keaan の 2）
- 承認済み design: `/home/node/tascon-frontend/.gc-artifacts/remove-yarn-cache/brainstorming/design-candidate.md`（承認 bead tf-21wxh、autonomous、2026-11-20。根拠は同じディレクトリの `design-approval.md`）
- 採用案: design の案 A（1 本の PR で、設定 2 行の削除・追跡の解除・`cache: yarn`・新しい ADR をまとめて入れる）
- mirror: なし。このリポジトリは `docs/superpowers/specs/` を持たず、spec は `.claude/specs/` に置く運用のため、この lane ではリポジトリに書かない。この artifact が正本
- design と違う記述: 決定・範囲・手順は design のまま。ただし次の事実の記述は、spec review（iteration 1）と setup-node のコード（SHA `949feb2413d6458794dcd2491c4babbbce0c15c1`）・追跡中のファイルの確認で直したため、design の該当箇所（Project context の setup-node の項、Design 2・3 の Context、Error handling、Acceptance criteria 8）よりこの spec を優先する
  - setup-node は `.yarn/cache` の有無や `enableGlobalCache` でキャッシュを使うかどうかを変えない。変わるのは restore-keys を使うかどうかだけ（Technical Stories）
  - PR 後の確かめには通常のログに出る `core.info` の行を使う。キャッシュの場所は step debug logging でだけ見られる（REQ-007）
  - CI のキャッシュは PR ごとに効く（REQ-005・REQ-007）
  - `.yarn/cache` は全依存の zip を含み、ネイティブ依存の zip だけが aarch64 用（Problem Statement・REQ-005）

### Problem Statement

リポジトリは Yarn 4 の依存の zip（`.yarn/cache`、874 ファイル・約 211MB）を git で追跡している。全依存の zip を含むが、ネイティブ依存の zip（8 ファイル）は aarch64 用だけで、x64 の CI ランナーは x64 用のネイティブ依存（オプション依存）を install のたびに npm から取得している。依存を更新するたびに zip の差分がコミットに入り、clone も重い。

一方、CI（`.github/workflows/static-checks.yml` の 5 ジョブ）は依存のキャッシュを使っていない。`actions/setup-node` v7.1.0 は、キャッシュの場所を `yarn config get cacheFolder` で得る。今の main は `enableGlobalCache: false` のため、それがリポジトリ内の `.yarn/cache` になり、`cache: yarn` を足しても checkout 済みの zip を重ねて保存・復元するだけで、ほとんど意味がない。`.yarn/cache` があるか・`enableGlobalCache` が何かは、restore-keys（キーの前方一致による古いキャッシュの利用）を使うかどうかだけを変える。

この build では、zip をリポジトリに入れるのをやめ（`.yarnrc.yml` の `enableGlobalCache: false` と `.gitignore` の `!.yarn/cache` を消し、追跡を外す）、同じ PR で composite action の setup-node に `cache: yarn` を足し、理由を `docs/decisions/` に新しい ADR として記録する。

### W6H

- Who: 依頼者は人（mail gc-wisp-7keaan、依頼 gc-z67w）。実装はこの build の implementer lane。影響を受けるのは、リポジトリを clone・更新する開発者（devcontainer・worktree）と GitHub Actions の CI
- What: `.yarn/cache` の追跡を外し、Yarn のキャッシュをグローバル（`~/.yarn/berry/cache`）に戻す。CI の setup-node に `cache: yarn` を足す。決定を ADR に残す
- When: 2026-11-20 の build。#946（static-checks CI）は 2026-11-19 11:30Z に main に入り済みのため、人の指示どおりこの PR で `cache: yarn` を入れる
- Where: `.yarnrc.yml`、`.gitignore`、`.yarn/cache`（追跡の解除）、`.github/actions/setup/action.yml`、`docs/decisions/<新しい ADR>.md`、`docs/decisions/index.md`
- Why: リポジトリの肥大と zip の差分を無くす。CI で依存のキャッシュを効かせる（その前提が zip を外すことと `enableGlobalCache` を既定に戻すこと）
- How: `git rm -r --cached .yarn/cache`（履歴は書き換えない）、設定 2 行の削除、composite action への 1 行の追加、ADR 1 ファイルと index 1 行。土台は main、PR は 1 本、操作は `git-spice-workflow` Skill に従う
- How much: 設定変更 3 ファイル（各 1〜2 行）、追跡解除 874 ファイル（削除として差分に出る）、ADR 1 ファイル新規、index 1 行

### User Stories

- 開発者として、リポジトリを clone・fetch するとき約 211MB の zip を受け取りたくない。依存の更新のたびに zip の差分をレビューしたくない
- 開発者として、CI が毎回 npm から依存を取り直すのを待ちたくない。同じ PR の 2 回目以降の実行（再実行・追加の push）では、`yarn.lock` が変わらない限り依存のキャッシュを restore してほしい。キャッシュは PR ごとで、新しい PR の 1 回目の実行は npm から取得する（PR をまたいで効かせるには main で走るトリガーが要るが、この PR の範囲外）
- 将来この設定を読む人として、なぜ zip をリポジトリに入れないのか、なぜ `static-checks-in-pr-ci.md` で入れなかった依存のキャッシュをここで入れたのかを `docs/decisions/` で知りたい

### Technical Stories

- Yarn の設定: `.yarnrc.yml` から `enableGlobalCache: false` を消すと Yarn 4 の既定（`enableGlobalCache: true`）になり、`yarn config get cacheFolder` が `~/.yarn/berry/cache` を返す。ほかの設定（`nodeLinker: node-modules`・`compressionLevel: mixed`・`packageExtensions`・`yarnPath: .yarn/releases/yarn-4.4.0.cjs`）は変えない
- `yarn.lock` の `cacheKey: 10` は `compressionLevel` で決まり、`enableGlobalCache` では変わらない。よって `yarn.lock` は変わらない
- `.gitignore` は `.yarn/*` を無視し、`!.yarn/cache` 等で例外を作っている。`!.yarn/cache` の行だけを消すと `.yarn/cache` は無視対象になる。ほかの例外（`patches`・`plugins`・`releases`・`sdks`・`versions`）は残す
- setup-node v7.1.0（SHA `949feb2413d6458794dcd2491c4babbbce0c15c1`）の `src/cache-utils.ts` は、yarn の版が `1.` 以外なら `yarn config get cacheFolder` でキャッシュの場所を得る。`repoHasYarnBerryManagedDependencies` は `.yarn/cache` の有無と `enableGlobalCache` を見るが、その結果は `src/cache-restore.ts` で restore-keys を使うかどうかの切り替えにだけ使われ、どちらの場合もキャッシュの restore・save は行う。今の main の設定ではキャッシュの場所がリポジトリ内の `.yarn/cache` になるため、キャッシュしても意味がない。zip を外し `enableGlobalCache` を既定に戻すと、場所が `~/.yarn/berry/cache` になり、キャッシュが意味を持つ
- GitHub Actions のキャッシュは、作られた ref（PR では `refs/pull/<番号>/merge`）と base branch・default branch のものしか restore できない。static-checks は `pull_request` でだけ走り main にキャッシュができないため、restore されるのは同じ PR の 2 回目以降の実行だけ。スタック PR の上段も同じ
- composite action の手順は setup-node → `corepack enable` → `yarn install --immutable`。setup-node がキャッシュの場所を調べる時点は `corepack enable` 前だが、ランナーの `yarn` が `.yarnrc.yml` の `yarnPath` を読んで 4.4.0 を実行する想定。この想定は PR の CI でしか確かめられない（REQ-007）
- 制約: 外部 Action の SHA 固定の方針（`static-checks-in-pr-ci.md`）を変えない。ADR は `.claude/rules/decisions-maintenance.md` の形式に従い、既存 ADR の本文は書き換えない。コミットは `gs commit create` で本文（body）必須

### Behavior Requirements

#### REQ-001: `.yarn/cache` の追跡を外す

- `git rm -r --cached .yarn/cache` で `.yarn/cache` 配下の全ファイルを git の追跡から外す
- 履歴は書き換えない。ブランチは base の main からのコミットの積み増しだけ
- 作業ツリーに残る zip は消さなくてよい（REQ-002 で無視対象になる）

#### REQ-002: `.yarn/cache` を無視対象にする

- `.gitignore` から `!.yarn/cache` の 1 行だけを消す
- `.yarn/*` と、`!.yarn/patches`・`!.yarn/plugins`・`!.yarn/releases`・`!.yarn/sdks`・`!.yarn/versions` は残す

#### REQ-003: Yarn のキャッシュをグローバルに戻す

- `.yarnrc.yml` から `enableGlobalCache: false` の行と、その直後の空行（ある場合）を消す
- ほかの設定は 1 文字も変えない
- `yarn.lock` に差分が出ない。差分が出たら想定外として止まり、原因を調べて bead に記録する。範囲を変える判断が要るなら人に返す

#### REQ-004: CI の setup-node で yarn のキャッシュを使う

- `.github/actions/setup/action.yml` の setup-node の `with:` に `cache: yarn` を 1 行足す（composite action の 1 か所。5 ジョブ共通）
- `cache-dependency-path` は指定しない（既定でルートの `yarn.lock` を鍵に使う）
- setup-node の SHA・版コメント（`# v7.1.0`）・`node-version: 22.22.2`・ほかの手順とその順序は変えない
- `.github/workflows/static-checks.yml` は変えない

#### REQ-005: 決定を新しい ADR に記録する

- `docs/decisions/` に新しい ADR を 1 ファイル足す。ファイル名は内容が分かる英語 kebab-case。既定案は `yarn-cache-out-of-repo.md`（plan lane が確定する。既定案と違う名前にする場合は plan に理由を書く）
- 題は「依存の zip はリポジトリに入れず、CI では setup-node の yarn キャッシュを使う」とする
- 形式は `.claude/rules/decisions-maintenance.md` のとおり
  - `Status: Accepted`
  - `Verification Status: Unverified`（CI でのキャッシュの効き目は PR を開いた後でしか確かめられないため）
  - `Date: 2026-11-20`（コミットする日が違う場合はその日付）
  - `Related Files: .yarnrc.yml, .gitignore, .github/actions/setup/action.yml`
  - 節は Context・Decision・Considered Options・Consequences の 4 つ。内容は日本語
- 各節に書く内容
  - Context: zip が約 211MB・874 ファイルで全依存を含むが、ネイティブ依存の zip は aarch64 用だけで、x64 の CI では x64 用のネイティブ依存を npm から取得していること。依存の更新のたびに zip の差分がコミットに入ること。setup-node はキャッシュの場所を `yarn config get cacheFolder` で得るため、`enableGlobalCache: false` の今の設定ではそれがリポジトリ内の `.yarn/cache` になり、キャッシュしてもリポジトリにある zip を重ねて保存するだけになること（`.yarn/cache` の有無と `enableGlobalCache` は restore-keys を使うかどうかだけを変える）。`static-checks-in-pr-ci.md` で入れなかった依存のキャッシュを、この決定で入れること（リンクで参照）
  - Decision: REQ-001〜REQ-004 の内容
  - Considered Options: 案 A（採用。1 本の PR でまとめる）・案 B（PR を分ける）・案 C（`actions/cache` で `~/.yarn/berry/cache` を直接キャッシュ）・zip をリポジトリに残す案（今の状態）。それぞれの長所・短所
  - Consequences: clone が軽くなる。オフラインでの install・Zero-Install はできなくなる。devcontainer では `~/.yarn/berry` が volume にないため、コンテナを作り直すと最初の install で取得し直す。worktree 間では `~/.yarn/berry/cache` を共有する。追跡を外すコミットを pull・checkout した取り出しでは、git がそれまで追跡していた zip を作業ツリーから消す。残るのは、もともと追跡していなかった zip（他のアーキテクチャ用など）と、`git rm --cached` を実行した取り出しの zip で、どちらも無視対象になり、手で消してよい。CI のキャッシュは PR ごとで、同じ PR の 2 回目以降の実行（再実行・追加の push）でだけ restore され、`yarn.lock` が変わると作り直される。新しい PR の 1 回目の実行は npm から取得する。PR をまたいで効かせるには main で走るトリガー（`push` 等）が要るが、この決定の範囲外
- `docs/decisions/index.md` の末尾に 1 行足す（既存の行と同じ `- 題 (`ファイル名`)` 形式）
- `docs/decisions/static-checks-in-pr-ci.md` は本文も `Status` も変えない（決定の大部分は今も有効。依存のキャッシュの部分を変えることは新しい ADR の Context に書く）

#### REQ-006: ローカルの確かめが通る

- まっさらな取り出し（`git archive HEAD` を一時ディレクトリに展開したもの）で `yarn install --immutable` が成功し、`yarn.lock` に差分が出ず、その取り出しに `.yarn/cache` ができない
- `yarn config get enableGlobalCache` が `true`、`yarn config get cacheFolder` が `~/.yarn/berry/cache`（`~` をホームディレクトリに置き換えた絶対パス）を返す
- lefthook の pre-commit・pre-push（biome・knip など）が、hook を飛ばさずに通る

#### REQ-007: PR の CI でキャッシュが効く（PR を開いた後に確かめる）

- PR を開いたとき、static-checks の 5 ジョブ（tsc・biome・knip・markuplint・next build）が成功する
- 確かめには通常のログに出る行（`core.info`）を使う。1 回目の実行: setup-node の手順に `yarn cache is not found`、post 手順に `Cache saved with the key: <key>`（`src/cache-save.ts` 73 行目）が出る。setup-node の手順に `All dependencies are managed locally by yarn3, the previous cache can be used` が出ない（出たら REQ-001〜REQ-003 が効いていない）
- 同じ PR の 2 回目以降の実行（再実行または追加の push）で、setup-node の手順に `Cache restored from key: <key>` が出る
- キャッシュの場所まで確かめる場合は、step debug logging（`ACTIONS_STEP_DEBUG`）を有効にして再実行し、`yarn's cache folder "<…>/.yarn/berry/cache" configured for the root directory` を見る。この行は `core.debug` のため通常のログには出ない
- 1 回目の実行では 5 ジョブが同じキーで保存しようとするため、後から終わったジョブは保存できない（`saveCache` が -1 を返し、理由は `@actions/cache` がログに出す。`src/cache-save.ts` 64〜70 行目）。失敗ではなく、異常と判断しない
- `open_pr=false` のため、この build の中では確かめない。final report に「PR を開いた後の確認」として残す。確かめで setup-node がキャッシュの場所を誤って得た場合は、corepack（`package.json` の `packageManager: yarn@4.4.0`）と `yarnPath` のどちらが効いたかを調べ、`corepack enable` を setup-node の前に移す等をその時点で決める

#### REQ-008: 変更の範囲と進め方

- 土台は main。PR は 1 本（`open_pr=false`・`push=true` は formula の設定に従う）
- スタック・ブランチ・PR の操作は `git-spice-workflow` Skill に従い、コミットは `gs commit create` で作り、本文（body）を必ず書く
- コミットは役割で分ける。既定案は 3 つ: (1) 追跡の解除（`.gitignore`・`.yarnrc.yml`・`git rm --cached`）、(2) CI の `cache: yarn`、(3) ADR と index。最終的な分け方は plan lane が確定する
- この一覧と Out Of Scope に挙げたファイル以外を変えない

### Example Mapping

#### ルール: `.yarn/cache` は追跡されず、無視される

- 例: 実装後のブランチで `git ls-files .yarn/cache` を実行する → 何も出ない
- 例: 実装後の作業ツリーに残る `.yarn/cache/<任意の zip>` に `git check-ignore -q` を実行する → 終了コード 0（無視対象）
- 例: 実装後のブランチで `git log --oneline main..HEAD` を見る → main からの積み増しのコミットだけで、main 側の履歴は変わっていない

#### ルール: Yarn は依存をグローバルのキャッシュに置き、lockfile は変わらない

- 例: `git archive HEAD` を展開したディレクトリで `yarn install --immutable` → 成功し、`.yarn/cache` ができず、`cmp <展開先>/yarn.lock <(git show HEAD:yarn.lock)`（元のリポジトリで実行する。展開先は git の作業ツリーではないため `git diff` は使わない）が成功する
- 例: 同じディレクトリで `yarn config get enableGlobalCache` → `true`
- 例: 同じディレクトリで `yarn config get cacheFolder` → `/home/<user>/.yarn/berry/cache`
- 例（想定外）: `yarn install --immutable` が lockfile の変更を求めて失敗する → 止まり、原因を bead に記録する。範囲の変更が要るなら人に返す

#### ルール: CI は setup-node の yarn キャッシュを使う

- 例: `.github/actions/setup/action.yml` の差分 → setup-node の `with:` に `cache: yarn` の 1 行が増えただけ
- 例（PR を開いた後）: 1 回目の実行 → setup-node の手順に `yarn cache is not found` が出て各ジョブが取得し、先に終わったジョブの post 手順に `Cache saved with the key: <key>` が出る。後から終わったジョブが保存できないのは失敗ではない
- 例（PR を開いた後）: 同じ PR の 2 回目以降の実行（再実行または追加の push）→ setup-node の手順に `Cache restored from key: <key>` が出る
- 例（PR を開いた後）: 別の新しい PR の 1 回目の実行 → `yarn cache is not found` が出る（キャッシュは PR ごとのため想定どおり）
- 例（想定外、PR を開いた後）: setup-node の手順に `All dependencies are managed locally by yarn3, the previous cache can be used` が出る → REQ-001〜REQ-003 が効いていない。原因を調べる

#### ルール: 決定は新しい ADR に記録し、既存の ADR は書き換えない

- 例: `git diff main -- docs/decisions/static-checks-in-pr-ci.md` → 差分なし
- 例: 新しい ADR の先頭 → `Status: Accepted`・`Verification Status: Unverified`・`Date`・`Related Files` の 4 行があり、`## Context`・`## Decision`・`## Considered Options`・`## Consequences` がこの順にある
- 例: `docs/decisions/index.md` → 新しい ADR への行が 1 行増えている

### Acceptance Criteria

1. `git ls-files .yarn/cache` が空。ブランチは base の main からの積み増しだけで、履歴の書き換えがない（REQ-001）
2. `git check-ignore -q .yarn/cache/<任意の zip>` が成功する。`.gitignore` の差分は `!.yarn/cache` の 1 行の削除だけ（REQ-002）
3. `.yarnrc.yml` に `enableGlobalCache` がなく、差分はその行（と直後の空行）の削除だけ。`yarn config get enableGlobalCache` が `true`、`yarn config get cacheFolder` が `~/.yarn/berry/cache` を指す（REQ-003）
4. `git archive HEAD` の展開で `yarn install --immutable` が成功し、`yarn.lock` に差分が出ず、その取り出しに `.yarn/cache` ができない（REQ-003・REQ-006）
5. `.github/actions/setup/action.yml` の setup-node に `cache: yarn` があり、差分はその 1 行だけ。SHA・`node-version`・ほかの手順は変わらない（REQ-004）
6. `docs/decisions/` に新しい ADR があり、`.claude/rules/decisions-maintenance.md` の形式（Status・Verification Status・Date・Related Files・4 つの節）に合い、REQ-005 の各節の内容を含む。`docs/decisions/index.md` に載る。`static-checks-in-pr-ci.md` は変わらない（REQ-005）
7. lefthook の pre-commit・pre-push（biome・knip など）が hook を飛ばさずに通る（REQ-006）
8. PR を開いた後: 5 ジョブが成功し、1 回目の実行で少なくとも 1 つのジョブの post 手順に `Cache saved with the key: <key>` が出て、同じ PR の 2 回目以降の実行（再実行または追加の push）で `Cache restored from key: <key>` が出る。`All dependencies are managed locally by yarn3, the previous cache can be used` は出ない。キャッシュの場所（`~/.yarn/berry/cache`）は step debug logging を有効にした再実行でだけ確かめられる。`open_pr=false` のため build の中では確かめず、final report に残す（REQ-007）
9. 変更は REQ-008 の範囲に収まり、Out Of Scope のファイルを変えない。コミットは `gs commit create` で作られ、すべて本文を持つ（REQ-008）

#### Testing expectations

- この変更はアプリのコードを変えないため、新しい単体テストは書かない。確かめは上の Acceptance Criteria 1〜7 のコマンドで行い、結果（コマンドと出力の要点）を implementation summary に残す
- まっさらな取り出しでの確かめは一時ディレクトリで行い、メインの取り出しや他の worktree を使わない
- Acceptance Criteria 8 は PR を開いた後の確認として final report に残す

#### Coverage

| ID | Status | 内容 |
| --- | --- | --- |
| REQ-001 | covered | `.yarn/cache` の追跡を外す（履歴は書き換えない） |
| REQ-002 | covered | `.gitignore` の `!.yarn/cache` を消す |
| REQ-003 | covered | `.yarnrc.yml` の `enableGlobalCache: false` を消す、`yarn.lock` 不変 |
| REQ-004 | covered | composite action の setup-node に `cache: yarn` |
| REQ-005 | covered | 新しい ADR と index、既存 ADR は変えない |
| REQ-006 | covered | まっさらな取り出しでの install と lefthook |
| REQ-007 | covered | PR の CI でキャッシュが効くことを PR を開いた後に確かめる |
| REQ-008 | covered | 変更の範囲・PR 1 本・git-spice・コミットの分け方 |

### Out Of Scope

- LICENSE・`package.json` の `license` の追加（依頼の (5)。この PR が main に入った後に mayor が別に流す）
- 絵文字の変更（依頼の (4)、別の部分 tf-gidaa）
- #944・#949 を積み直しの対象から外す記録（依頼の (2)）
- `compressionLevel: mixed` の変更（`yarn.lock` の `cacheKey` が変わり、lockfile の書き直しが要る）
- devcontainer に `~/.yarn/berry` の volume を足すこと
- `.github/workflows/static-checks.yml` の変更、setup-node の SHA・版の変更、`concurrency`・`push` トリガーの追加
- `.claude/plans/active/static-checks-ci.md`・`.claude/specs/static-checks-ci*.md` の書き換え（#946 の作業記録）
- `docs/decisions/static-checks-in-pr-ci.md` の本文・`Status` の変更
- 既存の取り出しに残る、無視対象になった `.yarn/cache` の中身（もともと追跡していなかった zip と、`git rm --cached` を実行した取り出しの zip）の削除（各自の作業環境の片付け）
- #951 → #946 のスタックとレビュー tf-2952m への変更
- #947（`docs/yarn-pnp-test-tools-trial`）の本文の修正。#947 は `docs/yarn-pnp-test-tools-trial.md` だけを変え、ファイルは重ならない。人の指示「後からマージする方を積み直す」に従い、後に入る方を main の上に積み直す

### Open Questions

- 人の答えが要る問いはない
- 確かめが残る点（リスク）: setup-node が `corepack enable` 前にランナーの `yarn` で `yarn config get cacheFolder` を正しく得るか。PR の CI でしか確かめられない（REQ-007）。失敗した場合の対処の方向（`corepack enable` を setup-node の前に移す等）はその時点で決める
- リスク: 1 本の PR の差分に 874 ファイルの削除が入り、レビューの画面が重い。追跡の解除だけのコミットを独立させて読みやすくする（REQ-008）
- リスク: devcontainer を作り直すたびに最初の install で依存を取得し直す（`~/.yarn/berry` が volume にない）。ADR の Consequences に書き、volume の追加は範囲外とする

## Adopted design

## Design candidate: `.yarn/cache` をリポジトリから外し、CI で setup-node の yarn キャッシュを使う

- build target: remove-yarn-cache（root bead tf-4tnlr、対象部分 bead tf-in9ab、依頼 gc-z67w の (3) と mail gc-wisp-7keaan の 2）
- iteration: 1（attempt 1）
- approval mode: autonomous
- approval status: **approved**（tf-21wxh、autonomous、2026-11-20。design-approval.md）

### Brainstorming checklist（Superpowers 1-5）

1. project context inspected: 済み（下の「Project context」）
2. visual questions ahead?: なし。設定ファイル・CI・ADR の変更だけで、見た目の比較が要る問いはない。Visual Companion は提案しない
3. clarifying questions: 人に尋ねる問いはない。依頼文（tf-in9ab の description と notes の mayor 01:42Z・人の mail 原文）で結果が決まる。解釈が分かれ得る点は「Assumptions」に決めた内容を書いた
4. approaches: 3 案を比べた（下の「Approaches」）
5. design sections: 下の「Design」

### Requested outcome

- `.yarn/cache` をリポジトリに入れるのをやめる
  - `.yarnrc.yml` の `enableGlobalCache: false` を消す
  - `.gitignore` の `!.yarn/cache` を消す
  - git の追跡から `.yarn/cache` を外す（`git rm -r --cached`。履歴は書き換えない）
  - 理由を `docs/decisions/` に記録する
- CI の `actions/setup-node` に `cache: yarn` を足す（#946 は 2026-11-19 11:30Z に main に入り済み。この PR で入れる）

### Project context

- `.yarnrc.yml`: `nodeLinker: node-modules`、`compressionLevel: mixed`、`enableGlobalCache: false`、`packageExtensions`、`yarnPath: .yarn/releases/yarn-4.4.0.cjs`
- `.gitignore`: `.yarn/*` を無視し、`!.yarn/cache`・`!.yarn/patches`・`!.yarn/plugins`・`!.yarn/releases`・`!.yarn/sdks`・`!.yarn/versions` を除外
- 追跡中の `.yarn/cache` は 874 ファイル・約 211MB（aarch64 用のネイティブ依存だけ）。`yarn.lock` は `cacheKey: 10`
- CI: `.github/workflows/static-checks.yml` の 5 ジョブ（tsc・biome・knip・markuplint・next build）が、それぞれ composite action `.github/actions/setup/action.yml`（`actions/setup-node@949feb2…` v7.1.0 で `node-version: 22.22.2` → `corepack enable` → `yarn install --immutable`）を使う
- setup-node v7.1.0 の `src/cache-utils.ts`（同じ SHA で確認）
  - yarn の版が `1.` 以外なら `yarn config get cacheFolder` でキャッシュの場所を得る
  - `projectHasYarnBerryManagedDependencies`: 作業ディレクトリに `.yarn/cache` ディレクトリがあれば「依存はリポジトリにある」とみなす。`yarn config get enableGlobalCache` が `false` なら「yarn 3 がローカルで管理」とみなす。どちらも今の main に当てはまるため、`cache: yarn` を足すだけでは期待どおりに効かない。`.yarn/cache` を外し `enableGlobalCache: false` を消すことが、キャッシュを効かせる前提になる
- `docs/decisions/static-checks-in-pr-ci.md`（Accepted, 2026-11-19）の Decision に「依存のキャッシュ・`concurrency`・`push`トリガーは入れない」、Consequences に「`.yarn/cache`にないx64用のオプション依存はinstall時にnpmから取得される」とある
- `.claude/rules/decisions-maintenance.md`: 1 決定 1 ファイル。有効でなくなった決定は本文を書き換えず `Status` だけを変える。index は `docs/decisions/index.md`
- ローカル: `.claude/skills/project-setup/scripts/setup.sh` は worktree ごとに `yarn install --immutable` を実行。devcontainer の `~/.yarn/berry` は volume に載っていない（`compose.devcontainer.yml` の volume は shell-log・gh-config など）
- #947（`docs/yarn-pnp-test-tools-trial`、承認待ち、review root tf-go270）は `docs/yarn-pnp-test-tools-trial.md` だけを変える。本文に試した時点の `.yarnrc.yml`（`enableGlobalCache: false`）の差分の文脈が出てくるが、この build が変えるファイルとは重ならない
- `.claude/plans/active/static-checks-ci.md`・`.claude/specs/static-checks-ci*.md` に `.yarn/cache` の記述があるが、#946 の作業の記録

### Constraints

- 履歴は書き換えない（`git rm --cached` で追跡を外すだけ）
- `cache: yarn` は composite action `.github/actions/setup/action.yml` の setup-node に 1 か所だけ足す（5 ジョブ共通）
- 土台は main。PR は 1 本（`open_pr=false`、`push=true` は formula の設定に従う）
- 外部 Action の SHA 固定の方針（`static-checks-in-pr-ci.md`）は変えない。setup-node の SHA・版は今のまま
- ADR は `.claude/rules/decisions-maintenance.md` の形式に従う。既存 ADR の本文は書き換えない
- スタック・ブランチ・PR 操作は `git-spice-workflow` Skill に従う

### Non-goals

- LICENSE・`package.json` の `license` の追加（依頼の (5)。この PR が main に入った後に mayor が別に流す）
- 絵文字の変更（依頼の (4)、別の部分 tf-gidaa）
- #944・#949 を積み直しの対象から外す記録（依頼の (2)。記録だけで作業なし）
- `compressionLevel: mixed` の変更（`yarn.lock` の `cacheKey` が変わり、lockfile の書き直しが要る。依頼にない）
- devcontainer に `~/.yarn/berry` の volume を足すこと
- `.claude/plans/active/static-checks-ci.md`・`.claude/specs/static-checks-ci*.md` の書き換え（#946 の作業記録）
- 既存の取り出しに残る、無視対象になった `.yarn/cache` の中身の削除（各自の作業環境の片付け）
- #951 → #946 のスタックとレビュー tf-2952m への変更（人の指示で触らない。#946 は main に入り済み）

### Approaches

#### A. 1 本の PR で、設定 2 行の削除・追跡の解除・`cache: yarn`・新しい ADR をまとめて入れる（推奨）

- 長所: setup-node のキャッシュが効く前提（`.yarn/cache` がない・`enableGlobalCache` が既定の true）と `cache: yarn` が同じ PR でそろうため、途中の状態（キャッシュなしで 5 ジョブが毎回 npm から取得する状態、または `cache: yarn` が効かない状態）が main に生じない。人の指示「キャッシュをやめる PR で入れる」に合う
- 短所: 1 本の PR の差分に 874 ファイルの削除が入り、レビューの画面が重い。コミットを分けて（追跡の解除だけのコミットを独立させて）読みやすくする

#### B. `.yarn/cache` を外す PR と `cache: yarn` の PR を分ける

- 長所: 各 PR が小さく、役割が 1 つ
- 短所: 人の指示（「後の方の PR で入れてください」→ #946 が先に入ったのでこの PR で入れる）に反する。間の状態では CI が毎回取り直しになる

#### C. setup-node の `cache: yarn` ではなく `actions/cache` で `~/.yarn/berry/cache` を直接キャッシュする

- 長所: キャッシュの鍵・場所を細かく決められる
- 短所: 外部 Action と SHA の固定が 1 つ増え、キャッシュの場所を手で書くため Yarn の設定とずれ得る。setup-node が同じことを `yarn config get cacheFolder` で自動で行う。人の指示は setup-node の `cache: yarn`

推奨: **A**。人の指示どおりで、main に途中の状態が生じない。

### Design

#### 1. Yarn の設定とリポジトリの追跡

- `.yarnrc.yml` から `enableGlobalCache: false` の行（と直後の空行）を消す。Yarn 4 の既定（`enableGlobalCache: true`）になり、依存の zip は `~/.yarn/berry/cache` に入る。ほかの設定（`nodeLinker`・`compressionLevel`・`packageExtensions`・`yarnPath`）はそのまま
- `.gitignore` から `!.yarn/cache` の行を消す。`.yarn/*` により `.yarn/cache` は無視対象になる
- `git rm -r --cached .yarn/cache` で追跡を外す。履歴は書き換えない。作業ツリーの zip は消さなくてよい（無視対象になる）
- `yarn.lock` は変わらない（`cacheKey` は `compressionLevel` で決まり、`enableGlobalCache` では変わらない）。変わった場合は想定外として止まり、原因を調べる

#### 2. CI のキャッシュ

- `.github/actions/setup/action.yml` の setup-node の `with:` に `cache: yarn` を足す。`cache-dependency-path` は指定しない（既定でルートの `yarn.lock` を鍵に使う）
- 手順の順序（setup-node → `corepack enable` → `yarn install --immutable`）は変えない。setup-node がキャッシュの場所を調べる時点では `corepack enable` 前だが、ランナーにある `yarn` が `.yarnrc.yml` の `yarnPath` を読んで 4.4.0 を実行し、`yarn config get cacheFolder` が `~/.yarn/berry/cache` を返す想定。この想定は PR の CI で setup-node のログ（キャッシュの場所・restore/save）を見て確かめる
- 5 ジョブが同じ鍵（OS・`yarn.lock` のハッシュ）を使う。最初の実行ではどのジョブも取得し、保存は先に終わったジョブが行う

#### 3. 決定の記録（`docs/decisions/`）

- 新しい ADR を 1 ファイル足す（例: `docs/decisions/yarn-cache-out-of-repo.md`、題は「依存の zip はリポジトリに入れず、CI では setup-node の yarn キャッシュを使う」）。形式は `.claude/rules/decisions-maintenance.md` のとおり。`Status: Accepted`、`Verification Status: Unverified`（CI での確認は PR の実行で行うため）、`Related Files: .yarnrc.yml, .gitignore, .github/actions/setup/action.yml`
  - Context: リポジトリに約 211MB・874 ファイルの zip があり、aarch64 用のネイティブ依存だけを含む（x64 の CI ランナーでは結局 npm から取得している）。依存の更新のたびに zip の差分がコミットに入る。setup-node は `.yarn/cache` があるか `enableGlobalCache: false` のとき yarn のキャッシュを使わない。`static-checks-in-pr-ci.md` で入れなかった依存のキャッシュを、この決定で入れる
  - Decision: 上の 1・2
  - Considered Options: A・B・C（上の Approaches の要点）と、zip をリポジトリに残す案（今の状態）
  - Consequences: clone が軽くなる。オフラインでの install・Zero-Install はできなくなる。devcontainer では `~/.yarn/berry` が volume にないため、コンテナを作り直すと最初の install で取得し直す。worktree 間では `~/.yarn/berry/cache` を共有する。既存の取り出しに残る `.yarn/cache` は無視対象になり、手で消してよい。CI のキャッシュは `yarn.lock` が変わると作り直される
- `docs/decisions/index.md` に 1 行足す
- `docs/decisions/static-checks-in-pr-ci.md` は書き換えない。その決定の大部分（ジョブの分け方・composite action・SHA 固定）は今も有効で、`Status` を変える対象ではない。依存のキャッシュの部分を新しい ADR で変えることは、新しい ADR の Context に書く

#### 4. コミットの分け方（plan lane で確定）

- 追跡の解除（`.gitignore`・`.yarnrc.yml`・`git rm --cached`）と、CI の `cache: yarn`、ADR を別のコミットにする案を plan lane に渡す。コミットは `gs commit create`、本文（body）必須

#### 5. #947 との重なり

- #947 は `docs/yarn-pnp-test-tools-trial.md` だけを変え、ファイルは重ならない。人の指示「後からマージする方を積み直す」は、後に入る方を main の上に積み直せば衝突なく済む見込み。#947 の本文は試した時点の状態の記録なので、この PR では直さない

#### Error handling・止まる条件

- `git rm --cached` の後で `yarn install --immutable` が失敗する、または `yarn.lock` に差分が出る → 想定外。原因を調べて bead に記録し、範囲を変える判断が要るなら人に返す
- PR の CI で setup-node が「dependencies are kept in the repository」「managed by yarn 3 locally」と出してキャッシュを使わない → 1 の削除が効いていない。原因を調べる

### Acceptance criteria

1. `git ls-files .yarn/cache` が空。`git log` に履歴の書き換えがない（base の main からの fast-forward の積み増しだけ）
2. `git check-ignore -q .yarn/cache/<任意の zip>` が成功する（無視対象）
3. `.yarnrc.yml` に `enableGlobalCache` がなく、`yarn config get enableGlobalCache` が `true`、`yarn config get cacheFolder` が `~/.yarn/berry/cache` を指す
4. まっさらな取り出し（`git archive HEAD` の展開）で `yarn install --immutable` が成功し、`yarn.lock` に差分が出ない。その取り出しに `.yarn/cache` ができない
5. `.github/actions/setup/action.yml` の setup-node に `cache: yarn` があり、ほかの手順・SHA・`node-version` は変わらない
6. `docs/decisions/` に新しい ADR があり、`.claude/rules/decisions-maintenance.md` の形式（Status・Verification Status・Date・Related Files・4 つの節）に合う。`docs/decisions/index.md` に載る。`static-checks-in-pr-ci.md` の本文は変わらない
7. lefthook の pre-commit・pre-push（biome・knip など）が通る
8. PR の CI（PR を開いたとき）: 5 ジョブが成功し、setup-node のログにキャッシュの場所（`~/.yarn/berry/cache`）が出る。2 回目以降の実行でキャッシュが restore される。※ `open_pr=false` のため、この build の中では確かめられない。PR を開いた後の確認として残す

### Assumptions（自律で決めた点）

- 「理由を docs/decisions/ に記録」は、新しい ADR 1 ファイルとする。`cache: yarn` もキャッシュをやめることと一体の決定として同じ ADR に入れる（キャッシュの場所が変わることが `cache: yarn` を効かせる前提のため）
- `static-checks-in-pr-ci.md` の「依存のキャッシュは入れない」は、本文を書き換えず新しい ADR から参照する（decisions-maintenance の「本文を書き換えない」に合わせる。決定全体は有効なので `Status` は変えない）
- `compressionLevel: mixed` は残す（lockfile を変えない）

### Unresolved questions

- 人の答えが要る問いはない
- 確かめが残る点: setup-node が `corepack enable` 前にランナーの `yarn` で `yarn config get cacheFolder` を正しく得るか（Acceptance 8）。PR の CI でしか確かめられない。失敗したら `corepack enable` を setup-node の前に移す等を、その時点で決める

### Approval

- status: **approved**（approval lane tf-21wxh が autonomous で承認。根拠は design-approval.md）
- basis: 依頼の原文（tf-in9ab の description・notes の mayor 01:42Z と人の mail gc-wisp-7keaan の 2）が、変える行・追跡の解除の方法（履歴を書き換えない）・記録先・`cache: yarn` を入れる PR を指定している。残る選択（ADR の置き方・コミットの分け方・`compressionLevel` を残すこと）はリポジトリのルールと「依頼にないことはしない」で決まる

