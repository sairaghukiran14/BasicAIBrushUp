# Basic AI BrushUp — RAG & AI Agent Field Manual

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Pages Pre-rendered](https://img.shields.io/badge/Pages%20Pre--rendered-75%2F75%20SSG-emerald?style=for-the-badge)](/)
[![Zero UI Bloat](https://img.shields.io/badge/External%20UI%20Libs-0%20(Pure%20CSS)-orange?style=for-the-badge)](/)

> A comprehensive, production-grade interactive engineering reference and master curriculum covering **30 retrieval-augmented generation (RAG) industry specifications**, **30 autonomous AI agent architectures**, **12 agentic patterns**, production **LLMOps/MLOps telemetry**, the **modern inference stack & MCP**, **30 Python concurrency building blocks**, **classical ML foundations**, and **transformer training pipelines**.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Curriculum & Features](#-curriculum--features)
  - [Volume I: Retrieval-Augmented Generation (RAG)](#1-volume-i-retrieval-augmented-generation-rag)
  - [Volume II: Autonomous AI Agents](#2-volume-ii-autonomous-ai-agents)
  - [Operations: LLMOps & MLOps Infrastructure](#3-operations-llmops--mlops-infrastructure)
  - [The AI Engineering Stack & MCP](#4-the-ai-engineering-stack--mcp)
  - [Python Foundations & Concurrency](#5-python-foundations--concurrency)
  - [Classical Machine Learning](#6-classical-machine-learning)
  - [Model Training & Diagnostics](#7-model-training--diagnostics)
  - [Interactive AI Engineering Glossary](#8-interactive-ai-engineering-glossary)
- [Application Routes](#-application-routes)
- [Hand-Authored Architecture Diagrams](#-hand-authored-architecture-diagrams)
- [The 7-Theme Contextual Design System](#-the-7-theme-contextual-design-system)
- [Repository Structure](#-repository-structure)
- [Quick Start](#-quick-start)
- [Extending the Content](#-extending-the-content)
- [Engineering Principles](#-engineering-principles)

---

## 🌟 Overview

**Basic AI BrushUp / RAG Field Manual** is built for engineers, researchers, and technical leaders who need real, un-sanitized engineering blueprints rather than toy tutorials. Every project, agent, and pipeline in this manual is specified with:
- Concrete data contracts, inputs, outputs, chunking strategies, and retrieval cascades.
- Tool schemas, autonomy levels, failure modes, compensating transactions, and blast radius calculations.
- Hard production metrics and verifiable **Ship Gates** (e.g., latency percentiles, cost limits, recall floors).

The entire web application is pre-rendered via **Next.js 16 (Turbopack SSG)** into 75 high-performance static pages, shipping with zero heavy client UI libraries, 12 inline hand-drawn SVG system diagrams, and 7 contextual themes.

---

## 🎓 Curriculum & Features

### 1. Volume I: Retrieval-Augmented Generation (RAG)
- **30 Industry Project Blueprints**: Real-world RAG specifications across 30 industries (Healthcare, Legal, Financial, Manufacturing, Retail, Defense, Logistics, etc.).
- **Tier 1 to Tier 3 Progression**:
  - *Tier 1 (Foundational)*: Dense embeddings, reciprocal rank fusion (RRF), static documents.
  - *Tier 2 (Hybrid & Multimodal)*: Multi-vector search, cross-encoders, visual token ingest, tabular routing.
  - *Tier 3 (Autonomous & Distributed)*: Graph RAG, agentic query decomposition, self-reflective correction, sub-second SLAs.
- **The 9-Stage Build Playbook**: End-to-end guidance covering ingest pipelines, chunking mechanics, embedding selection, retrieval cascades, reranking, latency budgets, and RAG triad evaluation (faithfulness, answer relevance, context precision).

### 2. Volume II: Autonomous AI Agents
- **30 Agent Specifications across 28 Domains**: From code refactoring engines and meeting triage to multi-step market intelligence agents.
- **Autonomy Classification**: Explicit autonomy levels (L1 Guided to L4 Fully Autonomous with human-in-the-loop gates).
- **12 Agentic Design Patterns**:
  1. *Prompt Chaining*
  2. *Routing / Intent Triage*
  3. *Parallel Execution*
  4. *Orchestrator-Workers*
  5. *Evaluator-Optimizer (Self-Reflection)*
  6. *ReAct (Reasoning + Acting)*
  7. *Plan-and-Solve*
  8. *Memory Retrieval & Working State*
  9. *Human-in-the-Loop Safeguards*
  10. *Multi-Agent Swarm Collaboration*
  11. *Hierarchical Supervisor Networks*
  12. *Compensating Transactions (Rollback)*
- **The Agent Playbook**: The 11 load-bearing decisions, workflow vs agent boundaries, control planes, and failure modes.

### 3. Operations: LLMOps & MLOps Infrastructure
- **Unified Telemetry Spine**: Single-trace architectures spanning prompt tokens, model latency, vector queries, tool calls, and completion tokens.
- **Production SLOs**: P50/P95/P99 latency allocations, token cost ceilings, and error budget calculations.
- **Eval Gates**: CI/CD automated regression scoring, synthetic test harness design, golden dataset curation, and online canary rollouts.
- **Blast Radius Mitigation**: Designing compensating operations for side-effecting agent tools.

### 4. The AI Engineering Stack & MCP
- **Model APIs & Cost Calculators**: Pricing tiers, context window management, rate limits, and structured output formatting.
- **Vector Database Benchmarks**: Detailed comparative analysis (Pinecone, Qdrant, Milvus, Weaviate, pgvector, Chroma) across scale, filtering, and latency.
- **Model Context Protocol (MCP)**: Tool registration, prompt server architecture, resource subscriptions, and client/server boundaries.
- **Open-Weight Models & Fine-Tuning**: Quantization formats (GGUF, AWQ, EXL2), LoRA/QLoRA hyperparameter setups, and serving with vLLM / Ollama.

### 5. Python Foundations & Concurrency
- **30 Worked Production Snippets**: Real Python patterns for high-throughput AI engineering:
  - Memory-efficient streaming with generators & async iterators.
  - `asyncio` gathering, task groups, bounded worker pools, and rate-limiting token buckets.
  - Zero-copy tensor serialization, memory mapping, and dataclass caching.
  - Critical Python traps (GIL misconceptions, closure scopes, mutable defaults).

### 6. Classical Machine Learning
- **Mathematical Foundations**: Linear algebra, matrix factorization, distance metrics (Cosine, Euclidean, Dot Product, Manhattan).
- **Tabular & Classical Workflows**: Scikit-Learn pipelines, PCA, dimensionality reduction, clustering (k-means, DBSCAN, HNSW).
- **Evaluation Metrics**: Precision, Recall, F1, ROC-AUC, PR-AUC, MRR@k, NDCG@k.
- **Data Drift & Feature Stores**: Kolmogorov-Smirnov tests, Population Stability Index (PSI), feature consistency across train and serving.

### 7. Model Training & Diagnostics
- **Transformer Architecture**: Self-attention, multi-head attention, rotary positional embeddings (RoPE), KV-cache mechanics.
- **End-to-End Pipeline**: Byte-Pair Encoding (BPE) tokenization, custom PyTorch dataset streaming, distributed DataParallel/FSDP training loops.
- **Interactive Loss Curve Chart**: Validated visualizer comparing healthy runs, overfitting checkpoints, learning rate warmup anomalies, and gradient divergence.

### 8. Interactive AI Engineering Glossary
- **138+ Definitions**: Cross-indexed across all volumes.
- Each term includes: **Strict Technical Definition**, **Architectural Consequence**, and a **Concrete Production Example**.

---

## 🧭 Application Routes

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Overview** | Mission map, volume relationships, and difficulty tier methodology |
| `/catalog` | **RAG Catalog** | All 30 RAG projects, filterable by tier and searchable in real time |
| `/projects/[slug]` | **Project Spec** | Complete specification: inputs, outputs, chunking, retrieval cascade, ship metric |
| `/playbook` | **RAG Playbook** | 9-stage engineering guide: ingest, indexing, hybrid search, eval |
| `/agents` | **Agent Catalog** | 30 autonomous agent builds categorized by autonomy level |
| `/agents/[slug]` | **Agent Spec** | Agent specification: tools, memory models, guardrails, failure handling |
| `/agents/playbook` | **Agent Playbook** | 11 core architectural decisions, control planes, and scaling strategies |
| `/agents/patterns` | **Agent Patterns** | 12 code patterns with implementation problems and topology diagrams |
| `/operations` | **Operations** | Telemetry spine, SLO tables, eval gates, and blast radius mitigation |
| `/stack` | **Tech Stack** | Model APIs, tokens, prompt strategies, vector DBs, open models, MCP |
| `/python` | **Python Snippets** | 30 production code recipes covering concurrency, async, and memory |
| `/ml` | **Classical ML** | ML algorithms, metrics, feature stores, and drift detection |
| `/training` | **Model Training** | Tokenizers, transformer loop, and the interactive dual-series loss chart |
| `/glossary` | **Glossary** | 138+ AI engineering terms filterable by volume and domain |

---

## 📐 Hand-Authored Architecture Diagrams

No bulky diagramming libraries are loaded. The application contains **12 bespoke inline SVG diagrams**, drawn with responsive `viewBox` coordinates, themed with `currentColor`, and wrapped in mobile-friendly scrolling rails:

| Figure | Route | Architectural Claim |
| :--- | :--- | :--- |
| **Volume Map** | `/` | Each engineering layer assumes the one below; operations wraps whatever ships |
| **Two Loops, One Index** | `/playbook` | Ingestion and serving meet only at the index; caching bypasses four stages |
| **Retrieval Cascade** | `/playbook` | Cost per candidate item rises as candidate count falls; that inversion is the design |
| **Agent Loop** | `/agents/playbook` | The core loop is four nodes; everything that makes it safe operates on the edges |
| **Workflow vs Agent** | `/agents/playbook` | The fundamental difference is who determines the subsequent state transition |
| **Topologies** | `/agents/patterns` | Tradeoffs between peer-to-peer swarms, supervisors, and router chains |
| **System Architecture** | `/stack` | Ingestion pipeline writes to the shared read-path cache behind validation gates |
| **MLOps Lifecycle** | `/ml` | The automated evaluation gate and feature store form the core system spine |
| **Training Pipeline** | `/training` | Step-by-step data tokenization, forward-backward pass, and checkpoint serialization |
| **Loss Curves** | `/training` | Visual diagnostic of healthy, overfitting, and diverging training runs |
| **Telemetry Spine** | `/operations` | One unified distributed trace record feeding monitoring, billing, and evals |
| **Blast Radius** | `/operations` | Error costs: read operations trigger a retry; write tools require compensating rollbacks |

---

## 🎨 The 7-Theme Contextual Design System

Rather than a generic uniform dark mode, each section adopts a contextual visual identity driven by the `data-section` attribute on `<html>`, styled before first paint without flash-of-unstyled-content (FOUC):

| Section | Ground Tone | Accent Color | Typography Hierarchy |
| :--- | :--- | :--- | :--- |
| **Volume I (RAG)** | Sage Grey | Pine Green | Archivo + Source Serif 4 |
| **Volume II (Agents)** | Steel Grey (Console) | Burnt Signal Orange | Chivo + JetBrains Mono |
| **Operations** | Neutral Graphite | Instrument Slate Blue | Archivo + JetBrains Mono |
| **Python** | Warm Neutral Paper | Deep Plum | Chivo + Source Serif + IBM Plex Mono |
| **Stack** | Cool Blue-Grey | Ultramarine | Chivo + Source Serif + JetBrains Mono |
| **Training & ML** | Warm Charcoal | Brass / Amber | Archivo + Source Serif + JetBrains Mono |
| **Glossary** | Neutral Canvas | Dynamic (Volume-Tinted) | IBM Plex Mono + Source Serif |

- **Zero Flash**: Inlined `<head>` derivation executes synchronously before paint.
- **Light / Dark Mode**: Full system preference support with persistent manual override stored in `localStorage`.
- **Custom Tokenizer**: Lightweight zero-dependency code tokenizer rendering React tokens with CSS variables.

---

## 📁 Repository Structure

```
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Next.js App Router (75 pre-rendered pages)
│   │   ├── layout.tsx      # Root shell, font declarations, theme scripts
│   │   ├── globals.css     # Global CSS design tokens and base styles
│   │   ├── page.tsx        # Overview & volume map
│   │   ├── catalog/        # RAG catalog search & filter
│   │   ├── projects/[slug]/# 30 individual RAG project pages
│   │   ├── playbook/       # 9-stage RAG build playbook
│   │   ├── agents/         # Volume II catalog, slug specs, playbook, patterns
│   │   ├── operations/     # Telemetry, SLOs, eval gates, blast radius
│   │   ├── stack/          # LLM APIs, vector DBs, prompt engineering, MCP
│   │   ├── python/         # 30 worked Python snippets & concurrency
│   │   ├── ml/             # Classical ML, drift detection, feature stores
│   │   ├── training/       # Transformer training loop & loss curve visualizer
│   │   └── glossary/       # 138+ term searchable engineering dictionary
│   ├── components/         # Modular React components
│   │   ├── CatalogBrowser  # Interactive client-side multi-tag filter
│   │   ├── CodeBlock       # Custom safe-tokenizing code viewer
│   │   ├── SectionScope    # Section theme synchronizer
│   │   ├── SiteHeader      # Responsive header with section nav & theme toggle
│   │   ├── SiteFooter      # Universal site footer
│   │   ├── TierMeter       # Difficulty rating visualizer
│   │   └── figures/        # Hand-authored inline SVG architectural diagrams
│   ├── data/               # Single-source-of-truth TypeScript datasets
│   │   ├── projects.ts     # 30 complete RAG project specifications
│   │   ├── agents.ts       # 30 complete autonomous agent specifications
│   │   ├── agentPatterns.ts# 12 agentic patterns, code, and topologies
│   │   ├── playbook.ts     # Ingest, chunking, retrieval, and eval tables
│   │   ├── operations.ts   # Observability and reliability metrics
│   │   ├── stack.ts        # Vector DB comparison, token costs, MCP spec
│   │   ├── python.ts       # 30 high-throughput Python snippets
│   │   ├── ml.ts           # Classical algorithms, drift tests, MLOps
│   │   ├── training.ts     # Tokenizer, training loop, loss curve data points
│   │   └── glossary.ts     # 138+ curated technical entries
│   └── styles/             # Modular section CSS themes
│       ├── agents.css
│       ├── operations.css
│       ├── python.css
│       ├── stack.css
│       ├── training.css
│       └── glossary.css
├── package.json
├── tsconfig.json
├── next.config.ts
└── eslint.config.mjs
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later (or `pnpm` / `yarn`)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sairaghukiran14/BasicAIBrushUp.git
   cd BasicAIBrushUp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the port reported in your terminal) in your browser.

4. **Production Build & Test**:
   ```bash
   # Type check and build all 75 static pages
   npm run build

   # Start the production server
   npm run start

   # Run ESLint validation
   npm run lint
   ```

---

## 🛠️ Extending the Content

All domain knowledge is cleanly decoupled into strongly typed TypeScript data files in `src/data/`:

- **Add a new RAG project**: Add an entry to `src/data/projects.ts`. The catalog, static routing (`generateStaticParams`), navigation pager, and overview counters will automatically update at build time.
- **Add a new Agent**: Add an entry to `src/data/agents.ts` with its autonomy level, tool specs, guardrails, and ship metrics.
- **Add Python Snippets / Patterns**: Append your example to `src/data/python.ts` or `src/data/agentPatterns.ts`.
- **Add Glossary Terms**: Append to `src/data/glossary.ts` with domain tag, definition, architectural consequence, and practical example.

---

## ⚡ Engineering Principles

1. **Strictly Typed Everything**: Every project, agent, diagram, and table conforms to strict TypeScript interfaces.
2. **Zero Runtime Bloat**: No UI kit dependencies (no Radix, no Tailwind, no Framer Motion, no Lucide, no Chart.js). Lightning-fast load times and sub-millisecond route transitions.
3. **Data-Centric Design**: Adding new domain content requires zero modifications to rendering components.
4. **Accessible & High-Contrast**: Every color combination and chart data series satisfies WCAG AA contrast standards across both light and dark operating modes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
