"use client";

import { useCallback, useMemo } from "react";
import {
  EMPTY_FILTER,
  assigneesOf,
  createTaskId,
  filterTasks,
  tasksInColumn,
  type BoardState,
  type TaskFilter,
} from "@/lib/board";
import { COLUMNS } from "@/lib/columns";
import { useStoredTasks } from "@/hooks/useStoredTasks";
import type { Task, TaskDraft, TaskStatus } from "@/types/task";

export interface UseBoardOptions {
  /** 保存済みのタスクが無いときの初期値。 */
  initialTasks?: BoardState;
  /** テストで id を固定したいときに差し替える。 */
  generateId?: () => string;
  /** 検索・絞り込み条件。省略時は全件を表示する。 */
  filter?: TaskFilter;
}

export interface BoardColumn {
  status: TaskStatus;
  label: string;
  tasks: readonly Task[];
}

export interface UseBoardResult {
  /** 絞り込み後のタスクを列に振り分けたもの。 */
  columns: readonly BoardColumn[];
  /** 絞り込み前の総数。 */
  totalCount: number;
  /** 絞り込み後に表示されている数。 */
  visibleCount: number;
  /** 絞り込みの選択肢用。絞り込み前の全タスクから作る。 */
  assignees: readonly string[];
  addTask: (draft: TaskDraft) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
}

/** ボードの状態と操作をまとめる。描画の都合（絞り込みと列への振り分け）もここで担う。 */
export function useBoard({
  initialTasks = [],
  generateId = createTaskId,
  filter = EMPTY_FILTER,
}: UseBoardOptions = {}): UseBoardResult {
  const [tasks, dispatch] = useStoredTasks(initialTasks);

  const addTask = useCallback(
    (draft: TaskDraft) => {
      dispatch({ type: "add", draft, id: generateId() });
    },
    [dispatch, generateId],
  );

  const moveTask = useCallback(
    (taskId: string, status: TaskStatus) => {
      dispatch({ type: "move", taskId, status });
    },
    [dispatch],
  );

  const { query, assignee, priority } = filter;
  const visibleTasks = useMemo(
    () => filterTasks(tasks, { query, assignee, priority }),
    [tasks, query, assignee, priority],
  );

  const columns = useMemo(
    () =>
      COLUMNS.map((column) => ({
        status: column.status,
        label: column.label,
        tasks: tasksInColumn(visibleTasks, column.status),
      })),
    [visibleTasks],
  );

  const assignees = useMemo(() => assigneesOf(tasks), [tasks]);

  return {
    columns,
    totalCount: tasks.length,
    visibleCount: visibleTasks.length,
    assignees,
    addTask,
    moveTask,
  };
}
