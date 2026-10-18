# openSnackbarがstateの配列をspliceで直接変更している

- **Status:** Open
- **Priority:** Medium
- **Category:** Code
- **Area:** src/app/_components/snackbars/use-snackbars-store.tsx
- **Detected:** 2026-08-25
- **Todoist Task ID:** 6hjqg3rX5Wc22QJq
- **Description:** `openSnackbar`が新しいスナックバーのidを求める際に`state.snackbars.splice(-1)`を使っており、Zustandが保持するstateの配列そのものを破壊的に変更している。タスクグループ引き継ぎ依頼の実機確認で、422エラー時のスナックバーが2回目以降表示されない不具合の原因候補として特定したが、修正は行わず、依頼ボタン側でエラー時に確認モーダルを閉じない対応のみ実施した
- **Impact:** スナックバーを続けて開いた場合にstateが不整合になり、スナックバーが表示されない・重複したidが振られる等の不具合が起き得る。依頼ボタン以外の呼び出し元では回避策が入っていない
- **Proposed Resolution:** `state.snackbars.at(-1)`等の非破壊的な参照でidを求めるよう修正し、エラー時のスナックバーが連続して表示されることを実機で確認する
- **Related:** —
