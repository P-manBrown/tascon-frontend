# 編集時フックではフォーマッタ・リンターの安全な自動修正のみを行う

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-10-13
- **Related Files:** .claude/rules/hooks-authoring.md, .claude/hooks/biome-on-edit.sh, .claude/settings.json

## Context

Claude Codeの`Edit`/`Write`の`PostToolUse`フックでは、Biomeの自動修正（`biome-on-edit.sh`）を実行している。これに加えて、markdownlint・markuplint・TypeScriptの型チェック（`tsc --noEmit`）も編集時フックで実行するかを検討した。

検討の過程で次のことを確認した。

- 1つのファイルを複数回の`Edit`で書き換える場合、途中の状態で一時的に違反が出る（importを追加した直後で、まだ使っていない等）。exit 2で差し戻すと、Claudeが予定していた次の編集の前に、追加したばかりのコードを消す等の誤った修正を行い、手戻りが増える
- Biomeの`--write`は、整形・safeに分類された修正・import整列のみを適用し、意味が変わり得る修正はunsafeとして適用しない。未使用importの削除はunsafeで、編集途中に追加したimportが消されないことを確認した
- markdownlintの`--fix`には安全・危険の区別がなく、入れ子の箇条書きのインデントが不足した番号付きリストの番号を振り直し、文書の意味を変えた
- markuplintの`--fix`に対応するルールは3つのみで、現在の設定ではいずれも有効でなく、実ファイルに対して変更を行わなかった
- TypeScriptの型エラーは、typescript-lspプラグインの診断として編集直後にClaudeへ届く

## Decision

- 編集時フックで実行するフォーマッタ・リンターは、意味を変えないことが保証された自動修正のみを適用し、exit 0で終了する。安全・危険の区別がないツール（markdownlint等）の自動修正は実行しない
- リンターの違反を`PostToolUse`のexit 2で差し戻さない。違反の検出はpre-commitに任せる
- LSPプラグインの診断で得られる検査（型チェック等）はフックにしない
- 現時点で編集時フックにするのはBiomeのみとし、markdownlint・markuplint・`tsc`はフックにしない

## Considered Options

- 違反があればexit 2で差し戻すリンターフック: 違反を早く検出できる一方、複数回の編集の途中状態で差し戻され、誤った修正による手戻りを招く
- markdownlint・markuplintの自動修正のみを行うフック: markdownlintは修正が意味を変え得るため不適。markuplintは現在の設定では修正対象がなく効果がない
- ターン終了時（`Stop`）に変更ファイルをまとめてlintするフック: 途中状態の問題は避けられるが、設計が増える。pre-commitで検出できるため現時点では不要
- `tsc --noEmit`の編集時フック: プロジェクト全体の検査で編集ごとに時間がかかり、LSPの診断と機能が重複する

## Consequences

- 編集途中の一時的な違反で作業が中断されない
- markdownlint・markuplintの違反はコミット時まで検出されない
- Biomeの自動整形でファイル内容が変わるため、続く`Edit`の`old_string`が一致せず再読み込みが必要になる場合がある
