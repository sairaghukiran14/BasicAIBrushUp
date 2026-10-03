import type { Snippet, Table } from "@/data/python";

export type { Snippet, Table };

export const buildLadder: Table = {
  head: ["Level", "What you change", "Data needed", "Hardware", "When it is the right answer"],
  rows: [
    ["Prompt", "Instructions only", "A handful of examples", "None", "Format, tone, constraints — try this first, always"],
    ["Retrieval", "What the model can see", "Your corpus", "None", "Missing or changing knowledge"],
    ["LoRA / QLoRA", "~0.1% of weights, as an adapter", "500–5,000 curated examples", "One 24 GB GPU", "Style, domain vocabulary, reliable structured output"],
    ["Full fine-tune", "Every weight of a pretrained model", "10k–1M examples", "Multi-GPU node", "A large behaviour shift a rank-16 adapter cannot express"],
    ["Continued pretraining", "Every weight, on raw domain text", "1–100B tokens", "GPU cluster", "A genuinely under-represented domain or language"],
    ["From scratch", "Architecture, tokenizer, weights, all of it", "10B+ tokens", "Cluster, weeks", "Research, a novel modality, a tiny specialist model — or learning"],
  ],
};

export const dataRules: string[] = [
  "Deduplicate before anything else. Exact hashes catch copies; MinHash or SimHash catches near-duplicates. Repeated text is memorised, inflates your eval scores and wastes compute in equal measure.",
  "Decontaminate against the eval set. Any n-gram overlap between training data and your benchmarks makes every number afterwards a lie — check it, and record that you checked.",
  "Filter for quality, not just volume. Length bounds, language id, perplexity filtering with a small reference model, boilerplate stripping. A smaller clean corpus beats a larger dirty one at the same compute.",
  "Fix the mixture deliberately. Domain ratios are a hyperparameter: write them down, log them with the run, and change one at a time.",
  "Split before you look. Train, validation and test, split by document (never by chunk, or the same document leaks across the boundary), held out before any tuning.",
  "Track provenance and licence per document. The day someone asks what the model was trained on, a hash and a source field per record is the difference between an answer and a project.",
  "For fine-tuning, curate rather than collect. Five hundred examples corrected by someone who knows the task beat fifty thousand scraped ones, and the corrections are where the learning is.",
];

export const trainingSnippets: Snippet[] = [
  {
    id: "data-prep",
    title: "Cleaning, deduplication and splitting",
    why: "This code decides the result far more than the architecture does, and it is the part people skip.",
    code: `import hashlib, json, random
from pathlib import Path

def prepare(src: Path, out: Path, val_frac: float = 0.005) -> None:
    seen: set[str] = set()
    kept, dropped = 0, 0
    with (out / "train.jsonl").open("w") as tr, (out / "val.jsonl").open("w") as va:
        for doc in read_jsonl(src):
            text = normalise(doc["text"])                 # unicode, whitespace, boilerplate
            if not (200 <= len(text) <= 200_000):
                dropped += 1; continue                    # length bounds
            h = hashlib.sha256(text.encode()).hexdigest()
            if h in seen:
                dropped += 1; continue                    # exact dedup
            if overlaps_eval(text):                       # decontamination, 13-gram
                dropped += 1; continue
            seen.add(h)
            record = {"id": doc["id"], "text": text, "source": doc["source"], "hash": h}
            (va if random.random() < val_frac else tr).write(json.dumps(record) + "\\n")
            kept += 1
    print(f"kept={kept} dropped={dropped} ratio={dropped / (kept + dropped):.1%}")`,
    usedIn: ["rag"],
    note: "Print the drop ratio and look at what was dropped. A filter that removes 60% of a corpus is either saving you or silently deleting the domain you cared about — and the only way to know is to read a sample of both piles.",
  },
  {
    id: "tokenizer",
    title: "Training a tokenizer",
    why: "The tokenizer fixes your vocabulary, your sequence lengths and part of your cost. It is a decision, not a default.",
    code: `from tokenizers import Tokenizer, decoders, models, pre_tokenizers, trainers

tok = Tokenizer(models.BPE())
tok.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
tok.decoder = decoders.ByteLevel()

trainer = trainers.BpeTrainer(
    vocab_size=32_000,                       # bigger vocab = shorter sequences,
    min_frequency=2,                         # but more embedding parameters
    special_tokens=["<|endoftext|>", "<|pad|>"],
)
tok.train(files=["data/corpus.txt"], trainer=trainer)
tok.save("tokenizer.json")

# sanity check on YOUR text before you commit to it
ids = tok.encode("SELECT * FROM chunks WHERE tenant_id = $1").ids
print(len(ids))     # a general tokenizer spends far more tokens on code than on prose`,
    usedIn: ["rag"],
    note: "Byte-level BPE never produces an unknown token, which is why it is the default. Train your own when the domain is code, logs, chemistry or a language the off-the-shelf vocabulary handles badly — measure tokens-per-document before and after to see whether it paid.",
  },
  {
    id: "block",
    title: "A transformer block, from scratch",
    why: "This is the whole model. Everything else is stacking this, embedding the input, and projecting back to the vocabulary.",
    code: `import torch, torch.nn as nn, torch.nn.functional as F

class Block(nn.Module):
    def __init__(self, d_model: int, n_heads: int):
        super().__init__()
        self.n_heads = n_heads
        self.norm1 = nn.RMSNorm(d_model)          # pre-norm: stabler than post-norm
        self.qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.proj = nn.Linear(d_model, d_model, bias=False)
        self.norm2 = nn.RMSNorm(d_model)
        self.mlp = nn.Sequential(
            nn.Linear(d_model, 4 * d_model, bias=False),
            nn.GELU(),
            nn.Linear(4 * d_model, d_model, bias=False),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:     # (batch, seq, d_model)
        b, t, d = x.shape
        q, k, v = self.qkv(self.norm1(x)).split(d, dim=2)
        q, k, v = (z.view(b, t, self.n_heads, d // self.n_heads).transpose(1, 2)
                   for z in (q, k, v))
        att = F.scaled_dot_product_attention(q, k, v, is_causal=True)   # fused kernel
        x = x + self.proj(att.transpose(1, 2).reshape(b, t, d))         # residual 1
        return x + self.mlp(self.norm2(x))                              # residual 2`,
    usedIn: ["rag"],
    note: "The two residual additions are the reason gradients reach layer one. is_causal=True is the mask that stops position t seeing t+1 — get that wrong and the model reads the answer, the loss collapses, and generation is nonsense.",
  },
  {
    id: "model",
    title: "Wrapping blocks into a language model",
    why: "Embedding in, blocks in the middle, a projection back to vocabulary out — and weight tying to save a few million parameters.",
    code: `class GPT(nn.Module):
    def __init__(self, vocab: int, d_model: int, n_layers: int, n_heads: int, ctx: int):
        super().__init__()
        self.tok_emb = nn.Embedding(vocab, d_model)
        self.pos_emb = nn.Embedding(ctx, d_model)          # or RoPE inside attention
        self.blocks = nn.ModuleList(Block(d_model, n_heads) for _ in range(n_layers))
        self.norm = nn.RMSNorm(d_model)
        self.head = nn.Linear(d_model, vocab, bias=False)
        self.head.weight = self.tok_emb.weight             # weight tying

    def forward(self, idx: torch.Tensor) -> torch.Tensor:
        pos = torch.arange(idx.size(1), device=idx.device)
        x = self.tok_emb(idx) + self.pos_emb(pos)
        for block in self.blocks:
            x = block(x)
        return self.head(self.norm(x))                     # logits (b, t, vocab)

# d_model=768, n_layers=12, n_heads=12, vocab=50k  ->  ~124M parameters
# non-embedding params ~= 12 * n_layers * d_model**2`,
    usedIn: ["rag"],
    note: "That parameter formula is worth memorising: 12·L·d². It tells you in one line whether a config fits your GPU, and it is why doubling width costs four times as much as doubling depth.",
  },
  {
    id: "loop",
    title: "The training loop",
    why: "Forward, loss, backward, clip, step. Everything else in a training script is logging, checkpointing and making this fit in memory.",
    code: `model = GPT(**cfg).to("cuda")
opt = torch.optim.AdamW(model.parameters(), lr=3e-4, betas=(0.9, 0.95),
                        weight_decay=0.1)

for step, (x, y) in enumerate(loader):
    with torch.autocast("cuda", dtype=torch.bfloat16):     # mixed precision
        logits = model(x)
        loss = F.cross_entropy(logits.view(-1, logits.size(-1)), y.view(-1))

    (loss / ACCUM).backward()                              # gradient accumulation
    if (step + 1) % ACCUM == 0:
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)   # stops loss spikes
        for group in opt.param_groups:
            group["lr"] = lr_at(step)                      # warmup then cosine decay
        opt.step()
        opt.zero_grad(set_to_none=True)

    if step % EVAL_EVERY == 0:
        log(step=step, train=loss.item(), val=evaluate(model, val_loader),
            lr=lr_at(step), grad_norm=grad_norm(model), tokens=step * TOKENS_PER_STEP)`,
    usedIn: ["rag"],
    note: "Gradient accumulation is how you get a 0.5M-token batch out of a GPU that holds 32k tokens: accumulate, then step. Clipping at 1.0 is not optional — without it one bad batch can put the run into a loss spike it never recovers from.",
  },
];

export const hyperTable: Table = {
  head: ["Knob", "Sane starting point", "What it does", "Symptom when wrong"],
  rows: [
    ["Learning rate", "3e-4 for ~100M params; lower as the model grows", "The single most important number in the run", "Too high: spikes and divergence. Too low: a slow, flat curve"],
    ["Warmup", "1–2% of total steps, linear from ~0", "Lets the optimiser state settle before full-speed updates", "Loss explodes in the first few hundred steps"],
    ["Schedule", "Cosine decay to ~10% of peak", "Large steps early, fine steps late", "Loss plateaus early and never improves again"],
    ["Batch size", "~0.5M tokens for a small model, via accumulation", "Gradient noise versus hardware efficiency", "Tiny batches: a noisy, jagged loss curve"],
    ["Weight decay", "0.1, on weights but not on norms or biases", "Regularisation", "Overfitting, or a model that will not fit at all"],
    ["Grad clip", "1.0 on global norm", "Caps the damage a bad batch can do", "Sudden irreversible loss spikes"],
    ["Betas", "(0.9, 0.95) for AdamW on language models", "Optimiser momentum", "Instability late in training with the default 0.999"],
    ["Precision", "bf16 autocast with fp32 master weights", "Halves memory, keeps dynamic range", "fp16 without a loss scaler: silent NaNs"],
    ["Dropout", "0 when pretraining on plenty of data; 0.1 when fine-tuning on little", "Regularisation", "Underfitting when data is abundant"],
  ],
};

export const memoryTable: Table = {
  head: ["What holds memory", "Bytes per parameter", "For a 1B model", "How to shrink it"],
  rows: [
    ["Weights (bf16)", "2", "2 GB", "Quantise for inference; sharding for training"],
    ["Gradients (bf16)", "2", "2 GB", "Gradient accumulation does not help here; sharding does"],
    ["fp32 master weights", "4", "4 GB", "ZeRO-3 / FSDP shards these across ranks"],
    ["Adam moments (m, v)", "8", "8 GB", "8-bit optimisers cut this to ~2 bytes per parameter"],
    ["Total optimiser state", "≈ 16", "≈ 16 GB", "Before a single activation is stored"],
    ["Activations", "depends on batch × sequence × depth", "often the largest term", "Activation checkpointing trades ~30% compute for a big saving"],
  ],
};

export const diagnostics: Table = {
  head: ["What you see", "What it usually is", "What to do"],
  rows: [
    ["Loss spikes then recovers", "One bad batch, or the LR is at the edge", "Check gradient clipping is on; lower peak LR by a third"],
    ["Loss diverges to NaN", "LR too high, fp16 without scaling, or a bad sample", "Restart from the last checkpoint with a lower LR; switch to bf16"],
    ["Loss flat from step one", "LR far too low, a broken mask, or labels misaligned by one", "Overfit ten samples first — if it cannot memorise ten, the code is wrong"],
    ["Train falls, validation rises", "Overfitting — the classic scissors", "Stop at the validation minimum; more data, or fewer steps, or more regularisation"],
    ["Both plateau early", "Capacity or data limit reached", "More data before more parameters; check the mixture is not dominated by one source"],
    ["Validation lower than train", "A leak, or dropout accounting", "Look for eval data in the training set — the usual answer is contamination"],
    ["Throughput far below the GPU's peak", "Small batches, dataloader stalls, unfused kernels", "Measure model FLOPs utilisation; 35–50% is healthy for a naive loop"],
  ],
};

/** Synthetic but realistic: the scissors, with the validation minimum at step 7,000. */
export const lossCurve = {
  steps: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000],
  train: [4.35, 3.1, 2.7, 2.48, 2.33, 2.22, 2.13, 2.05, 1.99, 1.94, 1.89, 1.85, 1.82],
  val: [4.4, 3.2, 2.82, 2.62, 2.5, 2.43, 2.39, 2.37, 2.39, 2.44, 2.51, 2.6, 2.71],
  stopAt: 7000,
};

export const tuningMethods: Table = {
  head: ["Method", "What it trains", "Data it needs", "Typical hardware", "What it changes"],
  rows: [
    ["SFT (full)", "All weights, on input→output pairs", "10k–1M demonstrations", "Multi-GPU node", "Behaviour broadly; risks forgetting"],
    ["LoRA", "Low-rank adapters, ~0.1% of weights", "500–50k demonstrations", "One 24–80 GB GPU", "Style, format, domain vocabulary"],
    ["QLoRA", "LoRA over a 4-bit frozen base", "Same as LoRA", "One 24 GB GPU, 7–13B base", "Same as LoRA, at a quarter of the memory"],
    ["DPO", "Weights, from preference pairs directly", "5k–100k (prompt, chosen, rejected)", "Same as SFT or LoRA", "Which of two acceptable answers it prefers"],
    ["RLHF (PPO)", "Weights, via a learned reward model", "Preferences plus a reward model", "Multi-GPU, complex", "The same target as DPO, with more moving parts"],
    ["Distillation", "A small student, from a large teacher's outputs", "Unlabelled inputs plus teacher outputs", "One node", "Cost and latency, at some quality"],
  ],
};

export const tuningSnippets: Snippet[] = [
  {
    id: "qlora",
    title: "QLoRA: a 7B fine-tune on one consumer GPU",
    why: "A 4-bit frozen base plus small trainable adapters is what makes fine-tuning a thing an individual can do.",
    code: `from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

quant = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,     # compute in bf16, store in 4-bit
)
base = AutoModelForCausalLM.from_pretrained(MODEL_ID, quantization_config=quant,
                                            device_map="auto")
base = prepare_model_for_kbit_training(base)

model = get_peft_model(base, LoraConfig(
    r=16, lora_alpha=32, lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    task_type="CAUSAL_LM",
))
model.print_trainable_parameters()             # ~0.1% trainable; the rest is frozen`,
    usedIn: ["agents"],
    note: "Rank 8–32 covers most tasks and alpha is conventionally twice the rank. Target the attention projections first; add the MLP projections only if the eval says the adapter lacks capacity — more targets means more to overfit.",
  },
  {
    id: "preferences",
    title: "Preference data: the format is the hard part",
    why: "DPO and RLHF are both trained on the same thing — pairs where a human said this one, not that one.",
    code: `# one line per comparison; the trainer is the easy half
{"prompt": "Customer asks for a refund 40 days after delivery.",
 "chosen":  "Our policy allows returns within 30 days [ret-12]. I can offer store "
            "credit instead — would that work?",
 "rejected": "Sure, I've processed your refund."}

# what makes this set good:
#  - pairs differ on ONE axis (here: policy adherence), not on five at once
#  - both sides are plausible; a strawman rejected answer teaches nothing
#  - written or corrected by someone who knows the policy
#  - 5k-ish pairs beats 50k of thumbs-down clicks with no rationale`,
    usedIn: ["agents"],
    note: "DPO skips the separate reward model and optimises the pairs directly, which is why it has largely replaced PPO for this job. The beta parameter controls how far the tuned model may drift from the reference — start around 0.1 and watch for the model collapsing into one safe phrasing.",
  },
];

export const evalRules: string[] = [
  "Perplexity is not quality. It tells you the model predicts held-out text well; it says nothing about whether the answers are useful, safe or correctly formatted.",
  "Evaluate on your task, with the golden set you already built for the system this model serves. A benchmark number that nobody in your company can act on is decoration.",
  "Check for what you broke. Fine-tuning improves the target task and quietly degrades others — run the full suite, including refusals and safety cases, not just the metric you were optimising.",
  "Beware contamination. If the benchmark leaked into training, every comparison afterwards is meaningless. Decontaminate, and record the check.",
  "Compare against the honest baseline: the prompt you already have, on the same eval, including its latency and cost. Many fine-tunes lose to a better prompt.",
  "Have humans read fifty outputs. Every automated metric is a proxy, and fifty samples is enough to notice when a proxy has stopped tracking the thing you care about.",
];

export const shipRules: string[] = [
  "Export to safetensors, and version the weights, the tokenizer, the config and the data snapshot hash together — a model is not reproducible without all four.",
  "Write the model card as you go: data sources, licences, intended use, known limitations, eval results, the decontamination check. It takes an hour during and a week afterwards.",
  "Pin the seed, the library versions and the hardware. Exact reproducibility across GPUs is not always achievable — document what you did rather than pretending it is deterministic.",
  "Quantise for serving and measure the difference on your eval set, not on perplexity. int8 or 4-bit usually costs less quality than the latency it buys.",
  "Serve behind the same canary and rollback machinery as any other deploy. A model swap is a deploy with a much larger blast radius than a code change.",
  "Keep the previous checkpoint hot. The fastest fix for a bad model release is the last good one, and it should be one command.",
];

export const practiceLadder: string[] = [
  "Overfit ten sentences with a two-layer model until it reproduces them exactly. If it cannot, the bug is in your masking, your labels or your loss — find it here, where it is cheap.",
  "Train a character-level model on one book, on a laptop. Watch it go from noise to word-shaped to sentence-shaped; this is the fastest intuition you will ever buy.",
  "Train a ~124M GPT on a few billion tokens of a clean corpus. Roughly 6·N·D FLOPs — about 16 A100-hours for 10B tokens — and the first time the loss curve is yours.",
  "Train your own tokenizer on a domain corpus and measure tokens-per-document against an off-the-shelf one. Decide with the number.",
  "QLoRA a 7B model on 1,000 curated examples of a real task, and evaluate it against the prompt it replaces on the same golden set.",
  "Build a preference set of 500 pairs by hand and run DPO. The labelling is the education; the training run takes an afternoon.",
];

export const problems: string[] = [
  "Build a domain tokenizer and quantify it. Ships when tokens-per-document falls at least 15% against the general tokenizer on your corpus with no loss on the downstream eval.",
  "Train a 124M model from scratch on a cleaned 10B-token corpus. Ships when the validation loss curve is monotone to its minimum, the run is resumable from any checkpoint, and the data snapshot hash is recorded.",
  "Build the data pipeline for the run above: dedup, quality filter, decontamination, mixture control. Ships when the drop ratio is explained line by line and eval overlap measures zero.",
  "QLoRA-tune a 7B model to produce your structured output format. Ships when schema-valid output exceeds 99% and the adapter beats the prompt baseline on the same golden set at lower latency.",
  "Distil a routing classifier from a frontier model into a small local one. Ships when accuracy is within two points of the teacher at under 20 ms per call.",
  "Take a fine-tuned model to production. Ships when the model card is complete, the quantised serving version is measured on the eval set, canary and rollback are rehearsed, and the previous checkpoint is one command away.",
];

export const trainingSections = [
  { id: "ladder", label: "Should you train?" },
  { id: "pipeline", label: "The pipeline" },
  { id: "data", label: "Data" },
  { id: "tokenizer", label: "Tokenizer" },
  { id: "model", label: "The model" },
  { id: "loop", label: "Training loop" },
  { id: "watch", label: "Watching it train" },
  { id: "tuning", label: "Fine-tuning" },
  { id: "evaluate", label: "Evaluating" },
  { id: "ship", label: "Shipping" },
  { id: "practice", label: "Practice" },
];
