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

function renderCard(overrides: Partial<Task> = {}) {
  const handlers = {
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onMove: vi.fn(),
  };

  render(
    <ul>
      <TaskCard task={{ ...task, ...overrides }} isDragging={false} {...handlers} />
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
