import {readFileSync,existsSync} from 'node:fs';

const legalFile='build-pack/legal.env';
const example=readFileSync('build-pack/legal.env.example','utf8');
const requiredKeys=example.split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>l.slice(0,l.indexOf('=')));
const placeholder=/\[[A-Z][A-Z0-9_]+\]/g;

const errors=[];

if(!existsSync(legalFile)){
  errors.push('Missing build-pack/legal.env (copy from build-pack/legal.env.example)');
}else{
  const env=Object.fromEntries(readFileSync(legalFile,'utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{
    const i=l.indexOf('=');
    return [l.slice(0,i),l.slice(i+1).trim()];
  }));
  for(const key of requiredKeys){
    const v=env[key];
    if(!v||v.startsWith('REPLACE_'))errors.push(`build-pack/legal.env: ${key} is not set`);
  }
}

if(existsSync('apps/web/dist/privacy/index.html')){
  const html=readFileSync('apps/web/dist/privacy/index.html','utf8');
  const built=[...new Set(html.match(placeholder)||[])];
  if(built.length)errors.push(`Built site still contains ${built.join(', ')} — run pnpm build after legal.env is complete`);
}

if(errors.length){
  for(const e of errors)console.error(`- ${e}`);
  process.exit(1);
}
console.log('Legal configuration ready for release build.');
