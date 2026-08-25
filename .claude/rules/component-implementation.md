---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---

# コンポーネント実装ルール

## Server/Client境界

- `use client`はServer/Clientコンポーネントの境界にのみ記述する。汎用コンポーネントに安易に記述しない

## Props

- Props Drillingが発生し、かつそのPropsが他箇所で未使用・単一コンポーネントのみに渡っている場合→型は`React.ComponentProps`で取得。参照先は実際にレンダリングしている直近の子コンポーネント（孫以降まで遡らない）
- 特定要素の機能拡張のみが目的のコンポーネント→`React.ComponentPropsWithRef`で型定義
- Props型はConsumer-driven（使用側の要求）で決める。上流（APIスキーマ等）の型に引きずられない

## JSX

- 条件分岐で返すJSXの外側要素は同じタグに統一する
- 一要素として完結するコンポーネント→フラグメントでなく`div`等でくくる
- className: 変数・条件分岐は最後に記述
