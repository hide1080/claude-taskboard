"use client";

import { useState, type DragEvent } from "react";
import { TaskCard } from "@/components/board/TaskCard";
import { getDragTaskId } from "@/lib/dragData";
import type { Task, TaskStatus } from "@/types/task";

export interface ColumnProps {
  status: TaskStatus;
  label: string;
  tasks: readonly Task[];
  /** ドラッグ中のタスク id。ドラッグしていなければ null。 */
  draggingTaskId: string | null;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDropTask: (taskId: string, status: TaskStatus) => void;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onAddTaskClick: (status: TaskStatus) => void;
}

/** 1 列ぶんの表示とドロップ受け入れを担う。 */
export function Column({
  status,
  label,
  tasks,
  draggingTaskId,
  onDragStart,
  onDragEnd,
  onDropTask,
  onMoveTask,
  onAddTaskClick,
}: ColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const isDragging = draggingTaskId !== null;

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!isDragging) return;

    // preventDefault を呼ばないとドロップが許可されない。
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsOver(true);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsOver(false);

    // dataTransfer が読めない環境では、親が保持している id にフォールバックする。
    const taskId = getDragTaskId(event.dataTransfer) ?? draggingTaskId;
    if (taskId !== null) onDropTask(taskId, status);
  }

  return (
    <section
      aria-labelledby={`column-${status}`}
      data-testid={`column-${status}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col rounded-xl px-4 pt-4 pb-5 transition-colors ${
        isOver ? "bg-[#dedcd5]" : "bg-column"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h2
          id={`column-${status}`}
          className="flex items-baseline gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span>{label}</span>
          <span
            aria-label={`${label}のタスク数`}
            className="text-[13px] font-normal text-muted"
          >
            #{tasks.length}
          </span>
        </h2>
        <DotsMenuGlyph />
      </div>

      <button
        type="button"
        onClick={() => onAddTaskClick(status)}
        className="mt-3 mb-4 flex items-center gap-2 px-1 text-[13px] text-muted transition-colors hover:text-foreground"
      >
        <PlusIcon />
        タスクを追加
      </button>

      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isDragging={task.id === draggingTaskId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onMove={onMoveTask}
          />
        ))}
        {/* デザインの静止状態にはプレースホルダが無いので、
            ドロップ先が分かると助かるドラッグ中だけ出す。 */}
        {isDragging && tasks.length === 0 && (
          <li className="rounded-lg border border-dashed border-[#c9c7bf] py-6 text-center text-[12.5px] text-muted">
            ここにドロップ
          </li>
        )}
      </ul>
    </section>
  );
}

/** デザインに合わせた装飾。メニューの中身はまだ無いので操作子にはしない。 */
function DotsMenuGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 4"
      className="h-1 w-4 fill-[#a8a69f]"
    >
      <circle cx="2" cy="2" r="1.6" />
      <circle cx="8" cy="2" r="1.6" />
      <circle cx="14" cy="2" r="1.6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 14"
      className="h-3.5 w-3.5 stroke-current"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    >
      <path d="M7 1.5v11M1.5 7h11" />
    </svg>
  );
}
