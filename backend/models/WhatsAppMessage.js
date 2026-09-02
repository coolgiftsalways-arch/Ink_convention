const mongoose = require("mongoose");

/* =========================================================
   WHATSAPP MESSAGE SCHEMA
========================================================= */

const whatsappMessageSchema =
  new mongoose.Schema(
    {
      /* =========================
         RECIPIENT
      ========================= */

      phone: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      recipientName: {
        type: String,
        default: "",
        trim: true,
      },

      /* =========================
         MESSAGE TYPE
      ========================= */

      type: {
        type: String,

        enum: [
          "booking",
          "marketing",
          "other",
        ],

        default: "other",

        index: true,
      },

      templateName: {
        type: String,
        required: true,
        trim: true,
      },

      /* =========================
         BOOKING
      ========================= */

      bookingId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "ArtistBooking",

        default: null,

        index: true,
      },

      artistId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "TattooStudio",

        default: null,
      },

      /* =========================
         CAMPAIGN
      ========================= */

      campaignName: {
        type: String,
        default: "",
        trim: true,
      },

      /* =========================
         STATUS
      ========================= */

      status: {
        type: String,

        enum: [
          "queued",
          "submitted",
          "sent",
          "delivered",
          "read",
          "failed",
        ],

        default: "queued",

        index: true,
      },

      /* =========================
         MSG91 TRACKING
      ========================= */

      crqid: {
        type: String,
        default: "",
        index: true,
      },

      requestId: {
        type: String,
        default: "",
        index: true,
      },

      uuid: {
        type: String,
        default: "",
        index: true,
      },

      /* =========================
         DATES
      ========================= */

      submittedAt: {
        type: Date,
        default: null,
      },

      sentAt: {
        type: Date,
        default: null,
      },

      deliveredAt: {
        type: Date,
        default: null,
      },

      readAt: {
        type: Date,
        default: null,
      },

      failedAt: {
        type: Date,
        default: null,
      },

      /* =========================
         FAILURE
      ========================= */

      failureReason: {
        type: String,
        default: "",
      },

      /* =========================
         MSG91 RESPONSES
      ========================= */

      apiResponse: {
        type:
          mongoose.Schema.Types.Mixed,

        default: null,
      },

      webhookResponse: {
        type:
          mongoose.Schema.Types.Mixed,

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

whatsappMessageSchema.index({
  phone: 1,
  createdAt: -1,
});

whatsappMessageSchema.index({
  type: 1,
  status: 1,
});

/* =========================================================
   MODEL
========================================================= */

const WhatsAppMessage =
  mongoose.models.WhatsAppMessage ||
  mongoose.model(
    "WhatsAppMessage",
    whatsappMessageSchema,
  );

module.exports =
  WhatsAppMessage;