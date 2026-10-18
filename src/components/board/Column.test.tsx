import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Column } from "@/components/board/Column";
import { setDragTaskId } from "@/lib/dragData";
import { createDataTransfer } from "@/test/dataTransfer";
import type { Task } from "@/types/task";

const tasks: Task[] = [
  { id: "task-1", title: "設計する", description: "", status: "todo" },
];

function renderColumn({
  draggingTaskId = null,
  columnTasks = tasks,
}: { draggingTaskId?: string | null; columnTasks?: Task[] } = {}) {
  const onDropTask = vi.fn();
  const onAddTaskClick = vi.fn();

  render(
    <Column
      status="done"
      label="完了"
      tasks={columnTasks}
      draggingTaskId={draggingTaskId}
      onDragStart={vi.fn()}
      onDragEnd={vi.fn()}
      onDropTask={onDropTask}
      onMoveTask={vi.fn()}
      onAddTaskClick={onAddTaskClick}
    />,
  );

  return { onDropTask, onAddTaskClick, column: screen.getByTestId("column-done") };
}

describe("Column", () => {
  it("列名とタスク数を表示する", () => {
    renderColumn();

    expect(screen.getByRole("heading", { name: /完了/ })).toBeInTheDocument();
    expect(screen.getByLabelText("完了のタスク数")).toHaveTextContent("1");
  });

  it("タスクを追加ボタンが自分のステータスを通知する", async () => {
    const { onAddTaskClick } = renderColumn();

    await userEvent.click(screen.getByRole("button", { name: "タスクを追加" }));

    expect(onAddTaskClick).toHaveBeenCalledWith("done");
  });

  it("drop で dataTransfer のタスク id と自分のステータスを通知する", () => {
    const { onDropTask, column } = renderColumn({ draggingTaskId: "task-1" });
    const dataTransfer = createDataTransfer();
    setDragTaskId(dataTransfer, "task-1");

    fireEvent.drop(column, { dataTransfer });

    expect(onDropTask).toHaveBeenCalledWith("task-1", "done");
  });

  it("dataTransfer が空ならドラッグ中の id にフォールバックする", () => {
    const { onDropTask, column } = renderColumn({ draggingTaskId: "task-9" });

    fireEvent.drop(column, { dataTransfer: createDataTransfer() });

    expect(onDropTask).toHaveBeenCalledWith("task-9", "done");
  });

  it("ドラッグ中でなければ drop しても何も起きない", () => {
    const { onDropTask, column } = renderColumn();

    fireEvent.drop(column, { dataTransfer: createDataTransfer() });

    expect(onDropTask).not.toHaveBeenCalled();
  });

  it("空の列のプレースホルダはドラッグ中だけ出す", () => {
    const { rerender } = render(
      <Column
        status="todo"
        label="未着手"
        tasks={[]}
        draggingTaskId={null}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
        onDropTask={vi.fn()}
        onMoveTask={vi.fn()}
        onAddTaskClick={vi.fn()}
      />,
    );

    expect(screen.queryByText("ここにドロップ")).not.toBeInTheDocument();

    rerender(
      <Column
        status="todo"
        label="未着手"
        tasks={[]}
        draggingTaskId="task-1"
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
        onDropTask={vi.fn()}
        onMoveTask={vi.fn()}
        onAddTaskClick={vi.fn()}
      />,
    );

    expect(screen.getByText("ここにドロップ")).toBeInTheDocument();
  });
});
