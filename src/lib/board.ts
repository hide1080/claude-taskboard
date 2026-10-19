import type { Task, TaskDraft, TaskPriority, TaskStatus } from "@/types/task";

/** ボードの状態。列ごとに分けず 1 本の配列で持ち、描画時に列へ振り分ける。 */
export type BoardState = readonly Task[];

export type BoardAction =
  | { type: "add"; draft: TaskDraft; id: string }
  | { type: "move"; taskId: string; status: TaskStatus };

/** id 生成を差し替えられるようにしておく（テストで固定したい）。 */
export function createTaskId(): string {
  return globalThis.crypto.randomUUID();
}

/** 入力値を整形してタスクを組み立てる。 */
export function createTask(draft: TaskDraft, id: string): Task {
  return {
    id,
    title: draft.title.trim(),
    description: draft.description.trim(),
    status: draft.status,
    assignee: draft.assignee.trim(),
    priority: draft.priority,
    dueDate: draft.dueDate,
  };
}

/** ローカル日付を YYYY-MM-DD にする（`<input type="date">` の値と同じ形式）。 */
export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * 期限を過ぎた未完了タスクか。today / dueDate はどちらも YYYY-MM-DD なので文字列比較で足りる。
 * 完了済みや期限未設定は対象外。today を引数にして、時刻のモックなしでテストできるようにする。
 */
export function isOverdue(task: Task, today: string): boolean {
  return task.status !== "done" && task.dueDate !== "" && task.dueDate < today;
}

/** タイトルが空（空白のみを含む）の下書きは追加できない。 */
export function isValidDraft(draft: TaskDraft): boolean {
  return draft.title.trim().length > 0;
}

/** 末尾にタスクを追加した新しい状態を返す。 */
export function addTask(state: BoardState, task: Task): BoardState {
  return [...state, task];
}

/**
 * タスクのステータスを変更した新しい状態を返す。
 * 対象が無い／すでに同じステータスなら元の状態をそのまま返す（再描画を避ける）。
 */
export function moveTask(
  state: BoardState,
  taskId: string,
  status: TaskStatus,
): BoardState {
  const target = state.find((task) => task.id === taskId);
  if (!target || target.status === status) return state;

  return state.map((task) =>
    task.id === taskId ? { ...task, status } : task,
  );
}

/** 指定した列に属するタスクを、追加順を保って取り出す。 */
export function tasksInColumn(
  state: BoardState,
  status: TaskStatus,
): readonly Task[] {
  return state.filter((task) => task.status === status);
}

/** 検索語（タイトル・説明が対象）と、担当者・優先度の絞り込み条件。空文字は「指定なし」。 */
export interface TaskFilter {
  query: string;
  assignee: string;
  priority: TaskPriority | "";
}

export const EMPTY_FILTER: TaskFilter = { query: "", assignee: "", priority: "" };

/** 条件がひとつでも指定されているか。 */
export function isFilterActive(filter: TaskFilter): boolean {
  return (
    filter.query.trim() !== "" || filter.assignee !== "" || filter.priority !== ""
  );
}

/**
 * 条件をすべて満たす（AND）タスクだけを、元の順序を保って返す。
 * 検索は大文字小文字と前後の空白を無視した部分一致。条件が空なら元の状態をそのまま返す。
 */
export function filterTasks(state: BoardState, filter: TaskFilter): BoardState {
  if (!isFilterActive(filter)) return state;

  const query = filter.query.trim().toLowerCase();
  return state.filter(
    (task) =>
      (query === "" ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)) &&
      (filter.assignee === "" || task.assignee === filter.assignee) &&
      (filter.priority === "" || task.priority === filter.priority),
  );
}

/** 絞り込みの選択肢用に、担当者名を重複なし・出現順で返す（未設定は除く）。 */
export function assigneesOf(state: BoardState): readonly string[] {
  return [
    ...new Set(state.map((task) => task.assignee).filter((name) => name !== "")),
  ];
}

export function boardReducer(
  state: BoardState,
  action: BoardAction,
): BoardState {
  switch (action.type) {
    case "add":
      return isValidDraft(action.draft)
        ? addTask(state, createTask(action.draft, action.id))
        : state;
    case "move":
      return moveTask(state, action.taskId, action.status);
  }
}
