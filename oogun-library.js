(()=>{
  const C=window.OOGUN_CATALOG||[];
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const sourceLabel={livestock:"Livestock",awise:"Awíṣe & Voice",baba:"Baba Oogun Archive"};
  const HOME_ORDER=[...C];
  const ARCHIVE_DATE="08 OCT 2026";
  const whatsappUrl=x=>"https://wa.me/2347047604452?text="+encodeURIComponent("Hello Isese Ponbele, I need an access code for the Oogun document: "+x.title);
  const whatsappIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.1 4.2a11.5 11.5 0 0 0-9.9 17.4L4.5 27.8l6.4-1.7a11.5 11.5 0 1 0 5.2-21.9Zm0 20.9c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.8 1 1-3.7-.2-.4a9.4 9.4 0 1 1 8.7 4.8Zm5.2-7c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-4-3.4-.3-.5.3-.5.8-1.7.1-.2 0-.4 0-.6l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.3-.6-.4Z"/></svg>';
  const card=x=>`<article class="oogun-preview-card">
    <div class="oogun-card-top"><span class="oogun-date">${ARCHIVE_DATE}</span><span class="locked-pill">🔒 Protected</span></div>
    <small>${esc(sourceLabel[x.source]||x.sourceName)}</small>
    <h3>${esc(x.title)}</h3>
    <p>${esc(x.subtitle?x.subtitle.replace(/^\\(|\\)$/g,""):x.preview)}</p>
    <a class="text-link" href="oogun-document.html?id=${encodeURIComponent(x.id)}">Preview document →</a>
  </article>`;

  const home=document.querySelector("#oogun-home-preview");
  if(home){
    const search=document.querySelector("#oogun-home-search");
    const more=document.querySelector("#oogun-home-more");
    let expanded=false;
    const draw=()=>{
      const q=(search?.value||"").toLowerCase().trim();
      const rows=HOME_ORDER.filter(x=>!q||[x.title,x.subtitle,x.sourceName,x.preview].join(" ").toLowerCase().includes(q));
      const shown=expanded||q?rows:rows.slice(0,12);
      home.classList.toggle("show-all",expanded||!!q);
      home.innerHTML=shown.map(card).join("");
      if(more){
        more.hidden=!!q||rows.length<=12;
        more.textContent=expanded?"Show fewer previews":`Show all ${rows.length} Oogun previews`;
      }
    };
    search?.addEventListener("input",draw);
    more?.addEventListener("click",()=>{expanded=!expanded;draw();});
    draw();
  }

  const list=document.querySelector("#oogun-library-list");
  if(list){
    const search=document.querySelector("#oogun-library-search");
    const filters=[...document.querySelectorAll("[data-oogun-source]")];
    const count=document.querySelector("#oogun-library-count");
    let source="all";
    const draw=()=>{
      const q=(search?.value||"").toLowerCase().trim();
      const rows=C.filter(x=>(source==="all"||x.source===source)&&(!q||[x.title,x.subtitle,x.sourceName,x.preview].join(" ").toLowerCase().includes(q)));
      if(count) count.textContent=`${rows.length} protected web documents`;
      list.innerHTML=rows.map(card).join("");
    };
    search?.addEventListener("input",draw);
    filters.forEach(b=>b.addEventListener("click",()=>{source=b.dataset.oogunSource;filters.forEach(x=>x.classList.toggle("active",x===b));draw();}));
    draw();
  }

  const docRoot=document.querySelector("#oogun-document-root");
  if(docRoot){
    const id=new URLSearchParams(location.search).get("id");
    const x=C.find(v=>v.id===id);
    if(!x){docRoot.innerHTML='<div class="empty-state">Document not found.</div>';return;}
    document.title=x.title+" — Isese Ponbele";
    const renderLocked=(msg="")=>{
      docRoot.innerHTML=`<article class="protected-document">
        <div class="document-kicker"><span>${esc(x.sourceName)}</span><span>${ARCHIVE_DATE}</span></div>
        <h1>${esc(x.title)}</h1>
        ${x.subtitle?`<p class="doc-subtitle">${esc(x.subtitle.replace(/^\\(|\\)$/g,""))}</p>`:""}
        <div class="document-preview-box"><strong>Document preview</strong><p>${esc(x.preview)}</p></div>
        <div class="unlock-panel">
          <div><span class="lock-icon">🔒</span><h2>Protected Oogun document</h2><p>Enter your individual access code, or request one directly on WhatsApp.</p></div>
          <a class="whatsapp-code-btn" href="${whatsappUrl(x)}" target="_blank" rel="noopener">${whatsappIcon}<span>Get access code on WhatsApp</span></a>
          <form id="oogun-unlock-form"><input id="oogun-password" type="password" autocomplete="current-password" placeholder="Access code" required><button class="btn btn-gold" type="submit">Unlock document</button></form>
          <p class="unlock-error" id="oogun-unlock-error">${esc(msg)}</p>
        </div>
      </article>`;
      const saved=sessionStorage.getItem("oogun_access_password")||"";
      const input=document.querySelector("#oogun-password"); if(input&&saved) input.value=saved;
      document.querySelector("#oogun-unlock-form")?.addEventListener("submit",async e=>{
        e.preventDefault();
        const password=input.value.trim();
        const button=e.currentTarget.querySelector("button"); button.disabled=true; button.textContent="Unlocking…";
        try{
          const r=await fetch("/api/oogun",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:x.id,password})});
          const data=await r.json();
          if(!r.ok) throw new Error(data.error||"Access denied");
          sessionStorage.setItem("oogun_access_password",password);
          renderOpen(data.document);
        }catch(err){renderLocked(err.message||"Access denied");}
      });
    };
    const renderOpen=d=>{
      const body=esc(d.content||"").replace(/\n/g,"<br>");
      docRoot.innerHTML=`<article class="protected-document open secure-oogun-document">
        <div class="document-kicker"><span>${esc(d.sourceName)}</span><span>${ARCHIVE_DATE}</span><span class="unlocked-pill">✓ Unlocked</span></div>
        <h1>${esc(d.title)}</h1>
        ${d.subtitle?`<p class="doc-subtitle">${esc(d.subtitle.replace(/^\\(|\\)$/g,""))}</p>`:""}
        <div class="source-document-note">Presented as cultural/source documentation from the uploaded collection. Traditional or medicinal claims are not presented as verified medical or veterinary advice.</div>
        <div class="content-protection-note">🔒 Copying, text selection and printing are disabled for this protected document.</div>
        <div class="oogun-source-text" data-protected-content>${body}</div>
      </article>`;
      enableContentProtection();
    };
    renderLocked();
  }

  const enableContentProtection=()=>{
    const root=document.querySelector(".secure-oogun-document");
    if(!root||root.dataset.protectionReady==="1") return;
    root.dataset.protectionReady="1";

    const blocked=e=>{e.preventDefault();e.stopPropagation();};
    ["copy","cut","contextmenu","dragstart","selectstart"].forEach(type=>root.addEventListener(type,blocked,{capture:true}));

    const shield=document.createElement("div");
    shield.className="oogun-capture-shield";
    shield.innerHTML='<div><span>🔒</span><strong>Protected Oogun Document</strong><small>Screen capture is restricted.</small></div>';
    document.body.appendChild(shield);

    let shieldTimer=0;
    const flashShield=()=>{
      document.body.classList.add("oogun-capture-blocked");
      clearTimeout(shieldTimer);
      shieldTimer=setTimeout(()=>document.body.classList.remove("oogun-capture-blocked"),1100);
    };

    document.addEventListener("keydown",e=>{
      const key=String(e.key||"").toLowerCase();
      const mod=e.ctrlKey||e.metaKey;
      if((mod&&["c","x","a","s","p","u"].includes(key))||key==="printscreen"||(e.metaKey&&e.shiftKey&&["3","4","5"].includes(key))){
        blocked(e); flashShield();
        if(navigator.clipboard&&key==="printscreen") navigator.clipboard.writeText("").catch(()=>{});
      }
    },true);

    window.addEventListener("blur",()=>document.body.classList.add("oogun-window-unfocused"));
    window.addEventListener("focus",()=>document.body.classList.remove("oogun-window-unfocused"));
    document.addEventListener("visibilitychange",()=>document.body.classList.toggle("oogun-window-unfocused",document.hidden));
  };

  const manager=document.querySelector("#access-manager-root")||document.querySelector("#access-generator-form");
  if(manager){
    const scope=document.querySelector("#access-scope");
    if(scope) scope.innerHTML='<option value="all">All protected Oogun documents</option>'+C.map(x=>`<option value="${esc(x.id)}">${esc(x.title)} (#${esc(x.number)})</option>`).join("");
    document.querySelector("#access-generator-form")?.addEventListener("submit",async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const out=document.querySelector("#generated-access");
      out.textContent="Generating…";
      try{
        const r=await fetch("/api/generate-password",{method:"POST",headers:{"Content-Type":"application/json","x-admin-key":String(fd.get("adminKey")||"")},body:JSON.stringify({label:fd.get("label"),days:Number(fd.get("days")||30),scope:fd.get("scope")})});
        const data=await r.json(); if(!r.ok) throw new Error(data.error||"Could not generate password");
        out.innerHTML=`<strong>Individual password</strong><code id="access-code">${esc(data.password)}</code><small>Recipient: ${esc(data.label)} · Expires: ${esc(new Date(data.expiresAt).toLocaleString())}</small><button type="button" class="btn btn-dark" id="copy-access">Copy password</button>`;
        document.querySelector("#copy-access")?.addEventListener("click",async()=>{await navigator.clipboard.writeText(data.password);document.querySelector("#copy-access").textContent="Copied ✓";});
      }catch(err){out.textContent=err.message||"Could not generate password";}
    });
  }
})();