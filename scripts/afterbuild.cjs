const { join } = require('path');
const { copyFile } = require('fs/promises');
const recursiveCopy = require('./_recursiveCopy.cjs');

//
// script launched after build only

const main = async () => {
  await recursiveCopy('src', 'dist');
  await recursiveCopy('types', 'dist');

  console.log('Copy done');
};

main();
