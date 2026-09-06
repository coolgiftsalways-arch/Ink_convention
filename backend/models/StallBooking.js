const mongoose = require("mongoose");

const stallBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    fullName: {
      type: String,
      default: "",
      trim: true,
    },

    ownerName: {
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

    expoCity: {
      type: String,
      default: "",
      trim: true,
    },

    brandName: {
      type: String,
      default: "",
      trim: true,
    },

    studioName: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      default: "1",
    },

    packageId: {
      type: String,
      default: "",
    },

    packageName: {
      type: String,
      default: "",
    },

    packagePrice: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    // Required later when your team speaks with the customer.
    advanceAmount: {
      type: Number,
      default: 1499,
    },

    // Nothing is paid when the website form is submitted.
    paidAmount: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Request-first flow:
    // new -> contacted -> confirmed/paid -> cancelled
    bookingStatus: {
      type: String,
      enum: ["new", "contacted", "confirmed", "paid", "cancelled"],
      default: "new",
    },

    status: {
      type: String,
      default: "NEW REQUEST",
    },

    // Optional internal notes for your team/admin.
    notes: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "website_stall_request",
    },

    extraData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

module.exports =
  mongoose.models.StallBooking ||
  mongoose.model("StallBooking", stallBookingSchema);
