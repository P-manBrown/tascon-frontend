# ルート内のファイルはimport元と同じ階層に置く

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-10-18
- **Related Files:** `.claude/rules/component-placement.md`, `src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/task-group-share-cards/index.tsx`, `src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/task-group-share-cards/task-group-share-card/index.tsx`, `src/app/(main)/tasks/shared-groups/[id]/_components/shared-task-group-detail/leave-task-group-share-button/index.tsx`

## Context

`ARCHITECTURE.md`には、ルートに閉じたものはそのルートセグメントの`_components`に置き、ルートを跨いで使うものだけを共有層に置くという大枠しかなかった。`_components`の中でどの階層に置くかは決まっていなかった。

タスクグループ共有解除の実装（`.claude/plans/active/task-group-share-cancellation.md`）では、共有ページの部品が機能ごとのフォルダの中に兄弟として平らに並んでいた。そのため、import元と置き場所がずれていた。

- `TaskGroupShareCard`をimportするのは`TaskGroupShareCards`だけなのに、両者が兄弟に置かれていた
- server actionの`.api.ts`は、それを使うボタンの外に置かれていた

その結果、どのコンポーネントがどこから使われているかを場所から読み取れなかった。読み込み中表示の`buttonLayoutClasses`は、本物のカードと値を揃える目的で作られていた。しかしカードが別のディレクトリにあったため、その目的を果たせず、skeleton側の1か所でしか使われていなかった。

## Decision

ルート内のコンポーネントのディレクトリや`.api.ts`等のファイルは、それをimportする`index.tsx`と同じ階層（import元のディレクトリの中）に置く。

- 同じルート内の複数のファイルからimportされるものは、import元に共通する最も近い親の階層に置く
- 別のルートからimportされるものは、`ARCHITECTURE.md`のとおり`src/components`等の共有層に置く
- 配置はimport関係で決める。`children`等で描画される位置では決めない

## Considered Options

- **機能フォルダの中に兄弟として平らに並べる（従来）**
  - 長所: 移動が少ない
  - 短所: 何がどこから使われているかを場所から読み取れない。専用の部品とserver actionが、親の外に取り残される
- **import元と同じ階層に入れ子で置く（採用）**
  - 長所: ディレクトリの入れ子とimportの依存関係が一致する。使われる範囲が場所で分かる。コンポーネントを消すときはディレクトリごと消せば済む
  - 短所: 2つ目のimport元ができたら、共通の親の階層へ移動が必要になる。階層が深くなりパスが長くなる
- **種類別（`buttons/`・`cards/`等）にまとめる**
  - 長所: 汎用部品を探しやすい
  - 短所: ルート専用の部品では依存関係が見えなくなる。汎用部品は既に`src/components`で種類別に置いている

## Consequences

- 同じファイル内で本物と読み込み中表示を並べる場合（`BlockCards`と`LoadingBlockCards`等）、読み込み中表示もその部品と同じファイルに置く。上位の`Loading`コンポーネントは、直接の子の`Loading`コンポーネントだけをimportする。孫のファイルを直接importすると、import元が増えて配置が上がってしまうためである
- 既存の配置でこの方針に合わないものは`.claude/tech-debt/active/component-placement-mismatch.md`で追跡する
