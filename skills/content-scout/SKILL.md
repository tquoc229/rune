---
name: content-scout
description: Insight Hunter. Gathers raw material from the codebase, internet, and market trends. Converts technical features into human benefits.
metadata:
  author: runedev
  version: "1.0.0"
  layer: L2
  model: haiku
  group: creation
  tools: "Read, Glob, Grep, WebSearch, WebFetch"
---

# content-scout

## Purpose

The "Context Bridge". Content-scout ensures that the Agent is never writing in a vacuum. It connects the content creation process to the REAL facts of the project and the world. It extracts technical details from the code and looks for external proof (market data, trend signals) to ground the article in evidence.

## Triggers

- Called by `marketing-orchestrator` during the initial research phase.
- `/rune content-scout` — Manual gathering of project facts for content.

## Workflow

### Step 1: Internal Extraction (The Source)

1. Invoke `rune:scout` to scan the codebase for the target feature or topic.
2. Extract:
   - What the feature actually does (Functionality).
   - How it solves a problem (Technical Benefit).
   - Any comments or commit messages explaining the "Why".

### Step 2: External Validation (The Evidence)

1. Call `rune:research` or `rune:trend-scout` to find:
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

## Done When

- A list of 3-5 high-impact "Insight Nuggets" is delivered to the writer.
- Technical features are successfully mapped to human benefits.

## Cost Profile

~1000-2000 tokens. Haiku is perfect for this high-speed data gathering.
