# lefthook-stage-placement specification

## Approved requirements

## 要件: tascon-frontend の lefthook の段を #847 のルールに合わせる

- root bead: tf-d6xae（superpowers-build）／依頼の部分: tf-9x49i（依頼 gc-wvsr、人の返事 mail gc-wisp-jggurq）
- 元の設計: `.gc-artifacts/lefthook-stage-placement/brainstorming/design.md`（承認済み、confirm bead tf-32a3j。承認の記録は同じディレクトリの `design-approval.md`）
- 設計との違い: venv の作り方（TS-3・REQ-005）は、設計の「一時ディレクトリに作ってから置き換える」を spec review iteration 1（`brainstorming/spec-review-iteration-1.md`）の指摘で改めた。venv は移せないため、最後の置き場所でその場で作り、印を最後に書く形にした。規則の取り出しは設計のままとする
- iteration 2 で確定させた読み方: 設計が二通りに読める所（`postCreateCommand.sh` での置き場所、`claude-md-maintenance` の比べる試し、AC-1・AC-4 の確かめ方）を、spec review iteration 1 の Recommendations をもとに1つに決めた（TS-5・TS-6・受け入れ基準の表・Risks・Open Questions）。設計の決めた事は変えていない
- 土台の枝: `build/add-stryker`（origin の先端 `c2892711`）。保存の段が文書の枝を間に挟む
- 設計の写し: `docs/superpowers/specs/` には写さない。このリポジトリの土台は文書の置き場所を `docs/design/specs/` にしており、リポジトリへの保存は後の保存の段が受け持つ。この段では作業用の木を変えないため、写しはこの成果物だけとする

### Problem Statement

tascon-backend PR #847 の `.claude/rules/lefthook-ci-placement.md`（未マージ）は、lefthook の段を確かめに要る物で決める。pre-commit は「変えたファイルだけで確かめられる物」、pre-push は「プロジェクト全体は要るが、ビルド・サーバー・ブラウザ・DB は要らない物」。lefthook で直すのは、意味を変えないと保証された直しだけ。

tascon-frontend の土台（`build/add-stryker`）の `lefthook.yml` はこれに合っていない。

- `check-docs.sh` はプロジェクト全体のリンクを見るのに pre-commit で走る
- Semgrep は CI（`.github/workflows/static-checks.yml` の job `semgrep`）だけで走り、lefthook に無い
- markuplint は #955 で既に直さない形になっている（変更は要らないが、確かめは要る）

人の返事（tf-9x49i の description の原文）は「Semgrep は pre-commit（変えたファイルだけで確かめられる）。check-docs.sh は pre-push」「markuplint を lefthook で直さない」「ルールの文は変えない」「lefthook の設定の直しはルールの PR（#846・#847）と別の PR」と決めている。

Dev Container には `python3` 3.11.2 があるが `pip`・`ensurepip`・`semgrep` が無い。手元で Semgrep を CI と同じ版・同じ規則で走らせる用意が要る。

### W6H

- Who（誰が使うか）: tascon-frontend で Dev Container の中でコミット・push する開発者と、同じ木で作業するエージェント
- What（何をするか）: `check-docs.sh` を pre-push に移し、Semgrep をステージした JS/TS に対して pre-commit で走らせ、そのための用意を Dev Container の作成時に入れる。markuplint は直さない形のまま残す
- When（いつ走るか）: Semgrep はコミットのたび（ステージに JS/TS が含まれるときだけ）。`check-docs.sh` は push のたび（push するファイルに文書が含まれるときだけ）。用意は Dev Container の作成時と、用意が無い・古いときの最初の Semgrep の実行時
- Where（どこに置くか）: `lefthook.yml`、`.lefthook/pre-commit/semgrep.sh`・`.lefthook/pre-commit/semgrep-setup.sh`（新規）、`.devcontainer/postCreateCommand.sh`、`docs/decisions/lefthook-stage-by-check-needs.md`（新規）と `docs/decisions/index.md`、`.claude/skills/doc-gardening/SKILL.md`。venv と規則はリポジトリの外の `${XDG_CACHE_HOME:-$HOME/.cache}/tascon-frontend/semgrep/`
- Why（なぜ）: #847 のルールの段の分け方に合わせ、手元で早く見つかる物は手元で見つけ、プロジェクト全体が要る物はコミットのたびに走らせない
- Whom（誰のための結果か）: 依頼 gc-wvsr を出した人（ルールの PR と別の PR で lefthook の設定を直すことを求めている）
- How（どうやるか）: check-docs.sh は backend PR #853 と同じ形（置き場所と glob を変えず `jobs` を pre-push へ移す）。Semgrep は `semgrep-setup.sh` が `.github/requirements/semgrep.txt` から hash 付きで venv を作り、`static-checks.yml` の job `semgrep` の `ref` と `sparse-checkout` から規則を取り出し、`semgrep.sh` がその出力を使って `--metrics=off --error` で走らせる

### User Stories

- US-1: 開発者として、文書を含まないコミットのたびに `check-docs.sh` が走るのを避けたい。文書のリンク切れは push の前に見つかれば足りる
- US-2: 開発者として、JS/TS をコミットする前に Semgrep の指摘を手元で知りたい。CI を待たずに直せるようにするため
- US-3: 開発者として、手元の Semgrep の結果が CI と分かれないでほしい。版と規則が CI と同じ所から来るようにするため
- US-4: 開発者として、Dev Container を作れば Semgrep の用意が済んでいてほしい。用意が無いときは、何をすればよいかがエラーに出てほしい
- US-5: 人として、ルールの文と CI の確かめが変わらないまま、lefthook の設定だけが別の PR で直っていてほしい

### Technical Stories

- TS-1: `lefthook.yml` の pre-commit の `jobs` から `check-docs.sh` の項目を外し、pre-push に `jobs` を作って同じ `run`・`glob`（`ARCHITECTURE.md`・`docs/*.md`・`docs/**/*.md`）・`fail_text` で置く。`.lefthook/pre-commit/check-docs.sh` の置き場所と中身は変えない
- TS-2: `lefthook.yml` の pre-commit の `commands` に `semgrep` を足す。`glob: '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'`、`exclude` で `.yarn/**`、`run: bash .lefthook/pre-commit/semgrep.sh {staged_files}`、`fail_text: 'Read the report above.'`。`stage_fixed` は付けない
- TS-3: `.lefthook/pre-commit/semgrep-setup.sh` を新しく作る。キャッシュの場所は `${XDG_CACHE_HOME:-$HOME/.cache}/tascon-frontend/semgrep/` の下の `venv/` と `rules/`。venv は `semgrep.txt` の sha256 を印にし、印が違う・無いときは今の `venv/` を消し、最後の置き場所の `venv/` にその場で `python3 -m venv` と `pip install --require-hashes -r .github/requirements/semgrep.txt` で作り、成功の後に印を最後に書く。venv は移すと中のスクリプトの shebang（作ったときの python の絶対パス）が壊れるため、一時ディレクトリで作ってから置き換える形にはしない。途中で止まった venv は印が無いので使われず、次の実行で消して作り直される。規則は venv の python と `ruamel.yaml` で `static-checks.yml` の job `semgrep` から、`with.repository` が `semgrep/semgrep-rules` の `actions/checkout` の段の `ref` と `sparse-checkout` の各行を取り、「SHA と行の並び」を印にする。印が違う・無いときに一時ディレクトリで `git init`・sparse-checkout・`git fetch --depth 1 --filter=blob:none https://github.com/semgrep/semgrep-rules.git <SHA>`・checkout で取り出してから置き換える。キャッシュのディレクトリで `flock` を取る。成功したら標準出力の1行目に `semgrep` の絶対パス、2行目以降に規則のディレクトリの絶対パスを1行ずつ出し、進み具合とエラーは標準エラーに出す。単独でも走らせられる
- TS-4: `.lefthook/pre-commit/semgrep.sh` を新しく作る。`set -euo pipefail` のシェルスクリプト。引数が無ければ exit 0。最初に `semgrep-setup.sh` を呼び、失敗したらその出力を残して exit 1。成功したら、その出力の `semgrep` と規則のディレクトリで `semgrep scan --config <各ディレクトリ> --metrics=off --error <ファイル…>` を走らせ、終了コードを返す。`--autofix` は使わない。キャッシュの場所・規則の SHA・規則のディレクトリ名をこのスクリプトに書かない
- TS-5: `.devcontainer/postCreateCommand.sh` の末尾（`yarn lefthook install` と「Setting up TypeScript Language Server...」の段より後）に「Setting up Semgrep...」の段を足す。`sudo apt-get update`、`sudo apt-get install -y --no-install-recommends python3-venv`、`bash .lefthook/pre-commit/semgrep-setup.sh` の順。スクリプトの `set -eu` はそのままにし、失敗を警告に変える包みは付けない。末尾に置くので、ネットワークの失敗でこの段が落ちても前の段（TypeScript Language Server など）は済んでおり、用意は最初の Semgrep の実行でも作り直される
- TS-6: 新しい決定の記録 `docs/decisions/lefthook-stage-by-check-needs.md` を `decisions-maintenance` の形式で作り、`docs/decisions/index.md` からリンクする。Considered Options に設計の案 A（check-docs.sh の移し方）・B（Semgrep の道具の用意）・C（規則の SHA の置き所）を書く。Related Files は `lefthook.yml`、`.lefthook/pre-commit/semgrep.sh`、`.lefthook/pre-commit/semgrep-setup.sh`、`.devcontainer/postCreateCommand.sh`。Consequences に、既存の決定の記録（`static-checks-in-pr-ci.md` の「lefthookのpre-commitで中身を確かめている…`check-docs.sh`」）と `docs/design/plans/` の過去の計画が、その時点の事実として `check-docs.sh` を pre-commit と書いたまま残ることを書く（本文は書き換えない）
- TS-7: `.claude/skills/doc-gardening/SKILL.md` の「`check-docs.sh`（lefthook pre-commit）」から段の名前を外し、段に依らない書き方にする。手順と決まりは変えない

### Behavior Requirements

- REQ-001: `lefthook.yml` の pre-commit に `check-docs.sh` が無く、pre-push の `jobs` に元と同じ `run`・`glob`・`fail_text` で在る。`.lefthook/pre-commit/check-docs.sh` の置き場所と中身は変わらない（AC-1）
- REQ-002: `lefthook.yml` の pre-commit に `semgrep` が在り、JS/TS の glob、`.yarn/**` の除外、`{staged_files}` を渡す `run`、`fail_text` を持ち、`stage_fixed` を持たない（AC-2）
- REQ-003: `semgrep.sh` は CI と同じ版（`.github/requirements/semgrep.txt`）と同じ規則（`static-checks.yml` の job `semgrep` の `ref` と `sparse-checkout`）で、`--metrics=off --error` を付けて走らせ、`--autofix` を使わない。規則の SHA と規則のディレクトリ名は `semgrep.sh` と `semgrep-setup.sh` のどちらにも書かれていない（AC-3）
- REQ-004: Dev Container の中で、規則に当たるファイルをステージすると pre-commit が Semgrep の出力とともに失敗し、当たらないファイルでは成功する。ステージに JS/TS が含まれないコミットでは `semgrep` が走らない（AC-4）
- REQ-005: 用意が無い状態から `semgrep-setup.sh` が venv と規則を作る。揃っているときは venv を作り直さず規則も取り直さない。`semgrep.txt` の中身、または `static-checks.yml` の `ref`・`sparse-checkout` が変わると、変わった方を作り直す。途中で止まって印が無い・違う venv は使わず、消してから作り直す。用意に失敗したとき（`python3-venv` が無い、ネットワーク、`static-checks.yml` の形の不一致）は、理由を標準エラーに出して非0で終わる。`python3-venv` が無いときの理由には `sudo apt-get install -y python3-venv` を走らせるか Dev Container を作り直すことを書く（AC-5）
- REQ-006: Semgrep の venv と規則はリポジトリの外のキャッシュに在り、用意の後も `git status` に差分が出ない（AC-6）
- REQ-007: `postCreateCommand.sh` が末尾の段で `python3-venv` を入れ、続けて `semgrep-setup.sh` を走らせる（AC-7）
- REQ-008: markuplint の項目に `--fix` と `stage_fixed` が無く、この作業で markuplint の項目に差分が無い（AC-8）
- REQ-009: `.github/workflows/static-checks.yml` と `.claude/rules/` に差分が無い（AC-9）
- REQ-010: 新しい決定の記録が `decisions-maintenance` の形式に合い、`docs/decisions/index.md` からリンクされ、`check-docs.sh` と markdownlint が通る。既存の決定の記録（`local-hooks-vs-ci-checks.md`・`static-checks-in-pr-ci.md`・`security-and-review-checks-in-pr-ci.md` を含む）の本文に差分が無い（AC-10）
- REQ-011: `.claude/skills/doc-gardening/SKILL.md` が `check-docs.sh` の段を pre-commit と書いていない（AC-11）
- REQ-012: `yarn lefthook validate` が通る（AC-12）

並行して走ったとき（pre-commit の並列、別の worktree での同時のコミット）、`semgrep-setup.sh` は `flock` で待ち合わせる。半端な venv は印が無いので使われず（TS-3）、半端な規則は置き換えの前の一時ディレクトリにしか無いので残らない。これは REQ-005 の「揃っているときは作り直さない」「失敗したときに理由を出す」を支える振る舞いで、REQ-005 の確かめに含める。

### Example Mapping

- 規則 R1（Semgrep は変えたファイルだけ）
  - 例: `src/foo.tsx` に `dangerouslySetInnerHTML` を使う行を足してステージ → pre-commit の `semgrep` が `typescript/react` の規則の指摘を出して exit 1、コミットが止まる
  - 例: 指摘に当たらない `src/bar.ts` をステージ → `semgrep` は exit 0、コミットが進む
  - 例: `docs/foo.md` だけをステージ → glob に当たらず `semgrep` は飛ばされる
  - 例: `.yarn/` の下の `.cjs` だけがステージに在る → `exclude` で飛ばされる
- 規則 R2（check-docs.sh は push で、文書を含むときだけ）
  - 例: `docs/decisions/x.md` を含む push → pre-push で `check-docs.sh` が走る。リンク切れがあれば push が止まる
  - 例: `src/` だけの push → `check-docs.sh` は走らない（CI の job `check-docs` が全体を確かめる）
  - 例: `docs/` を含むコミット → pre-commit では `check-docs.sh` が走らない
- 規則 R3（用意は CI と同じ所から、揃っていれば取り直さない）
  - 例: キャッシュが空 → `semgrep-setup.sh` が venv と規則を作り、`semgrep` の絶対パスと規則のディレクトリ5つを出す
  - 例: 2回目 → 印が同じなので取り直さずに同じ出力を返す
  - 例: `static-checks.yml` の `ref` を別の SHA にした木で走らせる → 規則だけを取り直し、venv はそのまま
  - 例: `semgrep.txt` を変えた木で走らせる → venv だけを作り直す
- 規則 R4（用意の失敗はコミットを止め、理由を出す）
  - 例: `python3-venv` が無いコンテナ → `sudo apt-get install -y python3-venv` か Dev Container の作り直しを促す文を出して exit 1、コミットが止まる
  - 例: `static-checks.yml` の job `semgrep` から `semgrep/semgrep-rules` の checkout の段が見つからない → その旨を出して exit 1
- 規則 R5（直さない）
  - 例: Semgrep の指摘があってもファイルは書き換わらず、`stage_fixed` で再ステージもされない
  - 例: markuplint の項目は今の形（`--fix` 無し、`stage_fixed` 無し）のまま

### Acceptance Criteria

| ID | Status | 受け入れ基準 | 確かめ方 |
| --- | --- | --- | --- |
| REQ-001 | covered | AC-1: `check-docs.sh` が pre-commit に無く、pre-push の `jobs` に同じ `run`・`glob`・`fail_text` で在る。スクリプトの置き場所と中身は変わらない | `lefthook.yml` の差分を読む。`git diff build/add-stryker -- .lefthook/pre-commit/check-docs.sh` が空。`yarn lefthook run pre-push --file docs/<既存の md>` で `check-docs.sh` が走って成功し、`yarn lefthook run pre-push --file src/<既存の ts>` で `(skip) no matching push files` になること（`--force` は glob を飛ばすので使わない）。`yarn lefthook run pre-commit --file docs/<既存の md>` の出力に `check-docs.sh` が出ないこと |
| REQ-002 | covered | AC-2: pre-commit の `semgrep` が JS/TS の glob、`.yarn/**` の除外、`{staged_files}`、`fail_text` を持ち、`stage_fixed` を持たない | `lefthook.yml` の差分を読む |
| REQ-003 | covered | AC-3: CI と同じ版と規則、`--metrics=off --error`、`--autofix` 無し。SHA と規則のディレクトリ名がスクリプトに無い | 2つのスクリプトを読み、`grep` で SHA と `typescript/react` などの規則名が無いこと |
| REQ-004 | covered | AC-4: 規則に当たるステージで pre-commit が失敗し、当たらないステージで成功する。JS/TS を含まないステージで `semgrep` が走らない | Dev Container の中で試しのファイルを一時的にステージして `yarn lefthook run pre-commit --command semgrep`（lefthook 2.0.4 の絞り込み）で走らせ、失敗の出力に Semgrep の規則 ID（`dangerouslySetInnerHTML` の試しなら `react-dangerouslysetinnerhtml` を含む物）が出ること、当たらないファイルで成功すること、JS/TS を含まないステージで `semgrep` が飛ばされることを確かめる。他の command（Biome など）の失敗と混ざらないよう、Semgrep の判定はこの絞り込みで見る。試しのファイルはコミットしない |
| REQ-005 | covered | AC-5: 空から作る、揃っていれば取り直さない、印が変わると作り直す、失敗は理由を出して非0 | `semgrep-setup.sh` を単独で走らせ、2回目の出力と時間、印を変えた木での振る舞い、`python3-venv` 無しの扱い（作る道の分岐を読むか、`python3 -m venv` が pip を作れない状況を試す）を確かめる |
| REQ-006 | covered | AC-6: venv と規則がリポジトリの外に在り、用意の後も `git status` が空 | 用意の後に `git status --porcelain` |
| REQ-007 | covered | AC-7: `postCreateCommand.sh` が `python3-venv` を入れて `semgrep-setup.sh` を走らせる | 差分を読み、Semgrep の段がスクリプトの末尾に在ること。同じ手順を今のコンテナで手で1回走らせる |
| REQ-008 | covered | AC-8: markuplint の項目に `--fix`・`stage_fixed` が無く、差分が無い | `lefthook.yml` の差分を読む |
| REQ-009 | covered | AC-9: `static-checks.yml` と `.claude/rules/` に差分が無い | `git diff build/add-stryker -- .github/workflows/static-checks.yml .claude/rules/` が空 |
| REQ-010 | covered | AC-10: 新しい決定の記録が形式に合い索引から辿れ、`check-docs.sh` と markdownlint が通る。既存の決定の記録の本文に差分が無い | `bash .lefthook/pre-commit/check-docs.sh`、追跡しているファイルだけを渡した markdownlint、`git diff build/add-stryker -- docs/decisions/` が新しいファイルと `index.md` だけ |
| REQ-011 | covered | AC-11: `doc-gardening/SKILL.md` が `check-docs.sh` の段を pre-commit と書いていない | 差分を読み、`grep` で `lefthook pre-commit` が残っていないこと |
| REQ-012 | covered | AC-12: `yarn lefthook validate` が通る | `yarn lefthook validate` |

### Testing Expectations

- シェルスクリプトと lefthook の設定の変更で、Vitest などの単体テストの対象は無い。確かめは上の表の「確かめ方」を Dev Container の中で実際に走らせて行い、その出力を実装の報告に残す
- Dev Container は作業の中で作り直せないため、`postCreateCommand.sh` に足す Semgrep の段と同じ手順（`python3-venv` を入れ、`semgrep-setup.sh` を走らせる）を今のコンテナで手で1回走らせ、作り直しの代わりとする
- 試しに使うファイル（規則に当たる TS など）はコミットせず、確かめの後に消す。`git status` が空に戻ることを確かめる
- 変更したファイルに対して biome（シェルスクリプトは対象外）、markdownlint、`check-docs.sh` を走らせて通ること

### Risks

- `static-checks.yml` の job `semgrep` の形（`actions/checkout` の段の `with.repository`・`ref`・`sparse-checkout`）が変わると、手元の用意が失敗する。失敗は理由を出して止まるので気付けるが、そのときは `semgrep-setup.sh` の読み方を直す必要がある
- `semgrep.txt` は CI の Python 3.13 向けに作られた hash 付きの requirements。設計の段の試しでは Dev Container の Python 3.11・aarch64 で入ったが、`semgrep.txt` が更新されたときに 3.11 向けの wheel が無いと手元の用意が失敗する
- 設計の段の試しは pip 26.3 の wheel を `PYTHONPATH` で使っており、TS-3 が使う `python3-venv`（Debian bookworm の ensurepip が入れる pip）とは pip の版が違う。Testing Expectations の「作成時と同じ手順を手で1回走らせる」でこの前提を確かめ、pip の版と `pip install --require-hashes` の成否を実装の報告に残す。失敗したときは計画から外れる直しになるので、実装の段で止めて理由を報告する
- 最初のコミット（キャッシュが空のとき）は venv の作成と規則の取り出しでネットワークと時間が要る。Dev Container の作成時に用意することで普段のコミットでは起きにくくする
- ネットワークが無いときにキャッシュが古いと、コミットが止まる。`--no-verify` で飛ばしても CI の job `semgrep` が確かめる
- `postCreateCommand.sh` の `apt-get` が Dev Container の作成を数十秒遅くする
- `.lefthook/pre-commit/check-docs.sh` の置き場所のディレクトリ名と走る段（pre-push）がずれる。backend #853 と同じ形で、参照を古くしないために受け入れる
- 文書以外のファイルの削除でリンクが切れる push では `check-docs.sh` が走らない。CI の job `check-docs` が捕まえる

### Out Of Scope

- `.github/workflows/static-checks.yml` など CI のワークフローの変更
- `.claude/rules/` の文の変更（#846・#847 の関心事）
- backend の lefthook（PR #853 と別の PR が受け持つ）
- `check-docs.sh` のファイルの置き場所の変更と中身の変更
- Semgrep の規則の選び直し、規則の SHA の自動更新（Dependabot の対象外のまま）
- knip・tsc・vitest-related・markdownlint・biome・check-logger-trace・protect-branch・check-git-clean の段の変更
- markuplint の設定の変更（#955 で既に直さない形）
- 既存の決定の記録の本文の書き換え、`docs/design/plans/` の過去の計画の書き換え
- Dev Container の `Dockerfile` の変更と、作業の中での Dev Container の作り直し

### Open Questions

- 人の答えが要る質問は無い。設計の段で置いた前提を、読み方が分かれないようにここに確定させる
  - 「Semgrep を pre-commit（変えたファイルだけ）」は、ステージしたファイルのうち JS/TS（Semgrep の規則の言語）の物だけを対象にする意味とする
  - 「手元で実際に走ること」は、Dev Container を作り直さずに、作成時の手順と同じ物を今のコンテナで手で走らせて確かめれば満たすとする
  - `doc-gardening/SKILL.md` の直しは事実の訂正（括弧の中の段の名前を外すだけ）で、決まりと手順を足したり変えたりしない。そのため `claude-md-maintenance` の比べる試しは行わない（条件付きにしない）。この試しは足した・変えた決まりが振る舞いを変えるかを見て、変えなければ決まりを消す手順で、振る舞いを変えない事実の訂正に当てると「変わらない→消す」となり古い記述が残るため、当てはまらないと判断した。実装の段はこの判断をコミットの body に書く
  - コミットの種類は、`lefthook.yml` と `.lefthook/` の変更が `chore`。`postCreateCommand.sh` は `build(devcontainer)` と `chore` のどちらかを、計画の段が `git log` の同種の変更から決める

## Adopted design

## 設計候補: tascon-frontend の lefthook の段を #847 のルールに合わせる

- root bead: tf-d6xae（superpowers-build）／依頼の部分: tf-9x49i（依頼 gc-wvsr、人の返事 mail gc-wisp-jggurq）
- 土台: `build/add-stryker`（origin の先端 `c2892711`）
- 試行: 1回目（brainstorm bead tf-kn1jt、iteration 1）
- 承認の状態: **承認済み（autonomous、confirm bead tf-32a3j、2026-11-20）**。判定の記録は `design-approval.md`

### Superpowers チェックリスト（1〜5）の記録

1. プロジェクトの文脈を確認した: 済み（下の「確認した事実」）
2. 見た目の質問の有無: なし。lefthook・シェルスクリプト・Dev Container の設定だけで、画面や図の比較は出ない。Visual Companion は提示しない
3. 確認の質問: 人の答えが要る質問はない。人の返事（原文は下）が段と直し方を決めており、残る選択はリポジトリの既存の決まり・backend の同じ作業（PR #853）・Semgrep の規則のライセンスから決まる。置いた前提は「前提」に書いた
4. 2〜3案と推奨: 済み（「案の比較」）
5. 推奨する設計を節ごとに提示: 済み（「設計」）

### 求められている結果

人の返事の原文（tf-9x49i の description より）:

> #847 のルール（.claude/rules/lefthook-ci-placement.md の「lefthookの段」と「lefthookでの直し」）に合わせて、次のとおりにしてください。（中略）Semgrep は pre-commit（変えたファイルだけで確かめられる）。check-docs.sh は pre-push（backend・frontend。プロジェクト全体を見る）。（中略）htmlbeautifier と markuplint は、意味を変えないと保証されないので lefthook で直さない。ルールの文は変えません。lefthook の設定の直しは、ルールの PR（#846・#847）と関心事を分けて、別の PR にしてください。

この部分の範囲: tascon-frontend の lefthook で

- `check-docs.sh` を pre-push で走らせる
- Semgrep を pre-commit で、変えたファイルだけに走らせる
- markuplint を lefthook で直さない
- 手元（Dev Container）で実際に走ること。CI の確かめはそのまま残す。ルールの文は変えない

### 確認した事実

- ルール（tascon-backend PR #847 の `.claude/rules/lefthook-ci-placement.md`、未マージ。frontend にはまだ無い）: pre-commit は「変えたファイルだけで確かめられる物」、pre-push は「プロジェクト全体は要るが、ビルド・サーバー・ブラウザ・DBは要らない物」。lefthook で直すのは意味を変えないと保証された直しだけ。lefthook か CI を変えたら、同じ PR でもう一方にも要るかを確かめる
- 土台の `lefthook.yml`:
  - pre-commit（`parallel: true`）: biome（`--write`、`stage_fixed`）、markuplint（`yarn markuplint {staged_files}`、`--fix` も `stage_fixed` も無い）、markdownlint、check-logger-trace、protect-branch、`jobs` に `bash .lefthook/pre-commit/check-docs.sh`（glob: `ARCHITECTURE.md`・`docs/*.md`・`docs/**/*.md`）
  - pre-push: knip、check-git-clean、tsc（`yarn next typegen && yarn tsc --noEmit`）、vitest-related（`{push_files}`）
  - Semgrep は lefthook に無い
- markuplint の直しは #955（`d3cd47ac chore: run markuplint without auto-fix and type-check before push`）で既に外れている。決定の記録 `docs/decisions/local-hooks-vs-ci-checks.md` が「保証のないツール（markdownlint・markuplint）は検査だけを行う」と決めている。この部分で markuplint の設定を変える必要はない
- CI（`.github/workflows/static-checks.yml`）は job `check-docs`（`bash .lefthook/pre-commit/check-docs.sh`）と job `semgrep` を持ち、どちらも `checks` の `needs` に入っている。job `semgrep` は `semgrep/semgrep-rules` を `ref: 16b9e6d45f10649f6a531ec4838ed9924372c3bc` で、`typescript/react`・`typescript/lang`・`javascript/react`・`javascript/browser`・`javascript/lang` を sparse-checkout で取り出し、`.github/requirements/semgrep.txt`（`semgrep==1.184.0`、hash 付き）を Python 3.13 に `--require-hashes` で入れ、`--metrics=off --error --exclude .yarn` でリポジトリ全体を走らせる
- 決定の記録 `docs/decisions/security-and-review-checks-in-pr-ci.md`: Semgrep の規則はライセンス上リポジトリに写さず、取り出して使う。規則の SHA は手で更新する
- `check-docs.sh` の参照: `lefthook.yml`、`static-checks.yml`、`.claude/hooks/check-docs-hook.sh`（PostToolUse）、`docs/decisions/static-checks-in-pr-ci.md`、`docs/design/plans/active/ci-checks-aggregator.md`、`.claude/skills/doc-gardening/SKILL.md`（「`check-docs.sh`（lefthook pre-commit）が機械的に検証する」）
- backend の同じ作業 PR #853（`refactor: align the lefthook stages with what each check needs`）は、`check-docs.sh` を `.lefthook/pre-commit/` のまま pre-push の `jobs` に移し、glob を残した。Semgrep の段は backend では別の PR にした
- Dev Container（`node:22.22.2` = Debian bookworm、aarch64、glibc 2.36）: `python3` 3.11.2 はあるが `pip`・`ensurepip` が無い（`python3 -m venv` は `--without-pip` でだけ作れる）。`semgrep`・`uv`・`pipx`・`docker` は無い。`.devcontainer/postCreateCommand.sh` は `sudo` で道具を入れている（`sudo npm install -g typescript-language-server`）
- 試し（scratchpad、リポジトリは変えていない）:
  - `python3 -m venv --without-pip` で作った venv に、pip 26.3 の wheel を `PYTHONPATH` にして `pip install --require-hashes -r .github/requirements/semgrep.txt` が成功し、`semgrep --version` は `1.184.0`。3.13 向けに作った hash 付きの requirements が 3.11・aarch64 でも入る
  - 規則の取り出し（`git init` → sparse-checkout の5つ → `git fetch --depth 1 --filter=blob:none origin <SHA>` → checkout）は約1.5秒、1.9MB
  - CI と同じ5つの `--config` と `--metrics=off --error --exclude .yarn` で `src` の `.tsx` を走らせると、1ファイル約2.2秒、5ファイル約2.7秒、指摘なしで exit 0

### 制約

- `.claude/rules/` の文は変えない（#846・#847 の関心事）。この PR は lefthook の設定の直しで、ルールの PR とは別にする
- CI の確かめ（job `check-docs`・`semgrep` と `checks` の `needs`）はそのまま残す
- Semgrep の規則はリポジトリに写さない（ライセンス）
- 道具の版は CI と同じ物を使う（`semgrep.txt` と規則の SHA）
- 決定の記録は本文を書き換えない（`decisions-maintenance`）。新しい決定は新しいファイルにする
- 作業は `build/add-stryker` の上に積む。保存の段が文書の枝を挟む（root の notes の並び）

### 非目標

- CI のワークフローの変更
- backend の lefthook（PR #853 と別の PR が受け持つ）
- `check-docs.sh` のファイルの置き場所の変更、中身の変更
- Semgrep の規則の選び直し、規則の SHA の自動更新（Dependabot は対象外のまま）
- knip・tsc・vitest-related・markdownlint・biome など他の確かめの段の変更
- 既存の決定の記録の本文の書き換え、`docs/design/plans/` の過去の計画の書き換え

### 案の比較

#### A. check-docs.sh の移し方

- **A1（推奨）**: backend #853 と同じにする。`.lefthook/pre-commit/check-docs.sh` の置き場所はそのままで、`jobs` の項目を pre-commit から pre-push へ移し、glob（`ARCHITECTURE.md`・`docs/*.md`・`docs/**/*.md`）も残す。pre-push の glob は push するファイルに対して効くので、文書を含む push でだけ走る
  - 長所: 参照（CI・Claude のフック・決定の記録・過去の計画）が古くならない。backend と同じ形で、2つのリポジトリの差が増えない。差分が最小
  - 短所: ディレクトリ名 `pre-commit/` と走る段がずれる。文書以外のファイルの削除でリンクが切れる push では走らない（CI の job `check-docs` が捕まえる）
- A2: `.lefthook/pre-push/check-docs.sh` へ移す
  - 長所: 置き場所と段が揃う
  - 短所: `static-checks.yml`・`.claude/hooks/check-docs-hook.sh` を変える必要があり、決定の記録（本文を書き換えない）と過去の計画のパスが古くなる。backend と形が分かれる。CI を変えることになり「CI の確かめはそのまま」から外れる
- A3: glob を外して、すべての push で走らせる
  - 長所: 文書以外の変更によるリンク切れも push の前に見つかる
  - 短所: backend と形が分かれる。CI が同じ物を全体で確かめている

#### B. Semgrep を手元で走らせる道具の用意

- **B1（推奨）**: Dev Container の作成時（`postCreateCommand.sh`）に Debian の `python3-venv` を `apt-get` で入れ、リポジトリの用意スクリプトが Semgrep の venv と規則を `~/.cache` の下に用意する。pre-commit のスクリプトは、用意が無い・古いときに用意スクリプトを呼んでから走らせる
  - 長所: pip は Debian の署名付きパッケージから来て、版の固定を自分で持たない。Semgrep の版と規則の SHA は CI と同じ所から読むので、片方だけ更新されることがない。規則はワークスペースの外にあり、リポジトリに写らない。worktree の間で共有される
  - 短所: `postCreateCommand.sh` に `apt-get` が1つ増える（作成時に数十秒）。Dev Container を作り直すまでは、手で同じ手順を1回走らせる必要がある
- B2: pre-commit のスクリプトが全部を自分で用意する（pip の wheel を固定の hash で取り、`--without-pip` の venv に入れる）
  - 長所: `sudo`・`apt-get`・作り直しが要らない
  - 短所: pip の版と hash を手で保守する所が増え、Dependabot も更新しない。フックのスクリプトが複雑になる
- B3: `Dockerfile` に `python3-venv` と Semgrep を焼き込む
  - 長所: コンテナを作るたびに用意済み
  - 短所: `Dockerfile` は compose の app イメージで、開発だけの道具が混ざる。規則（配布できない）をイメージに入れるのは避けたい。版の更新のたびにイメージの作り直しが要る

#### C. 規則の SHA と取り出す規則の置き所

- **C1（推奨）**: 用意スクリプトが `static-checks.yml` を読み、job `semgrep` の中で `with.repository` が `semgrep/semgrep-rules` の `actions/checkout` の段から `ref` と `sparse-checkout` の各行を取る。YAML は Semgrep の venv にある `ruamel.yaml`（`semgrep.txt` の依存）で読む。`--config` はその各行のディレクトリにする
  - 長所: 規則の SHA と規則の集まりは CI の1か所だけにあり、手で更新しても手元が自動で追う
  - 短所: 手元のスクリプトが CI のワークフローの形に依存する。形が変わって見つからなければ、用意スクリプトが理由を出して失敗する
- C2: 用意スクリプトに SHA とディレクトリを書き、CI と2か所に持つ
  - 長所: スクリプトが単純
  - 短所: 片方だけ更新されると、手元と CI で結果が分かれる

### 設計（推奨: A1・B1・C1）

#### 1. `lefthook.yml`

- pre-commit の `jobs` から `bash .lefthook/pre-commit/check-docs.sh` の項目を外し、pre-push に `jobs` を作って同じ項目（`run`・`glob`・`fail_text`）を置く
- pre-commit の `commands` に `semgrep` を足す
  - `glob: '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'`
  - `exclude` で `.yarn/**` を外す（CI の `--exclude .yarn` に合わせる）
  - `run: bash .lefthook/pre-commit/semgrep.sh {staged_files}`
  - `fail_text: 'Read the report above.'`
  - `stage_fixed` は付けない
- markuplint の項目は変えない（`--fix`・`stage_fixed` が無いことを受け入れ基準で確かめる）

#### 2. `.lefthook/pre-commit/semgrep.sh`（新規）

- 引数のファイルに Semgrep を走らせる。引数が無ければ何もせず exit 0
- 最初に `.lefthook/pre-commit/semgrep-setup.sh` を呼び、用意を確かめる（揃っていれば速く戻る）。用意に失敗したら、その出力を残して exit 1（黙って飛ばさない）
- 用意スクリプトが返す venv の `semgrep` と規則のディレクトリで `semgrep scan --config <各ディレクトリ> --metrics=off --error <ファイル…>` を走らせ、その終了コードを返す。`--autofix` は使わない
- シェルスクリプトだけで書く（`set -euo pipefail`）

#### 3. `.lefthook/pre-commit/semgrep-setup.sh`（新規）

- 置き場所: `${XDG_CACHE_HOME:-$HOME/.cache}/tascon-frontend/semgrep/` の下に `venv/` と `rules/`。リポジトリの外なので、gitignore・Biome・knip・markdownlint に影響しない
- venv: `.github/requirements/semgrep.txt` の sha256 を印にする。印が違う・venv が無いときは、一時ディレクトリに `python3 -m venv` で作り、`pip install --require-hashes -r .github/requirements/semgrep.txt` で入れ、出来上がってから置き換える（途中で止まっても半端な venv を残さない）
- 規則: venv の python と `ruamel.yaml` で `static-checks.yml` から `ref` と `sparse-checkout` の行を取り（C1）、「SHA と行の並び」を印にする。印が違う・無いときは、一時ディレクトリに `git init`・sparse-checkout・`git fetch --depth 1 --filter=blob:none https://github.com/semgrep/semgrep-rules.git <SHA>`・checkout で取り出し、出来上がってから置き換える
- 同時に走ったとき（pre-commit の並列、別の worktree での同時のコミット）に壊れないよう、キャッシュのディレクトリで `flock` を取る
- 失敗の扱い: `python3 -m venv` が pip を作れない（`python3-venv` が無い）ときは「`sudo apt-get install -y python3-venv` を走らせるか、Dev Container を作り直す」と出して exit 1。ネットワーク・`static-checks.yml` の形の不一致も理由を出して exit 1
- 成功したら、標準出力の1行目に使う `semgrep` の絶対パス、2行目以降に `--config` に渡す規則のディレクトリの絶対パスを1行ずつ出す。進み具合とエラーは標準エラーに出す。`semgrep.sh` はこの出力だけを使い、キャッシュの場所を自分では持たない
- 単独でも走らせられる（`bash .lefthook/pre-commit/semgrep-setup.sh`）

#### 4. `.devcontainer/postCreateCommand.sh`

- 「Setting up Semgrep...」の段を足す: `sudo apt-get update` と `sudo apt-get install -y --no-install-recommends python3-venv` の後に `bash .lefthook/pre-commit/semgrep-setup.sh` を走らせる
- `yarn lefthook install` の後に置く

#### 5. 文書

- 新しい決定の記録 `docs/decisions/lefthook-stage-by-check-needs.md` を作り、`docs/decisions/index.md` からリンクする。内容: `check-docs.sh` を pre-push に、Semgrep を pre-commit（変えたファイルだけ）に置くこと、手元の Semgrep の版と規則を CI の `semgrep.txt` と `static-checks.yml` から取ること、規則をリポジトリの外のキャッシュに置くこと、markuplint は既存の決定のとおり直さないこと。Considered Options に上の A・B・C の案。Related Files: `lefthook.yml`、`.lefthook/pre-commit/semgrep.sh`、`.lefthook/pre-commit/semgrep-setup.sh`、`.devcontainer/postCreateCommand.sh`
- `.claude/skills/doc-gardening/SKILL.md` の「`check-docs.sh`（lefthook pre-commit）」から段の名前を外し、段に依らない書き方にする（事実の訂正で、手順・決まりは変えない）
- 既存の決定の記録（`local-hooks-vs-ci-checks.md`・`static-checks-in-pr-ci.md`・`security-and-review-checks-in-pr-ci.md`）の本文は変えない

#### 6. CI との関係（ルールの「変えるとき」）

- `static-checks.yml` は変えない。job `check-docs` と job `semgrep` はリポジトリ全体を確かめ続け、`checks` の `needs` に残る。手元の確かめは、CI と同じ版・同じ規則の部分集合（変えたファイル、または文書を含む push）なので、CI に足す物はない

#### 7. エラーの扱いのまとめ

- Semgrep の指摘: exit 1 でコミットが止まる。直さない
- 用意の失敗（`python3-venv` 無し・ネットワーク・ワークフローの形）: 理由を出して exit 1。コミットが止まる（`--no-verify` で飛ばしても CI が確かめる）
- 文書を含まない push: `check-docs.sh` は走らない（CI が確かめる）

#### 8. 確かめ方

- `yarn lefthook validate`
- Dev Container の中で、作り直しの代わりに `postCreateCommand.sh` の Semgrep の段と同じ手順を手で1回走らせ、`semgrep-setup.sh` が venv と規則を作ること、2回目は取り直さないこと、`semgrep.txt` か `static-checks.yml` の印を変えると作り直すことを確かめる
- 規則に当たる TS のファイル（例: `typescript/react` の `dangerouslySetInnerHTML` の規則に当たる物）を一時的にステージして `yarn lefthook run pre-commit` が Semgrep の出力で失敗すること、当たらないファイルでは成功すること、JS/TS を含まないステージでは `semgrep` が飛ばされることを確かめる（試しのファイルはコミットしない）
- `yarn lefthook run pre-push --force`（または文書を含む push の想定）で `check-docs.sh` が pre-push で走って成功し、pre-commit では走らないことを確かめる
- markdownlint・`check-docs.sh` を変更後の木で走らせて通ること
- `git status` が用意の後も空のままであること（規則と venv がリポジトリに入らない）

### 受け入れ基準

- AC-1: `lefthook.yml` の pre-commit に `check-docs.sh` が無く、pre-push の `jobs` に同じ `run`・`glob`・`fail_text` で在る。`check-docs.sh` のファイルの置き場所と中身は変わらない
- AC-2: `lefthook.yml` の pre-commit に `semgrep` が在り、JS/TS の glob、`.yarn/**` の除外、`{staged_files}` を渡す `run`、`fail_text` を持ち、`stage_fixed` を持たない
- AC-3: `semgrep.sh` は CI と同じ版（`semgrep.txt`）と同じ規則（`static-checks.yml` の `ref` と `sparse-checkout`）で、`--metrics=off --error` を付けて走らせ、`--autofix` を使わない。規則の SHA とディレクトリはスクリプトに書かれていない
- AC-4: Dev Container の中で、規則に当たるファイルのステージで pre-commit が失敗し、当たらないファイルで成功する。JS/TS を含まないコミットでは `semgrep` が走らない
- AC-5: 用意が無い状態から `semgrep-setup.sh` が venv と規則を作り、揃っているときは取り直さず、印が変わると作り直す。用意に失敗したときは理由を出して非0で終わる
- AC-6: Semgrep の規則と venv はリポジトリの外にあり、用意の後も `git status` が空
- AC-7: `postCreateCommand.sh` が `python3-venv` を入れ、`semgrep-setup.sh` を走らせる
- AC-8: markuplint の項目に `--fix`・`stage_fixed` が無い（変更なし）
- AC-9: `static-checks.yml` と `.claude/rules/` に差分が無い
- AC-10: 新しい決定の記録が `decisions-maintenance` の形式に合い、`index.md` からリンクされ、`check-docs.sh` と markdownlint が通る。既存の決定の記録の本文に差分が無い
- AC-11: `doc-gardening/SKILL.md` が `check-docs.sh` の段を pre-commit と書いていない
- AC-12: `yarn lefthook validate` が通る

### 前提（人の答えを待たずに置いた物）

- 「Semgrep を pre-commit（変えたファイルだけ）」は、ステージしたファイルのうち Semgrep の規則の言語（JS/TS）の物を対象にする意味にとった
- 「手元で実際に走ること」は、Dev Container を作り直さずに、作成時の手順と同じ物を手で走らせて確かめれば足りるとした（作業の中でコンテナを作り直せないため）。`python3-venv` を手で入れるのは、作成時の手順と同じ変更だけを今のコンテナに加えることになる
- `doc-gardening/SKILL.md` の直しは事実の訂正で、決まり・手順を足したり変えたりしないので、`claude-md-maintenance` の比べる試しは要らないとした。レビューが要ると判断したら試しを行う
- コミットの種類: `lefthook.yml` と `.lefthook/` の変更は `chore`、`postCreateCommand.sh` は `build(devcontainer)` か `chore` のどちらが合うかを `git log` の同種の変更で計画の段が決める

### 未解決の質問

- なし（人の答えが要る物は無い）

### 承認

- 状態: 承認済み（autonomous。confirm bead tf-32a3j で、未解決の質問・穴埋めが無く、要件を作り足さずに進められると判定した）
- 自律承認の根拠: 段の置き場所と直さないことは人の返事が直接決めている。残る選択（A・B・C）は、backend #853 との一致、CI を変えない制約、規則のライセンス、決定の記録の運用の決まり、Dev Container での試しの結果から決まり、人の好みに依る分かれ目が無い
