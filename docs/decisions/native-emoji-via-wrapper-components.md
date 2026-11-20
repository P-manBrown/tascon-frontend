# 絵文字はラッパー部品で端末の文字に固定し、ライブラリの部品の直接読み込みをlintで禁じる

- **Status:** Accepted
- **Verification Status:** Unverified
- **Date:** 2026-11-20
- **Related Files:** `src/components/emojis/emoji/index.tsx`, `src/components/emojis/emoji-picker/index.tsx`, `biome.json`

## Context

タスクグループのアイコン絵文字は、emoji-picker-reactの既定（`EmojiStyle.APPLE`）で描いていた。既定では、絵文字1つごとにAppleの画像を`cdn.jsdelivr.net`の`emoji-datasource-apple`から読む。そのため、外部CDNに依存し、絵文字の数だけ画像リクエストが出ていた。また、画像の絵文字は端末のほかの文字と見た目がそろわない。

ライブラリの`Picker`（2か所）と`Emoji`（6か所）は、呼び出し側の7ファイルがそれぞれ`next/dynamic`（`ssr: false`）で読み込み、設定とスケルトンも各ファイルに書いていた。既定値（APPLE）に戻る書き方を止める仕組みはなかった。

## Decision

- 絵文字の表示と選択は、共有層の`@/components/emojis/emoji`の`Emoji`と`@/components/emojis/emoji-picker`の`EmojiPicker`だけで行う
- 2つの部品の中で`emojiStyle`に`EmojiStyle.NATIVE`を固定する。`next/dynamic`（`ssr: false`）の宣言も部品の中に1つずつまとめ、`EmojiStyle`は`import()`の結果から取り出して、ライブラリの遅延読み込みを保つ
- 表示用の`Emoji`は、size の寸法を`style`で固定した外枠（`flex shrink-0 items-center justify-center text-center leading-none`）の中に絵文字かスケルトンを描く。ライブラリのCSSは`Picker`を開いた後にだけ差し込まれるが、外枠がそのCSSと同じ`line-height`・`text-align`とブロックとしての寸法を与えるため、開く前後で表示の寸法と位置が変わらない
- Biomeの`noRestrictedImports`で、`emoji-picker-react`の既定の書き出し・`Emoji`・名前空間（`import()`を含む）の読み込みをerrorにする。2つの部品のファイルだけを`overrides`で対象から外す。`EmojiClickData`等の部品ではない型は`import type`で読み込める

## Considered Options

- **部品の中に`next/dynamic`をまとめ、読み込み関数の中でNATIVEを固定する（採用）**
  - 長所: `dynamic`の宣言とスケルトンの重複が部品ごとに1か所になる。ライブラリの遅延読み込みを保てる。呼び出し側は`<Emoji unified size />`と`<EmojiPicker onEmojiClick />`を書くだけになる
  - 短所: `next/dynamic`の`loading`はpropsを受け取れないため、size の外枠を部品が描き、その中をスケルトンで埋める形にする必要がある
- **部品は受け渡しだけにし、`dynamic`は呼び出し側に残す**
  - 長所: 部品が単純になる
  - 短所: `dynamic`とスケルトンの重複が残る。部品で`EmojiStyle`を静的にimportするとライブラリが初期バンドルに入るため、結局、読み込み関数の工夫が要る
- **表示用の絵文字はライブラリを使わず、`unified`から自前で文字に変換する**
  - 長所: 表示にライブラリの読み込みもスケルトンも要らず、サーバーで描画できる
  - 短所: データにない`unified`を描かないライブラリの判定を失う。依頼の方式（包んだ部品でNATIVEを渡す）から外れる

## Consequences

- 絵文字の見た目がOSとフォントで変わる（例: Windowsでは国旗が2文字の地域記号で出る）
- 古いOSでは、新しい絵文字が豆腐（□）で出ることがある
- `noRestrictedImports`は型だけの読み込みを区別できないため、部品名の`import type`（例: `import type { Emoji }`）も禁止される。部品の型が要る場合は、包んだ部品から`React.ComponentProps<typeof Emoji>`で取る
- 外部CDNへの画像リクエストはなくなる
