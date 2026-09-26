# Email Archive ML Assistant (Thunderbird extension)

Thunderbird WebExtension (Manifest v2, min TB 91) that trains one ML model per mail account on the content of its archive folders and proposes a target folder for each Inbox message; the user reviews and moves the selected messages.

## Layout
- `manifest.json` — name, `version` (numeric only, e.g. `3.0.0`) + `version_name` (e.g. `3.0.0-beta`), permissions.
- `background/background.js` — tokenizer, training (`trainModel`), classification (`classifyMessage`), model storage, messaging with the pages.
- `pages/` — UI: `container.html` (tabs), `train.*` (Training tab), `archive.*` (Archive tab), `review.*` (Folder Review tab).
- `utils/build_xpi.py` — builds `_builds/EmailArchive4Thunderbird_<timestamp>.xpi` (git-ignored).
- `_Docs/` — design docs per release (`rel-N-*.md`; current: `rel-3-design-work.md`), `CHANGELOG.md` at the root, TB API docs mirror in `_Docs/thunderbird_docs/` (check it before answering API questions from memory).

## Build and test
- Build: `python utils/build_xpi.py`.
- Test: only Andrea can run it in Thunderbird — install the .xpi, or Tools → Developer Tools → Debug Add-ons → Load Temporary Add-on (`manifest.json`). There are no automated tests; for pure logic (tokenizer, metrics) prefer small Node scripts under a scratch folder.
- Branches: `main` = last release (tag `v2.0.0-beta`); release work on `rel-3`, one R3-x item per commit.

## Conventions (from `.cursor/rules/*.mdc`)
- Plain modular JavaScript, functional style, **no classes**, descriptive names, comments, explicit error handling and logging.
- Use `messenger.*` / `browser.*` APIs with Promises; respect Thunderbird API docs; least-privilege permissions; keep the CSP (`script-src 'self'`), no inline scripts, avoid XSS (no `innerHTML` with message data).
- UI: standard HTML elements, clear feedback and loading states, keyboard navigation.
- `machine-learning.mdc` mentions TensorFlow.js: **superseded** — per `rel-3-design-work.md` §5 the algorithm family (NB / TF-IDF NB / linear SVM) does not change in rel. 3.

## Safety rules
- Training and evaluation must stay read-only on mailboxes. Messages are moved only by the existing "Move Selected" flow on an explicit user selection. Never add automatic moves without an explicit decision.
- Validation account for rel. 3: `andrea.clementi@yahoo.it`. Test real bulk moves first on `demo-supply-admin-01@supplysquare.it`.

## Working method

Default: do the work yourself, in this session. The conversation context lives here. Delegate only when it pays: when it removes bulk from this context, runs independent work in parallel, buys an independent check, or needs a stronger model for a decision that shapes the work. Never delegate to save cents at the price of a hand-off.

### Delegate when
- **Decisions that shape the work** — architecture, unclear root causes, trade-off calls, plans for multi-step changes → `advisor` (Fable). One dispatch per real decision. Brief it with everything relevant: it has no access to this conversation. Implement its verdict yourself.
- **Bulk reading** — understanding the task needs more than ~5 files, or long logs/docs whose full text should not live in this context → `scout` (one question per dispatch; fan out for several).
- **Mechanical work with a decided design** — you can state exactly what "done" looks like, and it is more than a few small edits → `worker`. Several independent chunks → several workers in one message.
- **Independent check** — before declaring a non-trivial change done, or when you have a diagnosis you cannot test → `reviewer`. For high-stakes changes dispatch it with model `fable`.
- **External facts** — library APIs, docs, error messages, version specifics → `researcher`. Never answer these from memory when they decide the implementation.

### Do it yourself when
- The change touches 1–3 files and is clear: writing the brief costs more than the edit.
- The task needs ordinary judgment you can exercise with confidence. Escalate to `advisor` only when the decision is hard to reverse or you cannot settle it with evidence at hand.
- The subagent would need most of this conversation to do it right.
- You would have to re-read everything it touched anyway.
- Final synthesis for the user. Always yours.

### Briefs
A subagent knows nothing but its brief. Every dispatch states:
1. Goal and why (one or two lines of context).
2. Exact files or paths in scope; what is out of scope.
3. Done-criterion: the test, build or command whose output proves completion.
4. Constraints: style to match, things not to touch, decisions already made.
5. What to return (the agent's output contract covers the format).

### Trust
Subagent output is input, not truth. Open the file for any scout claim that matters. Read the diff of every worker before reporting done. Confirm a reviewer finding before fixing it. Never report a subagent's verification as your own without having seen it.

### Verification
Before claiming something works: run it. Tests, the script, the build — whichever is the narrowest real check. If it was not run, say so.

## Languages
This is a Windows 11 Pro PC.

Based on the task, use the most appropriate language: Python, JavaScript, TypeScript, Bash, PowerShell, etc.

Installed: Python, uv, Node.js, npm, PowerShell, Docker Desktop, AWS CLI, gcloud CLI, Firebase CLI, xAI grok AI Agent, Google Antigravity AI agent, Claude Code CLI and Desktop.

## uv venv
A uv venv is already created in `.venv`. Use it for Python dependencies (`uv pip install ...`).

# Notes for project manager

You have to keep a very concise notes file for the project manager
- The file is named "_Docs/_notes-for-project-manager.md" (_Docs is in the root of the project)
- If the file doesn't exist, you can create it

The file contains:
- a very short project description
- the updated list of project features
- the updated list of important decision taken
- an updated todo list with 
    - Status (done, in progress, todo)
    - Owner (you or project manager) 
	- Task