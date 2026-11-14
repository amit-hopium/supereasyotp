import {copyFileSync,existsSync,readFileSync,writeFileSync} from 'node:fs';

const target='build-pack/legal.env';
const example='build-pack/legal.env.example';

if(existsSync(target)){
  console.log(`${target} already exists — delete it first if you want a fresh template.`);
  process.exit(0);
}

let body=readFileSync(example,'utf8');
body=body
  .replace(/^LEGAL_OPERATOR_NAME=.*$/m,'LEGAL_OPERATOR_NAME=REPLACE_Your legal entity name')
  .replace(/^BUSINESS_OR_CONTACT_ADDRESS=.*$/m,'BUSINESS_OR_CONTACT_ADDRESS=REPLACE_Registered or contact address')
  .replace(/^GOVERNING_JURISDICTION=.*$/m,'GOVERNING_JURISDICTION=India')
  .replace(/^HOSTING_REGION=.*$/m,'HOSTING_REGION=VPS in India (API); website on Hostinger');
copyFileSync(example,target);
writeFileSync(target,body);
console.log(`Created ${target}`);
console.log('Edit these required fields, then: pnpm legal:check && pnpm release:build');
console.log('  - LEGAL_OPERATOR_NAME');
console.log('  - BUSINESS_OR_CONTACT_ADDRESS');
console.log('  - GOVERNING_JURISDICTION (defaulted to India — change if wrong)');
console.log('  - CHROME_STORE_URL (after first CWS upload, or use placeholder until then)');
