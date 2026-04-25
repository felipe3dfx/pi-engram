# pi-engram

Standalone shareable [Pi](https://github.com/badlogic/pi-mono) package for Engram persistent memory integration.

![pi-engram logo](docs/pi-engram-logo.jpg)

It ships a native Pi extension plus a small Engram memory-protocol skill. The recommended install path is npm, with GitHub installs available for pinned or unreleased versions.

> Security note: Pi extensions run with your full system permissions. Review extension source before installing packages from any repository.

## What it does

- registers native Pi memory tools for Engram
- adds an Engram memory-protocol skill for Pi agents
- tracks Pi session lifecycle events in Engram
- captures user prompts through Pi's `input` lifecycle event
- attempts to auto-start the Engram backend with `engram serve` when needed
- keeps startup conservative: it can notify when project memory exists, but it does not auto-inject full memory context
- helps preserve continuity through compaction recovery instructions and summary persistence
- redacts `<private>...</private>` blocks before sending data to Engram

## Install

### From npm

```bash
pi install npm:pi-engram
```

Then reload Pi:

```text
/reload
```

### From git

Install the latest `main` from GitHub:

```bash
pi install git:github.com/felipe3dfx/pi-engram
```

Install a pinned release tag:

```bash
pi install git:github.com/felipe3dfx/pi-engram@v0.2.0
```

### From Engram TUI/setup flow

Engram's main repository has an active PR for installing the Pi integration through the Engram setup/TUI flow. If you are testing that PR or using an Engram build that includes it, prefer the Engram-managed setup path for the bundled/offline installation experience.

This repository remains the standalone npm/GitHub package for users who want to install the Pi package directly.

## Uninstall

List installed packages:

```bash
pi list
```

Remove the package using the same source shown by `pi list`, for example:

```bash
pi remove npm:pi-engram
```

or for a GitHub install:

```bash
pi remove git:github.com/felipe3dfx/pi-engram
```

Then reload or restart Pi.

## Usage

After installation and `/reload`, Pi agents get native Engram tools and the Engram skill.

Typical prompts:

```text
Remember this architecture decision with Engram.
Search Engram for previous work on this project.
Before we stop, save a session summary.
After compaction, recover context from Engram.
```

The extension also records lifecycle and prompt metadata automatically where supported by Pi events.

## Commands and tools

### Slash command

```text
/engram-recovery
```

Shows compaction recovery instructions when automatic compaction summary extraction is unavailable or when you need manual recovery guidance.

### Native tools

| Tool | Purpose |
|------|---------|
| `mem_context` | Fetch compact project continuity context from Engram. |
| `mem_search` | Search Engram observations with text and optional filters. |
| `mem_save` | Save a durable observation. |
| `mem_session_summary` | Persist an end-of-session or post-compaction summary. |
| `mem_get_observation` | Load one full observation by ID. |
| `mem_save_prompt` | Persist a prompt explicitly when needed. |

## Behavior

### Backend auto-start

When a memory tool or lifecycle hook needs Engram, the extension checks the local backend health endpoint. If it is not running, it attempts to start:

```bash
engram serve
```

The default binary name is `engram`. Override it with:

```bash
ENGRAM_BIN=/path/to/engram pi
```

The default port is `7437`. Override it with:

```bash
ENGRAM_PORT=7437 pi
```

### Startup policy

At session start, the extension may check whether recent project memory exists. If it finds relevant memory and Pi has UI available, it notifies you.

It does **not** automatically load or inject the full memory context. Ask the agent to call `mem_context` when you want continuity restored.

### Prompt and session capture

The extension uses Pi lifecycle events to:

- register session starts
- save session shutdown metadata
- capture user prompts from the `input` event
- skip extension-generated input to avoid double capture

### Compaction recovery

The extension supports compaction resilience in two ways:

1. `session_before_compact` tries to inject a `FIRST ACTION REQUIRED` instruction into compaction instructions when Pi exposes a supported event shape.
2. `session_compact` tries to persist the compacted summary to Engram.

If summary extraction or persistence is unavailable, run:

```text
/engram-recovery
```

Then ask the agent to call `mem_context` manually.

### Privacy redaction

Any text wrapped in `<private>...</private>` is replaced with `[REDACTED]` before leaving the extension.

Example:

```text
public note <private>secret</private>
```

becomes:

```text
public note [REDACTED]
```

## Development

The extension entrypoint is:

```text
extensions/engram.ts
```

The included skill is:

```text
skills/engram/SKILL.md
```

Run the full release guard locally:

```bash
npm run check
```

This runs TypeScript checks, the Vitest suite, the deterministic runtime harness, and an npm pack dry-run.

Run individual checks when iterating:

```bash
npm run typecheck
npm test
npm run test:harness
npm run pack:dry-run
```

Equivalent direct harness command:

```bash
node test/runtime-harness.mjs extensions/engram.ts
```

The package also has a `prepublishOnly` guard, so manual `npm publish` runs the publish checks before uploading.

## Relationship to `engram setup pi`

This repository is the standalone npm/GitHub package for sharing, inspecting, and contributing to the Pi integration.

The Engram monorepo has an active PR for a first-party Pi setup flow via Engram's setup/TUI experience, including the equivalent of:

```bash
engram setup pi
```

That flow materializes and installs a local package from the Engram binary for an embedded/offline experience. This repository does not include that installer wiring; it contains only the standalone Pi package assets used for npm/GitHub distribution.

## Troubleshooting

### Memory tools cannot auto-start Engram

Verify `engram` resolves correctly in the environment used to launch Pi:

```bash
command -v engram
engram --version
```

If needed:

```bash
ENGRAM_BIN=/absolute/path/to/engram pi
```

### Extension or skill does not appear

Run `/reload` in Pi after installation, or restart Pi.

### Duplicate or stale Pi packages

If Pi reports resource conflicts from stale installs, inspect installed packages:

```bash
pi list
```

Remove stale duplicates with:

```bash
pi remove <package-source>
```

Then reinstall this package.

## License

MIT
