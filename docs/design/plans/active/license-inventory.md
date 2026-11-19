# ライセンスの洗い出し（docs/license-inventory.md）

**Goal:** npm 依存の全件・コード以外の物・第三者由来の物のライセンスと使われ方を洗い出し、MIT などを付ける妨げと確かめきれない物を日本語の報告 `docs/license-inventory.md` 1 ファイルにまとめ、`docs:` コミット 1 つを push し、PR の下書きを bead ノートに残す。

**Architecture:** `yarn info -A -R --manifest --json` の出力・追跡済みの `.yarn/cache` の zip 一覧・ルートの `package.json` を、システム一時ディレクトリに置く使い捨ての Python スクリプトで突き合わせ、全件表（Markdown）と件数を機械的に作る。妨げ・確かめきれない物・コード以外の物の節は、この計画に下書きした文面に、実際に取った値を入れて書く。スクリプトはリポジトリに入れない。

**Tech Stack:** Yarn 4.4.0（`nodeLinker: node-modules`、`.yarn/cache` コミット済み）、Python 3（標準ライブラリのみ）、markdownlint-cli2、lefthook、git-spice、gc/bd（bead ノート）

---

## Context/Purpose

- 依頼: tf-2f5w（HQ 依頼 gc-vjh8 の 1/4）。承認済み requirements: `docs/design/requirements/license-inventory.md`（REQ-001〜REQ-010、AC1〜AC10）。承認済み design: `docs/design/specs/license-inventory.md`（案 A: Markdown 1 ファイル）
- 実装タスクは **Task 1 の 1 つだけ**。リポジトリで変えるのは `docs/license-inventory.md` の新規追加だけ（REQ-009）
- 作業の順序: ブランチ作成 → 入力が `main` と同じことの確認 → `yarn info --manifest` → 未追跡 zip の掃除 → manifest に値がない物の確認 → 全件表の生成 → コード以外の物の調査 → 報告の執筆 → markdownlint → 機械的な確かめ → コミット → push（PR は作らない）→ PR の下書きを bead ノートへ
- 計画作成時点（`main` = `ffa7ffcc`）に、この計画のスクリプトを `yarn info -A -R --json`（`--manifest` なし。cache を取りに行かない）で試し、969 項目 → 表 968 行、追跡済み zip 874 個がすべて表の行に対応（同梱 874・未取得 94）、用途は実行時 654・開発時のみ 314、`patch:` の元の項目 3 つ（`fsevents@npm:2.3.2`・`resolve@npm:1.22.8`・`typescript@npm:5.9.3`）が対応する `patch:` の項目と同じ用途になることを確かめた
- ライフサイクル（requirements・plan・plan-review・decompose・implement・review・finalize・publish）はこの formula が実行中。`### Task N` はリポジトリの変更だけを扱う。この run は `open_pr=false`・`push=true` のため、実装レーンは push までを行い、PR は作らず、PR のタイトルと本文の下書き（英語）を実装 bead のノートに残す（REQ-010）

## Current System

- `main` = `ffa7ffccfc3f59b58f166a9ad8a31b0eaf864dca`（2026-11-19 計画作成時点。design・requirements の基準と同じ）
- `package.json`: `private: true`、`license` フィールドなし。`dependencies` 30 個（`typescript` を含む）、`devDependencies` 11 個。リポジトリに `LICENSE` はない
- `.yarnrc.yml`: `nodeLinker: node-modules`、`enableGlobalCache: false`（cache はワークツリーごとの `.yarn/cache`）、`yarnPath: .yarn/releases/yarn-4.4.0.cjs`、`packageExtensions`（`next-pwa@5.6.0` ほか）
- `git ls-files .yarn/cache` は 874 個の zip。zip 名は `<ident の / を - に置換>-npm-<版>-<hash>-<checksum>.zip`（例: `@img-sharp-linux-arm64-npm-0.34.5-efb30e243a-10.zip`）、`patch:` の項目は `<ident>-patch-<hash>-<checksum>.zip`（`resolve-patch-4254c24959-f345cd37f5.zip`・`typescript-patch-f911699f7e-5d416ad4f2.zip` の 2 つ。`fsevents` の `patch:` の zip はない）
- `yarn.lock` の `patch:` の項目は 3 つ（`fsevents`・`resolve`・`typescript`、いずれも `optional!builtin<compat/...>`）
- `yarn info -A -R --json` の出力は 1 行 1 項目の JSON（`{"value": "<locator>", "children": {"Version": ..., "Dependencies": [{"descriptor": ..., "locator": ...}], ...}}`）。workspace（`tascon-frontend@workspace:.`）の `Dependencies` は `dependencies` と `devDependencies` を区別せず 41 個並べ、peer を持つ物は `next@virtual:<hash>#npm:^16.1.6` のような `virtual:` の locator になる（全件の項目は `virtual:` を含まない `next@npm:16.1.6` の形）。`--manifest` を付けると `children.Manifest.License` が加わる。`--manifest` は他 OS・他 CPU 用の zip を `.yarn/cache` に未追跡で落とす（2026-11-18 時点で 94 個）
- manifest の `license` の内訳（design、`ffa7ffcc`）: MIT 793、ISC 71、Apache-2.0 26、BSD-2-Clause 16、MPL-2.0 12、LGPL-3.0-or-later 10、BSD-3-Clause 10、MIT OR Apache-2.0 9、BlueOak-1.0.0 4、(MIT OR CC0-1.0) 3、Apache-2.0 AND LGPL-3.0-or-later 3、CC-BY-4.0 2、(WTFPL OR MIT) 2、0BSD 2、CC0-1.0 1、(AFL-2.1 OR BSD-3-Clause) 1、Python-2.0 1、Apache-2.0 AND LGPL-3.0-or-later AND MIT 1、値なし 2（workspace 自身と `jsesc@0.5.0`）
- `jsesc@0.5.0`: 追跡済みの zip `jsesc-npm-0.5.0-6827074492-fab949f585.zip` に `node_modules/jsesc/LICENSE-MIT.txt`（MIT の全文、`Copyright Mathias Bynens`）があり、`package.json` は古い `licenses: [{"type": "MIT"}]` 形式。計画作成時点で MIT と読めることを確かめた
- 妨げの候補の区分（計画作成時点の試算）:
  - sharp のネイティブ部品（`@img/sharp-*`・`@img/sharp-libvips-*`）: 同梱は `@img/sharp-libvips-linux-arm64@1.2.4` と `@img/sharp-linux-arm64@0.34.5`（後者のライセンスは manifest で確かめる）、ほかは未取得。すべて実行時（`next` 経由）
  - `lightningcss@1.30.2` と `lightningcss-<platform>@1.30.2` 11 個: 同梱は `lightningcss` と `lightningcss-linux-arm64-gnu`、すべて開発時のみ（`@tailwindcss/postcss` 経由）
  - `caniuse-lite@1.0.30001593`・`@1.0.30001646`: どちらも同梱・実行時
  - `emoji-picker-react@4.18.0`（同梱・実行時）: 既定の `emojiStyle` で `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/` から画像を読む（zip 内の `dist/emoji-picker-react.cjs.development.js` で確認）。`src` に `emojiStyle` の指定はない
- コード以外の物:
  - `git ls-files public` は 13 ファイル: `public/favicon.ico`、`public/icons/apple-touch-icon.png`、`public/icons/icon-{72x72,96x96,128x128,144x144,152x152,192x192,384x384,512x512}.png`、`public/logos/logo.png`、`public/logos/logo-small.png`、`public/manifest.json`
  - フォントファイルなし。`tailwind.config.js` の `fontFamily.body` は `"Helvetica Neue"`・`"Arial"`・`"Hiragino Kaku Gothic ProN"`・`"Hiragino Sans"`・`"Meiryo"`・`"sans-serif"` の指定だけ
  - `src` 中の外部 URL: `https://github.com/P-manBrown/tascon-frontend/issues/new`（リンク）、`https://forms.gle/F9d8j2XnjT2mAfRc9`（リンク 2 か所）、`http://www.w3.org/2000/svg`（SVG の名前空間）。素材を読む URL はない
  - `.claude/skills/gh-stack/`: `SKILL.md` の metadata に `github-repo: https://github.com/github/gh-stack`、`github-ref: refs/tags/v0.3.0`。`gh api repos/github/gh-stack/license` は `MIT`。コピーに LICENSE ファイルは含まれていない
  - `.yarn/releases/yarn-4.4.0.cjs`: 先頭にライセンス表示なし。`gh api repos/yarnpkg/berry/license` は `BSD-2-Clause`
  - `.github/COMMIT_CONVENTION`: サブモジュール（`705da6bc`）。所有者自身のリポジトリ
- スタック（計画作成時点の `git-spice ls`）: `main ← refactor/move-design-and-tech-debt-to-docs (#942) ← chore/drop-gh-stack (#943)`。#942 の上には PR のないローカルだけのブランチ `ci/english-pull-requests`（別ワーカーのワークツリー `gc-tf-7fsu` で作業中）もある。#942・#943 は `package.json`・`yarn.lock`・`.yarn/`・`public/`・`src/`・`tailwind.config.js` を変えない。#943 は `.claude/skills/gh-stack/` の 4 ファイルを削除する。#942 は `.github/pull_request_template.md` の Related Documents の例を `docs/design/plans/active/<name>.md`・`docs/design/specs/<name>.md` に変え、`.markdownlint-cli2.jsonc` の `ignores` から `.claude/skills/gh-stack/**/*` を外す
- `git-spice-workflow` Skill: 「新しい作業のブランチは、未マージのスタックがあればその最上段に積む。内容が独立して見える変更（ドキュメントのみ等）でも `main` から切らない」。コミット・PR は英語、コミットは body 付き、コミット前に日本語訳を示す、PR は `.github/pull_request_template.md` に沿う
- lefthook: pre-commit で `yarn markdownlint-cli2 {staged_files}`（`*.md`）、`bash .lefthook/pre-commit/check-docs.sh`（スタック最上段の版は `docs` 配下の `.md` の相対リンク切れを検出する）、`main` へのコミット禁止。pre-push で `yarn knip` と `test -z "$(git status --porcelain)"`（作業ツリーに未追跡ファイルがあると push できない）
- markdownlint 設定: `default: true`、`MD007 indent 2`、`MD009 br_spaces 2`、`MD013`・`MD033` 無効。`MD034`（裸の URL）・`MD024`（同じ見出し）・`MD040`（コードブロックの言語）が有効

## Progress

- [x] Task 1: `docs/license-inventory.md`を追加してpushした（ブランチ`docs/license-inventory`、PR #944）。build（superpowers-build）はレビューとgap analysisの承認後にpublishまで完了している
- [ ] PR #944のレビュー・マージ。マージ後、このplanを`docs/design/plans/completed/`へ移動する（`execution-plan`スキルの完了処理）
- 下のStepsはbuildの実行手順を残したもの。チェックボックスはbuildが実行した記録で、再実行する場合は新しく作る

## Proposed Implementation

### File Structure

- Create: `docs/license-inventory.md` — 報告本体（日本語）。冒頭・要約・区分の見方・妨げになる物・確かめきれない物・コード以外の物・npm 依存の全件表・調べ方
- リポジトリ外（システム一時ディレクトリ `$WORK`、コミットしない）: `inventory.py`（全件表と件数の生成）、`info.ndjson`（`yarn info` の出力）、`cache.txt`（追跡済み zip の一覧）、`overrides.json`（manifest に値がない物の確認結果）、`out/`（生成物）、`commit-message.txt`
- ほかのファイル（`LICENSE`・`package.json`・`.yarn/cache`・コード）は変えない

### 実行順序とライフサイクルとの関係

| 段階 | 担当 | この計画での扱い |
| --- | --- | --- |
| plan-review・decompose | この formula の後続ステップ | Task 1 を 1 つの実装 bead にする |
| implement | 実装レーン（Task 1） | 下の Task 1 を実行し、push と PR の下書きまで行う |
| review・finalize・publish | この formula の後続ステップ | PR を作るかは後続のレーンが決める（`open_pr=false`）。実装レーンは PR を作らない |

### Task 1: ライセンスの洗い出しを行い、`docs/license-inventory.md` を追加して push する

**Files:**

- Create: `docs/license-inventory.md`
- Test: 単体テストなし（コードの変更がない）。全件表の行数・同梱の判定・差分の範囲・`.yarn/cache` の状態・markdownlint を機械的に確かめる

**Behavior / Acceptance:** requirements の AC1〜AC10（REQ-001〜REQ-010）

**前提条件（実装セッション）:**

- セッションの作業ディレクトリが、このタスク用のワークツリー（`.claude/worktrees/<name>`）であること。メインチェックアウト（`/home/node/tascon-frontend`）では作業しない。`yarn info --manifest` が未追跡の zip を落とすのは、そのワークツリーの `.yarn/cache` になる
- 以下 `$WORK` は `mktemp -d` で作るシステム一時ディレクトリ。`<TASK_BEAD_ID>` は実装レーンが claim した bead の ID

- [x] **Step 1: スタックの最上段を確かめ、その上に作業ブランチを作る**

  ```bash
  git-spice ls
  gh pr list --state open --json number,headRefName,baseRefName
  git branch -a --list '*license-inventory*'
  ```

  最上段 `<TOP>` の決め方: `git-spice ls` に出る未マージのブランチのうち、GitHub に open の PR があり、その上に PR のあるブランチが積まれていない物。候補が複数あれば PR 番号の最も大きい物。PR のないローカルだけのブランチ（計画作成時点の `ci/english-pull-requests`。別ワーカーが作業中）には積まない。未マージのスタックがなければ `<TOP>` は `main`。計画作成時点の `<TOP>` は `chore/drop-gh-stack`（#943）。`docs/license-inventory` という名前のブランチが既にあれば、作らずに中身を確かめ、別の作業の物なら bead を blocked にして報告する。

  ```bash
  git-spice branch checkout <TOP>
  git status --short
  git rev-parse HEAD origin/<TOP>
  git-spice branch create docs/license-inventory --no-commit
  git-spice ls
  ```

  Expected: `git status --short` が空、2 つの SHA が一致、`docs/license-inventory` が `<TOP>` の上に表示され、チェックアウト中。`<TOP>` が他のワークツリーでチェックアウト中で切り替えられない場合は、`git-spice branch create docs/license-inventory --no-commit --target <TOP>` で作る。bead ノートに `<TOP>` とその SHA を記録する。

- [x] **Step 2: 基準コミットを決め、洗い出しの入力が基準コミットと同じことを確かめる**

  ```bash
  BASE_SHA="$(git merge-base origin/main HEAD)"
  echo "$BASE_SHA"
  git log -1 --format='%H %cI %s' "$BASE_SHA"
  git diff --name-only "$BASE_SHA" HEAD -- package.json yarn.lock .yarnrc.yml .yarn public src tailwind.config.js next.config.js .claude/skills/gh-stack .github/COMMIT_CONVENTION .gitmodules
  ```

  Expected: `BASE_SHA` は作業ブランチの分岐元の `main` の SHA（計画作成時点は `ffa7ffcc…`）。`git diff` の出力は、計画作成時点のスタックでは `.claude/skills/gh-stack/` の 4 ファイル（#943 の削除）だけ。ほかのパスが出たら、そのブランチ（スタック下段）の変更が洗い出しの入力を変えているので、変えたブランチ名と中身を bead ノートに書き、報告の冒頭に「下段の PR #<番号> の変更を含む状態で調べた」旨を書き足す（件数は実際に取った値を使う）。

  `BASE_SHA` が `ffa7ffcc` と違う場合も、以降はすべて実際に取った値を使う（REQ-001）。

- [x] **Step 3: `yarn info -A -R --manifest --json` で全件と manifest の license を取る**

  ```bash
  WORK="$(mktemp -d)"
  echo "$WORK"
  git ls-files .yarn/cache > "$WORK/cache.txt"
  wc -l < "$WORK/cache.txt"
  yarn info -A -R --manifest --json > "$WORK/info.ndjson"
  grep -c '^{' "$WORK/info.ndjson"
  python3 -I -c 'import json,sys; rows=[json.loads(l) for l in open(sys.argv[1]) if l.startswith("{")]; print(sum(1 for r in rows if "Manifest" in r["children"]), "with Manifest"); print([r["value"] for r in rows if not (r["children"].get("Manifest") or {}).get("License")])' "$WORK/info.ndjson"
  ```

  Expected: `cache.txt` は 874 行（計画作成時点）、`info.ndjson` の項目数は 969（計画作成時点）、全項目に `Manifest` がある、`License` が空の項目は `['jsesc@npm:0.5.0', 'tascon-frontend@workspace:.']`（順不同）。`yarn` がインストール未実行を理由に失敗したら `bash .claude/skills/project-setup/scripts/setup.sh` を実行してからやり直す。`Manifest` が 1 件もない場合は `yarn info` の出力形式が想定と違うので、`head -c 800 "$WORK/info.ndjson"` で形を確かめ、Step 6 のスクリプトの `children.get("Manifest")`・`manifest.get("License")` の 2 か所を実際のキー名に合わせる。

- [x] **Step 4: `yarn info --manifest` が落とした未追跡の zip を消す**

  ```bash
  git status --porcelain .yarn/cache | head
  git status --porcelain .yarn/cache | wc -l
  git clean -n -- .yarn/cache | head
  git clean -f -- .yarn/cache
  git status --porcelain
  ```

  Expected: 掃除前は `?? .yarn/cache/<他 OS・他 CPU 用>.zip` が並ぶ（計画作成時点の目安 94 個）。`git clean -n` に出るのは `.yarn/cache/` 配下の zip だけであることを確かめてから `-f` を実行する（`.yarn/cache` 以外は消さない）。最後の `git status --porcelain` が空。消した個数を bead ノートに記録する（TS-4）。

- [x] **Step 5: manifest に値がない物を LICENSE ファイルで確かめ、`overrides.json` を作る**

  ```bash
  ZIP="$(git ls-files .yarn/cache | grep '/jsesc-npm-0\.5\.0-')"
  unzip -l "$ZIP" | grep -i -E 'licen|package\.json'
  unzip -p "$ZIP" node_modules/jsesc/LICENSE-MIT.txt | head -8
  unzip -p "$ZIP" node_modules/jsesc/package.json | grep -n -A5 -i licen
  ```

  Expected: `LICENSE-MIT.txt` が MIT の全文（`Permission is hereby granted, free of charge, ...`）で、`package.json` の `licenses` が `[{"type": "MIT", ...}]`。そうであれば:

  ```bash
  printf '%s\n' '{"jsesc@npm:0.5.0": "MIT"}' > "$WORK/overrides.json"
  ```

  Step 3 で値がない物がほかにも出た場合は、同じ方法（追跡済みの zip がなければ `node_modules/<name>/` の LICENSE 系ファイル）で確かめ、決まった物だけを `overrides.json` に `"<locator>": "<SPDX>"` で加える。決まらなかった物は加えない（表で「不明」になり、確かめきれない物の節に載せる）。SPDX でない値（`SEE LICENSE IN ...`・`UNLICENSED` 等）が出た場合は、その項目を確かめきれない物の節に載せ、表には manifest の値をそのまま書く。確かめた結果を bead ノートに記録する（TS-5）。

- [x] **Step 6: 全件表と件数を作るスクリプトを `$WORK` に置いて実行する**

  `$WORK/inventory.py` に次の内容を書く（リポジトリには置かない）:

  ```python
  #!/usr/bin/env python3
  """Build the npm part of docs/license-inventory.md from yarn info.

  Usage:
    python3 -I inventory.py <info.ndjson> <package.json> <tracked-cache.txt> <overrides.json> <out-dir>

  Writes <out-dir>/rows.tsv, <out-dir>/table.md, <out-dir>/counts.md and prints
  diagnostics. Stops with an assertion error when a check fails.
  """
  import json
  import sys
  from collections import Counter, deque
  from pathlib import Path

  info_path, pkg_path, cache_path, overrides_path, out_dir = sys.argv[1:6]
  out = Path(out_dir)
  out.mkdir(parents=True, exist_ok=True)


  def split_locator(value):
      idx = value.index("@", 1)
      return value[:idx], value[idx + 1 :]


  entries = {}
  for line in open(info_path, encoding="utf-8"):
      line = line.strip()
      if not line.startswith("{"):
          continue
      record = json.loads(line)
      entries[record["value"]] = record.get("children", {})

  pkg = json.load(open(pkg_path, encoding="utf-8"))
  runtime_names = set(pkg.get("dependencies", {}))
  dev_names = set(pkg.get("devDependencies", {}))
  tracked = [p.strip().rsplit("/", 1)[-1] for p in open(cache_path, encoding="utf-8") if p.strip().endswith(".zip")]
  overrides = json.load(open(overrides_path, encoding="utf-8"))

  workspaces = [v for v in entries if split_locator(v)[1].startswith("workspace:")]
  assert len(workspaces) == 1, workspaces
  workspace = workspaces[0]
  problems = []


  def devirtualize(locator):
      # "next@virtual:<hash>#npm:16.1.6" -> "next@npm:16.1.6"
      name, ref = split_locator(locator)
      if ref.startswith("virtual:"):
          return f"{name}@{ref.split('#', 1)[1]}"
      return locator


  def edges(value):
      targets = [devirtualize(d["locator"]) for d in entries[value].get("Dependencies", []) if d.get("locator")]
      missing = [t for t in targets if t not in entries]
      if missing:
          problems.append(f"edge target not in yarn info: {value} -> {missing}")
      return [t for t in targets if t in entries]


  def reach(seed_names):
      seeds = [
          devirtualize(d["locator"])
          for d in entries[workspace].get("Dependencies", [])
          if split_locator(d["descriptor"])[0] in seed_names
      ]
      missing = [s for s in seeds if s not in entries]
      assert not missing, f"workspace seeds not in yarn info: {missing}"
      seen = set(seeds)
      queue = deque(seeds)
      while queue:
          for nxt in edges(queue.popleft()):
              if nxt not in seen:
                  seen.add(nxt)
                  queue.append(nxt)
      return seen


  runtime = reach(runtime_names)
  dev = reach(dev_names)


  def usage_of(value):
      if value in runtime:
          return "実行時"
      if value in dev:
          return "開発時のみ"
      return ""


  rows = []
  for value, children in entries.items():
      if value == workspace:
          continue
      name, ref = split_locator(value)
      protocol = ref.split(":", 1)[0]
      version = str(children.get("Version", ""))
      slug = name.replace("/", "-")
      if protocol == "npm":
          prefix = f"{slug}-npm-{version}-"
      elif protocol == "patch":
          prefix = f"{slug}-patch-"
          if sum(1 for v in entries if v.startswith(f"{name}@patch:")) > 1:
              problems.append(f"several patch entries share {prefix}*: {value}")
      else:
          prefix = None
          problems.append(f"unknown protocol, check by hand: {value}")
      matches = [z for z in tracked if prefix and z.startswith(prefix)]
      if len(matches) > 1:
          problems.append(f"several zips match {value}: {matches}")
      usage = usage_of(value)
      if not usage and protocol == "npm":
          patched = [v for v in entries if v.startswith(f"{name}@patch:{name}@npm%3A{version}#")]
          if len(patched) == 1:
              usage = usage_of(patched[0])
              problems.append(f"patch original {value} takes the usage of {patched[0]}: {usage}")
      if not usage:
          problems.append(f"unreachable from package.json, check by hand: {value}")
      manifest = children.get("Manifest") or {}
      license_value = str(manifest.get("License") or "")
      note = ""
      if not license_value:
          if value in overrides:
              license_value = overrides[value]
              note = "（manifest に値なし、LICENSE ファイルで確認）"
          else:
              license_value = "不明"
              problems.append(f"no manifest license and no override: {value}")
      rows.append(
          {
              "locator": value,
              "name": name,
              "protocol": protocol,
              "version": version,
              "license": license_value,
              "note": note,
              "dist": "同梱" if matches else "未取得",
              "usage": usage,
              "zip": matches[0] if matches else "",
          }
      )

  # Checks that the report relies on.
  assert len(rows) == len(entries) - 1, (len(rows), len(entries))
  matched = {r["zip"] for r in rows if r["zip"]}
  unmatched = sorted(set(tracked) - matched)
  assert not unmatched, f"tracked zips without a row: {unmatched}"
  assert all(r["usage"] for r in rows), "some rows have no usage; see NOTE lines"

  with open(out / "rows.tsv", "w", encoding="utf-8") as fh:
      keys = ["locator", "name", "protocol", "version", "license", "note", "dist", "usage", "zip"]
      fh.write("\t".join(keys) + "\n")
      for r in rows:
          fh.write("\t".join(r[k] for k in keys) + "\n")

  by_license = Counter(r["license"] for r in rows)
  order = sorted(by_license, key=lambda lic: (-by_license[lic], lic))

  with open(out / "table.md", "w", encoding="utf-8") as fh:
      for lic in order:
          group = sorted(
              (r for r in rows if r["license"] == lic),
              key=lambda r: (r["name"], r["version"], r["protocol"]),
          )
          fh.write(f"### {lic}（{len(group)} 件）\n\n")
          fh.write("| パッケージ | 版 | ライセンス（manifest の値） | 区分 |\n")
          fh.write("| --- | --- | --- | --- |\n")
          for r in group:
              package = f"`{r['name']}`"
              if r["protocol"] == "patch":
                  package += "（`patch:` の項目）"
              fh.write(f"| {package} | {r['version']} | {r['license']}{r['note']} | {r['dist']}・{r['usage']} |\n")
          fh.write("\n")

  with open(out / "counts.md", "w", encoding="utf-8") as fh:
      fh.write(f"- npm 依存の項目数: {len(rows)}（`yarn info` の {len(entries)} 項目から workspace 自身を除く）\n")
      fh.write(f"- 追跡済みの `.yarn/cache` の zip: {len(tracked)} 個（すべて表のいずれかの行に対応）\n")
      for key in ("同梱", "未取得"):
          fh.write(f"- {key}: {sum(1 for r in rows if r['dist'] == key)}\n")
      for key in ("実行時", "開発時のみ"):
          fh.write(f"- {key}: {sum(1 for r in rows if r['usage'] == key)}\n")
      fh.write("\n| ライセンス | 件数 |\n| --- | --- |\n")
      for lic in order:
          fh.write(f"| {lic} | {by_license[lic]} |\n")

  print(f"entries={len(entries)} rows={len(rows)} tracked_zips={len(tracked)} matched_zips={len(matched)}")
  for lic in order:
      print(f"LICENSE {by_license[lic]:4d} {lic}")
  for p in problems:
      print("NOTE", p)
  ```

  実行する:

  ```bash
  python3 -I "$WORK/inventory.py" "$WORK/info.ndjson" package.json "$WORK/cache.txt" "$WORK/overrides.json" "$WORK/out"
  ```

  Expected（計画作成時点の値。`main` が進んでいれば実際の値を使う）:
  - `entries=969 rows=968 tracked_zips=874 matched_zips=874`
  - `LICENSE` 行の合計が 968 で、`MIT` が 794（manifest の 793 + `jsesc@0.5.0`）、ほかは Current System の内訳と同じ。`不明` の行がない
  - `NOTE patch original fsevents@npm:2.3.2 takes the usage of fsevents@patch:...: 実行時`、`resolve@npm:1.22.8`・`typescript@npm:5.9.3` も同様に `実行時`。`NOTE` はこの 3 行だけ
  - `$WORK/out/counts.md` に「同梱: 874」「未取得: 94」「実行時: 654」「開発時のみ: 314」

  `AssertionError` で止まった場合、または `unknown protocol`・`several zips match`・`several patch entries`・`unreachable`・`edge target not in yarn info` の `NOTE` が出た場合は、その項目を `yarn.lock` と `git ls-files .yarn/cache` で個別に確かめ、決め方を Step 9 の「調べ方」の「個別に確かめた項目」に書く（REQ-004）。スクリプトを直した場合は、直した内容も「調べ方」に書く。

- [x] **Step 7: 妨げになる物の候補を全件から抜き出す**

  ```bash
  awk -F'\t' 'NR>1 && $5 ~ /GPL|MPL|EPL|CC-BY/ {print $5 "\t" $1 "\t" $7 "・" $8}' "$WORK/out/rows.tsv" | sort
  awk -F'\t' 'NR>1 && $5 ~ / OR / {print $5}' "$WORK/out/rows.tsv" | sort | uniq -c
  ```

  判定（REQ-005）: GPL・AGPL・LGPL・MPL・EPL・CC-BY 系、および `AND` でそれらを含む物は妨げ。`A OR B` で許容的なライセンス（MIT・ISC・Apache-2.0・BSD 系・0BSD・CC0-1.0 等）を選べる物は妨げにしない（`MIT OR Apache-2.0`・`(MIT OR CC0-1.0)`・`(WTFPL OR MIT)`・`(AFL-2.1 OR BSD-3-Clause)`）。

  Expected（計画作成時点）: 1 つ目のコマンドの出力が次の 28 行で、選択式の物は上の 4 種だけ。
  - `LGPL-3.0-or-later` 10 行（`@img/sharp-libvips-*@1.2.4`）、`Apache-2.0 AND LGPL-3.0-or-later` 3 行、`Apache-2.0 AND LGPL-3.0-or-later AND MIT` 1 行（`@img/sharp-*@0.34.5` のうちの 4 つ）
  - `MPL-2.0` 12 行（`lightningcss@1.30.2` と `lightningcss-*@1.30.2`）
  - `CC-BY-4.0` 2 行（`caniuse-lite`）

  候補が増減した場合は、その理由（追加・削除された依存や版）を報告の「design の候補からの増減」に書く。各件の該当パッケージ@版と区分は、この出力をそのまま使う。

- [x] **Step 8: コード以外の物・npm 依存以外の第三者由来の物を調べる**

  ```bash
  git ls-files public
  git log --format='%ad %an %s' --date=short -- public | sort | sed -n '1p;$p'
  git ls-files | grep -i -E '\.(woff2?|ttf|otf|eot)$'
  git grep -n -E 'next/font|@font-face' -- src tailwind.config.js
  git grep -n -A8 'fontFamily' -- tailwind.config.js
  git grep -n -E 'https?://' -- src next.config.js tailwind.config.js public/manifest.json
  git grep -n -E 'emojiStyle|from "emoji-picker-react"' -- src
  ZIP="$(git ls-files .yarn/cache | grep '/emoji-picker-react-npm-')"
  unzip -p "$ZIP" node_modules/emoji-picker-react/dist/emoji-picker-react.cjs.development.js | grep -o -E 'https://cdn\.jsdelivr\.net/npm/[^"'"'"' ]*' | sort -u
  ls .claude/skills/gh-stack 2>/dev/null; git show "$BASE_SHA":.claude/skills/gh-stack/SKILL.md | sed -n '1,12p'
  gh api repos/github/gh-stack/license --jq '.license.spdx_id'
  head -c 200 .yarn/releases/yarn-4.4.0.cjs; echo
  gh api repos/yarnpkg/berry/license --jq '.license.spdx_id'
  git submodule status
  git config -f .gitmodules --get-regexp url
  ```

  Expected（計画作成時点）:
  - `public` は Current System の 13 ファイル。数や名前が違えば、実際の一覧に合わせ、違いを報告に書く（REQ-007）
  - フォントファイルなし、`next/font`・`@font-face` なし、`fontFamily.body` はシステムフォントの名前だけ
  - 外部 URL は GitHub の Issue 作成リンク・`forms.gle` のリンク 2 か所・SVG 名前空間だけ。素材を読む URL が見つかった場合は外から取る素材に加え、REQ-005 の基準で妨げか判断する
  - `emoji-picker-react` は `src` で使われ、`emojiStyle` の指定がない。CDN の URL に `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/`（ほかに facebook・google・twitter）がある
  - 作業ブランチに `.claude/skills/gh-stack` がない（#943 で削除済み）。`BASE_SHA` の `SKILL.md` の metadata に `github-repo: https://github.com/github/gh-stack`・`github-ref: refs/tags/v0.3.0`。上流のライセンスは `MIT`
  - Yarn 本体は先頭にライセンス表示がなく、上流（`yarnpkg/berry`）は `BSD-2-Clause`
  - サブモジュールは `.github/COMMIT_CONVENTION` だけで、URL は所有者（`P-manBrown`）のリポジトリ

  `gh api` が失敗した場合は、上流のライセンスを「確かめきれない物」に回し、何を確かめれば決まるか（上流リポジトリの LICENSE）を書く。

- [x] **Step 9: `docs/license-inventory.md` を書く**

  次の構成と文面で書く。`<...>` は Step 2〜8 で取った実際の値に置き換える（置き換え忘れは Step 11 で検出する）。決まりごと:
  - URL は必ずバッククォートで囲む（`MD034`）。リポジトリ内の相対リンク（Markdown のリンク記法）は使わない（`check-docs.sh` のリンク切れ検出と、#943 で消えるパスを避ける）。パスはバッククォートで書く
  - 影響は断定しない（「〜とされる」「〜と読める」「〜が要る可能性がある」）。法的な判断は所有者に返す（REQ-005）
  - 見出しは重複させない（`MD024`）。`### <ライセンス>（<件数> 件）` は全件表だけで使う

  ````markdown
  # ライセンスの洗い出し

  - 調べた日: <YYYY-MM-DD（JST）>
  - 基準コミット: `main` の `<BASE_SHA の 40 桁>`
  - 目的: このリポジトリに MIT などのオープンソースのライセンスを付ける前に、リポジトリが使い・配っている物の権利を洗い出し、付ける妨げになる物と、リポジトリからは確かめきれない物を所有者が判断できる形にまとめる
  - この報告は法的な最終判断ではない。各ライセンスの一般的な条件と、このリポジトリでの使われ方を整理したもの。判断が要る点は「妨げになる物」「確かめきれない物」に挙げ、所有者に返す
  - 作業ブランチはスタックの下段の変更を含むが、npm 依存・`public/`・ソースは基準コミットと同じ。違いは「第三者由来の物」に書く

  ## 要約

  - 妨げになる物: <件数> 件（LGPL-3.0-or-later を含む sharp のネイティブ部品、MPL-2.0 の lightningcss 系、CC-BY-4.0 の caniuse-lite、実行時に CDN から読む Apple の絵文字画像）
  - 確かめきれない物: <件数> 件（`public/` の画像・アイコン・ロゴの作者と出所<ほかにあれば追記>）
  <$WORK/out/counts.md の中身をそのまま貼る>

  ## 区分の見方

  npm 依存の各行には、配布の区分と用途の区分を 1 つずつ付けている。

  - 同梱: 追跡済みの `.yarn/cache` に対応する zip がある。`.yarn/cache` はリポジトリにコミットされているため、リポジトリを公開するとその依存の配布物自体を再配布することになる
  - 未取得: lockfile にはあるが、追跡済みの `.yarn/cache` にない（他 OS・他 CPU 用のオプション依存など）。リポジトリでは配らない
  - 実行時: ルートの `package.json` の `dependencies` から lockfile の依存関係を辿って届く（`devDependencies` からも届く物を含む）。ビルド後のアプリや本番のサーバーに入り得る。届くことは、ビルド結果に必ず入ることを意味しない
  - 開発時のみ: `devDependencies` からしか届かない。開発・ビルドの道具として使い、アプリには入らないと見られる

  ## 妨げになる物

  判定の基準: GPL・AGPL・LGPL・MPL・EPL・CC-BY 系のライセンス、`AND` でそれらを含む複合ライセンス、権利が npm のライセンスと別にある実行時の素材。`A OR B` で許容的なライセンスを選べる物（`MIT OR Apache-2.0`、`(MIT OR CC0-1.0)`、`(WTFPL OR MIT)`、`(AFL-2.1 OR BSD-3-Clause)`）は対象にしない。

  ### 1. LGPL-3.0-or-later を含む物（sharp のネイティブ部品）

  - 該当: <Step 7 の LGPL 系 14 行を `パッケージ@版（ライセンス、区分）` の箇条書きで全部>
  - 使われ方: `next` が画像の最適化に使う `sharp@<版>` の、OS・CPU ごとのネイティブ部品。arm64 の Linux 用（`@img/sharp-libvips-linux-arm64`、`@img/sharp-linux-arm64`）だけが `.yarn/cache` に同梱され、ほかは未取得。すべて実行時
  - MIT を付けることへの影響: LGPL-3.0 は、ライブラリを別の部品として使うだけなら、使う側のコードに LGPL を課さないとされる。このリポジトリのコードに MIT を付けることは妨げないと読める。一方、同梱している zip（libvips のバイナリを含む）をリポジトリごと公開すると、LGPL の物自体を再配布することになり、ライセンス文を添えること、対応するソースを入手できるようにすることなどの条件が付く。`Apache-2.0 AND ...` の物には Apache-2.0 の条件（ライセンス文・NOTICE の保持）も加わる。未取得の物はリポジトリでは配らない
  - 取れる対処の案:
    - `.yarn/cache` をコミットしない運用に変え、依存の配布物をリポジトリで再配布しない
    - 同梱を続ける場合は、zip 内のライセンス文を保ち、libvips のソースの入手先（上流のリリース）を第三者のライセンス表示として書く
    - 本番で画像の最適化が要らなければ、sharp を使わない構成にできるか確かめる

  ### 2. MPL-2.0（lightningcss 系）

  - 該当: <Step 7 の MPL-2.0 12 行を `パッケージ@版（区分）` の箇条書きで全部>
  - 使われ方: `@tailwindcss/postcss`（`devDependencies`）が CSS の変換に使う。`lightningcss` と arm64 の Linux 用 `lightningcss-linux-arm64-gnu` が同梱、ほかは未取得。すべて開発時のみ
  - MIT を付けることへの影響: MPL-2.0 はファイル単位のコピーレフトで、MPL のファイルを変えずに別の部品として使うだけなら、使う側のコードに MPL を課さないとされる。このリポジトリのコードに MIT を付けることは妨げないと読める。同梱して再配布する場合は、MPL のファイルを MPL のまま配り、ソースの入手方法を示す条件が付く。開発時のみの依存のため、ビルド後のアプリには入らないと見られる
  - 取れる対処の案:
    - `.yarn/cache` をコミットしない運用に変える
    - 同梱を続ける場合は、zip 内の MPL の文面を保ち、ソースの入手先（上流のリポジトリ）を第三者のライセンス表示として書く

  ### 3. CC-BY-4.0（caniuse-lite）

  - 該当: <Step 7 の CC-BY-4.0 2 行を `パッケージ@版（区分）` の箇条書きで>
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

  ### design の候補からの増減

  <増減がなければ「design の候補（LGPL を含む物・MPL-2.0・CC-BY-4.0・Apple の絵文字画像）から増減はない。」。あれば何が増減したかとその理由>

  ## 確かめきれない物

  ### 1. `public/` の画像・アイコン・ロゴの作者と出所

  - 対象: `public/favicon.ico`、`public/icons/` の PNG 9 枚、`public/logos/logo.png`、`public/logos/logo-small.png`
  - 分からないこと: 誰が作ったか、どう作ったか（自作か、生成ツールを使ったか、素材サイトの素材を使ったか）。リポジトリからは、所有者（P-manBrown）が <最初のコミット日>〜<最後のコミット日> にコミットしたことしか分からない
  - 決めるために: 所有者が、それぞれの画像の作り方と、素材やツールを使った場合はその利用条件を確かめる。自作なら MIT の対象に含められる。素材やツールの条件があれば、それを第三者のライセンス表示に書くか、画像を差し替える

  <manifest に値がなく LICENSE ファイルでも決まらなかった物があれば `### 2. ...` として、パッケージ@版・分からないこと・誰が何を確かめるかを書く。なければ「manifest に値がない npm 依存は `jsesc@0.5.0` だけで、LICENSE ファイル（`LICENSE-MIT.txt`）で MIT と確かめたため、ここには載せない。」と 1 文書く>

  ## コード以外の物・npm 依存以外の第三者由来の物

  ### `public/` のファイル

  | ファイル | 権利者 | ライセンス | 根拠 |
  | --- | --- | --- | --- |
  | `public/favicon.ico` | 不明（所有者がコミット） | 不明 | `git log`。作者・出所は「確かめきれない物」の 1 |
  <public/icons の 9 枚と public/logos の 2 枚を同じ形で 1 行ずつ>
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

  <$WORK/out/table.md の中身をそのまま貼る>

  ## 調べ方

  基準コミットのチェックアウトで、次の順に調べた。一覧を作るスクリプトはリポジトリに入れていない（一回きりの洗い出しのため）。

  1. 全件と manifest のライセンス: `yarn info -A -R --manifest --json` の出力（1 行 1 項目の JSON）から、各項目の locator・`Version`・`Manifest.License`・`Dependencies` を取った。<項目数> 項目のうち workspace 自身を除く <行数> 項目が表の行
  2. 同梱・未取得: `git ls-files .yarn/cache` の追跡済みの zip（<個数> 個）と突き合わせた。`npm:` の項目は `<ident の / を - に置換>-npm-<版>-` で始まる zip、`patch:` の項目は `<ident の / を - に置換>-patch-` で始まる zip があれば同梱。追跡済みの zip はすべていずれかの行に対応した。ディレクトリの中身では判定していない（`yarn info --manifest` が他 OS・他 CPU 用の zip を未追跡で落とすため）
  3. 実行時・開発時のみ: ルートの `package.json` の `dependencies`・`devDependencies` の名前に当たる workspace の依存から、`yarn info` の `Dependencies` の locator を辿った（`virtual:` の locator は `virtual:<hash>#` を除いた項目に読み替えた）。`dependencies` から届けば実行時、`devDependencies` からしか届かなければ開発時のみ
  4. `patch:` の元の項目: `fsevents@npm:2.3.2`・`resolve@npm:1.22.8`・`typescript@npm:5.9.3` は、依存元の記述子が `patch:` の項目に解決されるため依存の辺が来ない。それぞれを元にした `patch:` の項目（`yarn.lock` の `fsevents@patch:...`・`resolve@patch:...`・`typescript@patch:...`）と同じ用途にした。同梱の判定は元の項目・`patch:` の項目それぞれの zip で行った（`fsevents` は元の項目だけ zip があり、`patch:` の項目は未取得）
  5. 個別に確かめた項目: <Step 6 で個別に確かめた物があれば、その項目と確かめ方。なければ「上の 2〜4 で決まらない項目はなかった」>
  6. manifest に値がない物: `jsesc@0.5.0` は manifest の `license` が空（古い `licenses` 配列の形式）だったため、追跡済みの zip の中の `LICENSE-MIT.txt` と `package.json` を読み、MIT と確かめた
  7. 未追跡 zip の掃除: `yarn info --manifest` の後、`git status --porcelain .yarn/cache` で未追跡の zip（<個数> 個）を確かめ、`git clean -f -- .yarn/cache` で消した
  8. コード以外の物: `git ls-files public`、`git log -- public`、フォントファイル・`next/font`・`@font-face`・`tailwind.config.js` の `fontFamily` の検索、`src` などの外部 URL の検索（`git grep -n -E 'https?://'`）、`emoji-picker-react` の zip の中の CDN の URL、`.claude/skills/gh-stack/SKILL.md` の metadata、`.yarn/releases/` と `.gitmodules`、上流のライセンス表示（`gh api repos/<owner>/<repo>/license`）

  ```bash
  yarn info -A -R --manifest --json > info.ndjson
  git ls-files .yarn/cache > cache.txt
  git status --porcelain .yarn/cache
  git clean -f -- .yarn/cache
  git ls-files public
  git grep -n -E 'https?://' -- src next.config.js tailwind.config.js public/manifest.json
  ```
  ````

  - `table.md`・`counts.md` は加工せずに貼る（行数・件数を Step 11 で照合するため）
  - 全件表のパッケージ名は `table.md` のとおりバッククォートで囲まれている（`patch:` の項目の `<compat/...>` 等を HTML として解釈させない）

- [x] **Step 10: markdownlint を通す**

  ```bash
  yarn markdownlint-cli2 docs/license-inventory.md
  ```

  Expected: `Summary: 0 error(s)`。エラーが出たら書式だけを直して再実行する。

- [x] **Step 11: 機械的に確かめる**

  ```bash
  python3 -I -c 'import re,sys; t=re.sub(r"```.*?```", "", open(sys.argv[1]).read(), flags=re.S); t=re.sub(r"`[^`\n]*`", "", t); print([m for m in re.findall(r"<[^<>\n]+>", t)])' docs/license-inventory.md
  python3 -I -c 'import sys; t=open(sys.argv[1]).read(); s=t.split("## npm 依存の全件表",1)[1].split("## 調べ方",1)[0]; rows=[l for l in s.splitlines() if l.startswith("| `")]; print(len(rows), "rows in the full table"); print(sum("同梱・" in l for l in rows), "bundled"); print(sum("・実行時" in l for l in rows), "runtime")' docs/license-inventory.md
  awk -F'\t' 'NR>1 && $7=="同梱"' "$WORK/out/rows.tsv" | wc -l
  git ls-files .yarn/cache | wc -l
  git status --porcelain .yarn/cache
  git status --porcelain
  git diff --name-only HEAD
  git ls-files --others --exclude-standard
  ```

  Expected:
  - 1 つ目のコマンド（コードの外に残った `<...>`）の出力が `[]`。置き換え忘れがあれば Step 9 に戻る
  - 全件表の行数（`rows in the full table`）が `yarn info` の項目数 − 1（計画作成時点 968）と一致し、`bundled` が `rows.tsv` の同梱の数と `git ls-files .yarn/cache | wc -l`（874）に一致、`runtime` が `counts.md` の実行時の数（654）と一致（AC3・AC4）
  - 要約の妨げの件数・確かめきれない物の件数が、それぞれの節の `### <番号>.` の数と一致する（目で確かめる。AC2）
  - `git status --porcelain .yarn/cache` が空。`git status --porcelain` は `?? docs/license-inventory.md` だけ（AC9）
  - 目で確かめる: 妨げの 4 件それぞれに該当・使われ方・影響・対処の案があり、確かめきれない物の各件に分からないこと・誰が何を確かめるかがある（AC5・AC6）

- [x] **Step 12: コミットする（`gs commit create`、body 付き）**

  `$WORK/commit-message.txt` に書く（英語。件数は実際の値に合わせる）:

  ```text
  docs: add a license inventory of dependencies and assets

  Add docs/license-inventory.md, a one-time survey written before an open
  source license such as MIT is added to the repository. It lists every
  lockfile entry reported by yarn info with its manifest license, whether
  the repository ships it (.yarn/cache is committed), and whether the
  production dependencies reach it. It also covers the files under
  public/, fonts, assets loaded at runtime, and third-party files kept in
  the repository.

  The report flags the items whose terms attach conditions to
  redistribution (the LGPL parts of sharp, MPL-2.0 lightningcss,
  CC-BY-4.0 caniuse-lite, and the Apple emoji images loaded from a CDN)
  and the points the repository cannot answer, such as who made the
  images in public/, so the owner can decide on them before adding a
  LICENSE file. It is not a legal opinion and changes no code,
  dependencies or license fields.
  ```

  `git-spice-workflow` Skill の「コミット前に全文の日本語訳を示す」は、自律実行のため承認待ちをせず、次の日本語訳を bead ノートに記録して満たす: 「docs: 依存と素材のライセンスの洗い出しを追加する／`docs/license-inventory.md` を追加する。MIT などのオープンソースのライセンスをリポジトリに付ける前に書いた一回きりの調査。`yarn info` が返す lockfile の全項目について、manifest のライセンス、リポジトリが配っているか（`.yarn/cache` はコミット済み）、本番の依存から届くかを並べる。`public/` のファイル、フォント、実行時に読む素材、リポジトリに置いた第三者由来のファイルも扱う。／報告は、再配布に条件が付く物（sharp の LGPL の部品、MPL-2.0 の lightningcss、CC-BY-4.0 の caniuse-lite、CDN から読む Apple の絵文字画像）と、`public/` の画像の作者などリポジトリからは答えられない点を挙げ、所有者が LICENSE を付ける前に判断できるようにする。法的な意見ではなく、コード・依存・ライセンスのフィールドは変えない。」

  ```bash
  git log --oneline -5 -- docs/
  git add docs/license-inventory.md
  git-spice commit create -m "$(cat "$WORK/commit-message.txt")"
  git log -1 --format='%H%n%B'
  git-spice ls
  git status --porcelain
  ```

  Expected: 直近の `docs/` のコミットの type が `docs:`。lefthook の pre-commit（markdownlint・check-docs ほか）が通り、`docs/license-inventory` にコミットが 1 つでき、body がある。`git-spice ls` で現在のブランチが `docs/license-inventory` のまま。`git status --porcelain` が空。pre-commit が失敗したら、出力を読んで報告の書式を直し、`git add` からやり直す（`--no-verify` は使わない）。

- [x] **Step 13: 差分の範囲を確かめ、push する（PR は作らない）**

  ```bash
  git diff --name-only <TOP>...HEAD
  git diff --stat <TOP>...HEAD
  git-spice branch submit --branch docs/license-inventory --no-publish
  git rev-parse HEAD origin/docs/license-inventory
  gh pr list --head docs/license-inventory --state all --json number
  ```

  Expected: 差分は `docs/license-inventory.md` だけ（`LICENSE`・`package.json`・`.yarn/cache` の変更なし。AC9）。2 つの SHA が一致し、`gh pr list` が `[]`。pre-push の `yarn knip` が誤検知で失敗した場合は、出力の全文を bead ノートに残し、`--no-verify` で回避せず、bead を blocked にして人へ報告する（human-notice スクリプト）。

  bead ノートに、ブランチ名・`<TOP>`・`BASE_SHA`・コミット SHA・push 済み・PR 未作成を記録する。

- [x] **Step 14: PR のタイトルと本文の下書きを bead ノートに残す**

  `.github/pull_request_template.md`（作業ブランチの版）に沿い、英語で書く。件数は実際の値に置き換える。Related Documents は今のテンプレートの記法に従い、この変更に対応する plan・spec はリポジトリにないため ⬜️ と N/A にする。

  ```text
  Title: docs: add a license inventory of dependencies and assets

  ### Summary

  Add a one-time license inventory (docs/license-inventory.md, in Japanese) to prepare for adding an open source license such as MIT. It found <N> items whose terms attach conditions to redistribution: the LGPL-3.0-or-later native parts of sharp (one bundled in .yarn/cache), MPL-2.0 lightningcss packages (dev only, two bundled), CC-BY-4.0 caniuse-lite (bundled), and the Apple emoji images that emoji-picker-react loads from a CDN by default. It also found <M> item(s) the repository cannot answer: who made the images, icons and logos under public/ and how. The report is not a legal opinion; the owner decides how to handle each item.

  ### Changes

  - docs/license-inventory.md: a summary with counts per license, the items that may block an open source license with their usage, effect and options, the items that need the owner's confirmation, non-code assets and third-party files (public/, fonts, runtime assets, the copied gh-stack skill, the Yarn release), the full table of the <rows> lockfile entries reported by yarn info with their manifest license and classification (bundled in .yarn/cache or not fetched; reached from dependencies or from devDependencies only), and the method used to build it.

  ### Testing

  - The full table has one row per yarn info entry except the workspace itself (<rows> rows).
  - Every tracked zip in .yarn/cache matches a row marked as bundled (<bundled>).
  - The untracked zips that yarn info --manifest downloaded were removed; git status is clean.
  - yarn markdownlint-cli2 docs/license-inventory.md passes.

  ### Related Issues (Optional)

  Related Issues: N/A

  ### Related Documents

  - ⬜️ Plan: N/A
  - ⬜️ Spec: N/A

  ### Notes (Optional)

  No LICENSE file or package.json license field is added in this pull request.
  ```

  ```bash
  gc bd update <TASK_BEAD_ID> --append-notes "$(cat "$WORK/pr-draft.txt")"
  ```

  （上の下書きを `$WORK/pr-draft.txt` に書いてから実行する。）PR の要件（英語・テンプレートどおり・Summary に妨げと確かめきれない物の件数）はこの下書きで確かめる（AC10）。

## Non-Goals

- `LICENSE` ファイル・`package.json` の `license` フィールドの追加、ライセンスの決定
- 妨げの解消（依存の置き換え、`.yarn/cache` の扱いの変更、画像の差し替え、`emojiStyle` の変更）
- 法的な最終判断
- 一覧を作り直すスクリプト・CI の追加（Step 6 のスクリプトはシステム一時ディレクトリに置き、コミットしない）
- backend リポジトリの洗い出し
- 静的な確かめの CI、PnP の相性の試し、lefthook（同じ HQ 依頼の他の部分）
- `docs/decisions/` への記録、第三者のライセンス表示（NOTICE 等）の新設
- PR の作成（この run は `open_pr=false`）
- `docs/superpowers/plans/` への計画の複製（このレーンには作業用のワークツリーがなく、複製先がメインチェックアウトになり未追跡のファイルを残すため。計画はこのファイルを正とする）

## Validation and Acceptance

### Coverage

| ID | Status | Task / Step | Acceptance |
| --- | --- | --- | --- |
| REQ-001 | covered | Task 1 Step 2・Step 9（冒頭） | AC1 |
| REQ-002 | covered | Task 1 Step 6（counts.md）・Step 9（要約）・Step 11 | AC2 |
| REQ-003 | covered | Task 1 Step 3・Step 5・Step 6・Step 9（全件表）・Step 11 | AC3 |
| REQ-004 | covered | Task 1 Step 4・Step 6・Step 9（区分の見方・調べ方）・Step 11 | AC4 |
| REQ-005 | covered | Task 1 Step 7・Step 8・Step 9（妨げになる物） | AC5 |
| REQ-006 | covered | Task 1 Step 5・Step 8・Step 9（確かめきれない物） | AC6 |
| REQ-007 | covered | Task 1 Step 8・Step 9（コード以外の物） | AC7 |
| REQ-008 | covered | Task 1 Step 9（調べ方） | AC8 |
| REQ-009 | covered | Task 1 Step 4・Step 11・Step 13 | AC9 |
| REQ-010 | covered | Task 1 Step 10・Step 12・Step 13・Step 14 | AC10 |

### 確かめの一覧

- AC1: `docs/license-inventory.md` の冒頭に調べた日、`BASE_SHA` の 40 桁、法的な最終判断ではない旨がある
- AC2: 要約の件数が `counts.md` と一致し、妨げ・確かめきれない物の件数が各節の件数と一致する
- AC3: 全件表の行数 = `yarn info` の項目数 − 1（Step 11 の `rows in the full table`）。各行が 4 列
- AC4: 区分の列がすべて `同梱・実行時`・`同梱・開発時のみ`・`未取得・実行時`・`未取得・開発時のみ` のいずれか。同梱の数 = 追跡済み zip の数。`patch:` の元の項目 3 つの用途が対応する `patch:` の項目と同じ（Step 6 の `NOTE patch original ...`）
- AC5: 妨げの 4 件に該当パッケージ@版・使われ方・影響・対処の案がある。増減の節がある
- AC6: 確かめきれない物に `public/` の画像・アイコン・ロゴがあり、誰が何を確かめるかがある。manifest に値がない物の扱いが書かれている
- AC7: `public/` の 13 ファイル、フォント、外から取る素材、`.claude/skills/gh-stack/`、`.yarn/releases/yarn-4.4.0.cjs` に権利者・ライセンス・根拠がある
- AC8: 調べ方にコマンド、区分の決め方（`patch:` の元の項目を含む）、manifest に値がない物の確かめ方、未追跡 zip の掃除がある
- AC9: `git diff --name-only <TOP>...HEAD` が `docs/license-inventory.md` だけ。`git status --porcelain` が空
- AC10: markdownlint が 0 errors。コミットが `docs:` で body がある。bead ノートの PR の下書きが英語でテンプレートどおり、Summary に妨げと確かめきれない物の件数がある

### Risks

- `yarn info --manifest` が他 OS・他 CPU 用の zip を未追跡で落とす: Step 4 で掃除する。掃除しないと pre-push の `git status --porcelain` の確かめで push できず、PR に混ざる恐れもある
- `yarn info --manifest` の出力のキー名が想定（`Manifest.License`）と違う: Step 3 で `Manifest` の有無を数え、違えばスクリプトの 2 か所を直す
- `main` やスタックが計画作成時点から進み、件数・`<TOP>` が変わる: Step 1・Step 2 で決め直し、件数は実際に取った値を使う。期待値は目安
- スタックの下段の変更が洗い出しの入力（依存・`public/`・ソース）を変える: Step 2 で検出し、報告の冒頭に書く
- 影響の書き方が法的判断に見える: Step 9 の文面は「とされる」「と読める」で書き、冒頭で法的な最終判断ではないと断る
- 全件表が約 970 行で長い: design で受け入れた短所（案 A）
- `gh api` が使えず上流のライセンスを確かめられない: その物を確かめきれない物に回す（Step 8）
- `gs commit create` 後に HEAD が上段へ移る（未ステージの変更が残っていた場合の既知の挙動）: Step 12 で `git-spice ls` と `git status --porcelain` を確かめる

## Decision Log

- **requirements と `git-spice-workflow` Skill の食い違い（レビューへの申し送り）**: requirements・design は「他の部分とは独立。互いを待たない」とするが、Skill は「未マージのスタックがあればその最上段に積む。ドキュメントのみの変更でも `main` から切らない」と定める。REQ-010 が Skill に従うことを求めているため、この計画は Skill に従い、スタックの最上段（計画作成時点は #943）に積む。その結果、この PR のマージは下段の #942・#943 のマージの後になる。「互いを待たない」は同じ HQ 依頼の他の部分の作業を待たないことと読み、作業は待たずに進める
- PR のないローカルだけのブランチ（別ワーカーの作業中の物）は「最上段」に数えない。積むと、push されていない他人の作業に依存するため
- #943 が `.claude/skills/gh-stack/` を削除するため、作業ブランチにはこのディレクトリがない。REQ-007 は基準コミットの状態を報告の対象とし、削除予定であることを書き添える
- `public/manifest.json` は所有者が書いた設定ファイルとして、権利者を所有者とする（作者が分からない画像とは分ける）
- 確かめきれない物は種類ごとに 1 件と数える（`public/` の画像 12 ファイルで 1 件）。妨げも REQ-005 のとおりライセンスの種類（または素材）ごとに 1 件
- 全件表は、ライセンスごとに `###` の小見出しと表を分け、件数の多い順に並べる（REQ-003 の「ライセンス別にまとめて並べる」の読み方）。4 列の形は各表で同じ
- ブランチ名は `docs/license-inventory`（`<type>/<変更内容>`、type はPRタイトル想定の `docs`）
