---
name: sentinel
description: Automated security gatekeeper. Blocks unsafe code before commit — secret scanning, OWASP top 10, dependency audit, permission checks. A GATE, not a suggestion.
metadata:
  author: runedev
  version: "0.6.0"
  layer: L2
  model: sonnet
  group: quality
  tools: "Read, Bash, Glob, Grep"
---

# sentinel

## Purpose

Automated security gatekeeper that blocks unsafe code BEFORE commit. Unlike `review` which suggests improvements, sentinel is a hard gate — it BLOCKS on critical findings. Runs secret scanning, OWASP top 10 pattern detection, dependency auditing, and destructive command checks. Escalates to opus for deep security audit when critical patterns detected.

<HARD-GATE>
If status is BLOCK, output the report and STOP. Do not hand off to commit. The calling skill (`cook`, `preflight`, `deploy`) must halt until the developer fixes all BLOCK findings and re-runs sentinel.
</HARD-GATE>

## Triggers

- Called automatically by `cook` before commit phase
- Called by `preflight` as security sub-check
- Called by `deploy` before deployment
- `/rune sentinel` — manual security scan
- Auto-trigger: when `.env`, auth files, or security-critical code is modified

## Calls (outbound)

- `scout` (L2): scan changed files to identify security-relevant code
- `verification` (L3): run security tools (npm audit, pip audit, cargo audit)
- `integrity-check` (L3): agentic security validation of .rune/ state files
- `sast` (L3): deep static analysis with Semgrep, Bandit, ESLint security rules

## Called By (inbound)

- `cook` (L1): auto-trigger before commit phase
- `review` (L2): when security-critical code detected
- `deploy` (L2): pre-deployment security check
- `preflight` (L2): security sub-check in quality gate
- `audit` (L2): Phase 2 full security audit
- `incident` (L2): security dimension check during incident response
- `review-intake` (L2): security scan on code submitted for structured review

## Severity Levels

```
BLOCK    — commit MUST NOT proceed (secrets found, critical CVE, SQL injection)
WARN     — commit can proceed but developer must acknowledge (medium CVE, missing validation)
INFO     — informational finding, no action required (best practice suggestion)
```

## Security Patterns (built-in)

```
# Secret patterns (regex)
AWS_KEY:        AKIA[0-9A-Z]{16}
GITHUB_TOKEN:   gh[ps]_[A-Za-z0-9_]{36,}
GENERIC_SECRET: (?i)(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']{8,}
HIGH_ENTROPY:   [A-Za-z0-9+/=]{40,}  (entropy > 4.5)

# OWASP patterns
SQL_INJECTION:  string concat/interpolation in SQL context
XSS:            innerHTML, dangerouslySetInnerHTML, document.write
CSRF:           form without CSRF token, missing SameSite cookie
```

## Executable Steps

### Step 1 — Secret Scan (Gitleaks-Enhanced)
<MUST-READ path="references/secret-patterns.md" trigger="Before scanning for secrets — load extended gitleaks patterns and git history scan procedure"/>

Use `Grep` on all changed files for core patterns: `sk-`, `AKIA`, `ghp_`, `ghs_`, `-----BEGIN`, `password\s*=\s*["']`, `secret\s*=\s*["']`, `api_key\s*=\s*["']`, `token\s*=\s*["']`. Also flag high-entropy strings (>40 chars, entropy >4.5) and `.env` contents committed directly. Load reference for extended patterns (Slack, Stripe, SendGrid, etc.) and git history scan procedure.

Any match = **BLOCK**. Do not proceed to later steps if BLOCK findings exist — report immediately.

### Step 2 — Dependency Audit

Use `Bash` to run the appropriate audit command for the detected package manager:
- npm/pnpm/yarn: `npm audit --json` (parse JSON, extract critical + high severity)
- Python: `pip-audit --format=json` (if installed) or `safety check`
- Rust: `cargo audit --json`
- Go: `govulncheck ./...`

Critical CVE (CVSS >= 9.0) = **BLOCK**. High CVE (CVSS 7.0–8.9) = **WARN**. Medium/Low = **INFO**.

If audit tool is not installed, log **INFO**: "audit tool not found, skipping dependency check" — do NOT block on missing tooling.

### Step 3 — OWASP Check
<MUST-READ path="references/owasp-patterns.md" trigger="Before scanning for OWASP issues — load code examples and detection signals for SQL injection, XSS, CSRF, input validation"/>

Scan changed files for SQL injection (string concat/interpolation in SQL) → **BLOCK**, XSS (`innerHTML`, `dangerouslySetInnerHTML` without sanitization) → **BLOCK**, CSRF (forms without token, cookies without SameSite) → **WARN**, and missing input validation (raw `req.body` → DB) → **WARN**. Load reference for code examples and precise detection signals.

### Step 3.5 — Skill Content Security Guard
<MUST-READ path="references/skill-content-guard.md" trigger="When sentinel is invoked on any SKILL.md, PACK.md, or .rune/*.md file — load all 28 category rules before scanning"/>

When invoked on `SKILL.md`, `extensions/*/PACK.md`, `.rune/*.md`, or agent files, scan content for 28 compiled regex rule categories BEFORE it is written or committed. First-match-wins — report the triggering category and halt. Safe exceptions apply for documented anti-pattern examples and scripts in `scripts/` directory. Invoke from `skill-forge` Phase 7 pre-ship check and from any hook writing to skill files.

> Source: nextlevelbuilder/goclaw (832★)

### Step 4 — Destructive Command Guard
<MUST-READ path="references/destructive-commands.md" trigger="Before static scan and before including real-time command guard in report — load pattern table and safe exceptions"/>

**4a. Static scan** — Grep changed files for: `rm -rf /`, `DROP TABLE`, `DELETE FROM` without `WHERE`, `TRUNCATE`, file ops on absolute paths outside project root (`/etc/`, `/usr/`, `C:\Windows\`), production DB connection strings. Destructive command on production path = **BLOCK**. Suspicious path = **WARN**.

**4b. Real-Time Command Guard** — When invoked by `cook` or `fix`, include the destructive command pattern table in the report. Load reference for the full pattern table and safe exceptions (e.g., `rm -rf node_modules` is NOT destructive).

### Step 4.5 — Framework-Specific Security Patterns
<MUST-READ path="references/framework-patterns.md" trigger="When framework files are detected in the changed set — load patterns for the specific framework(s) found"/>

Apply only when the framework is detected in changed files. Covers Django (DEBUG=True, missing permissions, CSRF removal), React/Next.js (localStorage JWT, dangerouslySetInnerHTML), Node.js/Express/Fastify (wildcard CORS, missing helmet), Python (pickle.loads, yaml.load unsafe). Load reference for the complete check table per framework.

### Step 4.6 — Config Protection (3-Layer Defense)
<MUST-READ path="references/config-protection.md" trigger="When config files (.eslintrc, tsconfig.json, ruff.toml, CI/CD files) appear in the diff — load detection patterns for all 3 layers"/>

Detect attempts to weaken code quality or security configurations across three layers: (1) Linter/formatter config drift (ESLint rules disabled, `"strict": false` in tsconfig, ruff rules removed) → **WARN**; (2) Security middleware removal (helmet, csrf, CORS wildcard) → **BLOCK**; (3) CI/CD safety bypass (`--no-verify`, `continue-on-error`, lowered coverage thresholds) → **WARN**.

### Step 4.7 — Agentic Security Scan

If `.rune/` directory exists, invoke `rune:integrity-check` (L3) on all `.rune/*.md` files and any state files in the commit diff.

```
REQUIRED SUB-SKILL: rune:integrity-check
→ Invoke integrity-check on all .rune/*.md files + any state files in the commit diff.
→ Capture: status (CLEAN | SUSPICIOUS | TAINTED), findings list.
```

Map results: `TAINTED` → **BLOCK**, `SUSPICIOUS` → **WARN**, `CLEAN` → no findings.
If `.rune/` does not exist, skip and log INFO: "no .rune/ state files, agentic scan skipped".

### Step 5 — Report

Aggregate all findings across all steps. Verdict rules:
- Any **BLOCK** → overall status = **BLOCK**. List all BLOCK items first.
- No BLOCK but any **WARN** → overall status = **WARN**. Developer must acknowledge each WARN.
- Only **INFO** → overall status = **PASS**.

<HARD-GATE>
If status is BLOCK, output the report and STOP. The calling skill (cook, preflight, deploy) must halt until all BLOCK findings are fixed and sentinel re-runs.
</HARD-GATE>

### WARN Acknowledgment Protocol

WARN findings do not block but MUST be explicitly acknowledged:

```
For each WARN item, developer must respond with one of:
  - "ack" — acknowledged, will fix later (logged to .rune/decisions.md)
  - "fix" — fixing now (sentinel re-runs after fix)
  - "wontfix [reason]" — intentional, with documented reason

Silent continuation past WARN = VIOLATION.
The calling skill (cook) must present WARNs and wait for acknowledgment.
```

### Step 5b — Domain Hook Generation (on request)
<MUST-READ path="references/domain-hooks.md" trigger="When a pack or skill requests domain-specific pre-commit hook generation"/>

Generate domain-specific pre-commit hook scripts when requested. Load reference for hook architecture, the standard template, and built-in domain patterns (Schema/API, Database, Config, Dependencies, Legal, Financial). Hooks must exit 0 when no relevant files are staged and must run in <5 seconds.

## Output Format

```
## Sentinel Report
- **Status**: PASS | WARN | BLOCK
- **Files Scanned**: [count]
- **Findings**: [count by severity]

### BLOCK (must fix before commit)
- `path/to/file.ts:42` — Hardcoded API key detected (pattern: sk-...)
- `path/to/api.ts:15` — SQL injection: string concatenation in query

### WARN (must acknowledge)
- `package.json` — lodash@4.17.20 has known prototype pollution (CVE-2021-23337, CVSS 7.4)

### INFO
- `auth.ts:30` — Consider adding rate limiting to login endpoint

### Verdict
BLOCKED — 2 critical findings must be resolved before commit.
```

## Constraints

1. MUST scan ALL files in scope — not just the file the user pointed at
2. MUST check: hardcoded secrets, SQL injection, XSS, CSRF, auth bypass, path traversal
3. MUST list every file checked in the report — "no issues found" requires proof of what was examined
4. MUST NOT say "the framework handles security" as justification for skipping checks
5. MUST NOT say "this is an internal tool" as justification for reduced security
6. MUST flag any .env, credentials, or key files found in git-tracked directories
7. MUST use opus model for security-critical code (auth, crypto, payments)

## Sharp Edges

| Failure Mode | Severity | Mitigation |
|---|---|---|
| Skill content with prompt injection not caught pre-write | HIGH | Step 3.5 Skill Content Security Guard: scan SKILL.md content before write — first-match-wins on 28 category rules |
| False positive on test fixtures with fake secrets | MEDIUM | Verify file path — `test/`, `fixtures/`, `__mocks__/` patterns; check string entropy |
| Skipping framework checks because "the framework handles it" | HIGH | CONSTRAINT blocks this rationalization — apply checks regardless |
| Dependency audit tool missing → silently skipped | LOW | Report INFO "tool not found, skipping" — never skip silently |
| Stopping after first BLOCK without aggregating all findings | MEDIUM | Complete ALL steps, aggregate ALL findings, then report — developer needs the full list |
| Missing agentic security scan when .rune/ exists | HIGH | Step 4.7 is mandatory when .rune/ directory detected — never skip |
| Domain hook too slow (>5s) → developers disable it | MEDIUM | Keep hooks fast — grep-based patterns only, no network calls. Complex validation goes in CI, not pre-commit |
| Domain hook blocks on test fixtures / mock data | MEDIUM | Check file path context — `test/`, `fixtures/`, `__mocks__/` directories get relaxed rules |
| Agent runs destructive command without checking pattern table | HIGH | Step 4b: real-time command guard patterns MUST be checked before Bash execution. Safe exceptions prevent false positives on `rm -rf node_modules` |
| False positive on `rm -rf` in build cleanup scripts | MEDIUM | Safe exceptions list (node_modules, dist, .next, etc.) — build cleanup is NOT destructive |

## Done When

- All files in scope scanned for secret patterns
- OWASP checks applied (SQL injection, XSS, CSRF, input validation)
- Dependency audit ran (or "tool not found" reported as INFO)
- Framework-specific checks applied for every detected framework
- Structured report emitted with PASS / WARN / BLOCK verdict and all files scanned listed

## Cost Profile

~1000-3000 tokens input, ~500-1000 tokens output. Sonnet default, opus for deep audit on critical findings.
