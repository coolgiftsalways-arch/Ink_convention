const mongoose = require("mongoose");

const membershipRequestSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TattooStudio",
      required: true,
      index: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    studio: {
      type: String,
      default: "",
      trim: true,
    },

    currentPlan: {
      type: String,
      enum: ["basic", "pro", "verified"],
      default: "basic",
    },

    requestedPlan: {
      type: String,
      enum: ["pro", "verified"],
      required: true,
      index: true,
    },

    requestedPlanName: {
      type: String,
      default: "",
      trim: true,
    },

    requestedAmount: {
      type: Number,
      default: 0,
    },

    pricingType: {
      type: String,
      enum: ["standard-membership", "silver-to-gold-upgrade"],
      default: "standard-membership",
    },

    requestStatus: {
      type: String,
      enum: ["new", "contacted", "completed", "cancelled"],
      default: "new",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },

    contactedAt: {
      type: Date,
      default: null,
    },

    activatedAt: {
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

    source: {
      type: String,
      default: "artist_membership_page",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

membershipRequestSchema.index({
  profileId: 1,
  requestedPlan: 1,
  requestStatus: 1,
});

module.exports =
  mongoose.models.MembershipRequest ||
  mongoose.model("MembershipRequest", membershipRequestSchema);
