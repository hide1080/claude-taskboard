/** カンバンボードの列を識別するステータス。 */
export type TaskStatus = "todo" | "in-progress" | "hold" | "done";

/** タスクの優先度。 */
export type TaskPriority = "high" | "medium" | "low";

/** ボード上の 1 枚のカードに対応するタスク。 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  /** 担当者名。未設定は空文字。 */
  assignee: string;
  priority: TaskPriority;
  /** 期限（YYYY-MM-DD）。未設定は空文字。 */
  dueDate: string;
}

/** 新規タスクの入力値。id はアプリ側で払い出す。 */
export interface TaskDraft {
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  priority: TaskPriority;
  dueDate: string;
}
