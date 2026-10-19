import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddTaskForm } from "@/components/board/AddTaskForm";

describe("AddTaskForm", () => {
  it("タイトル・説明・列・担当者・優先度・期限を渡して送信する", async () => {
    const onSubmit = vi.fn();
    render(<AddTaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("タイトル"), "設計する");
    await userEvent.type(screen.getByLabelText("説明"), "画面構成を決める");
    await userEvent.selectOptions(screen.getByLabelText("列"), "in-progress");
    await userEvent.type(screen.getByLabelText("担当者"), "田中");
    await userEvent.selectOptions(screen.getByLabelText("優先度"), "high");
    await userEvent.type(screen.getByLabelText("期限"), "2026-10-31");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "設計する",
      description: "画面構成を決める",
      status: "in-progress",
      assignee: "田中",
      priority: "high",
      dueDate: "2026-10-31",
    });
  });

  it("担当者・優先度・期限を触らなければ未設定と既定の優先度で送信する", async () => {
    const onSubmit = vi.fn();
    render(<AddTaskForm onSubmit={onSubmit} />);

    expect(screen.getByLabelText("優先度")).toHaveValue("medium");

    await userEvent.type(screen.getByLabelText("タイトル"), "設計する");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "設計する",
      description: "",
      status: "todo",
      assignee: "",
      priority: "medium",
      dueDate: "",
    });
  });

  it("送信後に入力欄をクリアする（選んだ列は保つ）", async () => {
    render(<AddTaskForm onSubmit={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("列"), "done");
    await userEvent.type(screen.getByLabelText("タイトル"), "設計する");
    await userEvent.type(screen.getByLabelText("担当者"), "田中");
    await userEvent.selectOptions(screen.getByLabelText("優先度"), "low");
    await userEvent.type(screen.getByLabelText("期限"), "2026-10-31");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(screen.getByLabelText("タイトル")).toHaveValue("");
    expect(screen.getByLabelText("説明")).toHaveValue("");
    expect(screen.getByLabelText("担当者")).toHaveValue("");
    expect(screen.getByLabelText("期限")).toHaveValue("");
    expect(screen.getByLabelText("優先度")).toHaveValue("medium");
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
