const mongoose = require("mongoose");

/* =========================================================
   CAMPAIGN CONTACT SCHEMA
========================================================= */

const campaignContactSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        default: "",
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      /* =========================
         WHATSAPP CONSENT
      ========================= */

      whatsappOptIn: {
        type: Boolean,
        default: false,
        index: true,
      },

      whatsappOptInAt: {
        type: Date,
        default: null,
      },

      whatsappOptInSource: {
        type: String,

        default: "",

        /*
          website
          booking
          event
          form
          etc.
        */
      },

      /* =========================
         MARKETING STATUS
      ========================= */

      marketingStatus: {
        type: String,

        enum: [
          "never_sent",
          "queued",
          "sent",
          "delivered",
          "read",
          "failed",
          "unsubscribed",
        ],

        default: "never_sent",

        index: true,
      },

      lastMarketingSentAt: {
        type: Date,
        default: null,
      },

      unsubscribedAt: {
        type: Date,
        default: null,
      },
    },

    {
      timestamps: true,
    },
  );

/* =========================================================
   MODEL
========================================================= */

const CampaignContact =
  mongoose.models.CampaignContact ||
  mongoose.model(
    "CampaignContact",
    campaignContactSchema,
  );

module.exports =
  CampaignContact;