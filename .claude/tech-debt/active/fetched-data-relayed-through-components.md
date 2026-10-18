# 上位で取得したデータを中間コンポーネント経由で渡している

- **Status:** Open
- **Priority:** Low
- **Category:** Code
- **Area:** src/app/**/*.tsx, src/components/**/*.tsx
- **Detected:** 2026-10-18
- **Todoist Task ID:** 6hp3HXV3gPjfPQWH
- **Description:** `component-implementation`ルールに、サーバーのデータは値を使うコンポーネント（Client Componentなら直近の祖先Server Component）で取得するという方針を追加した。既存のServer Componentを簡易スキャンし、取得したデータ（またはその派生値）を、値を使わない中間コンポーネント経由で渡している箇所、または値を使うServer Componentへ上位から渡している箇所を抽出した。抽出方法は、Propsをそのまま子へ渡すだけのコンポーネントの検出と、`cache()`付き取得関数の結果をpropsへ渡している箇所の列挙である。網羅性は保証しない
  - `src/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list/`: `TaskGroupShareList`が`getOwnerTaskGroupShares`の結果から算出した`disabled`（いずれかの共有が引き継ぎ依頼中か）を、`CollapsibleTaskGroupShareCards`→`TaskGroupShareCards`→`TaskGroupShareCard`→`RequestHandoverButton`へ中継している。一覧の各要素ではなく一覧全体からの派生値なので、例外に当たらない
  - `src/components/cards/suggestion-cards/index.tsx`: `SuggestionCards`が`currentUserId`を使わずに`CreateContactFromSuggestionButton`へ中継している。渡しているのは`users-suggestion-list`・`suggestions-paginated-list`で、`getCurrentUser`の結果である
  - `src/components/pages/user-page/index.tsx`: `UserPage`が`getUser`の結果のうち、`contact.id`・`contact.displayName`・`contact.note`・`id`・`isSuggested`を`EditableDisplayName`・`EditableNote`・`UserCreateContactSection`（いずれもServer Component）へ渡している。このうち`contactId`・`contactUserId`は、受け取った側でも使わずにClient Componentへ中継している
- **Impact:** 値を使わない中間コンポーネントにPropsが増え、取得元から使用箇所まで追いにくくなる。使用箇所を移したり値を追加したりするたびに、経路上の全コンポーネントを変更する必要がある。方針と実装が食い違ったままだと、既存コードを参考にした新規実装が受け渡し型に倣う
- **Proposed Resolution:** 各候補について、値を使うコンポーネント（Client Componentなら直近の祖先Server Component）で`cache()`付きの取得関数を呼ぶ形へ移す。`disabled`は`TaskGroupShareCard`で`getOwnerTaskGroupShares(taskGroupId)`から算出する。`SuggestionCards`は`getCurrentUser`を自身で呼ぶか、ボタンの直近のServer Componentで取得する。`UserPage`の子は、ルートの`id`から`getUser`を呼んで必要な値を得る。移す際は、上位で同じ引数の取得が済んでいてキャッシュに当たるかを確認する。当たらない場合は、ウォーターフォールにならないかを確認する。あわせて、抽出の網羅性を上げるため、Propsの一部だけ使って残りを中継するケースも含めて再スキャンする
- **Related:** docs/decisions/fetch-data-in-consuming-server-component.md
