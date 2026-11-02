import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { mdsvex } from 'mdsvex';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
const root=process.cwd();
const output=path.join(root,'rendered');
await fs.mkdir(output,{recursive:true});
await fs.mkdir('.build',{recursive:true});
const files=(await fs.readdir(path.join(root,'src/routes/kb'),{recursive:true})).filter(f=>f.endsWith('+page.svx')).map(f=>path.join(root,'src/routes/kb',f)).sort();
const preprocess=mdsvex({layout:{runbook:path.join(root,'src/lib/layouts/runbook.svelte')}});
const tenants=await Promise.all((await fs.readdir(path.join(root,'src/lib/data/tenants'))).sort().map(async f=>JSON.parse(await fs.readFile(path.join(root,'src/lib/data/tenants',f),'utf8'))));
const css=new Map();
function plugin(generate){return {name:'kb-source',setup(b){
 b.onResolve({filter:/^#lib\//},args=>({path:path.join(root,'src/lib',args.path.slice(5))+(path.extname(args.path)?'':'.ts')}));
 b.onLoad({filter:/locales\.ts$/},async args=>({contents:(await fs.readFile(args.path,'utf8')).replace(/^const tenants = .*;$/m,`const tenants = ${JSON.stringify(tenants)};`),loader:'ts'}));
 b.onLoad({filter:/\.(svelte|svx)$/},async args=>{
  let source=await fs.readFile(args.path,'utf8');
  if(args.path.endsWith('KbIndex.svelte')){
   const children=files.filter(f=>f!==path.join(root,'src/routes/kb/+page.svx'));
   source=source.replace("const pages = import.meta.glob<{ metadata: Meta }>('/src/routes/kb/*/**/+page.svx', { eager: true });",children.map((f,i)=>`import { metadata as meta${i} } from ${JSON.stringify(f)};`).join('\n')+'\nconst pages = {'+children.map((f,i)=>`${JSON.stringify('/'+path.relative(root,f))}:{metadata:meta${i}}`).join(',')+'};');
  }
  if(args.path.endsWith('.svx')) source=(await preprocess.markup({content:source,filename:args.path})).code;
  const result=compile(source,{filename:args.path,generate,css:generate==='client'?'injected':'external'});
  if(result.css?.code)css.set(args.path,result.css.code);
  return {contents:result.js.code,loader:'js',resolveDir:path.dirname(args.path)};
 });
}};}
const imports=files.map((f,i)=>`import Page${i}, { metadata as meta${i} } from ${JSON.stringify(f)};`).join('\n');
const pages=files.map((f,i)=>`{component:Page${i},metadata:meta${i},route:${JSON.stringify('/'+path.relative(path.join(root,'src/routes'),path.dirname(f)))}}`).join(',');
await build({stdin:{contents:imports+`\nexport const pages=[${pages}];`,resolveDir:process.cwd(),sourcefile:'kb-entry.js'},outfile:'.build/server.mjs',bundle:true,platform:'node',format:'esm',packages:'external',plugins:[plugin('server')]});
const {pages:renderPages}=await import(pathToFileURL(path.resolve('.build/server.mjs'))+'?v='+Date.now());
await build({stdin:{contents:`import {hydrate} from 'svelte';\n${imports}\nconst pages=[${pages}];\nconst page=pages.find(p=>p.route===document.body.dataset.route);\nhydrate(page.component,{target:document.body});`,resolveDir:process.cwd(),sourcefile:'kb-browser.js'},outfile:path.join(output,'kb.js'),bundle:true,platform:'browser',format:'iife',plugins:[plugin('client')],conditions:['browser','svelte']});
for(const page of renderPages){
 const result=render(page.component);
 const rel=page.route.replace(/^\/kb\/?/,'');
 const dir=path.join(output,rel); await fs.mkdir(dir,{recursive:true});
 // Relative links keep the exported pages navigable on disk or on static hosting.
 const rewrite=html=>html.replace(/href="(\/kb(?:\/[^"#]*)?)"/g,(_,href)=>{
  const target=path.join(output,href.replace(/^\/kb\/?/,''),'index.html');
  return `href="${path.relative(dir,target)||'index.html'}"`;
 });
 const script=path.relative(dir,path.join(output,'kb.js'));
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${result.head}<style>${[...css.values()].join('\n')}</style></head><body data-route="${page.route}">${rewrite(result.body)}<script src="${script}"></script></body></html>`;
 await fs.writeFile(path.join(dir,'index.html'),html);
 console.log(page.route,html.length);
}
