import type { Metadata } from "next";
import CatalogBrowser from "@/components/CatalogBrowser";

export const metadata: Metadata = {
  title: "Project catalog",
  description:
    "Thirty RAG project specifications across thirty industries, filterable by difficulty tier, technique and data format.",
};

export default function CatalogPage() {
  return (
    <section className="section-tight">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-num">01</span>
          <h2>Project catalog</h2>
        </div>
        <p className="sec-lede">
          Difficulty is measured by mechanism, not by subject matter. An easy project needs one corpus and one retrieval pass. A
          medium project needs hybrid search, metadata filters, reranking, or a second data type. An advanced project needs
          several of: multi-hop planning, a knowledge graph, structured-plus-unstructured fusion, streaming ingestion,
          multimodality, per-user access control, or audit-grade traceability.
        </p>

        <CatalogBrowser />
      </div>
    </section>
  );
}
