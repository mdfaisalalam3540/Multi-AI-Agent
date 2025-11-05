// import all necessary files that we need here
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

// making business logic for register or signup

const registerUser = asyncHandler(async (req, res) => {
  // get user details from the frontend
  const { username, email, fullName, password } = req.body;
  // console.log(`email ${email}`);

  // validation - form should be not empty
  if (
    [username, email, fullName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if the user already exist: email, username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    console.log("User already exist");
    throw new ApiError(409, "User with this username or email already exist");
  }

  // we will use avatar in future +++++++++++++++++++++++++++++++

  // // Create user object - create entry in database
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
  });

  // remove password field from response (we will remove refreshToken in future)
  const createdUser = await User.findById(user._id).select(" -password");

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

export { registerUser };
