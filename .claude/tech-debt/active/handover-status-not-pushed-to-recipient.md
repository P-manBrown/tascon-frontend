# 引き継ぎ依頼の状態変化が相手側の画面にリアルタイムで反映されない

- **Status:** Open
- **Priority:** Low
- **Category:** Architecture
- **Area:** src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/task-group-share-card/, src/app/(main)/tasks/shared-groups/[id]/_components/task-group-share-handover-notice/, src/app/(main)/tasks/_components/tasks-sidebar-content/shared-task-group-menu/shared-task-group-nav-links/
- **Detected:** 2026-08-24
- **Todoist Task ID:** 6hjqg3qm8R65r64H
- **Description:** 引き継ぎの依頼・キャンセル・承認・拒否後のキャッシュ更新は`revalidatePath`のみで行っており、操作した本人のブラウザにしか反映されない。相手側のサイドバーバッジや依頼通知は、相手が次にページ遷移・リロードするまで更新されない
- **Impact:** 依頼を受けた側が依頼に気付くのが遅れる。また、依頼がキャンセルされた後も、相手の画面には承認・拒否の操作が残り続ける
- **Proposed Resolution:** ポーリングやバックエンドのAction Cable等によるリアルタイム通知の導入を検討する
- **Related:** —
