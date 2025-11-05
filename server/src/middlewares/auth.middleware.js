// ==============================================
// verifyJWT Middleware
// ==============================================
// This middleware verifies that every protected route request
// contains a valid JWT (JSON Web Token). If the token is valid,
// the request is allowed to continue; otherwise, it throws an error.
//
// Flow of this middleware:
// 1. Extract token from cookies or Authorization header
// 2. Verify the token using the secret key
// 3. Decode the token to identify the user
// 4. Fetch the user from the database
// 5. Attach user data to req.user and call next()
// ==============================================

import { ApiError } from "../utils/ApiError.js"; // Custom error class for consistent error handling
import { asyncHandler } from "../utils/asyncHandler.js"; // Wrapper to handle async/await errors cleanly
import { User } from "../models/user.model.js"; // Mongoose model for database queries
import jwt from "jsonwebtoken"; // Library for signing and verifying JWTs

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // ----------------------------------------------
    // Step 1: Extract token from request
    // ----------------------------------------------
    // Tokens can be sent in two ways:
    // a) Stored in cookies (common for browser-based apps)
    // b) In Authorization header as "Bearer <token>" (common for APIs)
    const token =
      req.cookies?.accessToken || // Optional chaining prevents runtime errors if cookies is undefined
      req.header("Authorization")?.replace("Bearer ", "");

    // If no token is found, deny access immediately
    if (!token) {
      throw new ApiError(401, "Unauthorized request. Token is missing.");
    }

    // ----------------------------------------------
    // Step 2: Verify the token using the secret key
    // ----------------------------------------------
    // jwt.verify() checks if the token is valid and not expired.
    // It also decodes the payload to extract stored user information.
    const decodedTokenInformation = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET // Secret key used to sign tokens during login
    );

    // ----------------------------------------------
    // Step 3: Fetch the user from database using decoded _id
    // ----------------------------------------------
    // The token payload should include user._id which was embedded when created.
    // We find the user by that ID and exclude sensitive fields (password and refreshToken).
    const user = await User.findById(decodedTokenInformation?._id).select(
      "-password -refreshToken"
    );

    // ----------------------------------------------
    // Step 4: Validate the user existence
    // ----------------------------------------------
    // If no user matches the decoded _id, the token might be invalid or stale.
    if (!user) {
      throw new ApiError(401, "Invalid Access Token. User not found.");
    }

    // ----------------------------------------------
    // Step 5: Attach user to request object
    // ----------------------------------------------
    // This allows protected route handlers to access user info via req.user
    req.user = user;

    // Call the next middleware or controller
    next();
  } catch (error) {
    // ----------------------------------------------
    // Step 6: Handle token or verification errors
    // ----------------------------------------------
    // This catch block handles cases such as:
    // - Token expired
    // - Token signature invalid
    // - Missing or malformed token
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
