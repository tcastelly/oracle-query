import RestError from '@/errors/RestError';
import { Db } from './db';
import createQuery from './createQuery';
import { Config, setConfig } from './config';

export interface BackendError extends RestError {}

type Args = {
  dbConfig: Config,
  onExec: (outBinds: unknown) => unknown,
}

const setup = (args: Args) => {
  setConfig(args.dbConfig);
  Db.onExec = args.onExec;
};

export {
  createQuery,
  setup,
};
