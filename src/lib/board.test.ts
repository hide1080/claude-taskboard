import { describe, expect, it } from "vitest";
import {
  addTask,
  boardReducer,
  createTask,
  isValidDraft,
  moveTask,
  tasksInColumn,
  type BoardState,
} from "@/lib/board";
import type { Task } from "@/types/task";

const task = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: `task ${id}`,
  description: "",
  status: "todo",
  ...overrides,
});

describe("createTask", () => {
  it("タイトルと説明の前後の空白を落とす", () => {
    const created = createTask(
      { title: "  設計する  ", description: "  メモ  ", status: "todo" },
      "id-1",
    );

    expect(created).toEqual({
      id: "id-1",
      title: "設計する",
      description: "メモ",
      status: "todo",
    });
  });
});

describe("isValidDraft", () => {
  it.each([
    ["通常のタイトル", "設計する", true],
    ["空文字", "", false],
    ["空白のみ", "   ", false],
  ])("%s は %s → %s", (_name, title, expected) => {
    expect(
      isValidDraft({ title: title as string, description: "", status: "todo" }),
    ).toBe(expected);
  });
});

describe("addTask", () => {
  it("末尾に追加し、元の配列は変更しない", () => {
    const state: BoardState = [task("a")];

    const next = addTask(state, task("b"));

    expect(next.map((t) => t.id)).toEqual(["a", "b"]);
    expect(state).toHaveLength(1);
  });
});

describe("moveTask", () => {
  it("指定したタスクだけステータスが変わる", () => {
    const state: BoardState = [task("a"), task("b")];

    const next = moveTask(state, "a", "in-progress");

    expect(next.find((t) => t.id === "a")?.status).toBe("in-progress");
    expect(next.find((t) => t.id === "b")?.status).toBe("todo");
  });

  it("元の配列を書き換えない", () => {
    const state: BoardState = [task("a")];

    moveTask(state, "a", "done");

    expect(state[0].status).toBe("todo");
  });

  it("同じステータスへの移動では同一参照を返す", () => {
    const state: BoardState = [task("a", { status: "done" })];

    expect(moveTask(state, "a", "done")).toBe(state);
  });

  it("存在しない id なら同一参照を返す", () => {
    const state: BoardState = [task("a")];

    expect(moveTask(state, "missing", "done")).toBe(state);
  });
});

describe("tasksInColumn", () => {
  it("該当する列のタスクだけを追加順で返す", () => {
    const state: BoardState = [
      task("a", { status: "todo" }),
      task("b", { status: "done" }),
      task("c", { status: "todo" }),
    ];

    expect(tasksInColumn(state, "todo").map((t) => t.id)).toEqual(["a", "c"]);
  });
});

describe("boardReducer", () => {
  it("add でタスクを追加する", () => {
    const next = boardReducer([], {
      type: "add",
      draft: { title: "設計する", description: "", status: "in-progress" },
      id: "id-1",
    });

    expect(next).toEqual([
      {
        id: "id-1",
        title: "設計する",
        description: "",
        status: "in-progress",
      },
    ]);
  });

  it("タイトルが空の add は無視する", () => {
    const state: BoardState = [];

    expect(
      boardReducer(state, {
        type: "add",
        draft: { title: "  ", description: "説明だけ", status: "todo" },
        id: "id-1",
      }),
    ).toBe(state);
  });

  it("move でステータスを更新する", () => {
    const next = boardReducer([task("a")], {
      type: "move",
      taskId: "a",
      status: "done",
    });

    expect(next[0].status).toBe("done");
  });
});
