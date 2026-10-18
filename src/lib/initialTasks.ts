import type { Task } from "@/types/task";

/** 初期表示用のサンプルタスク（assets/board.png の内容に合わせている）。 */
export const INITIAL_TASKS: readonly Task[] = [
  {
    id: "sample-1",
    title: "Audit color contrast on dashboard cards",
    description:
      "Several muted-on-muted combinations failing AA. Fix tokens, not one-offs.",
    status: "todo",
  },
  {
    id: "sample-2",
    title: "Fix flaky billing webhook retry test",
    description: "Race condition between queue and assertion.",
    status: "todo",
  },
  {
    id: "sample-3",
    title: "Onboarding flow empty state copy",
    description:
      "Rewrite the three empty states so each one teaches one specific action.",
    status: "in-progress",
  },
  {
    id: "sample-4",
    title: "Sync issue templates across repos",
    description: "Align labels and required fields.",
    status: "in-progress",
  },
  {
    id: "sample-5",
    title: "Review: useTaskBoard refactor PR",
    description: "Watch for the column-reorder edge case that bit us last time.",
    status: "done",
  },
  {
    id: "sample-6",
    title: "Migrate analytics events to v3 schema",
    description: "Ship behind a flag; keep v2 dual-write for 1 week.",
    status: "done",
  },
];
