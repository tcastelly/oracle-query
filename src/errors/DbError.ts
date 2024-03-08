import CustomError from './CustomError';
import type { Query } from '../createQuery';

export default class DbError extends CustomError {
  query: null | Query = null;

  constructor(error: Error, query: null | Query) {
    super(`${error.message} ${query ? query.toString() : 'No query'}`);
    this.query = query;
  }
}
