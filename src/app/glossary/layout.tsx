import type { Metadata } from "next";
import SectionScope from "@/components/SectionScope";
import "@/styles/glossary.css";

export const metadata: Metadata = {
  title: {
    default: "Glossary",
    template: "%s — Glossary",
  },
  description:
    "Every term used across the manual, defined plainly and tagged with the volume it belongs to: retrieval, agents, models and APIs, training, operations and engineering.",
};

export default function GlossaryLayout({ children }: LayoutProps<"/glossary">) {
  return (
    <>
      <SectionScope name="glossary" />
      {children}
    </>
  );
}
