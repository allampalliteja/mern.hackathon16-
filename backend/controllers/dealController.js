import asyncHandler from "express-async-handler";
import Deal from "../models/Deal.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";

// Resolve __dirname in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ Serve Uploaded Images
export const serveUploads = (app) => {
  app.use('/uploads', express.static(path.join(__dirname, "..", "uploads")));
};

// ✅ Multer Storage for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const isValidType =
      allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
      allowedTypes.test(file.mimetype);
    isValidType ? cb(null, true) : cb(new Error("❌ Only JPEG, JPG, and PNG formats are allowed!"));
  },
});

// ✅ Add Deal (Handles Image Upload)
export const addDeal = asyncHandler(async (req, res) => {
  if (req.user.role !== "owner") {
    res.status(403).json({ message: "❌ Access Denied: Only owners can add deals" });
    return;
  }

  const { title, description, discount, location, startDate, endDate } = req.body;

  if (!title || !description || !discount || !location || !startDate || !endDate) {
    res.status(400).json({ message: "❌ All fields are required" });
    return;
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end) || end <= start) {
    res.status(400).json({ message: "❌ Invalid date format or end date must be after start date" });
    return;
  }

  // Ensure Image Path is Correct
  const imagePath = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.png";

  const newDeal = new Deal({
    title,
    description,
    discount,
    location,
    startDate,
    endDate,
    image: imagePath,
    user: req.user.id,
  });

  await newDeal.save();
  res.status(201).json({ message: "✅ Deal added successfully", deal: newDeal });
});

// ✅ Get Deals (Admin can see all, owners see their own)
export const getDeals = asyncHandler(async (req, res) => {
  const filter = req.user?.role === "owner" ? { user: req.user.id } : {};
  const deals = await Deal.find(filter);
  res.json(deals);
});

// ✅ Get User's Deals
export const getMyDeals = asyncHandler(async (req, res) => {
  const deals = await Deal.find({ user: req.user._id });
  res.json(deals);
});

// ✅ Update Deal (Handles Image Updates)
export const updateDeal = asyncHandler(async (req, res) => {
  if (req.user.role !== "owner") {
    res.status(403).json({ message: "❌ Access Denied: Only owners can update deals" });
    return;
  }

  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    res.status(404).json({ message: "❌ Deal not found" });
    return;
  }

  if (deal.user.toString() !== req.user.id) {
    res.status(403).json({ message: "❌ Not authorized to update this deal" });
    return;
  }

  // Validate dates if provided
  if (req.body.startDate && req.body.endDate) {
    const start = new Date(req.body.startDate);
    const end = new Date(req.body.endDate);
    if (isNaN(start) || isNaN(end) || end <= start) {
      res.status(400).json({ message: "❌ Invalid date format or end date must be after start date" });
      return;
    }
  }

  // Delete old image if new one is uploaded
  if (req.file && deal.image !== "/uploads/default.png") {
    const oldImagePath = path.join(__dirname, "..", deal.image);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // Update Image Only if a New One is Provided
  if (req.file) {
    deal.image = `/uploads/${req.file.filename}`;
  }

  // Update Deal Fields
  Object.assign(deal, req.body);
  await deal.save();

  res.json({ message: "✅ Deal updated successfully", deal });
});

// ✅ Delete Deal (Deletes Image Too)
export const deleteDeal = asyncHandler(async (req, res) => {
  if (req.user.role !== "owner") {
    res.status(403).json({ message: "❌ Access Denied: Only owners can delete deals" });
    return;
  }

  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    res.status(404).json({ message: "❌ Deal not found" });
    return;
  }

  if (deal.user.toString() !== req.user.id) {
    res.status(403).json({ message: "❌ Not authorized to delete this deal" });
    return;
  }

  // Delete Image (If it's not the default one)
  if (deal.image && deal.image !== "/uploads/default.png") {
    const imagePath = path.join(__dirname, "..", deal.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await deal.deleteOne();
  res.json({ message: "✅ Deal deleted successfully" });
});
