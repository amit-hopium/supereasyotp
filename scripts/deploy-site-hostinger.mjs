import {existsSync} from 'node:fs';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const envPath=join(root,'build-pack/hostinger-site.env');
const dist=join(root,'apps/web/dist');

if(!existsSync(dist+'/privacy/index.html')){
  console.error('Missing built site. Run: SITE_URL=https://www.hopiumstudio.com API_URL=https://api.hopiumstudio.com pnpm release:build');
  process.exit(1);
}

if(!existsSync(envPath)){
  console.error('Create',envPath,'from build-pack/hostinger-site.env.example (FTP/SFTP details from hPanel).');
  console.error('Or upload supereasyotp-site.tar.gz manually — docs/LAUNCH-NEXT-15MIN.md');
  process.exit(1);
}

const env=Object.fromEntries(
  readFileSync(envPath,'utf8')
    .split('\n')
    .filter(l=>l&&!l.startsWith('#')&&l.includes('='))
    .map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}),
);

const host=env.HOSTINGER_SSH_HOST;
const port=env.HOSTINGER_SSH_PORT||'65002';
const user=env.HOSTINGER_SSH_USER;
const remote=env.HOSTINGER_REMOTE_PATH?.replace(/\/?$/,'/');

if(!host||!user||!remote){
  console.error('Set HOSTINGER_SSH_HOST, HOSTINGER_SSH_USER, HOSTINGER_REMOTE_PATH in',envPath);
  process.exit(1);
}

const ssh=`ssh -p ${port} -o StrictHostKeyChecking=accept-new`;
const r=spawnSync('rsync',['-avz','--delete','-e',ssh,dist+'/',`${user}@${host}:${remote}`],{stdio:'inherit'});
if(r.status!==0){
  console.error('rsync failed. Check SSH/FTP path in hPanel (often …/public_html/).');
  process.exit(r.status??1);
}
console.log('Synced',dist,'→',`${user}@${host}:${remote}`);
console.log('Run: pnpm site:verify');
