"use client";

import { useCallback, useMemo, useReducer } from "react";
import {
  boardReducer,
  createTaskId,
  tasksInColumn,
  type BoardState,
} from "@/lib/board";
import { COLUMNS } from "@/lib/columns";
import type { Task, TaskDraft, TaskStatus } from "@/types/task";

export interface UseBoardOptions {
  initialTasks?: BoardState;
  /** テストで id を固定したいときに差し替える。 */
  generateId?: () => string;
}

export interface BoardColumn {
  status: TaskStatus;
  label: string;
  tasks: readonly Task[];
}

export interface UseBoardResult {
  columns: readonly BoardColumn[];
  addTask: (draft: TaskDraft) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
}

/** ボードの状態と操作をまとめる。描画の都合（列への振り分け）もここで担う。 */
export function useBoard({
  initialTasks = [],
  generateId = createTaskId,
}: UseBoardOptions = {}): UseBoardResult {
  const [tasks, dispatch] = useReducer(boardReducer, initialTasks);

  const addTask = useCallback(
    (draft: TaskDraft) => {
      dispatch({ type: "add", draft, id: generateId() });
    },
    [generateId],
  );

  const moveTask = useCallback((taskId: string, status: TaskStatus) => {
    dispatch({ type: "move", taskId, status });
  }, []);

  const columns = useMemo(
    () =>
      COLUMNS.map((column) => ({
        status: column.status,
        label: column.label,
        tasks: tasksInColumn(tasks, column.status),
      })),
    [tasks],
  );

  return { columns, addTask, moveTask };
}
