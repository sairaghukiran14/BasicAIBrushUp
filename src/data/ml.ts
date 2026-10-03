import type { Snippet, Table } from "@/data/python";

export type { Snippet, Table };

/* ------------------------------------------------------------------ */
/* 1. Why classical ML still matters here                              */
/* ------------------------------------------------------------------ */

export const whereClassicalTable: Table = {
  head: ["Job in the system", "Classical ML", "LLM call", "Why the winner wins"],
  rows: [
    ["Routing a ticket to a queue", "TF-IDF + logistic regression", "A classification prompt", "3 ms and $0 versus 300 ms and a fraction of a cent, on a task with fixed labels"],
    ["Detecting a duplicate document", "MinHash / cosine over embeddings", "Ask the model", "Deterministic, explainable, and it scales to millions of pairs"],
    ["Predicting whether a run will blow its budget", "Gradient boosting over trace features", "Not applicable", "Tabular features with a numeric target — the textbook case for trees"],
    ["Scoring passage relevance", "Cross-encoder (a fine-tuned transformer)", "Ask the model to rank", "Trained once for the task; far cheaper per candidate at rerank volumes"],
    ["Deciding tone or nuance in free text", "Weak", "Strong", "No feature engineering survives contact with open-ended language"],
    ["Anything with fewer than ~200 labelled examples", "Weak", "Strong", "Few-shot prompting needs three examples; a classifier needs hundreds"],
  ],
};

export const mlWorkflow: string[] = [
  "Frame the target first. “Which of these six queues” is a classification problem; “how urgent is this” is a regression problem; “is this weird” is anomaly detection. Getting this wrong wastes the rest.",
  "Split before you look. Hold out a test set at the start, and split by time or by entity when rows are not independent — a random split over the same customer's tickets leaks.",
  "Start with the dumbest baseline: majority class, or a keyword rule. If your model cannot beat it, the problem is the data, not the algorithm.",
  "Features, then models. A linear model on good features beats a boosted forest on bad ones, and it tells you which features mattered.",
  "Evaluate on the metric the business feels, not the one that is convenient. Accuracy on an imbalanced problem is a way of not measuring.",
  "Ship the pipeline, not the model. The vectoriser, the imputation and the encoder are part of the artefact — anything you fit on training data must travel with it.",
];

/* ------------------------------------------------------------------ */
/* 2. Python for data                                                  */
/* ------------------------------------------------------------------ */

export const dataSnippets: Snippet[] = [
  {
    id: "lambda",
    title: "lambda, and where it actually belongs",
    why: "A one-expression anonymous function. It earns its place as an argument to something else — and nowhere else.",
    code: `hits.sort(key=lambda h: (-h["score"], h["doc_id"]))       # sort key: the classic use

by_tenant = groupby(sorted(rows, key=lambda r: r["tenant"]),
                    key=lambda r: r["tenant"])

TRANSFORMS = {                                            # dispatch table of tiny fns
    "lower": lambda s: s.lower(),
    "strip_ws": lambda s: " ".join(s.split()),
    "trunc": lambda s: s[:2000],
}
text = TRANSFORMS["strip_ws"](TRANSFORMS["lower"](raw))

# NOT this — if it needs a name, it needs a def:
# score = lambda h: h["dense"] * 0.7 + h["bm25"] * 0.3     # def score(h) instead`,
    usedIn: ["rag", "agents"],
    note: "Assigning a lambda to a name gives you a function with no name in the traceback and no docstring. Use def. Inside sorted, groupby, pandas .apply and a dispatch table, lambda is exactly right.",
  },
  {
    id: "numpy-essentials",
    title: "numpy: arrays, axes and broadcasting",
    why: "One idea — operate on whole arrays instead of looping — is most of the performance difference in a retrieval system.",
    code: `import numpy as np

M = np.load("vectors.npy")                # (1_000_000, 1024) float32
q = M[0]

norms = np.linalg.norm(M, axis=1, keepdims=True)   # axis=1: across each row
M = M / norms                                      # broadcasting: (N,1) over (N,1024)

scores = M @ q                            # one matmul, not a million dot products
top = np.argpartition(-scores, 100)[:100] # O(n) partial select, not a full sort

mask = (dates >= start) & (dates <= end)  # boolean masks compose; use & not 'and'
filtered = M[mask]`,
    usedIn: ["rag"],
    note: "axis is the axis you collapse, which is the one place everyone slips. Broadcasting pairs dimensions from the right, so a (N,1) column stretches across (N,1024) — that is why keepdims=True is there.",
  },
  {
    id: "pandas",
    title: "pandas: the eval set and the traces",
    why: "Two jobs in these systems — preparing labelled data, and answering questions about production traces.",
    code: `import pandas as pd

traces = pd.read_json("traces.jsonl", lines=True)     # JSONL in, DataFrame out

traces["cost"] = (traces.input_tokens * 2 + traces.output_tokens * 10) / 1e6
traces["ok"] = traces.stop_reason.eq("end_turn") & traces.cited.gt(0)

by_route = (traces
    .groupby("route")                                  # split
    .agg(n=("trace_id", "count"),                      # apply
         p95_ms=("latency_ms", lambda s: s.quantile(0.95)),
         cost=("cost", "sum"),
         ok_rate=("ok", "mean"))
    .sort_values("cost", ascending=False))             # combine

worst = traces.loc[traces.latency_ms > traces.latency_ms.quantile(0.99),
                   ["trace_id", "route", "steps", "latency_ms"]]

labels = pd.read_csv("labels.csv")
golden = traces.merge(labels, on="trace_id", how="inner", validate="one_to_one")
golden.to_json("golden.jsonl", orient="records", lines=True)`,
    usedIn: ["rag", "agents"],
    note: "validate=\"one_to_one\" is the line that saves an afternoon: a silent many-to-many merge inflates your eval set with duplicates and every metric computed afterwards is wrong.",
  },
];

/* ------------------------------------------------------------------ */
/* 3. scikit-learn                                                     */
/* ------------------------------------------------------------------ */

export const sklearnSnippets: Snippet[] = [
  {
    id: "sklearn-pipeline",
    title: "A router that costs nothing to run",
    why: "The same job as an LLM classification call, at a few milliseconds and no per-request cost — when the labels are fixed and you have data.",
    code: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

X_train, X_test, y_train, y_test = train_test_split(
    df.text, df.queue, test_size=0.2, stratify=df.queue, random_state=0)

router = Pipeline([                                   # fit together, ship together
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=3, sublinear_tf=True)),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
])

router.fit(X_train, y_train)
print(classification_report(y_test, router.predict(X_test), digits=3))
joblib.dump(router, "router-v3.joblib")               # the pipeline is the artefact`,
    usedIn: ["rag", "agents"],
    note: "The Pipeline is the point: the vectoriser is fitted on training data only, and it travels with the model. Fitting a vectoriser on everything before splitting is the most common leak in applied ML.",
  },
  {
    id: "sklearn-eval",
    title: "Cross-validation, thresholds and the unsure class",
    why: "One test split is one sample. And a classifier's default 0.5 threshold is a decision you should be making deliberately.",
    code: `from sklearn.model_selection import cross_val_score, StratifiedKFold
import numpy as np

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_val_score(router, df.text, df.queue, cv=cv, scoring="f1_macro")
print(f"f1_macro {scores.mean():.3f} ± {scores.std():.3f}")   # the ± is the point

proba = router.predict_proba(X_test)
confidence = proba.max(axis=1)
pred = np.where(confidence >= 0.60, router.classes_[proba.argmax(1)], "needs_human")

coverage = (pred != "needs_human").mean()
accuracy_when_confident = (pred[pred != "needs_human"]
                           == y_test[pred != "needs_human"]).mean()`,
    usedIn: ["rag", "agents"],
    note: "That threshold sweep is the same shape as the abstention gate in the RAG playbook: trade coverage for accuracy on purpose, and report both numbers rather than one.",
  },
];

export const metricsTable: Table = {
  head: ["Metric", "What it answers", "Reach for it when", "How it lies"],
  rows: [
    ["Accuracy", "What share did I get right?", "Balanced classes, symmetric costs", "99% accuracy on a 1%-positive problem is the model saying “no” every time"],
    ["Precision", "Of the ones I flagged, how many were real?", "False positives are expensive — spam, auto-refunds", "Trivially maximised by flagging almost nothing"],
    ["Recall", "Of the real ones, how many did I catch?", "Misses are expensive — fraud, safety, high-risk clauses", "Trivially maximised by flagging everything"],
    ["F1", "The balance of the two", "You need one number and the classes are imbalanced", "Hides which side you are failing on — always look at both"],
    ["PR-AUC", "Precision/recall across every threshold", "Rare positives — the honest headline for imbalance", "Not comparable across datasets with different base rates"],
    ["ROC-AUC", "Ranking quality across thresholds", "Roughly balanced classes, or you care about ranking", "Looks reassuring on rare-positive problems where PR-AUC is grim"],
    ["Confusion matrix", "Which classes get mistaken for which", "Always — before choosing any single number", "It does not lie; that is why you start here"],
    ["Calibration", "Does 0.8 confidence mean 80% right?", "You threshold on confidence, which you do", "A model can rank perfectly and still be wildly overconfident"],
  ],
};

export const leakageList: string[] = [
  "Fitting any transformer — vectoriser, scaler, imputer, encoder — before the split. Everything after it is optimistic. Use a Pipeline and this cannot happen.",
  "Random splits on grouped data. The same customer, ticket thread or document in both sides means you are testing memorisation.",
  "Random splits on time series. If the model will predict the future, test it on the future: split by date.",
  "Target-derived features. A field that is only populated after the outcome is known — resolution_time, closed_by — is the label wearing a hat.",
  "Tuning on the test set. Every hyperparameter chosen by looking at the test score makes it a validation set; hold out a third split for the number you report.",
  "Duplicates across the split. Deduplicate before splitting, or the same row scores itself.",
];

/* ------------------------------------------------------------------ */
/* 4. Deep learning frameworks                                         */
/* ------------------------------------------------------------------ */

export const frameworksTable: Table = {
  head: ["", "PyTorch", "TensorFlow / Keras"],
  rows: [
    ["Style", "Imperative — the model is Python that runs line by line", "Keras is declarative layers; TF underneath is a graph"],
    ["Where the LLM ecosystem lives", "Effectively all of it: transformers, PEFT, vLLM, most papers", "Little of it — you will be porting"],
    ["Best at", "Research, custom architectures, anything transformer-shaped", "Fast tabular and vision baselines; a mature serving and mobile story"],
    ["Serving", "TorchServe, vLLM, ONNX export", "TF Serving, TFLite for mobile and edge, TensorFlow.js"],
    ["Pipelines", "Composed from libraries you choose", "TFX is an opinionated end-to-end pipeline"],
    ["Choose it when", "You are anywhere near language models, or you want debuggable Python", "You already run TF, or you need TFLite on a device"],
  ],
};

export const frameworkSnippets: Snippet[] = [
  {
    id: "keras",
    title: "Keras: a baseline in eight lines",
    why: "For a tabular or small-text baseline, Keras gets you a trained model faster than almost anything else.",
    code: `import keras
from keras import layers

model = keras.Sequential([
    layers.Input(shape=(n_features,)),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.2),
    layers.Dense(n_classes, activation="softmax"),
])

model.compile(optimizer=keras.optimizers.Adam(1e-3),
              loss="sparse_categorical_crossentropy",
              metrics=["accuracy"])

model.fit(X_train, y_train, validation_split=0.1, epochs=20, batch_size=256,
          callbacks=[keras.callbacks.EarlyStopping(patience=3,
                                                   restore_best_weights=True)])`,
    usedIn: ["rag"],
    note: "EarlyStopping with restore_best_weights is the honest default: it stops at the validation minimum instead of the last epoch, which is the same instinct as picking the checkpoint at the turn of the loss curve.",
  },
  {
    id: "torch",
    title: "PyTorch: the same model, explicit",
    why: "Every line of the loop is yours — which is why it is what research and the entire LLM stack are written in.",
    code: `import torch
from torch import nn

model = nn.Sequential(
    nn.Linear(n_features, 128), nn.ReLU(), nn.Dropout(0.2),
    nn.Linear(128, n_classes),
).to(device)

opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)
loss_fn = nn.CrossEntropyLoss()

for epoch in range(20):
    model.train()
    for xb, yb in train_loader:
        opt.zero_grad(set_to_none=True)
        loss = loss_fn(model(xb.to(device)), yb.to(device))
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()`,
    usedIn: ["rag"],
    note: "Compare it with the training loop in the training volume — it is the same five statements at every scale, from this to a transformer. zero_grad, forward, backward, clip, step.",
  },
];

/* ------------------------------------------------------------------ */
/* 5. MLOps                                                            */
/* ------------------------------------------------------------------ */

export const mlopsTable: Table = {
  head: ["Component", "What it is", "What breaks without it"],
  rows: [
    ["Experiment tracking", "Every run's parameters, metrics, code version and artefacts, recorded automatically", "Nobody can say which configuration produced the model in production"],
    ["Model registry", "Named, versioned models with a stage — staging, production, archived", "The deployed model is a file on someone's laptop called final_v2_REAL.pkl"],
    ["Feature store", "Shared feature definitions computed identically for training and serving", "Training/serving skew: the model saw one definition and production computes another"],
    ["Data versioning", "Snapshot ids for the dataset a model was trained on", "A regression cannot be attributed to code or to data, so it is debugged twice"],
    ["Training pipeline", "The whole thing as a scheduled, parameterised job", "Retraining is a person remembering a notebook's cell order"],
    ["Batch vs online serving", "Precomputed predictions in a table, or a request-time endpoint", "Latency budgets are blown by a model that should have been precomputed nightly"],
    ["Monitoring", "Input distributions, prediction distributions and — when labels arrive — live performance", "The model decays quietly for months"],
    ["Retraining trigger", "A written rule: on drift, on schedule, or on measured performance loss", "Retraining happens when someone complains"],
  ],
};

export const mlopsVsLlmops: Table = {
  head: ["Question", "Classical MLOps", "LLM systems (LLMOps)"],
  rows: [
    ["What is the artefact?", "A trained weights file plus its feature transformers", "A prompt, a model id, an index snapshot, tool schemas and a policy"],
    ["How do you version it?", "Model registry with data and code snapshots", "The same discipline, but the “model” is usually someone else's and pinned by id"],
    ["Where does quality come from?", "The training data", "Retrieval, context and instructions — the weights are a constant you rent"],
    ["How do you evaluate?", "Held-out test set, one number per metric", "Golden set plus sampled human audit plus a calibrated judge"],
    ["What drifts?", "Input distributions and the target relationship", "Corpus, query mix, user behaviour — and the provider's model beneath you"],
    ["What does a fix look like?", "Retrain on fresh data", "Usually a retrieval or prompt change; retraining is the last resort"],
    ["What dominates cost?", "Training compute, amortised", "Inference tokens, per request, forever"],
  ],
};

export const mlopsSnippets: Snippet[] = [
  {
    id: "mlflow",
    title: "Tracking a run so it can be reproduced",
    why: "Every experiment records what it did, what it scored and what it produced — the difference between a model and a rumour.",
    code: `import mlflow

mlflow.set_experiment("ticket-router")

with mlflow.start_run(run_name="tfidf-logreg-v3"):
    mlflow.log_params({"ngram_max": 2, "min_df": 3, "C": 1.0,
                       "data_snapshot": "2026-09-01"})     # data version is a param

    router.fit(X_train, y_train)
    report = classification_report(y_test, router.predict(X_test), output_dict=True)

    mlflow.log_metrics({"f1_macro": report["macro avg"]["f1-score"],
                        "recall_billing": report["billing"]["recall"]})
    mlflow.sklearn.log_model(router, name="router")        # older versions: artifact_path=
    mlflow.log_artifact("confusion_matrix.png")

# promotion is deliberate and separate from training
mlflow.register_model("runs:/<run_id>/router", name="ticket-router")`,
    usedIn: ["rag", "agents"],
    note: "Log the dataset snapshot id as a parameter. Without it you can reproduce the code and still not reproduce the model, which is the failure mode that wastes the most time.",
  },
  {
    id: "drift",
    title: "Watching for drift before performance tells you",
    why: "Labels arrive late or never, so the early signal is the inputs and the predictions changing shape.",
    code: `from scipy.stats import ks_2samp
import numpy as np

def population_stability_index(expected, actual, bins=10) -> float:
    cuts = np.quantile(expected, np.linspace(0, 1, bins + 1))
    cuts[0], cuts[-1] = -np.inf, np.inf
    e = np.histogram(expected, cuts)[0] / len(expected) + 1e-6
    a = np.histogram(actual, cuts)[0] / len(actual) + 1e-6
    return float(np.sum((a - e) * np.log(a / e)))          # >0.2 = investigate

psi = population_stability_index(train_scores, live_scores)
_, p = ks_2samp(train_scores, live_scores)                 # distribution shift test

if psi > 0.2 or p < 0.01 or live_unsure_rate > baseline * 1.5:
    alert("router drift", psi=psi, p=p)                    # look, do not auto-retrain`,
    usedIn: ["rag", "agents"],
    note: "Alert, do not auto-retrain. Drift means the world changed; retraining on the drifted data may be right, or the data may be broken upstream — a human should decide which.",
  },
];

export const driftTable: Table = {
  head: ["Kind", "What changed", "How you notice", "What to do"],
  rows: [
    ["Data drift", "The inputs look different — new vocabulary, new customer mix", "PSI or a KS test on feature distributions", "Investigate the source; retrain if the change is genuine"],
    ["Concept drift", "The relationship changed — the same input now has a different right answer", "Live performance falls while inputs look normal", "Retrain on recent data; consider a shorter training window"],
    ["Label drift", "The class balance moved — fraud season, an outage spike", "Prediction distribution shifts", "Re-check thresholds before touching the model"],
    ["Upstream break", "A field stopped being populated, or a unit changed", "Nulls, impossible values, a sudden PSI cliff", "Fix the pipeline. Retraining on broken data bakes the break in"],
  ],
};

export const mlPractice: string[] = [
  "Replace an LLM router with a scikit-learn pipeline on 2,000 labelled tickets. Ship it when macro-F1 beats the LLM router on the same test set and the p95 decision is under 10 ms — and keep the LLM as the fallback for the unsure class.",
  "Take one month of production traces into pandas and answer three questions: which route costs the most, which one has the worst p95, and what the 1% slowest runs have in common. Deliverable is a notebook and three numbers.",
  "Build a budget-overrun predictor over agent-run features — steps, tools used, corpus, tenant — with gradient boosting. Ship it when it catches 70% of overruns at 20% false-positive rate, and wire it to the step-cap decision.",
  "Instrument an existing model with MLflow, register it, and reproduce a three-month-old result from the run record alone. If you cannot, the tracking is not finished.",
  "Add PSI and a KS test to a live classifier's inputs, backfill both over six months of history, and set the alert threshold from what the history actually did rather than from a blog post.",
  "Take a Keras baseline and the equivalent PyTorch model to the same accuracy on the same split, and write down which parts of each you would not want to maintain.",
];

export const mlSections = [
  { id: "where", label: "Where ML fits" },
  { id: "data", label: "Python for data" },
  { id: "sklearn", label: "scikit-learn" },
  { id: "metrics", label: "Metrics" },
  { id: "frameworks", label: "PyTorch vs TF" },
  { id: "mlops", label: "MLOps" },
  { id: "drift", label: "Drift" },
  { id: "practice", label: "Practice" },
];
