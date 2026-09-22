const mongoose = require("mongoose");

/* =========================================================
   WHATSAPP CAMPAIGN LOG

   One artist can be attempted only once per campaignKey.
   This is the permanent no-repeat protection.
========================================================= */

const whatsappCampaignLogSchema = new mongoose.Schema(
  {
    campaignKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    batchId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    batchNumber: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },

    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TattooStudio",
      required: true,
      index: true,
    },

    artistName: {
      type: String,
      default: "",
      trim: true,
    },

    artistState: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    artistCity: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    filterState: {
      type: String,
      default: "ALL",
      trim: true,
      index: true,
    },

    filterCity: {
      type: String,
      default: "ALL",
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    normalizedPhone: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    profileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    templateName: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
      index: true,
    },

    metaMessageId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    metaWaId: {
      type: String,
      default: "",
      trim: true,
    },

    error: {
      type: String,
      default: "",
      trim: true,
    },

    attemptedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*
  CRITICAL NO-REPEAT RULE:
  The same artist cannot be inserted twice for the same campaign.
*/
whatsappCampaignLogSchema.index(
  {
    campaignKey: 1,
    artistId: 1,
  },
  {
    unique: true,
  },
);

whatsappCampaignLogSchema.index({
  campaignKey: 1,
  batchNumber: -1,
  attemptedAt: -1,
});

whatsappCampaignLogSchema.index({
  campaignKey: 1,
  artistState: 1,
  artistCity: 1,
  attemptedAt: -1,
});

const WhatsAppCampaignLog =
  mongoose.models.WhatsAppCampaignLog ||
  mongoose.model("WhatsAppCampaignLog", whatsappCampaignLogSchema);

module.exports = WhatsAppCampaignLog;
