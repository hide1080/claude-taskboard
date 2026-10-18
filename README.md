# TaskBoard

未着手 / 進行中 / 保留 / 完了 の 4 列でタスクを管理する小さなカンバンボード。

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- ビルド・開発サーバーは Turbopack
- ユニットテストは Vitest + React Testing Library

## セットアップ

```bash
npm install
npm run dev     # http://localhost:3000
```

## スクリプト

| コマンド             | 内容                               |
| -------------------- | ---------------------------------- |
| `npm run dev`        | 開発サーバー（Turbopack）          |
| `npm run build`      | プロダクションビルド（Turbopack）  |
| `npm start`          | ビルド結果の起動                   |
| `npm test`           | Vitest を 1 回実行                 |
| `npm run test:watch` | Vitest のウォッチ実行              |
| `npm run lint`       | ESLint                             |

## 機能

- 4 列のカンバンボード（未着手 / 進行中 / 保留 / 完了）
- タイトルと説明を持つタスクの追加（ヘッダーの「新規タスク」、各列の「タスクを追加」から開く）
- ドラッグ&ドロップによる列間の移動（HTML5 Drag and Drop API）
- カードの `←` / `→` ボタンによる移動（キーボード操作・タッチ環境向けの代替手段。
  デザインの静止状態を崩さないよう、ホバーとフォーカス時だけ現れる）

見た目は `assets/board.png` に合わせている。配色は `src/app/globals.css` の
CSS 変数にまとめ、Tailwind の `@theme inline` でユーティリティ（`bg-column`,
`text-muted` など）として使えるようにしている。デザインが単一のライトテーマなので
ダークモードの分岐は持たない。

5 列目の「カラムを追加」は枠だけの表示で、動作は未実装（`AddColumnPlaceholder`）。
列見出しの `...` も同様に装飾で、操作子にはしていない。

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              ルートレイアウト
│   └── page.tsx                ボードを配置するだけのページ（Server Component）
├── components/board/
│   ├── Board.tsx               全体のまとめ役。状態と画面の一時状態を束ねる
│   ├── BoardHeader.tsx         ボード名・総タスク数・新規タスクボタン
│   ├── Column.tsx              1 列の表示とドロップの受け入れ
│   ├── TaskCard.tsx            1 タスクのカード。ドラッグ元
│   ├── AddTaskForm.tsx         タスク追加フォーム
│   └── AddColumnPlaceholder.tsx  5 列目の枠（表示のみ・動作なし）
├── hooks/
│   └── useBoard.ts             ボードの状態と操作（useReducer のラッパー）
├── lib/
│   ├── board.ts                状態遷移の純粋関数と reducer
│   ├── columns.ts              列の定義と隣接列の計算
│   ├── dragData.ts             dataTransfer の読み書き
│   └── initialTasks.ts         初期表示のサンプルタスク（デザイン画像と同内容）
├── types/
│   └── task.ts                 Task / TaskStatus
└── test/
    ├── setup.ts                Testing Library のセットアップ
    └── dataTransfer.ts         jsdom 用の DataTransfer スタブ
```

### 責務の分け方

状態遷移は `lib/board.ts` の純粋関数に閉じ込め、React に依存しない形でテストする。
`hooks/useBoard.ts` がそれを `useReducer` で包み、列への振り分けまで済ませて渡す。
コンポーネントは受け取った値を描画し、操作を親へ通知するだけで、状態を持つのは
`Board`（ドラッグ中のタスク id、追加フォームを開いている列）と
`AddTaskForm`（入力中の値）に限定している。

## テスト

```bash
npm test
```

- `lib/*.test.ts` — 状態遷移・列定義・dataTransfer の純粋なロジック
- `hooks/useBoard.test.ts` — 追加と移動がボードの状態に反映されること
- `components/board/*.test.tsx` — 各コンポーネントの表示と通知、および
  `Board.test.tsx` でドラッグ&ドロップによる列移動を通しで確認

jsdom には `DataTransfer` が無いため、`src/test/dataTransfer.ts` の最小スタブを
`fireEvent.dragStart` / `drop` に渡して DnD を再現している。

カードの移動ボタンはホバー時だけ `pointer-events` が有効になるが、jsdom は `:hover` を
評価しないため、該当するテストでは `pointerEventsCheck` を無効にして押している。