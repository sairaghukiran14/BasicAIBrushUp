import type { Metadata } from "next";
import SectionScope from "@/components/SectionScope";
import "@/styles/training.css";

export const metadata: Metadata = {
  title: {
    default: "Training a model",
    template: "%s — Training",
  },
  description:
    "Building and training a model: the data pipeline, tokenizers, a transformer from scratch, the training loop, reading loss curves, fine-tuning and preference tuning, evaluation and shipping.",
};

export default function TrainingLayout({ children }: LayoutProps<"/training">) {
  return (
    <>
      <SectionScope name="training" />
      {children}
    </>
  );
}
