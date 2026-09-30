# Release 4.0 - Design Work

Design notes and plan for Release 4.0 of the Email Archive ML Assistant: semantic classification with embeddings, a local helper application, an LLM for doubtful messages, and learning from the user's decisions.

Written 2026-09-30 after the rel. 3 measurement session with Andrea. Continues `rel-3-design-work.md`.

Status: **DRAFT — reviewed** by an independent advisor (2026-09-30; architecture and staged order confirmed, stage 1 narrowed, LiteLLM dropped, calibration refit, extra risks added). Waiting for Andrea's decisions in §10.

---

## Table of Contents

1. [Why rel. 4](#1-why-rel-4)
2. [Goals and non-goals](#2-goals-and-non-goals)
3. [Architecture](#3-architecture)
4. [Classification pipeline](#4-classification-pipeline)
5. [The example store](#5-the-example-store)
6. [Learning from the user](#6-learning-from-the-user)
7. [LLM stage and providers](#7-llm-stage-and-providers)
8. [Extension ↔ helper interface](#8-extension--helper-interface)
9. [Evaluation](#9-evaluation)
10. [Decisions](#10-decisions)
11. [Staged plan](#11-staged-plan)
12. [Risks](#12-risks)
13. [Environment facts](#13-environment-facts)

---

## 1. Why rel. 4

Rel. 3 made the current model measurable and honest (reports in `_Docs/reports/`, yahoo.it, 21,582 messages, 99 folders):

| Model (TF-IDF NB) | Accuracy | ≥ 80% confidence: coverage / precision |
|---|---:|---|
| Sender + subject, all dates | 83.1% | 67.4% / 95.1% |
| Sender + subject + body, all dates | 77.6% | 62.2% / 93.7% |
| Sender + subject, last 18 months | 79.9% | 65.1% / 93.1% |

The rel. 3 target (≥ 95% precision at ≥ 60% coverage) is reached, but the model is a bag of words: it recognises words and senders it has seen, and adding the body makes it worse. It cannot recognise the *meaning* of a message from a sender or with a wording it has never seen — which is exactly the Inbox mail that still needs manual work. Andrea's assessment: "sorting by sender + subject is something I can do by hand; I want something more intelligent, that also understands never-seen senders, and learns from my corrections".

Fine-tuning a small LLM was considered and **not chosen as the first step**: corrections would only take effect after the next fine-tune (minutes to hours, no usable GPU on this laptop, §13), every folder change needs a retrain, and it would learn the inconsistent old archive as faithfully as the current model. See §10 D1.

## 2. Goals and non-goals

Goals:

- **G1 Semantic classification**: suggest the right folder for messages whose sender or wording was never seen, based on meaning.
- **G2 Immediate learning**: an accepted or corrected suggestion improves the very next similar message, with no retraining.
- **G3 Current criteria win over old habits**: folder descriptions written by Andrea and his recent decisions outweigh the old archive.
- **G4 Human in the loop**: nothing is moved without explicit approval (unchanged from rel. 1-3).
- **G5 Measurable**: every configuration is compared with the rel. 3 evaluation method, including a "never-seen senders" score.
- **G6 Configurable models**: embedding model and LLM provider/model are settings; local by default.

Non-goals (rel. 4):

- Automatic moves on arrival.
- Fine-tuning any model (revisit only if §9 measurements show a ceiling).
- Multi-user or server deployment; the helper is a personal local application.

## 3. Architecture

```
┌──────────────────────────── Thunderbird ────────────────────────────┐
│  Extension (MV2, existing)                                          │
│  - UI: Training / Archive / Review tabs                             │
│  - reads messages (headers, body)          - moves on approval      │
│  - sends text + metadata to the helper     - reports decisions      │
└──────────────┬──────────────────────────────────────────────────────┘
               │ local connection (§8): HTTP on 127.0.0.1 + token
┌──────────────▼──────────────── Helper (Python, local) ──────────────┐
│  - embedding model (local, CPU)            - example store (SQLite) │
│  - k-NN classifier + calibration           - LLM router (§7)        │
│  - evaluation reports                      - settings, API keys     │
└──────────────┬──────────────────────────────────────────────────────┘
               │ only for doubtful messages (§4)
   LLM on the home LAN (MacBook Pro M4, Ollama)  ·  local CPU  ·  external (opt-in)
```

Principles:

- **The helper never touches the mailbox.** It receives text and returns suggestions; reads and moves stay in the extension, so "nothing moves without approval" holds by construction.
- **The extension keeps working without the helper**: if the helper is not running, the rel. 3 TF-IDF model is used (fallback, clearly labelled in the UI).
- **One store per Thunderbird account** (the account id is part of every request).
- Helper language: **Python** (embedding/ML ecosystem), managed with `uv`, packaged as a Windows app later (§11 stage 5).

## 4. Classification pipeline

For each Inbox message:

1. **Rules stage (cheap, deterministic)** — (a) sender rule from rel. 3 R3-6: a sender whose examples go ≥ 95% to one folder gets that folder directly (`source: sender-rule`); exact sender identity is what gives TF-IDF most of its 83% and gets diluted inside an embedding. (b) **Date rules** for year folders (e.g. `Nota spese/2025` vs `2026`): no content model can separate them, so the year is decided by the message date (`source: date-rule`).
2. **Embedding stage (all messages)** — embed `subject + sender name + domain + first ~1,000 characters of cleaned body` (this order, so truncation cuts the body; same `cleanBodyText` as rel. 3; e5 models use the `passage:` prefix for both stored and new messages). Find the k nearest stored examples (k ≈ 15) and score each folder; two scorings are compared in stage 1 because of class imbalance (`_News` 2,278 examples vs folders with 10): similarity-weighted vote sum vs sum of the top-3 similarities per folder. An explicit **same-sender bonus** is added to the vote (measured with/without). The confidence is calibrated like rel. 3 (isotonic on the hold-out) but on a **scale-free score** (top folder's weighted vote share × mean neighbour similarity), so it does not drift as weighted examples are added. Output: folder, calibrated confidence, top-3 alternatives, nearest examples (for explanation). `source: similarity`.
3. **LLM stage (doubtful messages only)** — when the calibrated confidence is below a threshold (default 80%) or the sender is unknown: prompt the LLM with the message, the **candidate folders** (top ~5 from stage 2) with Andrea's **folder descriptions**, and the ~8 nearest examples. The LLM answers with one candidate (or "none / keep in Inbox") and a one-line reason. `source: llm`.
4. **UI**: the Archive tab shows the suggestion, confidence, source badge, and on hover the reason / nearest examples. Andrea accepts, changes or skips.

Why embeddings before the LLM: they are fast on CPU, handle the bulk, give the LLM a short candidate list and relevant examples, and learn instantly from corrections. The LLM is only paid (time or money) for the minority of doubtful messages.

## 5. The example store

Content per example: message key (Message-ID), account, folder, date, sender address/domain, the embedded text's hash, the vector, and **provenance**:

| Provenance | Meaning | Default weight |
|---|---|---:|
| `corrected` | Andrea moved the message to a folder other than the suggestion (§6) | 3.0 |
| `accepted` | Andrea accepted the suggestion (weaker evidence, especially in bulk moves) | 1.5 |
| `archive` | message found in a training folder | 1.0 |
| `archive-old` | archive message older than the date filter | 0.3 (or excluded) |

Curation instead of summarisation (Andrea's question "embed only the most representative messages?"):

- **Keep all messages by default.** At this scale size and speed are not an issue (21,582 × 384–1,024 floats ≈ 30–90 MB; brute-force search over 20k vectors takes milliseconds), and folders are multi-modal (`_AcquistiOnLine` = Amazon + eBay + couriers …), so a few representatives per folder would lose accuracy.
- **Deduplicate near-identical messages** (same sender + similarity > 0.97, e.g. 500 issues of one newsletter): keep a few per cluster so big repetitive folders do not dominate the votes. Dedup happens **before** the hold-out split, otherwise twin newsletter issues straddle train/test and inflate the accuracy.
- **Flag suspected misfiles**: leave-one-out k-NN over the store (the same computation as the evaluation) lists examples whose neighbours are overwhelmingly in another folder, **grouped by (folder → suggested folder)** so duplicate-folder cases appear as one row, not hundreds. Shown in the Review tab for Andrea to confirm or move; flagged examples get weight 0 until reviewed. `accepted`/`corrected` examples are included in the check (protection against self-reinforcement, §12).
- **Keeping the store in sync**: `/index` is idempotent and keyed on Message-ID (upsert); messages moved to another folder are updated, messages no longer found in any indexed folder are pruned ("seen in this run" flag), so Andrea's folder reorganisations are reflected.
- **Date filter** from rel. 3 decides what becomes `archive-old`.

Storage: a single **SQLite** file per account in the helper's data folder (vectors as BLOBs; brute-force cosine in NumPy, or `sqlite-vec` if useful). No vector-database server (§10 D4).

Changing the embedding model requires re-embedding the store (minutes to an hour on CPU, §13); the store records the model name and refuses mixed vectors.

## 6. Learning from the user

"Fine-tuning" in rel. 4 means **adding and re-weighting examples**, not changing model weights:

- **Accepted suggestion** (moved to the suggested folder) → the message is added as `accepted` example of that folder (weight 1.5: in a bulk "select ≥ threshold" move an accept is weak evidence).
- **Corrected suggestion** (moved to another folder) → added as `corrected` example of the chosen folder (weight 3.0); the correction is also logged (message, suggested, chosen, source) for the evaluation (§9) and for the misfile review.
- Feedback is keyed on Message-ID and **upserts**: a later re-move overwrites the earlier decision, no duplicates.
- The calibration is **refitted on every `/evaluate`** (k-NN over ~4k test vectors takes seconds) and automatically after every N feedbacks (e.g. 200), so confidence stays honest as the store grows.
- **Skipped / left in Inbox** → nothing learned (optional later: "keep in Inbox" as a pseudo-folder).
- **Recency**: similarity votes are multiplied by a time decay (e.g. half-life 2 years) so current criteria win.
- Takes effect for the **next** message; no retraining.
- The extension already knows both folders at move time (rel. 2 manual override), so it can report the decision to the helper in the same step as the move.

Optional later (only if §9 shows a gain): a small classifier (logistic regression) trained on the vectors in seconds, used together with k-NN.

## 7. LLM stage and providers

- **Provider layer**: one small **OpenAI-compatible HTTP client** (`httpx`, configurable `base_url` + model + key) covers Ollama (Mac or local), OpenRouter, OpenAI and Gemini (all expose OpenAI-compatible chat endpoints); the Anthropic SDK is added only if Anthropic is wanted. LiteLLM was considered and **not chosen**: very large, fast-moving dependency for what is one HTTP call. Settings per account: provider, model, max messages per run, timeout.
- **Local network LLM host** (Andrea, 2026-09-30): the local provider is an endpoint URL, not necessarily this laptop. Andrea's **MacBook Pro M4, 48 GB unified memory** can run Ollama (or LM Studio) with Apple-GPU acceleration and serve larger models (7–14B class and possibly more) much faster than the ThinkPad CPU, while the mail text stays inside the home network. Settings: base URL (e.g. `http://<mac-name>.local:11434/v1`), model, timeout; the helper checks reachability. If the Mac is off or unreachable, the LLM stage is skipped (embedding suggestions still work) or falls back to the configured secondary provider (ThinkPad CPU model or external opt-in). Security: Ollama has no authentication — expose it only on the home LAN (macOS firewall, no port forwarding), or put a token-checking reverse proxy in front.
- **Embeddings stay on the ThinkPad helper** (always available with Thunderbird, fast enough on CPU); only the LLM stage uses the Mac.
- **Local is the default.** External providers are an explicit opt-in per account, because the message text leaves the PC; only doubtful messages are sent, truncated, and the UI shows which provider was used.
- **API keys** stored by the helper in the Windows Credential Manager (Python `keyring`), never in the extension's storage.
- **Subscriptions** (Andrea's request to use consumer plans instead of API keys): Anthropic explicitly does not permit third-party apps to use Claude Free/Pro/Max credentials; OpenAI and Google offer subscription sign-in only in their own tools (§13). So: **API keys** for all providers, plus **OpenRouter OAuth PKCE** ("Connect OpenRouter" button, no key pasting). Re-check the policies before shipping.
- **Gemini free tier** may use content for product improvement with human review (§13): allowed only with the paid tier, or with an explicit warning in the settings.
- **Prompt**: fixed instructions + candidate folders with descriptions + nearest examples + the message; the model must answer in JSON `{folder, confidence: low|medium|high, reason}` with folder ∈ candidates ∪ {"none"}. Invalid answers fall back to the embedding suggestion.
- **Folder descriptions**: a short text per folder written by Andrea in the extension (e.g. "Commercialista: from 2024 only, accountant X; invoices go to Fatture"). They are the main way to encode *current* criteria; the helper can propose drafts from the folder's examples for Andrea to edit.

## 8. Extension ↔ helper interface

Transport (decision §10 D5): **local HTTP bound to 127.0.0.1 only**, with a random shared token (created by the helper at first start, pasted once into the extension settings) — simplest to build and debug. The extension needs the host permission `http://127.0.0.1/*`; the helper still answers CORS preflight (the `Authorization` header triggers it from extension pages). Native messaging (Thunderbird starts the helper, no open port) was considered and not chosen: registry setup, 1 MB message limit, process lifetime tied to Thunderbird and harder debugging, with no benefit for a single-user localhost setup (§13).

Endpoints (JSON):

| Endpoint | Purpose |
|---|---|
| `GET /health` | helper version, models loaded, store sizes |
| `POST /index` | add/refresh archive examples (batched: key, folder, date, sender, text) |
| `POST /classify` | classify a batch of Inbox messages → suggestions with source, confidence, alternatives, reason |
| `POST /feedback` | report accepted/corrected decisions |
| `POST /evaluate` | run the hold-out evaluation on the store, return the report |
| `GET/PUT /folders/{account}` | folder descriptions |
| `GET/PUT /settings` | models, providers, thresholds (keys write-only) |

The extension sends message **text** it has already read; the helper never receives mailbox credentials or paths.

## 9. Evaluation

Reuse the rel. 3 method so numbers are comparable: deterministic hold-out by Message-ID hash, isotonic calibration on half of the hold-out, threshold table on the other half, per-folder metrics, confusions. Additions:

- **Never-seen senders**: accuracy and threshold table restricted to test messages whose sender address does not occur in the training part (the number that measures G1). Also added to the rel. 3 TF-IDF report (stage 0) to get a baseline.
- **Recent test messages**: same metrics restricted to the last 18 months (fair comparison between date filters, open question from rel. 3).
- **By source**: sender-rule / similarity / llm, each with its own precision.
- **Live metric**: acceptance rate of suggestions in the Archive tab over time (from `/feedback`), the real-world number.

Success criteria (proposal, to confirm in §10 D7): on yahoo.it, never-seen senders accuracy clearly above the TF-IDF baseline (e.g. +15 points); overall ≥ 95% precision at ≥ 75% coverage (rel. 3: 67.4%).

## 10. Decisions

| # | Decision | Proposal | Status |
|---|---|---|---|
| D1 | Fine-tune an LLM vs embeddings + LLM for doubtful messages | Embeddings + LLM; fine-tuning only if measurements show a ceiling | **Agreed** (Andrea, 2026-09-30) |
| D2 | Embed all messages vs a representative subset | All, with dedup of near-duplicates, misfile flagging, recency weights | Proposed |
| D3 | Learning from approvals | Add as weighted `accepted` (1.5) / `corrected` (3.0) examples, upsert by Message-ID, immediate effect | **Agreed** in principle |
| D4 | Vector storage | SQLite file per account in the helper, brute-force search | Proposed |
| D5 | Extension ↔ helper transport | Local HTTP bound to 127.0.0.1 + token; native messaging not needed | Proposed (advisor agrees) |
| D6 | LLM providers and credentials | Plain OpenAI-compatible client (Ollama on the Mac by default, external opt-in per account; Anthropic SDK optional); API keys; keyring storage and OpenRouter OAuth PKCE deferred to stage 4/5; no consumer-subscription login (not permitted by Anthropic, not offered to third parties by OpenAI/Google, §13) | Proposed — **Andrea to decide** |
| D7 | Success criteria | §9 proposal; stage 1 gate on the never-seen-senders slice | **Andrea to confirm** |
| D8 | Default embedding model and local LLM | Embeddings with sentence-transformers (ONNX int8) on the ThinkPad helper — never via Ollama, so the bulk path does not depend on the Mac; stage 1 starts with multilingual-e5-base (runner-up e5-small if too slow); LLM served by the MacBook Pro M4 on the LAN | Open (host agreed) |
| D9 | rel. 3 closure | Ship rel. 3 as is (TF-IDF + calibration + date filter + report); keep R3-6 sender rule (becomes rules stage 1), R3-7/R3-8 UI still useful, drop R3-9 rule export | **Andrea to decide** |
| D10 | Folder cleanup before stage 1 | Merge or exclude duplicate folders (`Commercialista`, `Medicina`), handle year folders by date rule, exclude tiny/obsolete folders — otherwise the data-quality ceiling can make stage 1 read "no gain" for the wrong reason | **Andrea** |

## 11. Staged plan

Each stage ends with something measurable; later stages only start if the earlier numbers justify them.

| Stage | Content | Output / exit criterion |
|---|---|---|
| 0 | rel. 3 closure: never-seen-senders and recent-messages sections in the TF-IDF report; **export** of the training data from the Training tab as JSONL with `headerMessageId`, folder, date, author, subject and the *same* cleaned body the model sees (so the Message-ID hash split and results are comparable; ~45 MB for 21k messages; saved via a blob download link or the `downloads` permission). Andrea: folder cleanup (D10) | Baseline numbers for G1; dataset for stage 1 |
| 1a | **Offline experiment, embeddings** (Python, `tasks/rel4-experiment/`): **one** model (multilingual-e5-base, sentence-transformers ONNX int8; e5-small if < 5 texts/s), dedup, k-NN (2 scorings, with/without same-sender bonus) vs the TF-IDF baseline on the same Message-ID hold-out | Report: overall, and **never-seen senders slice = the gate**; indexing time on the ThinkPad |
| 1b | **Offline experiment, LLM**: one model on the MacBook (Ollama) on ~150 doubtful messages from 1a | Accuracy on doubtful messages, seconds per message. **Go / no-go for stage 2** |
| 2 | **Helper MVP**: HTTP service with `/health`, `/index`, `/classify`, `/feedback`, `/evaluate`; SQLite store; embedding stage + rules; settings file | Helper runs locally, indexes yahoo.it, classifies the Inbox |
| 3 | **Extension integration**: helper connection settings, **visible helper status indicator**, index from Training tab, classify via helper in Archive tab with source badge and nearest examples, feedback on move, fallback to TF-IDF | Andrea uses it daily; acceptance rate measured |
| 4 | **LLM stage**: provider layer, folder descriptions UI, doubtful-message routing, reasons in the UI | Never-seen senders accuracy vs stage 3 |
| 5 | Curation and polish: near-duplicate dedup, misfile review in the Review tab, recency weights tuning, helper packaging/autostart, docs | rel. 4.0 release |

Implementation guidance: stages 1–2 in Python with `uv` (a separate `helper/` folder in this repo), tests with pytest; the extension part follows `CLAUDE.md` conventions.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Local LLM too slow on this CPU (§13) | Primary LLM host = MacBook Pro M4 on the LAN; LLM only for doubtful messages, short prompts, cap per run; measured in stage 1 |
| Mac off / unreachable when classifying | Embedding suggestions still shown; LLM stage skipped or secondary provider; status visible in the UI |
| Embeddings do not beat TF-IDF on this data | Stage 1 is a go/no-go gate before any integration work |
| Old/misfiled examples still mislead | Recency weights, `accepted`/`corrected` weights, misfile flagging, folder descriptions in the LLM prompt |
| Privacy with external providers | Local default, opt-in per account, truncated text, provider shown in UI |
| Helper not running | Extension falls back to the rel. 3 model, visible status |
| Extension API changes (MV2 → MV3) | Keep the helper interface transport-agnostic; see §13 |
| **Data-quality ceiling**: duplicate and year folders cap every model and can hide a real semantic gain | Folder cleanup before stage 1 (D10), date rules, gate on the never-seen-senders slice |
| **Helper lifecycle**: a Python process that must run whenever Thunderbird does (model load, autostart, env updates) can fail silently into the fallback | Status indicator from stage 3; autostart in stage 5 |
| **Self-reinforcement**: bulk-accepted wrong suggestions become weighted examples | Accept weight 1.5 (< corrected 3.0), misfile flagging includes accepted/corrected examples, acceptance-rate monitoring |

## 13. Environment facts

- Laptop (Thunderbird + helper): Lenovo ThinkPad P14s Gen 1, AMD Ryzen 7 PRO 4750U (8 cores / 16 threads, Zen 2), 40 GB RAM, integrated AMD Radeon Pro Graphics (2 GB shared). No discrete GPU.
- LLM host on the home LAN: MacBook Pro M4, 48 GB unified memory (Ollama / LM Studio with Metal). Model sizes and speeds on it to be measured in stage 1 (no benchmark collected yet).
- Data: yahoo.it 21,582 messages in 99 training folders (4,191 in the last 18 months); Inbox ~565 messages.

Research notes (2026-09-30; "official" = vendor docs fetched, "secondary"/"estimate" = to be confirmed by measurement in stage 1):

**Local LLM on this laptop**
- The integrated Radeon (Vega, gfx90c) is **not** supported by Ollama's ROCm backend on Windows (official: [Ollama GPU docs](https://github.com/ollama/ollama/blob/main/docs/gpu.mdx)). Vulkan backends (Ollama, llama.cpp) may use it, but user reports show at most ~2× faster prompt processing and no gain in generation (memory-bound) — plan for **CPU only**.
- Estimated CPU speed (no primary 4750U benchmark found; estimate from memory bandwidth and user reports): 3–4B models at Q4 ≈ 50–100 tokens/s prompt processing, 8–12 tokens/s generation; 7–8B ≈ 20–40 / 4–6. A ~500–800-token classification prompt therefore costs **roughly 5–25 s per message** → local LLM only for a capped number of doubtful messages per run. Measure with `llama-bench` in stage 1.
- llama.cpp server reuses the KV cache of a common prompt prefix (`cache_prompt`, default on) — put fixed instructions first, the message last (official: [llama.cpp server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)).
- Ollama exposes OpenAI-compatible `/v1/chat/completions` and `/v1/embeddings` (official: [Ollama OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility)).
- Candidate local models for Italian + English (general knowledge, to be measured): Qwen3-4B (thinking mode off), Gemma 3 4B, Qwen2.5-7B; Llama 3.2 3B and Phi-4-mini weaker in Italian.

**Embedding models** (CPU; speeds are estimates to be measured on a 500-message sample)
| Model | Params | Dim | Max tokens | License | Notes |
|---|---:|---:|---:|---|---|
| multilingual-e5-small | ~118M | 384 | 512 | MIT | fastest; needs `query:`/`passage:` prefixes; est. 20–50 texts/s |
| multilingual-e5-base | ~278M | 768 | 512 | MIT | est. 6–15 texts/s |
| EmbeddingGemma-300m | 300M | 768 (Matryoshka 512/256/128) | 2048 | Gemma license (not OSI) | official card: MTEB multilingual v2 mean 61.15; in Ollama |
| gte-multilingual-base | 305M | 768 | 8192 | Apache 2.0 | `trust_remote_code` |
| bge-m3 | 568M | 1024 | 8192 | MIT | slower; in Ollama |
| Qwen3-Embedding-0.6B | 0.6B | up to 1024 | 32k | Apache 2.0 | decoder, slowest on CPU; in Ollama |
- ONNX Runtime (int8) is ~3× faster than PyTorch on CPU (sbert.net efficiency docs). One-time indexing of ~22k messages: ~10–20 min (small) to ~1 h (base) — estimate.
- Ollama serves bge-m3, EmbeddingGemma, Qwen3-Embedding, nomic-embed-text-v2-moe, paraphrase-multilingual, snowflake-arctic-embed2, granite-embedding (not the e5 / gte models) (official: [Ollama embedding models](https://ollama.com/search?c=embedding)).
- sqlite-vec: stable v0.1.9 (2026-03-31), brute-force KNN, `pip install sqlite-vec`; Python's SQLite must allow extension loading — test first. NumPy brute force is an equally valid option at this size (official: [sqlite-vec releases](https://github.com/asg017/sqlite-vec/releases)).

**Extension ↔ helper**
- Native messaging (`runtime.connectNative` / `sendNativeMessage`, permission `nativeMessaging`) is supported in Thunderbird since TB 50 (official: [TB runtime API](https://webextension-api.thunderbird.net/en/latest/runtime.html)). Windows registration under `HKCU\Software\Mozilla\NativeMessagingHosts\<name>` (MDN; Thunderbird use confirmed only by a third-party project); host → extension messages ≤ 1 MB (MDN).
- Local HTTP: `fetch()` to `http://127.0.0.1:<port>` needs the host permission `"http://127.0.0.1/*"` (ports ignored by match patterns); no Thunderbird-specific block on plain-http localhost found (general WebExtension rule, not verified on a Thunderbird page — test in stage 3).
- Manifest V3 is supported since Thunderbird 128 ESR; no MV2 end-of-life date published. MV2 keeps working; under MV3 the background becomes an event page (a long-lived native port is more delicate) (official: [TB MV3 guide](https://webextension-api.thunderbird.net/en/beta-mv3/guides/manifestV3.html)).

**LLM providers and subscriptions**
- **Anthropic**: third-party apps must use API keys; routing requests through Free/Pro/Max plan credentials or offering Claude.ai login in other apps is not permitted (official: [Claude Code legal and compliance](https://code.claude.com/docs/en/legal-and-compliance)). Policy changed in 2026 — re-check before shipping.
- **OpenAI**: ChatGPT subscriptions and API billing are separate; subscription sign-in exists only for OpenAI's own Codex tool (official help/Codex docs, partly from search results).
- **Google**: Gemini API uses API keys from AI Studio; subscription quota only in Google's own Gemini CLI (partly from search results).
- **OpenRouter** supports **OAuth PKCE**: the app can obtain a user-controlled API key without the user pasting it (official: [OpenRouter OAuth PKCE](https://openrouter.ai/docs/use-cases/oauth-pkce)).
- Data use (API): OpenAI — no training unless opted in, abuse logs 30 days; Anthropic API — no training by default, ~30-day retention (secondary source); **Gemini API free tier — content may be used to improve Google products and read by human reviewers; paid tier not** (official terms); OpenRouter — per-provider policies, training providers excludable in account settings.
- **LiteLLM** (MIT, v1.103.1, 2026-09-29; considered, not chosen — §7) gives one OpenAI-style interface to Ollama, OpenRouter, Gemini, OpenAI, Anthropic (official: [PyPI](https://pypi.org/project/litellm/)).
