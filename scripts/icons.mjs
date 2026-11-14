import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const svg=readFileSync(join(root,'apps/extension/icons/icon.svg'));
const outDir=join(root,'apps/extension/icons');
const webAssets=join(root,'apps/web/assets');
mkdirSync(outDir,{recursive:true});
mkdirSync(webAssets,{recursive:true});

let sharp;
try{sharp=(await import('sharp')).default}catch{
  console.error('Install sharp to generate icons: pnpm add -D sharp');
  process.exit(1);
}

const master=await sharp(svg,{density:384}).resize(1024,1024,{kernel:sharp.kernel.lanczos3}).png({compressionLevel:9}).toBuffer();

writeFileSync(join(outDir,'logo-1024.png'),master);
writeFileSync(join(webAssets,'instamail-logo-1024.png'),master);

const sizes=[512,128,48,32,16];
for(const size of sizes){
  const png=await sharp(master).resize(size,size,{kernel:sharp.kernel.lanczos3}).png({compressionLevel:9,effort:10}).toBuffer();
  const name=size>=512?`logo-${size}.png`:`${size}.png`;
  writeFileSync(join(outDir,name),png);
}

console.log('Generated SuperEasyOTP logo (1024px master) and toolbar icons (16–128px).');