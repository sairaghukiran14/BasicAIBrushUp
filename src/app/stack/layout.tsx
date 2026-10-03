import type { Metadata } from "next";
import SectionScope from "@/components/SectionScope";
import "@/styles/stack.css";

export const metadata: Metadata = {
  title: {
    default: "The stack",
    template: "%s — The Stack",
  },
  description:
    "Model APIs, tokens and cost control, prompt engineering, vector databases, open models and Hugging Face, fine-tuning, workflows and frameworks, MCP — and how to assemble them.",
};

export default function StackLayout({ children }: LayoutProps<"/stack">) {
  return (
    <>
      <SectionScope name="stack" />
      {children}
    </>
  );
}
