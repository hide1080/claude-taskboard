import type { TaskPriority } from "@/types/task";

export interface PriorityDefinition {
  priority: TaskPriority;
  label: string;
}

/** 優先度の並び順（高い順）と表示名。画面もテストもこの定義を唯一の情報源とする。 */
export const PRIORITIES: readonly PriorityDefinition[] = [
  { priority: "high", label: "高" },
  { priority: "medium", label: "中" },
  { priority: "low", label: "低" },
];

/** 追加フォームの初期値。 */
export const DEFAULT_PRIORITY: TaskPriority = "medium";

/** 優先度の表示名を返す。未知の値ならそのまま返す。 */
export function priorityLabel(priority: TaskPriority): string {
  return PRIORITIES.find((p) => p.priority === priority)?.label ?? priority;
}
