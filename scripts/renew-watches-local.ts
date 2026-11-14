import { createDecipheriv } from 'node:crypto';
import pg from 'pg';
import { OAuth2Client } from 'google-auth-library';

const { DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, TOKEN_KEY, PUBSUB_TOPIC, API_URL } = process.env;
if (!DATABASE_URL || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !TOKEN_KEY || !PUBSUB_TOPIC || !API_URL) {
  throw new Error('Missing local API configuration');
}

const key = Buffer.from(TOKEN_KEY, 'base64');
if (key.length !== 32) throw new Error('TOKEN_KEY must be 32 bytes');
const db = new pg.Pool({ connectionString: DATABASE_URL });

function decrypt(value: string) {
  const bytes = Buffer.from(value, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(-16));
  return Buffer.concat([decipher.update(bytes.subarray(12, -16)), decipher.final()]).toString();
}

try {
  const accounts = (await db.query('SELECT id, email, token FROM accounts')).rows;
  for (const account of accounts) {
    const google = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, API_URL + '/oauth/google/callback');
    google.setCredentials({ refresh_token: decrypt(account.token) });
    const token = (await google.getAccessToken()).token;
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/watch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicName: PUBSUB_TOPIC, labelIds: ['INBOX'], labelFilterBehavior: 'INCLUDE' }),
    });
    if (!response.ok) {
      console.error(`Watch failed for ${account.email}: HTTP ${response.status} ${await response.text()}`);
      process.exitCode = 1;
      continue;
    }
    const watch: { expiration: string } = await response.json();
    await db.query("UPDATE accounts SET watch_expires=$1, status='connected' WHERE id=$2", [watch.expiration, account.id]);
    console.log(`Watch active for ${account.email} until ${new Date(Number(watch.expiration)).toISOString()}`);
  }
} finally {
  await db.end();
}
