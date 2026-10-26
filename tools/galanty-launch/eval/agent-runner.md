# Evaluation and Agent trials

Run commands from `tools/galanty-launch/`. Node 22+, npm, FFmpeg/ffprobe and a working Remotion Chromium installation are needed. Generated files stay in this worktree's ignored `.lane-data/`; do not commit films, dependencies or host logs.

## Fixed starter matrix

```sh
npm run eval
npm run eval -- --list
npm run eval -- --filter cli,saas --deps shared
```

The fixed corpus has 15 cases: CLI, SaaS, mobile, hardware, fictional OSS, data, design, education, audio, security, automation, desktop, IoT, commerce and a real Bun internal study. Each fictional brief cites its own checked-in `source.md` (copied as `eval-source.md`) and labels its film DEMO. Bun's original brief and product explanation remain only in `cases/bun/`, with official sources and an EVAL label. The inputs are not benchmark measurements.

For each case, the runner creates an empty target, copies the complete reusable toolkit excluding default product answers, dependencies, generated output and the evaluation corpus, writes the fixed case input/source, runs render and then check, and retains a result row even on failure. Failures do not stop later cases; any failure makes the command exit nonzero. Existing thresholds, durations and reading budgets are unchanged. The port-4392 lock prevents two runners in this worktree from rendering concurrently; an occupied port also blocks startup. Never remove an active lock; inspect its recorded PID before removing a stale lock.

Default dependency setup is `npm ci` per case. `--deps shared` checks the exact lockfile SHA-256 and validates the existing source dependency tree using `npm ls --all --json`, then links it into the case. Mode, source path, lock hash and process logs are retained. It does not copy dependency contents into a new project. Browser provisioning is separate: each evaluation invocation calls the official Remotion `ensureBrowser()` once from the primary toolkit, validates its returned executable, and records its resolved path, bytes and SHA-256. The runner passes `REMOTION_BROWSER_EXECUTABLE` to all case/host child processes, so isolated `npm ci` trees reuse that same Chromium executable instead of downloading one per case. An explicit inherited executable is validated as well. Download or executable-validation failures remain failures; there is no alternate-browser or TLS bypass. Agent continuations reject a changed browser hash.

Reports: `.lane-data/eval/<run>/report.json` and `report.md`; `.lane-data/eval/latest.json` points to the latest completed run. Rows contain delivered duration, LUFS, true peak, median cut/grid and music-onset residuals, full-frame double-render equality, advisory low-coverage frames, and wall time. Measurements come from `build/check.json`; missing values are null/—, never fabricated zeroes. PID, command, start/end time, exit code, signal and logs are recorded per child command. Low coverage is advisory. Automatic success does not imply human film/audio review or Agent skill adoption.

## Real CLI skill-adoption trials

```sh
npm run eval:agent -- --help
npm run eval:agent -- --host codex --case cli --deps ci --audit-interventions
npm run eval:agent -- --host claude --case saas --deps ci --audit-interventions
npm run eval:agent -- --host gemini --case mobile --deps ci --audit-interventions
```

The host CLI must already be installed, authenticated and configured for noninteractive access to the target and supplied read-only resources. The runner uses `codex exec`, `claude -p` or `gemini -p`. It passes **no model, reasoning effort, context or compaction override** and does not replace the user's CLI configuration. Explicit host options can be appended after `--`; they are recorded verbatim. The wrapper does not silently bypass host permission checks. Permission or authentication failures are failed invocations, not successful films.

Each new trial starts with an empty `.lane-data/agent-eval/<run>/project/`. Skill plus references and toolkit are frozen in the original repository layout under `resources/skills/galanty-launch/` and `resources/tools/galanty-launch/`; Agent toolkit dependencies always use a separate `npm ci` installation in a normal directory. Agent trials reject `--deps shared` before creating any paths and refuse continuation of older shared-dependency trials: an Agent copying a dependency symlink and later running `npm ci` could otherwise delete the original dependency tree. The prompt provides the canonical skill path, brief/source paths, required outputs and lane boundaries. It does not write a solved brief, storyboard, code or answer into the target. The Agent chooses how to create/adapt its project by following the skill. `DVS_DATA` points to the trial's isolated data directory. Installed Apps, preview launchers, QA environments, other worktrees, commits and model-setting changes are prohibited. Run trials serially; the runner shares the evaluation port lock with the template matrix.

The runner saves the exact prompt, raw CLI logs, PID/exit records, input/source/toolkit hashes and per-attempt artifact hashes. After the host exits, it audits the required film/contact-sheet/nine-frame/report files, a fresh successful `check.json`, and the current render-input fingerprint. It does not render a missing film on the Agent's behalf.

**First film success** means the first host CLI invocation exited successfully and produced the required auditable film evidence. It does not mean the first internal render command succeeded: internal retries remain visible in raw host logs. Eventual success is reported separately as `firstSuccessfulAttempt`. A passed automated audit does not imply human audiovisual review.

**Human intervention** is an operator's case-specific follow-up prompt, manual project/source repair, dependency/permission workaround after the first invocation, or manual retry. Normal initial invocation and predeclared dependency provisioning are not interventions. Record each later assistance session using:

```sh
npm run eval:agent -- --host codex --case cli --resume /absolute/path/to/.lane-data/agent-eval/RUN --intervention "Describe the manual retry, edits and assistance" --audit-interventions
```

A continuation reuses the project, starts another noninteractive host invocation with the recorded assistance, and verifies the frozen toolkit has not changed; it does not automatically restore a vendor chat session. Never hide edits behind a fresh run. Each `--intervention` adds one timestamped assistance session before the next invocation. Describe all edits/actions in that session. `--audit-interventions` is the operator's declaration that all manual assistance was logged for that invocation; the total is only numeric if every invocation carries that declaration. Otherwise `humanInterventions` is null (unknown), while `recordedHumanInterventions` still counts explicit entries. The runner cannot detect unlogged human activity or prove the declaration independently. Raw logs and artifact hashes make the declared record reviewable.

Trial reports are `.lane-data/agent-eval/<run>/report.json` and `report.md`. Template automation and real CLI trials remain separate report modes; never count the 15 copied-starter runs as 15 successful Agent trials. Claude/Gemini command compatibility follows their official [Claude CLI reference](https://code.claude.com/docs/en/cli-reference) and [Gemini headless reference](https://geminicli.com/docs/cli/headless/); the local `codex exec --help` was checked during implementation. Cross-host completion must be established by actual trial reports.
