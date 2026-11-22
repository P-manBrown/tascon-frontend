# lefthookの段は確かめに要る物で決め、SemgrepはステージしたファイルにCIと同じ版と規則で走らせる

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-11-21
- **Related Files:** lefthook.yml, .lefthook/pre-commit/semgrep.sh, .lefthook/pre-commit/semgrep-setup.sh, .devcontainer/postCreateCommand.sh

## Context

lefthookの段を、それぞれの確かめに要る物で決めることにした（人の決定）。pre-commitは変えたファイルだけで確かめられる物、pre-pushはプロジェクト全体は要るがビルド・サーバー・ブラウザ・DBは要らない物とする。lefthookで直すのは、意味を変えないと保証された直しだけとする。

これまでの形と、検討の過程で確認したこと:

- `check-docs.sh`は決定の記録・技術的負債の記録の形式と、`ARCHITECTURE.md`・`docs`配下のすべての相対リンクを確かめ、プロジェクト全体を見る。これを、文書を含むコミットのたびにpre-commitで走らせていた
- SemgrepはPRごとのCI（`static-checks.yml`のジョブ`semgrep`）だけで走り、lefthookになかった。Semgrepの規則はファイルごとに当たるため、変えたファイルだけで確かめられる
- CIのSemgrepは、版を`.github/requirements/semgrep.txt`（hash付き）で固定し、規則を`semgrep/semgrep-rules`の`actions/checkout`の`ref`（コミットのSHA）と`sparse-checkout`で取り出して使う。規則はライセンス上リポジトリに写さない（[セキュリティと変更の影響を見る道具をPRごとのCIに入れ、指摘で落ちる物だけをchecksのneedsに入れる](security-and-review-checks-in-pr-ci.md)）
- Dev Containerには`python3`（3.11）があるが、`pip`・`ensurepip`・`semgrep`がない。Debianの`python3-venv`を入れると、`python3 -m venv`でpip付きのvenvを作れる
- CIのPython 3.13向けに作った`semgrep.txt`は、Dev ContainerのPython 3.11にも`pip install --require-hashes`で入った
- venvは作った場所の絶対パスを中のスクリプトに持つため、別の場所で作ってから移せない
- markuplintは[手元のgitフックは意味を変えない自動修正と速い検査に限り、CIは検査だけを行う](local-hooks-vs-ci-checks.md)で既に検査だけにしている
- tascon-backendは同じ決まりに合わせて、`check-docs.sh`を`.lefthook/pre-commit/`に置いたままpre-pushへ移した

## Decision

- `check-docs.sh`はpre-pushで、pushするファイルに文書（`ARCHITECTURE.md`・`docs`配下のMarkdown）が含まれるときだけ走らせる。スクリプトの置き場所（`.lefthook/pre-commit/`）とglobは変えない
- Semgrepはpre-commitで、ステージしたJS・TSのファイル（`.yarn`配下を除く）だけに`--metrics=off --error`で走らせる。指摘があればコミットを止め、直さない（`--autofix`も`stage_fixed`も使わない）
- 手元のSemgrepの版と規則はCIと同じ所から取る。版は`semgrep.txt`から、規則のSHAと取り出すディレクトリは`static-checks.yml`のジョブ`semgrep`の規則の`actions/checkout`の段から読み、スクリプトには書かない
- Semgrepのvenvと規則はリポジトリの外のキャッシュ（`${XDG_CACHE_HOME:-$HOME/.cache}/tascon-frontend/semgrep/`）に置き、`semgrep.txt`、または規則のSHA・ディレクトリが変わったときだけ作り直す。venvはその場で作り、出来上がった後に印を書く
- Dev Containerの作成時に`python3-venv`を入れてキャッシュを用意する。用意がない・古いときは、pre-commitの最初の実行で用意する。用意に失敗したときは理由を出してコミットを止める
- markuplintは引き続き検査だけを行う
- CIのジョブ`check-docs`・`semgrep`は変えず、リポジトリ全体を確かめ続ける

## Considered Options

- `check-docs.sh`の`jobs`をpre-pushへ移し、置き場所とglobを変えない（採用）: CI・Claudeのフック・決定の記録・過去の計画が指すパスが古くならず、backendと同じ形になる。ディレクトリ名（`pre-commit/`）と走る段がずれる。文書以外のファイルの削除でリンクが切れるpushでは走らない
- `check-docs.sh`を`.lefthook/pre-push/`へ移す: 置き場所と段がそろう一方、`static-checks.yml`と`.claude/hooks/check-docs-hook.sh`を変える必要があり、決定の記録と過去の計画のパスが古くなる。backendと形が分かれる
- `check-docs.sh`のglobを外し、すべてのpushで走らせる: 文書以外の変更によるリンク切れもpushの前に見つかる一方、backendと形が分かれ、CIが同じ物を全体で確かめている
- Dev Containerの作成時に`python3-venv`を入れ、用意スクリプトがvenvと規則をキャッシュに用意する（採用）: pipはDebianの署名付きパッケージから来て、版の固定を自分で持たない。worktreeの間でキャッシュを共有できる。Dev Containerの作成が`apt-get`の分遅くなり、作り直すまでは同じ手順を手で1回走らせる必要がある
- フックのスクリプトがpipのwheelを固定のhashで取り、`--without-pip`のvenvに入れる: `sudo`・`apt-get`・作り直しが要らない一方、pipの版とhashを手で保守する所が増え、Dependabotも更新しない
- `Dockerfile`に`python3-venv`とSemgrepを焼き込む: コンテナを作るたびに用意済みになる一方、composeのappイメージに開発だけの道具が混ざり、配布できない規則をイメージに入れることになる。版の更新のたびにイメージの作り直しが要る
- 規則のSHAと取り出すディレクトリを`static-checks.yml`から読む（採用）: SHAと規則の一覧がCIの1か所だけにあり、手で更新しても手元が追う。手元のスクリプトがCIのワークフローの形に依存する
- 用意スクリプトにSHAとディレクトリを書く: スクリプトが単純な一方、片方だけ更新されると手元とCIで結果が分かれる

## Consequences

- 文書を含まないコミット・pushでは`check-docs.sh`が走らない。文書以外のファイルの削除でリンクが切れても、pushの前には気づかず、CIのジョブ`check-docs`で気づく
- `check-docs.sh`の置き場所のディレクトリ名（`pre-commit/`）と走る段（pre-push）がずれる
- JS・TSを含むコミットは、Semgrepの分（数秒）遅くなる。キャッシュがない最初のコミットは、venvの作成と規則の取り出しで、さらに時間とネットワークが要る
- ネットワークがなくキャッシュが古いと、JS・TSを含むコミットが止まる。`--no-verify`で飛ばしても、CIのジョブ`semgrep`が確かめる
- `static-checks.yml`のジョブ`semgrep`の規則の段の形が変わると、手元の用意が理由を出して失敗し、`semgrep-setup.sh`の読み方を直す必要がある
- `semgrep.txt`を更新したとき、Python 3.11向けのwheelがない依存があると、手元の用意が失敗する
- Dev Containerの作成が`apt-get`の分（数十秒）遅くなる
- [型・Lint・未使用コード・マークアップ・Markdown・ドキュメント・テスト・ビルドの確かめはPRごとのCIでジョブを分けて並列に実行する](static-checks-in-pr-ci.md)のContextにある「lefthookのpre-commitで中身を確かめている…`check-docs.sh`」の記述と、`docs/design/plans/`の過去の計画は、その時点の事実として`check-docs.sh`をpre-commitと書いたまま残る（本文は書き換えない）
