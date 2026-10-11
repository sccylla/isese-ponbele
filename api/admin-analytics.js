const crypto=require("crypto");

function eq(a,b){
  const A=Buffer.from(String(a||"")),B=Buffer.from(String(b||""));
  return A.length===B.length&&crypto.timingSafeEqual(A,B);
}
function b64(v){return Buffer.from(JSON.stringify(v)).toString("base64url");}
function issueToken(){
  const payload=b64({exp:Date.now()+12*60*60*1000});
  const key=process.env.OOGUN_ACCESS_SECRET||process.env.OOGUN_ADMIN_KEY||"";
  const sig=crypto.createHmac("sha256",key).update(payload).digest("base64url");
  return payload+"."+sig;
}
function validToken(token){
  try{
    const [payload,sig]=String(token||"").split(".");
    if(!payload||!sig) return false;
    const key=process.env.OOGUN_ACCESS_SECRET||process.env.OOGUN_ADMIN_KEY||"";
    if(!key) return false;
    const expected=crypto.createHmac("sha256",key).update(payload).digest("base64url");
    if(!eq(sig,expected)) return false;
    const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
    return Number(data.exp)>Date.now();
  }catch{return false;}
}
async function listAll(prefix,max=6000){
  const {list}=await import("@vercel/blob");
  let cursor,all=[];
  do{
    const r=await list({prefix,limit:1000,cursor});
    all.push(...(r.blobs||[]));
    cursor=r.hasMore?r.cursor:undefined;
  }while(cursor&&all.length<max);
  return all.slice(0,max);
}
async function readJson(pathname){
  const {get}=await import("@vercel/blob");
  const r=await get(pathname,{access:"private",useCache:false});
  if(!r||!r.stream) return null;
  const txt=await new Response(r.stream).text();
  try{return JSON.parse(txt);}catch{return null;}
}
async function readMany(blobs,limit=5000){
  const selected=blobs.slice(-limit), out=[];
  for(let i=0;i<selected.length;i+=40){
    const chunk=await Promise.all(selected.slice(i,i+40).map(b=>readJson(b.pathname).catch(()=>null)));
    out.push(...chunk.filter(Boolean));
  }
  return out;
}
function top(rows,key,n=10){
  const m=new Map();
  for(const r of rows){
    const k=String(r[key]||"Unknown")||"Unknown";
    m.set(k,(m.get(k)||0)+1);
  }
  return [...m].sort((a,b)=>b[1]-a[1]).slice(0,n).map(([name,value])=>({name,value}));
}
function dayKey(ts){
  try{
    return new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(ts));
  }catch{return new Date(ts).toISOString().slice(0,10);}
}
function daysSeries(rows,days){
  const map=new Map();
  const fmt=d=>dayKey(d.getTime());
  const now=new Date();
  for(let i=days-1;i>=0;i--){
    const d=new Date(now.getTime()-i*86400000);
    map.set(fmt(d),{date:fmt(d),pageviews:0,visitors:new Set()});
  }
  for(const r of rows){
    const k=dayKey(r.ts);
    const x=map.get(k);
    if(x){x.pageviews++;x.visitors.add(r.visitor);}
  }
  return [...map.values()].map(x=>({date:x.date,pageviews:x.pageviews,visitors:x.visitors.size}));
}

module.exports=async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const body=req.body||{};
  if(body.action==="login"){
    const admin=String(process.env.OOGUN_ADMIN_KEY||"");
    if(!admin||!eq(body.password,admin)) return res.status(401).json({error:"Invalid admin key"});
    return res.status(200).json({token:issueToken(),expiresIn:43200});
  }
  if(body.action!=="summary"||!validToken(body.token)) return res.status(401).json({error:"Session expired"});

  const days=Math.max(1,Math.min(30,Number(body.days)||7));
  const since=Date.now()-days*86400000;
  try{
    const [eventBlobs,presenceBlobs]=await Promise.all([
      listAll("analytics/events/",10000),
      listAll("analytics/presence/",5000)
    ]);
    const relevant=eventBlobs.filter(b=>new Date(b.uploadedAt).getTime()>=since);
    const events=(await readMany(relevant,5000)).filter(x=>Number(x.ts)>=since);
    const presence=await readMany(presenceBlobs,5000);
    const online=presence.filter(x=>Date.now()-Number(x.ts)<90000);
    const onlineVisitors=new Map();
    online.forEach(x=>onlineVisitors.set(x.visitor,x));
    const today=dayKey(Date.now());
    const todayRows=events.filter(x=>dayKey(x.ts)===today);
    const unique=new Set(events.map(x=>x.visitor)).size;
    const uniqueToday=new Set(todayRows.map(x=>x.visitor)).size;

    return res.status(200).json({
      generatedAt:Date.now(),
      days,
      onlineNow:onlineVisitors.size,
      pageviews:events.length,
      visitors:unique,
      pageviewsToday:todayRows.length,
      visitorsToday:uniqueToday,
      topPages:top(events,"path",12),
      countries:top(events,"country",12),
      devices:top(events,"device",8),
      browsers:top(events,"browser",8),
      referrers:top(events,"referrer",12),
      utmSources:top(events.filter(x=>x.utmSource),"utmSource",10),
      daily:daysSeries(events,days),
      onlinePages:top([...onlineVisitors.values()],"path",10),
      recent:events.sort((a,b)=>b.ts-a.ts).slice(0,30).map(x=>({
        ts:x.ts,path:x.path,country:x.country,device:x.device,browser:x.browser,referrer:x.referrer
      })),
      truncated:relevant.length>5000
    });
  }catch(e){
    console.error("admin-analytics",e);
    return res.status(503).json({error:"Analytics data is temporarily unavailable"});
  }
};