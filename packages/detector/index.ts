const AUTH_CONTEXT=/sign[\s-]?in|sign[\s-]?on|log[\s-]?in|verification|verify|one[\s-]?time|otp\b|2fa|mfa|authentication|security\s+code|confirm(?:ing)?\s+(?:your\s+)?(?:email|account|identity)|magic\s+link|access\s+(?:your\s+)?(?:account|workspace|link)|login\s+link|auth(?:enticate|entication)?\s+link|action\s+required|complete\s+your\s+sign|\bsign[- ]?in\s+link\b/i;
const EXCLUDED=/password\s*reset|reset\s*(your\s*)?password|bank transfer|authorize.*payment|approve.*payment|transaction authorization/i;
const CODE_LABEL=/(?:verification|one[- ]time|sign[- ]in|login|security|authentication|access|confirm(?:ation)?)\s*(?:code|password|pin)\s*(?:is|:|-|#)?\s*([A-Z0-9][A-Z0-9-]{3,11})\b/gi;
const BAD_URL=/unsubscribe|list-manage|email-preferences|\/preferences|marketing\.|(?:^|\/)(?:reset|password-reset)(?:\/|$|\?)|opt[_-]?out|view[\s_-]?in[\s_-]?browser|privacy[\s_-]?policy|terms(?:\s+of)?(?:\s+service)?|\/help(?:\/|$|\?)|\/support(?:\/|$|\?)|mailto:|tel:/i;
const CTA_TEXT=/sign[\s-]?in|sign[\s-]?on|log[\s-]?in|authenticate|verification|verify(?:\s+your)?|confirm(?:\s+your)?|continue(?:\s+to)?|complete(?:\s+your)?|access\s+(?:your\s+)?(?:account|workspace|link)|click\s+(?:here|below|the|this|to)|get\s+started|activate|secure(?:ly)?\s+(?:sign|log)|magic\s+link|one[\s-]?time(?:\s+link)?|open\s+(?:link|app)|go\s+to|use\s+this\s+link/i;

const htmlEntity=(s:string)=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');

export function unwrapRedirect(url:string){
  try{
    const u=new URL(url);
    if(/\.(google|googlemail)\.com$/i.test(u.hostname)&&u.pathname==='/url'){
      const q=u.searchParams.get('q')||u.searchParams.get('url');
      if(q)return decodeURIComponent(q);
    }
    if(/safelinks\.protection\.outlook\.com/i.test(u.hostname)){
      const q=u.searchParams.get('url');
      if(q)return decodeURIComponent(q);
    }
  }catch{}
  return url;
}

export function normalizeUrl(raw:string){
  let trimmed=unwrapRedirect(htmlEntity(raw.trim())).replace(/[.,;:!?)>\]]+$/,'');
  trimmed=trimmed.replace(/^<|>$/g,'');
  try{
    const u=new URL(trimmed);
    if(u.protocol!=='https:'&&u.protocol!=='http:')return;
    if(u.username||u.password||trimmed.length>4096)return;
    return u.href;
  }catch{return}
}

function scoreAuthUrl(url:string,authContext:boolean){
  let score=0;
  if(!normalizeUrl(url))return -100;
  if(BAD_URL.test(url))return -100;
  if(/\/(login|signin|sign-in|sign-on|log-in|auth|verify|magic|oauth|sso|session|activate|confirm|callback|ticket|otp|invite|welcome|accept)(?:\/|$|[?#])/i.test(url))score+=3;
  if(/[?&](?:token|code|key|magic|verify|auth|login|session|otp|ticket|sig|nonce|rid|t|s|e|m|u)=/i.test(url))score+=2;
  if(/[?&][^=&]{8,}=/i.test(url)&&authContext)score+=1;
  if(authContext)score+=1;
  return score;
}

function pushLink(links:{text:string;url:string}[],seen:Set<string>,href:string,text:string){
  const url=normalizeUrl(href);
  if(!url||seen.has(url))return;
  seen.add(url);
  links.push({url,text:text.replace(/\s+/g,' ').trim().slice(0,200)});
}

export function extractLinksFromText(text:string){
  const links:{text:string;url:string}[]=[];
  const seen=new Set<string>();
  for(const m of text.matchAll(/<?(https?:\/\/[^\s<>"')\]]+)>?/gi))pushLink(links,seen,m[1]||m[0],'');
  return links;
}

export function extractLinksFromHtml(html:string){
  const links:{text:string;url:string}[]=[];
  const seen=new Set<string>();
  const decoded=htmlEntity(html);
  for(const m of decoded.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))[^>]*>([\s\S]*?)<\/a>/gi))
    pushLink(links,seen,m[1]||m[2]||m[3]||'',htmlEntity(m[4].replace(/<[^>]+>/g,' ')));
  for(const m of decoded.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi))pushLink(links,seen,m[1],'');
  for(const m of decoded.matchAll(/\bhref\s*=\s*([^\s>"']+)/gi))pushLink(links,seen,m[1],'');
  for(const m of decoded.matchAll(/\bdata-saferedirecturl\s*=\s*["']([^"']+)["']/gi))pushLink(links,seen,m[1],'');
  return links;
}

function mergeLinks(parts:{text:string;url:string}[][]){
  const out:{text:string;url:string}[]=[];
  const seen=new Set<string>();
  for(const list of parts)for(const l of list){
    if(seen.has(l.url))continue;
    seen.add(l.url);
    out.push(l);
  }
  return out;
}

function pickAuthUrl(subject:string,body:string,links:{text:string;url:string}[]){
  const authContext=AUTH_CONTEXT.test(subject+'\n'+body.slice(0,2000));
  const byUrl=new Map<string,{url:string;score:number}>();
  const add=(raw:string,bonus:number)=>{
    const url=normalizeUrl(raw);
    if(!url)return;
    const base=scoreAuthUrl(url,authContext);
    if(base<0)return;
    const score=base+bonus;
    const prev=byUrl.get(url);
    if(!prev||score>prev.score)byUrl.set(url,{url,score});
  };
  for(const l of links){const text=l.text.trim();add(l.url,CTA_TEXT.test(text)?3:authContext&&text.length<160?1:0)}
  for(const match of body.matchAll(/<?(https?:\/\/[^\s<>"')\]]+)>?/gi))add(match[1]||match[0],authContext?2:1);
  const ranked=[...byUrl.values()].sort((a,b)=>b.score-a.score);
  const good=ranked.filter(c=>c.score>=2);
  if(authContext&&good.length===1)return good[0].url;
  if(!good.length)return undefined;
  if(good.length===1)return good[0].url;
  if(authContext&&good[0].score>=3&&good[0].score>good[1].score)return good[0].url;
  if(good[0].score===good[1].score)return undefined;
  if(good[0].score>=good[1].score+2)return good[0].url;
  if(authContext&&good[0].score>=4&&good[0].score>good[1].score)return good[0].url;
  return undefined;
}

function pickCode(body:string,authContext:boolean){
  const codes=new Set<string>();
  for(const match of body.matchAll(CODE_LABEL)){
    const c=match[1];
    if(/\d/.test(c)&&(/^[0-9]{4,8}$/.test(c)||/^[a-z0-9-]{4,12}$/i.test(c)))codes.add(c);
  }
  if(!codes.size&&authContext){
    const loose=new Set<string>();
    for(const match of body.slice(0,2500).matchAll(/\b([0-9]{4,8})\b/g))loose.add(match[1]);
    if(loose.size===1)codes.add([...loose][0]);
    else for(const match of body.slice(0,2000).matchAll(/^\s*([0-9]{4,8})\s*$/gm))codes.add(match[1]);
  }
  if(codes.size===1)return [...codes][0];
  return undefined;
}

export function detect(subject:string,text:string,links:{text:string;url:string}[]=[]){
  const body=(subject+'\n'+text).split(/\nOn .+wrote:|\n>/)[0].slice(0,100000);
  const excluded=EXCLUDED.test(body);
  const authContext=AUTH_CONTEXT.test(body.slice(0,2000));
  const code=!excluded?pickCode(body,authContext):undefined;
  const url=!excluded&&!code?pickAuthUrl(subject,text,links):undefined;
  let hostname:string|undefined;
  if(url)try{hostname=new URL(url).hostname}catch{}
  const confidence=excluded?'low':code||url?'high':authContext?'medium':'low';
  return {confidence,code,url,hostname};
}

export function applyDetection<T extends {subject:string;text:string;links?:{text:string;url:string}[];code?:string;url?:string;hostname?:string}>(mail:T):T{
  const d=detect(mail.subject,mail.text,mail.links||[]);
  return {...mail,code:d.code,url:d.code?undefined:d.url,hostname:d.code?undefined:d.hostname};
}

export function formatMailBody(text:string){
  return text.replace(/<!--[\s\S]*?-->/g,'').replace(/<\/?[^>\n]+>/g,' ').replace(/\u00a0/g,' ').replace(/\r\n/g,'\n').replace(/[ \t]+\n/g,'\n').replace(/[^\S\n]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}

export function parseMime(payload:any){
  let plain='',html='',size=0;
  function walk(part:any,depth:number){if(depth>12||size>200000)return;if(part.filename)return;
  if(part.body?.data){const bytes=Uint8Array.from(atob(part.body.data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));size+=bytes.length;if(size>200000)return;const contentType=part.headers?.find((h:any)=>h.name.toLowerCase()==='content-type')?.value||'';const charset=/charset=["']?([^;"' ]+)/i.exec(contentType)?.[1]||'utf-8';let t;try{t=new TextDecoder(charset).decode(bytes)}catch{t=new TextDecoder().decode(bytes)}if(part.mimeType==='text/plain')plain+='\n'+t;if(part.mimeType==='text/html')html+='\n'+t;}
  for(const child of part.parts||[])walk(child,depth+1)}walk(payload,0);
  const decode=htmlEntity;
  const links=mergeLinks([extractLinksFromHtml(html),extractLinksFromText(plain),extractLinksFromText(html)]);
  const htmlText=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ');
  return {text:formatMailBody(decode(plain||htmlText)),links};
}
