import type { Metadata } from "next";
import { StackVisualizer } from "@/features/simulation/stack/components/stack-visualizer";

export const metadata: Metadata = {
  title: "Stack Visualizer | Struktiva",
  description: "Visualisasi interaktif Stack LIFO berbasis Array dengan kapasitas tetap.",
};

export default function StackVisualizerPage() {
  return <StackVisualizer />;
}
