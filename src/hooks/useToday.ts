"use client";

import { useSyncExternalStore } from "react";
import { toISODate } from "@/lib/board";

const subscribe = () => () => {};

const dummy = () => "dummy";

/**
 * 今日の日付（YYYY-MM-DD）。サーバー描画時は空文字を返し、ハイドレーション後に実日付へ切り替わる。
 * 描画中に `new Date()` を呼ばないので、SSR との不一致や Effect での setState を避けられる。
 */
export function useToday(): string {
  return useSyncExternalStore(
    subscribe,
    () => toISODate(new Date()),
    () => "",
  );
}
