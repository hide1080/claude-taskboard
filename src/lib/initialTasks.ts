import type { Task } from "@/types/task";

/** 初期表示用のサンプルタスク（assets/board.png の内容に合わせている）。 */
export const INITIAL_TASKS: readonly Task[] = [
  {
    id: "sample-1",
    title: "Audit color contrast on dashboard cards",
    description:
      "Several muted-on-muted combinations failing AA. Fix tokens, not one-offs.",
    status: "todo",
    assignee: "Aiko",
    priority: "high",
    dueDate: "2026-10-23",
  },
  {
    id: "sample-2",
    title: "Fix flaky billing webhook retry test",
    description: "Race condition between queue and assertion.",
    status: "todo",
    assignee: "Ben",
    priority: "medium",
    dueDate: "2026-10-30",
  },
  {
    id: "sample-3",
    title: "Onboarding flow empty state copy",
    description:
      "Rewrite the three empty states so each one teaches one specific action.",
    status: "in-progress",
    assignee: "Chika",
    priority: "medium",
    dueDate: "2026-11-06",
  },
  {
    id: "sample-4",
    title: "Sync issue templates across repos",
    description: "Align labels and required fields.",
    status: "in-progress",
    assignee: "",
    priority: "low",
    dueDate: "",
  },
  {
    id: "sample-5",
    title: "Review: useTaskBoard refactor PR",
    description: "Watch for the column-reorder edge case that bit us last time.",
    status: "done",
    assignee: "Daiki",
    priority: "high",
    dueDate: "2026-10-16",
  },
  {
    id: "sample-6",
    title: "Migrate analytics events to v3 schema",
    description: "Ship behind a flag; keep v2 dual-write for 1 week.",
    status: "done",
    assignee: "Aiko",
    priority: "low",
    dueDate: "",
  },
];
