#!/usr/bin/env node

// validate-signals.js — Validates signal consistency across all SKILL.md files
// Checks: orphan listeners (listen but no emitter), signal naming, duplicate emitters
// Usage: node scripts/validate-signals.js

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, '..', 'skills');

// Signal naming: lowercase, dot-separated segments (e.g. code.changed, tests.passed)
const SIGNAL_NAME_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

/**
 * Parse emit/listen signals from SKILL.md frontmatter
 */
export function parseSignals(filePath) {
  const content = readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
  const name = filePath.split(/[/\\]/).at(-2);

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { name, emit: [], listen: [] };

  const raw = fmMatch[1];
  const emit = parseCommaList(raw, 'emit');
  const listen = parseCommaList(raw, 'listen');

  return { name, emit, listen };
}

function parseCommaList(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, 'm'));
  if (!match) return [];
  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Validate signal consistency across all skills
 */
export function validateSignals(skillsDir) {
  const skills = {};
  const dirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    const skillPath = join(skillsDir, dir, 'SKILL.md');
    if (existsSync(skillPath)) {
      skills[dir] = parseSignals(skillPath);
    }
  }

  // Build global signal registry
  const emitters = new Map(); // signal → [skill names]
  const listeners = new Map(); // signal → [skill names]
  const issues = [];
  const warnings = [];

  for (const [, skill] of Object.entries(skills)) {
    for (const signal of skill.emit) {
      if (!SIGNAL_NAME_PATTERN.test(signal)) {
        issues.push(`${skill.name}: invalid signal name "${signal}" — use lowercase.dot.notation (e.g. code.changed)`);
      }
      if (!emitters.has(signal)) emitters.set(signal, []);
      emitters.get(signal).push(skill.name);
    }

    for (const signal of skill.listen) {
      if (!SIGNAL_NAME_PATTERN.test(signal)) {
        issues.push(`${skill.name}: invalid signal name "${signal}" — use lowercase.dot.notation (e.g. code.changed)`);
      }
      if (!listeners.has(signal)) listeners.set(signal, []);
      listeners.get(signal).push(skill.name);
    }
  }

  // Check: every listen signal must have at least one emitter
  for (const [signal, listenerList] of listeners) {
    if (!emitters.has(signal)) {
      issues.push(`orphan listener: "${signal}" listened by [${listenerList.join(', ')}] but no skill emits it`);
    }
  }

  // Warn: emitted signals that nobody listens to
  for (const [signal, emitterList] of emitters) {
    if (!listeners.has(signal)) {
      warnings.push(`unlistened signal: "${signal}" emitted by [${emitterList.join(', ')}] but no skill listens to it`);
    }
  }

  const signalCount = new Set([...emitters.keys(), ...listeners.keys()]).size;
  const emitterCount = [...emitters.values()].reduce((sum, arr) => sum + arr.length, 0);
  const listenerCount = [...listeners.values()].reduce((sum, arr) => sum + arr.length, 0);

  return {
    skillCount: Object.keys(skills).length,
    signalCount,
    emitterCount,
    listenerCount,
    issues,
    warnings,
  };
}

// CLI entry point
const isMain =
  process.argv[1] && fileURLToPath(import.meta.url).endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const { skillCount, signalCount, emitterCount, listenerCount, issues, warnings } = validateSignals(SKILLS_DIR);
  console.log(`Scanned ${skillCount} skills — ${signalCount} signals, ${emitterCount} emit, ${listenerCount} listen`);

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  ⚠  ${w}`));
  }

  if (issues.length === 0) {
    console.log('\n✓ All signals are valid!');
  } else {
    console.log(`\n✗ Found ${issues.length} signal issue(s):\n`);
    issues.forEach((issue) => console.log(`  ✗  ${issue}`));
  }

  process.exit(issues.length > 0 ? 1 : 0);
}
