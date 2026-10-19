# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## このバージョンの Next.js について

`package.json` の `next` は `16.4.1`。トレーニングデータの Next.js と API・構成が異なる
可能性があるため、コードを書く前に `node_modules/next/dist/docs/` 配下の該当ガイドを
確認すること（`AGENTS.md` にも同旨の注記があり、`next dev` 実行時に自動生成される）。
特に `next.config.ts` で `cacheComponents: true` / `partialPrefetching: true` を有効化して
いる点、`app/layout.tsx` が `LayoutProps<"/">` という生成型を使っている点は、見慣れない
Next.js の挙動に遭遇したときに確認する箇所の候補。

## 技術スタック

- 言語: TypeScript（`strict: true`）
- フレームワーク: Next.js 16.4.1（App Router）+ React 19.3.0 / React DOM 19.3.0
- スタイリング: Tailwind CSS v4（`@tailwindcss/turbopack`）
- ビルド・開発サーバー: Turbopack（`next dev --turbopack` / `next build --turbopack`）
- テスト: Vitest 5 + @testing-library/react・@testing-library/dom・@testing-library/user-event・@testing-library/jest-dom（環境は jsdom）
- Lint: ESLint 9（`eslint-config-next`）

## ディレクトリ構成（トップレベル / セカンドレベル）

```
mytaskboard/
├── .devcontainer/        開発コンテナ定義
├── assets/                デザイン参照（board.png など）
├── public/                静的アセット
├── src/
│   ├── app/                ルートレイアウト・ページ（App Router）
│   ├── components/board/   ボード関連コンポーネント
│   ├── hooks/               useBoard など状態フック
│   ├── lib/                  board/columns/dragData 等の純粋ロジック
│   ├── test/                 Testing Library セットアップ・DnD スタブ
│   └── types/                Task 等の型定義
├── AGENTS.md              Next.js バージョン差異に関する注記（next dev が自動生成）
├── README.md
├── eslint.config.mjs
├── next.config.ts
├── tsconfig.json
├── vitest.config.mts
├── package.json
└── package-lock.json
```

（`node_modules/`・`.next/` はビルド/依存関係の生成物のため省略）

## コマンド

```bash
npm run dev         # 開発サーバー（Turbopack）
npm run build       # プロダクションビルド（Turbopack）
npm start           # ビルド結果の起動
npm test            # Vitest を 1 回実行
npm run test:watch  # Vitest のウォッチ実行
npm run lint         # ESLint
```

単一テストファイルの実行例:

```bash
npx vitest run src/lib/board.test.ts
```

## アーキテクチャ

4 列（未着手 / 進行中 / 保留 / 完了）のカンバンボード。状態管理とコンポーネントの責務が
明確に分離されている。

- **`lib/board.ts`** — 状態遷移を担う純粋関数と `boardReducer`。React に依存しないため
  ロジックのテストはここに対して行う。状態は列ごとに分けず `Task[]` 1 本で保持し、
  描画時に `tasksInColumn` で列へ振り分ける。
- **`lib/columns.ts`** — 列の定義（順序・ラベル）の単一の情報源（`COLUMNS`）。画面表示も
  テストもこの配列を参照する。カード移動ボタンの隣接列計算（`adjacentStatus`）もここ。
- **`lib/priorities.ts`** — 優先度（高/中/低）の定義（順序・ラベル・フォームの既定値）の
  単一の情報源（`PRIORITIES`）。期限切れ判定は `lib/board.ts` の `isOverdue(task, today)`
  で、`today` を引数にして時刻のモックを不要にしている。`TaskCard` の既定の「今日」は
  `hooks/useToday.ts`（SSR では空文字、ハイドレーション後に実日付）が供給する。
- **`lib/board.ts` の検索・絞り込み** — `filterTasks(tasks, filter)`（タイトル・説明の部分一致 +
  担当者・優先度の完全一致、すべて AND）と `assigneesOf`（担当者の選択肢）。条件は `TaskFilter`、
  空は `EMPTY_FILTER`。条件が空なら同一参照を返す。
- **`lib/taskStorage.ts` / `lib/taskStore.ts`** — localStorage（キー `taskboard:tasks:v1`）への
  永続化。`parseStoredTasks` は壊れた JSON や不正な要素を含むと `null`（全体を捨てて初期タスクに戻す）。
  `createTaskStore` は `useSyncExternalStore` 用のストアで、保存文字列が変わらない限り同一参照を返し、
  書き込みが失敗してもメモリ上では状態を進める。サーバー描画・ハイドレーションでは常に初期タスク
  （`useToday` と同じ方針）で、ハイドレーション後に保存済みの内容へ切り替わる。
- **`hooks/useStoredTasks.ts`** — `createTaskStore` を `useSyncExternalStore` に繋ぐ。`useReducer` と
  同じ `[state, dispatch]` を返す。
- **`hooks/useBoard.ts`** — `useStoredTasks` の状態に `filter` を適用し、列への振り分け済み
  データ（`columns`）と `totalCount` / `visibleCount` / `assignees` をコンポーネントに渡す。
- **`components/board/Board.tsx`** — 全体のまとめ役。ドラッグ中のタスク id、追加フォーム
  を開いている列、検索・絞り込み条件といった画面の一時状態はここと `AddTaskForm` のみが持つ
  （他のコンポーネントは受け取った値を描画し操作を親へ通知するだけ）。検索・絞り込み条件は
  保存せず、リロードで空に戻る（永続化するのはタスクのみ）。`BoardToolbar` が検索欄と
  担当者・優先度の絞り込みを描画する。
- **`lib/dragData.ts`** — HTML5 Drag and Drop の `dataTransfer` 読み書きを集約。jsdom には
  `DataTransfer` が無いため、テストでは `src/test/dataTransfer.ts` の最小スタブを
  `fireEvent.dragStart` / `drop` に渡して再現している。
- 見た目は単一のライトテーマ固定（`assets/board.png` に合わせている）。配色は
  `src/app/globals.css` の CSS 変数にまとめ、Tailwind の `@theme inline` で
  `bg-column` / `text-muted` 等のユーティリティとして使えるようにしている。ダークモードの
  分岐は意図的に持たない。
- 5 列目の「カラムを追加」（`AddColumnPlaceholder`）と列見出しの `...` は表示のみで未実装。
  動作を実装する際は既存の `COLUMNS` / `boardReducer` の拡張として扱う。

## テスト方針

- `lib/*.test.ts` — 状態遷移・列定義・dataTransfer の純粋なロジック。
- `hooks/useBoard.test.ts` — 追加・移動・絞り込みがボードの状態に反映されることと、再マウント後も
  タスクが残ること。localStorage は `src/test/setup.ts` が各テスト前に `clear()` し、
  `vi.stubGlobal` した差し替えも各テスト後に元へ戻す。
- `components/board/*.test.tsx` — 各コンポーネントの表示と通知。`Board.test.tsx` では
  ドラッグ&ドロップによる列移動を通しで確認する。
- カードの移動ボタン（`←` / `→`）はホバー時だけ `pointer-events` が有効になるが、jsdom は
  `:hover` を評価しないため、該当テストでは `pointerEventsCheck` を無効にして押している。
