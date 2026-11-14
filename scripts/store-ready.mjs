#!/usr/bin/env node
/**
 * One shot: legal check → production check → release build → extension zip → live site verify.
 * Run from repo root: pnpm store:ready
 */
import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const root=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
const run=(cmd,args,env={})=>{
  const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8',env:{...process.env,...env},shell:cmd==='pnpm'});
  if(r.stdout)process.stdout.write(r.stdout);
  if(r.stderr)process.stderr.write(r.stderr);
  return r.status??1;
};

const prodFile='.env.production';
if(!existsSync(prodFile)){
  console.error('Missing .env.production — copy .env.production.example and fill production values.');
  process.exit(1);
}
const prod=Object.fromEntries(readFileSync(prodFile,'utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{
  const i=l.indexOf('=');
  return [l.slice(0,i).trim(),l.slice(i+1).trim()];
}));
const siteUrl=process.env.SITE_URL||prod.SITE_URL||'https://supereasyotp.com';
const apiUrl=prod.API_URL;
if(!apiUrl){console.error('.env.production: API_URL required');process.exit(1);}

let fail=0;
for(const [label,status] of [
  ['legal:check',run(process.execPath,['scripts/check-legal.mjs'])],
  ['production:check',run(process.execPath,['scripts/check-production.mjs'],{ENV_FILE:prodFile})],
  ['typecheck',run('pnpm',['typecheck'])],
  ['test',run('pnpm',['test'])],
]){
  if(status!==0){console.error(`FAIL ${label}`);fail++;}
  else console.log(`OK   ${label}`);
}
if(fail){process.exit(1);}

const build=run(process.execPath,['--import','tsx','scripts/build.ts'],{API_URL:apiUrl,SITE_URL:siteUrl});
if(build!==0){console.error('FAIL release build');process.exit(1);}
console.log('OK   release build');

if(run('pnpm',['extension:zip'])!==0){console.error('FAIL extension:zip');process.exit(1);}
console.log('OK   supereasyotp-extension.zip (supereasyotp-extension.zip)');

const live=run(process.execPath,['scripts/verify-live-site.mjs'],{SITE_URL:siteUrl.replace(/\/$/,'')});
if(live!==0){
  console.log('—   Live site verify failed — deploy Vercel after push, then re-run: SITE_URL='+siteUrl+' pnpm site:verify');
}else console.log('OK   live site');

console.log(`
Ready for Chrome Web Store upload:
  ZIP: ${root}/supereasyotp-extension.zip
  Listing copy: build-pack/CHROME-STORE-SUBMIT.md
  Privacy URL: ${siteUrl.replace(/\/$/,'')}/privacy/
  OAuth / demo video: build-pack/08-LAUNCH-AND-VERIFICATION.md (sections B, C, E, F)
`);