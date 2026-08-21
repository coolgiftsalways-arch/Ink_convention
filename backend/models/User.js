const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    delayNumber: { type: String, required: true },
    gmail: { type: String, required: true, unique: true },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    images: [{ type: String }],
    videos: [{ type: String }],
  },
  { timestamps: true },
);

// This tells Mongoose to explicitly use the 'users' collection inside the 'Client' database
module.exports = mongoose.model("User", userSchema, "users");
