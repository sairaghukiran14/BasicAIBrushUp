import type { Metadata } from "next";
import SectionScope from "@/components/SectionScope";
import "@/styles/operations.css";

export const metadata: Metadata = {
  title: {
    default: "Operations",
    template: "%s — Operations",
  },
  description:
    "Monitoring, quality, reliability, latency and cost for RAG systems and AI agents: what to instrument, which SLOs to set, how to measure quality in production, and where the money goes.",
};

export default function OperationsLayout({ children }: LayoutProps<"/operations">) {
  return (
    <>
      <SectionScope name="ops" />
      {children}
    </>
  );
}
