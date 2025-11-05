// ============================================================
// Import Required Modules and Files
// ============================================================

// dotenv is used to load environment variables from a `.env` file.
// These variables include sensitive data like PORT, DATABASE_URL, and JWT secrets.
import dotenv from "dotenv";

// connectDB is a custom function that connects your application to MongoDB.
// It handles connection setup, success, and failure messages.
import connectDB from "./db/db.js";

// The main Express application instance (configured in app.js)
// This includes all middleware, routes, and error handling logic.
import { app } from "./app.js";

// ============================================================
// Load Environment Variables
// ============================================================
// dotenv.config() reads variables from .env file and attaches them to process.env.
// The optional `path` property specifies the location of your .env file.
dotenv.config({
  path: "./.env",
});

// ============================================================
// Define Server Port
// ============================================================
// The port number on which your Express server will listen for requests.
// It can be configured in .env file (e.g., PORT=4000).
// If not set, you can define a default value (e.g., 4000) for safety.
const PORT = process.env.PORT || 4000;

// ============================================================
// Connect to MongoDB Database
// ============================================================
// This function initializes the database connection.
// It’s defined in db/db.js and uses mongoose.connect() internally.
connectDB();

// ============================================================
// Start the Express Server
// ============================================================
// Once the database connection is established, the server starts
// listening for incoming HTTP requests on the specified port.
app.listen(PORT, () => {
  // Log confirmation messages to the console for the developer
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});

// ============================================================
// Alternative Connection Method (commented out)
// ============================================================
// This version ensures the server only starts if the MongoDB connection succeeds.
// It's a safer pattern for production applications.
//
//
//
// connectDB()
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on PORT: ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log(`MongoDB Connection Failed`, err);
//   });
