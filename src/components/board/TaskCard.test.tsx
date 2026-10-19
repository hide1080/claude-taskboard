import { fireEvent, render, screen } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskCard } from "@/components/board/TaskCard";
import { getDragTaskId } from "@/lib/dragData";
import { createDataTransfer } from "@/test/dataTransfer";
import type { Task } from "@/types/task";

const task: Task = {
  id: "task-1",
  title: "設計する",
  description: "画面構成を決める",
  status: "in-progress",
  assignee: "",
  priority: "medium",
  dueDate: "",
};

/**
 * 移動ボタンはホバー時だけ pointer-events が有効になるが、
 * jsdom は :hover を評価しないのでチェックを無効にして押す。
 */
function setupUser() {
  return userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
}

function renderCard(overrides: Partial<Task> = {}, today = "2026-10-19") {
  const handlers = {
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onMove: vi.fn(),
  };

  render(
    <ul>
      <TaskCard
        task={{ ...task, ...overrides }}
        today={today}
        isDragging={false}
        {...handlers}
      />
    </ul>,
  );

  return handlers;
}

describe("TaskCard", () => {
  it("タイトルと説明を表示する", () => {
    renderCard();

    expect(screen.getByRole("heading", { name: "設計する" })).toBeInTheDocument();
    expect(screen.getByText("画面構成を決める")).toBeInTheDocument();
  });

  it("優先度・担当者・期限を表示する", () => {
    renderCard({ priority: "high", assignee: "田中", dueDate: "2026-10-31" });

    expect(screen.getByText("優先度: 高")).toBeInTheDocument();
    expect(screen.getByText("担当: 田中")).toBeInTheDocument();
    expect(screen.getByText("期限: 2026-10-31")).toBeInTheDocument();
  });

  it("担当者と期限が未設定なら表示しない（優先度は常に表示）", () => {
    renderCard();

    expect(screen.getByText("優先度: 中")).toBeInTheDocument();
    expect(screen.queryByText(/担当:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/期限:/)).not.toBeInTheDocument();
  });

  it("期限を過ぎた未完了タスクは期限切れと分かるようにする", () => {
    renderCard({ dueDate: "2026-10-18" });

    expect(screen.getByText("期限: 2026-10-18（期限切れ）")).toBeInTheDocument();
  });

  it.each([
    ["当日", { dueDate: "2026-10-19" }],
    ["完了済み", { dueDate: "2026-10-18", status: "done" as const }],
  ])("%s は期限切れにしない", (_name, overrides) => {
    renderCard(overrides);

    expect(screen.queryByText(/期限切れ/)).not.toBeInTheDocument();
  });

  it("dragstart でタスク id を dataTransfer に載せ、親に通知する", () => {
    const { onDragStart } = renderCard();
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(screen.getByTestId("task-task-1"), { dataTransfer });

    expect(getDragTaskId(dataTransfer)).toBe("task-1");
    expect(onDragStart).toHaveBeenCalledWith("task-1");
  });

  it("移動ボタンで隣の列へ動かせる", async () => {
    const user = setupUser();
    const { onMove } = renderCard();

    await user.click(screen.getByRole("button", { name: "保留へ移動" }));

    expect(onMove).toHaveBeenCalledWith("task-1", "hold");
  });

  it("端の列では行き先のない移動ボタンを無効化する", () => {
    renderCard({ status: "todo" });

    expect(
      screen.getByRole("button", { name: "←（これ以上移動できません）" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "進行中へ移動" })).toBeEnabled();
  });
});
