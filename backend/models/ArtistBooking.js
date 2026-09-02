const mongoose = require("mongoose");

/* =========================================================
   ARTIST BOOKING SCHEMA
========================================================= */

const artistBookingSchema = new mongoose.Schema(
  {
    /* =====================================================
       CUSTOMER INFORMATION
    ===================================================== */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
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

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /* =====================================================
       TATTOO INFORMATION
    ===================================================== */

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    preferredArtist: {
      type: String,
      default: "",
      trim: true,
    },

    preferredDate: {
      type: Date,
      default: null,
    },

    tattooIdea: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       BOOKING STATUS

       new       = customer submitted search
       pending   = customer selected an artist
       accepted  = artist accepted request
       declined  = artist declined request
       contacted = artist/customer contacted
       confirmed = booking confirmed
       completed = tattoo completed
       cancelled = booking cancelled
    ===================================================== */

    status: {
      type: String,

      enum: [
        "new",
        "pending",
        "accepted",
        "declined",
        "contacted",
        "confirmed",
        "completed",
        "cancelled",
      ],

      default: "new",

      index: true,
    },

    /* =====================================================
       SUGGESTED ARTISTS

       Artists returned by Book Your Artist matching.
    ===================================================== */

    suggestedArtistIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TattooStudio",
      },
    ],

    selectedArtistId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "TattooStudio",
  default: null,
  index: true,
},

notificationSent: {
  type: Boolean,
  default: false,
},

notifiedAt: {
  type: Date,
  default: null,
},

    /* =====================================================
       SELECTED ARTIST

       When customer clicks:
       BOOK THIS ARTIST
       -> SEND REQUEST
    ===================================================== */

    selectedArtistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TattooStudio",
      default: null,
      index: true,
    },

    artistSelectedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       ARTIST EMAIL NOTIFICATION
    ===================================================== */

    artistNotified: {
      type: Boolean,
      default: false,
    },

    artistNotifiedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       CUSTOMER EMAIL NOTIFICATION
    ===================================================== */

    customerNotified: {
      type: Boolean,
      default: false,
    },

    customerNotifiedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       ARTIST RESPONSE
    ===================================================== */

    acceptedAt: {
      type: Date,
      default: null,
    },

    declinedAt: {
      type: Date,
      default: null,
    },

    declineReason: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       CONFIRMATION
    ===================================================== */

    confirmedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

/* =========================================================
   INDEXES
========================================================= */

artistBookingSchema.index({
  city: 1,
  category: 1,
  status: 1,
});

artistBookingSchema.index({
  selectedArtistId: 1,
  status: 1,
});

/* =========================================================
   MODEL
========================================================= */

const ArtistBooking =
  mongoose.models.ArtistBooking ||
  mongoose.model(
    "ArtistBooking",
    artistBookingSchema,
  );

module.exports = ArtistBooking;