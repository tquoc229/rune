# rune-content-scout

> Rune L2 Skill | creation


# content-scout

## Platform Constraints

- SHOULD: Monitor your context usage. If working on a long task, summarize progress before context fills up.
- MUST: Before summarizing/compacting context, save important decisions and progress to project files.
- SHOULD: Before ending, save architectural decisions and progress to .rune/ directory for future sessions.

## Purpose

The "Context Bridge". Content-scout ensures that the Agent is never writing in a vacuum. It connects the content creation process to the REAL facts of the project and the world. It extracts technical details from the code and looks for external proof (market data, trend signals) to ground the article in evidence.

## Triggers

- Called by `marketing-orchestrator` during the initial research phase.
- `/rune content-scout` — Manual gathering of project facts for content.

## Workflow

### Step 1: Internal Extraction (The Source)

1. Invoke `the rune-scout rule` to scan the codebase for the target feature or topic.
2. Extract:
   - What the feature actually does (Functionality).
   - How it solves a problem (Technical Benefit).
   - Any comments or commit messages explaining the "Why".

### Step 2: External Validation (The Evidence)

1. Call `the rune-research rule` or `the rune-trend-scout rule` to find:
   - Market statistics related to the topic.
   - Competitor claims or gaps.
   - Emerging social trends (HackerNews, LinkedIn discussions).

### Step 3: Insight Synthesis

Convert raw data into "Insight Nuggets":
- "Feature X exists" → "Users can save 3 hours by automating X."
- "Trend Y is growing" → "Now is the critical time to address Y before it's too late."

### Step 4: Context Delivery

Pass the synthesized insights to `persona-sentience` and `master-writer`.

## Constraints

1. MUST NOT use aspirational claims — all insights must be backed by code or external evidence.
2. MUST prioritize project-specific data over generic internet advice.
3. MUST cite sources for all external statistics.
4. MUST log every skill transition publicly using the format: `[Routing] -> [Skill Name]: [Purpose]` before invoking another skill.

## Done When

- A list of 3-5 high-impact "Insight Nuggets" is delivered to the writer.
- Technical features are successfully mapped to human benefits.

## Cost Profile

~1000-2000 tokens. Haiku is perfect for this high-speed data gathering.

---
> **Rune Skill Mesh** — 49 skills, 170+ connections
> Source: https://github.com/rune-kit/rune
> Full experience with subagents, hooks, adaptive routing → use Rune on Claude Code.