import {applyDetection,detect} from '../detector';
export type Account={id:string;email:string;status:string;watchExpiresAt?:number};
export type MailLink={text:string;url:string};
export type Mail={id:string;accountId:string;email:string;sender:string;subject:string;text:string;date:number;unread:boolean;code?:string;url?:string;hostname?:string;links?:MailLink[]};
export type AlertDelivery='off'|'popup'|'notification';
export type Settings={limit:number;alertDelivery:AlertDelivery;theme:string;selected:string;condensed:boolean;otpOnly:boolean;autoCopyOtp:boolean};
export const defaults:Settings={limit:3,alertDelivery:'popup',theme:'light',selected:'all',condensed:false,otpOnly:false,autoCopyOtp:false};
const inboxLimitOpts=[1,3,10] as const;
export function normalizeSettings(raw:Partial<Settings>&{automatic?:boolean;alertDelivery?:string}={}):Settings{
  const merged={...defaults,...raw};
  if(!('alertDelivery' in raw)&&'automatic' in raw)merged.alertDelivery=raw.automatic===false?'off':'popup';
  if((raw.alertDelivery as string|undefined)==='both')merged.alertDelivery='popup';
  if(!['off','popup','notification'].includes(merged.alertDelivery))merged.alertDelivery=defaults.alertDelivery;
  if(merged.limit===5)merged.limit=10;
  if(!inboxLimitOpts.includes(merged.limit as typeof inboxLimitOpts[number]))merged.limit=defaults.limit;
  return merged;
}
function sortedInbox(items:Mail[],settings:Settings){return items.filter(m=>settings.selected==='all'||m.accountId===settings.selected).filter(m=>!settings.otpOnly||(()=>{const s=mailSignals(m);return Boolean(s.code||s.url)})()).sort((a,b)=>b.date-a.date||a.accountId.localeCompare(b.accountId)||a.id.localeCompare(b.id))}
export function newest(items:Mail[],settings:Settings){return sortedInbox(items,settings).slice(0,settings.limit)}
export function formatMailAge(at:number,now=Date.now()){const mins=Math.max(0,Math.floor((now-at)/60000));if(mins<1)return 'now';if(mins<60)return mins+'m';const hours=Math.floor(mins/60);if(hours<24)return hours+'h';return Math.floor(hours/24)+'d'}
export function mailSignals(mail:Mail){const m=applyDetection(mail);return {code:m.code,url:m.code?undefined:m.url}}
