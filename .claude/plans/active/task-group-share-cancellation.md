# タスクグループ共有の解除（オーナー側・共有相手側の共有解除）

Worktree: /home/node/tascon-frontend/.claude/worktrees/agent-afad560b446293ddb

## Context/Purpose

- Todoist: 親タスク「タスクグループ共有 解除（フロントエンド）」（6hF9FV6qj8HpRHXF）、子タスク「作業する」（6hhR7h8wF8jHXwQm）
- 目的: 一度共有したタスクグループの共有を、オーナー側・共有相手側のどちらからも「共有解除」できるようにする（共有相手側の解除はAPI上は離脱＝自分の共有レコード削除）。メモリ`project_task_group_unshare_button_todo`（引き継ぎ機能完成後に別プランとして着手予定）に対応するplan
- 引き継ぎ機能（依頼・キャンセル・承認・拒否）はフロントエンドで実装済み（スタック上の`feat/request-task-group-handover`〜`feat/task-group-handover-sidebar-badge`）
- 積む先: 未マージスタックの最上段`docs/keep-gitkeep-in-record-dirs`の上にgit-spiceで積む

### 利用するAPI（tascon-backend）

- `DELETE /api/v1/task_group_shares/:id`（`Api::V1::TaskGroupSharesController#destroy`）
  - 実装: tascon-backend PR #691（`feat/task-group-share-destroy`、オーナーによる解除）、PR #692（`feat/task-group-share-self-leave`、共有相手による離脱。#691の上に積まれている）。いずれも未マージ（OPEN）だが、Bruno CLIで動作確認済みとPR本文に記載あり。フロントエンドの既存共有・引き継ぎ機能も同様に未マージのバックエンドPRを前提に実装されている
  - 検索: `TaskGroupShare.owned_or_shared_with(current_user).find(id)` → オーナー・共有相手のどちらでも見つかる。それ以外は404
  - 成功: `204 No Content`（ボディなし）
  - `status`が`shared`以外（`handover_pending`）、またはロック取得前後で`user_id`が変わった（並行して引き継ぎ承認が完了した）場合: `422`、`render_custom_error source: "status", type: "invalid_transition", message: "共有中の状態でのみ解除できます。"`
  - ブロック中のオーナーは除外しない（共有相手はブロック中でも離脱できる）
- フロントエンド側の`fetchData`は204を`data = null`として扱う（`src/utils/api/fetch-data.ts`）。既存のDELETE系server action（`delete-task-group.api.ts`・`delete-contact.api.ts`）は`dataSchema = z.null()`で検証しており、同じ形で実装できる

### 既存画面と導線

- オーナー側: `/tasks/groups/[id]/share`（`src/app/(main)/tasks/groups/[id]/share/page.tsx`）
  - 共有中ユーザー一覧: `task-group-share-list/`。各カード`TaskGroupShareCard`は`status`に応じて「引き継ぎ依頼」（`RequestHandoverButton`）か「依頼取消」（`CancelHandoverRequestButton`）を1つ表示する。いずれかの共有が`handover_pending`のとき、他カードの引き継ぎ依頼ボタンは`disabled`
  - 未共有の連絡先一覧（`share-task-group-contact-list/`）は`taskGroup.sharedUsers`で共有済みユーザーを除外している
  - 引き継ぎ系server actionは`revalidatePath(\`/tasks/groups/${taskGroupId}/share\`)`で再描画している
- 共有相手側: `/tasks/shared-groups/[id]`（`[id]`はshare ID）
  - ヘッダー右に`TaskGroupShareHandoverNotice`（`handover_pending`時のみ）、オーナー表示、詳細モーダルボタン（`ShowTaskGroupDetailModalButton`に`SharedTaskGroupDetail`を渡す）
  - `SharedTaskGroupDetail`は閲覧専用の詳細（アイコン・グループ名・メモ）。オーナー側`TaskGroupDetail`は末尾に`HorizontalRule`＋`DeleteTaskGroupButton`を置いている
  - サイドバーの共有タスクグループ一覧（`tasks-sidebar-content/shared-task-group-menu/`）は`GET /api/v1/task_group_shares`。拒否（`decline-handover.api.ts`）は`revalidatePath("/tasks", "layout")`でサイドバーごと再描画している

## 方針

### オーナー側: 共有解除ボタン

- `TaskGroupShareCard`の`status === "shared"`のカードに「共有解除」ボタン（`btn-danger`想定）を「引き継ぎ依頼」と並べて追加する。`handover_pending`のカードには出さない（APIが422になるため。先に「依頼取消」が必要）
- 確認モーダル（既存`RequestHandoverButton`と同じ`Modal`/`IconMessage`構成）で「{userName}さんとの共有を解除しますか？」を確認してから実行する
- server action `cancel-task-group-share.api.ts`（`DELETE`、`dataSchema = z.null()`）。成功時`revalidatePath(\`/tasks/groups/${taskGroupId}/share\`)`。カードが一覧から消え、相手は未共有の連絡先一覧に戻る
- エラー処理は`RequestHandoverButton`と同じ（401→ログイン画面、`error`/`errors`形式のメッセージがあればそれをスナックバー表示、それ以外は汎用スナックバー）
- `LoadingTaskGroupShareList`のスケルトンのボタン部分を、ボタン2つ分の見た目に合わせる

### 共有相手側: 共有解除ボタン

- `SharedTaskGroupDetail`（詳細モーダル）の末尾に、オーナー側`TaskGroupDetail`と同じく`HorizontalRule`＋ボタン「共有解除」（`btn-danger`想定）を追加する
- `taskGroupShare.status === "handover_pending"`のときはボタンを`disabled`にする（APIが422になるため。先に引き継ぎを承認/拒否する必要がある）
- 確認モーダルで「このタスクグループの共有を解除しますか？解除すると、このタスクグループは表示されなくなります。」を確認してから実行する
- server action `leave-task-group-share.api.ts`（`DELETE`、`dataSchema = z.null()`）。成功時`revalidatePath("/tasks", "layout")`でサイドバーの共有タスクグループ一覧を更新し、続けてserver action内で`redirect("/tasks")`する（`accept-handover.api.ts`と同じ。レビュー指摘により、クライアント側`router.replace`から変更。revalidateで現在の共有ページが再描画され`notFound()`が一瞬出るのを避けるため）
- エラー処理はオーナー側と同じ

## Steps

### Step 1: オーナーによる共有解除（`feat/cancel-task-group-share`）

1. `task-group-share-card/cancel-task-group-share.api.ts`と`task-group-share-card/cancel-task-group-share-button/index.tsx`を追加し、`TaskGroupShareCard`に組み込む（Codexへ委譲）
2. `LoadingTaskGroupShareList`のスケルトンを調整する（同上）

### Step 2: 共有相手による共有解除（`feat/leave-shared-task-group`）

1. `shared-task-group-detail/leave-task-group-share.api.ts`と`shared-task-group-detail/leave-task-group-share-button/index.tsx`を追加し、`SharedTaskGroupDetail`に組み込む（Codexへ委譲）

各Stepの検証: `yarn tsc --noEmit`、`yarn check`、`yarn lint-jsx`が通ること。画面での動作確認は下記代表ケースで行う（実機確認はユーザーの最終確認タスクで実施）

## 代表ケース

- オーナー: `shared`のカードで共有解除 → 204、カードが消え、未共有の連絡先一覧に相手が表示される
- オーナー: `handover_pending`のカードには共有解除ボタンが表示されない（依頼取消のみ）
- オーナー: 画面表示後に相手が離脱済み → 404、スナックバー表示
- オーナー/共有相手: 並行して引き継ぎ承認・依頼が行われた → 422 `invalid_transition`、APIのメッセージをスナックバー表示
- 共有相手: `shared`の共有で共有解除 → 204、`/tasks`へ遷移し、サイドバーから当該共有タスクグループが消える
- 共有相手: `handover_pending`中はボタンが`disabled`
- 共有相手: オーナーが先に共有解除済み → 404、スナックバー表示
- 未ログイン（401）→ ログイン画面へ遷移

## Progress

- [x] 調査（既存画面・解除導線・API・レスポンス・権限制御・解除後の遷移/状態更新）
- [x] planのユーザー承認（2026-10-18）
- [x] Step 1: オーナーによる共有解除（`feat/cancel-task-group-share`、63124a12。レビュー指摘の修正: 70866f57、77ea1308。ユーザー確認後の修正: ac05cd80、5e7bea34、99cd5459）
- [x] Step 2: 共有相手による共有解除（`feat/leave-shared-task-group`、81e8b1ee。レビュー指摘の修正: 4d295a6f、d67a0031。ユーザー確認後の修正: 83b6e4d2、271cd47d）
- [ ] 実機での動作確認（代表ケース。ユーザーの最終確認タスクで実施）

## Decision Log

- 2026-10-18: APIは1本（`DELETE /api/v1/task_group_shares/:id`）でオーナー・共有相手の両方を扱う（バックエンドPR #692の設計）。フロントエンドはオーナー側・共有相手側で導線・成功後の遷移が異なるため、server actionとボタンを画面ごとに分けて実装する
- 2026-10-18: plan全体方針をユーザーが承認。ドラフト時の未確定事項は以下のとおり決定（ユーザー回答）
  - バックエンドPR #691/#692は未マージのまま実装を進める。既存の共有・引き継ぎ機能と同じ扱い
  - オーナー側で他の共有が`handover_pending`でも、`shared`カードの共有解除ボタンは`disabled`にしない。APIは対象共有自身の`status`しか見ず、引き継ぎ依頼の「同時に1件まで」の制約とは無関係なため
  - 共有相手側のボタンは詳細モーダル（`SharedTaskGroupDetail`）の末尾に置く。オーナー側`TaskGroupDetail`の削除ボタンと同じ配置
  - 共有相手側で`handover_pending`中はボタンを`disabled`で表示する（非表示にはしない）
  - 404（相手側で既に解除済み）はスナックバー表示のみで、画面の再描画はしない。既存の引き継ぎ系ボタンと同じ
  - ボタン文言はオーナー側・共有相手側とも「共有解除」に統一する。ドラフトでは共有相手側を「共有をやめる」としていたが、ユーザー判断で「両方とも『共有解除』でよい」となった。確認モーダルの文言も「解除」に揃える
  - コード上の命名（server action `leave-task-group-share.api.ts`、Step2ブランチ`feat/leave-shared-task-group`）は、共有相手が自分の共有から抜けるというAPI上の操作（バックエンドPR #692の"leave"）を表すため変更しない。画面文言と内部命名は別扱い
- 2026-10-18: 共有解除ボタン（オーナー側・共有相手側）は、外側を`div`でくくらずフラグメントで返す。レビュー指摘で`div`でくくったところ、共有カードでボタンが横並びにならず文字幅に縮んだ。ボタンと確認モーダル（トップレイヤーの`<dialog>`）は、通常フローに出る要素が1つだけだからである（`docs/decisions/component-root-wrapper-by-in-flow-count.md`）。共有カードのボタン行は、他の類似箇所に合わせて`flex`と`gap`で並べる（ユーザー判断）
- 2026-10-18: 解除の確認文言を、共有時の確認文言（`{taskGroupName} を {userName} と共有しますか？`）に揃える（ユーザー判断）。オーナー側は「{taskGroupName} の {userName} との共有を解除しますか？」、共有相手側は「{taskGroupName} の共有を解除しますか？」とし、共有相手側の2行目の注意文は残す。オーナー側のタスクグループ名は、一覧から受け渡さず`TaskGroupShareCard`で`getTaskGroup`を呼んで取得する。Props Drillingを避けるためで、`cache()`によりリクエストは増えない（`docs/decisions/fetch-data-in-consuming-server-component.md`）
- 2026-10-18: このplanで作成・変更したファイルを、import元の`index.tsx`と同じ階層に置く方針（`docs/decisions/component-placement-by-importer.md`）に合わせて移動する（ユーザー判断）。範囲はこのplanに関係する最小限とする。具体的には、`task-group-share-card/`を`task-group-share-cards/`の中へ移し、`cancel-task-group-share.api.ts`・`leave-task-group-share.api.ts`をそれぞれのボタンのディレクトリへ移す。あわせて、読み込み中のカードを`TaskGroupShareCard`と同じファイルに置き、`buttonLayoutClasses`を本物とskeletonで共有する。範囲外の配置のずれは`.claude/tech-debt/active/component-placement-mismatch.md`で追跡する

## Validation and Acceptance

- オーナーが`/tasks/groups/[id]/share`で`shared`の共有を解除でき、解除後に一覧が更新される
- 共有相手が`/tasks/shared-groups/[id]`の詳細モーダルから共有解除でき、`/tasks`へ遷移しサイドバーから消える
- `handover_pending`の共有は、オーナー側・共有相手側のどちらからも解除操作できない（UI上で導線がない、または`disabled`）
- 401/404/422のエラーがユーザーに表示される
- `yarn tsc --noEmit`、`yarn check`、`yarn lint-jsx`が通る
