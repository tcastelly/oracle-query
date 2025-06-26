import { EOL } from 'os';
import CustomError from './CustomError';
import type { Query } from '../createQuery';

export default class DbError extends CustomError {
  query: null | Query = null;

  // not possible to use "code" name because of conflict with oracle
  codeError: string;

  details: string[];

  constructor(error: Error & { code: string }, query: null | Query) {
    super(`${error.message} ${query ? query.toString() : 'No query'}`);
    this.details = error.message.split(EOL);
    this.codeError = error.code;
    this.query = query;
  }
}
