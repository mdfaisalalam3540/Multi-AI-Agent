import { ApiResponse } from "../utils/ApiResponse.js";

const errorHandler = (err, req, res, next) => {
  // If It's an instance of ApiError, use its properties.
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // for debugging (remove in production)
  console.error(`[${statusCode}] ${message}`);

  // Format response consistently
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, null, message));
};

export { errorHandler };
