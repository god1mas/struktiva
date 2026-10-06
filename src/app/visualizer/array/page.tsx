import type { Metadata } from "next";
import { ArrayVisualizer } from "@/features/simulation/array/components/array-visualizer";

export const metadata: Metadata = {
  title: "Array Visualizer | Struktiva",
  description: "Visualisasi interaktif operasi Array, shifting, dan memori kontigu simulasi.",
};

export default function ArrayVisualizerPage() {
  return <ArrayVisualizer />;
}
