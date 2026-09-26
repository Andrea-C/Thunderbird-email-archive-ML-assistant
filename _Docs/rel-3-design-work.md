# Release 3.0 - Design Work

Design notes and decisions for Release 3.0 of the Email Archive ML Assistant.
Written 2026-09-17 after an analysis session with Andrea (orchestrated by Evridigit Hermes PC; implementation to be delegated to Claude Code CLI).

Continues `rel-2-design-work.md`. Release 2.0-beta (2025-12) shipped TF-IDF NB, linear SVM, multiple models per account, Folder Review Mode, manual target override.

---

## Table of Contents

1. [Context and problem statement](#1-context-and-problem-statement)
2. [Findings from code review](#2-findings-from-code-review)
3. [Scope of Release 3.0](#3-scope-of-release-30)
4. [Design of each feature](#4-design-of-each-feature)
5. [Algorithm assessment: is the current model good enough?](#5-algorithm-assessment)
6. [Out of scope / later](#6-out-of-scope--later)
7. [Development workflow and guardrails](#7-development-workflow-and-guardrails)
8. [Open decisions](#8-open-decisions)
9. [Environment facts](#9-environment-facts)

---

## 1. Context and problem statement

- The heaviest daily task in Thunderbird is separating news/commercial/notification mail from mail that matters, then archiving into folders.
- The extension trains one model per account on the content of the archive folders, then proposes a folder for each Inbox message.
- Quality is "not bad, not great". Main suspected cause: the training folders contain **misleading messages** — archiving criteria changed over the years, so old content teaches the wrong thing.
- Andrea's request for rel. 3:
  1. Limit training to recent mail (default **18 months**, changeable at runtime) to limit poisoning.
  2. Evaluate whether the algorithm/model is good enough, or whether we can do better.
  3. UI: bulk select with click + Shift+click, and other efficiency ideas.
- Safety constraint: no bulk operation on live mailboxes without a tested path. A full Thunderbird backup was made on 2026-09-17 (`F:\Backup\2026.09.17-Thunderbird`, 21 zip volumes, SHA-256 verified) before any work.

## 2. Findings from code review

Source: `background/background.js` (1383 lines), `pages/archive.js` (1216), `pages/review.js` (624), `pages/train.js` (371). Manifest v2, min TB 91.

### 2.1 BUG — training never sees the message body (high impact)

`trainModel()` iterates `browser.messages.list(folder.id)` / `continueList()`, which return **MessageHeader** objects (author, subject, date, recipients, …) — there is no `body` property. The training text is built as:

```js
const fullText = `${message.author || ''} ${message.subject || ''} ${message.body || ''}`;
```

so `message.body` is always `undefined` and **every model is trained on sender + subject only**.

`classifyMessage()` instead receives a full message (`message.body?.plain || message.body`) and classifies on sender + subject + body. Consequences:

- Body tokens were never seen in training → Naive Bayes gives them the smoothed "unknown" probability for every class (pure noise that dilutes the signal), SVM has no weights for them (ignored). The effective classifier is a subject+sender model with noise added at prediction time.
- Any algorithm comparison done so far (NB vs TF-IDF vs SVM) was done on subject+sender features only.

Decision: fix the asymmetry. Two options, see §4.5. This must be done **before** measuring accuracy, otherwise the numbers are meaningless.

### 2.2 Features are binary per message

`tokenize()` returns a `Set` (deduplicated words + email addresses + sender domains). Term frequency inside a message is therefore 0/1. Acceptable for short texts (subject+sender) and actually robust; keep it, but note that "TF-IDF" is effectively "IDF-weighted binary".

### 2.3 Sender is just another token

`author` (e.g. `"Amazon.it" <no-reply@amazon.it>`) is tokenized like text: the address and the domain become tokens with the same weight as any word. For newsletters/notifications the sender alone is an almost deterministic signal; the model under-uses it.

### 2.4 No evaluation of any kind

There is no hold-out, no accuracy number, no confusion matrix. "Not great" is a feeling; rel. 3 must make it a number.

### 2.5 Date is available for free

`MessageHeader.date` (a `Date`) is already in every list page. The date filter needs no extra API calls.

### 2.6 Folder selection is one-shot

Training tab has a checkbox tree, persisted as `folders_<accountId>` (list of selected paths). There is no persistent "never train on this folder" concept separate from the current selection; every retrain starts from the saved selection, which is fine, but the UI does not distinguish "excluded on purpose" from "unchecked".

### 2.7 Repository state

`main` has 20 uncommitted modified files (rel. 2.0-beta work, last commit "Preparation for rel. 2"). `manifest.json` still says `"version": "1.0"` and name "Email Archive Assistant". Remote: `github.com/Andrea-C/Thunderbird-email-archive-ML-assistant`.

## 3. Scope of Release 3.0

Priority order (each item is independently shippable):

| # | Item | Type | Effort | Expected effect |
|---|---|---|---|---|
| R3-1 | Commit rel. 2.0-beta, create branch `rel-3`, bump manifest to 3.0.0-beta | housekeeping | S | — |
| R3-2 | Training date filter, default 18 months, editable in Training tab, stored per account | data quality | S | removes most legacy noise |
| R3-3 | Persistent "exclude from training" flag per folder (distinct from unchecked) | data quality | S | user can quarantine known-bad folders |
| R3-4 | Fix training/classification feature asymmetry (§2.1) | correctness | S–M | prerequisite for any measurement |
| R3-5 | Hold-out evaluation: accuracy, per-folder precision/recall, confusion matrix, shown after training and stored with the model | measurement | M | turns "not great" into a number; tells us whether data or algorithm is the bottleneck |
| R3-6 | Sender-priority rule (two-stage prediction) | accuracy | S–M | likely largest single accuracy gain for newsletters/notifications |
| R3-7 | Shift+click range selection in Archive and Review tables | UI | S | bulk approval speed |
| R3-8 | "Select all ≥ threshold" button and group-by-target-folder view | UI | S–M | approve a folder at a time |
| R3-9 | Export "sender → folder" rules with ≥95% consistency as a list (and optionally as Thunderbird message filters `msgFilterRules.dat` snippet) | efficiency | M | deterministic mail never reaches the ML step |

R3-1 … R3-5 are mandatory for the release. R3-6 … R3-9 are strongly recommended and cheap.

## 4. Design of each feature

### 4.1 R3-2 Training date filter

- Setting `trainingMonths` (integer, default 18, 0 = no limit), stored in `browser.storage.local` under `settings_<accountId>` (per account; a global default also stored under `settings_global`).
- Training tab: numeric input "Use only messages newer than [18] months" next to the algorithm selector. Value is read at "Start Training" time — no retrain needed to change it, it just applies to the next training.
- In `trainModel()`: compute `cutoff = now - trainingMonths*30.44 days`; skip messages with `message.date < cutoff` **before** counting `totalMessages` (so progress bars are correct). Count skipped messages and show "N messages skipped (older than cutoff)" in the training summary.
- Store `trainingMonths`, `cutoffDate`, `trainedAt`, `messagesUsed`, `messagesSkipped` in the model metadata, shown in the Trained Models list.

### 4.2 R3-3 Folder exclusion

- New persisted set `excludedFolders_<accountId>` (folder paths).
- Training tree: each folder row gets a small "⛔ exclude" toggle (or a right-click / context option). Excluded folders are shown greyed with the icon, cannot be checked, and are skipped even if a parent is selected.
- Exclusion also removes the folder from the **prediction label set** (a folder you don't want to train on is a folder you don't want messages moved into).
- Review tab can still open excluded folders (to clean them up).

### 4.3 R3-4 Feature asymmetry fix

Options:

- **A. Headers-only everywhere (recommended first step).** Make `classifyMessage()` use only `author + subject` (+ recipients if useful). Zero extra API calls, fast, consistent with what the model has actually been learning. For newsletter/notification triage the subject+sender is usually enough.
- **B. Body everywhere.** In training, call `browser.messages.getFull(id)` per message to get the body. Cost: one API call per message — for 60k messages this is slow (minutes to tens of minutes) and memory heavy. Mitigation: truncate body to first 2–3 kB of plain text, strip HTML/quoted text, and make it optional ("Include message body in training" checkbox, default off).

Decision (updated 2026-09-26, §8.2): implement **B (body) as the default** and **A (headers-only) as an opt-out** ("Include message body in training" checkbox, default **on**), stored with the model (`features: "headers" | "headers+body"`). Body mitigations from option B apply (plain text, HTML/quote stripping, truncation to 2–3 kB). Classification must always use the same feature set the model was trained with (read it from model metadata). The evaluation report (R3-5) will show whether B is worth its cost on Andrea's data.

### 4.4 R3-5 Hold-out evaluation

- During training, after the date filter, deterministically assign each message to train (80%) or test (20%) using a hash of the message header ID (stable across runs, no randomness).
- Train on the 80%, then predict the 20% and compute: overall accuracy, macro-F1, per-folder precision/recall/support, confusion matrix (top confusions listed as "actual → predicted, count").
- Also compute accuracy **at the confidence threshold**: coverage (share of test messages above threshold) and precision above threshold — this is the number that matters for the user ("if I auto-move everything ≥80%, how often is it wrong?").
- Then retrain on 100% for the stored production model (or keep the 80% model; decision: retrain on 100%, evaluation numbers are stored as metadata).
- Show the report in the Training tab after training (collapsible panel) and keep it in the model metadata; add a "Copy report as Markdown" button so results can be pasted into docs.
- Minimum-support guard: folders with < 5 test messages are flagged "insufficient data".

### 4.5 R3-6 Sender-priority rule (two-stage prediction)

- During training, build `senderStats[address] = {folder: count}` (normalized lowercase address; also domain-level stats `domainStats`).
- Prediction: if the sender address has ≥ `minSenderCount` (default 3) training messages and ≥ `senderPurity` (default 0.9) of them are in one folder → predict that folder with confidence = purity, tag prediction `source: "sender-rule"`. Otherwise fall back to the ML classifier (`source: "ml"`). Show the source in the table (small badge) so the user learns what drives the decision.
- Both thresholds editable in settings. The evaluation report reports accuracy separately for sender-rule vs ML predictions.
- Same rule at domain level as a second fallback, with stricter purity (0.95) and count (5), optional.

### 4.6 R3-7 / R3-8 UI

- Shift+click: keep `lastClickedIndex` in the table state; on checkbox click with `event.shiftKey`, set all rows between `lastClickedIndex` and the current row to the state of the current checkbox. Works on the **currently sorted/filtered** order. Applies to Archive and Review tables; update the header "select all" indeterminate state.
- "Select ≥ threshold" button next to the threshold slider.
- Group-by-target-folder toggle: renders the table grouped with a header row per predicted folder, each with its own select-all; keeps sorting inside groups by confidence desc.
- Keyboard: `a` toggle selection of focused row, `Shift+A` select all above threshold (nice-to-have).

### 4.7 R3-9 Rule export

- After training, list senders with ≥ N messages and purity ≥ 0.95 as `sender → folder`. Export as CSV/Markdown. Optional: generate a Thunderbird filter block (`msgFilterRules.dat` syntax: `name`, `enabled`, `type="17"`, `action="Move to folder"`, `condition="AND (from,contains,addr)"`) that the user can paste — do **not** write into `msgFilterRules.dat` automatically in this release.

## 5. Algorithm assessment

Question asked: is Naive Bayes / TF-IDF NB / SVM good enough, or can we do better?

Assessment:

- For **folder-by-sender workloads** (newsletters, notifications, invoices, orders) the sender is a near-perfect feature; any linear model reaches 90%+ once the data is clean. The rel. 2 algorithm table (NB 75–80%, TF-IDF 80–85%, SVM 85–92%) is generic literature; it was never measured on this data — and because of §2.1 every model so far was a subject+sender model.
- Where linear bag-of-words models fail: folders with overlapping vocabulary (two clients, "Fatture" vs "Ordini"), tiny folders (prior dominated by big folders), and inconsistent labels. Two of these three are **data problems**, not algorithm problems.
- Therefore: **do not change the algorithm family in rel. 3.** Fix the features (R3-4), clean the data (R3-2, R3-3), add the sender rule (R3-6), and **measure** (R3-5). Then decide.
- Cheap algorithmic improvements to consider only after measuring, in order: Complement NB (fixes class imbalance, ~30 lines); per-folder confidence calibration (NB probabilities are overconfident; calibrate on the hold-out set so 80% means 80%); character n-grams for subjects (robust to Italian inflections). Anything heavier (embeddings, TF.js) is not justified by the task.

Success criteria proposed for rel. 3 on `andrea.clementi@yahoo.it` (to be confirmed): precision ≥ 95% on messages above the 80% threshold, with coverage ≥ 60% of Inbox messages. If coverage is lower, the long tail is handled manually with the improved UI.

## 6. Out of scope / later

- Automatic archiving on arrival (would need a background poll + move without review) — only after rel. 3 numbers prove precision.
- Server-side filters (Gmail/Zoho) generated from the rule export.
- Cross-account models.
- Unsubscribe assistant (list senders never opened / never replied) — could be a Review-tab report; deferred.
- Integration with Hermes for "what do these emails require me to do" — separate project, read-only IMAP access, not part of the extension.

## 7. Development workflow and guardrails

- Repo: `C:\Software\Evridigit_apps\EmailArchive4Thunderbird`. Step 0: commit the current working tree as `2.0.0-beta`, tag it, then `git checkout -b rel-3`.
- Implementation by **Claude Code CLI** (`claude -p … --model sonnet` for well-specified items, `opus` for R3-4/R3-5/R3-6 design-sensitive parts), one item per commit, following the existing `.cursor/rules/*.mdc` conventions (kept as project rules; also add a `CLAUDE.md` summarizing them).
- Build: `python utils/build_xpi.py` → `_builds/EmailArchive4Thunderbird_<timestamp>.xpi`. Manual install/test by Andrea in Thunderbird (Hermes cannot drive the Thunderbird UI). Alternative for faster iteration: Tools → Developer Tools → Debug Add-ons → Load Temporary Add-on (`manifest.json`).
- Test account: to be decided (§8). Nothing is moved during training or evaluation — training/evaluation are read-only by construction. Moves happen only via the existing "Move Selected" with explicit user selection.
- Safety net: backup of 2026-09-17 on F:. Before the first real bulk move with rel. 3, test the flow on the `demo-supply-admin-01@supplysquare.it` account.
- Docs to update at the end: `CHANGELOG.md` (3.0.0-beta section), `readme.md` (settings, evaluation report, sender rule), `manifest.json` version.

## 8. Decisions (formerly open; answered by Andrea 2026-09-26)

1. Test/validation account: **`andrea.clementi@yahoo.it`**.
2. Include the body in training by default? **Yes** — body is the default, headers-only is opt-out (overrides the original proposal; §4.3 updated). The evaluation report will still show whether it pays off.
3. R3-9 (rule export): **in 3.0 as Markdown/CSV export only**; `msgFilterRules.dat` snippet generation in 3.1.
4. Sender-rule thresholds: **3 messages / 0.90 purity** kept as defaults; tune after the first report.
5. Rename: **done in R3-1** — "Email Archive ML Assistant"; `manifest.json` `version: "3.0.0"` (Mozilla requires a dot-separated numeric `version`; `version_name` was tried and removed because Thunderbird flags it as an unexpected property). Beta status tracked in CHANGELOG and git tags.

## 8b. Progress

- **First measurements (2026-09-26, yahoo.it, TF-IDF NB, 21,582 msgs, 99 folders; reports in `_Docs/reports/`)**: with body 77.6% accuracy / macro-F1 45.3% / 10.5 MB; headers only 83.1% / 58.4% / 1.5 MB. Confidence useless: ≥95% still covers 96.7% at 84.8% precision. Main confusions are data issues (duplicate folders `/Commercialista` vs `/_z Evridiky/Commercialista`, `/Medicina` vs `/_Famiglia/Alexandro/Medicina`; year folders `Nota spese/2025` vs `2026`; overlapping `_Notifiche` / `_Accounts` / `_News`); 33 folders have < 20 training messages. Andrea: keep body as default for now, re-evaluate after cleaning the folders (wrong data may bias both runs).
- **Confidence calibration done (2026-09-26)**: §5 "per-folder confidence calibration" brought forward, as a global margin-based isotonic calibration (see CHANGELOG). Chosen before R3-6 because without it no threshold-based feature (auto-select ≥ threshold, R3-8) can work.
- **R3-5 done (2026-09-26)**: implemented as §4.4, with one change: instead of evaluating then retraining on 100% (two passes over the mailbox, i.e. two rounds of body fetching), the production model (100%) and the evaluation model (80%) are trained in the same pass; held-out texts are kept in memory for prediction. Split key: `headerMessageId` (the numeric `message.id` is not stable across restarts). Threshold table covers 50/60/70/80/90/95%.
- **Folder selection persistence fixed (2026-09-26, requested by Andrea before continuing)**: see CHANGELOG. Relation to R3-3: a persistently unchecked folder already stays out of training; R3-3 still adds the explicit "excluded" state (greyed, not selectable via parent, removed from prediction targets).
- **R3-4 done (2026-09-26)**: body in training by default (checkbox), shared text building in background, metadata key `modelMeta_<accountId>_<algo>`. Finding: the Archive tab was already classifying on headers only (it passes a MessageHeader without body) — only the Review tab added the body, so §2.1's asymmetry affected Review only. Retrain required: pre-3.0 models are treated as headers-only.
- **R3-1 done (2026-09-26)**: rel. 2.0-beta committed on `main` and tagged `v2.0.0-beta`; branch `rel-3` created; manifest renamed/bumped; `_builds/` and `.claude/settings.local.json` git-ignored; project `CLAUDE.md` written.

## 9. Environment facts

- Thunderbird profile: `%APPDATA%\Thunderbird\Profiles\dd6osc0q.default`; some accounts store mail under `C:\Users\andre\Documents\_Personale\Posta\Thunderbird` (yahoo, gmail.ac, evridiky PEC, Cartelle locali). Full inventory: `C:\Software\Evridigit-Hermes-PC\docs\thunderbird-storage-inventory.md`.
- 2026-09-17: 36 orphan store directories of deleted accounts removed (12.2 GB), all contained in the backup.
- Extension installed in the profile as `email-archive@example.com.xpi`; other relevant add-ons: quickFilters, quickFolders, ImportExportToolsNG.
- Thunderbird WebExtension API docs are mirrored in `_Docs/thunderbird_docs/`.
