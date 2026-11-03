---
name: project-setup
description: 依存パッケージのインストールを行うスキル。セッション開始時とサブエージェント開始時には自動実行される。新規clone後、依存関係の変更後、自動実行されない場面では`bash .claude/skills/project-setup/scripts/setup.sh`で手動実行する。
---

# プロジェクトセットアップ

- セッション開始時（SessionStartフックのstartup）とサブエージェント開始時（SubagentStartフック）に`scripts/setup.sh --from-hook`が自動実行される。フック入力のcwdからリポジトリルートを決めるため、worktree内でも正しい場所にインストールされる
- 新規clone後、依存関係（`package.json`・`yarn.lock`）の変更後は、リポジトリ内で`bash .claude/skills/project-setup/scripts/setup.sh`を手動実行する。カレントディレクトリのリポジトリルートが対象になる
- Linux以外では何もしない
