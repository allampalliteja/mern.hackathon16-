import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import dealRoutes from "./routes/dealRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Import error handler
import { errorHandler } from "./middleware/errorMiddleware.js";

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin resource sharing
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Requested-With", "Content-Type", "Authorization"],
  credentials: true
}));

// Static directory for file uploads with CORS headers
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "uploads")));

// ✅ Ensure Uploads Directory Exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ MongoDB Connection with Improved Handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1); // Exit if MongoDB connection fails
  }
};
connectDB();

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Deals API" });
});

// ✅ API Routes
app.use("/api/deals", dealRoutes);
app.use("/api/users", userRoutes);

// Route not found handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ✅ Graceful Shutdown for Crashes
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  server.close(() => process.exit(1)); // Shutdown server gracefully
});