import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const BASE=(process.env.SEO_BASE_URL||'https://www.onisese.ng').replace(/\/$/,'');
const HOST=new URL(BASE).host;
const KEY='a9f09a6a309b82b26ebba80a6f2a63c5';
const KEY_URL=BASE+'/'+KEY+'.txt';
const MODE=process.env.INDEX_MODE||'changed';
const BEFORE=process.env.BEFORE_SHA||'';
const AFTER=process.env.AFTER_SHA||'';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=u=>{try{const x=new URL(u,BASE);if(x.origin!==new URL(BASE).origin)return null;x.hash='';return x.href}catch{return null}};
async function fetchText(url,fetchImpl){
  const r=await fetchImpl(url,{headers:{'user-agent':'IsesePonbele-SEO-Indexer/1.0'},cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(!r.ok) throw new Error(url+' returned '+r.status);
  return await r.text();
}
export async function sitemapUrls(url,fetchImpl=fetch,seen=new Set()){
  if(!clean(url))throw new Error('Sitemap host does not match SEO_BASE_URL: '+url);
  if(seen.has(url))throw new Error('Repeated or cyclic sitemap: '+url);
  seen.add(url);
  const xml=await fetchText(url,fetchImpl);
  const locs=[...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(m=>m[1].trim());
  if(/<sitemapindex\b/i.test(xml)){
    if(!locs.length)throw new Error('Empty sitemap index: '+url);
    const nested=[];for(const loc of locs)nested.push(...await sitemapUrls(loc,fetchImpl,seen));return nested;
  }
  const entries=[...xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map(m=>{
    const loc=m[1].match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim();
    const lastmod=m[1].match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim()||'';
    return {url:loc ? clean(loc.replace(/&amp;/g,'&')) : null,lastmod};
  });
  if(!entries.length||entries.some(x=>!x.url))throw new Error('Sitemap is empty or contains URLs outside SEO_BASE_URL: '+url);
  return entries;
}
function changedFiles(){
  if(!BEFORE||!AFTER)return[];
  if(/^0+$/.test(BEFORE))return['sitemap.xml'];
  try{return execFileSync('git',['diff','--name-only',BEFORE,AFTER],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean)}catch{throw new Error('Cannot compare push commits; check that checkout fetched the full Git history.');}
}
function urlForFile(file){
  if(file==='index.html')return BASE+'/';
  if(file.endsWith('.html')&&!['404.html','access-manager.html','oogun-document.html'].includes(file))return BASE+'/'+file;
  return null;
}
export function choose(entries,{mode=MODE,files=changedFiles(),now=Date.now()}={}){
  if(mode==='all')return entries.map(x=>x.url);
  if(mode==='recent'){
    const cutoff=now-72*60*60*1000;
    return entries.filter(x=>x.lastmod&&Date.parse(x.lastmod)>=cutoff).map(x=>x.url);
  }
  if(mode!=='changed')throw new Error('Unsupported INDEX_MODE: '+mode);
  if(!files.length)return[];
  if(files.some(f=>/^(sitemap.*\.xml|robots\.txt|vercel\.json|api\/(dictionary-data\.json|dictionary\.js|word\.js)|lib\/dictionary\.cjs|scripts\/seo-indexer\.mjs|\.github\/workflows\/search-engine-indexing\.yml)$/.test(f)))return entries.map(x=>x.url);
  const listed=new Set(entries.map(x=>x.url));
  const out=new Set();
  for(const f of files){
    const u=urlForFile(f);if(u&&listed.has(u))out.add(u);
    if(f==='data.js'){
      for(const e of entries)if(e.url.includes('/word/')||/\/(dictionary|store|orisas|orisa)\.html/.test(e.url))out.add(e.url);
    }
    if(f==='oogun-catalog.js'||f==='oogun-library.js')out.add(BASE+'/oogun.html');
    if(f==='api/orisa.js'||f==='api/orisa-data.json'||f==='orisa-publications.js'){
      for(const e of entries)if(e.url.includes('/orisa/')||e.url===BASE+'/orisas.html')out.add(e.url);
    }
  }
  return [...out];
}
async function verifyKey(fetchImpl){
  const r=await fetchImpl(KEY_URL,{cache:'no-store',signal:AbortSignal.timeout(20000)});
  return r.ok&&(await r.text()).trim()===KEY;
}
export async function submit(urls,fetchImpl=fetch,pause=sleep){
  const unique=[...new Set(urls)].filter(Boolean);
  if(!unique.length){console.log('No URLs need IndexNow notification.');return}
  for(let i=0;i<unique.length;i+=500){
    const batch=unique.slice(i,i+500);
    const r=await fetchImpl('https://api.indexnow.org/indexnow',{
      method:'POST',
      signal:AbortSignal.timeout(20000),
      headers:{'content-type':'application/json; charset=utf-8','user-agent':'IsesePonbele-SEO-Indexer/1.0'},
      body:JSON.stringify({host:HOST,key:KEY,keyLocation:KEY_URL,urlList:batch})
    });
    const body=await r.text();
    console.log('IndexNow batch',i/500+1,'status',r.status,body.slice(0,300));
    if(![200,202].includes(r.status))throw new Error('IndexNow rejected a batch with '+r.status);
    await pause(700);
  }
  console.log('Submitted',unique.length,'URLs to IndexNow.');
}
export async function main({fetchImpl=fetch,dryRun=process.env.INDEX_DRY_RUN==='1',mode=MODE}={}){
  const entries=await sitemapUrls(BASE+'/sitemap.xml',fetchImpl);
  console.log('Discovered',entries.length,'crawlable URLs from sitemap(s).');
  const selected=choose(entries,{mode});
  if(dryRun){console.log('Dry run:',selected.length,'URLs selected; no notifications sent.');return selected;}
  if(!selected.length){console.log('No URLs need IndexNow notification.');return [];}
  if(!await verifyKey(fetchImpl))throw new Error('IndexNow key file is missing or incorrect at '+KEY_URL+'. Deploy the site and rerun this workflow.');
  await submit(selected,fetchImpl);
  console.log('IndexNow notifies participating search engines, not Google. Submit sitemap.xml in Google Search Console.');
  return selected;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{console.error(error.message);process.exitCode=1;});
}
