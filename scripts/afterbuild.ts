import fs from 'node:fs/promises';
import recursiveCopy from './recursiveCopy';

//
// script launched after build only

const main = async () => {
  await recursiveCopy('src', 'dist');
  await recursiveCopy('types/src', 'dist');
  await fs.writeFile('./dist/dto.d.ts', 'export * from \'./_base/dto/index.d\';\r\n');

  console.log('Copy done');
};

main();
