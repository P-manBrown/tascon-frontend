# 手元のgitフックは意味を変えない自動修正と速い検査に限り、CIは検査だけを行う

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-11-19
- **Related Files:** lefthook.yml

## Context

lefthookのpre-commitでは、Biomeとmarkuplintが自動修正を行い、`stage_fixed: true`で修正後のファイルをステージし直していた。pre-pushでは`knip`と未コミットの変更の有無だけを検査し、型検査を行っていなかった。

検討の過程で次のことを確認した。

- #905で、markdownlintの`--fix`を外して検査だけにした。markdownlintの`--fix`には安全・危険の区別がなく、入れ子の項目のインデントが不足した番号付きリストの番号を振り直す等、文書の意味を変え得る。`stage_fixed`により、その修正が気づかれないままコミットされ得た
- Biomeは修正をsafeとunsafeに区別し、`--write`はsafeな修正だけを適用する（[編集時フックではフォーマッタ・リンターの安全な自動修正のみを行う](edit-time-lint-hooks.md)で確認済み）
- markuplint 4.14.1（`@markuplint/rules@4.12.0`）で修正（`fix()`）を持つルールは`attr-value-quotes`・`case-sensitive-attr-name`・`case-sensitive-tag-name`の3つのみで、いずれも`category: 'style'`の分類だけを持ち、修正が意味を保つかの区別・保証の記述がない。`attr-value-quotes`の修正は引用符の文字を置き換えるだけで、値の中の同じ引用符をエスケープしない
- 現在の`.markuplintrc`（`markuplint:recommended-react`を継承）では上の3ルールはいずれも有効でない。設定を変えると、`--fix`による修正が黙って有効になる
- `tsc --noEmit`は、`next-env.d.ts`（gitignoreの対象）がない新しい取り出しでは、画像のimportの型がなく失敗する。`next typegen`で型のファイルを生成してから実行すると成功し、生成物はすべてgitignoreの対象のため`git status --porcelain`は空のままになる
- 作業はふだん`.claude/worktrees/`配下の新しいworktreeからpushされる

## Decision

- pre-commitで自動修正し`stage_fixed`でステージし直すのは、意味を変えないことが保証されたツールの修正だけとする。現時点ではBiomeのみとし、保証のないツール（markdownlint・markuplint）は検査だけを行う
- pre-pushはプロジェクト全体の検査（`knip`、`next typegen`→`tsc --noEmit`）を行い、自動修正はしない
- CIは検査だけを行い、自動修正をしない。手元のフックは、CIと同じ検査を早めに走らせる場所とする
- `vitest related`をpre-pushに加えるかは、テストの道具を導入した後に決める

## Considered Options

- markuplintの`--fix`と`stage_fixed`を外す（採用）: 設定を変えたときに、保証のない修正が黙って有効になる余地がなくなる。現在は修正を持つルールが有効でないため、今の挙動は変わらない。違反は手で直す必要がある
- markuplintの`--fix`を残す: 現在は修正の対象がなく実害がない一方、`attr-value-quotes`等を有効にすると、意味を変え得る修正が気づかれないままコミットされ得る
- `.markuplintrc`で修正を持つ3ルールを明示的に無効にし、`--fix`は残す: 今の3ルールは防げる一方、修正を持つルールが今後増えるたびに確認と設定の追加が必要になる。また、3ルールをスタイルの検査として使えなくなる
- 型検査を`next typegen`と合わせて実行する（採用）: 新しいworktreeからでも、型エラーがなければ成功する。`next typegen`の時間（約1.3秒）が加わる
- `tsc --noEmit`だけを実行する: 手順が単純な一方、`next-env.d.ts`のない新しいworktreeでは型エラーがなくても失敗し、ふだんの運用で毎回pushが止まる
- `package.json`に`typecheck`スクリプトを加え、lefthookから呼ぶ: 手元とCIで同じスクリプトを呼べる一方、並行して進むCIの作業と同じファイルを変更して衝突する。lefthookにコマンドを直接書いても手順は同じになる

## Consequences

- markuplintの違反はコミット時に検出されるだけで自動では直らず、手で直す必要がある
- pushが約7秒遅くなる（`next typegen`が約1.3秒、`tsc --noEmit`が約5.7秒）
- 型エラーがあると、pushの前に止まる
- pre-pushの型検査は、CIで行う型検査と同じ手順（`next typegen`→`tsc --noEmit`）になる
