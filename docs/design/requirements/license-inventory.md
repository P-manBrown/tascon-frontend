# Requirements: ライセンスの洗い出し（tascon-frontend）

- workflow root: tf-5hke（superpowers-build）/ target: tf-2f5w（HQ 依頼 gc-vjh8 の 1/4）
- 承認済み design: `docs/design/specs/license-inventory.md`
- 基準: `main` の `ffa7ffcc`（2026-11-18 時点。design の事実はこのコミットで調べた物）

## Problem Statement

tascon-frontend に OSS のライセンス（MIT が候補）を付ける前に、リポジトリが使い・配っている物の権利を一度洗い出す必要がある。npm 依存の配布物は `.yarn/cache` としてリポジトリにコミットされており、リポジトリを公開すれば依存パッケージ自体を再配布することになる。依存の中には LGPL・MPL・CC-BY など配布に条件が付くライセンスがあり、実行時に CDN から読む Apple の絵文字画像や、作者がリポジトリから分からない `public/` の画像もある。何が妨げになり、何が確かめきれないかを一つの報告にまとめ、人が判断できる形で PR として出す。

## W6H

- Who（誰のため）: リポジトリの所有者（P-manBrown）。ライセンスを付けるかどうか、妨げをどう扱うかを決める人
- What（何を）: `docs/license-inventory.md`（日本語）1 ファイル。npm 依存の全件表、コード以外の物の一覧、妨げになる物、確かめきれない物、調べ方を載せる
- When（いつ）: 今夜。PR を出すところまで
- Where（どこで）: tascon-frontend の `docs/` 直下。PR は 1 本（`docs:`）。作業はメインチェックアウトではなく作業用の worktree で行う
- Why（なぜ）: `LICENSE` を付ける判断の前に、妨げと不明点を人に見える形で揃えるため
- How（どうやって）: `yarn info -A -R --manifest --json` で lockfile の全項目と manifest の `license` を取り、`git ls-files .yarn/cache` で同梱を、lockfile の依存関係で実行時・開発時を求める。コード以外の物は `git ls-files`、設定、ソース中の外部読み込みから調べる
- How much（どこまで）: 洗い出しと報告と対処案の提示まで。解消（置き換え・同梱の中止・画像の差し替え）とライセンスの決定はしない

## User Stories

- US-1: 所有者として、MIT を付ける妨げになる物を、使われ方と取れる対処案とともに一か所で読みたい。どれを解消すればライセンスを付けられるかを決められるように
- US-2: 所有者として、リポジトリからは分からない点（画像の作者・出所など）を、自分が何を確かめればよいかとともに知りたい。確かめる作業にすぐ移れるように
- US-3: 所有者として、npm 依存すべてのライセンスと使われ方（同梱・実行時・開発時のみ・未取得）を表で見たい。報告の要約が全件に基づいていることを確かめられるように
- US-4: 将来の作業者として、どのコマンドと決め方で一覧を作ったかを知りたい。同じ洗い出しをやり直せるように

## Technical Stories

- TS-1: 実装者として、`yarn info -A -R --manifest --json` の全項目を、workspace 自身（`tascon-frontend@workspace:.`）を除いて表の行にする。行の単位は `yarn info` の 1 項目（同じパッケージの複数の版、`patch:` プロトコルの項目はそれぞれ別の行）
- TS-2: 実装者として、「同梱」を `git ls-files .yarn/cache` の追跡済み zip との突き合わせで決める。`yarn info --manifest` の実行で他 OS・他 CPU 用の zip が `.yarn/cache` に未追跡で落ちるため、ディレクトリの中身で判定しない
- TS-3: 実装者として、「実行時」「開発時のみ」を、ルートの `package.json` の `dependencies` と `devDependencies` から lockfile の依存関係（`yarn info` の `Dependencies`、または `yarn.lock`）を推移的に辿って決める
- TS-4: 実装者として、`yarn info --manifest` の実行後に `git status --porcelain .yarn/cache` で未追跡の zip を確かめて消し、PR に混ぜない
- TS-5: 実装者として、manifest に `license` の値がない物・SPDX でない値の物を、追跡済みの cache の zip（なければ `node_modules`）の中の LICENSE ファイルで確かめる

## Behavior Requirements

### REQ-001 報告ファイルと冒頭

- `docs/license-inventory.md` を新規に作る。日本語で書く
- 冒頭に次を書く: 調べた日付、基準コミット（作業ブランチの分岐元の `main` の SHA）、目的（MIT などの OSS ライセンスを付ける前の洗い出し）、法的な最終判断ではなく各ライセンスの一般的な条件とこのリポジトリでの使われ方の整理である旨
- 基準コミットが `ffa7ffcc` から進んでいた場合は、実装時の `main` を基準にし、件数は実際に取った値を書く（design の件数は目安）

### REQ-002 要約

- ライセンス別の件数、妨げになる物の件数、確かめきれない物の件数を書く
- 件数は全件表・各節の中身と一致させる

### REQ-003 npm 依存の全件表

- 列は「パッケージ」「版」「ライセンス（manifest の値）」「区分」の 4 つ
- 行は TS-1 の単位。行数は `yarn info -A -R --manifest --json` の項目数 − 1（workspace 自身）と一致させる
- ライセンス別にまとめて並べる（同じライセンスの中はパッケージ名順）
- manifest に値がなく LICENSE ファイルで決まった物は、ライセンスの欄に決まった値と「manifest に値なし、LICENSE ファイルで確認」の注記を書く。決まらなかった物は欄を「不明」とし、確かめきれない物の節に載せる

### REQ-004 区分

- 各行に、配布の区分（「同梱」または「未取得」のどちらか一方）と、用途の区分（「実行時」または「開発時のみ」のどちらか一方）を付け、区分の列に 2 つを並べて書く（例: `同梱・実行時`、`未取得・開発時のみ`）
- 同梱: 追跡済みの `.yarn/cache` に対応する zip がある。未取得: lockfile にはあるが追跡済みの cache にない（他 OS・他アーキテクチャ用のオプション依存など）
- 実行時: `dependencies` から辿れる（`devDependencies` からも辿れる物を含む）。開発時のみ: `devDependencies` からしか辿れない
- zip 名との対応が機械的に決まらない項目（`patch:` プロトコルなど）は個別に確かめ、確かめ方を調べ方の節に書く
- `patch:` の元の項目（例: `resolve@npm:1.22.8`、`typescript@npm:5.9.3`、`fsevents@npm:2.3.2`）は、依存元の記述子が `patch:` の項目に解決されるため依存を辿っても用途が決まらない。その項目を元にした `patch:` の項目と同じ用途の区分にする

### REQ-005 妨げになる物

- 対象: GPL・AGPL・LGPL・MPL・EPL・CC-BY 系のライセンス、`AND` でそれらを含む複合ライセンス、権利が npm のライセンスと別にある実行時の素材。選択式（`A OR B`）で許容的なライセンスを選べる物は対象にしない
- 少なくとも次を載せる: LGPL-3.0-or-later を含む物（`@img/sharp-libvips-*` など sharp のネイティブ部品）、MPL-2.0（`lightningcss` 系）、CC-BY-4.0（`caniuse-lite`）、実行時に `cdn.jsdelivr.net/npm/emoji-datasource-apple` から読む Apple の絵文字画像（`emoji-picker-react` の既定の Apple 形式）
- 1 件はライセンスの種類（またはその素材）ごとにまとめ、該当するパッケージ@版をすべて挙げる。各件に、使われ方（REQ-004 の区分）、MIT を付けることへの影響、取れる対処の案を書く
- 影響は断定せず報告として書き、区分ごとに分けて説明する（例: 依存として使うだけなら自分のコードのライセンスを妨げないが、同梱して再配布するときに条件がある）
- 調べた結果で design の候補から増減した場合は、その理由を書く

### REQ-006 確かめきれない物

- 少なくとも次を載せる: `public/` の画像・アイコン・ロゴの作者と出所（自作か、生成ツールか、素材を使ったか）、manifest に値がなく LICENSE ファイルでも決まらなかった物（`jsesc@0.5.0` が決まった場合は表へ反映し、この節には載せない）
- 各件に、何が分からないか、誰が何を確かめれば決まるかを書く

### REQ-007 コード以外の物・npm 依存以外の第三者由来の物

- `public/` の追跡対象 13 ファイルすべて（`favicon.ico`、`icons/*.png` 9 枚、`logos/logo.png`、`logos/logo-small.png`、`manifest.json`）。数が違った場合は実際の `git ls-files public` に合わせ、違いを書く
- フォント: フォントファイルなし、`next/font` 未使用、`tailwind.config.js` の `fontFamily` は端末のシステムフォントの指定のみで配布物がないこと
- 外から取る素材: Apple の絵文字画像の CDN 読み込み。`boring-avatars`・`@heroicons/react`・`@schedule-x/theme-default` は npm パッケージとして全件表に含まれる旨。Google フォームへのリンク（`forms.gle`）は素材ではなく対象外である旨
- 第三者由来の物: `.claude/skills/gh-stack/`（`github/gh-stack` v0.3.0 の skill のコピー）、`.yarn/releases/yarn-4.4.0.cjs`（Yarn 本体。`package.json` の `packageManager` で指定し、リポジトリにコミット済み。lockfile の項目ではないため REQ-003 の全件表には入らない）。`.github/COMMIT_CONVENTION` は所有者自身のリポジトリのサブモジュールである旨
- 第三者由来の物が妨げに当たるかは、調べた結果を REQ-005 の基準で判断し、当たる場合は妨げの節にも載せる
- 各物に、権利者、ライセンス、根拠（どこで確かめたか）を書く。分からない物は REQ-006 へ回す

### REQ-008 調べ方

- 使ったコマンド（`yarn info -A -R --manifest --json`、`git ls-files .yarn/cache`、`git ls-files public` など）を書く
- 区分の決め方（REQ-004。`patch:` の元の項目の用途の決め方を含む）、manifest に値がない物の確かめ方（TS-5）、未追跡 zip の掃除（TS-4）を書く

### REQ-009 変更範囲

- 変えるファイルは `docs/license-inventory.md` の新規 1 つだけ
- `LICENSE` を追加しない。`package.json` の `license` フィールドを追加しない。依存・コード・`.yarn/cache` を変えない
- `docs/decisions/` には置かない

### REQ-010 検証とコミット・PR

- `yarn markdownlint-cli2 docs/license-inventory.md` が通る（lefthook の pre-commit と同じ設定）
- `git-spice-workflow` スキルに従う: コミットは `gs commit create`、type は `docs`、body 必須。PR は 1 本、英語、テンプレートに沿う。Related Documents は今のテンプレートの記法に従う
- PR 本文の Summary に、妨げになる物と確かめきれない物の件数と要点を書く
- PR を作るレーンはワークフローの設定に従う（この run の変数は `open_pr=false`、`push=true`）。この spec は PR の中身の要件だけを定める
- この run の中で PR を作らない場合は、PR のタイトルと本文の下書き（英語・テンプレートどおり）を実装の bead のノートに残す。PR の要件はその下書きで確かめる

## Example Mapping

- 規則: 同梱は追跡済みの zip で決める
  - 例: `@img/sharp-linux-arm64` の zip が `git ls-files .yarn/cache` にある → `同梱`
  - 例: `@img/sharp-linux-x64` は `yarn info` には出るが追跡済みの zip がない（`yarn info` 実行後に未追跡で落ちていても）→ `未取得`
- 規則: 用途は依存を辿って決める
  - 例: `sharp` が `next`（`dependencies`）経由で辿れる場合 → `実行時`
  - 例: `@biomejs/biome` が `devDependencies` からしか辿れない → `開発時のみ`
  - 例: `dependencies` と `devDependencies` の両方から辿れる → `実行時`
  - 例: `typescript@npm:5.9.3`（`patch:` の元の項目）には依存の辺が来ない → それを元にした `patch:` の項目（`yarn.lock` の `"typescript@patch:typescript@npm%3A<5.10.0#optional!builtin<compat/typescript>"`）と同じ用途の区分にする
- 規則: 選択式で許容的なものを選べる物は妨げにしない
  - 例: `MIT OR Apache-2.0`、`(WTFPL OR MIT)` → 妨げではない
  - 例: `Apache-2.0 AND LGPL-3.0-or-later` → LGPL を含むので妨げ
- 規則: manifest に値がない物は LICENSE ファイルで確かめる
  - 例: `jsesc@0.5.0` の LICENSE が MIT と読める → 表のライセンスに `MIT（manifest に値なし、LICENSE ファイルで確認）`、確かめきれない物には載せない
  - 例: LICENSE ファイルがない・読んでも決まらない → 表は `不明`、確かめきれない物に載せる
- 規則: 権利が別にある実行時の素材は妨げとして報告する
  - 例: `emoji-picker-react`（MIT）は表で許容的だが、既定で読む Apple の絵文字画像は別の権利 → 妨げの節に載せる

## Acceptance Criteria

1. `docs/license-inventory.md` があり、基準コミットの SHA と調べた日付と、法的な最終判断ではない旨が書かれている（REQ-001）
2. 要約にライセンス別の件数・妨げの件数・確かめきれない物の件数があり、本文と一致する（REQ-002）
3. npm 全件表の行数が `yarn info -A -R --manifest --json` の項目数 − 1 と一致し、各行に 4 列（パッケージ・版・ライセンス・区分）がある（REQ-003）
4. 各行の区分に、配布（同梱／未取得）と用途（実行時／開発時のみ）が 1 つずつある。同梱の判定が追跡済みの zip と一致する。`patch:` の元の項目の用途が対応する `patch:` の項目と同じである（REQ-004）
5. 妨げの節に、LGPL を含む物・MPL-2.0・CC-BY-4.0・Apple の絵文字画像が、該当するパッケージ@版、使われ方、影響、対処案とともに載っている。design の候補から増減した場合は理由がある（REQ-005）
6. 確かめきれない物の節に、`public/` の画像・アイコン・ロゴの作者と出所、manifest に値がなく決まらなかった物が、誰が何を確かめればよいかとともに載っている（REQ-006）
7. コード以外の物の節に、`public/` の追跡対象すべて、フォント（配布物なし）、外から取る素材、`.claude/skills/gh-stack/`、`.yarn/releases/yarn-4.4.0.cjs` が、権利者・ライセンス・根拠とともに載っている（REQ-007）
8. 調べ方の節に、使ったコマンド、区分の決め方（`patch:` の元の項目の扱いを含む）、manifest に値がない物の確かめ方、未追跡 zip の掃除が書かれている（REQ-008）
9. ブランチの差分が `docs/license-inventory.md` の追加だけで、`LICENSE`・`package.json`・`.yarn/cache` に変更がない（REQ-009）
10. markdownlint が通る。コミットが `docs:` で body がある。PR（この run で PR を作らない場合は bead のノートに残した PR の下書き）が英語でテンプレートに沿い、Summary に妨げと確かめきれない物の件数がある（REQ-010）

### Testing expectations

- コードの変更がないため、単体テストは追加しない
- 機械的に確かめる物: 全件表の行数と `yarn info` の項目数 − 1 の一致、同梱の判定と `git ls-files .yarn/cache` の一致（一時的なスクリプトをスクラッチ領域で使ってよい。リポジトリには入れない）、`git diff --name-only main...HEAD` が `docs/license-inventory.md` だけであること、`git status --porcelain .yarn/cache` が空であること、markdownlint の成功
- 目で確かめる物: 妨げ・確かめきれない物の各件に、使われ方・影響・対処案（または確かめる人と事項）が揃っていること

### Risks

- `yarn info --manifest` の実行で他 OS・他 CPU 用の zip（2026-11-18 時点で 94 個）が `.yarn/cache` に未追跡で落ちる。掃除しないと PR に混ざり、同梱の判定も誤る（TS-2、TS-4 で対処）
- 全件表が約 970 行になり、ファイルが長い。design で受け入れた短所（案 A）
- 影響の説明を断定的に書くと法的判断に見える。報告の言い方にとどめ、最終判断は人に返す（REQ-005）
- `main` が `ffa7ffcc` から進むと件数が design と変わる。実際に取った値を書く（REQ-001）

## Out Of Scope

- `LICENSE` ファイル・`package.json` の `license` フィールドの追加、ライセンスの決定
- 妨げの解消（依存の置き換え、`.yarn/cache` の扱いの変更、画像の差し替え、絵文字画像の出し方の変更）
- 法的な最終判断
- 一覧を作り直すスクリプトや CI の追加（調べ方は報告に手順として書く）
- backend リポジトリの洗い出し
- 静的な確かめの CI、PnP の相性の試し、lefthook（同じ HQ 依頼の他の部分。互いを待たない）

## Open Questions

- 設計・実装を進めるために人の答えが要る問いはない
- 洗い出しの結果として報告の中で人に返す事項（実装を止めない）:
  - `public/` の画像・アイコン・ロゴは所有者の自作か、生成ツールや素材を使ったか
  - 妨げになる物それぞれをどう扱うか（置き換える・同梱をやめる・条件を満たす）

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
