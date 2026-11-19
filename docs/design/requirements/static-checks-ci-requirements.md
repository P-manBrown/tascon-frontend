# Requirements: 静的な確かめを PR ごとの CI に入れる（tascon-frontend）

- workflow root: tf-uvyh（superpowers-build）/ target: tf-uhcl（HQ 依頼 gc-vjh8 の 2/4）
- 承認済み design: `docs/design/specs/static-checks-ci.md`（autonomous で承認済み）
- この spec の置き場所: `docs/design/requirements/static-checks-ci-requirements.md`
- 基準: `main` の `ffa7ffcc`（2026-11-18 時点。design の実地試行はこのコミットで行った）

## Problem Statement

tascon-frontend の CI は PR タイトルの検証（`semantic-pull-request.yml`）だけで、型・Lint・未使用コード・マークアップ・ビルドの確かめはローカルの lefthook に任されている。pre-commit はステージしたファイルだけを見て、hook は飛ばせるため、壊れた変更が PR に入っても誰にも見えない。スタック PR のマージ前の確かめ（`mergeStateStatus` が `CLEAN` になるのを待つ）も CI の裏づけがない。PR ごとに 5 つの静的な確かめ（`tsc --noEmit`、Biome、Knip、markuplint、`next build`）を GitHub Actions で走らせ、結果を PR 上に残す。

## W6H

- Who（誰のため）: リポジトリの所有者（P-manBrown）と、PR を作る・マージするエージェント
- What（何を）: 新しいワークフロー `.github/workflows/static-checks.yml`（5 ジョブ並列）、ローカル composite action `.github/actions/setup/action.yml`、決定記録 `docs/decisions/static-checks-in-pr-ci.md` と索引の 1 行
- When（いつ）: 今夜。この run の終わりはブランチの push まで（run の変数は `open_pr=false`、`push=true`。`pull_request` トリガーのため push だけではジョブは走らない）。PR の作成と、PR 上でしか確かめられない事項は run の外の後続作業とする（REQ-010）
- Where（どこで）: tascon-frontend の GitHub Actions。PR は 1 本。作業はメインチェックアウトではなく作業用の worktree で行う
- Why（なぜ）: 静的な確かめを PR 上で誰にも見える形で残し、lefthook を飛ばした変更も検出するため
- How（どうやって）: `pull_request` で 5 ジョブを並列実行。各ジョブは checkout → composite action（setup-node 22.22.2、`corepack enable`、`yarn install --immutable`）→ 確かめのコマンド。外部 Action はコミット SHA で固定
- How much（どこまで）: 5 つの確かめの追加と決定記録まで。ブランチ保護の設定、既存ワークフローの変更、キャッシュ、テストの導入はしない

## User Stories

- US-1: 所有者として、PR の checks 欄で 5 つの確かめが個別に成功・失敗するのを見たい。どの確かめが落ちたかを開かずに分かるように
- US-2: 所有者として、PR 本文で新しいジョブの実際の表示名の一覧を読みたい。required status checks に登録するときにそのまま使えるように
- US-3: 所有者として、外部 Action がコミット SHA で固定されていてほしい。タグの付け替えで中身が変わらないように
- US-4: 将来の作業者として、なぜこの構成とコマンドを選んだかを `docs/decisions/` で読みたい。変えるときに前提を確かめられるように

## Technical Stories

- TS-1: 実装者として、準備手順（setup-node、corepack、install）を composite action 1 か所にまとめ、Node 版と setup-node の SHA の置き場を 1 つにする
- TS-2: 実装者として、`tsc --noEmit` の前に `yarn next typegen` を実行する。`next-env.d.ts` は gitignore 対象で、まっさらな checkout では `public/logos/*.png` の import が `TS2307` になるため（design の実地試行で確認済み）
- TS-3: 実装者として、`actions/checkout` と `actions/setup-node` のコミット SHA を `gh api` でタグから解決する。注釈付きタグはタグオブジェクトではなく指すコミットまで解決する
- TS-4: 実装者として、5 ジョブの見込みの表示名をワークフローの `name` と `jobs.<id>.name` から決め（`Static Checks / <name> (pull_request)`）、PR 本文の下書きに書く。実際の表示名と結果を `gh pr checks` で確かめて直すのは、PR を作った後の後続作業とする

## Behavior Requirements

### REQ-001 ワークフローの骨組み

- `.github/workflows/static-checks.yml` を新規に作る。`name: Static Checks`
- トリガーは `pull_request` のみ。`types` は指定しない（既定の opened / synchronize / reopened）。`branches` で絞らない（スタック PR は main 以外がマージ先になるため）
- `permissions: contents: read`
- 各ジョブは `runs-on: ubuntu-latest`。ジョブ間に `needs` を置かず、5 つが並列に走る
- `concurrency`、`push` トリガー、依存のキャッシュ（`actions/cache`、setup-node の `cache`）は入れない

### REQ-002 5 つのジョブ

ジョブ id・表示名（`jobs.<id>.name`）・確かめのコマンドを次のとおりにする。各ジョブの steps は checkout → `./.github/actions/setup` → 確かめのコマンドの順。

- `typecheck` / `tsc --noEmit`: `yarn next typegen` の後に `yarn tsc --noEmit`
- `biome` / `biome`: `yarn biome ci --error-on-warnings .`
- `knip` / `knip`: `yarn knip`
- `markuplint` / `markuplint`: `yarn lint-jsx`
- `build` / `next build`: `yarn build`（既存 script、`ANALYZE=true next build --turbopack`）

`next build` に要る環境変数は追跡対象の `.env` から読む。シークレットは使わない。

### REQ-003 composite action

- `.github/actions/setup/action.yml` を新規に作る（`runs.using: composite`）
- steps: `actions/setup-node`（SHA 固定、`node-version: 22.22.2`、`cache` は指定しない）→ `corepack enable` → `yarn install --immutable`
- `run` の step には composite action の決まりどおり `shell: bash` を付ける
- Node 版は `Dockerfile` の `node:22.22.2` と同じにする。CI 用の版指定ファイル（`.nvmrc` など）は作らない

### REQ-004 SHA 固定

- このワークフローと composite action で `uses:` する外部 Action は `actions/checkout` と `actions/setup-node` の 2 つだけ
- どちらも、公開から 2 週間以上たったリリースのタグが指す 40 桁のコミット SHA で固定し、行末にそのタグをコメントで書く（例: `uses: actions/checkout@<40 桁の SHA> # v5.0.0`）
- 2 週間以上たったリリースのうち最新のものを選ぶ。ローカル action（`./.github/actions/setup`）は SHA 固定の対象外

### REQ-005 失敗することの確認

- 少なくとも `tsc --noEmit` について、わざと型エラーを 1 行入れた状態で `yarn next typegen && yarn tsc --noEmit` がローカルで失敗することを確かめ、違反を取り除く
- 違反を入れたコミットを PR ブランチに push しない（取り除く操作が履歴の書き換えになるため）。確認は作業ツリー上の未コミットの変更で行う
- 確認した内容（どの確かめに、何を入れ、どう失敗したか）を PR 本文の下書き（REQ-010）の Testing に書く

### REQ-006 決定記録

- `docs/decisions/static-checks-in-pr-ci.md` を新規に作る。`.claude/rules/decisions-maintenance.md` の形式（見出しの `#` 題、`Status` / `Verification Status` / `Date` / `Related Files` の箇条、`## Context` / `## Decision` / `## Considered Options` / `## Consequences`）に従い、日本語で書く
- 題はテーマ「テストと確かめの道具の選び方」に沿い、決定の内容が分かる文にする
- `Status: Accepted`。`Date` はコミットする日。`Related Files` は `.github/workflows/static-checks.yml` と `.github/actions/setup/action.yml`
- `Verification Status`: この run では `Unverified` で入れる。`Verified` に変えるのは、PR 上で 5 ジョブがすべて成功した後の後続作業とする（同じブランチに追加のコミットを積み、履歴は書き換えない）
- 中身は design の「6. 決定記録」の Context / Decision / Considered Options / Consequences に従う。Considered Options には案 A / B / C と、tsc を独立ジョブにしない案、tsc を build の後に同じジョブで実行する案を、それぞれの長所・短所とともに書く
- lefthook の pre-commit の検査（markdownlint、`check-docs.sh`）を通す

### REQ-007 索引

- `docs/decisions/index.md` に、新しい決定記録へのリンク 1 行（既存の行と同じ形式 `- [<題>]` に続く丸括弧へ `static-checks-in-pr-ci.md` を入れた形）を末尾に追加する

### REQ-008 変更範囲

- 変えるファイルは、REQ-001・REQ-003・REQ-006・REQ-007 の 4 つだけ
- `package.json`、`lefthook.yml`、`.github/workflows/semantic-pull-request.yml`、`.github/dependabot.yml`、`Dockerfile` を変えない
- Related Documents と英語の確かめ、lefthook、ライセンス、PnP に関わる変更を入れない

### REQ-009 コミット

- `git-spice-workflow` スキルに従う。コミットは `gs commit create`、Conventional Commits、body 必須（実装の詳細と理由・設計判断）
- type: ワークフローと composite action のコミットは `ci`、決定記録と索引のコミットは `docs`。後続作業で `Verification Status` を変えるコミットも `docs`
- ブランチは `main` の上に 1 本（スタックに分けない）

### REQ-010 PR

- PR は 1 本。タイトルは `ci: ...`（Conventional Commits、英語）
- 本文は英語で、`.github/pull_request_template.md` の見出しに沿う
- この run では PR 本文の下書きを作る。Changes に、新しいジョブの見込みの表示名（TS-4、`Static Checks / <name> (pull_request)`）を一覧で書く
- Testing に、REQ-005 の確認と、ローカルで 5 つのコマンドが成功したことを書く。PR 上の 5 ジョブの結果は後続作業で書き足す
- Related Documents は今のテンプレートの記法に従う。リポジトリの `docs/design/plans/`・`docs/design/specs/`・`docs/design/requirements/` に対応する plan・spec がなければ両方 `⬜️` で path を `N/A` にする
- Notes に、既存 `semantic-pull-request.yml` の `amannn/action-semantic-pull-request@v5` が SHA 固定されていないこと、required status checks への登録は人の GitHub 設定作業であることを書く
- PR を作るレーンはワークフローの設定に従う（この run の変数は `open_pr=false`、`push=true`）。この spec は PR の中身の要件だけを定める。PR を作らずに run が終わる場合、PR 本文の下書きは実装の bead のノートに残す
- 後続作業（run の外。PR を作った後に行う）を、実装の bead のノートに一覧で残す: PR の作成、`gh pr checks` で 5 ジョブの実際の表示名と結果を確かめて PR 本文の Changes・Testing を直すこと、x64 runner での `yarn install --immutable` の成否の確認、5 ジョブがすべて成功した後に決定記録の `Verification Status` を `Verified` に変える `docs` コミットを積むこと（その再実行の結果も `gh pr checks` で確かめる）

## Example Mapping

- 規則: 準備手順は composite action 1 か所
  - 例: Node 版を上げるときは `.github/actions/setup/action.yml` の `node-version` 1 か所と `Dockerfile` を変える。ワークフロー側は変えない
- 規則: tsc はビルドに依存させず並列のまま
  - 例: まっさらな checkout で `yarn tsc --noEmit` だけを実行 → `TS2307`（`next-env.d.ts` がない）で失敗する
  - 例: `yarn next typegen` の後に `yarn tsc --noEmit` → 成功（`next-env.d.ts` と `.next/types/*` が生成される）
- 規則: 警告も失敗にする
  - 例: Biome の警告が 1 件ある → `biome` ジョブが失敗する（`--error-on-warnings`）
- 規則: マージ先のブランチで絞らない
  - 例: スタックの上段 PR（マージ先が `main` 以外のブランチ）でも 5 ジョブが走る
- 規則: 外部 Action はコミット SHA
  - 例: `uses: actions/checkout@v5` → 不可
  - 例: 注釈付きタグのタグオブジェクトの SHA → 不可（指すコミットの SHA に解決する）
- 規則: 失敗の確認は履歴に残さない
  - 例: 型エラーを入れて push し、後で revert する → 不可。作業ツリー上で確かめて取り除く

## Acceptance Criteria

1. `.github/workflows/static-checks.yml` があり、`pull_request` で 5 ジョブ（表示名 `tsc --noEmit` / `biome` / `knip` / `markuplint` / `next build`）が `needs` なしで並列に走る。`branches` の絞り込みがなく、`permissions: contents: read` がある（REQ-001、REQ-002）
2. `.github/actions/setup/action.yml` があり、setup-node（22.22.2）→ `corepack enable` → `yarn install --immutable` を行う。5 ジョブすべてがそれを使う（REQ-003）
3. 新規の `uses:` で参照する外部 Action が `actions/checkout` と `actions/setup-node` だけで、どちらも 40 桁のコミット SHA で固定され、行末にタグのコメントがある（REQ-004）
4. 作業用の worktree で、5 ジョブのコマンド（`yarn next typegen && yarn tsc --noEmit`、`yarn biome ci --error-on-warnings .`、`yarn knip`、`yarn lint-jsx`、`yarn build`）がそれぞれ成功する（REQ-002）
5. 少なくとも `tsc --noEmit` が違反で失敗することをローカルで確かめ、その内容が PR 本文の下書きの Testing にあり、違反を入れたコミットがブランチの履歴にない（REQ-005）
6. `docs/decisions/static-checks-in-pr-ci.md` が `decisions-maintenance.md` の形式に従い、`Verification Status: Unverified` で、`index.md` に載っている。lefthook の pre-commit（markdownlint、`check-docs.sh`）が通る（REQ-006、REQ-007）
7. `git diff --name-only main...HEAD` が REQ-008 の 4 ファイルだけ（REQ-008）
8. コミットが `gs commit create` で作られ、type が REQ-009 どおりで、すべてに body がある（REQ-009）
9. PR 本文の下書きが英語でテンプレートに沿い、Changes に YAML の `name` から決まる見込みのジョブ表示名の一覧、Notes に既存 Action の SHA 未固定と required status checks の件がある。REQ-010 の後続作業の一覧が実装の bead のノートにある（REQ-010）

### Testing expectations

- アプリのコードを変えないため、単体テストは追加しない
- ローカル（作業用の worktree）で、5 つのコマンドがそれぞれ成功することを確かめる。メインチェックアウトでは `biome` が入れ子の `.claude/worktrees/*/biome.json` で失敗するため、確かめは作業用の worktree かまっさらな checkout で行う
- ワークフローの YAML の実際の実行（PR 上での 5 ジョブ成功）はこの run の中では確かめられないため、REQ-010 の後続作業とする。`actionlint` などの道具を新しく入れない
- REQ-005 の失敗の確認をローカルで行う

### Risks

- `ubuntu-latest` は x64。`.yarn/cache` には aarch64 用のネイティブ依存しかなく、x64 用のオプション依存（`sharp`、`lightningcss`、`@biomejs/cli-*` など）は install 時に npm から取得される。`yarn install --immutable` は lockfile を変えなければ通る見込みだが、未確認。初回の実行で失敗したら、原因を調べて bead に記録し、範囲（キャッシュ方針・`--immutable` の扱い）を変える判断が要るなら人に返す
- `yarn next typegen` は Next 15.5 以降のコマンド。next 16.1.6 で確認済み。Next の更新で挙動が変わると `tsc --noEmit` ジョブが壊れる（決定記録の Consequences に書く）
- install を 5 回行うため Actions の使用時間が増える（1 回約 15 秒。design で受け入れた短所）
- `Dockerfile` の Node 版を上げるとき composite action と合わせる必要がある（決定記録の Consequences に書く）
- 後続作業で `Verification Status` を変える追加のコミットを積むと CI がもう一度走る。結果が変わらないことを `gh pr checks` で確かめる（REQ-010 の後続作業に含む）

## Out Of Scope

- Related Documents と英語の確かめ（PR 本文の確かめ）
- 同じ HQ 依頼の他の部分（ライセンスの洗い出し、PnP の相性の試し、lefthook）
- 既存 `semantic-pull-request.yml` の Action の SHA 固定（PR の Notes に書くだけ）
- ブランチ保護の required status checks の設定（人の GitHub 設定作業）
- dependabot への `github-actions` エコシステムの追加
- 依存のキャッシュ、`concurrency`、`push: main` トリガー
- 単体テスト・E2E テストの導入
- lefthook の pre-commit / pre-push の変更

## Open Questions

- 設計・実装を進めるために人の答えが要る問いはない
- run の後に確かめること（問いではない）: x64 runner での `yarn install --immutable` の成否、5 ジョブの実際の表示名。どちらも REQ-010 の後続作業として扱う

## Coverage

| ID | Status |
| --- | --- |
| REQ-001 | covered |
| REQ-002 | covered |
| REQ-003 | covered |
| REQ-004 | covered |
| REQ-005 | covered |
| REQ-006 | covered |
| REQ-007 | covered |
| REQ-008 | covered |
| REQ-009 | covered |
| REQ-010 | covered |
