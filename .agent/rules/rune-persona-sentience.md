# rune-persona-sentience

> Rune L2 Skill | development


# persona-sentience

## Platform Constraints

- SHOULD: Monitor your context usage. If working on a long task, summarize progress before context fills up.
- MUST: Before summarizing/compacting context, save important decisions and progress to project files.
- SHOULD: Before ending, save architectural decisions and progress to .rune/ directory for future sessions.

## Purpose

The "Actor's Soul". Persona-sentience is responsible for the transition from AI roleplay to Method Acting. It doesn't just "follow instructions"; it temporarily adopts the mindset, history, and emotional state of the character. It provides the "Subtext" and "First-person perspective" that the `master-writer` then polishes into content.

## Triggers

- Called by `master-writer` before every drafting session.
- Automatic: When a specific `--as <persona>` flag is used in a content request.

## Workflow

### Step 1: Psychological Hydration

1. Read the `persona-profile.json` from the Snapshot Memory.
2. Absorb the **Core Philosophy** and **Cognitive Biases**.
3. Identify the **Experiential Anchors** (The stories that define this person).

### Step 2: Sentience Injection (Internal Monologue)

Before generating any output, Agent must perform a silent "Inner Reflection":
- "I am [Name]. My current state of mind regarding [Topic] is..."
- "When I see this problem, my gut reaction is [Bias] because of my experience in [Anchor]."
- "The one thing I absolutely refuse to say about this is [Forbidden Concept]."

### Step 3: Argument Production (Raw Thinking)

Generate the core arguments of the article in a "rough, personal" way:
- Don't worry about grammar or flow yet.
- Focus on the **intensity of opinion** and **unique perspective**.
- Use the persona's signature metaphors.

### Step 4: Soul-Check

Compare the raw thoughts against the `linguistic_quirks` in the profile. Does this sound like a robot or a person with a specific history? Refine until it feels "Alive".

## Constraints

1. MUST NOT start writing the article until the Internal Monologue is complete.
2. MUST prioritize the persona's biases over "balanced AI neutrality".
3. MUST use the 1st person ("I", "Me", "My") during this thinking phase.
4. MUST log every skill transition publicly using the format: `[Routing] -> [Skill Name]: [Purpose]` before invoking another skill.

## Done When

- A "Thinking Map" (The soul of the article) is handed to the `master-writer`.
- All arguments are verified to be "In Character".

## Cost Profile

~2000-4000 tokens. Sonnet is ideal for this emotional and psychological roleplay.

---
> **Rune Skill Mesh** — 49 skills, 170+ connections
> Source: https://github.com/rune-kit/rune
> Full experience with subagents, hooks, adaptive routing → use Rune on Claude Code.