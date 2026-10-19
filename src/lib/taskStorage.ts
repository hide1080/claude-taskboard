import { COLUMNS } from "@/lib/columns";
import { PRIORITIES } from "@/lib/priorities";
import type { Task } from "@/types/task";

/** localStorage のキー。保存形式を変えるときはバージョンを上げる。 */
export const STORAGE_KEY = "taskboard:tasks:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.assignee === "string" &&
    typeof value.dueDate === "string" &&
    COLUMNS.some((column) => column.status === value.status) &&
    PRIORITIES.some((p) => p.priority === value.priority)
  );
}

/**
 * 保存された文字列をタスク配列に戻す。未保存・壊れた JSON・不正な要素を含む場合は null。
 * 一部だけ拾うと意図しない欠落になるので、ひとつでも不正なら全体を捨てる。
 */
export function parseStoredTasks(raw: string | null): Task[] | null {
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  return Array.isArray(parsed) && parsed.every(isTask) ? parsed : null;
}

export function serializeTasks(tasks: readonly Task[]): string {
  return JSON.stringify(tasks);
}
