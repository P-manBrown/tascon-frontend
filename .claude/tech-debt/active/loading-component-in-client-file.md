# LoadingMobilePageTurnLinkがClient Componentのファイルにある

- **Status:** Open
- **Priority:** Low
- **Category:** Performance
- **Area:** src/components/paginations/mobile-pagination/mobile-page-turn-link/
- **Detected:** 2026-10-18
- **Todoist Task ID:** 6hp49HfJC2Vpwf2H
- **Description:** `component-implementation`ルールに、読み込み中表示はServer Componentのファイルに本物と並べて置く方針を追加した。`export function Loading`を持つ全61ファイルを確認したところ、`src/components/paginations/mobile-pagination/mobile-page-turn-link/index.tsx`の`LoadingMobilePageTurnLink`だけが`"use client"`のファイルにあった。本物の`MobilePageTurnLink`が`useContext(ModalContext)`でモーダル内かを判定し、`Link`と`<a>`を切り替えるためにClient Componentになっている。同じファイルの読み込み中表示もClient Componentとしてクライアントへ送られている。読み込み中表示が本物と共有しているのは、exportしない`shapeClasses`（`rounded-sm`）である
- **Impact:** Server Component（`MobilePagination`）からSuspenseのfallbackとして使う静的な表示が、クライアントのバンドルに含まれる。量はわずかだが、方針と食い違ったままだと、既存コードを参考にした新規実装が同じ形に倣う
- **Proposed Resolution:** `MobilePageTurnLink`をServer Componentにし、`linkClassName`（`shapeClasses`を含む）をそこで組み立てる。モーダル内かどうかで`Link`と`<a>`を選ぶ部分だけを小さいClient Componentに切り出し、`className`・`page`・`children`をpropsで渡す。`LoadingMobilePageTurnLink`はServer Component側のファイルに残し、exportしない`shapeClasses`を共有する
- **Related:** docs/decisions/loading-component-in-server-file.md
