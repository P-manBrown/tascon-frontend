# 絵文字を端末の文字で表示する（native-emoji） Implementation Plan

Spec: .claude/specs/native-emoji.md
Worktree: 実装 item の準備時に個別の worktree を記録する。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** emoji-picker-react の `Picker`（2か所）と `Emoji`（6か所）を、`EmojiStyle.NATIVE` を固定した共有層の部品 `src/components/emojis/emoji`（`Emoji`）と `src/components/emojis/emoji-picker`（`EmojiPicker`）に置き換え、Biome の `noRestrictedImports` で直接の読み込みを禁じ、判断を `docs/decisions/` に残す。

**Architecture:** 2つの部品が、それぞれモジュールの最上位で `next/dynamic`（`ssr: false`）を1回だけ宣言し、読み込み関数の中で `import("emoji-picker-react")` の結果から `EmojiStyle.NATIVE` を取り出して渡す（設計の案A）。ライブラリの遅延読み込みは保つ。`Emoji` は size の外枠 `span`（`flex shrink-0 items-center justify-center text-center leading-none`、寸法は `style`）を描き、その中に dynamic の部品かスケルトンを描く。呼び出し側7ファイルは `dynamic` の宣言とスケルトンを消して2つの部品を使う。

**Tech Stack:** Next.js 16（App Router、Turbopack、`next/dynamic`）、React 19、TypeScript、emoji-picker-react 4.18.0、Biome 2.4.6（`noRestrictedImports`・`overrides`）、Tailwind CSS、Yarn 4.4.0（`nodeLinker: node-modules`）、knip、markuplint、markdownlint-cli2、lefthook（pre-commit）、git-spice、gc/bd（bead ノート）

---

## Context/Purpose

- 依頼: tf-gidaa（依頼 gc-z67w の (4)）。承認済み requirements: `/home/node/tascon-frontend/.gc-artifacts/native-emoji/requirements.md`（REQ-001〜REQ-009）。承認済み設計: 同ディレクトリの `design.md`（案A）
- 実装タスクは1つ（Task 1）。1つのブランチの上に3つのコミットを置く
  1. 部品2つの新設と呼び出し側7ファイルの置き換え（`feat`）
  2. `biome.json` の `noRestrictedImports` と `overrides`（`chore`）
  3. 判断記録（ADR）と索引（`docs`）
- 作業の順序は、依頼が指定する lint の手順（REQ-005）に合わせる。部品を作る → `biome.json` に禁止を入れる → まだ置き換えていない呼び出し側で `yarn biome lint` が error で落ちるのを確かめる（失敗するテストの代わり）→ 置き換える → 通るのを確かめる → CI と同じ静的チェック5種 → 画面の確認 → ADR → コミット3つ
- リポジトリに単体テスト・E2E テストの基盤はない（requirements の「テストについて」）。振る舞いは lint の前後比較、型検査とビルド、画面の確認で確かめる。テストの基盤は作らない
- この計画のコード（部品2つ、呼び出し側7ファイルの置き換え後、`biome.json` の追加分）は、計画作成時にシステムの一時ディレクトリの写しで `biome check --error-on-warnings`（新しい禁止を入れた設定）と `tsc --noEmit`（部品2つと使い方の例）を通してある。置き換え前の7ファイルには `noRestrictedImports` の error が8件（7ファイル）出ることも確かめた
- この formula がライフサイクル（requirements・plan・plan-review・decompose・implement・review・finalize・publish）を実行中。本計画の `### Task N` はソースの変更だけを扱う

## Current System

- 依存: `emoji-picker-react@^4.18.0`（導入済み 4.18.0）、`@biomejs/biome@^2.4.6`、`next@^16.1.6`、`react@^19.2.4`
- `src/` で emoji-picker-react を読み込むファイル（パスは `src/` から）
  - `Picker`（`const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });`、props は2か所とも `onEmojiClick`・`searchDisabled={true}`・`skinTonesDisabled={true}`・`previewConfig={{ showPreview: false }}`・`width="100%"`）
    - `app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/editable-task-group-icon/task-group-icon-editor/index.tsx`（`"use client"`、`import type { EmojiClickData }` あり、15行目が宣言、84〜92行目が描画）
    - `app/(main)/tasks/_components/tasks-sidebar-content/create-task-group-button/create-task-group-form/index.tsx`（`"use client"` なし。8行目が `Picker`、10〜13行目が `Emoji`（loading なし）、47行目が `<Emoji unified={watch("icon")} size={32} />`、55〜63行目が `Picker` の描画）
  - `Emoji`（`dynamic(() => import("emoji-picker-react").then((mod) => mod.Emoji), { loading: スケルトン, ssr: false })`。スケルトンは `skeleton block rounded-sm` と `style` の幅・高さ）
    - `app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/task-group-detail-emoji/index.tsx`（size 32、`"use client"`）
    - `app/(main)/tasks/groups/[id]/_components/task-group-header-icon/task-group-header-emoji/index.tsx`（size 28、`"use client"`）
    - `create-task-group-form/index.tsx`（size 32、上記）
    - `app/(main)/tasks/_components/tasks-sidebar-content/task-group-menu/task-group-nav-links/task-group-link/index.tsx`（size 20、`"use client"` なし）
    - `app/(main)/tasks/_components/tasks-sidebar-content/shared-task-group-menu/shared-task-group-nav-links/shared-task-group-link/index.tsx`（size 20、`"use client"` なし、`Avatar` も読み込む）
    - `components/tasks/task-cards/task-card-task-group-link/index.tsx`（size 20、`"use client"`）
  - 型だけ: `create-task-group-form/use-create-task-group-form.tsx`（`import type { EmojiClickData }`）。変更しない
- ライブラリの型（`node_modules/emoji-picker-react/dist/index.d.ts`）: 既定の書き出しが `EmojiPicker(props: PickerProps)`、名前付きで `Emoji`（`{ unified: string; emojiStyle?: EmojiStyle; size?: number; … }`、`JSX.Element | null` を返す）、`EmojiStyle`、`EmojiClickData`
- ライブラリの挙動: `Emoji` の `emojiStyle` の既定は `EmojiStyle.APPLE` で、`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/` の画像を読む。`NATIVE` では `<span class="epr-emoji-native …">文字</span>` を出し、画像を読まない。ライブラリの CSS は `Picker` を描いた後にだけ差し込まれる
- `biome.json`: `linter.rules` は `recommended: true` と `nursery.useSortedClasses: "on"` だけ。`overrides` はない。`formatter.useEditorconfig: true`（インデントは `.editorconfig` に従う）
- 手本の部品: `src/components/avatars/avatar/index.tsx`（名前付き export の関数コンポーネント、`"use client"` なし、スケルトンの寸法は `style`）
- 判断記録: `docs/decisions/` に1決定1ファイル、`docs/decisions/index.md` が索引（形式は `.claude/rules/decisions-maintenance.md`）
- フック: `lefthook.yml` の pre-commit が、ステージしたファイルに `yarn biome check --write --error-on-warnings`（`stage_fixed`）、`src/**/*.{jsx,tsx}` に `yarn markuplint --fix`、`*.md` に `yarn markdownlint-cli2`、`docs/**/*.md` に `.lefthook/pre-commit/check-docs.sh`、`main` へのコミットの禁止を行う。pre-push が `yarn knip` と作業ツリーが空かを見る
- CI（`.github/workflows/static-checks.yml`）: `yarn next typegen` → `yarn tsc --noEmit`、`yarn biome ci --error-on-warnings .`、`yarn knip`、`yarn lint-jsx`、`yarn build`
- テスト: 単体テスト・E2E テストのファイルも基盤もない。手元にブラウザ（chromium 等）と Playwright は入っていない（計画作成時の確認）

## Proposed Implementation

### File Structure

- Create: `src/components/emojis/emoji/index.tsx` — 表示用の `Emoji`（`"use client"`、NATIVE 固定、size の外枠、空の `unified` は外枠だけ）
- Create: `src/components/emojis/emoji-picker/index.tsx` — `EmojiPicker`（`"use client"` なし、NATIVE と4つの props を固定、Props は `onEmojiClick` だけ）
- Modify: `biome.json` — `linter.rules.style.noRestrictedImports` と、上の2ファイルだけを外す `overrides`
- Modify（呼び出し側、パスは `src/` から）
  - `app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/editable-task-group-icon/task-group-icon-editor/index.tsx` — `Picker` → `EmojiPicker`
  - `app/(main)/tasks/_components/tasks-sidebar-content/create-task-group-button/create-task-group-form/index.tsx` — `Picker` → `EmojiPicker`、`Emoji` → 共有の `Emoji`
  - `app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/task-group-detail-emoji/index.tsx` — 共有の `Emoji`、`"use client"` を外す
  - `app/(main)/tasks/groups/[id]/_components/task-group-header-icon/task-group-header-emoji/index.tsx` — 共有の `Emoji`、`"use client"` を外す
  - `app/(main)/tasks/_components/tasks-sidebar-content/task-group-menu/task-group-nav-links/task-group-link/index.tsx` — 共有の `Emoji`
  - `app/(main)/tasks/_components/tasks-sidebar-content/shared-task-group-menu/shared-task-group-nav-links/shared-task-group-link/index.tsx` — 共有の `Emoji`
  - `components/tasks/task-cards/task-card-task-group-link/index.tsx` — 共有の `Emoji`、`"use client"` を外す
- Create: `docs/decisions/native-emoji-via-wrapper-components.md` — ADR
- Modify: `docs/decisions/index.md` — ADR への1行
- 変えないファイル: `create-task-group-form/use-create-task-group-form.tsx`、`package.json`、`yarn.lock`、`lefthook.yml`、`.github/`、`src/components/avatars/`
- 確かめで作る一時ファイル（コミットメッセージ等）は、システムの一時ディレクトリ `${TMPDIR:-/tmp}/native-emoji-work/`（以下 `$W`）に置く。リポジトリには置かない

### ブランチとコミット

| Task | ブランチ名の案 | 親 | コミット（順に） |
| --- | --- | --- | --- |
| Task 1 | `feat/native-emoji` | `main`（`gc.var.base_branch`） | 1. `feat: render task group emoji with the device's emoji font` 2. `chore: forbid importing emoji-picker-react components outside the wrappers` 3. `docs: record why emoji are rendered natively through wrapper components` |

- ブランチ名の案は Skill `git-spice-workflow` の `<type>/<変更内容>`。利用者に見える見た目の変更なので PR の type は `feat` の想定
- ブランチの作成と `gc.git_branch` の記録は item の準備の段が行う。準備の段が別の名前を選んだ場合は `git branch --show-current` の値で読み替える
- コミットの分け方は Skill `git-spice-workflow` の「新設したコンポーネントは使うコードと同じコミット」「1コミット1目的」に従う。部品と呼び出し側は同じコミット1、lint の禁止はコミット2、判断記録はコミット3
- type の根拠: コミット1は表示の方式（APPLE の画像 → 端末の文字）を変えるので `feat`。コミット2は lint の設定だけの変更（依存の版は変えない）なので `.github/COMMIT_CONVENTION/COMMIT_CONVENTION.md` の表に従い `chore`。コミット3はドキュメントだけなので `docs`

### ライフサイクルとの関係

| 段階 | 担当 | 本計画での扱い |
| --- | --- | --- |
| plan-review・decompose | 本 formula の後続の段 | Task 1 を1つの実装 item にする |
| implement の準備 | item の準備の段 | worktree `.claude/worktrees/gc-<source-anchor-id>` と、`main` から切ったブランチを1つ作り、`gc.git_branch` を記録する |
| implement | 実装レーン | Task 1 の手順を、準備の段が作ったブランチの上で実行し、コミット3つまで行う。ブランチの作成・push・PR の作成はしない |
| review | 本 formula の後続の段 | 変更をレビューする |
| finalize・publish | 本 formula の後続の段 | `push=true`・`open_pr=false` のため、ブランチを Skill `git-spice-workflow` に従って push する。PR はこの build では作らない |

### 共通の前提（実装セッション）

- セッションの作業ディレクトリは、item の準備の段が作った worktree。本体の取り出し（`/home/node/tascon-frontend`）のブランチを切り替えない。ほかの worker の worktree を読み書きしない
- 作業するブランチは準備の段が作ったブランチだけ。ブランチを作らない・切り替えない・push しない。親が `main` でなければ作業せず、bead を blocked にして理由を書き、人への通知スクリプトで報告する
- コミットは Skill `git-spice-workflow` に従い `git-spice commit create` で行う（素の `git commit` は使わない）。コミットメッセージは英語で body を付ける
- 各コミットの前に、コミットメッセージ全文の日本語訳を実装の bead ノートに記録する（自律実行のため、提示の代わり）
- bead ノートへの記録は `bd update "<実装の bead id>" --append-notes '<内容>'` で行う（以下 `$BEAD` はその id）
- コマンドは bash で実行する。パスに `(`・`)`・`[`・`]` を含むので、必ず引用符で囲む
- 前の試みのコミットが既にある場合（`git log --format=%s main..HEAD` に上の subject がある場合）は、そのコミットまでの手順を飛ばし、次の手順から再開する

### Task 1: 絵文字の部品2つを作り、呼び出し側を置き換え、直接の読み込みを lint で禁じる

**Files:**

- Create: `src/components/emojis/emoji/index.tsx`
- Create: `src/components/emojis/emoji-picker/index.tsx`
- Modify: `biome.json`
- Modify: `src/app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/editable-task-group-icon/task-group-icon-editor/index.tsx`
- Modify: `src/app/(main)/tasks/_components/tasks-sidebar-content/create-task-group-button/create-task-group-form/index.tsx`
- Modify: `src/app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/task-group-detail-emoji/index.tsx`
- Modify: `src/app/(main)/tasks/groups/[id]/_components/task-group-header-icon/task-group-header-emoji/index.tsx`
- Modify: `src/app/(main)/tasks/_components/tasks-sidebar-content/task-group-menu/task-group-nav-links/task-group-link/index.tsx`
- Modify: `src/app/(main)/tasks/_components/tasks-sidebar-content/shared-task-group-menu/shared-task-group-nav-links/shared-task-group-link/index.tsx`
- Modify: `src/components/tasks/task-cards/task-card-task-group-link/index.tsx`
- Create: `docs/decisions/native-emoji-via-wrapper-components.md`
- Modify: `docs/decisions/index.md`
- Test: 自動テストのファイルは作らない（基盤がない）。`yarn biome lint .` の置き換え前後の比較（Step 5・Step 8）、CI と同じ静的チェック5種（Step 9）、画面の確認（Step 10）で確かめる

**Depends on:** なし（親は `main`）

**Behavior / Acceptance:**

- `Emoji` 部品が REQ-001 のとおり: `"use client"`、Props `{ unified: string; size: number }`、最上位の `next/dynamic` は1つ（`ssr: false`、`loading` は `skeleton block size-full rounded-sm`）、`EmojiStyle.NATIVE` は `import()` の結果から取る、外枠 `span` のクラスはちょうど `flex shrink-0 items-center justify-center text-center leading-none`、寸法は `style`、`unified === ""` のときは外枠だけ
- `EmojiPicker` 部品が REQ-002 のとおり: `"use client"` なし、Props は `onEmojiClick` だけ、`EmojiClickData` は `import type`、最上位の `next/dynamic` は1つ（`ssr: false`、`loading` なし）、`EmojiStyle.NATIVE`・`searchDisabled`・`skinTonesDisabled`・`previewConfig={{ showPreview: false }}`・`width="100%"` を固定
- 呼び出し側7ファイルが REQ-003・REQ-004 のとおり（size は 32 / 28 / 32 / 20 / 20 / 20 のまま、3ファイルから `"use client"` を外す、`create-task-group-form` の `"use client"` の有無は変えない）
- `biome.json` が REQ-005 のとおりで、置き換え前は error、置き換え後は通る。その結果を bead ノートに記録する
- ADR と索引が REQ-006 のとおり
- REQ-007・REQ-008 の画面の確認の結果（またはできなかった項目と理由）が bead ノートにある
- REQ-009 の5種がすべて成功する
- `main..HEAD` のコミットは上の3つで、差分は File Structure のファイルだけ

- [ ] **Step 1: 作業場所と親を確かめ、依存と一時ディレクトリを用意する**

  ```bash
  git branch --show-current
  git-spice ls
  git status --short
  git rev-parse HEAD origin/main
  git log --oneline origin/main..HEAD
  test -x node_modules/.bin/biome || bash .claude/skills/project-setup/scripts/setup.sh
  mkdir -p "${TMPDIR:-/tmp}/native-emoji-work"
  grep -rn "emoji-picker-react" src | cut -c1-200
  ```

  Expected:
  - 今のブランチは準備の段が作ったブランチ（`main` ではない）。`git-spice ls` でそのブランチが `main` の直上にある
  - `git status --short` が空。`git rev-parse` の2行が同じ SHA で、`git log origin/main..HEAD` が空
  - `grep` の結果が Current System の8ファイル（7ファイル + `use-create-task-group-form.tsx`）と一致する。違えば（既に誰かが置き換えた等）作業せず、bead に差分を書いて blocked にし、報告する

- [ ] **Step 2: 表示用の `Emoji` 部品を作る**

  `src/components/emojis/emoji/index.tsx` を次の内容で作る（インデントはスペース2つ）:

  ```tsx
  "use client";

  import dynamic from "next/dynamic";

  type Props = {
    unified: string;
    size: number;
  };

  const NativeEmoji = dynamic(
    () =>
      import("emoji-picker-react").then(({ Emoji: LibraryEmoji, EmojiStyle }) => {
        const NativeEmoji = ({ unified, size }: Props) => (
          <LibraryEmoji
            unified={unified}
            size={size}
            emojiStyle={EmojiStyle.NATIVE}
          />
        );
        return NativeEmoji;
      }),
    {
      loading: () => <span className="skeleton block size-full rounded-sm" />,
      ssr: false,
    },
  );

  export function Emoji({ unified, size }: Props) {
    return (
      <span
        className="flex shrink-0 items-center justify-center text-center leading-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {unified !== "" && <NativeEmoji unified={unified} size={size} />}
      </span>
    );
  }
  ```

  要点:
  - `emoji-picker-react` を値として静的に import しない（`EmojiStyle` も `import()` の結果から取る）。ライブラリを初期バンドルに入れないため
  - ライブラリの `Emoji` は `LibraryEmoji` という別名で受ける（export する `Emoji` と名前がぶつからないように）
  - `.then` の中で返す部品は関数内の関数なので、`.claude/rules/typescript.md` の「関数内関数: アロー関数使用」に従い `const` のアロー関数で書く（Step 3 も同じ）。トップレベルの `Emoji` は `function` 宣言のまま
  - `unified` がライブラリのデータにないときはライブラリが `null` を返し、外枠だけが残る。部品の側で特別な処理はしない

- [ ] **Step 3: `EmojiPicker` 部品を作る**

  `src/components/emojis/emoji-picker/index.tsx` を次の内容で作る（`"use client"` は書かない）:

  ```tsx
  import type { EmojiClickData } from "emoji-picker-react";
  import dynamic from "next/dynamic";

  type Props = {
    onEmojiClick: (data: EmojiClickData) => void;
  };

  const NativeEmojiPicker = dynamic(
    () =>
      import("emoji-picker-react").then(({ default: Picker, EmojiStyle }) => {
        const NativeEmojiPicker = ({ onEmojiClick }: Props) => (
          <Picker
            onEmojiClick={onEmojiClick}
            emojiStyle={EmojiStyle.NATIVE}
            searchDisabled={true}
            skinTonesDisabled={true}
            previewConfig={{ showPreview: false }}
            width="100%"
          />
        );
        return NativeEmojiPicker;
      }),
    { ssr: false },
  );

  export function EmojiPicker({ onEmojiClick }: Props) {
    return <NativeEmojiPicker onEmojiClick={onEmojiClick} />;
  }
  ```

  初回クリックで初めてマウントする制御（`shouldPickerMount`）とポップオーバーは呼び出し側に残す。部品には入れない。

- [ ] **Step 4: `biome.json` に禁止と例外を入れる**

  `linter.rules` の `nursery` の後に `style` を足す。変更前:

  ```json
        "recommended": true,
        "nursery": {
          "useSortedClasses": "on"
        }
      },
      "domains": {
  ```

  変更後:

  ```json
        "recommended": true,
        "nursery": {
          "useSortedClasses": "on"
        },
        "style": {
          "noRestrictedImports": {
            "level": "error",
            "options": {
              "paths": {
                "emoji-picker-react": {
                  "importNames": ["default", "Emoji", "*"],
                  "message": "emoji-picker-reactの部品は直接読み込まず、@/components/emojis/emojiのEmojiと@/components/emojis/emoji-pickerのEmojiPickerを使う。EmojiClickData等の型はimport typeで読み込める。"
                }
              }
            }
          }
        }
      },
      "domains": {
  ```

  ファイルの末尾の `css` の後に `overrides` を足す。変更前:

  ```json
    "css": {
      "parser": {
        "tailwindDirectives": true
      }
    }
  }
  ```

  変更後:

  ```json
    "css": {
      "parser": {
        "tailwindDirectives": true
      }
    },
    "overrides": [
      {
        "includes": [
          "src/components/emojis/emoji/index.tsx",
          "src/components/emojis/emoji-picker/index.tsx"
        ],
        "linter": {
          "rules": {
            "style": {
              "noRestrictedImports": "off"
            }
          }
        }
      }
    ]
  }
  ```

  `message` の文面は requirements の REQ-005 のとおりで、変えない。`includes` はディレクトリの glob にしない。

  ```bash
  yarn biome format biome.json
  ```

  Expected: 差分の指摘なし（`Checked 1 file` で error 0）。

- [ ] **Step 5: 失敗する確かめ — まだ置き換えていない呼び出し側で lint が落ちる**

  ```bash
  yarn biome lint . 2>&1 | tee "${TMPDIR:-/tmp}/native-emoji-work/lint-before.txt" | grep -E "lint/style/noRestrictedImports" | sed 's/ ━.*//'
  echo "exit=${PIPESTATUS[0]}"
  grep -cE "lint/style/noRestrictedImports" "${TMPDIR:-/tmp}/native-emoji-work/lint-before.txt"
  ```

  Expected: `exit=1`。`noRestrictedImports` が8件、次の7ファイルに出る（行:列は計画作成時の値）。`src/components/emojis/` の2ファイルと `use-create-task-group-form.tsx` には出ない。

  - `create-task-group-form/index.tsx:8:30` と `:11:44`
  - `shared-task-group-link/index.tsx:9:44`
  - `task-group-link/index.tsx:7:44`
  - `task-group-icon-editor/index.tsx:15:30`
  - `task-group-detail-emoji/index.tsx:8:44`
  - `task-group-header-emoji/index.tsx:8:44`
  - `task-card-task-group-link/index.tsx:9:44`

  診断の文面が Step 4 の `message` であることも見る。結果を bead ノートに記録する:

  ```bash
  bd update "$BEAD" --append-notes "REQ-005 置き換え前: yarn biome lint . は exit 1。noRestrictedImports が $(grep -cE 'lint/style/noRestrictedImports' "${TMPDIR:-/tmp}/native-emoji-work/lint-before.txt") 件（$(grep -E 'lint/style/noRestrictedImports' "${TMPDIR:-/tmp}/native-emoji-work/lint-before.txt" | sed 's/ ━.*//' | sed 's#.*/\([^/]*/index.tsx\)#\1#' | tr '\n' ' ')）。包んだ部品2ファイルと use-create-task-group-form.tsx には出ない"
  ```

  8件でない、または包んだ部品のファイルに出る場合は、Step 4 の設定を見直す（`overrides` の `includes` のパスの綴り、`importNames` の `"*"`）。

- [ ] **Step 6: `Picker` の呼び出し2ファイルを置き換える**

  `src/app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/editable-task-group-icon/task-group-icon-editor/index.tsx`:

  - 4行目 `import dynamic from "next/dynamic";` を消す
  - `import { useErrorSnackbar } from "@/app/_components/snackbars/snackbar/use-error-snackbar";` の次の行に `import { EmojiPicker } from "@/components/emojis/emoji-picker";` を足す
  - 15行目 `const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });` とその後の空行を消す
  - 3行目 `import type { EmojiClickData } from "emoji-picker-react";` は残す
  - 描画を置き換える。変更前:

    ```tsx
            {shouldPickerMount && (
              <Picker
                onEmojiClick={handleEmojiClick}
                searchDisabled={true}
                skinTonesDisabled={true}
                previewConfig={{ showPreview: false }}
                width="100%"
              />
            )}
    ```

    変更後:

    ```tsx
            {shouldPickerMount && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    ```

  置き換え後の import の並び（先頭から）:

  ```tsx
  "use client";

  import type { EmojiClickData } from "emoji-picker-react";
  import { useRouter, useSearchParams } from "next/navigation";
  import { useId, useRef, useState, useTransition } from "react";
  import { useErrorSnackbar } from "@/app/_components/snackbars/snackbar/use-error-snackbar";
  import { EmojiPicker } from "@/components/emojis/emoji-picker";
  import { DetailItemContentLayout } from "@/components/layouts/detail-item-content-layout";
  import { DetailItemHeadingLayout } from "@/components/layouts/detail-item-heading-layout";
  import type { ErrorObject } from "@/types/error";
  import type { HttpError } from "@/utils/error/custom/http-error";
  import { useRedirectLoginPath } from "@/utils/login-path/use-redirect-login-path";
  import { changeTaskGroupIcon } from "./change-task-group-icon.api";

  type Props = {
  ```

  `src/app/(main)/tasks/_components/tasks-sidebar-content/create-task-group-button/create-task-group-form/index.tsx`（`"use client"` は今も無く、足さない）:

  - 先頭から `type Props = {` の直前までを次に置き換える（`dynamic` の import と、`Picker`・`Emoji` の2つの宣言を消し、共有の部品を読み込む）:

    ```tsx
    import { Button } from "@/components/buttons/button";
    import { Emoji } from "@/components/emojis/emoji";
    import { EmojiPicker } from "@/components/emojis/emoji-picker";
    import { Label } from "@/components/form-controls/label";
    import { TextArea } from "@/components/form-controls/text-area";
    import { TextField } from "@/components/form-controls/text-field";
    import { useCreateTaskGroupForm } from "./use-create-task-group-form";

    ```

  - `<Emoji unified={watch("icon")} size={32} />` の行はそのまま（共有の `Emoji` を指すようになる）
  - `Picker` の描画を、上の `task-group-icon-editor` と同じ変更前・変更後で置き換える:

    ```tsx
            {shouldPickerMount && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    ```

- [ ] **Step 7: `Emoji` の表示の残り5ファイルを置き換える**

  `src/app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/task-group-detail-emoji/index.tsx` の全体を次にする（`"use client"` を外す）:

  ```tsx
  import { Emoji } from "@/components/emojis/emoji";

  const iconSize = 32;

  type Props = {
    unified: string;
  };

  export function TaskGroupDetailEmoji({ unified }: Props) {
    return <Emoji unified={unified} size={iconSize} />;
  }
  ```

  `src/app/(main)/tasks/groups/[id]/_components/task-group-header-icon/task-group-header-emoji/index.tsx` の全体を次にする（`"use client"` を外す）:

  ```tsx
  import { Emoji } from "@/components/emojis/emoji";

  const iconSize = 28;

  type Props = {
    unified: string;
  };

  export function TaskGroupHeaderEmoji({ unified }: Props) {
    return <Emoji unified={unified} size={iconSize} />;
  }
  ```

  `src/components/tasks/task-cards/task-card-task-group-link/index.tsx` の全体を次にする（`"use client"` を外す）:

  ```tsx
  import Link from "next/link";
  import { Emoji } from "@/components/emojis/emoji";

  const iconSize = 20;

  type Props = {
    id: number;
    name: string;
    icon: string;
  };

  export function TaskCardTaskGroupLink({ id, name, icon }: Props) {
    return (
      <Link
        className="flex w-fit items-center gap-2 rounded-sm p-1 duration-200 hover:bg-gray-600/10"
        href={`/tasks/groups/${id}`}
      >
        <Emoji unified={icon} size={iconSize} />
        <span className="text-gray-600">{name}</span>
      </Link>
    );
  }
  ```

  `src/app/(main)/tasks/_components/tasks-sidebar-content/task-group-menu/task-group-nav-links/task-group-link/index.tsx` の先頭から `type Props = {` の直前までを次に置き換える（`dynamic` の import と `Emoji` の宣言を消す。ほかの行は変えない）:

  ```tsx
  import Link from "next/link";
  import { Emoji } from "@/components/emojis/emoji";

  const iconSize = 20;

  ```

  `src/app/(main)/tasks/_components/tasks-sidebar-content/shared-task-group-menu/shared-task-group-nav-links/shared-task-group-link/index.tsx` の先頭から `type Props = {` の直前までを次に置き換える（ほかの行は変えない）:

  ```tsx
  import Link from "next/link";
  import { Avatar } from "@/components/avatars/avatar";
  import { Emoji } from "@/components/emojis/emoji";

  const iconSize = 20;
  const avatarSize = 20;

  ```

  どのファイルも、描画の `<Emoji unified={…} size={iconSize} />`（`task-group-link`・`shared-task-group-link` は `<span className="flex-none">` の中）はそのまま残す。

- [ ] **Step 8: 置き換え後に lint が通ることを確かめ、記録する**

  ```bash
  yarn biome check --write --error-on-warnings src/components/emojis "src/app/(main)/tasks" src/components/tasks/task-cards/task-card-task-group-link biome.json
  yarn biome lint . 2>&1 | tee "${TMPDIR:-/tmp}/native-emoji-work/lint-after.txt" | tail -5
  echo "exit=${PIPESTATUS[0]}"
  grep -c "noRestrictedImports" "${TMPDIR:-/tmp}/native-emoji-work/lint-after.txt"
  grep -rn "emoji-picker-react" src | cut -c1-200
  grep -rln "next/dynamic" src | sort
  git status --short
  ```

  Expected:
  - `biome check --write` が error 0 で終わる（整形で変わるのは空行・import の並びだけのはず。変わった場合は `git diff` で、Step 2〜7 のコードの意味が変わっていないことを見る）
  - `yarn biome lint .` が `exit=0`、`noRestrictedImports` の件数が `0`
  - `grep emoji-picker-react` の結果がちょうど次の5行・4ファイル（値の読み込みは包んだ部品の2ファイルだけ、ほかは `import type { EmojiClickData }` だけ）
    - `src/components/emojis/emoji/index.tsx`（`import("emoji-picker-react").then(...)`）
    - `src/components/emojis/emoji-picker/index.tsx`（`import type { EmojiClickData }` と `import("emoji-picker-react").then(...)` の2行）
    - `…/task-group-icon-editor/index.tsx`（`import type { EmojiClickData }`）
    - `…/create-task-group-form/use-create-task-group-form.tsx`（`import type { EmojiClickData }`）
  - `next/dynamic` を読み込むファイルに、Step 6・Step 7 の7ファイルが1つも無い（包んだ部品の2ファイルはある。ほかの機能のファイルが出るのは構わない）
  - `git status --short` が、`biome.json`、呼び出し側7ファイル、新設のディレクトリ `?? src/components/emojis/` の1行だけ（ADR はまだ）

  結果を bead ノートに記録する:

  ```bash
  bd update "$BEAD" --append-notes "REQ-005 置き換え後: yarn biome lint . は exit 0、noRestrictedImports は 0 件。src/ で emoji-picker-react から値を読み込むのは src/components/emojis/emoji/index.tsx と src/components/emojis/emoji-picker/index.tsx だけ、ほかは import type { EmojiClickData } だけ（task-group-icon-editor、use-create-task-group-form）"
  ```

- [ ] **Step 9: CI と同じ静的チェック5種を走らせる（REQ-009）**

  ```bash
  yarn next typegen && yarn tsc --noEmit; echo "typecheck exit=$?"
  yarn biome ci --error-on-warnings .; echo "biome ci exit=$?"
  yarn knip; echo "knip exit=$?"
  yarn lint-jsx; echo "lint-jsx exit=$?"
  yarn build; echo "build exit=$?"
  ```

  Expected: 5つとも `exit=0`。

  - `yarn build` が `"use client"` を外した3ファイルで落ちる場合（クライアント専用のコードが残っている）は、そのファイルに Step 7 の内容以外が残っていないかを見る
  - `yarn biome ci` が、追跡していないパス（worktree の symlink の `.gc`・`.env.local`・`.claude/memory` 等）だけで落ちる場合は、`git ls-files -z -- '*.js' '*.jsx' '*.ts' '*.tsx' '*.json' '*.jsonc' '*.css' | xargs -0 yarn biome ci --error-on-warnings` で追跡しているファイルだけを確かめ、どちらの結果も bead ノートに書く。追跡しているファイルで落ちる場合は直す
  - `yarn knip` が今回のファイルと無関係な指摘（`eslint`・`prettier` の未使用、`.pnp.cjs` 等）だけで落ちる場合は、`git stash push -u -m native-emoji-knip-check` → `yarn knip` → `git stash pop "$(git stash list | grep -m1 'native-emoji-knip-check' | cut -d: -f1)"` で変更前も同じ指摘が出るかを見て、同じなら既存の問題として bead ノートに記録する（stash は名前で戻す。`git stash` 自体が失敗する場合は stash にこだわらず、指摘の全文と、指摘が今回のファイルに関係しない理由を bead ノートに書く）。今回のファイルについての指摘は直す

  結果を bead ノートに記録する:

  ```bash
  bd update "$BEAD" --append-notes "REQ-009: yarn next typegen && yarn tsc --noEmit / yarn biome ci --error-on-warnings . / yarn knip / yarn lint-jsx / yarn build の結果: <それぞれの exit と要点>"
  ```

  （`<…>` は実際の結果で埋める。記録の文面の枠であり、計画の空きではない）

- [ ] **Step 10: 画面で表示と通信を確かめる（REQ-007・REQ-008）**

  前提を確かめる:

  ```bash
  FRONT="$(grep -E '^NEXT_PUBLIC_FRONTEND_ORIGIN=' .env.local | cut -d= -f2-)"
  API="$(grep -E '^NEXT_PUBLIC_API_ORIGIN=' .env.local | cut -d= -f2-)"
  curl -sS -o /dev/null -w 'api=%{http_code}\n' --max-time 5 "$API" || echo "api=unreachable"
  curl -sS -o /dev/null -w 'front=%{http_code}\n' --max-time 5 "$FRONT" || echo "front=unreachable"
  ```

  - バックエンド（`api=`）に届かない、ログインできるアカウントがない、またはこのセッションでブラウザを操作する手段（ブラウザ自動操作のツール）がない場合は、画面の確認をしない。次を bead ノートに記録し、Step 11 で ADR の Verification Status を `Unverified` にする:

    ```bash
    bd update "$BEAD" --append-notes "REQ-007/REQ-008 未確認: <届かなかった物・足りなかった物>のため画面とネットワークの確認をしていない。未確認の項目: ピッカーの絵文字が span.epr-emoji-native で出ること、選んだ絵文字の反映、表示6か所が img でなく文字で出ること、表示6か所の外枠の寸法（20/28/32px）、ピッカーを開く前後で寸法と位置が変わらないこと、cdn.jsdelivr.net/npm/emoji-datasource-apple へのリクエストが0件であること"
    ```

  - フロント（`front=`）が既に動いている（人の開発サーバー）場合は止めない。動いていなければ worktree で `yarn dev` をバックグラウンドで起こし、終わったら止める（`pkill -f` は自分のシェルに当たるので使わない。起こしたときの PID を `kill` する）

  確かめられる場合の手順（ブラウザで `$FRONT` にログインして行う）:

  1. タスク一覧（`/tasks`）を開き、ピッカーを開く前に、ブラウザのコンソールで表示の外枠の寸法と画像の有無を取る:

     ```js
     [...document.querySelectorAll('span.flex.shrink-0.items-center.justify-center.text-center.leading-none')]
       .map((el) => { const r = el.getBoundingClientRect(); return { w: r.width, h: r.height, x: r.x, y: r.y, native: !!el.querySelector('.epr-emoji-native'), img: !!el.querySelector('img') }; })
     ```

     Expected: サイドバーの自分のグループ・共有グループ・タスクカードのグループリンクの外枠が 20×20、`native: true`、`img: false`。
  2. サイドバーのタスクグループ作成ボタンを押してフォームを開き、絵文字ボタンを押す。ピッカーの絵文字が `span.epr-emoji-native` で出る（`document.querySelectorAll('.EmojiPickerReact img').length === 0`）。🎉 等を選ぶと、ボタンの中（外枠 32×32）に選んだ絵文字が文字で出る
  3. ピッカーを開いた後に 1. の式をもう一度実行し、各外枠の `w`・`h`・`x`・`y` が 1. と同じであることを見る
  4. 任意のタスクグループの詳細（`/tasks/groups/<id>`）を開き、詳細のアイコン（外枠 32×32）とヘッダーのアイコン（外枠 28×28）が文字で出ることを見る。アイコンを押してピッカーで別の絵文字を選び、詳細のアイコンが変わることを見る（確かめ後、元の絵文字に戻す）
  5. 1〜4 の間の通信を、ブラウザのコンソールで数える:

     ```js
     performance.getEntriesByType('resource').filter((e) => e.name.startsWith('https://cdn.jsdelivr.net/npm/emoji-datasource-apple')).length
     ```

     Expected: 各ページで `0`（ページを移るたびに実行する）。ブラウザのネットワークの記録が取れる手段なら、そちらでも `emoji-datasource-apple` で絞って0件を見る。

  結果（各項目の可否と取った値）を bead ノートに記録する:

  ```bash
  bd update "$BEAD" --append-notes "REQ-007/REQ-008: <各項目の結果と寸法の値、emoji-datasource-apple へのリクエスト数>"
  ```

- [ ] **Step 11: 判断記録（ADR）と索引を書く（REQ-006）**

  `docs/decisions/native-emoji-via-wrapper-components.md` を次の内容で作る。`Date` は `date +%F` の値にする。`Verification Status` は、Step 9 の5種がすべて成功し、Step 10 の全項目を確かめられた場合だけ `Verified`、それ以外は `Unverified` にする:

  ```markdown
  # 絵文字はラッパー部品で端末の文字に固定し、ライブラリの部品の直接読み込みをlintで禁じる

  - **Status:** Accepted
  - **Verification Status:** Verified
  - **Date:** 2026-11-20
  - **Related Files:** `src/components/emojis/emoji/index.tsx`, `src/components/emojis/emoji-picker/index.tsx`, `biome.json`

  ## Context

  タスクグループのアイコン絵文字は、emoji-picker-reactの既定（`EmojiStyle.APPLE`）で描いていた。既定では、絵文字1つごとにAppleの画像を`cdn.jsdelivr.net`の`emoji-datasource-apple`から読む。そのため、外部CDNに依存し、絵文字の数だけ画像リクエストが出ていた。また、画像の絵文字は端末のほかの文字と見た目がそろわない。

  ライブラリの`Picker`（2か所）と`Emoji`（6か所）は、呼び出し側の7ファイルがそれぞれ`next/dynamic`（`ssr: false`）で読み込み、設定とスケルトンも各ファイルに書いていた。既定値（APPLE）に戻る書き方を止める仕組みはなかった。

  ## Decision

  - 絵文字の表示と選択は、共有層の`@/components/emojis/emoji`の`Emoji`と`@/components/emojis/emoji-picker`の`EmojiPicker`だけで行う
  - 2つの部品の中で`emojiStyle`に`EmojiStyle.NATIVE`を固定する。`next/dynamic`（`ssr: false`）の宣言も部品の中に1つずつまとめ、`EmojiStyle`は`import()`の結果から取り出して、ライブラリの遅延読み込みを保つ
  - 表示用の`Emoji`は、size の寸法を`style`で固定した外枠（`flex shrink-0 items-center justify-center text-center leading-none`）の中に絵文字かスケルトンを描く。ライブラリのCSSは`Picker`を開いた後にだけ差し込まれるが、外枠がそのCSSと同じ`line-height`・`text-align`とブロックとしての寸法を与えるため、開く前後で表示の寸法と位置が変わらない
  - Biomeの`noRestrictedImports`で、`emoji-picker-react`の既定の書き出し・`Emoji`・名前空間（`import()`を含む）の読み込みをerrorにする。2つの部品のファイルだけを`overrides`で対象から外す。`EmojiClickData`等の部品ではない型は`import type`で読み込める

  ## Considered Options

  - **部品の中に`next/dynamic`をまとめ、読み込み関数の中でNATIVEを固定する（採用）**
    - 長所: `dynamic`の宣言とスケルトンの重複が部品ごとに1か所になる。ライブラリの遅延読み込みを保てる。呼び出し側は`<Emoji unified size />`と`<EmojiPicker onEmojiClick />`を書くだけになる
    - 短所: `next/dynamic`の`loading`はpropsを受け取れないため、size の外枠を部品が描き、その中をスケルトンで埋める形にする必要がある
  - **部品は受け渡しだけにし、`dynamic`は呼び出し側に残す**
    - 長所: 部品が単純になる
    - 短所: `dynamic`とスケルトンの重複が残る。部品で`EmojiStyle`を静的にimportするとライブラリが初期バンドルに入るため、結局、読み込み関数の工夫が要る
  - **表示用の絵文字はライブラリを使わず、`unified`から自前で文字に変換する**
    - 長所: 表示にライブラリの読み込みもスケルトンも要らず、サーバーで描画できる
    - 短所: データにない`unified`を描かないライブラリの判定を失う。依頼の方式（包んだ部品でNATIVEを渡す）から外れる

  ## Consequences

  - 絵文字の見た目がOSとフォントで変わる（例: Windowsでは国旗が2文字の地域記号で出る）
  - 古いOSでは、新しい絵文字が豆腐（□）で出ることがある
  - `noRestrictedImports`は型だけの読み込みを区別できないため、部品名の`import type`（例: `import type { Emoji }`）も禁止される。部品の型が要る場合は、包んだ部品から`React.ComponentProps<typeof Emoji>`で取る
  - 外部CDNへの画像リクエストはなくなる
  ```

  `docs/decisions/index.md` の末尾（`static-checks-in-pr-ci.md` の行の後）に次の1行を足す:

  ```markdown
  - 絵文字はラッパー部品で端末の文字に固定し、ライブラリの部品の直接読み込みをlintで禁じる (path: native-emoji-via-wrapper-components.md)
  ```

  ```bash
  yarn markdownlint-cli2 docs/decisions/native-emoji-via-wrapper-components.md docs/decisions/index.md; echo "markdownlint exit=$?"
  bash .lefthook/pre-commit/check-docs.sh; echo "check-docs exit=$?"
  grep -n "Verification Status" docs/decisions/native-emoji-via-wrapper-components.md
  ```

  Expected: 2つとも `exit=0`。`Verification Status` が Step 10 の結果に合っている（`Unverified` の場合は、確かめられなかった項目が Step 10 で bead ノートにある）。

- [ ] **Step 12: コミット1 — 部品と呼び出し側**

  コミットメッセージを `$W/commit-1.txt` に書く:

  ```text
  feat: render task group emoji with the device's emoji font

  Add shared Emoji and EmojiPicker components under src/components/emojis
  and use them in place of the emoji-picker-react Picker (2 places) and
  Emoji (6 places).

  Both components fix emojiStyle to EmojiStyle.NATIVE, so emoji are drawn
  as text with the device's font instead of Apple images loaded from
  cdn.jsdelivr.net. Each component declares its next/dynamic import
  (ssr: false) once and takes EmojiStyle from the dynamic import, so the
  library stays out of the initial bundle.

  Emoji draws a fixed-size wrapper (flex, leading-none, text-center) so the
  size and position stay the same before and after the Picker injects the
  library CSS. The callers keep their sizes (20/28/32px) and the Picker
  mount-on-first-click control. "use client" moves from three display-only
  files to the Emoji component, which is the client boundary now.
  ```

  日本語訳を bead ノートに記録してから、9ファイル（新設2・変更7）だけをステージしてコミットする:

  ```bash
  W="${TMPDIR:-/tmp}/native-emoji-work"
  bd update "$BEAD" --append-notes "コミット1の日本語訳: feat: タスクグループの絵文字を端末の絵文字フォントで描く / src/components/emojis に共有の Emoji と EmojiPicker を足し、emoji-picker-react の Picker（2か所）と Emoji（6か所）の代わりに使う。/ 2つの部品は emojiStyle を EmojiStyle.NATIVE に固定するため、絵文字は cdn.jsdelivr.net から読む Apple の画像ではなく端末のフォントの文字で描かれる。各部品は next/dynamic（ssr: false）を1回だけ宣言し、EmojiStyle を動的 import から取るため、ライブラリは初期バンドルに入らない。/ Emoji は寸法を固定した外枠（flex、leading-none、text-center）を描くため、Picker がライブラリの CSS を差し込む前後で寸法と位置が変わらない。呼び出し側は size（20/28/32px）と、初回クリックで Picker をマウントする制御を保つ。\"use client\" は表示だけの3ファイルから、今のクライアント境界である Emoji 部品へ移る。"
  git add src/components/emojis \
    "src/app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/editable-task-group-icon/task-group-icon-editor/index.tsx" \
    "src/app/(main)/tasks/_components/tasks-sidebar-content/create-task-group-button/create-task-group-form/index.tsx" \
    "src/app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/task-group-detail-emoji/index.tsx" \
    "src/app/(main)/tasks/groups/[id]/_components/task-group-header-icon/task-group-header-emoji/index.tsx" \
    "src/app/(main)/tasks/_components/tasks-sidebar-content/task-group-menu/task-group-nav-links/task-group-link/index.tsx" \
    "src/app/(main)/tasks/_components/tasks-sidebar-content/shared-task-group-menu/shared-task-group-nav-links/shared-task-group-link/index.tsx" \
    src/components/tasks/task-cards/task-card-task-group-link/index.tsx
  git diff --cached --name-only | wc -l
  git-spice commit create -F "${W}/commit-1.txt"
  git branch --show-current
  git log --format=%s -1
  git status --short
  ```

  Expected: ステージは9ファイル（新設2 + 変更7）。pre-commit（biome・markuplint・check-logger-trace・protect-branch）が通る。ブランチは Step 1 と同じで、最新のコミットの subject が `feat: render task group emoji with the device's emoji font`。`git status --short` に残るのは `biome.json`・`docs/decisions/index.md`・`docs/decisions/native-emoji-via-wrapper-components.md` だけ。pre-commit の `stage_fixed` で中身が変わった場合は `git show --stat HEAD` で変わったファイルを見て、意味が変わっていないことを確かめる。

- [ ] **Step 13: コミット2 — lint の禁止**

  `$W/commit-2.txt`:

  ```text
  chore: forbid importing emoji-picker-react components outside the wrappers

  Turn on Biome's noRestrictedImports for emoji-picker-react with
  importNames default, Emoji and "*" at the error level, and turn it off
  only for src/components/emojis/emoji/index.tsx and
  src/components/emojis/emoji-picker/index.tsx through overrides.

  "*" is needed so that import() and namespace imports are caught too.
  Without the rule, a new caller could import the library directly and
  fall back to the default Apple images. Type-only imports such as
  EmojiClickData stay allowed.
  ```

  ```bash
  W="${TMPDIR:-/tmp}/native-emoji-work"
  bd update "$BEAD" --append-notes "コミット2の日本語訳: chore: ラッパーの外で emoji-picker-react の部品を読み込むことを禁じる / emoji-picker-react に対し Biome の noRestrictedImports を importNames の default・Emoji・\"*\" で error として有効にし、overrides で src/components/emojis/emoji/index.tsx と src/components/emojis/emoji-picker/index.tsx だけ off にする。/ import() と名前空間の import も捕まえるには \"*\" が要る。このルールがないと、新しい呼び出し側がライブラリを直接読み込み、既定の Apple の画像に戻りうる。EmojiClickData 等の型だけの読み込みは引き続き許す。"
  git add biome.json
  git-spice commit create -F "${W}/commit-2.txt"
  git branch --show-current
  git log --format=%s -1
  git status --short
  ```

  Expected: pre-commit の biome が通る。ブランチは同じ。subject が `chore: forbid importing emoji-picker-react components outside the wrappers`。`git status --short` に残るのは `docs/decisions/` の2ファイルだけ。

- [ ] **Step 14: コミット3 — 判断記録**

  `$W/commit-3.txt`:

  ```text
  docs: record why emoji are rendered natively through wrapper components

  Add an ADR for fixing EmojiStyle.NATIVE in the Emoji and EmojiPicker
  wrappers and forbidding direct emoji-picker-react component imports with
  noRestrictedImports, and link it from the decisions index.

  The ADR keeps the options that were weighed and the accepted downsides:
  emoji look different per OS and font, old OSes may show tofu for new
  emoji, and type-only imports of component names are forbidden too.
  ```

  ```bash
  W="${TMPDIR:-/tmp}/native-emoji-work"
  bd update "$BEAD" --append-notes "コミット3の日本語訳: docs: 絵文字をラッパー部品で端末の文字で描く理由を記録する / Emoji と EmojiPicker のラッパーで EmojiStyle.NATIVE を固定し、noRestrictedImports で emoji-picker-react の部品の直接読み込みを禁じることについて ADR を足し、decisions の索引から辿れるようにする。/ ADR には比べた案と、受け入れた不利益（OS とフォントで見た目が変わる、古い OS では新しい絵文字が豆腐になる、部品名の型だけの import も禁止される）を残す。"
  git add docs/decisions/native-emoji-via-wrapper-components.md docs/decisions/index.md
  git-spice commit create -F "${W}/commit-3.txt"
  git branch --show-current
  git status --short
  ```

  Expected: pre-commit の markdownlint と check-docs が通る。ブランチは同じ。`git status --short` が空。

- [ ] **Step 15: 最後の確かめと申し送り**

  ```bash
  git log --format=%s origin/main..HEAD
  git diff --name-only origin/main..HEAD | sort
  git-spice ls
  yarn biome lint . >/dev/null 2>&1; echo "lint exit=$?"
  git status --short
  ```

  Expected:
  - subject が上から `docs: record why emoji are rendered natively through wrapper components`、`chore: forbid importing emoji-picker-react components outside the wrappers`、`feat: render task group emoji with the device's emoji font` の3つ
  - 差分のファイルが File Structure の12ファイル（`biome.json`、`docs/decisions/index.md`、`docs/decisions/native-emoji-via-wrapper-components.md`、`src/components/emojis/` の2ファイル、呼び出し側7ファイル、ほかは無い）だけ。`package.json`・`yarn.lock`・`use-create-task-group-form.tsx` が無い
  - `git-spice ls` でブランチが `main` の直上にある
  - `lint exit=0`、`git status --short` が空

  bead ノートに、ブランチ名・3つのコミットの SHA・ADR の Verification Status と、その理由（`Unverified` なら Step 10 の未確認の項目）を記録する:

  ```bash
  bd update "$BEAD" --append-notes "完了: branch=$(git branch --show-current) commits=$(git log --format=%h origin/main..HEAD | tr '\n' ' ') ADR Verification Status=$(grep -o 'Verification Status:\*\* [A-Za-z]*' docs/decisions/native-emoji-via-wrapper-components.md | awk '{print $NF}')"
  ```

## Non-Goals

- `emojiVersion` 等で、OS が描けない新しい絵文字をピッカーから除く調整
- ライブラリの CSS（フォント指定）を、`Picker` を開く前から差し込む対応
- 絵文字の保存形式（`unified`）、API、スキーマの変更
- `create-task-group-form` の `"use client"` の扱いや、ポップオーバー制御（`shouldPickerMount`）の共通化
- emoji-picker-react の版上げや、別ライブラリへの移行。`package.json`・`yarn.lock` の変更
- 単体テスト・E2E テストの基盤の新設、Playwright 等のブラウザの導入
- 表示用の絵文字を、ライブラリを使わず自前で文字に変換する方式（設計の案C）
- 実装の Task でのブランチの作成・push・PR の作成（ブランチは item の準備の段、push は publish の段が行い、PR はこの build では作らない）
- `docs/superpowers/specs/`・`docs/superpowers/plans/` への写し（この build の成果物は `.gc-artifacts/native-emoji/` を正とする）

## Validation and Acceptance

### Coverage

| ID | Status | Task / Step | Acceptance |
| --- | --- | --- | --- |
| REQ-001 | covered | Task 1 Step 2・Step 8・Step 9・Step 10 | `Emoji` 部品が REQ-001 のとおり（コード、lint、型、画面） |
| REQ-002 | covered | Task 1 Step 3・Step 8・Step 9・Step 10 | `EmojiPicker` 部品が REQ-002 のとおり |
| REQ-003 | covered | Task 1 Step 6・Step 8 | `Picker` の2ファイルが `EmojiPicker` を使い、値の読み込みと `dynamic` の宣言を持たない |
| REQ-004 | covered | Task 1 Step 6・Step 7・Step 8・Step 9 | `Emoji` の6か所が同じ size で共有の `Emoji` を使い、3ファイルから `"use client"` が外れ、`yarn build` が通る |
| REQ-005 | covered | Task 1 Step 4・Step 5・Step 8・Step 13 | `biome.json` が REQ-005 のとおり。置き換え前は error 8件、置き換え後は 0件。両方の結果が bead ノートにある |
| REQ-006 | covered | Task 1 Step 11・Step 14 | ADR が形式どおりにあり、索引から辿れる。Verification Status が確かめの結果に合う |
| REQ-007 | covered | Task 1 Step 10 | 画面の各項目の結果、または確かめられなかった項目と理由が bead ノートにある |
| REQ-008 | covered | Task 1 Step 10 | `cdn.jsdelivr.net/npm/emoji-datasource-apple` へのリクエスト数（0件）、または未確認の理由が bead ノートにある |
| REQ-009 | covered | Task 1 Step 9・Step 15 | 静的チェック5種がすべて成功する |

### 確かめの一覧

- 失敗するテストの代わり: Step 5 で、禁止を入れた設定のまま置き換え前の呼び出し側に `yarn biome lint .` をかけ、`noRestrictedImports` が8件（7ファイル）出ることを見る。Step 8 で置き換え後に0件になることを見る
- コードの形: Step 8 の `grep emoji-picker-react`（値の読み込みは包んだ部品の2ファイルだけ）と `grep next/dynamic`（呼び出し側7ファイルに無い）
- 型・lint・未使用・マークアップ・ビルド: Step 9 の5種（CI と同じコマンド）
- 画面と通信: Step 10。バックエンドかブラウザの手段が無い場合は、未確認の項目を bead ノートに残し、ADR を `Unverified` にする
- 履歴: Step 15 の subject 3つ、差分のファイル12、`git status` が空

### Risks

- 画面の確認（REQ-007・REQ-008）に要るバックエンド・ログイン・ブラウザの手段が実装のセッションに無いことがある（計画作成時、手元に chromium も Playwright も無い）: Step 10 の前提の確かめで判断し、無ければ未確認として記録し ADR を `Unverified` にする（requirements の「テストについて」のとおり）
- ライブラリの CSS が `Picker` を開いた後にしか差し込まれず、開く前後で表示が動く: 外枠のクラス（`flex`・`leading-none`・`text-center`）と `style` の寸法でそろえる。Step 10 の 1・3 で外枠の `getBoundingClientRect` を比べる
- `"use client"` を外した3ファイルがクライアント専用のコードを残すとビルドが落ちる: Step 7 でファイル全体を置き換え、Step 9 の `yarn build` で見る
- `git-spice commit create` の後、未ステージの変更が残っていると、上段のブランチがある場合に HEAD が移る: このブランチより上にブランチは無いため移る先は無いはずだが、各コミットの後に `git branch --show-current` で同じブランチかを見る
- pre-commit の `biome check --write`（`stage_fixed`）がコミットの中身を整形し直す: Step 8 で先に同じ整形を当てておく。変わった場合は `git show --stat HEAD` で見る
- worktree で `yarn biome ci --error-on-warnings .` が追跡外の symlink を拾う、`yarn knip` が既存の誤検知を出す: Step 9 の手順で、追跡しているファイルだけの確かめや変更前との比較を行い、bead ノートに書く
- 部品名の `import type { Emoji }` も禁止される: 今のコードに用法は無い（Step 5 で `use-create-task-group-form.tsx` に error が出ないことを見る）。ADR の Consequences に書く

### 前提と判断（headless のため質問せず記録）

- 実装タスクは1つ（Task 1）。部品・呼び出し側・lint・ADR は同じ目的の変更で、1つのブランチと1つの PR にまとめる。コミットは Skill `git-spice-workflow` の規則に従って3つに分ける
- ブランチ名の案は `feat/native-emoji`。準備の段が別の名前を選んだときは `git branch --show-current` の値で読み替える
- コミットの type は、コミット1が `feat`（表示の方式の変更）、コミット2が `chore`（lint の設定だけ。`.github/COMMIT_CONVENTION/COMMIT_CONVENTION.md` の「依存の版以外の設定は chore」）、コミット3が `docs`
- 部品の中の dynamic の部品は、`.then` の中で `const` のアロー関数（`NativeEmoji`・`NativeEmojiPicker`）として宣言して返す。関数内の関数なので `.claude/rules/typescript.md` の「関数内関数: アロー関数使用」に従う。計画レビュー（iteration 1）の反映時に、システムの一時ディレクトリの写し（リポジトリの `.editorconfig`・`tsconfig.json`、新しい禁止と `overrides` を入れた `biome.json`）でこの形の2ファイルが Biome 2.4.6 の `biome check --error-on-warnings` と `tsc --noEmit` を通ることを確かめた
- ADR のタイトルと本文は requirements の REQ-006 の項目（Context・Decision・Considered Options・Consequences）から書いた。`Date` は実装した日にする
- 画面の確認の手段（手で操作するか、ブラウザ自動操作か）は実装の担当が決める（requirements のとおり）。Step 10 のコンソールの式は、どちらの手段でも使える確かめの例
- コミット前の日本語訳の提示は、自律実行のため bead ノートへの記録で満たす

## Decision Log

- 2026-11-20: plan-review で計画を承認。正式な plan/spec を保存する方針を採用。保存しない旨の旧記述はこの決定で変更。出典: /home/node/tascon-frontend/.gc-artifacts/native-emoji/requirements.md, /home/node/tascon-frontend/.gc-artifacts/native-emoji/design.md, /home/node/tascon-frontend/.gc-artifacts/native-emoji/implementation-plan.md。

## Progress

- plan-review 承認済み。実装前。
