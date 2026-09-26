import { LEVELS, generate, dailyKey, validateRect, isComplete, nextHint, contains } from './engine.js';
import { boardMarkup } from './render.js';
const data = JSON.parse(document.querySelector('#puzzle-data').textContent);
let { puzzle, mode, level, fixed } = data;
const params = new URLSearchParams(location.search);
const dateParam=params.get('date'), seedParam=params.get('seed');
if (!fixed && params.has('level') && LEVELS[params.get('level')]) level=params.get('level');
let date=/^\d{4}-\d{2}-\d{2}$/.test(dateParam||'') && !Number.isNaN(Date.parse(dateParam)) && dateParam<=dailyKey() ? dateParam : dailyKey();
let practiceSeed=/^[a-z0-9-]{1,48}$/i.test(seedParam||'')?seedParam:crypto.randomUUID().slice(0,12);
let state, anchor=null, focus=0, erase=false, pointerStart=null, pointerEnd=null, currentHint=null;
const $=id=>document.getElementById(id);
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
function persist() { try { localStorage.setItem('sg:'+puzzle.id,JSON.stringify(state)); } catch { $('status').textContent='Progress cannot be saved in this browser. You can still play.'; } }
function event(name, extra={}) { try { if(typeof window.gtag==='function' && localStorage.getItem('sg:analytics')==='yes') window.gtag('event',name,{puzzle_size:puzzle.size,puzzle_mode:mode,...extra}); } catch {} }
function seconds() { return Math.floor((state.elapsed+(state.startedAt&&!state.finished?Date.now()-state.startedAt:0))/1000); }
function time(n) { return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`; }
function start() { if(!state.startedAt&&!state.finished) { state.startedAt=Date.now(); if(!state.started) { state.started=true; event('puzzle_start'); } } }
function load() {
 if(!fixed) puzzle=generate(`grove-v1-${mode==='daily'?date:practiceSeed}-${level}`,LEVELS[level].size);
 const saved=read('sg:'+puzzle.id,null);
 state=saved&&Array.isArray(saved.placed)&&saved.placed.every(r=>!validateRect(puzzle,r,saved.placed).error)?saved:{placed:[],history:[],elapsed:0,startedAt:null,started:false,finished:false,hints:0};
 // Time away is not solving time, even after closing a tab abruptly.
 if(state.startedAt) state.startedAt=null;
 state.finished=isComplete(puzzle,state.placed);
 anchor=null; focus=0; erase=false; currentHint=null;
 $('board-wrap').innerHTML=boardMarkup(puzzle,{interactive:true});
 $('hint-panel').hidden=true;
 $('mode-label').textContent=mode==='daily'?'THE DAILY PUZZLE':'PRACTICE YOUR WAY';
 $('puzzle-label').textContent=mode==='daily'?`${date} · ${LEVELS[level].label} · ${puzzle.size} × ${puzzle.size}`:`${fixed?'Featured':'Practice'} · ${puzzle.size} × ${puzzle.size}`;
 document.querySelectorAll('[name=level]').forEach(x=>x.checked=x.value===level);
 $('status').textContent=state.finished?'This puzzle is complete. Try another size or a practice puzzle.':'Tap two opposite corners, or drag a rectangle.';
 paint(); persist();
}
function paint() {
 const buttons=document.querySelectorAll('[data-cell]');
 for(const button of buttons) {
  const index=Number(button.dataset.cell),r=Math.floor(index/puzzle.size),c=index%puzzle.size;
  const rect=state.placed.find(x=>contains(x,r,c)), clue=puzzle.clues.find(x=>x.r===r&&x.c===c);
  button.style.background=rect?`var(--tile-${rect.clue%6})`:'';
  button.style.borderTopColor=rect&&r>rect.r?'transparent':'';
  button.style.borderLeftColor=rect&&c>rect.c?'transparent':'';
  button.classList.toggle('anchor',index===anchor);
  button.classList.toggle('hint-cell',currentHint?.rect?contains(currentHint.rect,r,c):false);
  button.tabIndex=index===focus?0:-1;
  button.setAttribute('aria-label',`Row ${r+1}, column ${c+1}${clue?`, clue ${clue.value}`:', empty'}${rect?', covered':''}${index===anchor?', first corner':''}`);
 }
 $('progress').textContent=`${state.placed.length} / ${puzzle.clues.length} rectangles`;
 $('undo').disabled=!state.history.length;
 $('erase').setAttribute('aria-pressed',String(erase));
 $('timer').textContent=time(seconds());
 $('won').hidden=!state.finished;
 if(state.finished) $('result').textContent=`${puzzle.size} × ${puzzle.size} completed in ${time(seconds())}. ${state.hints} ${state.hints===1?'hint':'hints'} used.`;
}
function remember() { state.history.push(structuredClone(state.placed)); if(state.history.length>100)state.history.shift(); }
function finish() {
 if(!isComplete(puzzle,state.placed))return;
 state.elapsed+=state.startedAt?Date.now()-state.startedAt:0; state.startedAt=null; state.finished=true;
 const records=read('sg:completed',{});
 if(!records[puzzle.id]) { records[puzzle.id]={date:dailyKey(),seconds:seconds(),hints:state.hints}; try{localStorage.setItem('sg:completed',JSON.stringify(records));}catch{} event('puzzle_complete',{solve_seconds:seconds(),hints_used:state.hints}); }
 $('status').textContent='Complete! Every cell is covered correctly.';
 paint(); $('won').focus({preventScroll:true});
}
function commit(a,b) {
 if(state.finished)return;
 start(); const r1=Math.floor(a/puzzle.size),c1=a%puzzle.size,r2=Math.floor(b/puzzle.size),c2=b%puzzle.size;
 const result=validateRect(puzzle,{r:Math.min(r1,r2),c:Math.min(c1,c2),h:Math.abs(r2-r1)+1,w:Math.abs(c2-c1)+1},state.placed);
 anchor=null; currentHint=null;
 if(result.error) { $('status').textContent=result.error; paint(); return; }
 remember(); state.placed=state.placed.filter(r=>r.clue!==result.rect.clue); state.placed.push(result.rect);
 $('status').textContent=`${result.rect.w} × ${result.rect.h} rectangle placed. Keep going.`;
 $('hint-panel').hidden=true; finish(); persist(); paint();
}
function remove(index) {
 const r=Math.floor(index/puzzle.size),c=index%puzzle.size,rect=state.placed.find(x=>contains(x,r,c));
 if(!rect||state.finished)return;
 start(); remember(); state.placed=state.placed.filter(x=>x!==rect); anchor=null; currentHint=null;
 $('status').textContent='Rectangle removed.'; persist(); paint();
}
function choose(index) {
 focus=index;
 if(erase){remove(index);return;}
 if(anchor===null){anchor=index;start();$('status').textContent='First corner selected. Choose the opposite corner.';paint();}
 else commit(anchor,index);
}
const wrap=$('board-wrap');
wrap.addEventListener('pointerdown',e=>{
 const button=e.target.closest('[data-cell]'); if(!button||e.button!==0||state.finished)return;
 e.preventDefault(); pointerStart=Number(button.dataset.cell); pointerEnd=pointerStart; focus=pointerStart;
 button.focus({preventScroll:true}); wrap.setPointerCapture(e.pointerId);
});
wrap.addEventListener('pointermove',e=>{
 if(pointerStart===null)return;
 const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]'); if(!el||!wrap.contains(el))return;
 pointerEnd=Number(el.dataset.cell);
 const r1=Math.floor(pointerStart/puzzle.size),r2=Math.floor(pointerEnd/puzzle.size),c1=pointerStart%puzzle.size,c2=pointerEnd%puzzle.size;
 document.querySelectorAll('[data-cell]').forEach(b=>{const i=Number(b.dataset.cell),r=Math.floor(i/puzzle.size),c=i%puzzle.size;b.classList.toggle('preview',r>=Math.min(r1,r2)&&r<=Math.max(r1,r2)&&c>=Math.min(c1,c2)&&c<=Math.max(c1,c2));});
});
wrap.addEventListener('pointerup',()=>{
 if(pointerStart===null)return;
 const a=pointerStart,b=pointerEnd; pointerStart=null;pointerEnd=null;
 document.querySelectorAll('.preview').forEach(b=>b.classList.remove('preview'));
 if(erase)remove(b);else if(a!==b)commit(a,b);else choose(a);
});
wrap.addEventListener('pointercancel',()=>{pointerStart=null;pointerEnd=null;document.querySelectorAll('.preview').forEach(b=>b.classList.remove('preview'));});
wrap.addEventListener('keydown',e=>{
 const button=e.target.closest('[data-cell]');if(!button)return;
 focus=Number(button.dataset.cell); const r=Math.floor(focus/puzzle.size),c=focus%puzzle.size;
 const moves={ArrowLeft:r*puzzle.size+Math.max(0,c-1),ArrowRight:r*puzzle.size+Math.min(puzzle.size-1,c+1),ArrowUp:Math.max(0,r-1)*puzzle.size+c,ArrowDown:Math.min(puzzle.size-1,r+1)*puzzle.size+c};
 if(e.key in moves){e.preventDefault();focus=moves[e.key];paint();wrap.querySelector(`[data-cell="${focus}"]`).focus();}
 else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!state.finished)choose(focus);}
 else if(e.key==='Escape'){anchor=null;currentHint=null;paint();$('status').textContent='Selection cancelled.';}
 else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove(focus);}
});
// Assistive technologies may activate buttons without pointer or key events.
wrap.addEventListener('click',e=>{if(e.detail===0&&e.target.closest('[data-cell]')){const i=Number(e.target.closest('[data-cell]').dataset.cell);if(!state.finished)choose(i);}});
$('undo').onclick=()=>{if(!state.history.length)return; state.placed=state.history.pop();state.finished=false;state.startedAt=null;anchor=null;currentHint=null;$('hint-panel').hidden=true;$('status').textContent='Last move undone.';persist();paint();};
$('erase').onclick=()=>{erase=!erase;anchor=null;$('status').textContent=erase?'Select a rectangle to remove.':'Tap two corners, or drag a rectangle.';paint();};
$('zoom').onchange=e=>wrap.classList.toggle('zoomed',e.target.checked);
$('hint').onclick=()=>{
 if(state.finished){$('status').textContent='You have already solved this puzzle.';return;}
 start();currentHint=nextHint(puzzle,state.placed);if(!currentHint)return;
 state.hints++; event('puzzle_hint',{hint_type:currentHint.type});$('hint-text').textContent=currentHint.text;
 $('hint-panel').hidden=false;$('apply-hint').hidden=!currentHint.rect;anchor=null;persist();paint();
};
$('apply-hint').onclick=()=>{const r=currentHint?.rect;if(!r)return;commit(r.r*puzzle.size+r.c,(r.r+r.h-1)*puzzle.size+r.c+r.w-1);};
$('hide-hint').onclick=()=>{$('hint-panel').hidden=true;currentHint=null;paint();};
$('restart').onclick=()=>$('restart-dialog').showModal();
$('cancel-restart').onclick=()=>$('restart-dialog').close();
$('confirm-restart').onclick=()=>{$('restart-dialog').close();try{localStorage.removeItem('sg:'+puzzle.id);}catch{}load();};
function gameUrl() {
 if(fixed)return location.origin+location.pathname;
 return `${location.origin}/${mode==='daily'?'daily':'practice'}/?${mode==='daily'?'date='+date:'seed='+practiceSeed}&level=${level}`;
}
async function copy(text,message) {try{await navigator.clipboard.writeText(text);$('status').textContent=message;}catch{$('share-fallback').hidden=false;$('share-fallback').textContent=text;$('status').textContent='Copy the text shown below.';}}
$('copy-puzzle').onclick=()=>copy(gameUrl(),'Puzzle link copied.');
$('share').onclick=()=>copy(`Shikaku Grove · ${mode==='daily'?date:'Practice'}\n${puzzle.size}×${puzzle.size} · ${time(seconds())} · ${state.hints} hints\n${'▧'.repeat(Math.min(5,puzzle.size))} Solved\n${gameUrl()}`,'Result copied — ready to share.');
$('next').onclick=()=>{location.href='/practice/?level='+level;};
document.querySelectorAll('[name=level]').forEach(input=>input.onchange=()=>{checkpoint();level=input.value;load();});
function checkpoint(){if(state?.startedAt&&!state.finished){state.elapsed+=Date.now()-state.startedAt;state.startedAt=null;persist();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)checkpoint();});
window.addEventListener('pagehide',checkpoint);
setInterval(()=>{if(!document.hidden){$('timer').textContent=time(seconds());if(state.startedAt){state.elapsed+=Date.now()-state.startedAt;state.startedAt=Date.now();persist();}}},1000);
$('print').onclick=()=>{const paper=$('print-game');paper.innerHTML=`<h1>Shikaku Grove</h1><p>${puzzle.size} × ${puzzle.size} · ${mode==='daily'?date:'Practice'}</p>${boardMarkup(puzzle)}<p>Divide the grid into rectangles. Each rectangle contains one number equal to its area. Cover every cell without overlaps.</p><p>${gameUrl()}</p>`;document.body.classList.add('printing-game');window.print();};
window.addEventListener('afterprint',()=>document.body.classList.remove('printing-game'));
load();
