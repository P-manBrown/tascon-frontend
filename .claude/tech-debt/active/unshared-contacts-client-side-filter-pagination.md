# 「未共有」一覧のクライアント側除外でページネーションと表示件数がずれる

- **Status:** Open
- **Priority:** Low
- **Category:** Code
- **Area:** src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/share-task-group-contact-list/index.tsx
- **Detected:** 2026-08-24
- **Todoist Task ID:** 6hjqg3xgqcJjx77H
- **Description:** タスクグループ共有画面の「未共有」一覧は、バックエンドからページ単位で取得した連絡先から、共有済みユーザーをフロント側で`filter`して除外している。バックエンドのページネーション（1ページの件数・総件数）は除外前の件数に基づく
- **Impact:** 共有済みユーザーを含むページでは表示件数が1ページの件数より少なくなり、グリッドの高さや表示件数が不揃いになる。全件が共有済みのページでは空状態が表示されつつ、ページネーション上は次のページが存在する
- **Proposed Resolution:** バックエンドの連絡先一覧APIに共有済みユーザーを除外する条件を追加し、フロント側の`filter`を削除する
- **Related:** —
