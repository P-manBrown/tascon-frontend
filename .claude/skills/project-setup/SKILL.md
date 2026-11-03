---
name: project-setup
description: 依存パッケージのインストールを行うスキル。新規clone後、worktree作成後、依存関係の変更後に使用する。
---

# プロジェクトセットアップ

- 新規clone後、worktree作成後、依存関係（`package.json`・`yarn.lock`）の変更後は、`scripts/setup.sh`を実行する
- SessionStartフックからも自動実行される
- Linux以外では何もしない
