import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';import {createRoot} from 'react-dom/client';import {defaults,normalizeSettings,newest,formatMailAge,mailSignals,type AlertDelivery,type Mail,type Account} from '../../packages/shared';
import {formatMailBody} from '../../packages/detector';import './style.css';
declare const SITE_URL:string;
// TODO: replace with the real upgrade page URL.
const UPGRADE_URL='https://example.com/upgrade';
const HOPIUM_URL='https://hopiumstudio.com';
// TODO: replace with your Buy Me a Coffee page URL.
const COFFEE_URL='https://example.com/buymeacoffee';
// Best-effort region check from the browser locale/timezone. Replace with an IP-based check if needed.
const isIndia=(()=>{try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';const loc=navigator.language||'';return tz==='Asia/Kolkata'||tz==='Asia/Calcutta'||/-IN$/i.test(loc)}catch{return false}})();
const PRICING=isIndia
  ?{monthly:'₹69/month',yearly:'₹699/year'}
  :{monthly:'$0.99/month',yearly:'$9.99/year'};
const SendIcon=()=><svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
const CoffeeIcon=()=><svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h13v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8z"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M7 2v3M11 2v3"/></svg>;
const UpgradeIcon=()=><svg className="upgrade-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 8l4.5 4L12 5l5.5 7L22 8l-2.2 11H4.2L2 8zm2.8 13h14.4v1.5H4.8V21z"/></svg>;
const demo=!globalThis.chrome?.runtime?.id;
const demoMail:Mail[]=[
  {id:'1',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Linear',subject:'Your sign-in code',text:'Your verification code is 004291.',date:Date.now(),unread:true,code:'004291'},
  {id:'2',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Maya Chen',subject:'Thoughts for tomorrow',text:'Sharing a few ideas before our catch-up.',date:Date.now()-240000,unread:true},
  {id:'3',accountId:'demo',email:'hi@hopiumstudio.com',sender:'The Sunday Edit',subject:'Inspiration for your week',text:'Good things take a little space.',date:Date.now()-1200000,unread:false},
  {id:'4',accountId:'demo',email:'hi@hopiumstudio.com',sender:'GitHub',subject:'Your verification code',text:'Your GitHub verification code is 718345.',date:Date.now()-2400000,unread:false,code:'718345'},
  {id:'5',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Notion',subject:'Confirm your sign-in',text:'Your Notion login code is 382910.',date:Date.now()-3600000,unread:false,code:'382910'},
  {id:'6',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Figma',subject:'Sign in to Figma',text:'Your Figma sign-in code is 659204.',date:Date.now()-5400000,unread:false,code:'659204'},
  {id:'7',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Vercel',subject:'Your login link',text:'Sign in to Vercel: https://vercel.com/login/verify?token=demo123',date:Date.now()-7200000,unread:false,url:'https://vercel.com/login/verify?token=demo123'},
  {id:'8',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Stripe',subject:'Verification code',text:'Your Stripe verification code is 274851.',date:Date.now()-9000000,unread:false,code:'274851'},
  {id:'9',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Dropbox',subject:'Your security code',text:'Your Dropbox security code is 530186.',date:Date.now()-10800000,unread:false,code:'530186'},
  {id:'10',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Airbnb',subject:'Confirm it is you',text:'Your Airbnb code is 947263.',date:Date.now()-12600000,unread:false,code:'947263'},
  {id:'11',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Spotify',subject:'Your one-time code',text:'Your Spotify one-time code is 185076.',date:Date.now()-14400000,unread:false,code:'185076'},
  {id:'12',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Slack',subject:'Sign in to Slack',text:'Your Slack sign-in code is 806137.',date:Date.now()-16200000,unread:false,code:'806137'},
  {id:'13',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Amazon',subject:'Verify your account',text:'Your Amazon verification code is 412958.',date:Date.now()-18000000,unread:false,code:'412958'},
  {id:'14',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Dan Park',subject:'Lunch on Friday?',text:'Are you free for lunch this Friday?',date:Date.now()-19800000,unread:false},
  {id:'15',accountId:'demo',email:'hi@hopiumstudio.com',sender:'Product Hunt',subject:'Today’s top launches',text:'Check out what launched today.',date:Date.now()-21600000,unread:false},
];

type Mode='peek'|'list'|'settings'|'preview'|'about';

const pixelDrift=['0,0','14px,-10px','-12px,8px','18px,12px','-16px,-6px','8px,14px','-10px,-12px','12px,6px'];

function InboxLoading(){
  return <section className="panel inbox-loading" aria-busy="true" aria-live="polite">
    <div className="pixel-stage" aria-hidden="true">
      {pixelDrift.map((d,i)=><span key={i} className="pixel" style={{'--dx':d.split(',')[0],'--dy':d.split(',')[1],animationDelay:`${i*0.18}s`} as React.CSSProperties}/>)}
    </div>
    <p className="inbox-loading-label">Loading your inbox</p>
  </section>;
}

function AccountPill({accounts,selected,onSelect,onAdd}:{accounts:Account[];selected:string;onSelect:(id:string)=>void;onAdd:()=>void}){
  const [open,O]=useState(false);
  const [wrap,W]=useState<HTMLDivElement|null>(null);
  useEffect(()=>{
    if(!open)return;
    const away=(e:MouseEvent)=>{if(wrap&&!wrap.contains(e.target as Node))O(false)};
    document.addEventListener('mousedown',away);
    return()=>document.removeEventListener('mousedown',away);
  },[open,wrap]);
  const active=selected==='all'?undefined:accounts.find(a=>a.id===selected);
  const fullLabel=!accounts.length?'No account':selected==='all'?'All accounts':active?.email||accounts[0]?.email||'All accounts';
  const [button,B]=useState<HTMLButtonElement|null>(null);
  const [fits,FT]=useState(true);
  const localPart=fullLabel.includes('@')?fullLabel.split('@')[0]:fullLabel;
  const label=fits?fullLabel:localPart;
  // Measure whether the full email fits on one line inside the pill; if not, show only the part before "@".
  useEffect(()=>{
    if(!button)return;
    const measure=document.createElement('span');
    measure.className='account-pill-label';
    measure.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;width:auto;max-width:none;pointer-events:none';
    button.appendChild(measure);
    const check=()=>{
      measure.textContent=fullLabel;
      const cs=getComputedStyle(button);
      const caret=button.querySelector('.account-pill-caret') as HTMLElement|null;
      const available=button.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-(caret?caret.offsetWidth+parseFloat(cs.columnGap||cs.gap||'0'):0);
      FT(measure.getBoundingClientRect().width<=available);
    };
    check();
    const ro=new ResizeObserver(check);
    ro.observe(button);
    return()=>{ro.disconnect();measure.remove();};
  },[button,fullLabel]);
  const sizer=['All accounts',...accounts.map(a=>a.email)].reduce((a,b)=>b.length>a.length?b:a,'All accounts');
  return <div className="account-pill-wrap" ref={W}>
    <span className="account-sizer" aria-hidden="true">{sizer}</span>
    <button type="button" ref={B} className="pill pill-muted account-pill" aria-haspopup="menu" aria-expanded={open} onClick={()=>O(o=>!o)} title={fullLabel}>
      <span className="account-pill-label">{label}</span>
      <span className="account-pill-caret" aria-hidden="true">▾</span>
    </button>
    {open&&<div className="account-menu" role="menu">
      <button type="button" className="account-menu-item" role="menuitem" aria-pressed={selected==='all'} onClick={()=>{onSelect('all');O(false)}}>All accounts</button>
      {accounts.map(a=><button type="button" key={a.id} className="account-menu-item" role="menuitem" aria-pressed={selected===a.id} onClick={()=>{onSelect(a.id);O(false)}}>{a.email}</button>)}
      <button type="button" className="account-menu-add" role="menuitem" onClick={()=>{O(false);onAdd()}}>+ Add account</button>
    </div>}
  </div>;
}

function EmptyState({status,onReconnect}:{status:string;onReconnect:()=>void}){
  if(status==='Please reconnect Gmail.')return <button type="button" className="empty empty-action" onClick={onReconnect}>{status}</button>;
  return <p className="empty">{status||'No recent mail yet.'}</p>;
}

function senderAddress(from:string){
  const m=from.match(/<([^>]+)>/);
  return (m?m[1]:from).trim()||from;
}

function MailActions({mail,copied,onCopy,onLink}:{mail:Mail;copied:string;onCopy:(code:string,id:string)=>void;onLink?:()=>void}){
  const {code,url}=mailSignals(mail);
  if(code)return <div className="row-code" role="group" aria-label="Sign-in code">
    <button type="button" className="row-code-digit" onClick={()=>void onCopy(code,mail.id)}>{code}</button>
    <button type="button" className="row-code-copy pill pill-muted" onClick={()=>void onCopy(code,mail.id)}>{copied===mail.id?'Copied':'Copy'}</button>
  </div>;
  if(url)return <div className="row-code" role="group" aria-label="Sign-in link">
    <a className="row-signin-link pill pill-solid" href={url} target="_blank" rel="noopener noreferrer" onClick={()=>onLink?.()}>Open sign-in link</a>
    <button type="button" className="row-code-copy pill pill-muted" onClick={()=>void onCopy(url,mail.id)}>{copied===mail.id?'Copied':'Copy'}</button>
  </div>;
  return null;
}

function MailRow({mail,onOpen,onCopy,copied,condensed=false,onLink}:{mail:Mail;onOpen?:()=>void;onCopy:(code:string,id:string)=>void;copied:string;condensed?:boolean;onLink?:()=>void}){
  const sender=mail.sender.split('<')[0].trim();
  const head=<>
    {condensed
      ?<div className="row-top"><strong>{sender}</strong><time>{formatMailAge(mail.date)}</time></div>
      :<>
        <div className="row-top"><strong>{sender}</strong><time>{formatMailAge(mail.date)}</time></div>
        <div className="row-subject">{senderAddress(mail.sender)}</div>
      </>}
  </>;
  const actions=<MailActions mail={mail} copied={copied} onCopy={onCopy} onLink={onLink}/>;
  if(onOpen)return <div className="row-mail card"><button type="button" className="row-mail-hit" onClick={onOpen}>{head}</button>{actions}</div>;
  return <div className="row-mail card">{head}{actions}</div>;
}

function MailPreview({mail,copied,onCopy,onBack,gmailUrl}:{mail:Mail;copied:string;onCopy:(code:string,id:string)=>void;onBack:()=>void;gmailUrl:string}){
  const sender=mail.sender.split('<')[0].trim();
  const body=formatMailBody(mail.text);
  return <section className="panel stack preview-view">
    <button type="button" className="back pill pill-muted" aria-label="Back" title="Back" onClick={onBack}>←</button>
    <div className="preview-actions"><MailActions mail={mail} copied={copied} onCopy={onCopy}/></div>
    <article className="preview-card stack-sm">
      <header className="preview-head">
        <div className="row-top"><strong>{sender}</strong><time>{formatMailAge(mail.date)}</time></div>
        <h1 className="preview-subject">{mail.subject}</h1>
        <div className="row-subject preview-address">{mail.email}</div>
      </header>
      {body&&<p className="mail-body">{body}</p>}
    </article>
    <a className="pill pill-muted pill-block preview-gmail" target="_blank" rel="noreferrer" href={gmailUrl}>Open in Gmail</a>
  </section>;
}

const ProviderIcon=({id}:{id:string})=>{
  const common={width:16,height:16,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true as const,className:'provider-icon'};
  if(id==='gmail')return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
  if(id==='outlook')return <svg {...common}><rect x="3" y="5" width="11" height="14" rx="2"/><path d="M14 9h7v8h-7"/><circle cx="9" cy="12" r="2.2"/></svg>;
  return <svg {...common} fill="currentColor" stroke="none"><path d="M16.4 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2.1.8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.8-2.2-3.4zM14.4 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"/></svg>;
};

const PROVIDERS:{id:string;label:string;available:boolean}[]=[
  {id:'gmail',label:'Gmail',available:true},
  {id:'outlook',label:'Outlook',available:false},
  {id:'apple',label:'Apple',available:false},
];

function AddAccountPicker({onPick,onClose}:{onPick:(id:string)=>void;onClose:()=>void}){
  return <section className="panel stack picker-view">
    <header className="settings-topbar">
      <button type="button" className="back pill pill-muted" aria-label="Back" title="Back" onClick={onClose}>←</button>
      <h1 className="settings-title">Add account</h1>
      <span className="settings-topbar-spacer" aria-hidden="true"/>
    </header>
    <div className="field field-card picker-card">
      <span className="field-label">Choose your email provider</span>
      <div className="picker-list">
        {PROVIDERS.map(p=><button key={p.id} type="button" className="picker-item" disabled={!p.available} onClick={()=>onPick(p.id)}>
          <span className="picker-name"><ProviderIcon id={p.id}/><span>{p.label}</span></span>
          <span className="picker-note">{p.available?'':'Coming soon'}</span>
        </button>)}
      </div>
    </div>
  </section>;
}

function App(){
  const [accounts,A]=useState<Account[]>(demo?[{id:'demo',email:'hi@hopiumstudio.com',status:'demo'}]:[]);
  const [mails,M]=useState<Mail[]>(demo?demoMail:[]);
  const embedDemoInit=demo&&new URLSearchParams(location.search).get('embed')==='1';
  const [settings,S]=useState(embedDemoInit?{...defaults,condensed:true}:defaults);
  const [mode,V]=useState<Mode>('peek');
  const [returnMode,R]=useState<Mode>('peek');
  const [expanded,X]=useState(false);
  const [alertMode,AM]=useState(false);
  const [pickerOpen,PO]=useState(false);
  const [feedback,FB]=useState('');
  const [feedbackShot,FS]=useState<string>('');
  const [feedbackSent,FSent]=useState(false);
  const [preview,P]=useState<Mail|null>(null);
  const [status,T]=useState('');
  const [copied,C]=useState('');
  const [pipeline,D]=useState<any>(null);
  const [diag,g]=useState<any>(null);
  const [loading,L]=useState(false);
  const [busy,B]=useState(false);
  const [hasSession,H]=useState(false);
  const [hydrated,E]=useState(demo);
  const visible=newest(mails,settings);
  const autoCopiedMail=useRef('');
  const connected=accounts.length>0;
  const inboxLoading=!hydrated||busy||(hasSession&&!connected)||(loading&&connected&&!visible.length);
  const showLanding=hydrated&&!connected&&!hasSession;

  function applyDemoOtp(code:string){
    AM(true);
    V('peek');
    X(false);
    const mail:Mail={id:'demo-otp',accountId:'demo',email:'hi@hopiumstudio.com',sender:'SuperEasyOTP Demo',subject:'Your verification code',text:'Your verification code is '+code+'.',date:Date.now(),unread:true,code};
    M([mail,...demoMail.filter(m=>m.id!=='demo-otp')]);
  }

  async function load(){
    if(demo)return;
    const local:any=await chrome.storage.local.get(['accounts','settings','refreshToken']);
    A(local.accounts||[]);
    S(normalizeSettings(local.settings||{}));
    const session=await chrome.storage.session.get(null);
    H(Boolean(local.refreshToken||session.auth));
    // Show each error once: consume it from session storage so it doesn't reappear on the next open.
    const syncErrorKeys=Object.keys(session).filter(k=>k.startsWith('error:'));
    const toShow=session.connectError?String(session.connectError):syncErrorKeys.length?String(session[syncErrorKeys[0]]):'';
    if(toShow){
      T(toShow);
      const consumed=[...(session.connectError?['connectError']:[]),...syncErrorKeys];
      await chrome.storage.session.remove(consumed);
    }
    M(Object.entries(session).filter(([k,v]:any)=>k.startsWith('mail:')).flatMap(([,v]:any)=>v.messages||[]));
    D(session.pipeline||null);
    g(session.diag||null);
  }

  useEffect(()=>{
    if(!demo)return;
    if(new URLSearchParams(location.search).get('embed')==='1')document.documentElement.classList.add('demo-embed');
    const params=new URLSearchParams(location.search);
    if(params.get('alert')==='1')applyDemoOtp(params.get('code')||'004291');
    const onMsg=(e:MessageEvent)=>{if(e.data?.type==='supereasyotp-demo-otp')applyDemoOtp(String(e.data.code||'004291'))};
    window.addEventListener('message',onMsg);
    return()=>window.removeEventListener('message',onMsg);
  },[]);

  // Landing-page demo iframe: tell the parent our content height so the frame wraps tightly.
  useEffect(()=>{
    if(!demo||new URLSearchParams(location.search).get('embed')!=='1')return;
    const post=()=>{
      // Measure the popup container itself so the iframe height tracks content, not the viewport.
      const main=document.querySelector('main.popup') as HTMLElement|null;
      const h=Math.ceil(main?main.getBoundingClientRect().height:document.body.scrollHeight);
      try{parent.postMessage({type:'supereasyotp-demo-resize',height:h},location.origin);}catch{}
    };
    post();
    const ro=new ResizeObserver(post);
    const main=document.querySelector('main.popup');
    if(main)ro.observe(main);
    ro.observe(document.body);
    return()=>ro.disconnect();
  },[]);

  const embedDemo=demo&&new URLSearchParams(location.search).get('embed')==='1';
  useLayoutEffect(()=>{
    if(!embedDemo)return;
    const h=Math.ceil(document.querySelector('main.popup')?.getBoundingClientRect().height||0);
    try{parent.postMessage({type:'supereasyotp-demo-resize',height:h},location.origin);}catch{}
  },[embedDemo,mode,preview,status,expanded,pickerOpen,loading,inboxLoading,hydrated,mails.length,settings.condensed,settings.limit,settings.theme,alertMode]);

  useEffect(()=>{
    V('peek');
    X(false);
    if(demo)return;
    void chrome.action.setBadgeText({text:''});
    let alive=true;
    void (async()=>{
      await load();
      if(!alive)return;
      E(true);
      const {intent}:any=await chrome.storage.session.get('intent');
      await chrome.storage.session.remove('intent');
      if(intent?.expires>Date.now()){void chrome.action.setBadgeText({text:''});AM(true);V(intent.messages?.length>1?'list':'peek');}
      void action('refresh');
    })();
    const change=(changes:Record<string,chrome.storage.StorageChange>,area:string)=>{
      const intent=changes.intent?.newValue as {expires?:number;messages?:Mail[]}|undefined;
      if(area==='session'&&intent?.expires&&intent.expires>Date.now()&&intent.messages?.length){AM(true);V(intent.messages.length>1?'list':'peek');}
      void load();
    };
    chrome.storage.onChanged.addListener(change);
    return()=>{alive=false;chrome.storage.onChanged.removeListener(change);};
  },[]);

  // Status messages (including Google sign-in errors) disappear after 5 seconds.
  useEffect(()=>{
    if(!status)return;
    const timer=setTimeout(()=>T(''),5000);
    return()=>clearTimeout(timer);
  },[status]);

  // Auto-copy the OTP when a sign-in alert popup opens (no auto-close; button shows Copied).
  useEffect(()=>{
    if(!alertMode||!settings.autoCopyOtp||inboxLoading)return;
    const mail=visible[0];
    if(!mail)return;
    const {code}=mailSignals(mail);
    if(!code)return;
    const key=mail.accountId+':'+mail.id;
    if(autoCopiedMail.current===key)return;
    autoCopiedMail.current=key;
    void (async()=>{
      try{await navigator.clipboard.writeText(code);C(mail.id);}catch{if(!demo)T('Could not copy.');else C(mail.id);}
    })();
  },[alertMode,settings.autoCopyOtp,inboxLoading,visible[0]?.accountId,visible[0]?.id,visible[0]?.code]);

  useEffect(()=>{if(!alertMode)autoCopiedMail.current='';},[alertMode]);

  useEffect(()=>{
    document.documentElement.dataset.theme=settings.theme;
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){P(null);if(mode==='preview')V(returnMode);}};
    document.addEventListener('keydown',key);
    return()=>document.removeEventListener('keydown',key);
  },[settings.theme,mode]);

  async function action(type:string,id?:string,opts?:{showLoading?:boolean}){
    if(demo){
      // Mock behaviour: refresh shows the loader then re-renders mock mail; account/data actions clear mock state.
      if(type==='refresh'){L(true);setTimeout(()=>L(false),600);return;}
      if(type==='remove'||type==='delete'){A([]);M([]);H(false);T(type==='delete'?'All demo data cleared.':'Demo account removed.');return;}
      if(type==='connect'){T('Demo only — install the extension to connect Gmail.');return;}
      return;
    }
    if(type==='connect'){B(true);L(true);T('');}
    if(type==='refresh'&&(opts?.showLoading||!connected||!visible.length))L(true);
    if(type==='remove')T('Removing…');
    try{
      const r=await chrome.runtime.sendMessage({type,id});
      if(r?.error)T(r.error);else if(r?.message)T(r.message);else if(type!=='refresh'&&type!=='connect')T('');
      await load();
    }catch{T('Could not reach SuperEasyOTP.');}finally{
      if(type==='refresh'||type==='connect')L(false);
      if(type==='connect')B(false);
    }
  }

  async function setting(patch:Partial<typeof defaults>){
    const next={...settings,...patch};
    S(next);
    if(!demo){
      await chrome.storage.local.set({settings:next});
      if(patch.alertDelivery==='off')await chrome.storage.session.remove('intent');
    }
  }

  // In alert mode the popup closes after a code is copied or a sign-in link is opened.
  const closeAlert=()=>{if(alertMode&&!demo)setTimeout(()=>window.close(),150)};
  async function copy(code:string,id:string){
    try{await navigator.clipboard.writeText(code);C(id);setTimeout(()=>C(''),1500);closeAlert();}catch{if(demo){C(id);setTimeout(()=>C(''),1500);}else T('Could not copy.');}
  }

  const openSettings=()=>{R(mode==='list'?'list':'peek');V('settings')};
  const toolbarActions=<div className="toolbar-actions">
    <button type="button" className="pill pill-muted" aria-label="Refresh" onClick={()=>void action('refresh',undefined,{showLoading:true})}>↻</button>
    <button type="button" className="pill pill-muted pill-toolbar-settings" aria-label="Preferences" title="Preferences" onClick={openSettings}><span className="hamburger" aria-hidden="true"><i/><i/><i/></span></button>
  </div>;

  return <main className="popup">
    {demo&&<div className="demo">DEMO</div>}

    {inboxLoading&&(mode==='peek'||mode==='list')?(
      <InboxLoading/>
    ):showLanding?(
      <section className="panel stack">
        <h1>SuperEasyOTP</h1>
        <p className="muted">Connect Gmail to see your latest message here.</p>
        <button type="button" className="pill pill-solid pill-block" onClick={()=>void action('connect')}>Connect Gmail</button>
      </section>
    ):pickerOpen?(
      <AddAccountPicker onClose={()=>PO(false)} onPick={id=>{PO(false);if(id==='gmail')void action('connect');}}/>
    ):mode==='about'?(
      <section className="panel stack about-view">
        <header className="settings-topbar">
          <span className="settings-topbar-spacer" aria-hidden="true"/>
          <h1 className="settings-title">About</h1>
          <button type="button" className="pill pill-muted close-btn" aria-label="Close" title="Close" onClick={()=>{FSent(false);V('settings')}}>✕</button>
        </header>
        <div className="field field-card about-card">
          <p className="about-text">Hey there, thanks for downloading & trying out SuperEasyOTP. I hope you're enjoying it. I'm Amit, a solo product builder. I build & launch products under my studio, Hopium Studio. If you want to get in touch, drop me a message through the feedback below.</p>
          <a className="pill pill-muted pill-block about-link" href={HOPIUM_URL} target="_blank" rel="noopener noreferrer">Visit hopiumstudio website</a>
        </div>
        <form className="field field-card feedback-form" onSubmit={e=>{e.preventDefault();if(!feedback.trim())return;/* TODO: send feedback to backend */FSent(true);FB('');FS('');}}>
          <span className="field-label">Send feedback</span>
          <textarea className="feedback-input" rows={4} placeholder="Share your feedback and suggestions. Or just drop a message!" value={feedback} onChange={e=>FB(e.target.value)} aria-label="Feedback"/>
          <label className="attach-btn pill pill-muted">
            <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(!f){FS('');return}const r=new FileReader();r.onload=()=>FS(String(r.result||''));r.readAsDataURL(f)}}/>
            {feedbackShot?'Screenshot attached':'Attach screenshot (optional)'}
          </label>
          <button type="submit" className="pill pill-solid pill-block" disabled={!feedback.trim()}><SendIcon/><span>Submit feedback</span></button>
          {feedbackSent&&<p className="muted feedback-thanks">Thanks, your feedback was received.</p>}
        </form>
        <div className="field field-card coffee-card">
          <span className="field-label">Enjoying SuperEasyOTP?</span>
          <p className="about-text">If it saves you time, you can buy me a coffee. It helps keep the project going.</p>
          <a className="pill pill-solid pill-block coffee-link" href={COFFEE_URL} target="_blank" rel="noopener noreferrer"><CoffeeIcon/><span>Buy me a coffee</span></a>
        </div>
      </section>
    ):mode==='settings'?(
      <section className="panel stack">
        <header className="settings-topbar">
          <button type="button" className="back pill pill-muted" aria-label="Back" title="Back" onClick={()=>V(returnMode)}>←</button>
          <h1 className="settings-title">Preferences</h1>
          {!embedDemo&&<button type="button" className="pill pill-muted info-btn" aria-label="About Hopium Studio" title="About" onClick={()=>V('about')}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.3l-5.7 3 1.2-6.4-4.7-4.4 6.4-.8L12 2.8z"/></svg></button>}
        </header>
        <div className="field field-card">
          <span className="field-label">Emails shown</span>
          <div className="segments">{[1,3,10].map(n=><button key={n} type="button" aria-pressed={settings.limit===n} onClick={()=>setting({limit:n})}>{n}</button>)}</div>
        </div>
        <div className="field field-card toggle-field">
          <div className="toggle-row">
            <div className="toggle-text">
              <span className="field-label">Condensed mode</span>
              <span className="condensed-toggle-text">Show only the latest email</span>
            </div>
            <label className="check condensed-toggle">
              <input type="checkbox" checked={settings.condensed} onChange={e=>void setting({condensed:e.target.checked})}/>
              <span className="check-box" aria-hidden="true"/>
            </label>
          </div>
        </div>
        <div className="field field-card toggle-field">
          <div className="toggle-row">
            <div className="toggle-text">
              <span className="field-label">Show OTPs and sign in links only</span>
              <span className="condensed-toggle-text">Hide emails without a code or link</span>
            </div>
            <label className="check condensed-toggle">
              <input type="checkbox" checked={settings.otpOnly} onChange={e=>void setting({otpOnly:e.target.checked})}/>
              <span className="check-box" aria-hidden="true"/>
            </label>
          </div>
        </div>
        <div className="field field-card toggle-field">
          <div className="toggle-row">
            <div className="toggle-text">
              <span className="field-label">Auto copy OTP to clipboard</span>
              <span className="condensed-toggle-text">Copy the code when a sign-in alert opens</span>
            </div>
            <label className="check condensed-toggle">
              <input type="checkbox" checked={settings.autoCopyOtp} onChange={e=>void setting({autoCopyOtp:e.target.checked})}/>
              <span className="check-box" aria-hidden="true"/>
            </label>
          </div>
        </div>
        <div className="field field-card">
          <span className="field-label">New sign-in alerts</span>
          <div className="segments">{([['off','Off'],['popup','Popup'],['notification','Notify']] as [AlertDelivery,string][]).map(([v,label])=><button key={v} type="button" aria-pressed={settings.alertDelivery===v} onClick={()=>void setting({alertDelivery:v})}>{label}</button>)}</div>
        </div>
        <div className="field field-card">
          <span className="field-label">Appearance</span>
          <div className="segments">{(['system','light','dark'] as const).map(v=><button key={v} type="button" aria-pressed={settings.theme===v} onClick={()=>setting({theme:v})}>{v}</button>)}</div>
        </div>
        <div className="field field-card accounts-field">
          <span className="field-label">Accounts</span>
          {accounts.map(a=>{const ok=a.status==='connected';return <div className="account-card" key={a.id}>
            <span className="account-email">{a.email}</span>
            <span className={'status-pill '+(ok?'status-ok':'status-bad')}>{ok?'Connected':'Not connected'}</span>
            <div className="account-actions">
              <button type="button" className="pill pill-muted" onClick={()=>void action('connect')}>Reconnect</button>
              <button type="button" className="pill pill-danger" onClick={()=>void action('remove',a.id)}>Remove</button>
            </div>
          </div>})}
          <button type="button" className="pill pill-solid pill-block" onClick={()=>accounts.length>=2?window.open(UPGRADE_URL,'_blank','noopener,noreferrer'):PO(true)}>{accounts.length>=2?<><UpgradeIcon/><span>Upgrade to add more accounts</span></>:'Add account'}</button>
        </div>
        {!embedDemo&&<div className="upgrade-card">
          <h2 className="upgrade-title"><UpgradeIcon/><span>Upgrade to Pro</span></h2>
          <ul className="upgrade-list">
            <li>Connect more than 2 email accounts</li>
            <li>Customize theme</li>
          </ul>
          <div className="pricing-row">
            <button type="button" className="pill pill-solid pricing-btn" onClick={()=>{/* TODO: start monthly checkout */}}>{PRICING.monthly}</button>
            <button type="button" className="pill pill-solid pricing-btn" onClick={()=>{/* TODO: start yearly checkout */}}>{PRICING.yearly}</button>
          </div>
        </div>}
        <div className="actions-stack">
          <button type="button" className="pill pill-danger pill-block" onClick={()=>{if(confirm('Delete all SuperEasyOTP data?'))void action('delete')}}>Delete all data</button>
        </div>
      </section>
    ):mode==='preview'&&preview?(
      <MailPreview mail={preview} copied={copied} onCopy={copy} onBack={()=>{P(null);V(returnMode);}} gmailUrl={'https://mail.google.com/mail/u/?authuser='+encodeURIComponent(preview.email)+'#inbox/'+encodeURIComponent(preview.id)}/>
    ):mode==='list'?(
      <section className="panel">
        <div className="toolbar">
          {connected&&<AccountPill accounts={accounts} selected={settings.selected} onSelect={id=>void setting({selected:id})} onAdd={()=>PO(true)}/>}
          {toolbarActions}
        </div>
        {visible.length?(
          <div className="list-items">{visible.map(m=><MailRow key={m.accountId+m.id} mail={m} onOpen={()=>{R('list');P(m);V('preview');}} onCopy={copy} copied={copied}/>)}</div>
        ):loading?<InboxLoading/>:<EmptyState status={status} onReconnect={()=>void action('connect')}/>}
      </section>
    ):(settings.condensed||alertMode)&&!expanded?(
      <section className="panel condensed-view">
        {loading&&!visible.length?<InboxLoading/>
        :visible.length?(
          <>
            <div className="list-items">{visible.slice(0,1).map(m=><MailRow key={m.accountId+m.id} mail={m} condensed onOpen={()=>{R('peek');P(m);V('preview');}} onCopy={copy} copied={copied} onLink={closeAlert}/>)}</div>
            {(!alertMode||embedDemo)&&<button type="button" className="text-only-link view-more view-more-icon" aria-label="View more" title="View more" onClick={()=>X(true)}><span aria-hidden="true">›</span></button>}
          </>
        ):<EmptyState status={status} onReconnect={()=>void action('connect')}/>}
      </section>
    ):(
      <section className="panel">
        <div className="toolbar">
          {connected&&<AccountPill accounts={accounts} selected={settings.selected} onSelect={id=>void setting({selected:id})} onAdd={()=>PO(true)}/>}
          {toolbarActions}
        </div>
        {loading&&!visible.length?<InboxLoading/>
        :visible.length?(
          <div className="list-items">{visible.map(m=><MailRow key={m.accountId+m.id} mail={m} onOpen={()=>{R('peek');P(m);V('preview');}} onCopy={copy} copied={copied}/>)}</div>
        ):<EmptyState status={status} onReconnect={()=>void action('connect')}/>}
        {(settings.condensed||embedDemo)&&expanded&&<button type="button" className="text-only-link view-more view-more-icon view-less-icon" aria-label="View less" title="View less" onClick={()=>X(false)}><span aria-hidden="true">›</span></button>}
      </section>
    )}

    {status&&status!=='Please reconnect Gmail.'&&<div role="status" className="status" key={status}>
      <p className="status-text">{status}</p>
      <div className="status-timer" aria-hidden="true"/>
    </div>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App/>);
