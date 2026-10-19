import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBoard } from "@/hooks/useBoard";
import type { Task } from "@/types/task";

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "設計する",
    description: "",
    status: "todo",
    assignee: "",
    priority: "medium",
    dueDate: "",
  },
];

describe("useBoard", () => {
  it("4 列を定義順に返す", () => {
    const { result } = renderHook(() => useBoard());

    expect(result.current.columns.map((column) => column.label)).toEqual([
      "未着手",
      "進行中",
      "保留",
      "完了",
    ]);
  });

  it("追加したタスクが指定した列に入る", () => {
    let next = 0;
    const { result } = renderHook(() =>
      useBoard({ generateId: () => `generated-${++next}` }),
    );

    act(() => {
      result.current.addTask({
        title: "テストを書く",
        description: "Vitest",
        status: "in-progress",
        assignee: "田中",
        priority: "high",
        dueDate: "2026-10-31",
      });
    });

    const inProgress = result.current.columns[1];
    expect(inProgress.tasks).toEqual([
      {
        id: "generated-1",
        title: "テストを書く",
        description: "Vitest",
        status: "in-progress",
        assignee: "田中",
        priority: "high",
        dueDate: "2026-10-31",
      },
    ]);
  });

  it("移動したタスクは元の列から消える", () => {
    const { result } = renderHook(() => useBoard({ initialTasks }));

    act(() => {
      result.current.moveTask("task-1", "done");
    });

    expect(result.current.columns[0].tasks).toHaveLength(0);
    expect(result.current.columns[3].tasks.map((task) => task.id)).toEqual([
      "task-1",
    ]);
  });

  describe("永続化", () => {
    const draft = {
      title: "保存される",
      description: "",
      status: "todo",
      assignee: "田中",
      priority: "high",
      dueDate: "",
    } as const;

    it("追加したタスクは再マウントしても残る", () => {
      const first = renderHook(() =>
        useBoard({ initialTasks, generateId: () => "new-1" }),
      );
      act(() => first.result.current.addTask(draft));
      first.unmount();

      const second = renderHook(() => useBoard({ initialTasks }));

      expect(second.result.current.columns[0].tasks.map((t) => t.id)).toEqual([
        "task-1",
        "new-1",
      ]);
    });

    it("移動した結果も残る", () => {
      const first = renderHook(() => useBoard({ initialTasks }));
      act(() => first.result.current.moveTask("task-1", "done"));
      first.unmount();

      const second = renderHook(() => useBoard({ initialTasks }));

      expect(second.result.current.columns[3].tasks.map((t) => t.id)).toEqual([
        "task-1",
      ]);
    });

    it("保存データが壊れていれば初期タスクで始める", () => {
      localStorage.setItem("taskboard:tasks:v1", "{broken");

      const { result } = renderHook(() => useBoard({ initialTasks }));

      expect(result.current.columns[0].tasks.map((t) => t.id)).toEqual([
        "task-1",
      ]);
    });
  });

  describe("検索・フィルター", () => {
    const tasks: Task[] = [
      {
        ...initialTasks[0],
        id: "a",
        title: "API を設計する",
        assignee: "田中",
        priority: "high",
      },
      {
        ...initialTasks[0],
        id: "b",
        title: "画面を作る",
        status: "done",
        assignee: "佐藤",
        priority: "low",
      },
    ];

    it("条件に合うタスクだけを列に振り分け、総数は絞り込み前のまま返す", () => {
      const { result } = renderHook(() =>
        useBoard({
          initialTasks: tasks,
          filter: { query: "", assignee: "佐藤", priority: "" },
        }),
      );

      expect(result.current.columns[0].tasks).toHaveLength(0);
      expect(result.current.columns[3].tasks.map((t) => t.id)).toEqual(["b"]);
      expect(result.current.totalCount).toBe(2);
      expect(result.current.visibleCount).toBe(1);
    });

    it("担当者の選択肢は絞り込みに関係なく全タスクから作る", () => {
      const { result } = renderHook(() =>
        useBoard({
          initialTasks: tasks,
          filter: { query: "画面", assignee: "", priority: "" },
        }),
      );

      expect(result.current.assignees).toEqual(["田中", "佐藤"]);
    });
  });
});
