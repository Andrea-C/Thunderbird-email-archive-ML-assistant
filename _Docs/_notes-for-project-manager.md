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

## Todo
| Status | Owner | Task |
|---|---|---|
| done | Claude | R3-1 Commit 2.0-beta, tag, branch `rel-3`, rename + version bump |
| todo | Claude | R3-2 Training date filter (default 18 months) |
| todo | Claude | R3-3 Persistent "exclude from training" per folder |
| done | Claude | Fix: folder selection remembered per account (across trainings, restarts, updates) |
| done | Claude | R3-4 Fix training/classification feature asymmetry (body default) |
| done | Claude | R3-5 Hold-out evaluation report |
| todo | Claude | R3-6 Sender-priority rule |
| todo | Claude | R3-7 Shift+click range selection |
| todo | Claude | R3-8 "Select ≥ threshold" + group by target folder |
| todo | Claude | R3-9 Sender→folder rule export (MD/CSV) |
| todo | PM (Andrea) | Retrain yahoo.it twice (TF-IDF NB, body on / off), copy both evaluation reports as Markdown, note model size (console "Saved model … MB") |
| todo | PM (Andrea) | Test each build in Thunderbird; confirm success criteria (≥95% precision above 80% threshold, ≥60% coverage) |
