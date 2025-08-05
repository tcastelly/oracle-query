//
// script launched before build only

const { mkdir, rm } = require('node:fs/promises');

const del = (dir) => rm(dir, { recursive: true, force: true });

const main = async () => {
  await Promise.all([
    del('./dist'),
    del('./types'),
  ]);

  await mkdir('./dist');
};

main();
