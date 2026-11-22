# Yarnのリンカーはnode-modulesのままにし、PnPに切り替えない

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-11-20
- **Related Files:** .yarnrc.yml

## Context

`.yarnrc.yml`は`nodeLinker: node-modules`で、Yarnは4.4.0を使っている。テストの道具（Vitest・Playwright・Stryker）を入れる前に、PnP（`nodeLinker: pnp`）に戻しても道具が動くかを、本体の設定を変えない使い捨ての取り出しで試した（`docs/yarn-pnp-test-tools-trial.md`）。

- node-modules（Yarn 4.4.0）では、`yarn build`（Turbopack）・Vitest（jsdomの描画テストと`vitest related`を含む）・Playwright・Strykerの4つとも回避策なしで通った
- PnPでは、Turbopackの`next build`がパッケージを解決できず失敗した。Yarnを4.18.1に上げて`next build --webpack`にすると通った。Turbopackのままでは4.18.1でも通らなかった
- PnPでは、Yarn 4.4.0のままだとjsdomを使う描画テストが`ERR_REQUIRE_ESM`で落ちた。Yarn 4.18.1で通った
- PnPでは、Strykerの設定に`"plugins": ["@stryker-mutator/vitest-runner"]`を明示する必要があった
- Vitestは起動時にPnPとViteの組み合わせを推奨しないと警告し、PnPの不具合を積極的には直さないとしている
- Biome・Knip・markuplint・lefthook・エディタのSDKのPnPでの動作は確かめていない

## Decision

- `nodeLinker: node-modules`を続ける。Yarnは4.4.0のままにする
- テストの道具は、PnPのための回避策（Yarnの版上げ・`--webpack`・Strykerの`plugins`の明示）を入れずに導入する

## Considered Options

- node-modulesのままにする（採用）: 4つの道具が回避策なしで動き、Turbopackのビルドを続けられる。Yarn・ビルドの設定を変えない。PnPの利点（厳密な依存の解決・installの速さ）は得られない
- PnPに切り替え、Yarn 4.18.1・`next build --webpack`・Strykerの`plugins`の回避策を入れる: PnPの利点が得られる一方、Turbopackのビルドを捨てることになり、VitestがPnPを推奨していない。Biome・Knip等のPnPでの動作は未確認のまま
- 決めずに後回しにする: 判断の材料はそろっており、`.yarnrc.yml`の一時的なコメントが残り続ける

## Consequences

- 依存は`node_modules`に展開される。宣言していない依存をimportしても、PnPのようには止まらない
- 次のいずれかが起きたら、PnPへの切り替えを見直す
  - TurbopackのビルドがPnPで通るようになる
  - VitestがPnPを推奨する・不具合を直す方針に戻る
  - Biome・Knip・markuplint・lefthookなど使っている道具がPnPで動くことを確かめられる
