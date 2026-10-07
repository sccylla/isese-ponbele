import { execFileSync } from 'node:child_process';

const BASE=(process.env.SEO_BASE_URL||'https://isese-ponbele.vercel.app').replace(/\/$/,'');
const HOST=new URL(BASE).host;
const KEY='a9f09a6a309b82b26ebba80a6f2a63c5';
const KEY_URL=BASE+'/'+KEY+'.txt';
const MODE=process.env.INDEX_MODE||'changed';
const BEFORE=process.env.BEFORE_SHA||'';
const AFTER=process.env.AFTER_SHA||'';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=u=>{try{const x=new URL(u,BASE);if(x.host!==HOST)return null;x.hash='';return x.href}catch{return null}};
async function fetchText(url){
  const r=await fetch(url,{headers:{'user-agent':'IsesePonbele-SEO-Indexer/1.0'},cache:'no-store'});
  if(!r.ok) throw new Error(url+' returned '+r.status);
  return await r.text();
}
async function sitemapUrls(url,depth=0){
  const xml=await fetchText(url);
  const locs=[...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(m=>m[1].trim());
  if(/<sitemapindex\b/i.test(xml)&&depth<2){
    const nested=[];for(const loc of locs)nested.push(...await sitemapUrls(loc,depth+1));return nested;
  }
  return [...xml.matchAll(/<url>[\s\S]*?<loc>([\s\S]*?)<\/loc>[\s\S]*?(?:<lastmod>([\s\S]*?)<\/lastmod>)?[\s\S]*?<\/url>/gi)]
    .map(m=>({url:clean(m[1].trim()),lastmod:(m[2]||'').trim()})).filter(x=>x.url);
}
function changedFiles(){
  if(!BEFORE||!AFTER||/^0+$/.test(BEFORE))return[];
  try{return execFileSync('git',['diff','--name-only',BEFORE,AFTER],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean)}catch{return[]}
}
function urlForFile(file){
  if(file==='index.html')return BASE+'/';
  if(file.endsWith('.html')&&!['404.html','access-manager.html','oogun-document.html'].includes(file))return BASE+'/'+file;
  return null;
}
async function choose(entries){
  if(MODE==='all')return entries.map(x=>x.url);
  if(MODE==='recent'){
    const cutoff=Date.now()-72*60*60*1000;
    return entries.filter(x=>x.lastmod&&Date.parse(x.lastmod)>=cutoff).map(x=>x.url);
  }
  const files=changedFiles();
  if(!files.length)return[];
  if(files.some(f=>/^sitemap|^robots\.txt$|^vercel\.json$|^api\/dictionary-data\.json$|^api\/word\.js$/.test(f)))return entries.map(x=>x.url);
  const out=new Set();
  for(const f of files){
    const u=urlForFile(f);if(u)out.add(u);
    if(f==='data.js'){
      for(const e of entries)if(e.url.includes('/word/')||/\/(dictionary|store|orisas|orisa)\.html/.test(e.url))out.add(e.url);
    }
    if(f==='oogun-catalog.js'||f==='oogun-library.js')out.add(BASE+'/oogun.html');
  }
  return [...out];
}
async function verifyKey(){
  try{const r=await fetch(KEY_URL,{cache:'no-store'});return r.ok&&(await r.text()).trim()===KEY}catch{return false}
}
async function submit(urls){
  const unique=[...new Set(urls)].filter(Boolean);
  if(!unique.length){console.log('No URLs need IndexNow notification.');return}
  for(let i=0;i<unique.length;i+=500){
    const batch=unique.slice(i,i+500);
    const r=await fetch('https://api.indexnow.org/indexnow',{
      method:'POST',
      headers:{'content-type':'application/json; charset=utf-8','user-agent':'IsesePonbele-SEO-Indexer/1.0'},
      body:JSON.stringify({host:HOST,key:KEY,keyLocation:KEY_URL,urlList:batch})
    });
    const body=await r.text();
    console.log('IndexNow batch',i/500+1,'status',r.status,body.slice(0,300));
    if(![200,202].includes(r.status))throw new Error('IndexNow rejected a batch with '+r.status);
    await sleep(700);
  }
  console.log('Submitted',unique.length,'URLs to IndexNow.');
}
if(!await verifyKey()){
  console.log('IndexNow key file is not live yet at',KEY_URL,'. Skipping safely; a later run can retry.');
  process.exit(0);
}
const entries=await sitemapUrls(BASE+'/sitemap.xml');
console.log('Discovered',entries.length,'crawlable URLs from sitemap(s).');
await submit(await choose(entries));
console.log('Google discovery is handled by robots.txt + sitemap.xml; submit the sitemap in Search Console after property verification.');
