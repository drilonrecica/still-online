import { describe, expect, it } from 'vitest';
import { exampleContact } from './example.fixture';
import type { ScriptNode } from './types';

const nextIds = (node: ScriptNode): string[] =>
  'choices' in node ? node.choices.map((c) => c.next) : [];

describe('content format example', () => {
  it('every script starts at an existing node and every choice leads to one', () => {
    for (const script of exampleContact.scripts) {
      expect(script.nodes[script.start]).toBeDefined();
      for (const node of Object.values(script.nodes)) {
        for (const next of nextIds(node)) {
          expect(script.nodes[next]).toBeDefined();
        }
      }
    }
  });

  it('every node is reachable from the start node', () => {
    for (const script of exampleContact.scripts) {
      const seen = new Set<string>();
      const stack = [script.start];
      for (let id = stack.pop(); id !== undefined; id = stack.pop()) {
        const node = script.nodes[id];
        if (seen.has(id) || !node) continue;
        seen.add(id);
        stack.push(...nextIds(node));
      }
      expect([...seen].sort()).toEqual(Object.keys(script.nodes).sort());
    }
  });
});
