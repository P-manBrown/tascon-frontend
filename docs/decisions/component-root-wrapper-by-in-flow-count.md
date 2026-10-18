# コンポーネントの外側要素は通常フローに出るトップレベル要素の数で決める

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-10-18
- **Related Files:** `.claude/rules/component-implementation.md`, `src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/task-group-share-card/index.tsx`, `src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/task-group-share-card/cancel-task-group-share-button/index.tsx`, `src/app/(main)/tasks/shared-groups/[id]/_components/shared-task-group-detail/leave-task-group-share-button/index.tsx`

## Context

旧ルールは「一要素として完結するコンポーネント→フラグメントでなく`div`等でくくる」だった。`div`でくくる目的は、コンポーネントを1つのまとまりにして親コンポーネントでレイアウトしやすくすることにある。

しかし「一要素として完結する」の範囲が曖昧だった。タスクグループ共有解除の実装（`.claude/plans/active/task-group-share-cancellation.md`）では、レビュー指摘を受けてボタン＋確認モーダル構成の`CancelTaskGroupShareButton`を`div`でくくった。その結果、共有カードで「引き継ぎ依頼」と「共有解除」のボタンが横並びにならず、「共有解除」ボタンが文字幅に縮んだ。

- `.btn`は`w-full`を含む。フラグメントのままなら、Buttonが親のflex/gridアイテムとして親の幅に従う
- `div`でくくると`div`自体がflexアイテムになり、内容幅に縮む。その中の`w-full`のButtonも同じ幅に縮む

ボタン＋確認モーダル構成の既存コンポーネントは、1件を除き、すべてフラグメントで実装されていた。

次に「初期状態で表示されるUIが1つならフラグメント」という基準を検討した。ただしこの基準は、操作後に通常フローへ要素が現れるパターンを判定できない。たとえば失敗時にボタンの下へ出るエラー文や、展開されるパネルがそれにあたる。そうした要素が現れた時点で、親のflex/gridアイテムが2つに増えてレイアウトが崩れる。

## Decision

コンポーネントが返すトップレベル要素のうち、どの状態でも通常フローに配置されるものの数で外側要素を決める。

- 0〜1個→フラグメントのまま、または要素を直接返す。ラッパーを足さない
- 2個以上になり得る→`div`等でくくる
- 通常フローに出ないもの（`showModal()`で開く`<dialog>`、`createPortal`、`position: fixed`/`absolute`、`display: none`、`null`を返すコンポーネント）は数えない。テキストノードは数える
- 親のレイアウトへ複数要素を差し込む設計のコンポーネント（`<li>`群、`<tr>`、グリッドセル群等）は例外とし、意図してフラグメントにする
- `children`等で数が変わる場合は、そのコンポーネントが親に対して何要素として振る舞う設計かで決める

この基準は、親コンポーネントを見なくても判断できる。必要なのは、そのコンポーネント自身と、描画する子コンポーネントの実装だけである。

## Considered Options

- **一要素として完結するコンポーネントは`div`でくくる（旧ルール）**
  - 長所: 単純
  - 短所: 「一要素」の範囲が曖昧。ボタン＋モーダルのように実質1要素のものまでくくり、レイアウトを壊す
- **初期状態で表示されるUIが1つならフラグメント**
  - 長所: コンポーネント単体で判断できる
  - 短所: 操作後に通常フローへ要素が現れるパターンを取りこぼす
- **常に`div`でくくる**
  - 長所: 判断が不要
  - 短所: ラッパーは中立ではない。幅の基準（`w-full`等）やflex/gridアイテムの単位が変わる。`<ul>`直下は`<li>`、`<p>`内に`div`は不可、といったHTMLの構造制約にも抵触し得る
- **通常フローに出るトップレベル要素の数で決める（採用）**
  - 長所: 状態変化も含めて判定できる。コンポーネントと子の実装から確定できる
  - 短所: 子コンポーネントの出力（例: `Modal`が`<dialog>`をトップレイヤーに出すこと）を知っている必要がある

## Consequences

- ボタン＋確認モーダル構成のコンポーネントはフラグメントで実装する
- フラグメントの場合でも、閉じた`<dialog>`は兄弟要素として存在する。そのため親が兄弟セレクタに依存するスタイル（`space-x-*`/`space-y-*`、`divide-*`、`first:`/`last:`/`nth-*`）を使うと、マウントの有無で余白が変わり得る。親の間隔は`gap`で取る
- 既存コンポーネントのうち、この基準に合わないものは`.claude/tech-debt/active/component-root-wrapper-criterion-mismatch.md`で追跡する
