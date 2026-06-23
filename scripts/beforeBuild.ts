import { mkdir, rm } from 'node:fs/promises';

//
// script launched before build only

const del = (dir: string) => rm(dir, { recursive: true, force: true });

const main = async () => {
  await Promise.all([
    del('./dist'),
    del('./types'),
  ]);

  await mkdir('./dist');
};

main();
