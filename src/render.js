import { LEVELS } from './engine.js';
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function boardMarkup(puzzle, { interactive = false, solution = [] } = {}) {
 const { size, clues } = puzzle;
 return `<div class="board ${interactive ? '' : 'static-board'}" style="--size:${size}" ${interactive ? 'role="grid" aria-label="Shikaku puzzle grid"' : 'role="img" aria-label="Shikaku puzzle diagram"'}>${Array.from({length:size},(_,r)=>`<div class="board-row" ${interactive?'role="row"':''}>${Array.from({length:size},(_,c)=>{
 const clue=clues.find(x=>x.r===r&&x.c===c),rect=solution.find(x=>r>=x.r&&r<x.r+x.h&&c>=x.c&&c<x.c+x.w),style=rect?`style="background:var(--tile-${rect.clue%6});border-top:${r===rect.r?'2px solid #233c32':'1px solid transparent'};border-left:${c===rect.c?'2px solid #233c32':'1px solid transparent'}"`:'';
 return interactive?`<div role="gridcell"><button class="cell" type="button" data-cell="${r*size+c}" tabindex="${r===0&&c===0?'0':'-1'}" aria-label="Row ${r+1}, column ${c+1}${clue?`, clue ${clue.value}`:', empty'}"><span>${clue?.value||''}</span></button></div>`:`<span class="cell" ${style}>${clue?.value||''}</span>`;
 }).join('')}</div>`).join('')}</div>`;
}
export function gameMarkup(puzzle, {mode='daily', level='easy', fixed=false, publicOrigin=''}={}) {
 return `<section class="game" aria-label="Play Shikaku"><div class="game-top"><div><span class="eyebrow" id="mode-label">${mode==='daily'?'THE DAILY PUZZLE':'PRACTICE YOUR WAY'}</span><p class="puzzle-label" id="puzzle-label">${escape(puzzle.id)}</p></div><div class="clock"><span>YOUR TIME</span><output id="timer">0:00</output></div></div>
 ${fixed?'':`<fieldset class="level-picker"><legend class="sr-only">Choose puzzle size</legend>${Object.entries(LEVELS).map(([key,v])=>`<label><input type="radio" name="level" value="${key}" ${key===level?'checked':''}><span>${v.label}<small>${v.size} × ${v.size}</small></span></label>`).join('')}</fieldset>`}
 <div class="board-wrap" id="board-wrap">${boardMarkup(puzzle,{interactive:true})}</div>
 <div class="board-help"><span id="progress">0 / ${puzzle.clues.length} rectangles</span><label class="zoom-toggle"><input type="checkbox" id="zoom"> Larger grid</label></div>
 <p class="status" id="status" role="status" aria-live="polite">Tap two opposite corners, or drag a rectangle.</p>
 <div class="tools"><button type="button" id="undo" disabled>↶ Undo</button><button type="button" id="erase" aria-pressed="false">Erase</button><button type="button" id="hint" class="hint-button">Explain a step <span>↗</span></button></div>
 <div id="hint-panel" class="hint-panel" hidden><span class="eyebrow">A LITTLE NUDGE</span><p id="hint-text"></p><button id="apply-hint" type="button" hidden>Place this rectangle</button><button id="hide-hint" class="text-button" type="button">Close hint</button></div>
 <div class="won" id="won" hidden tabindex="-1"><span class="eyebrow">EVERY PIECE IN ITS PLACE</span><h2>Nicely done.</h2><p id="result"></p><div class="finish-actions"><button id="share" type="button" class="primary">Copy result</button><button id="next" type="button">Play another</button></div></div><p id="share-fallback" hidden></p>
 <div class="quiet-tools"><button type="button" id="restart">Restart this puzzle</button><button type="button" id="print">Print this puzzle</button><button type="button" id="copy-puzzle">Copy puzzle link</button></div>
 <details class="controls"><summary>Rules & keyboard controls</summary><p>Each rectangle holds one number. Its area must equal that number. Cover every cell without overlaps.</p><p><kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> move. <kbd>Enter</kbd> or <kbd>Space</kbd> selects the first and second corner. <kbd>Escape</kbd> cancels. <kbd>Delete</kbd> removes the rectangle under focus. Use Undo to take back a move.</p></details>
 <dialog id="restart-dialog"><h2>Start this puzzle again?</h2><p>Your rectangles and timer for this puzzle will be reset.</p><div class="finish-actions"><button type="button" id="cancel-restart">Keep playing</button><button type="button" id="confirm-restart" class="primary">Restart</button></div></dialog>
 <noscript><p>The interactive game needs JavaScript. The puzzle above and our <a href="/printable/">printable puzzles</a> are still available.</p></noscript>
 <script type="application/json" id="puzzle-data">${JSON.stringify({puzzle,mode,level,fixed,publicOrigin}).replace(/</g,'\\u003c')}</script></section>`;
}
