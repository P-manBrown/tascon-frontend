# ライセンスの洗い出し

- 調べた日: 2026-11-19（JST）
- 基準コミット: `main` の `ffa7ffccfc3f59b58f166a9ad8a31b0eaf864dca`
- 目的: このリポジトリに MIT などのオープンソースのライセンスを付ける前に、リポジトリが使い・配っている物の権利を洗い出し、付ける妨げになる物と、リポジトリからは確かめきれない物を所有者が判断できる形にまとめる
- この報告は法的な最終判断ではない。各ライセンスの一般的な条件と、このリポジトリでの使われ方を整理したもの。判断が要る点は「妨げになる物」「確かめきれない物」に挙げ、所有者に返す
- 作業ブランチはスタックの下段の変更を含むが、npm 依存・`public/`・ソースは基準コミットと同じ。違いは「第三者由来の物」に書く

## 要約

- 妨げになる物: 4 件（LGPL-3.0-or-later を含む sharp のネイティブ部品、MPL-2.0 の lightningcss 系、CC-BY-4.0 の caniuse-lite、実行時に CDN から読む Apple の絵文字画像）
- 確かめきれない物: 1 件（`public/` の画像・アイコン・ロゴの作者と出所）
- npm 依存の項目数: 968（`yarn info` の 969 項目から workspace 自身を除く）
- 追跡済みの `.yarn/cache` の zip: 874 個（すべて表のいずれかの行に対応）
- 同梱: 874
- 未取得: 94
- 実行時: 654
- 開発時のみ: 314

| ライセンス | 件数 |
| --- | --- |
| MIT | 794 |
| ISC | 71 |
| Apache-2.0 | 26 |
| BSD-2-Clause | 16 |
| MPL-2.0 | 12 |
| BSD-3-Clause | 10 |
| LGPL-3.0-or-later | 10 |
| MIT OR Apache-2.0 | 9 |
| BlueOak-1.0.0 | 4 |
| (MIT OR CC0-1.0) | 3 |
| Apache-2.0 AND LGPL-3.0-or-later | 3 |
| (WTFPL OR MIT) | 2 |
| 0BSD | 2 |
| CC-BY-4.0 | 2 |
| (AFL-2.1 OR BSD-3-Clause) | 1 |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1 |
| CC0-1.0 | 1 |
| Python-2.0 | 1 |

## 区分の見方

npm 依存の各行には、配布の区分と用途の区分を 1 つずつ付けている。

- 同梱: 追跡済みの `.yarn/cache` に対応する zip がある。`.yarn/cache` はリポジトリにコミットされているため、リポジトリを公開するとその依存の配布物自体を再配布することになる
- 未取得: lockfile にはあるが、追跡済みの `.yarn/cache` にない（他 OS・他 CPU 用のオプション依存など）。リポジトリでは配らない
- 実行時: ルートの `package.json` の `dependencies` から lockfile の依存関係を辿って届く（`devDependencies` からも届く物を含む）。ビルド後のアプリや本番のサーバーに入り得る。届くことは、ビルド結果に必ず入ることを意味しない
- 開発時のみ: `devDependencies` からしか届かない。開発・ビルドの道具として使い、アプリには入らないと見られる

## 妨げになる物

判定の基準: GPL・AGPL・LGPL・MPL・EPL・CC-BY 系のライセンス、`AND` でそれらを含む複合ライセンス、権利が npm のライセンスと別にある実行時の素材。`A OR B` で許容的なライセンスを選べる物（`MIT OR Apache-2.0`、`(MIT OR CC0-1.0)`、`(WTFPL OR MIT)`、`(AFL-2.1 OR BSD-3-Clause)`）は対象にしない。

### 1. LGPL-3.0-or-later を含む物（sharp のネイティブ部品）

- 該当（14 件）:
  - `@img/sharp-libvips-darwin-arm64@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-libvips-darwin-x64@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-libvips-linux-arm@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-libvips-linux-arm64@1.2.4`（LGPL-3.0-or-later、同梱・実行時）
  - `@img/sharp-libvips-linuxmusl-arm64@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-libvips-linuxmusl-x64@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-libvips-linux-ppc64@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-libvips-linux-riscv64@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-libvips-linux-s390x@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-libvips-linux-x64@1.2.4`（LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-wasm32@0.34.5`（Apache-2.0 AND LGPL-3.0-or-later AND MIT、未取得・実行時）
  - `@img/sharp-win32-arm64@0.34.5`（Apache-2.0 AND LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-win32-ia32@0.34.5`（Apache-2.0 AND LGPL-3.0-or-later、未取得・実行時）
  - `@img/sharp-win32-x64@0.34.5`（Apache-2.0 AND LGPL-3.0-or-later、未取得・実行時）
- 使われ方: `next` が画像の最適化に使う `sharp@0.34.5` の、OS・CPU ごとのネイティブ部品。LGPL を含む物のうち、arm64 の Linux 用 `@img/sharp-libvips-linux-arm64` だけが `.yarn/cache` に同梱され、ほかは未取得。同じ `@img/sharp-*` でも、同梱している `@img/sharp-linux-arm64` のライセンスは Apache-2.0 で、LGPL を含まない。すべて実行時
- MIT を付けることへの影響: LGPL-3.0 は、ライブラリを別の部品として使うだけなら、使う側のコードに LGPL を課さないとされる。このリポジトリのコードに MIT を付けることは妨げないと読める。一方、同梱している zip（libvips のバイナリを含む）をリポジトリごと公開すると、LGPL の物自体を再配布することになり、ライセンス文を添えること、対応するソースを入手できるようにすることなどの条件が付く。`Apache-2.0 AND ...` の物には Apache-2.0 の条件（ライセンス文・NOTICE の保持）も加わる。未取得の物はリポジトリでは配らない
- 取れる対処の案:
  - `.yarn/cache` をコミットしない運用に変え、依存の配布物をリポジトリで再配布しない
  - 同梱を続ける場合は、zip 内のライセンス文を保ち、libvips のソースの入手先（上流のリリース）を第三者のライセンス表示として書く
  - 本番で画像の最適化が要らなければ、sharp を使わない構成にできるか確かめる

### 2. MPL-2.0（lightningcss 系）

- 該当（12 件）:
  - `lightningcss@1.30.2`（同梱・開発時のみ）
  - `lightningcss-android-arm64@1.30.2`（未取得・開発時のみ）
  - `lightningcss-darwin-arm64@1.30.2`（未取得・開発時のみ）
  - `lightningcss-darwin-x64@1.30.2`（未取得・開発時のみ）
  - `lightningcss-freebsd-x64@1.30.2`（未取得・開発時のみ）
  - `lightningcss-linux-arm64-gnu@1.30.2`（同梱・開発時のみ）
  - `lightningcss-linux-arm64-musl@1.30.2`（未取得・開発時のみ）
  - `lightningcss-linux-arm-gnueabihf@1.30.2`（未取得・開発時のみ）
  - `lightningcss-linux-x64-gnu@1.30.2`（未取得・開発時のみ）
  - `lightningcss-linux-x64-musl@1.30.2`（未取得・開発時のみ）
  - `lightningcss-win32-arm64-msvc@1.30.2`（未取得・開発時のみ）
  - `lightningcss-win32-x64-msvc@1.30.2`（未取得・開発時のみ）
- 使われ方: `@tailwindcss/postcss`（`devDependencies`）が CSS の変換に使う。`lightningcss` と arm64 の Linux 用 `lightningcss-linux-arm64-gnu` が同梱、ほかは未取得。すべて開発時のみ
- MIT を付けることへの影響: MPL-2.0 はファイル単位のコピーレフトで、MPL のファイルを変えずに別の部品として使うだけなら、使う側のコードに MPL を課さないとされる。このリポジトリのコードに MIT を付けることは妨げないと読める。同梱して再配布する場合は、MPL のファイルを MPL のまま配り、ソースの入手方法を示す条件が付く。開発時のみの依存のため、ビルド後のアプリには入らないと見られる
- 取れる対処の案:
  - `.yarn/cache` をコミットしない運用に変える
  - 同梱を続ける場合は、zip 内の MPL の文面を保ち、ソースの入手先（上流のリポジトリ）を第三者のライセンス表示として書く

### 3. CC-BY-4.0（caniuse-lite）

- 該当（2 件）:
  - `caniuse-lite@1.0.30001593`（同梱・実行時）
  - `caniuse-lite@1.0.30001646`（同梱・実行時）
- 使われ方: ブラウザの対応状況のデータ。`browserslist` などを通して使われ、2 版とも同梱・実行時
- MIT を付けることへの影響: CC-BY-4.0 はデータを再配布するときに、出典の表示とライセンスへの言及を求める。このリポジトリのコードに MIT を付けることは妨げないと読めるが、同梱して公開する場合は表示の条件を満たす必要がある
- 取れる対処の案:
  - `.yarn/cache` をコミットしない運用に変える
  - 同梱を続ける場合は、第三者のライセンス表示に caniuse のデータの出典と CC-BY-4.0 を書く

### 4. Apple の絵文字画像（実行時に CDN から読む素材）

- 該当: `emoji-picker-react@4.18.0`（MIT、同梱・実行時）が既定で読む `emoji-datasource-apple` の画像（`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/`）
- 使われ方: `src` で `emoji-picker-react` の `Picker`・`Emoji` を `emojiStyle` の指定なしで使っており、既定の Apple 形式になる。画像はリポジトリに含まれず、lockfile の項目でもない（npm の全件表にない）。アプリの利用者のブラウザが実行時に CDN から読む
- MIT を付けることへの影響: 画像の権利は Apple にあり、`emoji-picker-react` のライセンス（MIT）とは別。リポジトリに含まないため、リポジトリのコードに MIT を付けること自体は妨げないと読める。アプリを公開・運用するときに、Apple の画像を表示に使ってよいかが別の問題として残る
- 取れる対処の案:
  - `emojiStyle` を `native` にし、利用者の端末の絵文字フォントで表示する
  - 条件が公開されている別の絵文字セット（`twitter`・`google` 形式など）に替え、そのライセンスの表示の条件を満たす
  - 今のままにする場合は、Apple の画像の利用条件を所有者が確かめる

### 調べる前に想定した候補からの増減

調べる前に想定した候補（LGPL を含む物・MPL-2.0・CC-BY-4.0・Apple の絵文字画像）から増減はない。

## 確かめきれない物

### 1. `public/` の画像・アイコン・ロゴの作者と出所

- 対象: `public/favicon.ico`、`public/icons/` の PNG 9 枚、`public/logos/logo.png`、`public/logos/logo-small.png`
- 分からないこと: 誰が作ったか、どう作ったか（自作か、生成ツールを使ったか、素材サイトの素材を使ったか）。リポジトリからは、所有者（P-manBrown）が 2023-03-11 〜 2024-07-10 にコミットしたことしか分からない
- 決めるために: 所有者が、それぞれの画像の作り方と、素材やツールを使った場合はその利用条件を確かめる。自作なら MIT の対象に含められる。素材やツールの条件があれば、それを第三者のライセンス表示に書くか、画像を差し替える

manifest に値がない npm 依存は `jsesc@0.5.0` だけで、LICENSE ファイル（`LICENSE-MIT.txt`）で MIT と確かめたため、ここには載せない。

## コード以外の物・npm 依存以外の第三者由来の物

### `public/` のファイル

| ファイル | 権利者 | ライセンス | 根拠 |
| --- | --- | --- | --- |
| `public/favicon.ico` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/apple-touch-icon.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/icon-72x72.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/icon-96x96.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/icon-128x128.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/icon-144x144.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/icon-152x152.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/icon-192x192.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/icon-384x384.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/icons/icon-512x512.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/logos/logo.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/logos/logo-small.png` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
| `public/manifest.json` | 所有者（P-manBrown） | このリポジトリのライセンスに従う | PWA の設定ファイルで、所有者が書いた物（`git log`） |

### フォント

- フォントファイルはリポジトリにない。`next/font`・`@font-face` も使っていない
- `tailwind.config.js` の `fontFamily.body` は端末にあるシステムフォント（Helvetica Neue、Arial、Hiragino Kaku Gothic ProN、Hiragino Sans、Meiryo、sans-serif）の名前を並べているだけで、フォントを配らない

### 外から取る素材

- Apple の絵文字画像: `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/` から実行時に読む。権利者は Apple。「妨げになる物」の 4
- `boring-avatars`（実行時に SVG を作る）、`@heroicons/react`（SVG のアイコン）、`@schedule-x/theme-default`（CSS）は npm パッケージとして全件表に含めている
- Google フォームへのリンク（`forms.gle`）と GitHub の Issue 作成へのリンクは素材ではないため対象外

### 第三者由来の物

| 物 | 権利者 | ライセンス | 根拠 |
| --- | --- | --- | --- |
| `.claude/skills/gh-stack/`（`github/gh-stack` v0.3.0 の skill のコピー） | GitHub | MIT | 基準コミットの `SKILL.md` の metadata（`github-repo`・`github-ref`）と、上流リポジトリのライセンス表示 |
| `.yarn/releases/yarn-4.4.0.cjs`（Yarn 本体。`package.json` の `packageManager` で指定しコミット済み） | Yarn の作者 | BSD-2-Clause | 上流（`yarnpkg/berry`）のライセンス表示。ファイルの先頭に表示はない |
| `.github/COMMIT_CONVENTION`（サブモジュール） | 所有者（P-manBrown） | 所有者のリポジトリの定めに従う | `.gitmodules` の URL |

- `.claude/skills/gh-stack/` は基準コミットにはあるが、スタックの下段の PR（#943、`chore/drop-gh-stack`）で削除される。#943 が `main` に入れば対象から外れる。残る場合は、MIT の条件（著作権表示とライセンス文を添えること）を満たすため、上流の LICENSE を添える必要があると読める（コピーに LICENSE ファイルは含まれていない）
- Yarn 本体は lockfile の項目ではないため、npm 依存の全件表には入れていない。BSD-2-Clause は許容的なライセンスで妨げではない。再配布の条件（著作権表示とライセンス文を添えること）は、ファイルに表示がないため、同梱を続けるなら第三者のライセンス表示に書くことが考えられる

## npm 依存の全件表

`yarn info -A -R --manifest --json` の全項目から workspace 自身（`tascon-frontend@workspace:.`）を除いた物。1 行が `yarn info` の 1 項目（同じパッケージの別の版、`patch:` の項目はそれぞれ別の行）。ライセンス別にまとめ、件数の多い順に並べ、同じライセンスの中はパッケージ名順。

### MIT（794 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@alloc/quick-lru` | 5.2.0 | MIT | 同梱・開発時のみ |
| `@apideck/better-ajv-errors` | 0.3.6 | MIT | 同梱・実行時 |
| `@babel/code-frame` | 7.23.5 | MIT | 同梱・実行時 |
| `@babel/code-frame` | 7.24.7 | MIT | 同梱・開発時のみ |
| `@babel/compat-data` | 7.23.5 | MIT | 同梱・実行時 |
| `@babel/core` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/generator` | 7.23.6 | MIT | 同梱・実行時 |
| `@babel/helper-annotate-as-pure` | 7.22.5 | MIT | 同梱・実行時 |
| `@babel/helper-builder-binary-assignment-operator-visitor` | 7.22.15 | MIT | 同梱・実行時 |
| `@babel/helper-compilation-targets` | 7.23.6 | MIT | 同梱・実行時 |
| `@babel/helper-create-class-features-plugin` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/helper-create-regexp-features-plugin` | 7.22.15 | MIT | 同梱・実行時 |
| `@babel/helper-define-polyfill-provider` | 0.5.0 | MIT | 同梱・実行時 |
| `@babel/helper-environment-visitor` | 7.22.20 | MIT | 同梱・実行時 |
| `@babel/helper-function-name` | 7.23.0 | MIT | 同梱・実行時 |
| `@babel/helper-hoist-variables` | 7.22.5 | MIT | 同梱・実行時 |
| `@babel/helper-member-expression-to-functions` | 7.23.0 | MIT | 同梱・実行時 |
| `@babel/helper-module-imports` | 7.22.15 | MIT | 同梱・実行時 |
| `@babel/helper-module-transforms` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/helper-optimise-call-expression` | 7.22.5 | MIT | 同梱・実行時 |
| `@babel/helper-plugin-utils` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/helper-remap-async-to-generator` | 7.22.20 | MIT | 同梱・実行時 |
| `@babel/helper-replace-supers` | 7.22.20 | MIT | 同梱・実行時 |
| `@babel/helper-simple-access` | 7.22.5 | MIT | 同梱・実行時 |
| `@babel/helper-skip-transparent-expression-wrappers` | 7.22.5 | MIT | 同梱・実行時 |
| `@babel/helper-split-export-declaration` | 7.22.6 | MIT | 同梱・実行時 |
| `@babel/helper-string-parser` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/helper-validator-identifier` | 7.22.20 | MIT | 同梱・実行時 |
| `@babel/helper-validator-identifier` | 7.24.7 | MIT | 同梱・開発時のみ |
| `@babel/helper-validator-option` | 7.23.5 | MIT | 同梱・実行時 |
| `@babel/helper-wrap-function` | 7.22.20 | MIT | 同梱・実行時 |
| `@babel/helpers` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/highlight` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/highlight` | 7.24.7 | MIT | 同梱・開発時のみ |
| `@babel/parser` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-bugfix-v8-static-class-fields-redefine-readonly` | 7.23.7 | MIT | 同梱・実行時 |
| `@babel/plugin-proposal-private-property-in-object` | 7.21.0-placeholder-for-preset-env.2 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-async-generators` | 7.8.4 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-class-properties` | 7.12.13 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-class-static-block` | 7.14.5 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-dynamic-import` | 7.8.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-export-namespace-from` | 7.8.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-import-assertions` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-import-attributes` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-import-meta` | 7.10.4 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-json-strings` | 7.8.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-logical-assignment-operators` | 7.10.4 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-nullish-coalescing-operator` | 7.8.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-numeric-separator` | 7.10.4 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-object-rest-spread` | 7.8.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-optional-catch-binding` | 7.8.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-optional-chaining` | 7.8.3 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-private-property-in-object` | 7.14.5 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-top-level-await` | 7.14.5 | MIT | 同梱・実行時 |
| `@babel/plugin-syntax-unicode-sets-regex` | 7.18.6 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-arrow-functions` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-async-generator-functions` | 7.23.9 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-async-to-generator` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-block-scoped-functions` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-block-scoping` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-class-properties` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-class-static-block` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-classes` | 7.23.8 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-computed-properties` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-destructuring` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-dotall-regex` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-duplicate-keys` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-dynamic-import` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-exponentiation-operator` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-export-namespace-from` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-for-of` | 7.23.6 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-function-name` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-json-strings` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-literals` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-logical-assignment-operators` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-member-expression-literals` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-modules-amd` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-modules-commonjs` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-modules-systemjs` | 7.23.9 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-modules-umd` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-named-capturing-groups-regex` | 7.22.5 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-new-target` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-nullish-coalescing-operator` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-numeric-separator` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-object-rest-spread` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-object-super` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-optional-catch-binding` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-optional-chaining` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-parameters` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-private-methods` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-private-property-in-object` | 7.23.4 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-property-literals` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-regenerator` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-reserved-words` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-shorthand-properties` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-spread` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-sticky-regex` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-template-literals` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-typeof-symbol` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-unicode-escapes` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-unicode-property-regex` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-unicode-regex` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/plugin-transform-unicode-sets-regex` | 7.23.3 | MIT | 同梱・実行時 |
| `@babel/preset-env` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/preset-modules` | 0.1.6-no-external-plugins | MIT | 同梱・実行時 |
| `@babel/regjsgen` | 0.8.0 | MIT | 同梱・実行時 |
| `@babel/runtime` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/template` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/traverse` | 7.24.0 | MIT | 同梱・実行時 |
| `@babel/types` | 7.24.0 | MIT | 同梱・実行時 |
| `@discoveryjs/json-ext` | 0.5.7 | MIT | 同梱・実行時 |
| `@emnapi/core` | 1.11.2 | MIT | 同梱・開発時のみ |
| `@emnapi/core` | 1.6.0 | MIT | 同梱・開発時のみ |
| `@emnapi/core` | 1.7.1 | MIT | 同梱・開発時のみ |
| `@emnapi/runtime` | 1.11.2 | MIT | 同梱・開発時のみ |
| `@emnapi/runtime` | 1.6.0 | MIT | 同梱・開発時のみ |
| `@emnapi/runtime` | 1.7.1 | MIT | 同梱・開発時のみ |
| `@emnapi/runtime` | 1.8.1 | MIT | 同梱・実行時 |
| `@emnapi/wasi-threads` | 1.1.0 | MIT | 同梱・開発時のみ |
| `@emnapi/wasi-threads` | 1.2.2 | MIT | 同梱・開発時のみ |
| `@evilmartians/lefthook` | 2.0.4 | MIT | 同梱・開発時のみ |
| `@gar/promisify` | 1.1.3 | MIT | 同梱・実行時 |
| `@heroicons/react` | 2.2.0 | MIT | 同梱・実行時 |
| `@hookform/resolvers` | 5.2.2 | MIT | 同梱・実行時 |
| `@img/colour` | 1.0.0 | MIT | 同梱・実行時 |
| `@isaacs/balanced-match` | 4.0.1 | MIT | 同梱・開発時のみ |
| `@isaacs/brace-expansion` | 5.0.1 | MIT | 同梱・開発時のみ |
| `@jridgewell/gen-mapping` | 0.3.3 | MIT | 同梱・実行時 |
| `@jridgewell/gen-mapping` | 0.3.5 | MIT | 同梱・実行時 |
| `@jridgewell/remapping` | 2.3.5 | MIT | 同梱・開発時のみ |
| `@jridgewell/resolve-uri` | 3.1.0 | MIT | 同梱・実行時 |
| `@jridgewell/resolve-uri` | 3.1.2 | MIT | 同梱・実行時 |
| `@jridgewell/set-array` | 1.1.2 | MIT | 同梱・実行時 |
| `@jridgewell/set-array` | 1.2.1 | MIT | 同梱・実行時 |
| `@jridgewell/source-map` | 0.3.5 | MIT | 同梱・実行時 |
| `@jridgewell/sourcemap-codec` | 1.4.14 | MIT | 同梱・実行時 |
| `@jridgewell/sourcemap-codec` | 1.4.15 | MIT | 同梱・実行時 |
| `@jridgewell/sourcemap-codec` | 1.5.5 | MIT | 同梱・開発時のみ |
| `@jridgewell/trace-mapping` | 0.3.18 | MIT | 同梱・実行時 |
| `@jridgewell/trace-mapping` | 0.3.25 | MIT | 同梱・実行時 |
| `@markuplint/cli-utils` | 4.4.14 | MIT | 同梱・開発時のみ |
| `@markuplint/config-presets` | 4.5.14 | MIT | 同梱・開発時のみ |
| `@markuplint/file-resolver` | 4.9.18 | MIT | 同梱・開発時のみ |
| `@markuplint/html-parser` | 4.6.23 | MIT | 同梱・開発時のみ |
| `@markuplint/html-spec` | 4.17.0 | MIT | 同梱・開発時のみ |
| `@markuplint/i18n` | 4.7.1 | MIT | 同梱・開発時のみ |
| `@markuplint/ml-ast` | 4.4.11 | MIT | 同梱・開発時のみ |
| `@markuplint/ml-config` | 4.8.15 | MIT | 同梱・開発時のみ |
| `@markuplint/ml-core` | 4.13.3 | MIT | 同梱・開発時のみ |
| `@markuplint/ml-spec` | 4.10.2 | MIT | 同梱・開発時のみ |
| `@markuplint/parser-utils` | 4.8.11 | MIT | 同梱・開発時のみ |
| `@markuplint/react-spec` | 4.5.23 | MIT | 同梱・開発時のみ |
| `@markuplint/rules` | 4.12.0 | MIT | 同梱・開発時のみ |
| `@markuplint/selector` | 4.7.8 | MIT | 同梱・開発時のみ |
| `@markuplint/shared` | 4.4.13 | MIT | 同梱・開発時のみ |
| `@markuplint/types` | 4.8.2 | MIT | 同梱・開発時のみ |
| `@napi-rs/wasm-runtime` | 1.0.7 | MIT | 同梱・開発時のみ |
| `@napi-rs/wasm-runtime` | 1.2.7 | MIT | 同梱・開発時のみ |
| `@next/bundle-analyzer` | 16.1.6 | MIT | 同梱・実行時 |
| `@next/env` | 16.1.6 | MIT | 同梱・実行時 |
| `@next/swc-darwin-arm64` | 16.1.6 | MIT | 未取得・実行時 |
| `@next/swc-darwin-x64` | 16.1.6 | MIT | 未取得・実行時 |
| `@next/swc-linux-arm64-gnu` | 16.1.6 | MIT | 同梱・実行時 |
| `@next/swc-linux-arm64-musl` | 16.1.6 | MIT | 未取得・実行時 |
| `@next/swc-linux-x64-gnu` | 16.1.6 | MIT | 未取得・実行時 |
| `@next/swc-linux-x64-musl` | 16.1.6 | MIT | 未取得・実行時 |
| `@next/swc-win32-arm64-msvc` | 16.1.6 | MIT | 未取得・実行時 |
| `@next/swc-win32-x64-msvc` | 16.1.6 | MIT | 未取得・実行時 |
| `@nodelib/fs.scandir` | 2.1.5 | MIT | 同梱・実行時 |
| `@nodelib/fs.stat` | 2.0.5 | MIT | 同梱・実行時 |
| `@nodelib/fs.walk` | 1.2.8 | MIT | 同梱・実行時 |
| `@npmcli/move-file` | 2.0.1 | MIT | 同梱・実行時 |
| `@oxc-parser/binding-android-arm-eabi` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-android-arm64` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-darwin-arm64` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-darwin-x64` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-freebsd-x64` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-arm-gnueabihf` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-arm-musleabihf` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-arm64-gnu` | 0.155.0 | MIT | 同梱・開発時のみ |
| `@oxc-parser/binding-linux-arm64-musl` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-ppc64-gnu` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-riscv64-gnu` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-riscv64-musl` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-s390x-gnu` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-x64-gnu` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-linux-x64-musl` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-openharmony-arm64` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-win32-arm64-msvc` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-win32-ia32-msvc` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-parser/binding-win32-x64-msvc` | 0.155.0 | MIT | 未取得・開発時のみ |
| `@oxc-project/types` | 0.155.0 | MIT | 同梱・開発時のみ |
| `@oxc-resolver/binding-android-arm-eabi` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-android-arm64` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-darwin-arm64` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-darwin-x64` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-freebsd-x64` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-arm-gnueabihf` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-arm-musleabihf` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-arm64-gnu` | 11.24.2 | MIT | 同梱・開発時のみ |
| `@oxc-resolver/binding-linux-arm64-musl` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-ppc64-gnu` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-riscv64-gnu` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-riscv64-musl` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-s390x-gnu` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-x64-gnu` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-linux-x64-musl` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-openharmony-arm64` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-wasm32-wasi` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-win32-arm64-msvc` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@oxc-resolver/binding-win32-x64-msvc` | 11.24.2 | MIT | 未取得・開発時のみ |
| `@pinojs/redact` | 0.4.0 | MIT | 同梱・実行時 |
| `@polka/url` | 1.0.0-next.25 | MIT | 同梱・実行時 |
| `@preact/signals` | 2.7.0 | MIT | 同梱・実行時 |
| `@preact/signals-core` | 1.13.0 | MIT | 同梱・実行時 |
| `@rollup/plugin-babel` | 5.3.1 | MIT | 同梱・実行時 |
| `@rollup/plugin-node-resolve` | 11.2.1 | MIT | 同梱・実行時 |
| `@rollup/plugin-replace` | 2.4.2 | MIT | 同梱・実行時 |
| `@rollup/pluginutils` | 3.1.0 | MIT | 同梱・実行時 |
| `@schedule-x/calendar` | 4.2.0 | MIT | 同梱・実行時 |
| `@schedule-x/events-service` | 4.3.1 | MIT | 同梱・実行時 |
| `@schedule-x/react` | 4.1.0 | MIT | 同梱・実行時 |
| `@schedule-x/theme-default` | 4.3.1 | MIT | 同梱・実行時 |
| `@sindresorhus/merge-streams` | 4.0.0 | MIT | 同梱・開発時のみ |
| `@standard-schema/spec` | 1.0.0 | MIT | 同梱・実行時 |
| `@standard-schema/utils` | 0.3.0 | MIT | 同梱・実行時 |
| `@tailwindcss/node` | 4.1.17 | MIT | 同梱・開発時のみ |
| `@tailwindcss/oxide` | 4.1.17 | MIT | 同梱・開発時のみ |
| `@tailwindcss/oxide-android-arm64` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-darwin-arm64` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-darwin-x64` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-freebsd-x64` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-linux-arm-gnueabihf` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-linux-arm64-gnu` | 4.1.17 | MIT | 同梱・開発時のみ |
| `@tailwindcss/oxide-linux-arm64-musl` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-linux-x64-gnu` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-linux-x64-musl` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-wasm32-wasi` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-win32-arm64-msvc` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/oxide-win32-x64-msvc` | 4.1.17 | MIT | 未取得・開発時のみ |
| `@tailwindcss/postcss` | 4.1.17 | MIT | 同梱・開発時のみ |
| `@tootallnate/once` | 2.0.0 | MIT | 同梱・実行時 |
| `@tybys/wasm-util` | 0.10.1 | MIT | 同梱・開発時のみ |
| `@tybys/wasm-util` | 0.10.4 | MIT | 同梱・開発時のみ |
| `@types/css-tree` | 2.3.11 | MIT | 同梱・開発時のみ |
| `@types/debug` | 4.1.12 | MIT | 同梱・開発時のみ |
| `@types/eslint` | 8.56.5 | MIT | 同梱・実行時 |
| `@types/eslint-scope` | 3.7.7 | MIT | 同梱・実行時 |
| `@types/estree` | 0.0.39 | MIT | 同梱・実行時 |
| `@types/estree` | 1.0.5 | MIT | 同梱・実行時 |
| `@types/glob` | 7.2.0 | MIT | 同梱・実行時 |
| `@types/json-schema` | 7.0.15 | MIT | 同梱・実行時 |
| `@types/katex` | 0.16.7 | MIT | 同梱・開発時のみ |
| `@types/minimatch` | 5.1.2 | MIT | 同梱・実行時 |
| `@types/ms` | 0.7.34 | MIT | 同梱・開発時のみ |
| `@types/mustache` | 4.2.6 | MIT | 同梱・開発時のみ |
| `@types/node` | 20.2.5 | MIT | 同梱・実行時 |
| `@types/node` | 22.15.21 | MIT | 同梱・実行時 |
| `@types/react` | 19.2.14 | MIT | 同梱・実行時 |
| `@types/react-dom` | 19.2.3 | MIT | 同梱・実行時 |
| `@types/resolve` | 1.17.1 | MIT | 同梱・実行時 |
| `@types/trusted-types` | 2.0.7 | MIT | 同梱・実行時 |
| `@types/unist` | 2.0.11 | MIT | 同梱・開発時のみ |
| `@types/uuid` | 11.0.0 | MIT | 同梱・開発時のみ |
| `@types/whatwg-mimetype` | 3.0.2 | MIT | 同梱・開発時のみ |
| `@typescript-eslint/project-service` | 8.54.0 | MIT | 同梱・開発時のみ |
| `@typescript-eslint/tsconfig-utils` | 8.54.0 | MIT | 同梱・開発時のみ |
| `@typescript-eslint/tsconfig-utils` | 8.56.1 | MIT | 同梱・開発時のみ |
| `@typescript-eslint/types` | 8.54.0 | MIT | 同梱・開発時のみ |
| `@typescript-eslint/types` | 8.56.1 | MIT | 同梱・開発時のみ |
| `@typescript-eslint/typescript-estree` | 8.54.0 | MIT | 同梱・開発時のみ |
| `@typescript-eslint/visitor-keys` | 8.54.0 | MIT | 同梱・開発時のみ |
| `@webassemblyjs/ast` | 1.12.1 | MIT | 同梱・実行時 |
| `@webassemblyjs/floating-point-hex-parser` | 1.11.6 | MIT | 同梱・実行時 |
| `@webassemblyjs/helper-api-error` | 1.11.6 | MIT | 同梱・実行時 |
| `@webassemblyjs/helper-buffer` | 1.12.1 | MIT | 同梱・実行時 |
| `@webassemblyjs/helper-numbers` | 1.11.6 | MIT | 同梱・実行時 |
| `@webassemblyjs/helper-wasm-bytecode` | 1.11.6 | MIT | 同梱・実行時 |
| `@webassemblyjs/helper-wasm-section` | 1.12.1 | MIT | 同梱・実行時 |
| `@webassemblyjs/ieee754` | 1.11.6 | MIT | 同梱・実行時 |
| `@webassemblyjs/utf8` | 1.11.6 | MIT | 同梱・実行時 |
| `@webassemblyjs/wasm-edit` | 1.12.1 | MIT | 同梱・実行時 |
| `@webassemblyjs/wasm-gen` | 1.12.1 | MIT | 同梱・実行時 |
| `@webassemblyjs/wasm-opt` | 1.12.1 | MIT | 同梱・実行時 |
| `@webassemblyjs/wasm-parser` | 1.12.1 | MIT | 同梱・実行時 |
| `@webassemblyjs/wast-printer` | 1.12.1 | MIT | 同梱・実行時 |
| `acorn` | 8.11.3 | MIT | 同梱・実行時 |
| `acorn` | 8.15.0 | MIT | 同梱・開発時のみ |
| `acorn-import-attributes` | 1.9.5 | MIT | 同梱・実行時 |
| `acorn-jsx` | 5.3.2 | MIT | 同梱・開発時のみ |
| `acorn-walk` | 8.3.2 | MIT | 同梱・実行時 |
| `agent-base` | 6.0.2 | MIT | 同梱・実行時 |
| `agentkeepalive` | 4.3.0 | MIT | 同梱・実行時 |
| `aggregate-error` | 3.1.0 | MIT | 同梱・実行時 |
| `ajv` | 6.12.6 | MIT | 同梱・実行時 |
| `ajv` | 8.12.0 | MIT | 同梱・実行時 |
| `ajv-keywords` | 3.5.2 | MIT | 同梱・実行時 |
| `ansi-colors` | 4.1.3 | MIT | 同梱・開発時のみ |
| `ansi-regex` | 5.0.1 | MIT | 同梱・実行時 |
| `ansi-regex` | 6.0.1 | MIT | 同梱・開発時のみ |
| `ansi-regex` | 6.2.2 | MIT | 同梱・開発時のみ |
| `ansi-styles` | 3.2.1 | MIT | 同梱・実行時 |
| `ansi-styles` | 4.3.0 | MIT | 同梱・実行時 |
| `array-buffer-byte-length` | 1.0.1 | MIT | 同梱・実行時 |
| `array-union` | 1.0.2 | MIT | 同梱・実行時 |
| `array-union` | 2.1.0 | MIT | 同梱・実行時 |
| `array-uniq` | 1.0.3 | MIT | 同梱・実行時 |
| `arraybuffer.prototype.slice` | 1.0.3 | MIT | 同梱・実行時 |
| `async` | 3.2.5 | MIT | 同梱・実行時 |
| `atomic-sleep` | 1.0.0 | MIT | 同梱・実行時 |
| `available-typed-arrays` | 1.0.7 | MIT | 同梱・実行時 |
| `babel-loader` | 8.3.0 | MIT | 同梱・実行時 |
| `babel-plugin-polyfill-corejs2` | 0.4.8 | MIT | 同梱・実行時 |
| `babel-plugin-polyfill-corejs3` | 0.9.0 | MIT | 同梱・実行時 |
| `babel-plugin-polyfill-regenerator` | 0.5.5 | MIT | 同梱・実行時 |
| `balanced-match` | 1.0.2 | MIT | 同梱・実行時 |
| `balanced-match` | 4.0.4 | MIT | 同梱・開発時のみ |
| `bcp-47` | 2.1.0 | MIT | 同梱・開発時のみ |
| `big.js` | 5.2.2 | MIT | 同梱・実行時 |
| `boring-avatars` | 2.0.4 | MIT | 同梱・実行時 |
| `brace-expansion` | 1.1.11 | MIT | 同梱・実行時 |
| `brace-expansion` | 2.0.1 | MIT | 同梱・実行時 |
| `brace-expansion` | 5.0.3 | MIT | 同梱・開発時のみ |
| `braces` | 3.0.2 | MIT | 同梱・実行時 |
| `braces` | 3.0.3 | MIT | 同梱・開発時のみ |
| `browserslist` | 4.23.0 | MIT | 同梱・実行時 |
| `buffer-from` | 1.1.2 | MIT | 同梱・実行時 |
| `builtin-modules` | 3.3.0 | MIT | 同梱・実行時 |
| `call-bind` | 1.0.2 | MIT | 同梱・実行時 |
| `call-bind` | 1.0.7 | MIT | 同梱・実行時 |
| `callsites` | 3.1.0 | MIT | 同梱・開発時のみ |
| `camelcase` | 8.0.0 | MIT | 同梱・実行時 |
| `camelcase-keys` | 10.0.1 | MIT | 同梱・実行時 |
| `chalk` | 2.4.2 | MIT | 同梱・実行時 |
| `chalk` | 4.1.2 | MIT | 同梱・実行時 |
| `change-case` | 5.4.4 | MIT | 同梱・実行時 |
| `character-entities` | 2.0.2 | MIT | 同梱・開発時のみ |
| `character-entities-legacy` | 3.0.0 | MIT | 同梱・開発時のみ |
| `character-reference-invalid` | 2.0.1 | MIT | 同梱・開発時のみ |
| `chokidar` | 5.0.0 | MIT | 同梱・開発時のみ |
| `chrome-trace-event` | 1.0.3 | MIT | 同梱・実行時 |
| `chrono-node` | 2.9.0 | MIT | 同梱・開発時のみ |
| `clean-stack` | 2.2.0 | MIT | 同梱・実行時 |
| `clean-webpack-plugin` | 4.0.0 | MIT | 同梱・実行時 |
| `client-only` | 0.0.1 | MIT | 同梱・実行時 |
| `color-convert` | 1.9.3 | MIT | 同梱・実行時 |
| `color-convert` | 2.0.1 | MIT | 同梱・実行時 |
| `color-name` | 1.1.3 | MIT | 同梱・実行時 |
| `color-name` | 1.1.4 | MIT | 同梱・実行時 |
| `colorette` | 2.0.20 | MIT | 同梱・開発時のみ |
| `commander` | 2.20.3 | MIT | 同梱・実行時 |
| `commander` | 7.2.0 | MIT | 同梱・実行時 |
| `commander` | 8.3.0 | MIT | 同梱・開発時のみ |
| `common-tags` | 1.8.2 | MIT | 同梱・実行時 |
| `commondir` | 1.0.1 | MIT | 同梱・実行時 |
| `concat-map` | 0.0.1 | MIT | 同梱・実行時 |
| `convert-source-map` | 2.0.0 | MIT | 同梱・実行時 |
| `core-js-compat` | 3.36.0 | MIT | 同梱・実行時 |
| `cosmiconfig` | 9.0.0 | MIT | 同梱・開発時のみ |
| `crypto-random-string` | 2.0.0 | MIT | 同梱・実行時 |
| `css-tree` | 3.1.0 | MIT | 同梱・開発時のみ |
| `cssesc` | 3.0.0 | MIT | 同梱・開発時のみ |
| `csstype` | 3.2.3 | MIT | 同梱・実行時 |
| `dateformat` | 4.6.3 | MIT | 同梱・開発時のみ |
| `debounce` | 1.2.1 | MIT | 同梱・実行時 |
| `debug` | 4.3.4 | MIT | 同梱・実行時 |
| `debug` | 4.4.0 | MIT | 同梱・開発時のみ |
| `debug` | 4.4.3 | MIT | 同梱・開発時のみ |
| `decode-named-character-reference` | 1.0.2 | MIT | 同梱・開発時のみ |
| `deepmerge` | 4.3.1 | MIT | 同梱・実行時 |
| `define-data-property` | 1.1.4 | MIT | 同梱・実行時 |
| `define-properties` | 1.2.0 | MIT | 同梱・実行時 |
| `define-properties` | 1.2.1 | MIT | 同梱・実行時 |
| `del` | 4.1.1 | MIT | 同梱・実行時 |
| `delegates` | 1.0.0 | MIT | 同梱・実行時 |
| `depd` | 2.0.0 | MIT | 同梱・実行時 |
| `dequal` | 2.0.3 | MIT | 同梱・開発時のみ |
| `detect-installed` | 2.0.4 | MIT | 同梱・開発時のみ |
| `devlop` | 1.1.0 | MIT | 同梱・開発時のみ |
| `dir-glob` | 3.0.1 | MIT | 同梱・実行時 |
| `dom-accessibility-api` | 0.7.1 | MIT | 同梱・開発時のみ |
| `duplexer` | 0.1.2 | MIT | 同梱・実行時 |
| `eastasianwidth` | 0.3.0 | MIT | 同梱・開発時のみ |
| `emoji-picker-react` | 4.18.0 | MIT | 同梱・実行時 |
| `emoji-regex` | 8.0.0 | MIT | 同梱・実行時 |
| `emojis-list` | 3.0.0 | MIT | 同梱・実行時 |
| `encoding` | 0.1.13 | MIT | 同梱・実行時 |
| `end-of-stream` | 1.4.4 | MIT | 同梱・開発時のみ |
| `enhanced-resolve` | 5.17.1 | MIT | 同梱・実行時 |
| `enhanced-resolve` | 5.18.3 | MIT | 同梱・開発時のみ |
| `enquirer` | 2.4.1 | MIT | 同梱・開発時のみ |
| `env-paths` | 2.2.1 | MIT | 同梱・実行時 |
| `err-code` | 2.0.3 | MIT | 同梱・実行時 |
| `error-ex` | 1.3.2 | MIT | 同梱・開発時のみ |
| `es-abstract` | 1.22.5 | MIT | 同梱・実行時 |
| `es-define-property` | 1.0.0 | MIT | 同梱・実行時 |
| `es-errors` | 1.3.0 | MIT | 同梱・実行時 |
| `es-module-lexer` | 1.4.1 | MIT | 同梱・実行時 |
| `es-set-tostringtag` | 2.0.3 | MIT | 同梱・実行時 |
| `es-to-primitive` | 1.2.1 | MIT | 同梱・実行時 |
| `escalade` | 3.1.1 | MIT | 同梱・実行時 |
| `escape-string-regexp` | 1.0.5 | MIT | 同梱・実行時 |
| `escape-string-regexp` | 4.0.0 | MIT | 同梱・実行時 |
| `estree-walker` | 1.0.1 | MIT | 同梱・実行時 |
| `events` | 3.3.0 | MIT | 同梱・実行時 |
| `expand-tilde` | 2.0.2 | MIT | 同梱・開発時のみ |
| `fast-copy` | 4.0.2 | MIT | 同梱・開発時のみ |
| `fast-deep-equal` | 3.1.3 | MIT | 同梱・実行時 |
| `fast-glob` | 3.2.12 | MIT | 同梱・実行時 |
| `fast-glob` | 3.3.3 | MIT | 同梱・開発時のみ |
| `fast-json-stable-stringify` | 2.1.0 | MIT | 同梱・実行時 |
| `fast-safe-stringify` | 2.1.1 | MIT | 同梱・開発時のみ |
| `fd-package-json` | 2.0.0 | MIT | 同梱・開発時のみ |
| `fdir` | 6.5.0 | MIT | 同梱・開発時のみ |
| `fill-range` | 7.0.1 | MIT | 同梱・実行時 |
| `fill-range` | 7.1.1 | MIT | 同梱・開発時のみ |
| `find-cache-dir` | 3.3.2 | MIT | 同梱・実行時 |
| `find-up` | 4.1.0 | MIT | 同梱・実行時 |
| `find-up-simple` | 1.0.1 | MIT | 同梱・開発時のみ |
| `flairup` | 1.0.0 | MIT | 同梱・実行時 |
| `for-each` | 0.3.3 | MIT | 同梱・実行時 |
| `formatly` | 0.11.4 | MIT | 同梱・開発時のみ |
| `fs-extra` | 9.1.0 | MIT | 同梱・実行時 |
| `fsevents` | 2.3.2 | MIT | 同梱・実行時 |
| `fsevents`（`patch:` の項目） | 2.3.2 | MIT | 未取得・実行時 |
| `function-bind` | 1.1.1 | MIT | 同梱・実行時 |
| `function-bind` | 1.1.2 | MIT | 同梱・実行時 |
| `function.prototype.name` | 1.1.6 | MIT | 同梱・実行時 |
| `functions-have-names` | 1.2.3 | MIT | 同梱・実行時 |
| `gensync` | 1.0.0-beta.2 | MIT | 同梱・実行時 |
| `get-east-asian-width` | 1.5.0 | MIT | 同梱・開発時のみ |
| `get-installed-path` | 2.1.1 | MIT | 同梱・開発時のみ |
| `get-intrinsic` | 1.2.1 | MIT | 同梱・実行時 |
| `get-intrinsic` | 1.2.4 | MIT | 同梱・実行時 |
| `get-symbol-description` | 1.0.2 | MIT | 同梱・実行時 |
| `get-tsconfig` | 4.14.3 | MIT | 同梱・開発時のみ |
| `global-modules` | 1.0.0 | MIT | 同梱・開発時のみ |
| `global-prefix` | 1.0.2 | MIT | 同梱・開発時のみ |
| `globals` | 11.12.0 | MIT | 同梱・実行時 |
| `globalthis` | 1.0.3 | MIT | 同梱・実行時 |
| `globby` | 11.1.0 | MIT | 同梱・実行時 |
| `globby` | 16.1.0 | MIT | 同梱・開発時のみ |
| `globby` | 6.1.0 | MIT | 同梱・実行時 |
| `gopd` | 1.0.1 | MIT | 同梱・実行時 |
| `gzip-size` | 6.0.0 | MIT | 同梱・実行時 |
| `has` | 1.0.3 | MIT | 同梱・実行時 |
| `has-bigints` | 1.0.2 | MIT | 同梱・実行時 |
| `has-flag` | 3.0.0 | MIT | 同梱・実行時 |
| `has-flag` | 4.0.0 | MIT | 同梱・実行時 |
| `has-property-descriptors` | 1.0.0 | MIT | 同梱・実行時 |
| `has-property-descriptors` | 1.0.2 | MIT | 同梱・実行時 |
| `has-proto` | 1.0.1 | MIT | 同梱・実行時 |
| `has-proto` | 1.0.3 | MIT | 同梱・実行時 |
| `has-symbols` | 1.0.3 | MIT | 同梱・実行時 |
| `has-tostringtag` | 1.0.0 | MIT | 同梱・実行時 |
| `has-tostringtag` | 1.0.2 | MIT | 同梱・実行時 |
| `has-yarn` | 4.0.0 | MIT | 同梱・開発時のみ |
| `hasown` | 2.0.1 | MIT | 同梱・実行時 |
| `help-me` | 5.0.0 | MIT | 同梱・開発時のみ |
| `homedir-polyfill` | 1.0.3 | MIT | 同梱・開発時のみ |
| `html-entities` | 2.6.0 | MIT | 同梱・開発時のみ |
| `html-escaper` | 2.0.2 | MIT | 同梱・実行時 |
| `http-proxy-agent` | 5.0.0 | MIT | 同梱・実行時 |
| `https-proxy-agent` | 5.0.1 | MIT | 同梱・実行時 |
| `humanize-ms` | 1.2.1 | MIT | 同梱・実行時 |
| `iconv-lite` | 0.6.3 | MIT | 同梱・実行時 |
| `ignore` | 5.2.4 | MIT | 同梱・実行時 |
| `ignore` | 7.0.5 | MIT | 同梱・開発時のみ |
| `import-fresh` | 3.3.0 | MIT | 同梱・開発時のみ |
| `import-meta-resolve` | 4.2.0 | MIT | 同梱・開発時のみ |
| `imurmurhash` | 0.1.4 | MIT | 同梱・実行時 |
| `indent-string` | 4.0.0 | MIT | 同梱・実行時 |
| `internal-slot` | 1.0.5 | MIT | 同梱・実行時 |
| `internal-slot` | 1.0.7 | MIT | 同梱・実行時 |
| `invert-kv` | 3.0.1 | MIT | 同梱・開発時のみ |
| `ip` | 2.0.0 | MIT | 同梱・実行時 |
| `is-alphabetical` | 2.0.1 | MIT | 同梱・開発時のみ |
| `is-alphanumerical` | 2.0.1 | MIT | 同梱・開発時のみ |
| `is-array-buffer` | 3.0.4 | MIT | 同梱・実行時 |
| `is-arrayish` | 0.2.1 | MIT | 同梱・開発時のみ |
| `is-bigint` | 1.0.4 | MIT | 同梱・実行時 |
| `is-boolean-object` | 1.1.2 | MIT | 同梱・実行時 |
| `is-callable` | 1.2.7 | MIT | 同梱・実行時 |
| `is-core-module` | 2.13.1 | MIT | 同梱・実行時 |
| `is-date-object` | 1.0.5 | MIT | 同梱・実行時 |
| `is-decimal` | 2.0.1 | MIT | 同梱・開発時のみ |
| `is-extglob` | 2.1.1 | MIT | 同梱・実行時 |
| `is-fullwidth-code-point` | 3.0.0 | MIT | 同梱・実行時 |
| `is-glob` | 4.0.3 | MIT | 同梱・実行時 |
| `is-hexadecimal` | 2.0.1 | MIT | 同梱・開発時のみ |
| `is-lambda` | 1.0.1 | MIT | 同梱・実行時 |
| `is-module` | 1.0.0 | MIT | 同梱・実行時 |
| `is-negative-zero` | 2.0.3 | MIT | 同梱・実行時 |
| `is-network-error` | 1.3.1 | MIT | 同梱・実行時 |
| `is-number` | 7.0.0 | MIT | 同梱・実行時 |
| `is-number-object` | 1.0.7 | MIT | 同梱・実行時 |
| `is-obj` | 1.0.1 | MIT | 同梱・実行時 |
| `is-path-cwd` | 2.2.0 | MIT | 同梱・実行時 |
| `is-path-in-cwd` | 2.1.0 | MIT | 同梱・実行時 |
| `is-path-inside` | 2.1.0 | MIT | 同梱・実行時 |
| `is-path-inside` | 4.0.0 | MIT | 同梱・開発時のみ |
| `is-plain-object` | 5.0.0 | MIT | 同梱・実行時 |
| `is-regex` | 1.1.4 | MIT | 同梱・実行時 |
| `is-regexp` | 1.0.0 | MIT | 同梱・実行時 |
| `is-shared-array-buffer` | 1.0.2 | MIT | 同梱・実行時 |
| `is-shared-array-buffer` | 1.0.3 | MIT | 同梱・実行時 |
| `is-stream` | 2.0.1 | MIT | 同梱・実行時 |
| `is-string` | 1.0.7 | MIT | 同梱・実行時 |
| `is-symbol` | 1.0.4 | MIT | 同梱・実行時 |
| `is-typed-array` | 1.1.13 | MIT | 同梱・実行時 |
| `is-weakref` | 1.0.2 | MIT | 同梱・実行時 |
| `is-windows` | 1.0.2 | MIT | 同梱・開発時のみ |
| `isarray` | 2.0.5 | MIT | 同梱・実行時 |
| `jest-worker` | 26.6.2 | MIT | 同梱・実行時 |
| `jest-worker` | 27.5.1 | MIT | 同梱・実行時 |
| `jiti` | 2.6.1 | MIT | 同梱・開発時のみ |
| `jiti` | 2.7.0 | MIT | 同梱・開発時のみ |
| `joycon` | 3.1.1 | MIT | 同梱・開発時のみ |
| `js-tokens` | 4.0.0 | MIT | 同梱・実行時 |
| `js-yaml` | 4.1.0 | MIT | 同梱・開発時のみ |
| `js-yaml` | 4.1.1 | MIT | 同梱・開発時のみ |
| `jsesc` | 0.5.0 | MIT（manifest に値なし、LICENSE ファイルで確認） | 同梱・実行時 |
| `jsesc` | 2.5.2 | MIT | 同梱・実行時 |
| `json-parse-better-errors` | 1.0.2 | MIT | 同梱・開発時のみ |
| `json-parse-even-better-errors` | 2.3.1 | MIT | 同梱・実行時 |
| `json-schema-traverse` | 0.4.1 | MIT | 同梱・実行時 |
| `json-schema-traverse` | 1.0.0 | MIT | 同梱・実行時 |
| `json5` | 2.2.3 | MIT | 同梱・実行時 |
| `jsonc` | 2.0.0 | MIT | 同梱・開発時のみ |
| `jsonc-parser` | 3.3.1 | MIT | 同梱・開発時のみ |
| `jsonfile` | 6.1.0 | MIT | 同梱・実行時 |
| `jsonpointer` | 5.0.1 | MIT | 同梱・実行時 |
| `katex` | 0.16.19 | MIT | 同梱・開発時のみ |
| `lcid` | 3.1.1 | MIT | 同梱・開発時のみ |
| `leven` | 3.1.0 | MIT | 同梱・実行時 |
| `leven` | 4.1.0 | MIT | 同梱・開発時のみ |
| `lines-and-columns` | 1.2.4 | MIT | 同梱・開発時のみ |
| `linkify-it` | 5.0.0 | MIT | 同梱・開発時のみ |
| `loader-runner` | 4.3.0 | MIT | 同梱・実行時 |
| `loader-utils` | 2.0.4 | MIT | 同梱・実行時 |
| `locate-path` | 5.0.0 | MIT | 同梱・実行時 |
| `lodash` | 4.17.21 | MIT | 同梱・実行時 |
| `lodash.debounce` | 4.0.8 | MIT | 同梱・実行時 |
| `lodash.sortby` | 4.7.0 | MIT | 同梱・実行時 |
| `magic-string` | 0.25.9 | MIT | 同梱・実行時 |
| `magic-string` | 0.30.21 | MIT | 同梱・開発時のみ |
| `make-dir` | 3.1.0 | MIT | 同梱・実行時 |
| `map-obj` | 5.0.2 | MIT | 同梱・実行時 |
| `markdown-it` | 14.1.1 | MIT | 同梱・開発時のみ |
| `markdownlint` | 0.40.0 | MIT | 同梱・開発時のみ |
| `markdownlint-cli2` | 0.21.0 | MIT | 同梱・開発時のみ |
| `markdownlint-cli2-formatter-default` | 0.0.6 | MIT | 同梱・開発時のみ |
| `markuplint` | 4.14.1 | MIT | 同梱・開発時のみ |
| `mdurl` | 2.0.0 | MIT | 同梱・開発時のみ |
| `meow` | 13.2.0 | MIT | 同梱・開発時のみ |
| `merge-stream` | 2.0.0 | MIT | 同梱・実行時 |
| `merge2` | 1.4.1 | MIT | 同梱・実行時 |
| `micromark` | 4.0.2 | MIT | 同梱・開発時のみ |
| `micromark-core-commonmark` | 2.0.2 | MIT | 同梱・開発時のみ |
| `micromark-core-commonmark` | 2.0.3 | MIT | 同梱・開発時のみ |
| `micromark-extension-directive` | 4.0.0 | MIT | 同梱・開発時のみ |
| `micromark-extension-gfm-autolink-literal` | 2.1.0 | MIT | 同梱・開発時のみ |
| `micromark-extension-gfm-footnote` | 2.1.0 | MIT | 同梱・開発時のみ |
| `micromark-extension-gfm-table` | 2.1.1 | MIT | 同梱・開発時のみ |
| `micromark-extension-math` | 3.1.0 | MIT | 同梱・開発時のみ |
| `micromark-factory-destination` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-factory-label` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-factory-space` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-factory-title` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-factory-whitespace` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-character` | 2.1.1 | MIT | 同梱・開発時のみ |
| `micromark-util-chunked` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-classify-character` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-combine-extensions` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-decode-numeric-character-reference` | 2.0.2 | MIT | 同梱・開発時のみ |
| `micromark-util-encode` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-html-tag-name` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-normalize-identifier` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-resolve-all` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-sanitize-uri` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-subtokenize` | 2.0.3 | MIT | 同梱・開発時のみ |
| `micromark-util-symbol` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-types` | 2.0.1 | MIT | 同梱・開発時のみ |
| `micromark-util-types` | 2.0.2 | MIT | 同梱・開発時のみ |
| `micromatch` | 4.0.5 | MIT | 同梱・実行時 |
| `micromatch` | 4.0.8 | MIT | 同梱・開発時のみ |
| `mime-db` | 1.52.0 | MIT | 同梱・実行時 |
| `mime-types` | 2.1.35 | MIT | 同梱・実行時 |
| `minimist` | 1.2.8 | MIT | 同梱・開発時のみ |
| `minipass-fetch` | 2.1.2 | MIT | 同梱・実行時 |
| `minizlib` | 2.1.2 | MIT | 同梱・実行時 |
| `mkdirp` | 0.5.6 | MIT | 同梱・開発時のみ |
| `mkdirp` | 1.0.4 | MIT | 同梱・実行時 |
| `mrmime` | 2.0.0 | MIT | 同梱・実行時 |
| `ms` | 2.1.2 | MIT | 同梱・実行時 |
| `ms` | 2.1.3 | MIT | 同梱・実行時 |
| `mustache` | 4.2.0 | MIT | 同梱・開発時のみ |
| `nanoid` | 3.3.11 | MIT | 同梱・開発時のみ |
| `nanoid` | 3.3.6 | MIT | 同梱・実行時 |
| `nanoid` | 3.3.8 | MIT | 同梱・開発時のみ |
| `negotiator` | 0.6.3 | MIT | 同梱・実行時 |
| `neo-async` | 2.6.2 | MIT | 同梱・実行時 |
| `next` | 16.1.6 | MIT | 同梱・実行時 |
| `next-pwa` | 5.6.0 | MIT | 同梱・実行時 |
| `node-gyp` | 9.3.1 | MIT | 同梱・実行時 |
| `node-releases` | 2.0.14 | MIT | 同梱・実行時 |
| `nuqs` | 2.8.8 | MIT | 同梱・実行時 |
| `object-assign` | 4.1.1 | MIT | 同梱・実行時 |
| `object-inspect` | 1.12.3 | MIT | 同梱・実行時 |
| `object-inspect` | 1.13.1 | MIT | 同梱・実行時 |
| `object-keys` | 1.1.1 | MIT | 同梱・実行時 |
| `object.assign` | 4.1.5 | MIT | 同梱・実行時 |
| `on-exit-leak-free` | 2.1.2 | MIT | 同梱・実行時 |
| `os-locale` | 6.0.2 | MIT | 同梱・開発時のみ |
| `oxc-parser` | 0.155.0 | MIT | 同梱・開発時のみ |
| `oxc-resolver` | 11.24.2 | MIT | 同梱・開発時のみ |
| `p-limit` | 2.3.0 | MIT | 同梱・実行時 |
| `p-locate` | 4.1.0 | MIT | 同梱・実行時 |
| `p-map` | 2.1.0 | MIT | 同梱・実行時 |
| `p-map` | 4.0.0 | MIT | 同梱・実行時 |
| `p-try` | 2.2.0 | MIT | 同梱・実行時 |
| `package-manager-detector` | 1.9.0 | MIT | 同梱・開発時のみ |
| `parent-module` | 1.0.1 | MIT | 同梱・開発時のみ |
| `parse-entities` | 4.0.2 | MIT | 同梱・開発時のみ |
| `parse-json` | 4.0.0 | MIT | 同梱・開発時のみ |
| `parse-json` | 5.2.0 | MIT | 同梱・開発時のみ |
| `parse-passwd` | 1.0.0 | MIT | 同梱・開発時のみ |
| `parse5` | 8.0.0 | MIT | 同梱・開発時のみ |
| `path-exists` | 4.0.0 | MIT | 同梱・実行時 |
| `path-is-absolute` | 1.0.1 | MIT | 同梱・実行時 |
| `path-parse` | 1.0.7 | MIT | 同梱・実行時 |
| `path-type` | 4.0.0 | MIT | 同梱・実行時 |
| `picomatch` | 2.3.1 | MIT | 同梱・実行時 |
| `picomatch` | 4.0.3 | MIT | 同梱・開発時のみ |
| `picomatch` | 4.0.7 | MIT | 同梱・開発時のみ |
| `pify` | 2.3.0 | MIT | 同梱・実行時 |
| `pify` | 4.0.1 | MIT | 同梱・実行時 |
| `pinkie` | 2.0.4 | MIT | 同梱・実行時 |
| `pinkie-promise` | 2.0.1 | MIT | 同梱・実行時 |
| `pino` | 10.1.0 | MIT | 同梱・実行時 |
| `pino-abstract-transport` | 2.0.0 | MIT | 同梱・実行時 |
| `pino-abstract-transport` | 3.0.0 | MIT | 同梱・開発時のみ |
| `pino-pretty` | 13.1.3 | MIT | 同梱・開発時のみ |
| `pino-std-serializers` | 7.0.0 | MIT | 同梱・実行時 |
| `pkg-dir` | 4.2.0 | MIT | 同梱・実行時 |
| `possible-typed-array-names` | 1.0.0 | MIT | 同梱・実行時 |
| `postcss` | 8.4.31 | MIT | 同梱・実行時 |
| `postcss` | 8.5.1 | MIT | 同梱・開発時のみ |
| `postcss` | 8.5.6 | MIT | 同梱・開発時のみ |
| `postcss-selector-parser` | 7.1.1 | MIT | 同梱・開発時のみ |
| `preact` | 10.28.4 | MIT | 同梱・実行時 |
| `pretty-bytes` | 5.6.0 | MIT | 同梱・実行時 |
| `process-warning` | 5.0.0 | MIT | 同梱・実行時 |
| `promise-retry` | 2.0.1 | MIT | 同梱・実行時 |
| `pump` | 3.0.0 | MIT | 同梱・開発時のみ |
| `punycode` | 2.3.0 | MIT | 同梱・実行時 |
| `punycode.js` | 2.3.1 | MIT | 同梱・開発時のみ |
| `queue-microtask` | 1.2.3 | MIT | 同梱・実行時 |
| `quick-format-unescaped` | 4.0.4 | MIT | 同梱・実行時 |
| `quick-lru` | 7.3.0 | MIT | 同梱・実行時 |
| `randombytes` | 2.1.0 | MIT | 同梱・実行時 |
| `react` | 19.2.4 | MIT | 同梱・実行時 |
| `react-dom` | 19.2.4 | MIT | 同梱・実行時 |
| `react-error-boundary` | 6.1.1 | MIT | 同梱・実行時 |
| `react-hook-form` | 7.71.2 | MIT | 同梱・実行時 |
| `readable-stream` | 3.6.2 | MIT | 同梱・実行時 |
| `readdirp` | 5.0.0 | MIT | 同梱・開発時のみ |
| `real-require` | 0.2.0 | MIT | 同梱・実行時 |
| `regenerate` | 1.4.2 | MIT | 同梱・実行時 |
| `regenerate-unicode-properties` | 10.1.1 | MIT | 同梱・実行時 |
| `regenerator-runtime` | 0.14.1 | MIT | 同梱・実行時 |
| `regenerator-transform` | 0.15.2 | MIT | 同梱・実行時 |
| `regexp.prototype.flags` | 1.5.0 | MIT | 同梱・実行時 |
| `regexp.prototype.flags` | 1.5.2 | MIT | 同梱・実行時 |
| `regexpu-core` | 5.3.2 | MIT | 同梱・実行時 |
| `require-from-string` | 2.0.2 | MIT | 同梱・実行時 |
| `resolve` | 1.22.8 | MIT | 同梱・実行時 |
| `resolve`（`patch:` の項目） | 1.22.8 | MIT | 同梱・実行時 |
| `resolve-dir` | 1.0.1 | MIT | 同梱・開発時のみ |
| `resolve-from` | 4.0.0 | MIT | 同梱・開発時のみ |
| `resolve-pkg-maps` | 1.0.0 | MIT | 同梱・開発時のみ |
| `retry` | 0.12.0 | MIT | 同梱・実行時 |
| `reusify` | 1.0.4 | MIT | 同梱・実行時 |
| `rollup` | 2.79.1 | MIT | 同梱・実行時 |
| `rollup-plugin-terser` | 7.0.2 | MIT | 同梱・実行時 |
| `run-parallel` | 1.2.0 | MIT | 同梱・実行時 |
| `safe-array-concat` | 1.1.0 | MIT | 同梱・実行時 |
| `safe-buffer` | 5.2.1 | MIT | 同梱・実行時 |
| `safe-regex-test` | 1.0.3 | MIT | 同梱・実行時 |
| `safe-stable-stringify` | 2.4.3 | MIT | 同梱・実行時 |
| `safer-buffer` | 2.1.2 | MIT | 同梱・実行時 |
| `scheduler` | 0.27.0 | MIT | 同梱・実行時 |
| `schema-utils` | 2.7.1 | MIT | 同梱・実行時 |
| `schema-utils` | 3.3.0 | MIT | 同梱・実行時 |
| `server-only` | 0.0.1 | MIT | 同梱・実行時 |
| `set-function-length` | 1.2.1 | MIT | 同梱・実行時 |
| `set-function-name` | 2.0.2 | MIT | 同梱・実行時 |
| `side-channel` | 1.0.4 | MIT | 同梱・実行時 |
| `sirv` | 2.0.4 | MIT | 同梱・実行時 |
| `slash` | 3.0.0 | MIT | 同梱・実行時 |
| `slash` | 5.1.0 | MIT | 同梱・開発時のみ |
| `smart-buffer` | 4.2.0 | MIT | 同梱・実行時 |
| `snakecase-keys` | 9.0.2 | MIT | 同梱・実行時 |
| `socks` | 2.7.1 | MIT | 同梱・実行時 |
| `socks-proxy-agent` | 7.0.0 | MIT | 同梱・実行時 |
| `sonic-boom` | 4.0.1 | MIT | 同梱・実行時 |
| `source-list-map` | 2.0.1 | MIT | 同梱・実行時 |
| `source-map-support` | 0.5.21 | MIT | 同梱・実行時 |
| `sourcemap-codec` | 1.4.8 | MIT | 同梱・実行時 |
| `strict-event-emitter` | 0.5.1 | MIT | 同梱・開発時のみ |
| `string-width` | 4.2.3 | MIT | 同梱・実行時 |
| `string-width` | 8.1.0 | MIT | 同梱・開発時のみ |
| `string.prototype.matchall` | 4.0.10 | MIT | 同梱・実行時 |
| `string.prototype.trim` | 1.2.8 | MIT | 同梱・実行時 |
| `string.prototype.trimend` | 1.0.7 | MIT | 同梱・実行時 |
| `string.prototype.trimstart` | 1.0.7 | MIT | 同梱・実行時 |
| `string_decoder` | 1.3.0 | MIT | 同梱・実行時 |
| `strip-ansi` | 6.0.1 | MIT | 同梱・実行時 |
| `strip-ansi` | 7.1.2 | MIT | 同梱・開発時のみ |
| `strip-ansi` | 7.2.0 | MIT | 同梱・開発時のみ |
| `strip-bom` | 4.0.0 | MIT | 同梱・開発時のみ |
| `strip-comments` | 2.0.1 | MIT | 同梱・実行時 |
| `strip-json-comments` | 3.1.1 | MIT | 同梱・開発時のみ |
| `strip-json-comments` | 5.0.3 | MIT | 同梱・開発時のみ |
| `styled-jsx` | 5.1.6 | MIT | 同梱・実行時 |
| `supports-color` | 5.5.0 | MIT | 同梱・実行時 |
| `supports-color` | 7.2.0 | MIT | 同梱・実行時 |
| `supports-color` | 8.1.1 | MIT | 同梱・実行時 |
| `supports-preserve-symlinks-flag` | 1.0.0 | MIT | 同梱・実行時 |
| `tailwindcss` | 4.1.17 | MIT | 同梱・開発時のみ |
| `tailwindcss` | 4.2.1 | MIT | 同梱・開発時のみ |
| `tapable` | 2.2.1 | MIT | 同梱・実行時 |
| `temp-dir` | 2.0.0 | MIT | 同梱・実行時 |
| `temporal-polyfill` | 0.3.0 | MIT | 同梱・実行時 |
| `tempy` | 0.6.0 | MIT | 同梱・実行時 |
| `terser-webpack-plugin` | 5.3.10 | MIT | 同梱・実行時 |
| `thread-stream` | 3.1.0 | MIT | 同梱・実行時 |
| `tinyglobby` | 0.2.15 | MIT | 同梱・開発時のみ |
| `tinyglobby` | 0.2.17 | MIT | 同梱・開発時のみ |
| `to-fast-properties` | 2.0.0 | MIT | 同梱・実行時 |
| `to-regex-range` | 5.0.1 | MIT | 同梱・実行時 |
| `totalist` | 3.0.1 | MIT | 同梱・実行時 |
| `tr46` | 1.0.1 | MIT | 同梱・実行時 |
| `ts-api-utils` | 2.4.0 | MIT | 同梱・開発時のみ |
| `typed-array-buffer` | 1.0.2 | MIT | 同梱・実行時 |
| `typed-array-byte-length` | 1.0.1 | MIT | 同梱・実行時 |
| `typed-array-byte-offset` | 1.0.2 | MIT | 同梱・実行時 |
| `typed-array-length` | 1.0.5 | MIT | 同梱・実行時 |
| `uc.micro` | 2.1.0 | MIT | 同梱・開発時のみ |
| `unbox-primitive` | 1.0.2 | MIT | 同梱・実行時 |
| `undici-types` | 6.21.0 | MIT | 同梱・実行時 |
| `unicode-canonical-property-names-ecmascript` | 2.0.0 | MIT | 同梱・実行時 |
| `unicode-match-property-ecmascript` | 2.0.0 | MIT | 同梱・実行時 |
| `unicode-match-property-value-ecmascript` | 2.1.0 | MIT | 同梱・実行時 |
| `unicode-property-aliases-ecmascript` | 2.1.0 | MIT | 同梱・実行時 |
| `unicorn-magic` | 0.4.0 | MIT | 同梱・開発時のみ |
| `unique-string` | 2.0.0 | MIT | 同梱・実行時 |
| `universalify` | 2.0.0 | MIT | 同梱・実行時 |
| `upath` | 1.2.0 | MIT | 同梱・実行時 |
| `update-browserslist-db` | 1.0.13 | MIT | 同梱・実行時 |
| `util-deprecate` | 1.0.2 | MIT | 同梱・実行時 |
| `uuid` | 13.0.0 | MIT | 同梱・開発時のみ |
| `watchpack` | 2.4.1 | MIT | 同梱・実行時 |
| `webpack` | 5.93.0 | MIT | 同梱・実行時 |
| `webpack-bundle-analyzer` | 4.10.1 | MIT | 同梱・実行時 |
| `webpack-sources` | 1.4.3 | MIT | 同梱・実行時 |
| `webpack-sources` | 3.2.3 | MIT | 同梱・実行時 |
| `whatwg-mimetype` | 4.0.0 | MIT | 同梱・開発時のみ |
| `whatwg-url` | 7.1.0 | MIT | 同梱・実行時 |
| `which-boxed-primitive` | 1.0.2 | MIT | 同梱・実行時 |
| `which-typed-array` | 1.1.14 | MIT | 同梱・実行時 |
| `workbox-background-sync` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-broadcast-update` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-build` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-cacheable-response` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-core` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-expiration` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-google-analytics` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-navigation-preload` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-precaching` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-range-requests` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-recipes` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-routing` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-strategies` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-streams` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-sw` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-webpack-plugin` | 6.6.0 | MIT | 同梱・実行時 |
| `workbox-window` | 6.6.0 | MIT | 同梱・実行時 |
| `ws` | 7.5.9 | MIT | 同梱・実行時 |
| `zod` | 4.3.6 | MIT | 同梱・実行時 |
| `zod` | 4.6.7 | MIT | 同梱・開発時のみ |
| `zustand` | 5.0.11 | MIT | 同梱・実行時 |

### ISC（71 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@npmcli/fs` | 2.1.2 | ISC | 同梱・実行時 |
| `@ungap/structured-clone` | 1.3.0 | ISC | 同梱・開発時のみ |
| `abbrev` | 1.1.1 | ISC | 同梱・実行時 |
| `aproba` | 2.0.0 | ISC | 同梱・実行時 |
| `are-we-there-yet` | 3.0.1 | ISC | 同梱・実行時 |
| `at-least-node` | 1.0.0 | ISC | 同梱・実行時 |
| `cacache` | 16.1.3 | ISC | 同梱・実行時 |
| `chownr` | 2.0.0 | ISC | 同梱・実行時 |
| `color-support` | 1.1.3 | ISC | 同梱・実行時 |
| `console-control-strings` | 1.1.0 | ISC | 同梱・実行時 |
| `electron-to-chromium` | 1.4.690 | ISC | 同梱・実行時 |
| `fastq` | 1.15.0 | ISC | 同梱・実行時 |
| `fs-minipass` | 2.1.0 | ISC | 同梱・実行時 |
| `fs.realpath` | 1.0.0 | ISC | 同梱・実行時 |
| `gauge` | 4.0.4 | ISC | 同梱・実行時 |
| `get-own-enumerable-property-symbols` | 3.0.2 | ISC | 同梱・実行時 |
| `glob` | 7.2.3 | ISC | 同梱・実行時 |
| `glob` | 8.1.0 | ISC | 同梱・実行時 |
| `glob-parent` | 5.1.2 | ISC | 同梱・実行時 |
| `graceful-fs` | 4.2.11 | ISC | 同梱・実行時 |
| `has-unicode` | 2.0.1 | ISC | 同梱・実行時 |
| `idb` | 7.1.1 | ISC | 同梱・実行時 |
| `infer-owner` | 1.0.4 | ISC | 同梱・実行時 |
| `inflight` | 1.0.6 | ISC | 同梱・実行時 |
| `inherits` | 2.0.4 | ISC | 同梱・実行時 |
| `ini` | 1.3.8 | ISC | 同梱・開発時のみ |
| `isexe` | 2.0.0 | ISC | 同梱・実行時 |
| `knip` | 6.44.1 | ISC | 同梱・開発時のみ |
| `lru-cache` | 11.0.1 | ISC | 同梱・開発時のみ |
| `lru-cache` | 5.1.1 | ISC | 同梱・実行時 |
| `lru-cache` | 6.0.0 | ISC | 同梱・実行時 |
| `lru-cache` | 7.18.3 | ISC | 同梱・実行時 |
| `make-fetch-happen` | 10.2.1 | ISC | 同梱・実行時 |
| `minimatch` | 3.1.2 | ISC | 同梱・実行時 |
| `minimatch` | 5.1.6 | ISC | 同梱・実行時 |
| `minimatch` | 9.0.8 | ISC | 同梱・開発時のみ |
| `minipass` | 3.3.6 | ISC | 同梱・実行時 |
| `minipass` | 5.0.0 | ISC | 同梱・実行時 |
| `minipass` | 7.1.2 | ISC | 同梱・開発時のみ |
| `minipass-collect` | 1.0.2 | ISC | 同梱・実行時 |
| `minipass-flush` | 1.0.5 | ISC | 同梱・実行時 |
| `minipass-pipeline` | 1.2.4 | ISC | 同梱・実行時 |
| `minipass-sized` | 1.0.3 | ISC | 同梱・実行時 |
| `nopt` | 6.0.0 | ISC | 同梱・実行時 |
| `npmlog` | 6.0.2 | ISC | 同梱・実行時 |
| `once` | 1.4.0 | ISC | 同梱・実行時 |
| `picocolors` | 1.0.0 | ISC | 同梱・実行時 |
| `picocolors` | 1.1.1 | ISC | 同梱・開発時のみ |
| `promise-inflight` | 1.0.1 | ISC | 同梱・実行時 |
| `rimraf` | 2.7.1 | ISC | 同梱・実行時 |
| `rimraf` | 3.0.2 | ISC | 同梱・実行時 |
| `semver` | 6.3.1 | ISC | 同梱・実行時 |
| `semver` | 7.5.1 | ISC | 同梱・実行時 |
| `semver` | 7.7.4 | ISC | 同梱・実行時 |
| `set-blocking` | 2.0.0 | ISC | 同梱・実行時 |
| `signal-exit` | 3.0.7 | ISC | 同梱・実行時 |
| `split2` | 4.2.0 | ISC | 同梱・実行時 |
| `ssri` | 9.0.1 | ISC | 同梱・実行時 |
| `tar` | 6.1.15 | ISC | 同梱・実行時 |
| `temporal-spec` | 0.3.0 | ISC | 同梱・実行時 |
| `unbash` | 6.0.3 | ISC | 同梱・開発時のみ |
| `unique-filename` | 2.0.1 | ISC | 同梱・実行時 |
| `unique-slug` | 3.0.0 | ISC | 同梱・実行時 |
| `walk-up-path` | 4.0.0 | ISC | 同梱・開発時のみ |
| `which` | 1.3.1 | ISC | 同梱・開発時のみ |
| `which` | 2.0.2 | ISC | 同梱・実行時 |
| `wide-align` | 1.1.5 | ISC | 同梱・実行時 |
| `wrappy` | 1.0.2 | ISC | 同梱・実行時 |
| `yallist` | 3.1.1 | ISC | 同梱・実行時 |
| `yallist` | 4.0.0 | ISC | 同梱・実行時 |
| `yaml` | 2.9.1 | ISC | 同梱・開発時のみ |

### Apache-2.0（26 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@ampproject/remapping` | 2.3.0 | Apache-2.0 | 同梱・実行時 |
| `@img/sharp-darwin-arm64` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@img/sharp-darwin-x64` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@img/sharp-linux-arm` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@img/sharp-linux-arm64` | 0.34.5 | Apache-2.0 | 同梱・実行時 |
| `@img/sharp-linux-ppc64` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@img/sharp-linux-riscv64` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@img/sharp-linux-s390x` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@img/sharp-linux-x64` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@img/sharp-linuxmusl-arm64` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@img/sharp-linuxmusl-x64` | 0.34.5 | Apache-2.0 | 未取得・実行時 |
| `@surma/rollup-plugin-off-main-thread` | 2.2.3 | Apache-2.0 | 同梱・実行時 |
| `@swc/helpers` | 0.5.15 | Apache-2.0 | 同梱・実行時 |
| `@webassemblyjs/leb128` | 1.11.6 | Apache-2.0 | 同梱・実行時 |
| `@xtuc/long` | 4.2.2 | Apache-2.0 | 同梱・実行時 |
| `baseline-browser-mapping` | 2.9.19 | Apache-2.0 | 同梱・実行時 |
| `detect-libc` | 2.0.3 | Apache-2.0 | 同梱・開発時のみ |
| `detect-libc` | 2.1.2 | Apache-2.0 | 同梱・実行時 |
| `ejs` | 3.1.9 | Apache-2.0 | 同梱・実行時 |
| `eslint-visitor-keys` | 4.2.1 | Apache-2.0 | 同梱・開発時のみ |
| `eslint-visitor-keys` | 5.0.1 | Apache-2.0 | 同梱・開発時のみ |
| `filelist` | 1.0.4 | Apache-2.0 | 同梱・実行時 |
| `jake` | 10.8.7 | Apache-2.0 | 同梱・実行時 |
| `sharp` | 0.34.5 | Apache-2.0 | 同梱・実行時 |
| `typescript` | 5.9.3 | Apache-2.0 | 同梱・実行時 |
| `typescript`（`patch:` の項目） | 5.9.3 | Apache-2.0 | 同梱・実行時 |

### BSD-2-Clause（16 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@markuplint/jsx-parser` | 4.7.23 | BSD-2-Clause | 同梱・開発時のみ |
| `entities` | 4.5.0 | BSD-2-Clause | 同梱・開発時のみ |
| `entities` | 6.0.1 | BSD-2-Clause | 同梱・開発時のみ |
| `eslint-scope` | 5.1.1 | BSD-2-Clause | 同梱・実行時 |
| `espree` | 11.1.0 | BSD-2-Clause | 同梱・開発時のみ |
| `esrecurse` | 4.3.0 | BSD-2-Clause | 同梱・実行時 |
| `estraverse` | 4.3.0 | BSD-2-Clause | 同梱・実行時 |
| `estraverse` | 5.3.0 | BSD-2-Clause | 同梱・実行時 |
| `esutils` | 2.0.3 | BSD-2-Clause | 同梱・実行時 |
| `glob-to-regexp` | 0.4.1 | BSD-2-Clause | 同梱・実行時 |
| `http-cache-semantics` | 4.1.1 | BSD-2-Clause | 同梱・実行時 |
| `regjsparser` | 0.9.1 | BSD-2-Clause | 同梱・実行時 |
| `stringify-object` | 3.3.0 | BSD-2-Clause | 同梱・実行時 |
| `terser` | 5.28.1 | BSD-2-Clause | 同梱・実行時 |
| `uri-js` | 4.4.1 | BSD-2-Clause | 同梱・実行時 |
| `webidl-conversions` | 4.0.2 | BSD-2-Clause | 同梱・実行時 |

### MPL-2.0（12 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `lightningcss` | 1.30.2 | MPL-2.0 | 同梱・開発時のみ |
| `lightningcss-android-arm64` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-darwin-arm64` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-darwin-x64` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-freebsd-x64` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-linux-arm-gnueabihf` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-linux-arm64-gnu` | 1.30.2 | MPL-2.0 | 同梱・開発時のみ |
| `lightningcss-linux-arm64-musl` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-linux-x64-gnu` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-linux-x64-musl` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-win32-arm64-msvc` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |
| `lightningcss-win32-x64-msvc` | 1.30.2 | MPL-2.0 | 未取得・開発時のみ |

### BSD-3-Clause（10 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@xtuc/ieee754` | 1.2.0 | BSD-3-Clause | 同梱・実行時 |
| `secure-json-parse` | 4.1.0 | BSD-3-Clause | 同梱・開発時のみ |
| `serialize-javascript` | 4.0.0 | BSD-3-Clause | 同梱・実行時 |
| `serialize-javascript` | 6.0.2 | BSD-3-Clause | 同梱・実行時 |
| `smol-toml` | 1.9.1 | BSD-3-Clause | 同梱・開発時のみ |
| `source-map` | 0.6.1 | BSD-3-Clause | 同梱・実行時 |
| `source-map` | 0.8.0-beta.0 | BSD-3-Clause | 同梱・実行時 |
| `source-map-js` | 1.0.2 | BSD-3-Clause | 同梱・実行時 |
| `source-map-js` | 1.2.0 | BSD-3-Clause | 同梱・開発時のみ |
| `source-map-js` | 1.2.1 | BSD-3-Clause | 同梱・開発時のみ |

### LGPL-3.0-or-later（10 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@img/sharp-libvips-darwin-arm64` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-libvips-darwin-x64` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-libvips-linux-arm` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-libvips-linux-arm64` | 1.2.4 | LGPL-3.0-or-later | 同梱・実行時 |
| `@img/sharp-libvips-linux-ppc64` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-libvips-linux-riscv64` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-libvips-linux-s390x` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-libvips-linux-x64` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-libvips-linuxmusl-arm64` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-libvips-linuxmusl-x64` | 1.2.4 | LGPL-3.0-or-later | 未取得・実行時 |

### MIT OR Apache-2.0（9 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@biomejs/biome` | 2.4.6 | MIT OR Apache-2.0 | 同梱・開発時のみ |
| `@biomejs/cli-darwin-arm64` | 2.4.6 | MIT OR Apache-2.0 | 未取得・開発時のみ |
| `@biomejs/cli-darwin-x64` | 2.4.6 | MIT OR Apache-2.0 | 未取得・開発時のみ |
| `@biomejs/cli-linux-arm64` | 2.4.6 | MIT OR Apache-2.0 | 同梱・開発時のみ |
| `@biomejs/cli-linux-arm64-musl` | 2.4.6 | MIT OR Apache-2.0 | 未取得・開発時のみ |
| `@biomejs/cli-linux-x64` | 2.4.6 | MIT OR Apache-2.0 | 未取得・開発時のみ |
| `@biomejs/cli-linux-x64-musl` | 2.4.6 | MIT OR Apache-2.0 | 未取得・開発時のみ |
| `@biomejs/cli-win32-arm64` | 2.4.6 | MIT OR Apache-2.0 | 未取得・開発時のみ |
| `@biomejs/cli-win32-x64` | 2.4.6 | MIT OR Apache-2.0 | 未取得・開発時のみ |

### BlueOak-1.0.0（4 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `glob` | 13.0.1 | BlueOak-1.0.0 | 同梱・開発時のみ |
| `minimatch` | 10.1.2 | BlueOak-1.0.0 | 同梱・開発時のみ |
| `minimatch` | 10.2.2 | BlueOak-1.0.0 | 同梱・開発時のみ |
| `path-scurry` | 2.0.0 | BlueOak-1.0.0 | 同梱・開発時のみ |

### (MIT OR CC0-1.0)（3 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `type-fest` | 0.16.0 | (MIT OR CC0-1.0) | 同梱・実行時 |
| `type-fest` | 4.23.0 | (MIT OR CC0-1.0) | 同梱・実行時 |
| `type-fest` | 4.41.0 | (MIT OR CC0-1.0) | 同梱・実行時 |

### Apache-2.0 AND LGPL-3.0-or-later（3 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@img/sharp-win32-arm64` | 0.34.5 | Apache-2.0 AND LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-win32-ia32` | 0.34.5 | Apache-2.0 AND LGPL-3.0-or-later | 未取得・実行時 |
| `@img/sharp-win32-x64` | 0.34.5 | Apache-2.0 AND LGPL-3.0-or-later | 未取得・実行時 |

### (WTFPL OR MIT)（2 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `opener` | 1.5.2 | (WTFPL OR MIT) | 同梱・実行時 |
| `path-is-inside` | 1.0.2 | (WTFPL OR MIT) | 同梱・実行時 |

### 0BSD（2 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `tslib` | 2.5.2 | 0BSD | 同梱・実行時 |
| `tslib` | 2.8.1 | 0BSD | 同梱・実行時 |

### CC-BY-4.0（2 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `caniuse-lite` | 1.0.30001593 | CC-BY-4.0 | 同梱・実行時 |
| `caniuse-lite` | 1.0.30001646 | CC-BY-4.0 | 同梱・実行時 |

### (AFL-2.1 OR BSD-3-Clause)（1 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `json-schema` | 0.4.0 | (AFL-2.1 OR BSD-3-Clause) | 同梱・実行時 |

### Apache-2.0 AND LGPL-3.0-or-later AND MIT（1 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `@img/sharp-wasm32` | 0.34.5 | Apache-2.0 AND LGPL-3.0-or-later AND MIT | 未取得・実行時 |

### CC0-1.0（1 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `mdn-data` | 2.12.2 | CC0-1.0 | 同梱・開発時のみ |

### Python-2.0（1 件）

| パッケージ | 版 | ライセンス（manifest の値） | 区分 |
| --- | --- | --- | --- |
| `argparse` | 2.0.1 | Python-2.0 | 同梱・開発時のみ |

## 調べ方

基準コミットのチェックアウトで、次の順に調べた。一覧を作るスクリプトはリポジトリに入れていない（一回きりの洗い出しのため）。

1. 全件と manifest のライセンス: `yarn info -A -R --manifest --json` の出力（1 行 1 項目の JSON）から、各項目の locator・`Version`・`Manifest.License`・`Dependencies` を取った。969 項目のうち workspace 自身を除く 968 項目が表の行
2. 同梱・未取得: `git ls-files .yarn/cache` の追跡済みの zip（874 個）と突き合わせた。`npm:` の項目は `<ident の / を - に置換>-npm-<版>-` で始まる zip、`patch:` の項目は `<ident の / を - に置換>-patch-` で始まる zip があれば同梱。追跡済みの zip はすべていずれかの行に対応した。ディレクトリの中身では判定していない（`yarn info --manifest` が他 OS・他 CPU 用の zip を未追跡で落とすため）
3. 実行時・開発時のみ: ルートの `package.json` の `dependencies`・`devDependencies` の名前に当たる workspace の依存から、`yarn info` の `Dependencies` の locator を辿った（`virtual:` の locator は `virtual:<hash>#` を除いた項目に読み替えた）。`dependencies` から届けば実行時、`devDependencies` からしか届かなければ開発時のみ
4. `patch:` の元の項目: `fsevents@npm:2.3.2`・`resolve@npm:1.22.8`・`typescript@npm:5.9.3` は、依存元の記述子が `patch:` の項目に解決されるため依存の辺が来ない。それぞれを元にした `patch:` の項目（`yarn.lock` の `fsevents@patch:...`・`resolve@patch:...`・`typescript@patch:...`）と同じ用途にした。同梱の判定は元の項目・`patch:` の項目それぞれの zip で行った（`fsevents` は元の項目だけ zip があり、`patch:` の項目は未取得）
5. 個別に確かめた項目: 上の 2〜4 で決まらない項目はなかった
6. manifest に値がない物: `jsesc@0.5.0` は manifest の `license` が空（古い `licenses` 配列の形式）だったため、追跡済みの zip の中の `LICENSE-MIT.txt` と `package.json` を読み、MIT と確かめた
7. 未追跡 zip の掃除: `yarn info --manifest` の後、`git status --porcelain .yarn/cache` で未追跡の zip（94 個）を確かめ、`git clean -f -- .yarn/cache` で消した
8. コード以外の物: `git ls-files public`、`git log -- public`、フォントファイル・`next/font`・`@font-face`・`tailwind.config.js` の `fontFamily` の検索、`src` などの外部 URL の検索（`git grep -n -E 'https?://'`）、`emoji-picker-react` の zip の中の CDN の URL、`.claude/skills/gh-stack/SKILL.md` の metadata、`.yarn/releases/` と `.gitmodules`、上流のライセンス表示（`gh api repos/<owner>/<repo>/license`）

```bash
yarn info -A -R --manifest --json > info.ndjson
git ls-files .yarn/cache > cache.txt
git status --porcelain .yarn/cache
git clean -f -- .yarn/cache
git ls-files public
git grep -n -E 'https?://' -- src next.config.js tailwind.config.js public/manifest.json
```
