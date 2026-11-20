# security-and-review-checks-ci specification

## Approved requirements

## 要件: CodeQL・Semgrep・Dependency Review・code-review-graph を tascon-frontend の PR ごとの CI に入れる

- root bead: tf-p0zkq（superpowers-build）／ 部分 bead: tf-c7ibz（依頼 gc-xtys の 2 の一部）
- 承認済みの設計: `/home/node/tascon-frontend/.gc-artifacts/security-and-review-checks-ci/brainstorming/design.md`（案 A、autonomous で承認、tf-8hfy1、2026-11-19）
- 承認の記録: `/home/node/tascon-frontend/.gc-artifacts/security-and-review-checks-ci/brainstorming/design-approval.md`
- 改訂: 反復 2（tf-7iifz）で `design.md`（sha256 `ca8a8064…63a1`）と照らし直した。反復 1 の反映（REQ-012・TS-1・Acceptance Criteria 1・確かめ方の `checks` の `needs` の例外）はそのまま保っている
- `docs/superpowers/specs/` への写し: 作らない。この段の時点でこの build の作業用の worktree と枝がまだ無く、写しを置ける場所が人の開いている main の checkout だけのため（追跡されないファイルを main に残さない）。要件の正本はこのファイル

### Problem Statement

tascon-frontend の PR ごとの CI（`.github/workflows/static-checks.yml` の `typecheck`・`biome`・`knip`・`markuplint`・`build`）には、コードの脆弱性の解析、セキュリティの規則での静的解析、PR で新しく入る依存の既知の脆弱性の確かめ、変更の影響の報告が無い。依頼 gc-xtys の 2 は、この 4 つ（CodeQL・Semgrep・Dependency Review・code-review-graph）を入れ、必須にする確かめはまとめ役のジョブ `checks` の `needs` に入れる形（依頼 gc-wisp-aaqkt4 と同じ形）を求めている。必須にしない物（code-review-graph など）は `needs` に入れない。

まとめ役の `checks` は別の部分 tf-1jtse の build が `static-checks.yml` に足す。この build の枝は tf-1jtse の build の最上段の上に一直線に積み、朝（日本時間 2026-11-20 07:00）までに PR を出せる状態（push 済み）にする。PR を出すのは後段（`open_pr=false`）。

### W6H

- Who（誰が使うか）: tascon-frontend の PR を出す人とレビューする人。必須チェックの登録を決めるのはリポジトリの持ち主（人）
- What（何を作るか）: `static-checks.yml` のジョブ `semgrep` と `dependency-review`（どちらも `checks` の `needs` に入れる）、別のワークフロー `codeql.yml` と `code-review-graph.yml`（どちらも `needs` に入れない）、hash 付きの Python の requirements 2 組、`dependabot.yml` の `pip` の項目、決定の記録 `docs/decisions/security-and-review-checks-in-pr-ci.md` と索引の 1 行
- When（いつ走るか）: `static-checks.yml` のジョブと `code-review-graph.yml` は `pull_request` のみ。`codeql.yml` は `pull_request` と `push: branches: [main]`。納期は push を日本時間 2026-11-20 07:00 より前
- Where（どこに置くか）: `.github/workflows/`、`.github/requirements/`、`.github/dependabot.yml`、`docs/decisions/`。枝は `ci/add-codeql-and-semgrep` → `ci/add-dependency-review` → `ci/add-code-review-graph-report`（下から）で、tf-1jtse の build の最上段（origin に push 済みの先端）の上
- Why（なぜ）: PR の段階でコードの脆弱性・危ない書き方・脆弱な依存を止め、変更の影響を見える形にする。指摘で落ちる物だけを `checks` に入れることで、必須チェックを `checks`（と Validate PR title）に絞る決まりを保つ
- Which（どの案か）: 案 A（合否を返す Semgrep・Dependency Review を `static-checks.yml` に、マージ先の解析が要る CodeQL と報告だけの code-review-graph を別のワークフローに）。案 B（CodeQL も `static-checks.yml` に）と案 C（SARIF に結果があれば落とすジョブ）は採らない
- How（どう固定するか）: 外の Action は 40 桁のコミット SHA と行末のタグのコメント、Python の道具は全パッケージに `--hash=sha256:` の付いた requirements と `pip install --require-hashes`、取り出す Semgrep の規則と code-review-graph のレンダラは `actions/checkout` の `ref:` の SHA。新しく選ぶ版は公開から 2 週間以上たった物

### User Stories

- US-1: PR を出す人として、Semgrep の指摘や脆弱な依存の追加があれば `checks` が落ちてほしい。マージの前に直せるように
- US-2: レビューする人として、PR ごとに CodeQL の解析結果（code scanning のアラート）を見たい。`main` との比較で新しいアラートだけを判断できるように
- US-3: レビューする人として、変更の影響（code-review-graph の報告）を Step Summary で読みたい。ただし報告で PR を止めたくはない
- US-4: リポジトリの持ち主として、必須チェックの登録を自分で決めたい。「Code scanning results / CodeQL」を必須にするかの判断材料を PR の本文で受け取りたい
- US-5: 保守する人として、なぜこの置き場所と固定の仕方にしたのかを決定の記録で後から読みたい

### Technical Stories

- TS-1: `static-checks.yml` に足すジョブは既存のジョブ・トリガー・`permissions` を変えず、行の追加だけで入る。ただし `checks` の `needs` に `semgrep`・`dependency-review` を足すための変更は除く（REQ-012）
- TS-2: 外から持ち込む物はすべて不変の ID で固定され、Python の道具の更新は Dependabot（`pip`）が、規則とレンダラの SHA と Action の SHA は人が手で行う
- TS-3: 追跡されている `.yarn/`（`cache` の zip と `releases/yarn-4.4.0.cjs`）を、3 つの解析の道具（Semgrep・CodeQL・code-review-graph）が自分のコードとして読まない
- TS-4: 3 本の枝は関心事ごとに分かれ、それぞれが自分の道具の分だけ決定の記録を書き、`checks` の `needs` への追加は積み直した後の `static-checks.yml` に対して行う

### Behavior Requirements

#### REQ-001 Semgrep のジョブ

- `static-checks.yml` にジョブ `semgrep` を足す（表示名 `Static Checks / semgrep (pull_request)`）
- 手順: 自分のコードを `actions/checkout`（`persist-credentials: false`）で取り出す → `semgrep/semgrep-rules` を `ref: a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2` で sparse-checkout し `$RUNNER_TEMP` へ移す → `actions/setup-python`（Python `3.13.18`）→ `python -m pip install --require-hashes -r .github/requirements/semgrep.txt` → `semgrep scan` を規則のディレクトリ `typescript/react`・`typescript/lang`・`javascript/react`・`javascript/browser`・`javascript/lang` で、`--metrics=off --error --exclude .yarn` を付けて走らせる
- `.github/requirements/semgrep.in` に `semgrep==1.186.0`、`.github/requirements/semgrep.txt` は `.in` から hash 付きで作った物（全パッケージに `--hash=sha256:`）
- `.github/actions/setup`（Node の準備）は使わない
- 規則のディレクトリのうち実装時に読み込めない物は外し、外した理由を決定の記録に書く
- `checks` の `needs` に `semgrep` を入れる

#### REQ-002 Dependency Review のジョブ

- `static-checks.yml` にジョブ `dependency-review` を足す（表示名 `Static Checks / dependency-review (pull_request)`）
- 手順: `actions/checkout`（`persist-credentials: false`）→ `actions/dependency-review-action`（v5.0.0、`a1d282b36b6f3519aa1f3fc636f609c47dddb294`）を既定の設定で
- ジョブに `permissions:` と `with:` を足さない（ワークフローの `contents: read` を使う）
- `checks` の `needs` に `dependency-review` を入れる

#### REQ-003 CodeQL のワークフロー

- 新しいファイル `.github/workflows/codeql.yml`。ワークフロー名 `CodeQL`、ジョブ `analyze`（表示名 `Analyze (javascript-typescript)`）
- トリガーは `pull_request` と `push: branches: [main]` だけ（`schedule` と `main` 以外への `push` は入れない）
- `permissions: contents: read, security-events: write`
- 手順: `actions/checkout`（`persist-credentials: false`）→ `github/codeql-action/init`（`languages: javascript-typescript`、`build-mode: none`、ワークフローの中の `config:` に `paths-ignore` で `.yarn/` を外す）→ `github/codeql-action/analyze`（`category: "/language:javascript-typescript"`）。codeql-action は v4.39.3 `33d7b85da1a04171e211befe2c739303b9a4c066`
- 設定ファイルを別に増やさない
- `checks` の `needs` には入れない

#### REQ-004 code-review-graph のワークフロー（報告だけ）

- 新しいファイル `.github/workflows/code-review-graph.yml`。ワークフロー名 `code-review-graph`、ジョブ `report`、トリガーは `pull_request` のみ、`permissions: contents: read`
- 本体は `.github/requirements/code-review-graph.in` の `code-review-graph==2.4.0` から hash 付きで作った `.github/requirements/code-review-graph.txt` を `pip install --require-hashes` で入れる
- レンダラは `tirth8205/code-review-graph` のタグ v2.4.0 の SHA `b3f1285965a1337b3821e4423da03b65d70ee423` を `ref:` に指定し、`scripts/render_pr_comment.py` だけを取り出して `$RUNNER_TEMP` へ移す
- マージ先のブランチ（`github.base_ref`。スタックの PR では `main` 以外もある）を fetch → `build` → `detect-changes --base "origin/${BASE_REF}"` → レンダラで Markdown にして Step Summary（`$GITHUB_STEP_SUMMARY`）に書く
- ジョブが落ちるのはレンダラの終了コードが 4（解析が走らなかった）のときだけ。リスクの高さでは落ちない
- `--fail-on-risk`・PR へのコメント・キャッシュを使わない。「Allow GitHub Actions to create and approve pull requests」の設定を変えない
- `checks` の `needs` に入れない

#### REQ-005 固定の仕方

- ローカルの `./.github/actions/setup` を除く全 `uses:` が 40 桁のコミット SHA と行末のタグのコメント（例: `# v7.0.1`）
- 使う SHA: `actions/checkout` v7.0.1 `3d3c42e5aac5ba805825da76410c181273ba90b1`（既存と同じ）、`actions/setup-python` v7.1.0 `6d4fd22b20465ccc0f7354476588e8df7c9ca0e0`、`github/codeql-action` v4.39.3 `33d7b85da1a04171e211befe2c739303b9a4c066`、`actions/dependency-review-action` v5.0.0 `a1d282b36b6f3519aa1f3fc636f609c47dddb294`
- 新しく持ち込む Action・Python の道具の版・規則とレンダラの SHA は、公開から 2 週間以上たっていることを実装時に確かめる。2 週間に満たない物があれば、その道具の、公開から 2 週間以上たった直近のリリースに替え、替えたことと理由を決定の記録に書く
- Python の requirements の `.txt` は全パッケージ（依存を含む）に `--hash=sha256:` が付く

#### REQ-006 Dependabot の `pip`

- `.github/dependabot.yml` に `package-ecosystem: 'pip'`、`directory: '/.github/requirements'` の項目を足す。書き方・時刻・`commit-message` の `prefix: 'build'`・`target-branch: 'main'` は既存の `npm` の項目に合わせる
- `github-actions` の項目は足さない（Action は手で更新する既存の決定のまま）

#### REQ-007 `.yarn/` を解析から外す

- Semgrep は `--exclude .yarn`、CodeQL は `init` の `config:` の `paths-ignore`、code-review-graph はその道具の除外の仕組みで `.yarn/` を外す
- code-review-graph に `.yarn/` を外す仕組みが無い・使えないと実装時に分かった場合は、外さずにそのまま入れ、その事実を PR の本文用のメモ（実装の要約）に書く

#### REQ-008 既存の Semgrep の指摘

- 積み直した後の中身で、固定した版と規則で `semgrep` をローカルで走らせ、指摘の件数を記録する（実装の要約）
- 誤検知・意図した使い方の指摘は、挙動を変えずに、行ごとの `nosemgrep: <rule-id>` と理由のコメントで外す
- 本物の問題の指摘は外さない。その内容を bead の notes と mayor へのメールで報告し、build を止める（直すかは人が決める）
- 最終的に積み直した後の中身で `semgrep` の終了コードが 0

#### REQ-009 決定の記録

- 新しいファイル `docs/decisions/security-and-review-checks-in-pr-ci.md`（1 決定: 「セキュリティと変更の影響を見る道具を PR ごとの CI に入れ、指摘で落ちる物だけを `checks` の `needs` に入れる」）と `docs/decisions/index.md` の 1 行。形式は `.claude/rules/decisions-maintenance.md` に従う（日本語、1 決定 1 ファイル）
- Decision: 4 つの道具、置き場所（`needs` に入る物と、別のワークフローの物とその理由）、固定の仕方
- Considered Options: 案 A・B・C、DeepSec、Claude Code の `/security-review`、Semgrep のレジストリ（`p/react` など）、code-review-graph に `fail-on-risk` を付ける案・必須にする案。理由は道具の公式の文書に基づく
- Consequences: CodeQL のアラートは「Code scanning results / CodeQL」を人が必須に登録しないと PR を止めない、Semgrep の規則とレンダラの SHA は手で更新する、`nosemgrep` で外した行を変えるときは外した理由を見直す
- 枝ごとの書き分け: `ci/add-codeql-and-semgrep` がファイルと索引の 1 行を作り、CodeQL・Semgrep・置き場所の決まり・固定の仕方・案 A〜C・DeepSec・`/security-review`・Semgrep のレジストリを書く。`ci/add-dependency-review` が Dependency Review を Decision に書き足す。`ci/add-code-review-graph-report` が code-review-graph（報告だけにする理由、`fail-on-risk` を付ける案・必須にする案、レンダラの SHA の手での更新）を書き足す

#### REQ-010 枝・積み方・push

- 3 本の枝（下から）: `ci/add-codeql-and-semgrep`（`codeql.yml`、ジョブ `semgrep`、`.github/requirements/semgrep.in`/`.txt`、`dependabot.yml` の `pip`、既存の指摘への対応、決定の記録の作成と索引）→ `ci/add-dependency-review`（ジョブ `dependency-review`、決定の記録への追記）→ `ci/add-code-review-graph-report`（`code-review-graph.yml`、`.github/requirements/code-review-graph.in`/`.txt`、決定の記録への追記）
- 枝・コミット・積み直し・push の操作は `git-spice-workflow` スキルの手順で行う（`gh stack` は使わない）
- 始めは `chore/lefthook-safe-autofix-and-typecheck` から切ってよい。push の前に、3 本を tf-1jtse の build の最上段（origin に push 済みの先端）の上へ一直線に並べる
- `checks` の `needs` への追加は並べた後に行う（`ci/add-codeql-and-semgrep` が `semgrep` を、`ci/add-dependency-review` が `dependency-review` を足す）。並べた後の中身で確かめ（Behavior Requirements の確かめ・Acceptance Criteria）が通る
- tf-1jtse の build がまだ push されていないときは、枝分かれのまま push せず、mayor に知らせる
- 並べた後の `static-checks.yml` に `checks` が無い・形が違うときは、その形に合わせる。合わせられなければ blocker として bead に記録する
- PR は作らない（`open_pr=false`、後段が出す）

#### REQ-011 PR の本文用の情報

- 実装の要約（`/home/node/tascon-frontend/.gc-artifacts/security-and-review-checks-ci/implementation-summary.md`）に、新しいチェックの表示される名前の一覧を書く: `Static Checks / semgrep (pull_request)`、`Static Checks / dependency-review (pull_request)`、`CodeQL / Analyze (javascript-typescript) (pull_request)`、`code-review-graph / report (pull_request)`、GitHub が出す `Code scanning results / CodeQL`
- 同じ所に PR の本文の Notes 用として次を書く: 「Code scanning results / CodeQL」を必須にするかは人が決めること、Dependency Review が Yarn 4 の `yarn.lock` を読めるかは PR のチェックで確かめること、REQ-007 で `.yarn/` を外せなかった場合はその事実

#### REQ-012 変えない物

- `static-checks.yml` の既存のジョブ・トリガー・`permissions` を変えない（`push` トリガーを足さない）。差分は行の追加だけ。ただし `checks` の `needs` に `semgrep`・`dependency-review` を足すための変更は除く。この変更でも `needs` の既存の項目は消さず、並びも変えない（足す 2 つは末尾に置く）。`needs` の書き方（tf-1jtse の要件どおりの 1 行の flow 形式か、block 形式か）は並べた後の `static-checks.yml` の形に合わせ、書き方を変えない。flow 形式なら `needs` の 1 行が置き換わるのは、この例外に当たる
- 必須チェック（ブランチ保護）とリポジトリの設定を変えない
- `lefthook.yml` と `.lefthook/` を変えない
- Semgrep の規則をリポジトリに写さない（配布しない）。規則をレジストリから取らない
- テストの道具（Vitest など、部分 tf-dj4bc の担当）を入れない

### Example Mapping

#### 規則: 指摘で落ちる物だけを `checks` の `needs` に入れる（REQ-001・REQ-002・REQ-003・REQ-004）

- 例: PR に `dangerouslySetInnerHTML` へ外からの値を渡す行が入り、Semgrep の規則に当たる → ジョブ `semgrep` が落ち、`checks` が落ちる
- 例: PR が既知の high の脆弱性のある npm パッケージを `package.json` に足す → ジョブ `dependency-review` が落ち、`checks` が落ちる
- 例: CodeQL が PR で新しい high のアラートを出す → `checks` は落ちない。GitHub の「Code scanning results / CodeQL」が落ちる（必須にするかは人が決める）
- 例: code-review-graph が影響の大きい変更と報告する → ジョブ `report` は成功し、Step Summary に報告が出る。`checks` は関係しない
- 例: code-review-graph のレンダラが終了コード 4（解析が走らなかった）を返す → ジョブ `report` だけが落ち、`checks` は関係しない

#### 規則: CodeQL は `main` の解析と比べる（REQ-003）

- 例: `main` への push → `codeql.yml` が走り、`main` の解析が code scanning に上がる
- 例: `main` 以外の枝への push → `codeql.yml` は走らない
- 例: スタックの上段の PR（マージ先が `main` 以外）→ `pull_request` で走る

#### 規則: 外の物は不変の ID で固定する（REQ-005）

- 例: `uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` → 適合
- 例: `uses: actions/checkout@v7` → 不適合
- 例: `semgrep.txt` の 1 パッケージに `--hash=sha256:` が無い → 不適合（`pip install --require-hashes` が失敗する）
- 例: 予定の SHA のリリースが公開から 2 週間に満たない → 2 週間以上たった直近のリリースに替え、決定の記録に書く

#### 規則: 既存の Semgrep の指摘は挙動を変えずに扱う（REQ-008）

- 例: 意図した使い方の指摘 → その行に `// nosemgrep: <rule-id>` と理由のコメントを付け、コードの挙動は変えない
- 例: 本物の脆弱性の指摘 → 外さず、bead の notes と mayor へのメールで報告し、build を止める

#### 規則: 下の build の上に積んでから push する（REQ-010）

- 例: tf-1jtse の build の最上段が origin に push 済み → 3 本をその上に一直線に並べ、`needs` を足し、確かめが通ってから push
- 例: tf-1jtse の build がまだ push されていない → push せず mayor に知らせる
- 例: 並べた後の `static-checks.yml` に `checks` が無い → 並べた後の形に合わせられなければ blocker として記録する

### Acceptance Criteria

1. `static-checks.yml` にジョブ `semgrep` と `dependency-review` があり、どちらも `checks` の `needs` にある。既存のジョブ・トリガー・`permissions` は変わっておらず、差分は行の追加だけ。例外は `checks` の `needs` に `semgrep`・`dependency-review` を足す変更だけで、`needs` の既存の項目が消えておらず並びも変わっていない（REQ-001・REQ-002・REQ-012）
2. `codeql.yml` があり、`pull_request` と `push: branches: [main]` で走り、`languages: javascript-typescript`・`build-mode: none`・`category: "/language:javascript-typescript"` で、`config:` の `paths-ignore` で `.yarn/` を外している。`checks` の `needs` には無い（REQ-003・REQ-007）
3. `code-review-graph.yml` があり、報告を Step Summary に書くだけで、レンダラの終了コード 4 のときだけ落ちる。`--fail-on-risk`・PR へのコメント・キャッシュが無く、`needs` に無い（REQ-004）
4. ローカルの `./.github/actions/setup` を除く全 `uses:` が 40 桁の SHA と行末のタグのコメント。`.github/requirements/semgrep.txt` と `.github/requirements/code-review-graph.txt` の全パッケージに `--hash=sha256:` があり、`pip install --require-hashes` で入る。規則とレンダラは `ref:` の SHA で取り出す。新しく持ち込む物は公開から 2 週間以上たっている（REQ-005）
5. `dependabot.yml` に `/.github/requirements` の `pip` の項目があり、既存の `npm` の項目と同じ書き方。`github-actions` の項目は無い（REQ-006）
6. Semgrep・CodeQL・code-review-graph のどれもが `.yarn/` を外している。外せなかった道具があれば実装の要約に書いてある（REQ-007）
7. 並べた後の中身で、固定した版と規則の Semgrep が終了コード 0。外した指摘には行ごとの `nosemgrep: <rule-id>` と理由のコメントがあり、コードの挙動は変わっていない（REQ-008）
8. `docs/decisions/security-and-review-checks-in-pr-ci.md` と `docs/decisions/index.md` の 1 行が `.claude/rules/decisions-maintenance.md` の形式どおりにあり、3 本の枝がそれぞれ自分の道具の分を書いている（REQ-009）
9. 3 本の枝が tf-1jtse の build の最上段の上に一直線に並び、push されている。下が未 push だったなら push せず mayor に知らせている（REQ-010）
10. 実装の要約に、新しいチェックの表示される名前の一覧と PR の本文の Notes 用のメモがある（REQ-011）
11. 必須チェックとリポジトリの設定、`lefthook.yml` と `.lefthook/` が変わっていない（REQ-012）

| ID | Status | 内容 |
| --- | --- | --- |
| REQ-001 | covered | Semgrep のジョブを `static-checks.yml` に足し `needs` に入れる |
| REQ-002 | covered | Dependency Review のジョブを `static-checks.yml` に足し `needs` に入れる |
| REQ-003 | covered | CodeQL を別のワークフロー `codeql.yml` に置く |
| REQ-004 | covered | code-review-graph を報告だけの別のワークフローに置く |
| REQ-005 | covered | 外の物を不変の ID で固定する |
| REQ-006 | covered | `dependabot.yml` に `pip` を足す |
| REQ-007 | covered | `.yarn/` を解析から外す |
| REQ-008 | covered | 既存の Semgrep の指摘を挙動を変えずに扱う |
| REQ-009 | covered | 決定の記録と索引の 1 行を枝ごとに書く |
| REQ-010 | covered | 3 本の枝を下の build の上に積んでから push する |
| REQ-011 | covered | PR の本文用のチェックの名前と Notes を残す |
| REQ-012 | covered | 既存のジョブ・設定・lefthook を変えない |

#### 確かめ方（テストの期待）

- `actionlint` があれば全ワークフローに走らせる。無ければ「実行していない」と実装の要約に書く
- ローカルで固定した版・規則の `semgrep` を、並べた後の中身に走らせて終了コード 0
- 2 つの requirements を新しい venv に `pip install --require-hashes` で入れて成功し、`.txt` の全パッケージに hash があることを確かめる
- `git diff` で `static-checks.yml` の差分が追加だけ（`checks` の `needs` に 2 つを足す変更は除く。その変更の前後で `needs` の既存の項目と並びが同じこと）、`checks` の `needs` に `semgrep` と `dependency-review` があり、`analyze`・`report` が無いことを確かめる
- 全 `uses:` を grep し、`./.github/actions/setup` を除いて 40 桁の SHA とタグのコメントであることを確かめる
- 決定の記録の形式を `.claude/rules/decisions-maintenance.md` と照らす。tf-1jtse の 1c で入る `check-docs.sh` があれば走らせる
- GitHub Actions 上での実行（Dependency Review が Yarn 4 の `yarn.lock` を読めること、CodeQL の結果のアップロード、code-review-graph の Step Summary）は push 後の PR のチェックで確かめる。この build の確かめの対象はローカルで確かめられる物まで

### Out Of Scope

- 必須チェック（ブランチ保護）の設定とリポジトリの設定の変更（「Allow GitHub Actions to create and approve pull requests」を含む）
- `static-checks.yml` の既存ジョブ・トリガー・`permissions` の変更、`push` トリガーの追加
- `dependabot.yml` への `github-actions` の追加
- Semgrep の規則のリポジトリへの写し、レジストリ（`p/react` など）からの規則の取得
- code-review-graph の `--fail-on-risk`、PR へのコメント、キャッシュ、必須化
- CodeQL の `schedule` での実行、`main` 以外の枝への `push` の解析
- テストの道具（Vitest・React Testing Library・MSW・V8 coverage・Playwright・Stryker、部分 tf-dj4bc）
- 既存の指摘を外すための挙動の変更、本物の問題の修正（人が決める）
- PR の作成（後段の stack-review が出す）
- `lefthook.yml` と `.lefthook/` の変更

### Open Questions

設計の承認と実装を止めない問いだけが残る。どちらも扱い方は決まっている。

- 「Code scanning results / CodeQL」を必須のチェックに登録するか: 人が GitHub の設定で決める。この build は決めずに、REQ-011 で PR の本文の Notes 用に書き残す
- GitHub の dependency graph が Yarn 4 の `yarn.lock` を読めるか: push 後の PR のチェックで確かめる。読めなければ、その PR を扱う後段が bead の notes に書いて報告する。この build の設計（ジョブ `dependency-review` を `needs` に入れる）は変えない

## Adopted design

## 設計候補: CodeQL・Semgrep・Dependency Review・code-review-graph を tascon-frontend の CI に入れる

- root bead: tf-p0zkq（superpowers-build）／ 部分 bead: tf-c7ibz（依頼 gc-xtys の 2 の一部）
- 設計 bead: tf-26nt3（iteration 1, attempt 1）
- 承認モード: autonomous
- 承認状態: **承認（autonomous、tf-8hfy1、2026-11-19）**（根拠は末尾の「承認状態」節）

### Superpowers チェックリストの進み具合

1. プロジェクトの文脈の調査: 済み（下の「調べたこと」）
2. Visual Companion: 提案しない。CI の設定の変更で、見た目で選ぶ問いが無い
3. 確かめの問い: 人への問いは無し。依頼の原文・mayor の notes・バックエンドの先例（tascon-backend #837・#839・#840、build tb-u5bv6）と依頼 gc-n91n の条件で決まる。決めきれない点は「前提として置いたこと」に書いた
4. 2〜3 の案と推奨: 下の「案の比較」
5. 推奨の設計を節ごとに提示: 下の「設計」

### 求められている結果

tascon-frontend の PR ごとの CI に次の 4 つを入れる。

- CodeQL（JavaScript/TypeScript）: コードの脆弱性の解析
- Semgrep: React/TypeScript/ブラウザの JS の規則での静的解析
- Dependency Review: PR で新しく入る依存の既知の脆弱性を止める
- code-review-graph（tirth8205/code-review-graph）: 変更の影響の報告だけ

必須にする確かめは、まとめ役のジョブ `checks`（部分 tf-1jtse の build が `static-checks.yml` に足す）の `needs` に入れる。必須にしない物（code-review-graph など）は `needs` に入れない。

### 調べたこと

- `.github/workflows/` は `semantic-pull-request.yml` と `static-checks.yml`（`pull_request` のみ、`permissions: contents: read`、ジョブ `typecheck`・`biome`・`knip`・`markuplint`・`build`）。準備は `.github/actions/setup`（setup-node `22.22.2`、`corepack enable`、`yarn install --immutable`）
- `docs/decisions/static-checks-in-pr-ci.md`: 外部の Action は「公開から 2 週間以上たったリリースのコミット SHA で固定し、行末にタグをコメント」。依存のキャッシュ・`concurrency`・`push` トリガーは `Static Checks` に入れない。Action の更新は手で行う
- `.github/dependabot.yml`: `docker` と `npm` だけ（`github-actions`・`pip` は無い）
- リポジトリは PUBLIC。CodeQL の code scanning と Dependency Review は追加の契約なしで使える
- `.yarnrc.yml` は `nodeLinker: node-modules`（`.pnp.cjs` は無い）。`.yarn/` は追跡対象で 875 ファイル（`cache` の zip と `releases/yarn-4.4.0.cjs`、2.7MB の JS）。解析の道具がこの JS を自分のコードとして読まないよう外す必要がある
- アプリのコードは `src/`（479 ファイル）。Next.js・React・TypeScript
- `semgrep/semgrep-rules`（バックエンドが固定した SHA `a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2`）に `typescript/{react,lang,…}` と `javascript/{react,browser,lang,…}` がある
- GitHub の文書: code scanning の PR の関門は GitHub が出すチェック「Code scanning results / CodeQL」（既定で `error`・`critical`・`high` の新しいアラートで落ちる）。新しいアラートかは「PR の head の解析」と「マージ先のブランチの解析」を比べて決まるので、マージ先（`main`）の解析が要る（`on: push` で `main` を解析する）
- バックエンドの先例（#837・#839・#840、すべて OPEN）:
  - `codeql.yml` は別のワークフロー（`pull_request` と `push: branches: [main]`、`permissions: contents: read, security-events: write`、`build-mode: none`）
  - `semgrep` と `dependency-review` は `ci.yml` のジョブ。Semgrep は `.github/requirements/semgrep.in`/`.txt`（hash 付き、`pip install --require-hashes`）で入れ、規則は `actions/checkout` で SHA を指定して取り出し、`$RUNNER_TEMP` へ移して `--metrics=off --error` で走らせる。既存の指摘は挙動を変えずに `nosemgrep` と理由のコメントで外した
  - `code-review-graph.yml` は別のワークフロー。本体は hash 付きの requirements、レンダラ（`scripts/render_pr_comment.py`）は同じ版のタグの SHA で取り出す。Step Summary に書き、解析が走らなかったとき（レンダラの終了コード 4）だけ落ちる。`--fail-on-risk`・キャッシュ・PR へのコメントは使わない
  - `dependabot.yml` に `pip`（`/.github/requirements`）を足した
  - 決定の記録 `test-and-check-tool-selection.md`（DeepSec と `/security-review` を入れない理由を Considered Options に）と `ci-required-and-report-only-checks.md`
- 依頼 gc-n91n（バックエンド）の 3・5 の条件: 外の Action はコミットの ID で固定する。Dependency Review は PR で新しく入る依存の既知の脆弱性を止める。code-review-graph は報告だけ（`fail-on-risk` を付けない、必須にしない、「Allow GitHub Actions to create and approve pull requests」の設定は変えない）。PyPI の本体の版も固定の仕方を決める。新しく作るジョブの表示される名前を PR の本文に一覧にする。必須チェックの設定は変えない
- 部分 tf-1jtse の build（root tf-rrr6j、`.gc-artifacts/ci-checks-aggregator`）はまだ設計の前（`design.md` が無い）。1a で `checks`（`if: always()`、全ジョブを `needs`）が足される

### 制約

- 必須にする確かめは `static-checks.yml` のジョブにして `checks` の `needs` に入れる。必須にしない物は `needs` に入れない（mayor 15:09Z の notes と依頼の原文）
- スタックの並び（下から）: … → `chore/lefthook-safe-autofix-and-typecheck`（#955）→ tf-1jtse の 1a → 1b → 1c → **この build の枝** → tf-dj4bc の build の枝。始めは `chore/lefthook-safe-autofix-and-typecheck` から切ってよいが、push の前に tf-1jtse の build の最上段（origin に push 済みの先端）の上へ一直線に並べ、並べた後の `static-checks.yml` に合わせて `needs` を足し、並べた後の中身で確かめが通ること。下の build がまだ push されていなければ、枝分かれのまま push せず mayor に知らせる
- 朝（日本時間 2026-11-20 07:00）までに PR を出す（open_pr=false なので PR は後段の stack-review が出す。この build は push まで）
- 外から持ち込む物はすべて不変の ID で固定する（Action は 40 桁の SHA と行末のタグのコメント、Python の道具は hash 付きの requirements、取り出す規則とレンダラは `ref:` の SHA）。新しく選ぶ版は公開から 2 週間以上たった物
- リポジトリのルール（`.claude/rules/decisions-maintenance.md` の形式、1 決定 1 ファイル、日本語）とスキル（`git-spice-workflow`）に従う
- 必須チェックの登録・リポジトリの設定は変えない（人が決める）
- `lefthook.yml` と `.lefthook/` は変えない

### やらないこと

- 必須チェック（ブランチ保護）の設定の変更
- `static-checks.yml` の既存ジョブ・トリガー・`permissions` の変更（`push` トリガーも足さない）
- `dependabot.yml` への `github-actions` の追加（既存の決定どおり Action は手で更新）
- Semgrep の規則のリポジトリへの写し（ライセンス上、配布しない）、レジストリ（`p/react` など）からの取得
- code-review-graph の `--fail-on-risk`、PR へのコメント、キャッシュ、必須化。「Allow GitHub Actions to create and approve pull requests」の設定の変更
- CodeQL の `schedule` の実行、`main` 以外のブランチへの `push` の解析
- テストの道具（Vitest など、部分 tf-dj4bc）
- 既存の指摘を外すための挙動の変更（指摘が本物の問題なら、外さずに報告して判断を仰ぐ。下の「失敗時の扱い」）

### 案の比較

#### 案 A（推奨）: 合否を返す道具だけを `static-checks.yml` に、基準の解析が要る CodeQL と報告だけの code-review-graph は別のワークフローに

- `static-checks.yml` にジョブ `semgrep` と `dependency-review` を足し、`checks` の `needs` に入れる
- `codeql.yml`（`pull_request` と `push: branches: [main]`）を別に置く。`needs` には入らない。アラートの関門は GitHub の「Code scanning results / CodeQL」で、これを必須にするかは人が決める
- `code-review-graph.yml` を別に置く（報告だけ）
- 長所: バックエンドの先例と同じ形で、レビューと保守の見通しがよい。`Static Checks` に `push` トリガーと `security-events: write` を入れずに済み、既存の決定を崩さない。CodeQL の PR の比較に要る `main` の解析が得られる
- 短所: CodeQL の解析のジョブが落ちても `checks` は落ちない。CodeQL のアラートで PR を止めるには、`checks` とは別に「Code scanning results / CodeQL」を人が必須に登録する必要がある

#### 案 B: CodeQL も `static-checks.yml` のジョブにして `needs` に入れる

- 長所: 「解析が走ったこと」が `checks` の合否に入る
- 短所: マージ先の解析が無いと新しいアラートの判定ができないため、`Static Checks` に `push: main` を足す（既存の 5 ジョブも `main` で走り、決定 `static-checks-in-pr-ci.md` の「push トリガーは入れない」を変える）か、CodeQL を 2 か所に書くことになる。`checks` を通ってもアラートでは落ちない（関門は依然 GitHub のチェック）ので、得る物が小さい

#### 案 C: CodeQL の SARIF に結果があれば落とすジョブを `static-checks.yml` に入れる

- 長所: CodeQL のアラートそのものが `checks` で PR を止める
- 短所: 既存のアラートも毎回落とす。CodeQL には Semgrep の `nosemgrep` に当たる行ごとの外し方が無く、外すには query の filter の設定か画面での却下が要り、却下しても SARIF からは消えない。仕組みが自前になり、YAGNI に反する

**推奨: 案 A。** 依頼が先例として指すバックエンドと同じ形で、既存の決定を変えず、`needs` に入れる物（Semgrep・Dependency Review）は両方とも指摘で落ちる道具。CodeQL のアラートの関門は案 B でも `checks` に入らないので、案 B の追加の費用に見合わない。

### 設計

#### 1. ブランチと PR の分け方

関心事ごとに 3 本の枝（PR は後段で 1 本ずつ）。下から:

1. `ci/add-codeql-and-semgrep`: `codeql.yml`、`static-checks.yml` のジョブ `semgrep`、`.github/requirements/semgrep.in`/`.txt`、`dependabot.yml` の `pip`、既存の Semgrep の指摘への対応、決定の記録とその索引
2. `ci/add-dependency-review`: `static-checks.yml` のジョブ `dependency-review`
3. `ci/add-code-review-graph-report`: `code-review-graph.yml`、`.github/requirements/code-review-graph.in`/`.txt`、決定の記録への追記（報告だけにする理由）

push の前に 3 本を tf-1jtse の build の最上段の上に一直線に並べ（`git-spice-workflow` スキルの手順、`gs upstack onto` など）、`checks` の `needs` への追加は並べた後に行う（1・2 の枝それぞれで自分のジョブを足す）。tf-dj4bc の build の枝がこの上に積まれ、同じ `needs` を触る。後から並ぶ側が積み直しで合わせる。

#### 2. Semgrep（`static-checks.yml` のジョブ `semgrep`）

- ジョブ名 `semgrep`。手順はバックエンドと同じ: 自分のコードを `persist-credentials: false` で checkout → `semgrep/semgrep-rules` を `ref:` に SHA を指定して sparse-checkout → `$RUNNER_TEMP` へ移す → `actions/setup-python`（SHA で固定）→ `python -m pip install --require-hashes -r .github/requirements/semgrep.txt` → `semgrep scan --config <dir> … --metrics=off --error --exclude .yarn`
- 規則: `typescript/react`・`typescript/lang`・`javascript/react`・`javascript/browser`・`javascript/lang`（Next.js・React・TypeScript とブラウザの JS に当たる所）。規則の SHA はバックエンドと同じ `a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2` を使う
- 版: `semgrep==1.186.0`（バックエンドと同じ）。`.in` から `pip-compile --generate-hashes` 相当で `.txt` を作り、全パッケージに `--hash=sha256:` が付くこと
- `.yarn/` は解析から外す（`--exclude`）。`setup` の composite action（Node の準備）は使わない
- `checks` の `needs` に `semgrep` を入れる
- 既存の指摘: 並べた後の中身で `semgrep` を走らせ、件数を記録する。誤検知・意図した使い方は、挙動を変えずに行ごとの `nosemgrep: <rule-id>` と理由のコメントで外す。本物の問題は外さず、「失敗時の扱い」に従う

#### 3. CodeQL（別のワークフロー `codeql.yml`）

- ワークフロー名 `CodeQL`、ジョブ `analyze`（表示名 `Analyze (javascript-typescript)`）
- トリガー: `pull_request` と `push: branches: [main]`
- `permissions: contents: read, security-events: write`
- 手順: checkout（`persist-credentials: false`）→ `github/codeql-action/init`（`languages: javascript-typescript`、`build-mode: none`、`.yarn/` を外す設定）→ `github/codeql-action/analyze`（`category: "/language:javascript-typescript"`）。codeql-action の SHA はバックエンドと同じ v4.39.3 `33d7b85da1a04171e211befe2c739303b9a4c066`
- `.yarn/` を外す方法は `init` の `config:`（`paths-ignore`）を使う。設定ファイルを増やさずワークフローの中に書く
- `checks` の `needs` には入れない（別のワークフローのため入れられない）。「Code scanning results / CodeQL」を必須にするかは人が決める（PR の本文の Notes に書く）

#### 4. Dependency Review（`static-checks.yml` のジョブ `dependency-review`）

- ジョブ名 `dependency-review`。checkout（`persist-credentials: false`）→ `actions/dependency-review-action`（バックエンドと同じ v5.0.0 `a1d282b36b6f3519aa1f3fc636f609c47dddb294`）を既定の設定で
- ジョブに `permissions:` と `with:` を足さない（ワークフローの `contents: read` で足りる）
- `checks` の `needs` に入れる

#### 5. code-review-graph（別のワークフロー `code-review-graph.yml`）

- バックエンドの `code-review-graph.yml` と同じ形（ワークフロー名 `code-review-graph`、ジョブ `report`、`pull_request` のみ、`permissions: contents: read`）
- 本体 `code-review-graph==2.4.0` を hash 付きの `.github/requirements/code-review-graph.txt` で入れる。レンダラは同じ版のタグ v2.4.0 の SHA `b3f1285965a1337b3821e4423da03b65d70ee423` から `scripts/render_pr_comment.py` だけ取り出し、`$RUNNER_TEMP` へ移す
- マージ先のブランチを fetch（`github.base_ref`、スタックの PR では `main` 以外にもなる）→ `build` → `detect-changes --base "origin/${BASE_REF}"` → レンダラで Markdown にし Step Summary に書く。レンダラの終了コード 4（解析が走らなかった）のときだけジョブを落とす
- `.yarn/` を解析から外す（code-review-graph の除外の仕組みを実装時に確かめ、使えなければ PR の本文に書く）
- `--fail-on-risk`・PR へのコメント・キャッシュは使わない。`checks` の `needs` に入れない

#### 6. 固定と更新

- `.github/dependabot.yml` に `pip`（`directory: '/.github/requirements'`）を足す。書き方・時刻・`prefix: 'build'`・`target-branch: 'main'` は既存の `npm` の項目に合わせる
- Semgrep の規則の SHA と code-review-graph のレンダラの SHA は Dependabot の対象外で、手で更新する（決定の記録の Consequences に書く）
- 新しい Action の SHA は、バックエンドで使った物と同じにする（公開から 2 週間以上を実装時に確かめる）。`actions/checkout` は既存と同じ v7.0.1 `3d3c42e5aac5ba805825da76410c181273ba90b1`、`actions/setup-python` は v7.1.0 `6d4fd22b20465ccc0f7354476588e8df7c9ca0e0`、Python は `3.13.18`

#### 7. 決定の記録

- 新しいファイル `docs/decisions/security-and-review-checks-in-pr-ci.md`（1 決定: 「セキュリティと変更の影響を見る道具を PR ごとの CI に入れ、指摘で落ちる物だけを `checks` の `needs` に入れる」）と `docs/decisions/index.md` の 1 行。形式は `.claude/rules/decisions-maintenance.md` に従う
  - Decision: 4 つの道具、置き場所（`needs` に入る物、別のワークフローの物とその理由）、固定の仕方
  - Considered Options: 案 A・B・C、DeepSec、Claude Code の `/security-review`、Semgrep のレジストリ、code-review-graph に `fail-on-risk` を付ける・必須にする。理由はバックエンドの記録と同じく道具の公式の文書に基づく
  - Consequences: CodeQL のアラートは「Code scanning results / CodeQL」を人が必須に登録しないと PR を止めない、手で更新する SHA、`nosemgrep` で外した行を変えるときの見直し
- 枝ごとに自分の道具の分を書く: 1 の枝でファイルと索引の 1 行を作り、CodeQL・Semgrep・置き場所の決まり（`needs` に入れる物と別のワークフローの物）・固定の仕方・案 A〜C・DeepSec・`/security-review`・Semgrep のレジストリを書く。2 の枝で Dependency Review を Decision に書き足す。3 の枝で code-review-graph（報告だけにする理由、`fail-on-risk` を付ける・必須にする案、レンダラの SHA の手での更新）を書き足す

#### 8. 失敗時の扱い

- Semgrep の既存の指摘が本物の問題だった場合: 外さず、直すかは人が決める。その指摘の内容を bead の notes と mayor へのメールで報告し、build は止める（勝手に挙動を変えない）
- 下の build（tf-1jtse）がまだ push されていない場合: push せず mayor に知らせる
- 並べた後に `checks` が無い・形が違う場合: 並べた後の `static-checks.yml` に合わせる。合わせられなければ blocker として記録する

#### 9. 確かめ方

- `actionlint` があれば全ワークフローに（無ければ「実行していない」と記録）
- ローカルで `semgrep` を固定した版・規則で走らせ、並べた後の中身で終了コード 0
- `pip install --require-hashes` で 2 つの requirements が入ること、`.txt` の全行に hash があること
- `static-checks.yml` の差分が追加だけ（既存の行を消していない）こと。ただし `checks` の `needs` に `semgrep`・`dependency-review` を足す変更は除く（`needs` の既存の項目は消さず並びも変えない。書き方の flow／block は並べた後の形に合わせる）。`checks` の `needs` に `semgrep` と `dependency-review` があり、code-review-graph と CodeQL が無いこと
- 全 `uses:` が 40 桁の SHA とタグのコメント（ローカルの `./.github/actions/setup` を除く）
- 決定の記録の形式（tf-1jtse の 1c で入る `check-docs.sh` があればそれも）
- GitHub Actions での実行は PR のチェックで確かめる（Dependency Review が Yarn 4 の `yarn.lock` を読めること、CodeQL のアップロード、code-review-graph の Step Summary を含む）

### 受け入れの基準

1. `static-checks.yml` にジョブ `semgrep` と `dependency-review` があり、どちらも `checks` の `needs` にある。既存のジョブ・トリガー・`permissions` は変わっていない
2. `codeql.yml` があり、`pull_request` と `push: branches: [main]` で走り、`languages: javascript-typescript`・`build-mode: none` で `.yarn/` を外している。`checks` の `needs` には無い
3. `code-review-graph.yml` があり、報告だけ（Step Summary）、解析が走らなかったときだけ落ちる。`--fail-on-risk`・PR へのコメント・キャッシュが無く、`needs` に無い
4. 外の物はすべて不変の ID で固定されている（Action は 40 桁の SHA とタグのコメント、Python の道具は全パッケージに hash、規則とレンダラは `ref:` の SHA）
5. `dependabot.yml` に `/.github/requirements` の `pip` の項目がある
6. 並べた後の中身で Semgrep が終了コード 0。外した指摘には行ごとの理由のコメントがあり、挙動は変わっていない
7. `docs/decisions/security-and-review-checks-in-pr-ci.md` と索引の 1 行がルールの形式どおりにある
8. `lefthook.yml` と `.lefthook/` は変わっていない
9. 3 本の枝が tf-1jtse の build の最上段の上に一直線に並び、push されている（下が未 push なら push せず mayor に知らせている）
10. PR の本文用に、新しいチェックの表示される名前の一覧がある: `Static Checks / semgrep (pull_request)`、`Static Checks / dependency-review (pull_request)`、`CodeQL / Analyze (javascript-typescript) (pull_request)`、`code-review-graph / report (pull_request)`、GitHub が出す `Code scanning results / CodeQL`

### 前提として置いたこと（自律で決めた点）

- CodeQL のアラートの関門（「Code scanning results / CodeQL」）は `checks` に入れられないため、必須にするかは人の判断として残す（依頼 gc-n91n「必須チェックの設定は変えない（ユーザーが後で決める）」に従う）。PR の本文で知らせる
- 決定の記録はこの build で 1 ファイル（バックエンドは 2 ファイルだったが、フロントエンドでは「`checks` の `needs` に入れるか」が置き場所の決定と一体のため）。tf-dj4bc の build が別の決定の記録を書いても衝突しないよう、ファイル名をこの build の関心事に絞った
- 版と SHA はバックエンドと同じ物を使う（すでに同じ基準で選ばれている。2 週間以上の条件は実装時に確かめる）
- Semgrep の規則のディレクトリの選び方は上の 5 つ。実装時に読み込めない物があれば外し、その理由を記録する

### 未解決の問い（設計の承認を止めない物）

- 「Code scanning results / CodeQL」を必須のチェックに登録するか（人が GitHub の設定で決める。PR の本文の Notes に書く）
- GitHub の dependency graph が Yarn 4 の `yarn.lock` を読めるか（PR のチェックで確かめ、読めなければ報告する）

### 承認状態

- 状態: **承認（autonomous、tf-8hfy1、2026-11-19）**。承認時に節 7 の決定の記録の書き分けを確定の記述に改めた
- 根拠: 対象（依頼 gc-xtys の 2 のうち tascon-frontend の 4 つの道具）と文脈（依頼の原文、mayor 15:09Z の notes の置き場所の決まり、依頼が先例として指すバックエンドの #837・#839・#840 とその決定の記録、依頼 gc-n91n の 3・5 の条件、フロントエンドの既存の決定 `static-checks-in-pr-ci.md`、GitHub の code scanning の文書）で設計が決まる。人の答えが要る問いは無く、残る判断（CodeQL の関門の必須化）は依頼がもともと人に残している
