import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, solve, candidates, validateRect, isComplete, logicalPath, nextHint, dailyKey, cells } from '../src/engine.js';

test('original generated puzzles are deterministic, cover the board and have exactly one solution', () => {
 for (const size of [5, 7, 9]) for (let seed = 0; seed < 40; seed++) {
  const p = generate(`test-${size}-${seed}`, size), answers = solve(p);
  assert.equal(answers.length, 1);
  assert.equal(new Set(answers[0].flatMap(r => cells(r, size))).size, size * size);
  assert.ok(isComplete(p, answers[0]));
  assert.ok(p.clues.reduce((n, c) => n + c.value, 0) === size * size);
  assert.deepEqual(generate(`test-${size}-${seed}`, size), p);
  const path = logicalPath(p); assert.equal(path.length, p.clues.length);
  // Every proposed hint is forced across all remaining full solutions.
  const fixed = [];
  for (const hint of path) { const sols = solve(p, 2, fixed); assert.ok(sols.every(s => s.some(r => JSON.stringify(r) === JSON.stringify(hint.rect)))); fixed.push(hint.rect); }
 }
});
test('solver detects multiple solutions instead of quietly choosing one', () => {
 const p = { size: 2, clues: [{ r:0,c:0,value:2 },{r:1,c:1,value:2}] };
 assert.equal(solve(p).length, 2);
 assert.equal(nextHint(p).type, 'consider');
});
test('invalid rectangles and conflicting placements are rejected', () => {
 const p = { size: 2, clues: [{r:0,c:0,value:2},{r:1,c:1,value:2}] };
 assert.match(validateRect(p,{r:0,c:0,h:1,w:1}).error,/needs 2/);
 assert.match(validateRect(p,{r:0,c:0,h:2,w:2}).error,/one numbered/);
 assert.ok(validateRect(p,{r:-1,c:0,h:1,w:2}).error);
 assert.ok(validateRect(p,{r:0,c:1,h:1,w:1}).error);
 const first = {r:0,c:0,h:1,w:2,clue:0};
 assert.ok(validateRect(p,{r:0,c:1,h:2,w:1},[first]).error);
 assert.equal(solve(p,2,[first,first]).length,0);
 assert.equal(isComplete(p,[first,first]),false);
 assert.equal(candidates(p)[0].length,2);
});
test('daily puzzle rolls over at UTC midnight', () => {
 assert.equal(dailyKey(new Date('2026-09-26T23:59:59Z')), '2026-09-26');
 assert.equal(dailyKey(new Date('2026-09-27T00:00:00Z')), '2026-09-27');
});
