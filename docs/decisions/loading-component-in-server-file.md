# 読み込み中表示はServer Componentのファイルに本物と並べて置く

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-10-18
- **Related Files:** `.claude/rules/component-implementation.md`, `src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/task-group-share-cards/task-group-share-card/index.tsx`, `src/components/paginations/mobile-pagination/mobile-page-turn-link/index.tsx`

## Context

読み込み中表示（`Loading`で始まるコンポーネント）は、多くがSuspenseのfallbackとしてServer Componentから使われる。状態もフックも使わない静的な表示なので、Server Componentとして書けば、そのコードはクライアントへ送られない。

既存の読み込み中表示61個のうち60個は`"use client"`のないファイルにあった。ただし、明文化されたルールはなく、本物と同じファイルに並べる慣習（`BlockCards`と`LoadingBlockCards`等）に従った結果だった。本物がServer Componentなら、読み込み中表示も自然とServer Componentになる。

例外の`LoadingMobilePageTurnLink`は、本物の`MobilePageTurnLink`が`useContext`を使うため、ファイル全体が`"use client"`になっていた。そのため、同じファイルの読み込み中表示もClient Componentとしてクライアントへ送られていた。

本物と読み込み中表示は見た目（サイズ・角丸・余白等）を揃える必要があり、その値はexportしないクラス定数として同じファイル内で共有している。読み込み中表示だけを別ファイルに分けると、定数をexportして共有することになる。そうすると、モジュールの外のどこからでも参照できる値になり、範囲が広すぎる。

## Decision

- 読み込み中表示は本物と同じファイルに置き、見た目のクラス定数はexportせずファイル内で共有する
- 本物がClient Componentの場合は、Client Componentの範囲を狭める。見た目のクラスはServer Componentで組み立ててpropsで渡し、そのServer Componentのファイルに読み込み中表示を置く
- 範囲を狭められない場合は、本物と同じClient Componentのファイルに置いたままにする。クラス定数をexportして別ファイルと共有しない
- Client Componentの中で描画する読み込み中表示（`useTransition`の処理中に出すもの等）は対象外とする。Client Componentからimportされたものは、どのファイルにあってもクライアントに含まれるためである

## Considered Options

- **本物と同じファイルに置く（従来の慣習のみ）**
  - 長所: 見た目の定数をファイル内に閉じたまま共有できる
  - 短所: 本物がClient Componentだと、読み込み中表示もクライアントへ送られる
- **読み込み中表示だけを`"use client"`のない別ファイルに分け、クラス定数をexportして共有する**
  - 長所: 読み込み中表示を常にServer Componentにできる
  - 短所: 見た目の定数が公開の値になり、無関係な箇所からも参照できてしまう
- **Client Componentの範囲を狭め、見た目をServer Componentで決めて読み込み中表示と同じファイルに置く（採用）**
  - 長所: 定数をexportせずに、読み込み中表示をServer Componentにできる。Client Componentに送るコードも減る
  - 短所: 本物を、Server Componentの外側とClient Componentの内側に分ける手間がかかる

## Consequences

- 範囲を狭められずにClient Componentのファイルに残した読み込み中表示は、クライアントへ送られる。その量はわずかなので、定数の範囲を広げないことを優先する
- 既存の`LoadingMobilePageTurnLink`は`.claude/tech-debt/active/loading-component-in-client-file.md`で追跡する
