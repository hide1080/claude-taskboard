"use client";

import type { DragEvent } from "react";
import { adjacentStatus, columnLabel } from "@/lib/columns";
import { setDragTaskId } from "@/lib/dragData";
import type { Task, TaskStatus } from "@/types/task";

export interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onMove: (taskId: string, status: TaskStatus) => void;
}

/** 1 タスクを表すドラッグ可能なカード。状態は持たず、操作は親へ通知する。 */
export function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onMove,
}: TaskCardProps) {
  const previous = adjacentStatus(task.status, -1);
  const next = adjacentStatus(task.status, 1);

  function handleDragStart(event: DragEvent<HTMLLIElement>) {
    setDragTaskId(event.dataTransfer, task.id);
    onDragStart(task.id);
  }

  return (
    <li
      draggable
      aria-grabbed={isDragging}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      data-testid={`task-${task.id}`}
      className={`group relative cursor-grab rounded-lg bg-surface px-5 py-4 transition active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <h3 className="text-[15px] leading-snug font-semibold tracking-tight break-words">
        {task.title}
      </h3>
      {task.description !== "" && (
        <p className="mt-1.5 text-[12.5px] leading-relaxed break-words text-muted">
          {task.description}
        </p>
      )}

      {/* デザイン上カードに操作子は出さないが、ドラッグはキーボードから使えない。
          ホバーとフォーカス時だけ現れる移動ボタンで代替手段を残す。 */}
      <div className="pointer-events-none absolute top-2.5 right-2.5 flex gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
        <MoveButton
          direction="prev"
          target={previous}
          onClick={() => previous && onMove(task.id, previous)}
        />
        <MoveButton
          direction="next"
          target={next}
          onClick={() => next && onMove(task.id, next)}
        />
      </div>
    </li>
  );
}

function MoveButton({
  direction,
  target,
  onClick,
}: {
  direction: "prev" | "next";
  target: TaskStatus | null;
  onClick: () => void;
}) {
  const arrow = direction === "prev" ? "←" : "→";
  const label =
    target === null
      ? `${arrow}（これ以上移動できません）`
      : `${columnLabel(target)}へ移動`;

  return (
    <button
      type="button"
      disabled={target === null}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-md bg-background px-1.5 py-0.5 text-[11px] leading-5 text-muted enabled:hover:text-foreground disabled:opacity-30"
    >
      {arrow}
    </button>
  );
}
