const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../out'),prefix='/pc-november-open-implementation-preview';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain'};
http.createServer((req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 let u=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!u.startsWith(prefix)){res.writeHead(404);return res.end();}
 u=u.slice(prefix.length)||'/';let file=path.resolve(root,'.'+u);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
 if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
}).listen(3020,'127.0.0.1',()=>console.log('Static preview: http://localhost:3020'+prefix+'/'));
