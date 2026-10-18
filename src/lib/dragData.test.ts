import { describe, expect, it } from "vitest";
import {
  getDragTaskId,
  setDragTaskId,
  TASK_MIME_TYPE,
} from "@/lib/dragData";
import { createDataTransfer } from "@/test/dataTransfer";

describe("setDragTaskId / getDragTaskId", () => {
  it("書き込んだ id を読み出せる", () => {
    const dataTransfer = createDataTransfer();

    setDragTaskId(dataTransfer, "task-1");

    expect(getDragTaskId(dataTransfer)).toBe("task-1");
    expect(dataTransfer.getData(TASK_MIME_TYPE)).toBe("task-1");
  });

  it("独自 MIME が無くても text/plain から読める", () => {
    const dataTransfer = createDataTransfer();
    dataTransfer.setData("text/plain", "task-2");

    expect(getDragTaskId(dataTransfer)).toBe("task-2");
  });

  it("何も入っていなければ null", () => {
    expect(getDragTaskId(createDataTransfer())).toBeNull();
  });

  it("dataTransfer が null でも落ちない", () => {
    expect(getDragTaskId(null)).toBeNull();
    expect(() => setDragTaskId(null, "task-1")).not.toThrow();
  });
});
