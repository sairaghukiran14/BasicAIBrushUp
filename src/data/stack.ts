import type { Snippet, Table } from "@/data/python";

export type { Snippet, Table };

/* ------------------------------------------------------------------ */
/* 1. Calling a model API                                              */
/* ------------------------------------------------------------------ */

export const requestAnatomy: Table = {
  head: ["Field", "What it does", "What to watch"],
  rows: [
    ["model", "Which model serves the request", "Pin it explicitly and log it — an unpinned model is an unversioned dependency"],
    ["system", "Standing instructions: role, rules, output contract", "Keep it byte-stable so the prompt cache can hold it"],
    ["messages", "The conversation, alternating user and assistant turns", "The API is stateless — you resend the history every call, and you pay for it"],
    ["max_tokens", "Hard ceiling on the response", "Too low truncates mid-sentence; stream for large values so you do not hit HTTP timeouts"],
    ["tools", "Function schemas the model may call", "Order them deterministically; a changing tool list invalidates the cache"],
    ["cache_control", "Marks a prefix as cacheable", "Verify with usage.cache_read_input_tokens — silence here means a silent invalidator"],
    ["stop_reason", "Why generation ended: end_turn, max_tokens, tool_use, refusal", "Branch on it before reading content; never assume there is text"],
    ["usage", "input_tokens, output_tokens, cache read and write counts", "This is your cost meter — log it on every single call"],
  ],
};

export const apiSnippets: Snippet[] = [
  {
    id: "first-call",
    title: "One call, with the parts that matter in production",
    why: "A request is a system prompt, a message list, a ceiling and a usage record. Everything else is a variation on this.",
    code: `import anthropic

client = anthropic.Anthropic()      # reads ANTHROPIC_API_KEY; never hardcode a key

response = client.messages.create(
    model="claude-opus-5",
    max_tokens=16000,
    system=[{
        "type": "text",
        "text": GROUNDING_RULES,               # stable: cache the prefix
        "cache_control": {"type": "ephemeral"},
    }],
    messages=[{"role": "user", "content": build_prompt(question, passages)}],
)

text = next(b.text for b in response.content if b.type == "text")
trace["usage"] = {
    "in": response.usage.input_tokens,
    "cached": response.usage.cache_read_input_tokens,   # 0 means the cache missed
    "out": response.usage.output_tokens,
    "model": response.model,
    "stop": response.stop_reason,
}`,
    usedIn: ["rag", "agents"],
    note: "response.content is a list of typed blocks, not a string — check block.type before reading .text. Recording model, stop_reason and usage on every call is what makes the operations page possible at all.",
  },
  {
    id: "streaming",
    title: "Streaming, because time-to-first-token is the latency users feel",
    why: "A four-second answer that starts in half a second feels fast; a two-second answer that arrives all at once does not.",
    code: `async def answer_stream(question: str, passages: list[Chunk]):
    async with client.messages.stream(
        model="claude-opus-5",
        max_tokens=64000,                     # large ceilings need streaming
        system=GROUNDING_RULES,
        messages=[{"role": "user", "content": build_prompt(question, passages)}],
    ) as stream:
        async for token in stream.text_stream:
            yield token                       # straight to the client
        final = await stream.get_final_message()

    record_usage(final.usage)                 # accounting after the last token`,
    usedIn: ["rag", "agents"],
    note: "Use the streaming helper rather than raw events unless you need the raw event types — it accumulates the final message for you, which is where usage and stop_reason live.",
  },
  {
    id: "tool-loop",
    title: "The tool-use loop, by hand",
    why: "This ten-line loop is what every agent framework wraps. Write it once so you know what the framework is hiding.",
    code: `TOOLS = [{
    "name": "search_policies",
    "description": "Search the policy corpus. Returns passages with ids and scores.",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "product": {"type": "string", "enum": ["card", "loan", "deposit"]},
        },
        "required": ["query"],
        "additionalProperties": False,
    },
    "strict": True,          # arguments are guaranteed to validate against the schema
}]

response = client.messages.create(model=MODEL, max_tokens=16000,
                                  tools=TOOLS, messages=messages)

while response.stop_reason == "tool_use":
    messages.append({"role": "assistant", "content": response.content})
    results = []
    for block in response.content:
        if block.type != "tool_use":
            continue
        try:
            output = dispatch(block.name, block.input)      # a parsed dict
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": output})
        except ToolError as e:
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": str(e), "is_error": True})
    messages.append({"role": "user", "content": results})   # ALL results, ONE message
    response = client.messages.create(model=MODEL, max_tokens=16000,
                                      tools=TOOLS, messages=messages)`,
    usedIn: ["agents"],
    note: "Two details people get wrong: return every tool_result in a single user message (splitting them teaches the model to stop calling tools in parallel), and return failures as is_error results rather than dropping them — a missing result stalls the turn.",
  },
  {
    id: "errors",
    title: "Error handling that distinguishes retryable from fatal",
    why: "A single broad except loses the difference between “try again in two seconds” and “this request will never work”.",
    code: `import anthropic

try:
    response = client.messages.create(...)
except anthropic.NotFoundError:          # wrong model id — fatal, fix the config
    raise
except anthropic.RateLimitError:         # 429 — the SDK already retried; back off
    raise Retryable("rate limited")
except anthropic.APIStatusError as e:    # other 4xx/5xx
    raise Retryable(str(e)) if e.status_code >= 500 else Invalid(str(e))
except anthropic.APIConnectionError:     # network — retryable
    raise Retryable("connection failed")`,
    usedIn: ["rag", "agents"],
    note: "The SDK already retries 429s, 5xx and connection errors twice with backoff, so your own layer handles what survives that. Catch most-specific first — the classes form a hierarchy and a broad catch swallows the ones you wanted to treat differently.",
  },
];

/* ------------------------------------------------------------------ */
/* 2. Tokens, cost, keys                                               */
/* ------------------------------------------------------------------ */

export const modelTable: Table = {
  head: ["Model", "Model ID", "Context", "Input $/1M", "Output $/1M"],
  rows: [
    ["Claude Opus 5", "claude-opus-5", "1M", "$5.00", "$25.00"],
    ["Claude Sonnet 5", "claude-sonnet-5", "1M", "$2.00", "$10.00"],
    ["Claude Haiku 4.5", "claude-haiku-4-5", "200K", "$1.00", "$5.00"],
  ],
};

export const tokenLevers: Table = {
  head: ["Lever", "How it works", "Typical saving", "Cost to you"],
  rows: [
    ["Prompt caching", "Mark the stable prefix cacheable; repeats are read at a fraction of the input price", "up to ~90% of the cached prefix", "Prefix must stay byte-identical"],
    ["Batch API", "Submit non-urgent requests asynchronously, results keyed by your custom_id", "50%", "Latency measured in minutes, not milliseconds"],
    ["Model routing", "Small model for routing, extraction and classification; large model for the answer", "40–70% on multi-step flows", "One more decision per step, and two eval baselines"],
    ["Effort control", "Lower effort on routine routes, higher where correctness pays", "varies by route", "Must be measured per route, not set globally"],
    ["Fewer passages", "k=5–8 after reranking instead of everything that scored", "linear in context", "Needs a reranker to be safe"],
    ["Context compaction", "Summarise old observations into a running state object", "the agent tail", "A summarisation step, and its own failure mode"],
    ["Shorter outputs", "Structured output and explicit length limits", "10–20%", "Output tokens cost several times input tokens"],
  ],
};

export const tokenSnippets: Snippet[] = [
  {
    id: "count-tokens",
    title: "Count before you send",
    why: "Context budgets are enforceable only if you can measure them — and a word-count approximation is wrong by enough to matter.",
    code: `count = client.messages.count_tokens(
    model="claude-opus-5",
    system=GROUNDING_RULES,
    messages=messages,
)

while count.input_tokens > settings.max_context_tokens and len(passages) > 3:
    passages.pop()                                   # drop from the bottom, best-first
    messages = [{"role": "user", "content": build_prompt(question, passages)}]
    count = client.messages.count_tokens(
        model="claude-opus-5", system=GROUNDING_RULES, messages=messages)

trace["planned_input_tokens"] = count.input_tokens   # cost, known before you spend it`,
    usedIn: ["rag", "agents"],
    note: "Use the provider's own token counter rather than a third-party tokeniser — tokenisers differ between model families, and a 20% error in your estimate is a 20% error in every budget built on it.",
  },
  {
    id: "caching",
    title: "Prompt caching, and proving it worked",
    why: "The single largest cost lever in a RAG system, because the instructions and schemas are identical on every request.",
    code: `response = client.messages.create(
    model="claude-opus-5",
    max_tokens=16000,
    system=[{
        "type": "text",
        "text": GROUNDING_RULES + TOOL_DOCS,     # stable bytes, first in the prefix
        "cache_control": {"type": "ephemeral"},
    }],
    messages=[{"role": "user", "content": question_and_passages}],   # volatile, last
)

if response.usage.cache_read_input_tokens == 0:
    log.warning("cache miss — check for a timestamp or unsorted JSON in the prefix")`,
    usedIn: ["rag", "agents"],
    note: "Caching is a prefix match in the order tools → system → messages, so one changing byte early — a datetime, a UUID, an unsorted dict — invalidates everything after it. That warning line has paid for itself in every system I have seen it in.",
  },
  {
    id: "keys",
    title: "Keys, scoping and spend limits",
    why: "An API key is a spending instrument. Treat it like one: scoped, rotated, metered, and never in the repository.",
    code: `# 1. Never in code. The SDK reads ANTHROPIC_API_KEY from the environment,
#    which in production comes from the secret manager, not a .env file.
client = anthropic.Anthropic()

# 2. One key per workload, not one per company: serving, ingestion, evals and
#    experiments get separate keys so a runaway backfill cannot starve serving
#    and so the bill attributes itself.

# 3. Meter per tenant in your own code — the provider bills you, not them.
async def guarded_call(tenant: str, **kwargs):
    if await spend.today(tenant) > BUDGETS[tenant]:
        raise Denied(f"{tenant} exceeded today's budget")
    response = await client.messages.create(**kwargs)
    await spend.add(tenant, cost_of(response.usage))
    return response`,
    usedIn: ["rag", "agents"],
    note: "Rotate on a schedule and on every departure, keep keys out of logs and traces, and give the agent a key scoped to exactly the workload it runs. A per-tenant budget check before the call is the only thing that stops one customer's loop from spending everyone's month.",
  },
];

/* ------------------------------------------------------------------ */
/* 3. Prompt engineering                                               */
/* ------------------------------------------------------------------ */

export const promptParts: Table = {
  head: ["Part", "What goes in it", "Failure when it is missing"],
  rows: [
    ["Role", "Who the model is acting as and for whom", "Register drifts; answers aimed at the wrong reader"],
    ["Task", "One sentence naming the job, in the imperative", "The model optimises for something adjacent to what you wanted"],
    ["Context", "The retrieved passages, the record, the state — clearly delimited and labelled with ids", "Ungrounded answers, and citations you cannot verify"],
    ["Examples", "Two or three input/output pairs covering the edge you keep losing", "Format drift, and the hard case handled differently each time"],
    ["Output contract", "The exact shape: JSON schema, section headings, length", "Downstream parsing breaks on the day the phrasing changes"],
    ["Constraints", "What not to do, and what to do instead when it cannot comply", "Confident answers where a refusal was the correct output"],
  ],
};

export const promptSnippets: Snippet[] = [
  {
    id: "prompt-before-after",
    title: "The same prompt, before and after",
    why: "Precision is not politeness. Each added line here removes a specific failure that showed up in the eval set.",
    code: `# BEFORE — reads fine, fails in six different ways
"You are a helpful assistant. Answer the user's question using the context below.\\n"
f"Context: {passages}\\nQuestion: {question}"

# AFTER — role, task, delimited context with ids, contract, constraints
SYSTEM = """You answer benefits questions for employees of ACME's UK entity.

Rules:
- Answer only from the passages in <passages>. They are the whole truth.
- Cite the passage id in square brackets after each claim, e.g. [hb-104].
- If the passages do not contain the answer, reply exactly:
  "I don't have that in the handbook — ask your HR business partner."
- Never state an amount or a date that does not appear verbatim in a passage.
- Answer in at most four sentences, in plain English, no bullet lists."""

USER = f"""<passages>
{format_passages(passages)}   # <p id="hb-104" updated="2026-01-04">...</p>
</passages>

<question>{question}</question>"""`,
    usedIn: ["rag", "agents"],
    note: "The refusal string is exact so a downstream system can detect it. The id format is exact so citations can be validated by string match instead of a second model call. Both are cheaper than the alternatives.",
  },
  {
    id: "prompt-loop",
    title: "Iterative refinement, run as an experiment",
    why: "A prompt change without a measurement is a rumour. This is the loop that turns prompt editing into engineering.",
    code: `# prompts/answer_v7.txt   — prompts are files, versioned with the code
PROMPT_VERSION = "answer_v7"

def run_eval(version: str) -> dict:
    results = [grade(case, answer(case["question"], version=version))
               for case in load_golden("golden.jsonl")]
    return {
        "version": version,
        "faithfulness": mean(r["faithful"] for r in results),
        "citation_precision": mean(r["cited_ok"] for r in results),
        "abstained_correctly": mean(r["abstain_ok"] for r in results),
        "failures": [r for r in results if not r["faithful"]],   # read these
    }

# one change per run; keep the failures; the version goes in every trace
before, after = run_eval("answer_v6"), run_eval("answer_v7")`,
    usedIn: ["rag", "agents"],
    note: "Change one thing per run and read the failures rather than the average — the average tells you whether to keep the change, the failures tell you what to write next. Stamp the prompt version into every trace so a regression can be bisected.",
  },
];

export const promptRules: string[] = [
  "Put the stable material first and the volatile material last — it is better for the reader and it is what makes prompt caching work.",
  "Delimit retrieved content with tags and ids. The model needs to know where your instructions end and untrusted text begins, and so do you when you validate the citations.",
  "Show, do not describe, when the output shape matters. Two examples beat a paragraph explaining the format.",
  "Give the model an exit. Every prompt that can fail needs a written way to say it cannot answer, or it will invent one.",
  "Say what to do, not only what to avoid. “If the amount is missing, say the amount is missing” beats “do not hallucinate amounts”.",
  "Never paste retrieved text into the instruction slot. It arrives from outside; it is data, and some of it is written by people who know a model will read it.",
  "Keep prompts in files, not string literals scattered through the code, and version them like any other dependency.",
];

/* ------------------------------------------------------------------ */
/* 4. Vector databases                                                 */
/* ------------------------------------------------------------------ */

export const vectorDbTable: Table = {
  head: ["Option", "Reach for it when", "What you give up"],
  rows: [
    ["pgvector (Postgres)", "You already run Postgres and your corpus is under ~10M chunks", "Peak ANN throughput; you tune it yourself"],
    ["Qdrant / Weaviate / Milvus", "You want a purpose-built engine with filtering, hybrid search and sharding", "Another stateful service to run, back up and upgrade"],
    ["Managed (Pinecone, Turbopuffer, cloud offerings)", "You would rather buy the operations", "Cost at scale, data residency, and control over index parameters"],
    ["Elasticsearch / OpenSearch", "You need BM25 and vectors in one engine and already run it", "Vector-side ergonomics; the ANN implementation lags specialists"],
    ["FAISS / in-process", "Under a million vectors, read-mostly, one machine, batch rebuilds", "Concurrent writes, filtering, durability, multi-tenancy"],
  ],
};

export const vectorSnippets: Snippet[] = [
  {
    id: "pgvector",
    title: "Schema, index and a filtered query",
    why: "The schema is where multi-tenancy and versioning live. Get these three statements right and the rest is tuning.",
    code: `CREATE TABLE chunks (
    id         text PRIMARY KEY,
    doc_id     text NOT NULL,
    tenant_id  text NOT NULL,          -- the pre-filter, in the index
    heading    text,
    effective  date,                   -- version-in-force filtering
    text       text NOT NULL,
    embedding  vector(1024)
);

CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 32, ef_construction = 128);
CREATE INDEX ON chunks (tenant_id, effective);

SET hnsw.ef_search = 100;              -- the recall/latency dial, per session

SELECT id, text, 1 - (embedding <=> $1) AS score
FROM chunks
WHERE tenant_id = $2 AND effective <= $3     -- filter inside the search, not after
ORDER BY embedding <=> $1
LIMIT 100;`,
    usedIn: ["rag"],
    note: "m and ef_construction are build-time (they cost memory and index time); ef_search is query-time (it costs milliseconds). Tune ef_search against your golden set until recall stops improving, then stop — that is the recall–latency curve, measured.",
  },
  {
    id: "upsert",
    title: "Incremental upsert with tombstones",
    why: "This is what turns a nightly rebuild into a five-minute staleness SLO.",
    code: `def sync(doc: Document) -> None:
    stored = index.get_doc_hash(doc.id)
    if stored == doc.content_hash:
        return                                   # unchanged: skip parse and embed

    chunks = list(chunk(doc.text))
    vectors = embed([c.text for c in chunks])
    index.upsert(doc.id, chunks, vectors, doc_hash=doc.content_hash)
    index.delete_where(doc_id=doc.id, not_in=[c.id for c in chunks])   # tombstone

def on_source_delete(doc_id: str) -> None:
    index.delete_where(doc_id=doc_id)            # or an answer will cite a dead file`,
    usedIn: ["rag"],
    note: "Deletions are the half everyone forgets, and they are the half that produces “the assistant quoted a document we removed last quarter”. Track time-from-change-to-searchable and alert on it.",
  },
  {
    id: "pinecone",
    title: "A managed store, and the namespace that carries tenancy",
    why: "Managed vector databases trade index control for operations you no longer run — the schema decisions stay yours.",
    code: `from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key=settings.pinecone_api_key)

pc.create_index(
    name="policies",
    dimension=1024,                       # must match the embedding model, forever
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
)
index = pc.Index("policies")

index.upsert(                             # namespace per tenant: isolation for free
    vectors=[(c["id"], vec, {"doc_id": c["doc_id"], "effective": c["effective"]})
             for c, vec in zip(batch, vectors)],
    namespace=tenant_id,
)

hits = index.query(
    vector=query_vec,
    top_k=100,
    namespace=tenant_id,                  # scoped before the search, not after
    filter={"effective": {"$lte": as_of}},
    include_metadata=True,
)`,
    usedIn: ["rag"],
    note: "Namespaces are the cheapest multi-tenancy you will get: one index, isolated key spaces, and a query that cannot see another tenant's vectors. The dimension is fixed at creation — changing embedding model means a new index and a migration, exactly as it does with pgvector.",
  },
];

export const vectorOps: string[] = [
  "Changing the embedding model changes the index's identity — build a second collection, dual-write, compare on the golden set, then cut over.",
  "Back up the index or be able to rebuild it from source deterministically. Most teams should be able to do both, and should have tried.",
  "Store ACL tags beside the vector and filter inside the search. Post-filtering leaked passages is not access control.",
  "Keep a fixed probe set of queries with known answers and run it against the live index — it catches a half-built index faster than any health check.",
  "Size before you choose: chunks × dimensions × 4 bytes for float32, a quarter of that at int8, plus roughly 3 GB of graph per 10M vectors.",
];

/* ------------------------------------------------------------------ */
/* 5. Open models and Hugging Face                                     */
/* ------------------------------------------------------------------ */

export const selfHostTable: Table = {
  head: ["Choose", "When", "Because"],
  rows: [
    ["A hosted frontier API", "Quality is the constraint, volume is moderate, data can leave", "No GPUs to run, best capability per line of code"],
    ["Open model, self-hosted", "Volume is high and steady, or data cannot leave, or you need a fine-tune", "Cost per token collapses at scale; latency and residency are yours"],
    ["Both", "Most real systems", "Small open model for classification, routing and embeddings; frontier API for the answer"],
  ],
};

export const servingTable: Table = {
  head: ["Runtime", "Good for", "Note"],
  rows: [
    ["Ollama / llama.cpp", "Local development, laptops, small internal tools", "Quantised GGUF weights; single-user throughput"],
    ["vLLM", "Production serving with real concurrency", "Continuous batching and paged attention — the throughput default"],
    ["Text Generation Inference", "Production serving inside a Hugging Face-centric stack", "Similar niche to vLLM; check model support first"],
    ["transformers directly", "Batch jobs, research, one-off scoring", "Simplest to write, weakest under concurrent load"],
  ],
};

export const hfSnippets: Snippet[] = [
  {
    id: "hf-pipeline",
    title: "The simplest useful thing: a pipeline",
    why: "Classification, NER and zero-shot routing do not need a frontier model, and running them locally removes a network hop from every request.",
    code: `from transformers import pipeline

route = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=0,                              # -1 for CPU
)

result = route(
    ticket_text,
    candidate_labels=["billing", "outage", "how-to", "cancellation"],
)
label, confidence = result["labels"][0], result["scores"][0]

if confidence < 0.6:
    label = "needs_human"                  # the explicit unsure class, again`,
    usedIn: ["rag", "agents"],
    note: "This is the first step of an agent's routing decision done for a fraction of a cent and a few milliseconds. Pipelines download and cache weights on first use — pin the revision in production so a model update is a deploy, not a surprise.",
  },
  {
    id: "hf-load",
    title: "Loading a model yourself",
    why: "When you need control over dtype, device placement and generation parameters — or the model has no pipeline for your task.",
    code: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    dtype=torch.bfloat16,       # older transformers call this torch_dtype
    device_map="auto",          # shard across whatever GPUs exist
)

inputs = tokenizer.apply_chat_template(
    [{"role": "user", "content": prompt}],
    add_generation_prompt=True,
    return_tensors="pt",
).to(model.device)

out = model.generate(inputs, max_new_tokens=512, do_sample=False)   # greedy: repeatable
print(tokenizer.decode(out[0][inputs.shape[-1]:], skip_special_tokens=True))`,
    usedIn: ["rag", "agents"],
    note: "Sizing rule: parameters × 2 bytes at bf16, so an 8B model needs ~16 GB before the KV cache, and roughly 5 GB at 4-bit. If the model does not fit with room for the cache, throughput collapses regardless of how fast the card is.",
  },
  {
    id: "hf-embed",
    title: "Embeddings in your own process",
    why: "Embedding is the highest-volume model call in a RAG system and the one most worth taking in-house.",
    code: `from sentence_transformers import SentenceTransformer

encoder = SentenceTransformer("BAAI/bge-m3", device="cuda")

vectors = encoder.encode(
    [c["text"] for c in batch],
    batch_size=64,
    normalize_embeddings=True,       # unit vectors: dot product == cosine
    convert_to_numpy=True,
)
index.upsert(ids=[c["id"] for c in batch], vectors=vectors)

# queries must use the same model, the same normalisation and, for asymmetric
# models, the same instruction prefix — otherwise the geometry does not match`,
    usedIn: ["rag"],
    note: "Millions of chunks at a hosted embedding price is a real number; the same work on one GPU is electricity. Just remember the index is now bound to this model — swapping it is a migration, not a config change.",
  },
];

/* ------------------------------------------------------------------ */
/* 6. Fine-tuning                                                      */
/* ------------------------------------------------------------------ */

export const fineTuneLadder: Table = {
  head: ["Try first", "Fixes", "Does not fix"],
  rows: [
    ["A better prompt", "Format, tone, missing constraints, refusal behaviour", "Missing knowledge; genuinely unfamiliar tasks"],
    ["Few-shot examples", "Consistency on edge cases, output shape", "Long-tail facts; context that changes daily"],
    ["Retrieval (RAG)", "Missing or changing knowledge, citations, freshness", "A model that cannot follow your format at all"],
    ["Fine-tuning (LoRA)", "Style, domain vocabulary, structured output reliability, latency and cost at fixed quality", "Facts that change — those still belong in retrieval"],
    ["Full fine-tune / continued pretraining", "A genuinely new domain or language", "Almost every business problem; the cost rarely repays"],
  ],
};

export const fineTuneSnippet: Snippet = {
  id: "lora",
  title: "LoRA: the 0.1% of parameters worth training",
  why: "Adapters train on one GPU in hours, ship as megabytes, and can be swapped per tenant at serving time.",
  code: `from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=16,                       # rank: 8–32 covers most tasks
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"],
    task_type="CAUSAL_LM",
)

model = get_peft_model(base_model, config)
model.print_trainable_parameters()      # ~0.1% trainable — the rest stays frozen

# train on 500–5,000 examples of YOUR task, held-out set kept aside,
# then evaluate against the same golden set the prompt was measured on`,
  usedIn: ["agents"],
  note: "Judge a fine-tune against the prompt it replaces, on the same eval set, including latency and cost — not on training loss. If a longer prompt gets you there, it is cheaper to maintain and it does not go stale when the base model updates.",
};

export const fineTuneRules: string[] = [
  "Data quality dominates. Five hundred carefully corrected examples beat fifty thousand scraped ones, and the corrections are where the learning is.",
  "Hold out a test set before you start and never train on it. Without it you cannot tell learning from memorising.",
  "Version the adapter alongside the base model — an adapter trained on one base does not transfer to the next release.",
  "Serve adapters rather than merged weights when you have several tenants or tasks; they load per request and cost megabytes, not gigabytes.",
  "Re-run the whole eval suite, not the fine-tuning metric. Fine-tunes routinely improve the target task and quietly break refusals.",
];

/* ------------------------------------------------------------------ */
/* 7. Workflows and frameworks                                         */
/* ------------------------------------------------------------------ */

export const workflowSnippet: Snippet = {
  id: "workflow",
  title: "A multi-step workflow, no framework required",
  why: "Most “agent” projects are this: a fixed sequence of model calls with code in between, which you can read, test and cost in advance.",
  code: `from dataclasses import dataclass, field

@dataclass
class State:
    email: str
    fields: dict = field(default_factory=dict)
    category: str = ""
    draft: str = ""
    notes: list[str] = field(default_factory=list)

def extract(s: State) -> State:
    s.fields = call_json(EXTRACT_PROMPT, s.email, schema=OrderFields)   # small model
    return s

def classify(s: State) -> State:
    s.category = route(s.email)["labels"][0]                            # local model
    return s

def draft(s: State) -> State:
    passages = search(s.email, filters={"category": s.category})
    s.draft = answer(s.email, passages)                                 # frontier model
    return s

def run(email: str) -> State:
    state = State(email=email)
    for step in (extract, classify, draft):        # fixed order, known cost
        with span(step.__name__, trace):
            state = step(state)
    return state`,
  usedIn: ["rag", "agents"],
  note: "Every property people want from an agent framework is here: typed state, per-step tracing, testable steps, a known cost. Reach for the framework when the sequence itself must be chosen at runtime — not before.",
};

export const frameworkTable: Table = {
  head: ["Framework", "What it gives you", "Adopt it when", "Watch for"],
  rows: [
    ["LangChain", "Connectors, loaders, chains, a large integration surface", "You need many integrations quickly and value breadth over control", "Abstractions that hide the prompt and the retrieval scores you need to debug"],
    ["LlamaIndex", "Ingestion, indexing and retrieval abstractions built around RAG", "The corpus work is the hard part and you want it prebuilt", "Defaults chosen for demos — check the chunking and the k it picked for you"],
    ["LangGraph", "Explicit graph state machines with checkpointing and resumption", "Your agent genuinely needs durable multi-step state", "Graph complexity growing past what a plain state machine would need"],
    ["DSPy", "Programmatic prompt optimisation against a metric", "You have a real eval set and prompt tuning has become the bottleneck", "It needs that eval set first — there is no shortcut around it"],
    ["No framework", "Everything you wrote and can read", "The workflow is fixed, or you are still learning what the system needs", "Rebuilding retries, tracing and state badly — take those from libraries"],
  ],
};

/* ------------------------------------------------------------------ */
/* 8. MCP                                                              */
/* ------------------------------------------------------------------ */

export const mcpTable: Table = {
  head: ["Primitive", "What it is", "Use it for"],
  rows: [
    ["Tool", "A callable function with a JSON schema, invoked by the model", "Actions and lookups: search the corpus, create the ticket, run the query"],
    ["Resource", "Addressable read-only content the host can fetch", "Documents, records and files the model should be able to read on request"],
    ["Prompt", "A named, parameterised prompt template the server offers", "Sharing a reviewed prompt across every host that connects"],
  ],
};

export const mcpSnippets: Snippet[] = [
  {
    id: "mcp-server",
    title: "An MCP server: your retrieval, exposed once",
    why: "Write the tool once and every MCP-speaking host — an IDE, a desktop assistant, your own agent — can call it without bespoke glue.",
    code: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("policy-tools")

@mcp.tool()
def search_policies(query: str, product: str = "all", k: int = 8) -> list[dict]:
    """Search the policy corpus.

    Args:
        query: Natural-language question.
        product: One of card, loan, deposit, or all.
        k: How many passages to return (max 20).
    """
    hits = hybrid_search(query, filters={"product": product}, k=min(k, 20))
    return [{"id": h.id, "text": h.text, "score": h.score} for h in hits]

if __name__ == "__main__":
    mcp.run()          # stdio by default; HTTP transport for remote hosts`,
    usedIn: ["agents"],
    note: "The docstring is the tool description the model reads, and the type hints become the schema — so this is the same discipline as any tool definition, with the transport handled for you. Keep it read-only until the write path has a gate.",
  },
  {
    id: "mcp-connect",
    title: "Connecting a remote MCP server to the model",
    why: "The API can talk to an MCP server directly — but only if you declare both halves of the connection.",
    code: `response = client.beta.messages.create(
    model="claude-opus-5",
    max_tokens=16000,
    betas=["mcp-client-2025-11-20"],
    mcp_servers=[{
        "type": "url",
        "url": "https://mcp.internal.example.com/sse",
        "name": "policy-tools",
    }],
    tools=[{"type": "mcp_toolset", "mcp_server_name": "policy-tools"}],   # required
    messages=[{"role": "user", "content": question}],
)`,
    usedIn: ["agents"],
    note: "Declaring mcp_servers without the matching mcp_toolset entry is rejected as a validation error — the server list says what exists, the toolset says the model may use it. For local servers, use the SDK's MCP helpers instead and keep the process on your machine.",
  },
];

export const mcpSecurity: string[] = [
  "A third-party MCP server is untrusted code with a tool description the model will read. Review it the way you would review a dependency, and pin the version.",
  "Tool descriptions are part of the prompt. A malicious server can describe its tool in a way that redirects the agent — the same injection problem, arriving through a new door.",
  "Scope the credentials the server gets, not the ones you have. An MCP server that only needs read access should be given a read-only token.",
  "Keep the gate on your side. MCP standardises how a tool is called; it does not decide whether the call is allowed — that stays in your policy layer.",
  "Prefer local (stdio) servers for anything touching private data, and treat every remote server as an egress path that needs an allowlist.",
];

/* ------------------------------------------------------------------ */
/* 9. Assembling it                                                    */
/* ------------------------------------------------------------------ */

export const referenceStacks: Table = {
  head: ["Layer", "Weekend build", "Team system", "Enterprise"],
  rows: [
    ["Serving", "FastAPI on one box", "FastAPI + workers behind a load balancer", "Autoscaled containers, per-tenant queues"],
    ["Model", "Hosted API, one model", "Hosted API + small local model for routing", "Hosted API + self-hosted open models, routed per step"],
    ["Embeddings", "Hosted embedding API", "sentence-transformers on one GPU", "GPU pool, batched, with an embedding cache"],
    ["Vector store", "pgvector in the app's Postgres", "Qdrant or pgvector, backed up, probe-monitored", "Sharded engine, tiered storage, per-tenant namespaces"],
    ["Orchestration", "Plain Python functions", "Plain Python + a queue", "Durable execution with checkpointing"],
    ["State", "SQLite", "Postgres", "Postgres + object storage for artefacts"],
    ["Observability", "JSONL traces on disk", "OpenTelemetry + a dashboard", "Traces, evals and cost joined in one warehouse"],
    ["Evaluation", "pytest over a golden JSONL", "Same, gating CI", "Same, plus scheduled human audits and drift alerts"],
  ],
};

export const buildOrder: string[] = [
  "Get one document to one grounded, cited answer with a hosted API and an in-process index. No framework, no queue, no GPU.",
  "Write the golden set from real questions before you tune anything, and put it in CI on day two.",
  "Replace the toy index with a real vector store once the corpus outgrows memory or two people need to write to it.",
  "Add caching and a small routing model when the bill or the p95 latency becomes the thing you talk about in standup.",
  "Add tools and the loop only when the question genuinely requires the model to choose the next step.",
  "Add MCP when a second host — an IDE, a desktop assistant, another team's agent — wants the same tools you already built.",
  "Self-host a model when the arithmetic says so: steady volume, fixed workload, or data that cannot leave. Not before.",
];

export const stackSections = [
  { id: "api", label: "Model APIs" },
  { id: "tokens", label: "Tokens & cost" },
  { id: "prompting", label: "Prompting" },
  { id: "vectors", label: "Vector DBs" },
  { id: "open", label: "Open models" },
  { id: "tuning", label: "Fine-tuning" },
  { id: "workflows", label: "Workflows" },
  { id: "mcp", label: "MCP" },
  { id: "assemble", label: "Assembling" },
];
