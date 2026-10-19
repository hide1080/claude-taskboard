"use client";

import { isFilterActive, EMPTY_FILTER, type TaskFilter } from "@/lib/board";
import { PRIORITIES } from "@/lib/priorities";
import type { TaskPriority } from "@/types/task";

export interface BoardToolbarProps {
  filter: TaskFilter;
  /** 絞り込みの選択肢にする担当者名。 */
  assignees: readonly string[];
  onChange: (filter: TaskFilter) => void;
}

/** 検索語と、担当者・優先度の絞り込み。値は受け取って描画し、変更を親へ通知するだけ。 */
export function BoardToolbar({ filter, assignees, onChange }: BoardToolbarProps) {
  return (
    <div
      role="search"
      className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
    >
      <input
        type="search"
        aria-label="タスクを検索"
        value={filter.query}
        onChange={(event) => onChange({ ...filter, query: event.target.value })}
        placeholder="タイトル・説明を検索"
        className={`${controlClass} sm:w-72`}
      />

      <select
        aria-label="担当者で絞り込み"
        value={filter.assignee}
        onChange={(event) => onChange({ ...filter, assignee: event.target.value })}
        className={controlClass}
      >
        <option value="">すべての担当者</option>
        {assignees.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <select
        aria-label="優先度で絞り込み"
        value={filter.priority}
        onChange={(event) =>
          onChange({
            ...filter,
            priority: event.target.value as TaskPriority | "",
          })
        }
        className={controlClass}
      >
        <option value="">すべての優先度</option>
        {PRIORITIES.map((p) => (
          <option key={p.priority} value={p.priority}>
            {p.label}
          </option>
        ))}
      </select>

      {isFilterActive(filter) && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTER)}
          className="rounded-lg px-3 py-2.5 text-[14px] text-muted transition-colors hover:text-foreground"
        >
          条件をクリア
        </button>
      )}
    </div>
  );
}

const controlClass =
  "rounded-lg border border-line bg-background px-3 py-2.5 text-[14px] outline-none focus:border-[#b9b7af]";
