import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseSignals, validateSignals } from '../validate-signals.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('validate-signals', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'rune-signals-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('parseSignals', () => {
    test('extracts emit and listen from frontmatter', () => {
      const skillDir = join(tempDir, 'alpha');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: alpha
metadata:
  layer: L2
  emit: code.changed, tests.passed
  listen: plan.ready
---

# alpha
`,
      );

      const result = parseSignals(join(skillDir, 'SKILL.md'));
      assert.strictEqual(result.name, 'alpha');
      assert.deepStrictEqual(result.emit, ['code.changed', 'tests.passed']);
      assert.deepStrictEqual(result.listen, ['plan.ready']);
    });

    test('returns empty arrays when no signals', () => {
      const skillDir = join(tempDir, 'beta');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: beta
metadata:
  layer: L3
---

# beta
`,
      );

      const result = parseSignals(join(skillDir, 'SKILL.md'));
      assert.deepStrictEqual(result.emit, []);
      assert.deepStrictEqual(result.listen, []);
    });
  });

  describe('validateSignals', () => {
    test('passes when all listeners have matching emitters', () => {
      mkdirSync(join(tempDir, 'emitter'));
      writeFileSync(
        join(tempDir, 'emitter', 'SKILL.md'),
        `---
name: emitter
metadata:
  layer: L2
  emit: code.changed
---
# emitter
`,
      );

      mkdirSync(join(tempDir, 'listener'));
      writeFileSync(
        join(tempDir, 'listener', 'SKILL.md'),
        `---
name: listener
metadata:
  layer: L2
  listen: code.changed
---
# listener
`,
      );

      const { signalCount, issues, warnings } = validateSignals(tempDir);
      assert.strictEqual(signalCount, 1);
      assert.strictEqual(issues.length, 0);
      assert.strictEqual(warnings.length, 0);
    });

    test('detects orphan listener — no emitter', () => {
      mkdirSync(join(tempDir, 'lonely'));
      writeFileSync(
        join(tempDir, 'lonely', 'SKILL.md'),
        `---
name: lonely
metadata:
  layer: L2
  listen: ghost.signal
---
# lonely
`,
      );

      const { issues } = validateSignals(tempDir);
      assert.strictEqual(issues.length, 1);
      assert.ok(issues[0].includes('ghost.signal'));
      assert.ok(issues[0].includes('orphan'));
    });

    test('warns about unlistened emitters', () => {
      mkdirSync(join(tempDir, 'shouter'));
      writeFileSync(
        join(tempDir, 'shouter', 'SKILL.md'),
        `---
name: shouter
metadata:
  layer: L2
  emit: nobody.cares
---
# shouter
`,
      );

      const { issues, warnings } = validateSignals(tempDir);
      assert.strictEqual(issues.length, 0);
      assert.strictEqual(warnings.length, 1);
      assert.ok(warnings[0].includes('nobody.cares'));
    });

    test('rejects invalid signal names', () => {
      mkdirSync(join(tempDir, 'bad'));
      writeFileSync(
        join(tempDir, 'bad', 'SKILL.md'),
        `---
name: bad
metadata:
  layer: L2
  emit: UPPERCASE, no-dots
---
# bad
`,
      );

      const { issues } = validateSignals(tempDir);
      assert.ok(issues.length >= 2, `expected 2+ issues, got ${issues.length}`);
      assert.ok(issues.some((i) => i.includes('UPPERCASE')));
      assert.ok(issues.some((i) => i.includes('no-dots')));
    });

    test('handles skills with no signals gracefully', () => {
      mkdirSync(join(tempDir, 'plain'));
      writeFileSync(
        join(tempDir, 'plain', 'SKILL.md'),
        `---
name: plain
metadata:
  layer: L3
---
# plain
`,
      );

      const { signalCount, issues } = validateSignals(tempDir);
      assert.strictEqual(signalCount, 0);
      assert.strictEqual(issues.length, 0);
    });
  });

  describe('integration: real skills', () => {
    test('validates actual Rune skills directory', () => {
      const { skillCount, signalCount, issues } = validateSignals(join(__dirname, '../../skills'));
      assert.ok(skillCount >= 50, `Expected 50+ skills, got ${skillCount}`);
      assert.ok(signalCount >= 10, `Expected 10+ signals, got ${signalCount}`);
      assert.strictEqual(issues.length, 0, `Signal issues found: ${issues.join(', ')}`);
    });
  });
});
