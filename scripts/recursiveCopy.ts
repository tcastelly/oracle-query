import { readdir, stat, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import mkdirIfNotExist from './mkdirIfNotExist';

export default async function recursiveCopy(src: string, dest: string): Promise<unknown> {
  const isDirectory = (await stat(src)).isDirectory();
  if (isDirectory) {
    await mkdirIfNotExist(dest);

    const childItemNames = await readdir(src);
    return Promise.all(
      childItemNames.map((childItemName) => recursiveCopy(
        join(src, childItemName),
        join(dest, childItemName),
      )),
    );
  }

  if (src.search(/\.js\.flow$/) > -1 || src.search(/\.d\.ts$/) > -1) {
    return copyFile(src, dest);
  }
  return null;
}
