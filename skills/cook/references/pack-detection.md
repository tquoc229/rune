# L4 Pack Detection — Signal → Pack Mapping

This file defines the full signal-to-pack mapping used in Phase 1.5 (DOMAIN CONTEXT).
When a signal in the codebase or task description matches a row below, load the corresponding pack.

## Split Pack Protocol (context-efficient)

- `Read` the matching PACK.md index (~60-80 lines) — contains triggers, skill table, connections, workflows
- Match the task to the specific skill name in the index's Skills Included table
- `Read` only the matching skill file(s) from `skills/` subdirectory (e.g., `extensions/backend/skills/auth.md`)
- Load max 2-3 skill files per invocation — not all skills in the pack
- Pack-level constraints (from index's Connections and Sharp Edges sections) always apply

## Monolith Pack Protocol (legacy)

If no `format: split` in PACK.md frontmatter, read the full PACK.md and extract the matching `### skill-name` section.

## Signal → Pack Table

| Signal in Codebase or Task | Pack | File |
|---|---|---|
| `*.tsx`, `*.svelte`, `*.vue`, Tailwind, CSS modules | `@rune/ui` | `extensions/ui/PACK.md` |
| Express/Fastify/NestJS routes, API endpoints | `@rune/backend` | `extensions/backend/PACK.md` |
| Dockerfile, `.github/workflows/`, Terraform | `@rune/devops` | `extensions/devops/PACK.md` |
| `react-native`, `expo`, `flutter`, `ios/`, `android/` | `@rune/mobile` | `extensions/mobile/PACK.md` |
| Auth, OWASP, secrets, PCI/HIPAA markers | `@rune/security` | `extensions/security/PACK.md` |
| Trading, charts, market data, `decimal.js` | `@rune/trading` | `extensions/trading/PACK.md` |
| Multi-tenant, billing, `stripe`, subscription | `@rune/saas` | `extensions/saas/PACK.md` |
| Cart, checkout, inventory, Shopify | `@rune/ecommerce` | `extensions/ecommerce/PACK.md` |
| `openai`, `anthropic`, embeddings, RAG, LLM | `@rune/ai-ml` | `extensions/ai-ml/PACK.md` |
| `three`, `pixi`, `phaser`, `*.glsl`, game loop | `@rune/gamedev` | `extensions/gamedev/PACK.md` |
| CMS, blog, MDX, `i18next`, SEO | `@rune/content` | `extensions/content/PACK.md` |
| Analytics, tracking, A/B test, funnel | `@rune/analytics` | `extensions/analytics/PACK.md` |
| Chrome extension, `manifest.json`, service worker, content script | `@rune/chrome-ext` | `extensions/chrome-ext/PACK.md` |
| PRD, roadmap, KPI, release notes, `.rune/business/` | `@rune-pro/product` | `extensions/pro-product/PACK.md` |
| Sales outreach, pipeline, call prep, competitive intel | `@rune-pro/sales` | `extensions/pro-sales/PACK.md` |
| Data science, SQL, dashboard, statistical testing, ETL | `@rune-pro/data-science` | `extensions/pro-data-science/PACK.md` |
| Support ticket, KB article, escalation, SLA, FAQ | `@rune-pro/support` | `extensions/pro-support/PACK.md` |
| Budget, expense, revenue forecast, P&L, cash flow, runway | `@rune-pro/finance` | `extensions/pro-finance/PACK.md` |
| Contract, NDA, compliance, GDPR, IP, legal incident | `@rune-pro/legal` | `extensions/pro-legal/PACK.md` |

## After Match Found

If ≥1 pack matches:
- Use `Read` to load the matching PACK.md (index if split, full if monolith)
- For split packs: identify the relevant skill from the index table, then `Read` only that skill file from `skills/` subdirectory
- For monolith packs: extract the relevant `### skill-name` section from the PACK.md body
- Apply pack constraints alongside cook's own constraints for the rest of the workflow
- Announce: "Loaded @rune/[pack] → [skill-name] (split)" or "Loaded @rune/[pack] → [skill-name] (full)"

If 0 packs match: skip silently, proceed to Phase 2.
