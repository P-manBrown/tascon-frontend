# Design candidate: 静的な確かめを PR ごとの CI に入れる（tascon-frontend）

- root bead: tf-uvyh（superpowers-build）/ target: tf-uhcl（HQ 依頼 gc-vjh8 の 2/4）
- brainstorm bead: tf-3xdq（attempt 1, iteration 1）
- approval mode: autonomous
- approval status: **承認済み（autonomous、approval bead tf-gyg5、2026-11-19）**。自律承認の根拠は末尾「自律承認の根拠」に記録

## Superpowers checklist（1–5）の状態

1. project context inspected: 済。下の「調べた事実」に記録
2. visual questions ahead?: なし。CI ワークフローとドキュメントの変更のみで、画面や図で比べる問いがない → Visual Companion は提示しない
3. clarifying questions: 人の答えが必要な問いはない（依頼本文・リポジトリの状態・実地の試行で決まる）。判断で決めた点は「前提として置いたこと」に記録
4. approaches: 3 案を比較し推奨を決定（「方式の比較」）
5. design sections: 下記「設計」に記録

## 求められている成果（Requested outcome）

PR ごとに走る GitHub Actions の CI に、次の 5 つの静的な確かめを入れ、今夜は PR を出すところまで進める。

- `tsc --noEmit`
- Biome
- Knip
- markuplint
- `next build`

## 制約（Constraints, 依頼本文より）

- 外部の Action はコミット SHA で固定する（タグ・ブランチ指定は不可）
- 新しく作るジョブの名前を、GitHub 上で実際に表示される名前で PR 本文に一覧にする
- 決めた理由は、その道具を入れる PR の中で `docs/decisions/` に残す（テーマ: テストと確かめの道具の選び方）
- リポジトリのルール・スキルに従う（`.claude/rules/decisions-maintenance.md`、`git-spice-workflow` の PR 作成ルール: PR は英語・テンプレート使用、コミットは Conventional Commits）

## 対象外（Non-goals）

- Related Documents と英語の確かめ（backend にある PR 本文の確かめ）: 配る仕組みで入るので今夜は入れない
- 同じ依頼の他の部分（ライセンスの洗い出し、PnP の相性の試し、lefthook）: 別作業。互いを待たない
- 既存 `semantic-pull-request.yml` の `amannn/action-semantic-pull-request@v5` の SHA 固定: 依頼は「新しく入れる」確かめが対象。既存ワークフローは触らない（気づいた点として PR の Notes に書く）
- ブランチ保護の required status checks 設定: GitHub 設定の変更で人の操作。今夜は行わない
- dependabot への `github-actions` エコシステム追加（SHA 固定した Action の更新）: 依頼範囲外
- 依存のキャッシュ（`actions/cache` 等）、`concurrency`、`push: main` トリガー: 依頼範囲外。必要になったら別途
- テスト（単体・E2E）の導入: リポジトリにテストがまだない。今回は静的な確かめのみ
- lefthook の pre-commit / pre-push の変更: 別作業（lefthook 部分）

## 調べた事実（project context）

- 既存 CI は `.github/workflows/semantic-pull-request.yml`（PR タイトル検証）のみ。静的な確かめはローカルの lefthook（pre-commit: Biome / markuplint / markdownlint、pre-push: Knip）だけ
- `package.json`: `packageManager: yarn@4.4.0`、`.yarnrc.yml` は `nodeLinker: node-modules`・`yarnPath: .yarn/releases/yarn-4.4.0.cjs`・`enableGlobalCache: false`、`.yarn/cache` はコミット済み
- scripts: `build` = `ANALYZE=true next build --turbopack`、`lint-jsx` = `markuplint "src/**/*.{jsx,tsx}"`、`check` = `biome check .`。tsc・knip の script はない
- Node: `Dockerfile` が `node:22.22.2`。`.nvmrc` 等はない
- 版: next 16.1.6、biome 2.4.6、knip 6.x、markuplint（`.markuplintrc` で react-spec / jsx-parser）
- `.env` は追跡対象で、`next build` に要る値（`API_ORIGIN`・`REMOTE_PATTERN_*` 等）を持つ → CI にシークレット不要
- `next-env.d.ts` と `*.tsbuildinfo`、`.next/` は gitignore 対象
- スタック PR（git-spice）を使うので、PR のマージ先は main 以外のブランチにもなる。マージ手順は `mergeStateStatus` が `CLEAN` になるのを待つ（CI 実行中は待つ）
- 外部への網: `next/font` は未使用（ビルド時のフォント取得なし）

### 実地の試行（2026-11-18、`git archive HEAD` を一時ディレクトリに展開し、CI と同じ「まっさらな checkout」で実行）

- `yarn install --immutable`: 成功（約 13 秒）
- `yarn build`: 成功（約 14 秒）。Next の build 内でも TypeScript の検査が走る
- `yarn tsc --noEmit`: **失敗**。`next-env.d.ts`（gitignore 対象・Next が生成）がないため、`public/logos/*.png` の import が `TS2307` になる
- `yarn next typegen` の後に `yarn tsc --noEmit`: 成功（`next-env.d.ts` と `.next/types/*` が生成される）
- `yarn biome ci --error-on-warnings .`: 成功（494 files）。メインの作業ツリーでは `.claude/worktrees/*/biome.json`（入れ子のルート設定）と `.beads` の権限で失敗するが、CI の checkout には両方ないので影響しない
- `yarn knip`: 成功
- `yarn lint-jsx`（markuplint）: 成功
- 試行環境は aarch64。GitHub の `ubuntu-latest` は x64 なので、`sharp` 等の x64 用オプション依存が `.yarn/cache` になければ install 時に npm から取得する（Actions は網あり。実際の初回実行で確かめる）

## 方式の比較（Approach tradeoffs）

### 案 A: 1 ワークフロー・5 ジョブ並列、準備手順はローカル composite action に集約（推奨）

- `.github/workflows/static-checks.yml` に 5 ジョブ。各ジョブは checkout の後、`.github/actions/setup/action.yml`（setup-node・corepack・`yarn install --immutable`）を呼ぶ
- 長所: ジョブ名＝確かめの名前で PR の checks に個別表示（依頼の「ジョブ名の一覧」に素直に対応）。1 つ失敗しても他は最後まで走る。並列で待ち時間が短い。Node 版と setup-node の SHA が 1 か所
- 短所: ファイルが 1 つ増える。install を 5 回行う（1 回約 15 秒、許容範囲）

### 案 B: 1 ワークフロー・5 ジョブ並列、準備手順を各ジョブに直書き

- 長所: 抽象化なし、1 ファイルで全部読める
- 短所: Node 版と setup-node の SHA 固定が 5 か所に重複し、更新時にずれやすい

### 案 C: 1 ジョブ・5 ステップ（各ステップ `if: ${{ !cancelled() }}`）

- 長所: install 1 回で Actions の使用時間が最小
- 短所: checks に表示されるのは 1 つだけで、どの確かめが落ちたかは開かないと分からない。依頼の「新しく作るジョブの名前の一覧」が 1 行になり意図に合わない。直列で待ち時間が長い

**推奨: 案 A**。ジョブ単位の表示と並列実行が依頼に合い、固定 SHA と Node 版の置き場を 1 か所にできる。

## 設計（Recommended design）

### 1. 追加ファイル

- `.github/workflows/static-checks.yml`（新規）
- `.github/actions/setup/action.yml`（新規、composite action）
- `docs/decisions/static-checks-in-pr-ci.md`（新規、テストと確かめの道具の選び方）
- `docs/decisions/index.md`（索引に 1 行追加）

既存ファイル（`package.json`・lefthook・既存ワークフロー）は変更しない。

### 2. ワークフロー `static-checks.yml`

- `name: Static Checks`
- トリガー: `pull_request`（既定の types: opened / synchronize / reopened）。`branches` で絞らない（スタック PR は main 以外がマージ先になるため）
- `permissions: contents: read`
- 各ジョブ: `runs-on: ubuntu-latest`、steps は `actions/checkout@<SHA> # vX.Y.Z` → `./.github/actions/setup` → 確かめのコマンド
- ジョブ（`jobs.<id>.name` が GitHub 上の表示名）:

  - `typecheck` / name `tsc --noEmit`: `yarn next typegen` → `yarn tsc --noEmit`
  - `biome` / name `biome`: `yarn biome ci --error-on-warnings .`
  - `knip` / name `knip`: `yarn knip`
  - `markuplint` / name `markuplint`: `yarn lint-jsx`
  - `build` / name `next build`: `yarn build`

- 表示名は依頼の列挙と同じ文字列にし、PR 本文の一覧と確かめの対応を一目で分かるようにする。PR の checks 欄では `Static Checks / <name> (pull_request)` の形で表示される。PR 本文には、PR を出して最初の実行が始まった後に `gh pr checks` で実際の表示名を確かめて書く

### 3. composite action `.github/actions/setup/action.yml`

- `actions/setup-node@<SHA> # vX.Y.Z` で `node-version: 22.22.2`（`Dockerfile` と同じ）。`cache` は指定しない
- `corepack enable`（`Dockerfile` と同じ方法で `packageManager` の yarn 4.4.0 を使う）
- `yarn install --immutable`

### 4. SHA 固定

- `actions/checkout` と `actions/setup-node` を、公開から 2 週間以上たったリリースのコミット SHA で固定し、行末にタグをコメントで残す（`# v5.0.0` 等）
- SHA は実装時に `gh api repos/<owner>/<repo>/git/ref/tags/<tag>` 等で取得し、注釈付きタグなら指すコミットまで解決する
- 新規に `uses:` するのはこの 2 つだけ

### 5. 各確かめのコマンドの選び方

- tsc: `next-env.d.ts` が gitignore 対象のため、まっさらな checkout では画像 import の型がなく失敗する。`next typegen`（Next 15.5+）で型ファイルだけ生成してから `tsc --noEmit` を実行する（build に依存させず並列のまま保つ）
- Biome: `biome ci` は書き込みをせず、Actions 上では違反を注釈で表示する。pre-commit と同じく `--error-on-warnings` を付け、警告も失敗にする
- Knip: pre-push と同じ `yarn knip`
- markuplint: 既存 script `lint-jsx` をそのまま使う
- next build: 既存 script `build`（`ANALYZE=true next build --turbopack`）をそのまま使い、本番と同じビルド手順を確かめる。必要な環境変数は追跡対象の `.env` から読まれる

### 6. 決定記録 `docs/decisions/`

- `.claude/rules/decisions-maintenance.md` の形式（Status / Verification Status / Date / Related Files、Context / Decision / Considered Options / Consequences、日本語）
- ファイル名は `static-checks-in-pr-ci.md`（英語 kebab-case）。題はテーマ「テストと確かめの道具の選び方」に沿う
- Status: Accepted。Verification Status: CI の初回実行で 5 ジョブが通るまでは Unverified、通ったら Verified
- Related Files: `.github/workflows/static-checks.yml`、`.github/actions/setup/action.yml`
- Context: CI は PR タイトル検証のみで、静的な確かめはローカルの lefthook 任せ（pre-commit はステージしたファイルのみ、hook はスキップできる）。スタック PR のマージ前の確かめ（`git-spice-workflow`）を CI で裏づけたい
- Decision: 5 つの確かめを PR ごとの CI でジョブ単位に並列実行する。各コマンド（上の 5.）。外部 Action は SHA 固定。準備手順は composite action に集約
- Considered Options: 案 A / B / C（上の比較）。tsc を独立ジョブにせず `next build` の型検査に任せる案（build は 1 つ目のエラーで止まり、tsc の方が全件を報告する。依頼でも別に挙げられている）。tsc を build の後に同じジョブで実行する案（`next-env.d.ts` は得られるが直列になり遅い。`next typegen` で十分）
- Consequences: 確かめが PR 上で誰にも見える形で残る。lefthook を飛ばしたコミットも検出される。install を 5 回行う分、Actions の使用時間が増える。`Dockerfile` の Node 版を上げるときは composite action の `node-version` も合わせる必要がある
- `docs/decisions/index.md` に 1 行追加

### 7. コミット・PR

- ブランチ・コミット・PR は `git-spice-workflow` スキルに従う（`gs` 経由、Conventional Commits、コミットに body 必須）
- コミットの type: ワークフロー・composite action は `ci`、決定記録は `docs`。1 PR にまとめる場合、PR タイトルは `ci: ...`
- PR 本文（英語、テンプレート使用）の Changes に、新しいジョブの表示名を一覧で書く（`gh pr checks` で確かめた実際の表示名）
- Notes に、既存 `semantic-pull-request.yml` の Action が SHA 固定されていないこと、required status checks への登録は人の設定作業であることを書く

## 受け入れ基準（Acceptance criteria）

1. `.github/workflows/static-checks.yml` があり、`pull_request` で 5 ジョブ（表示名 `tsc --noEmit` / `biome` / `knip` / `markuplint` / `next build`）が並列に走る。`branches` の絞り込みがない
2. 新規の `uses:` で参照する外部 Action はすべて 40 桁のコミット SHA で固定され、タグのコメントがある
3. 出した PR 上で 5 ジョブがすべて成功する（`gh pr checks <PR>` で確認）
4. 各ジョブがわざと入れた違反で失敗することを、少なくとも 1 つの確かめでローカルまたは試しのコミットで確かめる（例: 型エラー 1 行で `tsc --noEmit` が失敗する）。試しのコミットは PR に残さない
5. `docs/decisions/` に決定記録があり、`decisions-maintenance.md` の形式に従い、`index.md` に載っている。lefthook の pre-commit（markdownlint・check-docs）が通る
6. PR 本文（英語）の Changes に、新しいジョブの実際の表示名が一覧で書かれている
7. Related Documents と英語の確かめ、lefthook、ライセンス、PnP に関わる変更が PR に含まれていない
8. 既存ファイル（`package.json`・`lefthook.yml`・`semantic-pull-request.yml`）を変更していない

## 前提として置いたこと（Assumptions）

- ジョブの表示名は依頼の列挙どおりの短い名前にする（依頼に名前の指定はない）
- Node 版は `Dockerfile` の `22.22.2` に合わせる（CI 用の版指定ファイルを新設しない）
- `next build` は既存 script `build`（`ANALYZE=true`・`--turbopack` 付き）で実行する。本番と同じ手順を確かめる方が依頼の目的に合う
- 決定記録は CI を入れる同じ PR に入れる（依頼: 「その道具を入れる PR の中で」）
- 1 PR にまとめる（変更が小さく、スタックに分ける利点がない）

## 未解決の問い（Unresolved questions）

- 人の答えが必要な問いはない
- 実装時に確かめること（問いではない）: x64 runner での `yarn install --immutable` の成否（オプション依存の取得）、5 ジョブの実際の表示名

## 自律承認の根拠（Autonomous approval basis）

- 依頼本文が、入れる確かめ 5 つ・SHA 固定・ジョブ名の一覧・決定記録の場所・対象外を明示している
- 残る選択（ジョブ構成・コマンド・Node 版）は、リポジトリの既存設定（`package.json` scripts、`Dockerfile`、lefthook の引数）と、まっさらな checkout での実地試行の結果で決まる
- 推奨案以外を選ぶ理由になる人の好み・外部制約は見つからなかった
- この候補の承認判定（verdict）は design approval lane が行う
