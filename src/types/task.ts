/** カンバンボードの列を識別するステータス。 */
export type TaskStatus = "todo" | "in-progress" | "hold" | "done";

/** ボード上の 1 枚のカードに対応するタスク。 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

/** 新規タスクの入力値。id はアプリ側で払い出す。 */
export interface TaskDraft {
  title: string;
  description: string;
  status: TaskStatus;
}
