import {readFileSync} from 'node:fs';

const file=process.argv[2]||'.env.production';
let values;
try {
  values=Object.fromEntries(readFileSync(file,'utf8').split(/\r?\n/).filter(line=>line&&!line.startsWith('#')).map(line=>{
    const separator=line.indexOf('=');
    return [line.slice(0,separator),line.slice(separator+1)];
  }));
} catch {
  console.error(`Cannot read ${file}`);
  process.exit(1);
}

const errors=[];
const required=['API_HOST','API_URL','POSTGRES_PASSWORD','DATABASE_URL','REDIS_URL','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','EXTENSION_ID','TOKEN_KEY','PUBSUB_TOPIC','PUBSUB_SUBSCRIPTION','PUSH_IDENTITY','PUSH_AUDIENCE','SCHEDULER_IDENTITY'];
for(const name of required)if(!values[name]||values[name].startsWith('REPLACE_'))errors.push(`${name} is missing`);
if(values.API_HOST&&values.API_URL!==`https://${values.API_HOST}`)errors.push('API_URL must be https://API_HOST');
if(values.API_URL&&values.PUSH_AUDIENCE!==`${values.API_URL}/internal/pubsub/gmail`)errors.push('PUSH_AUDIENCE must match the push webhook URL exactly');
if(values.EXTENSION_ID&&!/^[a-p]{32}$/.test(values.EXTENSION_ID))errors.push('EXTENSION_ID must be the 32-character Chrome extension ID');
if(values.TOKEN_KEY&&Buffer.from(values.TOKEN_KEY,'base64').length!==32)errors.push('TOKEN_KEY must decode to 32 bytes');
if(values.POSTGRES_PASSWORD&&values.DATABASE_URL){
  try {
    const url=new URL(values.DATABASE_URL);
    if(url.protocol!=='postgres:'||url.hostname!=='postgres'||url.username!=='instamail'||decodeURIComponent(url.password)!==values.POSTGRES_PASSWORD)errors.push('DATABASE_URL must use the production Postgres service and matching password (deployed role: instamail)');
  } catch { errors.push('DATABASE_URL is invalid'); }
}
if(values.REDIS_URL!=='redis://redis:6379')errors.push('REDIS_URL must point to the private Redis service');
if(values.PUBSUB_TOPIC&&!/^projects\/[a-z][a-z0-9-]+\/topics\/[a-zA-Z][\w-]+$/.test(values.PUBSUB_TOPIC))errors.push('PUBSUB_TOPIC is invalid');
if(values.PUBSUB_SUBSCRIPTION&&!/^projects\/[a-z][a-z0-9-]+\/subscriptions\/[a-zA-Z][\w-]+$/.test(values.PUBSUB_SUBSCRIPTION))errors.push('PUBSUB_SUBSCRIPTION is invalid');
if(values.PUBSUB_TOPIC&&values.PUBSUB_SUBSCRIPTION&&values.PUBSUB_TOPIC.split('/')[1]!==values.PUBSUB_SUBSCRIPTION.split('/')[1])errors.push('Pub/Sub topic and subscription must be in the same project');
if(values.PUSH_IDENTITY&&!values.PUSH_IDENTITY.endsWith('.gserviceaccount.com'))errors.push('PUSH_IDENTITY must be a Google service account email');
if(values.SCHEDULER_IDENTITY&&!values.SCHEDULER_IDENTITY.endsWith('.gserviceaccount.com'))errors.push('SCHEDULER_IDENTITY must be a Google service account email');

if(errors.length){for(const error of errors)console.error(`- ${error}`);process.exit(1)}
console.log('Production configuration is structurally valid. This does not confirm DNS, Google resources, or live delivery.');
