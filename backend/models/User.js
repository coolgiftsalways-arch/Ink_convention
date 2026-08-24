const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    entryId: { type: String, unique: true },

    // Step 1: Competition & Package
    category: { type: String, required: true },
    entryPackage: { type: String, required: true },

    // Step 2: Artist Profile
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    professionalName: { type: String },
    gmail: { type: String, required: true },
    phone: { type: String, required: true },
    instagram: { type: String },
    studio: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: "India" },
    primaryStyle: { type: String },
    experience: { type: String },

    // Step 3: Tattoo Entry Details
    tattooTitle: { type: String },
    description: { type: String, required: true },
    placement: { type: String },
    size: { type: String },
    isOriginal: { type: String },

    // Step 4: Files & Declarations
    images: [{ type: String }],
    videos: [{ type: String }],
    declarationOriginal: { type: Boolean, required: true },
    declarationConsent: { type: Boolean, required: true },
    termsAccepted: { type: Boolean, required: true },

    // Status Tracking
    status: { type: String, default: "Pending Review" }, // Pending Review, Approved, Rejected
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema, "users");
