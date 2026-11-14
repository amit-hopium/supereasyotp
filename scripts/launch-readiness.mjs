#!/usr/bin/env node
/**
 * Local + live checks for Dec 1 launch. Run: pnpm launch:readiness
 * Legal site must still be deployed by you before OAuth/CWS.
 */
import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const root=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
let fail=0;
const ok=(m)=>console.log('OK  ',m);
const bad=(m)=>{console.log('FAIL',m);fail++};

const zip=root+'/supereasyotp-site.tar.gz';
const ext=root+'/supereasyotp-extension.zip';
const legal=root+'/build-pack/legal.env';
const hostinger=root+'/build-pack/hostinger-site.env';

existsSync(legal)?ok('build-pack/legal.env'):bad('build-pack/legal.env missing');
existsSync(ext)?ok('supereasyotp-extension.zip'):bad('supereasyotp-extension.zip — pnpm extension:zip');
existsSync(zip)?ok('supereasyotp-site.tar.gz'):bad('supereasyotp-site.tar.gz — pnpm site:pack');
existsSync(hostinger)?ok('hostinger-site.env (deploy ready)'):console.log('—   hostinger-site.env optional (hPanel upload ok)');

const pre=spawnSync(process.execPath,[root+'/scripts/preflight-site-upload.mjs'],{encoding:'utf8'});
pre.status===0?ok('site preflight (local dist)'):bad('site preflight: '+pre.stderr.split('\n')[0]);

const prod=spawnSync(process.execPath,[root+'/scripts/check-production.mjs'],{encoding:'utf8',env:{...process.env}});
prod.status===0?ok('production:check (local .env.production)'):bad('production:check');

const tc=spawnSync('pnpm',['typecheck'],{cwd:root,encoding:'utf8',shell:true});
tc.status===0?ok('pnpm typecheck'):bad('pnpm typecheck');
const tests=spawnSync('pnpm',['test'],{cwd:root,encoding:'utf8',shell:true});
tests.status===0?ok('pnpm test'):bad('pnpm test');

const skipLive=process.env.SKIP_LIVE==='1';
let siteVerifyFail=false;
if(skipLive){
  console.log('—   SKIP_LIVE=1 (skipping API + site:verify)');
}else{
  try{
    const r=await fetch('https://api.hopiumstudio.com/readyz',{signal:AbortSignal.timeout(12000)});
    const j=await r.json();
    r.ok&&j?.ok?ok('api.hopiumstudio.com/readyz'):bad('API readyz');
  }catch{bad('API readyz (network)')}

  const site=spawnSync('pnpm',['site:verify'],{cwd:root,encoding:'utf8',shell:true});
  if(site.status===0)ok('pnpm site:verify (live legal site)');
  else{bad('pnpm site:verify — deploy site first (docs/LAUNCH-NEXT-15MIN.md)');siteVerifyFail=true;}
}

if(fail){
  console.log(`\n${fail} blocker(s). See docs/LAUNCH-BLOCKERS.md`);
  if(siteVerifyFail){
    console.log('\nAfter site:verify passes, same day:');
    console.log('  1. docs/OAUTH-SUBMIT-STEPS.md (+ demo video)');
    console.log('  2. docs/CWS-SUBMIT-CHECKLIST.md');
    console.log('  3. docs/GCP-SCHEDULER-SETUP.md + docs/PUSH-DELIVERY-TEST-LOG.md');
  }
}else console.log('\nLocal gates passed — run manual OAuth/CWS/scheduler steps in docs/LAUNCH-DEC1-CHECKLIST.md');
process.exit(fail?1:0);
