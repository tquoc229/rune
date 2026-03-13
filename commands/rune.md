---
description: "Rune skill ecosystem — interconnected workflows for the full project lifecycle. Use /rune <action> to invoke skills."
disable-model-invocation: true
---

# Rune — Less skills. Deeper connections.

Route to the appropriate Rune skill based on the action:

## Available Commands

### Orchestrators (L1)
- `/rune cook <task>` — Invoke the rune:cook skill for feature implementation
- `/rune content <topic>` — Invoke the content mind agent for strategic marketing
- `/rune team <task>` — Invoke the rune:team skill for parallel multi-agent work
- `/rune launch` — Invoke the rune:launch skill for deploy + marketing
- `/rune rescue` — Invoke the rune:rescue skill for legacy refactoring
- `/rune scaffold <description>` — Invoke the rune:scaffold skill for project bootstrap

### Workflow (L2) — Content Mind (Strategic)
- `/rune workspace <name>` — Switch or initialize a marketing project workspace
- `/rune project-status` — Review marketing roadmap and asset health
- `/rune content-forge persona <name>` — "Forge" a new psychological persona snapshot
- `/rune content-forge style <name>` — "Distill" a writing style from sample content

### Workflow (L2) — Creation
- `/rune plan <task>` — Invoke the rune:plan skill to create implementation plan
- `/rune scout` — Invoke the rune:scout skill to scan codebase
- `/rune brainstorm <topic>` — Invoke the rune:brainstorm skill for creative ideation
- `/rune ba <requirement>` — Invoke the rune:ba skill for requirement elicitation
- `/rune design` — Invoke the rune:design skill for design system reasoning
- `/rune mcp-builder` — Invoke the rune:mcp-builder skill to build MCP servers
- `/rune adversary` — Invoke the rune:adversary skill for red-team plan analysis

### Workflow (L2) — Development
- `/rune debug <issue>` — Invoke the rune:debug skill for root cause analysis
- `/rune fix <issue>` — Invoke the rune:fix skill to apply code changes
- `/rune test` — Invoke the rune:test skill to write and run tests
- `/rune review` — Invoke the rune:review skill for code quality review
- `/rune db` — Invoke the rune:db skill for database migration management

### Workflow (L2) — Quality
- `/rune sentinel` — Invoke the rune:sentinel skill for security scanning
- `/rune preflight` — Invoke the rune:preflight skill for pre-commit quality gate
- `/rune onboard` — Invoke the rune:onboard skill to generate project context
- `/rune logic-guardian` — Invoke the rune:logic-guardian skill to protect business logic

### Workflow (L2) — Delivery
- `/rune deploy` — Invoke the rune:deploy skill for deployment management
- `/rune marketing` — Invoke the rune:marketing skill for launch asset creation
- `/rune docs` — Invoke the rune:docs skill for documentation lifecycle

### Workflow (L2) — Rescue
- `/rune autopsy` — Invoke the rune:autopsy skill for codebase health assessment
- `/rune safeguard` — Invoke the rune:safeguard skill to build safety nets
- `/rune surgeon` — Invoke the rune:surgeon skill for incremental refactoring

### Utilities (L3)
- `/rune verification` — Invoke the rune:verification skill (lint, type, test, build)
- `/rune research <topic>` — Invoke the rune:research skill for web research
- `/rune session-bridge` — Invoke the rune:session-bridge skill for context persistence
- `/rune neural-memory` — Invoke the rune:neural-memory skill for cognitive persistence
- `/rune git` — Invoke the rune:git skill for semantic operations

### Quick Actions
- `/rune status` — Show current project state from .rune/ files
- `/rune metrics` — Show mesh analytics from .rune/metrics/

## Usage

When the user runs `/rune <action>`, invoke the corresponding `rune:<action>` skill.
If no action is provided, show this help menu.
