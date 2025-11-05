// ============================================================
// Import required utility for consistent API responses
// ============================================================

// ApiResponse is a helper class that provides a uniform structure
// for all responses (both success and error). It helps maintain a
// consistent JSON format across the entire backend.
import { ApiResponse } from "../utils/ApiResponse.js";

// ============================================================
// Global Error Handling Middleware
// ============================================================
// This function catches any errors thrown in your application,
// whether from controllers, middlewares, or async functions,
// and formats them into a clean JSON response.
//
// Express automatically passes errors to this middleware
// when you call `next(error)` or when an error is thrown inside
// an asyncHandler-wrapped controller.
// ============================================================
const errorHandler = (err, req, res, next) => {
  // ------------------------------------------------------------
  // Step 1: Determine error type and extract useful information
  // ------------------------------------------------------------
  // If the error is a known instance of ApiError, it will include
  // a `statusCode` and a `message`. Otherwise, we fallback to
  // a default 500 Internal Server Error.
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // ------------------------------------------------------------
  // Step 2: Log error details (useful for debugging)
  // ------------------------------------------------------------
  // This helps developers see exactly what went wrong in the console.
  // In production, you would typically disable or redirect this log
  // to a file or monitoring service like Sentry or Datadog.
  console.error(`[${statusCode}] ${message}`);

  // ------------------------------------------------------------
  // Step 3: Send a structured JSON response to the client
  // ------------------------------------------------------------
  // Instead of sending an unformatted or HTML error page,
  // we send a consistent JSON response. This makes it easy
  // for frontend clients or APIs to handle errors uniformly.
  return res.status(statusCode).json(
    new ApiResponse(
      statusCode, // numeric HTTP status code
      null, // no data since this is an error response
      message // human-readable message about the error
    )
  );
};

// ============================================================
// Export errorHandler middleware
// ============================================================
// Export so it can be used in your main server.js or app.js file.
// It must be placed *after* all routes in your Express app,
// like this:
//
// app.use("/api/v1/users", userRoutes);
// app.use(errorHandler);
// ============================================================
export { errorHandler };
