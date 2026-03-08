---
name: problem-solver
description: Structured reasoning frameworks for complex problems. Uses 5 Whys, Fishbone, First Principles, and other analytical methods.
metadata:
  author: runedev
  version: "0.2.0"
  layer: L3
  model: sonnet
  group: reasoning
---

# problem-solver

## Purpose

Structured reasoning utility for problems that resist straightforward analysis. Receives a problem statement, selects the appropriate analytical framework, applies it step-by-step with evidence, and returns ranked solutions. Stateless — no memory between calls.

## Calls (outbound)

None — pure L3 reasoning utility.

## Called By (inbound)

- `debug` (L2): complex bugs that resist standard debugging
- `brainstorm` (L2): structured frameworks for creative exploration

## Execution

### Input

```
problem: string         — clear statement of the problem to analyze
context: string         — (optional) relevant background, constraints, symptoms observed
goal: string            — (optional) desired outcome or success criteria
```

### Step 1 — Receive Problem Statement

Read the `problem` and `context` inputs. Restate the problem in one sentence to confirm understanding before applying any framework. If the problem statement is ambiguous, identify the most likely interpretation and state it explicitly.

### Step 2 — Select Framework

Choose the framework based on what is unknown about the problem:

| Situation | Framework |
|-----------|-----------|
| Root cause is unknown — symptoms are clear | **5 Whys** |
| Multiple potential causes from different domains | **Fishbone (Ishikawa)** |
| Standard assumptions need challenging | **First Principles** |
| Creative options needed for a known problem | **SCAMPER** |
| Must prioritize among known solutions | **Impact Matrix** |
| Conventional approaches exhausted, need breakthrough | **Collision-Zone Thinking** |
| Feeling forced into "the only way" | **Inversion Exercise** |
| Same pattern appearing in 3+ places | **Meta-Pattern Recognition** |
| Complexity spiraling, growing special cases | **Simplification Cascades** |
| Unsure if approach survives production scale | **Scale Game** |

State which framework was selected and why.

### Step 3 — Apply Framework

Execute the selected framework with discipline:

**5 Whys:**
- Why did [problem] occur? → [answer 1]
- Why did [answer 1] occur? → [answer 2]
- Why did [answer 2] occur? → [answer 3]
- Why did [answer 3] occur? → [answer 4]
- Why did [answer 4] occur? → [root cause]
- Stop at 5 or when root cause cannot be decomposed further

**Fishbone (Ishikawa):**
- Categorize potential causes into: People, Process, Technology, Environment
- Under each category, list contributing factors with evidence
- Identify which category has the highest concentration of causes

**First Principles:**
- List all current assumptions about the problem
- Challenge each assumption: "Is this actually true?"
- Strip to fundamental facts that cannot be disputed
- Rebuild solution from those fundamentals upward

**SCAMPER:**
- Substitute: what can be replaced?
- Combine: what can be merged?
- Adapt: what can be adjusted from another context?
- Modify/Magnify: what can be scaled or emphasized?
- Put to other use: what can serve a different purpose?
- Eliminate: what can be removed?
- Reverse/Rearrange: what can be flipped?

**Impact Matrix:**
- List all candidate solutions
- Score each on Impact (1-5) and Effort (1-5)
- Rank by Impact/Effort ratio descending

**Collision-Zone Thinking:**
- Pick two unrelated domains (e.g., services + electrical circuits)
- Force combination: "What if we treated [A] like [B]?"
- Explore emergent properties from the collision
- Test where the metaphor breaks → boundaries reveal design constraints
- Extract the transferable insight

**Inversion Exercise:**
- List core assumptions: what "must" be true?
- Invert each systematically: "What if the opposite were true?"
- Explore implications: what would we do differently?
- Find valid inversions: which actually work? (e.g., "add latency" → debouncing)
- Question every "there's only one way to do this"

**Meta-Pattern Recognition:**
- Spot the same shape appearing in 3+ different domains
- Extract abstract form independent of any domain (e.g., "bound resource consumption" = rate limiting = circuit breakers = token budgets)
- Identify variation points: what adapts per domain?
- Apply to current problem: where else does this pattern help?

**Simplification Cascades:**
- List all variations: what's implemented multiple ways?
- Find the essence: what's the same underneath?
- Extract unifying abstraction: "Everything is a special case of..."
- Test: do ALL cases fit cleanly?
- Measure cascade: how many things can we DELETE? (10x wins, not 10% improvements)

**Scale Game:**
- Pick dimension: volume, speed, users, duration, failure rate
- Test at 1000x smaller: what simplifies? What becomes unnecessary?
- Test at 1000x bigger: what breaks? Where are algorithmic limits?
- Note what survives both extremes → that's fundamentally sound
- Use insights to validate architecture before building

### Step 4 — Generate Solutions

From the framework output, derive 2-3 actionable solutions. For each solution:
- Describe what to do concretely
- Estimate impact: high / medium / low
- Estimate effort: high / medium / low
- State any preconditions or risks

Rank solutions by impact/effort ratio.

### Step 5 — Report

Return the full analysis in the output format below.

## Constraints

- Never skip the framework — the structure is the value of this skill
- Use Sonnet, not Haiku — reasoning depth matters here
- If problem is underspecified, state assumptions explicitly before proceeding
- Do not produce more than 3 recommended solutions — prioritize quality over quantity

## Output Format

```
## Analysis: [Problem Statement]
- **Framework**: [chosen framework and reason]
- **Confidence**: high | medium | low

### Reasoning Chain
1. [step with evidence or reasoning]
2. [step with evidence or reasoning]
3. [step with evidence or reasoning]
...

### Root Cause / Core Finding
[what the framework reveals as the fundamental issue or conclusion]

### Recommended Solutions (ranked)
1. **[Solution Name]** — Impact: high/medium/low | Effort: high/medium/low
   [concrete description of what to do]
2. **[Solution Name]** — Impact: high/medium/low | Effort: high/medium/low
   [concrete description of what to do]
3. **[Solution Name]** — Impact: high/medium/low | Effort: high/medium/low
   [concrete description of what to do]

### Next Action
[single most important immediate step]
```

## Sharp Edges

Known failure modes for this skill. Check these before declaring done.

| Failure Mode | Severity | Mitigation |
|---|---|---|
| Skipping the framework and jumping straight to solutions | CRITICAL | Constraint: the framework IS the value — solutions without structured analysis are guesses |
| Proceeding with underspecified problem without stating assumptions | HIGH | Step 1: restate problem in one sentence first — if ambiguous, state interpretation explicitly |
| Producing more than 3 recommended solutions | MEDIUM | Constraint: max 3 ranked solutions — prioritize quality and actionability over quantity |
| Framework mismatch (5 Whys for a creative problem) | MEDIUM | Use the selection table in Step 2 — match framework to "what is unknown" about the problem |
| Collision-Zone with weak metaphors (surface-level similarity) | MEDIUM | Test where metaphor BREAKS — boundaries reveal more than similarities |
| Inversion producing impractical results | LOW | Not all inversions work — test boundaries, find the context-dependent ones |
| Simplification forcing premature abstraction | MEDIUM | Abstraction must fit ALL cases cleanly — if one case is forced, the abstraction is wrong |

## Done When

- Problem restated in one sentence (understanding confirmed)
- Framework selected with explicit reason stated
- Framework applied step-by-step with evidence at each step
- 2-3 solutions ranked by impact/effort ratio
- Next Action identified (single most important immediate step)
- Analysis Report emitted in output format

## Cost Profile

~500-1500 tokens input, ~500-1000 tokens output. Sonnet for reasoning quality.
