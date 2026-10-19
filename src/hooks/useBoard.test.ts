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
});
