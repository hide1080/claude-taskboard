import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,

    // このリポジトリは 9p マウント（Windows ホスト）上にあり、モジュールの
    // 読み込みが極端に遅い。ワーカーを並列に立てると全てが vitest の
    // ワーカー起動タイムアウト（60 秒・変更不可）に引っかかるため、
    // ワーカーを 1 つに固定して重い初期化を 1 回だけにする。
    // node_modules をネイティブ FS に移せば、この 4 行は不要になる。
    pool: "forks",
    maxWorkers: 1,
    fileParallelism: false,
    isolate: false,
  },
});
