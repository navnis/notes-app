// A known, expected error (bad input, duplicate email, bad credentials, ...)
// that a route handler catches and turns into a specific status + message,
// as opposed to an unexpected bug that falls through to the generic 500
// handler in middleware/errorHandler.ts.
export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
