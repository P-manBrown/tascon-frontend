# 件数上限のない非同期データはSuspense境界の内側でCollapsibleSectionを生成する

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-08-24
- **Related Files:** src/components/collapsible-sections/collapsible-section/index.tsx, src/app/(main)/tasks/groups/[id]/_components/share-task-group-page-content/index.tsx, src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/index.tsx

## Context

`CollapsibleSection`は、内容が`minHeight`を超えるか（折りたたみが必要か）の判定を`ResizeObserver`の非同期コールバックでのみ更新する。

`CollapsibleSection`を先にマウントし、その`children`としてSuspenseの`fallback`（固定件数のスケルトン）から実データへ差し替える構造では、実データがfallbackより高くなる場合に、差し替え直後の1フレームだけ判定が古いまま描画され、折りたたまれるべき内容が一瞬すべて表示される（ちらつき）。

タスクグループ共有画面の「共有中」一覧（`getOwnerTaskGroupShares`）は件数の上限がなく、この現象が発生した。`@contacts`・`@suggestions`等の一覧はバックエンドのページネーションで実データがfallback件数を超えないため発生しない。

## Decision

- 件数の上限がない非同期データを`CollapsibleSection`で表示する場合、Suspense境界を`CollapsibleSection`の外側に置き、データ取得を終えた非同期コンポーネントの中で初めて`CollapsibleSection`を生成する。fallbackは`CollapsibleSection`を使わず、`minHeight`と同じ高さの要素とスケルトンで代替する（`BioCollapsibleSection`等と同じ構成）
- 0件時は`CollapsibleSection`を使わず、固定高さ（`min-h`ではなく`h`）の要素で空状態を表示する。内容が固定で、折りたたみ判定が不要なため
- `minHeight`・0件時の高さ・fallbackの高さは同じ値を共有し、ローディングから実データへの切り替え時のレイアウトシフトを防ぐ

## Consequences

- fallback表示中は`CollapsibleSection`がマウントされないため、高さの差し替えによるちらつきが発生しない
- `CollapsibleSection`はClient Componentのため、非同期のServer Componentから使う場合はClient境界となるラッパーを介する
