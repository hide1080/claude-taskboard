import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTER,
  addTask,
  assigneesOf,
  boardReducer,
  createTask,
  filterTasks,
  isOverdue,
  isValidDraft,
  moveTask,
  tasksInColumn,
  toISODate,
  type BoardState,
} from "@/lib/board";
import type { Task, TaskDraft } from "@/types/task";

const task = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: `task ${id}`,
  description: "",
  status: "todo",
  assignee: "",
  priority: "medium",
  dueDate: "",
  ...overrides,
});

const draft = (overrides: Partial<TaskDraft> = {}): TaskDraft => ({
  title: "設計する",
  description: "",
  status: "todo",
  assignee: "",
  priority: "medium",
  dueDate: "",
  ...overrides,
});

describe("createTask", () => {
  it("タイトル・説明・担当者の前後の空白を落とす", () => {
    const created = createTask(
      draft({
        title: "  設計する  ",
        description: "  メモ  ",
        assignee: "  田中  ",
      }),
      "id-1",
    );

    expect(created).toEqual({
      id: "id-1",
      title: "設計する",
      description: "メモ",
      status: "todo",
      assignee: "田中",
      priority: "medium",
      dueDate: "",
    });
  });

  it("優先度と期限はそのまま保持する", () => {
    const created = createTask(
      draft({ priority: "high", dueDate: "2026-10-31" }),
      "id-1",
    );

    expect(created.priority).toBe("high");
    expect(created.dueDate).toBe("2026-10-31");
  });
});

describe("isValidDraft", () => {
  it.each([
    ["通常のタイトル", "設計する", true],
    ["空文字", "", false],
    ["空白のみ", "   ", false],
  ])("%s は %s → %s", (_name, title, expected) => {
    expect(isValidDraft(draft({ title: title as string }))).toBe(expected);
  });

  it("担当者・期限が未設定でも追加できる", () => {
    expect(isValidDraft(draft({ assignee: "", dueDate: "" }))).toBe(true);
  });
});

describe("isOverdue", () => {
  const today = "2026-10-19";

  it.each([
    ["過去日", "2026-10-18", "todo", true],
    ["当日", "2026-10-19", "todo", false],
    ["未来日", "2026-10-20", "todo", false],
    ["期限未設定", "", "todo", false],
    ["過去日でも完了済み", "2026-10-18", "done", false],
  ] as const)("%s (%s, %s) → %s", (_name, dueDate, status, expected) => {
    expect(isOverdue(task("a", { dueDate, status }), today)).toBe(expected);
  });
});

describe("toISODate", () => {
  it("ローカル日付を YYYY-MM-DD にする（月日はゼロ埋め）", () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(toISODate(new Date(2026, 9, 19, 0, 0))).toBe("2026-10-19");
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

describe("filterTasks", () => {
  const state: BoardState = [
    task("a", {
      title: "API を設計する",
      description: "REST の仕様",
      assignee: "田中",
      priority: "high",
    }),
    task("b", {
      title: "画面を作る",
      description: "Design 確認",
      assignee: "佐藤",
      priority: "low",
    }),
    task("c", { title: "テストを書く", assignee: "田中", priority: "low" }),
  ];
  const ids = (tasks: readonly Task[]) => tasks.map((t) => t.id);

  it("条件が空なら全件を返す", () => {
    expect(ids(filterTasks(state, EMPTY_FILTER))).toEqual(["a", "b", "c"]);
  });

  it("タイトルで検索できる", () => {
    expect(ids(filterTasks(state, { ...EMPTY_FILTER, query: "画面" }))).toEqual(
      ["b"],
    );
  });

  it("説明だけに含まれる語でも検索できる", () => {
    expect(ids(filterTasks(state, { ...EMPTY_FILTER, query: "REST" }))).toEqual(
      ["a"],
    );
  });

  it("大文字小文字と前後の空白を無視する", () => {
    expect(
      ids(filterTasks(state, { ...EMPTY_FILTER, query: "  design " })),
    ).toEqual(["b"]);
  });

  it("担当者は完全一致で絞り込む", () => {
    expect(
      ids(filterTasks(state, { ...EMPTY_FILTER, assignee: "田中" })),
    ).toEqual(["a", "c"]);
  });

  it("優先度で絞り込む", () => {
    expect(
      ids(filterTasks(state, { ...EMPTY_FILTER, priority: "low" })),
    ).toEqual(["b", "c"]);
  });

  it("検索・担当者・優先度は AND で組み合わさる", () => {
    expect(
      ids(
        filterTasks(state, { query: "テスト", assignee: "田中", priority: "low" }),
      ),
    ).toEqual(["c"]);
    expect(
      ids(
        filterTasks(state, { query: "画面", assignee: "田中", priority: "" }),
      ),
    ).toEqual([]);
  });

  it("条件が空のときは同一参照を返す", () => {
    expect(filterTasks(state, EMPTY_FILTER)).toBe(state);
  });
});

describe("assigneesOf", () => {
  it("重複と未設定を除いて、出現順に返す", () => {
    const state: BoardState = [
      task("a", { assignee: "田中" }),
      task("b", { assignee: "" }),
      task("c", { assignee: "佐藤" }),
      task("d", { assignee: "田中" }),
    ];

    expect(assigneesOf(state)).toEqual(["田中", "佐藤"]);
  });
});

describe("boardReducer", () => {
  it("add でタスクを追加する", () => {
    const next = boardReducer([], {
      type: "add",
      draft: draft({
        status: "in-progress",
        assignee: "田中",
        priority: "high",
        dueDate: "2026-10-31",
      }),
      id: "id-1",
    });

    expect(next).toEqual([
      {
        id: "id-1",
        title: "設計する",
        description: "",
        status: "in-progress",
        assignee: "田中",
        priority: "high",
        dueDate: "2026-10-31",
      },
    ]);
  });

  it("タイトルが空の add は無視する", () => {
    const state: BoardState = [];

    expect(
      boardReducer(state, {
        type: "add",
        draft: draft({ title: "  ", description: "説明だけ" }),
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
