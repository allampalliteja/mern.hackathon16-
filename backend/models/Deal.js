const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links deal to the user who created it
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: Number, required: true },
  location: { type: String, required: true },
  image: { type: String }, // Optional image for the deal
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, { timestamps: true }); // Auto-creates createdAt & updatedAt

module.exports = mongoose.model("Deal", dealSchema);
