export interface BoardHeaderProps {
  taskCount: number;
  /** 絞り込み中だけ渡す。表示中の件数。 */
  visibleCount?: number;
  onAddTaskClick: () => void;
}

/** ボード名・総タスク数（絞り込み中は表示件数も）・新規タスクボタン。 */
export function BoardHeader({
  taskCount,
  visibleCount,
  onAddTaskClick,
}: BoardHeaderProps) {
  return (
    <header className="mb-10 flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-4">
        <h1 className="text-[34px] leading-none font-bold tracking-tight">
          TaskBoard
        </h1>
        <p className="text-[14px] text-muted">
          {visibleCount === undefined
            ? `${taskCount}件のタスク`
            : `${taskCount}件中${visibleCount}件を表示`}
        </p>
      </div>

      <button
        type="button"
        onClick={onAddTaskClick}
        className="flex items-center gap-2.5 rounded-lg bg-accent px-5 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-85"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 14 14"
          className="h-3.5 w-3.5 stroke-current"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M7 1.5v11M1.5 7h11" />
        </svg>
        新規タスク
      </button>
    </header>
  );
}
