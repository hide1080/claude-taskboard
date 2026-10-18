import type { Task, TaskDraft, TaskStatus } from "@/types/task";

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
  };
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
