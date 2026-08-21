const mongoose = require("mongoose");

const nodeRecordSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    name: { type: String, required: true },
    delayNumber: { type: String, required: true },
    gmail: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    images: [{ type: String }], // Stores file paths or URLs
    videos: [{ type: String }], // Stores file paths or URLs
  },
  { timestamps: true },
);

module.exports = mongoose.model("NodeRecord", nodeRecordSchema);
