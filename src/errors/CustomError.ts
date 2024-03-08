export default class CustomError extends Error {
  constructor(message: string) {
    super(message);
    CustomError.captureStackTrace(this, CustomError);
  }
}
