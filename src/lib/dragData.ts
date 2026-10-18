/**
 * ドラッグ中のタスク id を dataTransfer に載せる／取り出すだけの薄い層。
 * HTML5 Drag and Drop API の癖（独自 MIME が読めない環境がある、
 * dragover 中は getData が空文字を返す）をここに閉じ込める。
 */

export const TASK_MIME_TYPE = "application/x-taskboard-task";

export function setDragTaskId(
  dataTransfer: DataTransfer | null,
  taskId: string,
): void {
  if (!dataTransfer) return;

  dataTransfer.effectAllowed = "move";
  dataTransfer.setData(TASK_MIME_TYPE, taskId);
  // 独自 MIME を扱えない環境向けのフォールバック。
  dataTransfer.setData("text/plain", taskId);
}

export function getDragTaskId(
  dataTransfer: DataTransfer | null,
): string | null {
  if (!dataTransfer) return null;

  const taskId =
    dataTransfer.getData(TASK_MIME_TYPE) || dataTransfer.getData("text/plain");
  return taskId === "" ? null : taskId;
}
