import { Board } from "@/components/board/Board";
import { INITIAL_TASKS } from "@/lib/initialTasks";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Board initialTasks={INITIAL_TASKS} />
    </main>
  );
}
