import { mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';

export default async function mkdirIfNotExist(dest: string) {
  try {
    await access(dest, constants.F_OK);
  } catch {
    await mkdir(dest);
  }
}
