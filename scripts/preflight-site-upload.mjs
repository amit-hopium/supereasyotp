import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const dist='apps/web/dist';
const tar='InstaMail-site.tar.gz';
const paths=['index.html','privacy/index.html','terms/index.html'];
let fail=0;

for(const p of paths){
  const f=dist+'/'+p;
  if(!existsSync(f)){console.error('MISSING',f,'— run: pnpm release:build');fail++;continue}
  const html=readFileSync(f,'utf8');
  if(/\[[A-Z][A-Z0-9_]+\]/.test(html)){console.error('PLACEHOLDERS',f);fail++}
  else console.log('OK',f,p==='index.html'&&html.includes('SuperEasyOTP')?'(SuperEasyOTP)':'(Hopium Studio Inc.)');
}

if(!existsSync(tar)){
  console.error('MISSING',tar,'— run: pnpm site:pack');fail++;
}else{
  const list=spawnSync('tar',['-tzf',tar,'./privacy/index.html','./index.html'],{encoding:'utf8'});
  if(list.status!==0){console.error('BAD TAR — repack with pnpm site:pack');fail++}
  else console.log('OK',tar,'contains ./privacy/index.html and ./index.html');
}

if(fail){console.error('\nPreflight failed. Fix before hPanel upload.');process.exit(1)}
console.log('\nPreflight passed. Upload',tar,'to public_html and extract so ./privacy/ sits under document root.');
console.log('Then: pnpm site:verify');
