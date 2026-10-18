---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# TypeScript ルール
- `any` は避ける。具体的な型、ジェネリクス、または `unknown` を優先する
- 型のみのインポートには `import type` を使う
- タスクとカラムの型は `src/types/task.ts` に置く