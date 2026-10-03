import type { Metadata } from "next";
import SectionScope from "@/components/SectionScope";
import "@/styles/python.css";

export const metadata: Metadata = {
  title: {
    default: "Python for these systems",
    template: "%s — Python",
  },
  description:
    "The Python that RAG pipelines and agent loops are actually built from: typed records, generators, context managers, asyncio concurrency, numpy scoring, checkpointing, and the traps that bite in production.",
};

export default function PythonLayout({ children }: LayoutProps<"/python">) {
  return (
    <>
      <SectionScope name="python" />
      {children}
    </>
  );
}
