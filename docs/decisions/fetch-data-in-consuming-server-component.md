# サーバーのデータは値を使うコンポーネントで取得する

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-10-18
- **Related Files:** `.claude/rules/component-implementation.md`, `src/utils/api/get-task-group.ts`, `src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/task-group-share-cards/task-group-share-card/index.tsx`

## Context

タスクグループ共有解除の実装（`.claude/plans/active/task-group-share-cancellation.md`）では、共有ページの解除確認文にタスクグループ名が必要になった。名前を使うのはClient Componentの`CancelTaskGroupShareButton`である。

最初の実装では、一覧の`TaskGroupShareList`で`getTaskGroup`を取得していた。そこから`CollapsibleTaskGroupShareCards`→`TaskGroupShareCards`→`TaskGroupShareCard`→ボタンへ名前を受け渡しており、名前を使わない中間コンポーネントを3つ経由するProps Drillingが発生していた。

一方、このプロジェクトの取得関数（`src/utils/api/get-task-group.ts`等）はReactの`cache()`で包まれている。同一リクエスト内で同じ引数の呼び出しは、1回のAPIリクエストにまとめられる。共有ページでも、`page.tsx`や共有候補の一覧で既に`getTaskGroup`を呼んでいた。

Next.js App Routerの公式ドキュメントでも、複数のコンポーネントが同じデータを必要とする場合は、上位で取得してpropsで受け渡さず、必要なコンポーネントでそれぞれ取得する方針が示されている。その根拠は、`fetch`のメモ化やReactの`cache`によって重複リクエストが排除されることである。

## Decision

サーバーで取得するデータは、値を使うコンポーネントで取得する。

- 値を使うのがClient Componentなら、直近の祖先Server Componentで取得してpropsで1段だけ渡す
- 上位で取得した値を、その値を使わない中間コンポーネントを経由して渡さない。同じデータを複数のコンポーネントが使う場合も、それぞれで取得する
- 前提として、取得関数が`cache()`等で同一リクエスト内の重複を排除していること。排除されない取得関数は上位で1回取得して渡す
- 一覧取得の各要素のデータは、一覧を描画するコンポーネントから各項目へ渡してよい。項目ごとに個別取得すると、一覧とは別のリクエストになるためである
- データ取得を持たない汎用の表示コンポーネント（アバター・カード等）には、使う側からpropsで渡す

## Considered Options

- **上位で1回取得してpropsで受け渡す**
  - 長所: 取得箇所が1つにまとまる
  - 短所: 値を使わない中間コンポーネントのPropsが増え、取得元から使用箇所まで追いにくい。使用箇所を移すたびに経路上の全コンポーネントを変更する必要がある
- **値を使うコンポーネント（Client Componentなら直近のServer Component）で取得する（採用）**
  - 長所: Props Drillingがなくなり、データの依存がコンポーネント内で完結する。`cache()`によりリクエスト数は増えない
  - 短所: 取得関数が重複排除されていることが前提になる。また、子で取得すると親の`await`の後に取得が始まるため、キャッシュに無いデータを深い位置で取得すると、取得が直列に連なる（ウォーターフォール）

## Consequences

- `cache()`はサーバーでの1回の描画内でのみ有効である。server actionの応答など別の描画では、再度取得される
- `cache()`は引数が同じ値の呼び出しだけを重複排除する。たとえばURLの`id`文字列と、取得結果の数値`id`を`toString()`した文字列は、表記が異なり得る。そのため、同じデータを取得する箇所どうしでは、同じ出所の値を引数に渡す
- 深い位置で取得する場合は、上位で既に同じ引数で取得済みか（キャッシュに当たるか）を確認する。当たらない場合は、ウォーターフォールにならないか検討する
- 既存コンポーネントのうち、この方針に合わないものは`.claude/tech-debt/active/fetched-data-relayed-through-components.md`で追跡する
