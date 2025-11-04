class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    // Call parent constructor (Error)
    super(message);
    this.statusCode = statusCode; // e.g. 404, 500, 400
    this.data = null;
    this.success = false; // for consistent API responses
    this.errors = errors; // optional detailed errors (like validation)
    this.message = message;

    // Capture stack trace for debugging
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
