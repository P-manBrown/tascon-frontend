# 型・Lint・未使用コード・マークアップ・Markdown・ドキュメント・テスト・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する

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

ブランチ保護のrequired status checksはジョブ（check run）ごとに登録する。確かめのジョブを1つずつ登録すると、確かめを足すたびに登録し直す必要があり、登録を忘れたジョブは失敗してもマージを止めない。GitHub Actionsの`needs`が待てるのは同じワークフローのジョブだけである。

`package.json`の`build`スクリプトは`ANALYZE=true next build --turbopack`である。Turbopackのビルドでは`ANALYZE=true`でも`@next/bundle-analyzer`は解析のレポートを作らず、「The Next Bundle Analyzer is not compatible with Turbopack builds, no report will be generated.」という警告だけを出す。`ANALYZE`は`build`スクリプトの中で付くため、ワークフローの`env`では上書きできない。

lefthookのpre-commitで中身を確かめているmarkdownlint・check-logger-trace・`check-docs.sh`はCIになく、hookを飛ばした変更がPRに入っても見えなかった。この3つをCIのジョブにする時点で、リポジトリ全体に対して次のことを確認した。

- `yarn markdownlint-cli2 '**/*.md'`は`.markdownlint-cli2.jsonc`の`gitignore`・`ignores`で`node_modules`と`.github`配下を除いて動き、リポジトリ全体でエラー0件で成功する
- `src`配下の`*.js`・`*.jsx`・`*.ts`・`*.tsx`に`logger.trace`は0件
- `bash .lefthook/pre-commit/check-docs.sh`はリポジトリ全体（`ARCHITECTURE.md`と`docs`配下）を見て成功し、依存のinstallが要らない（`ubuntu-latest`にあるGNUの`grep -P`と`date -d`を使う）
- まとめ役の`checks`が`needs`で待てるのは同じワークフローのジョブだけのため、テストのジョブも静的な確かめと同じワークフロー（`Static Checks`）に置く

## Decision

- PRごと（`pull_request`）に走るワークフロー`Static Checks`で、次の9つの確かめを別々のジョブとして並列に実行する。マージ先のブランチで絞らない（スタックPRのマージ先は`main`以外のブランチにもなる）
  - `tsc --noEmit`: `yarn next typegen`の後に`yarn tsc --noEmit`
  - `biome`: `yarn biome ci --error-on-warnings .`（pre-commitと同じく警告も失敗にする）
  - `knip`: `yarn knip`（pre-pushと同じ）
  - `markuplint`: `yarn lint-jsx`
  - `next build`: `yarn next build --turbopack`（`build`スクリプトから`ANALYZE=true`を除いたビルド手順。バンドルの解析をしない）
  - `markdownlint`: `yarn markdownlint-cli2 '**/*.md'`（リポジトリ全体。対象の除外は`.markdownlint-cli2.jsonc`の`gitignore`・`ignores`に従う）
  - `check-logger-trace`: `src`配下の`*.js`・`*.jsx`・`*.ts`・`*.tsx`を`grep -rnF 'logger.trace'`で探し、見つかれば該当の`ファイル:行`を出して失敗する。`grep`自体のエラーも失敗にする
  - `check-docs.sh`: `bash .lefthook/pre-commit/check-docs.sh`
  - `vitest`: `yarn vitest run --coverage`（Vitestのテスト全体とV8のカバレッジ。カバレッジは出力の表で見るだけで、しきい値は付けない）
- 確かめのジョブの後に、まとめ役のジョブ`checks`を置く。`checks`は`needs`で同じワークフローの確かめのジョブをすべて待ち、`if: always()`で前のジョブが落ちても必ず走る。`toJSON(needs)`を`jq`で読んで各ジョブの`<ジョブのid>=<結果>`を表示し、結果が`success`でないジョブ（`failure`・`cancelled`・`skipped`）が1つでもあれば失敗する。判定の式にジョブ名を並べず、`needs`全体を見る
- ブランチ保護のrequired status checksに登録するのは`checks`（と`Validate PR title`）だけにする。確かめを足すたびに必須のチェックを登録し直さなくて済み、登録を忘れても関門から漏れないため
- 必須にする確かめはこのワークフロー（`static-checks.yml`）1つに置く。`needs`が待てるのは同じワークフローのジョブだけのため
- 準備手順（Node.jsの用意、`corepack enable`、`yarn install --immutable`）はローカルのcomposite action（`.github/actions/setup`）1か所にまとめる。Node.jsの版は`Dockerfile`と同じ`22.22.2`にする
- `check-logger-trace`と`check-docs.sh`は依存のinstallが要らないため、checkoutだけで走らせる（composite actionを使わない）
- 外部のActionはタグではなく、公開から2週間以上たったリリースのコミットSHAで固定し、行末にタグをコメントで書く
- 依存のキャッシュ・`concurrency`・`push`トリガーは入れない

## Considered Options

- ジョブを分けて並列に実行し、準備手順をcomposite actionにまとめる（採用）: PRのchecks欄に確かめごとの成否が出て、1つが落ちても他は最後まで走る。Node.jsの版とsetup-nodeのSHAの置き場が1か所になる。ファイルが1つ増え、installを6回行う
- ジョブを分けて並列に実行し、準備手順を各ジョブに直接書く: 1ファイルで全部読めるが、Node.jsの版とsetup-nodeのSHAが7か所に重複し、更新時にずれやすい
- 1つのジョブで5つのステップとして直列に実行する: installが1回で済みActionsの使用時間が最小になるが、checks欄には1つしか出ず、どの確かめが落ちたかは開かないと分からない。直列のため待ち時間が長い
- `tsc --noEmit`を独立したジョブにせず`next build`の型検査に任せる: ジョブが1つ減るが、`next build`は最初のエラーで止まり、すべての型エラーを報告しない
- `tsc --noEmit`を`next build`の後に同じジョブで実行する: buildが`next-env.d.ts`を生成するので`next typegen`は要らないが、直列になり遅い。`next typegen`で型ファイルだけ生成すれば並列のまま実行できる
- まとめ役`checks`だけを必須のチェックに登録する（採用）: 確かめを足すときに変えるのはワークフローの`needs`だけで、リポジトリの設定を触らない。`needs`に足し忘れたジョブは関門に入らない
- 各ジョブを必須のチェックに個別に登録する: まとめ役のジョブが要らないが、確かめを足すたびにリポジトリの設定で登録し直す必要があり、登録を忘れたジョブは失敗してもマージを止めない
- `checks`の判定で`toJSON(needs)`全体を`jq`で見る（採用）: `needs`に足したジョブが自動で判定の対象になり、各ジョブの結果を1行ずつ表示できる。`jq`の式を読む必要がある
- `checks`の判定でジョブごとに`needs.<id>.result`を`env`で受けてシェルで比べる: 式は単純だが、ジョブを足すたびに`needs`・`env`・比較の3か所を変える必要があり、比較を書き忘れたジョブの失敗は関門を素通りする
- `checks`の判定でステップの`if`に`contains(needs.*.result, 'failure')`等を並べる: シェルなしで書けるが、失敗とみなす値を列挙するため「`success`以外は失敗」にならず、どのジョブが何の結果だったかがログに出ない
- `next build`のジョブでワークフローから`yarn next build --turbopack`を直接実行する（採用）: CIのジョブだけを変え、手元の`yarn build`の挙動は変わらない。ビルドの指定が`package.json`とワークフローの2か所になる
- `package.json`の`build`から`ANALYZE=true`を外し、解析用のスクリプトを分ける: CIは`yarn build`のままで手順が1か所になるが、手元の`yarn build`の挙動が変わる。Turbopackでは解析のレポートが作られないため、解析用のスクリプトの中身という別の判断も要る
- ワークフローの`env`で`ANALYZE=false`を渡す: `build`スクリプトの中の`ANALYZE=true`が優先されるため効かない
- installが要るmarkdownlintだけがcomposite actionを使い、`check-logger-trace`と`check-docs.sh`はcheckoutだけで走らせる（採用）: 使わない依存のinstall（1回約15秒）を2回減らせる。ジョブごとに準備の手順が違う
- 3つとも既存のジョブと同じくcomposite actionを使う: 全ジョブの形がそろうが、使わない依存のinstallに時間を使う

## Consequences

- 確かめの結果がPR上で誰にも見える形で残り、lefthookを飛ばしたコミットも検出される
- ブランチ保護のrequired status checksに`checks`を登録するまでは、確かめのジョブが失敗してもマージは止まらない
- 確かめのジョブを足すときは、`checks`の`needs`にも足す必要がある。足さないとそのジョブは関門に入らない
- ワークフローが途中で取り消されると`checks`は成功しないため、必須のチェックは通らない
- installを7回行う分、Actionsの使用時間が増える（1回約15秒。`check-logger-trace`と`check-docs.sh`のジョブはinstallしない）
- `Dockerfile`のNode.jsの版を上げるときは、`.github/actions/setup/action.yml`の`node-version`も合わせる必要がある
- `next typegen`はNext 15.5以降のコマンドで、Nextの更新で挙動が変わると`tsc --noEmit`のジョブが壊れる
- GitHubのrunnerはx64で、`.yarn/cache`にないx64用のオプション依存はinstall時にnpmから取得される
- 固定したSHAは自動では更新されないため、Actionの更新は手で行う
- `build`スクリプトのビルドの指定（`--turbopack`等）を変えるときは、`static-checks.yml`の`next build`のジョブも合わせる必要がある
- lefthookの`check-logger-trace`の対象・パターンを変えるときは、`static-checks.yml`の同名のジョブも合わせる必要がある（markdownlintと`check-docs.sh`は実体を共有するが、この確かめだけは2か所に書かれている）
- lefthookで中身を確かめる物（biome・markuplint・markdownlint・check-logger-trace・`check-docs.sh`・knip・tsc）はすべてCIでも走る。手元だけに残るのは、手元の状態を見るprotect-branch・check-git-cleanになる
- 手元のフックとCIの役割分担は[手元のgitフックは意味を変えない自動修正と速い検査に限り、CIは検査だけを行う](local-hooks-vs-ci-checks.md)に従う。この記録は、CIで走らせる確かめの構成を決める
- カバレッジ・変異スコアにはしきい値を付けないため、数値が下がってもジョブは落ちない。落ちるのはテストの失敗・道具の故障のときだけ
