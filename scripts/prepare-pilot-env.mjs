import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';

const target='.env.production';
if(existsSync(target))throw Error(`${target} already exists; refusing to replace credentials`);
const local=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(line=>line&&!line.startsWith('#')).map(line=>{
  const separator=line.indexOf('=');
  return [line.slice(0,separator),line.slice(separator+1)];
}));
for(const name of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','EXTENSION_ID','PUBSUB_TOPIC'])if(!local[name])throw Error(`Missing ${name} from local .env`);

const host=process.argv[2]||'api.hopiumstudio.com';
if(!/^[a-z0-9.-]+$/.test(host)||!host.includes('.'))throw Error('Expected a DNS hostname');
const apiUrl=`https://${host}`;
const password=randomBytes(24).toString('hex');
const values={
  API_HOST:host,
  API_URL:apiUrl,
  PORT:'8787',
  POSTGRES_PASSWORD:password,
  DATABASE_URL:`postgres://supereasyotp:${password}@postgres:5432/supereasyotp`,
  REDIS_URL:'redis://redis:6379',
  GOOGLE_CLIENT_ID:local.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET:local.GOOGLE_CLIENT_SECRET,
  EXTENSION_ID:local.EXTENSION_ID,
  TOKEN_KEY:randomBytes(32).toString('base64'),
  PUBSUB_TOPIC:local.PUBSUB_TOPIC,
  PUBSUB_SUBSCRIPTION:'projects/pragmatic-armor-514309-t6/subscriptions/supereasyotp-gmail-push',
  PUSH_IDENTITY:'supereasyotp-push@pragmatic-armor-514309-t6.iam.gserviceaccount.com',
  PUSH_AUDIENCE:`${apiUrl}/internal/pubsub/gmail`,
  SCHEDULER_IDENTITY:'supereasyotp-scheduler@pragmatic-armor-514309-t6.iam.gserviceaccount.com',
  SITE_URL:'https://hopiumstudio.com'
};
writeFileSync(target,Object.entries(values).map(([name,value])=>`${name}=${value}`).join('\n')+'\n',{mode:0o600,flag:'wx'});
console.log(`Created ${target} for ${host}. Store TOKEN_KEY securely before relying on this server.`);
