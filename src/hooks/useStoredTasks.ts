"use client";

import { useState, useSyncExternalStore } from "react";
import type { BoardAction, BoardState } from "@/lib/board";
import { createTaskStore } from "@/lib/taskStore";

/**
 * localStorage に永続化されるタスク一覧。`useReducer(boardReducer, …)` と同じ `[state, dispatch]` を返す。
 * サーバー描画とハイドレーションでは `initialTasks`、ハイドレーション後に保存済みの内容へ切り替わる。
 * `initialTasks` は最初の描画でだけ使われる（`useReducer` の初期値と同じ扱い）。
 */
export function useStoredTasks(
  initialTasks: BoardState,
): readonly [BoardState, (action: BoardAction) => void] {
  const [store] = useState(() => createTaskStore(initialTasks));
  const tasks = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return [tasks, store.dispatch];
}
