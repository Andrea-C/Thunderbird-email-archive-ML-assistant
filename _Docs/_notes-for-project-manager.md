# Notes for project manager

## Project
Thunderbird extension "Email Archive ML Assistant": learns from each account's archive folders and proposes the target folder for Inbox messages; the user approves and moves them. Current work: Release 3.0 (branch `rel-3`), design in `_Docs/rel-3-design-work.md`.

## Features (shipped in 2.0.0-beta)
- Per-account training on selected folders; algorithms: Naive Bayes, TF-IDF NB, linear SVM; multiple models per account.
- Archive tab: classify Inbox, confidence threshold, manual target override, move selected.
- Folder Review tab: review an existing folder's content against the model.

## Decisions
- 2026-09-26 — Rel. 2.0-beta frozen on `main`, tag `v2.0.0-beta`; rel. 3 work on branch `rel-3`.
- 2026-09-26 — Name "Email Archive ML Assistant"; manifest `version 3.0.0` (beta status in CHANGELOG/tags; Thunderbird does not accept `version_name`).
- 2026-09-26 — Validation account: `andrea.clementi@yahoo.it`.
- 2026-09-26 — Message body included in training **by default** (headers-only is opt-out).
- 2026-09-26 — Rule export (R3-9) in 3.0 as Markdown/CSV only; Thunderbird filter snippet in 3.1.
- 2026-09-26 — Sender-rule defaults: ≥3 messages, ≥90% purity.
- No algorithm-family change in rel. 3: fix features, clean data, measure first.
- 2026-09-26 — First reports: headers-only beats body (83.1% vs 77.6%); body stays default until folders are cleaned, then re-measure.
- 2026-09-26 — Confidence is now calibrated on the hold-out set (the old one was ~100% for almost everything).
- 2026-09-30 — 4-run comparison (body on/off × 18 months/all): calibrated confidence meets the target (no body, all dates: 95.1% precision at 67.4% coverage); body does not help even on recent mail.
- 2026-09-30 — Rel. 4 decisions: providers via OpenAI-compatible endpoint (Mac engine: Ollama, LM Studio or Atomic Chat), success criteria as proposed, ship rel. 3 as is (drop R3-9), folder cleanup postponed in favour of the date filter.
- 2026-09-30 — Rel. 4 direction agreed: embeddings (k-NN) for all messages + LLM only for doubtful ones, learning from accept/correct, local Python helper; LLM served by the MacBook Pro M4 on the LAN. No LLM fine-tuning for now. Design: `_Docs/rel-4-design-work.md` (reviewed by an independent advisor).

## Todo
| Status | Owner | Task |
|---|---|---|
| done | Claude | R3-1 Commit 2.0-beta, tag, branch `rel-3`, rename + version bump |
| done | Claude | R3-2 Training date filter (default 18 months) |
| todo | Claude | R3-3 Persistent "exclude from training" per folder |
| done | Claude | Fix: folder selection remembered per account (across trainings, restarts, updates) |
| done | Claude | R3-4 Fix training/classification feature asymmetry (body default) |
| done | Claude | R3-5 Hold-out evaluation report |
| done | Claude | Calibrated confidence (threshold = real probability of being right) |
| todo | PM (Andrea) | Retrain yahoo.it 4 times (body on/off × 18 months / 0 = all), save the 4 reports in `_Docs/reports/`; check the ≥80% row (target ≥95% precision, ≥60% coverage) |
| todo | PM (Andrea) | Clean folders: duplicates (Commercialista, Medicina), year folders (Nota spese), tiny folders; then re-measure body vs no body |
| done | PM (Andrea) | Rel. 4 decisions: D6 providers (Mac engine free: Ollama / LM Studio / Atomic Chat), D7 success criteria, D9 rel. 3 closure agreed; D10 folder cleanup postponed (date filter instead) |
| todo | Claude | Rel. 4 stage 0: never-seen-senders + recent-messages in the report; JSONL export of training data |
| todo | Claude | R3-6 Sender-priority rule |
| todo | Claude | R3-7 Shift+click range selection |
| todo | Claude | R3-8 "Select ≥ threshold" + group by target folder |
| todo | Claude | R3-9 Sender→folder rule export (MD/CSV) |
| done | PM (Andrea) | Retrain yahoo.it twice (body on / off), reports in `_Docs/reports/` |
| todo | PM (Andrea) | Test each build in Thunderbird; confirm success criteria (≥95% precision above 80% threshold, ≥60% coverage) |


---

# Tests Plan

## Configurations to test

| Run # | Body | Months | Train time | Folders count | Message count | Message in Inbox | Messages rated under 80% |
|---|---|---|---|---|---|---|---|
| 1 | on | 18 | |
| 2 | off | 18 | |
| 3 | on | 0 (all) | |
| 4 | off | 0 (all) | |