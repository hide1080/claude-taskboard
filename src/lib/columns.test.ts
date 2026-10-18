import { describe, expect, it } from "vitest";
import { adjacentStatus, columnLabel, COLUMNS } from "@/lib/columns";

describe("COLUMNS", () => {
  it("未着手 / 進行中 / 保留 / 完了 の 4 列をこの順で持つ", () => {
    expect(COLUMNS.map((column) => [column.status, column.label])).toEqual([
      ["todo", "未着手"],
      ["in-progress", "進行中"],
      ["hold", "保留"],
      ["done", "完了"],
    ]);
  });
});

describe("columnLabel", () => {
  it("ステータスに対応する表示名を返す", () => {
    expect(columnLabel("in-progress")).toBe("進行中");
  });
});

describe("adjacentStatus", () => {
  it("右隣の列を返す", () => {
    expect(adjacentStatus("todo", 1)).toBe("in-progress");
    expect(adjacentStatus("in-progress", 1)).toBe("hold");
    expect(adjacentStatus("hold", 1)).toBe("done");
  });

  it("左隣の列を返す", () => {
    expect(adjacentStatus("done", -1)).toBe("hold");
    expect(adjacentStatus("hold", -1)).toBe("in-progress");
  });

  it("左端より左、右端より右は null", () => {
    expect(adjacentStatus("todo", -1)).toBeNull();
    expect(adjacentStatus("done", 1)).toBeNull();
  });
});
