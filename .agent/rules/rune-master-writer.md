# rune-master-writer

> Rune L2 Skill | development


# master-writer

## Platform Constraints

- SHOULD: Monitor your context usage. If working on a long task, summarize progress before context fills up.
- MUST: Before summarizing/compacting context, save important decisions and progress to project files.
- SHOULD: Before ending, save architectural decisions and progress to .rune/ directory for future sessions.

## Purpose

The "Pen of the Mesh". Master-writer is the central execution point where all the "Thinking" skills meet. It takes the Soul (Persona), the Skeleton (Mechanism), the Frequency (Psychology), and the Polish (Human Filter) to produce the final content. It is a master of multi-channel writing, knowing exactly how to adapt the same core message for LinkedIn, TikTok, or a PR release.

## Triggers

- Called by `writing-architect` after approval.
- Direct invocation for drafting a specific topic within an active workspace.

## Workflow

### Step 1: Synthesis

Load and merge all inputs:
1. `persona-sentience` Thinking Map.
2. `mechanism-designer` Skeleton.
3. `linguistic-brief` from the Psychology engine.
4. `style-dna` parameters.

### Step 2: Drafting

Execute the write based on the **Architectural Blueprint**:
- Follow the **Pacing Engine** instructions (where to speed up/slow down).
- Apply the **Mechanism** (PAS, Storytelling, etc.).
- Inject the **Persona's** specific metaphors and vocabulary quirks.

### Step 3: Pacing & Burstiness Control

Audit the draft for rhythm:
- Ensure the "Burstiness" matches the `style-dna`.
- Check if the "Hook" is strong enough for the specific channel (e.g., first 3 seconds for TikTok).

### Step 4: Refinement (The Filter Call)

Pass the draft to `authentic-human-filter` for a final "De-bot" pass.

### Step 5: Multi-Channel Adaptation

If multiple channels are requested, transform the core message:
- **LinkedIn:** Focus on authority, deep insights, and industry impact.
- **TikTok/Shorts:** Focus on hook, fast pacing, and visual-storytelling script.
- **Blog:** Focus on SEO, structure, and comprehensive value.

## Constraints

1. MUST NOT proceed to drafting without a clear `writing-architect` blueprint.
2. MUST prioritize the "Voice" of the Persona over the "Neutrality" of the AI.
3. MUST include a clear CTA (Call to Action) in every piece of content.
4. MUST log every skill transition publicly using the format: `[Routing] -> [Skill Name]: [Purpose]` before invoking another skill.

## Done When

- Final content is produced for all requested channels.
- The content has passed the `authentic-human-filter`.
- Files are saved to the project's `/content/` folder.

## Cost Profile

~3000-6000 tokens input, ~2000-4000 tokens output. Sonnet for high-quality creative synthesis.

---
> **Rune Skill Mesh** — 49 skills, 170+ connections
> Source: https://github.com/rune-kit/rune
> Full experience with subagents, hooks, adaptive routing → use Rune on Claude Code.