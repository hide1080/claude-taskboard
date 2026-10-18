import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// globals: false なので自動クリーンアップが効かない。明示的に後片付けする。
afterEach(cleanup);
