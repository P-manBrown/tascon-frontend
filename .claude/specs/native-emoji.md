# native-emoji specification

## Approved requirements

## 要件仕様: 絵文字を端末の文字で表示する（native-emoji）

- 対象ビード: tf-gidaa（依頼 gc-z67w の (4)）
- ワークフロー: tf-dhhcu（superpowers-build）
- 元にした設計: `/home/node/tascon-frontend/.gc-artifacts/native-emoji/design.md`（承認済み、tf-e9s8c、autonomous）
- 承認の根拠: `/home/node/tascon-frontend/.gc-artifacts/native-emoji/design-approval.md`
- 作成日: 2026-11-20（試行1）
- `docs/superpowers/specs/` への写し: 作らない。このレーンはコミットしない。また、メインのチェックアウトに、コミットしていない変更を残せない。この仕様の正本は上記の作業成果物ディレクトリにある本ファイルとする。

### Problem Statement

TASCON のタスクグループのアイコン絵文字は、emoji-picker-react の既定（`EmojiStyle.APPLE`）で描かれている。そのため、絵文字1つごとに `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/` の画像を読む。

- 外部 CDN に依存する。
- 絵文字の数だけ画像リクエストが出る。
- 端末のほかの文字と見た目がそろわない。

また、`next/dynamic`（`ssr: false`）による読み込みと設定は、呼び出し側の7ファイル（8か所）に散らばっている。既定値（APPLE）に戻る書き方を止める仕組みもない。

求める結果は次のとおり。

- 絵文字を、端末のフォントで描く文字（`EmojiStyle.NATIVE`）で表示する。
- 読み込みと設定を、共有層の包んだ部品2つにまとめる。
- 包んだ部品の外からライブラリの部品を直接読み込むことを、Biome で禁じる。

### W6H

- **Who（誰のため）**: TASCON の利用者（タスクグループの作成・アイコン変更・一覧閲覧をする人）と、今後このコードを触る開発者。
- **What（何を）**: emoji-picker-react の `Picker`（2か所）と `Emoji`（6か所）を、NATIVE を固定した包んだ部品（`EmojiPicker`、`Emoji`）に置き換える。Biome の `noRestrictedImports` で直接の読み込みを禁じる。判断を ADR に残す。
- **When（いつ）**: 画面の描画時。`Emoji` は表示するたびに使う。`EmojiPicker` はアイコンを選ぶポップオーバーを初めて開いたときにマウントされる。lint の禁止は、開発時と CI（`yarn biome ci --error-on-warnings .`）で効く。
- **Where（どこで）**
  - 新しい部品: `src/components/emojis/emoji/index.tsx`、`src/components/emojis/emoji-picker/index.tsx`
  - 設定: `biome.json`
  - 判断記録: `docs/decisions/native-emoji-via-wrapper-components.md`、`docs/decisions/index.md`
  - 呼び出し側（7ファイル、パスは `src/` から）
    - `app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/editable-task-group-icon/task-group-icon-editor/index.tsx`
    - `app/(main)/tasks/_components/tasks-sidebar-content/create-task-group-button/create-task-group-form/index.tsx`
    - `app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/task-group-detail-emoji/index.tsx`
    - `app/(main)/tasks/groups/[id]/_components/task-group-header-icon/task-group-header-emoji/index.tsx`
    - `app/(main)/tasks/_components/tasks-sidebar-content/task-group-menu/task-group-nav-links/task-group-link/index.tsx`
    - `app/(main)/tasks/_components/tasks-sidebar-content/shared-task-group-menu/shared-task-group-nav-links/shared-task-group-link/index.tsx`
    - `components/tasks/task-cards/task-card-task-group-link/index.tsx`
- **Why（なぜ）**: 外部 CDN への依存と画像リクエストをなくすため。見た目を端末の文字にそろえるため。散らばった設定を1か所にまとめ、既定値に戻る書き方を lint で止めるため。
- **How（どうやって）**: 設計の案A（承認済み）。包んだ部品の中で `next/dynamic` を1回だけ宣言する。読み込み関数の中で `import("emoji-picker-react")` の結果から `EmojiStyle.NATIVE` を取り出して渡す。ライブラリの遅延読み込みは保つ。
- **How much（どのくらい）**: 新規2ファイル、変更は呼び出し側7ファイルと `biome.json`、ADR の新規1ファイルと索引の1行。API・データ形式（`unified`）・依存パッケージの版は変えない。

### User Stories

- **US-1**: 利用者として、タスクグループのアイコン絵文字を、端末のほかの文字と同じ見た目で見たい。画面の中で絵文字だけが浮かないようにするため。
- **US-2**: 利用者として、タスクグループの作成とアイコン変更のときに、ピッカーで選んだ絵文字が端末の文字で出て、選んだとおりに反映されてほしい。
- **US-3**: 利用者として、絵文字を表示するだけで外部の CDN に画像を取りに行かないでほしい。表示が外部サービスの状態に左右されず、リクエストも増えないようにするため。
- **US-4**: 利用者として、ピッカーを開く前と後で、一覧やヘッダーの絵文字の大きさと位置が変わらないでほしい。

### Technical Stories

- **TS-1**: 開発者として、絵文字を表示・選択するときは `@/components/emojis/emoji` の `Emoji` と `@/components/emojis/emoji-picker` の `EmojiPicker` だけを使いたい。`dynamic` の宣言、スケルトン、Picker の設定を呼び出し側で繰り返さないようにするため。
- **TS-2**: 開発者として、包んだ部品の外で emoji-picker-react の部品（既定の書き出し・`Emoji`・名前空間・`import()`）を読み込むと、`yarn biome lint` と CI が error で落ちてほしい。既定値（APPLE）に戻る書き方が入り込まないようにするため。
- **TS-3**: 開発者として、`EmojiClickData` などの部品ではない型は、`import type` で引き続き読み込みたい。
- **TS-4**: 開発者として、この判断と、受け入れた不利益を `docs/decisions/` で読めるようにしたい。

### Behavior Requirements

各要件は、設計（`design.md` の「設計」節1〜6）を、実装と確認ができる形にしたもの。

#### REQ-001: 表示用 `Emoji` 部品

ファイル: `src/components/emojis/emoji/index.tsx`

- 先頭に `"use client"` を書く（Server Component から使われる境界）。
- 名前付き export の関数コンポーネント `Emoji` にする。Props は `{ unified: string; size: number }`。部品の中では、ライブラリの `Emoji` を別名で受ける。
- モジュールの最上位で `next/dynamic` を1つだけ宣言する。
  - 読み込み関数は `import("emoji-picker-react").then(({ Emoji, EmojiStyle }) => …)`。返す部品は、ライブラリの `Emoji` に `emojiStyle={EmojiStyle.NATIVE}` を固定して渡し、`unified` と `size` を受け渡す。
  - `ssr: false`。
  - `loading` は `skeleton block size-full rounded-sm` のスケルトン。
- `emoji-picker-react` を静的に値として import しない（`EmojiStyle` も `import()` の結果から取る）。ライブラリを初期バンドルに入れないため。
- 外枠は `span` 1つ。その中に上の dynamic 部品を描く。
  - 寸法: `` style={{ width: `${size}px`, height: `${size}px` }} ``
  - クラス: `flex shrink-0 items-center justify-center text-center leading-none`（ちょうどこの6つ）
- `unified` が空文字のときは、外枠だけを描く。dynamic 部品もスケルトンも描かない。
- `unified` がライブラリのデータにないときは、ライブラリが `null` を返す。外枠だけが残る。部品の側で特別な処理はしない。

#### REQ-002: `EmojiPicker` 部品

ファイル: `src/components/emojis/emoji-picker/index.tsx`

- `"use client"` は書かない（クライアントのファイルからしか使われない）。
- 名前付き export の関数コンポーネント `EmojiPicker` にする。Props は `{ onEmojiClick: (data: EmojiClickData) => void }` だけ。`EmojiClickData` は `import type` で読み込む。
- モジュールの最上位で `next/dynamic` を1つだけ宣言する。
  - 読み込み関数は `import("emoji-picker-react").then(({ default: Picker, EmojiStyle }) => …)`。返す部品は、次の props を固定して `Picker` に渡し、`onEmojiClick` を受け渡す。
    - `emojiStyle={EmojiStyle.NATIVE}`
    - `searchDisabled`
    - `skinTonesDisabled`
    - `previewConfig={{ showPreview: false }}`
    - `width="100%"`
  - `ssr: false`。
  - `loading` は指定しない。
- 「初回クリックで初めてマウントする」制御（`shouldPickerMount`）とポップオーバーは、呼び出し側に残す。部品には入れない。

#### REQ-003: `Picker` の呼び出し2ファイルの置き換え

対象: `task-group-icon-editor/index.tsx`、`create-task-group-form/index.tsx`

- `dynamic(() => import("emoji-picker-react"), { ssr: false })` の宣言を消す。
- `<EmojiPicker onEmojiClick={handleEmojiClick} />`（`@/components/emojis/emoji-picker`）に替える。`onEmojiClick` に渡す関数は今のものをそのまま使う。
- `import type { EmojiClickData } from "emoji-picker-react"` は残す（`task-group-icon-editor` と `create-task-group-form/use-create-task-group-form.tsx`）。

#### REQ-004: `Emoji` の表示6か所の置き換え

対象と size（変えない）

| ファイル | size |
| --- | --- |
| `task-group-detail-emoji/index.tsx` | 32 |
| `task-group-header-emoji/index.tsx` | 28 |
| `create-task-group-form/index.tsx` | 32 |
| `task-group-link/index.tsx` | 20 |
| `shared-task-group-link/index.tsx` | 20 |
| `task-card-task-group-link/index.tsx` | 20 |

- 各ファイルの `dynamic(() => import("emoji-picker-react").then((mod) => mod.Emoji), …)` の宣言とスケルトンを消す。
- `<Emoji unified={…} size={…} />`（`@/components/emojis/emoji`）に替える。`unified` に渡す値は今のものをそのまま使う。
- `next/dynamic` の import が要らなくなったファイルは、その import を消す。
- `"use client"` を外すファイル: `task-group-detail-emoji`、`task-group-header-emoji`、`task-card-task-group-link`。この3ファイルは、置き換え後にフック・イベントハンドラ・`next/dynamic` を持たない。外したあとも `yarn build` が通ること。
- `create-task-group-form` の `"use client"` の有無は変えない（今は書いていない）。

#### REQ-005: Biome の `noRestrictedImports`

ファイル: `biome.json`

- `linter.rules.style.noRestrictedImports` を次の内容で加える。
  - `level: "error"`
  - `options.paths["emoji-picker-react"]`
    - `importNames: ["default", "Emoji", "*"]`
    - `message`: `"emoji-picker-reactの部品は直接読み込まず、@/components/emojis/emojiのEmojiと@/components/emojis/emoji-pickerのEmojiPickerを使う。EmojiClickData等の型はimport typeで読み込める。"`（この文面のまま）
- `overrides` を加える。次の2ファイルだけ `noRestrictedImports` を `"off"` にする。ディレクトリの glob にはしない。
  - `includes: ["src/components/emojis/emoji/index.tsx", "src/components/emojis/emoji-picker/index.tsx"]`
- 入れる手順（依頼で指定されている）
  1. 設定を入れる。
  2. まだ置き換えていない呼び出し側で、`yarn biome lint` が error で落ちることを確かめる。
  3. 置き換えたあとに通ることを確かめる。
  - 2と3の結果（コマンドと出力の要点）を、実装のビードに記録する。

#### REQ-006: 判断記録（ADR）

- 新規: `docs/decisions/native-emoji-via-wrapper-components.md`。形式は `.claude/rules/decisions-maintenance.md` に従う。
  - Status: Accepted
  - Verification Status: REQ-007〜REQ-009 をすべて確かめた場合は `Verified`。確かめられなかった項目がある場合は `Unverified` にし、確かめられなかった項目を実装のビードに記録する。
  - Related Files: `src/components/emojis/emoji/index.tsx`、`src/components/emojis/emoji-picker/index.tsx`、`biome.json`
  - Context: 既定では Apple の画像を `cdn.jsdelivr.net` の `emoji-datasource-apple` から読む。外部 CDN への依存と、絵文字1つごとの画像リクエストがある。端末のほかの文字と見た目がそろわない。呼び出し側ごとに `dynamic` と設定が散らばり、既定値に戻る書き方を止める仕組みがない。
  - Decision: 包んだ部品で NATIVE を固定し、`noRestrictedImports` で直接の読み込みを禁じる。
  - Considered Options: 設計の案A（採用）、案B、案C。
  - Consequences
    - 見た目が OS とフォントで変わる（例: Windows では国旗が2文字の地域記号で出る）。
    - 古い OS では新しい絵文字が豆腐（□）で出ることがある。
    - 部品名の `import type`（例: `import type { Emoji }`）も禁止される。
- `docs/decisions/index.md` に、この ADR への1行を加える。

#### REQ-007: 画面での表示と寸法

`yarn dev` とブラウザで、次を確かめる。

- タスクグループ作成フォームと、詳細のアイコン編集で、ピッカーの絵文字が端末の文字（`span.epr-emoji-native`）で出る。
- ピッカーで選んだ絵文字が反映される（作成フォームのボタン、詳細のアイコン）。
- 表示6か所が `img` ではなく文字で出る。
  - サイドバーの自分のグループ
  - サイドバーの共有グループ
  - タスクカードのグループリンク
  - 詳細のアイコン
  - ヘッダーのアイコン
  - 作成フォームのボタン
- 表示6か所の外枠の寸法が REQ-004 の size と同じ（20 / 28 / 32px）。
- ピッカーを開く前と後で、表示の寸法と位置が変わらない。

#### REQ-008: 外部 CDN へのリクエストがない

REQ-007 の操作の間、ブラウザのネットワークに、URL が `cdn.jsdelivr.net/npm/emoji-datasource-apple` で始まるリクエストが1件もない。

#### REQ-009: CI と同じ静的チェック

次のすべてが成功する。

- `yarn next typegen && yarn tsc --noEmit`
- `yarn biome ci --error-on-warnings .`
- `yarn knip`
- `yarn lint-jsx`
- `yarn build`

### Example Mapping

#### 規則: 表示用 `Emoji` は端末の文字で描く（REQ-001、REQ-007）

- 例: `<Emoji unified="1f600" size={20} />` → 外枠 `span`（20×20px）の中に `span.epr-emoji-native`（文字 😀、`width`・`height`・`font-size` が 20px）。`img` は出ない。
- 例: ライブラリの読み込み中 → 外枠の中にスケルトン（`skeleton block size-full rounded-sm`、20×20px）。
- 例: `<Emoji unified="" size={32} />`（作成フォームの初期状態）→ 32×32px の外枠だけ。スケルトンも絵文字も出ない。
- 例: データにない `unified` → ライブラリが `null` を返し、外枠だけが残る。

#### 規則: ピッカーを開いても表示は動かない（REQ-001、REQ-007）

- 例: タスク一覧でサイドバーの絵文字（20px）を見る → ピッカーを開く（ライブラリの `<style>` が差し込まれる）→ サイドバーの絵文字の寸法と位置は同じ。
- 理由: 外枠が `flex` で寸法を `style` で固定し、`leading-none` と `text-center` でライブラリの CSS と同じ `line-height` と `text-align` を与えている。ライブラリの CSS の `padding` は、`Picker` の外では変数が定義されず 0 になる。

#### 規則: ピッカーは固定の設定で、選んだ絵文字を返す（REQ-002、REQ-003）

- 例: 作成フォームで絵文字ボタンを押す → ピッカーが初めてマウントされる。検索欄・肌色選択・プレビューはない。幅は100%で、絵文字は文字で出る。
- 例: ピッカーで 🎉 を選ぶ → `onEmojiClick` が `EmojiClickData`（`unified: "1f389"`）で呼ばれ、ボタンの表示が 🎉 になる。

#### 規則: 直接の読み込みは lint で落ちる（REQ-005）

包んだ部品の外のファイルで、`yarn biome lint` が次のようになる。

- error になる
  - `import Picker from "emoji-picker-react"`
  - `import { Emoji } from "emoji-picker-react"`
  - `import * as M from "emoji-picker-react"`
  - `dynamic(() => import("emoji-picker-react"))`
  - `import("emoji-picker-react").then((mod) => mod.Emoji)`
  - `import type { Emoji } from "emoji-picker-react"`
- error にならない
  - `import type { EmojiClickData } from "emoji-picker-react"`
  - `import { EmojiStyle } from "emoji-picker-react"`（部品ではないため対象外。ただし、ライブラリが初期バンドルに入るため、包んだ部品の外では使わない）
- 包んだ部品の2ファイルの中では、上のどれも error にならない（`overrides` で外している）。

### Acceptance Criteria

| ID | Status | 受け入れ条件 | 確かめ方 |
| --- | --- | --- | --- |
| REQ-001 | covered | `src/components/emojis/emoji/index.tsx` が REQ-001 のとおりにある。`EmojiStyle.NATIVE` を渡し、`next/dynamic`（`ssr: false`）を1つだけ持ち、外枠のクラスと寸法、空の `unified` の扱いが REQ-001 のとおり。 | コードを読んで確かめる。REQ-007 の画面確認。 |
| REQ-002 | covered | `src/components/emojis/emoji-picker/index.tsx` が REQ-002 のとおりにある。`EmojiStyle.NATIVE` と4つの固定 props を渡し、Props は `onEmojiClick` だけ。 | コードを読んで確かめる。REQ-007 の画面確認。 |
| REQ-003 | covered | `Picker` の2ファイルが `EmojiPicker` を使い、`emoji-picker-react` からの値の読み込みと `dynamic` の宣言を持たない。 | `grep` と REQ-005 の lint。 |
| REQ-004 | covered | `Emoji` の6か所が `@/components/emojis/emoji` の `Emoji` を今と同じ size で使う。3ファイルから `"use client"` が外れている。 | `grep` とコードを読んで確かめる。REQ-009 の `yarn build`。 |
| REQ-005 | covered | `biome.json` が REQ-005 のとおり。置き換え前は呼び出し側で `yarn biome lint` が error で落ち、置き換え後は通る。その結果が実装のビードに記録されている。`src/` で `emoji-picker-react` から値を読み込むのは包んだ部品の2ファイルだけで、ほかは `import type { EmojiClickData }` だけ。 | `yarn biome lint` を置き換えの前後で実行。`grep -rn "emoji-picker-react" src/`。 |
| REQ-006 | covered | `docs/decisions/native-emoji-via-wrapper-components.md` が形式どおりにあり、`docs/decisions/index.md` から辿れる。 | ファイルを読んで確かめる。 |
| REQ-007 | covered | REQ-007 の各項目を画面で確かめた結果が記録されている。 | `yarn dev` とブラウザ。 |
| REQ-008 | covered | REQ-007 の操作の間、`cdn.jsdelivr.net/npm/emoji-datasource-apple` へのリクエストが0件。 | ブラウザのネットワークの記録。 |
| REQ-009 | covered | CI と同じ静的チェック5種がすべて成功する。 | 各コマンドを実行。 |

#### テストについて

- リポジトリには単体テスト・E2E テストの基盤もファイルもない。依頼の「今のテストが通る」は、CI の静的チェック5種（REQ-009）が通ることとする。
- テストの基盤は新しく作らない（範囲外）。部品の振る舞いは、REQ-005 の lint（置き換え前に落ち、置き換え後に通る）、REQ-009 の型検査とビルド、REQ-007・REQ-008 の画面確認で確かめる。
- 画面確認（REQ-007・REQ-008）には、ログインできるバックエンドが要る。実装段階で用意できない場合は、確認できなかった項目と理由を実装のビードに記録する。そのうえで、ADR の Verification Status を `Unverified` にする（REQ-006）。確認の手段（手で操作するか、ブラウザ自動操作か）は実装の担当が決める。

#### リスク

- 絵文字の見た目が OS とフォントで変わる。古い OS では新しい絵文字が豆腐（□）で出ることがある。依頼の方針として受け入れ、ADR の Consequences に書く。
- ライブラリの CSS は `Picker` を開いた後にしか差し込まれない。外枠のクラス（REQ-001）で、差し込みの前後のレイアウトをそろえる。REQ-007 の「開く前後で変わらない」で確かめる。
- 部品名の `import type`（`import type { Emoji }`）も禁止される。今のコードにその用法はない。必要になったら、包んだ部品から `React.ComponentProps<typeof Emoji>` で型を取る。
- `"use client"` を外した3ファイルが、もしクライアント専用のコードを残していると、ビルドが落ちる。REQ-009 の `yarn build` で検出する。

### Out Of Scope

- `emojiVersion` などで、OS が描けない新しい絵文字をピッカーから除く調整。
- ライブラリの CSS（フォント指定）を、`Picker` を開く前から差し込む対応。
- 絵文字の保存形式（`unified`）、API、スキーマの変更。
- `create-task-group-form` の `"use client"` の扱いや、ポップオーバー制御の共通化。
- emoji-picker-react の版上げや、別ライブラリへの移行。
- 単体テスト・E2E テストの基盤の新設。
- 表示用の絵文字を、ライブラリを使わず自前で文字に変換する方式（設計の案C）。

### Open Questions

- 人間の回答が必要な質問はない。依頼文と承認済みの設計で、実装者が決める中身は残っていない。
- 実装段階の条件（質問ではない）: 画面確認（REQ-007・REQ-008）のためのログインできるバックエンドが用意できない場合の扱いは、「Acceptance Criteria > テストについて」に定めた。

## Adopted design

## 設計候補: 絵文字を端末の文字で表示する（native-emoji）

- 対象ビード: tf-gidaa（依頼 gc-z67w の (4)）
- ワークフロー: tf-dhhcu（superpowers-build）/ brainstorming ビード tf-tl98w（試行1）、tf-sr3rp（試行2）
- 作成日: 2026-11-20（試行2で改訂: 2026-11-20）
- 試行: 2回目。試行1の候補を、承認サマリー `design-approval.md`（tf-dz9cw、判定 iterate）の指摘2点に沿って直した。直した箇所は末尾「改訂履歴」節に記載
- 承認状態: **承認済み**（tf-e9s8c、2026-11-20、autonomous）。根拠は末尾「承認状態」節と `design-approval.md` に記載

### Superpowers チェックリスト（項目1〜5）の状態

1. **プロジェクトの文脈を確認した** — 完了。確認した内容は「現状」節に記載。
2. **ビジュアルコンパニオン** — 提供しない。自律実行で人間の応答者がいない。見た目の選択肢を比べる質問もない（見た目は「端末の文字で出る」と依頼で決まっている）。
3. **確認の質問（1回に1つ）** — 人間への質問は不要と判断した。依頼文とコードで答えが決まる。解釈が分かれる点は「前提」節に、選んだ解釈と理由を書いた。
4. **2〜3案の比較と推奨** — 完了。「案の比較」節に記載。
5. **推奨設計を節に分けて提示** — 完了。「設計」節に記載。試行2で1節（外枠のクラスと寸法）と4節（診断メッセージの文面）を確定させた。

### 依頼の要点（求める結果）

依頼原文（tf-gidaa）の要約:

1. 絵文字の表示を、emoji-picker-react 既定の Apple 画像（`cdn.jsdelivr.net/npm/emoji-datasource-apple`）から、端末のフォントで描く文字の絵文字に替える。
2. `Picker`（2か所）と `Emoji`（6か所）を、プロジェクト用に包んだ部品へ置き換える。部品は `src/components` の共有層に置き、`src/components/avatars/avatar/index.tsx` の形に合わせる。部品の中で `emojiStyle` に `NATIVE` を渡す。
3. 各ファイルの `next/dynamic`（`ssr: false`）の読み込みを部品の中にまとめられるか検討する。
4. 包んだ部品の外から emoji-picker-react の部品（既定の書き出しと `Emoji`）を読み込むことを、Biome の `noRestrictedImports` で禁じる。包んだ部品のファイルは `overrides` で対象外にする。型の読み込みは許す。Biome 2.4.6 で実現できるかを資料で確かめ、実際に lint が落ちることを試してから入れる。できなければ止めて知らせる。
5. 次を確かめる。
   - 画面で、選択と表示が端末の文字で出ること
   - `cdn.jsdelivr.net` の `emoji-datasource-apple` を読みに行かないこと
   - 今のテストが通ること
6. 理由を `docs/decisions/` に記録する。

### 現状（プロジェクトの文脈）

- 依存: `emoji-picker-react@^4.18.0`（導入済み 4.18.0）、`@biomejs/biome@^2.4.6`（導入済み 2.4.6）、`next@^16.1.6`、`react@^19.2.4`。
- emoji-picker-react を読み込むファイルは8つある（パスは `src/` から）。
  - `Picker`（既定の書き出し、`dynamic(() => import("emoji-picker-react"), { ssr: false })`）
    - `app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/editable-task-group-icon/task-group-icon-editor/index.tsx`（`"use client"`。`import type { EmojiClickData }` もある）
    - `app/(main)/tasks/_components/tasks-sidebar-content/create-task-group-button/create-task-group-form/index.tsx`（ここでは `Emoji` も使う。`"use client"` はない。`"use client"` の `create-task-group-button` から読み込まれる）
  - `Emoji`（`dynamic(() => import("emoji-picker-react").then((mod) => mod.Emoji), { loading: スケルトン, ssr: false })`）
    - `app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/task-group-detail-emoji/index.tsx`（size 32、`"use client"`。Server Component から読み込まれる）
    - `app/(main)/tasks/groups/[id]/_components/task-group-header-icon/task-group-header-emoji/index.tsx`（size 28、`"use client"`。Server Component から読み込まれる）
    - `app/(main)/tasks/_components/tasks-sidebar-content/create-task-group-button/create-task-group-form/index.tsx`（size 32、loading なし、`unified` は初期値が空文字）
    - `app/(main)/tasks/_components/tasks-sidebar-content/task-group-menu/task-group-nav-links/task-group-link/index.tsx`（size 20）
    - `app/(main)/tasks/_components/tasks-sidebar-content/shared-task-group-menu/shared-task-group-nav-links/shared-task-group-link/index.tsx`（size 20）
    - `components/tasks/task-cards/task-card-task-group-link/index.tsx`（size 20、`"use client"`。読み込み元の `task-cards` も `"use client"`）
  - 型だけを読み込むファイル: `create-task-group-form/use-create-task-group-form.tsx`（`import type { EmojiClickData }`）
- `Picker` の2か所は、渡す props が同じ（`searchDisabled`、`skinTonesDisabled`、`previewConfig={{ showPreview: false }}`、`width="100%"`、`onEmojiClick`）。
- `Emoji` のスケルトンは5か所で同じ形（`skeleton block rounded-sm`、幅と高さは size）。
- ライブラリの挙動（`node_modules/emoji-picker-react/dist/emoji-picker-react.esm.js` で確認）
  - `Emoji` の `emojiStyle` の既定値は `EmojiStyle.APPLE` で、画像 URL は `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/`。外部 URL はこの4系統（apple/facebook/google/twitter）だけ。
  - `EmojiStyle.NATIVE` の場合、`<span class="epr-emoji-native …" style="width/height/font-size: size px">文字</span>` を出す。文字は `unified` から `String.fromCodePoint` で作る。画像は読まない。`unified` がデータにないときは `null` を返す。
  - ライブラリの CSS（`epr-emoji-native` のフォント指定、`display: block` 等）は、`Picker` が描画する `<style>` タグでしか差し込まれない。`Emoji` だけを描画しているページでは、クラスに当たる CSS がない。差し込まれるのは `Picker` を一度開いた後だけ。
  - 差し込まれる CSS のうち、表示用の `Emoji`（NATIVE）の `span` に効くもの（試行2で確認）
    - `.epr-emoji-native`: `display: block`（共通クラス経由）、`line-height: 100%`、`text-align: center`、`position: relative`、`align-self/justify-self: center`、`letter-spacing: 0`、絵文字フォントの `font-family`（`!important`）
    - `padding: var(--epr-emoji-padding)`。変数は `Picker` の要素の中でだけ定義されるため、`Picker` の外では 0 になる
    - `font-size` は `span` の `style`（size px）が勝つ
  - `span` の `style` は `width`・`height`・`font-size` を size px にする。CSS がないと `span` はインライン要素のままなので、`width`・`height` が効かない。
  - パッケージに `"use client"` はない。`Emoji` はフックとコンテキストを使う。
  - `index.d.ts` は `Emoji`・`EmojiStyle`・`EmojiClickData`・`PickerProps` 等を書き出す。
- テスト: 単体テスト・E2E テストのファイルはない。CI（`.github/workflows/static-checks.yml`）は `yarn next typegen` → `yarn tsc --noEmit`、`yarn biome ci --error-on-warnings .`、`yarn knip`、`yarn lint-jsx`、`yarn build` を実行する。
- ルール: `.claude/rules/component-implementation.md`（`use client` は境界にだけ書く、Props は使う側の要求で決める、読み込み中表示の置き場所）、`.claude/rules/component-placement.md`（別ルートから import されるものは共有層）、`.claude/rules/decisions-maintenance.md`（ADR の形式）。

### Biome 2.4.6 での実現可能性（調査済み）

`biome explain noRestrictedImports`（2.4.6）と実際の lint で確かめた。リポジトリの外の一時ディレクトリで、`--config-path` を使った。

- 資料上の対応範囲: `paths.<module>.importNames` で、名前付き（`"Emoji"`）、既定（`"default"`）、名前空間（`"*"`）を禁止できる。静的 import、再 export、`import()`（`.then(mod => …)` を含む）、`require()` が対象。ESLint の `allowTypeImports` に当たるオプションはない。
- 試した設定:
  `{"paths": {"emoji-picker-react": {"importNames": ["default", "Emoji", "*"], "message": "…"}}}` + `overrides` で包んだ部品のファイルだけ `"noRestrictedImports": "off"`
- 結果（lint が落ちる＝×、通る＝○）:
  - × `import Picker from "emoji-picker-react"`
  - × `import { Emoji } from "emoji-picker-react"`
  - × `import("emoji-picker-react")`（今の Picker の書き方）
  - × `import("emoji-picker-react").then((mod) => mod.Emoji)`（今の Emoji の書き方）
  - × `import * as M from "emoji-picker-react"`
  - × `import type { Emoji } from "emoji-picker-react"`（部品の型の読み込みは禁止側に入る）
  - ○ `import type { EmojiClickData } from "emoji-picker-react"`
  - ○ `import { EmojiStyle } from "emoji-picker-react"`（値だが部品ではないため対象外）
  - ○ overrides で外したファイルの中の既定 import と `import()`
- `"*"` を外すと、`import()` の2形式と `import * as` が通ってしまうことも確かめた。部品の禁止を抜け道なく効かせるには `"*"` が必要。
- 結論: Biome 2.4.6 で実現できる。止める必要はない。

### 前提（解釈が分かれる点と選んだ解釈）

- **「今のテストが通る」**: テストファイルがないため、CI の静的チェック5種（`tsc --noEmit`、`biome ci --error-on-warnings .`、`knip`、`lint-jsx`、`build`）が通ることと解釈する。
- **「型の読み込みは許す」**: 部品ではない型（`EmojiClickData`、`PickerProps` 等）の `import type` を許すと解釈する。`import type { Emoji }` のように部品名を型として読み込む形は、Biome に型だけを除外するオプションがないため禁止側に入る。プロジェクト内にその用法はない。必要になったら包んだ部品から `React.ComponentProps<typeof Emoji>` で取る。
- **部品の置き場所と名前**: `avatars/avatar` に合わせて、種類のディレクトリ `src/components/emojis/` の下に置く。
  - `src/components/emojis/emoji/index.tsx`（`Emoji`）
  - `src/components/emojis/emoji-picker/index.tsx`（`EmojiPicker`）
- **Picker の共通設定**: 2か所で同じ設定（検索なし、肌色選択なし、プレビューなし、幅100%）を部品の中に固定し、props は `onEmojiClick` だけにする。Props を使う側の要求で決めるルールに従う。
- **`"use client"` の移動**: `dynamic(..., { ssr: false })` が部品の中に移るため、`task-group-detail-emoji`・`task-group-header-emoji` はクライアントで動くコードを持たなくなる。`task-card-task-group-link` も同じ。境界にだけ `"use client"` を書くルールに従い、Server Component から使われる `Emoji` 部品に `"use client"` を書き、この3ファイルからは外す。`EmojiPicker` はクライアントのファイルからしか使われないため、`"use client"` を書かない。

### 案の比較

#### 案A（推奨）: 包んだ部品の中に `next/dynamic` をまとめ、読み込み関数の中で NATIVE を固定する

- `Emoji` 部品と `EmojiPicker` 部品が、それぞれ `dynamic(() => import("emoji-picker-react").then(...), { ssr: false })` を1回だけ持つ。
- `EmojiStyle.NATIVE` は、`import()` の結果から取り出して渡す。例: `.then(({ Emoji, EmojiStyle }) => 中で emojiStyle={EmojiStyle.NATIVE} を渡す部品)`。
- 長所
  - 8つの `dynamic` 宣言とスケルトンの重複が1か所ずつになる
  - ライブラリ（約480KB、絵文字データ込み）は今と同じく遅延読み込みのまま
  - 呼び出し側は `<Emoji unified size />` と `<EmojiPicker onEmojiClick />` を書くだけになる
- 短所
  - `next/dynamic` の `loading` は props を受け取れない。そのため size ごとのスケルトンは、部品が size の外枠を描き、その中を埋める形にする必要がある

#### 案B: 包んだ部品は薄い受け渡しだけにし、`dynamic` は呼び出し側に残す

- 呼び出し側が `dynamic(() => import("@/components/emojis/emoji").then(...))` を書き続ける。
- 長所: 部品が単純。
- 短所
  - `dynamic` とスケルトンの重複が残り、依頼の「まとめられるか」に応えない
  - 部品に `EmojiStyle` を静的 import すると、ライブラリが初期バンドルに入り遅延読み込みが崩れる。そのため結局、読み込み関数の工夫が要る

#### 案C: 表示用の `Emoji` はライブラリを使わず、`unified` から自前で文字に変換する

- `Picker` だけ包み、表示は `String.fromCodePoint` で自前に描く。
- 長所: 表示にライブラリの読み込みもスケルトンも要らない。サーバーで描画できる。
- 短所
  - 依頼が「包んだ部品の中で `emojiStyle` に `NATIVE` を渡す」と方式を指定している
  - ライブラリがしている、データにない `unified` を `null` にする判定を失う
  - 依頼の範囲を超える

**推奨: 案A。** 依頼の方式（包んだ部品に NATIVE を渡す）を守ったうえで、`dynamic` の集約に応えられる。遅延読み込みも保てる。

### 設計

#### 1. `Emoji` 部品（`src/components/emojis/emoji/index.tsx`）

- 先頭に `"use client"`（Server Component から使われる境界）。
- Props: `{ unified: string; size: number }`。
- モジュールの最上位で、`dynamic` を1つ宣言する。
  - `import("emoji-picker-react").then(({ Emoji, EmojiStyle }) => …)` で、`emojiStyle={EmojiStyle.NATIVE}` を固定した部品を返す。
  - `ssr: false`。
  - `loading` は、外枠を埋めるスケルトン（`skeleton block size-full rounded-sm`）。
- 描画（外枠）
  - 外枠は `span` 1つ。その中に上の dynamic 部品を描く。
  - 寸法は `` style={{ width: `${size}px`, height: `${size}px` }} `` で与える。
    - size は呼び出し側から渡る数値で、Tailwind のクラスでは任意の値を作れない
    - 手本の `LoadingAvatar`（`avatars/avatar`）も `style` で寸法を与えている
  - クラスは `flex shrink-0 items-center justify-center text-center leading-none` に確定する。各クラスの役目は次のとおり。
    - `flex`: 中の `span` をフレックスアイテムにする。フレックスアイテムはブロック化されるため、ライブラリの CSS（`display: block`）がなくても、中の `span` の `style` の `width`・`height`（size px）が効く。`block` にすると、CSS がない間は中の `span` がインラインのままになり、寸法が効かない
    - `shrink-0`: フレックスの親の中で、外枠が size より縮まないようにする
    - `items-center`・`justify-center`: 中身（スケルトン・絵文字）を外枠の中央に置く
    - `text-center`: 中の `span` に `text-align: center` を継承させ、ライブラリの CSS がある場合（`text-align: center`）とそろえる
    - `leading-none`: 中の `span` に `line-height: 1` を継承させ、ライブラリの CSS がある場合（`line-height: 100%`、font-size が size なので同じ値）とそろえる
  - ピッカーを開く前後で寸法と位置が変わらない理由（受け入れ条件4）: 外枠の寸法は `style` で固定され、中の `span` に効くレイアウトの値（ブロックとしての扱い、size px の幅と高さ、`line-height`、`text-align`、padding 0）は、ライブラリの CSS の有無にかかわらず同じになるため。
  - スケルトンは `skeleton block size-full rounded-sm`。外枠の寸法が決まっているため、`size-full` で外枠と同じ大きさになる。
  - `unified` が空文字のとき（タスクグループ作成フォームの初期状態）は、外枠だけを描き、スケルトンを出さない。今はその状態で何も出ていないため、それに合わせる。
- `avatars/avatar` に合わせ、名前付き export の関数コンポーネントにする。部品内では、ライブラリの `Emoji` とは別名で受ける。

#### 2. `EmojiPicker` 部品（`src/components/emojis/emoji-picker/index.tsx`）

- `"use client"` は書かない（クライアントのファイルからしか使われない）。
- Props: `{ onEmojiClick: (data: EmojiClickData) => void }`。`EmojiClickData` は `import type` で読み込む。
- モジュールの最上位で、`dynamic` を1つ宣言する。
  - `import("emoji-picker-react").then(({ default: Picker, EmojiStyle }) => …)` で、次を固定した部品を返す。
    - `emojiStyle={EmojiStyle.NATIVE}`
    - `searchDisabled`
    - `skinTonesDisabled`
    - `previewConfig={{ showPreview: false }}`
    - `width="100%"`
  - `ssr: false`。
  - `loading` はなし（今の2か所にもない）。
- 呼び出し側の「初回クリックで初めてマウントする」制御（`shouldPickerMount`）とポップオーバーは、今のまま呼び出し側に残す。

#### 3. 呼び出し側の置き換え（8ファイル）

- `Picker` を使う2ファイル
  - 対象: `task-group-icon-editor`、`create-task-group-form`
  - `dynamic` の宣言を消す
  - `<EmojiPicker onEmojiClick={handleEmojiClick} />` に替える
- `Emoji` を使う6か所
  - 対象: `task-group-detail-emoji`、`task-group-header-emoji`、`create-task-group-form`、`task-group-link`、`shared-task-group-link`、`task-card-task-group-link`
  - `dynamic` の宣言とスケルトンを消す
  - `<Emoji unified={…} size={…} />`（`@/components/emojis/emoji`）に替える
  - size は今の値（32 / 28 / 32 / 20 / 20 / 20）のまま
- `"use client"` を外すファイル: `task-group-detail-emoji`、`task-group-header-emoji`、`task-card-task-group-link`（前提の節のとおり）
- `next/dynamic` の import が不要になったファイルは、その import を消す
- `import type { EmojiClickData } from "emoji-picker-react"` の2ファイル（`task-group-icon-editor`、`use-create-task-group-form`）はそのまま（型の読み込みは許可）

#### 4. Biome の設定（`biome.json`）

- `linter.rules.style.noRestrictedImports` を加える
  - `level: "error"`（既定の severity は warn。CI は `--error-on-warnings` だが、意図を明示する）
  - `options.paths["emoji-picker-react"] = { "importNames": ["default", "Emoji", "*"], "message": "emoji-picker-reactの部品は直接読み込まず、@/components/emojis/emojiのEmojiと@/components/emojis/emoji-pickerのEmojiPickerを使う。EmojiClickData等の型はimport typeで読み込める。" }`
  - `message` は上の文面で確定する。何を使うかだけを書き、理由は書かない（理由は判断記録に書く）。部品名の `import type { Emoji }` は禁止側に入るため、許す型は「`EmojiClickData`等の型」と書き、「型は可」とは書かない
- `overrides` を加え、包んだ部品の2ファイルだけ `noRestrictedImports` を `off` にする
  - `includes`: `["src/components/emojis/emoji/index.tsx", "src/components/emojis/emoji-picker/index.tsx"]`
  - ディレクトリの glob にはしない。外す範囲をこの2ファイルに限るため
- 入れる手順（依頼の指定どおり）
  1. 資料の確認（済み、上の調査節）
  2. 設定を入れ、まだ置き換えていない呼び出し側で `yarn biome lint` が落ちることを確かめる
  3. 置き換え後に通ることを確かめる

#### 5. 判断記録（`docs/decisions/`）

- 新規: `docs/decisions/native-emoji-via-wrapper-components.md`（`.claude/rules/decisions-maintenance.md` の形式）。
  - Status: Accepted
  - Verification Status: 実装と確認の後に Verified
  - Related Files: `src/components/emojis/emoji/index.tsx`、`src/components/emojis/emoji-picker/index.tsx`、`biome.json`
  - Context
    - 既定では、Apple の画像を `cdn.jsdelivr.net` の `emoji-datasource-apple` から読む
    - 外部 CDN への依存と、絵文字1つごとの画像リクエストがある
    - 端末のほかの文字と見た目がそろわない
    - 呼び出し側ごとに `dynamic` と設定が散らばり、既定値（APPLE）に戻る書き方を止める仕組みがない
  - Decision: 包んだ部品で NATIVE を固定し、`noRestrictedImports` で直接の読み込みを禁じる
  - Considered Options: 案A〜C
  - Consequences
    - 見た目が OS とフォントで変わる（例: Windows では国旗が2文字の地域記号で出る）
    - 古い OS では新しい絵文字が豆腐（□）で出ることがある
    - 部品名の `import type` も禁止される
- `docs/decisions/index.md` に1行加える。

#### 6. 誤りの扱い

- 新しい誤りの経路はない。
- `unified` がデータにない場合、ライブラリは `null` を返す（今と同じ）。外枠だけが残る。
- `import()` の失敗時の扱いは、`next/dynamic` の既定のまま（今と同じ）。

### 範囲外

- `emojiVersion` 等で、OS が描けない新しい絵文字をピッカーから除く調整。
- ライブラリの CSS（フォント指定）を `Picker` なしでも差し込む対応。
- 絵文字の保存形式（`unified`）の変更や、API・スキーマの変更。
- `create-task-group-form` の `"use client"` の扱いや、ポップオーバー制御の共通化。
- emoji-picker-react の版上げ、別ライブラリへの移行。
- 単体テスト・E2E テストの新設（リポジトリにテスト基盤がない）。

### 受け入れ条件

1. `src/` で `emoji-picker-react` から値（既定の書き出し・`Emoji`・名前空間）を読み込むのは、`src/components/emojis/emoji/index.tsx` と `src/components/emojis/emoji-picker/index.tsx` の2ファイルだけ。ほかは `import type { EmojiClickData }` だけ。
2. 2つの部品はどちらも `emojiStyle` に `EmojiStyle.NATIVE` を渡す。`next/dynamic`（`ssr: false`）はこの2ファイルにだけある。
3. `biome.json` の `noRestrictedImports` について、次の両方を確かめ、その結果を記録する。
   - 包んだ部品の外に `import Picker from "emoji-picker-react"`、`import { Emoji } from "emoji-picker-react"`、`import("emoji-picker-react")` を置くと `yarn biome lint` が error で落ちる
   - `import type { EmojiClickData } from "emoji-picker-react"` は落ちない
4. 画面（`yarn dev` + ブラウザ）で次を確かめる。
   - タスクグループ作成フォームと、タスクグループ詳細のアイコン編集で、ピッカーの絵文字が端末の文字（`span.epr-emoji-native`）で出る
   - 選んだ絵文字が反映される
   - 表示6か所が `img` ではなく文字で出る
     - サイドバーの自分のグループ・共有グループ
     - タスクカードのグループリンク
     - 詳細のアイコン
     - ヘッダーのアイコン
     - 作成フォームのボタン
   - 表示6か所の寸法が今と同じ（20 / 28 / 32px）
   - ピッカーを開く前後で、表示の寸法と位置が変わらない
5. 4の操作の間、ブラウザのネットワークに `cdn.jsdelivr.net/npm/emoji-datasource-apple` へのリクエストが1件もない。
6. CI と同じ静的チェックがすべて通る: `yarn next typegen && yarn tsc --noEmit`、`yarn biome ci --error-on-warnings .`、`yarn knip`、`yarn lint-jsx`、`yarn build`。
7. `docs/decisions/native-emoji-via-wrapper-components.md` が形式どおりにあり、`docs/decisions/index.md` から辿れる。

### 未解決の質問

- 人間の回答が必要なものはない。
- 画面の確認（受け入れ条件4・5）には、ログインできるバックエンドが必要。実装段階で用意できない場合は、確認できなかった項目と理由をビードに記録する。確認の方法は実装の担当が決める。

### 承認状態

- 状態: **承認済み**。承認レーン tf-e9s8c が autonomous モードで done と判定した（2026-11-20）。判定の根拠は `/home/node/tascon-frontend/.gc-artifacts/native-emoji/design-approval.md`。
- 自律承認の根拠（autonomous モード）
  - 依頼文が、部品の置き場所の手本、`emojiStyle=NATIVE`、Biome のルール名・対象・例外・型の扱い、確かめる項目、ADR の記録先まで指定している
  - 唯一の止まる条件「Biome 2.4.6 でできなければ止める」は、調査と実際の lint で、できると確かめた
  - 残る判断（部品名、Picker 設定の固定、`"use client"` の移動、`"*"` の追加、空の `unified` の扱い）は、リポジトリのルールファイルと既存パターンから決まる。どれも「前提」節に根拠を書いた
  - 試行1の差し戻し理由だったプレースホルダー（診断メッセージ）と曖昧な記述（外枠のクラス）は、試行2で確定させた。実装者が中身を決める箇所は残っていない

### 改訂履歴

- 試行1（tf-tl98w）: 初版。承認レーン tf-dz9cw の判定は iterate。
- 試行2（tf-sr3rp）: `design-approval.md` の指摘2点を直した。引き継ぐと指示された内容は変えていない。
  1. 「設計 > 4」の `message` のプレースホルダーを、確定した文面に替えた。
  2. 「設計 > 1」の外枠を、寸法は `style`、クラスは `flex shrink-0 items-center justify-center text-center leading-none` に確定させた。各クラスの役目と、受け入れ条件4を満たす理由を書いた。その根拠として、ライブラリの CSS の中身を「現状」節に追記した。
  - ビジュアルコンパニオンは提供しない判断のまま。人間への質問はない。

