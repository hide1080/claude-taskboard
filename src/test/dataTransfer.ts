/**
 * jsdom には DataTransfer が無いため、テスト用の最小実装を用意する。
 * setData / getData / types だけを本物と同じ振る舞いで提供する。
 */
export function createDataTransfer(): DataTransfer {
  const store = new Map<string, string>();

  return {
    effectAllowed: "none",
    dropEffect: "none",
    get types() {
      return [...store.keys()];
    },
    setData(type: string, value: string) {
      store.set(type, value);
    },
    getData(type: string) {
      return store.get(type) ?? "";
    },
    clearData() {
      store.clear();
    },
  } as unknown as DataTransfer;
}
