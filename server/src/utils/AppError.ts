// A known, expected error a route turns into a specific status + message (vs. an unexpected bug).
export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
