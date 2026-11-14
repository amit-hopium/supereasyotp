import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';

const tarball='supereasyotp-deploy.tar.gz';
const excludes=[
  '--exclude=node_modules','--exclude=.git','--exclude=supereasyotp-deploy.tar.gz',
  '--exclude=supereasyotp-extension.zip','--exclude=.env','--exclude=.env.production',
  '--exclude=apps/web/dist','--exclude=apps/extension/dist/assets',
].join(' ');

execSync(`tar -czf ${tarball} ${excludes} apps packages infra scripts package.json pnpm-lock.yaml tsconfig.json .dockerignore`,{stdio:'inherit',cwd:process.cwd()});
if(!existsSync(tarball))throw Error('Pack failed');
console.log(`Created ${tarball} — upload to VPS, extract, run scripts/server-redeploy.sh (keep existing .env.production on the server).`);
