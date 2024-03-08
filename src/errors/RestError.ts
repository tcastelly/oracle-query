import type { Obj } from '@/types';
import CustomError from './CustomError';

export default class RestError extends CustomError {
  code = 500;

  /**
   * The JSON put will be print by express middleware
   */
  output: null | Obj = null;

  constructor(message: string) {
    super(message);
    this.output = { message };
  }
}
