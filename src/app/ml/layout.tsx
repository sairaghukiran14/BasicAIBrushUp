import type { Metadata } from "next";
import SectionScope from "@/components/SectionScope";
import "@/styles/training.css";

export const metadata: Metadata = {
  title: {
    default: "ML foundations",
    template: "%s — ML foundations",
  },
  description:
    "Classical machine learning for people building LLM systems: numpy, pandas, lambda, scikit-learn pipelines, the metrics that matter, PyTorch versus TensorFlow, and MLOps — tracking, registries, feature stores and drift.",
};

export default function MlLayout({ children }: LayoutProps<"/ml">) {
  return (
    <>
      <SectionScope name="training" />
      {children}
    </>
  );
}
