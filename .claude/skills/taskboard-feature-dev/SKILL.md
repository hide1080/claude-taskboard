---
name: taskboard-feature-dev
description: TaskBoard に新機能を TDD で追加するときに使用する。失敗するテストを先に書き、状態管理を整え、UI を更新し、最後にブラウザで動作を確認するまで一貫した手順で進める。
---

TaskBoard に機能を追加するときは、以下の順で進めてください。

1. 追加する機能のユーザー操作を確認する
2. 失敗するテストを先に追加する
3. 状態管理を整える（遷移ロジックは `lib/board.ts` の純粋関数と `boardReducer`、それを包むのが `hooks/useBoard.ts`）
4. 既存コンポーネントの責務分担を変えずにUIを更新する
5. `npm test` と `npm run build` で検証する
6. 必要に応じて Playwright MCP で画面操作を確認する