export type Row = string[];
export type Table = { head: Row; rows: Row[] };

export type Use = "rag" | "agents";

export type Snippet = {
  id: string;
  title: string;
  /** One line: what this construct is actually doing for you here. */
  why: string;
  code: string;
  usedIn: Use[];
  /** Where it shows up in a real build, or the gotcha worth knowing. */
  note: string;
};

export const structuresTable: Table = {
  head: ["Structure", "Reach for it when", "Cost", "In these systems"],
  rows: [
    ["list", "Order matters and you iterate, slice or index by position", "O(1) append · O(n) membership", "Ranked hits, message history, chunk batches"],
    ["dict", "You look things up by a key", "O(1) get/set, insertion-ordered", "chunk_id → chunk for the rerank join; tool name → handler"],
    ["set", "You only care whether something is present, or you are deduplicating", "O(1) membership, no order", "Seen content hashes, a user's ACL groups, visited urls"],
    ["tuple", "A fixed-shape record you want to hash — cache keys especially", "immutable, hashable", "(tool, args) call signatures, (doc_id, page) locations"],
    ["frozenset", "A set you need as a dictionary key or cache key", "immutable, hashable", "An entitlement set used as a cache namespace"],
    ["deque", "A bounded window where the oldest item should fall off", "O(1) at both ends", "The agent scratchpad, a rolling latency window"],
    ["defaultdict / Counter", "You accumulate into keys that may not exist yet", "no key checks", "RRF score accumulation, tool-error tallies"],
    ["heapq", "Top-k out of a stream you never want to fully sort", "O(n log k)", "Top passages, most expensive runs"],
  ],
};

export const foundations: Snippet[] = [
  {
    id: "containers",
    title: "Pick the container for the question you will ask",
    why: "Almost every performance bug in a pipeline is a list being asked a membership question a set should have answered.",
    code: `from collections import deque

hits: list[Chunk] = []                    # ordered, sliceable: ranked results
by_id: dict[str, Chunk] = {}              # O(1) join key for reranking
seen: set[str] = set()                    # O(1) dedup before embedding
window: deque[str] = deque(maxlen=20)     # bounded scratchpad, oldest falls off
call: tuple[str, str] = ("search", query) # immutable, hashable: a cache key

for chunk in stream:
    h = content_hash(chunk["text"])
    if h in seen:                         # a set: constant time at 10M items
        continue                          # a list here would be O(n) per chunk
    seen.add(h)
    by_id[chunk["id"]] = chunk`,
    usedIn: ["rag", "agents"],
    note: "The `if h in seen` line is the whole point. Against a list of ten million hashes that loop is quadratic and your ingestion never finishes; against a set it is linear and finishes in minutes.",
  },
  {
    id: "loops",
    title: "Loops, comprehensions and when each one is right",
    why: "A comprehension maps or filters; a generator expression streams; an explicit loop is for side effects and early exit.",
    code: `# comprehension: you are transforming a collection into another collection
texts = [c["text"] for c in hits if set(c["acl"]) & user_groups]

# generator expression: consumed once, never materialised
total_tokens = sum(len(c["text"].split()) for c in hits)

# explicit loop: side effects, early exit, or several things at once
kept, budget = [], MAX_CONTEXT_TOKENS
for c in hits:                       # hits are score-ordered
    cost = len(c["text"].split())
    if cost > budget:
        break                        # nothing below here fits either
    kept.append(c)
    budget -= cost`,
    usedIn: ["rag"],
    note: "That last loop is context assembly: pack best-first until the token budget runs out, then stop. It is deliberately not a comprehension — the running budget is state, and state means a loop.",
  },
  {
    id: "conditionals",
    title: "Conditionals as guard clauses",
    why: "The abstention gate, the policy gate and the refusal path are all just early returns — flat beats nested.",
    code: `def answer(question: str, hits: list[Chunk]) -> Answer:
    if not question.strip():
        return Answer.refuse("empty question")
    if not hits:
        return Answer.refuse("nothing retrieved")
    if hits[0]["score"] < ABSTAIN_THRESHOLD:
        return Answer.refuse("no passage above threshold")   # no model call
    if any(c["effective_date"] > as_of for c in hits):
        hits = [c for c in hits if c["effective_date"] <= as_of]

    return generate(question, hits[:8])      # the happy path, unindented`,
    usedIn: ["rag", "agents"],
    note: "Each guard is one rule from the playbooks, and each one is testable on its own. Nesting the same logic three ifs deep is how a refusal condition quietly stops firing.",
  },
  {
    id: "functions",
    title: "Functions with signatures you can trust",
    why: "Keyword-only arguments stop the call site from silently swapping k and the filter dict six months from now.",
    code: `def search(
    query: str,
    *,                                  # everything after is keyword-only
    k: int = 20,
    filters: dict | None = None,        # never filters={} — see the traps
    channel: Channel = "fused",
) -> list[Chunk]:
    """Retrieve k chunks. Pure: no I/O beyond the index, no globals."""
    filters = filters or {}
    ...

hits = search(question, k=50, filters={"tenant": tenant_id})   # unmistakable`,
    usedIn: ["rag", "agents"],
    note: "Keep the core pure and push I/O to the edges: a function that only transforms its arguments can be tested without a database, and the golden-set suite depends on exactly that.",
  },
  {
    id: "modules",
    title: "Modules and packages: one file, one job",
    why: "The layout below is not aesthetic — it is what lets you swap the reranker or the vector store without touching the serving code.",
    code: `# rag/
#   __init__.py
#   ingest/     parse.py  chunk.py  embed.py     # offline loop
#   retrieve/   hybrid.py rerank.py  filters.py  # online loop
#   generate/   prompts.py  guards.py
#   serve/      api.py                           # thin: parse request, call, stream
#   eval/       golden.py  metrics.py
#   config.py                                    # settings object, imported everywhere

from rag.retrieve.hybrid import search          # explicit, greppable imports
from rag.generate.guards import should_abstain

# rule: ingest never imports serve, serve never imports ingest.
# If two modules need each other, the shared thing belongs in a third one.`,
    usedIn: ["rag", "agents"],
    note: "Import cycles are the first sign the boundary is wrong. The directory names here are the stage names from the playbook, which is the point: the code should be greppable from the architecture diagram.",
  },
  {
    id: "json-files",
    title: "JSON, JSONL and file handling",
    why: "Corpora and traces are JSONL — one object per line — because it streams, appends, and survives a crash mid-write.",
    code: `import json
from pathlib import Path

CORPUS = Path("data/corpus.jsonl")

def read_jsonl(path: Path):
    with path.open(encoding="utf-8") as f:      # always name the encoding
        for line in f:
            if line.strip():                     # tolerate blank lines
                yield json.loads(line)

def append_trace(path: Path, record: dict) -> None:
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False, default=str) + "\\n")

docs = read_jsonl(CORPUS)                        # lazy: nothing read yet`,
    usedIn: ["rag", "agents"],
    note: "A single giant JSON array forces you to parse the whole file before the first record. JSONL lets ingestion start immediately, lets traces be appended by many workers, and lets a truncated last line be dropped instead of failing the file.",
  },
  {
    id: "http",
    title: "API requests and responses",
    why: "One reused client, explicit timeouts, status codes mapped to your own exception types, and pagination as a generator.",
    code: `import httpx

client = httpx.Client(timeout=httpx.Timeout(10.0, connect=3.0))  # reuse: keep-alive

def fetch_page(url: str, cursor: str | None = None) -> dict:
    r = client.get(url, params={"cursor": cursor} if cursor else None)
    if r.status_code == 429:
        raise Retryable(f"rate limited; retry-after={r.headers.get('retry-after')}")
    if r.status_code >= 500:
        raise Retryable(f"upstream {r.status_code}")
    r.raise_for_status()                 # 4xx becomes an exception you can classify
    return r.json()

def fetch_all(url: str):
    cursor = None
    while True:
        page = fetch_page(url, cursor)
        yield from page["items"]         # stream items, not pages
        cursor = page.get("next")
        if not cursor:
            return`,
    usedIn: ["rag", "agents"],
    note: "No timeout means a hung connector can hold a worker forever. The status-code branches are what turn a provider hiccup into a retry and a bad request into an escalation — the same classification the agent loop relies on.",
  },
  {
    id: "config",
    title: "Configuration and secrets",
    why: "Keys come from the environment, settings are typed and validated at startup, and nothing sensitive is ever a literal in the repo.",
    code: `from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")

    anthropic_api_key: str               # APP_ANTHROPIC_API_KEY, required
    index_url: str = "http://localhost:6333"
    embed_model: str = "text-embedding-3-large"
    max_context_tokens: int = 8_000
    abstain_threshold: float = 0.35

settings = Settings()                    # fails loudly at import if a key is missing

# .env is in .gitignore. Production reads real environment variables from the
# secret manager; nothing here ever holds a literal key.`,
    usedIn: ["rag", "agents"],
    note: "Validating settings at import means a missing key is a startup failure, not a 500 at 2am on the first request that needed it. Rotation and per-tenant keys are covered in the stack section.",
  },
];

export const fundamentals: Snippet[] = [
  {
    id: "typed-records",
    title: "Type hints and TypedDict",
    why: "The chunk record is the contract between ingestion and retrieval — write it down once and every later stage inherits it.",
    code: `from typing import Literal, TypedDict

class Chunk(TypedDict):
    id: str
    doc_id: str
    text: str
    heading_path: list[str]
    effective_date: str | None   # ISO-8601; the filter you cannot recover after chunking
    acl: list[str]               # group ids, pre-filtered inside the search

Channel = Literal["dense", "bm25", "fused"]

def rrf(runs: dict[Channel, list[Chunk]], k: int = 60) -> list[Chunk]: ...`,
    usedIn: ["rag"],
    note: "Every field the RAG playbook tells you to keep — heading path, effective date, ACL tags — is a key on this record. If it is not in the type, it will not be in the index.",
  },
  {
    id: "validated-args",
    title: "Pydantic models as the tool schema",
    why: "One object generates the JSON schema the model sees and validates the call it makes — the ceiling lives in the type, not in the prompt.",
    code: `from typing import Literal
from pydantic import BaseModel, Field

class RefundArgs(BaseModel):
    order_id: str = Field(pattern=r"^ORD-\\d{8}$")
    amount_cents: int = Field(gt=0, le=25_000)      # the policy envelope, in code
    reason: Literal["damaged", "late", "not_as_described"]
    idempotency_key: str

TOOL_SCHEMA = RefundArgs.model_json_schema()        # handed to the model

def refund(raw: dict) -> dict:
    args = RefundArgs(**raw)                        # raises before anything is charged
    return payments.refund(args.order_id, args.amount_cents, key=args.idempotency_key)`,
    usedIn: ["agents"],
    note: "This is the agent playbook's “guardrails in code” rule as a class. Enums beat free text because an invalid value becomes a validation error the model can read and fix, not a bad write.",
  },
  {
    id: "generators",
    title: "Generators for anything corpus-sized",
    why: "Chunking, parsing and embedding are streams. A generator keeps memory flat whether the corpus is 40 documents or 40 million.",
    code: `from collections.abc import Iterator

def chunk(text: str, size: int = 400, overlap: int = 60) -> Iterator[tuple[int, str]]:
    words = text.split()
    step = size - overlap
    for start in range(0, len(words), step):
        window = words[start : start + size]
        if not window:
            break
        yield start, " ".join(window)

for offset, body in chunk(doc.text):     # one window in memory at a time
    index.add(embed(body), offset=offset)`,
    usedIn: ["rag"],
    note: "Words approximate tokens well enough to start; swap in a real tokeniser once chunk size matters. The shape — yield, never accumulate — is what stops ingestion from OOMing at document 900,000.",
  },
  {
    id: "batching",
    title: "Batching with itertools",
    why: "Embedding APIs charge per call and reward batches. This is the four-line utility every ingestion pipeline ends up with.",
    code: `from itertools import islice

def batched(iterable, n):                # itertools.batched on Python 3.12+
    it = iter(iterable)
    while batch := list(islice(it, n)):  # walrus: assign and test in one line
        yield batch

for group in batched(chunks, 128):
    vectors = client.embed([c["text"] for c in group])
    index.upsert(zip((c["id"] for c in group), vectors))`,
    usedIn: ["rag"],
    note: "Batch size is a throughput-versus-latency dial: large batches for a nightly rebuild, small ones for the incremental path where staleness is an SLO.",
  },
  {
    id: "context-managers",
    title: "Context managers for spans and resources",
    why: "A trace span is exactly a with-block: something that must be recorded whether the body succeeded or raised.",
    code: `import contextlib, time

@contextlib.contextmanager
def span(name: str, trace: dict):
    started = time.perf_counter()
    try:
        yield
    finally:                                     # runs on the exception path too
        trace["spans"].append(
            {"name": name, "ms": round((time.perf_counter() - started) * 1000, 1)}
        )

with span("retrieve", trace):
    hits = search(question)
with span("rerank", trace):
    top = reranker(question, hits)[:8]`,
    usedIn: ["rag", "agents"],
    note: "This is the per-stage timing the operations page asks for. perf_counter, never time.time — the latter jumps when the clock is adjusted.",
  },
  {
    id: "decorators",
    title: "Decorators for retry, timing and tracing",
    why: "Cross-cutting behaviour that must wrap every provider call without being pasted into every provider call.",
    code: `import functools, random, time

def retry(times: int = 3, on: tuple[type[Exception], ...] = (TimeoutError,)):
    def wrap(fn):
        @functools.wraps(fn)                     # keeps __name__ and the docstring
        def inner(*args, **kwargs):
            for attempt in range(times):
                try:
                    return fn(*args, **kwargs)
                except on:
                    if attempt == times - 1:
                        raise
                    time.sleep(2**attempt + random.random())   # backoff with jitter
        return inner
    return wrap

@retry(times=3, on=(TimeoutError, RateLimited))
def embed(texts: list[str]) -> list[list[float]]: ...`,
    usedIn: ["rag", "agents"],
    note: "Jitter is not decoration. Without it, every worker that failed at the same moment retries at the same moment, and a brownout becomes an outage.",
  },
  {
    id: "exceptions",
    title: "Exception types that carry the policy",
    why: "In an agent loop, the exception class decides what happens next: retry, hand the error back to the model, or stop and escalate.",
    code: `class ToolError(Exception): ...
class Retryable(ToolError): ...   # 429, 503, timeout — try again with backoff
class Invalid(ToolError): ...     # bad arguments — the model gets one corrected attempt
class Denied(ToolError): ...      # the gate refused — stop the loop, escalate

try:
    observation = call_tool(name, args)
except Retryable as e:
    observation = retry_or_give_up(e)
except Invalid as e:
    observation = f"invalid arguments: {e}. Expected: {TOOL_SCHEMA}"
except Denied as e:
    return escalate(run, reason=str(e))`,
    usedIn: ["agents"],
    note: "A tool error is read by the model on the next turn, so its message is a prompt. “500 Internal Server Error” teaches the model nothing; the expected schema teaches it everything.",
  },
  {
    id: "hashing",
    title: "hashlib for content hashes and idempotency keys",
    why: "The same three lines give you incremental indexing on the RAG side and safe retries on the agent side.",
    code: `import hashlib, json

def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

def idempotency_key(tool: str, args: dict) -> str:
    payload = json.dumps({"tool": tool, "args": args}, sort_keys=True)   # stable ordering
    return hashlib.sha256(payload.encode()).hexdigest()[:32]

if content_hash(doc.text) == stored_hash:
    return                       # unchanged: skip parse, chunk, embed and upsert`,
    usedIn: ["rag", "agents"],
    note: "sort_keys is the whole trick — without it, two identical calls with differently ordered dicts produce different keys, and your retry becomes a second refund.",
  },
];

export const concurrency: Snippet[] = [
  {
    id: "taskgroup",
    title: "Run the retrieval channels at the same time",
    why: "Dense and lexical search do not depend on each other, so running them sequentially donates 40 ms to nobody.",
    code: `import asyncio

async def hybrid(question: str, k: int = 100) -> list[Chunk]:
    async with asyncio.TaskGroup() as tg:            # Python 3.11+
        dense = tg.create_task(vector_search(question, k))
        lexical = tg.create_task(bm25_search(question, k))
    return rrf({"dense": dense.result(), "bm25": lexical.result()})

async def hybrid_or_degrade(question: str) -> list[Chunk]:
    try:
        async with asyncio.timeout(0.25):            # the budget from the latency table
            return await hybrid(question)
    except (TimeoutError, ExceptionGroup):
        trace["degraded"] = "lexical_only"           # D2 on the degradation ladder
        return await bm25_search(question, 100)`,
    usedIn: ["rag", "agents"],
    note: "TaskGroup cancels its siblings when one child fails and raises an ExceptionGroup — which is why the except clause names it. That cancellation is the feature: no orphaned request still burning a connection.",
  },
  {
    id: "bounded",
    title: "Bounded concurrency over a corpus",
    why: "Ten thousand concurrent embed calls is not parallelism, it is a denial-of-service attack on your own provider key.",
    code: `import asyncio

sem = asyncio.Semaphore(16)          # the number your provider actually tolerates

async def embed_batch(batch: list[str]) -> list[list[float]]:
    async with sem:                  # 16 in flight, the rest queue politely
        return await client.embed(batch)

async def embed_all(batches: list[list[str]]):
    results = await asyncio.gather(
        *(embed_batch(b) for b in batches),
        return_exceptions=True,      # one failure must not discard 9,999 successes
    )
    failed = [b for b, r in zip(batches, results) if isinstance(r, Exception)]
    return results, failed           # failed goes to the dead-letter queue`,
    usedIn: ["rag", "agents"],
    note: "return_exceptions=True is the difference between a bad batch and a lost night. The failed list is what the operations page calls dead-letter depth — alert on it.",
  },
  {
    id: "blocking",
    title: "Keep blocking work off the event loop",
    why: "PDF parsing, tokenising and numpy are CPU-bound. Called directly in a coroutine they freeze every other request on that worker.",
    code: `import asyncio
from concurrent.futures import ProcessPoolExecutor

pool = ProcessPoolExecutor(max_workers=4)

async def ingest(path: str) -> list[Chunk]:
    text = await asyncio.to_thread(extract_pdf, path)      # C library: releases the GIL
    loop = asyncio.get_running_loop()
    chunks = await loop.run_in_executor(pool, chunk_all, text)   # pure Python CPU: process
    return chunks`,
    usedIn: ["rag"],
    note: "The rule: I/O-bound to asyncio, C-extension CPU work to a thread, pure-Python CPU work to a process. Threads do not help pure Python because of the GIL — measure before you assume which one you have.",
  },
  {
    id: "streaming",
    title: "Async generators for streaming answers",
    why: "Time to first token is the latency the user feels, and the abstention gate belongs before the model call, not after it.",
    code: `from collections.abc import AsyncIterator

async def answer(question: str) -> AsyncIterator[str]:
    hits = await hybrid_or_degrade(question)
    top = await rerank(question, hits)

    if not top or top[0].score < ABSTAIN_THRESHOLD:
        yield "I don't have a source for that."       # no model call at all
        return

    async for token in llm.stream(build_prompt(question, top[:8])):
        yield token
    yield format_citations(top[:8])`,
    usedIn: ["rag"],
    note: "Mechanical abstention is twenty lines and one of them is here. The early return also saves the most expensive call in the pipeline on exactly the queries most likely to produce a wrong answer.",
  },
  {
    id: "contextvars",
    title: "contextvars to carry the trace id",
    why: "The trace id has to reach every span and every tool call without being threaded through forty function signatures.",
    code: `from contextvars import ContextVar
from uuid import uuid4

trace_id: ContextVar[str] = ContextVar("trace_id")

async def middleware(request, call_next):
    trace_id.set(request.headers.get("x-trace-id") or uuid4().hex)
    return await call_next(request)

def log_tool_call(name: str, args: dict, cost_usd: float) -> None:
    emit({"trace": trace_id.get(), "tool": name, "args": args, "cost": cost_usd})`,
    usedIn: ["rag", "agents"],
    note: "A ContextVar is per-task, so concurrent requests never see each other's id — unlike a module global, which is the bug you find in production at 200 requests per second.",
  },
  {
    id: "queue",
    title: "asyncio.Queue for backpressure",
    why: "An ingestion pipeline that reads faster than it embeds will consume all available memory and then stop being an ingestion pipeline.",
    code: `import asyncio

queue: asyncio.Queue[Chunk] = asyncio.Queue(maxsize=1_000)   # maxsize IS the backpressure

async def producer():
    async for doc in source.stream():
        for _, body in chunk(doc.text):
            await queue.put(make_chunk(doc, body))    # blocks when full — by design

async def consumer():
    while True:
        batch = [await queue.get() for _ in range(min(128, queue.qsize() or 1))]
        await index.upsert(await embed_batch([c["text"] for c in batch]))`,
    usedIn: ["rag"],
    note: "An unbounded queue is a memory leak with a schedule. Setting maxsize converts “we ran out of RAM at 3am” into “the producer waited”, which is a much better incident.",
  },
];

export const advanced: Snippet[] = [
  {
    id: "match",
    title: "Structural pattern matching for tool dispatch",
    why: "The agent returns a dict; match validates its shape and routes it in one construct, with an explicit unknown-tool branch.",
    code: `match call:
    case {"tool": "search", "args": {"query": str(q)}}:
        return await search(q)
    case {"tool": "refund", "args": dict(raw)}:
        return await refund(RefundArgs(**raw))        # validation is the gate's first half
    case {"tool": "escalate", "args": {"reason": str(reason)}}:
        return escalate(run, reason)
    case {"tool": str(name)}:
        raise Invalid(f"unknown tool: {name}")
    case _:
        raise Invalid("malformed tool call")`,
    usedIn: ["agents"],
    note: "The capture patterns — str(q), dict(raw) — assert the type as they bind. The final wildcard is the one people forget, and it is the branch a confused model will find.",
  },
  {
    id: "protocol",
    title: "Protocol for the tool interface",
    why: "Structural typing lets the gate ask a question about a tool — is this reversible? — without every tool inheriting from your base class.",
    code: `from typing import Any, Protocol, runtime_checkable

@runtime_checkable
class Tool(Protocol):
    name: str
    schema: dict[str, Any]
    reversible: bool                       # the gate reads this before allowing the call
    async def __call__(self, **kwargs: Any) -> dict[str, Any]: ...

def gate(tool: Tool, args: dict, policy: Policy) -> None:
    if not tool.reversible and not policy.human_approved:
        raise Denied(f"{tool.name} is irreversible and unapproved")`,
    usedIn: ["agents"],
    note: "This is the autonomy ladder expressed in the type system: an A3 agent may only be handed tools whose reversible flag is True, and that is checkable at registration time rather than at 3am.",
  },
  {
    id: "numpy",
    title: "numpy instead of a Python loop",
    why: "Scoring a hundred thousand candidates in a for-loop is roughly two orders of magnitude slower than one matrix multiply.",
    code: `import numpy as np

def top_k(query: np.ndarray, matrix: np.ndarray, k: int = 100) -> np.ndarray:
    scores = matrix @ query                    # rows are L2-normalised: dot == cosine
    idx = np.argpartition(-scores, k)[:k]      # O(n) partial selection, not a full sort
    return idx[np.argsort(-scores[idx])]       # sort only the k that survived

def rrf(runs: list[np.ndarray], k: int = 60) -> np.ndarray:
    fused: dict[int, float] = {}
    for run in runs:                           # ranks, not scores — nothing to normalise
        for rank, doc_id in enumerate(run):
            fused[doc_id] = fused.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
    return np.array(sorted(fused, key=fused.get, reverse=True))`,
    usedIn: ["rag"],
    note: "argpartition is the detail worth stealing: you almost never need the full ordering of a million scores, only the top k, and the partial selection is linear.",
  },
  {
    id: "quantise",
    title: "int8 quantisation in six lines",
    why: "The scaling lever from the playbook — 41 GB of float32 vectors becomes about 10 GB — is arithmetic, not a product you buy.",
    code: `import numpy as np

def quantise(matrix: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    scale = np.abs(matrix).max(axis=1, keepdims=True) / 127.0
    return (matrix / scale).round().astype(np.int8), scale

def search_quantised(q: np.ndarray, q8: np.ndarray, scale: np.ndarray, k: int):
    approx = (q8 @ np.round(q / scale.mean() * 127).astype(np.int8))   # cheap first pass
    candidates = np.argpartition(-approx, k * 10)[: k * 10]
    return candidates[np.argsort(-(full_precision[candidates] @ q))][:k]   # rescore top`,
    usedIn: ["rag"],
    note: "The pattern is the cascade again: a cheap approximate pass over everything, then full-precision rescoring of a shortlist. Measure the recall difference on your golden set before and after — it is usually inside the noise.",
  },
  {
    id: "timeout",
    title: "Structured timeouts around an agent step",
    why: "A step budget only exists if something cancels the work when it expires, including everything the step spawned.",
    code: `import asyncio

async def run_agent(state: State, max_steps: int = 20, budget_usd: float = 0.50):
    for step in range(max_steps):
        if state.spent >= budget_usd:
            return state.finish(reason="budget_exhausted")   # a normal outcome
        try:
            async with asyncio.timeout(30):                  # cancels the whole subtree
                state = await decide_and_act(state)
        except TimeoutError:
            state.note("step timed out")
        if state.done:
            return state.finish(reason="complete")
    return state.finish(reason="step_cap")`,
    usedIn: ["agents"],
    note: "Every exit from this loop is named. Budget exhaustion and the step cap are outcomes with defined results, not crashes — which is what makes them measurable in the eval suite.",
  },
  {
    id: "checkpoint",
    title: "sqlite3 as a checkpoint store",
    why: "Durable execution starts as one table. A crashed run resumes from its last committed step instead of replaying a write.",
    code: `import json, sqlite3

db = sqlite3.connect("runs.db", isolation_level=None)   # autocommit
db.execute("""CREATE TABLE IF NOT EXISTS steps(
    run_id TEXT, idx INTEGER, state TEXT, committed INTEGER,
    PRIMARY KEY (run_id, idx))""")

def checkpoint(run_id: str, idx: int, state: dict) -> None:
    db.execute("INSERT OR REPLACE INTO steps VALUES (?,?,?,1)",
               (run_id, idx, json.dumps(state)))

def resume(run_id: str) -> tuple[int, dict] | None:
    row = db.execute(
        "SELECT idx, state FROM steps WHERE run_id=? ORDER BY idx DESC LIMIT 1",
        (run_id,)).fetchone()
    return (row[0] + 1, json.loads(row[1])) if row else None`,
    usedIn: ["agents"],
    note: "Write the checkpoint after the tool call commits, never before — otherwise a crash between the two makes the resume replay a write that already happened. Idempotency keys are the belt to this pair of braces.",
  },
  {
    id: "percentiles",
    title: "Percentiles from the standard library",
    why: "Means hide the tail. p95 is the number in every SLO on the operations page, and it is one import.",
    code: `from statistics import quantiles

def p(latencies_ms: list[float], pct: int) -> float:
    if len(latencies_ms) < 2:
        return latencies_ms[0] if latencies_ms else 0.0
    return quantiles(latencies_ms, n=100, method="inclusive")[pct - 1]

report = {
    "p50": p(samples, 50),
    "p95": p(samples, 95),
    "ratio": round(p(samples, 95) / max(p(samples, 50), 1e-9), 2),   # tail health
}`,
    usedIn: ["rag", "agents"],
    note: "The p95-to-p50 ratio is the agent tail metric from the SLO table. Compute it per stage and per tenant — a global percentile can look fine while one customer is having an outage.",
  },
  {
    id: "testing",
    title: "The golden set as a parametrised test",
    why: "The eval suite both playbooks demand is a pytest file, and that is what lets it block a merge.",
    code: `import json, pytest

def load_golden(path: str) -> list[dict]:
    return [json.loads(line) for line in open(path)]

@pytest.mark.parametrize("case", load_golden("golden.jsonl"), ids=lambda c: c["id"])
def test_recall_at_20(case, index):
    hits = index.search(case["question"], k=20)
    assert case["answer_chunk_id"] in {h.id for h in hits}

@pytest.mark.parametrize("case", load_golden("unanswerable.jsonl"), ids=lambda c: c["id"])
def test_abstains(case, pipeline):
    assert pipeline.answer(case["question"]).abstained is True`,
    usedIn: ["rag", "agents"],
    note: "The second test is the one teams skip and then need. Fake the model and the tools with recorded responses so the suite is deterministic, fast and free — and keep the real-provider run for a nightly job.",
  },
];

export const stdlibTable: Table = {
  head: ["Module", "What it does for you here", "Where it shows up"],
  rows: [
    ["asyncio", "Concurrency for everything I/O-bound: retrieval channels, provider calls, tool calls", "Every serving path in both volumes"],
    ["contextlib", "with-blocks for spans, resource cleanup, temporary sandboxes", "Tracing, sandboxed execution"],
    ["contextvars", "Per-task state that survives awaits — trace ids, tenant, user entitlements", "Tracing and ACL propagation"],
    ["dataclasses", "Lightweight internal records without the validation overhead of a model", "Pipeline state, run state"],
    ["functools", "lru_cache, cached_property, partial, singledispatch, wraps", "Caching, decorators, per-format parsers"],
    ["itertools", "islice, batched, chain, groupby — the batching and streaming utilities", "Ingestion pipelines"],
    ["hashlib", "Content hashes for incremental indexing, idempotency keys for safe retries", "Both playbooks, repeatedly"],
    ["statistics", "quantiles for p50/p95/p99 without a dependency", "Latency and cost reporting"],
    ["heapq", "nlargest for top-k when the candidate set is small and already in memory", "Reranking, fusion"],
    ["collections", "deque for a bounded scratchpad, defaultdict for fusion accumulators", "Agent memory, RRF"],
    ["concurrent.futures", "Process and thread pools for parsing, tokenising and other CPU work", "Ingestion"],
    ["sqlite3", "A real checkpoint and cache store before you need a real database", "Agent durability, eval caches"],
    ["json / tomllib", "Traces as JSONL, configuration as TOML", "Observability, config"],
    ["logging", "Structured records keyed by trace id — ids and hashes, never prompts with PII", "Everything in production"],
  ],
};

export const ecosystemTable: Table = {
  head: ["Need", "The usual pick", "Why it, specifically"],
  rows: [
    ["Validation and schemas", "pydantic", "One model gives you the JSON schema for the tool and the validator for the call"],
    ["HTTP", "httpx", "Async and sync with one API, connection pooling, timeouts you must set explicitly"],
    ["Retries", "tenacity", "Declarative backoff, jitter and stop conditions instead of a hand-rolled decorator"],
    ["Vectors and maths", "numpy", "The difference between a 4 ms scoring pass and a 400 ms one"],
    ["Serving", "FastAPI", "Async-native, streams responses, and the same pydantic models describe the API"],
    ["Tracing", "OpenTelemetry", "Spans, context propagation and an exporter for whichever backend you land on"],
    ["Tests", "pytest", "Parametrised golden sets, fixtures for fake providers, one command in CI"],
    ["Environments", "uv", "Fast, lockfile-based, reproducible — an index build must be repeatable next quarter"],
    ["Token counting", "the provider's tokeniser", "Cost and context budgets are wrong if you approximate with word counts"],
  ],
};

export const traps: string[] = [
  "Calling a blocking library — requests, a sync database driver, time.sleep — inside a coroutine. One call freezes every other request on that worker.",
  "asyncio.gather over ten thousand tasks with no semaphore. You will rate-limit yourself and blame the provider.",
  "lru_cache on an async function. It caches the coroutine object, and awaiting it twice raises.",
  "Mutable default arguments (def f(items=[])). The list is created once, at import, and shared by every call forever.",
  "Naive datetimes for effective dates. Timezone-aware, ISO-8601, or the version-in-force filter is quietly wrong for half the world.",
  "Floats for money. Integer cents or Decimal — a refund ceiling enforced in floating point is not a ceiling.",
  "Threads for pure-Python CPU work. The GIL means you get concurrency without parallelism; use processes.",
  "gather without return_exceptions=True in a batch job. One bad document discards the whole run.",
  "time.time() for durations. It is wall-clock and can move backwards; perf_counter is monotonic.",
  "Logging the full prompt. Log the trace id, the retrieved ids and a hash — the prompt contains customer data.",
  "Creating a new HTTP client per request. You lose connection reuse and pay a handshake on every single call.",
  "Catching bare Exception around a tool call. You will swallow the cancellation that your step timeout just raised.",
];

export const pythonSections = [
  { id: "foundations", label: "Foundations" },
  { id: "fundamentals", label: "Building blocks" },
  { id: "concurrency", label: "Concurrency" },
  { id: "advanced", label: "Advanced" },
  { id: "stdlib", label: "Standard library" },
  { id: "ecosystem", label: "Ecosystem" },
  { id: "traps", label: "Traps" },
];
