// ============================================================
// Import all required modules and utilities
// ============================================================

// asyncHandler: wraps async route handlers and automatically forwards
// any errors to Express' error middleware instead of using try/catch everywhere.
import { asyncHandler } from "../utils/asyncHandler.js";

// ApiError: a custom error class that lets us throw consistent
// structured errors with statusCode and message.
import { ApiError } from "../utils/ApiError.js";

// ApiResponse: a helper class to send consistent JSON responses
// with the same shape (statusCode, data, message).
import { ApiResponse } from "../utils/ApiResponse.js";

// User: the Mongoose model that handles user data in MongoDB.
import { User } from "../models/user.model.js";

// ============================================================
// Helper Function: generateAccessAndRefreshTokens
// ============================================================
// This function generates new access and refresh tokens for a user,
// saves the refresh token in the database, and returns both tokens.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find user by ID in MongoDB
    const user = await User.findById(userId);

    // If user not found, throw error
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    // Call model methods to generate access and refresh tokens
    // (These are defined inside user.model.js)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the new refresh token in the user document
    user.refreshToken = refreshToken;

    // Save without running validations again
    await user.save({ validateBeforeSave: false });

    // Return both tokens to be used by the controller
    return { accessToken, refreshToken };
  } catch (error) {
    // If any error occurs during token generation, throw structured error
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

// ============================================================
// Controller: registerUser
// ============================================================
// This function handles new user registration.
// It performs the following steps:
// 1. Extract data from request body.
// 2. Validate the input.
// 3. Check for existing user.
// 4. Create and store new user in MongoDB.
// 5. Remove sensitive data (password) from response.
// 6. Return success response to client.
const registerUser = asyncHandler(async (req, res) => {
  // Step 1: Extract data from frontend request body
  const { username, email, fullName, password } = req.body;

  // Step 2: Validate input fields
  // If any field is missing or empty, throw a 400 error.
  if (
    [username, email, fullName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Step 3: Check whether a user already exists with same username or email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    console.log("User already exists in database");
    throw new ApiError(409, "User with this username or email already exists");
  }

  // Step 4: Create a new user entry in MongoDB
  // The password will automatically be hashed by the pre("save") hook
  // inside user.model.js before saving to the database.
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    fullName,
    password,
  });

  // Step 5: Fetch the created user again, excluding sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Step 6: If user was not created successfully, throw an error
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Step 7: Send success response with created user data
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// ============================================================
// Controller: loginUser
// ============================================================
// This function handles user login and performs these actions:
// 1. Extract login data (username/email, password).
// 2. Validate input.
// 3. Check if the user exists.
// 4. Verify password correctness.
// 5. Generate new tokens.
// 6. Set tokens as cookies.
// 7. Send a success response with user data and tokens.
const loginUser = asyncHandler(async (req, res) => {
  // Step 1: Extract data from request body
  const { username, email, password } = req.body;

  // Step 2: Validate that at least one of username or email is provided
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // Step 3: Find the user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Step 4: Check if the provided password matches the stored hashed password
  const isPasswordMatch = await user.isPasswordCorrect(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Step 5: Generate new access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Step 6: Fetch the user again but exclude sensitive fields
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Step 7: Configure cookie options
  // httpOnly: prevents JavaScript access (for security)
  // secure: ensures cookie only sent over HTTPS
  // sameSite: "None" required for cross-origin requests
  // maxAge: defines how long cookie should live
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds
  };

  // Step 8: Set cookies and send final response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// ============================================================
// Controller: logoutUser
// ============================================================
// This function handles the user logout process.
// The flow:
// 1. Remove the user's refresh token from the database.
// 2. Clear cookies that store authentication tokens.
// 3. Send a success response to confirm logout.
// ============================================================

const logoutUser = asyncHandler(async (req, res) => {
  // ------------------------------------------------------------
  // Step 1: Remove refresh token from user record in the database
  // ------------------------------------------------------------
  // When a user logs out, we remove the stored refresh token so it
  // can’t be used again to generate new access tokens.
  // `findByIdAndUpdate` finds the current user by their ID (req.user._id)
  // and sets the refreshToken field to undefined.
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined }, // delete stored refresh token
    },
    {
      new: true, // return the updated document (not required here, but good practice)
    }
  );

  // ------------------------------------------------------------
  // Step 2: Define cookie options
  // ------------------------------------------------------------
  // httpOnly: prevents client-side JavaScript from reading cookies (security)
  // secure: ensures cookies are sent only over HTTPS
  // sameSite: "None" allows cross-origin cookies (useful for frontend-backend setups)
  // maxAge: defines how long the cookie should live before expiring (10 days)
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds
  };

  // ------------------------------------------------------------
  // Step 3: Clear authentication cookies and send response
  // ------------------------------------------------------------
  // clearCookie("accessToken") removes the stored access token.
  // We then send back a success message confirming logout.
  // Note: It's good practice to clear both accessToken and refreshToken.
  return res
    .status(200)
    .clearCookie("accessToken", options) // remove access token cookie
    .clearCookie("refreshToken", options) // also remove refresh token cookie
    .json(
      new ApiResponse(
        200,
        {
          username: req.user.username,
          fullName: req.user.fullName,
          loggedOutAt: new Date().toLocaleString(),
        },
        "User logged out successfully"
      )
    ); // { username: req.user.username, fullName: req.user.fullName } => Include the logged-out here so that people can know that they are logged out
});

// ============================================================
// Export controllers for use in routes
// ============================================================
// These functions can now be imported into route files
// such as user.routes.js to define endpoints.
export { registerUser, loginUser, logoutUser };
