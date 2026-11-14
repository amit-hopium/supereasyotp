import {createWriteStream} from 'node:fs';
import {mkdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';

const dist='apps/web/dist';
if(!existsSync(dist+'/privacy/index.html')){
  console.error('Missing '+dist+' — run: pnpm release:build');
  process.exit(1);
}

const html=await readFile(dist+'/privacy/index.html','utf8');
if(/\[[A-Z][A-Z0-9_]+\]/.test(html)){
  console.error('Built site still has legal placeholders. Fill build-pack/legal.env and pnpm release:build.');
  process.exit(1);
}

const out='InstaMail-site.tar.gz';
mkdir('dist-packs',{recursive:true}).catch(()=>{});
const r=spawnSync('tar',['-czf',out,'-C',dist,'.'],{stdio:'inherit'});
if(r.status!==0)process.exit(r.status??1);
console.log(`Created ${out} (${dist} contents). Upload to VPS and extract to site root.`);
console.log('Example (Hostinger, adjust path):');
console.log('  scp InstaMail-site.tar.gz root@YOUR_VPS:/root/');
console.log('  ssh root@YOUR_VPS \'mkdir -p /var/www/hopiumstudio.com && tar -xzf /root/InstaMail-site.tar.gz -C /var/www/hopiumstudio.com\'');
