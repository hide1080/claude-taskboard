import { boardReducer, type BoardAction, type BoardState } from "@/lib/board";
import {
  STORAGE_KEY,
  parseStoredTasks,
  serializeTasks,
} from "@/lib/taskStorage";

/** `useSyncExternalStore` にそのまま渡せる形のストア。 */
export interface TaskStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => BoardState;
  /** サーバー描画とハイドレーション時の値。常に初期タスク。 */
  getServerSnapshot: () => BoardState;
  dispatch: (action: BoardAction) => void;
}

/** localStorage が使えない環境（プライベートモード等）では null として扱う。 */
function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * localStorage を唯一の保存先とするタスクのストア。
 *
 * - 保存済みの内容があればそれを、無い／壊れていれば `initialTasks` を返す。
 * - `getSnapshot` は保存文字列が変わらない限り同一参照を返す（`useSyncExternalStore` の要件）。
 * - 書き込みに失敗してもメモリ上の状態は進める。ただし永続化はされない。
 */
export function createTaskStore(initialTasks: BoardState): TaskStore {
  const listeners = new Set<() => void>();
  /** 直近に読んだ／書いた保存文字列と、それに対応する解釈済みタスク。 */
  let cache: { raw: string | null; tasks: BoardState } | null = null;

  function getSnapshot(): BoardState {
    const raw = readRaw();
    if (cache === null || cache.raw !== raw) {
      cache = { raw, tasks: parseStoredTasks(raw) ?? initialTasks };
    }
    return cache.tasks;
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function dispatch(action: BoardAction) {
    const current = getSnapshot();
    const next = boardReducer(current, action);
    if (next === current) return;

    const serialized = serializeTasks(next);
    let raw = readRaw();
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
      raw = serialized;
    } catch {
      // 保存できなくても画面は進める。cache.raw は読み取り値のままなので、
      // 次の getSnapshot でもこの next が返る。
    }
    cache = { raw, tasks: next };
    notify();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    // 別タブでの変更を反映する。
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  }

  return {
    subscribe,
    getSnapshot,
    getServerSnapshot: () => initialTasks,
    dispatch,
  };
}
