const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    // ==========================================
    // ENTRY ID
    // ==========================================

    entryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ==========================================
    // STEP 1: COMPETITION
    // ==========================================

    category: {
      type: String,
      required: true,
      trim: true,
    },

    entryPackage: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // STEP 2: ARTIST PROFILE
    // ==========================================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    professionalName: {
      type: String,
      default: "",
      trim: true,
    },

    gmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    studio: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    primaryStyle: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // STEP 3: TATTOO DETAILS
    // ==========================================

    tattooTitle: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    placement: {
      type: String,
      default: "",
      trim: true,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    isOriginal: {
      type: String,
      default: "",
    },

    // ==========================================
    // STEP 4: FILES
    // ==========================================

    images: [
      {
        type: String,
      },
    ],

    videos: [
      {
        type: String,
      },
    ],

    // ==========================================
    // DECLARATIONS
    // ==========================================

    declarationOriginal: {
      type: Boolean,
      required: true,
    },

    declarationConsent: {
      type: Boolean,
      required: true,
    },

    termsAccepted: {
      type: Boolean,
      required: true,
    },

    // ==========================================
    // REVIEW / RESULT
    // ==========================================

    status: {
      type: String,
      enum: ["Pending Review", "Approved", "Rejected"],
      default: "Pending Review",
      index: true,
    },

    reviewResult: {
      type: String,
      default: "",
      trim: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewDueAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "Competition",
  competitionSchema,
  "competitions",
);
