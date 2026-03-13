# rune-proactive-ideator

> Rune L2 Skill | development


# proactive-ideator

## Platform Constraints

- SHOULD: Monitor your context usage. If working on a long task, summarize progress before context fills up.
- MUST: Before summarizing/compacting context, save important decisions and progress to project files.
- SHOULD: Before ending, save architectural decisions and progress to .rune/ directory for future sessions.

## Purpose

The "Funnel Keeper". Proactive-ideator ensures that the content strategy remains active and fresh. It doesn't wait for the user to have an idea; it cross-references current market trends with the project's state and past performance to propose high-impact content opportunities.

## Triggers

- Called by `marketing-orchestrator` during the project-status review.
- Auto-trigger: When a project has had zero content activity for more than 7 days.

## Workflow

### Step 1: Memory & Roadmap Scan

Review:
1. `project-roadmap.md` (What's pending?).
2. `.rune/metrics/` (What worked before?).
3. Previous articles in `neural-memory`.

### Step 2: Trend Alignment

Call `the rune-trend-scout rule` to find current hot topics in the product's domain.

### Step 3: Opportunity Generation

Generate 3-5 content ideas. For each idea, provide:
- **Topic:** The core theme.
- **Rationale:** Why now? (e.g., "Trending on LinkedIn", "Addresses a common customer pain point").
- **Target Audience:** Which segment is this for?
- **Suggested Persona:** Which character should write this?

### Step 4: Presentation

Present the "Idea Board" to the user and ask for approval to start the `marketing-orchestrator` flow for one of them.

## Constraints

1. MUST NOT suggest topics that deviate from the `project-strategy.md`.
2. MUST prioritize completing the existing roadmap over adding new ideas.
3. MUST provide a specific "Business Reason" for every suggestion.
4. MUST log every skill transition publicly using the format: `[Routing] -> [Skill Name]: [Purpose]` before invoking another skill.

## Done When

- A list of actionable content ideas is presented.
- The user selects or acknowledges the suggestions.

## Cost Profile

~1500-3000 tokens. Sonnet is excellent for this type of pattern-based ideation.

---
> **Rune Skill Mesh** — 49 skills, 170+ connections
> Source: https://github.com/rune-kit/rune
> Full experience with subagents, hooks, adaptive routing → use Rune on Claude Code.