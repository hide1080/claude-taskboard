/**
 * デザインの 4 枠目。カラム追加はまだ実装しないので、
 * 枠だけを出して操作子にはしない。
 */
export function AddColumnPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center rounded-xl bg-column-ghost"
    >
      <div className="flex flex-col items-center gap-2 text-muted">
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4 stroke-current"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M8 2v12M2 8h12" />
        </svg>
        <span className="text-[13px]">カラムを追加</span>
      </div>
    </div>
  );
}
