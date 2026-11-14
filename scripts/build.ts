import {build} from 'vite';
import {build as bundle} from 'esbuild';
import {mkdir,writeFile,readFile,cp,rm} from 'node:fs/promises';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {marked} from 'marked';

const readEnv=(file:string)=>existsSync(file)?Object.fromEntries(readFileSync(file,'utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)]})):{} as Record<string,string>;
const applyLegal=(text:string,vars:Record<string,string>)=>{let out=text;for(const [k,v] of Object.entries(vars))out=out.split('['+k+']').join(v);return out};
const legalVars:Record<string,string>|null=existsSync('build-pack/legal.env')?{...readEnv('build-pack/legal.env'),CURRENT_YEAR:String(new Date().getFullYear())}:null;
const legal=(s:string)=>legalVars?applyLegal(s,legalVars):s;
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

const api=process.env.API_URL||readEnv('.env.production').API_URL||readEnv('.env').API_URL||'http://localhost:8787';
const iconSizes=[16,32,48,128] as const;
const icons=Object.fromEntries(iconSizes.map(s=>[String(s),'icons/'+s+'.png']));
const iconRun=spawnSync(process.execPath,['scripts/icons.mjs'],{stdio:'inherit'});
if(iconRun.status!==0)throw Error('Icon generation failed');

await build({root:'apps/extension',define:{SITE_URL:JSON.stringify(process.env.SITE_URL||'http://localhost:4173')},build:{rollupOptions:{input:{popup:'apps/extension/popup.html',welcome:'apps/extension/welcome.html'}}}});
await bundle({entryPoints:['apps/extension/worker.ts'],outfile:'apps/extension/dist/worker.js',bundle:true,format:'esm',define:{API_URL:JSON.stringify(api)}});
await mkdir('apps/extension/dist/icons',{recursive:true});
await cp('apps/extension/icons', 'apps/extension/dist/icons', {recursive:true});
await writeFile('apps/extension/dist/manifest.json',JSON.stringify({manifest_version:3,name:'SuperEasyOTP',version:'0.1.0',minimum_chrome_version:'127',description:'Your recent Gmail messages and sign-in codes, a click away.',icons,permissions:['identity','storage','alarms','clipboardWrite','notifications'],host_permissions:['https://gmail.googleapis.com/*',new URL(api).origin+'/*'],action:{default_popup:'popup.html',default_title:'SuperEasyOTP',default_icon:icons},background:{service_worker:'worker.js',type:'module'},content_security_policy:{extension_pages:"script-src 'self'; object-src 'none'"}},null,2));
await bundle({entryPoints:['apps/api/server.ts'],outfile:'apps/api/dist/server.js',bundle:true,platform:'node',format:'esm',packages:'external'});


const siteCss=await readFile('apps/web/site.css','utf8');
const fonts='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">';

const storeUrl=legalVars?.CHROME_STORE_URL&&!legalVars.CHROME_STORE_URL.startsWith('REPLACE_')?legalVars.CHROME_STORE_URL:'';
const sourceRepo=legalVars?.SOURCE_REPO_URL?.trim();
const repoUrl=sourceRepo&&!sourceRepo.startsWith('REPLACE_')?sourceRepo:'';
const githubUrl=repoUrl||'https://github.com/amit-hopium/supereasyotp';
const xUrl=(legalVars?.SOCIAL_X_URL?.trim()&&!legalVars.SOCIAL_X_URL.startsWith('REPLACE_')?legalVars.SOCIAL_X_URL:'https://x.com/studiohopium');
const footerSocial=`<span class="footer-social"><a class="footer-social-link" href="${esc(githubUrl)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg class="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.52-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg></a><a class="footer-social-link" href="${esc(xUrl)}" target="_blank" rel="noopener noreferrer" aria-label="X"><svg class="footer-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a></span>`;
const navCta=storeUrl?`<a class="site-nav-cta" href="${esc(storeUrl)}" rel="noopener noreferrer">Add to Chrome</a>`:`<a class="site-nav-cta" href="/docs/how-it-works/">How it works</a>`;
const heroPrimary=storeUrl?`<a class="btn btn-primary" href="${esc(storeUrl)}" rel="noopener noreferrer">Add to Chrome</a>`:`<a class="btn btn-primary" href="/docs/how-it-works/">See how it works</a>`;
const openSourceBadge=repoUrl
  ?`<a class="badge" href="${esc(repoUrl)}" rel="noopener noreferrer">Open source · view on GitHub</a>`
  :`<span class="badge">Open source project</span>`;

type SitePage={title:string;description:string;body:string;nav?:string;bare?:boolean};

const siteNav=(active?:string)=>`<header class="site-header"><a class="site-brand" href="/">Super<span>Easy</span>OTP</a><nav class="site-nav" aria-label="Primary">${[
  {href:'/docs/',id:'docs',label:'Docs'},
  {href:'/privacy/',id:'privacy',label:'Privacy'},
  {href:'/security/',id:'security',label:'Security'},
  {href:'/support/',id:'support',label:'Support'},
  {href:'/blog/',id:'blog',label:'Blog'},
].map(l=>`<a href="${l.href}"${active===l.id?' aria-current="page"':''}>${l.label}</a>`).join('')}${navCta}</nav></header>`;

const siteFooter=legal(`<footer class="site-footer">
<a href="/docs/">Docs</a>
<a href="/privacy/">Privacy</a>
<a href="/terms/">Terms</a>
<a href="/delete-data/">Delete data</a>
<a href="/security/">Security</a>
<a href="/support/">Support</a>
${footerSocial}
<span class="spacer"></span>
<span>© ${new Date().getFullYear()} [LEGAL_OPERATOR_NAME]. Not affiliated with Google.</span>
</footer>`);

// Toolbar extension icon toggles the mockup popup on every page; click-away closes it.
const extensionToggleScript=`<script>
(function(){
  const pop=document.getElementById('demo-extension-popup');
  const frame=document.getElementById('demo-popup-frame');
  const extBtn=document.getElementById('demo-ext-icon');
  if(!pop||!frame||!extBtn)return;
  const setOpen=(open)=>{
    pop.hidden=!open;
    extBtn.setAttribute('aria-expanded',String(open));
    if(open&&!frame.getAttribute('src'))frame.src='/demo/popup.html?embed=1';
  };
  extBtn.addEventListener('click',()=>setOpen(pop.hidden));
  document.addEventListener('pointerdown',(e)=>{
    if(pop.hidden)return;
    const t=e.target;
    if(pop.contains(t)||extBtn.contains(t))return;
    setOpen(false);
  });
  window.addEventListener('message',(e)=>{
    if(e.source!==frame.contentWindow||e.data?.type!=='instamail-demo-resize')return;
    const h=Math.min(600,Math.max(96,Math.round(Number(e.data.height)||0)));
    frame.style.height=h+'px';
    frame.classList.add('is-sized');
  });
})();
</script>`;

const demoChromeCta=storeUrl?`<a class="demo-site-cta" href="${esc(storeUrl)}" rel="noopener noreferrer">Add to Chrome</a>`:'';
const chromeLogoSvg=`<svg class="demo-site-chrome-icon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#fff"/><path d="M24 4a20 20 0 0 1 17.32 10H24a10 10 0 0 0-8.66 5L9.34 9.6A20 20 0 0 1 24 4z" fill="#ea4335"/><path d="M41.32 14A20 20 0 0 1 24 44l8.66-15A10 10 0 0 0 33.66 19z" fill="#fbbc05"/><path d="M24 44A20 20 0 0 1 6.68 14l8.66 15A10 10 0 0 0 24 34z" fill="#34a853"/><circle cx="24" cy="24" r="8.5" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg>`;
const demoChromeCtaButton=storeUrl
  ?`<a class="demo-site-cta-primary" href="${esc(storeUrl)}" rel="noopener noreferrer">${chromeLogoSvg}<span>Add to Chrome</span></a>`
  :`<a class="demo-site-cta-primary" href="/docs/how-it-works/">${chromeLogoSvg}<span>Add to Chrome</span></a>`;

// Primary nav: Features, Docs, FAQs, Blog (landing = menu dropdown; other pages = centered links).
type NavId='features'|'docs'|'faqs'|'blog';
const primaryNav:{id:NavId;href:string;label:string}[]=[
  {id:'features',href:'/features/',label:'Features'},
  {id:'docs',href:'/docs/',label:'Docs'},
  {id:'faqs',href:'/faqs/',label:'FAQs'},
  {id:'blog',href:'/blog/',label:'Blog'},
];
const demoSiteBrand=`<div class="demo-site-brand-wrap"><a class="demo-site-brand" href="/">Super<span>Easy</span>OTP</a><span class="demo-site-byline">by <a href="https://hopiumstudio.com" target="_blank" rel="noopener noreferrer">Hopium Studio</a></span></div>`;
const renderDemoSiteNavLinks=(active?:string)=>primaryNav.map(l=>`<a href="${l.href}"${active===l.id?' aria-current="page"':''}>${l.label}</a>`).join('');
const renderLandingMenuDropdown=`<div class="demo-site-menu">
  <button type="button" class="demo-site-menu-btn" id="demo-site-menu-btn" aria-expanded="false" aria-haspopup="true" aria-controls="demo-site-menu-panel">Menu<span class="demo-site-menu-caret" aria-hidden="true">&gt;</span></button>
  <div class="demo-site-menu-panel" id="demo-site-menu-panel" role="menu" hidden>
    ${primaryNav.map(l=>`<a role="menuitem" href="${l.href}">${l.label}</a>`).join('')}
  </div>
</div>`;
const renderLandingChromeHeader=`<header class="demo-site-header demo-site-header--landing">${demoSiteBrand}${renderLandingMenuDropdown}</header>`;
const renderInnerChromeHeader=(active?:string,withCta=false)=>`<header class="demo-site-header demo-site-header--inner">${demoSiteBrand}<nav class="demo-site-nav demo-site-nav--center" aria-label="Primary">${renderDemoSiteNavLinks(active)}</nav><div class="demo-site-header-end">${withCta?demoChromeCtaButton:''}</div></header>`;

const siteMenuScript=`<script>
(function(){
  const btn=document.getElementById('demo-site-menu-btn');
  const panel=document.getElementById('demo-site-menu-panel');
  if(!btn||!panel)return;
  const setOpen=(open)=>{
    panel.hidden=!open;
    btn.setAttribute('aria-expanded',String(open));
  };
  btn.addEventListener('click',(e)=>{e.stopPropagation();setOpen(panel.hidden);});
  document.addEventListener('pointerdown',(e)=>{
    if(panel.hidden)return;
    const t=e.target;
    if(panel.contains(t)||btn.contains(t))return;
    setOpen(false);
  });
})();
</script>`;

// Every page renders inside the same chrome browser shell with one shared header and footer.
// Only the home page keeps the two-panel split; other pages put their content in the copy panel.
const sharedFooter=`<footer class="demo-site-footer">${footerSocial}</footer>`;
const chromeShellPage=(page:SitePage)=>`<section class="landing-stage docs-stage" aria-label="${esc(page.title)}">
  <div class="laptop" role="group" aria-label="Chrome browser with SuperEasyOTP">
    <div class="chrome-window">
      <div class="chrome-tabstrip" aria-hidden="true">
        <div class="chrome-lights"><span class="chrome-light chrome-light-close"></span><span class="chrome-light chrome-light-min"></span><span class="chrome-light chrome-light-max"></span></div>
        <div class="chrome-tabs">
          <span class="chrome-tab chrome-tab-active"><img class="chrome-favicon" src="/demo/icons/16.png" width="16" height="16" alt=""><span class="chrome-tab-title">${esc(page.title)}</span><span class="chrome-tab-close">×</span></span>
          <span class="chrome-tab-new" aria-hidden="true">+</span>
        </div>
      </div>
      <div class="chrome-toolbar">
        <div class="chrome-nav">
          <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></span>
          <span class="chrome-navbtn chrome-navbtn-dim"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
          <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 4v5h-5"/></svg></span>
          <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></span>
        </div>
        <div class="chrome-omnibox"><svg class="chrome-lock" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg><span class="chrome-omnibox-text">supereasyotp.com</span></div>
        <div class="chrome-ext">
          <button type="button" class="chrome-ext-btn" id="demo-ext-icon" aria-label="SuperEasyOTP extension" aria-expanded="false"><img src="/demo/icons/32.png" width="18" height="18" alt=""><span class="chrome-ext-badge" id="demo-ext-badge" hidden aria-hidden="true"></span></button>
          <span class="chrome-navbtn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg></span>
        </div>
      </div>
      <div class="chrome-viewport">
        <div class="demo-site">
          <div class="demo-site-split">
            <div class="demo-site-section demo-site-section-copy">
              ${renderInnerChromeHeader(page.nav,true)}
              <div class="demo-site-copy-body docs-copy-body"><div class="docs-content">${page.body}</div></div>
              ${sharedFooter}
            </div>
            <div class="demo-site-section demo-site-section-visual" aria-hidden="true"></div>
          </div>
        </div>
        <div class="demo-extension-popup" id="demo-extension-popup" hidden>
          <iframe id="demo-popup-frame" title="SuperEasyOTP extension popup" src="/demo/popup.html?embed=1" width="326" loading="lazy"></iframe>
        </div>
      </div>
    </div>
  </div>
</section>${extensionToggleScript}`;

const renderSite=(page:SitePage)=>`<!doctype html><html lang="en" class="site home-landing"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page.title)}</title><meta name="description" content="${esc(page.description)}">${fonts}<style>${siteCss}</style></head><body class="home-landing"><main class="home-main">${chromeShellPage(page)}</main></body></html>`;

type DocTocItem={id:string;label:string;level:number};
const slugifyHeading=(raw:string)=>raw.replace(/<[^>]+>/g,'').replace(/&amp;/g,'and').replace(/&[^;]+;/g,'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'section';
async function markdownToDocHtml(md:string){
  let html=String(await marked.parse(md));
  const toc:DocTocItem[]=[];
  html=html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g,(_,level,inner)=>{
    const label=inner.replace(/<[^>]+>/g,'');
    const id=slugifyHeading(label);
    toc.push({id,label,level:+level});
    return `<h${level} id="${esc(id)}">${inner}</h${level}>`;
  });
  return {html,toc};
}
const renderDocToc=(items:DocTocItem[])=>!items.length?'':`<nav class="doc-toc" aria-label="On this page"><p class="doc-toc-label">On this page</p><ul>${items.map(i=>`<li class="doc-toc-l${i.level}"><a href="#${esc(i.id)}">${esc(i.label)}</a></li>`).join('')}</ul></nav>`;
const renderDocArticle=(opts:{eyebrow:string;title:string;lead:string;meta?:string;callout?:string;html:string;toc:DocTocItem[];backHref?:string;backLabel?:string;related?:string})=>`<div class="doc-page"><header class="doc-hero">${opts.eyebrow?`<p class="eyebrow">${esc(opts.eyebrow)}</p>`:''}<h1>${esc(opts.title)}</h1>${opts.meta?`<p class="doc-meta">${opts.meta}</p>`:''}<p class="doc-lead">${esc(opts.lead)}</p></header><div class="doc-layout">${renderDocToc(opts.toc)}<article class="doc-body prose wide legal">${opts.callout??''}${opts.html}</article></div>${opts.related?`<div class="doc-related prose wide">${opts.related}</div>`:''}${opts.backHref?`<p class="doc-back muted"><a href="${opts.backHref}">← ${esc(opts.backLabel??'Back')}</a></p>`:''}</div>`;

const landingScript=`<script>
(function(){
  const btn=document.getElementById('demo-request-otp');
  const pop=document.getElementById('demo-extension-popup');
  const frame=document.getElementById('demo-popup-frame');
  const badge=document.getElementById('demo-ext-badge');
  const extBtn=document.getElementById('demo-ext-icon');
  if(!btn||!pop||!frame)return;
  const rand=()=>String(Math.floor(100000+Math.random()*900000));
  const send=(code)=>{try{frame.contentWindow?.postMessage({type:'instamail-demo-otp',code},location.origin);}catch{}};
  const openPopup=()=>{
    pop.hidden=false;
    if(extBtn)extBtn.setAttribute('aria-expanded','true');
    if(!frame.getAttribute('src'))frame.src='/demo/popup.html?embed=1';
  };
  const closePopup=()=>{
    pop.hidden=true;
    if(extBtn)extBtn.setAttribute('aria-expanded','false');
  };
  // Click away from the mockup closes it: any pointer down in the page outside the popup and toolbar icon.
  document.addEventListener('pointerdown',(e)=>{
    if(pop.hidden)return;
    const t=e.target;
    if(pop.contains(t)||(extBtn&&extBtn.contains(t)))return;
    closePopup();
  });
  // Clicking the toolbar extension icon toggles the real popup open/closed.
  if(extBtn)extBtn.addEventListener('click',()=>{
    if(pop.hidden)openPopup();else closePopup();
  });
  const labelEl=btn.querySelector('.demo-otp-label');
  const COUNT_FROM=3;
  const otpArrow='<span class="demo-otp-arrow" aria-hidden="true">→</span>';
  let counting=false;
  let sentOnce=false;
  // Delivers an OTP to the mockup popup and opens it.
  const sendOtp=()=>{
    const code=rand();
    openPopup();
    if(badge)badge.hidden=false;
    const deliver=()=>send(code);
    if(frame.contentDocument?.readyState==='complete')deliver();
    else frame.addEventListener('load',deliver,{once:true});
    setTimeout(deliver,120);
    setTimeout(deliver,400);
  };
  // After the first OTP, the button is a plain "Send OTP" action.
  const markSent=()=>{
    sentOnce=true;
    if(labelEl)labelEl.innerHTML='<span class="demo-otp-label-text">Send a sample OTP</span>'+otpArrow;
    btn.disabled=false;
  };
  // Runs 4 -> 1 (one digit at a time), then opens the mockup popup with the OTP.
  const startCountdown=()=>{
    if(counting)return;
    counting=true;
    btn.disabled=true;
    if(labelEl){
      labelEl.innerHTML='<span class="demo-otp-label-text">Sending sample OTP in </span><span class="demo-otp-count" id="demo-otp-count"></span>'+otpArrow;
    }
    const countEl=document.getElementById('demo-otp-count');
    let n=COUNT_FROM;
    if(countEl)countEl.textContent=String(n);
    const timer=setInterval(()=>{
      n--;
      if(n>=1){if(countEl)countEl.textContent=String(n);return;}
      clearInterval(timer);
      if(countEl)countEl.textContent='';
      sendOtp();
      counting=false;
      markSent();
    },1000);
  };
  // Countdown runs only when the button is clicked; every click re-runs it from 4.
  btn.addEventListener('click',()=>{if(!counting)startCountdown();});
  const MAX_POP=600;
  window.addEventListener('message',(e)=>{
    if(e.source!==frame.contentWindow||e.data?.type!=='instamail-demo-resize')return;
    const h=Math.min(MAX_POP,Math.max(96,Math.round(Number(e.data.height)||0)));
    frame.style.height=h+'px';
    frame.classList.add('is-sized');
  });
})();
</script>`;

// Right-hand landing section: OTP page + play overlay. Play runs the real Chrome-shell extension popup:
// the popup opens, the OTP is delivered to it, the cursor clicks its real Copy button, then fills the OTP boxes.
const DEMO_OTP_CODE='482913';
const demoVideoBlock=`<div class="demo-video" id="demo-video">
  <div class="demo-otp-page" aria-hidden="true">
    <div class="demo-otp-bar"><span class="demo-otp-dot"></span><span class="demo-otp-dot"></span><span class="demo-otp-dot"></span><span class="demo-otp-url">mail.example.com/verify</span></div>
    <div class="demo-otp-body">
      <div class="demo-otp-card" id="demo-otp-card">
        <p class="demo-otp-heading">Enter your verification code</p>
        <p class="demo-otp-sub">We sent a 6-digit code to hi@hopiumstudio.com</p>
        <div class="demo-otp-boxes" id="demo-otp-boxes">${[0,1,2,3,4,5].map(()=>'<span class="demo-otp-empty"></span>').join('')}</div>
        <button type="button" class="demo-otp-request" id="demo-otp-request" tabindex="-1">Request OTP</button>
        <span class="demo-otp-verify">Verify</span>
      </div>
    </div>
  </div>
  <div class="demo-video-success" id="demo-video-success" aria-live="polite" hidden>
    <div class="demo-success-inner">
      <span class="demo-success-badge" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
      <p class="demo-success-title">Successfully logged in</p>
      <p class="demo-success-sub">Your code was verified</p>
    </div>
  </div>
  <div class="demo-outro" id="demo-outro" aria-hidden="true" hidden>
    <img class="demo-outro-logo" src="/assets/instamail-logo-512.png" width="56" height="56" alt="">
    <p class="demo-outro-title">SuperEasyOTP <span class="demo-outro-wink">;)</span></p>
    <p class="demo-outro-sub">Codes in your inbox, one click away.</p>
  </div>
  <button type="button" class="demo-video-play" id="demo-video-play" aria-label="Play demo">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.9-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z"/></svg>
  </button>
</div>`;
const demoVideoScript=`<script>
(function(){
  const wrap=document.getElementById('demo-video');
  const btn=document.getElementById('demo-video-play');
  const cursor=document.getElementById('demo-video-cursor');
  const boxes=document.getElementById('demo-otp-boxes');
  const success=document.getElementById('demo-video-success');
  const outro=document.getElementById('demo-outro');
  const otpPage=wrap.querySelector('.demo-otp-page');
  const pop=document.getElementById('demo-extension-popup');
  const frame=document.getElementById('demo-popup-frame');
  const viewport=pop&&pop.parentElement;
  if(!wrap||!btn||!cursor||!boxes||!success||!pop||!frame||!viewport)return;
  const code=${JSON.stringify(DEMO_OTP_CODE)};
  let running=false;
  const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
  // Position the cursor (in viewport coordinates) over a target element.
  const moveCursorTo=(el)=>{
    const v=viewport.getBoundingClientRect();
    const t=el.getBoundingClientRect();
    const x=t.left+t.width/2-v.left;
    const y=t.top+t.height/2-v.top;
    cursor.style.transform='translate('+x+'px,'+y+'px)';
  };
  const clickPulse=(target)=>{
    cursor.classList.add('is-click');setTimeout(()=>cursor.classList.remove('is-click'),180);
    if(target){target.classList.add('is-pressed');setTimeout(()=>target.classList.remove('is-pressed'),180);}
  };
  const showCursor=(on)=>{cursor.hidden=!on;};
  const ensurePopupLoaded=()=>new Promise(res=>{
    if(!frame.getAttribute('src'))frame.src='/demo/popup.html?embed=1';
    const d=frame.contentDocument;
    if(d&&d.readyState==='complete'&&d.querySelector('.row-code-copy'))return res(true);
    frame.addEventListener('load',()=>res(true),{once:true});
    setTimeout(()=>res(false),2500);
  });
  // The OTP-carrying mail row in the real popup (its Copy button).
  const findCopyBtn=()=>{
    const d=frame.contentDocument;
    return d?d.querySelector('.row-code-copy'):null;
  };
  const openPopup=()=>{
    pop.hidden=false;
    const extBtn=document.getElementById('demo-ext-icon');
    if(extBtn)extBtn.setAttribute('aria-expanded','true');
  };
  const closePopup=()=>{
    pop.hidden=true;
    const extBtn=document.getElementById('demo-ext-icon');
    if(extBtn)extBtn.setAttribute('aria-expanded','false');
  };
  const resetCard=()=>{
    wrap.classList.remove('demo-video--done');
    success.hidden=true;
    if(outro)outro.hidden=true;
    if(otpPage)otpPage.hidden=false;
    btn.hidden=true;
    showCursor(false);
    [...boxes.children].forEach(b=>{b.textContent='';b.classList.add('demo-otp-empty');});
  };
  const requestBtn=document.getElementById('demo-otp-request');
  const fillAll=()=>{
    const digits=[...boxes.children];
    [...code].forEach((ch,i)=>{digits[i].textContent=ch;digits[i].classList.remove('demo-otp-empty');});
  };
  const run=async()=>{
    if(running)return;
    running=true;
    btn.hidden=true;
    resetCard();
    // 1) Cursor moves to "Request OTP" and clicks it.
    showCursor(true);
    cursor.style.transition='none';
    cursor.style.transform='translate(60%,60%)';
    await wait(60);
    cursor.style.transition='transform .6s cubic-bezier(.4,0,.2,1)';
    if(requestBtn)moveCursorTo(requestBtn);
    await wait(650);
    clickPulse(requestBtn);
    await wait(200);
    // 2) After 1 second, the popup appears with the OTP delivered to it.
    await wait(1000);
    openPopup();
    await ensurePopupLoaded();
    try{frame.contentWindow.postMessage({type:'instamail-demo-otp',code},location.origin);}catch{}
    await wait(500);
    // 3) Cursor moves onto the popup's Copy button and copies the OTP.
    const copyBtn=findCopyBtn();
    if(copyBtn){
      const r=copyBtn.getBoundingClientRect();
      const f=frame.getBoundingClientRect();
      const v=viewport.getBoundingClientRect();
      cursor.style.transform='translate('+(f.left+r.left+r.width/2-v.left)+'px,'+(f.top+r.top+r.height/2-v.top)+'px)';
    }
    await wait(650);
    clickPulse();
    if(copyBtn)copyBtn.click();
    // 4) After copying, the cursor moves to the first OTP box; half a second later all 6 digits appear.
    await wait(400);
    const firstBox=boxes.children[0];
    if(firstBox)moveCursorTo(firstBox);
    await wait(500);
    // Cursor clicks into the first box: the text caret blinks once, then the OTP is pasted 1 second later.
    if(firstBox){
      firstBox.classList.add('is-caret');
      setTimeout(()=>firstBox.classList.remove('is-caret'),1100);
    }
    await wait(1000);
    fillAll();
    // 5) Cursor moves to Verify and clicks it.
    await wait(450);
    const verifyBtn=wrap.querySelector('.demo-otp-verify');
    if(verifyBtn)moveCursorTo(verifyBtn);
    await wait(650);
    clickPulse(verifyBtn);
    await wait(300);
    // 6) Close the popup, swap the OTP content for the success text in the same white card, then bring Play back.
    closePopup();
    showCursor(false);
    await wait(250);
    if(otpPage)otpPage.hidden=true;
    success.hidden=false;
    wrap.classList.add('demo-video--done');
    await wait(2200);
    // Closing screen: SuperEasyOTP ;)
    success.hidden=true;
    if(outro)outro.hidden=false;
    await wait(2400);
    btn.hidden=false;
    running=false;
  };
  btn.addEventListener('click',run);
  if(requestBtn)requestBtn.addEventListener('click',run);
})();
</script>`;

const landingBody=`<section class="landing-stage" aria-label="Interactive demo">
  <div class="laptop" role="group" aria-label="Chrome browser with SuperEasyOTP extension">
        <div class="chrome-window">
          <div class="chrome-tabstrip" aria-hidden="true">
            <div class="chrome-lights"><span class="chrome-light chrome-light-close"></span><span class="chrome-light chrome-light-min"></span><span class="chrome-light chrome-light-max"></span></div>
            <div class="chrome-tabs">
              <span class="chrome-tab chrome-tab-active"><img class="chrome-favicon" src="/demo/icons/16.png" width="16" height="16" alt=""><span class="chrome-tab-title">SuperEasyOTP</span><span class="chrome-tab-close">×</span></span>
              <span class="chrome-tab-new" aria-hidden="true">+</span>
            </div>
          </div>
          <div class="chrome-toolbar">
            <div class="chrome-nav">
              <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></span>
              <span class="chrome-navbtn chrome-navbtn-dim"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
              <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 4v5h-5"/></svg></span>
              <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></span>
            </div>
            <div class="chrome-omnibox"><svg class="chrome-lock" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg><span class="chrome-omnibox-text">supereasyotp.com</span></div>
            <div class="chrome-ext">
              <button type="button" class="chrome-ext-btn" id="demo-ext-icon" aria-label="SuperEasyOTP extension" aria-expanded="false"><img src="/demo/icons/32.png" width="18" height="18" alt=""><span class="chrome-ext-badge" id="demo-ext-badge" hidden aria-hidden="true"></span></button>
              <span class="chrome-navbtn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg></span>
            </div>
          </div>
          <div class="chrome-viewport">
            <div class="demo-site">
              <div class="demo-site-split">
                <div class="demo-site-section demo-site-section-copy">
                  ${renderLandingChromeHeader}
                  <div class="demo-site-copy-body">
                <div class="hero-copy">
                  <a class="demo-site-pill" href="${esc(githubUrl)}" target="_blank" rel="noopener noreferrer"><svg class="demo-site-pill-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.52-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg><span>SuperEasyOTP is open sourced.</span><svg class="demo-site-pill-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg></a>
                  <h1 class="demo-site-title">SuperEasyOTP</h1>
                  <p class="demo-site-tagline">Connect your email accounts and instantly get OTPs &amp; sign-in links in your Chrome extension; super easy.</p>
                  <div class="demo-site-actions">
                    ${demoChromeCtaButton}
                    <button type="button" class="demo-site-btn-outline" id="demo-request-otp"><span class="demo-otp-label"><span class="demo-otp-label-text">Send a sample OTP</span><span class="demo-otp-arrow" aria-hidden="true">→</span></span></button>
                  </div>
                </div>
                  </div>
                  <footer class="demo-site-footer">
                ${footerSocial}
              </footer>
                </div>
                <div class="demo-site-section demo-site-section-visual">
                  ${demoVideoBlock}
                </div>
              </div>
            </div>
            <div class="demo-extension-popup" id="demo-extension-popup" hidden>
              <iframe id="demo-popup-frame" title="SuperEasyOTP extension popup" src="/demo/popup.html?embed=1" width="326" loading="lazy"></iframe>
            </div>
            <div class="demo-video-cursor" id="demo-video-cursor" aria-hidden="true" hidden></div>
          </div>
        </div>
  </div>
</section>${landingScript}${siteMenuScript}${demoVideoScript}`;

const renderHome=(page:SitePage)=>`<!doctype html><html lang="en" class="site home-landing"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page.title)}</title><meta name="description" content="${esc(page.description)}">${fonts}<style>${siteCss}</style></head><body class="home-landing"><main class="home-main">${page.body}</main></body></html>`;

const writePage=async(route:string,page:SitePage)=>{const dir=route?`apps/web/dist/${route}`:'apps/web/dist';await mkdir(dir,{recursive:true});await writeFile(`${dir}/index.html`,renderSite(page));};

const pages:Record<string,SitePage>={};

pages['']={
  title:'SuperEasyOTP — Your inbox, a click away',
  description:'Check recent Gmail, copy verification codes, and open sign-in links from a compact Chrome extension. Open source.',
  nav:undefined,
  body:landingBody,
};

const stripDraft=(md:string)=>legalVars?md.replace(/^DRAFT[^\n]*\n+/m,'').replace(/^Effective date: \[EFFECTIVE_DATE\]\n+/m,`Effective date: ${legalVars.EFFECTIVE_DATE||'[EFFECTIVE_DATE]'}\n`):md;
const stripLeadingH1=(md:string)=>md.replace(/^# .+\n+/m,'');

const legalTitles:Record<string,{t:string;d:string;h1:string;lead:string}>={
  privacy:{t:'Privacy Policy — SuperEasyOTP',d:'How SuperEasyOTP collects, uses, and protects information when you use the Chrome extension and related services.',h1:'Privacy Policy',lead:'What we access from Gmail, where it is processed, how long we keep it, and the choices you have.'},
  terms:{t:'Terms of Service — SuperEasyOTP',d:'Terms for using SuperEasyOTP, the Chrome extension, and supporting services.',h1:'Terms of Service',lead:'Rules for using SuperEasyOTP, your responsibilities, and how we provide the service.'},
  'delete-data':{t:'Delete your data — SuperEasyOTP',d:'How to disconnect Gmail accounts and delete SuperEasyOTP data.',h1:'Delete your data',lead:'Disconnect Gmail, remove SuperEasyOTP records, and revoke Google access safely.'},
};
const effectiveMeta=legalVars?.EFFECTIVE_DATE&&!String(legalVars.EFFECTIVE_DATE).startsWith('REPLACE_')?`Effective ${legalVars.EFFECTIVE_DATE}`:'';
const privacyCallout=legal(`<aside class="doc-callout" aria-label="Privacy summary"><p class="doc-callout-title">At a glance</p><ul class="doc-callout-list"><li>Gmail access is read-only and used only for SuperEasyOTP features—not sold or used for ads.</li><li>Inbox bodies are normally processed in the extension on your device.</li><li>Disconnect or delete data anytime in Settings or via our <a href="/delete-data/">deletion guide</a>.</li><li>Privacy requests: <a href="mailto:[PRIVACY_EMAIL]">[PRIVACY_EMAIL]</a></li></ul></aside>`);
for(const [route,file] of Object.entries({privacy:'05-PRIVACY-POLICY.md',terms:'06-TERMS.md','delete-data':'07-DATA-DELETION.md'})){
  let md=await readFile('build-pack/'+file,'utf8');
  md=stripDraft(md);
  md=stripLeadingH1(md);
  md=legal(md);
  const meta=legalTitles[route];
  const {html,toc}=await markdownToDocHtml(md);
  const privacyRelated=route==='privacy'?`<p><strong>Related</strong> · <a href="/delete-data/">Delete your data</a> · <a href="/security/">Security</a> · <a href="/terms/">Terms</a> · <a href="/docs/">Docs</a></p>`:undefined;
  pages[route]={
    title:meta.t,
    description:meta.d,
    nav:route==='privacy'?'privacy':'docs',
    body:renderDocArticle({
      eyebrow:'',
      title:meta.h1,
      lead:meta.lead,
      meta:effectiveMeta||undefined,
      callout:route==='privacy'?privacyCallout:undefined,
      html,
      toc,
      backHref:'/docs/',
      backLabel:'All docs',
      related:privacyRelated,
    }),
  };
}

pages.support={
  title:'Support — SuperEasyOTP',
  description:'Connection help, missing codes, and how to contact SuperEasyOTP support safely.',
  nav:'support',
  body:legal(`<article class="prose wide"><header class="page-hero" style="border:0;padding-bottom:0"><h1>How can we help?</h1><p class="lead">Contact <a href="mailto:[SUPPORT_EMAIL]">[SUPPORT_EMAIL]</a>. Never send passwords, live codes, or complete emails.</p></header>
<h2>Can't connect?</h2><p>Choose the right Google account and grant Gmail access. Workspace administrators may need to approve the app.</p>
<h2>No popup?</h2><p>In Settings choose toolbar popups or Chrome notifications. Pin the icon for popups. Older and ambiguous messages stay in the inbox.</p>
<h2>Missing mail?</h2><p>Refresh and check the account selector. Spam, Trash and archived emails are excluded.</p>
<h2>Guides</h2><p>Read <a href="/docs/connect-gmail/">Connect Gmail</a>, <a href="/docs/verification-codes/">verification codes</a>, and <a href="/docs/sign-in-popups/">automatic popups</a>.</p>
<p><a href="/delete-data/">Delete your data</a> · <a href="/security/">Security</a> · <a href="/privacy/">Privacy</a></p></article>`),
};

pages.security={
  title:'Security — SuperEasyOTP',
  description:'How SuperEasyOTP protects credentials, processes mail locally, and how to report vulnerabilities.',
  nav:'security',
  body:legal(`<article class="prose wide"><header class="page-hero" style="border:0;padding-bottom:0"><h1>Security at SuperEasyOTP</h1><p class="lead">We handle OAuth credentials and mailbox notifications with care. Message bodies are normally processed in the extension—not archived on our servers.</p></header>
<div class="security-grid">
<div class="security-block"><h2>Credential storage</h2><p>Google refresh tokens and related account data are stored encrypted on the backend. Access is limited to operating SuperEasyOTP (connection, renewal, Gmail change signals).</p></div>
<div class="security-block"><h2>Local processing</h2><p>Recent inbox content and sign-in detection run on your device inside the Chrome extension. We do not maintain a server-side mailbox archive for product features.</p></div>
<div class="security-block"><h2>Transport and operations</h2><p>API traffic uses HTTPS. Infrastructure access is restricted to operational needs. Hosting details appear in our <a href="/privacy/">Privacy Policy</a>.</p></div>
<div class="security-block"><h2>Phishing and links</h2><p>Recognized codes or links are not proof of a legitimate sender. Check addresses and destinations before you act—especially for sign-in links.</p></div>
<div class="security-block"><h2>Open source</h2><p>SuperEasyOTP is an open source project. Reviewing the code helps you understand what the extension and API do. ${repoUrl?`<a href="${esc(repoUrl)}" rel="noopener noreferrer">Browse the repository</a>.`:'Source links are published on the homepage when available.'}</p></div>
<div class="security-block"><h2>Report an issue</h2><p>Email <a href="mailto:[SECURITY_EMAIL]">[SECURITY_EMAIL]</a> with reproducible steps using synthetic or your own test data. Do not access other people's data. External security review is pending.</p></div>
</div>
<p><a href="/privacy/">Privacy Policy</a> · <a href="/delete-data/">Delete data</a> · <a href="/docs/how-it-works/">How SuperEasyOTP works</a></p></article>`),
};

type BlogPost={slug:string;file:string;title:string;description:string;tag:string};
const blogPosts:BlogPost[]=[
  {slug:'how-it-works',file:'how-it-works.md',title:'How SuperEasyOTP works',description:'Architecture, Gmail connection, where email is processed, and what SuperEasyOTP does not do.',tag:'Guide'},
  {slug:'connect-gmail',file:'connect-gmail.md',title:'Connect Gmail to SuperEasyOTP',description:'Step-by-step tutorial: install, OAuth, permissions, and troubleshooting.',tag:'Tutorial'},
  {slug:'verification-codes',file:'verification-codes.md',title:'Copy verification codes faster',description:'How OTP detection works, using Copy code safely, and login links.',tag:'Tutorial'},
  {slug:'sign-in-popups',file:'sign-in-popups.md',title:'Automatic sign-in popups',description:'Enable alerts, delivery modes, timing expectations, and security tips.',tag:'Tutorial'},
];

const blogCards=blogPosts.map(p=>`<a class="article-card" href="/blog/${p.slug}/"><span class="tag">${p.tag}</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p></a>`).join('');

const featuresToc:DocTocItem[]=[
  {id:'toolbar-inbox',label:'Gmail in your toolbar',level:2},
  {id:'connect-gmail',label:'Connect Gmail & accounts',level:2},
  {id:'verification-codes',label:'Verification codes',level:2},
  {id:'sign-in-links',label:'Sign-in links',level:2},
  {id:'automatic-popups',label:'Automatic popups',level:2},
  {id:'privacy-control',label:'Privacy & your control',level:2},
];
const featuresHtml=`<h2 id="toolbar-inbox">Gmail in your toolbar</h2>
<p>SuperEasyOTP lives in the Chrome toolbar. Open the extension to see your latest Gmail—one, three, or ten recent messages—with a compact inbox built for quick checks, not replacing Gmail.</p>
<p>When a message looks like verification or sign-in mail, SuperEasyOTP highlights a <strong>Copy code</strong> action or an <strong>Open link</strong> action on that row so you can act without hunting through the full thread.</p>
<h2 id="connect-gmail">Connect Gmail &amp; accounts</h2>
<p>Connect with Google OAuth and grant read-only Gmail access (<code>gmail.readonly</code>) so SuperEasyOTP can read recent messages and find codes and links. You can add multiple personal or Workspace accounts; admins may need to approve the app.</p>
<p>Need step-by-step help? See <a href="/docs/connect-gmail/">Connect Gmail to SuperEasyOTP</a>.</p>
<h2 id="verification-codes">Verification codes</h2>
<p>SuperEasyOTP scans recent message text for common OTP patterns. When it finds a likely code, <strong>Copy code</strong> puts it on your clipboard in one click. Codes from unknown senders still deserve caution—always confirm the sender and site before you paste.</p>
<p>More detail: <a href="/docs/verification-codes/">Copy verification codes faster</a>.</p>
<h2 id="sign-in-links">Sign-in links</h2>
<p>Magic links and “Sign in” buttons in email are surfaced as <strong>Open link</strong> when recognized. That saves hunting through HTML-heavy messages; it does not prove the sender is legitimate—check addresses and URLs like any other email link.</p>
<h2 id="automatic-popups">Automatic popups</h2>
<p>Optional alerts can open the extension popup—or Chrome notifications—when a new sign-in message arrives. You choose the delivery mode in Settings and can turn popups off anytime; the inbox panel still works.</p>
<p>Timing depends on Gmail, your network, and whether Chrome is running. See <a href="/docs/sign-in-popups/">Automatic sign-in popups</a>.</p>
<h2 id="privacy-control">Privacy &amp; your control</h2>
<p>Message bodies for the inbox are normally processed <strong>on your device</strong> in the extension—not archived as a mailbox on our servers. Our backend stores encrypted OAuth credentials and connection metadata needed to keep accounts linked and receive change signals.</p>
<p>SuperEasyOTP does not send or delete Gmail, does not use your mail for ads, and does not train general-purpose AI on it. Disconnect anytime in Settings or follow <a href="/delete-data/">Delete your data</a>. Read the <a href="/privacy/">Privacy Policy</a> and <a href="/security/">Security</a> pages for full detail.</p>`;

pages.features={
  title:'Features — SuperEasyOTP',
  description:'Gmail toolbar inbox, OTP copy, sign-in links, automatic popups, and privacy—all in one Chrome extension.',
  nav:'features',
  body:renderDocArticle({
    eyebrow:'',
    title:'Features',
    lead:'What SuperEasyOTP does in your browser—six capabilities that get codes and sign-in links into your hands faster.',
    html:featuresHtml,
    toc:featuresToc,
  }),
};

pages.faqs={
  title:'FAQs — SuperEasyOTP',
  description:'Answers about connecting Gmail, missing OTPs, popups, and getting support.',
  nav:'faqs',
  body:legal(`<article class="prose wide"><header class="page-hero" style="border:0;padding-bottom:0"><h1>FAQs</h1><p class="lead">Quick answers about Gmail, verification codes, and the Chrome extension. Still stuck? Email <a href="mailto:[SUPPORT_EMAIL]">[SUPPORT_EMAIL]</a>.</p></header>
<h2 id="faq-connect">How do I connect Gmail?</h2><p>Install the extension, click Connect, and sign in with the Google account you use for sign-in mail. Grant read-only Gmail access. Workspace admins may need to approve the app—see <a href="/docs/connect-gmail/">Connect Gmail</a>.</p>
<h2 id="faq-codes">Why didn't my code show up?</h2><p>Refresh the inbox, confirm the right account is selected, and check that the message is recent. Spam, Trash, and archived mail are excluded. Details: <a href="/docs/verification-codes/">verification codes</a>.</p>
<h2 id="faq-popups">Why no popup or notification?</h2><p>In Settings, choose toolbar popups or Chrome notifications and pin the extension icon. See <a href="/docs/sign-in-popups/">automatic popups</a>.</p>
<h2 id="faq-privacy">Is my email stored on your servers?</h2><p>Message bodies are normally processed on your device. Read the <a href="/privacy/">Privacy Policy</a> and <a href="/security/">Security</a> pages.</p>
<h2 id="faq-delete">How do I delete my data?</h2><p>Disconnect accounts in Settings or follow <a href="/delete-data/">Delete your data</a>.</p>
</article>`),
};

pages.blog={
  title:'SuperEasyOTP Blog — Guides & tutorials',
  description:'How SuperEasyOTP works, Gmail setup tutorials, verification codes, and sign-in popups.',
  nav:'blog',
  body:`<header class="page-hero"><h1>Guides for Gmail, codes, and Chrome</h1><p class="lead">Clear articles for evaluation, onboarding, and search—how SuperEasyOTP works and how to use it.</p></header><div class="card-grid">${blogCards}</div>`,
};

for(const post of blogPosts){
  const md=stripLeadingH1(await readFile(`apps/web/content/blog/${post.file}`,'utf8'));
  const {html,toc}=await markdownToDocHtml(md);
  const docBody=renderDocArticle({eyebrow:'',title:post.title,lead:post.description,html,toc,backHref:'/docs/',backLabel:'All docs'});
  pages[`blog/${post.slug}`]={
    title:`${post.title} — SuperEasyOTP`,
    description:post.description,
    nav:'blog',
    body:`<article class="prose wide">${html}<p class="muted"><a href="/blog/">← All guides</a></p></article>`,
  };
  pages[`docs/${post.slug}`]={
    title:`${post.title} — SuperEasyOTP`,
    description:post.description,
    nav:'docs',
    body:docBody,
  };
}

const legalDocCards=[
  {href:'/privacy/',tag:'Legal',title:'Privacy Policy',description:legalTitles.privacy.d},
  {href:'/terms/',tag:'Legal',title:'Terms of Service',description:legalTitles.terms.d},
  {href:'/delete-data/',tag:'Legal',title:'Delete your data',description:legalTitles['delete-data'].d},
  {href:'/security/',tag:'Trust',title:'Security',description:'Credentials, local processing, and reporting vulnerabilities.'},
];
const docGuideCards=blogPosts.map(p=>`<a class="article-card" href="/docs/${p.slug}/"><span class="tag">${p.tag}</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p></a>`).join('');
const docLegalCards=legalDocCards.map(p=>`<a class="article-card" href="${p.href}"><span class="tag">${p.tag}</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p></a>`).join('');
// Video demo: set DEMO_VIDEO_URL to an embeddable URL (YouTube/Vimeo embed or an .mp4). Empty = placeholder.
const demoVideoUrl=legalVars?.DEMO_VIDEO_URL?.trim()&&!legalVars.DEMO_VIDEO_URL.startsWith('REPLACE_')?legalVars.DEMO_VIDEO_URL.trim():'';
const renderDemoVideo=()=>{
  const media=!demoVideoUrl
    ?`<div class="docs-video-placeholder" role="img" aria-label="Demo video coming soon"><span class="docs-video-play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span><p>Demo video coming soon</p></div>`
    :/\.(mp4|webm|ogg)(\?|$)/i.test(demoVideoUrl)
      ?`<video class="docs-video-el" controls preload="metadata" playsinline src="${esc(demoVideoUrl)}"></video>`
      :`<iframe class="docs-video-el" src="${esc(demoVideoUrl)}" title="SuperEasyOTP demo video" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  return `<section class="docs-video" aria-labelledby="docs-video-heading"><h2 class="docs-video-title" id="docs-video-heading">Watch a demo</h2><div class="docs-video-frame">${media}</div></section>`;
};
// Docs uses the exact landing layout: same chrome window, same copy/visual split. Only the copy body changes.
const docsBody=(url:string,title:string,inner:string)=>`<section class="landing-stage docs-stage" aria-label="Documentation">
  <div class="laptop" role="group" aria-label="Chrome browser with SuperEasyOTP docs">
        <div class="chrome-window">
          <div class="chrome-tabstrip" aria-hidden="true">
            <div class="chrome-lights"><span class="chrome-light chrome-light-close"></span><span class="chrome-light chrome-light-min"></span><span class="chrome-light chrome-light-max"></span></div>
            <div class="chrome-tabs">
              <span class="chrome-tab chrome-tab-active"><img class="chrome-favicon" src="/demo/icons/16.png" width="16" height="16" alt=""><span class="chrome-tab-title">${esc(title)}</span><span class="chrome-tab-close">×</span></span>
              <span class="chrome-tab-new" aria-hidden="true">+</span>
            </div>
          </div>
          <div class="chrome-toolbar">
            <div class="chrome-nav">
              <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></span>
              <span class="chrome-navbtn chrome-navbtn-dim"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
              <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 4v5h-5"/></svg></span>
              <span class="chrome-navbtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></span>
            </div>
            <div class="chrome-omnibox"><svg class="chrome-lock" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg><span class="chrome-omnibox-text">${esc(url)}</span></div>
            <div class="chrome-ext">
              <button type="button" class="chrome-ext-btn" id="demo-ext-icon" aria-label="SuperEasyOTP extension" aria-expanded="false"><img src="/demo/icons/32.png" width="18" height="18" alt=""><span class="chrome-ext-badge" id="demo-ext-badge" hidden aria-hidden="true"></span></button>
              <span class="chrome-navbtn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg></span>
            </div>
          </div>
          <div class="chrome-viewport">
            <div class="demo-site">
              <div class="demo-site-split">
                <div class="demo-site-section demo-site-section-copy">
                  ${renderInnerChromeHeader('docs',true)}
                  <div class="demo-site-copy-body docs-copy-body">
                    <div class="docs-content">${inner}</div>
                  </div>
                  <footer class="demo-site-footer">
                    ${footerSocial}
                  </footer>
                </div>
                <div class="demo-site-section demo-site-section-visual" aria-hidden="true"></div>
              </div>
            </div>
            <div class="demo-extension-popup" id="demo-extension-popup" hidden>
              <iframe id="demo-popup-frame" title="SuperEasyOTP extension popup" src="/demo/popup.html?embed=1" width="326" loading="lazy"></iframe>
            </div>
          </div>
        </div>
  </div>
</section>`;

pages.docs={
  title:'Docs — SuperEasyOTP',
  description:'Product guides, Gmail setup, verification codes, and legal reference for SuperEasyOTP.',
  nav:'docs',
  body:docsBody('https://supereasyotps.com/docs/','Docs — SuperEasyOTP',`<div class="docs-hero-block"><h1>Docs</h1></div>${renderDemoVideo()}<section aria-labelledby="doc-guides-heading"><h2 class="doc-section-title" id="doc-guides-heading">Product guides</h2><div class="docs-list">${docGuideCards}</div></section><section aria-labelledby="doc-legal-heading"><h2 class="doc-section-title" id="doc-legal-heading">Legal &amp; trust</h2><div class="docs-list">${docLegalCards}</div></section>`),
  bare:true,
};

type BrandOption={id:string;name:string;tagline:string;primary:string;hover:string;soft:string;ink:string;onPrimary:string;accent?:string};
const brandOptions:BrandOption[]=[
  {id:'forest',name:'Forest',tagline:'Calm trust — earlier green palette',primary:'#1b4332',hover:'#2d6a4f',soft:'#e8f3ed',ink:'#0f2e24',onPrimary:'#ffffff'},
  {id:'indigo',name:'Indigo',tagline:'Security & focus — current SuperEasyOTP brand',primary:'#4338ca',hover:'#4f46e5',soft:'#eef2ff',ink:'#1e1b4b',onPrimary:'#ffffff'},
  {id:'ocean',name:'Ocean',tagline:'Clear & reliable — productivity tool',primary:'#0369a1',hover:'#0284c7',soft:'#e0f2fe',ink:'#0c4a6e',onPrimary:'#ffffff'},
  {id:'teal',name:'Teal',tagline:'Fresh & fast — technical but friendly',primary:'#0f766e',hover:'#0d9488',soft:'#ccfbf1',ink:'#134e4a',onPrimary:'#ffffff'},
  {id:'plum',name:'Plum',tagline:'Memorable — aligns with Hopium gradients',primary:'#6d28d9',hover:'#7c3aed',soft:'#ede9fe',ink:'#3b0764',onPrimary:'#ffffff'},
  {id:'coral',name:'Coral',tagline:'Warm action — stands out in the toolbar',primary:'#c2410c',hover:'#ea580c',soft:'#ffedd5',ink:'#7c2d12',onPrimary:'#ffffff'},
  {id:'slate',name:'Slate + Blue',tagline:'Neutral chrome, blue for CTAs only',primary:'#1e293b',hover:'#334155',soft:'#f1f5f9',ink:'#0f172a',onPrimary:'#ffffff',accent:'#2563eb'},
  {id:'ink',name:'Ink + Chartreuse',tagline:'Utility-first — sharp contrast',primary:'#18181b',hover:'#27272a',soft:'#f4f4f5',ink:'#09090b',onPrimary:'#18181b',accent:'#84cc16'},
];
const brandOptionCards=brandOptions.map(o=>{
  const accent=o.accent??o.primary;
  const btnHover=o.accent?(o.id==='ink'?'#65a30d':'#1d4ed8'):o.hover;
  return `<article class="brand-option" style="--brand-primary:${o.primary};--brand-hover:${o.hover};--brand-soft:${o.soft};--brand-ink:${o.ink};--brand-on:${o.onPrimary};--brand-accent:${accent};--brand-btn-hover:${btnHover}">
  <header class="brand-option-head">
    <div>
      <h2>${esc(o.name)}</h2>
      <p class="brand-option-tagline">${esc(o.tagline)}</p>
    </div>
    <code class="brand-option-id">${o.id}</code>
  </header>
  <div class="brand-swatches" aria-hidden="true">
    <span class="brand-swatch" title="Primary"><i style="background:${o.primary}"></i>Primary ${o.primary}</span>
    <span class="brand-swatch" title="Hover"><i style="background:${o.hover}"></i>Hover ${o.hover}</span>
    <span class="brand-swatch" title="Soft"><i style="background:${o.soft}"></i>Soft ${o.soft}</span>
    <span class="brand-swatch" title="Ink"><i style="background:${o.ink}"></i>Ink ${o.ink}</span>
  </div>
  <div class="brand-preview">
  <div class="brand-preview-bar"></div>
  <div class="brand-preview-body">
    <span class="brand-preview-pill">SuperEasyOTP</span>
    <button type="button" class="brand-preview-btn">Copy code</button>
    <p class="brand-preview-muted">004291 · Sign-in from Linear</p>
  </div>
  </div>
</article>`;
}).join('');

pages['brand-colors']={
  title:'Brand colors — SuperEasyOTP',
  description:'Primary brand color options for SuperEasyOTP: compare palettes for the extension, site, and marketing.',
  nav:undefined,
  body:`<header class="page-hero"><h1>Primary brand colors</h1><p class="lead">Eight strong primaries for SuperEasyOTP. Each includes primary, hover, soft surface, and ink for text-on-tint. Use the mini preview to imagine the extension popup and site CTAs.</p></header>
<section class="brand-options-grid" aria-label="Brand color options">${brandOptionCards}</section>
<p class="muted brand-options-note">Open this page at <a href="/brand-colors/">/brand-colors/</a>. When you pick a direction, we can wire the same tokens into <code>apps/extension/style.css</code> and <code>apps/web/site.css</code> without touching unrelated UI.</p>`,
};

for(const post of blogPosts){
  const stale=`apps/web/dist/features/${post.slug}`;
  if(existsSync(stale))await rm(stale,{recursive:true,force:true});
}
for(const [route,page] of Object.entries(pages)){
  if(route==='')await mkdir('apps/web/dist',{recursive:true}),await writeFile('apps/web/dist/index.html',renderHome(page));
  // Docs share the landing shell so the whole site keeps one layout.
  else if(route==='docs'){await mkdir('apps/web/dist/docs',{recursive:true});await writeFile('apps/web/dist/docs/index.html',renderHome({...page,body:page.body+extensionToggleScript}));}
  else await writePage(route,page);
}

await cp('apps/extension/dist','apps/web/dist/demo',{recursive:true});
// The extension popup is served from /demo/, so its absolute /assets/ references must point at /demo/assets/.
for(const f of ['popup.html','welcome.html']){const fp=`apps/web/dist/demo/${f}`;if(existsSync(fp)){const h=await readFile(fp,'utf8');await writeFile(fp,h.replace(/(["'(])\/assets\//g,'$1/demo/assets/'));}}
for(const f of ['landing-bg.jpg','instamail-logo-1024.png','instamail-logo-512.png','demo.mp4'])if(existsSync(`apps/web/assets/${f}`)){await mkdir('apps/web/dist/assets',{recursive:true});await cp(`apps/web/assets/${f}`,`apps/web/dist/assets/${f}`);}
console.log(legalVars?'Built extension, API, and static website (legal.env applied).':'Built extension, API, and static website. Legal placeholders block public release — copy build-pack/legal.env.example to build-pack/legal.env.');
