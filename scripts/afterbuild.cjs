const fs = require('node:fs/promises');
const recursiveCopy = require('./_recursiveCopy.cjs');

//
// script launched after build only

const main = async () => {
  await recursiveCopy('src', 'dist');
  await recursiveCopy('types/src', 'dist');
  await fs.writeFile('./dist/dto.d.ts', 'export * from \'./_base/dto/index.d\';\r\n');

  console.log('Copy done');
};

main();
