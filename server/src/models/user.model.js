// ================================================
// 🧩 user.model.js — Handles all user-related DB logic
// ================================================

// Importing mongoose to interact with MongoDB
import mongoose from "mongoose";
// Import bcrypt for password hashing (to keep them secure)
import bcrypt from "bcrypt";
// Import JWT for generating tokens (used for authentication)
import jwt from "jsonwebtoken";

// Destructuring mongoose for cleaner syntax
const { Schema, model } = mongoose;

// ============================================================
// 🧠 Define the Schema (blueprint) for our "User" collection
// ============================================================
// A Schema defines what fields each User document will have,
// their types, validations, and special behaviors.
const userSchema = new Schema(
  {
    // MongoDB automatically generates a unique `_id` for each document

    // 🔹 Username field
    username: {
      type: String, // Must be a string
      required: [true, "Username is required"], // Mandatory field
      unique: true, // No two users can have the same username
      minLength: [6, "Minimum 6 characters needed"], // Validation rule
      maxLength: [50, "Maximum 50 characters allowed"],
      lowercase: true, // Automatically convert to lowercase before saving
      trim: true, // Remove spaces before/after text
      index: true, // Create index for faster search queries
    },

    // 🔹 Email field
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // Makes email case-insensitive
      trim: true,
    },

    // 🔹 Full name field
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      minLength: [3, "Minimum 3 characters needed"],
      maxLength: [50, "Maximum 50 characters allowed"],
      lowercase: true,
      trim: true,
    },

    // 🔹 Password field
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true, // Removes whitespace around password
    },

    // 🔹 Avatar field (optional)
    // In real projects, this might be a Cloudinary URL or image link
    avatar: {
      type: String,
    },

    // 🔹 Refresh Token (used to generate new access tokens)
    refreshToken: {
      type: String,
    },
  },

  {
    // 🔹 timestamps = true automatically adds two fields:
    // createdAt → When user was created
    // updatedAt → When user was last modified
    timestamps: true,
  }
);

// ============================================================
// 🧂 Mongoose Middleware (pre-save hook)
// ============================================================
// This "pre-save" hook runs automatically before saving a user to DB.
// It ensures the password is always stored in a hashed (encrypted) form.
userSchema.pre("save", async function (next) {
  // "this" refers to the current user document being saved

  // If password hasn't been modified (e.g., updating avatar), skip hashing
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt (10 salt rounds = good balance of speed & security)
  this.password = await bcrypt.hash(this.password, 10);

  // Move on to the next middleware or save operation
  next();
});

// ============================================================
// 🔍 Compare entered password with hashed password in DB
// ============================================================
// This custom method lets us check whether the user's input password
// matches the hashed password stored in the database.
userSchema.methods.isPasswordCorrect = async function (password) {
  // bcrypt.compare() returns true if passwords match, false otherwise
  return await bcrypt.compare(password, this.password);
};

// ============================================================
// 🔑 Generate Access Token (Short-lived, ~15 mins)
// ============================================================
// Access Tokens are sent to the frontend after successful login.
// The frontend includes it in headers for accessing protected routes.
userSchema.methods.generateAccessToken = function () {
  // Create a signed JWT (JSON Web Token)
  // JWT consists of: Header + Payload + Signature
  return jwt.sign(
    {
      _id: this._id, // Unique user ID
      email: this.email, // Email (for identifying user)
      username: this.username, // Username (optional convenience)
      fullName: this.fullName, // Full name (can be used in UI)
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key for signing (keep this safe!)
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// ============================================================
// 🔄 Generate Refresh Token (Long-lived, e.g., 7 days)
// ============================================================
// Refresh Tokens are used to get a new access token when the old one expires.
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// ============================================================
// 🧾 Export the Mongoose Model
// ============================================================
// "model()" compiles the schema into a Model — like a class in OOP.
// The first argument "User" is the collection name (Mongo will create "users").
export const User = model("User", userSchema);
