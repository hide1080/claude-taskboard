# ARCHITECTURE

4 列（未着手 / 進行中 / 保留 / 完了）のカンバンボードのアーキテクチャ概要。
React に依存しない純粋ロジック（`lib/`）、状態をつなぐフック（`hooks/`）、描画（`components/board/`）の
3 層に責務を分けている。

```
components/board/  ──使う──▶  hooks/  ──使う──▶  lib/（純粋ロジック）
   描画と通知のみ             状態と操作の窓口        状態遷移・定義・永続化
```

## 主要コンポーネント

### 1. `lib/board.ts` — 状態遷移の中核

- `Task[]` 1 本を状態とし、`boardReducer`（`add` / `move`）で遷移させる。React に依存しない純粋関数群。
- 描画時に `tasksInColumn` で列へ振り分ける（状態自体は列ごとに分けない）。
- `filterTasks` / `assigneesOf` / `EMPTY_FILTER` で検索・絞り込み（タイトル・説明の部分一致 + 担当者・優先度の完全一致、すべて AND）を担う。条件が空なら同一参照を返す。
- `isOverdue(task, today)` は `today` を引数に取り、時刻のモックを不要にしている。

### 2. `lib/columns.ts` と `lib/priorities.ts` — 定義の単一の情報源

- `COLUMNS` が列の順序とラベルを、`PRIORITIES` が優先度（高/中/低）の順序・ラベル・既定値を定義する。画面もテストもこの配列を参照する。
- `adjacentStatus` はカード移動ボタン（`←` / `→`）のための隣接列計算。端では `null` を返す。

### 3. `lib/taskStorage.ts` / `lib/taskStore.ts` — 永続化ストア

- `taskStorage.ts` は localStorage（キー `taskboard:tasks:v1`）への読み書き。`parseStoredTasks` は壊れた JSON や不正な要素があると `null` を返し、全体を捨てて初期タスクに戻す。
- `taskStore.ts` の `createTaskStore` は `useSyncExternalStore` 用のストア。保存文字列が変わらない限り同一参照を返し、書き込みが失敗してもメモリ上では状態を進める。
- サーバー描画とハイドレーションでは常に初期タスクを返し、ハイドレーション後に保存済みの内容へ切り替わる。

### 4. `hooks/useStoredTasks.ts` / `hooks/useBoard.ts` — 状態の窓口

- `useStoredTasks` は `createTaskStore` を `useSyncExternalStore` に繋ぎ、`useReducer` と同じ `[state, dispatch]` を返す。
- `useBoard` は `useStoredTasks` の状態に `filter` を適用し、列ごとに振り分けた `columns` と `totalCount` / `visibleCount` / `assignees`、操作 `addTask` / `moveTask` をコンポーネントへ渡す。
- `useToday` は SSR では空文字、ハイドレーション後に実日付を返し、期限切れ表示の既定の「今日」を供給する。

### 5. `components/board/Board.tsx` — 画面のまとめ役

- `useBoard` の結果を `BoardHeader` / `BoardToolbar` / `AddTaskForm` / `Column` / `AddColumnPlaceholder` に配る。
- ドラッグ中のタスク id、追加フォームを開いている列、検索・絞り込み条件といった画面の一時状態は、ここと `AddTaskForm` のみが持つ。他のコンポーネントは受け取った値を描画し、操作を親へ通知するだけ。
- 検索・絞り込み条件は保存せず、リロードで空に戻る（永続化するのはタスクのみ）。

### 6. `components/board/Column.tsx` と `TaskCard.tsx` — 列とカード

- `Column` は 1 列分の見出し・カード一覧・「タスクを追加」を描画し、ドロップ先として機能する。
- `TaskCard` は 1 枚のカード（担当者・優先度・期限、期限切れ強調、`←` / `→` 移動ボタン）を描画し、ドラッグ元として機能する。

### 7. `components/board/AddTaskForm.tsx` / `BoardToolbar.tsx` / `BoardHeader.tsx` — 入力と操作 UI

- `AddTaskForm` は新規タスクの入力フォーム。入力中の値はこのコンポーネントが持ち、確定時に `TaskDraft` を親へ渡す。
- `BoardToolbar` は検索欄と担当者・優先度の絞り込みを描画し、変更を `onChange` で通知する。
- `BoardHeader` はタイトル・件数（絞り込み中は表示件数）・タスク追加ボタンを描画する。

### 8. `lib/dragData.ts` — ドラッグ&ドロップのデータ受け渡し

- HTML5 Drag and Drop の `dataTransfer` 読み書き（`setDragTaskId` / `getDragTaskId`、MIME タイプ `application/x-taskboard-task`）を集約する。
- jsdom には `DataTransfer` が無いため、テストでは `src/test/dataTransfer.ts` の最小スタブで再現する。

## 未実装の表示

5 列目の「カラムを追加」（`AddColumnPlaceholder`）と列見出しの `...` は表示のみ。実装する際は
`COLUMNS` / `boardReducer` の拡張として扱う。

## テスト構成

- `lib/*.test.ts` — 純粋ロジック（状態遷移・列定義・dataTransfer・永続化）。
- `hooks/useBoard.test.ts` — 追加・移動・絞り込みの反映と、再マウント後もタスクが残ること。
- `components/board/*.test.tsx` — 各コンポーネントの表示と通知。`Board.test.tsx` でドラッグ&ドロップによる列移動を通しで確認する。
