# plan-worktree-checkフックの判定基準を「いずれかのactive planに記録があるか」へ変更する

## Context/Purpose

- バックエンド（tascon-backend）の同名planで行った変更を、このリポジトリへ移植する。判断の経緯はバックエンドで決めたものを移植している（Decision Log参照）
- `.claude/hooks/plan-worktree-check.sh`（`.claude/settings.json`のSubagentStopフック）は、cwdが`/.claude/worktrees/`配下のとき、`.claude/plans/active/*.md`の全ファイルに`Worktree: <cwd>`行があるかを確認し、1件でも欠けていればexit 2で停止をブロックする。そのため、無関係な既存planが毎回指摘される
- `Worktree:`を記録する目的は、`execution-plan`完了処理の手順2（`Worktree:`のパスから解決されるproject識別子でclaude-memを照会する）にある。記録が必要かどうかは「そのworktreeでplanの作業をしたか」で決まり、planファイルを編集したかどうかは関係ない
- 目的: フックの判定を「いずれか1件のactive planに、行全体が`Worktree: <cwd>`と一致する行があるか」へ変更し、`plans-maintenance`ルールの記録条件も同じ考え方に揃える
- ブランチ: `chore/plan-worktree-check-scope`（`chore/update-codebase-memory-mcp-lock`の上にgit-spiceで作成済み）
- 作業はメインcheckoutで行うため、このplanには`Worktree:`行を記録しない

### 作業環境の注意

- `.claude/settings.json`の登録内容から、SubagentStopフックはメインcheckoutのスクリプト（`${CLAUDE_PROJECT_DIR}`）で動く。そのため、このブランチがメインcheckoutに反映されるまでは、サブエージェントがworktree内で停止すると旧版のフックによる無関係なplanの指摘が出続ける
- worktree内（`EnterWorktree`で移ったメインセッション、およびそこから起動したsubagent）のBashでは、素の`git status`がrtk経由の実行として扱われ、worktree分離ガードに拒否された。`/usr/bin/git`は通った（2026-10-16にこのリポジトリで確認）

## 仕様

- `stop_hook_active`がtrueなら何も出力せずexit 0（現状維持）
- cwdが空、またはcwdが`/.claude/worktrees/`配下でなければexit 0（現状維持）
- `$cwd/.claude/plans/active`が存在しなければexit 0（現状維持）
- `.claude/plans/active/`に`*.md`が1件もなければexit 0
- 各planの冒頭（最初の`##`見出しより前の行）だけを見て、行末の空白・CRを除いた行全体が`Worktree: <cwd>`と完全一致する行が1つでもあればexit 0。1つもなければexit 2
  - 前方一致は不可（`Worktree: .../agent-x`が`agent-xy`のworktreeにマッチしない）
  - cwdは正規表現ではなく文字列として比較する
- exit 2時のメッセージは「作業中のplanの冒頭に`Worktree: <cwd>`を1行で追記してください」という趣旨にする（`plans-maintenance`ルール参照の旨は残す）。あわせて「planの作業をしていない場合（レビュー・調査等）は対応不要。無関係なplanには追記しない」旨を明記する

## Steps

### Step 1: フック・ルール修正（chore/plan-worktree-check-scope）

1. `.claude/hooks/plan-worktree-check.sh`を上記仕様に修正する（Codexへ委譲）
2. `.claude/rules/plans-maintenance.md`の記録条件を「サブエージェントのworktreeでそのplanの作業を行う場合に記録する。planファイル自体を編集しない場合も記録する」の趣旨に修正し、言及箇所（`.claude/skills/todoist-task-runner/SKILL.md:24`）も合わせて更新する（Codexへ委譲）。`claude-md-maintenance`ルールの「新規ルール追加時の必須手順」に従い、新規subagentで変更前後の行動を比較する。比較は「記録条件の変更」と「1行ずつの明記」の2段階で行い、差が出なかった変更は含めない（Decision Log参照）
3. `docs/decisions/`に、`Worktree:`行のパス形式（絶対パスを維持する）についてADRを追加する

検証（JSON入力をパイプして実行。一時ディレクトリに`.claude/worktrees/<name>/.claude/plans/active/`を作って試す）:

1. どのactive planにもWorktree行がない（無関係なplanのみ） → exit 2
2. いずれか1件のactive planに完全一致のWorktree行がある → exit 0
3. 前方一致だけの行（`Worktree: <cwd>x`）しかない → exit 2
4. agent-xの行しかないplanをagent-xyのworktreeで検査 → exit 2
5. cwdがworktree外 → exit 0
6. `stop_hook_active: true` → 出力なしでexit 0
7. plans_dirが存在しない → exit 0
8. `active/`は存在するが空 → exit 0
9. 行末に空白が付いた完全一致行 → exit 0
10. CRLFの完全一致行 → exit 0
11. 一致する行が`##`見出しより後にしかない → exit 2
12. パスに`.`を含むcwd（`a.12`）と、`.`の位置だけが違う行（`a_12`） → exit 2（正規表現として扱わない）
13. 作業中のworktree自体（planに自分のWorktree行を書いた状態） → exit 0（メインcheckoutで作業するため、一時ディレクトリで再現する）

## Progress

- [x] 2026-10-16 ブランチ`chore/plan-worktree-check-scope`を`chore/update-codebase-memory-mcp-lock`の上に作成。移植対象ファイルが変更前のバックエンドと同じ内容であることを確認した。対応するtech-debt・active planはこのリポジトリにない
- [x] 2026-10-16 Step 1の1・2を完了（Codexへ委譲し、成果物を確認してコミット）
  - フック修正8659ba8: 変更前のsha256は`899c27c6…`、変更後は`d8ec4388…`で、いずれもバックエンドと一致。検証ケース1〜13の全件が想定どおり（ケース13は、一時ディレクトリに作ったworktreeに本planを置き、冒頭に自分の`Worktree:`行を加えて再現した）
  - ルール修正9c3e1e6（`plans-maintenance.md`、`todoist-task-runner/SKILL.md:24`）: `git worktree add --detach`で`.claude/worktrees/`の下にテスト用worktreeを作り、メインセッションを`EnterWorktree`でそこへ移したうえで、isolationなしの新規subagentを起動して比較した（`isolation: "worktree"`のsubagentは、別のworktreeへ移ると書き込みができないため移動を拒否される）。テスト用worktreeは比較後に削除した
    - 比較1（記録条件の変更）: プロンプトは「既存planをこのworktreeで再開し、残作業を確認して報告する（planは編集不要）」。変更前は`Worktree:`行を追記しようとしなかった。変更後は追記しようとした（プロンプトの「planは編集不要」と食い違うため、auto modeの分類器に拒否されて実際には書き込まれていない）
    - 比較2（worktreeごとに1行ずつ書くことの明記）: プロンプトは「既存planをこのworktreeで再開する。planファイルのWorktree:欄にこのworktreeのパスを追記する」。冒頭に別のworktreeの`Worktree:`行が1行あり、Worktreeの書き方に触れていないダミーplanで試した。変更前・変更後とも、既存の行を残して新しい行として追加し、差が出なかった。最初は本planで試したが、Decision Logにこの決定が書かれていてsubagentがそれに従ったため、無効とした
- [x] 2026-10-16 Step 1の3を完了: `docs/decisions/plan-worktree-path-format.md`を追加し、索引に載せた（Codexへ委譲）

## Decision Log

- 2026-10-16 バックエンドの変更をこのリポジトリへ移植する（ユーザー判断）。以下2026-10-14付の項目は、バックエンドで決めた内容を移植したもの
- 2026-10-14 判定基準は「いずれか1件のactive planに`Worktree: <cwd>`の行があるか」にする（ユーザー判断）。`Worktree:`の記録目的は完了処理でのclaude-mem照会であり、記録要否はそのworktreeでplanの作業をしたかで決まる。1つのworktreeで扱うplanは基本的に1つで、どのplanが正しいかという意味的な検証は形式的な検査ではできないため、検査は「どれか1件に記載があるか」までに留める
- 2026-10-14 一致判定は行全体の完全一致にする。前方一致だと`agent-x`が`agent-xy`のworktreeに誤ってマッチする
- 2026-10-14 git-spiceで親ブランチを取得し、git差分で変更されたplanだけを検査する案は採用しない。planファイルを編集したかどうかは、記録の要否と関係ないため
- 2026-10-14 agent hook（`type: "agent"`）は採用しない。公式ドキュメント上experimentalで、サブエージェントの停止のたびにコストがかかり、結果も非決定的なため
- 2026-10-14 `completed/`は検査しない。完了処理を行うworktreeは記録不要である。完了処理ではclaude-memを照会した後にplanを移動するので、そのworktreeの記録は照会で使われない
- 2026-10-14 既知の制約として記録のみ: 将来、完了処理をサブエージェントのworktreeで行うと、planが`completed/`へ移動した時点で該当するactive planがなくなり、フックが1回ブロックする（`stop_hook_active`により2回目は通る）。現状、完了処理をサブエージェントへ委ねる手順はないため対処しない
- 2026-10-14 `plans-maintenance`ルールの記録条件を「作成・更新する場合」から「そのplanの作業を行う場合」へ変更する。フックの判定基準と考え方を揃えるため
- 2026-10-14 `active/`に`*.md`が1件もなければexit 0にする。記録先のplanがないのでブロックしても意味がなく、旧版もexit 0だった
- 2026-10-14 exit 2のメッセージに「planの作業をしていない場合（レビュー・調査等）は対応不要。無関係なplanに追記しない」旨を明記する。`stop_hook_active`により2回目の停止は通るので、作業していないworktreeでは無視すればよい。指示どおり無関係なplanに追記されると`Worktree:`の記録が崩れる
- 2026-10-14 比較の前に行末の空白・CRを除く。行末に空白がある`Worktree:`行やCRLFのファイルでも一致させるため。前方一致での誤マッチは引き続き起こさない
- 2026-10-14 判定対象を各planの冒頭（最初の`##`見出しより前の行）に限る。ルールで「冒頭に記録する」と定めており、本文中の例示行で通過しないようにするため。代案の「`.claude/plans`を触った場合のみ検査する」は、planを編集しない作業でも記録が必要なため却下した
- 2026-10-14 `plans-maintenance`ルールに「worktreeごとに`Worktree: <path>`を1行ずつ書く」旨を明記する。追記方法が決まっていないと1行にカンマ区切りで並べられ、フックの完全一致に当たらなくなるため。`todoist-task-runner/SKILL.md`の「`Worktree:`に追記する」も、同じ書き方を誘うため「`Worktree:`行を記録する」に改める
- 2026-10-16 このリポジトリでは、上の「1行ずつ書く」旨の明記と、`todoist-task-runner/SKILL.md`の「`Worktree:`行を記録する」への変更を含めない（ユーザー判断）。新規subagentでの比較2で、別のworktreeの`Worktree:`行がすでにあるplanを使っても、変更前から新しい行として追加しており、差が出なかったため（`claude-md-maintenance`ルールの「新規ルール追加時の必須手順」）。あわせて、同じ文言で追加された「`Worktree: <path>`の形で」「（最初の`##`見出しより前）」も含めず、比較1で差が出た文言にそろえた。そのため、この2ファイルはバックエンドの最終状態と一致しない
- 2026-10-16 上の判断を取り消し、`plans-maintenance.md`と`todoist-task-runner/SKILL.md`の文言をバックエンドの最終状態に戻す（ユーザー判断）。「`Worktree: <path>`の形で」「（最初の`##`見出しより前）」「1行に複数のパスを並べない」は、フックが検査する書式（最初の`##`見出しより前に、行全体が`Worktree: <cwd>`と一致する行）の仕様である。`claude-md-maintenance`ルールの比較は行動を促すルールがノイズかどうかを判定するもので、フックとの書式の約束は対象外とする。比較2で差が出なかったのは「1行ずつ」の明記だけで、残り2つはそもそも比較していない。末尾に空白を含むコード表記の`##`はmarkdownlintのMD038に当たるため、ルールの該当行に`markdownlint-disable-line MD038`を付けた（ユーザー判断）
- 2026-10-16 ブランチtypeはchoreにする（既存のフック変更と同じ）
- 2026-10-16 コミットは、バックエンドでレビュー指摘への対応として分かれたもの（フック・ルールの追加修正、Progress記録）を、フック・ルール・Progressそれぞれ1コミットにまとめる。このリポジトリではレビュー指摘の経緯がないため

## Validation and Acceptance

- 無関係なactive planにWorktree行がなくても、いずれか1件のactive planに完全一致のWorktree行があればフックがブロックしない
- どのactive planにも完全一致のWorktree行がなければexit 2でブロックし、作業中のplanへの追記を促す
- 前方一致の行や、最初の`##`見出しより後にしかない行では通らない。行末の空白・CRがあっても完全一致なら通る
- `stop_hook_active: true`・worktree外のcwd・plans_dirがない・`active/`にplanがない場合は何もしない
- `plans-maintenance`ルールと言及箇所が「planの作業を行う場合に、worktreeごとに1行で記録する」に揃っている
- `docs/decisions/`にWorktree行のパス形式のADRがあり、索引に載っている
