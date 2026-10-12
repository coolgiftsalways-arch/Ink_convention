const mongoose = require("mongoose");

/* =====================================================
   MULTI-CITY BOOKING SCHEMA
===================================================== */

const bookingSchema = new mongoose.Schema(
  {
    eventCity: {
      type: String,

      required: true,

      enum: ["jaipur", "udaipur", "kota"],
    },

    passDays: {
      type: Number,

      required: true,

      enum: [1, 2, 3],
    },

    passType: {
      type: String,

      required: true,

      enum: ["1-Day", "2-Day", "3-Day"],
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
       ARTIST PROFILE

       OPTIONAL FOR PUBLIC VISITORS
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
       LEGACY EVENT DATA

       SUPPORT EXISTING ADMIN RECORDS
    =============================================== */

    eventCity: {
      type: String,

      required: true,

      enum: ["jaipur", "udaipur", "kota"],
    },

    eventDate: {
      type: String,

      required: true,
    },

    /* ===============================================
       TICKETS / PEOPLE
    =============================================== */

    tickets: {
      type: Number,

      required: true,

      min: 1,

      max: 10,

      default: 1,
    },

    /* ===============================================
       PRICES
    =============================================== */

    ticketPrice: {
      type: Number,

      required: true,

      default: 2999,
    },

    additionalTicketPrice: {
      type: Number,

      required: true,

      default: 1499,
    },

    totalAmount: {
      type: Number,

      required: true,

      min: 0,
    },

    /* ===============================================
       ALL SELECTED CITIES
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

      enum: ["legacy-entry", "rajasthan-entry"],

      default: "legacy-entry",
    },

    /* ===============================================
       STATUS
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
