import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Board } from "@/components/board/Board";
import { createDataTransfer } from "@/test/dataTransfer";
import type { Task } from "@/types/task";

const initialTasks: Task[] = [
  { id: "task-1", title: "設計する", description: "画面構成", status: "todo" },
  { id: "task-2", title: "実装する", description: "", status: "in-progress" },
];

/** 移動ボタンはホバー時だけ押せるが、jsdom は :hover を評価しない。 */
function setupUser() {
  return userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
}

function column(status: string) {
  return within(screen.getByTestId(`column-${status}`));
}

function countOf(status: string, label: string) {
  return column(status).getByLabelText(`${label}のタスク数`);
}

/** TaskCard を column へドラッグ&ドロップする。 */
function dragAndDrop(taskId: string, toStatus: string) {
  const dataTransfer = createDataTransfer();
  const card = screen.getByTestId(`task-${taskId}`);

  fireEvent.dragStart(card, { dataTransfer });
  const target = screen.getByTestId(`column-${toStatus}`);
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
  fireEvent.dragEnd(card, { dataTransfer });
}

describe("Board", () => {
  it("初期タスクを対応する列に表示する", () => {
    render(<Board initialTasks={initialTasks} />);

    expect(column("todo").getByText("設計する")).toBeInTheDocument();
    expect(column("in-progress").getByText("実装する")).toBeInTheDocument();
    expect(countOf("done", "完了")).toHaveTextContent("0");
  });

  it("ヘッダーに総タスク数を表示する", () => {
    render(<Board initialTasks={initialTasks} />);

    expect(screen.getByText("2件のタスク")).toBeInTheDocument();
  });

  it("追加フォームは最初は閉じていて、新規タスクで開く", async () => {
    const user = setupUser();
    render(<Board initialTasks={initialTasks} />);

    expect(screen.queryByRole("form", { name: "新しいタスク" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "新規タスク" }));

    expect(screen.getByRole("form", { name: "新しいタスク" })).toBeInTheDocument();
    expect(screen.getByLabelText("列")).toHaveValue("todo");
  });

  it("列のタスクを追加ボタンはその列を初期値にしてフォームを開く", async () => {
    const user = setupUser();
    render(<Board initialTasks={initialTasks} />);

    await user.click(
      column("done").getByRole("button", { name: "タスクを追加" }),
    );

    expect(screen.getByLabelText("列")).toHaveValue("done");
  });

  it("フォームから追加したタスクが指定した列に並ぶ", async () => {
    const user = setupUser();
    let next = 0;
    render(<Board initialTasks={[]} generateId={() => `generated-${++next}`} />);

    await user.click(screen.getByRole("button", { name: "新規タスク" }));
    await user.type(screen.getByLabelText("タイトル"), "テストを書く");
    await user.selectOptions(screen.getByLabelText("列"), "in-progress");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(column("in-progress").getByText("テストを書く")).toBeInTheDocument();
    expect(countOf("in-progress", "進行中")).toHaveTextContent("1");
    // 追加したらフォームは閉じる。
    expect(screen.queryByRole("form", { name: "新しいタスク" })).not.toBeInTheDocument();
  });

  it("ドラッグ&ドロップでタスクが別の列へ移動する", () => {
    render(<Board initialTasks={initialTasks} />);

    dragAndDrop("task-1", "done");

    expect(column("done").getByText("設計する")).toBeInTheDocument();
    expect(column("todo").queryByText("設計する")).not.toBeInTheDocument();
    expect(countOf("todo", "未着手")).toHaveTextContent("0");
  });

  it("同じ列にドロップしても並びは変わらない", () => {
    render(<Board initialTasks={initialTasks} />);

    dragAndDrop("task-2", "in-progress");

    expect(column("in-progress").getByText("実装する")).toBeInTheDocument();
  });

  it("移動ボタンでもタスクが別の列へ移動する", async () => {
    const user = setupUser();
    render(<Board initialTasks={initialTasks} />);

    await user.click(
      column("todo").getByRole("button", { name: "進行中へ移動" }),
    );

    expect(column("in-progress").getByText("設計する")).toBeInTheDocument();
    expect(countOf("in-progress", "進行中")).toHaveTextContent("2");
  });

  it("カラムを追加の枠は表示するだけで操作子にしない", () => {
    render(<Board initialTasks={initialTasks} />);

    expect(screen.getByText("カラムを追加")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "カラムを追加" }),
    ).not.toBeInTheDocument();
  });
});
