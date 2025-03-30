import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// ✅ Middleware to Verify Token
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  console.log("🔒 Checking for authentication token...");

  // Check for token in authorization header
  if (req.headers.authorization) {
    console.log("✅ Authorization header detected");

    if (req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]; // Extract token after "Bearer "
    } else {
      token = req.headers.authorization; // Handle cases where token is sent directly
    }

    try {
      console.log("🔑 Verifying token...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token successfully verified:", decoded);

      // Attach user to request
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        res.status(401);
        throw new Error("❌ User not found, authentication failed");
      }

      return next();
    } catch (error) {
      console.error("❌ Token verification error:", error.message);
      res.status(401).json({ message: "❌ Not authorized, token failed or expired" });
    }
  } else {
    console.log("❌ No token provided");
    res.status(401).json({ message: "❌ Not authorized, no token" });
  }
});

// ✅ Owner Only Access
export const ownerOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "owner") {
    res.status(403);
    throw new Error("❌ Access Denied: Only owners can access this resource");
  }
  console.log("✅ Owner access granted");
  next();
});

// ✅ Admin Only Access (New!)
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("❌ Access Denied: Only admins can access this resource");
  }
  console.log("✅ Admin access granted");
  next();
});
