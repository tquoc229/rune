---
name: authentic-human-filter
description: The "AI-De-Bot" layer. Removes typical AI speech patterns and injects sensory anchoring, structural burstiness, and vulnerability. Ensures the content passes the "Human Smell Test".
metadata:
  author: runedev
  version: "1.0.0"
  layer: L2
  model: sonnet
  group: quality
  tools: "Read, Edit"
---

# authentic-human-filter

## Purpose

The "Truth Filter". Authentic-human-filter is the final gate against generic, repetitive, and soulless AI writing. It identifies and removes high-probability word sequences that signal "machine output" and replaces them with low-probability, vivid, and human-centric details. It introduces "Burstiness" (rhythm variation) and "Vulnerability" (admitting doubt or mistakes) to create a truly authentic voice.

## Triggers

- Called by `master-writer` during the drafting process.
- Auto-trigger: When a draft contains more than 3 AI cliches from the forbidden list.

## Workflow

### Step 1: Cliché Scrubbing

Scan for and remove the "AI Fingerprints":
- "In the digital age..."
- "A comprehensive solution..."
- "Breaking down boundaries..."
- "In today's fast-paced world..."
- Overuse of "Furthermore", "Additionally", "Moreover".

### Step 2: Sensory Anchoring (Show, Don't Tell)

Replace abstract adjectives with concrete sensory details:
- *Before:* "The service was very professional."
- *After:* "The waiter adjusted his white gloves before pouring the wine without a single drop spilling."

### Step 3: Burstiness Injection

Modify the sentence structure to break the "Robotic Rhythm":
- Mix short, punchy sentences with long, descriptive ones.
- Use intentional fragments for emphasis. (e.g., "Silence. Total silence.")

### Step 4: The Vulnerability Pass

Inject human flaws or uncertainty:
- Add a moment of doubt: "I wasn't sure if this would work at first."
- Add a personal admission: "I've made this mistake myself a dozen times."

## Constraints

1. MUST NOT reduce the clarity of the message while humanizing it.
2. MUST use low-probability word choices (Perplexity) to bypass AI detectors.
3. MUST ensure the "Vulnerability" aligns with the character's `persona-profile`.

## Done When

- The text is free of all forbidden clichés.
- Sentence length variation (Burstiness) is statistically high.
- The content sounds like a specific human, not a generic model.

## Cost Profile

~1000-2000 tokens. Sonnet is the best model for linguistic refinement.
