const crypto=require("crypto");
module.exports=(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const admin=String(req.headers["x-admin-key"]||"");
  if(!process.env.OOGUN_ADMIN_KEY||admin!==process.env.OOGUN_ADMIN_KEY) return res.status(401).json({error:"Invalid admin key"});
  const body=req.body||{};
  const days=Math.max(1,Math.min(365,Number(body.days)||30));
  const scope=String(body.scope||"all").slice(0,120);
  const label=String(body.label||"Private reader").slice(0,80);
  const data={n:crypto.randomBytes(8).toString("base64url"),e:Date.now()+days*86400000,s:scope};
  const payload=Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig=crypto.createHmac("sha256",process.env.OOGUN_ACCESS_SECRET).update(payload).digest("base64url").slice(0,22);
  const password="OG1."+payload+"."+sig;
  return res.status(200).json({password,label,scope,expiresAt:new Date(data.e).toISOString()});
};
