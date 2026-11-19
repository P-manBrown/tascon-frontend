# Design candidate: ライセンスの洗い出し（tascon-frontend）

- root bead: tf-5hke（superpowers-build）/ target: tf-2f5w（HQ 依頼 gc-vjh8 の 1/4）
- brainstorm bead: tf-qgte（attempt 1, iteration 1）
- approval mode: autonomous
- approval status: **承認済み（autonomous、approval bead tf-1sfy、2026-11-19）**。判定の記録: `design-approval.md`。自律承認の根拠は末尾に記録

## Superpowers checklist（1–5）の状態

1. project context inspected: 済。下の「調べた事実」に記録
2. visual questions ahead?: なし。報告文書の構成と調べ方の設計で、画面や図で比べる問いがない → Visual Companion は提示しない
3. clarifying questions: 設計を決めるのに人の答えが要る問いはない。洗い出しの結果として人に確かめてもらう事項（画像の作者など）は、報告の中の「確かめきれない物」として扱う（設計の問いではない）
4. approaches: 3 案を比較し推奨を決定
5. design sections: 下記「設計」に記録

## 求められている成果（Requested outcome）

1. 依存の npm パッケージ（今の lockfile 基準）のライセンスの一覧
2. コード以外の物（`public/` の画像、フォント、外から取る素材）のライセンスと権利の一覧
3. オープンソースのライセンス（MIT が候補）を付けるのに妨げになる物（LGPL・MPL・CC-BY など）の報告
4. 確かめきれない物の報告
5. 今夜は PR を出すところまで

## 制約（Constraints）

- `LICENSE` はまだ付けない。`package.json` の `license` フィールドも追加しない（同じ趣旨）
- npm の一覧は今の lockfile から作る（Yarn 4: `yarn info -A -R --manifest --json` など）
- リポジトリのルール・スキルに従う（`git-spice-workflow`: PR は英語・テンプレート使用、Conventional Commits、コミット body 必須。Markdown は markdownlint の pre-commit を通す）
- 他の部分（静的な確かめの CI、PnP の相性の試し、lefthook）とは独立。互いを待たない

## 対象外（Non-goals）

- `LICENSE` ファイル・`license` フィールドの追加、ライセンスの決定そのもの
- 妨げになる物の解消（依存の置き換え、`.yarn/cache` の扱いの変更、画像の差し替え、emoji の画像の出し方の変更など）。報告と対処案の提示まで
- 法的な最終判断。報告は「各ライセンスの一般的な条件と、このリポジトリでの使われ方」の整理にとどめ、判断が要る点は人に返す
- 一覧を作り直すスクリプトや CI の追加（一回きりの洗い出し。手順は報告に書く）
- backend リポジトリの洗い出し

## 調べた事実（project context）

### npm 依存

- `package.json`: `private: true`、`license` なし。Yarn 4.4.0、`nodeLinker: node-modules`
- `.yarn/cache` が**リポジトリにコミットされている**（874 個の zip）。つまり依存パッケージの配布物そのものがリポジトリの中身として再配布されている。`.yarn/releases/yarn-4.4.0.cjs` もコミット済み
- `.yarn/cache` には aarch64 用のネイティブパッケージ（`@img/sharp-libvips-linux-arm64`、`@img/sharp-linux-arm64`、`lightningcss-linux-arm64-gnu`）が入っている
- `yarn info -A -R --manifest --json` は動作し、969 項目を返す（workspace 自身を含む）。manifest の `license` の内訳（2026-11-18 時点、`ffa7ffcc`）:
  - MIT 793、ISC 71、Apache-2.0 26、BSD-2-Clause 16、BSD-3-Clause 10、MIT OR Apache-2.0 9、BlueOak-1.0.0 4、(MIT OR CC0-1.0) 3、(WTFPL OR MIT) 2、0BSD 2、CC0-1.0 1、(AFL-2.1 OR BSD-3-Clause) 1、Python-2.0 1（`argparse@2.0.1`）
  - MPL-2.0 12、LGPL-3.0-or-later 10、Apache-2.0 AND LGPL-3.0-or-later 3、Apache-2.0 AND LGPL-3.0-or-later AND MIT 1
  - CC-BY-4.0 2（`caniuse-lite` の 2 版）
  - 値なし 2: `tascon-frontend@workspace:.`（自分）と `jsesc@0.5.0`（古い `licenses` 配列形式のため manifest の `license` が空。パッケージ内のファイルで個別に確かめる必要がある）
- 969 項目と cache の 874 個の差は、他のアーキテクチャ・OS 用のオプション依存（cache に入っていない）と workspace 自身と見られる。実装時に突き合わせる

### コード以外の物

- `public/`（追跡対象 13 ファイル）: `favicon.ico`、`icons/*.png`（PWA アイコン 9 枚）、`logos/logo.png`・`logos/logo-small.png`、`manifest.json`。2023-03〜2024-07 に所有者（P-manBrown）がコミット。作者・作り方（自作か、生成ツールか、素材サイトか）はリポジトリからは分からない
- フォント: フォントファイルなし。`next/font` 未使用。`tailwind.config.js` の `fontFamily` は端末のシステムフォント（Helvetica Neue、Arial、Hiragino、Meiryo）の指定のみ → 配布物なし
- 外から取る素材:
  - `emoji-picker-react@4.18.0` の `Picker` と `Emoji`（8 ファイルで使用）は `emojiStyle` 未指定 → 既定の Apple 形式で、`cdn.jsdelivr.net/npm/emoji-datasource-apple` から絵文字の画像を実行時に読み込む。Apple の絵文字画像の権利は npm パッケージ（MIT）とは別
  - `boring-avatars`（実行時に SVG を生成）、`@heroicons/react`（SVG をバンドル）、`@schedule-x/theme-default`（CSS）は npm パッケージとして一覧に含まれる
  - Google フォームへのリンク（`forms.gle`）は素材ではない（対象外として一言記す）
- リポジトリ内の第三者由来の文書: `.claude/skills/gh-stack/`（`github/gh-stack` v0.3.0 の skill をコピー、SKILL.md の metadata に出所あり）。`.github/COMMIT_CONVENTION` は所有者自身のリポジトリのサブモジュール

## 方式の比較（Approach tradeoffs）

### 案 A: Markdown の報告 1 ファイルに、要約・妨げ・確かめきれない物・コード以外の物・npm 全件の表をまとめる（推奨）

- 置き場所: `docs/license-inventory.md`
- 長所: 1 か所で読み切れる。GitHub 上で表として読め、検索もできる。追加の仕組みなし
- 短所: npm の全件表が約 970 行になり、ファイルが長い。差分の比較（次回の洗い出し）は手作業

### 案 B: Markdown の報告 + npm 全件を CSV の別ファイル

- 長所: 報告が短く読みやすい。CSV は機械で扱いやすく、次回との比較が楽
- 短所: ファイルが 2 つ。CSV は markdownlint の対象外で、列の取り違えなどを機械で確かめられない。次回の比較は依頼にない

### 案 C: 一覧を作るスクリプトをリポジトリに入れ、その出力を報告にする

- 長所: 作り直せる
- 短所: 依頼は一回の洗い出しと報告で、作り直しの仕組みは求められていない。保守するコードが増える（AGENTS.md の「単発利用コードの抽象化禁止」に反する）

**推奨: 案 A**。依頼の成果（一覧と報告）を最小の構成で満たす。作り方は報告の「調べ方」に手順として書き、作り直しが必要になったら案 B/C を別途検討する。

## 設計（Recommended design）

### 1. 変更するファイル

- `docs/license-inventory.md`（新規）のみ。`LICENSE`・`package.json`・依存・コードは変更しない
- `docs/decisions/` には入れない（設計判断ではなく、ある時点の調査結果のため）

### 2. 報告の構成（日本語。リポジトリの文書の慣例に合わせる）

1. 冒頭: 調べた日付、基準のコミット（`main` の SHA）、目的（MIT などの OSS ライセンスを付ける前の洗い出し）、「法的な最終判断ではない」旨
2. 要約: 件数（ライセンス別）、妨げになる物の数、確かめきれない物の数
3. 妨げになる物: 1 件ごとに、物の名前（パッケージ@版／ファイル）、ライセンス、このリポジトリでの使われ方（下の 4 つの区分）、MIT を付けることへの影響、取れる対処の案
4. 確かめきれない物: 1 件ごとに、何が分からないか、誰が何を確かめれば決まるか
5. コード以外の物の一覧: `public/` の全ファイル、フォント（なし）、外から取る素材（emoji の画像の CDN など）、第三者由来の文書（`.claude/skills/gh-stack/`）。それぞれの権利者・ライセンス・根拠
6. npm 依存の全件表: 列は「パッケージ」「版」「ライセンス（manifest の値）」「区分」。ライセンス別に並べる
7. 調べ方: 使ったコマンド（`yarn info -A -R --manifest --json` ほか）と、区分の決め方、manifest に値がない物の確かめ方

### 3. 区分（使われ方）の決め方

ライセンスの条件は「配るかどうか・どう配るか」で変わるため、各 npm パッケージに次の区分を付ける。

- **リポジトリに同梱**: `.yarn/cache` に zip がある（＝リポジトリを公開すると再配布になる）
- **実行時の依存**: `package.json` の `dependencies` から辿れる（ビルド後のアプリに入り得る）
- **開発時のみ**: `devDependencies` からしか辿れない
- **未取得**: lockfile にはあるが、このリポジトリの cache に入っていない他 OS・他アーキテクチャ用のオプション依存

「同梱」と「実行時／開発時」は独立に付く（1 つのパッケージに 2 つ付き得る）。辿り方は lockfile の依存関係（`yarn info` の `Dependencies` または `yarn.lock`）から機械的に求め、方法を報告の「調べ方」に書く。

### 4. 妨げ・確かめきれない物の判定基準

- **問題なし（許容的なライセンス）**: MIT、ISC、Apache-2.0、BSD-2/3-Clause、0BSD、BlueOak-1.0.0、CC0-1.0、Python-2.0、および選択式（`A OR B`）で許容的なものを選べる物（`MIT OR Apache-2.0`、`(WTFPL OR MIT)`、`(MIT OR CC0-1.0)`、`(AFL-2.1 OR BSD-3-Clause)`）
- **妨げになる物（報告対象）**: 依頼の例（LGPL・MPL・CC-BY）と同じ種類の、条件付きで配布に義務が生じるもの。GPL・AGPL・LGPL・MPL・EPL・CC-BY 系、および `AND` でそれらを含む複合ライセンス。今回の候補:
  - `LGPL-3.0-or-later` を含む物（`@img/sharp-libvips-*` など sharp のネイティブ部品。arm64 用は `.yarn/cache` に同梱）
  - `MPL-2.0`（`lightningcss` 系。cache に同梱）
  - `CC-BY-4.0`（`caniuse-lite`）
  - 実行時に読み込む Apple の絵文字画像（`emoji-datasource-apple`。画像の権利は Apple。npm のライセンスとは別）
- **確かめきれない物（報告対象）**: manifest に値がない・`SEE LICENSE IN`・`UNLICENSED`・SPDX でない値の物（今回は `jsesc@0.5.0`。パッケージ内の LICENSE ファイルを読み、決まれば一覧に反映し、決まらなければ残す）、作者・出所がリポジトリから分からない物（`public/` の画像とアイコン → 所有者に「自作か、何で作ったか、素材を使ったか」を確かめてもらう）
- 判定は「妨げ」「確かめきれない」を断定ではなく報告として書き、影響の説明には「リポジトリに同梱」「実行時に配る」「開発時のみ」の区分を使う（例: MPL・LGPL は依存として使うだけなら自分のコードを MIT にすることは妨げないが、同梱して再配布するときに条件がある、など）。法的な最終判断は人に返す

### 5. 作業の進め方（plan lane への入力）

1. `main` の最新を基準にする。`yarn info -A -R --manifest --json` で全件と manifest の license を取る
2. `.yarn/cache` の zip 名と突き合わせ「同梱」「未取得」を付ける
3. lockfile の依存関係を `dependencies` / `devDependencies` から辿り「実行時」「開発時のみ」を付ける
4. 値なし・非 SPDX の物は、`.yarn/cache` の zip（または `node_modules`）の LICENSE ファイルを読んで確かめる
5. コード以外の物を一覧にする（`git ls-files` で `public/` 等、フォント設定、外部 URL・CDN の読み込み、第三者由来の文書）
6. 報告を書き、markdownlint（`yarn markdownlint-cli2 docs/license-inventory.md`）を通す
7. `git-spice-workflow` に従いブランチ・コミット（`docs:`、body 付き）・PR（英語・テンプレート）。PR 本文の Summary に、妨げになる物と確かめきれない物の件数と要点を書く（人がすぐ見られるように）

### 6. コミット・PR

- type は `docs`（文書のみの変更）
- PR は 1 本。Related Documents は今のテンプレートの記法に従い、plan・spec がなければ N/A
- PR 本文は英語。報告本体（`docs/license-inventory.md`）は日本語

## 受け入れ基準（Acceptance criteria）

1. `docs/license-inventory.md` があり、基準コミットの SHA と調べた日付が書かれている
2. npm の全件（`yarn info -A -R --manifest --json` の全項目から workspace 自身を除いた物）が表にあり、各行にライセンスと区分がある。件数が `yarn info` の件数 − 1 と一致する
3. 妨げになる物の節に、少なくとも LGPL を含む物・MPL-2.0・CC-BY-4.0・Apple の絵文字画像が、使われ方・影響・対処案とともに載っている（調べた結果で増減した場合はその理由が書かれている）
4. 確かめきれない物の節に、`public/` の画像・アイコンの作者／出所と、manifest に値のない物（確かめて決まった物は一覧へ反映）が、誰が何を確かめればよいかとともに載っている
5. コード以外の物の節に、`public/` の追跡対象 13 ファイルすべて、フォント（システムフォントのみで配布物なし）、外から取る素材、`.claude/skills/gh-stack/` が載っている
6. 調べ方の節に、使ったコマンドと区分の決め方がある
7. `LICENSE` と `package.json` の `license` が追加されていない。`docs/license-inventory.md` 以外のファイルが変わっていない
8. markdownlint が通る。PR が英語でテンプレートに沿い、Summary に妨げ・確かめきれない物の件数がある

## 前提として置いたこと（Assumptions）

- 報告の置き場所は `docs/license-inventory.md`（`docs/` は既存の文書置き場。decisions ではないため直下に置く）
- 報告は日本語（`docs/` の既存文書と依頼の言語に合わせる）。PR 本文は英語（リポジトリのルール）
- 「妨げになる物」は依頼の例（LGPL・MPL・CC-BY）と同じ種類（配布に条件が付くもの）と、権利が別にある実行時素材とする
- `.yarn/cache` がコミットされていることを、配布の区分として扱う（今回の洗い出しで最も影響が大きい事実のため）
- 一覧は lockfile の全項目を対象にし、実行時・開発時を区別する（依頼は「今の lockfile」）

## 未解決の問い（Unresolved questions）

- 設計を決めるための人への問いはない
- 洗い出しの結果として人に返す事項（設計の問いではなく、報告の「確かめきれない物」に載る）:
  - `public/` の画像・アイコン・ロゴは所有者の自作か、生成ツールや素材を使ったか
  - 妨げになる物それぞれの扱い（置き換え・同梱をやめる・条件を満たす）をどうするか

## 自律承認の根拠（Autonomous approval basis）

- 依頼本文が、対象（npm と、`public/`・フォント・外の素材）、取得方法の例（`yarn info -A -R --manifest --json`）、報告すべき物（LGPL・MPL・CC-BY などの妨げと、確かめきれない物）、制約（LICENSE は付けない）、到達点（PR まで）を明示している
- 残る選択（置き場所・形式・区分）は、リポジトリの文書の慣例と、実地で確かめた事実（`.yarn/cache` のコミット、`yarn info` の出力、emoji の CDN 読み込み）で決まる
- 推奨案以外を選ぶ理由になる人の好み・外部制約は見つからなかった
- この候補の承認判定（verdict）は design approval lane が行う
