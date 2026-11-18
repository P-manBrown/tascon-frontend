# 型・Lint・未使用コード・マークアップ・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する

- **Status:** Accepted
- **Verification Status:** Unverified
- **Date:** 2026-11-19
- **Related Files:** .github/workflows/static-checks.yml, .github/actions/setup/action.yml

## Context

CIはPRタイトルの検証（`semantic-pull-request.yml`）だけで、型・Lint・未使用コード・マークアップ・ビルドの確かめはローカルのlefthookに任せていた。pre-commitはステージしたファイルだけを検査し、hookは飛ばせるため、壊れた変更がPRに入っても誰にも見えない。スタックPRのマージ手順は`mergeStateStatus`が`CLEAN`になるのを待つが、その裏づけになるCIの確かめがなかった。

まっさらなcheckout（`git archive HEAD`を展開したディレクトリ）で各コマンドを試し、次のことを確認した。

- `yarn tsc --noEmit`だけを実行すると、`public/logos/*.png`のimportが`TS2307`で失敗する。画像の型の宣言を読み込む`next-env.d.ts`はNextが生成するファイルで、gitの追跡対象外のため
- `yarn next typegen`の後なら`yarn tsc --noEmit`は成功する（`next-env.d.ts`と`.next/types/*`が生成される）
- `yarn build`（`next build`）はビルドの中で型検査も行うが、最初のエラーで止まる
- `next build`に要る環境変数は追跡対象の`.env`にあり、シークレットは要らない

## Decision

- PRごと（`pull_request`）に走るワークフロー`Static Checks`で、次の5つの確かめを別々のジョブとして並列に実行する。マージ先のブランチで絞らない（スタックPRのマージ先は`main`以外のブランチにもなる）
  - `tsc --noEmit`: `yarn next typegen`の後に`yarn tsc --noEmit`
  - `biome`: `yarn biome ci --error-on-warnings .`（pre-commitと同じく警告も失敗にする）
  - `knip`: `yarn knip`（pre-pushと同じ）
  - `markuplint`: `yarn lint-jsx`
  - `next build`: `yarn build`（本番と同じビルド手順）
- 準備手順（Node.jsの用意、`corepack enable`、`yarn install --immutable`）はローカルのcomposite action（`.github/actions/setup`）1か所にまとめる。Node.jsの版は`Dockerfile`と同じ`22.22.2`にする
- 外部のActionはタグではなく、公開から2週間以上たったリリースのコミットSHAで固定し、行末にタグをコメントで書く
- 依存のキャッシュ・`concurrency`・`push`トリガーは入れない

## Considered Options

- ジョブを分けて並列に実行し、準備手順をcomposite actionにまとめる（採用）: PRのchecks欄に確かめごとの成否が出て、1つが落ちても他は最後まで走る。Node.jsの版とsetup-nodeのSHAの置き場が1か所になる。ファイルが1つ増え、installを5回行う
- ジョブを分けて並列に実行し、準備手順を各ジョブに直接書く: 1ファイルで全部読めるが、Node.jsの版とsetup-nodeのSHAが5か所に重複し、更新時にずれやすい
- 1つのジョブで5つのステップとして直列に実行する: installが1回で済みActionsの使用時間が最小になるが、checks欄には1つしか出ず、どの確かめが落ちたかは開かないと分からない。直列のため待ち時間が長い
- `tsc --noEmit`を独立したジョブにせず`next build`の型検査に任せる: ジョブが1つ減るが、`next build`は最初のエラーで止まり、すべての型エラーを報告しない
- `tsc --noEmit`を`next build`の後に同じジョブで実行する: buildが`next-env.d.ts`を生成するので`next typegen`は要らないが、直列になり遅い。`next typegen`で型ファイルだけ生成すれば並列のまま実行できる

## Consequences

- 確かめの結果がPR上で誰にも見える形で残り、lefthookを飛ばしたコミットも検出される
- ブランチ保護のrequired status checksに登録するまでは、ジョブが失敗してもマージは止まらない
- installを5回行う分、Actionsの使用時間が増える（1回約15秒）
- `Dockerfile`のNode.jsの版を上げるときは、`.github/actions/setup/action.yml`の`node-version`も合わせる必要がある
- `next typegen`はNext 15.5以降のコマンドで、Nextの更新で挙動が変わると`tsc --noEmit`のジョブが壊れる
- GitHubのrunnerはx64で、`.yarn/cache`にないx64用のオプション依存はinstall時にnpmから取得される
- 固定したSHAは自動では更新されないため、Actionの更新は手で行う
