import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Board } from "@/components/board/Board";
import { createDataTransfer } from "@/test/dataTransfer";
import type { Task } from "@/types/task";

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "設計する",
    description: "画面構成",
    status: "todo",
    assignee: "",
    priority: "medium",
    dueDate: "",
  },
  {
    id: "task-2",
    title: "実装する",
    description: "",
    status: "in-progress",
    assignee: "",
    priority: "medium",
    dueDate: "",
  },
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

  it("担当者・優先度・期限を入力して追加するとカードに表示される", async () => {
    const user = setupUser();
    render(<Board initialTasks={[]} generateId={() => "generated-1"} />);

    await user.click(screen.getByRole("button", { name: "新規タスク" }));
    await user.type(screen.getByLabelText("タイトル"), "テストを書く");
    await user.type(screen.getByLabelText("担当者"), "田中");
    await user.selectOptions(screen.getByLabelText("優先度"), "high");
    await user.type(screen.getByLabelText("期限"), "2999-12-31");
    await user.click(screen.getByRole("button", { name: "追加" }));

    const card = within(screen.getByTestId("task-generated-1"));
    expect(card.getByText("優先度: 高")).toBeInTheDocument();
    expect(card.getByText("担当: 田中")).toBeInTheDocument();
    expect(card.getByText("期限: 2999-12-31")).toBeInTheDocument();
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

  describe("検索・フィルター", () => {
    const filterTasks: Task[] = [
      {
        id: "a",
        title: "API を設計する",
        description: "REST の仕様",
        status: "todo",
        assignee: "田中",
        priority: "high",
        dueDate: "",
      },
      {
        id: "b",
        title: "画面を作る",
        description: "",
        status: "todo",
        assignee: "佐藤",
        priority: "low",
        dueDate: "",
      },
      {
        id: "c",
        title: "テストを書く",
        description: "",
        status: "in-progress",
        assignee: "田中",
        priority: "low",
        dueDate: "",
      },
    ];

    it("タイトルや説明の検索でカードが絞り込まれる", async () => {
      const user = setupUser();
      render(<Board initialTasks={filterTasks} />);

      await user.type(screen.getByRole("searchbox", { name: "タスクを検索" }), "rest");

      expect(screen.getByText("API を設計する")).toBeInTheDocument();
      expect(screen.queryByText("画面を作る")).not.toBeInTheDocument();
      expect(screen.queryByText("テストを書く")).not.toBeInTheDocument();
      expect(screen.getByText("3件中1件を表示")).toBeInTheDocument();
    });

    it("担当者と優先度を組み合わせて絞り込める", async () => {
      const user = setupUser();
      render(<Board initialTasks={filterTasks} />);

      await user.selectOptions(screen.getByLabelText("担当者で絞り込み"), "田中");
      await user.selectOptions(screen.getByLabelText("優先度で絞り込み"), "low");

      expect(screen.getByText("テストを書く")).toBeInTheDocument();
      expect(screen.queryByText("API を設計する")).not.toBeInTheDocument();
      expect(screen.queryByText("画面を作る")).not.toBeInTheDocument();
    });

    it("クリアすると全件が戻り、件数表示も元に戻る", async () => {
      const user = setupUser();
      render(<Board initialTasks={filterTasks} />);

      await user.selectOptions(screen.getByLabelText("優先度で絞り込み"), "high");
      await user.click(screen.getByRole("button", { name: "条件をクリア" }));

      expect(screen.getByText("API を設計する")).toBeInTheDocument();
      expect(screen.getByText("画面を作る")).toBeInTheDocument();
      expect(screen.getByText("テストを書く")).toBeInTheDocument();
      expect(screen.getByText("3件のタスク")).toBeInTheDocument();
    });

    it("絞り込み中でもカードを別の列へ移動できる", () => {
      render(<Board initialTasks={filterTasks} />);

      dragAndDrop("a", "done");

      expect(column("done").getByText("API を設計する")).toBeInTheDocument();
    });

    it("担当者の選択肢は追加したタスクの担当者も含む", async () => {
      const user = setupUser();
      render(<Board initialTasks={filterTasks} generateId={() => "new-1"} />);

      await user.click(screen.getByRole("button", { name: "新規タスク" }));
      await user.type(screen.getByLabelText("タイトル"), "新しい仕事");
      await user.type(screen.getByLabelText("担当者"), "鈴木");
      await user.click(screen.getByRole("button", { name: "追加" }));

      expect(
        within(screen.getByLabelText("担当者で絞り込み")).getByRole("option", {
          name: "鈴木",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("永続化", () => {
    it("追加したタスクは再読み込み（再マウント）後も残る", async () => {
      const user = setupUser();
      const first = render(
        <Board initialTasks={initialTasks} generateId={() => "saved-1"} />,
      );

      await user.click(screen.getByRole("button", { name: "新規タスク" }));
      await user.type(screen.getByLabelText("タイトル"), "忘れてはいけない");
      await user.click(screen.getByRole("button", { name: "追加" }));
      first.unmount();

      render(<Board initialTasks={initialTasks} />);

      expect(column("todo").getByText("忘れてはいけない")).toBeInTheDocument();
      expect(screen.getByText("3件のタスク")).toBeInTheDocument();
    });

    it("ドラッグで移動した列も再読み込み後に保たれる", () => {
      const first = render(<Board initialTasks={initialTasks} />);

      dragAndDrop("task-1", "done");
      first.unmount();

      render(<Board initialTasks={initialTasks} />);

      expect(column("done").getByText("設計する")).toBeInTheDocument();
      expect(column("todo").queryByText("設計する")).not.toBeInTheDocument();
    });

    it("検索語は保存せず、再読み込み後は空に戻る", async () => {
      const user = setupUser();
      const first = render(<Board initialTasks={initialTasks} />);
      await user.type(screen.getByRole("searchbox", { name: "タスクを検索" }), "設計");
      first.unmount();

      render(<Board initialTasks={initialTasks} />);

      expect(screen.getByRole("searchbox", { name: "タスクを検索" })).toHaveValue("");
      expect(screen.getByText("実装する")).toBeInTheDocument();
    });
  });

  it("カラムを追加の枠は表示するだけで操作子にしない", () => {
    render(<Board initialTasks={initialTasks} />);

    expect(screen.getByText("カラムを追加")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "カラムを追加" }),
    ).not.toBeInTheDocument();
  });
});
