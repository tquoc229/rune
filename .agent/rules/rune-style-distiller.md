# rune-style-distiller

> Rune L2 Skill | creation


# style-distiller

## Platform Constraints

- SHOULD: Monitor your context usage. If working on a long task, summarize progress before context fills up.
- MUST: Before summarizing/compacting context, save important decisions and progress to project files.
- SHOULD: Before ending, save architectural decisions and progress to .rune/ directory for future sessions.

## Purpose

The "Style Scientist". Style-distiller breaks down a piece of writing into its constituent technical parts. It doesn't just "copy" the writing; it creates a mathematical-like blueprint of the style (Burstiness, Pacing, Diction) so that the `master-writer` can replicate the "vibe" without copying the words.

## Triggers

- `/rune content-forge style <name> --sample <path>` — Manual style distillation
- Auto-trigger: When `marketing-orchestrator` recommends a style that hasn't been parameterized yet.

## Workflow

### Step 1: Statistical Analysis

Analyze 3-5 samples of the target style for:
1. **Burstiness:** The variation in sentence length. (Does it go short-short-long or uniform?)
2. **Perplexity:** The predictability of word choices. (Does it use high-probability clichés or low-probability vivid imagery?)
3. **Vocabulary DNA:** Ratio of abstract vs. concrete words. Density of industry-specific jargon.

### Step 2: Rhetorical Pattern Mapping

Identify the "Tools of Persuasion" used:
- Frequency of rhetorical questions.
- Use of "The Rule of Three".
- Types of metaphors (e.g., military, organic, technical).
- Point of view (1st person intimate vs. 3rd person objective).

### Step 3: Pacing Engine Calibration

Define the "Speed" of the writing:
- **High Energy:** Short sentences, active verbs, frequent paragraph breaks.
- **Deep Reflective:** Long, complex sentences, many commas, slow build-up.

### Step 4: Parameterization

Produce a `style-dna.json` containing:
- `metrics`: { burstiness_score, jargon_density, complexity_level }
- `rules`: { mandatory_patterns[], forbidden_cliches[] }
- `pacing`: { intro_rhythm, body_flow, conclusion_impact }

## Constraints

1. MUST NOT store original text — store only the abstracted parameters (Style DNA).
2. MUST define at least 5 "Forbidden Clichés" for every style distilled.
3. MUST provide a name for the style based on its "Vibe" (e.g., "The Architect", "The Whisperer").
4. MUST log every skill transition publicly using the format: `[Routing] -> [Skill Name]: [Purpose]` before invoking another skill.

## Done When

- `style-dna.json` is saved to the styles library.
- A "Style Manifesto" (brief summary) is presented to the user for confirmation.

## Cost Profile

~2000-4000 tokens input, ~500-1000 tokens output. Sonnet is excellent for linguistic pattern recognition.

---
> **Rune Skill Mesh** — 49 skills, 170+ connections
> Source: https://github.com/rune-kit/rune
> Full experience with subagents, hooks, adaptive routing → use Rune on Claude Code.