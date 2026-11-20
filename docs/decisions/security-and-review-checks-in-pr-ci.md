# セキュリティと変更の影響を見る道具をPRごとのCIに入れ、指摘で落ちる物だけをchecksのneedsに入れる

- **Status:** Accepted
- **Verification Status:** Unverified
- **Date:** 2026-11-20
- **Related Files:** .github/workflows/static-checks.yml, .github/workflows/codeql.yml, .github/requirements/semgrep.in, .github/requirements/semgrep.txt, .github/dependabot.yml

## Context

PRごとのCI（`Static Checks`）は型・Lint・未使用コード・マークアップ・ビルド等を確かめるが、コードの脆弱性の解析、セキュリティの規則での静的解析、PRで新しく入る依存の既知の脆弱性の確かめ、変更の影響の報告が無かった。

- 必須チェックはまとめ役のjob`checks`（と`Validate PR title`）に絞り、必須にする確かめは`checks`の`needs`に入れる。`needs`が待てるのは同じワークフローのjobだけ
- CodeQLのPRの関門は、GitHubが出すチェック「Code scanning results / CodeQL」で、PRのheadの解析とマージ先のブランチの解析を比べて新しいアラートを決める。そのためマージ先（`main`）の解析が要る
- リポジトリはpublicで、CodeQLのcode scanningとDependency Reviewは追加の契約なしで使える
- `.yarn/`（依存のzipと`releases/yarn-4.4.0.cjs`）は追跡対象で、解析の道具が自分のコードとして読むと結果が汚れる

## Decision

- PRごとのCIで次の道具を使う
  - Semgrep: `semgrep/semgrep-rules`の`typescript/react`・`typescript/lang`・`javascript/react`・`javascript/browser`・`javascript/lang`の規則（`Static Checks`のjob`semgrep`、`--error`で指摘があれば落ちる）
  - CodeQL（`javascript-typescript`、`build-mode: none`）: コードの脆弱性の解析。結果はcode scanningに上がる（ワークフロー`CodeQL`、`pull_request`と`main`への`push`）
  - Dependency Review: PRで新しく入る依存の既知の脆弱性（`Static Checks`のjob`dependency-review`、既定の設定。脆弱な依存を足すと落ちる）
- 置き場所: 指摘で落ちる物は`Static Checks`のjobにし、`checks`の`needs`に入れる。CodeQLはマージ先の解析のために`main`への`push`でも走らせる必要があり、`Static Checks`は`pull_request`だけで走るため、別のワークフローに置き、`checks`の`needs`に入れない。CodeQLの関門は「Code scanning results / CodeQL」
- 固定の仕方: Actionは公開から2週間以上たったリリースの40桁のコミットSHAと行末のタグ、Pythonの道具は`.github/requirements/`の`--hash=sha256:`付きのrequirements（`pip-compile --generate-hashes`で作り、`pip install --require-hashes`で入れる）、取り出す規則は`actions/checkout`の`ref:`のSHA。Pythonの道具はDependabot（`pip`）が更新する
- `.yarn/`は解析から外す（Semgrepは`--exclude .yarn`、CodeQLは`init`の`config:`の`paths-ignore`）

## Considered Options

- Semgrep・Dependency Reviewを`Static Checks`のjobにし、CodeQLは別のワークフローに置く（採用）: 指摘で落ちる物が`checks`で必須になり、必須チェックを`checks`に絞ったまま保てる。CodeQLは`main`の解析と比べて新しいアラートだけを関門にできる。CodeQLの関門を必須にするかは別に決める必要がある
- CodeQLも`Static Checks`のjobにして`needs`に入れる: `checks`で必須にできるが、`Static Checks`に`main`への`push`を足すか、マージ先の解析が無いまま比べることになる。解析の失敗では落ちても、アラートの有無ではjobが落ちない
- CodeQLのSARIFに結果があれば落とすjobを`Static Checks`に入れる: `checks`で必須にできるが、`main`との比較ができず、既存のアラートでもすべてのPRが落ちる
- DeepSec（vercel-labs/deepsec）: 正規表現のmatcherで候補を見つけ、AIで調べる。モデルの利用にAPIキーとその費用が要り、READMEは実行する環境で全権のshellを持つcoding agentとして扱うよう求めている。CIで使うにはsecretが要り、DependabotのPRにはActionsのsecretが渡らない
- Claude Codeの`/security-review`をCIで走らせる（`anthropics/claude-code-security-review`）: 規則に書かれていない種類の問題も指摘できるが、Anthropic APIのキーが要り、実行ごとに費用がかかる。DependabotのPRにはActionsのsecretが渡らない
- Semgrepの規則をレジストリ（`p/react`など）から取る: 設定が短いが、規則の版が固定されず、コードを変えていないPRの結果が規則の更新で変わりうる

## Consequences

- CodeQLのアラートは、人が「Code scanning results / CodeQL」を必須チェックに登録しないとPRを止めない
- Semgrepの規則は`semgrep/semgrep-rules`のライセンス（Semgrep Rules License v1.0）が規則の配布を許さないと読めるため、リポジトリに写さず、CIで取り出して使う
- Semgrepの規則のSHA（job`semgrep`の`ref:`）とActionのSHAはDependabotの対象外で、手で更新する
- 導入時のSemgrepの指摘は52か所（53件）で、`react-props-spreading`が43件、`jsx-not-internationalized`が8件、`unsafe-dynamic-method`が2件だった。いずれも挙動を変えずに、行ごとの`nosemgrep: <規則名>`と理由のコメントで外した。`unsafe-dynamic-method`の2件は、キーが`z.enum`と型の文字列リテラルの和集合に限られているため誤検知と判断した。外した行を変えるときは、外す理由がまだ正しいかを見直す
- 公開から2週間以上たった物に替えた: Semgrepは1.186.0（2026-11-18公開）を避けて1.184.0（2026-11-05公開）にし、規則は`a5ad1714`（2026-11-10）を避けて`16b9e6d4`（2026-10-21）にした。`semgrep.txt`は、同じ`.in`の形でPython 3.13の`pip-compile`が作ったバックエンドの`.txt`のうち`semgrep`の項目だけを1.184.0のハッシュに差し替えたもので、他の依存の版は変えていない。`pip install --require-hashes`で入り、`pip check`が通ることを確かめた
