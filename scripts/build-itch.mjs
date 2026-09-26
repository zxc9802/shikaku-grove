import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { generate, dailyKey } from '../src/engine.js';
import { gameMarkup, escape } from '../src/render.js';

const config=JSON.parse(await readFile(new URL('../site.config.json',import.meta.url),'utf8'));
const origin=config.url.replace(/\/$/,''), out=new URL('../.private/publishing/itch-game/',import.meta.url);
await mkdir(new URL('assets/',out),{recursive:true});
for(const name of ['engine.js','game.js','render.js','style.css']) await cp(new URL('../src/'+name,import.meta.url),new URL('assets/'+name,out));
const puzzle=generate(`grove-v1-${dailyKey()}-easy`,5);
const game=gameMarkup(puzzle,{publicOrigin:origin}).replace('href="/printable/"',`href="${escape(origin)}/printable/" target="_blank" rel="noopener"`);
await writeFile(new URL('index.html',out),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shikaku Grove</title><link rel="stylesheet" href="./assets/style.css"><script type="module" src="./assets/game.js"></script><style>.container{max-width:650px;padding:18px}h1{font-size:32px;margin-bottom:8px}.embed-intro{font-size:14px}.embed-links{display:flex;gap:20px;flex-wrap:wrap;font-size:13px;margin-top:24px}</style></head><body><main class="container"><h1>Shikaku Grove</h1><p class="embed-intro">One number. One rectangle. Every cell covered.<br>Fresh daily grids at 00:00 UTC; keep playing with practice puzzles.</p>${game}<nav class="embed-links" aria-label="More from Shikaku Grove"><a href="${escape(origin)}/" target="_blank" rel="noopener">Visit Shikaku Grove ↗</a><a href="${escape(origin)}/how-to-play/" target="_blank" rel="noopener">Worked example ↗</a><a href="${escape(origin)}/privacy/" target="_blank" rel="noopener">Privacy ↗</a></nav><p class="caption">Progress is saved in this browser when storage is available. Embedded saves are separate from the main website.</p></main><div id="print-game"></div></body></html>`);
execFileSync('zip',['-q','-r','../shikaku-grove-html5.zip','index.html','assets'],{cwd:fileURLToPath(out)});
console.log('HTML5 package: .private/publishing/shikaku-grove-html5.zip');
