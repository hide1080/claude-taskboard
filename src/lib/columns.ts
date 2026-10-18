import type { TaskStatus } from "@/types/task";

export interface ColumnDefinition {
  status: TaskStatus;
  label: string;
}

/** 列の並び順と表示名。画面もテストもこの定義を唯一の情報源とする。 */
export const COLUMNS: readonly ColumnDefinition[] = [
  { status: "todo", label: "未着手" },
  { status: "in-progress", label: "進行中" },
  { status: "hold", label: "保留" },
  { status: "done", label: "完了" },
];

/** ステータスの表示名を返す。未知のステータスならそのまま返す。 */
export function columnLabel(status: TaskStatus): string {
  return COLUMNS.find((column) => column.status === status)?.label ?? status;
}

/**
 * 指定ステータスから offset 列ぶん隣のステータスを返す。
 * 端を越える場合は null（= これ以上動かせない）。
 */
export function adjacentStatus(
  status: TaskStatus,
  offset: number,
): TaskStatus | null {
  const index = COLUMNS.findIndex((column) => column.status === status);
  if (index === -1) return null;

  const next = COLUMNS[index + offset];
  return next ? next.status : null;
}
