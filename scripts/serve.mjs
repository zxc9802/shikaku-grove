import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('dist'), port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.json':'application/json'};
createServer(async(req,res)=>{
 let path;try{path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 let file=resolve(root,'.'+path);
 if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
 try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);}
 catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(await readFile(resolve(root,'404.html')));}
}).listen(port,'127.0.0.1',()=>console.log(`Shikaku Grove: http://127.0.0.1:${port}`));
