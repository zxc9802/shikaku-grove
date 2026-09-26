import assert from 'node:assert/strict';
import {readFile,stat,readdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve('dist'), config=JSON.parse(await readFile('site.config.json','utf8'));
const pages=JSON.parse(await readFile('qa/page-map.json','utf8')), titles=new Set(),descriptions=new Set(),errors=[];
for(const page of pages){
 const html=await readFile(root+page.path+'index.html','utf8');
 try{
  assert.equal((html.match(/<h1[> ]/g)||[]).length,1,'one H1');
  assert(html.includes(`rel="canonical" href="${config.url+page.path}"`),'canonical URL');
  assert(!html.includes('noindex'),'indexable');assert(!titles.has(page.title),'unique title');titles.add(page.title);
  assert(!descriptions.has(page.description),'unique description');descriptions.add(page.description);
  assert(page.description.length>=50&&page.description.length<=180,'description length');
  assert(html.includes('lang="en"'),'English language');
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  for(const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)){
   const url=new URL(match[1],'https://check.test');let file=root+decodeURIComponent(url.pathname);if(url.pathname.endsWith('/'))file+='index.html';await stat(file);
  }
 }catch(error){errors.push(`${page.path}: ${error.message}`);}
}
const sitemap=await readFile(root+'/sitemap.xml','utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,pages.length,'sitemap page count');
assert((await readFile(root+'/robots.txt','utf8')).includes('Sitemap: '+config.url+'/sitemap.xml'));
async function walk(dir){for(const f of await readdir(dir,{withFileTypes:true})){assert(!/^\.private$|^research$|^\.env/.test(f.name),'private file excluded');if(f.isDirectory())await walk(dir+'/'+f.name);}}
await walk(root);
assert((await readFile(root+'/404.html','utf8')).includes('noindex,follow'));
const report={checkedAt:new Date().toISOString(),pages:pages.length,errors,checks:['canonical','unique title and description','single H1','internal links and assets','JSON-LD syntax','sitemap','robots','private file exclusion','404 noindex']};
await writeFile('qa/seo-check.json',JSON.stringify(report,null,2)+'\n');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`SEO checks passed for ${pages.length} pages.`);
