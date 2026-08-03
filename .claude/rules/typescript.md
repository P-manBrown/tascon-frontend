---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# TypeScript実装ルール

## 型

- 型アサーション(`as`)使用禁止（`as const`は可）
- any型使用禁止

## 命名

- 定数命名: `const`宣言 + `export`済み + 不変値の全条件満たす場合のみCONSTANT_CASE。それ以外camelCase

## エクスポート

- Next.jsにおいてデフォルトエクスポートが必須のファイル（`page.tsx`/`layout.tsx`等）のみデフォルトエクスポート、それ以外は名前付きエクスポート

## 関数宣言

- トップレベル関数: `function`使用
- 関数内関数: アロー関数使用
