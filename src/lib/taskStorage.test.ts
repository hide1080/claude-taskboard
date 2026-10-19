import { describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  parseStoredTasks,
  serializeTasks,
} from "@/lib/taskStorage";
import type { Task } from "@/types/task";

const tasks: Task[] = [
  {
    id: "a",
    title: "設計する",
    description: "メモ",
    status: "in-progress",
    assignee: "田中",
    priority: "high",
    dueDate: "2026-10-31",
  },
  {
    id: "b",
    title: "テストする",
    description: "",
    status: "done",
    assignee: "",
    priority: "low",
    dueDate: "",
  },
];

describe("taskStorage", () => {
  it("保存キーにバージョンを含める", () => {
    expect(STORAGE_KEY).toBe("taskboard:tasks:v1");
  });

  it("serialize したものを parse すると元に戻る", () => {
    expect(parseStoredTasks(serializeTasks(tasks))).toEqual(tasks);
  });

  it("空配列も正しく復元できる（null とは区別する）", () => {
    expect(parseStoredTasks(serializeTasks([]))).toEqual([]);
  });

  it.each([
    ["null（未保存）", null],
    ["壊れた JSON", "{not json"],
    ["配列でない", '{"id":"a"}'],
    ["文字列", '"hello"'],
  ])("%s は null を返す", (_name, raw) => {
    expect(parseStoredTasks(raw)).toBeNull();
  });

  it.each([
    ["status が定義外", { ...tasks[0], status: "archived" }],
    ["priority が定義外", { ...tasks[0], priority: "urgent" }],
    ["title が文字列でない", { ...tasks[0], title: 1 }],
    ["フィールドが欠けている", { id: "a", title: "x" }],
    ["要素がオブジェクトでない", "task"],
    ["null の要素", null],
  ])("要素が不正（%s）なら全体を null にする", (_name, broken) => {
    expect(parseStoredTasks(JSON.stringify([tasks[1], broken]))).toBeNull();
  });
});
