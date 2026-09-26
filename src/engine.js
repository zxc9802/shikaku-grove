// Original rectangle puzzle generator and constraint solver. No third-party puzzle data.
export const LEVELS = { easy: { size: 5, label: 'Gentle' }, medium: { size: 7, label: 'Steady' }, hard: { size: 9, label: 'Deep' } };
export function random(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const sameRect = (a, b) => a.r === b.r && a.c === b.c && a.h === b.h && a.w === b.w;
export const contains = (a, r, c) => r >= a.r && r < a.r + a.h && c >= a.c && c < a.c + a.w;
export const overlaps = (a, b) => a.r < b.r + b.h && b.r < a.r + a.h && a.c < b.c + b.w && b.c < a.c + a.w;
export function cells(rect, size) {
  const out = [];
  for (let r = rect.r; r < rect.r + rect.h; r++) for (let c = rect.c; c < rect.c + rect.w; c++) out.push(r * size + c);
  return out;
}
export function candidates(puzzle) {
  const { size, clues } = puzzle;
  return clues.map((clue, i) => {
    const out = [];
    for (let h = 1; h <= size; h++) {
      const w = clue.value / h;
      if (!Number.isInteger(w) || w > size) continue;
      for (let r = Math.max(0, clue.r - h + 1); r <= clue.r && r + h <= size; r++) {
        for (let c = Math.max(0, clue.c - w + 1); c <= clue.c && c + w <= size; c++) {
          const rect = { r, c, h, w, clue: i };
          if (!clues.some((other, j) => j !== i && contains(rect, other.r, other.c))) out.push(rect);
        }
      }
    }
    return out;
  });
}
export function solve(puzzle, limit = 2, fixed = []) {
  const lists = candidates(puzzle), solutions = [];
  const used = new Set(fixed.map(x => x.clue));
  if (used.size !== fixed.length || fixed.some((r, i) => !lists[r.clue]?.some(x => sameRect(x, r)) || fixed.some((b, j) => i !== j && overlaps(r, b)))) return [];
  function search(placed, remaining) {
    if (solutions.length >= limit) return;
    if (!remaining.length) { solutions.push([...placed]); return; }
    let best = null, choices = null;
    for (const i of remaining) {
      const legal = lists[i].filter(r => !placed.some(p => overlaps(r, p)));
      if (!legal.length) return;
      if (!choices || legal.length < choices.length) { best = i; choices = legal; }
    }
    for (const r of choices) { search([...placed, r], remaining.filter(i => i !== best)); if (solutions.length >= limit) break; }
  }
  search(fixed, lists.map((_, i) => i).filter(i => !used.has(i)));
  return solutions;
}
export function validateRect(puzzle, rect, placed = []) {
  if (![rect.r, rect.c, rect.h, rect.w].every(Number.isInteger) || rect.h < 1 || rect.w < 1 || rect.r < 0 || rect.c < 0 || rect.r + rect.h > puzzle.size || rect.c + rect.w > puzzle.size) return { error: 'Choose two corners inside the grid.' };
  const inside = puzzle.clues.map((clue, i) => contains(rect, clue.r, clue.c) ? i : -1).filter(i => i >= 0);
  if (!inside.length) return { error: 'This rectangle needs one numbered clue.' };
  if (inside.length > 1) return { error: 'A rectangle can contain only one numbered clue.' };
  const clue = inside[0], area = rect.w * rect.h;
  if (area !== puzzle.clues[clue].value) return { error: `${rect.w} × ${rect.h} covers ${area} cells. The clue needs ${puzzle.clues[clue].value}.` };
  if (placed.some(p => p.clue !== clue && overlaps(p, rect))) return { error: 'That rectangle overlaps another. Remove it or undo first.' };
  return { rect: { ...rect, clue } };
}
export function isComplete(puzzle, placed) {
  return placed.length === puzzle.clues.length && placed.every(rect => !validateRect(puzzle, rect, placed).error) && new Set(placed.map(x => x.clue)).size === placed.length;
}
export function nextHint(puzzle, placed = []) {
  const lists = candidates(puzzle), fixed = new Set(placed.map(x => x.clue));
  const remaining = lists.map((list, i) => fixed.has(i) ? [] : list.filter(r => !placed.some(p => overlaps(r, p))));
  for (let i = 0; i < remaining.length; i++) {
    if (fixed.has(i)) continue;
    if (!remaining[i].length) return { type: 'conflict', text: `The ${puzzle.clues[i].value} at row ${puzzle.clues[i].r + 1}, column ${puzzle.clues[i].c + 1} has no legal rectangle left. Undo a recent rectangle and reconsider its neighbors.` };
    if (remaining[i].length === 1) {
      const rect = remaining[i][0], clue = puzzle.clues[i];
      return { type: 'forced', rect, text: `Look at ${clue.value} in row ${clue.r + 1}, column ${clue.c + 1}. Only one ${rect.w} × ${rect.h} rectangle fits without crossing an edge, another clue, or a placed rectangle. Its top-left corner is row ${rect.r + 1}, column ${rect.c + 1}.`, candidates: 1 };
    }
  }
  const occupied = new Set(placed.flatMap(r => cells(r, puzzle.size)));
  for (let cell = 0; cell < puzzle.size * puzzle.size; cell++) {
    if (occupied.has(cell)) continue;
    const r = Math.floor(cell / puzzle.size), c = cell % puzzle.size;
    const covering = remaining.flat().filter(rect => contains(rect, r, c));
    if (!covering.length) return { type: 'conflict', text: `Row ${r + 1}, column ${c + 1} can no longer be covered by any clue. A placed rectangle needs to change.` };
    if (covering.length === 1) return { type: 'forced', rect: covering[0], text: `Every cell must be covered. Row ${r + 1}, column ${c + 1} can be reached by only one legal rectangle: the ${puzzle.clues[covering[0].clue].value} clue, covering ${covering[0].w} × ${covering[0].h} cells.`, candidates: 1 };
  }
  if (!solve(puzzle, 1, placed).length) return { type: 'conflict', text: 'These rectangles are individually valid, but together they block a full solution. Undo a recent choice and try a different boundary.' };
  const i = remaining.findIndex(x => x.length > 1);
  if (i < 0) return null;
  const clue = puzzle.clues[i];
  return { type: 'consider', clue: i, text: `The ${clue.value} at row ${clue.r + 1}, column ${clue.c + 1} still has ${remaining[i].length} legal rectangles. Check which cells each shape would leave for its neighbors. No single forced rectangle has been found by this hint method.`, candidates: remaining[i].length };
}
export function logicalPath(puzzle) {
  const path = [], placed = [];
  for (let i = 0; i < puzzle.clues.length; i++) {
    const hint = nextHint(puzzle, placed);
    if (!hint?.rect) return null;
    placed.push(hint.rect); path.push(hint);
  }
  return path;
}
export function generate(seed, size = 5) {
  const rand = random(seed);
  for (let attempt = 0; attempt < 4000; attempt++) {
    const occupied = new Set(), rectangles = [];
    while (occupied.size < size * size) {
      let start = 0; while (occupied.has(start)) start++;
      const r = Math.floor(start / size), c = start % size, options = [];
      for (let h = 1; h <= Math.min(5, size - r); h++) for (let w = 1; w <= Math.min(5, size - c); w++) {
        if (h * w > Math.max(8, size * 2) || (h * w === 1 && rand() > 0.1)) continue;
        const rect = { r, c, h, w };
        if (cells(rect, size).every(x => !occupied.has(x))) options.push(rect);
      }
      const rect = options[Math.floor(rand() * options.length)] || { r, c, h: 1, w: 1 };
      rectangles.push(rect); cells(rect, size).forEach(x => occupied.add(x));
    }
    if (rectangles.filter(r => r.h * r.w === 1).length > Math.ceil(size / 3) || rectangles.length < size) continue;
    const clues = rectangles.map(rect => ({ r: rect.r + Math.floor(rand() * rect.h), c: rect.c + Math.floor(rand() * rect.w), value: rect.h * rect.w })).sort((a, b) => a.r - b.r || a.c - b.c);
    const puzzle = { id: String(seed), size, clues };
    if (solve(puzzle).length === 1 && logicalPath(puzzle)) return puzzle;
  }
  throw new Error(`Could not generate a validated puzzle for ${seed}`);
}
export function dailyKey(date = new Date()) { return date.toISOString().slice(0, 10); }
