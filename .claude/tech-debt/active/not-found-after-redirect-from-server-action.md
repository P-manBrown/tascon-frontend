# server actionでrevalidatePath→redirectした後に現在ページのnotFoundが表示されることがある

- **Status:** Open
- **Priority:** Medium
- **Category:** Code
- **Area:** src/app/(main)/tasks/shared-groups/[id]/_components/task-group-share-handover-notice/accept-handover.api.ts, src/app/(main)/tasks/shared-groups/[id]/_components/shared-task-group-detail/leave-task-group-share-button/leave-task-group-share.api.ts, src/components/pages/task-page/delete-task-button/
- **Detected:** 2026-08-28
- **Todoist Task ID:** 6hp4XqwgG7rRFhJH
- **Description:** 引き継ぎ承認のserver action（`accept-handover.api.ts`）は、`revalidatePath("/tasks", "layout")`の後に`redirect(...)`を呼んでいる。実機では、遷移せずに今いるページ（`/tasks/shared-groups/[id]`）のnotFoundが表示されることがあった。原因を特定する前に再現しなくなり、実装は変えずに保留した。調査で分かったことは次のとおり
  - Next.js公式ドキュメント（Server Actionsのガイド）では、`redirect`は例外を投げて処理を止めるので、遷移先が最新データを必要とするなら`revalidatePath`を`redirect`の前に置くよう推奨している。現在の順序はこの推奨どおり
  - Next.jsのソース（`action-handler.ts`、v16.1.6）では、`redirect()`が投げられた時点で、`revalidatePath`による今いるページの描き直しは中断される。代わりに遷移先URLへのGETを内部で発行し、そのRSC Payloadを返す（`createRedirectRenderResult`）。理論上は、今いるページのnotFoundが表示される理由を説明できない
  - `revalidatePath("/tasks", "layout")`は`/tasks`配下の動的セグメント（今いるページを含む）すべてを対象にする広い指定である。ドキュメントの例（特定の1ページを指定する`revalidatePath('/posts')`）とは異なり、今いるページを巻き込んでいる可能性が論点として残っている
  - クライアントの`router.push`による遷移に変えても同じ問題が起きた、とユーザーが証言している。Router Cacheを介して今いるページが巻き込まれるタイミングの問題、という仮説は確かめられていない
  - `fetchData`は`cache`オプションを指定しておらず、Next.js 15以降のデフォルトでData Cacheされない。Router Cache（Partial Rendering、共有レイアウトの再利用）はfetchのキャッシュとは別の層であり、`revalidatePath`や`router.refresh()`が必要なのはこちらのためである
  - 同じ「今いるページのデータを削除してから別ページへ移る」処理は、他の箇所では方法が揃っていない。共有解除（`leave-task-group-share.api.ts`）は引き継ぎ承認と同じ`revalidatePath`→`redirect`である。タスク削除（`delete-task-button`）はserver actionで`revalidatePath("/tasks", "layout")`を呼び、クライアントで`router.replace`する。タスクグループ削除（`delete-task-group-button`）は`revalidatePath`を呼ばずに、クライアントで`router.replace`だけを行う
- **Impact:** 承認・解除・削除の直後に、ユーザーが「見つかりません」の画面を目にすることがあり、操作が失敗したように見える。原因が未確定のため、同じ処理を新しく作るときにどの方法を選べば防げるのか判断できない
- **Proposed Resolution:** 再発したら、サーバーログ（`fetchData response data`の`logger.debug`）で、承認直後にどのURLへのGETが何を返したかを確認するところから調査を再開する。原因が分かったら、引き継ぎ承認・共有解除・タスク削除・タスクグループ削除の削除後の遷移を同じ方法に揃える
- **Related:** .claude/plans/active/task-group-share-cancellation.md
