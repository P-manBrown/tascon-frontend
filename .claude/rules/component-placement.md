---
paths:
  - "src/app/**"
  - "src/components/**"
---

# ファイル配置ルール

- コンポーネントのディレクトリや`.api.ts`等のファイルは、それをimportする`index.tsx`と同じ階層（import元のディレクトリの中）に置く
- 同じルート内の複数のファイルからimportされるものは、import元に共通する最も近い親の階層に置く
- 別のルートからimportされるものは、`src/components`等の共有層に置く
- 配置はimport関係で決める。`children`等で描画される位置では決めない
