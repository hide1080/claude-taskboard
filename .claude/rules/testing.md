---
paths:
  - "src/__tests__/**/*.ts"
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
---

# テストルール
- 振る舞いを変更する前に、失敗するテストを先に書く
- コンポーネントの振る舞いには React Testing Library を優先する
- ユーザーから見える操作に対する振る舞いをテストする