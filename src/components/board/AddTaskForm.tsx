"use client";

import { useState, type FormEvent } from "react";
import { COLUMNS } from "@/lib/columns";
import { DEFAULT_PRIORITY, PRIORITIES } from "@/lib/priorities";
import type { TaskDraft, TaskPriority, TaskStatus } from "@/types/task";

export interface AddTaskFormProps {
  /** 開いたときに選んでおく列。 */
  initialStatus?: TaskStatus;
  onSubmit: (draft: TaskDraft) => void;
  onCancel?: () => void;
}

/** タスク追加フォーム。入力中の値だけを自前で持ち、確定したら親へ渡す。 */
export function AddTaskForm({
  initialStatus = COLUMNS[0].status,
  onSubmit,
  onCancel,
}: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY);
  const [dueDate, setDueDate] = useState("");

  const canSubmit = title.trim() !== "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit({ title, description, status, assignee, priority, dueDate });
    setTitle("");
    setDescription("");
    setAssignee("");
    setPriority(DEFAULT_PRIORITY);
    setDueDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="新しいタスク"
      className="mb-8 flex flex-col gap-4 rounded-xl bg-surface p-5 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <Field label="タイトル" className="sm:flex-1">
        <input
          id="task-title"
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例: ログイン画面を実装する"
          className={inputClass}
        />
      </Field>

      <Field label="説明" className="sm:flex-[2]">
        <input
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="任意"
          className={inputClass}
        />
      </Field>

      <Field label="列">
        <select
          id="task-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          className={inputClass}
        >
          {COLUMNS.map((column) => (
            <option key={column.status} value={column.status}>
              {column.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="担当者">
        <input
          id="task-assignee"
          value={assignee}
          onChange={(event) => setAssignee(event.target.value)}
          placeholder="任意"
          className={inputClass}
        />
      </Field>

      <Field label="優先度">
        <select
          id="task-priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskPriority)}
          className={inputClass}
        >
          {PRIORITIES.map((p) => (
            <option key={p.priority} value={p.priority}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="期限">
        <input
          id="task-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-accent px-5 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          追加
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2.5 text-[14px] text-muted transition-colors hover:text-foreground"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-background px-3 py-2.5 text-[14px] outline-none focus:border-[#b9b7af]";

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactElement<{ id?: string }>;
}) {
  const id = children.props.id;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[12px] text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
