# レスポンススキーマでnilになり得る項目は.optional()で定義する

- **Status:** Accepted
- **Verification Status:** Verified
- **Date:** 2026-08-24
- **Related Files:** src/schemas/response/user.ts, src/schemas/response/task-group-share.ts

## Context

バックエンドのJSON表現（`ApplicationResource`を継承するAlbaのResource全般）は、値がnilの項目をレスポンスからキーごと除外する。そのため、nilになり得る項目は`null`としては届かず、キーの欠落（`undefined`）として届く。

## Decision

レスポンススキーマ（Zod）では、nilになり得る項目を`.optional()`で定義し、`.nullable()`は使わない。

## Consequences

- バックエンドの実際のレスポンス形式とスキーマが一致し、`validateData`の検証が通る
- バックエンドがnilを`null`として返すように変わった場合、該当スキーマを`.nullable()`へ見直す必要がある
