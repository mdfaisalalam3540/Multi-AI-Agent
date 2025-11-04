import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5010;

// Connect to MongoDB
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/api/test`);
});

// connectDB()
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log(` Server is running on PORT: ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log(`Mongo DB Connection Failed`, err);
//   });
