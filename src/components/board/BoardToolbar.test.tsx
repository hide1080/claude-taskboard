import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BoardToolbar } from "@/components/board/BoardToolbar";
import { EMPTY_FILTER, type TaskFilter } from "@/lib/board";

function setup(filter: TaskFilter = EMPTY_FILTER) {
  const onChange = vi.fn();
  render(
    <BoardToolbar
      filter={filter}
      assignees={["田中", "佐藤"]}
      onChange={onChange}
    />,
  );
  return { onChange, user: userEvent.setup() };
}

describe("BoardToolbar", () => {
  it("検索語の入力を条件として通知する", async () => {
    const { onChange, user } = setup();

    await user.type(screen.getByRole("searchbox", { name: "タスクを検索" }), "a");

    expect(onChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTER, query: "a" });
  });

  it("入力中の検索語を表示する", () => {
    setup({ ...EMPTY_FILTER, query: "設計" });

    expect(screen.getByRole("searchbox", { name: "タスクを検索" })).toHaveValue(
      "設計",
    );
  });

  it("担当者の選択肢は「すべて」と渡された担当者", () => {
    setup();

    const options = screen
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(options).toContain("すべての担当者");
    expect(options).toEqual(expect.arrayContaining(["田中", "佐藤"]));
  });

  it("担当者を選ぶと条件として通知する", async () => {
    const { onChange, user } = setup();

    await user.selectOptions(screen.getByLabelText("担当者で絞り込み"), "佐藤");

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTER, assignee: "佐藤" });
  });

  it("優先度を選ぶと条件として通知する", async () => {
    const { onChange, user } = setup();

    await user.selectOptions(screen.getByLabelText("優先度で絞り込み"), "high");

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTER, priority: "high" });
  });

  it("他の条件は保ったまま、変えた条件だけ更新する", async () => {
    const { onChange, user } = setup({
      query: "設計",
      assignee: "田中",
      priority: "",
    });

    await user.selectOptions(screen.getByLabelText("優先度で絞り込み"), "low");

    expect(onChange).toHaveBeenCalledWith({
      query: "設計",
      assignee: "田中",
      priority: "low",
    });
  });

  it("条件が無いときはクリアボタンを出さない", () => {
    setup();

    expect(
      screen.queryByRole("button", { name: "条件をクリア" }),
    ).not.toBeInTheDocument();
  });

  it("条件があるときだけクリアボタンを出し、押すと空の条件を通知する", async () => {
    const { onChange, user } = setup({ ...EMPTY_FILTER, priority: "high" });

    await user.click(screen.getByRole("button", { name: "条件をクリア" }));

    expect(onChange).toHaveBeenCalledWith(EMPTY_FILTER);
  });
});
