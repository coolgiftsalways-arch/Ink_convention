const mongoose = require("mongoose");

/* =====================================================
   INKCONVENTION — ENTRY BOOKINGS

   Supports:
   - Five-city 2026 tour
   - NORMAL and VIP passes
   - Existing Rajasthan booking records
   - Existing admin dashboard fields
===================================================== */

const ALL_EVENT_CITIES = [
  // Historical cities
  "jaipur",
  "udaipur",
  "kota",

  // New 2026 tour cities
  "gorakhpur",
  "noida",
  "varanasi",
  "agra",
  "lucknow",
];

const ALL_PASS_TYPES = [
  // Historical passes
  "1-Day",
  "2-Day",
  "3-Day",

  // New passes
  "normal",
  "vip",
];

/* =====================================================
   BOOKING SCHEMA
===================================================== */

const bookingSchema = new mongoose.Schema(
  {
    eventCity: {
      type: String,
      required: true,
      enum: ALL_EVENT_CITIES,
      lowercase: true,
      trim: true,
    },

    passDays: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },

    passType: {
      type: String,
      required: true,
      enum: ALL_PASS_TYPES,
    },

    selectedDates: {
      type: [String],
      required: true,
      default: [],
    },

    tickets: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    firstPersonPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    additionalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

/* =====================================================
   MAIN GET ENTRY MODEL
===================================================== */

const getSchema = new mongoose.Schema(
  {
    /* ===============================================
       ARTIST PROFILE — OPTIONAL
    =============================================== */

    artistProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TattooStudio",
      default: null,
    },

    /* ===============================================
       PERSONAL DETAILS
    =============================================== */

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    /* ===============================================
       EVENT DETAILS

       Retained for existing admin compatibility
    =============================================== */

    eventCity: {
      type: String,
      required: true,
      enum: ALL_EVENT_CITIES,
      lowercase: true,
      trim: true,
    },

    eventDate: {
      type: String,
      required: true,
    },

    /* ===============================================
       NUMBER OF PEOPLE
    =============================================== */

    tickets: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },

    /* ===============================================
       TICKET PRICES
    =============================================== */

    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 2999,
    },

    additionalTicketPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 1499,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /* ===============================================
       NORMAL / VIP PASS
    =============================================== */

    passType: {
      type: String,
      enum: ALL_PASS_TYPES,
      default: undefined,
    },

    /* ===============================================
       SELECTED BOOKINGS
    =============================================== */

    bookings: {
      type: [bookingSchema],
      default: [],
    },

    /* ===============================================
       BOOKING SOURCE
    =============================================== */

    source: {
      type: String,
      enum: ["legacy-entry", "rajasthan-entry", "lucknow-entry", "tour-entry"],
      default: "legacy-entry",
    },

    /* ===============================================
       BOOKING STATUS
    =============================================== */

    status: {
      type: String,
      enum: ["New", "Contacted", "Confirmed", "Cancelled"],
      default: "New",
    },

    contactedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/* =====================================================
   INDEXES
===================================================== */

getSchema.index({
  createdAt: -1,
});

getSchema.index({
  status: 1,
});

getSchema.index({
  artistProfile: 1,
  createdAt: -1,
});

/* =====================================================
   EXPORT MODEL
===================================================== */

const Get = mongoose.models.Get || mongoose.model("Get", getSchema);

module.exports = Get;
