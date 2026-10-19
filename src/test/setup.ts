import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// globals: false なので自動クリーンアップが効かない。明示的に後片付けする。
afterEach(cleanup);

// 永続化したタスクがテスト間で漏れないようにする。stubGlobal したものも戻す。
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  vi.unstubAllGlobals();
});
