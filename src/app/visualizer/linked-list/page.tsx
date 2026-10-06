import type { Metadata } from "next";
import { LinkedListVisualizer } from "@/features/simulation/linked-list/components/linked-list-visualizer";

export const metadata: Metadata = {
  title: "Linked List Visualizer | Struktiva",
  description: "Visualisasi interaktif operasi singly linked list langkah demi langkah.",
};

export default function LinkedListVisualizerPage() {
  return (
    <main className="flex-1">
      <LinkedListVisualizer />
    </main>
  );
}
