# rune-psych-linguistic-engine

> Rune L2 Skill | development


# psych-linguistic-engine

## Platform Constraints

- SHOULD: Monitor your context usage. If working on a long task, summarize progress before context fills up.
- MUST: Before summarizing/compacting context, save important decisions and progress to project files.
- SHOULD: Before ending, save architectural decisions and progress to .rune/ directory for future sessions.

## Purpose

The "Empathy Calibrator". Psych-linguistic-engine analyzes the psychological state of the intended audience and selects the most effective linguistic patterns to reach them. It bridges the gap between what the Persona wants to say and what the Audience is ready to hear. It uses NLP techniques like "Pacing & Leading" to build authority and trust.

## Triggers

- Called by `writing-architect` during strategy alignment.
- Automatic: When a target audience is specified in the content brief.

## Workflow

### Step 1: Cognitive Segmentation

Identify the audience's current emotional/mental state:
- **State A: Skeptical/Hostile** (Needs evidence-first, low-hype).
- **State B: Burned Out/Exhausted** (Needs empathy matching, low complexity).
- **State C: Ambitious/Hustling** (Needs high-energy, direct, punchy).
- **State D: Confused/Seeking** (Needs The Bridge mechanism, simple metaphors).

### Step 2: Linguistic Matching

Select the "Tone Frequency":
- **Authority Pacing:** Use declaratives and strong verbs to signal expertise.
- **Empathy Matching:** Mirror the audience's common vocabulary and pain points to build rapport.
- **Cognitive Ease:** Adjust sentence complexity based on the audience's available "attention budget".

### Step 3: Trigger Word Selection

- Identify "Power Words" that resonate with the segment (e.g., for developers: "deterministic", "frictionless", "proven").
- Identify "Repellant Words" to avoid.

### Step 4: NLP Strategy Hand-off

Deliver a "Linguistic Brief" to `master-writer` detailing:
- Target emotion to evoke.
- Suggested vocabulary density.
- Sentence rhythm (Smooth vs. Aggressive).

## Constraints

1. MUST NOT use manipulative or dark patterns — focus on resonance, not deception.
2. MUST explicitly state the detected "Audience State" before proposing a strategy.
3. MUST provide a rationale based on a specific psychological principle (e.g., Social Proof, Scarcity, Reciprocity).
4. MUST log every skill transition publicly using the format: `[Routing] -> [Skill Name]: [Purpose]` before invoking another skill.

## Done When

- A Linguistic Brief is delivered.
- The tone strategy is aligned with the `project-strategy.md`.

## Cost Profile

~1500-3000 tokens. Sonnet handles the nuances of NLP and psychology perfectly.

---
> **Rune Skill Mesh** — 49 skills, 170+ connections
> Source: https://github.com/rune-kit/rune
> Full experience with subagents, hooks, adaptive routing → use Rune on Claude Code.