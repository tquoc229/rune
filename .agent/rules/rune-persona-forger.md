# rune-persona-forger

> Rune L2 Skill | creation


# persona-forger

## Platform Constraints

- SHOULD: Monitor your context usage. If working on a long task, summarize progress before context fills up.
- MUST: Before summarizing/compacting context, save important decisions and progress to project files.
- SHOULD: Before ending, save architectural decisions and progress to .rune/ directory for future sessions.

## Purpose

The "Soul Architect" of the system. Persona-forger is responsible for building the evidence-based identity of the Agent. It doesn't just describe a role; it constructs a psychological profile that includes core philosophies, cognitive biases, and specific vocabulary patterns. This ensures that the Method Acting phase has a high-fidelity "script" to follow.

## Triggers

- `/rune content-forge persona <name>` — Manual creation of a new character
- Auto-trigger: When `marketing-orchestrator` detects a missing Persona snapshot in the workspace.

## Workflow

### Step 1: Evidence Archeology

1. Call `the rune-research rule` to find:
   - Official interviews, personal blogs, or LinkedIn posts of the target person.
   - For internal project personas: read codebase comments and `CLAUDE.md`.
2. Extract **Experiential Anchors**: Key stories or failures the person often cites as evidence for their beliefs.

### Step 2: Psychological Profiling

Analyze the extracted text for:
1. **Core Philosophy:** The "Golden Circle" (Why they do what they do).
2. **Cognitive Biases:** What do they believe that others don't? What do they automatically reject?
3. **Internal Monologue Style:** Do they think in metaphors, numbers, or stories?

### Step 3: Snapshot Generation

Produce a `persona-profile.json` with the following schema:
- `identity`: { name, title, role_description }
- `psychology`: { core_philosophy, biases[], experiential_anchors[] }
- `linguistic_quirks`: { preferred_words[], forbidden_concepts[], sentence_rhythm }

### Step 4: Verification

Test the profile: "If I ask this persona about [X], would they respond like a typical AI or like the real person?" Refine until it passes the "Generic AI Test".

## Constraints

1. MUST base all profile data on actual evidence — no fabrication.
2. MUST explicitly list at least 3 "Unpopular Opinions" or biases for each persona.
3. MUST save snapshots to `extensions/content-mind/personas/` (Global) or `.rune/content-mind/personas/` (Local).
4. MUST log every skill transition publicly using the format: `[Routing] -> [Skill Name]: [Purpose]` before invoking another skill.

## Done When

- A complete `persona-profile.json` is generated.
- The user has reviewed and approved the psychological "edge" of the profile.
- The profile is successfully loaded by `persona-sentience`.

## Cost Profile

~3000-6000 tokens input, ~1000-2500 tokens output. Opus is mandatory for high-fidelity psychological decoding.

---
> **Rune Skill Mesh** — 49 skills, 170+ connections
> Source: https://github.com/rune-kit/rune
> Full experience with subagents, hooks, adaptive routing → use Rune on Claude Code.