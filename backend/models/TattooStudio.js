const mongoose = require("mongoose");

const tattooStudioSchema = new mongoose.Schema(
  {
    // Original row number / identifier from the Excel file
    sourceRowId: {
      type: String,
      default: "",
    },

    // Studio / business name
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Google rating
    rating: {
      type: Number,
      default: null,
    },

    // Number of reviews
    reviews: {
      type: Number,
      default: 0,
    },

    // Full address
    address: {
      type: String,
      default: "",
      trim: true,
    },

    // Location
    city: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    country: {
      type: String,
      default: "IN",
      trim: true,
    },

    // Contact / online information
    website: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // Whatever value is present in the Excel "items" column
    items: {
      type: String,
      default: "",
      trim: true,
    },

    // Google Maps URL
    mapsUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // Business category
    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // Excel sheet from which this record came
    sourceSheet: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // Used to prevent duplicate studios when more Excel files
    // are imported later.
    duplicateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Directory listing plan
    plan: {
      type: String,
      enum: ["free", "pro", "verified"],
      default: "free",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    spotlight: {
      type: Boolean,
      default: false,
    },

    // Last time this record was imported from Excel
    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const TattooStudio =
  mongoose.models.TattooStudio ||
  mongoose.model("TattooStudio", tattooStudioSchema);

module.exports = TattooStudio;