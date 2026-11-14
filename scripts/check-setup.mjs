import {readFileSync,existsSync} from 'node:fs';
const entries=existsSync('.env')?Object.fromEntries(readFileSync('.env','utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)]})):{};
const checks={oauth:['DATABASE_URL','REDIS_URL','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','API_URL','EXTENSION_ID','TOKEN_KEY','PUBSUB_TOPIC'],push:['PUBSUB_SUBSCRIPTION','PUSH_IDENTITY','SCHEDULER_IDENTITY']};
for(const [group,keys] of Object.entries(checks)){const missing=keys.filter(k=>!entries[k]);console.log(group+': '+(missing.length?'INCOMPLETE ('+missing.join(', ')+')':'configured'))}
console.log('public push endpoint: '+(entries.API_URL?.startsWith('https://')?'configured':'INCOMPLETE (HTTPS API_URL required)'));
