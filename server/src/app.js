import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Fix CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import Route
import chatRoutes from "./routes/chat.route.js";

// Mount routes under /api/v1
app.use("/api", chatRoutes);

// Health Check (keep centralized)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Enterprise AI Analyst Backend",
    uptime: process.uptime(),
  });
});

// Test Route (kept for convenience)
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected successfully!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export { app };
