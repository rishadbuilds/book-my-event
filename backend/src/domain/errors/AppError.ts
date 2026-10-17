export class AppError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message)
  }
}
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') { super(message, 409) }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401) }
}