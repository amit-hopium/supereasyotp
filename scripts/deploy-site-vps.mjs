import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';

const host=process.env.VPS_HOST||'root@189.72.149.83';
const remoteDir=process.env.VPS_INSTAMAIL||'/opt/supereasyotp';
const dist='apps/web/dist';

if(!existsSync(dist+'/privacy/index.html')){
  console.error('Missing '+dist+' — run: SITE_URL=https://www.hopiumstudio.com API_URL=https://api.hopiumstudio.com pnpm release:build');
  process.exit(1);
}

console.log('Syncing static site to',host+':'+remoteDir+'/site/');
const rsync=spawnSync('rsync',['-avz','--delete',dist+'/',host+':'+remoteDir+'/site/'],{stdio:'inherit'});
if(rsync.status!==0)process.exit(rsync.status??1);

console.log('\nOn VPS, ensure .env.production has:');
console.log('  PUBLIC_SITE_HOSTS=hopiumstudio.com, www.hopiumstudio.com');
console.log('  SITE_ROOT=../site');
console.log('\nThen restart Caddy (from',remoteDir+'/infra):');
console.log('  docker compose --env-file ../.env.production -f compose.production.yaml up -d caddy');
console.log('\nDNS: point hopiumstudio.com and www A records to the API VPS IP (189.72.149.83) when ready.');
console.log('Verify: pnpm site:verify');
