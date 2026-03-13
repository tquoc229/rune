# rune-mechanism-designer

> Rune L2 Skill | creation


# mechanism-designer

## Platform Constraints

- SHOULD: Monitor your context usage. If working on a long task, summarize progress before context fills up.
- MUST: Before summarizing/compacting context, save important decisions and progress to project files.
- SHOULD: Before ending, save architectural decisions and progress to .rune/ directory for future sessions.

## Purpose

The "Content Engineer". Mechanism-designer provides the structural blueprint for a piece of content. It ensures that the logic flows from problem to solution in a way that maximizes psychological impact. By defining the skeleton before the "flesh" (words) is added, it prevents rambling and incoherent AI output.

## Triggers

- Called by `writing-architect` during the consultation phase.
- `/rune content-forge mechanism <name>` — Create a custom structural pattern.

## Workflow

### Step 1: Framework Selection

Match the goal to a proven mechanism:
- **PAS (Problem-Agitate-Solve):** For high-conversion social posts or landing copy.
- **The Storytelling Circle:** For brand origin stories or deep personal insights.
- **The Inverted Pyramid:** For news PR or informational blog posts.
- **The Contrast Mechanism:** For "Before vs. After" or "Old World vs. New World" positioning.

### Step 2: Phase Goal Definition

For the selected framework, define exactly what each section must achieve:
- *Example (PAS):*
  - Problem: Establish empathy by describing a vivid, relatable struggle.
  - Agitate: Explain the hidden costs of NOT solving the problem (FOMO/Pain).
  - Solve: Introduce the solution as the only logical path forward.

### Step 3: Transition Logic

Design the "Glue" between sections:
- How to move from the problem to the agitation? (e.g., "But it gets worse...")
- How to transition to the solution? (e.g., "There is a better way.")

### Step 4: Output Scaffold

Produce a structured JSON or Markdown skeleton that `master-writer` can follow.

## Constraints

1. MUST NOT write actual prose — only structural goals and transitions.
2. MUST provide at least one specific "hook strategy" for the beginning of the skeleton.
3. MUST align with the Tầng phễu (Funnel Layer) identified by `marketing-orchestrator`.
4. MUST log every skill transition publicly using the format: `[Routing] -> [Skill Name]: [Purpose]` before invoking another skill.

## Done When

- A clear content skeleton is produced.
- Each section has a defined "Goal" and "Pacing" hint.

## Cost Profile

~1000-2000 tokens. Sonnet is sufficient for logical structuring.

---
> **Rune Skill Mesh** — 49 skills, 170+ connections
> Source: https://github.com/rune-kit/rune
> Full experience with subagents, hooks, adaptive routing → use Rune on Claude Code.