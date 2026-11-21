# 依存のzipはリポジトリに入れず、CIではsetup-nodeのyarnキャッシュを使う

- **Status:** Accepted
- **Verification Status:** Unverified
- **Date:** 2026-11-21
- **Related Files:** .yarnrc.yml, .gitignore, .github/actions/setup/action.yml

## Context

Yarn 4の依存のzip（`.yarn/cache`、874ファイル・約211MB）をgitで追跡していた。全依存のzipを含むが、ネイティブ依存のzip（8ファイル）はaarch64用だけで、x64のGitHubのrunnerはx64用のネイティブ依存（オプション依存）をinstallのたびにnpmから取得していた。依存を更新するたびにzipの差分がコミットに入り、cloneも重い。

[PRごとのCIの決定](static-checks-in-pr-ci.md)では、5つのジョブがそれぞれ`yarn install --immutable`を実行するが、依存のキャッシュは入れなかった。`actions/setup-node`（v7.1.0）の`cache: yarn`は、キャッシュの場所を`yarn config get cacheFolder`で得る。`.yarnrc.yml`の`enableGlobalCache: false`のもとでは、それがリポジトリ内の`.yarn/cache`になり、キャッシュしてもcheckout済みのzipを重ねて保存・復元するだけになる。`.yarn/cache`の有無と`enableGlobalCache`の値は、setup-nodeがrestore-keys（キーの前方一致による古いキャッシュの利用）を使うかどうかだけを変え、キャッシュの保存・復元自体はどちらでも行う。

この決定で、zipをリポジトリから外し、PRごとのCIの決定で入れなかった依存のキャッシュを入れる。PRごとのCIの決定のほかの部分（ジョブの分け方・composite action・SHAの固定）は変えない。

## Decision

- `.yarn/cache`をgitの追跡から外す（`git rm -r --cached`。履歴は書き換えない）
- `.gitignore`から`!.yarn/cache`を消し、`.yarn/cache`を無視対象にする。`.yarn/`のほかの例外（`patches`・`plugins`・`releases`・`sdks`・`versions`）は残す
- `.yarnrc.yml`から`enableGlobalCache: false`を消し、Yarnの既定（`true`）に戻す。依存のzipはグローバルのキャッシュ（`~/.yarn/berry/cache`）に置く。`compressionLevel`などほかの設定は変えないため、`yarn.lock`は変わらない
- CIの準備手順（`.github/actions/setup/action.yml`）のsetup-nodeに`cache: yarn`を足す。鍵はルートの`yarn.lock`（`cache-dependency-path`は指定しない）

## Considered Options

- 1本のPRで、追跡の解除・設定2行の削除・`cache: yarn`をまとめて入れる（採用）: キャッシュが効く前提（`.yarn/cache`がない・`enableGlobalCache`が既定）と`cache: yarn`が同時にそろい、CIが毎回npmから依存を取得する状態や、`cache: yarn`が意味を持たない状態がmainに生じない。1本のPRの差分に874ファイルの削除が入り、レビューの画面が重い（追跡の解除だけのコミットを分けて読みやすくする）
- 追跡の解除と`cache: yarn`を別のPRに分ける: 各PRが小さく役割が1つになるが、間の状態ではCIが毎回npmから依存を取得する
- setup-nodeの`cache: yarn`ではなく`actions/cache`で`~/.yarn/berry/cache`を直接キャッシュする: 鍵と場所を細かく決められるが、外部のActionとSHAの固定が1つ増え、キャッシュの場所を手で書くためYarnの設定とずれ得る。setup-nodeは同じことを`yarn config get cacheFolder`で自動で行う
- zipをリポジトリに残す（これまでの状態）: オフラインでのinstall（Zero-Install）ができるが、リポジトリが重いまま依存の更新のたびにzipの差分が入り、CIで依存のキャッシュを効かせられない

## Consequences

- cloneとfetchが軽くなり、依存の更新のコミットにzipの差分が入らなくなる
- オフラインでのinstall・Zero-Installはできなくなる。installにはnpmのレジストリへの接続が要る
- devcontainerでは`~/.yarn/berry`がvolumeにないため、コンテナを作り直すと最初のinstallで依存を取得し直す
- 同じコンテナのworktree間では`~/.yarn/berry/cache`を共有する
- 追跡を外すコミットをpull・checkoutした取り出しでは、gitがそれまで追跡していたzipを作業ツリーから消す。残るのは、もともと追跡していなかったzip（他のアーキテクチャ用など）と、`git rm --cached`を実行した取り出しのzipで、どちらも無視対象になり、手で消してよい
- CIのキャッシュはPRごとで、同じPRの2回目以降の実行（再実行・追加のpush）でだけrestoreされ、`yarn.lock`が変わると作り直される。新しいPRの1回目の実行はnpmから取得する。PRをまたいで効かせるにはmainで走るトリガー（`push`など）が要るが、この決定の範囲外とする
- 1回目の実行では5つのジョブが同じ鍵で保存しようとするため、後に終わったジョブは保存できない。失敗ではない
- setup-nodeは`corepack enable`の前にキャッシュの場所を調べるため、runnerの`yarn`が`.yarnrc.yml`の`yarnPath`を読んで4.4.0として動くことを前提にしている。キャッシュの場所が想定と違えば、`corepack enable`をsetup-nodeの前に移すなどを検討する
