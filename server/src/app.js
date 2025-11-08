// ============================================================
// Import Required Dependencies
// ============================================================

// dotenv loads environment variables from a `.env` file into `process.env`.
// This allows you to store sensitive data like API keys or database URLs securely.
import dotenv from "dotenv";

// express is the main web framework used to create REST APIs and web servers.
import express from "express";

// errorHandler is a custom global middleware that handles all application errors
// and sends back a structured JSON response instead of crashing the server.
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

// cors (Cross-Origin Resource Sharing) allows the backend to accept requests
// from a different domain or port (for example, React frontend on localhost:5173).
import cors from "cors";

// cookie-parser is used to read and write cookies sent from the frontend.
import cookieParser from "cookie-parser";

// ============================================================
// Environment Configuration
// ============================================================
// Load variables from .env file (e.g., PORT, DB_URI, JWT_SECRET)
dotenv.config();

// ============================================================
// Initialize Express App
// ============================================================
const app = express();

// ============================================================
// CORS Configuration (Cross-Origin Resource Sharing)
// ============================================================
// This section allows your frontend (React, Vue, etc.) to communicate with the backend.
// The `origin` specifies which domains are allowed to access this server.
// `credentials: true` means cookies or authorization headers can be shared between frontend and backend.
app.use(
  cors({
    origin: [
      process.env.CORS || "http://localhost:5173",
      process.env.CORS1 || "http://127.0.0.1:5173",
    ],
    credentials: true, // allows cookies/auth headers to be sent in requests
  })
);

// ============================================================
// Middleware Setup
// ============================================================

// Parses incoming JSON requests and puts the parsed data in req.body.
// The `limit` prevents large payload attacks (16 KB max here).
app.use(express.json({ limit: "16kb" }));

// Parses incoming form data (from HTML forms or POST requests) into req.body.
// The `extended: true` allows nested objects to be parsed properly.
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serves static files like images, CSS, or JS from the "public" folder.
app.use(express.static("public"));

// Parses cookies attached to the client request object (req.cookies).
app.use(cookieParser());

// ============================================================
// Import and Mount Routes
// ============================================================

// Import Chat-related routes (handles chat endpoints like /api/chat)
import chatRoutes from "./routes/chat.route.js";

// Mount chat routes under /api
// Example: GET /api/chat/messages → handled by chatRoutes
app.use("/api", chatRoutes);

// Import User-related routes (handles register, login, etc.)
import { router } from "./routes/user.route.js";

// Mount user routes under /api/v1/users
// Example: POST /api/v1/users/register → handled by router
app.use("/api/v1/users", router);

// upload doc route
import { documentRoutes } from "./routes/documentUpload.route.js";
app.use("/api/docs", documentRoutes);

// ============================================================
// Health Check Route
// ============================================================
// This endpoint helps you or monitoring tools verify if the server is running.
// You can access it at: http://localhost:<PORT>/api/health
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK", // indicates that the server is alive
    timestamp: new Date().toISOString(), // current server time
    service: "Enterprise AI Analyst Backend", // name of the service or app
    uptime: process.uptime(), // how long the server has been running
  });
});

// ============================================================
// Test Route (for development or debugging)
// ============================================================
// This endpoint helps confirm that the backend and frontend are connected.
// Useful during initial setup or testing.
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected successfully!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ============================================================
// Global Error Handler (MUST BE LAST MIDDLEWARE)
// ============================================================
// This must come after all routes and middleware.
// It catches any unhandled errors thrown from controllers or routes,
// then uses the errorHandler middleware to send a clean JSON response.
app.use(errorHandler);

// ============================================================
// Export Express App
// ============================================================
// The app is exported to be used in the main server file (e.g., index.js)
// where you can connect to the database and start listening on a specific port.
export { app };
