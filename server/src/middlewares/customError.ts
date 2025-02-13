// setup to later be able to create custom errors to help us find bugs quicker

export class CustomError extends Error {
  status?: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
