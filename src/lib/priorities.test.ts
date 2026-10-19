import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRIORITY,
  PRIORITIES,
  priorityLabel,
} from "@/lib/priorities";

describe("PRIORITIES", () => {
  it("高・中・低の順に並ぶ", () => {
    expect(PRIORITIES.map((p) => p.priority)).toEqual([
      "high",
      "medium",
      "low",
    ]);
    expect(PRIORITIES.map((p) => p.label)).toEqual(["高", "中", "低"]);
  });
});

describe("priorityLabel", () => {
  it("優先度の表示名を返す", () => {
    expect(priorityLabel("high")).toBe("高");
    expect(priorityLabel("low")).toBe("低");
  });
});

describe("DEFAULT_PRIORITY", () => {
  it("既定は中", () => {
    expect(DEFAULT_PRIORITY).toBe("medium");
  });
});
