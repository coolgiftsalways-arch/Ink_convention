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

    /* =====================================================
       SELECTED ARTIST
       Artist is already selected from Artists.jsx
    ===================================================== */

    selectedArtistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TattooStudio",
      required: true,
      index: true,
    },

    selectedArtistName: {
      type: String,
      default: "",
      trim: true,
    },

    artistCity: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    artistState: {
      type: String,
      default: "",
      trim: true,
    },

    /*
      Store the artist plan at booking time.

      basic    = Free
      pro      = Silver
      verified = Gold
    */

    artistPlanAtBooking: {
      type: String,
      enum: ["basic", "pro", "verified"],
      default: "basic",
      index: true,
    },

    artistSelectedAt: {
      type: Date,
      default: Date.now,
    },

    /* =====================================================
       TATTOO / BOOKING INFORMATION
    ===================================================== */

    tattooStyle: {
      type: String,
      default: "",
      trim: true,
    },

    preferredDate: {
      type: Date,
      default: null,
    },

    preferredTime: {
      type: String,
      default: "",
      trim: true,
    },

    tattooIdea: {
      type: String,
      required: true,
      trim: true,
    },

    bodyPlacement: {
      type: String,
      default: "",
      trim: true,
    },

    tattooSize: {
      type: String,
      default: "",
      trim: true,
    },

    budget: {
      type: String,
      default: "",
      trim: true,
    },

    referenceLink: {
      type: String,
      default: "",
      trim: true,
    },

    additionalMessage: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       BOOKING STATUS

       pending   = request sent to selected artist
       accepted  = artist accepted
       declined  = artist declined
       contacted = artist/customer contacted
       confirmed = final booking confirmed
       completed = tattoo completed
       cancelled = booking cancelled
    ===================================================== */

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "declined",
        "contacted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    /* =====================================================
       ARTIST NOTIFICATION

       Free:
       anonymous booking interest only
       customer identity must NOT be exposed

       Silver:
       limited booking information

       Gold:
       customer name + booking summary can be revealed
    ===================================================== */

    artistNotified: {
      type: Boolean,
      default: false,
    },

    artistNotifiedAt: {
      type: Date,
      default: null,
    },

    artistNotificationType: {
      type: String,
      enum: [
        "",
        "free-upgrade",
        "silver-booking",
        "gold-booking",
      ],
      default: "",
    },

    artistNotificationChannel: {
      type: String,
      enum: ["", "sms", "whatsapp", "email"],
      default: "",
    },

    artistNotificationMessage: {
      type: String,
      default: "",
      trim: true,
    },

    /*
      Useful when MSG91 / WhatsApp / SMS provider
      returns a message or request ID.
    */

    artistNotificationMessageId: {
      type: String,
      default: "",
      trim: true,
    },

    artistNotificationError: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       CUSTOMER NOTIFICATION
    ===================================================== */

    customerNotified: {
      type: Boolean,
      default: false,
    },

    customerNotifiedAt: {
      type: Date,
      default: null,
    },

    customerNotificationChannel: {
      type: String,
      enum: ["", "sms", "whatsapp", "email"],
      default: "",
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

    contactedAt: {
      type: Date,
      default: null,
    },

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
  selectedArtistId: 1,
  status: 1,
  createdAt: -1,
});

artistBookingSchema.index({
  artistPlanAtBooking: 1,
  status: 1,
});

artistBookingSchema.index({
  phone: 1,
  createdAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

const ArtistBooking =
  mongoose.models.ArtistBooking ||
  mongoose.model("ArtistBooking", artistBookingSchema);

module.exports = ArtistBooking;