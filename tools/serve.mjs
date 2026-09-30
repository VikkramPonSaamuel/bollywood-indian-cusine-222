import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.mp4':'video/mp4','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain; charset=utf-8' };
http.createServer((req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';}catch{res.writeHead(400);return res.end();}
  const target=path.resolve(root,name),type=mime[path.extname(target).toLowerCase()];
  if(!target.startsWith(root+path.sep)||!type||name.split('/').some(p=>p.startsWith('.'))){res.writeHead(404);return res.end();}
  fs.stat(target,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404);return res.end();}
    let real;try{real=fs.realpathSync(target);}catch{res.writeHead(404);return res.end();}
    if(!real.startsWith(root+path.sep)){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',type);res.setHeader('Content-Length',stat.size);
    if(req.method==='HEAD')return res.end();const stream=fs.createReadStream(real);stream.on('error',()=>res.destroy());stream.pipe(res);
  });
}).listen(8080,'127.0.0.1',()=>console.log('Local website: http://127.0.0.1:8080'));
