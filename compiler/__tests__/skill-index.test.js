/**
 * Skill Index Generation Tests
 *
 * Tests that buildAll generates a valid skill-index.json with:
 * - Intent patterns mapped to skills
 * - Mesh-aware chain prediction from connections
 * - Complete skill graph
 */

import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { getAdapter } from '../adapters/index.js';
import { buildAll } from '../emitter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNE_ROOT = path.resolve(__dirname, '../..');

describe('skill-index.json generation', () => {
  test('buildAll emits skill-index.json with correct structure', async () => {
    const tmp = path.join(tmpdir(), `rune-idx-test-${Date.now()}`);
    try {
      const adapter = getAdapter('cursor');
      await buildAll({ runeRoot: RUNE_ROOT, outputRoot: tmp, adapter });

      const indexPath = path.join(tmp, adapter.outputDir, 'skill-index.json');
      assert.ok(existsSync(indexPath), 'skill-index.json not found in output');

      const index = JSON.parse(await readFile(indexPath, 'utf-8'));

      // Structure checks
      assert.strictEqual(index.version, 2);
      assert.ok(index.generated, 'missing generated timestamp');
      assert.ok(index.skillCount >= 50, `too few skills: ${index.skillCount}`);
      assert.ok(typeof index.skills === 'object', 'missing skills object');
      assert.ok(typeof index.graph === 'object', 'missing graph object');
      assert.ok(typeof index.signals === 'object', 'missing signals object');
      assert.ok(typeof index.intents === 'object', 'missing intents object');
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });

  test('skill-index contains intent patterns with chains', async () => {
    const tmp = path.join(tmpdir(), `rune-idx-test-${Date.now()}`);
    try {
      const adapter = getAdapter('cursor');
      await buildAll({ runeRoot: RUNE_ROOT, outputRoot: tmp, adapter });

      const index = JSON.parse(await readFile(path.join(tmp, adapter.outputDir, 'skill-index.json'), 'utf-8'));

      // cook intent should exist with keywords and chain
      assert.ok(index.intents.cook, 'missing cook intent');
      assert.ok(Array.isArray(index.intents.cook.keywords), 'cook keywords not array');
      assert.ok(index.intents.cook.keywords.includes('implement'), 'cook missing "implement" keyword');
      assert.ok(Array.isArray(index.intents.cook.chain), 'cook chain not array');
      assert.strictEqual(index.intents.cook.chain[0], 'cook', 'cook chain should start with cook');
      assert.ok(index.intents.cook.chain.length > 1, 'cook chain should have connected skills');

      // debug intent
      assert.ok(index.intents.debug, 'missing debug intent');
      assert.ok(index.intents.debug.keywords.includes('bug'), 'debug missing "bug" keyword');

      // sentinel intent
      assert.ok(index.intents.sentinel, 'missing sentinel intent');
      assert.ok(index.intents.sentinel.keywords.includes('security'), 'sentinel missing "security" keyword');
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });

  test('skill-index graph has connections from cross-refs', async () => {
    const tmp = path.join(tmpdir(), `rune-idx-test-${Date.now()}`);
    try {
      const adapter = getAdapter('cursor');
      await buildAll({ runeRoot: RUNE_ROOT, outputRoot: tmp, adapter });

      const index = JSON.parse(await readFile(path.join(tmp, adapter.outputDir, 'skill-index.json'), 'utf-8'));

      // cook should have outbound connections
      assert.ok(index.graph.cook, 'cook not in graph');
      assert.ok(index.graph.cook.length > 3, `cook should have many connections, got ${index.graph.cook.length}`);

      // Skills entry should have layer and description
      assert.ok(index.skills.cook, 'cook not in skills');
      assert.strictEqual(index.skills.cook.layer, 'L1');
      assert.ok(index.skills.cook.description.length > 20, 'cook description too short');
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });

  test('skill-index contains signal graph', async () => {
    const tmp = path.join(tmpdir(), `rune-idx-test-${Date.now()}`);
    try {
      const adapter = getAdapter('cursor');
      await buildAll({ runeRoot: RUNE_ROOT, outputRoot: tmp, adapter });

      const index = JSON.parse(await readFile(path.join(tmp, adapter.outputDir, 'skill-index.json'), 'utf-8'));

      // Signal graph should exist
      assert.ok(typeof index.signals === 'object', 'missing signals object');
      assert.ok(Object.keys(index.signals).length >= 10, `too few signals: ${Object.keys(index.signals).length}`);

      // code.changed should be a well-connected signal
      assert.ok(index.signals['code.changed'], 'missing code.changed signal');
      assert.ok(index.signals['code.changed'].emitters.includes('fix'), 'fix should emit code.changed');
      assert.ok(index.signals['code.changed'].listeners.length >= 3, 'code.changed should have 3+ listeners');

      // Per-skill signals should be included
      assert.ok(index.skills.test.signals, 'test skill should have signals');
      assert.ok(index.skills.test.signals.emit.includes('tests.passed'), 'test should emit tests.passed');
      assert.ok(index.skills.test.signals.listen.includes('code.changed'), 'test should listen to code.changed');

      // Skills without signals should not have the field
      const noSignalSkill = Object.values(index.skills).find((s) => !s.signals);
      assert.ok(noSignalSkill, 'at least one skill should have no signals');
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });

  test('skill-index signal graph with synthetic skills', async () => {
    const tmp = path.join(tmpdir(), `rune-idx-sig-${Date.now()}`);
    const skillsDir = path.join(tmp, 'skills');
    await mkdir(path.join(skillsDir, 'emitter'), { recursive: true });
    await mkdir(path.join(skillsDir, 'listener'), { recursive: true });
    await mkdir(path.join(tmp, 'extensions'), { recursive: true });

    await writeFile(
      path.join(skillsDir, 'emitter', 'SKILL.md'),
      [
        '---',
        'name: emitter',
        'description: "Emits signals"',
        'metadata:',
        '  layer: L2',
        '  emit: data.ready',
        '---',
        '',
        '# emitter',
      ].join('\n'),
      'utf-8',
    );

    await writeFile(
      path.join(skillsDir, 'listener', 'SKILL.md'),
      [
        '---',
        'name: listener',
        'description: "Listens to signals"',
        'metadata:',
        '  layer: L3',
        '  listen: data.ready',
        '---',
        '',
        '# listener',
      ].join('\n'),
      'utf-8',
    );

    try {
      const adapter = getAdapter('generic');
      await buildAll({ runeRoot: tmp, outputRoot: tmp, adapter });

      const index = JSON.parse(await readFile(path.join(tmp, adapter.outputDir, 'skill-index.json'), 'utf-8'));

      assert.ok(index.signals['data.ready'], 'data.ready signal should exist');
      assert.deepStrictEqual(index.signals['data.ready'].emitters, ['emitter']);
      assert.deepStrictEqual(index.signals['data.ready'].listeners, ['listener']);
      assert.ok(index.skills.emitter.signals);
      assert.deepStrictEqual(index.skills.emitter.signals.emit, ['data.ready']);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });

  test('skill-index works with minimal skill tree', async () => {
    const tmp = path.join(tmpdir(), `rune-idx-min-${Date.now()}`);
    const skillsDir = path.join(tmp, 'skills', 'alpha');
    await mkdir(skillsDir, { recursive: true });
    await mkdir(path.join(tmp, 'extensions'), { recursive: true });

    await writeFile(
      path.join(skillsDir, 'SKILL.md'),
      [
        '---',
        'name: alpha',
        'description: "Test skill"',
        'metadata:',
        '  layer: L3',
        '  group: utility',
        '---',
        '',
        '# alpha',
        '',
        'Body.',
      ].join('\n'),
      'utf-8',
    );

    try {
      const adapter = getAdapter('generic');
      await buildAll({ runeRoot: tmp, outputRoot: tmp, adapter });

      const index = JSON.parse(await readFile(path.join(tmp, adapter.outputDir, 'skill-index.json'), 'utf-8'));
      assert.strictEqual(index.skillCount, 1);
      assert.ok(index.skills.alpha, 'alpha not in skills');
      assert.deepStrictEqual(index.graph.alpha, [], 'alpha should have no connections');
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
