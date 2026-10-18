"use client";

import { useState } from "react";
import { AddColumnPlaceholder } from "@/components/board/AddColumnPlaceholder";
import { AddTaskForm } from "@/components/board/AddTaskForm";
import { BoardHeader } from "@/components/board/BoardHeader";
import { Column } from "@/components/board/Column";
import { COLUMNS } from "@/lib/columns";
import { useBoard, type UseBoardOptions } from "@/hooks/useBoard";
import type { TaskDraft, TaskStatus } from "@/types/task";

export type BoardProps = UseBoardOptions;

/** ボード全体のまとめ役。状態は useBoard、画面の一時状態だけここで持つ。 */
export function Board(options: BoardProps = {}) {
  const { columns, addTask, moveTask } = useBoard(options);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  /** 追加フォームを開いている列。null なら閉じている。 */
  const [composerStatus, setComposerStatus] = useState<TaskStatus | null>(null);

  const taskCount = columns.reduce(
    (total, column) => total + column.tasks.length,
    0,
  );

  function handleSubmit(draft: TaskDraft) {
    addTask(draft);
    setComposerStatus(null);
  }

  return (
    <div className="px-6 py-10 sm:px-12 lg:px-20 lg:py-12">
      <BoardHeader
        taskCount={taskCount}
        onAddTaskClick={() => setComposerStatus(COLUMNS[0].status)}
      />

      {composerStatus !== null && (
        <AddTaskForm
          // 開いた列を初期値にするため、開くたびに作り直す。
          key={composerStatus}
          initialStatus={composerStatus}
          onSubmit={handleSubmit}
          onCancel={() => setComposerStatus(null)}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:min-h-[calc(100vh-14rem)] lg:grid-cols-5 lg:gap-11">
        {columns.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={column.tasks}
            draggingTaskId={draggingTaskId}
            onDragStart={setDraggingTaskId}
            onDragEnd={() => setDraggingTaskId(null)}
            onDropTask={(taskId, status) => {
              moveTask(taskId, status);
              setDraggingTaskId(null);
            }}
            onMoveTask={moveTask}
            onAddTaskClick={setComposerStatus}
          />
        ))}
        <AddColumnPlaceholder />
      </div>
    </div>
  );
}
