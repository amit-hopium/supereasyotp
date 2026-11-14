const paths=['','privacy/','terms/','delete-data/','security/','support/'];
const base=process.env.SITE_URL||'https://www.hopiumstudio.com';
let fail=0;
for(const p of paths){
  const url=base+'/'+p;
  const r=await fetch(url,{redirect:'follow'});
  const html=await r.text();
  const hop=p===''?html.includes('SuperEasyOTP'):html.includes('Hopium Studio Inc.');
  const bad=/\[[A-Z][A-Z0-9_]+\]/.test(html);
  const ok=r.ok&&!bad&&hop;
  if(!ok)fail++;
  const reasons=[];
  if(!r.ok)reasons.push(`HTTP ${r.status}`);
  if(bad)reasons.push('PLACEHOLDERS');
  if(!hop)reasons.push(p===''?'homepage is not SuperEasyOTP (hPanel upload?)':'missing Hopium Studio operator text');
  console.log(ok?'OK':'FAIL',url,reasons.join('; '));
}
if(fail){console.error(`\n${fail} path(s) failed — Hostinger: docs/LAUNCH-NEXT-15MIN.md · VPS DNS: docs/SITE-DEPLOY-VPS-DNS.md`);process.exit(1)}
console.log('\nLive site ready for OAuth / Chrome Web Store.');
