import type { Metadata } from "next";
import SectionScope from "@/components/SectionScope";
import "@/styles/agents.css";

export const metadata: Metadata = {
  title: {
    default: "Agent Workbench",
    template: "%s — Agent Workbench",
  },
  description:
    "Thirty AI agent problem statements from assisted to autonomous, the decisions behind each build, and how to scale and operate them.",
};

export default function AgentsLayout({ children }: LayoutProps<"/agents">) {
  return (
    <>
      <SectionScope name="agents" />
      {children}
    </>
  );
}
