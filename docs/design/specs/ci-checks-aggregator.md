# ci-checks-aggregator specification

## Approved requirements

## 要件: static-checks.yml のまとめ役 checks・解析なしの next build・確かめのジョブ追加（tascon-frontend）

- workflow root: tf-rrr6j（superpowers-build）／ 依頼の部分: tf-1jtse（依頼 gc-tmf1）
- 承認済みの設計: `/home/node/tascon-frontend/.gc-artifacts/ci-checks-aggregator/brainstorming/design.md`（承認 tf-8a2c1、autonomous）
- `docs/superpowers/specs/` への写し: 作らない。この lane はメインのチェックアウトで動いており、リポジトリの作業用 worktree がまだ無いため。仕様はこのファイル（`gc.build.requirements_path`）を正とする。リポジトリの PR テンプレートの Spec 欄は後段で決める

### Problem Statement

`static-checks.yml` は 5 つの確かめ（`typecheck`・`biome`・`knip`・`markuplint`・`build`）を別々のジョブで並列に走らせているが、ブランチ保護の必須のチェックに登録するにはジョブを 1 つずつ登録する必要があり、確かめを足すたびに登録し直しが要り、登録を忘れるとその確かめは関門から漏れる。また `build` ジョブは `yarn build`（`ANALYZE=true` 付き）を走らせているが、Turbopack のビルドでは解析のレポートが作られず、`ANALYZE=true` は何も足していない。さらに、lefthook で中身を確かめている markdownlint・check-logger-trace・check-docs.sh は CI に無く、hook を飛ばした変更が PR に入っても見えない。

依頼（tf-1jtse）は、devcontainer-features の `all-tests` と同じ形のまとめ役のジョブ `checks` を足し、必須のチェックを `checks`（と `Validate PR title`）だけにできるようにし、解析なしのビルドにし、3 つの確かめを CI のジョブとして足すことを、関心事ごとに 3 つの PR（1 本のスタック、下から 1a → 1b → 1c）で求めている。

### W6H

- **Who**: リポジトリの持ち主（必須のチェックの登録を行う人）と、PR を出す開発者・エージェント
- **What**: `static-checks.yml` にまとめ役 `checks` を足す（1a）、`build` ジョブを解析なしのビルドにする（1b）、markdownlint・check-logger-trace・check-docs.sh のジョブを足して `checks` の `needs` に入れる（1c）。決定の記録 `docs/decisions/static-checks-in-pr-ci.md` と `docs/decisions/index.md` を合わせて更新する
- **When**: PR ごと（`pull_request`）。朝（日本時間 2026-11-20 07:00）までに PR を出す流れの一部
- **Where**: `.github/workflows/static-checks.yml`、`docs/decisions/static-checks-in-pr-ci.md`、`docs/decisions/index.md`
- **Why**: 確かめを足すたびに必須のチェックを登録し直さなくて済み、登録を忘れても関門から漏れないようにするため。中身を確かめる物を全部 CI に入れ、手元には protect-branch・check-git-clean だけを残す基準（tf-cg4pi から引き継ぐ）を満たすため
- **How**: `checks` は `needs` で全ジョブを待ち、`if: always()` で必ず走り、`toJSON(needs)` を `jq` で見て `success` 以外が 1 つでもあれば失敗する。ビルドはワークフローで `yarn next build --turbopack` を直接実行する。追加の 3 ジョブのうち install が要るのは markdownlint だけ
- **How much**: ジョブが 4 つ増える（`checks` と 1c の 3 つ）。install が要るのは markdownlint の 1 つだけで、追加の install は 1 回分

### User Stories

- リポジトリの持ち主として、必須のチェックに `checks`（と `Validate PR title`）だけを登録すれば、`static-checks.yml` の全部の確かめが関門になってほしい。確かめが増えても登録し直したくない
- 開発者として、`checks` が落ちたとき、どのジョブが何の結果だったかを `checks` のログで 1 行ずつ見たい
- 開発者として、lefthook を飛ばしたコミットでも、Markdown の書式・`logger.trace` の残り・ドキュメントの決まりの違反が PR で見えてほしい
- 開発者として、CI のビルドが実際には何も作らない解析の指定に左右されず、手元の `yarn build` の挙動も変わらないでほしい

### Technical Stories

- `static-checks.yml` にジョブ `checks`（`name:` は付けない、`runs-on: ubuntu-latest`、checkout しない）を足す。`needs` に同じワークフローの全確かめのジョブを並べ、`if: always()` を付ける。1 ステップで `env: NEEDS: ${{ toJSON(needs) }}` を受け、`jq` で各ジョブの `<id>=<result>` を表示し、`jq -e 'all(.[]; .result == "success")'` 相当の判定で成功以外があれば非 0 で終わる
- `build` ジョブの `run: yarn build` を `run: yarn next build --turbopack` に変える。ジョブ id `build` と表示名 `next build` は変えない。`package.json` は変えない
- ジョブ `markdownlint`（checkout → `./.github/actions/setup` → `yarn markdownlint-cli2 '**/*.md'`）、`check-logger-trace`（checkout だけ。`src` 配下の `*.js`・`*.jsx`・`*.ts`・`*.tsx` を `grep -rnF 'logger.trace'` で探す）、`check-docs`（表示名 `check-docs.sh`、checkout だけ。`bash .lefthook/pre-commit/check-docs.sh`）を足し、`checks` の `needs` に入れる
- 決定の記録 `docs/decisions/static-checks-in-pr-ci.md` を 1a・1b・1c それぞれで同じファイルに書き足し・更新する（新しい記録で置き換えない。Status・Verification Status・Date は変えない）。1c でタイトルと `docs/decisions/index.md` のリンクの文を更新する。形式は `.claude/rules/decisions-maintenance.md` に従う

### Behavior Requirements

| ID | 要件 |
| --- | --- |
| REQ-001 | 1a・1b・1c は `chore/lefthook-safe-autofix-and-typecheck`（PR #955）の上の 1 本のスタックで、下から 1a → 1b → 1c の 3 ブランチとし、それぞれ 1 つの関心事だけを変える。スタック・ブランチの操作は `git-spice-workflow` Skill に従う |
| REQ-002 | 1a: `static-checks.yml` にジョブ `checks` があり、`needs: [typecheck, biome, knip, markuplint, build]`、`if: always()`、各ジョブの `<id>=<result>` を表示し、`result` が `success` でないジョブ（`failure`・`cancelled`・`skipped`）が 1 つでもあれば非 0 で終わる。判定は `toJSON(needs)` 全体を `jq` で見る（ジョブ名を判定の式に並べない） |
| REQ-003 | 1a: `docs/decisions/static-checks-in-pr-ci.md` に、まとめ役 `checks` を置く決定と理由（確かめを足すたびに必須のチェックを登録し直さなくて済み、登録を忘れても関門から漏れない）、必須のチェックに登録するのは `checks`（と `Validate PR title`）だけであること、必須にする確かめは 1 つのワークフローに置くこと（`needs` が待てるのは同じワークフローのジョブだけのため）、判定の書き方の案（`needs` 全体を `jq` で見る／ジョブごとに比べる／`contains` で列挙する）と各ジョブを個別に登録する案を Considered Options に書く。Consequences の「required status checks に登録するまでは…」を `checks` の登録に合わせて更新し、確かめを足すときは `needs` にも足す必要があることを書く |
| REQ-004 | 1b: `build` ジョブが `yarn next build --turbopack` を実行し、`ANALYZE=true` が付かない。ジョブ id `build`・表示名 `next build` と `package.json` は変わらない。決定の記録の `next build` の項目を更新し、Context に「Turbopack のビルドでは `ANALYZE=true` でも解析のレポートが作られず警告だけが出る」「`ANALYZE` は `build` スクリプトの中で付くためワークフローの `env` で上書きできない」を、Consequences に「`build` スクリプトのビルドの指定（`--turbopack` 等）を変えるときはワークフローも合わせる」を、Considered Options に `package.json` を変える案と `env` で `ANALYZE=false` を渡す案を書く |
| REQ-005 | 1c: ジョブ `markdownlint`（表示名 `markdownlint`）・`check-logger-trace`（表示名 `check-logger-trace`）・`check-docs`（表示名 `check-docs.sh`）があり、`checks` の `needs` が `[typecheck, biome, knip, markuplint, build, markdownlint, check-logger-trace, check-docs]` になっている。`./.github/actions/setup` を使うのは `markdownlint` だけで、他の 2 つは checkout だけ。markdownlint の glob は引用符で囲み、対象の除外は `.markdownlint-cli2.jsonc` に従う |
| REQ-006 | 1c: `check-logger-trace` は `logger.trace` が見つかれば該当の `ファイル:行` と `ERROR: Remove 'logger.trace' from the files above.` を出して失敗し、見つからなければ成功する。`grep` 自体のエラー（終了コード 2 以上）は成功扱いにしない |
| REQ-007 | 1c: 決定の記録の確かめの一覧に 3 つを足し、install が要らない 2 つは checkout だけで走らせることを書く。Context に 3 つが土台の時点でリポジトリ全体に対して成功する事実を書く。タイトルと `docs/decisions/index.md` のリンクの文を「型・Lint・未使用コード・マークアップ・Markdown・ドキュメント・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する」に更新する（ファイル名は変えない）。Consequences に、手元だけに残るのは protect-branch・check-git-clean になることを書く |
| REQ-008 | 全ブランチを通して、外部の Action（SHA の固定）・`permissions: contents: read`・トリガー（`pull_request`、マージ先で絞らない）・`lefthook.yml`・`package.json` は変わらない。新しい外部の Action・依存のキャッシュ・`concurrency`・`push` トリガーを足さない |

### Example Mapping

- **規則: `checks` は成功以外が 1 つでもあれば落ちる（REQ-002）**
  - 例: 5 ジョブすべて `success` → `checks` は各行 `<id>=success` を表示して成功
  - 例: `knip` だけ `failure` → `checks` は `knip=failure` を表示して失敗
  - 例: ワークフローが途中で取り消され、あるジョブが `cancelled` → `checks` は失敗（または自身も取り消される）。必須のチェックは通らない
  - 例: あるジョブが `skipped` → 失敗（この部分には条件付きで飛ばすジョブが無いため許す分岐を持たない）
- **規則: `needs` に入れたジョブだけが関門になる（REQ-002・REQ-005）**
  - 例: 1c で 3 ジョブを `needs` に足す → 判定の式は変えずに 3 つも判定の対象になる
  - 例: 後の作業がジョブを足して `needs` に入れ忘れる → そのジョブは関門に入らない（決定の記録の Consequences で防ぐ）
- **規則: CI のビルドは解析なし、手元は変えない（REQ-004）**
  - 例: CI の `build` ジョブ → `yarn next build --turbopack`、バンドル解析の警告が出ない
  - 例: 手元で `yarn build` → 今まで通り `ANALYZE=true next build --turbopack`
- **規則: logger.trace の検索（REQ-006）**
  - 例: `src` に `logger.trace` が 0 件 → `grep` は終了コード 1 → ジョブ成功
  - 例: `src/foo.ts` の 12 行目に `logger.trace(` → `src/foo.ts:12:…` と `ERROR: Remove 'logger.trace' from the files above.` を出して失敗
  - 例: `grep` が終了コード 2（読めないファイル等） → 失敗

### Acceptance Criteria

1. REQ-001: `gs log short` 等で、`chore/lefthook-safe-autofix-and-typecheck` の上に 1a → 1b → 1c の 3 ブランチが一直線に並び、各ブランチの差分が自分の関心事だけである
2. REQ-002: 1a のブランチの `static-checks.yml` で、`checks` の `needs` がジョブの id の一覧（`checks` 以外）と一致し、`if: always()` がある。判定のステップを手元の `jq` で、`needs` を模した JSON（全 `success` → 終了コード 0、1 つ `failure`／`cancelled`／`skipped` → 非 0）に対して走らせて期待どおりになる
3. REQ-003: 1a のブランチの決定の記録に、REQ-003 に挙げた Decision・理由・Considered Options・Consequences の項目がすべてある
4. REQ-004: 1b のブランチで `build` ジョブの `run` が `yarn next build --turbopack`、`git diff` に `package.json` が無い。作業用の worktree で `yarn next build --turbopack` が成功する。決定の記録に REQ-004 の項目がある
5. REQ-005・REQ-006: 1c のブランチで 3 ジョブと `needs` が REQ-005 のとおり。作業用の worktree で logger.trace の検索と `bash .lefthook/pre-commit/check-docs.sh` が成功する。`yarn markdownlint-cli2 '**/*.md'` は、1c のブランチの中身を `git archive` で一時ディレクトリに展開した木で走らせて成功する（worktree では追跡されない `.claude/memory` の symlink を markdownlint がたどるため、worktree では走らせて判定しない）。手元で追跡外のファイルのエラーが出ても `.markdownlint-cli2.jsonc` と `.claude/memory` のファイルは変えない。logger.trace を一時的に 1 か所入れると検索のステップが失敗する（コミットしない）
6. REQ-007: 1c のブランチで決定の記録と `docs/decisions/index.md` が REQ-007 のとおりで、`bash .lefthook/pre-commit/check-docs.sh` が更新後の記録に対して成功し、markdownlint が AC5 と同じ方法（`git archive` で展開した木）で更新後の記録に対して成功する
7. REQ-008: 3 ブランチ通しての `git diff chore/lefthook-safe-autofix-and-typecheck` に `lefthook.yml`・`package.json`・`.github/actions/` が無く、`uses:` の行・`permissions`・`on:` が変わっていない
8. 各ワークフローの YAML が読めること（`actionlint` があれば実行し、無ければ実行していないと記録する）

#### Coverage

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

#### テストの期待

- ワークフローは PR が出るまで GitHub 上で走らないため、上の手元の確かめで代える。GitHub Actions での実行は PR のチェックで確かめる
- `checks` の判定は手元の `jq` で成功・失敗の両方の例を確かめる

#### リスク

- `checks` の `needs` にジョブを入れ忘れると、そのジョブは関門から漏れる（決定の記録で注意を書く）
- `--turbopack` の指定が `package.json` の `build` とワークフローの 2 か所になり、片方だけ変えるとずれる
- 1c の上に別の build（tf-c7ibz → tf-dj4bc）の枝が積まれ、同じ `checks` の `needs` を触る。後から並ぶ側が積み直しで合わせる
- 同じ `static-checks.yml` を触る保留の作業 tf-in9ab（`cache: yarn`）は、この build の PR が `static-checks.yml` を変えていることを前提にする（後に流す側の root の notes に書く）
- 必須のチェックの登録（`checks` と `Validate PR title` だけにする）は人がリポジトリの設定で行う。登録までは `checks` が落ちてもマージは止まらない

### Out Of Scope

- ブランチ保護の必須のチェックの登録の変更（人が行う）
- `lefthook.yml` の変更・手元のフックからの確かめの削除
- `package.json` の `build` スクリプトの変更
- 依存のキャッシュ（`cache: yarn`、tf-in9ab）・`concurrency`・`push` トリガー・新しい外部の Action の追加
- `docs/design/specs/static-checks-ci.md`・`docs/design/requirements/static-checks-ci-requirements.md` の書き換え
- backend リポジトリ側のまとめ役
- CodeQL・Semgrep・Dependency Review・code-review-graph（別の build tf-p0zkq）とテストの道具（別の build、部分 tf-dj4bc）

### Open Questions

- なし。人の答えを要する問いは無い。決めた前提（判定は `success` 以外をすべて失敗、1b は CI のジョブだけ、決定の記録は同じファイルを更新、install は markdownlint だけ、確かめの対象の範囲）は承認済みの設計の Q1〜Q5 にある

## Adopted design

## 設計候補: static-checks.yml のまとめ役 checks・解析なしの next build・確かめのジョブ追加（tascon-frontend）

- 対象 bead: tf-tn5i5（root tf-rrr6j、依頼の部分 tf-1jtse、依頼 gc-tmf1）
- 反復: 1（attempt 1）
- 承認モード: autonomous（`gc.var.brainstorming_approval_mode`）
- 承認状態: **承認（autonomous、tf-8a2c1、2026-11-19）**

### Superpowers チェックリストの記録（項目 1〜5）

1. **プロジェクトの文脈の確認: 済み**
   - 土台ブランチ `chore/lefthook-safe-autofix-and-typecheck`（PR #955、未マージのスタックの最上段）の `.github/workflows/static-checks.yml`・`.github/actions/setup/action.yml`・`lefthook.yml`・`.lefthook/pre-commit/check-docs.sh`・`.markdownlint-cli2.jsonc`・`next.config.js`・`package.json`・`docs/decisions/static-checks-in-pr-ci.md`・`docs/decisions/local-hooks-vs-ci-checks.md`・`.claude/rules/decisions-maintenance.md` を読んだ
   - 参照の形: `P-manBrown/devcontainer-features` の `.github/workflows/test.yaml` の `all-tests` ジョブ（`needs` で全ジョブを待ち、`if: always()`、各ジョブの `result` を表示してから成功以外なら `exit 1`）
   - 土台ブランチの中身を `git archive` で一時ディレクトリに展開して確かめた（下の「確かめた事実」）
2. **Visual Companion: 提案しない**。CI の YAML と文書の変更だけで、見た目で比べる問いがない
3. **確認の問い: 人の答えを要する問いはない**。考えた問いと、文脈から決まった答えは「確認の問いと答え」に書く
4. **2〜3 の案と推奨: 済み**（「案の比較」）
5. **推奨の設計を節に分けて提示: 済み**（「設計」）

### 求められている結果

依頼の原文（tf-1jtse の説明）の要点:

- CI の必須のチェックを devcontainer-features の `all-tests` と同じ形にそろえる。確かめはジョブに分けて同時に走らせ、全部のジョブを `needs` で待つまとめ役のジョブ `checks` を 1 つ足す。`checks` には `if: always()` を付け、どれかが成功以外なら落ちる
- 必須のチェックに登録するのは `checks`（と `Validate PR title`）だけ。必須にする確かめは 1 つのワークフローに置く
- 関心事ごとに PR を分け、1 本のスタックで下から次の順にする
  - **1a**: `static-checks.yml` の 5 つのジョブに、まとめ役の `checks` を足す。`docs/decisions/static-checks-in-pr-ci.md` に理由（確かめを足すたびに必須のチェックを登録し直さなくて済み、登録を忘れても関門から漏れない）を書き足す
  - **1b**: `next build` のジョブを解析なしのビルドにする（元の文:「CI の next build のジョブが yarn build（ANALYZE=true 付き）を走らせている所を、解析なしのビルドにしてください。」）
  - **1c**: markdownlint・check-logger-trace・check-docs.sh をジョブとして足し、`checks` の `needs` に入れる
- 基準（tf-cg4pi から引き継ぐ）:「中身を確かめる物は全部 CI に入れてリポジトリ全体を見る必須のチェックにし、手元の状態を見る protect-branch・check-git-clean だけを手元に残す」

### 制約

- 土台は `chore/lefthook-safe-autofix-and-typecheck`（PR #955）。スタック・ブランチ・PR の操作は `git-spice-workflow` Skill に従う。1c の上に別の build（tf-c7ibz → tf-dj4bc）の枝が積まれる
- 外部の Action はコミット SHA で固定し、行末にタグを書く（既存の決定）。新しい外部 Action は足さない
- CI は検査だけを行い、自動修正しない（`local-hooks-vs-ci-checks.md`）
- 決定の記録は `.claude/rules/decisions-maintenance.md` の形式（Status / Verification Status / Date / Related Files、Context / Decision / Considered Options / Consequences、日本語）に従う。ルール・Skill に理由を書かない決まりはルールファイルとスキルが対象で、決定の記録は理由を書く場所
- `permissions: contents: read` を保つ。トリガーは `pull_request` のまま、マージ先のブランチで絞らない
- 同じ `static-checks.yml` を触る保留の作業 tf-in9ab（`actions/setup-node` に `cache: yarn` を足す）とは同時に流さない（mayor の notes）

### やらないこと（非目標）

- ブランチ保護の必須のチェックの登録変更（`checks` と `Validate PR title` だけにする）。リポジトリの設定で、人が行う
- lefthook からの確かめの削除。手元のフックは CI と同じ検査を早めに走らせる場所のまま（`local-hooks-vs-ci-checks.md`）。`lefthook.yml` は変えない
- `package.json` の `build` スクリプトの変更（手元の `yarn build` の挙動は変えない）
- 依存のキャッシュ（`cache: yarn`、tf-in9ab の範囲）・`concurrency`・`push` トリガーの追加
- `docs/design/specs/static-checks-ci.md`・`docs/design/requirements/static-checks-ci-requirements.md`（前の作業の仕様・要件。その時点の記録として残す）の書き換え
- backend リポジトリ側のまとめ役（依頼の別の部分）

### 確かめた事実（土台ブランチの中身で確認）

- `bash .lefthook/pre-commit/check-docs.sh` はリポジトリ全体（`find docs …`・`ARCHITECTURE.md`）を見る作りで、まっさらな展開で exit 0。GNU の `grep -P` と `date -d` を使う（`ubuntu-latest` にある）。依存の install は要らない
- `src` 配下の `*.{js,jsx,ts,tsx}` に `logger.trace` は 0 件（`grep -rnF` が exit 1）
- `markdownlint-cli2 '**/*.md'` はリポジトリ全体で `Linting: 47 file(s)`・`Summary: 0 error(s)`（追跡中の `.md` は 49、`.github/**` の 2 つは設定の `ignores` で除く。`gitignore: true` で `/node_modules` も除く）
- `ANALYZE=true next build --turbopack` では `@next/bundle-analyzer` が「The Next Bundle Analyzer is not compatible with Turbopack builds, no report will be generated.」と警告を出すだけで、レポートは作られない（`node_modules/@next/bundle-analyzer/index.js` は `process.env.TURBOPACK` のとき何もせず設定を返す。展開した木でのビルドでも警告を確認）。つまり今の CI の `ANALYZE=true` は結果に何も足していない
- `ANALYZE=true` は `build` スクリプトの中で直接付けているため、ワークフローの `env` で `ANALYZE` を上書きしても効かない
- リポジトリ内で `yarn build` を呼ぶのは `static-checks.yml` だけ（Dockerfile 等の本番のビルド手順はリポジトリにない）
- `jq` は `ubuntu-latest` の runner に入っている

### 確認の問いと答え（autonomous のため文脈から決めた）

- Q1: `checks` は各ジョブの結果をどう判定するか → 依頼の「どれかが成功以外なら落ちる」の通り、`success` 以外（`failure`・`cancelled`・`skipped`）はすべて失敗。この部分には条件付きで飛ばすジョブがないため、devcontainer-features の `skipped` を許す分岐は持ち込まない
- Q2: 1b の「解析なし」は CI だけか、`package.json` の `build` も変えるか → 原文は「CI の next build のジョブが yarn build（ANALYZE=true 付き）を走らせている所を」で、CI のジョブだけを対象にする
- Q3: 決定の記録は 1b・1c でも同じファイルを更新するか → 1a で依頼が `static-checks-in-pr-ci.md` への書き足しを指定しており、1b・1c はその決定（どの確かめをどう走らせるか）の中身を変える。新しい記録で置き換え（Superseded）にせず、同じファイルに書き足し・該当の項目を更新する（前提として bead に記録）
- Q4: 1c のジョブに依存の install が要るか → markdownlint だけが要る（`yarn markdownlint-cli2`）。check-logger-trace と check-docs.sh は checkout だけで走る
- Q5: リポジトリ全体を見るときの対象 → markdownlint は `'**/*.md'`（設定の `gitignore`・`ignores` に従う）、logger.trace は `src` 配下の `*.js`・`*.jsx`・`*.ts`・`*.tsx`（lefthook の glob と同じ）、check-docs.sh は今のままで全体を見る

### 案の比較

#### まとめ役 `checks` の判定の書き方（1a）

- **案 A（推奨）: `toJSON(needs)` を `jq` で見て、全ジョブの `result` が `success` かを判定する**
  - 長所: `needs` に足したジョブが自動で判定の対象になる。確かめを足すときに変えるのは `needs` の 1 か所だけで、判定の書き足し忘れで関門から漏れることがない（依頼の理由「登録を忘れても関門から漏れない」をワークフローの中でも保つ）。各ジョブの結果を 1 行ずつ表示できる
  - 短所: `jq` の式を読む必要がある。`all-tests` のジョブ名を並べる書き方とは見た目が少し違う
- 案 B: `all-tests` と同じく、ジョブごとに `env` で `needs.<id>.result` を受け、シェルで 1 つずつ比べる
  - 長所: 参照の形と見た目がそろい、式が単純
  - 短所: ジョブを足すたびに `needs`・`env`・比較の 3 か所を変える。`needs` に足して比較を書き忘れると、そのジョブの失敗が関門を素通りする（1c で 3 つ足すとき、以後も同じ）
- 案 C: ステップの `if: contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled') || contains(needs.*.result, 'skipped')` で `exit 1`
  - 長所: シェルなしで 1 行
  - 短所: 失敗とみなす値を列挙するため、「成功以外は失敗」の否定形にならない。どのジョブが何の結果だったかがログに出ない

#### 解析なしのビルドの書き方（1b）

- **案 A（推奨）: ワークフローで `yarn next build --turbopack` を直接実行する**
  - 長所: 依頼の範囲（CI のジョブ）だけを変え、手元の `yarn build` は変わらない。`build` スクリプトから `ANALYZE=true` だけを除いた手順になる
  - 短所: `--turbopack` の指定が `package.json` とワークフローの 2 か所になり、片方だけ変えるとずれる
- 案 B: `package.json` の `build` から `ANALYZE=true` を外し、解析用の `analyze` スクリプトを分ける
  - 長所: CI は `yarn build` のままで手順が 1 か所
  - 短所: 依頼の範囲外の手元の挙動を変える。Turbopack では解析のレポートがそもそも作られないため、`analyze` スクリプトの中身（`--webpack` か `next experimental-analyze` か）という別の判断を持ち込む
- 案 C: ワークフローの `env` で `ANALYZE=false` を渡す
  - 短所: スクリプトの中の `ANALYZE=true` が勝つため効かない。不採用

#### 1c のジョブの準備（1c）

- **案 A（推奨）: install が要るのは markdownlint だけ。check-logger-trace と check-docs.sh は checkout だけで走らせる**
  - 長所: 依存の install（約 15 秒）を 2 回減らせる。tf-in9ab の `cache: yarn` は composite action（`.github/actions/setup`）に入るため、markdownlint のジョブにも自動で効く
  - 短所: ジョブごとに準備の手順が違う
- 案 B: 3 つとも既存のジョブと同じく `./.github/actions/setup` を使う
  - 長所: 全ジョブの形がそろう
  - 短所: 使わない依存の install に時間を使う

### 設計（推奨案）

#### 節 1: 1a — まとめ役 `checks`

`static-checks.yml` に次のジョブを足す（id・表示名とも `checks`。`name:` は付けない）:

- `needs: [typecheck, biome, knip, markuplint, build]`
- `if: always()`（前のジョブが落ちても `checks` 自体は必ず走り、結果を報告する）
- `runs-on: ubuntu-latest`、checkout しない
- 1 ステップ: `env` で `NEEDS: ${{ toJSON(needs) }}` を受け、`jq` で各ジョブの `<id>=<result>` を表示してから、すべてが `success` でなければ非 0 で終わる（例: `jq -e 'all(.[]; .result == "success")'`）

決定の記録 `docs/decisions/static-checks-in-pr-ci.md` に書き足す:

- Decision: まとめ役 `checks` を足し、`needs` で全ジョブを待ち、`if: always()` で必ず走らせ、成功以外が 1 つでもあれば落とすこと。必須のチェックに登録するのは `checks`（と `Validate PR title`）だけにすること。必須にする確かめは 1 つのワークフロー（`static-checks.yml`）に置くこと（`needs` が待てるのは同じワークフローのジョブだけのため）。判定は `needs` 全体を見る（案 A）
- 理由: 確かめを足すたびに必須のチェックを登録し直さなくて済み、登録を忘れても関門から漏れない
- Considered Options: 各ジョブを必須のチェックに個別に登録する案（登録し直しと漏れが起きる）と、判定の書き方の案 A・B・C
- Consequences: 既存の「ブランチ保護の required status checks に登録するまでは、ジョブが失敗してもマージは止まらない」を、`checks` を登録するまで、に合わせて更新。確かめを足すときは `needs` にも足す必要があること（足さないと関門に入らない）
- Status・Verification Status・Date は変えない（Verification Status は CI が実際に走るまで Unverified のまま）

#### 節 2: 1b — 解析なしの next build

- `build` ジョブの `run: yarn build` を `run: yarn next build --turbopack` に変える。ジョブの id（`build`）・表示名（`next build`）は変えない
- 決定の記録: Decision の「`next build`: `yarn build`（本番と同じビルド手順）」を、`build` スクリプトから `ANALYZE=true` を除いた `yarn next build --turbopack` に更新する。Context に「`ANALYZE=true` でも Turbopack のビルドでは解析のレポートが作られず警告だけが出る」「`ANALYZE` はスクリプト内で付くため `env` で上書きできない」事実を足す。Consequences に「`build` スクリプトのビルドの指定（`--turbopack` 等）を変えるときはワークフローも合わせる」を足す。Considered Options に 1b の案 B・C を書く

#### 節 3: 1c — markdownlint・check-logger-trace・check-docs.sh のジョブ

3 つのジョブを足し、`checks` の `needs` に入れる（`needs: [typecheck, biome, knip, markuplint, build, markdownlint, check-logger-trace, check-docs]`）:

- `markdownlint`（表示名 `markdownlint`）: checkout → `./.github/actions/setup` → `yarn markdownlint-cli2 '**/*.md'`（glob は引用符で囲みシェルに展開させない。対象の除外は `.markdownlint-cli2.jsonc` に従う）
- `check-logger-trace`（表示名 `check-logger-trace`）: checkout だけ。`src` 配下の `*.js`・`*.jsx`・`*.ts`・`*.tsx` を `grep -rnF 'logger.trace'` で探し、見つかれば該当の `ファイル:行` と `ERROR: Remove 'logger.trace' from the files above.` を出して失敗、見つからなければ成功。`grep` 自体のエラー（exit 2）は成功扱いにしない（lefthook の `&& exit 1 || exit 0` の書き方は持ち込まない）
- `check-docs`（表示名 `check-docs.sh`）: checkout だけ。`bash .lefthook/pre-commit/check-docs.sh`

決定の記録:

- Decision の確かめの一覧に 3 つを足し、install が要らない 2 つは checkout だけで走らせることを書く
- Context に、3 つがリポジトリ全体に対して土台の時点で成功する事実（上の「確かめた事実」）を書く
- タイトルと `docs/decisions/index.md` のリンクの文を「型・Lint・未使用コード・マークアップ・Markdown・ドキュメント・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する」に更新する。ファイル名は変えない
- これで lefthook の中身を確かめる物（biome・markuplint・markdownlint・check-logger-trace・check-docs・knip・tsc）がすべて CI に入り、手元だけに残るのは protect-branch・check-git-clean になる（基準を満たす）ことを Consequences に書く

#### 節 4: エラー時の挙動

- 確かめのジョブが落ちる・取り消される → `checks` は `if: always()` で走り、そのジョブの結果を表示して失敗する
- ワークフローが途中で取り消される（同じ PR に新しい push 等） → `checks` も `cancelled` か失敗になり、必須のチェックは通らない
- `needs` に足し忘れたジョブ → `checks` の判定に入らない。決定の記録の Consequences に、確かめを足すときは `needs` にも足すことを書いて防ぐ

#### 節 5: 確かめ方（テスト）

ワークフローは PR が出るまで GitHub 上で走らないため、手元で次を確かめる:

- YAML として読めること、`checks` の `needs` が全ジョブの id と一致すること（ジョブの id の一覧と `needs` を突き合わせる）
- `checks` の判定のステップを手元の `jq` で、`needs` を模した JSON（全 `success` → 0、1 つ `failure`／`cancelled`／`skipped` → 非 0）に対して走らせる
- 作業用の worktree で、追加・変更したジョブのコマンドのうち `yarn next build --turbopack`、logger.trace の検索、`bash .lefthook/pre-commit/check-docs.sh` が成功すること。logger.trace は一時的に 1 か所入れて失敗することも確かめる（コミットしない）
- `yarn markdownlint-cli2 '**/*.md'` は、作業用の worktree ではなく、ブランチの中身を `git archive` で一時ディレクトリに展開した木で走らせて成功すること（上の「確かめた事実」と同じ方法）。worktree では追跡されない `.claude/memory`（メインのチェックアウトへの symlink）を markdownlint がたどって lint し、コミットしないファイルのエラーで失敗するため。手元で追跡外のファイルのエラーが出ても、`.markdownlint-cli2.jsonc` と `.claude/memory` のファイルは変えない
- `bash .lefthook/pre-commit/check-docs.sh` が決定の記録の更新後も成功すること（index のリンク・必須項目）
- markdownlint が更新した決定の記録に対して成功すること（同じく `git archive` で展開した木で確かめる）

### 受け入れ基準

1. 1a・1b・1c が `chore/lefthook-safe-autofix-and-typecheck` の上の 1 本のスタックで、下から 1a → 1b → 1c の 3 ブランチになっており、それぞれ 1 つの関心事だけを変えている
2. 1a の後: `static-checks.yml` に `checks` があり、`needs` が既存の 5 ジョブ（`typecheck`・`biome`・`knip`・`markuplint`・`build`）、`if: always()`、各ジョブの結果を表示し、`success` 以外が 1 つでもあれば失敗する。決定の記録に、まとめ役を置く決定と理由（登録し直し不要・登録忘れでも関門から漏れない）、必須に登録するのは `checks`（と `Validate PR title`）だけであること、必須にする確かめを 1 つのワークフローに置くことが書かれている
3. 1b の後: `build` ジョブが `yarn next build --turbopack` を実行し、`ANALYZE=true` が付かない。`package.json` は変わらない。決定の記録の `next build` の項目が更新されている
4. 1c の後: `markdownlint`・`check-logger-trace`・`check-docs` の 3 ジョブがあり、`checks` の `needs` に入っている。markdownlint だけが `./.github/actions/setup` を使う。決定の記録の一覧・タイトル・index のリンクが更新されている
5. 各ブランチで、節 5 の確かめがすべて成功する
6. 外部の Action・`permissions`・トリガーは変わらない。`lefthook.yml` は変わらない

### 未解決の問い

- なし（人の答えを要する問いはない）。決めた前提は「確認の問いと答え」の Q1〜Q5 に書いた
- 後の作業への申し送り: tf-in9ab（`cache: yarn`）はこの build の PR が `static-checks.yml` を変えていることを前提にする（mayor の notes の通り、後に流す側の root の notes に書く）。`cache: yarn` は composite action に入るなら 1c の markdownlint のジョブにも効く

### 承認

- 状態: 承認（autonomous、承認レーン tf-8a2c1。承認時に節 3 の logger.trace の文言と決定の記録のタイトルを確定させた）
- 自律承認の根拠: 依頼の原文（tf-1jtse）が 1a〜1c の中身・順序・PR の分け方・`checks` の判定条件・決定の記録の理由を指定しており、残る選択（判定の書き方、解析なしのビルドの書き方、1c のジョブの準備）は依頼の目的とリポジトリの既存の決定から推奨案に決まる。人の答えを要する問いは残っていない

