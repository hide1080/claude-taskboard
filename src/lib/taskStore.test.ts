import { describe, expect, it, vi } from "vitest";
import { createTaskStore } from "@/lib/taskStore";
import { STORAGE_KEY, serializeTasks } from "@/lib/taskStorage";
import type { Task, TaskDraft } from "@/types/task";

const seed: Task[] = [
  {
    id: "seed-1",
    title: "初期タスク",
    description: "",
    status: "todo",
    assignee: "",
    priority: "medium",
    dueDate: "",
  },
];

const draft: TaskDraft = {
  title: "追加したタスク",
  description: "",
  status: "todo",
  assignee: "田中",
  priority: "high",
  dueDate: "2026-10-31",
};

describe("createTaskStore", () => {
  it("未保存なら初期タスクを返し、サーバー描画用も初期タスク", () => {
    const store = createTaskStore(seed);

    expect(store.getSnapshot()).toBe(seed);
    expect(store.getServerSnapshot()).toBe(seed);
  });

  it("保存済みのタスクを初期タスクより優先する", () => {
    const saved: Task[] = [{ ...seed[0], id: "saved-1", title: "保存済み" }];
    localStorage.setItem(STORAGE_KEY, serializeTasks(saved));

    const store = createTaskStore(seed);

    expect(store.getSnapshot()).toEqual(saved);
    expect(store.getServerSnapshot()).toBe(seed);
  });

  it("壊れた保存データは初期タスクに戻す", () => {
    localStorage.setItem(STORAGE_KEY, "{broken");

    expect(createTaskStore(seed).getSnapshot()).toBe(seed);
  });

  it("変化がなければ getSnapshot は同一参照を返す", () => {
    localStorage.setItem(STORAGE_KEY, serializeTasks(seed));
    const store = createTaskStore([]);

    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("dispatch で localStorage に保存し、購読者へ通知する", () => {
    const store = createTaskStore(seed);
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: "add", draft, id: "new-1" });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().map((t) => t.id)).toEqual(["seed-1", "new-1"]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      serializeTasks(store.getSnapshot()),
    );
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("状態が変わらない action では保存も通知もしない", () => {
    const store = createTaskStore(seed);
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: "move", taskId: "missing", status: "done" });

    expect(listener).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("別タブの変更（storage イベント）を購読者へ通知する", () => {
    const store = createTaskStore(seed);
    const listener = vi.fn();
    store.subscribe(listener);

    localStorage.setItem(STORAGE_KEY, serializeTasks([]));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual([]);
  });

  it("購読解除後は通知しない", () => {
    const store = createTaskStore(seed);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.dispatch({ type: "add", draft, id: "new-1" });
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));

    expect(listener).not.toHaveBeenCalled();
  });

  it("setItem が例外を投げても、メモリ上では状態が更新される", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
    });
    const store = createTaskStore(seed);

    store.dispatch({ type: "add", draft, id: "new-1" });

    expect(store.getSnapshot().map((t) => t.id)).toEqual(["seed-1", "new-1"]);
  });

  it("localStorage 自体が使えなくても初期タスクで動く", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
    });
    const store = createTaskStore(seed);

    expect(store.getSnapshot()).toBe(seed);
    store.dispatch({ type: "move", taskId: "seed-1", status: "done" });
    expect(store.getSnapshot()[0].status).toBe("done");
  });
});
