import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddTaskForm } from "@/components/board/AddTaskForm";

describe("AddTaskForm", () => {
  it("タイトルと説明と列を渡して送信する", async () => {
    const onSubmit = vi.fn();
    render(<AddTaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("タイトル"), "設計する");
    await userEvent.type(screen.getByLabelText("説明"), "画面構成を決める");
    await userEvent.selectOptions(screen.getByLabelText("列"), "in-progress");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "設計する",
      description: "画面構成を決める",
      status: "in-progress",
    });
  });

  it("送信後に入力欄をクリアする（選んだ列は保つ）", async () => {
    render(<AddTaskForm onSubmit={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("列"), "done");
    await userEvent.type(screen.getByLabelText("タイトル"), "設計する");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(screen.getByLabelText("タイトル")).toHaveValue("");
    expect(screen.getByLabelText("説明")).toHaveValue("");
    expect(screen.getByLabelText("列")).toHaveValue("done");
  });

  it("タイトルが空白のみなら送信できない", async () => {
    const onSubmit = vi.fn();
    render(<AddTaskForm onSubmit={onSubmit} />);

    const submit = screen.getByRole("button", { name: "追加" });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText("タイトル"), "   ");

    expect(submit).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
