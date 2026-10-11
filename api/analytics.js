const crypto=require("crypto");

const BOT_RE=/bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|google-inspectiontool|lighthouse/i;

function clean(v,max=180){
  return String(v||"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,max);
}
function safePath(v){
  let p=clean(v,220);
  if(!p.startsWith("/")) p="/";
  return p.split("?")[0].split("#")[0]||"/";
}
function refHost(v){
  try{return clean(new URL(String(v||"")).hostname,120)||"Direct";}catch{return "Direct";}
}
function device(ua){
  ua=String(ua||"");
  if(/ipad|tablet/i.test(ua)) return "Tablet";
  if(/mobi|iphone|android/i.test(ua)) return "Mobile";
  return "Desktop";
}
function browser(ua){
  ua=String(ua||"");
  if(/edg\//i.test(ua)) return "Edge";
  if(/opr\//i.test(ua)) return "Opera";
  if(/firefox\//i.test(ua)) return "Firefox";
  if(/chrome\//i.test(ua)&&!/chromium/i.test(ua)) return "Chrome";
  if(/safari\//i.test(ua)&&!/chrome|chromium|android/i.test(ua)) return "Safari";
  return "Other";
}
function allowedOrigin(req){
  const origin=String(req.headers.origin||"");
  if(!origin) return true;
  return /^https:\/\/(www\.)?onisese\.ng$/i.test(origin) || /^https:\/\/[-a-z0-9]+(?:-[-a-z0-9]+)*\.vercel\.app$/i.test(origin);
}

module.exports=async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  if(!allowedOrigin(req)) return res.status(403).json({error:"Origin not allowed"});
  const ua=String(req.headers["user-agent"]||"");
  if(BOT_RE.test(ua)) return res.status(200).json({tracked:false});

  const body=req.body||{};
  const type=String(body.type||"");
  if(type!=="pageview"&&type!=="heartbeat") return res.status(400).json({error:"Invalid event"});
  const rawId=clean(body.visitorId,100);
  if(rawId.length<8) return res.status(400).json({error:"Invalid visitor"});
  const visitor=crypto.createHash("sha256").update(rawId).digest("hex").slice(0,24);
  const now=Date.now();
  const event={
    type,
    ts:now,
    visitor,
    path:safePath(body.path),
    referrer:refHost(body.referrer),
    country:clean(req.headers["x-vercel-ip-country"]||"Unknown",8),
    device:device(ua),
    browser:browser(ua),
    utmSource:clean(body.utmSource,80),
    utmMedium:clean(body.utmMedium,80),
    utmCampaign:clean(body.utmCampaign,100)
  };

  try{
    const {put}=await import("@vercel/blob");
    if(type==="heartbeat"){
      await put("analytics/presence/"+visitor+".json",JSON.stringify(event),{
        access:"private",
        addRandomSuffix:false,
        allowOverwrite:true,
        contentType:"application/json",
        cacheControlMaxAge:0
      });
    }else{
      const day=new Date(now).toISOString().slice(0,10);
      await put("analytics/events/"+day+"/"+now+"-"+crypto.randomUUID()+".json",JSON.stringify(event),{
        access:"private",
        addRandomSuffix:false,
        contentType:"application/json",
        cacheControlMaxAge:0
      });
    }
    return res.status(200).json({tracked:true});
  }catch(e){
    console.error("analytics-write",e);
    return res.status(503).json({error:"Analytics temporarily unavailable"});
  }
};